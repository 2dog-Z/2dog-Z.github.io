/**
 * 管理界面渲染模块（登录后才加载）。
 *
 * 设计目标：
 * - 未登录时不下载该模块，从而在 DevTools 的 Resources 中也不可见
 * - 本版本先做“静态 demo”：壳层 + 评论管理 + 文件管理占位
 * - 尽量复用主站已有的样式类（panel/comments/cmdButton），避免风格割裂
 */

import { FILE_SYSTEM } from "../modules/constants.js";
import {
  addCommentForAdmin,
  createCommentElementForAdmin,
  deleteCommentsForAdmin,
  getCachedCommentsForAdmin,
  getCommentsGitHubRepo,
  sameCommentsForAdmin,
  syncCommentsForAdmin,
} from "../modules/comments.js";
import { githubRequest, sleep } from "../modules/utils.js";

/**
 * 收集虚拟文件系统里的 Markdown 路径列表。
 *
 * 输出形如：
 * - { key: "./index.md", label: "index.md" }
 * - { key: "./aboutme/index.md", label: "aboutme/index.md" }
 *
 * 目的：
 * - 评论管理需要一个“按页面筛选”的下拉列表
 * - 复用主站 FILE_SYSTEM，避免维护两份文件名清单
 */
function collectMarkdownEntries(fs) {
  const out = [];

  function walk(node, prefixParts) {
    if (!node || typeof node !== "object") return;
    const keys = Object.keys(node).sort((a, b) => a.localeCompare(b));
    for (const k of keys) {
      const v = node[k];
      if (v && typeof v === "object") {
        walk(v, [...prefixParts, k]);
        continue;
      }
      if (typeof v !== "string") continue;
      if (!k.endsWith(".md")) continue;
      const key = String(v).trim();
      if (!key) continue;
      const label = [...prefixParts, k].join("/");
      out.push({ key, label });
    }
  }

  walk(fs, []);
  out.sort((a, b) => a.label.localeCompare(b.label));
  return out;
}

/**
 * 创建“浏览器样式”的顶栏（tab bar）。
 * 目的：作为后台管理系统壳层的固定导航入口。
 */
function createBrowserBar() {
  const bar = document.createElement("div");
  bar.className = "adminBrowserBar";

  const tabs = document.createElement("div");
  tabs.className = "adminTabs";
  tabs.setAttribute("role", "tablist");

  bar.appendChild(tabs);
  return { bar, tabs };
}

/**
 * 评论管理页面。
 *
 * 需求要点：
 * - 顶部居中：Markdown 文件下拉列表
 * - 右上：删除按钮（仅删除已勾选项）
 * - 中部：平滑切换并列出所有评论（每条前有复选框）
 * - 底部：输入框 + say 按钮（以 Chambers 昵称发表评论）
 */
