/**
 * 管理页入口脚本。
 *
 * 功能：
 * - 展示一个静态、极简的登录界面
 * - 使用浏览器端 SHA-256 对密码做哈希，再交给 Cloudflare Worker 进行匹配
 * - 登录成功后不跳转，平滑过渡到管理容器，并动态加载管理界面模块
 *
 * 重要约定：
 * - 未登录时不 import 管理界面模块，避免其出现在 Resources 中
 * - 管理域与 Worker 不同域时，使用 Bearer token 管理登录态（sessionStorage + /admin 会话 Cookie）
 */

import { ADMIN_AUTH_WORKER_ORIGIN } from "../modules/constants.js";
import { sha256Hex } from "../modules/utils.js";

/**
 * Cloudflare Worker 的域名（用于 /admin/login 与 /admin/session）。
 * - 如果管理页与 Worker 同域，可保持空字符串（默认使用当前 origin）
 * - 如果是独立 Worker 域名，请替换为 https://xxx.workers.dev
 */
const ADMIN_WORKER_ORIGIN = ADMIN_AUTH_WORKER_ORIGIN;

const SESSION_PATH = "/admin/session";
const LOGIN_PATH = "/admin/login";
const SESSION_STORAGE_KEY = "tdpb_admin_token_v1";
const SESSION_COOKIE_NAME = "tdpb_admin_token_v1";

/**
 * 规范化 Worker origin。
 * 功能：去掉尾部斜杠，并在未配置时回退到当前 origin（便于同域开发/联调）。
 * 目的：保证 endpoint() 拼接稳定，避免出现双斜杠或空域名导致的请求失败。
 */
function workerOrigin() {
  const o = String(ADMIN_WORKER_ORIGIN ?? "")
    .trim()
    .replace(/\/+$/, "");
  return o || window.location.origin;
}

/**
 * 拼接 Worker 接口地址。
 * 目的：统一处理 origin + path 的拼装，减少硬编码与漏写斜杠的错误。
 */
