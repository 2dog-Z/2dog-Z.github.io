/**
 * Cloudflare Worker：管理后台登录校验（密码哈希匹配 + Token 会话）。
 *
 * 实现目标：
 * - 前端只发送 SHA-256(password) 的十六进制字符串，不直接发送明文密码
 * - Worker 负责匹配哈希，匹配成功后返回带过期时间的会话 token
 * - 前端通过 /admin/session 验证 token；未登录时不加载管理界面资源
 *
 * 路由约定：
 * - POST /admin/login    { passwordHash: "<sha256 hex>" }  -> 200 { ok:true, token, exp }
 * - GET  /admin/session  -> 204（已登录）/ 401（未登录）  （使用 Authorization: Bearer <token>）
 *
 * 注意：
 * - 这不是“零知识”认证；如果攻击者能长期控制浏览器/网络或拿到 token，仍然可复用会话。
 * - 真正上线时建议把 PASSWORD_SHA256_HEX 与 SESSION_HMAC_SECRET 放到环境变量中管理。
 */

const PASSWORD_SHA256_HEX = "REPLACE_ME";
const SESSION_HMAC_SECRET = "REPLACE_ME";

/**
 * 会话有效期（秒）。
 * 目的：控制 token 的最长可用时间；过期后必须重新登录。
 */
const SESSION_TTL_SECONDS = 60 * 60 * 6;

/**
 * 选择允许的 CORS Origin。
 * 功能：优先回显请求 Origin，缺失时回退为 "*"。
 * 目的：让管理页在跨域调用 Worker 时可以正常读取响应。
 */
function pickCorsOrigin(request) {
  const origin = request.headers.get("Origin");
  return origin && origin !== "null" ? origin : "*";
}

/**
 * 生成 CORS 响应头。
 *
 * 说明：
 * - 允许 Authorization：用于 Bearer token 校验
 * - 允许 OPTIONS：用于预检请求
 *
 * 目的：让浏览器端 fetch 可以跨域请求 Worker，并读取结果。
 */
function corsHeaders(request) {
  const allowOrigin = pickCorsOrigin(request);
  const headers = {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept, Authorization",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
  return headers;
}

/**
 * 给任意响应补齐 CORS 头。
 * 目的：避免每个分支都手写 CORS 逻辑导致遗漏。
 */
function withCors(request, response, extraHeaders = {}) {
  const h = new Headers(response.headers);
  const cors = corsHeaders(request);
  for (const [k, v] of Object.entries(cors)) h.set(k, v);
  for (const [k, v] of Object.entries(extraHeaders)) h.set(k, v);
  return new Response(response.body, { status: response.status, headers: h });
}

/**
 * 返回 JSON 响应。
 * 目的：统一 Content-Type，并保证输出格式稳定。
 */
function jsonResponse(obj, init = {}) {
  const body = JSON.stringify(obj ?? {});
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  return new Response(body, { ...init, headers });
}

/**
 * 文本转字节数组。
 * 目的：为 WebCrypto 的签名/验签提供统一的输入编码（UTF-8）。
 */
function textToBytes(text) {
  return new TextEncoder().encode(String(text ?? ""));
}

/**
 * base64url 编码（无 padding）。
 * 目的：让 token 在 URL/Header 场景下更安全（避免 '+' '/' '='）。
 */
function base64UrlEncode(bytes) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (let i = 0; i < arr.length; i += 1) binary += String.fromCharCode(arr[i]);
  const b64 = btoa(binary);
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

/**
 * base64url 解码为字节数组。
 * 目的：用于从 token 中恢复 payload 与签名。
 */
function base64UrlDecodeToBytes(s) {
  const t = String(s ?? "").replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (t.length % 4)) % 4;
  const padded = t + "=".repeat(padLen);
  const binary = atob(padded);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
  return out;
}

/**
 * HMAC-SHA256。
 * 输入：secret + messageBytes
 * 输出：签名字节数组
 * 目的：给 token 做签名/防篡改校验，避免客户端伪造 exp。
 */
