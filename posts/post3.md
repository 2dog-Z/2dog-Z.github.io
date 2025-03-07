# V1版本开发文档

<!-- date: 2025-03-05 -->

## 项目概述

V1版本是2Dog的小窝博客系统的初始版本，采用了简洁的VSCode风格设计，主要实现了基础的博客展示功能和暗/亮主题切换功能。该版本采用纯静态HTML+CSS+JavaScript实现，无需后端支持，便于部署和维护。



## 技术栈

- **前端**: 纯HTML、CSS、JavaScript

- **部署**: 静态网页托管

- **设计风格**: VSCode IDE风格

  

## 文件结构

```
/your-blog v1/
├── css/
│   ├── dark.css     # 暗色主题样式
│   └── light.css    # 亮色主题样式
├── js/
│   └── theme.js     # 主题切换功能
├── posts/
│   ├── post1.html   # 第一篇文章
│   └── post2.html   # 第二篇文章
└── index.html       # 首页
```



## 功能实现

### 1. 主题切换功能

主题切换功能通过JavaScript实现，使用LocalStorage保存用户的主题偏好。

**实现方式**:
- 在HTML中设置`data-theme`属性标识当前主题
- 通过切换CSS文件实现主题外观变化
- 使用LocalStorage记住用户的主题选择

**核心代码**:
```javascript
function toggleTheme() {
    const themeLink = document.getElementById('theme-style');
    const isDark = themeLink.href.includes('dark');
    
    // 切换CSS文件
    themeLink.href = isDark ? 'css/light.css' : 'css/dark.css';
    
    // 保存到LocalStorage
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
}

// 初始化主题
const savedTheme = localStorage.getItem('theme') || 'light';
document.getElementById('theme-style').href = `css/${savedTheme}.css`;
```



### 2. 页面结构

#### index.html

首页采用简洁的布局，主要包含：
- 标题栏（带主题切换按钮）
- 文章列表导航

```html
<!DOCTYPE html>
<html data-theme="light">
<head>
    <title>我的博客</title>
    <!-- 主题切换链接 -->
    <link id="theme-style" rel="stylesheet" href="css/light.css">
</head>
<body>
    <header>
        <h1>VSCode风格博客</h1>
        <button onclick="toggleTheme()">切换主题</button>
    </header>
    
    <nav>
        <h3>文章列表</h3>
        <ul>
            <li><a href="posts/post1.html">第一篇文章</a></li>
            <li><a href="posts/post2.html">第二篇文章</a></li>
        </ul>
    </nav>

    <script src="js/theme.js"></script>
</body>
</html>
```



#### 文章页面 

文章页面结构包含：
- 标题栏（与首页一致）
- 文章内容区域（标题、日期、正文）
- 代码块展示

```html
<!DOCTYPE html>
<html data-theme="light">
<head>
    <title>第一篇文章</title>
    <link id="theme-style" rel="stylesheet" href="../css/light.css">
</head>
<body>
    <header>
        <h1>VSCode风格博客</h1>
        <button onclick="toggleTheme()">切换主题</button>
    </header>

    <article>
        <h2>我的第一篇文章</h2>
        <time>2023-08-20</time>
        
        <!-- 文章内容 -->
        <p>这是通过VS Code的 <code>Markdown Preview Enhanced</code> 插件生成的HTML内容</p>
        
        <pre><code>console.log("Hello World!");</code></pre>
    </article>

    <script src="../js/theme.js"></script>
</body>
</html>
```



### 3. 样式设计

样式设计分为暗色和亮色两套主题，使用CSS变量实现主题颜色的统一管理。

#### 暗色主题 (dark.css)

```css
:root {
    --bg-color: #1E1E1E;
    --text-color: #D4D4D4;
    --code-bg: #252526;
    --border-color: #3C3C3C;
}

body {
    background: var(--bg-color);
    color: var(--text-color);
    font-family: 'Consolas', monospace;
    max-width: 800px;
    margin: 0 auto;
    line-height: 1.6;
}

/* 其他样式... */
```

#### 亮色主题 (light.css)

```css
:root {
    --bg-color: #FFFFFF;
    --text-color: #1E1E1E;
    --code-bg: #F3F3F3;
    --border-color: #E8E8E8;
}

body {
    background: var(--bg-color);
    color: var(--text-color);
    font-family: 'Consolas', monospace;
    max-width: 800px;
    margin: 0 auto;
    line-height: 1.6;
}

/* 其他样式... */
```

## 设计特点

1. 采用极简设计

2. 模仿VSCode的界面风格，对程序员友好

3. 基础的响应式设计，适应不同屏幕尺寸

4. 支持暗色/亮色主题切换

   

## 局限性

1. **内容管理**: 文章内容直接硬编码在HTML中，不便于更新和管理

2. **导航功能**: 缺乏完善的导航和返回功能

   

## 未来改进方向

1. **添加关于页面**: 增加博主个人介绍页面

2. **改进导航**: 优化导航结构，增加返回首页链接

3. **Markdown支持**: 引入Markdown解析功能，便于内容管理

   

## 总结

V1版本作为博客系统的初始版本，虽然功能简单，但已经实现了基础的博客展示和主题切换功能。

通过纯静态技术栈，确保了系统的轻量级和易部署性。