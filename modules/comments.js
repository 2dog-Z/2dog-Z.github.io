import { GITHUB_WORKER_ORIGIN, GITHUB_WORKER_PASS, GITHUB_WORKER_PASS_HEADER } from "./constants.js";
import { formatDate, githubApiUrlViaWorker, randomNickname, sleep } from "./utils.js";

/**
 * 评论模块：负责右侧评论区的渲染与新增。
 * 功能：
 * - 从 GitHub issues 的同一个 comments issue 中读取/写入评论
 * - 按当前 Markdown 页面路径过滤并展示对应评论
 * - 提供 add(text) 方法供终端 say 命令调用
 * 目的：把评论 DOM 拼装逻辑从主入口/终端逻辑中剥离，提升复用与可读性。
 */

/**
 * GitHub 配置（评论存储后端）。
 *
 * 方案概述：
 * - 使用一个 Issue 作为“评论容器”，所有评论都写入该 Issue 的 comments。
 * - 每条 comment body 里包含一个带 marker 的 JSON（page/name/text/date），从而实现“按页面过滤”。
 *
 * 安全提示：
 * - 浏览器端无法真正安全地保存 token；放在前端的 token 都可能被获取。
 * - 该方案更适合个人站点的轻量留言板，不适合承载高权限或敏感数据。
 *
 * 本版本的改造点：
 * - 浏览器不再持有 GitHub token，而是改为请求 Cloudflare Worker；
 * - Worker 校验暗号 Header 后，才向 GitHub API 注入 token 并转发请求。
 */
const GITHUB = {
  owner: "2dog-Z",
  repo: "2dog-Z.github.io",
  issueTitle: "blog_comments",
};

/**
 * 获取评论模块正在使用的仓库信息。
 * 用途：让其它模块（例如 post 自动发现）复用同一份仓库配置，避免多处维护/不一致。
 */
export function getCommentsGitHubRepo() {
  const owner = String(GITHUB.owner ?? "").trim();
  const repo = String(GITHUB.repo ?? "").trim();
  if (!owner || !repo || owner === "REPLACE_ME" || repo === "REPLACE_ME") return null;
  return { owner, repo };
}

const COMMENT_MARKER = "TDPB_COMMENT/v1";
const CACHE_KEY = "tdpb_comments_cache_v1";
const CACHE_VERSION = 1;

function readCurrentContentTitle() {
  /**
   * 读取当前内容区标题。
   *
   * 用途：
   * - 邮件提醒需要“文章标题”字段；
   * - 标题来源以页面左上角的 #contentTitle 为准（由 contentRenderer 维护，最贴近用户看到的标题）。
   */
  const el = document.getElementById("contentTitle");
  const title = el ? String(el.textContent ?? "").trim() : "";
  return title;
}

/**
 * 构建单条评论的 DOM 结构。
 * 功能：将 {name,text,date} 转换为页面需要的节点树，并设置必要 class/role。
 * 目的：集中管理评论的 DOM 结构，后续改样式或结构只需改一个地方。
 */
function createCommentElement({ name, text, date }) {
  const item = document.createElement("div");
  item.className = "commentItem";
  item.setAttribute("role", "listitem");

  const meta = document.createElement("div");
  meta.className = "commentMeta";

  const nick = document.createElement("div");
  nick.className = "commentName";
  nick.textContent = name;

  const time = document.createElement("div");
  time.className = "commentDate";
  time.textContent = date;

  const p = document.createElement("p");
  p.className = "commentText";
  p.textContent = text;

  meta.appendChild(nick);
  meta.appendChild(time);
  item.appendChild(meta);
  item.appendChild(p);
  return item;
}

function toPageKey(rawPath) {
  const s = String(rawPath ?? "").trim();
  if (!s) return "";
  if (s.startsWith("./") || s.startsWith("../")) return s;
  if (s.startsWith("/")) return `.${s}`;
  return s;
}

function parseStoredCommentBody(body) {
  const s0 = String(body ?? "");
  const s = s0.trimStart();
  if (!s.startsWith(COMMENT_MARKER)) return null;
  const jsonText = s.slice(COMMENT_MARKER.length).trim().replace(/^\n+/, "");
  if (!jsonText) return null;
  try {
    const data = JSON.parse(jsonText);
    const page = toPageKey(data?.page);
    const name = String(data?.name ?? "").trim();
    const text = String(data?.text ?? "").trim();
    const date = String(data?.date ?? "").trim();
    if (!page || !name || !text) return null;
    return { page, name, text, date };
  } catch {
    return null;
  }
}

