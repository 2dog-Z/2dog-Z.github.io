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
  sameCommentsForAdmin,
  syncCommentsForAdmin,
} from "../modules/comments.js";
import { sleep } from "../modules/utils.js";

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
 * 文件管理页面（静态占位）。
 * 目的：为后续接入文件系统/上传/删除等功能预留入口。
 */
function createFilesManagementView() {
  const page = document.createElement("div");
  page.className = "adminPage adminFilesPage";
  const box = document.createElement("div");
  box.className = "adminWorking";
  box.textContent = "Working On It";
  page.appendChild(box);
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
