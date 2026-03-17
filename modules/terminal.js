import { ADMIN_AUTH_WORKER_ORIGIN, CHEAT_SHEET, DEFAULT_PAGE, FILE_SYSTEM, TERMINAL_MAX_LINES, TERMINAL_TRIM_TOP_LINES } from "./constants.js";
import { getMarkdownMeta } from "./markdown.js";
import { joinPath, resolveDir, sha256Hex, sleep, stripFileExtension, tokenize } from "./utils.js";

/**
 * 交互式终端模块：负责“下方终端区域”的所有交互与渲染。
 * 功能概览：
 * - 维护终端状态（用户、当前目录 cwd、历史命令、打印状态等）
 * - 将用户输入解析成命令（tokenize），分发到各命令处理函数
 * - 把输出以“即时打印”或“打字机效果”渲染到终端输出区
 * - 和内容区、主题、评论区进行联动：
 *   - cat：加载并渲染文章到内容区
 *   - cd/ls：浏览虚拟目录结构
 *   - say：新增评论
 *   - theme：切换主题并持久化
 *
 * 目的：
 * - 将复杂交互集中封装成一个 createTerminal() 工厂，主入口只需注入依赖并调用 boot/focus
 * - 保持模块边界清晰：终端本身不关心“内容如何渲染/主题如何切换”，只调用注入的函数
 */

/**
 * 创建终端实例。
 * @param {Object} options
 * @param {(path: string) => Promise<boolean>} options.renderPath - 内容渲染函数（供 cat/cd 默认打开使用）
 * @param {(theme: "dark" | "light") => void} options.applyTheme - 主题切换函数（供 theme 命令调用）
 * @param {() => ("dark" | "light")} options.readTheme - 主题读取函数（供 theme 命令展示当前值）
 * @returns {{ focus: () => void, boot: () => Promise<void> }}
 *
 * 目的：通过依赖注入让终端更可复用、更易测试，也避免模块之间互相 import 形成耦合。
 */