function buildStoredCommentBody(payload) {
  return `${COMMENT_MARKER}\n${JSON.stringify(payload)}`;
}

function loadCache() {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return { v: CACHE_VERSION, lastCreatedAt: "", items: [] };
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object") return { v: CACHE_VERSION, lastCreatedAt: "", items: [] };
    if (data.v !== CACHE_VERSION) return { v: CACHE_VERSION, lastCreatedAt: "", items: [] };
    const items = Array.isArray(data.items) ? data.items : [];
    const lastCreatedAt = typeof data.lastCreatedAt === "string" ? data.lastCreatedAt : "";
    return { v: CACHE_VERSION, lastCreatedAt, items };
  } catch {
    return { v: CACHE_VERSION, lastCreatedAt: "", items: [] };
  }
}

function saveCache(cache) {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    return;
  }
}

/**
 * 规范化缓存条目结构。
 *
 * 兼容目标：
 * - 旧缓存（V6 及之前）：没有 commentId 字段
 * - 新缓存（V7+）：会写入 GitHub issue comment id（commentId），用于后台精确删除
 *
 * 目的：
 * - 让缓存结构随版本演进仍可读取
 * - 让后续列表展示/排序/删除都基于统一字段集工作
 */
function normalizeCachedItem(x) {
  const stored = x && typeof x === "object" ? x : null;
  if (!stored) return null;
  const page = toPageKey(stored.page);
  const name = String(stored.name ?? "").trim();
  const text = String(stored.text ?? "").trim();
  const date = String(stored.date ?? "").trim();
  const createdAt = String(stored.createdAt ?? "").trim();
  const commentIdRaw = stored.commentId;
  const commentId = Number.isFinite(Number(commentIdRaw)) ? Number(commentIdRaw) : 0;
  if (!page || !name || !text) return null;
  return { page, name, text, date, createdAt, commentId: commentId > 0 ? commentId : 0 };
}

function toTimeValue(item) {
  const raw = item?.createdAt || item?.date || "";
  const d = raw ? new Date(raw) : null;
  const t = d && !Number.isNaN(d.getTime()) ? d.getTime() : 0;
  return t;
}

/**
 * 构建“评论列表展示用”的稳定 id。
 *
 * 规则：
 * - 优先使用 GitHub issue comment id（gh:123...），保证跨刷新仍稳定
 * - 否则回退到 createdAt/page/name/text 的组合（兼容历史缓存/乐观插入）
 *
 * 目的：
 * - 后台勾选/删除需要一个稳定的 key 来保持 UI 状态
 * - 避免仅靠数组 index 导致刷新后错删/错选
 */
function buildCommentId(item) {
  const commentId = Number(item?.commentId);
  if (Number.isFinite(commentId) && commentId > 0) return `gh:${commentId}`;
  const createdAt = String(item?.createdAt ?? "").trim();
  const page = toPageKey(item?.page);
  const name = String(item?.name ?? "").trim();
  const text = String(item?.text ?? "").trim();
  return `${createdAt}|${page}|${name}|${text}`;
}

/**
 * 构建“缓存去重用”的 key。
 *
 * 说明：
 * - commentId 存在时以它为准（最可靠）
 * - commentId 不存在时，使用 createdAt/page/name/text 组合
 *
 * 目的：避免重复同步/重复插入导致缓存无限膨胀。
 */
function buildCacheKey(item) {
  const commentId = Number(item?.commentId);
  if (Number.isFinite(commentId) && commentId > 0) return `gh:${commentId}`;
  return `${String(item?.createdAt ?? "").trim()}|${toPageKey(item?.page)}|${String(item?.name ?? "").trim()}|${String(item?.text ?? "").trim()}`;
}

