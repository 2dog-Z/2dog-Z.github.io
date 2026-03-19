/**
 * Cloudflare Worker：GitHub API 代理（中转站）。
 *
 * 实现目标：
 * - 前端不保存 GitHub token：浏览器只能访问 Worker，Worker 才持有 token；
 * - Worker 校验一个“暗号 Header”（共享密钥），通过后才向上游 GitHub 注入 Authorization；
 * - 保持前端调用方式尽量不变：仍然请求 GitHub API 路径，只是域名换成 Worker，并加一个 Header。
 *
 * 思路：
 * 1) 前端请求：GET/POST ... https://<worker>/gh/<github-api-path>，并带上 Header；
 * 2) Worker 校验暗号：不通过直接 403；
 * 3) Worker 拼出上游 URL：https://api.github.com/<github-api-path>；
 * 4) Worker 转发请求：复制必要 header/body，并注入 Authorization: Bearer <token>；
 * 5) Worker 返回上游响应：透传 status/body，并补齐 CORS，让浏览器可读。
 *
 * 重要提醒：
 * - 这里的“暗号”属于最低成本的访问控制，并非强身份认证；不要把 Worker 暴露为公共开放代理。
 * - token 写在 Worker 代码中更安全，但仍属于“服务器端明文”，需要像服务器密钥一样管理与轮换。
 */
const GITHUB_TOKEN = "REPLACE_ME";
const PASS_HEADER = "REPLACE_ME";
const PASS_VALUE = "REPLACE_ME";
const UPSTREAM_ORIGIN = "https://api.github.com";

/**
 * 评论邮件提醒 Worker 配置。
 *
 * 说明：
 * - 当检测到“新增 GitHub issue comment”请求并且上游创建成功时，Worker 会异步调用该地址发送邮件提醒
 * - 邮件发送由独立 Worker 实现（见 email_cloudflare.js），主代理 Worker 只负责转发与触发通知
 *
 * 安全提示：
 * - NOTIFY_PASS_* 是另一个共享密钥，用于防止邮件 Worker 被当成公共发送器
 * - 建议把这些配置迁移到 Worker 环境变量中管理
 */
const NOTIFY_WORKER_URL = "REPLACE";
const NOTIFY_PASS_HEADER = "REPLACE";
const NOTIFY_PASS_VALUE = "REPLACE";

const COMMENT_MARKER = "TDPB_COMMENT/v1";

/**
 * 生成浏览器可用的 CORS 响应头。
 *
 * 功能：
 * - 允许页面脚本读取 Worker 响应（否则浏览器会拦截）；
 * - 支持预检（OPTIONS）与常用方法；
 * - 明确允许前端发送暗号 Header 以及 GitHub API 常用请求头。
 *
 * 目的：
 * - 让前端可以像直接请求 api.github.com 一样使用 fetch，而不会被跨域限制挡住。
 */
