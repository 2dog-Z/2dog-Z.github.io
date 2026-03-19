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
import { fetchGithubPostMdList, githubRequest, sleep } from "../modules/utils.js";

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

  const newMdBtn = document.createElement("code");
  newMdBtn.className = "cmdButton adminNewMdBtn";
  newMdBtn.textContent = "new md";
  actions.appendChild(newMdBtn);

  const editBtn = document.createElement("code");
  editBtn.className = "cmdButton adminEditBtn";
  editBtn.textContent = "edit";
  actions.appendChild(editBtn); 

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

  const editor = document.createElement("div");
  editor.className = "adminEditor";
  editor.hidden = true;

  const editorHeader = document.createElement("div");
  editorHeader.className = "adminEditorHeader";

  const editorTitleInput = document.createElement("input");
  editorTitleInput.className = "adminEditorTitleInput";
  editorTitleInput.type = "text";
  editorTitleInput.value = "";
  editorTitleInput.placeholder = "filename";
  editorTitleInput.setAttribute("aria-label", "Filename");

  const editorActions = document.createElement("div");
  editorActions.className = "adminEditorActions";

  const editorSaveBtn = document.createElement("code");
  editorSaveBtn.className = "cmdButton";
  editorSaveBtn.textContent = "save";
  editorActions.appendChild(editorSaveBtn);

  const editorCloseBtn = document.createElement("code");
  editorCloseBtn.className = "cmdButton";
  editorCloseBtn.textContent = "close";
  editorActions.appendChild(editorCloseBtn);

  editorHeader.appendChild(editorTitleInput);
  editorHeader.appendChild(editorActions);

  const editorTextarea = document.createElement("textarea");
  editorTextarea.className = "adminEditorTextarea";
  editorTextarea.setAttribute("aria-label", "File Editor");
  editorTextarea.spellcheck = false;

  editor.appendChild(editorHeader);
  editor.appendChild(editorTextarea);
  center.appendChild(editor);

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
  let isEditing = false;
  let hintTimer = 0;
  let currentEntries = [];
  let currentEditing = null;

  /**
   * 设置某个动作按钮的可用性。
   * 功能：通过 pointerEvents/opacity 统一控制交互态。
   * 目的：避免各处重复写禁用样式逻辑，保持交互反馈一致。
   */
  function setActionEnabled(el, enabled) {
    el.style.pointerEvents = enabled ? "auto" : "none";
    el.style.opacity = enabled ? "1" : "0.6";
  }

  /**
   * 根据“当前目录 + 选中项 + 忙碌态 + 权限”刷新按钮状态。
   *
   * 规则：
   * - root 的非三大入口子目录（root/...）：upload/download/delete 全禁用
   * - download：允许单选文件或多选文件（多选时打包为 zip）
   * - edit：仅允许单选可编辑文本文件
   * - delete：仅允许选中的全是文件，且全部满足当前目录的写入权限
   *
   * 目的：让 UI 的可用性与后端权限保持一致，减少“点了才报错”的挫败感。
   */
  function setActionsEnabled() {
    if (isRestrictedRootSubdir(currentKey)) {
      setActionEnabled(uploadBtn, false);
      setActionEnabled(newMdBtn, false);
      setActionEnabled(editBtn, false);
      setActionEnabled(downloadBtn, false);
      setActionEnabled(deleteBtn, false);
      return;
    }

    const byId = new Map(currentEntries.map((x) => [x.id, x]));
    const selected = Array.from(selectedIds).map((id) => byId.get(id)).filter(Boolean);
    const selectedFiles = selected.filter((x) => x.kind === "file");
    const base = baseOfKey(currentKey);
    const allow = !isBusy && !isEditing;
    const canNewMd = allow && (base === "root" || base === "post" || base === "aboutme");
    const canDownload = allow && selected.length > 0 && selectedFiles.length === selected.length;
    const canEdit =
      allow &&
      selected.length === 1 &&
      selectedFiles.length === 1 &&
      isTextEditableFilename(selectedFiles[0].name) &&
      canWriteFileAtKey(currentKey, selectedFiles[0].name);
    const canDelete =
      allow &&
      !isDeleting &&
      selected.length > 0 &&
      selectedFiles.length === selected.length &&
      selectedFiles.every((x) => canWriteFileAtKey(currentKey, x.name));

    setActionEnabled(uploadBtn, allow);
    setActionEnabled(newMdBtn, canNewMd);
    setActionEnabled(editBtn, canEdit);
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

  /**
   * 规范化目录 key（管理端内部路径）。
   *
   * 输入示例：
   * - "post"、"aboutme"、"image"、"root"
   * - "root/templates"
   * - "image/icons"
   *
   * 输出：保证 base 只会落在 root/aboutme/post/image 四类之一。
   *
   * 目的：让 UI 状态与目录解析在各种输入（手动拼接/下拉切换/点击目录）下都稳定一致。
   */
  function normalizeDirKey(key) {
    const k = String(key ?? "").trim();
    if (!k) return "root";
    if (k === "root" || k === "aboutme" || k === "post" || k === "image") return k;
    const parts = k.split("/").map((x) => x.trim()).filter(Boolean);
    const base = parts[0];
    if (base !== "root" && base !== "aboutme" && base !== "post" && base !== "image") return "root";
    return [base, ...parts.slice(1)].join("/");
  }

  /**
   * 生成目录 key 在下拉框里的展示文案。
   * 规则：取路径最后一段作为 label（root 则显示 root）。
   * 目的：目录层级较深时，下拉框仍保持简洁可读。
   */
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

  /**
   * 把仓库路径拆段并逐段 encodeURIComponent。
   * 目的：支持包含空格/中文等字符的文件/目录名，避免拼 URL 时路径被误解析。
   */
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

  /**
   * 构建 GitHub Contents API 的 URL（不经由 Worker）。
   * 说明：实际请求会再由 githubRequest() 重写到 Worker（/gh 前缀）。
   * 目的：让业务逻辑只关心 repoPath，并统一处理 owner/repo 的拼装。
   */
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

  /**
   * 获取目录 key 的顶层分类（root/aboutme/post/image）。
   * 目的：把“UI 目录层级”映射到不同的权限策略与真实仓库路径。
   */
  function baseOfKey(key) {
    const k = normalizeDirKey(key);
    const parts = k.split("/").filter(Boolean);
    return parts[0] || "root";
  }

  /**
   * 获取目录 key 在顶层分类之后的剩余路径段。
   * 例：root/templates -> ["templates"]，image/icons -> ["icons"]。
   * 目的：统一用于“构建仓库路径/定位管理端缓存树 node/生成下一层 key”。
   */
  function restPartsOfKey(key) {
    const k = normalizeDirKey(key);
    const parts = k.split("/").filter(Boolean);
    return parts.slice(1);
  }

  /**
   * root 的子目录限制（按需求：非 post/aboutme/image 三个入口的 root/... 禁止上传/下载/删除）。
   * 目的：避免管理端误操作站点根目录下其它静态资源/模板等非 markdown 内容。
   */
  function isRestrictedRootSubdir(key) {
    const base = baseOfKey(key);
    const rest = restPartsOfKey(key);
    return base === "root" && rest.length > 0;
  }

  /**
   * 判断在某个目录下，文件条目的“复选框”是否允许交互。
   *
   * 规则（按需求）：
   * - root 顶层：只有 *.md 可勾选，其它文件（html/css/js 等）复选框不可用
   * - root 下级目录：除了 aboutme/image/post 三类目录外，其它目录内的文件复选框全部不可用
   *
   * 目的：避免在管理端误选/误操作站点根目录下的静态资源与非托管目录内容。
   */
  function canSelectFileAtKey(dirKey, filename) {
    const base = baseOfKey(dirKey);
    const rest = restPartsOfKey(dirKey);
    const name = String(filename ?? "").trim();
    const isMd = name.toLowerCase().endsWith(".md");

    if (base !== "root") return true;
    if (rest.length === 0) return isMd;

    const top = rest[0] || "";
    if (top === "aboutme" || top === "image" || top === "post") return top === "image" ? true : isMd;
    return false;
  }

  /**
   * 将“管理端目录 key”映射为“仓库真实目录路径”。
   *
   * 映射：
   * - root[/x/y]   -> "" / "x/y"
   * - image[/x/y]  -> "image" / "image/x/y"
   * - post         -> "post"
   * - aboutme      -> "aboutme"
   *
   * 目的：把 UI 的目录体系与仓库 Contents API 路径对齐。
   */
  function repoDirForKey(key) {
    const base = baseOfKey(key);
    const rest = restPartsOfKey(key);
    if (base === "root") return rest.join("/");
    if (base === "image") return ["image", ...rest].filter(Boolean).join("/");
    if (base === "post") return "post";
    if (base === "aboutme") return "aboutme";
    return "";
  }

  /**
   * 定位当前目录对应的“虚拟文件系统节点”。
   *
   * 策略：
   * - aboutme/post：复用主站 FILE_SYSTEM 的目录对象
   * - root/image：使用管理端专用缓存树（ADMIN_ROOT_FS / ADMIN_IMAGE_FS），并在进入子目录时按需补齐节点
   *
   * 目的：让 UI 渲染与上传/删除能在一个统一的数据结构上工作（目录=object，文件=string）。
   */
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
      check.disabled = !canSelectFileAtKey(currentKey, it.name);
      check.setAttribute("aria-label", "Select File");
      check.addEventListener("change", () => {
        if (check.disabled) return;
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

  /**
   * 从“点击目录项”的条目推导下一个目录 key。
   *
   * 特殊规则：
   * - 在 root 顶层点击 post/aboutme/image：直接跳转到对应文件树（不进入 root/post 这类中间态）
   *
   * 目的：匹配管理端的 VFS 设计（root 作为站点根入口，三大目录是独立文件树）。
   */
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

  /**
   * 拉取 GitHub Contents API 的目录列表并写入到某个 VFS 节点。
   *
   * 注意：
   * - 该函数只负责“索引目录”（写入子目录名/文件名），不拉取具体文件内容
   * - 配合 loadedNodes 做轻量缓存：默认同一 node 只加载一次；必要时可 force 重新拉取
   *
   * 目的：实现 root/image 的“按需展开”文件树。
   */
  async function loadDirIntoFsNode(dirRepoPath, node, options = {}) {
    if (!owner || !repoName) throw new Error("GitHub repo not configured");
    if (!node || typeof node !== "object") return;
    const force = Boolean(options.force);
    if (!force && loadedNodes.has(node)) return;

    const res = await githubRequest(contentsApiUrl(dirRepoPath), { method: "GET", cacheBust: true });
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

  /**
   * 确保某个目录 key 对应的 VFS 节点已完成索引。
   * 说明：仅 root/image 需要网络索引；aboutme/post 的列表由其它逻辑生成。
   */
  async function ensureFsReadyForKey(key) {
    const base = baseOfKey(key);
    const repoDir = repoDirForKey(key);
    const node = nodeForKey(key);
    if (!node || typeof node !== "object") return;

    if (base === "root") return await loadDirIntoFsNode(repoDir, node);
    if (base === "image") return await loadDirIntoFsNode(repoDir, node, { force: true });
    return;
  }

  /**
   * 将当前渲染条目数组转换为 {id -> entry} 的 map。
   * 目的：统一在下载/删除等动作中通过 selectedIds 快速定位条目元数据。
   */
  function entryByIdMap() {
    return new Map(currentEntries.map((x) => [x.id, x]));
  }

  /**
   * 判断在某个目录下是否允许写入指定文件名（上传/覆盖/删除）。
   *
   * 权限：
   * - root/aboutme/post：仅允许 *.md
   * - image：允许任意文件
   *
   * 目的：在 UI 与实际请求两层都做硬约束，避免误操作静态资源。
   */
  function canWriteFileAtKey(dirKey, filename) {
    const base = baseOfKey(dirKey);
    const name = String(filename ?? "").trim();
    const isMd = name.toLowerCase().endsWith(".md");
    if (!name) return false;
    if (base === "image") return true;
    if (base === "root" || base === "post" || base === "aboutme") return isMd;
    return false;
  }

  /**
   * 计算“上传文件”最终应写入的仓库路径。
   * 目的：把管理端目录 key（含子目录）映射到 Contents API 需要的 repoPath。
   */
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

  /**
   * 将字节数组编码为 Base64。
   * 目的：用于 GitHub Contents API 的 PUT（content 必须是 base64）。
   */
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

  /**
   * 将 Base64 解码为字节数组。
   * 目的：用于 GitHub Contents API GET 文件内容（content=base64）后的下载。
   */
  function base64ToBytes(b64) {
    const raw = String(b64 ?? "").replace(/\s+/g, "");
    const binary = atob(raw);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
    return out;
  }

  /**
   * 判断某个文件名是否适合使用“纯文本编辑器”打开。
   * 目的：避免在 image 目录误把二进制文件当文本编辑，造成内容破坏。
   */
  function isTextEditableFilename(filename) {
    const name = String(filename ?? "").trim().toLowerCase();
    if (!name) return false;
    return (
      name.endsWith(".md") ||
      name.endsWith(".txt") ||
      name.endsWith(".html") ||
      name.endsWith(".css") ||
      name.endsWith(".js") ||
      name.endsWith(".json") ||
      name.endsWith(".yml") ||
      name.endsWith(".yaml")
    );
  }

  function downloadBlob(blob, filename) {
    const b = blob instanceof Blob ? blob : new Blob([blob], { type: "application/octet-stream" });
    const url = URL.createObjectURL(b);
    const a = document.createElement("a");
    a.href = url;
    a.download = String(filename ?? "").trim() || "download";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.setTimeout(() => URL.revokeObjectURL(url), 8000);
  }

  function bytesConcat(chunks) {
    const parts = Array.isArray(chunks) ? chunks.filter(Boolean) : [];
    const total = parts.reduce((sum, x) => sum + (x?.byteLength ?? 0), 0);
    const out = new Uint8Array(total);
    let off = 0;
    for (const p of parts) {
      out.set(p, off);
      off += p.byteLength;
    }
    return out;
  }

  function u16le(n) {
    const buf = new ArrayBuffer(2);
    new DataView(buf).setUint16(0, n >>> 0, true);
    return new Uint8Array(buf);
  }

  function u32le(n) {
    const buf = new ArrayBuffer(4);
    new DataView(buf).setUint32(0, n >>> 0, true);
    return new Uint8Array(buf);
  }

  function crc32(bytes) {
    const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    let c = 0xffffffff;
    for (let i = 0; i < data.length; i += 1) {
      c ^= data[i];
      for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  /**
   * 构建一个“仅存储（store）不压缩”的 zip 文件字节流。
   * 目的：让多选下载在浏览器侧一次性打包，避免引入第三方库。
   */
  function buildZipBytes(files) {
    const encoder = new TextEncoder();
    const localParts = [];
    const centralParts = [];
    let localOffset = 0;

    for (const f of Array.isArray(files) ? files : []) {
      const name = String(f?.name ?? "").replaceAll("\\", "/");
      const nameBytes = encoder.encode(name);
      const data = f?.bytes instanceof Uint8Array ? f.bytes : new Uint8Array(f?.bytes ?? []);
      const size = data.byteLength >>> 0;
      const crc = crc32(data);

      const localHeader = bytesConcat([
        u32le(0x04034b50),
        u16le(20),
        u16le(0),
        u16le(0),
        u16le(0),
        u16le(0),
        u32le(crc),
        u32le(size),
        u32le(size),
        u16le(nameBytes.byteLength),
        u16le(0),
        nameBytes,
      ]);
      localParts.push(localHeader, data);

      const centralHeader = bytesConcat([
        u32le(0x02014b50),
        u16le(20),
        u16le(20),
        u16le(0),
        u16le(0),
        u16le(0),
        u16le(0),
        u32le(crc),
        u32le(size),
        u32le(size),
        u16le(nameBytes.byteLength),
        u16le(0),
        u16le(0),
        u16le(0),
        u16le(0),
        u32le(0),
        u32le(localOffset),
        nameBytes,
      ]);
      centralParts.push(centralHeader);

      localOffset += localHeader.byteLength + data.byteLength;
    }

    const centralBytes = bytesConcat(centralParts);
    const end = bytesConcat([
      u32le(0x06054b50),
      u16le(0),
      u16le(0),
      u16le(centralParts.length),
      u16le(centralParts.length),
      u32le(centralBytes.byteLength),
      u32le(localOffset),
      u16le(0),
    ]);

    return bytesConcat([...localParts, centralBytes, end]);
  }

  /**
   * 读取单个文件的 GitHub 内容与 sha。
   * 目的：
   * - 下载：读取 base64 内容
   * - 删除/覆盖：先拿到 sha，避免 DELETE/PUT 失败
   */
  async function getFileFromGitHub(repoPath) {
    const res = await githubRequest(contentsApiUrl(repoPath), { method: "GET", cacheBust: true });
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

  /**
   * 读取文本文件内容（UTF-8）与 sha。
   *
   * 说明：
   * - 优先走 Contents API 的 JSON（content=base64）以同时拿到 sha
   * - 某些场景下 GitHub 不返回 content（或为空），则降级用 Accept: vnd.github.raw 拉取原始内容
   *
   * 目的：让编辑器稳定加载 aboutme/post 等目录下的 Markdown 文件内容。
   */
  async function getTextFileFromGitHub(repoPath) {
    const meta = await getFileFromGitHub(repoPath);
    if (meta.encoding === "base64" && meta.content) {
      const bytes = base64ToBytes(meta.content);
      const text = new TextDecoder().decode(bytes);
      return { sha: meta.sha, text };
    }

    const headers = new Headers();
    headers.set("Accept", "application/vnd.github.raw");
    const res = await githubRequest(contentsApiUrl(repoPath), { method: "GET", headers, cacheBust: true });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const err = new Error(`Get file raw failed: ${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`);
      err.status = res.status;
      throw err;
    }
    const buf = await res.arrayBuffer();
    const text = new TextDecoder().decode(new Uint8Array(buf));
    return { sha: meta.sha, text };
  }

  /**
   * 上传/覆盖文件（GitHub Contents API PUT）。
   * 说明：当 sha 存在时表示覆盖，否则创建新文件。
   */
  async function putFileToGitHub(repoPath, contentBase64, options = {}) {
    const message = String(options.message ?? `admin upload ${repoPath}`).trim() || `admin upload ${repoPath}`;
    const sha = String(options.sha ?? "").trim();
    const payload = { message, content: String(contentBase64 ?? "") };
    if (sha) payload.sha = sha;
    const res = await githubRequest(contentsApiUrl(repoPath), {
      method: "PUT",
      cacheBust: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Upload failed: ${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`);
    }
    return await res.json().catch(() => null);
  }

  /**
   * 删除文件（GitHub Contents API DELETE）。
   * 注意：必须携带 sha（由 getFileFromGitHub() 获取），否则会被 GitHub 拒绝。
   */
  async function deleteFileOnGitHub(repoPath, sha, options = {}) {
    const message = String(options.message ?? `admin delete ${repoPath}`).trim() || `admin delete ${repoPath}`;
    const payload = { message, sha: String(sha ?? "") };
    const res = await githubRequest(contentsApiUrl(repoPath), {
      method: "DELETE",
      cacheBust: true,
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
      /**
       * post 目录索引策略（管理端）：
       * - 只依赖一次 GET /contents/post 获取当前文件列表；
       * - 不做“增量合并/本地缓存”逻辑，避免与主站入口的自动发现逻辑重复。
       *
       * 目的：
       * - 后台文件管理的列表应当尽量“以仓库当前状态为准”
       * - 保持实现简单，降低重复维护成本
       */
      if (!owner || !repoName) return collectEntriesFromNode(node, "post");
      const res = await fetchGithubPostMdList({ owner, repo: repoName });
      const names = Array.isArray(res?.names) ? res.names : [];
      for (const k of Object.keys(node)) delete node[k];
      for (const name of names) node[name] = `./post/${name}`;

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
    if (isEditing) closeEditor();
    currentKey = normalizeDirKey(nextKey);
    clearSelection();
    empty.textContent = loadingText;
    empty.hidden = false;
    setHint("");
    ensureSelectOption(currentKey);
    select.value = currentKey;
    await smoothRenderForKey(currentKey);
  }

  function closeEditor() {
    editor.hidden = true;
    editorTextarea.value = "";
    editorTitleInput.value = "";
    currentEditing = null;
    isEditing = false;
    setActionsEnabled();
  }

  /**
   * 生成“新建 Markdown”默认文件名。
   *
   * 规则：
   * - 前缀使用当天日期（YYYY-MM-DD），便于按时间排序
   * - 后缀固定为 "New File.md"，给用户一个可直接替换的占位
   */
  function defaultNewMdFilename() {
    const date = new Date().toISOString().slice(0, 10);
    return `${date}-New-File.md`;
  }

  /**
   * 生成“新建 Markdown”的默认内容（自带 front matter）。
   *
   * 约定：
   * - 保持与仓库现有文章一致：front matter 仅包含 title/date
   * - 预留一个一级标题，方便用户立即开始写正文
   */
  function defaultNewMdText() {
    const date = new Date().toISOString().slice(0, 10);
    const title = "New File";
    return `---\ntitle: ${title}\ndate: ${date}\n---\n\n# ${title}\n\n`;
  }

  /**
   * 打开“新建 Markdown”编辑器。
   *
   * 行为：
   * - 默认填入文件名：当天日期 + New File
   * - 默认填入内容：包含 front matter 的模板
   * - 保存后会写入当前目录（与 upload 一致遵循目录权限）
   */
  function newMdInCurrentDir() {
    void (async () => {
      if (isRestrictedRootSubdir(currentKey)) return;
      if (isBusy || isEditing) return;
      const base = baseOfKey(currentKey);
      if (base !== "root" && base !== "post" && base !== "aboutme") return;

      editorTitleInput.value = defaultNewMdFilename();
      editorTextarea.value = defaultNewMdText();
      currentEditing = { mode: "create", dirKey: currentKey };
      editor.hidden = false;
      isEditing = true;
      setActionsEnabled();
      setHint("");
      window.setTimeout(() => editorTitleInput.focus(), 0);
    })();
  }

  /**
   * 打开轻量文本编辑器（仅支持可编辑的纯文本文件）。
   *
   * 流程：
   * - GET 拉取文件内容，解码为 UTF-8 文本
   * - 将内容写入 textarea
   */
  function editSelected() {
    void (async () => {
      if (isRestrictedRootSubdir(currentKey)) return;
      if (isBusy || isEditing) return;
      const ids = Array.from(selectedIds);
      if (ids.length !== 1) return;
      const it = entryByIdMap().get(ids[0]);
      if (!it || it.kind !== "file") return;
      if (!isTextEditableFilename(it.name)) return;
      if (!canWriteFileAtKey(currentKey, it.name)) return;
      const repoPath = String(it.repoPath ?? "").trim();
      if (!repoPath) return;

      isBusy = true;
      setActionsEnabled();
      setHint("");
      try {
        const file = await getTextFileFromGitHub(repoPath);
        currentEditing = { mode: "edit", originalRepoPath: repoPath, originalName: it.name, originalSha: file.sha };
        const text = file.text;
        editorTextarea.value = text;
        editorTitleInput.value = it.name || "";
        editor.hidden = false;
        isEditing = true;
        setActionsEnabled();
        window.setTimeout(() => editorTextarea.focus(), 0);
      } catch (e) {
        console.warn("[admin] edit load failed", e);
        closeEditor();
        setHint("Failed", { ttlMs: 2400 });
      } finally {
        isBusy = false;
        setActionsEnabled();
      }
    })();
  }

  /**
   * 保存编辑结果。
   *
   * 规则：
   * - 文件名未变：直接 PUT 覆盖更新旧文件
   * - 文件名改变：先以新文件名 PUT 上传，再 DELETE 旧文件
   */
  function saveEditing() {
    void (async () => {
      if (!isEditing || !currentEditing) return;
      if (isBusy) return;
      const mode = String(currentEditing.mode ?? "edit");
      const nextName = String(editorTitleInput.value ?? "").trim();
      if (!nextName) return;
      if (nextName.includes("/") || nextName.includes("\\")) return;
      if (!isTextEditableFilename(nextName)) return;
      if (!canWriteFileAtKey(currentKey, nextName)) return;

      const text = String(editorTextarea.value ?? "");

      isBusy = true;
      setActionsEnabled();
      setHint("");
      try {
        const bytes = new TextEncoder().encode(text);
        const b64 = bytesToBase64(bytes);
        if (mode === "create") {
          if (isRestrictedRootSubdir(currentKey)) return;
          const repoPath = fileRepoPathForUpload(currentKey, nextName);
          if (!repoPath) throw new Error("Invalid filename");

          let sha = "";
          try {
            const meta = await getFileFromGitHub(repoPath);
            sha = String(meta?.sha ?? "").trim();
          } catch (e) {
            const status = Number(e?.status);
            if (status !== 404) throw e;
            sha = "";
          }

          const res = await putFileToGitHub(repoPath, b64, { sha, message: `admin create ${repoPath}` });
          const uploadedSha = String(res?.content?.sha ?? "").trim();

          const node = nodeForKey(currentKey);
          if (node && typeof node === "object") node[nextName] = `./${repoPath}`;

          currentEditing = { mode: "edit", originalRepoPath: repoPath, originalName: nextName, originalSha: uploadedSha || sha };
          setHint("Successful", { ttlMs: 1400 });
          await smoothRenderForKey(currentKey);
          return;
        }

        const oldRepoPath = String(currentEditing.originalRepoPath ?? "").trim();
        const oldName = String(currentEditing.originalName ?? "").trim();
        const oldSha = String(currentEditing.originalSha ?? "").trim();
        if (!oldRepoPath) return;
        if (!oldSha) return;
        if (nextName === oldName) {
          const res = await putFileToGitHub(oldRepoPath, b64, { sha: oldSha, message: `admin edit ${oldRepoPath}` });
          const nextSha = String(res?.content?.sha ?? "").trim();
          if (nextSha) currentEditing.originalSha = nextSha;
          setHint("Successful", { ttlMs: 1400 });
          await smoothRenderForKey(currentKey);
          return;
        }

        const nextRepoPath = fileRepoPathForUpload(currentKey, nextName);
        if (!nextRepoPath) throw new Error("Invalid filename");

        let nextSha = "";
        try {
          const meta = await getFileFromGitHub(nextRepoPath);
          nextSha = String(meta?.sha ?? "").trim();
        } catch (e) {
          const status = Number(e?.status);
          if (status !== 404) throw e;
          nextSha = "";
        }

        const res = await putFileToGitHub(nextRepoPath, b64, { sha: nextSha, message: `admin rename ${oldRepoPath} -> ${nextRepoPath}` });
        const uploadedSha = String(res?.content?.sha ?? "").trim();
        await deleteFileOnGitHub(oldRepoPath, oldSha, { message: `admin delete ${oldRepoPath}` });

        const node = nodeForKey(currentKey);
        if (node && typeof node === "object") {
          if (oldName) delete node[oldName];
          node[nextName] = `./${nextRepoPath}`;
        }

        currentEditing.originalName = nextName;
        currentEditing.originalRepoPath = nextRepoPath;
        if (uploadedSha) currentEditing.originalSha = uploadedSha;
        setHint("Successful", { ttlMs: 1400 });
        await smoothRenderForKey(currentKey);
      } catch (e) {
        console.warn("[admin] edit save failed", e);
        setHint("Failed", { ttlMs: 2400 });
      } finally {
        isBusy = false;
        setActionsEnabled();
      }
    })();
  }

  /**
   * 触发下载。
   */
  function downloadSelected() {
    void (async () => {
      if (isRestrictedRootSubdir(currentKey)) return;
      if (isBusy) return;
      const ids = Array.from(selectedIds);
      if (ids.length === 0) return;
      const byId = entryByIdMap();
      const items = ids
        .map((id) => byId.get(id))
        .filter((x) => x && x.kind === "file");
      if (items.length === 0) return;

      isBusy = true;
      setActionsEnabled();
      setHint("");
      try {
        if (items.length === 1) {
          const it = items[0];
          const repoPath = String(it.repoPath ?? "").trim();
          if (!repoPath) return;
          const file = await getFileFromGitHub(repoPath);
          const bytes = file.encoding === "base64" ? base64ToBytes(file.content) : base64ToBytes(file.content);
          downloadBlob(new Blob([bytes], { type: "application/octet-stream" }), it.name || "download");
          setHint("Successful", { ttlMs: 1200 });
          return;
        }

        const files = [];
        for (const it of items) {
          const repoPath = String(it.repoPath ?? "").trim();
          if (!repoPath) continue;
          const file = await getFileFromGitHub(repoPath);
          const bytes = file.encoding === "base64" ? base64ToBytes(file.content) : base64ToBytes(file.content);
          files.push({ name: it.name || "file", bytes });
        }
        if (files.length === 0) return;

        const label = selectLabelForKey(currentKey) || "download";
        const date = new Date().toISOString().slice(0, 10);
        const zipName = `${label}-${date}.zip`;
        const zipBytes = buildZipBytes(files);
        downloadBlob(new Blob([zipBytes], { type: "application/zip" }), zipName);
        setHint(`Successful (${files.length})`, { ttlMs: 1400 });
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
      if (isRestrictedRootSubdir(currentKey)) return;
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
    if (isRestrictedRootSubdir(currentKey)) return;
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
  newMdBtn.addEventListener("click", () => {
    newMdInCurrentDir();
  });
  editBtn.addEventListener("click", () => {
    editSelected();
  });
  deleteBtn.addEventListener("click", () => {
    deleteSelected();
  });
  downloadBtn.addEventListener("click", () => {
    downloadSelected();
  });

  editorCloseBtn.addEventListener("click", () => {
    closeEditor();
  });
  editorSaveBtn.addEventListener("click", () => {
    saveEditing();
  });
  editorTitleInput.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) {
      e.preventDefault();
      saveEditing();
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      closeEditor();
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      editorTextarea.focus();
    }
  });
  editorTextarea.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) {
      e.preventDefault();
      saveEditing();
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      closeEditor();
    }
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
