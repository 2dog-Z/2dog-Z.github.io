# 迭代开发文档：Version 3 → Version 4

本文档用于记录本静态终端风格个人主页从 Version 3 演进到 Version 4 的核心变化、设计取舍与可扩展方式，并给出面向后续版本的迭代建议。

## 1. 项目定位与约束（保持不变）

项目目标一句话：**用纯静态站点实现“像终端一样浏览内容”的个人主页体验**。

共同约束（V3~V4 继续遵守）：

- 无后端、无数据库、无打包器（浏览器可直接运行）
- HTML + CSS + 原生 JavaScript（ES Module）
- 交互核心在下方终端：通过命令驱动内容浏览与轻量互动（评论）

在约束下的演进方向（V4 主要推进）：

- 内容体系从 HTML 扩展到 Markdown（更易写、更易维护）
- 以模板解耦“文章结构”和“文章内容”
- 在不引入依赖的前提下，增强可发现性与导航效率

## 2. Version 4：本轮迭代目标与结果

Version 4 的主要目标：

- 将“文章内容”从静态 HTML 文件迁移到 Markdown 文件
- 保持“单页体验”：仍通过内容区注入渲染结果，而不是整页跳转
- 引入轻量模板与占位符，让首页可以动态生成“文章列表/命令表/社交链接”等片段
- 让内容区也能触发终端命令（点击即可执行 `cat/cd`）

关键入口与模块：

- 入口装配：[app.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%204/app.js)
- 常量与虚拟 FS：[constants.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%204/modules/constants.js)
- 内容渲染器（HTML + Markdown）：[contentRenderer.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%204/modules/contentRenderer.js)
- Markdown 引擎（零依赖）：[markdown.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%204/modules/markdown.js)
- 文章模板：[article.html](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%204/templates/article.html)
- 示例内容：首页 [post/index.md](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%204/post/index.md)；关于页 [aboutme/index.md](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%204/aboutme/index.md)

对比参考（Version 3 对应实现）：

- 入口装配：[Version 3/app.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%203/app.js)
- 常量与虚拟 FS：[Version 3/constants.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%203/modules/constants.js)
- 内容渲染器（HTML）：[Version 3/contentRenderer.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%203/modules/contentRenderer.js)
- 终端核心：[Version 3/terminal.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%203/modules/terminal.js)

## 3. Version 3 vs Version 4：对比总表

| 维度 | Version 3 | Version 4 |
|---|---|---|
| 内容来源 | 静态 HTML（`./post/index.html` 等） | 静态 Markdown（`./post/index.md` 等），可携带 front matter |
| 默认页 | `DEFAULT_PAGE = ./post/index.html` | `DEFAULT_PAGE = ./post/index.md`（见 [constants.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%204/modules/constants.js)） |
| 内容渲染 | `fetch HTML + DOMParser` 注入 | `.md`：front matter + 轻量 md→html + 模板渲染；`.html`：保持兼容（见 [contentRenderer.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%204/modules/contentRenderer.js)） |
| 文章结构 | 每篇文章自带 HTML 结构 | 文章内容与结构解耦：用模板包裹（见 [article.html](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%204/templates/article.html)） |
| 动态片段 | 首页 cheat sheet 为静态 HTML 内容 | 支持 `{{cheatSheet}}/{{posts}}/{{aboutMe}}/{{socialLinks}}` 等占位符注入（见 [post/index.md](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%204/post/index.md) 与 [contentRenderer.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%204/modules/contentRenderer.js)） |
| `ls` 展示 | 文件/目录可点击跳转 | 目录仍可点；文件保留 `.md` 后缀，并按文章 `date` 优先排序（见 [terminal.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%204/modules/terminal.js)） |
| 内容区交互 | 主要通过终端输入命令 | 内容区可点击触发命令（基于 `data-cmd`，见 [app.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%204/app.js)） |
| 主题（light） | 终端随主题变为浅色 | light 模式下终端仍保持黑底，增强“终端一致性”（见 [styles.light.css](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%204/styles.light.css)） |
| 安全与依赖 | 仅加载站内 HTML | Markdown 默认转义 HTML，并对链接协议做白名单校验；保持零第三方依赖（见 [markdown.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%204/modules/markdown.js)） |