function corsHeaders(request) {
  const origin = request.headers.get("Origin") || "*";
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": `${PASS_HEADER}, Content-Type, Accept, X-GitHub-Api-Version, If-None-Match`,
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function isNotifyConfigured() {
  if (String(NOTIFY_WORKER_URL).includes("REPLACE_ME")) return false;
  if (String(NOTIFY_PASS_HEADER).includes("REPLACE_ME")) return false;
  if (String(NOTIFY_PASS_VALUE).includes("REPLACE_ME")) return false;
  return true;
}

function parseJsonBody(text) {
  try {
    const x = JSON.parse(String(text ?? ""));
    return x && typeof x === "object" ? x : null;
  } catch {
    return null;
  }
}

function parseCommentPayloadFromIssueCommentBody(body) {
  /**
   * 从 issue comment 的 body 中解析出“评论业务字段”。
   *
   * 约定：
   * - 前端写入的 comment body 以 COMMENT_MARKER 开头，后续紧跟一段 JSON
   * - JSON 字段：page/title/name/text/date（title 为后续新增字段，旧评论可能缺失）
   *
   * 目的：
   * - 代理 Worker 不需要理解前端业务，只在“确定是本项目评论”时触发提醒
   * - 避免误把其它用途的 issue comment 当成评论提醒发送
   */
  const s0 = String(body ?? "");
  const s = s0.trimStart();
  if (!s.startsWith(COMMENT_MARKER)) return null;
  const jsonText = s.slice(COMMENT_MARKER.length).trim().replace(/^\n+/, "");
  if (!jsonText) return null;
  const data = parseJsonBody(jsonText);
  if (!data) return null;
  const page = String(data?.page ?? "").trim();
  const title = String(data?.title ?? "").trim();
  const name = String(data?.name ?? "").trim();
  const text = String(data?.text ?? "").trim();
  const date = String(data?.date ?? "").trim();
  if (!page || !name || !text || !date) return null;
  return { page, title: title || page, name, text, date };
}

function shouldNotifyForRequest(url, method) {
  if (method !== "POST") return false;
  const p = String(url?.pathname ?? "");
  return /^\/gh\/repos\/[^/]+\/[^/]+\/issues\/\d+\/comments$/.test(p);
}

export default {
  /**
   * Worker 入口。
   *
   * 路由约定：
   * - 仅处理 /gh 或 /gh/* 路径，避免意外把 Worker 变成任意代理；
   * - /gh 映射到 GitHub API 根路径 /；
   * - /gh/<path> 映射到 GitHub API 的 /<path>。
   */
  async fetch(request, env, ctx) {
    /**
     * 处理预检请求（浏览器在发送带自定义 Header 的跨域请求前会先发 OPTIONS）。
     * 返回 204 + CORS 头即可。
     */
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(request) });

    /**
     * 最简单的“暗号”校验：
     * - 前端必须带 PASS_HEADER，并且值完全匹配 PASS_VALUE；
     * - 不通过直接拒绝，不会触发任何对上游 GitHub 的请求。
     */
    const pass = request.headers.get(PASS_HEADER) || "";
    if (pass !== PASS_VALUE) return new Response("Forbidden", { status: 403, headers: corsHeaders(request) });

    const url = new URL(request.url);
    if (url.pathname !== "/gh" && !url.pathname.startsWith("/gh/")) return new Response("Not Found", { status: 404, headers: corsHeaders(request) });

    /**
     * 构建上游 GitHub API URL：
     * - 固定 origin 为 https://api.github.com；
     * - pathname 去掉前缀 /gh；
     * - query 原样透传（例如 per_page、page、since、If-None-Match 等相关场景）。
     */
    const upstreamUrl = new URL(UPSTREAM_ORIGIN);
    upstreamUrl.pathname = url.pathname === "/gh" ? "/" : url.pathname.slice(3);
    upstreamUrl.search = url.search;

    /**
     * 组装上游请求头：
     * - 复制前端请求头，删除暗号 Header，避免泄露；
     * - 注入 Authorization，从而实现“前端无 token、Worker 代签”；
     * - 兜底设置 GitHub API 推荐的 Accept / 版本头；
     * - 给出一个 User-Agent，便于 GitHub 侧识别请求来源（有些环境会要求存在）。
     */
    const headers = new Headers(request.headers);
    headers.delete(PASS_HEADER);
    headers.set("Authorization", `Bearer ${GITHUB_TOKEN}`);
    if (!headers.get("Accept")) headers.set("Accept", "application/vnd.github+json");
    if (!headers.get("X-GitHub-Api-Version")) headers.set("X-GitHub-Api-Version", "2022-11-28");
    if (!headers.get("User-Agent")) headers.set("User-Agent", "tdpb-worker");

    const shouldNotify = isNotifyConfigured() && shouldNotifyForRequest(url, request.method);
    let notifyPayload = null;
    if (shouldNotify) {
      const clone = request.clone();
      const raw = await clone.text();
      const json = parseJsonBody(raw);
      const body = String(json?.body ?? "");
      notifyPayload = parseCommentPayloadFromIssueCommentBody(body);
    }

    /**
     * 转发请求到上游：
     * - GET/HEAD 不带 body；
     * - 其它方法透传原 body（JSON 或其它类型）；
     * - 响应主体直接透传，减少内存拷贝与延迟。
     */
    const upstreamRes = await fetch(upstreamUrl.toString(), {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? null : request.body,
      redirect: "manual",
    });

    /**
     * 异步触发邮件提醒：
     * - 仅在“新增评论”请求且上游创建成功时触发（GitHub 返回 201）
     * - 通过 ctx.waitUntil 保证不会阻塞当前请求的响应
     */
    if (notifyPayload && upstreamRes.status === 201) {
      const p = fetch(NOTIFY_WORKER_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          [NOTIFY_PASS_HEADER]: NOTIFY_PASS_VALUE,
        },
        body: JSON.stringify(notifyPayload),
      }).catch(() => {});
      ctx.waitUntil(p);
    }

    /**
     * 组装返回给浏览器的响应：
     * - 透传上游 headers/status/body；
     * - 追加 CORS 头，保证浏览器可读；
     * - 使用 Vary: Origin，避免中间缓存把一个 origin 的响应错发给另一个 origin。
     */
    const resHeaders = new Headers(upstreamRes.headers);
    const cors = corsHeaders(request);
    for (const [k, v] of Object.entries(cors)) resHeaders.set(k, v);
    return new Response(upstreamRes.body, { status: upstreamRes.status, headers: resHeaders });
  },
};
