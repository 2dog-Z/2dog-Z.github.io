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
    "index.html": "./aboutme/index.html",
  },
  post: {
    "index.html": "./post/index.html",
  },
};

/**
 * 默认打开的页面（进入站点后内容区第一次渲染的文章）。
 * 功能：提供一个“落地页”内容，避免首次进入内容区为空。
 */
export const DEFAULT_PAGE = "./post/index.html";

/**
 * 主题在 localStorage 中使用的 key。
 * 功能：保存用户上次选择的主题（dark/light），实现下次访问自动恢复。
 * 目的：提升一致性与用户体验，避免每次刷新都要重新切换。
 */
export const THEME_STORAGE_KEY = "theme";
