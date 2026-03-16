import { THEME_STORAGE_KEY } from "./constants.js";

/**
 * 主题模块：负责读取/设置站点主题（dark/light），并与样式表和本地存储联动。
 * 功能：
 * - 在 <html data-theme="..."> 上记录当前主题，用于 CSS 选择器分支
 * - 动态切换 <link id="themeStylesheet"> 的 href，加载对应 CSS 文件
 * - 可选持久化到 localStorage，刷新后保持用户偏好
 * 目的：在不引入框架的前提下实现可靠的主题切换与持久化。
 */

/**
 * 读取当前主题。
 * 功能：从 documentElement.dataset.theme 推断当前主题。
 * 目的：供终端命令 theme 在不传参时展示当前状态。
 */
export function getTheme() {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

/**
 * 设置主题。
 * 功能：
 * - 规范化输入，仅允许 "dark" / "light"
 * - 更新 DOM 上的 data-theme
 * - 切换对应的 CSS 文件
 * - 可选写入 localStorage
 * 目的：把“主题切换”封装成一个纯函数入口，避免在多个地方重复写 DOM 操作。
 */
export function setTheme(nextTheme, options = {}) {
  const { persist = true } = options;
  const theme = nextTheme === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = theme;

  const link = document.getElementById("themeStylesheet");
  if (link) link.href = theme === "light" ? "./styles.light.css" : "./styles.css";

  if (persist) window.localStorage.setItem(THEME_STORAGE_KEY, theme);
}
