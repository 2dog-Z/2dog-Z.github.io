# 迭代开发文档：Version 7 → Version 8

本文档用于记录本静态终端风格个人主页从 Version 7 演进到 Version 8 的核心变化、设计取舍、关键实现位置与后续扩展建议。内容以“对比 + 可定位代码 + 复用点总结”为主，便于复盘与继续迭代。

## 1. 项目定位与约束（保持不变）

- 无后端、无数据库、无打包器（浏览器可直接运行）
- HTML + CSS + 原生 JavaScript（ES Module）
- 主站交互核心仍在终端：通过命令驱动内容浏览与轻量互动（评论）
- GitHub 作为内容存储（post/aboutme/image），Cloudflare Worker 作为 GitHub API 中转（避免前端持有 token）

## 2. Version 8：本轮迭代目标与结果

Version 8 的主要目标：

- 让 `/admin` 的“文件管理”从占位 demo 变为可真实工作（适配 GitHub Pages 部署）
- 文件管理复用 comments 的 GitHub Worker token 通道（同一份暗号 Header + 同一套代理协议）
- 为 admin 引入“管理端虚拟文件系统（VFS）”并做目录级权限控制（root/post/aboutme/image）
- 复用主站的 post 自动发现逻辑（统一为 GET 扫描实现，主站与 admin 共享）
- 针对 GitHub Pages/中间缓存的延迟，支持通过 URL 时间戳强制获取最新状态

关键入口与模块（V8）：

- 管理页布局与交互（tab 壳 + 评论管理 + 文件管理）：[admin/adminView.js](./admin/adminView.js)
- 管理页入口（登录 + 动态加载 adminView）：[admin/app.js](./admin/app.js)
- GitHub API 代理与通用请求封装（复用 comments 通道）：[modules/utils.js](./modules/utils.js)
- 主站入口（post 自动发现与缓存 + 复用扫描函数）：[app.js](./app.js)
- 虚拟文件系统（主站）：[modules/constants.js](./modules/constants.js)
- 评论系统与仓库配置复用（getCommentsGitHubRepo）：[modules/comments.js](./modules/comments.js)

## 3. Version 7 vs Version 8：对比总表（重点：代码复用）

| 维度 | Version 7 | Version 8 |
|---|---|---|
| 文件管理 | 占位 demo（不对接后端） | 真实对接 GitHub Contents API：索引/上传/下载/删除 |
| GitHub token | comments 使用 Worker 中转 | 文件管理与 post 扫描统一复用 Worker 中转 |
| GitHub 请求封装 | comments 内部自有封装 | 抽到 utils：`githubRequest()` / `fetchGithubPostMdList()` 主站+admin 复用 |
| VFS（管理端） | demo tree（null 表示文件） | 与主站同构：目录=object、文件=string（便于复用渲染与权限判断） |
| 权限控制 | 无 | root/post/aboutme：仅 *.md；image：任意文件；root 子目录（非三大入口）禁用三按钮 |
| post 自动发现 | 主站实现 | 主站继续，但扫描实现抽成通用 GET 函数，admin 直接复用 |
| 缓存延迟 | 未处理 | GitHub API 请求可加 `?t=...` 强制绕开缓存（cacheBust） |

## 4. 管理端文件系统（VFS）设计（Version 8）

### 4.1 VFS 的“数据结构”统一

管理端文件管理不再使用“demo 的 null 文件节点”，而是统一采用与主站 `FILE_SYSTEM` 一致的约定：

- 目录：`{ [name]: object }`
- 文件：`{ [name]: string }`（值为可定位的相对路径，例如 `./post/xxx.md` 或 `./image/icon.png`）

对应实现：`createFilesManagementView()` 内的 `nodeForKey()` 与 `collectEntriesFromNode()`（[admin/adminView.js](./admin/adminView.js)）

### 4.2 四类目录的来源与复用关系

- aboutme：直接复用主站 `FILE_SYSTEM.aboutme`
- post：直接复用主站 `FILE_SYSTEM.post` 作为节点容器；列表来源统一为 `fetchGithubPostMdList()`（GET /contents/post）
- root：管理端专用缓存树 `ADMIN_ROOT_FS`（仅存“文件名与子目录名”，按需索引）
- image：管理端专用缓存树 `ADMIN_IMAGE_FS`（同上）