function createCommentsManagementView(entries) {
  const page = document.createElement("div");
  page.className = "adminPage adminCommentsPage";

  const loadingText = "Loading Comments…";
  const emptyText = "No comments yet. Say something!";

  const header = document.createElement("div");
  header.className = "adminPageHeader";

  const left = document.createElement("div");
  left.className = "adminPageTitle";
  left.textContent = "Comment Management";

  const select = document.createElement("select");
  select.className = "adminSelect";
  select.setAttribute("aria-label", "Markdown Page");
  for (const e of entries) {
    const opt = document.createElement("option");
    opt.value = e.key;
    opt.textContent = e.label;
    select.appendChild(opt);
  }

  const actions = document.createElement("div");
  actions.className = "adminPageActions";

  const deleteBtn = document.createElement("code");
  deleteBtn.className = "cmdButton adminDeleteBtn";
  deleteBtn.textContent = "delete";
  actions.appendChild(deleteBtn);

  header.appendChild(left);
  header.appendChild(select);
  header.appendChild(actions);

  const center = document.createElement("div");
  center.className = "adminCommentsCenter";

  const list = document.createElement("div");
  list.className = "commentsList adminCommentsList";
  list.setAttribute("role", "list");

  const empty = document.createElement("div");
  empty.className = "commentsEmpty";
  empty.textContent = loadingText;
  empty.hidden = true;
  list.appendChild(empty);

  center.appendChild(list);

  const composer = document.createElement("div");
  composer.className = "commentsComposer";

  const input = document.createElement("input");
  input.className = "commentsInput";
  input.type = "text";
  input.placeholder = "Say something as Chambers…";
  input.setAttribute("aria-label", "New Comment");

  const sayBtn = document.createElement("code");
  sayBtn.className = "cmdButton";
  sayBtn.textContent = "say";
  sayBtn.title = "say";

  composer.appendChild(input);
  composer.appendChild(sayBtn);

  /**
   * 发布/删除反馈提示。
   * 目的：让管理操作（发评论、删评论）都有即时结果反馈，并保持页面整体克制。
   */
  const composerHint = document.createElement("div");
  composerHint.className = "adminFootnote";
  composerHint.textContent = "";
  composerHint.setAttribute("role", "status");
  composerHint.setAttribute("aria-live", "polite");

  page.appendChild(header);
  page.appendChild(center);
  page.appendChild(composer);
  page.appendChild(composerHint);

  let currentKey = entries[0]?.key || "";
  const selectedIds = new Set();
  const deletedIdsByPage = new Map();
  let renderSeq = 0;
  let isPosting = false;
  let isDeleting = false;
  let hintTimer = 0;

  function setDeleteEnabled(enabled) {
    deleteBtn.style.pointerEvents = enabled ? "auto" : "none";
    deleteBtn.style.opacity = enabled ? "1" : "0.6";
  }

  /**
   * 设置删除忙碌态。
   * 目的：避免用户在批量删除过程中重复点击，造成并发请求与 UI 状态错乱。
   */
  function setDeleting(next) {
    isDeleting = Boolean(next);
    if (isDeleting) {
      deleteBtn.style.pointerEvents = "none";
      deleteBtn.style.opacity = "0.7";
      return;
    }
    setDeleteEnabled(selectedIds.size > 0);
  }

  /**
   * 设置发布忙碌态。
   * 目的：避免重复点击造成多条重复评论，同时给用户一个明确的可用性反馈。
   */
  function setPosting(next) {
    isPosting = Boolean(next);
    input.disabled = isPosting;
    sayBtn.style.pointerEvents = isPosting ? "none" : "auto";
    sayBtn.style.opacity = isPosting ? "0.7" : "1";
  }

  /**
   * 设置发布结果提示文案。
   * 目的：发布成功时给出明确反馈，并在短时间后自动清空。
   */
  function setComposerHint(text, options = {}) {
    const { ttlMs = 1200 } = options;
    composerHint.textContent = String(text ?? "");
    if (hintTimer) window.clearTimeout(hintTimer);
    if (!composerHint.textContent) return;
    hintTimer = window.setTimeout(() => {
      composerHint.textContent = "";
    }, ttlMs);
  }

  function getDeletedSetForKey(key) {
    const raw = deletedIdsByPage.get(key);
    if (raw instanceof Set) return raw;
    const s = new Set();
    deletedIdsByPage.set(key, s);
    return s;
  }

  /**
   * 获取某个页面在当前会话里“可见的评论列表”。
   * 策略：以 comments 模块的缓存为基底，再叠加当前会话里的本地删除集合（不触发网络）。
   */
  function getVisibleItemsForKey(key) {
    const items = getCachedCommentsForAdmin(key);
    const deleted = getDeletedSetForKey(key);
    if (deleted.size === 0) return items;
    return items.filter((x) => !deleted.has(x.id));
  }

  /**
   * 构建“复选框 + 评论卡片”的列表行。
   * 目的：把选择逻辑与 DOM 拼装集中在一个点，便于删除/刷新时复用。
   */
  function createRow(it) {
    const row = document.createElement("div");
    row.className = "adminCommentRow";
    row.setAttribute("role", "listitem");

    const check = document.createElement("input");
    check.className = "adminCommentCheck";
    check.type = "checkbox";
    check.checked = selectedIds.has(it.id);
    check.setAttribute("aria-label", "Select Comment");
    check.addEventListener("change", () => {
      if (check.checked) selectedIds.add(it.id);
      else selectedIds.delete(it.id);
      setDeleteEnabled(selectedIds.size > 0);
    });

    const card = createCommentElementForAdmin(it);
    row.appendChild(check);
    row.appendChild(card);
    return row;
  }

  function renderListForKey(key) {
    const items = getVisibleItemsForKey(key);
    list.replaceChildren(empty);
    for (const it of items) {
      list.appendChild(createRow(it));
    }
    empty.hidden = items.length > 0;
    setDeleteEnabled(selectedIds.size > 0);
    list.scrollTop = 0;
  }

  async function smoothRenderForKey(key) {
    const seq = (renderSeq += 1);
    list.classList.add("switching");
    await sleep(180);
    if (seq !== renderSeq) return;
    renderListForKey(key);
    window.requestAnimationFrame(() => {
      list.classList.remove("switching");
    });
  }

  function clearSelection() {
    selectedIds.clear();
    setDeleteEnabled(false);
  }

  /**
   * 同步 GitHub 侧最新评论并刷新 UI。
   * 目的：切页时先展示缓存，随后再把真实最新评论合并进来，避免空白等待。
   */
  async function refreshFromNetwork(key) {
    try {
      const before = getVisibleItemsForKey(key);
      await syncCommentsForAdmin({ force: false });
      if (String(key ?? "") !== currentKey) return;
      const after = getVisibleItemsForKey(key);
      if (after.length === 0) empty.textContent = emptyText;
      if (!sameCommentsForAdmin(before, after)) renderListForKey(key);
    } catch {
      if (String(key ?? "") !== currentKey) return;
      empty.textContent = emptyText;
      empty.hidden = list.querySelector(".commentItem") != null;
    }
  }

  async function switchPage(nextKey) {
    currentKey = String(nextKey ?? "");
    clearSelection();
    empty.textContent = loadingText;
    empty.hidden = false;
    window.setTimeout(() => {
      if (currentKey !== String(nextKey ?? "")) return;
      if (list.querySelector(".commentItem")) return;
      empty.textContent = emptyText;
      empty.hidden = false;
    }, 3000);
    await smoothRenderForKey(currentKey);
    void refreshFromNetwork(currentKey);
  }

  async function submitNewComment() {
    if (isPosting) return;
    const text = String(input.value ?? "").trim();
    if (!text) return;
    if (!currentKey) return;
    const cached = text;
    input.value = "";
    setPosting(true);
    setComposerHint("");
    const optimistic = {
      id: `${currentKey}|local|${Date.now()}|Chambers|${text}`,
      page: currentKey,
      name: "Chambers",
      text,
      createdAt: new Date().toISOString(),
      date: new Date().toISOString().slice(0, 10),
    };
    const row = createRow(optimistic);
    list.insertBefore(row, list.firstChild);
    empty.hidden = true;
    list.scrollTop = 0;
    try {
      await addCommentForAdmin({ page: currentKey, name: "Chambers", text });
      clearSelection();
      renderListForKey(currentKey);
      setComposerHint("Successful", { ttlMs: 1200 });
    } catch (e) {
      if (row.parentNode === list) list.removeChild(row);
      empty.hidden = list.querySelector(".commentItem") != null;
      input.value = cached;
      console.warn("[admin] post comment failed", e);
      setComposerHint("Failed", { ttlMs: 2400 });
    } finally {
      setPosting(false);
    }
  }

  /**
   * 删除选中评论（带确认）。
   *
   * 交互：
   * - confirm：用户选择 yes/cancel
   * - yes：调用 GitHub issue comments 删除 API（comments 模块封装）
   * - 完成：刷新列表并在底部提示 successful/failed
   *
   * 目的：
   * - 后台删除应当是真实生效的删除（不只是本地隐藏）
   * - 保持与发布评论一致的反馈风格
   */
  deleteBtn.addEventListener("click", () => {
    void (async () => {
      if (isDeleting) return;
      if (!currentKey) return;
      if (selectedIds.size === 0) return;

      const ok = window.confirm(`Ensure to delete ${selectedIds.size} comment(s)?`);
      if (!ok) return;

      const items = getVisibleItemsForKey(currentKey);
      const byId = new Map(items.map((x) => [x.id, x]));
      const ids = Array.from(selectedIds);
      const commentIds = ids
        .map((id) => byId.get(id))
        .map((x) => Number(x?.commentId))
        .filter((x) => Number.isFinite(x) && x > 0);

      setDeleting(true);
      setComposerHint("");
      try {
        const res = await deleteCommentsForAdmin({ commentIds });
        const deletedSet = getDeletedSetForKey(currentKey);
        for (const id of ids) {
          const it = byId.get(id);
          const cid = Number(it?.commentId);
          if (!Number.isFinite(cid) || cid <= 0) deletedSet.add(id);
        }
        clearSelection();
        renderListForKey(currentKey);

        const total = commentIds.length;
        if (total === 0) {
          setComposerHint("Successful", { ttlMs: 1200 });
          return;
        }
        const okCount = Array.isArray(res?.okIds) ? res.okIds.length : 0;
        const failCount = Array.isArray(res?.failIds) ? res.failIds.length : 0;
        if (failCount === 0) setComposerHint(`Successful (${okCount}/${total})`, { ttlMs: 1600 });
        else setComposerHint(`Failed (${okCount}/${total})`, { ttlMs: 2400 });
      } catch (e) {
        console.warn("[admin] delete comment failed", e);
        setComposerHint("Failed", { ttlMs: 2400 });
      } finally {
        setDeleting(false);
      }
    })();
  });

  sayBtn.addEventListener("click", () => {
    void submitNewComment();
  });
  input.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    void submitNewComment();
  });

  select.addEventListener("change", () => {
    void switchPage(select.value);
  });

  setDeleteEnabled(false);
  setPosting(false);
  void switchPage(currentKey);
  return page;
}

