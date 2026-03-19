import { DEFAULT_PAGE, FILE_SYSTEM, THEME_STORAGE_KEY } from "./modules/constants.js";
import { getCommentsGitHubRepo, setupComments } from "./modules/comments.js";
import { createContentRenderer } from "./modules/contentRenderer.js";
import { createTerminal } from "./modules/terminal.js";
import { getTheme, setTheme } from "./modules/theme.js";
import { fetchGithubDirMdList, fetchGithubPostMdList } from "./modules/utils.js";

/**
 * post 自动发现与缓存（增量）：
 * - 目标：用户首次打开页面不做网络扫描，首屏快速渲染；随后再后台同步更新文章列表。
 * - 方式：localStorage 里缓存“已发现的 post/*.md 文件名列表 + ETag”，启动时先合并缓存，空闲时再去 GitHub 拉目录列表。
 *
 * 设计取舍：
 * - 只做“新增”合并，不做“删除”回收（符合静态博客的增量写作习惯，也避免误删造成体验不稳定）
 * - 扫描目录使用 GitHub Contents API：无需自己维护文章索引文件
 */
const POST_INDEX_CACHE_KEY = "tdpb_post_index_cache_v1";
const POST_INDEX_CACHE_VERSION = 1;
const ABOUTME_INDEX_CACHE_KEY = "tdpb_aboutme_index_cache_v1";
const ABOUTME_INDEX_CACHE_VERSION = 1;

/**
 * 读取 post 索引缓存。
 * 功能：从 localStorage 解析出缓存对象，并做基础的字段兜底。
 * 目的：保证首屏不依赖网络，也能把历史文章列表快速合并进 FILE_SYSTEM。
 */
function loadPostIndexCache() {
  try {
    const raw = window.localStorage.getItem(POST_INDEX_CACHE_KEY);
    if (!raw) return { v: POST_INDEX_CACHE_VERSION, repoKey: "", etag: "", checkedAt: 0, names: [] };
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object") return { v: POST_INDEX_CACHE_VERSION, repoKey: "", etag: "", checkedAt: 0, names: [] };
    if (data.v !== POST_INDEX_CACHE_VERSION) return { v: POST_INDEX_CACHE_VERSION, repoKey: "", etag: "", checkedAt: 0, names: [] };
    const repoKey = typeof data.repoKey === "string" ? data.repoKey : "";
    const etag = typeof data.etag === "string" ? data.etag : "";
    const checkedAt = Number.isFinite(data.checkedAt) ? data.checkedAt : 0;
    const names = Array.isArray(data.names) ? data.names.filter((x) => typeof x === "string") : [];
    return { v: POST_INDEX_CACHE_VERSION, repoKey, etag, checkedAt, names };
  } catch {
    return { v: POST_INDEX_CACHE_VERSION, repoKey: "", etag: "", checkedAt: 0, names: [] };
  }
}

/**
 * 写入 post 索引缓存。
 * 目的：让后续访问复用已发现的文章列表，减少网络请求与首次渲染压力。
 */
function savePostIndexCache(cache) {
  try {
    window.localStorage.setItem(POST_INDEX_CACHE_KEY, JSON.stringify(cache));
  } catch {
    return;
  }
}

function loadAboutMeIndexCache() {
  try {
    const raw = window.localStorage.getItem(ABOUTME_INDEX_CACHE_KEY);
    if (!raw) return { v: ABOUTME_INDEX_CACHE_VERSION, repoKey: "", etag: "", checkedAt: 0, names: [] };
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object") return { v: ABOUTME_INDEX_CACHE_VERSION, repoKey: "", etag: "", checkedAt: 0, names: [] };
    if (data.v !== ABOUTME_INDEX_CACHE_VERSION) return { v: ABOUTME_INDEX_CACHE_VERSION, repoKey: "", etag: "", checkedAt: 0, names: [] };
    const repoKey = typeof data.repoKey === "string" ? data.repoKey : "";
    const etag = typeof data.etag === "string" ? data.etag : "";
    const checkedAt = Number.isFinite(data.checkedAt) ? data.checkedAt : 0;
    const names = Array.isArray(data.names) ? data.names.filter((x) => typeof x === "string") : [];
    return { v: ABOUTME_INDEX_CACHE_VERSION, repoKey, etag, checkedAt, names };
  } catch {
    return { v: ABOUTME_INDEX_CACHE_VERSION, repoKey: "", etag: "", checkedAt: 0, names: [] };
  }
}

