# 迭代开发文档：Version 5 → Version 6

本文档用于记录本静态终端风格个人主页从 Version 5 演进到 Version 6 的核心变化、设计取舍、关键实现位置与后续扩展建议。内容以“对比 + 可定位代码”为主，便于复盘与继续迭代。

## 1. 项目定位与约束（保持不变）

- 无后端、无数据库、无打包器（浏览器可直接运行）
- HTML + CSS + 原生 JavaScript（ES Module）
- 交互核心在下方终端：通过命令驱动内容浏览与轻量互动（评论）

## 2. Version 6：本轮迭代目标与结果

Version 6 的主要目标：

- 移除前端硬编码 GitHub token，把鉴权转移到 Cloudflare Worker
- 前端增加一个“暗号 Header”，Worker 校验通过才注入 token
- 尽量不改业务逻辑组织方式：业务仍拼出 `https://api.github.com/...`，但实际请求统一改走 Worker

关键入口与模块（V6）：

- 入口装配（post 自动发现走 Worker）：[app.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%206/app.js)
- 常量与虚拟 FS（Worker 配置集中）：[constants.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%206/modules/constants.js)
- URL 重写工具（GitHub API → Worker）：[utils.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%206/modules/utils.js)
- 评论系统（GitHub API 请求经由 Worker）：[comments.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%206/modules/comments.js)
- Worker 代理实现（校验暗号 + 注入 token + 转发）：[cloudflare-worker.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%206/cloudflare-worker.js)

对比参考（V5 对应实现，位于本仓库的 V5 副本）：

- V5 入口装配：[Version 5/app.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%206/Version%205/app.js)
- V5 常量：[Version 5/constants.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%206/Version%205/modules/constants.js)
- V5 评论（含前端 token）：[Version 5/comments.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%206/Version%205/modules/comments.js)

## 3. Version 5 vs Version 6：对比总表

| 维度 | Version 5 | Version 6 |
|---|---|---|
| GitHub 鉴权位置 | token 存在前端代码（评论写入依赖 Authorization） | token 仅存在 Worker 代码中（前端不保存 token） |
| 请求目标 | 浏览器直接请求 `https://api.github.com/...` | 浏览器请求 `${WORKER}/gh/...`，Worker 转发到 GitHub |
| 访问控制 | 无（只要能访问页面就能发起带 token 的请求） | Worker 校验暗号 Header，通过才注入 token |
| 业务代码组织 | 业务侧直接 `fetch(url)` | 业务侧仍使用 GitHub API URL，但由工具函数统一重写为 Worker URL |
| 安全风险 | token 可被查看/复制，权限外泄风险高 | token 不在前端暴露；暗号仍可能被抓包复制，但权限明显更低 |

## 4. 目录结构演进

### 4.1 Version 5（对比基准）

```
Version 5/
  ├─ README.md
  ├─ index.md
  ├─ aboutme/
  ├─ post/
  ├─ templates/
  ├─ image/
  ├─ modules/
  ├─ index.html
  ├─ app.js
  ├─ styles.css
  └─ styles.light.css
```

### 4.2 Version 6（新增 Worker 中转）

```
Version 6/
  ├─ README.md
  ├─ cloudflare-worker.js
  ├─ modules/
  │   ├─ constants.js
  │   ├─ utils.js
  │   └─ comments.js
  └─ （其余结构同 V5）
```

## 5. 关键设计决策（为什么 V6 要这么改）

### 5.1 把 token 从前端移走：最小代价提升安全性

V5 的“评论写入”需要 GitHub token，token 一旦放到前端：

- 会出现在构建产物里（源代码可读）
- 会出现在浏览器网络请求里（Authorization 可被复制）
- 任何能访问页面的人都能复用该 token 调 GitHub API

V6 把 token 收敛到 Worker（见 [cloudflare-worker.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%206/cloudflare-worker.js)），前端只携带一个“暗号 Header”作为最低成本门禁（见 [constants.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%206/modules/constants.js)）。

### 5.2 暗号 Header：不是强认证，但足够“别把 Worker 变开放代理”

Worker 在注入 token 前先校验：

- Header 名称 `PASS_HEADER`
- Header 值 `PASS_VALUE`

不匹配直接 403，从而避免任何人把 Worker 当作“公开 GitHub API 代理”滥用。

这不是强认证（暗号仍可能被抓包复制），但符合本轮“最简单代码”的目标，同时显著降低 token 泄露面。

### 5.3 URL 重写：保持业务逻辑可读，统一在一个点改道

V6 新增 `githubApiUrlViaWorker()`（见 [utils.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%206/modules/utils.js)）：

- 业务侧继续拼 `https://api.github.com/...`（可读、符合 GitHub API 文档）
- 真正发请求前统一重写为 `${GITHUB_WORKER_ORIGIN}/gh...`
- 仅重写 GitHub API origin，避免误伤其它 fetch

### 5.4 评论与 post 自动发现：同一条“GitHub API → Worker”链路

本轮把两类 GitHub API 请求都纳入同一策略：

- 评论读写：集中在 [comments.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%206/modules/comments.js) 的 `githubRequestJson()`
- post 自动发现（Contents API）：集中在 [app.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%206/app.js) 的 `fetchGithubPostMdList()`

它们共同点：

- 前端都只携带暗号 Header（不包含 token）
- Worker 校验后注入 token 并转发

## 6. 配置与部署（V6）

### 6.1 部署 Cloudflare Worker

1. 创建一个 Cloudflare Worker
2. 将 [cloudflare-worker.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%206/cloudflare-worker.js) 的内容粘贴进去
3. 按需替换：

   - `GITHUB_TOKEN`：填你的 GitHub token
   - `PASS_HEADER` / `PASS_VALUE`：填你想要的暗号 Header 名称与值

4. 发布后记下 Worker 的访问域名（例如 `https://xxx.workers.dev`）

### 6.2 配置前端常量

在 [constants.js](file:///c:/Users/zcb19/Desktop/TDPB/%E5%BC%80%E5%8F%91/Version%206/modules/constants.js) 配置：

- `GITHUB_WORKER_ORIGIN`：你的 Worker 域名
- `GITHUB_WORKER_PASS_HEADER` / `GITHUB_WORKER_PASS`：必须与 Worker 的 `PASS_HEADER` / `PASS_VALUE` 完全一致

### 6.3 验证链路

访问以下 URL 验证 Worker 转发可用（需要带暗号 Header）：

- `GET ${GITHUB_WORKER_ORIGIN}/gh/rate_limit`

如果暗号不正确应返回 403；正确应返回 200 且为 GitHub 的 rate_limit JSON。