async function hmacSha256(secret, messageBytes) {
  const key = await crypto.subtle.importKey("raw", textToBytes(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, messageBytes);
  return new Uint8Array(sig);
}

/**
 * 定时安全比较（简化版）。
 * 目的：避免直接 === 比较导致的时序差异过明显（降低被侧信道探测的风险）。
 */
function timingSafeEqual(a, b) {
  const sa = String(a ?? "");
  const sb = String(b ?? "");
  const len = Math.max(sa.length, sb.length);
  let diff = sa.length ^ sb.length;
  for (let i = 0; i < len; i += 1) diff |= (sa.charCodeAt(i) || 0) ^ (sb.charCodeAt(i) || 0);
  return diff === 0;
}

/**
 * 解析 JSON 请求体。
 * 目的：让 Worker 对异常输入更健壮，避免抛出导致 500。
 */
function parseJsonBody(text) {
  try {
    const x = JSON.parse(String(text ?? ""));
    return x && typeof x === "object" ? x : null;
  } catch {
    return null;
  }
}

/**
 * 读取 Authorization: Bearer token。
 * 目的：统一 token 的携带方式，避免使用 query/cookie 暴露在更多位置。
 */
function readBearerToken(request) {
  const auth = request.headers.get("Authorization") || "";
  const m = auth.match(/^\s*Bearer\s+(.+?)\s*$/i);
  return m ? m[1] : "";
}

/**
 * 生成会话 token。
 * 结构：base64url(payload).base64url(hmac(payload))
 *
 * payload 字段：
 * - v：版本号（预留升级）
 * - iat：签发时间（秒）
 * - exp：过期时间（秒）
 */
async function createSessionTokenValue(nowMs) {
  const iat = Math.floor(nowMs / 1000);
  const exp = iat + SESSION_TTL_SECONDS;
  const payload = base64UrlEncode(textToBytes(JSON.stringify({ v: 1, iat, exp })));
  const sig = await hmacSha256(SESSION_HMAC_SECRET, textToBytes(payload));
  const token = `${payload}.${base64UrlEncode(sig)}`;
  return { token, exp };
}

/**
 * 校验会话 token。
 * 规则：
 * - 签名必须匹配（防篡改）
 * - exp 必须未过期（防长期复用）
 */
async function verifySessionTokenValue(token, nowMs) {
  const s = String(token ?? "");
  const dot = s.indexOf(".");
  if (dot <= 0) return false;
  const payload = s.slice(0, dot);
  const sigB64 = s.slice(dot + 1);
  if (!payload || !sigB64) return false;

  const expectSig = await hmacSha256(SESSION_HMAC_SECRET, textToBytes(payload));
  const gotSig = base64UrlEncode(base64UrlDecodeToBytes(sigB64));
  const expectSigB64 = base64UrlEncode(expectSig);
  if (!timingSafeEqual(gotSig, expectSigB64)) return false;

  const payloadBytes = base64UrlDecodeToBytes(payload);
  const data = parseJsonBody(new TextDecoder().decode(payloadBytes));
  if (!data) return false;
  const exp = Number.isFinite(data.exp) ? data.exp : 0;
  const nowSec = Math.floor(nowMs / 1000);
  if (!exp || nowSec >= exp) return false;
  return true;
}

export default {
  /**
   * Worker 入口。
   *
   * 路由：
   * - /admin/login：验证 passwordHash，签发 token
   * - /admin/session：验证 token 是否仍有效
   *
   * 目的：让管理页在跨域场景也能维持登录态，同时不把密钥暴露到浏览器侧。
   */
  async fetch(request) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(request) });

    const url = new URL(request.url);
    const nowMs = Date.now();

    if (url.pathname === "/admin/session" && request.method === "GET") {
      if (String(SESSION_HMAC_SECRET).includes("REPLACE_ME")) {
        return withCors(request, new Response("Worker not configured", { status: 500 }));
      }
      const token = readBearerToken(request);
      const ok = await verifySessionTokenValue(token, nowMs);
      if (!ok) return withCors(request, new Response("Unauthorized", { status: 401 }));
      return withCors(request, new Response(null, { status: 204 }));
    }

    if (url.pathname === "/admin/login" && request.method === "POST") {
      if (String(PASSWORD_SHA256_HEX).includes("REPLACE_ME") || String(SESSION_HMAC_SECRET).includes("REPLACE_ME")) {
        return withCors(request, new Response("Worker not configured", { status: 500 }));
      }

      const raw = await request.text();
      const data = parseJsonBody(raw);
      const passwordHash = data && typeof data.passwordHash === "string" ? data.passwordHash.trim().toLowerCase() : "";
      const ok = passwordHash && timingSafeEqual(passwordHash, String(PASSWORD_SHA256_HEX).trim().toLowerCase());
      if (!ok) return withCors(request, jsonResponse({ ok: false }, { status: 401 }));

      const session = await createSessionTokenValue(nowMs);
      return withCors(request, jsonResponse({ ok: true, token: session.token, exp: session.exp }, { status: 200 }));
    }

    return withCors(request, new Response("Not Found", { status: 404 }));
  },
};
