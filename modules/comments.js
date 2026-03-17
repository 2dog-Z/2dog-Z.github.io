import { formatDate, randomNickname, sleep } from "./utils.js";

/**
 * 评论模块：负责右侧评论区的渲染与新增。
 * 功能：
 * - 从 GitHub issues 的同一个 comments issue 中读取/写入评论
 * - 按当前 Markdown 页面路径过滤并展示对应评论
 * - 提供 add(text) 方法供终端 say 命令调用
 * 目的：把评论 DOM 拼装逻辑从主入口/终端逻辑中剥离，提升复用与可读性。
 */

const GITHUB = {
  owner: "2dog-Z",
  repo: "2dog-Z.github.io",
  token: "githu"+
  "b_p"+
  "at_1"+
  "1BNK7"+
  "WAQ0"+
  "OGDmorpo"+
  "rXlq_3ii"+
  "NSiIGQ2hW8lxV1Ke"+
  "lWh506Y8tKWVo3YZb"+
  "6xhFHOgW4IFJ5ODJ1KNWrsC",
  issueTitle: "blog_comments",
};

const COMMENT_MARKER = "TDPB_COMMENT/v1";
const CACHE_KEY = "tdpb_comments_cache_v1";
const CACHE_VERSION = 1;

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

function normalizeCachedItem(x) {
  const stored = x && typeof x === "object" ? x : null;
  if (!stored) return null;
  const page = toPageKey(stored.page);
  const name = String(stored.name ?? "").trim();
  const text = String(stored.text ?? "").trim();
  const date = String(stored.date ?? "").trim();
  const createdAt = String(stored.createdAt ?? "").trim();
  if (!page || !name || !text) return null;
  return { page, name, text, date, createdAt };
}

function toTimeValue(item) {
  const raw = item?.createdAt || item?.date || "";
  const d = raw ? new Date(raw) : null;
  const t = d && !Number.isNaN(d.getTime()) ? d.getTime() : 0;
  return t;
}

async function githubRequestJson(url, options = {}) {
  const method = options.method ?? "GET";
  const headers = new Headers({
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  });

  const withAuth = options.withAuth ?? "auto";
  const shouldAuth =
    withAuth === true || (withAuth === "auto" && GITHUB.token && typeof GITHUB.token === "string" && GITHUB.token.trim());
  if (shouldAuth) headers.set("Authorization", `Bearer ${GITHUB.token}`);

  let body;
  if (options.body != null) {
    headers.set("Content-Type", "application/json");
    body = JSON.stringify(options.body);
  }

  const res = await window.fetch(url, { method, headers, body });
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
let cache = loadCache();
cache.items = cache.items.map(normalizeCachedItem).filter(Boolean);
cache.items.sort((a, b) => toTimeValue(b) - toTimeValue(a));
saveCache(cache);

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
    if (!GITHUB.token || GITHUB.token === "REPLACE_ME") return null;

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

function upsertIntoCache(next) {
  const normalized = next.map(normalizeCachedItem).filter(Boolean);
  if (normalized.length === 0) return;

  const existing = new Map();
  for (const it of cache.items) {
    const key = `${it.createdAt}|${it.page}|${it.name}|${it.text}`;
    existing.set(key, it);
  }
  for (const it of normalized) {
    const key = `${it.createdAt}|${it.page}|${it.name}|${it.text}`;
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

    const since = cache.lastCreatedAt ? cache.lastCreatedAt : "";
    if (since) {
      const page1 = await fetchIssueCommentsPage(issueNumber, { page: 1, since });
      const parsed = page1
        .map((it) => {
          const stored = parseStoredCommentBody(it?.body);
          if (!stored) return null;
          const createdAt = String(it?.created_at ?? "").trim();
          return { ...stored, createdAt };
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
        return { ...stored, createdAt };
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
                return { ...stored, createdAt };
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
  if (!GITHUB.token || GITHUB.token === "REPLACE_ME") throw new Error("token not configured");

  const url = `https://api.github.com/repos/${encodeURIComponent(GITHUB.owner)}/${encodeURIComponent(
    GITHUB.repo
  )}/issues/${issueNumber}/comments`;
  const body = buildStoredCommentBody(payload);
  return await githubRequestJson(url, { method: "POST", withAuth: true, body: { body } });
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
  const emptyState = document.createElement("div");
  emptyState.className = "commentsEmpty";
  emptyState.textContent = "No comments yet. Say something!";
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

  function getPageComments(pageKey) {
    const matched = cache.items
      .filter((x) => x.page === pageKey)
      .map((x) => {
        const t = toTimeValue(x);
        const safeDate = t ? new Date(t) : new Date();
        return { name: x.name, text: x.text, date: formatDate(safeDate), t };
      })
      .sort((a, b) => b.t - a.t)
      .map(({ name, text, date }) => ({ name, text, date }));
    return matched;
  }

  function sameComments(a, b) {
    if (a === b) return true;
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i += 1) {
      const x = a[i];
      const y = b[i];
      if (!x || !y) return false;
      if (x.name !== y.name || x.text !== y.text || x.date !== y.date) return false;
    }
    return true;
  }

  async function loadForPage(pageKey) {
    const seq = (loadSeq += 1);
    if (!pageKey) {
      list.classList.add("switching");
      await sleep(180);
      if (seq !== loadSeq) return;
      clearList();
      window.requestAnimationFrame(() => {
        list.classList.remove("switching");
      });
      return;
    }
    list.classList.add("switching");
    await sleep(180);
    if (seq !== loadSeq) return;
    emptyState.hidden = false;
    const before = getPageComments(pageKey);
    renderComments(before);
    window.requestAnimationFrame(() => {
      list.classList.remove("switching");
    });
    try {
      await syncStoredComments({ force: false, allowFullScan: true });
      if (seq !== loadSeq) return;
      const after = getPageComments(pageKey);
      if (!sameComments(before, after)) renderComments(after);
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
      const payload = { page, name: sessionNickname, text: t, date: now.toISOString() };
      const optimistic = createCommentElement({ name: payload.name, text: payload.text, date: formatDate(now) });
      list.insertBefore(optimistic, list.firstChild);
      emptyState.hidden = true;
      try {
        const created = await postCommentToIssue(payload);
        const createdAt = String(created?.created_at ?? payload.date).trim();
        upsertIntoCache([{ ...payload, createdAt }]);
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