对应实现：`repoDirForKey()` / `nodeForKey()` / `loadDirIntoFsNode()`（[admin/adminView.js](./admin/adminView.js)）

### 4.3 目录跳转规则（符合“下级目录名 -> 对应文件树”）

在 root 顶层点击 `post/aboutme/image`：

- 不进入 `root/post` 这种中间态
- 直接切换到 `post/aboutme/image` 三个独立文件树

对应实现：`buildNextKeyFromDirClick()`（[admin/adminView.js](./admin/adminView.js)）

## 5. 权限模型（Version 8）

权限规则（写入=上传/覆盖/删除）：

- root/post/aboutme：仅允许 `*.md`
- image：允许任意文件
- root 的子目录（root/... 且不是三大入口）：upload/download/delete 全禁用

实现位置：

- 权限判断：`canWriteFileAtKey()`（[admin/adminView.js](./admin/adminView.js)）
- UI 禁用：`setActionsEnabled()`（同上）
- 执行层硬拦截：上传/下载/删除入口函数在受限目录直接 return（同上）

## 6. GitHub REST API 对接（Version 8）

### 6.1 复用 comments 的 Worker token 通道

所有 GitHub API 请求统一走 `githubRequest()`：

- URL 仍写为 `https://api.github.com/...`
- 实际请求会被重写到 `${GITHUB_WORKER_ORIGIN}/gh/...`
- 自动携带暗号 Header（与 comments 相同），token 注入只发生在 Worker

实现位置：[modules/utils.js](./modules/utils.js)

### 6.2 Contents API 的 CRUD（GET/PUT/DELETE + Base64）

- 索引目录：GET `/contents/<dir>`（返回数组）
- 下载文件：GET `/contents/<file>`（content=base64）
- 上传文件：PUT `/contents/<file>`（content=base64；存在则带 sha 覆盖）
- 删除文件：DELETE `/contents/<file>`（必须带 sha；先 GET 获取当前 sha）

实现位置：`getFileFromGitHub()` / `putFileToGitHub()` / `deleteFileOnGitHub()`（[admin/adminView.js](./admin/adminView.js)）

## 7. 缓存延迟处理：URL 时间戳（Version 8）

背景：GitHub Pages 或中间代理可能有 1–5 分钟的缓存延迟，导致“API 已更新但页面或列表仍像旧的”。

做法：

- `githubRequest()` 支持 `cacheBust: true`：在最终请求 URL 追加 `t=Date.now()`
- 文件管理的目录索引/文件 GET/PUT/DELETE 默认开启 cacheBust
- post 自动发现的 GET 扫描也默认开启 cacheBust

实现位置：`githubRequest()` / `withCacheBust()`（[modules/utils.js](./modules/utils.js)）

## 8. 已完成与后续建议

已完成（V8）：

- 管理端文件管理：索引/上传/下载/删除可用，且按目录做权限约束
- 复用 comments 的 GitHub Worker 通道：避免重复维护 token/请求协议
- post 自动发现扫描实现抽到 utils：主站与 admin 复用
- cacheBust：缓解缓存延迟导致的“旧状态”

## 9. 迭代思路

- Markdown渲染容器默认显示Loading…，可以在加载时不空白
- 下载支持多选（zip 打包策略）
- root/image 的目录索引做轻量刷新机制（每次访问重新GET刷新）
- 轻量文本编辑器，和文件系统结合。先GET出内容，导入文本编辑容器中。写完后提交是先保存成文件，再通过PUT更新。
- 开始适配自适应，适配不同窗口的大小
- 对窗口宽度很小和手机端进行单独适配，渲染部分占垂直3/4，命令行部分占垂直1/4，评论放在渲染和命令行部分中间，默认隐藏，只保留一行^ Comments，其中^占单独一个li容器，当点击的时候展开Comments部分。具体操作为comments部分平滑向上平移展开，直到占据渲染部分位置，^ Comments改名为Comments.此时渲染部分隐藏，变为一行v Page，其中v占一个li容器。当点击时，渲染部分平滑向下展开，Comments容器平滑向下收起，直至只保留一行^ Comments.