function getCachedCommentsForPage(pageKey) {
  const key = toPageKey(pageKey);
  if (!key) return [];
  const matched = cache.items
    .filter((x) => x.page === key)
    .map((x) => {
      const t = toTimeValue(x);
      const safeDate = t ? new Date(t) : new Date();
      return {
        id: buildCommentId(x),
        commentId: Number(x.commentId) > 0 ? Number(x.commentId) : 0,
        page: x.page,
        name: x.name,
        text: x.text,
        createdAt: String(x.createdAt || x.date || "").trim(),
        date: formatDate(safeDate),
        t,
      };
    })
    .sort((a, b) => b.t - a.t)
    .map(({ t, ...rest }) => rest);
  return matched;
}

function sameCommentList(a, b) {
  if (a === b) return true;
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    const x = a[i];
    const y = b[i];
    if (!x || !y) return false;
    if (x.id !== y.id) return false;
  }
  return true;
}

async function githubRequestJson(url, options = {}) {
  /**
   * 统一的 GitHub API 请求入口（经由 Worker 中转）。
   *
   * 功能：
   * - 自动补齐 GitHub API 推荐的 Accept / 版本头；
   * - 自动添加暗号 Header（Worker 侧会校验，避免被当成开放代理）；
   * - 把 `https://api.github.com/...` 重写为 `${GITHUB_WORKER_ORIGIN}/gh/...`；
   * - 失败时把状态码与响应文本带出来，便于在终端/控制台排查。
   *
   * 思路：
   * - 业务代码仍然“生成 GitHub API URL”，但实际网络请求永远走 Worker；
   * - token 的注入完全发生在 Worker 中，前端不参与。
   *
   * 兼容说明：
   * - `options.withAuth` 在旧实现里用于决定是否注入 Authorization；
   * - 现在 Authorization 永远由 Worker 注入，因此该字段仅为兼容旧调用，已不再参与逻辑。
   */
  const method = options.method ?? "GET";
  const headers = new Headers({
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  });
  headers.set(GITHUB_WORKER_PASS_HEADER, GITHUB_WORKER_PASS);

  let body;
  if (options.body != null) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(options.body);
  }

  const proxyUrl = githubApiUrlViaWorker(url, GITHUB_WORKER_ORIGIN);
  const res = await window.fetch(proxyUrl, { method, headers, body });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`GitHub API ${res.status}: ${text || res.statusText}`);
  }
  if (res.status === 204) return null;
  return await res.json();
}

let issueNumberPromise = null;
let syncPromise = null;
let lastSyncAtMs = 0;
let lastReconcileAtMs = 0;
let cache = loadCache();
cache.items = cache.items.map(normalizeCachedItem).filter(Boolean);
cache.items.sort((a, b) => toTimeValue(b) - toTimeValue(a));
saveCache(cache);

const RECONCILE_INTERVAL_MS = 60_000;

async function getCommentsIssueNumber(options = {}) {
  const { createIfMissing = false } = options;
  if (issueNumberPromise) {
    const n = await issueNumberPromise;
    if (!n) issueNumberPromise = null;
    return n;
  }

  issueNumberPromise = (async () => {
    if (!GITHUB.owner || !GITHUB.repo || GITHUB.owner === "REPLACE_ME" || GITHUB.repo === "REPLACE_ME") return null;
    for (let page = 1; page <= 10; page += 1) {
      const url = `https://api.github.com/repos/${encodeURIComponent(GITHUB.owner)}/${encodeURIComponent(
        GITHUB.repo
      )}/issues?state=all&per_page=100&page=${page}`;
      const items = await githubRequestJson(url);
      if (!Array.isArray(items) || items.length === 0) break;
      for (const it of items) {
        if (!it || typeof it !== "object") continue;
        if (it.pull_request) continue;
        const title = String(it.title ?? "").trim();
        if (title.toLowerCase() === GITHUB.issueTitle.toLowerCase()) return Number(it.number) || null;
      }
    }

    if (!createIfMissing) return null;

    const createUrl = `https://api.github.com/repos/${encodeURIComponent(GITHUB.owner)}/${encodeURIComponent(GITHUB.repo)}/issues`;
    const created = await githubRequestJson(createUrl, {
      method: "POST",
      withAuth: true,
      body: { title: GITHUB.issueTitle, body: "This issue stores site comments." },
    });
    const n = Number(created?.number);
    return Number.isFinite(n) ? n : null;
  })().catch((e) => {
    issueNumberPromise = null;
    throw e;
  });

  const n = await issueNumberPromise;
  if (!n) issueNumberPromise = null;
  return n;
}

