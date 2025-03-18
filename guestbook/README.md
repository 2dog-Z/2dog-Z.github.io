# 简易留言板系统

## 项目概述

这是一个轻量级的留言板系统，使用GitHub Issues API作为后端存储留言数据。无需复杂的服务器配置，只需一个GitHub账号和简单的前端代码即可实现完整的留言功能。

### 特点

- **简单易用**：访客只需填写昵称即可发表留言，无需注册登录
- **零后端部署**：利用GitHub Issues API存储数据，无需自建服务器
- **响应式设计**：适配各种屏幕尺寸，移动端和桌面端均可正常使用
- **分页功能**：支持大量留言的浏览和管理

## 快速开始

### 前提条件

1. 拥有一个GitHub账号
2. 创建一个GitHub仓库（用于存储留言数据）
3. 创建GitHub Personal Access Token（用于API认证）

### 安装步骤

1. **下载代码**：将本项目代码下载到你的网站目录中

2. **创建GitHub Issue**：
   - 在你的GitHub仓库中创建一个新的Issue
   - 记下Issue的编号（URL中的数字）

3. **配置留言板**：
   - 打开`js/guestbook.js`文件
   - 修改以下配置信息：
     ```javascript
     const guestbookConfig = {
         owner: '你的GitHub用户名',  // 修改为你的GitHub用户名
         repo: '你的仓库名',        // 修改为你的仓库名
         issueId: 2,              // 修改为你创建的Issue编号
         _tokenParts: [           // 将你的GitHub Token分割存储于此
             // 示例：如果你的token是'ghp_123456789abcdef'
             // 可以分割为：['ghp_', '12345', '6789a', 'bcdef']
         ]
     };
     ```

4. **部署到网站**：
   - 将整个`guestbook`文件夹上传到你的网站服务器
   - 或者部署到GitHub Pages等静态网站托管服务

## 使用说明

### 访问留言板

通过浏览器访问`index.html`页面即可打开留言板。

### 发表留言

1. 在昵称输入框中填写你的昵称
2. 在留言内容框中输入你想说的话
3. 点击"发表留言"按钮提交

### 浏览留言

- 所有留言按时间倒序排列，最新的留言显示在前面
- 使用页面底部的分页控制器浏览更多留言

## 项目结构

```
guestbook/
├── css/
│   └── guestbook.css    # 留言板样式文件
├── js/
│   ├── guestbook.js     # 留言板核心逻辑
│   └── theme.js         # 简化版主题管理
├── index.html           # 留言板页面
└── README.md            # 项目文档
```

## 技术原理

### GitHub Issues API

留言板系统使用GitHub Issues API作为后端存储。当用户提交留言时，系统会将留言内容作为Issue评论提交到GitHub；当页面加载时，系统会从GitHub获取Issue的所有评论并显示为留言。

### 分页实现

系统利用GitHub API的分页功能，支持大量留言的浏览：

1. 使用`per_page`参数控制每页显示的留言数量
2. 解析GitHub API返回的Link头信息，实现上一页/下一页导航

## 自定义与扩展

### 修改样式

你可以通过编辑`css/guestbook.css`文件来自定义留言板的外观。文件开头定义了全局样式变量，修改这些变量可以快速改变整体风格：

```css
:root {
    --main-bg-color: #ffffff;      /* 主背景色 */
    --container-bg-color: #f8f9fa;  /* 容器背景色 */
    --border-color: #e1e4e8;        /* 边框颜色 */
    --text-color: #24292e;          /* 文本颜色 */
    --accent-color: #0366d6;        /* 强调色（链接、按钮等） */
    /* 其他变量... */
}
```



## 常见问题

### 留言提交失败

可能的原因：
- GitHub API认证失败，检查Token配置是否正确
- 网络连接问题，请稍后重试
- GitHub API限流，等待一段时间后再试

### 留言加载失败

可能的原因：
- GitHub API认证失败，检查Token配置

- 网络连接问题，请刷新页面重试

- Issue配置错误，确认Issue编号是否正确

  

## 许可协议

本项目采用MIT许可协议，你可以自由使用、修改和分发本项目的代码。