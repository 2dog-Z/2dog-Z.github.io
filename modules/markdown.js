const markdownCache = new Map();
const templateCache = new Map();

/**
 * Markdown 工具模块：负责把静态 .md 文件加载到浏览器，并转换为可展示的 HTML。
 * 功能：
 * - 支持从 front matter 中解析元数据（title / date 等）
 * - 提供一个“轻量 Markdown -> HTML”的转换器（满足本项目展示需求）
 * - 提供简单模板变量替换能力（{{var}}）
 * - 为网络请求结果做缓存，减少重复 fetch
 *
 * 设计取舍：
 * - 不引入第三方 Markdown 库，保持纯静态与零依赖
 * - 仅覆盖项目当前用到的语法：标题/段落/列表/引用/代码块/行内样式/链接/分割线
 * - 所有输出默认进行 HTML 转义，并对链接 href 做白名单校验，避免注入风险
 */

/**
 * 转义 HTML（文本节点层面的安全输出）。
 * 功能：将 &,<,>,", ' 变为实体，避免 Markdown 内容被当作 HTML 执行。
 */
function escapeHtml(input) {
  return String(input ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * 转义 HTML attribute。
 * 功能：在 escapeHtml 基础上额外处理反引号，降低属性拼接时的边界风险。
 */
function escapeAttribute(input) {
  return escapeHtml(input).replaceAll("`", "&#96;");
}

function normalizeSiteHref(href) {
  const s = String(href ?? "").trim();
  if (!s) return "";
  if (s.startsWith("#")) return s;
  if (s.startsWith("//")) return s;
  if (s.startsWith("mailto:")) return s;
  if (s.startsWith("./") || s.startsWith("../")) return s;

  const basePath = new URL(".", window.location.href).pathname;

  if (s.startsWith("/")) {
    if (basePath !== "/" && s.startsWith(basePath)) {
      const rest = s.slice(basePath.length).replace(/^\/+/, "");
      return rest ? `./${rest}` : "./";
    }
    return `.${s}`;
  }

  if (/^https?:\/\//i.test(s)) {
    try {
      const u = new URL(s);
      if (u.origin !== window.location.origin) return s;
      const p = u.pathname;
      if (basePath !== "/" && p.startsWith(basePath)) {
        const rest = p.slice(basePath.length).replace(/^\/+/, "");
        const rel = rest ? `./${rest}` : "./";
        return `${rel}${u.search}${u.hash}`;
      }
      return `.${p}${u.search}${u.hash}`;
    } catch {
      return s;
    }
  }

  return s;
}

/**
 * 判断链接是否允许输出为 <a>。
 * 目的：防止 javascript: 等危险协议；仅允许 http(s)/mailto/站内相对路径/锚点。
 */
function isSafeLink(href) {
  const s = String(href ?? "").trim();
  if (!s) return false;
  if (s.startsWith("#")) return true;
  if (s.startsWith("/")) return true;
  if (s.startsWith("./") || s.startsWith("../")) return true;
  return /^https?:\/\//i.test(s) || /^mailto:/i.test(s);
}

/**
 * 行内渲染器：将一行/一段文本中的常用语法转换为 HTML。
 * 覆盖：`code`、**bold**、*italic*、[text](href)。
 * 注意：先整体 escape，再用正则替换，保证默认安全输出。
 */
function renderInline(text) {
  let s = escapeHtml(text);
  s = s.replaceAll(/`([^`]+)`/g, "<code>$1</code>");
  s = s.replaceAll(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replaceAll(/\*([^*]+)\*/g, "<em>$1</em>");
  s = s.replaceAll(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
    const rawHref = String(href ?? "").trim();
    if (!isSafeLink(rawHref)) return label;
    const normalizedHref = normalizeSiteHref(rawHref);
    return `<a href="${escapeAttribute(normalizedHref)}" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
  });
  return s;
}

/**
 * 解析 front matter（YAML-like 的最简子集）。
 * 约定：
 * - 以三横线 --- 开始与结束
 * - 每行 key: value
 * - 不处理嵌套/数组等复杂结构（当前项目只需要 title/date）
 */
function parseFrontMatter(source) {
  const text = String(source ?? "");
  if (!text.startsWith("---")) return { meta: {}, body: text };
  const lines = text.split(/\r?\n/);
  if (lines[0].trim() !== "---") return { meta: {}, body: text };
  const meta = {};
  let end = -1;
  for (let i = 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.trim() === "---") {
      end = i;
      break;
    }
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (!key) continue;
    meta[key] = value;
  }
  if (end === -1) return { meta: {}, body: text };
  return { meta, body: lines.slice(end + 1).join("\n") };
}