let allStoredCommentsPromise = null;

async function fetchAllStoredComments(options = {}) {
  const { refresh = false } = options;
  if (!refresh && allStoredCommentsPromise) return await allStoredCommentsPromise;

  allStoredCommentsPromise = (async () => {
    const items = await syncStoredComments({ force: true, allowFullScan: true });
    return items;
  })().catch((e) => {
    allStoredCommentsPromise = null;
    throw e;
  });

  return await allStoredCommentsPromise;
}

async function fetchIssueCommentsPage(issueNumber, options = {}) {
  const perPage = options.perPage ?? 100;
  const page = options.page ?? 1;
  const since = options.since ? `&since=${encodeURIComponent(options.since)}` : "";
  const url = `https://api.github.com/repos/${encodeURIComponent(GITHUB.owner)}/${encodeURIComponent(
    GITHUB.repo
  )}/issues/${issueNumber}/comments?per_page=${perPage}&page=${page}${since}`;
  const items = await githubRequestJson(url);
  return Array.isArray(items) ? items : [];
}

/**
 * 全量对账并重建评论缓存（用于处理“远端删除，但本地仍缓存”的一致性问题）。
 *
 * 背景：
 * - GitHub comments API 的增量拉取（since）只能发现“新增/更新”，无法发现“删除”
 * - 如果某条评论在后台被删除，其他用户浏览器的 localStorage 缓存仍会保留它
 *
 * 思路：
 * - 定期做一次全量扫描（按页最多扫描 20 页），以 GitHub 当前返回的评论列表为准
 * - 解析并重建 cache.items，从而把已被删除的 comment 从本地缓存中清理掉
 *
 * 取舍：
 * - 全量扫描需要更多请求，因此做了节流（RECONCILE_INTERVAL_MS）
 * - 扫描页数有限（最多 20 页），更早的历史评论可能不会进入缓存展示
 */
async function reconcileCacheByFullScan(issueNumber) {
  const next = [];
  for (let p = 1; p <= 20; p += 1) {
    const batch = await fetchIssueCommentsPage(issueNumber, { page: p });
    if (batch.length === 0) break;
    for (const it of batch) {
      const stored = parseStoredCommentBody(it?.body);
      if (!stored) continue;
      const createdAt = String(it?.created_at ?? "").trim();
      const commentId = Number(it?.id) || 0;
      next.push({ ...stored, createdAt, commentId });
    }
    if (batch.length < 100) break;
  }

  const normalized = next.map(normalizeCachedItem).filter(Boolean);
  normalized.sort((a, b) => toTimeValue(b) - toTimeValue(a));
  cache.items = normalized;
  cache.lastCreatedAt = cache.items[0]?.createdAt || "";
  saveCache(cache);
  allStoredCommentsPromise = null;
  lastSyncAtMs = Date.now();
  lastReconcileAtMs = Date.now();
  return cache.items;
}

function upsertIntoCache(next) {
  const normalized = next.map(normalizeCachedItem).filter(Boolean);
  if (normalized.length === 0) return;

  const existing = new Map();
  for (const it of cache.items) {
    existing.set(buildCacheKey(it), it);
  }
  for (const it of normalized) {
    const key = buildCacheKey(it);
    if (!existing.has(key)) {
      cache.items.push(it);
      existing.set(key, it);
    }
  }
  cache.items.sort((a, b) => toTimeValue(b) - toTimeValue(a));
  const newest = cache.items[0]?.createdAt || "";
  if (newest && (!cache.lastCreatedAt || new Date(newest).getTime() > new Date(cache.lastCreatedAt).getTime())) {
    cache.lastCreatedAt = newest;
  }
  saveCache(cache);
}