## 4. 目录结构演进

### 4.1 Version 3（HTML 内容为主）

```
Version 3/
  ├─ aboutme/
  │   └─ index.html
  ├─ post/
  │   └─ index.html
  ├─ modules/
  │   ├─ comments.js
  │   ├─ constants.js
  │   ├─ contentRenderer.js
  │   ├─ terminal.js
  │   ├─ theme.js
  │   └─ utils.js
  ├─ index.html
  ├─ app.js
  ├─ styles.css
  └─ styles.light.css
```

### 4.2 Version 4（Markdown 内容 + 模板）

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

## 5. 关键设计决策（为什么 V4 要这么改）

### 5.1 内容从 HTML 迁移到 Markdown

V3 的文章是“写 HTML 文件”。当文章数量增加时，维护成本会体现在：

- 写作门槛：每篇文章要处理 HTML 结构与样式一致性
- 结构复用困难：想统一加日期/脚注/导航等，需要逐篇改

V4 改为“写 Markdown 文件”，并允许通过 front matter 提供元信息（例如 `title`、`date`），以支撑后续的列表/排序/展示（见 [post/index.md](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%204/post/index.md)）。

### 5.2 文章结构与内容解耦：模板 + 占位符

V4 的 Markdown 渲染结果不会直接塞到内容区，而是先：

1. Markdown → HTML
2. 替换 HTML 中的占位符（例如 `{{posts}}`、`{{cheatSheet}}`）
3. 再套用模板 [article.html](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%204/templates/article.html)

收益：

- 文章结构稳定：统一文章容器、元信息区、排版规则
- 首页更“动态”：无需手写文章列表，内容由虚拟 FS 与元信息生成
- 仍保持纯静态：模板就是一个静态 HTML 文件

### 5.3 零依赖 Markdown 引擎：可控、可审阅、带安全边界

V4 没有引入第三方 Markdown 库，而是实现了“满足当前需求的子集”：

- 标题、段落、列表、引用、代码块、行内样式、链接、分割线
- 默认 HTML 转义（防止 Markdown 直接注入 HTML）
- 链接 `href` 白名单校验（拒绝 `javascript:` 等危险协议）
- `fetch` 结果缓存（避免反复请求）

实现入口见 [markdown.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%204/modules/markdown.js)。

### 5.4 `ls` 更像“内容目录”：按日期排序 + 保留后缀

V3 的 `ls` 更偏“文件系统浏览”；V4 让 `post/` 下的 Markdown 文件按 `date` 从新到旧排序，并在输出中保留 `.md` 后缀：

- 保留后缀：让用户一眼知道该条目是 Markdown 内容（同时也兼容未来混入 `.html`）
- 日期排序：更符合博客阅读习惯（最新内容优先）

对应实现见 [terminal.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%204/modules/terminal.js) 与元信息读取 [getMarkdownMeta](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%204/modules/markdown.js)。

### 5.5 内容区也能“发命令”：统一交互入口为命令

V4 在内容区引入 `data-cmd` 机制：只要某个元素带 `data-cmd="cat /post/xxx"`，点击就会触发终端执行该命令（并可选回显）。

收益：

- 交互一致：点击并没有绕开终端逻辑，本质仍在执行命令
- 更易上手：用户无需先记住命令语法，点一下就能浏览

对应事件绑定见 [app.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%204/app.js)。

## 6. 核心流程（V4）

### 6.1 页面启动流程

入口 [app.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%204/app.js) 在 `DOMContentLoaded` 后的流程：

1. 初始化评论区，并暴露 `window.__comments.add(text)`
2. 从 `localStorage` 恢复主题（默认 dark）
3. 创建内容渲染器（注入 `FILE_SYSTEM`），渲染 `DEFAULT_PAGE`（默认 `./post/index.md`）
4. 创建终端（注入 `renderPath/applyTheme/readTheme`），启动并聚焦
5. 监听内容区的 `data-cmd` 点击事件，转发给终端 `run()`

### 6.2 渲染 Markdown：front matter → HTML → 模板

核心由 [contentRenderer.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%204/modules/contentRenderer.js) 驱动：

