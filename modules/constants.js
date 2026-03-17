/**
 * 该文件集中存放“不会在运行时变化”的配置与常量，目的是：
 * 1) 让核心逻辑（终端、渲染器、主题、评论）只依赖清晰的输入；
 * 2) 避免在各处散落硬编码字符串，提升复用与可维护性。
 */

/**
 * 终端命令速查表（help 输出来源）。
 * 功能：给用户展示有哪些命令可以输入、每个命令的参数与含义。
 * 目的：降低学习成本，让交互式终端“可发现”(discoverable)。
 */
export const CHEAT_SHEET = [
  { cmd: "ls", args: "None", desc: "List directories or files in the current level." },
  { cmd: "cd", args: "[path/category]", desc: "Enter the specified article category." },
  { cmd: "..", args: "None", desc: "Go back to the parent directory." },
  { cmd: "cat", args: "[filename]", desc: "Open and read the specified article." },
  { cmd: "say", args: "[text]", desc: "Leave a comment or message." },
  { cmd: "theme", args: "[dark|light]", desc: "Switch theme and save preference." },
  { cmd: "help", args: "None", desc: "Show all available commands and their descriptions." },
  { cmd: "clear", args: "None", desc: "Clear the terminal screen." },
];

/**
 * “虚拟文件系统”结构。
 * 功能：模拟一个简化的目录树，让终端可以 ls/cd/cat。
 * 目的：在纯静态站点中实现类似命令行浏览内容的体验。
 *
 * 约定：
 * - 目录用对象表示（value 为 object）
 * - 文件用字符串表示（value 为该文件对应的真实 URL/相对路径）
 */
export const FILE_SYSTEM = {
  aboutme: {
    "index.md": "./aboutme/index.md",
  },
  post: {
    "index.md": "./post/index.md",
    "2026-03-15-getting-started.md": "./post/2026-03-15-getting-started.md",
    "2026-03-10-notes.md": "./post/2026-03-10-notes.md",
    "2026-02-28-links-and-format.md": "./post/2026-02-28-links-and-format.md",
  },
  "index.md": "./index.md",
};

/**
 * 默认打开的页面（进入站点后内容区第一次渲染的文章）。
 * 功能：提供一个“落地页”内容，避免首次进入内容区为空。
 */
export const DEFAULT_PAGE = "./index.md";

/**
 * 主题在 localStorage 中使用的 key。
 * 功能：保存用户上次选择的主题（dark/light），实现下次访问自动恢复。
 * 目的：提升一致性与用户体验，避免每次刷新都要重新切换。
 */
export const THEME_STORAGE_KEY = "theme";
/**
 * 终端输出裁剪策略。
 * 背景：终端会不断向 DOM 追加输出行，如果不做限制，长时间使用会造成页面越来越卡。
 * 规则：
 * - 当输出行数达到 TERMINAL_MAX_LINES 时，从顶部移除 TERMINAL_TRIM_TOP_LINES 行
 * - 这样既能保留最近上下文，也能避免每次只删 1 行导致频繁 reflow
 */
export const TERMINAL_MAX_LINES = 100;
export const TERMINAL_TRIM_TOP_LINES = 50;

/**
 * GitHub API 的 Worker 中转站域名（前端只请求这个域名，不直接访问 api.github.com）。
 *
 * 功能：
 * - 把所有对 GitHub API 的请求从浏览器侧“改道”到 Worker；
 * - Worker 侧再注入 Authorization token 并转发给 GitHub。
 *
 * 目的：
 * - 避免 token 出现在前端代码/网络面板/本地存储中；
 * - 为后续加入更严格的鉴权/限流等策略预留入口。
 */
export const GITHUB_WORKER_ORIGIN = "https://blogtokenmixer.twodogz.workers.dev";

/**
 * 前端与 Worker 之间用于校验的“暗号 Header 名称”。
 *
 * 说明：
 * - 这是一个最低成本的请求门禁：Worker 只有在该 Header 值匹配时才会注入 token；
 * - Header 名称与值都属于“共享密钥”，不要把 Worker 当作公共代理暴露给未知来源。
 */
export const GITHUB_WORKER_PASS_HEADER = "X-2dogZ-Pass";

/**
 * 前端需要携带的“暗号”值（用于 Worker 的共享密钥校验）。
 *
 * 目的：
 * - 把“能否使用 token”这件事从前端 token 暴露，收敛为一个简单的 header 校验；
 * - 即便有人看到了前端代码，也只能得到暗号而不是 GitHub token（权限风险显著更低）。
 */
export const GITHUB_WORKER_PASS = "2dogZ-Pass";

