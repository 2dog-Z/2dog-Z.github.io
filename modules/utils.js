/**
 * 该文件提供纯工具函数（不直接操作业务 DOM，不依赖模块内部状态）。
 * 功能：封装重复的小逻辑，统一放在这里方便复用。
 * 目的：减少终端/评论/渲染器里与“核心业务无关”的细碎代码，提高可读性。
 */

import { GITHUB_WORKER_ORIGIN, GITHUB_WORKER_PASS, GITHUB_WORKER_PASS_HEADER } from "./constants.js";

/**
 * 睡眠/延时工具。
 * 功能：把 setTimeout 包装成 Promise，以便在 async/await 中自然地控制节奏。
 * 目的：用于打字机效果、内容切换过渡等需要“停一下”的交互动画。
 */
export function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

/**
 * 将字节数组转为十六进制字符串。
 * 功能：Uint8Array -> "a1b2c3..."
 * 目的：用于把 WebCrypto 的 digest/sign 输出转成可传输/可比对的文本形式。
 */
export function bytesToHex(bytes) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let out = "";
  for (let i = 0; i < arr.length; i += 1) out += arr[i].toString(16).padStart(2, "0");
  return out;
}

/**
 * SHA-256（hex）。
 * 功能：对输入文本做 SHA-256，并返回小写十六进制字符串。
 * 目的：用于前端把密码做“不可逆摘要”后再发送到 Worker，比直接传明文更安全。
 */
export async function sha256Hex(text) {
  const enc = new TextEncoder();
  const data = enc.encode(String(text ?? ""));
  const digest = await crypto.subtle.digest("SHA-256", data);
  return bytesToHex(digest);
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

/**
 * 将 GitHub API 的 URL 重写为经由 Worker 的代理 URL。
 *
 * 输入支持：
 * - 完整 URL：`https://api.github.com/...`
 * - 绝对路径：`/repos/...`（会自动补成 `https://api.github.com/repos/...`）
 *
 * 重写规则：
 * - 仅当 origin 为 `https://api.github.com` 时才重写为 `${workerOrigin}/gh...`
 * - 其它 origin 原样返回，避免误伤非 GitHub 的请求
 *
 * 目的：
 * - 让业务代码仍按“GitHub API URL”组织逻辑，但实际网络请求走 Worker；
 * - 集中处理 Worker 域名配置与路径拼装，减少重复与遗漏。
 */
export function githubApiUrlViaWorker(input, workerOrigin) {
  const origin = String(workerOrigin ?? "")
    .trim()
    .replace(/\/+$/, "");
  if (!origin || origin.includes("REPLACE_ME")) throw new Error("GitHub Worker not configured");

  const s0 = String(input ?? "").trim();
  if (!s0) return s0;

  const s = s0.startsWith("/") ? `https://api.github.com${s0}` : s0;
  const u = new URL(s, window.location.href);
  if (u.origin !== "https://api.github.com") return u.toString();
  return `${origin}/gh${u.pathname}${u.search}`;
}

/**
 * 统一的 GitHub API 请求入口（经由 Worker 中转）。
 *
 * 功能：
 * - 把 GitHub API URL 重写为 Worker 代理 URL（/gh 前缀）；
 * - 自动添加暗号 Header（Worker 侧会校验，避免被当成开放代理）；
 * - 兜底设置 GitHub API 推荐的 Accept / 版本头；
 * - 失败时保留原始 Response，交给调用方决定如何读取错误体。
 * - 支持 cacheBust：给最终请求 URL 追加时间戳参数，绕开中间缓存的延迟
 *
 * 目的：
 * - 让业务模块只关心“GitHub API 的路径/参数”，不关心 token 注入细节；
 * - 让 admin 文件管理与 comments 使用同一条安全通道（同一个 Worker + 暗号）。
 */
export async function githubRequest(url, options = {}) {
  const { cacheBust, ...rest } = options ?? {};
  const method = rest.method ?? "GET";
  const headers = new Headers(rest.headers ?? {});
  if (!headers.get("Accept")) headers.set("Accept", "application/vnd.github+json");
  if (!headers.get("X-GitHub-Api-Version")) headers.set("X-GitHub-Api-Version", "2022-11-28");
  headers.set(GITHUB_WORKER_PASS_HEADER, GITHUB_WORKER_PASS);

  const proxyUrl0 = githubApiUrlViaWorker(url, GITHUB_WORKER_ORIGIN);
  const proxyUrl = cacheBust ? withCacheBust(proxyUrl0) : proxyUrl0;
  const body = rest.body == null || method === "GET" || method === "HEAD" ? null : rest.body;
  return await window.fetch(proxyUrl, { ...rest, method, headers, body });
}

/**
 * GitHub API：读取 JSON 的便捷封装。
 *
 * 规则：
 * - ok 时返回 JSON
 * - 非 ok 时抛出 Error（带 status/text），便于管理端在控制台定位
 */
export async function githubRequestJson(url, options = {}) {
  const res = await githubRequest(url, options);
  if (res.ok) return await res.json();
  const text = await res.text().catch(() => "");
  const err = new Error(`GitHub request failed: ${res.status} ${res.statusText}${text ? ` - ${text}` : ""}`);
  err.status = res.status;
  err.statusText = res.statusText;
  err.bodyText = text;
  throw err;
}

/**
 * 从 GitHub 仓库读取 /post 目录下的文件列表，只保留 .md 文件名。
 *
 * 输出：
 * - { etag, names }
 * - 当命中 304 时：names 为 null（表示无需更新）
 *
 * 目的：
 * - 让主站与管理端复用同一份“GET 扫描 post 目录”实现；
 * - 由统一的 githubRequest() 负责走 Worker、注入暗号 Header、注入通用头。
 */
export async function fetchGithubPostMdList(config, options = {}) {
  const owner = String(config?.owner ?? "").trim();
  const repo = String(config?.repo ?? "").trim();
  if (!owner || !repo) throw new Error("GitHub repo not configured");

  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/post?per_page=100`;
  const headers = new Headers();
  if (options.etag) headers.set("If-None-Match", String(options.etag));

  const res = await githubRequest(url, { method: "GET", headers, cacheBust: true });
  if (res.status === 304) return { etag: options.etag ?? "", names: null };
  if (!res.ok) throw new Error(`GitHub API ${res.status}`);

  const etag = res.headers.get("ETag") || "";
  const json = await res.json().catch(() => null);
  const items = Array.isArray(json) ? json : [];
  const names = items
    .map((x) => (x && typeof x === "object" ? x : null))
    .filter(Boolean)
    .filter((x) => x.type === "file" && typeof x.name === "string" && x.name.toLowerCase().endsWith(".md"))
    .map((x) => x.name);
  return { etag, names };
}

/**
 * 给 URL 追加时间戳参数（t=...）。
 * 目的：在 GitHub Pages/中间代理存在缓存延迟时，强制命中最新状态。
 */
function withCacheBust(input) {
  const s0 = String(input ?? "").trim();
  if (!s0) return s0;
  const u = new URL(s0, window.location.href);
  u.searchParams.set("t", String(Date.now()));
  return u.toString();
}
