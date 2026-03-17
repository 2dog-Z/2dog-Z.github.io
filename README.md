# 迭代开发文档：Version 4 → Version 5

本文档用于记录本静态终端风格个人主页从 Version 4 演进到 Version 5 的核心变化、设计取舍、关键实现位置与后续扩展建议。内容以“对比 + 可定位代码”为主，便于复盘与继续迭代。

## 1. 项目定位与约束（保持不变）

- 无后端、无数据库、无打包器（浏览器可直接运行）
- HTML + CSS + 原生 JavaScript（ES Module）
- 交互核心在下方终端：通过命令驱动内容浏览与轻量互动（评论）

## 2. Version 5：本轮迭代目标与结果

Version 5 的主要目标：

- 将“首页/落地页”从 `/post/index.md` 提升为站点根页面 `/index.md`，形成更清晰的信息架构
- 内容侧增强导航效率：区分“Latest Post”和“All Posts”，并提供更明显的跳转入口
- 评论从“演示数据”升级为“可持久化的真实数据”，并与页面路径绑定（按文章/页面分流）
- 终端输出做上限裁剪，避免长时间使用导致 DOM 无限增长
- 统一并强化 `data-cmd` 的“点击即命令”交互风格（含顶部、内容区、评论区）
- post 文章自动发现：访问时增量同步 `post/*.md`，自动补全文件树映射，并通过缓存避免首屏卡顿

关键入口与模块（V5）：

- 入口装配：[app.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%205/app.js)
- 常量与虚拟 FS：[constants.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%205/modules/constants.js)
- 内容渲染器（Markdown + 动态占位符）：[contentRenderer.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%205/modules/contentRenderer.js)
- Markdown 引擎（零依赖）：[markdown.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%205/modules/markdown.js)
- 终端核心（含输出裁剪）：[terminal.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%205/modules/terminal.js)
- 评论系统（GitHub Issue 持久化 + 分页缓存）：[comments.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%205/modules/comments.js)
- 页面结构（含评论输入框）：[index.html](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%205/index.html)
- 根首页内容（Latest Post + Cheat Sheet）：[index.md](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%205/index.md)
- Posts 列表页（All Posts）：[post/index.md](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%205/post/index.md)

对比参考（Version 4 对应实现）：

- 入口装配：[Version 4/app.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%204/app.js)
- 内容渲染器：[Version 4/contentRenderer.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%204/modules/contentRenderer.js)
- 评论模块（演示数据）：[Version 4/comments.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%204/modules/comments.js)
- 终端核心：[Version 4/terminal.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%204/modules/terminal.js)

## 3. Version 4 vs Version 5：对比总表

| 维度 | Version 4 | Version 5 |
|---|---|---|
| 默认页 | `DEFAULT_PAGE = ./post/index.md` | `DEFAULT_PAGE = ./index.md`（见 [constants.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%205/modules/constants.js)） |
| 信息架构 | “首页”实质是 Posts 首页 | 增加根首页（About/Latest/CheatSheet 聚合），Posts 成为独立列表页 |
| 占位符体系 | `{{posts}}` 输出“最新 1 篇” | 分化为 `{{postLatest}}`（最新 1 篇）+ `{{posts}}`（全部列表） |
| 内容区导航 | 主要靠终端 `cd/cat` 与文章内 `data-cmd` | 在首页的 Posts 标题旁注入 `cd /post` 快捷按钮（见 [contentRenderer.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%205/modules/contentRenderer.js)） |
| 评论数据 | 本地随机昵称 + 示例评论（不可持久化） | GitHub Issue Comments 存储（可持久化），按页面路径过滤，带本地缓存与乐观更新（见 [comments.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%205/modules/comments.js)） |
| 评论交互 | 仅终端 `say` | 终端 `say` + 评论区输入框一键转发 `say`（见 [index.html](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%205/index.html)） |
| 终端输出 | 无上限裁剪（长期使用可能堆积 DOM） | 增加最大行数与裁剪策略（见 [terminal.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%205/modules/terminal.js) 与 [constants.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%205/modules/constants.js)） |
| 站点资产 | 无 favicon | 增加 favicon 与 icon（见 [index.html](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%205/index.html) 与 `./image/icon.png`） |
| post 文件树映射维护 | 新增文章需要手动更新 `FILE_SYSTEM.post` | 启动时从缓存合并；空闲时后台同步 `post/*.md` 并只增量追加（见 [app.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%205/app.js)） |
| 列表渲染性能 | 列表依赖读取 meta，文章多时更易产生并发 fetch | Latest 仅读取最新 1 篇 meta；All Posts 超阈值时仅用文件名生成列表（见 [contentRenderer.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%205/modules/contentRenderer.js)） |