function saveAboutMeIndexCache(cache) {
  try {
    window.localStorage.setItem(ABOUTME_INDEX_CACHE_KEY, JSON.stringify(cache));
  } catch {
    return;
  }
}

/**
 * 将“新发现的 md 文件名”合并进虚拟文件系统的 post 目录。
 * 输入：["2026-03-17-xxx.md", ...]
 * 输出：返回实际新增的条目数（用于触发必要的 UI 刷新）。
 *
 * 重要约定：
 * - 只处理 *.md 且跳过 post/index.md（index 作为目录默认页，不属于文章条目）
 * - 映射形式固定为 ./post/${name}，保证 cat 能直接 fetch 到对应文件
 */
function mergePostsIntoFileSystem(fileSystem, names) {
  const postDir = fileSystem?.post;
  if (!postDir || typeof postDir !== "object") return 0;
  let added = 0;
  for (const name of names) {
    if (typeof name !== "string") continue;
    if (!name.endsWith(".md")) continue;
    if (name === "index.md") continue;
    if (postDir[name]) continue;
    postDir[name] = `./post/${name}`;
    added += 1;
  }
  return added;
}

function mergeAboutMeIntoFileSystem(fileSystem, names) {
  const dir = fileSystem?.aboutme;
  if (!dir || typeof dir !== "object") return 0;
  let added = 0;
  for (const name of names) {
    if (typeof name !== "string") continue;
    if (!name.endsWith(".md")) continue;
    if (dir[name]) continue;
    dir[name] = `./aboutme/${name}`;
    added += 1;
  }
  return added;
}

/**
 * 从 GitHub 仓库读取 /post 目录下的文件列表，只保留 .md 文件名。
 * 用途：后台增量发现新增文章。
 *
 * 缓存策略：
 * - 支持 If-None-Match + ETag：目录列表没变时直接 304，避免传输与解析成本
 */
/**
 * 后台同步 post 索引（增量合并）。
 * 目标：不阻塞首屏渲染，用户打开页面立即可用；等浏览器空闲时再更新文章列表。
 *
 * 同步节流：
 * - checkedAt 30 秒内不重复扫（防止用户频繁刷新导致的额外压力）
 *
 * 只处理“新增”：
 * - 比对缓存 names 与本次 names，找出 newNames 再合并进 FILE_SYSTEM.post
 */
async function syncPostIndexInBackground(fileSystem, options = {}) {
  const config = getCommentsGitHubRepo();
  if (!config) return { added: 0 };
  const repoKey = `${config.owner}/${config.repo}`;

  const cache = loadPostIndexCache();
  const now = Date.now();
  const shouldSkip = cache.repoKey === repoKey && cache.checkedAt && now - cache.checkedAt < 30_000;
  if (shouldSkip) return { added: 0 };

  let names;
  let etag = cache.repoKey === repoKey ? cache.etag : "";
  try {
    const res = await fetchGithubPostMdList(config, { etag });
    etag = res.etag;
    names = res.names;
  } catch {
    const nextCache = { v: POST_INDEX_CACHE_VERSION, repoKey, etag, checkedAt: now, names: cache.repoKey === repoKey ? cache.names : [] };
    savePostIndexCache(nextCache);
    return { added: 0 };
  }

  if (names == null) {
    const nextCache = { v: POST_INDEX_CACHE_VERSION, repoKey, etag, checkedAt: now, names: cache.repoKey === repoKey ? cache.names : [] };
    savePostIndexCache(nextCache);
    return { added: 0 };
  }

  const prevNames = cache.repoKey === repoKey ? cache.names : [];
  const prevSet = new Set(prevNames);
  const newNames = names.filter((x) => !prevSet.has(x));
  const mergedNames = Array.from(new Set([...prevNames, ...names])).sort((a, b) => a.localeCompare(b));
  const nextCache = { v: POST_INDEX_CACHE_VERSION, repoKey, etag, checkedAt: now, names: mergedNames };
  savePostIndexCache(nextCache);

  const added = mergePostsIntoFileSystem(fileSystem, newNames);
  if (added && typeof options.onChanged === "function") options.onChanged(added);
  return { added };
}