- 若目标为 `.md`：
  - `getMarkdownDocument(url)` 解析 meta/title/date/body
  - `markdownToHtml(body)` 得到基础 HTML
  - `replaceHtmlPlaceholders(html, vars)` 注入动态片段
  - `renderTemplate(template, { date, content })` 生成最终页面片段并注入内容区
- 若目标为 `.html`：沿用 V3 的 `fetch + DOMParser`，保持兼容

### 6.3 `cat/ls/cd` 的联动规则（面向用户体验）

- `cat`：解析虚拟 FS → 打开目标 `.md/.html` → 内容区渲染 → 终端输出 `opened/failed`
- `cd`：改变 `cwd` 后，会尝试自动渲染该目录下 `index.md`（优先）或 `index.html`（兜底）
- `ls`：
  - 根目录输出树形结构
  - 进入目录后输出列表：目录按名称排序；文件在 `post/` 中按 `date` 优先排序

## 7. 已知限制与取舍

- `file://` 限制仍存在：Markdown/模板都依赖 `fetch`，建议使用本地静态服务器或部署到 Pages
- Markdown 语法是子集：不支持表格、脚注、嵌套列表等复杂语法（可以按需要逐步扩展）
- 占位符是“约定式能力”：`{{token}}` 仅在渲染阶段替换，不是通用模板引擎
- 虚拟文件系统仍是“路由映射”：不会自动扫描目录，需要手动把内容纳入 `FILE_SYSTEM`

## 8. 扩展指南（以 V4 为基准）

### 8.1 新增一篇 Markdown 文章，并可在终端打开

1. 在 `./post/` 新增 `YYYY-MM-DD-your-title.md`
2. 建议写入 front matter：

```md
---
title: Your Title
date: 2026-03-16
---
```

3. 在 [constants.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%204/modules/constants.js) 的 `FILE_SYSTEM.post` 增加映射
4. 终端执行 `cd /post`，然后 `cat /post/YYYY-MM-DD-your-title`（可省略扩展名）

### 8.2 在首页新增一个动态区块（占位符）

1. 在 `post/index.md` 中加入 `{{yourToken}}`
2. 在 [contentRenderer.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%204/modules/contentRenderer.js) 的 `vars` 中提供 `yourToken` 对应的 HTML 字符串

### 8.3 新增一个终端命令（建议做法）

1. 在 [constants.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%204/modules/constants.js) 的 `CHEAT_SHEET` 增加命令说明
2. 在 [terminal.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%204/modules/terminal.js) 中新增 `runXxx()` 并在 `handleCommand` 分发

## 9. 下一步迭代

- 扩展 Markdown 语法：表格、任务列表、图片（带安全策略）
- 输出性能优化：终端输出可设最大行数，达到最大行数清空上面一半的命令
- 利用github issues，搭建真实评论系统，类似于Gitalk，对每一张markdown加载对应的评论内容。
- 添加newmd.js，每次访问时自动搜索全部post下的md文件，并自动加入文件树映射。但是要添加缓存，减少每次打开网站时的卡顿与加载。
- 开始适配自适应，适配不同窗口的大小
- 对窗口宽度很小和手机端进行单独适配，渲染部分占垂直3/4，命令行部分占垂直1/4，评论放在渲染和命令行部分中间，默认隐藏，只保留一行^ Comments，其中^占单独一个li容器，当点击的时候展开Comments部分。具体操作为comments部分平滑向上平移展开，直到占据渲染部分位置，^ Comments改名为Comments.此时渲染部分隐藏，变为一行v Page，其中v占一个li容器。当点击时，渲染部分平滑向下展开，Comments容器平滑向下收起，直至只保留一行^ Comments.
- 把现在的post/index.md变成/index.md，重写一个post/index.md，列出所有post
- 添加标签页网站icon
- 创建image文件夹作为图片存储, 文件树不映射image
- 添加admin文件夹，作为管理界面，文件树不映射image，使用sha256加密后密码前端匹配，可以访问文件树（仅限aboutme, post和image文件夹），可以上传和删除文件。
- 修改sudo彩蛋，当且仅当输入为sudo login时，跳转到admin页面
- aboutme添加大头照
- terminal在变成theme light时，变成#efefef
- Latest Post旁边加上一个cd /post的li
- email加上 Or just mailto:admin@2dogz.org
- Blog-Chambers Z.改成Blog - Chambers Z.