/**
 * 将字符串解析为 Date。
 * 支持：
 * - 直接 new Date(s) 可识别的格式
 * - YYYY-MM-DD / YYYY/MM/DD
 */
function parseDateValue(v) {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const direct = new Date(s);
  if (!Number.isNaN(direct.getTime())) return direct;
  const m = s.match(/^(\d{4})[-/](\d{2})[-/](\d{2})$/);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

/**
 * 从 Markdown 正文中提取第一个一级标题作为标题，并把该行从正文移除。
 * 目的：让文章标题既能来自 front matter（优先），也能来自正文第一行 # 标题。
 */
function extractTitleFromBody(body) {
  const lines = String(body ?? "").split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const m = line.match(/^\s*#\s+(.+)\s*$/);
    if (!m) continue;
    const title = m[1].trim();
    const nextLines = [...lines.slice(0, i), ...lines.slice(i + 1)];
    if (i + 1 < lines.length && !lines[i + 1].trim()) nextLines.splice(i, 1);
    return { title, body: nextLines.join("\n") };
  }
  return { title: "", body: String(body ?? "") };
}

/**
 * 将 Markdown 转成 HTML（轻量实现）。
 * 覆盖：
 * - 标题（# ~ ######）
 * - 段落
 * - 代码块（```lang）
 * - 引用（>）
 * - 有序/无序列表
 * - 分割线（---/***/
export function markdownToHtml(markdown) {
  const raw = String(markdown ?? "").replaceAll("\r\n", "\n");
  const lines = raw.split("\n");
  const out = [];
  let i = 0;

  const flushParagraph = (buf) => {
    if (buf.length === 0) return;
    const first = String(buf[0] ?? "");
    const indent = first.match(/^\s+/)?.[0] ?? "";
    const indentLen = indent.replaceAll("\t", "  ").length;
    const isIndented = indentLen >= 2;
    const chunks = buf
      .map((l, idx) => {
        const s = String(l ?? "");
        const line = idx === 0 ? s.replace(/^\s+/, "") : s.trimStart();
        if (!line.trim()) return null;
        const isHardBreak = /\\\s*$/.test(line) || / {2,}$/.test(line);
        const cleaned = line.replace(/\\\s*$/, "").replace(/ {2,}$/, "").trimEnd();
        return { html: renderInline(cleaned), hard: isHardBreak };
      })
      .filter(Boolean);
    if (chunks.length === 0) return;
    let html = "";
    for (let idx = 0; idx < chunks.length; idx += 1) {
      const c = chunks[idx];
      html += c.html;
      if (idx < chunks.length - 1 || c.hard) html += "<br />\n";
    }
    out.push(`<p${isIndented ? ' class="mdIndent"' : ""}>${html}</p>`);
    buf.length = 0;
  };

  while (i < lines.length) {
    const line = lines[i];
    if (/^\s*```/.test(line)) {
      const fence = line.trim();
      const lang = fence.slice(3).trim();
      const codeLines = [];
      i += 1;
      while (i < lines.length && !/^\s*```/.test(lines[i])) {
        codeLines.push(lines[i]);
        i += 1;
      }
      i += 1;
      const code = escapeHtml(codeLines.join("\n"));
      const cls = lang ? ` class="language-${escapeAttribute(lang)}"` : "";
      out.push(`<pre><code${cls}>${code}</code></pre>`);
      continue;
    }

    if (/^\s*$/.test(line)) {
      out.push("");
      i += 1;
      continue;
    }

    const hr = line.trim();
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(hr)) {
      out.push("<hr />");
      i += 1;
      continue;
    }

    const heading = line.match(/^\s*(#{1,6})\s+(.+)\s*$/);
    if (heading) {
      const level = heading[1].length;
      out.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      i += 1;
      continue;
    }

    const quote = line.match(/^\s*>\s?(.*)$/);
    if (quote) {
      const qLines = [];
      while (i < lines.length) {
        const m = lines[i].match(/^\s*>\s?(.*)$/);
        if (!m) break;
        qLines.push(m[1]);
        i += 1;
      }
      const content = markdownToHtml(qLines.join("\n")).trim();
      out.push(`<blockquote>${content}</blockquote>`);
      continue;
    }

    const ul = line.match(/^\s*[-*]\s+(.+)$/);
    const ol = line.match(/^\s*(\d+)\.\s+(.+)$/);
    if (ul || ol) {
      const isOrdered = Boolean(ol);
      const items = [];
      const renderListLine = (text) => {
        const s = String(text ?? "");
        const hard = /\\\s*$/.test(s) || / {2,}$/.test(s);
        const cleaned = s.replace(/\\\s*$/, "").replace(/ {2,}$/, "").trimEnd();
        return `${renderInline(cleaned)}${hard ? "<br />" : ""}`;
      };
      while (i < lines.length) {
        const l = lines[i];
        const m1 = l.match(/^\s*[-*]\s+(.+)$/);
        const m2 = l.match(/^\s*(\d+)\.\s+(.+)$/);
        if (isOrdered) {
          if (!m2) break;
          items.push(`<li>${renderListLine(m2[2])}</li>`);
        } else {
          if (!m1) break;
          items.push(`<li>${renderListLine(m1[1])}</li>`);
        }
        i += 1;
      }
      out.push(`${isOrdered ? "<ol>" : "<ul>"}${items.join("")}${isOrdered ? "</ol>" : "</ul>"}`);
      continue;
    }

    const pBuf = [];
    while (i < lines.length && lines[i].trim() && !/^\s*```/.test(lines[i])) {
      const l = lines[i];
      if (/^\s*(#{1,6})\s+/.test(l)) break;
      if (/^\s*[-*]\s+/.test(l)) break;
      if (/^\s*\d+\.\s+/.test(l)) break;
      if (/^\s*>\s?/.test(l)) break;
      if (/^(-{3,}|\*{3,}|_{3,})$/.test(l.trim())) break;
      pBuf.push(l);
      i += 1;
    }
    flushParagraph(pBuf);
  }

  return out.filter((x) => x !== "").join("\n");
}

/**
 * 加载 HTML 模板并缓存。
 * 目的：模板文件与文章内容分离；同一模板多次渲染时避免重复请求。
 */
export async function loadTemplate(url) {
  const key = String(url ?? "");
  if (templateCache.has(key)) return templateCache.get(key);
  const res = await window.fetch(key);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  templateCache.set(key, text);
  return text;
}

/**
 * 简单模板渲染：把 template 中的 {{key}} 替换为 vars[key]。
 * 目的：避免引入模板引擎，满足 “模板文件与文章页面分离” 的需求。
 */
export function renderTemplate(template, vars = {}) {
  let s = String(template ?? "");
  for (const [k, v] of Object.entries(vars)) {
    const token = `{{${k}}}`;
    s = s.split(token).join(String(v ?? ""));
  }
  return s;
}

/**
 * 替换 Markdown 渲染后的 HTML 中的占位符。
 * 约定：为了兼容 Markdown 生成的段落标签，会先尝试替换 <p>{{token}}</p> 形式。
 * 用途：例如在首页正文中写 {{posts}} / {{cheatSheet}}，再由渲染器注入动态列表。
 */
export function replaceHtmlPlaceholders(html, vars = {}) {
  let s = String(html ?? "");
  for (const [k, v] of Object.entries(vars)) {
    const token = `{{${k}}}`;
    const val = String(v ?? "");
    const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    s = s.replaceAll(new RegExp(`<p>\\s*${escaped}\\s*</p>\\s*`, "g"), val);
    s = s.split(token).join(val);
  }
  return s;
}

/**
 * 获取 Markdown 文档（正文 + 元数据）。
 * 功能：
 * - fetch 文本
 * - 解析 front matter（title/date）
 * - 从正文提取标题（当 meta.title 缺失时兜底）
 * - 结果缓存为 Promise，避免并发重复请求
 */
export async function getMarkdownDocument(url) {
  const key = String(url ?? "");
  if (markdownCache.has(key)) return markdownCache.get(key);
  const p = (async () => {
    const res = await window.fetch(key);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw = await res.text();
    const { meta, body: body0 } = parseFrontMatter(raw);
    const extracted = extractTitleFromBody(body0);
    const title = String(meta.title ?? extracted.title ?? "").trim();
    const date = parseDateValue(meta.date);
    const body = extracted.body;
    return { url: key, meta, title, date, body };
  })();
  markdownCache.set(key, p);
  return p;
}

/**
 * 只获取 Markdown 的元信息（用于列表/排序等场景）。
 * 目的：与 getMarkdownDocument 解耦，让调用方表达更清晰。
 */
export async function getMarkdownMeta(url) {
  const doc = await getMarkdownDocument(url);
  return { title: doc.title, date: doc.date, meta: doc.meta, url: doc.url };
}

/**
 * 格式化日期为 YYYY-MM-DD（用于文章元信息展示与列表日期）。
 */
export function formatIsoDate(d) {
  if (!(d instanceof Date) || Number.isNaN(d.getTime())) return "";
  const yyyy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

