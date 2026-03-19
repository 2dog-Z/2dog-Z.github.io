/**
 * Cloudflare Worker：评论邮件提醒（New Comment Notification）。
 *
 * 使用场景：
 * - 当有人在 2dogz.net 留言（评论写入 GitHub issue comments）时，由“GitHub 代理 Worker”
 *   异步调用本 Worker 的 HTTP 接口；
 * - 本 Worker 负责把评论摘要发送到指定邮箱，避免在前端直连邮件服务。
 *
 * 设计要点：
 * - 只提供一个最小入口：POST /notify
 * - 使用共享密钥 Header 校验来源，避免被当成公共邮件发送器
 * - 发送邮件使用 MailChannels（无需额外 API Key，适合 Worker 场景）
 *
 * 注意：
 * - 为了便于复制到 Cloudflare Workers，本文件使用常量 REPLACE_ME 占位；
 * - 真正上线建议把敏感信息（密钥、收件人邮箱）放到 Worker 环境变量（env）中管理。
 */

const NOTIFY_PASS_HEADER = "REPLACE";
const NOTIFY_PASS_VALUE = "REPLACE";

const NOTIFY_TO = "REPLACE";
const NOTIFY_FROM = "REPLACE";

const MAILCHANNELS_ENDPOINT = "https://api.mailchannels.net/tx/v1/send";

function jsonResponse(obj, init = {}) {
  const body = JSON.stringify(obj ?? {});
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json; charset=utf-8");
  return new Response(body, { ...init, headers });
}

function parseJsonBody(text) {
  try {
    const x = JSON.parse(String(text ?? ""));
    return x && typeof x === "object" ? x : null;
  } catch {
    return null;
  }
}

function isConfigured() {
  if (String(NOTIFY_PASS_HEADER).includes("REPLACE_ME")) return false;
  if (String(NOTIFY_PASS_VALUE).includes("REPLACE_ME")) return false;
  if (String(NOTIFY_TO).includes("REPLACE_ME")) return false;
  if (String(NOTIFY_FROM).includes("REPLACE_ME")) return false;
  return true;
}

function buildEmailText(payload) {
  const title = String(payload?.title ?? "").trim() || "(untitled)";
  const name = String(payload?.name ?? "").trim() || "(anonymous)";
  const time = String(payload?.date ?? "").trim() || "";
  const page = String(payload?.page ?? "").trim() || "";
  const text = String(payload?.text ?? "").trim() || "";

  return [
    `Title: ${title}`,
    `Name: ${name}`,
    time ? `Time: ${time}` : "",
    page ? `Page: ${page}` : "",
    "",
    text,
  ]
    .filter(Boolean)
    .join("\n");
}

async function sendNotificationEmail(payload) {
  const content = buildEmailText(payload);

  const msg = {
    personalizations: [{ to: [{ email: NOTIFY_TO }] }],
    from: { email: NOTIFY_FROM, name: "2dogz.net" },
    subject: "2dogz.net New Comment",
    content: [{ type: "text/plain", value: content }],
  };

  const res = await fetch(MAILCHANNELS_ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(msg),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`mail send failed: HTTP ${res.status} ${text}`.trim());
  }
  return true;
}

export default {
  /**
   * Worker 入口（HTTP）。
   *
   * 路由约定：
   * - POST /notify：发送邮件提醒
   *
   * 输入 JSON：
   * - title：文章标题
   * - name：昵称
   * - date：时间（ISO 字符串）
   * - text：评论内容
   * - page：页面路径（可选）
   */
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204 });
    if (url.pathname !== "/notify") return new Response("Not Found", { status: 404 });
    if (request.method !== "POST") return new Response("Method Not Allowed", { status: 405 });

    if (!isConfigured()) return new Response("Worker not configured", { status: 500 });

    const pass = request.headers.get(NOTIFY_PASS_HEADER) || "";
    if (pass !== NOTIFY_PASS_VALUE) return new Response("Forbidden", { status: 403 });

    const raw = await request.text();
    const data = parseJsonBody(raw);
    if (!data) return jsonResponse({ ok: false, error: "invalid json" }, { status: 400 });

    const title = String(data?.title ?? "").trim();
    const name = String(data?.name ?? "").trim();
    const date = String(data?.date ?? "").trim();
    const text = String(data?.text ?? "").trim();
    const page = String(data?.page ?? "").trim();
    if (!title || !name || !date || !text) return jsonResponse({ ok: false, error: "missing fields" }, { status: 400 });

    ctx.waitUntil(sendNotificationEmail({ title, name, date, text, page }));
    return jsonResponse({ ok: true }, { status: 200 });
  },
};