async function syncAboutMeIndexInBackground(fileSystem, options = {}) {
  const config = getCommentsGitHubRepo();
  if (!config) return { added: 0 };
  const repoKey = `${config.owner}/${config.repo}`;

  const cache = loadAboutMeIndexCache();
  const now = Date.now();
  const shouldSkip = cache.repoKey === repoKey && cache.checkedAt && now - cache.checkedAt < 30_000;
  if (shouldSkip) return { added: 0 };

  let names;
  let etag = cache.repoKey === repoKey ? cache.etag : "";
  try {
    const res = await fetchGithubDirMdList(config, "aboutme", { etag });
    etag = res.etag;
    names = res.names;
  } catch {
    const nextCache = { v: ABOUTME_INDEX_CACHE_VERSION, repoKey, etag, checkedAt: now, names: cache.repoKey === repoKey ? cache.names : [] };
    saveAboutMeIndexCache(nextCache);
    return { added: 0 };
  }

  if (names == null) {
    const nextCache = { v: ABOUTME_INDEX_CACHE_VERSION, repoKey, etag, checkedAt: now, names: cache.repoKey === repoKey ? cache.names : [] };
    saveAboutMeIndexCache(nextCache);
    return { added: 0 };
  }

  const prevNames = cache.repoKey === repoKey ? cache.names : [];
  const prevSet = new Set(prevNames);
  const newNames = names.filter((x) => !prevSet.has(x));
  const mergedNames = Array.from(new Set([...prevNames, ...names])).sort((a, b) => a.localeCompare(b));
  const nextCache = { v: ABOUTME_INDEX_CACHE_VERSION, repoKey, etag, checkedAt: now, names: mergedNames };
  saveAboutMeIndexCache(nextCache);

  const added = mergeAboutMeIntoFileSystem(fileSystem, newNames);
  if (added && typeof options.onChanged === "function") options.onChanged(added);
  return { added };
}

/**
 * 应用入口（主装配文件）。
 * 功能：把各模块“组装”到一起并在 DOMReady 后启动。
 * 目的：
 * - 将业务逻辑拆分到 modules/ 后，入口只做依赖注入与启动顺序编排；
 * - 避免在一个文件里混杂：工具函数/DOM 渲染/命令解析/主题/评论等多种职责。
 */