function endpoint(path) {
  return `${workerOrigin()}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * 设置提示信息（含错误态）。
 * 目的：让登录页在异步检查/提交过程中始终有明确反馈。
 */
function setHint(el, text, options = {}) {
  const { isError = false } = options;
  el.textContent = String(text ?? "");
  el.classList.toggle("adminHintError", Boolean(isError));
}

/**
 * 会话持久化策略（满足：刷新仍保持登录；退出浏览器后需重新登录）：
 * - sessionStorage：保证刷新/前进后退不丢失
 * - Session Cookie（不设置 Expires/Max-Age）：保证同一浏览器会话内刷新可恢复；关闭浏览器后通常失效
 *
 * 注意：
 * - 该 Cookie 是“管理域本地 Cookie”，只用于本地恢复 token；实际调用 Worker 仍走 Authorization: Bearer
 */
function readSessionCookieToken() {
  const raw = String(document.cookie || "");
  if (!raw) return "";
  const parts = raw.split(";").map((x) => x.trim());
  for (const p of parts) {
    if (!p) continue;
    const idx = p.indexOf("=");
    if (idx <= 0) continue;
    const k = p.slice(0, idx).trim();
    const v = p.slice(idx + 1).trim();
    if (k !== SESSION_COOKIE_NAME) continue;
    try {
      return decodeURIComponent(v);
    } catch {
      return v;
    }
  }
  return "";
}

/**
 * 写入/清除“会话 Cookie token”。
 *
 * 说明：
 * - 不设置 Expires/Max-Age：让它成为 session cookie（通常随浏览器进程结束而消失）
 * - Path=/admin：只在管理路径下生效，避免对主站其它路径造成干扰
 * - SameSite=Strict：减少跨站携带风险（这里 Cookie 仅用于本地恢复 token）
 */
function writeSessionCookieToken(token) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  const base = `${SESSION_COOKIE_NAME}=${encodeURIComponent(String(token || ""))}; Path=/admin; SameSite=Strict${secure}`;
  if (!token) {
    document.cookie = `${SESSION_COOKIE_NAME}=; Path=/admin; Max-Age=0; SameSite=Strict${secure}`;
    return;
  }
  document.cookie = base;
}

/**
 * 读取 token（sessionStorage）。
 * 目的：刷新时优先复用当前会话内的 token，避免额外的 cookie 解析。
 */
function readSessionToken() {
  try {
    return window.sessionStorage.getItem(SESSION_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

/**
 * 写入/清除 token（sessionStorage）。
 * 目的：让刷新/前进后退时仍保持登录态，同时不把 token 长期落盘。
 */
function writeSessionToken(token) {
  try {
    if (!token) window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    else window.sessionStorage.setItem(SESSION_STORAGE_KEY, token);
  } catch {
    return;
  }
}

/**
 * 会话校验。
 * 输入：token
 * 输出：true/false（是否仍有效）
 * 目的：避免仅凭本地存储判断登录态，必须由 Worker 确认 token 未过期且签名有效。
 */
async function checkSession(token) {
  const res = await window.fetch(endpoint(SESSION_PATH), {
    method: "GET",
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
  });
  return res.ok;
}

/**
 * 使用密码进行登录。
 * 输入：password（明文，仅在浏览器内参与 hash）
 * 输出：{ ok, token }
 *
 * 目的：
 * - 前端先做 SHA-256(password) 再发送，避免直接传输明文密码
 * - Worker 负责匹配哈希并返回会话 token
 */
async function loginWithPassword(password) {
  const passwordHash = await sha256Hex(password);
  const res = await window.fetch(endpoint(LOGIN_PATH), {
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
 * 切换“登录界面/管理界面”的可见性。
 * 目的：不跳转地完成登录过渡，并保持动效平滑。
 */
function activateStage(loginStage, adminStage, stage) {
  const loginOn = stage === "login";
  loginStage.classList.toggle("adminStageActive", loginOn);
  adminStage.classList.toggle("adminStageActive", !loginOn);
}

/**
 * 进入管理界面。
 * 关键点：这里使用动态 import，确保未登录时管理模块不出现在 Resources 中。
 */
async function enterAdmin(adminViewport) {
  const mod = await import("./adminView.js");
  const renderAdmin = typeof mod?.renderAdmin === "function" ? mod.renderAdmin : null;
  if (renderAdmin) renderAdmin(adminViewport);
}

window.addEventListener("DOMContentLoaded", () => {
  const loginStage = document.getElementById("loginStage");
  const adminStage = document.getElementById("adminStage");
  const passwordInput = document.getElementById("adminPassword");
  const loginBtn = document.getElementById("adminLoginBtn");
  const hint = document.getElementById("adminHint");
  const adminViewport = document.getElementById("adminViewport");

  if (!(loginStage instanceof HTMLElement)) return;
  if (!(adminStage instanceof HTMLElement)) return;
  if (!(passwordInput instanceof HTMLInputElement)) return;
  if (!(loginBtn instanceof HTMLElement)) return;
  if (!(hint instanceof HTMLElement)) return;
  if (!(adminViewport instanceof HTMLElement)) return;

  let isBusy = false;

  /**
   * 控制登录交互忙碌态。
   * 目的：避免重复提交、并在异步阶段给出明确的可用性反馈。
   */
  function setBusy(next) {
    isBusy = Boolean(next);
    passwordInput.disabled = isBusy;
    loginBtn.style.pointerEvents = isBusy ? "none" : "auto";
    loginBtn.style.opacity = isBusy ? "0.7" : "1";
  }

  /**
   * 启动时自动检查会话。
   * 策略：先读 sessionStorage，再读会话 Cookie；无效则清理本地残留并回到登录页。
   */
  async function boot() {
    setBusy(true);
    setHint(hint, "Checking session…");
    let ok = false;
    try {
      let token = readSessionToken();
      if (!token) token = readSessionCookieToken();
      ok = token ? await checkSession(token) : false;
      if (ok && token) writeSessionToken(token);
      if (!ok) {
        writeSessionToken("");
        writeSessionCookieToken("");
      }
    } catch {
      ok = false;
    }
    if (ok) {
      setHint(hint, "");
      activateStage(loginStage, adminStage, "admin");
      try {
        await enterAdmin(adminViewport);
      } finally {
        setBusy(false);
      }
      return;
    }
    setHint(hint, "");
    activateStage(loginStage, adminStage, "login");
    passwordInput.focus();
    setBusy(false);
  }

  /**
   * 提交登录。
   * 行为：
   * - 为空：提示并聚焦
   * - 失败：清理 token 并停留登录页
   * - 成功：写入 token（sessionStorage + 会话 Cookie），淡入显示管理容器，并动态加载管理模块
   */
  async function submit() {
    if (isBusy) return;
    const password = passwordInput.value;
    if (!String(password ?? "").trim()) {
      setHint(hint, "Password required.", { isError: true });
      passwordInput.focus();
      return;
    }

    setBusy(true);
    setHint(hint, "Signing in…");
    let ok = false;
    let token = "";
    try {
      const res = await loginWithPassword(password);
      ok = Boolean(res.ok);
      token = res.token;
    } catch {
      ok = false;
    }

    if (!ok) {
      setHint(hint, "Invalid password.", { isError: true });
      passwordInput.value = "";
      passwordInput.focus();
      writeSessionToken("");
      writeSessionCookieToken("");
      setBusy(false);
      return;
    }

    setHint(hint, "");
    writeSessionToken(token);
    writeSessionCookieToken(token);
    activateStage(loginStage, adminStage, "admin");
    try {
      await enterAdmin(adminViewport);
    } finally {
      setBusy(false);
    }
  }

  /**
   * 点击按钮提交。
   * 目的：保持“命令按钮”风格一致，同时符合鼠标用户习惯。
   */
  loginBtn.addEventListener("click", (e) => {
    e.preventDefault();
    void submit();
  });

  /**
   * Enter 提交。
   * 目的：符合用户对密码输入框的默认期望。
   */
  passwordInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void submit();
    }
  });

  void boot();
});
