/**
 * 该文件提供纯工具函数（不直接操作业务 DOM，不依赖模块内部状态）。
 * 功能：封装重复的小逻辑，统一放在这里方便复用。
 * 目的：减少终端/评论/渲染器里与“核心业务无关”的细碎代码，提高可读性。
 */

/**
 * 睡眠/延时工具。
 * 功能：把 setTimeout 包装成 Promise，以便在 async/await 中自然地控制节奏。
 * 目的：用于打字机效果、内容切换过渡等需要“停一下”的交互动画。
 */
export function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

/**
 * 生成随机昵称（用于评论区的匿名用户）。
 * 功能：生成可读的随机字符串，形如 "abcd12_x9k3"。
 * 目的：让示例评论看起来更像真实用户，而不是一堆重复的 placeholder。
 */
export function randomNickname() {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  const segments = [];
  const segCount = 2 + Math.floor(Math.random() * 2);
  for (let i = 0; i < segCount; i += 1) {
    const len = 4 + Math.floor(Math.random() * 4);
    let seg = "";
    for (let j = 0; j < len; j += 1) seg += alphabet[Math.floor(Math.random() * alphabet.length)];
    segments.push(seg);
  }
  return segments.join("_");
}

/**
 * 日期格式化（YYYY-MM-DD）。
 * 功能：将 Date 对象转为固定格式字符串，便于在 UI 中展示。
 * 目的：统一评论时间显示格式，避免各处用不同的 toLocaleString 导致风格不一致。
 */
export function formatDate(d) {
  const yyyy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * 将用户输入拆分成“命令 + 参数”。
 * 功能：只按第一个空格分割：前半是 cmd，后半是 args（允许 args 里包含空格）。
 * 目的：终端命令解析保持简单稳定，避免引入复杂 shell 语法带来的边界问题。
 */
export function tokenize(input) {
  const trimmed = input.trim();
  if (!trimmed) return { cmd: "", args: "" };
  const firstSpace = trimmed.indexOf(" ");
  if (firstSpace === -1) return { cmd: trimmed, args: "" };
  return { cmd: trimmed.slice(0, firstSpace), args: trimmed.slice(firstSpace + 1).trim() };
}

/**
 * 把当前工作目录（数组）拼成类似 shell 的展示路径。
 * 功能：[] -> "~"，["post"] -> "~/post"。
 * 目的：让 prompt 更像真实命令行，提高沉浸感和可读性。
 */
export function joinPath(parts) {
  if (parts.length === 0) return "~";
  return `~/${parts.join("/")}`;
}

/**
 * 去掉文件扩展名。
 * 功能："index.html" -> "index"，"README" -> "README"。
 * 目的：让终端里显示文件名更干净，并支持 cat index 这类更自然的输入。
 */
export function stripFileExtension(filename) {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot <= 0) return filename;
  return filename.slice(0, lastDot);
}

/**
 * 在“虚拟文件系统”中按路径定位目录节点。
 * 功能：根据 pathParts 逐级查找对象，成功则返回目录对象，失败返回 null。
 * 目的：为 cd/ls/cat 等命令提供统一的路径解析基础。
 */
export function resolveDir(fs, pathParts) {
  let node = fs;
  for (const p of pathParts) {
    if (!node || typeof node !== "object") return null;
    const next = node[p];
    if (!next || typeof next !== "object") return null;
    node = next;
  }
  return node;
}

/**
 * 列出某个目录下的内容（目录优先显示为 xxx/，文件显示去扩展名）。
 * 功能：用于 ls 输出，既能列根目录，也能列子目录。
 * 目的：把“虚拟文件系统”的内部结构转换成适合终端展示的字符串数组。
 */
export function listDir(fs, pathParts) {
  if (pathParts.length === 0) return Object.keys(fs).sort().map((name) => `${name}/`);
  const node = resolveDir(fs, pathParts);
  if (!node) return null;
  const dirs = [];
  const files = [];
  for (const [k, v] of Object.entries(node)) {
    if (v && typeof v === "object") dirs.push(`${k}/`);
    else files.push(stripFileExtension(k));
  }
  return [...dirs.sort(), ...files.sort()];
}