async function syncStoredComments(options = {}) {
  const force = options.force ?? false;
  const allowFullScan = options.allowFullScan ?? false;
  const now = Date.now();
  if (!force && syncPromise) return await syncPromise;
  if (!force && now - lastSyncAtMs < 15000) return cache.items;

  syncPromise = (async () => {
    const issueNumber = await getCommentsIssueNumber({ createIfMissing: false });
    if (!issueNumber) return cache.items;

    /**
     * 删除一致性对账（可选）。
     * 目的：当后台删除评论后，其他用户的本地缓存也能在下一次刷新/切页时被动清理。
     */
    if (allowFullScan && (force || now - lastReconcileAtMs > RECONCILE_INTERVAL_MS)) {
      if (force) {
        return await reconcileCacheByFullScan(issueNumber);
      }
      window.setTimeout(() => {
        void reconcileCacheByFullScan(issueNumber).catch((e) => {
          console.warn("[comments] reconcile failed", e);
        });
      }, 0);
    }

    const since = cache.lastCreatedAt ? cache.lastCreatedAt : "";
    if (since) {
      const page1 = await fetchIssueCommentsPage(issueNumber, { page: 1, since });
      const parsed = page1
        .map((it) => {
          const stored = parseStoredCommentBody(it?.body);
          if (!stored) return null;
          const createdAt = String(it?.created_at ?? "").trim();
          const commentId = Number(it?.id) || 0;
          return { ...stored, createdAt, commentId };
        })
        .filter(Boolean);
      upsertIntoCache(parsed);
      lastSyncAtMs = Date.now();
      return cache.items;
    }

    if (!allowFullScan) return cache.items;

    const first = await fetchIssueCommentsPage(issueNumber, { page: 1 });
    const parsed1 = first
      .map((it) => {
        const stored = parseStoredCommentBody(it?.body);
        if (!stored) return null;
        const createdAt = String(it?.created_at ?? "").trim();
        const commentId = Number(it?.id) || 0;
        return { ...stored, createdAt, commentId };
      })
      .filter(Boolean);
    upsertIntoCache(parsed1);
    lastSyncAtMs = Date.now();

    if (first.length < 100) return cache.items;

    window.setTimeout(() => {
      void (async () => {
        try {
          for (let p = 2; p <= 20; p += 1) {
            const batch = await fetchIssueCommentsPage(issueNumber, { page: p });
            if (batch.length === 0) break;
            const parsed = batch
              .map((it) => {
                const stored = parseStoredCommentBody(it?.body);
                if (!stored) return null;
                const createdAt = String(it?.created_at ?? "").trim();
                const commentId = Number(it?.id) || 0;
                return { ...stored, createdAt, commentId };
              })
              .filter(Boolean);
            upsertIntoCache(parsed);
            if (batch.length < 100) break;
          }
        } catch (e) {
          console.warn("[comments] sync background failed", e);
        }
      })();
    }, 0);

    return cache.items;
  })()
    .catch((e) => {
      console.warn("[comments] sync failed", e);
      throw e;
    })
    .finally(() => {
      syncPromise = null;
    });

  return await syncPromise;
}

async function postCommentToIssue(payload) {
  const issueNumber = await getCommentsIssueNumber({ createIfMissing: true });
  if (!issueNumber) throw new Error("comments issue not found");

  const url = `https://api.github.com/repos/${encodeURIComponent(GITHUB.owner)}/${encodeURIComponent(
    GITHUB.repo
  )}/issues/${issueNumber}/comments`;
  const body = buildStoredCommentBody(payload);
  return await githubRequestJson(url, { method: "POST", withAuth: true, body: { body } });
}

/**
 * 删除 GitHub issue comment（按 comment id）。
 * 目的：为后台管理页提供真实“删除评论”的能力。
 */
async function deleteIssueCommentById(commentId) {
  const id = Number(commentId);
  if (!Number.isFinite(id) || id <= 0) throw new Error("invalid comment id");
  const url = `https://api.github.com/repos/${encodeURIComponent(GITHUB.owner)}/${encodeURIComponent(GITHUB.repo)}/issues/comments/${id}`;
  await githubRequestJson(url, { method: "DELETE", withAuth: true });
  return true;
}

/**
 * 从本地缓存移除指定 commentId 对应的评论条目。
 *
 * 注意：
 * - 这里只处理 commentId > 0 的条目；历史缓存中没有 commentId 的条目无法精确定位
 * - 删除后会落盘缓存并清理 allStoredCommentsPromise，确保下次读取走新缓存
 */
function removeCommentsFromCacheById(commentIds) {
  const ids = Array.isArray(commentIds) ? commentIds : [];
  const set = new Set(ids.map((x) => Number(x)).filter((x) => Number.isFinite(x) && x > 0));
  if (set.size === 0) return 0;
  const before = cache.items.length;
  cache.items = cache.items.filter((x) => !set.has(Number(x?.commentId)));
  const after = cache.items.length;
  if (after !== before) saveCache(cache);
  allStoredCommentsPromise = null;
  return before - after;
}