## 4. 目录结构演进

### 4.1 Version 4

```
Version 4/
  ├─ aboutme/
  │   └─ index.md
  ├─ post/
  │   ├─ index.md
  │   ├─ 2026-03-15-getting-started.md
  │   ├─ 2026-03-10-notes.md
  │   └─ 2026-02-28-links-and-format.md
  ├─ templates/
  │   └─ article.html
  ├─ modules/
  │   ├─ comments.js
  │   ├─ constants.js
  │   ├─ contentRenderer.js
  │   ├─ markdown.js
  │   ├─ terminal.js
  │   ├─ theme.js
  │   └─ utils.js
  ├─ index.html
  ├─ app.js
  ├─ styles.css
  └─ styles.light.css
```

### 4.2 Version 5

```
Version 5/
  ├─ index.md
  ├─ aboutme/
  │   └─ index.md
  ├─ post/
  │   ├─ index.md
  │   ├─ 2026-03-15-getting-started.md
  │   ├─ 2026-03-10-notes.md
  │   └─ 2026-02-28-links-and-format.md
  ├─ templates/
  │   └─ article.html
  ├─ image/
  │   └─ icon.png
  ├─ modules/
  │   ├─ comments.js
  │   ├─ constants.js
  │   ├─ contentRenderer.js
  │   ├─ markdown.js
  │   ├─ terminal.js
  │   ├─ theme.js
  │   └─ utils.js
  ├─ index.html
  ├─ app.js
  ├─ styles.css
  └─ styles.light.css
```

## 5. 关键设计决策（为什么 V5 要这么改）

### 5.1 根首页 `/index.md`：把“落地体验”从 Posts 中抽离

V4 把 `post/index.md` 作为默认页，会导致“进入站点=进入文章列表/文章页”的体验偏重内容目录，而不是“个人主页入口”。V5 将默认页改为 `./index.md`（见 [constants.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%205/modules/constants.js)），并把首页内容组织为：

- About（入口到 /aboutme）
- Latest Post（入口到最新文章）
- Command Cheat Sheet（帮助用户上手）

### 5.2 “Latest” 与 “All Posts” 分流：更贴合阅读路径

V5 的占位符拆分为：

- `{{postLatest}}`：在首页只展示“最新 1 篇”，降低信息噪音
- `{{posts}}`：在 `/post/index.md` 展示“全部文章列表”，作为归档页

对应实现集中在 [contentRenderer.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%205/modules/contentRenderer.js)。

### 5.3 评论系统升级：从“假数据”到“可持久化 + 按页面分流”

V4 的评论是演示性质：初始化样例数据，刷新即变化，无法沉淀。V5 把评论存储到 GitHub 仓库的某个 Issue 的 comments 中（同一个 issue 作为“评论存储桶”），并用 payload 里的 `page` 字段实现“按页面过滤”。

V5 评论侧的关键点：

- `setPage(path)`：当内容区渲染了新页面时切换评论上下文
- 本地缓存：使用 `localStorage` 保存拉取过的评论，加速首屏与减少请求
- 乐观更新：提交 `say` 后先插入本地评论，再异步写入 GitHub

实现见 [comments.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%205/modules/comments.js)，页面联动入口在 [app.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%205/app.js) 的 `onPathRendered`。

### 5.4 终端输出裁剪：稳定长期使用的性能

V5 增加：

- `TERMINAL_MAX_LINES`：最大保留行数
- `TERMINAL_TRIM_TOP_LINES`：超过上限后一次裁剪的行数

并在每次输出后触发裁剪（见 [terminal.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%205/modules/terminal.js) 与 [constants.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%205/modules/constants.js)）。

### 5.5 统一“点击=命令”：降低学习成本

V5 继续强化 `data-cmd`：

- 顶部“cd ..”使用 `.cmdButton`，与正文命令块风格统一（见 [index.html](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%205/index.html)）
- 首页 Posts 标题旁注入 `cd /post` 快捷入口（见 [contentRenderer.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%205/modules/contentRenderer.js)）
- 评论区输入框点击/回车转发到终端执行 `say`（见 [comments.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%205/modules/comments.js)）

### 5.6 post 自动发现与“首屏不阻塞”的增量同步