export function createTerminal(options = {}) {
  const output = document.getElementById("terminalOutput");
  const input = document.getElementById("terminalInput");
  const prompt = document.getElementById("promptText");
  const renderPath = options.renderPath;
  const applyTheme = options.applyTheme;
  const readTheme = options.readTheme;

  let user = "guest";
  let cwd = [];
  let isPrinting = false;
  let isLocked = false;
  let printingCount = 0;
  const history = [];
  let historyIndex = -1;

  /**
   * 滚动到底部，保证新输出可见。
   * 目的：终端交互时用户总是希望看到最新输出。
   */
  function scrollToBottom() {
    output.scrollTop = output.scrollHeight;
  }

  /**
   * 当终端输出行数过多时裁剪顶部内容。
   * 背景：终端输出是不断追加 DOM 节点的；不限制会导致内存增长、布局计算变慢、页面卡顿。
   * 策略：
   * - 达到 TERMINAL_MAX_LINES 时，一次性裁剪 TERMINAL_TRIM_TOP_LINES 行（而不是每次删 1 行）
   * - 既保留最近上下文，又减少频繁 DOM 操作造成的抖动
   */
  function trimOutputOnOverflow() {
    const lines = output.querySelectorAll(".terminalLine");
    if (lines.length >= TERMINAL_MAX_LINES) {
      const removeCount = Math.min(TERMINAL_TRIM_TOP_LINES, lines.length);
      for (let i = 0; i < removeCount; i += 1) {
        const node = lines[i];
        if (node && node.parentNode === output) output.removeChild(node);
      }
    }
  }

  /**
   * 刷新提示符（prompt）显示。
   * 功能：把 user + 当前目录 cwd 拼成类似 shell 的提示符。
   * 目的：增强命令行真实感，并给用户明确的“当前路径上下文”。
   */
  function setPrompt() {
    prompt.textContent = `${user}@blog:${joinPath(cwd)}$`;
  }

  /**
   * 开关输入框可用性。
   * 功能：在打印动画或彩蛋锁定期间禁用输入，避免状态错乱。
   * 目的：让输出过程可控、交互更稳定。
   */
  function setInputEnabled(enabled) {
    input.disabled = !enabled;
    if (enabled) focusInput();
  }

  /**
   * 开始一次“打印阶段”计数。
   * 功能：支持嵌套/并行的打印过程（通过计数确保最终能正确恢复 isPrinting）。
   * 目的：防止多个异步输出同时进行时出现“提前解锁输入”的问题。
   */
  function beginPrinting() {
    printingCount += 1;
    isPrinting = true;
  }

  /**
   * 结束一次“打印阶段”计数。
   * 功能：当计数归零时才真正认为“打印结束”。
   * 目的：与 beginPrinting 配合，保证 isPrinting 状态可靠。
   */
  function endPrinting() {
    printingCount = Math.max(0, printingCount - 1);
    if (printingCount === 0) isPrinting = false;
  }

  /**
   * 立即追加一行输出（无打字机动画）。
   * 功能：把文本作为一个 div 插入终端输出区，并滚动到底部。
   * 目的：用于回显用户输入、快速输出提示等场景。
   */
  function appendLineInstant(text, variant) {
    const div = document.createElement("div");
    div.className = `terminalLine${variant ? ` ${variant}` : ""}`;
    div.textContent = text;
    output.appendChild(div);
    trimOutputOnOverflow();
    scrollToBottom();
  }

  /**
   * 创建/复用一个闪烁光标节点。
   * 功能：用于“逐字打印”的视觉效果，让输出看起来像在打字。
   * 目的：增强终端沉浸感。
   */
  function createBlinkCursor() {
    const existing = document.querySelector(".terminalInputRow .cursor");
    if (existing instanceof HTMLElement) return existing.cloneNode(true);
    const span = document.createElement("span");
    span.className = "cursor";
    span.setAttribute("aria-hidden", "true");
    return span;
  }

  /**
   * 追加一行“可逐字更新”的输出行。
   * 功能：返回 textNode 以便后续逐字改写；同时带一个可闪烁光标。
   * 目的：为彩蛋/打字机输出提供一个稳定的渲染载体。
   */
  function appendTypingLine(variant) {
    const div = document.createElement("div");
    div.className = `terminalLine${variant ? ` ${variant}` : ""}`;
    const textNode = document.createTextNode("");
    const cursor = createBlinkCursor();
    div.appendChild(textNode);
    div.appendChild(cursor);
    output.appendChild(div);
    trimOutputOnOverflow();
    scrollToBottom();
    return { div, textNode, cursor };
  }

  /**
   * 逐字写入 textNode。
   * 功能：每次增加一个字符，并在每一步滚动到底部。
   * 目的：实现“正在输入”的动效，让输出更具交互感。
   */
  async function typeIntoTextNode(textNode, text, options = {}) {
    const { speedMs = 18 } = options;
    const s = String(text ?? "");
    for (let i = 0; i <= s.length; i += 1) {
      textNode.data = s.slice(0, i);
      scrollToBottom();
      await sleep(speedMs);
    }
  }

  /**
   * 立即追加一行“由多个片段组成”的输出。
   * 功能：片段可以是 string 或 DOM 节点（例如可点击跳转链接）。
   * 目的：支持 ls 输出里可点击的目录/文件名。
   */
  function appendLinePartsInstant(parts, variant) {
    const div = document.createElement("div");
    div.className = `terminalLine${variant ? ` ${variant}` : ""}`;
    for (const p of parts) {
      if (p == null) continue;
      if (typeof p === "string") div.appendChild(document.createTextNode(p));
      else div.appendChild(p);
    }
    output.appendChild(div);
    trimOutputOnOverflow();
    scrollToBottom();
  }

  /**
   * 创建一个可点击的“跳转命令”链接节点。
   * 功能：点击后会触发执行 link.dataset.cmd 对应的命令（例如 cd /post）。
   * 目的：让 ls 输出既可读又可点，降低交互门槛。
   */
  function createJumpLink(label, cmd) {
    const span = document.createElement("span");
    span.className = "terminalJump";
    span.textContent = label;
    span.dataset.cmd = cmd;
    span.title = "jumpto";
    return span;
  }

  /**
   * 将路径数组转为绝对路径字符串（/a/b）。
   * 目的：终端内部统一使用绝对路径表示“点击跳转命令”，避免相对路径歧义。
   */
  function toAbsolutePath(parts) {
    if (parts.length === 0) return "/";
    return `/${parts.join("/")}`;
  }

  /**
   * 打字机输出。
   * 功能：把多行文本拆成逐行逐字输出，用 setTimeout 控制速度。
   * 目的：构造“终端在输出”的节奏感，并且在输出期间锁定输入。
   */
  function typewriter(text, options = {}) {
    const { variant, speedMs = 12, lineDelayMs = 40 } = options;
    const lines = String(text ?? "").split("\n");
    beginPrinting();
    return new Promise((resolve) => {
      let i = 0;
      const step = () => {
        if (i >= lines.length) {
          endPrinting();
          scrollToBottom();
          resolve();
          return;
        }
        const div = document.createElement("div");
        div.className = `terminalLine${variant ? ` ${variant}` : ""}`;
        output.appendChild(div);
        trimOutputOnOverflow();
        const line = lines[i];
        let pos = 0;
        const tick = () => {
          div.textContent = line.slice(0, pos);
          pos += 1;
          scrollToBottom();
          if (pos <= line.length) {
            window.setTimeout(tick, speedMs);
          } else {
            i += 1;
            window.setTimeout(step, lineDelayMs);
          }
        };
        tick();
      };

      step();
    });
  }

  /**
   * 输出 help：列出全部命令及说明。
   * 目的：让用户随时知道“能做什么”，提升可用性。
   */
  async function printHelp() {
    const rows = CHEAT_SHEET.map((r) => `  ${r.cmd.padEnd(6, " ")} ${r.args.padEnd(14, " ")} ${r.desc}`);
    await typewriter(["Available commands:", ...rows].join("\n"), { variant: "dim", speedMs: 8, lineDelayMs: 28 });
  }

  /**
   * 输出某路径下的树形结构（带可点击跳转）。
   * 功能：根目录展示顶层目录；子目录展示目录/文件（文件名保留后缀便于辨识）。
   * 目的：让 ls 不只是纯文本，而是一个可交互的导航。
   */
  async function printTreeForPath(pathParts) {
    const node = pathParts.length === 0 ? FILE_SYSTEM : resolveDir(FILE_SYSTEM, pathParts);
    if (!node) return await typewriter("ls: directory not found", { variant: "dim", speedMs: 8, lineDelayMs: 28 });

    const entries =
      pathParts.length === 0
        ? await (async () => {
            const dirs = [];
            const files = [];
            for (const [name, value] of Object.entries(FILE_SYSTEM)) {
              if (value && typeof value === "object") dirs.push([name, value]);
              else files.push([name, value]);
            }
            dirs.sort(([a], [b]) => a.localeCompare(b));
            const filesWithMeta = await Promise.all(
              files.map(async ([name, value]) => {
                if (typeof value === "string" && name.endsWith(".md")) {
                  const meta = await getMarkdownMeta(value);
                  const t = meta.date instanceof Date ? meta.date.getTime() : -Infinity;
                  return { name, value, t };
                }
                return { name, value, t: -Infinity };
              })
            );
            filesWithMeta.sort((a, b) => {
              if (b.t !== a.t) return b.t - a.t;
              return a.name.localeCompare(b.name);
            });
            return [...dirs, ...filesWithMeta.map((x) => [x.name, x.value])];
          })()
        : await (async () => {
            const dirs = [];
            const files = [];
            for (const [name, value] of Object.entries(node)) {
              if (value && typeof value === "object") dirs.push([name, value]);
              else files.push([name, value]);
            }
            dirs.sort(([a], [b]) => a.localeCompare(b));
            const filesWithMeta = await Promise.all(
              files.map(async ([name, value]) => {
                if (typeof value === "string" && name.endsWith(".md")) {
                  const meta = await getMarkdownMeta(value);
                  const t = meta.date instanceof Date ? meta.date.getTime() : -Infinity;
                  return { name, value, t };
                }
                return { name, value, t: -Infinity };
              })
            );
            filesWithMeta.sort((a, b) => {
              if (b.t !== a.t) return b.t - a.t;
              return a.name.localeCompare(b.name);
            });
            return [...dirs, ...filesWithMeta.map((x) => [x.name, x.value])];
          })();

    beginPrinting();
    appendLineInstant(".", "dim");
    for (let idx = 0; idx < entries.length; idx += 1) {
      const [name, value] = entries[idx];
      await sleep(26);
      const last = idx === entries.length - 1;
      const isDir = value && typeof value === "object";
      const prefix = `${last ? "└──" : "├──"} `;

      if (isDir) {
        const absDir = toAbsolutePath([...pathParts, name]);
        appendLinePartsInstant([prefix, createJumpLink(`${name}/`, `cd ${absDir}`)], "dim");
        continue;
      }

      const base = stripFileExtension(name);
      const absFile = toAbsolutePath([...pathParts, base]);
      appendLinePartsInstant([prefix, createJumpLink(name, `cat ${absFile}`)], "dim");
    }
    endPrinting();
  }

  /**
   * ls 命令实现。
   * 功能：根据 cwd 输出目录内容；根目录用树状展示；子目录用列表展示。
   * 目的：兼顾“首次进入看到目录结构”和“进入目录后快速查看文件”的体验。
   */
  async function printLs() {
    if (cwd.length === 0) return await printTreeForPath([]);
    const node = resolveDir(FILE_SYSTEM, cwd);
    if (!node) return await typewriter("ls: directory not found", { variant: "dim", speedMs: 8, lineDelayMs: 28 });

    const dirs = [];
    const files = [];
    for (const [name, value] of Object.entries(node)) {
      if (value && typeof value === "object") dirs.push({ name, url: "" });
      else if (typeof value === "string") files.push({ name, url: value });
    }
    if (dirs.length === 0 && files.length === 0) return await typewriter("(empty)", { variant: "dim", speedMs: 8, lineDelayMs: 28 });

    const fileWithMeta = await Promise.all(
      files.map(async (f) => {
        if (f.name.endsWith(".md")) {
          const meta = await getMarkdownMeta(f.url);
          const t = meta.date instanceof Date ? meta.date.getTime() : -Infinity;
          return { ...f, t };
        }
        return { ...f, t: -Infinity };
      })
    );

    dirs.sort((a, b) => a.name.localeCompare(b.name));
    fileWithMeta.sort((a, b) => {
      if (b.t !== a.t) return b.t - a.t;
      return a.name.localeCompare(b.name);
    });

    beginPrinting();
    for (const d of dirs) {
      await sleep(26);
      const absDir = toAbsolutePath([...cwd, d.name]);
      appendLinePartsInstant([createJumpLink(`${d.name}/`, `cd ${absDir}`)], "dim");
    }
    for (const f of fileWithMeta) {
      await sleep(26);
      const base = stripFileExtension(f.name);
      const absFile = toAbsolutePath([...cwd, base]);
      appendLinePartsInstant([createJumpLink(f.name, `cat ${absFile}`)], "dim");
    }
    endPrinting();
  }

  /**
   * 解析 cat 命令的目标路径。
   * 功能：
   * - 支持绝对路径（/post/index 或 ~/post/index）
   * - 支持相对路径（基于 cwd）
   * - 支持省略扩展名（index -> index.html）
   * 目的：让用户输入更自然，同时保持解析规则简单可控。
   */
  function resolveFileForCat(rawPath) {
    const inputPath = rawPath.trim();
    if (!inputPath) return { ok: false, error: "cat: missing file name" };

    const isAbsolute = inputPath.startsWith("/") || inputPath.startsWith("~/");
    const cleaned = inputPath.replace(/^~\//, "").replace(/^\//, "");
    const parts = cleaned.split("/").filter(Boolean);
    if (parts.length === 0) return { ok: false, error: "cat: missing file name" };

    const dirParts = isAbsolute ? [] : [...cwd];
    for (let i = 0; i < parts.length - 1; i += 1) {
      const p = parts[i];
      if (p === "." || p === "") continue;
      if (p === "..") dirParts.pop();
      else dirParts.push(p);
    }
    const filename = parts[parts.length - 1];
    if (filename === "." || filename === "..") return { ok: false, error: `cat: invalid file name ${filename}` };

    const dir = resolveDir(FILE_SYSTEM, dirParts);
    if (!dir) return { ok: false, error: "cat: directory does not exist" };
    const exactValue = dir[filename];
    if (exactValue && typeof exactValue !== "object") {
      return { ok: true, url: exactValue, display: stripFileExtension(filename) };
    }

    if (!filename.includes(".")) {
      const matches = Object.keys(dir).filter((k) => stripFileExtension(k) === filename && typeof dir[k] === "string");
      if (matches.length === 1) {
        const realKey = matches[0];
        return { ok: true, url: dir[realKey], display: stripFileExtension(realKey) };
      }
      if (matches.length > 1) return { ok: false, error: `cat: ambiguous file name ${filename}` };
    }

    return { ok: false, error: `cat: file not found ${inputPath}` };
  }

  /**
   * cat 命令实现。
   * 功能：解析目标文件 -> 调用 renderPath 把文章渲染到内容区 -> 在终端输出结果。
   * 目的：让“打开文章”成为终端交互的一部分，而不是点击普通链接跳转页面。
   */
  async function runCat(name) {
    const resolved = resolveFileForCat(name);
    if (!resolved.ok) return await typewriter(resolved.error, { variant: "dim", speedMs: 8, lineDelayMs: 28 });
    if (!renderPath) return await typewriter("cat: renderer not available", { variant: "dim", speedMs: 8, lineDelayMs: 28 });
    beginPrinting();
    const ok = await renderPath(resolved.url);
    endPrinting();
    if (!ok) return await typewriter(`cat: failed to open ${resolved.display}`, { variant: "dim", speedMs: 8, lineDelayMs: 28 });
    await typewriter(`opened ${resolved.display}`, { variant: "dim", speedMs: 8, lineDelayMs: 28 });
  }

  /**
   * 当 cwd 改变后，根据目录默认打开 index.html（若存在）。
   * 功能：cd 进入目录后自动渲染该目录的 index 页面；回到根目录则渲染默认页。
   * 目的：让 cd 不只是“改变路径”，还能立即让内容区与路径同步。
   */
  function maybeRenderIndex() {
    if (!renderPath) return;
    if (cwd.length === 0) {
      void renderPath(DEFAULT_PAGE);
      return;
    }
    const node = resolveDir(FILE_SYSTEM, cwd);
    const indexPath = node?.["index.md"] ?? node?.["index.html"];
    if (typeof indexPath === "string") void renderPath(indexPath);
  }

  /**
   * cd 命令实现。
   * 功能：
   * - cd（无参）：回到根目录
   * - cd ..：回到上一级
   * - cd /xxx 或 cd ~/xxx：绝对路径
   * - cd xxx：相对路径
   * 目的：提供与常见 shell 相似的路径切换体验，并联动刷新 prompt/树形输出/内容区。
   */
  async function runCd(arg) {
    const dest = arg.trim();
    if (!dest) {
      cwd = [];
      setPrompt();
      await printTreeForPath(cwd);
      maybeRenderIndex();
      return;
    }
    if (dest === "..") {
      cwd = cwd.slice(0, -1);
      setPrompt();
      await printTreeForPath(cwd);
      maybeRenderIndex();
      return;
    }
    if (dest === "/" || dest === "~") {
      cwd = [];
      setPrompt();
      await printTreeForPath(cwd);
      maybeRenderIndex();
      return;
    }
    const isAbsolute = dest.startsWith("/") || dest.startsWith("~/");
    const cleaned = dest.replace(/^~\//, "").replace(/^\//, "");
    const parts = cleaned.split("/").filter(Boolean);
    const next = isAbsolute ? [] : [...cwd];
    for (const p of parts) {
      if (p === ".") continue;
      if (p === "..") next.pop();
      else next.push(p);
    }
    const node = resolveDir(FILE_SYSTEM, next);
    if (!node) return await typewriter("cd: directory does not exist", { variant: "dim", speedMs: 8, lineDelayMs: 28 });
    cwd = next;
    setPrompt();
    await printTreeForPath(cwd);
    maybeRenderIndex();
  }

  /**
   * say 命令实现：向评论区新增一条留言。
   * 功能：调用 window.__comments.add(text) 插入新评论。
   * 目的：让终端不仅能“浏览内容”，也能做“互动行为”。
   */
  async function runSay(text) {
    const t = text.trim();
    if (!t) return await typewriter("say: please enter a message", { variant: "dim", speedMs: 8, lineDelayMs: 28 });
    try {
      const ok = await window.__comments?.add?.(t);
      if (!ok) return await typewriter("say: failed to add comment", { variant: "dim", speedMs: 8, lineDelayMs: 28 });
      await typewriter("comment added successfully", { variant: "dim", speedMs: 8, lineDelayMs: 28 });
    } catch {
      await typewriter("say: failed to add comment", { variant: "dim", speedMs: 8, lineDelayMs: 28 });
    }
  }

  /**
   * theme 命令实现：切换或展示主题。
   * 功能：
   * - theme（无参）：显示当前主题与用法
   * - theme dark/light：切换主题并持久化
   * 目的：把“视觉偏好”也纳入终端交互体系，保持风格统一。
   */
  async function runTheme(arg) {
    if (!applyTheme || !readTheme) return await typewriter("theme: theme switch not available", { variant: "dim", speedMs: 8, lineDelayMs: 28 });
    const next = arg.trim();
    if (!next) {
      await typewriter(`theme: ${readTheme()}\nusage: theme dark|light`, { variant: "dim", speedMs: 8, lineDelayMs: 28 });
      return;
    }
    if (next !== "dark" && next !== "light") {
      await typewriter("theme: invalid value (dark|light)", { variant: "dim", speedMs: 8, lineDelayMs: 28 });
      return;
    }
    applyTheme(next);
    await typewriter(`theme: switched to ${next}`, { variant: "dim", speedMs: 8, lineDelayMs: 28 });
  }

  /**
   * Admin 鉴权 Worker 配置（供 sudo login 使用）。
   *
   * 说明：
   * - 仅用于发起登录与会话校验请求；不会把 Worker 的密钥暴露到浏览器侧
   * - token 会写入 /admin 路径下的会话 Cookie，确保跳转后 admin 页面可直接读取并进入壳层
   */
  const ADMIN_LOGIN_PATH = "/admin/login";
  const ADMIN_TOKEN_STORAGE_KEY = "tdpb_admin_token_v1";
  const ADMIN_TOKEN_COOKIE_NAME = "tdpb_admin_token_v1";

  /**
   * 规范化 Admin 鉴权 Worker origin。
   * 目的：避免尾部斜杠/空字符串造成的 URL 拼接异常。
   */
  function adminWorkerOrigin() {
    const o = String(ADMIN_AUTH_WORKER_ORIGIN ?? "")
      .trim()
      .replace(/\/+$/, "");
    return o || window.location.origin;
  }

  /**
   * 拼接 Admin Worker 接口地址。
   * 目的：统一 origin + path 的拼装，降低漏写斜杠的风险。
   */
  function adminEndpoint(path) {
    const p = String(path ?? "");
    return `${adminWorkerOrigin()}${p.startsWith("/") ? p : `/${p}`}`;
  }

  /**
   * 写入/清除 admin token（sessionStorage）。
   * 目的：让 /admin 页面在同一会话内刷新时更快恢复登录态。
   */
  function writeAdminTokenToSession(token) {
    try {
      if (!token) window.sessionStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
      else window.sessionStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token);
    } catch {
      return;
    }
  }

  /**
   * 写入/清除 admin token（会话 Cookie）。
   *
   * 说明：
   * - Path=/admin：只影响管理路径
   * - 不设置 Expires/Max-Age：保持“关闭浏览器后通常失效”的会话特性
   *
   * 目的：从主站 sudo login 进入 /admin 时，admin 页无需再次输入密码即可进入壳层。
   */
  function writeAdminTokenCookie(token) {
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    if (!token) {
      document.cookie = `${ADMIN_TOKEN_COOKIE_NAME}=; Path=/admin; Max-Age=0; SameSite=Strict${secure}`;
      return;
    }
    document.cookie = `${ADMIN_TOKEN_COOKIE_NAME}=${encodeURIComponent(String(token))}; Path=/admin; SameSite=Strict${secure}`;
  }

  /**
   * 跳转到 admin 页面。
   * 目的：保持路径相对安全，避免手写字符串时被 base href/当前路径影响。
   */
  function goToAdminPage() {
    const url = new URL("./admin/", window.location.href);
    window.location.href = url.toString();
  }

  /**
   * 使用 sudo login <password> 发起管理员登录。
   * 目的：复用与 /admin 登录页一致的 Worker 协议（passwordHash -> token）。
   */
  async function loginAdminWithPassword(password) {
    const passwordHash = await sha256Hex(password);
    const res = await window.fetch(adminEndpoint(ADMIN_LOGIN_PATH), {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ passwordHash }),
    });
    if (!res.ok) return { ok: false, token: "" };
    const json = await res.json().catch(() => null);
    const token = json && typeof json === "object" && typeof json.token === "string" ? json.token : "";
    return { ok: Boolean(token), token };
  }

  /**
   * sudo 彩蛋。
   * 功能：模拟提升权限的“剧情”，临时锁定输入并播放逐字输出。
   * 目的：增加趣味性，同时展示终端渲染能力（逐字输出/锁定输入/提示符变化）。
   */
  async function runSudoEasterEgg() {
    isLocked = true;
    setInputEnabled(false);

    const prevUser = user;
    user = "root";
    setPrompt();

    appendLineInstant(`${prompt.textContent} easteregg`, "green");
    const typing = appendTypingLine("dim");
    await sleep(2000);

    beginPrinting();
    await typeIntoTextNode(typing.textNode, "Hey your naughty boy!", { speedMs: 24 });
    endPrinting();
    typing.cursor.style.display = "none";

    user = prevUser;
    setPrompt();
    isLocked = false;
    setInputEnabled(true);
  }

  /**
   * sudo login：进入管理界面。
   *
   * 行为约定：
   * - sudo / sudo <not login>：沿用原 sudo 彩蛋
   * - sudo login：提示符切为 root@blog 并跳转到 /admin
   * - sudo login <password>：用该密码尝试登录，成功后写入 token（/admin Cookie + sessionStorage）再跳转
   */
  async function runSudoLogin(args, options = {}) {
    const { prevUser } = options;
    const rest = String(args ?? "").trim();
    if (!rest || rest === "login") {
      goToAdminPage();
      return;
    }

    const password = rest.startsWith("login") ? rest.slice("login".length).trim() : "";
    if (!password) {
      goToAdminPage();
      return;
    }

    isLocked = true;
    setInputEnabled(false);
    appendLineInstant("sudo: checking credentials...", "dim");

    let ok = false;
    let token = "";
    try {
      const res = await loginAdminWithPassword(password);
      ok = Boolean(res.ok);
      token = res.token;
    } catch {
      ok = false;
    }

    if (!ok) {
      appendLineInstant("sudo: authentication failed", "dim");
      user = prevUser;
      setPrompt();
      isLocked = false;
      setInputEnabled(true);
      return;
    }

    writeAdminTokenToSession(token);
    writeAdminTokenCookie(token);
    goToAdminPage();
  }

  /**
   * 统一的命令入口：回显用户输入 -> 分发到具体命令处理 -> 输出结果。
   * 目的：把“解析/路由/回显/历史记录”集中在一起，命令实现只关注自身业务。
   */
  async function handleCommand(raw, options = {}) {
    const { typeEcho = false } = options;
    const { cmd, args } = tokenize(raw);
    if (!cmd) return;

    const prevUser = user;
    const sudoArgs = String(args ?? "").trim();
    const isSudoLogin = cmd === "sudo" && (sudoArgs === "login" || sudoArgs.startsWith("login "));
    /**
     * sudo login 的提示符策略：
     * - 只对当前命令回显临时切换为 root
     * - 不做持久化（刷新/下次进入仍是 guest）
     */
    if (isSudoLogin) {
      user = "root";
      setPrompt();
    }

    if (typeEcho) await typewriter(`${prompt.textContent} ${raw}`, { variant: "green", speedMs: 7, lineDelayMs: 0 });
    else appendLineInstant(`${prompt.textContent} ${raw}`, "green");
    history.push(raw);
    historyIndex = history.length;

    if (cmd === "sudo") {
      if (!isSudoLogin) return await runSudoEasterEgg();
      return await runSudoLogin(sudoArgs, { prevUser });
    }
    if (cmd === "help") return await printHelp();
    if (cmd === "clear") {
      output.textContent = "";
      return;
    }
    if (cmd === "ls") return await printLs();
    if (cmd === "cd") return await runCd(args);
    if (cmd === "..") return await runCd("..");
    if (cmd === "cat") return await runCat(args);
    if (cmd === "say") return await runSay(args);
    if (cmd === "theme") return await runTheme(args);
    await typewriter(`Unknown command: ${cmd} (type \`help\`)`, { variant: "dim", speedMs: 8, lineDelayMs: 28 });
  }

  /**
   * 聚焦输入框。
   * 目的：让用户随时可以继续输入命令（点击终端区域也会触发 focus）。
   */
  function focusInput() {
    input.focus();
  }

  /**
   * 键盘事件处理（终端输入框）。
   * 功能：
   * - Enter：提交命令
   * - ArrowUp/ArrowDown：浏览历史命令
   * 目的：提供标准终端交互习惯，提升可用性。
   */
  function onKeyDown(e) {
    if (isPrinting || isLocked) return;
    if (e.key === "Enter") {
      const raw = input.value;
      input.value = "";
      void handleCommand(raw);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      historyIndex = Math.max(0, historyIndex - 1);
      input.value = history[historyIndex] ?? "";
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (history.length === 0) return;
      historyIndex = Math.min(history.length, historyIndex + 1);
      input.value = historyIndex >= history.length ? "" : history[historyIndex];
      return;
    }
  }

  /**
   * 初始化提示符，并绑定输入、点击等事件。
   * 目的：将“终端是一个组件”的所有事件绑定集中在创建时完成，避免外部散落绑定代码。
   */
  setPrompt();
  input.addEventListener("keydown", onKeyDown);
  output.addEventListener("click", (e) => {
    if (isPrinting) return;
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    const link = t.closest(".terminalJump");
    if (!(link instanceof HTMLElement)) return;
    const cmd = link.dataset.cmd;
    if (!cmd) return;
    void handleCommand(cmd);
  });
  window.addEventListener("click", (e) => {
    const t = e.target;
    if (t instanceof HTMLElement && t.closest(".terminal")) focusInput();
  });

  return {
    focus: focusInput,
    run(cmd, options = {}) {
      const { echo = true } = options;
      if (isPrinting || isLocked) return;
      void handleCommand(String(cmd ?? ""), { typeEcho: echo });
    },
    /**
     * 终端启动流程。
     * 功能：
     * - 输出一条引导语
     * - 自动执行一次 ls（并回显命令），让用户立刻看到“能浏览什么”
     * 目的：首屏即有反馈，降低空白感与上手成本。
     */
    async boot() {
      await typewriter("Type `help` to see available commands.\n", { variant: "dim", speedMs: 8, lineDelayMs: 28 });
      await handleCommand("ls", { typeEcho: true });
    },
  };
}
