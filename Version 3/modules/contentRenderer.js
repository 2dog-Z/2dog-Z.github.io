import { sleep } from "./utils.js";

/**
 * 内容渲染模块：负责把某个 HTML 页面加载到左侧内容区。
 * 功能：
 * - 通过 fetch 加载目标页面 HTML
 * - 提取页面内的 <h1> 用于更新左上角标题
 * - 将其余 body 内容注入到内容容器
 * 目的：
 * - 让站点保持“单页体验”（不整页跳转），但内容仍然来自静态 HTML 文件
 * - 与终端的 cat/cd 联动，实现“在终端打开文章”的交互
 */
export function createContentRenderer() {
  const titleEl = document.getElementById("contentTitle");
  const viewportEl = document.getElementById("contentViewport");
  const scrollEl = viewportEl?.parentElement;

  /**
   * 渲染指定路径的 HTML 内容到内容区。
   * @param {string} path - 相对路径（例如 "./post/index.html"）
   * @returns {Promise<boolean>} 是否渲染成功（用于终端反馈 opened/failed）
   *
   * 设计要点：
   * - 加入轻微延时与 switching class，配合 CSS 做内容切换动画
   * - 解析为 DOM 后再插入，便于提取标题与清理不需要重复展示的部分
   * - 失败时给出 file:// 场景的友好提示（静态文件直接 fetch 会受限制）
   */
  async function renderPath(path) {
    if (!viewportEl || !titleEl) return false;
    viewportEl.classList.add("switching");
    await sleep(180);
    try {
      const res = await window.fetch(path);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, "text/html");
      const h1 = doc.body.querySelector("h1");
      if (h1) {
        const nextTitle = h1.textContent?.trim();
        if (nextTitle) titleEl.textContent = nextTitle;
        h1.remove();
      }
      /**
       * 把目标页面的 body 内容作为“文章正文”插入。
       * 注意：标题已经被提取到站点自身的标题栏，因此这里把原页面的 h1 移除，避免重复。
       */
      viewportEl.innerHTML = doc.body.innerHTML;
      if (scrollEl) scrollEl.scrollTop = 0;
      window.requestAnimationFrame(() => {
        viewportEl.classList.remove("switching");
      });
      return true;
    } catch (e) {
      viewportEl.innerHTML =
        '<div class="contentHint">Failed to load content. If you are opening this page via <strong>file://</strong>, please run a local static server, or deploy to GitHub Pages.</div>';
      window.requestAnimationFrame(() => {
        viewportEl.classList.remove("switching");
      });
      return false;
    }
  }

  return { renderPath };
}