/**
 * 管理端复用：构建单条评论的 DOM 结构。
 * 功能：与主站评论区保持一致的视觉结构（commentItem/commentMeta/...）。
 * 目的：让后台管理页无需复制评论卡片的 DOM 拼装细节。
 */
export function createCommentElementForAdmin({ name, text, date }) {
  return createCommentElement({ name, text, date });
}

/**
 * 管理端复用：返回某个页面的“本地缓存评论列表”（不触发网络同步）。
 *
 * 输出字段：
 * - id：稳定标识（用于勾选/删除等 UI 状态）
 * - name/text/date/createdAt：用于展示与排序
 *
 * 目的：
 * - 管理页切换下拉时先秒开缓存，避免空白等待
 * - 与主站评论模块共享同一份 localStorage 缓存结构
 */
export function getCachedCommentsForAdmin(pageKey) {
  return getCachedCommentsForPage(pageKey);
}

/**
 * 管理端复用：同步拉取 GitHub 上的最新评论并合并进缓存。
 * 目的：让后台管理页在“显示缓存”的基础上，再刷新到最新数据。
 */
export async function syncCommentsForAdmin(options = {}) {
  const force = options.force ?? false;
  return await syncStoredComments({ force, allowFullScan: true });
}

/**
 * 管理端复用：以指定昵称新增评论（写入 GitHub issue comments）。
 * 目的：让后台评论发布不依赖终端 say 命令。
 */
export async function addCommentForAdmin(options = {}) {
  const page = toPageKey(options.page);
  const title = String(options.title ?? "").trim();
  const name = String(options.name ?? "").trim();
  const text = String(options.text ?? "").trim();
  if (!page || !name || !text) return null;

  const now = new Date();
  const payload = { page, title: title || page, name, text, date: now.toISOString() };
  const created = await postCommentToIssue(payload);
  const createdAt = String(created?.created_at ?? payload.date).trim();
  const commentId = Number(created?.id) || 0;
  upsertIntoCache([{ ...payload, createdAt, commentId }]);
  allStoredCommentsPromise = null;
  const list = getCachedCommentsForPage(page);
  return list[0] || null;
}

/**
 * 管理端复用：删除一条或多条 GitHub issue comments。
 *
 * 输入：
 * - commentIds：GitHub issue comment id 列表（数字）
 *
 * 输出：
 * - okIds：成功删除的 id
 * - failIds：删除失败的 id
 *
 * 目的：
 * - 让后台管理页能够对“已选中的评论”做真实删除
 * - 成功后同步更新本地缓存，保证 UI 与 GitHub 状态一致
 */
export async function deleteCommentsForAdmin(options = {}) {
  const ids = Array.isArray(options.commentIds) ? options.commentIds : [];
  const normalized = ids.map((x) => Number(x)).filter((x) => Number.isFinite(x) && x > 0);
  if (normalized.length === 0) return { okIds: [], failIds: [] };

  const results = await Promise.allSettled(normalized.map((id) => deleteIssueCommentById(id)));
  const okIds = [];
  const failIds = [];
  for (let i = 0; i < results.length; i += 1) {
    const id = normalized[i];
    if (results[i].status === "fulfilled") okIds.push(id);
    else failIds.push(id);
  }
  if (okIds.length > 0) removeCommentsFromCacheById(okIds);
  return { okIds, failIds };
}

/**
 * 管理端复用：比较两次列表是否一致。
 * 目的：避免不必要的重渲染，保持切换/刷新时的平滑感。
 */
export function sameCommentsForAdmin(a, b) {
  return sameCommentList(a, b);
}

/**
 * 初始化评论区并返回操作接口。
 * 功能：
 * - 从 GitHub 拉取并渲染当前页面对应的评论
 * - 返回 { add(text) } 用于在顶部插入新评论
 * 目的：让评论区对外只暴露一个最小 API（add），避免其它模块直接操作评论 DOM。
 */