动机：静态站点没法在浏览器里“扫描本地目录”，但我们仍希望发布到 GitHub Pages 后，新增文章无需手工维护 `FILE_SYSTEM.post`，同时必须避免用户首次打开页面卡顿。

V5 采用的策略：

- 启动阶段：只读取 localStorage 中缓存的文章文件名列表，并合并进 `FILE_SYSTEM.post`（不发网络请求，保证首屏不阻塞）
- 空闲阶段：使用 GitHub Contents API 拉取 `/post` 下的文件列表，配合 `ETag` 做条件请求；只把“新增的 `.md` 文件名”增量追加到 `FILE_SYSTEM.post`，不会重建整棵树
- 仓库配置复用：post 自动发现直接复用评论模块的仓库配置，避免多处维护产生不一致（见 [comments.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%205/modules/comments.js) 导出的 `getCommentsGitHubRepo`）

实现入口见 [app.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%205/app.js)。

## 6. 核心流程（V5）

### 6.1 页面启动流程

入口 [app.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%205/app.js) 的主要流程：

1. 初始化评论区：`window.__comments = setupComments()`（返回 `{ add, setPage }`）
2. 恢复主题（localStorage）并应用
3. 创建内容渲染器：注入 `FILE_SYSTEM`，并通过 `onPathRendered` 把当前页面同步给评论模块
4. 渲染默认页：`DEFAULT_PAGE = ./index.md`
5. 创建终端：注入 `renderPath/applyTheme/readTheme`，启动并聚焦
6. 监听全局点击：把内容区/按钮上的 `data-cmd` 转发给终端 `run()`

### 6.2 评论加载与提交

V5 的评论流程是“页面驱动”的：

- 内容渲染成功后调用 `onPathRendered(path)` → `window.__comments.setPage(path)`
- `setPage()` 先使用本地缓存渲染，再后台同步 GitHub 最新评论并增量更新
- `say` 命令调用 `window.__comments.add(text)`：先乐观插入，再写入 GitHub Issue comments，成功后回写缓存

## 7. 已知限制与取舍

- `file://` 限制仍存在：内容与模板依赖 `fetch`，建议使用本地静态服务器或部署到 Pages
- GitHub 写入需要鉴权：浏览器侧无法真正“安全地保存 token”，任何放在前端的 token 都可能被获取；该方案更适合作为“个人站点的轻量留言板”，不适合承载敏感权限
- GitHub API 受速率限制：频繁刷新/高访问量会触发 rate limit，缓存能缓解但无法消除
- post 自动发现的边界：浏览器侧无法扫描“本地未发布的目录文件”；自动发现以远端 GitHub 仓库 `/post` 目录为准
- 显式虚拟 FS 仍存在：除 post 自动发现的增量补全外，其它目录/文件仍由 `FILE_SYSTEM` 控制（见 [constants.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%205/modules/constants.js)）

## 8. 扩展指南（以 V5 为基准）

### 8.1 新增一篇 Markdown 文章，并可在终端打开

1. 在 `./post/` 新增 `YYYY-MM-DD-your-title.md`（推荐用日期前缀，便于列表排序与 Latest 推断）
2. 建议写入 front matter：

```md
---
title: Your Title
date: 2026-03-17
---
```

3. 部署/推送到 GitHub 仓库后：站点会在空闲时自动发现该文件并增量加入 `FILE_SYSTEM.post`（无需手工改 `constants.js`）
4. 终端执行 `cd /post`，然后 `cat /post/YYYY-MM-DD-your-title`（可省略扩展名）

本地预览说明：

- 如果你只是本地新增了 md 但还没推送到远端仓库，自动发现不会看到这篇文章；此时可临时在 [constants.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%205/modules/constants.js) 的 `FILE_SYSTEM.post` 手动加一条映射，用于本地调试，发布后可不再保留

### 8.2 调整首页展示

- 首页内容来自 [index.md](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%205/index.md)
- 可用占位符由 [contentRenderer.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%205/modules/contentRenderer.js) 提供：`aboutMe / postLatest / posts / cheatSheet / socialLinks`

### 8.3 调整评论存储与策略

评论配置与存储逻辑集中在 [comments.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%205/modules/comments.js)：

- 仓库与 Issue 标题：`owner / repo / issueTitle`
- 缓存策略：`CACHE_KEY / CACHE_VERSION / lastCreatedAt`
- 页面标识：`toPageKey()`（决定“同一页”的定义）

## 9. 下一步迭代建议（面向 Version 6+）


