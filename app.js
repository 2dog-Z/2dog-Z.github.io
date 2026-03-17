import { DEFAULT_PAGE, FILE_SYSTEM, THEME_STORAGE_KEY } from "./modules/constants.js";
import { setupComments } from "./modules/comments.js";
import { createContentRenderer } from "./modules/contentRenderer.js";
import { createTerminal } from "./modules/terminal.js";
import { getTheme, setTheme } from "./modules/theme.js";

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
   * 创建内容渲染器并渲染默认页面。
   * 目的：首屏内容区不为空，且后续 cat/cd 可以复用同一个渲染器。
   */
  const renderer = createContentRenderer({
    fileSystem: FILE_SYSTEM,
    onPathRendered: (p) => window.__comments?.setPage?.(p),
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
  document.addEventListener("click", (e) => {
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
});