export function setupComments() {
  const list = document.getElementById("commentsList");
  const composerInput = document.getElementById("commentsInput");
  const composerBtn = document.getElementById("commentsSayBtn");
  const loadingText = "Loading Comments…";
  const emptyText = "No comments yet. Say something!";
  const emptyState = document.createElement("div");
  emptyState.className = "commentsEmpty";
  emptyState.textContent = loadingText;
  emptyState.hidden = false;
  list.replaceChildren(emptyState);
  const sessionNickname = randomNickname();
  let currentPage = "";
  let loadSeq = 0;

  function submitComposer() {
    if (!(composerInput instanceof HTMLInputElement)) return;
    const text = String(composerInput.value ?? "").trim();
    if (!text) return;
    composerInput.value = "";
    window.__terminal?.run?.(`say ${text}`, { echo: true });
  }

  if (composerBtn instanceof HTMLElement) composerBtn.addEventListener("click", submitComposer);
  if (composerInput instanceof HTMLInputElement) {
    composerInput.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      submitComposer();
    });
  }

  function clearList() {
    list.replaceChildren(emptyState);
    emptyState.hidden = false;
  }

  function renderComments(comments) {
    clearList();
    for (const c of comments) list.appendChild(createCommentElement(c));
    emptyState.hidden = comments.length > 0;
    list.scrollTop = 0;
  }

  /**
   * 按页面 key 加载并渲染评论。
   * 功能：
   * - 切页时先展示本地缓存（即时反馈），再同步 GitHub 并按需刷新
   * - 初次加载先显示 Loading 文案；若 3 秒仍未渲染出任何评论，再回退为空态文案
   * 目的：避免“加载中却提示无评论”的误导，同时保持切页体验稳定。
   */
  async function loadForPage(pageKey) {
    const seq = (loadSeq += 1);
    if (!pageKey) {
      list.classList.add("switching");
      await sleep(180);
      if (seq !== loadSeq) return;
      emptyState.textContent = emptyText;
      clearList();
      window.requestAnimationFrame(() => {
        list.classList.remove("switching");
      });
      return;
    }
    list.classList.add("switching");
    await sleep(180);
    if (seq !== loadSeq) return;
    emptyState.textContent = loadingText;
    emptyState.hidden = false;
    window.setTimeout(() => {
      if (seq !== loadSeq) return;
      if (list.querySelector(".commentItem")) return;
      emptyState.textContent = emptyText;
      emptyState.hidden = false;
    }, 3000);
    const before = getCachedCommentsForPage(pageKey);
    renderComments(before);
    window.requestAnimationFrame(() => {
      list.classList.remove("switching");
    });
    try {
      await syncStoredComments({ force: false, allowFullScan: true });
      if (seq !== loadSeq) return;
      const after = getCachedCommentsForPage(pageKey);
      if (after.length === 0) emptyState.textContent = emptyText;
      if (!sameCommentList(before, after)) renderComments(after);
    } catch (e) {
      if (seq !== loadSeq) return;
      console.warn("[comments] load failed", e);
    }
  }

  return {
    /**
     * 新增一条评论（插入到最顶部）。
     * 功能：模拟“最新留言在前”的时间线。
     * 目的：终端 say 命令只需调用 window.__comments.add(text)，不关心 DOM 细节。
     */
    async add(text) {
      const t = String(text ?? "").trim();
      if (!t) return false;
      const page = currentPage;
      if (!page) return false;
      const now = new Date();
      const title = readCurrentContentTitle() || page;
      const payload = { page, title, name: sessionNickname, text: t, date: now.toISOString() };
      const optimistic = createCommentElement({ name: payload.name, text: payload.text, date: formatDate(now) });
      list.insertBefore(optimistic, list.firstChild);
      emptyState.hidden = true;
      try {
        const created = await postCommentToIssue(payload);
        const createdAt = String(created?.created_at ?? payload.date).trim();
        const commentId = Number(created?.id) || 0;
        upsertIntoCache([{ ...payload, createdAt, commentId }]);
        allStoredCommentsPromise = null;
        return true;
      } catch (e) {
        if (optimistic.parentNode === list) list.removeChild(optimistic);
        emptyState.hidden = list.querySelector(".commentItem") != null;
        throw e;
      }
    },
    setPage(path) {
      currentPage = toPageKey(path);
      void loadForPage(currentPage);
    },
  };
}