/**
 * 文件管理页面（GitHub Pages 可用：经由 Worker 调 GitHub Contents API）。
 *
 * 能力范围：
 * - 文件树索引：GET /repos/:owner/:repo/contents/:path
 * - 文件下载：GET 文件内容（base64）-> 浏览器下载
 * - 文件上传：PUT（base64）创建/覆盖
 * - 文件删除：GET 取 sha -> DELETE
 *
 * 虚拟文件系统约定：
 * - aboutme/post：直接使用主站 FILE_SYSTEM（文件=字符串，目录=对象）
 * - root/image：在管理端内构建 FILE_SYSTEM 形态的“缓存树”（仅用于管理页）
 *
 * 权限约束：
 * - root/post/aboutme：仅允许增删（含覆盖） .md
 * - image：允许任意文件增删
 */
function createFilesManagementView() {
  const page = document.createElement("div");
  page.className = "adminPage adminFilesPage";

  const loadingText = "Loading Files…";
  const emptyText = "No files in this directory.";

  const repo = getCommentsGitHubRepo();
  const owner = repo?.owner || "";
  const repoName = repo?.repo || "";

  const ADMIN_ROOT_FS = {};
  const ADMIN_IMAGE_FS = {};
  const loadedNodes = new WeakSet();

  const header = document.createElement("div");
  header.className = "adminPageHeader";

  const left = document.createElement("div");
  left.className = "adminPageTitleBox";

  const title = document.createElement("div");
  title.className = "adminPageTitle";
  title.textContent = "File Management";

  const cdRootBtn = document.createElement("code");
  cdRootBtn.className = "cmdButton adminCdRootBtn";
  cdRootBtn.textContent = "cd /";
  cdRootBtn.title = "cd /";
  cdRootBtn.addEventListener("click", () => {
    void switchDir("root");
  });

  left.appendChild(title);
  left.appendChild(cdRootBtn);

  const select = document.createElement("select");
  select.className = "adminSelect";
  select.setAttribute("aria-label", "Directory");
  for (const k of ["root", "aboutme", "post", "image"]) {
    const opt = document.createElement("option");
    opt.value = k;
    opt.textContent = k;
    select.appendChild(opt);
  }

  const actions = document.createElement("div");
  actions.className = "adminPageActions";

  const downloadBtn = document.createElement("code");
  downloadBtn.className = "cmdButton adminDownloadBtn";
  downloadBtn.textContent = "download";
  actions.appendChild(downloadBtn);

  const deleteBtn = document.createElement("code");
  deleteBtn.className = "cmdButton adminDeleteBtn";
  deleteBtn.textContent = "delete";
  actions.appendChild(deleteBtn);

  header.appendChild(left);
  header.appendChild(select);
  header.appendChild(actions);

  const center = document.createElement("div");
  center.className = "adminFilesCenter";

  const list = document.createElement("div");
  list.className = "commentsList adminFilesList";
  list.setAttribute("role", "list");

  const empty = document.createElement("div");
  empty.className = "commentsEmpty";
  empty.textContent = loadingText;
  empty.hidden = true;
  list.appendChild(empty);

  const uploadBtn = document.createElement("code");
  uploadBtn.className = "cmdButton adminUploadBtn";
  uploadBtn.textContent = "upload";
  uploadBtn.title = "upload";

  const uploadInput = document.createElement("input");
  uploadInput.type = "file";
  uploadInput.hidden = true;
  uploadInput.setAttribute("aria-hidden", "true");

  center.appendChild(list);
  center.appendChild(uploadBtn);
  center.appendChild(uploadInput);

  /**
   * 操作反馈提示。
   * 目的：与评论管理一致，让删除/下载/上传都以轻量方式提示结果。
   */
  const hint = document.createElement("div");
  hint.className = "adminFootnote";
  hint.textContent = "";
  hint.setAttribute("role", "status");
  hint.setAttribute("aria-live", "polite");

  page.appendChild(header);
  page.appendChild(center);
  page.appendChild(hint);

  let currentKey = "root";
  const selectedIds = new Set();
  let renderSeq = 0;
  let isDeleting = false;
  let isBusy = false;
  let hintTimer = 0;
  let currentEntries = [];

  function setActionEnabled(el, enabled) {
    el.style.pointerEvents = enabled ? "auto" : "none";
    el.style.opacity = enabled ? "1" : "0.6";
  }

  function setActionsEnabled() {
    const byId = new Map(currentEntries.map((x) => [x.id, x]));
    const selected = Array.from(selectedIds).map((id) => byId.get(id)).filter(Boolean);
    const selectedFiles = selected.filter((x) => x.kind === "file");
    const allow = !isBusy;
    const canDownload = allow && selected.length === 1 && selectedFiles.length === 1;
    const canDelete =
      allow &&
      !isDeleting &&
      selected.length > 0 &&
      selectedFiles.length === selected.length &&
      selectedFiles.every((x) => canWriteFileAtKey(currentKey, x.name));

    setActionEnabled(downloadBtn, canDownload);
    setActionEnabled(deleteBtn, canDelete);
  }

  /**
   * 设置提示文案并在短时间后自动清空。
   * 目的：让 demo 交互“有反馈但不过度占据注意力”。
   */
  function setHint(text, options = {}) {
    const { ttlMs = 1400 } = options;
    hint.textContent = String(text ?? "");
    if (hintTimer) window.clearTimeout(hintTimer);
    if (!hint.textContent) return;
    hintTimer = window.setTimeout(() => {
      hint.textContent = "";
    }, ttlMs);
  }

  function normalizeDirKey(key) {
    const k = String(key ?? "").trim();
    if (!k) return "root";
    if (k === "root" || k === "aboutme" || k === "post" || k === "image") return k;
    const parts = k.split("/").map((x) => x.trim()).filter(Boolean);
    const base = parts[0];
    if (base !== "root" && base !== "aboutme" && base !== "post" && base !== "image") return "root";
    return [base, ...parts.slice(1)].join("/");
  }

  function selectLabelForKey(key) {
    const parts = String(key ?? "")
      .split("/")
      .map((x) => x.trim())
      .filter(Boolean);
    if (parts.length === 0) return "root";
    return parts[parts.length - 1];
  }

  /**
   * 确保下拉列表里存在某个目录项。
   * 目的：目录跳转时让“当前目录”在下拉框里可见且可回退。
   */
  function ensureSelectOption(key) {
    const k = normalizeDirKey(key);
    const existing = Array.from(select.options).find((o) => o.value === k);
    if (existing) return;
    const opt = document.createElement("option");
    opt.value = k;
    opt.textContent = selectLabelForKey(k);
    select.appendChild(opt);
  }

  function encodePath(path) {
    const p = String(path ?? "")
      .replace(/^\/+/, "")
      .replace(/\/+$/, "");
    if (!p) return "";
    return p
      .split("/")
      .filter(Boolean)
      .map((seg) => encodeURIComponent(seg))
      .join("/");
  }

  function contentsApiUrl(path) {
    const repoPath = String(path ?? "")
      .replace(/^\/+/, "")
      .replace(/\/+$/, "");
    const encoded = encodePath(repoPath);
    const suffix = encoded ? `/${encoded}` : "";
    return `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}/contents${suffix}`;
  }

  /**
   * 将“当前目录节点”转换成可渲染条目列表。
   *
   * 输出：
   * - { id, kind: "dir"|"file", name, repoPath }
   *
   * 目的：
   * - UI 渲染只依赖平面数组，便于复用“切换 + 重新渲染”的流程
   * - 统一生成稳定 id（用 repoPath），方便复选框保持选中态
   */
  function collectEntriesFromNode(node, dirRepoPath) {
    if (!node || typeof node !== "object") return [];
    const names = Object.keys(node).sort((a, b) => a.localeCompare(b));
    const out = [];
    const dirs = [];
    const files = [];
    for (const name of names) {
      const v = node[name];
      if (v && typeof v === "object") dirs.push(name);
      else if (typeof v === "string") files.push(name);
    }
    for (const d of dirs) {
      const repoPath = dirRepoPath ? `${dirRepoPath}/${d}` : d;
      out.push({ id: `dir:${repoPath}`, kind: "dir", name: d, repoPath });
    }
    for (const f of files) {
      const repoPath = dirRepoPath ? `${dirRepoPath}/${f}` : f;
      out.push({ id: `file:${repoPath}`, kind: "file", name: f, repoPath });
    }
    return out;
  }

  function baseOfKey(key) {
    const k = normalizeDirKey(key);
    const parts = k.split("/").filter(Boolean);
    return parts[0] || "root";
  }

  function restPartsOfKey(key) {
    const k = normalizeDirKey(key);
    const parts = k.split("/").filter(Boolean);
    return parts.slice(1);
  }

  function repoDirForKey(key) {
    const base = baseOfKey(key);
    const rest = restPartsOfKey(key);
    if (base === "root") return rest.join("/");
    if (base === "image") return ["image", ...rest].filter(Boolean).join("/");
    if (base === "post") return "post";
    if (base === "aboutme") return "aboutme";
    return "";
  }

  function nodeForKey(key) {
    const base = baseOfKey(key);
    const rest = restPartsOfKey(key);
    if (base === "root") {
      let node = ADMIN_ROOT_FS;
      for (const seg of rest) {
        if (!node || typeof node !== "object") return null;
        const next = node[seg];
        if (!next || typeof next !== "object") node[seg] = {};
        node = node[seg];
      }
      return node;
    }
    if (base === "image") {
      let node = ADMIN_IMAGE_FS;
      for (const seg of rest) {
        if (!node || typeof node !== "object") return null;
        const next = node[seg];
        if (!next || typeof next !== "object") node[seg] = {};
        node = node[seg];
      }
      return node;
    }
    if (base === "post") return FILE_SYSTEM?.post && typeof FILE_SYSTEM.post === "object" ? FILE_SYSTEM.post : null;
    if (base === "aboutme") return FILE_SYSTEM?.aboutme && typeof FILE_SYSTEM.aboutme === "object" ? FILE_SYSTEM.aboutme : null;
    return null;
  }

  /**
   * 构建“树节点行”。
   * 目的：复用评论管理的“复选 + 行渲染”思路，保持交互与结构一致。
   */
  function createRow(it) {
    const row = document.createElement("div");
    row.className = `adminFileRow ${it.kind === "dir" ? "adminFileRowDir" : "adminFileRowFile"}`;
    row.setAttribute("role", "listitem");
    row.style.setProperty("--indent", "0px");

    if (it.kind === "file") {
      const check = document.createElement("input");
      check.className = "adminFileCheck";
      check.type = "checkbox";
      check.checked = selectedIds.has(it.id);
      check.setAttribute("aria-label", "Select File");
      check.addEventListener("change", () => {
        if (check.checked) selectedIds.add(it.id);
        else selectedIds.delete(it.id);
        setActionsEnabled();
      });
      row.appendChild(check);
    } else {
      const spacer = document.createElement("div");
      spacer.className = "adminFileCheckSpacer";
      row.appendChild(spacer);
      row.tabIndex = 0;
      row.addEventListener("click", () => {
        void switchDir(buildNextKeyFromDirClick(it));
      });
      row.addEventListener("keydown", (e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        void switchDir(buildNextKeyFromDirClick(it));
      });
    }

    const icon = document.createElement("span");
    icon.className = "adminFileIcon";
    icon.textContent = it.kind === "dir" ? "dir" : "file";

    const label = document.createElement("div");
    label.className = "adminFileLabel";
    label.textContent = it.name;

    row.appendChild(icon);
    row.appendChild(label);
    return row;
  }

  function renderListForEntries(items) {
    currentEntries = Array.isArray(items) ? items : [];
    list.replaceChildren(empty);
    for (const it of currentEntries) list.appendChild(createRow(it));
    const hasAny = currentEntries.length > 0;
    empty.textContent = hasAny ? "" : emptyText;
    empty.hidden = hasAny;
    list.scrollTop = 0;
    setActionsEnabled();
  }

  function buildNextKeyFromDirClick(dirItem) {
    const base = baseOfKey(currentKey);
    const rest = restPartsOfKey(currentKey);
    const name = String(dirItem?.name ?? "").trim();
    if (!name) return normalizeDirKey(currentKey);

    if (base === "root") {
      if (rest.length === 0 && (name === "aboutme" || name === "post" || name === "image")) return name;
      return ["root", ...rest, name].join("/");
    }
    if (base === "image") return ["image", ...rest, name].join("/");
    return base;
  }

  async function loadDirIntoFsNode(dirRepoPath, node) {
    if (!owner || !repoName) throw new Error("GitHub repo not configured");
    if (!node || typeof node !== "object") return;
    if (loadedNodes.has(node)) return;

    const res = await githubRequest(contentsApiUrl(dirRepoPath), { method: "GET" });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Load dir failed: ${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`);
    }

    const data = await res.json().catch(() => null);
    const items = Array.isArray(data) ? data : [];

    for (const k of Object.keys(node)) delete node[k];
    for (const it of items) {
      const name = String(it?.name ?? "").trim();
      const type = String(it?.type ?? "").trim();
      const path = String(it?.path ?? "").replace(/^\/+/, "").replace(/\/+$/, "");
      if (!name || !type) continue;
      if (type === "dir") node[name] = {};
      else if (type === "file") node[name] = `./${path}`;
    }

    loadedNodes.add(node);
  }

  async function ensureFsReadyForKey(key) {
    const base = baseOfKey(key);
    const repoDir = repoDirForKey(key);
    const node = nodeForKey(key);
    if (!node || typeof node !== "object") return;

    if (base === "root") return await loadDirIntoFsNode(repoDir, node);
    if (base === "image") return await loadDirIntoFsNode(repoDir, node);
    return;
  }

  function entryByIdMap() {
    return new Map(currentEntries.map((x) => [x.id, x]));
  }

  function canWriteFileAtKey(dirKey, filename) {
    const base = baseOfKey(dirKey);
    const name = String(filename ?? "").trim();
    const isMd = name.toLowerCase().endsWith(".md");
    if (!name) return false;
    if (base === "image") return true;
    if (base === "root" || base === "post" || base === "aboutme") return isMd;
    return false;
  }

  function fileRepoPathForUpload(dirKey, filename) {
    const base = baseOfKey(dirKey);
    const rest = restPartsOfKey(dirKey);
    const name = String(filename ?? "").trim();
    if (!name) return "";
    if (base === "root") return [...rest, name].filter(Boolean).join("/");
    if (base === "post") return ["post", name].join("/");
    if (base === "aboutme") return ["aboutme", name].join("/");
    if (base === "image") return ["image", ...rest, name].filter(Boolean).join("/");
    return "";
  }

  function bytesToBase64(bytes) {
    const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    const chunkSize = 0x8000;
    let binary = "";
    for (let i = 0; i < arr.length; i += chunkSize) {
      const chunk = arr.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }
    return btoa(binary);
  }

  function base64ToBytes(b64) {
    const raw = String(b64 ?? "").replace(/\s+/g, "");
    const binary = atob(raw);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
    return out;
  }

  async function getFileFromGitHub(repoPath) {
    const res = await githubRequest(contentsApiUrl(repoPath), { method: "GET" });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const err = new Error(`Get file failed: ${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`);
      err.status = res.status;
      throw err;
    }
    const data = await res.json().catch(() => null);
    const type = String(data?.type ?? "");
    if (type !== "file") throw new Error("Not a file");
    const sha = String(data?.sha ?? "").trim();
    const content = String(data?.content ?? "");
    const encoding = String(data?.encoding ?? "").trim();
    return { sha, content, encoding };
  }

  async function putFileToGitHub(repoPath, contentBase64, options = {}) {
    const message = String(options.message ?? `admin upload ${repoPath}`).trim() || `admin upload ${repoPath}`;
    const sha = String(options.sha ?? "").trim();
    const payload = { message, content: String(contentBase64 ?? "") };
    if (sha) payload.sha = sha;
    const res = await githubRequest(contentsApiUrl(repoPath), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Upload failed: ${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`);
    }
    return await res.json().catch(() => null);
  }

  async function deleteFileOnGitHub(repoPath, sha, options = {}) {
    const message = String(options.message ?? `admin delete ${repoPath}`).trim() || `admin delete ${repoPath}`;
    const payload = { message, sha: String(sha ?? "") };
    const res = await githubRequest(contentsApiUrl(repoPath), {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Delete failed: ${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`);
    }
    return await res.json().catch(() => null);
  }

  async function loadEntriesForKey(key) {
    const base = baseOfKey(key);
    const node = nodeForKey(key);
    if (!node || typeof node !== "object") return [];

    if (base === "post") {
      if (!owner || !repoName) return collectEntriesFromNode(node, "post");
      try {
        const res = await githubRequest(contentsApiUrl("post"), { method: "GET" });
        if (res.ok) {
          const data = await res.json().catch(() => null);
          const items = Array.isArray(data) ? data : [];
          for (const it of items) {
            const name = String(it?.name ?? "").trim();
            const type = String(it?.type ?? "").trim();
            if (!name || type !== "file") continue;
            if (!name.toLowerCase().endsWith(".md")) continue;
            node[name] = `./post/${name}`;
          }
        }
      } catch {
        return collectEntriesFromNode(node, "post");
      }
      return collectEntriesFromNode(node, "post");
    }

    if (base === "aboutme") return collectEntriesFromNode(node, "aboutme");

    await ensureFsReadyForKey(key);
    const repoDir = repoDirForKey(key);
    return collectEntriesFromNode(node, repoDir);
  }

  async function smoothRenderForKey(key) {
    const seq = (renderSeq += 1);
    list.classList.add("switching");
    await sleep(180);
    if (seq !== renderSeq) return;
    let items = [];
    try {
      items = await loadEntriesForKey(key);
    } catch (e) {
      console.warn("[admin] load files failed", e);
      items = [];
    }
    if (seq !== renderSeq) return;
    renderListForEntries(items);
    window.requestAnimationFrame(() => {
      list.classList.remove("switching");
    });
  }

  function clearSelection() {
    selectedIds.clear();
    setActionsEnabled();
  }

  /**
   * 切换目录：先做轻量切换动画，再渲染对应文件树。
   * 目的：复用评论管理的“切页体验”，让中间容器平滑更新。
   */
  async function switchDir(nextKey) {
    currentKey = normalizeDirKey(nextKey);
    clearSelection();
    empty.textContent = loadingText;
    empty.hidden = false;
    setHint("");
    ensureSelectOption(currentKey);
    select.value = currentKey;
    await smoothRenderForKey(currentKey);
  }

  /**
   * 触发下载。
   */
  function downloadSelected() {
    void (async () => {
      if (isBusy) return;
      const ids = Array.from(selectedIds);
      if (ids.length !== 1) return;
      const it = entryByIdMap().get(ids[0]);
      if (!it || it.kind !== "file") return;
      const repoPath = String(it.repoPath ?? "").trim();
      if (!repoPath) return;

      isBusy = true;
      setActionsEnabled();
      setHint("");
      try {
        const file = await getFileFromGitHub(repoPath);
        const bytes = file.encoding === "base64" ? base64ToBytes(file.content) : base64ToBytes(file.content);
        const blob = new Blob([bytes], { type: "application/octet-stream" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = it.name || "download";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.setTimeout(() => URL.revokeObjectURL(url), 8000);
        setHint("Successful", { ttlMs: 1200 });
      } catch (e) {
        console.warn("[admin] download failed", e);
        setHint("Failed", { ttlMs: 2400 });
      } finally {
        isBusy = false;
        setActionsEnabled();
      }
    })();
  }

  /**
   * 删除选中项（带确认）。
   * 目的：复用评论管理的“confirm + 状态反馈”交互，保持一致性。
   */
  function deleteSelected() {
    void (async () => {
      if (isDeleting || isBusy) return;
      if (selectedIds.size === 0) return;

      const ok = window.confirm(`Ensure to delete ${selectedIds.size} file(s)?`);
      if (!ok) return;

      isDeleting = true;
      isBusy = true;
      setActionsEnabled();
      setHint("");
      try {
        const byId = entryByIdMap();
        const targets = Array.from(selectedIds)
          .map((id) => byId.get(id))
          .filter((x) => x && x.kind === "file");
        if (targets.length === 0) return;

        for (const it of targets) {
          const repoPath = String(it.repoPath ?? "").trim();
          if (!repoPath) continue;
          if (!canWriteFileAtKey(currentKey, it.name)) throw new Error("Permission denied");
          const meta = await getFileFromGitHub(repoPath);
          if (!meta.sha) throw new Error("Missing sha");
          await deleteFileOnGitHub(repoPath, meta.sha);

          const base = baseOfKey(currentKey);
          if (base === "post" || base === "aboutme") {
            const node = nodeForKey(currentKey);
            if (node && typeof node === "object") delete node[it.name];
          } else {
            const node = nodeForKey(currentKey);
            if (node && typeof node === "object") delete node[it.name];
          }
        }

        clearSelection();
        await smoothRenderForKey(currentKey);
        setHint("Successful", { ttlMs: 1200 });
      } catch (e) {
        console.warn("[admin] delete files failed", e);
        setHint("Failed", { ttlMs: 2400 });
      } finally {
        isDeleting = false;
        isBusy = false;
        setActionsEnabled();
      }
    })();
  }

  /**
   * 上传（根据当前目录限制文件类型）。
   *
   * 交互：
   * - 点击 upload 触发文件选择
   * - 选择后执行 PUT 写入 GitHub
   */
  function uploadInCurrentDir() {
    uploadInput.value = "";
    const base = baseOfKey(currentKey);
    uploadInput.accept = base === "image" ? "" : ".md";
    uploadInput.click();
  }

  uploadInput.addEventListener("change", () => {
    void (async () => {
      const f = uploadInput.files && uploadInput.files[0];
      uploadInput.value = "";
      if (!f) return;
      if (isBusy) return;
      if (!canWriteFileAtKey(currentKey, f.name)) {
        setHint("Failed", { ttlMs: 2400 });
        return;
      }
      const repoPath = fileRepoPathForUpload(currentKey, f.name);
      if (!repoPath) {
        setHint("Failed", { ttlMs: 2400 });
        return;
      }

      isBusy = true;
      setActionsEnabled();
      setHint("");
      try {
        let sha = "";
        try {
          const meta = await getFileFromGitHub(repoPath);
          sha = meta.sha;
        } catch (e) {
          const status = Number(e?.status);
          if (status !== 404) throw e;
          sha = "";
        }

        const buf = await f.arrayBuffer();
        const b64 = bytesToBase64(new Uint8Array(buf));
        await putFileToGitHub(repoPath, b64, { sha });

        const node = nodeForKey(currentKey);
        if (node && typeof node === "object") node[f.name] = `./${repoPath}`;

        await smoothRenderForKey(currentKey);
        setHint("Successful", { ttlMs: 1600 });
      } catch (e) {
        console.warn("[admin] upload failed", e);
        setHint("Failed", { ttlMs: 2400 });
      } finally {
        isBusy = false;
        setActionsEnabled();
      }
    })();
  });

  uploadBtn.addEventListener("click", () => {
    uploadInCurrentDir();
  });
  deleteBtn.addEventListener("click", () => {
    deleteSelected();
  });
  downloadBtn.addEventListener("click", () => {
    downloadSelected();
  });

  select.addEventListener("change", () => {
    void switchDir(select.value);
  });

  setActionsEnabled();
  ensureSelectOption(currentKey);
  select.value = currentKey;
  if (!owner || !repoName) {
    empty.textContent = "GitHub repo not configured.";
    empty.hidden = false;
  }
  void switchDir(currentKey);
  return page;
}

/**
 * 渲染管理界面。
 * @param {HTMLElement} root
 */
export function renderAdmin(root) {
  if (!(root instanceof HTMLElement)) return;

  /**
   * 扩展管理容器的布局形态。
   * 目的：让壳层顶栏（tab bar）可以贴合 panel 边缘，而不是被 padding 挤压。
   */
  root.classList.add("adminViewportFull");

  const shell = document.createElement("div");
  shell.className = "adminShell";

  const { bar, tabs } = createBrowserBar();
  const body = document.createElement("div");
  body.className = "adminBodyViewport";

  const entries = collectMarkdownEntries(FILE_SYSTEM);
  const views = new Map([
    ["comments", () => createCommentsManagementView(entries)],
    ["files", () => createFilesManagementView()],
  ]);

  const tabDefs = [
    { key: "comments", title: "Comment Management" },
    { key: "files", title: "File Management" },
  ];

  let activeKey = "comments";
  const tabEls = new Map();

  function setActiveTab(nextKey) {
    activeKey = nextKey;
    for (const [k, el] of tabEls.entries()) el.classList.toggle("adminTabActive", k === activeKey);
    const factory = views.get(activeKey);
    body.replaceChildren(factory ? factory() : document.createTextNode("Working On It"));
  }

  for (const t of tabDefs) {
    const el = document.createElement("div");
    el.className = "adminTab";
    el.setAttribute("role", "tab");
    el.setAttribute("tabindex", "0");
    el.textContent = t.title;
    el.addEventListener("click", () => setActiveTab(t.key));
    el.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      e.preventDefault();
      setActiveTab(t.key);
    });
    tabs.appendChild(el);
    tabEls.set(t.key, el);
  }

  shell.appendChild(bar);
  shell.appendChild(body);
  root.replaceChildren(shell);

  setActiveTab(activeKey);
}
