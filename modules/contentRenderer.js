import { CHEAT_SHEET } from "./constants.js";
import { formatIsoDate, getMarkdownMeta, getMarkdownDocument, loadTemplate, markdownToHtml, renderTemplate, replaceHtmlPlaceholders } from "./markdown.js";
import { sleep, stripFileExtension } from "./utils.js";

/**
 * 内容渲染模块：负责把指定路径的内容渲染到左侧内容区。
 * 功能：
 * - 支持渲染 Markdown（.md）：解析元数据、转换为 HTML、套用模板并注入动态占位符
 * - 兼容渲染 HTML（.html）：提取页面内的 <h1> 作为左上角标题，并注入其余 body
 * 目的：
 * - 让站点保持“单页体验”（不整页跳转），但内容仍然来自静态文件
 * - 与终端的 cat/cd 联动，实现“在终端打开文章”的交互
 */
export function createContentRenderer(options = {}) {
  const titleEl = document.getElementById("contentTitle");
  const viewportEl = document.getElementById("contentViewport");
  const scrollEl = viewportEl?.parentElement;
  const fileSystem = options.fileSystem;
  const onPathRendered = options.onPathRendered;

  /**
   * 从文章文件名中推断日期（推荐文件名格式：YYYY-MM-DD-xxx.md）。
   * 用途：
   * - 文章很多时避免为“列表展示”批量 fetch 全部 meta，改用文件名快速排序/展示，保证不卡顿。
   * - 当文章缺少 front matter date 时，也能有一个稳定的显示日期。
   */
  function parseDateFromPostKey(key) {
    const base = stripFileExtension(String(key ?? ""));
    const m = base.match(/^(\d{4}-\d{2}-\d{2})(?:-|$)/);
    return m ? m[1] : "";
  }

  /**
   * 按“日期从新到旧”比较两篇文章的文件名。
   * 规则：
   * - 两者都能解析出日期：按日期降序
   * - 只有一方有日期：有日期的更靠前
   * - 都没有日期：按文件名排序，保证稳定输出
   */
  function comparePostKeysDesc(aKey, bKey) {
    const aDate = parseDateFromPostKey(aKey);
    const bDate = parseDateFromPostKey(bKey);
    if (aDate && bDate && aDate !== bDate) return bDate.localeCompare(aDate);
    if (aDate && !bDate) return -1;
    if (!aDate && bDate) return 1;
    return String(aKey ?? "").localeCompare(String(bKey ?? ""));
  }

  /**
   * 生成命令速查表的 HTML。
   * 用途：在 Markdown 中通过 {{cheatSheet}} 占位符注入（例如首页）。
   */
  function renderCheatSheetHtml() {
    const rows = CHEAT_SHEET.map(
      (r) =>
        `<tr><td><strong>${r.cmd}</strong></td><td>${r.args}</td><td>${r.desc}</td></tr>`
    ).join("");
    return [
      '<div class="tableWrap">',
      '<table class="cheatSheet">',
      "<thead><tr><th>Command</th><th>Args</th><th>Description</th></tr></thead>",
      `<tbody>${rows}</tbody>`,
      "</table>",
      "</div>",
    ].join("");
  }

  /**
   * 生成“最新文章列表”的 HTML，并按 date 从近到远排序。
   * 数据来源：传入的 fileSystem.post（虚拟文件系统中的 post 目录）。
   * 用途：在 Markdown 中通过 {{postLatest}} 占位符注入（例如根首页）。
   *
   * 性能策略（首屏友好）：
   * - 只计算“最新 1 篇”，只对这一篇文章读取 meta（用于拿到 title/date）
   * - 排序尽量用文件名日期完成，避免对所有文章并发 fetch
   */
  async function renderPostLatestHtml() {
    const postDir = fileSystem?.post;
    if (!postDir || typeof postDir !== "object") return '<div class="contentHint">(no posts)</div>';
    const entries = Object.entries(postDir).filter(([k, v]) => typeof v === "string" && k.endsWith(".md") && k !== "index.md");
    if (entries.length === 0) return '<div class="contentHint">(no posts)</div>';
    entries.sort(([aKey], [bKey]) => comparePostKeysDesc(aKey, bKey));
    const [key, url] = entries[0];
    const fallbackTitle = stripFileExtension(key);
    const fallbackDate = parseDateFromPostKey(key);
    let title = fallbackTitle;
    let date = fallbackDate;
    try {
      const meta = await getMarkdownMeta(url);
      if (meta?.title) title = meta.title;
      if (meta?.date instanceof Date) date = formatIsoDate(meta.date) || date;
    } catch {
      title = fallbackTitle;
      date = fallbackDate;
    }
    const cmd = `cat /post/${stripFileExtension(key)}`;
    const item = `<li class="mdPostItem" data-cmd="${cmd}" title="jumpto"><span class="mdPostDate">${date}</span><span class="mdPostTitle">${title}</span><span class="mdPostCmd"><code title="jumpto">${cmd}</code></span></li>`;
    return `<ul class="mdPostList">${item}</ul>`;
  }

  /**
   * 生成“全部文章列表”的 HTML（用于 /post/index.md 的 {{posts}}）。
   *
   * 性能策略（防止文章多时卡顿）：
   * - 文章数量较少：读取 meta（标题/日期）得到更友好的展示
   * - 文章数量很多：只用文件名生成列表（title=去扩展名，date=文件名中的 YYYY-MM-DD），点开文章时再加载正文
   */
  async function renderAllPostsHtml() {
    const postDir = fileSystem?.post;
    if (!postDir || typeof postDir !== "object") return '<div class="contentHint">(no posts)</div>';
    const entries = Object.entries(postDir).filter(([k, v]) => typeof v === "string" && k.endsWith(".md") && k !== "index.md");
    if (entries.length === 0) return '<div class="contentHint">(no posts)</div>';
    if (entries.length <= 12) {
      const metas = await Promise.all(
        entries.map(async ([k, url]) => {
          const meta = await getMarkdownMeta(url);
          return { key: k, url, title: meta.title || stripFileExtension(k), date: meta.date };
        })
      );
      metas.sort((a, b) => {
        const ta = a.date instanceof Date ? a.date.getTime() : -Infinity;
        const tb = b.date instanceof Date ? b.date.getTime() : -Infinity;
        if (tb !== ta) return tb - ta;
        return a.title.localeCompare(b.title);
      });
      const items = metas
        .map((m) => {
          const date = m.date ? formatIsoDate(m.date) : "";
          const cmd = `cat /post/${stripFileExtension(m.key)}`;
          return `<li class="mdPostItem" data-cmd="${cmd}" title="jumpto"><span class="mdPostDate">${date}</span><span class="mdPostTitle">${m.title}</span><span class="mdPostCmd"><code title="jumpto">${cmd}</code></span></li>`;
        })
        .join("");
      return `<ul class="mdPostList">${items}</ul>`;
    }

    entries.sort(([aKey], [bKey]) => comparePostKeysDesc(aKey, bKey));
    const items = entries
      .map(([k]) => {
        const date = parseDateFromPostKey(k);
        const title = stripFileExtension(k);
        const cmd = `cat /post/${stripFileExtension(k)}`;
        return `<li class="mdPostItem" data-cmd="${cmd}" title="jumpto"><span class="mdPostDate">${date}</span><span class="mdPostTitle">${title}</span><span class="mdPostCmd"><code title="jumpto">${cmd}</code></span></li>`;
      })
      .join("");
    return `<ul class="mdPostList">${items}</ul>`;
  }

  function renderAboutMeHtml() {
    const cmd = "cat /aboutme/index";
    return `<ul class="mdPostList"><li class="mdPostItem" data-cmd="${cmd}" title="jumpto"><span class="mdPostTitle">About Me</span><span class="mdPostCmd"><code title="jumpto">${cmd}</code></span></li></ul>`;
  }

  function renderSocialLinksHtml() {
    const items = [
      {
        label: "LinkedIn",
        href: "https://www.linkedin.com/in/chaobo-zhang-83601334b/",
        svg: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5ZM.5 8.5H4.5V23H.5V8.5ZM8.5 8.5H12.33V10.48H12.38C12.91 9.48 14.21 8.43 16.14 8.43 20.2 8.43 21 11.1 21 14.58V23H17V15.27C17 13.43 16.97 11.07 14.48 11.07 11.95 11.07 11.57 13.05 11.57 15.14V23H7.57V8.5H8.5Z"/></svg>',
      },
      {
        label: "GitHub",
        href: "https://github.com/2dog-Z",
        svg: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 .5C5.73.5.75 5.62.75 12c0 5.1 3.29 9.42 7.86 10.95.58.11.79-.26.79-.57 0-.28-.01-1.02-.02-2-3.2.71-3.88-1.58-3.88-1.58-.53-1.38-1.3-1.75-1.3-1.75-1.06-.75.08-.74.08-.74 1.17.08 1.78 1.23 1.78 1.23 1.04 1.83 2.73 1.3 3.4.99.11-.77.41-1.3.74-1.6-2.55-.3-5.23-1.31-5.23-5.84 0-1.29.45-2.35 1.19-3.18-.12-.3-.52-1.52.11-3.17 0 0 .97-.32 3.18 1.21.92-.26 1.9-.39 2.88-.39.98 0 1.96.13 2.88.39 2.21-1.53 3.18-1.21 3.18-1.21.63 1.65.23 2.87.11 3.17.74.83 1.19 1.89 1.19 3.18 0 4.54-2.69 5.54-5.25 5.83.42.37.79 1.11.79 2.24 0 1.62-.01 2.92-.01 3.32 0 .31.21.69.8.57 4.57-1.53 7.85-5.85 7.85-10.95C23.25 5.62 18.27.5 12 .5Z"/></svg>',
      },
      {
        label: "Google Scholar",
        href: "https://scholar.google.com.au/citations?user=NqYGzhQAAAAJ",
        svg: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2 1 7l11 5 9-4.09V17h2V7L12 2Zm0 12L4.5 10.09V17c0 2.76 3.13 5 7.5 5s7.5-2.24 7.5-5v-6.91L12 14Z"/></svg>',
      },
    ];
    const links = items
      .map(
        (x) =>
          `<a class="mdSocialLink" href="${x.href}" target="_blank" rel="noopener noreferrer"><span class="mdSocialIcon">${x.svg}</span><span class="mdSocialText">${x.label}</span></a>`
      )
      .join("");
    return `<div class="mdSocialLinks">${links}</div>`;
  }

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
    if (scrollEl) scrollEl.classList.add("contentLoading");
    viewportEl.classList.add("switching");
    await sleep(180);
    try {
      const normalized = String(path ?? "");
      if (normalized.endsWith(".md")) {
        /**
         * Markdown 渲染流程：
         * 1) 拉取并解析 md（front matter + 标题 + 正文）
         * 2) Markdown -> HTML
         * 3) 用 replaceHtmlPlaceholders 注入 {{posts}} / {{cheatSheet}} 等动态片段
         * 4) 套用模板文件（模板与文章内容解耦）
         */
        const doc = await getMarkdownDocument(normalized);
        const nextTitle = doc.title?.trim();
        if (nextTitle) titleEl.textContent = nextTitle;

        const template = await loadTemplate("./templates/article.html");
        const contentHtml0 = markdownToHtml(doc.body);
        const vars = {
          cheatSheet: renderCheatSheetHtml(),
          posts: await renderAllPostsHtml(),
          postLatest: await renderPostLatestHtml(),
          aboutMe: renderAboutMeHtml(),
          socialLinks: renderSocialLinksHtml(),
        };
        const contentHtml = replaceHtmlPlaceholders(contentHtml0, vars);
        const date = doc.date ? formatIsoDate(doc.date) : "";
        viewportEl.innerHTML = renderTemplate(template, { date, content: contentHtml });
        const h2s = viewportEl.querySelectorAll("h2");
        for (const h2 of h2s) {
          const text = h2.textContent?.trim();
          if (text === "Posts") {
            const code = document.createElement("code");
            code.className = "cmdButton";
            code.textContent = "cd /post";
            code.dataset.cmd = "cd /post";
            code.style.marginLeft = "10px";
            code.title = "jumpto";
            h2.appendChild(code);
            break;
          }
        }
        if (typeof onPathRendered === "function") onPathRendered(normalized);
      } else {
        const res = await window.fetch(normalized);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, "text/html");
        const h1 = doc.body.querySelector("h1");
        if (h1) {
          const nextTitle = h1.textContent?.trim();
          if (nextTitle) titleEl.textContent = nextTitle;
          h1.remove();
        }
        viewportEl.innerHTML = doc.body.innerHTML;
        if (typeof onPathRendered === "function") onPathRendered("");
      }
      if (scrollEl) scrollEl.scrollTop = 0;
      window.requestAnimationFrame(() => {
        viewportEl.classList.remove("switching");
      });
      return true;
    } catch (e) {
      viewportEl.innerHTML =
        '<div class="contentHint">Failed to load content. If you are opening this page via <strong>file://</strong>, please run a local static server, or deploy to GitHub Pages.</div>';
      if (typeof onPathRendered === "function") onPathRendered("");
      window.requestAnimationFrame(() => {
        viewportEl.classList.remove("switching");
      });
      return false;
    } finally {
      if (scrollEl) scrollEl.classList.remove("contentLoading");
    }
  }

  return { renderPath };
}
