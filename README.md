# 迭代开发文档：Version 6 → Version 7

本文档用于记录本静态终端风格个人主页从 Version 6 演进到 Version 7 的核心变化、设计取舍、关键实现位置与后续扩展建议。内容以“对比 + 可定位代码”为主，便于复盘与继续迭代。

## 1. 项目定位与约束（保持不变）

- 无后端、无数据库、无打包器（浏览器可直接运行）
- HTML + CSS + 原生 JavaScript（ES Module）
- 交互核心仍在站点主页面下方终端：通过命令驱动内容浏览与轻量互动（评论）

## 2. Version 7：本轮迭代目标与结果

Version 7 的主要目标：

- 增加一个“后台管理系统壳”（admin），风格与主站一致且不割裂
- 后台具备两个入口页面：评论管理 + 文件管理（先占位）
- 评论管理可真实读取/发布/删除 GitHub issue comments（复用主站 comments 的数据链路与 Worker 中转）
- 后台登录不暴露明文密码：前端仅发送 SHA-256(password)；Worker 负责校验并签发会话 token

关键入口与模块（V7）：

- 管理页入口（登录 + 动态加载 adminView）：[admin/app.js](/admin/app.js)
- 管理页布局与交互（tab 壳 + 评论管理 demo）：[admin/adminView.js](/admin/adminView.js)
- 管理页局部样式（复用主站变量 + 管理壳布局）：[admin/admin.css](/admin/admin.css)
- Admin 登录鉴权 Worker（passwordHash 匹配 + token 会话）：[admin/worker.js](/admin/worker.js)
- 评论系统（新增 commentId 缓存 + 管理端删除 API）：[modules/comments.js](/modules/comments.js)
- 常量配置（新增 ADMIN_AUTH_WORKER_ORIGIN）：[modules/constants.js](/modules/constants.js)

对比参考（V6 原实现）：

- V6 入口装配：[Version 6/app.js](/Version%206/app.js)
- V6 评论模块：[Version 6/modules/comments.js](/Version%206/modules/comments.js)
- V6 迭代文档：[Version 6/README.md](/Version%206/README.md)

## 3. Version 6 vs Version 7：对比总表

| 维度 | Version 6 | Version 7 |
|---|---|---|
| 管理后台 | 无 | 新增 `/admin`（登录 + 管理壳 + 两个 tab 页面） |
| 管理页资源加载 | 无管理资源 | 未登录不加载管理模块（动态 import） |
| 管理认证 | 无 | 前端 SHA-256(password) + Worker 校验 + Bearer token 会话 |
| 评论读取 | 仅主站右侧评论区 | 主站 + 后台评论管理均可读取同一份真实评论 |
| 评论写入 | 主站匿名昵称（randomNickname）与终端 say | 后台以 Chambers 昵称发布到真实 GitHub comments |
| 评论删除 | 不支持 | 后台支持批量删除（GitHub issue comments DELETE） |
| 缓存结构 | 本地缓存只含 page/name/text/date/createdAt | 新增 commentId（GitHub comment id）用于精确删除与稳定标识 |
| 文件管理 | 无 | 先占位 “Working On It” |

## 4. 目录结构演进

### 4.1 Version 6（对比基准）

```
Version 6/
  ├─ README.md
  ├─ cloudflare-worker.js
  ├─ modules/
  ├─ app.js
  └─ （其余：aboutme/post/templates/styles 等）
```

### 4.2 Version 7（新增 admin 与鉴权 Worker）

```
Version 7/
  ├─ README.md
  ├─ admin/
  │   ├─ index.html
  │   ├─ app.js
  │   ├─ adminView.js
  │   ├─ admin.css
  │   └─ worker.js
  ├─ modules/
  │   └─ comments.js（新增管理端删除接口 + commentId 缓存）
  └─ （其余结构同 V6）
```

## 5. 关键设计决策（为什么 V7 要这么改）

### 5.1 管理模块动态加载：未登录时“不可见”

管理页入口 [admin/app.js](/admin/app.js) 在登录成功后才 `import("./adminView.js")`，目的：

- 未登录时管理模块不出现在 Resources 中（降低暴露面）
- 登录过渡保持平滑（不跳转，用两 stage 淡入淡出）

### 5.2 Admin 登录：前端只发送 passwordHash

管理认证链路：

- 前端：对 password 做 SHA-256（hex），提交 `{ passwordHash }` 到 Worker
- Worker：匹配 `PASSWORD_SHA256_HEX`，成功后签发 token（HMAC 防篡改 + exp 过期）
- 前端：使用 `Authorization: Bearer <token>` 请求 `/admin/session` 做会话校验

对应实现：

- 前端 hashing 工具：`sha256Hex()`（[modules/utils.js](/modules/utils.js)）
- 管理 Worker：签发与验签（[admin/worker.js](/admin/worker.js)）
- 管理页会话持久化：`sessionStorage + session cookie`（[admin/app.js](/admin/app.js)）

### 5.3 评论管理复用 comments：只扩展“管理端能力”

V7 不引入新后端或新存储，而是复用 V6 的评论存储方案：

- 仍然写入同一个 GitHub issue 的 comments
- 仍使用 marker JSON（TDPB_COMMENT/v1）来做 page 过滤
- 仍经由 GitHub Worker 中转（避免前端持有 token）

本轮新增的是“管理端 API”与“稳定标识”：

- `commentId`：同步时从 GitHub 返回的 comment `id` 写入缓存（用于 DELETE）
- `deleteCommentsForAdmin()`：按 commentId 调 GitHub API 删除，并同步清理本地缓存

对应实现：

- commentId 与去重 key：`normalizeCachedItem()` / `buildCommentId()` / `buildCacheKey()`（[modules/comments.js](/modules/comments.js)）
- 管理端删除接口：`deleteCommentsForAdmin()`（[modules/comments.js](/modules/comments.js)）

### 5.4 后台删除交互：确认 + 批量 + 结果提示

后台评论管理页（[admin/adminView.js](/admin/adminView.js)）的删除交互：

- 勾选一条或多条评论后点击 delete
- 弹出确认框（yes/cancel）
- 确认后批量调用 GitHub issue comment 删除 API
- 完成后提示 `Successful (x/y)` 或 `Failed (x/y)` 并自动消失

## 6. 配置与部署（V7）

### 6.1 Admin 登录 Worker 配置

在 [admin/worker.js](/admin/worker.js) 配置：

- `PASSWORD_SHA256_HEX`：你期望的登录密码的 sha256 hex（小写）
- `SESSION_HMAC_SECRET`：用于 HMAC 签名的密钥

建议上线时改为环境变量（避免硬编码）。

### 6.2 前端常量配置

在 [modules/constants.js](/modules/constants.js) 配置：

- `ADMIN_AUTH_WORKER_ORIGIN`：你部署的 Admin Worker 域名

## 7. 已完成与未完成

已完成（V7）：

- admin 壳（tab 结构）与主站风格一致
- 评论管理：真实加载/发布（Chambers）/批量删除（GitHub API）
- 文件管理：占位页面

未完成（后续）：

- 文件管理：上传/下载/删除/目录权限控制（复用 Worker 链路）
- sudo login 彩蛋与跳转到 admin（V6 文档中的下一步建议）