window.addEventListener("DOMContentLoaded", () => {
  /**
   * 初始化评论区，并把最小操作接口挂到 window 上。
   * 功能：终端 say 命令通过 window.__comments.add(text) 新增评论。
   * 目的：终端无需 import 评论模块，从而减少模块之间的直接耦合。
   */
  window.__comments = setupComments();

  /**
   * 初始化主题：优先读取 localStorage 中的用户偏好，否则使用默认 dark。
   * 目的：刷新页面时保持主题一致，避免用户每次都要重新切换。
   */
  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme, { persist: false });
  else setTheme("dark", { persist: false });

  /**
   * 首屏合并“post 索引缓存”。
   * 目的：不等待网络扫描就能在 /post 与首页的 posts 区块展示完整文章列表。
   */
  const postCache = loadPostIndexCache();
  mergePostsIntoFileSystem(FILE_SYSTEM, postCache.names);
  const aboutmeCache = loadAboutMeIndexCache();
  mergeAboutMeIntoFileSystem(FILE_SYSTEM, aboutmeCache.names);

  /**
   * 记录最近一次渲染的路径。
   * 用途：当后台发现新增文章时，只在用户当前处于首页/Posts 列表页时触发一次重渲染，避免打断阅读。
   */
  let lastRenderedPath = "";

  /**
   * 创建内容渲染器并渲染默认页面。
   * 目的：首屏内容区不为空，且后续 cat/cd 可以复用同一个渲染器。
   */
  const renderer = createContentRenderer({
    fileSystem: FILE_SYSTEM,
    onPathRendered: (p) => {
      lastRenderedPath = p;
      window.__comments?.setPage?.(p);
    },
  });
  void renderer.renderPath(DEFAULT_PAGE);

  /**
   * 创建终端，并通过依赖注入把“渲染内容/切换主题/读取主题”的能力交给终端使用。
   * 目的：终端只处理交互与命令路由，不直接拥有业务实现细节。
   */
  const term = createTerminal({
    renderPath: renderer.renderPath,
    applyTheme: (t) => setTheme(t, { persist: true }),
    readTheme: getTheme,
  });
  window.__terminal = term;

  /**
   * 初始化移动端面板切换条（^ Comments / v Page）。
   *
   * 交互规则：
   * - 默认（关闭）：显示 ^ Comments，点击后评论面板平滑上移覆盖内容区
   * - 展开（打开）：显示 v Page，点击后评论面板平滑下移收起并回到页面
   *
   * 目的：
   * - 在窄屏/手机端把“评论”从右侧栏改为“底部抽屉”式体验，避免内容过窄
   * - 保持终端仍作为唯一命令入口，不改变原有命令/渲染逻辑
   */
  function setupMobileDock() {
    const layout = document.querySelector(".layout");
    const dock = document.getElementById("mobileDockToggle");
    const icon = document.getElementById("mobileDockIcon");
    const label = document.getElementById("mobileDockLabel");
    if (!(layout instanceof HTMLElement)) return;
    if (!(dock instanceof HTMLElement)) return;
    if (!(icon instanceof HTMLElement)) return;
    if (!(label instanceof HTMLElement)) return;

    const mq = window.matchMedia("(max-width: 640px)");

    function setOpen(open) {
      const nextOpen = Boolean(open);
      layout.classList.toggle("mobileCommentsOpen", nextOpen);
      dock.setAttribute("aria-expanded", nextOpen ? "true" : "false");
      if (nextOpen) {
        icon.textContent = "v";
        label.textContent = "Page";
      } else {
        icon.textContent = "^";
        label.textContent = "Comments";
      }
    }

    function toggle() {
      setOpen(!layout.classList.contains("mobileCommentsOpen"));
    }

    dock.addEventListener("click", () => {
      if (!mq.matches) return;
      toggle();
    });

    dock.addEventListener("keydown", (e) => {
      if (!mq.matches) return;
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      toggle();
    });

    mq.addEventListener("change", (e) => {
      if (!e.matches) setOpen(false);
    });

    setOpen(false);
  }

  setupMobileDock();
  document.addEventListener("click", (e) => {
    /**
     * 全局 “data-cmd -> 终端命令” 转发器。
     * 交互约定：任意元素只要带 data-cmd="xxx"，点击它就等价于在终端输入 xxx。
     *
     * 过滤规则：
     * - 不接管终端内部点击（避免影响终端自身交互）
     * - 不接管 a 链接点击（避免破坏外链/锚点的默认行为）
     */
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    if (t.closest(".terminal")) return;
    if (t.closest("a")) return;
    const el = t.closest("[data-cmd]");
    if (!(el instanceof HTMLElement)) return;
    const cmd = el.dataset.cmd;
    if (!cmd) return;
    e.preventDefault();
    window.__terminal?.run?.(cmd, { echo: true });
  });

  /**
   * 启动终端并把光标放到输入框，保证用户打开页面即可直接输入命令。
   */
  term.boot();
  term.focus();

  /**
   * 后台同步 post 索引（空闲时执行）。
   * 目标：首屏不卡；同时尽快把“新加的文章文件”合并进 FILE_SYSTEM。
   */
  const scheduleIdle =
    typeof window.requestIdleCallback === "function"
      ? (cb) => window.requestIdleCallback(cb, { timeout: 1200 })
      : (cb) => window.setTimeout(() => cb({ didTimeout: true, timeRemaining: () => 0 }), 800);
  scheduleIdle(() => {
    void syncPostIndexInBackground(FILE_SYSTEM, {
      onChanged: () => {
        if (lastRenderedPath === "./index.md" || lastRenderedPath === "./post/index.md") void renderer.renderPath(lastRenderedPath);
      },
    });
    void syncAboutMeIndexInBackground(FILE_SYSTEM, {
      onChanged: () => {
        if (lastRenderedPath === "./aboutme/index.md") void renderer.renderPath(lastRenderedPath);
      },
    });
  });
});
