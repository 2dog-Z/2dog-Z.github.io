# 从零开始学习前端开发：构建简易留言板

本教程面向完全没有接触过HTML、CSS和JavaScript的初学者，将带你一步步构建一个简易的留言板系统，同时学习前端开发的基础知识。通过这个项目，你将掌握网页结构、样式和交互功能的实现方法。

## 目录

1. [前端开发基础知识](#1-前端开发基础知识)
2. [项目概述与准备工作](#2-项目概述与准备工作)
3. [构建HTML页面结构](#3-构建html页面结构)
4. [设计CSS样式](#4-设计css样式)
5. [实现JavaScript交互功能](#5-实现javascript交互功能)
6. [使用GitHub API存储数据](#6-使用github-api存储数据)
7. [测试与部署](#7-测试与部署)



## 1. 前端开发基础知识

### 1.1 什么是HTML、CSS和JavaScript？

前端开发主要涉及三种技术：

- **HTML (HyperText Markup Language)**：定义网页的结构和内容
- **CSS (Cascading Style Sheets)**：控制网页的外观和样式
- **JavaScript**：实现网页的交互功能和动态效果

这三种技术相互配合，共同构成了现代网页：

```
HTML：骨架 
CSS：外观 
JavaScript：行为
```



### 1.2 开发工具准备

开始前，你需要准备以下工具：

1. **文本编辑器**：推荐使用Visual Studio Code或者是字节刚推出的Trae

2. **浏览器**：推荐使用Chrome，有强大的开发者工具

3. **GitHub账号**：用于存储留言数据

   

## 2. 项目概述与准备工作

### 2.1 留言板功能介绍

我们将要构建的留言板系统具有以下功能：

- 用户可以填写昵称和留言内容
- 用户可以提交留言
- 页面显示所有已提交的留言
- 留言按时间倒序排列



### 2.2 项目结构

首先，创建以下文件夹和文件：

```
guestbook/
├── css/
│   └── guestbook.css    # 留言板样式文件
├── js/
│   ├── guestbook.js     # 留言板核心逻辑
├── index.html           # 留言板页面
└── README.md            # 项目文档
```



### 2.3 GitHub准备工作

1. 注册GitHub账号
2. 创建一个新的GitHub仓库
3. 创建一个Issue（用于存储留言）
4. 生成Personal Access Token（用于API认证）
   - 登录GitHub，点击右上角头像 → Settings → Developer settings → Personal access tokens → Generate new token
   - 勾选「repo」权限，设置合适的过期时间
   - 生成并保存好token，它只会显示一次！



## 3. 构建HTML页面结构

### 3.1 HTML基础知识

HTML使用标签来定义网页的结构和内容。一个HTML文档通常包含以下部分：

```html
<!DOCTYPE html>
<html>
<head>
    <!-- 元数据，如标题、字符集、样式链接等 -->
</head>
<body>
    <!-- 网页内容 -->
</body>
</html>
```

常用的HTML标签：

- `<h1>` 到 `<h6>`：标题
- `<p>`：段落
- `<div>`：区块
- `<span>`：行内元素
- `<a>`：链接
- `<img>`：图片
- `<form>`、`<input>`、`<textarea>`、`<button>`：表单元素

### 3.2 创建留言板的HTML结构

现在，让我们创建留言板的HTML结构。打开`index.html`文件，输入以下代码：

### 3.3 HTML结构解析

让我们来分析一下这个HTML结构：

1. **文档类型和头部**：

   - `<!DOCTYPE html>` 声明文档类型
   - `<head>` 包含元数据，如字符集、视口设置、标题和样式链接

   ```html
   <!DOCTYPE html>
   <head>
       <meta charset="UTF-8">
       <!--声明UTF-8，使中文支持-->
       
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <!--viewport是用于控制页面在移动设备上的显示方式的，它设置视口宽度等于设备宽度并初始缩放比例为1.0，这是响应式设计的基础，如果不考虑移动端适配可以不加。-->
       
       <title>留言板</title>
       <!--显示在标签栏上的标题-->
       
       <link rel="stylesheet" href="./css/guestbook.css">
       <!--直接写./是代表当前文件的路径，也可以写成css/guestbook.css。../则是代表文件所在上一级目录-->
       
   </head>
   ```

   

2. **页面主体**：

   - `<header>` 包含页面标题
   - `<main>` 包含主要内容
   - `<footer>` 包含页脚信息

   ```html
   <body>
       <header>
           <h1><a title="留言板">简易留言板</a></h1>
               <!--这里的title可以使鼠标悬停在“简易留言板”这个标题的时候有“留言板”这三个字的提示-->
           
       </header>
   
       <main>
           <!--中间的内容我们下一步再来写-->
           
       </main>
       
       <footer>
           <!--这就是页脚，也是可有可无的东西-->
           <p>简易留言板示例 | 适合前端初学者学习</p>
       </footer>
   
       <script src="./js/guestbook.js"></script>
       <!--导入我们会用到的guestbook.js-->
       
   </body>
   </html><!--结束html文档-->
   ```

   

3. **留言板容器**：

   - `<div class="guestbook-container">` 是留言板的主容器
   - 包含标题、介绍文字、留言表单和留言列表

   ```html
   <div class="guestbook-container">
       
               <!--这里生成了一个区块，可以把html想象成积木，每一个区块就是一个积木，方便模块化管理-->
       
               <!--class是类，主要是方便css和js进行调用，可以看作是把这一整个区块取了个昵称-->
       
               <h2>留言板</h2>
               <p class="guestbook-intro">欢迎来到留言板！在这里，你可以留下你的想法、建议或者只是打个招呼。</p>
               <!--一个段落-->
               
               <!--下面继续补充-->
           </div>
   ```

   

4. **留言表单**：

   - 包含昵称输入框、留言内容文本区域和提交按钮

   - 使用 `id` 属性为JavaScript提供元素引用

     ```html
     <!-- 留言表单 -->
                 <div class="message-form">
                     <div class="form-group">
                         <input type="text" id="message-nickname" placeholder="昵称" required>
                         
                         <!--这里是一个表单中的一个输入框input，输入的数据类型是text，赋值到一个变量（id）message-nickname中-->
                         
                         <!--placeholder的意思是占位符，就是你还没输入文字的时候，输入框会显示的。required代表是要求必填-->
                         
                     </div>
                     <div class="form-group">
                         <textarea id="message-content" placeholder="说点什么吧..." required></textarea>
                         
                         <!--textarea的意思是文本框，和单纯一行的输入框作为对比-->
                         
                     </div>
                     <div class="form-group">
                         <button id="submit-message">发表留言</button>
                         <!--一个按钮-->
                         
                     </div>
                 </div>
     ```

     

5. **留言列表**：

   - 初始显示"加载留言中..."的提示
   - 将由JavaScript动态填充留言内容

   ```html
               <!-- 留言列表 -->
               <div id="messages-list" class="messages-list">
                   <div class="loading">加载留言中...</div>
               </div>
   ```

### 得到index.html

- 然后我们就能得到一个总的index.html文件

```html
<!DOCTYPE html>
<head>
    <meta charset="UTF-8">
    <!--声明UTF-8，使中文支持-->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!--viewport是用于控制页面在移动设备上的显示方式的，它设置视口宽度等于设备宽度并初始缩放比例为1.0，这是响应式设计的基础，如果不考虑移动端适配可以不加。-->
    <title>留言板</title>
    <!--显示在标签栏上的标题-->
    <link rel="stylesheet" href="./css/guestbook.css">
    <!--直接写./是代表当前文件的路径，也可以写成css/guestbook.css。../则是代表文件所在上一级目录-->
</head>
<body>
    <header>
        <h1><a title="留言板">简易留言板</a></h1>
            <!--这里的title可以使鼠标悬停在“简易留言板”这个标题的时候有“留言板”这三个字的提示-->
    </header>

    <main>
        <div class="guestbook-container">
            <!--这里生成了一个区块，可以把html想象成积木，每一个区块就是一个积木，方便模块化管理-->
            <!--class是类，主要是方便css和js进行调用，可以看作是把这一整个区块取了个昵称-->
            <h2>留言板</h2>
            <p class="guestbook-intro">欢迎来到留言板！在这里，你可以留下你的想法、建议或者只是打个招呼。</p>
            <!--一个段落-->
            
            <!-- 留言表单 -->
            <div class="message-form">
                <div class="form-group">
                    <input type="text" id="message-nickname" placeholder="昵称" required>
                    <!--这里是一个表单中的一个输入框input，输入的数据类型是text，赋值到一个变量（id）message-nickname中-->
                    <!--placeholder的意思是占位符，就是你还没输入文字的时候，输入框会显示的。required代表是要求必填-->
                </div>
                <div class="form-group">
                    <textarea id="message-content" placeholder="说点什么吧..." required></textarea>
                    <!--textarea的意思是文本框，和单纯一行的输入框作为对比-->
                </div>
                <div class="form-group">
                    <button id="submit-message">发表留言</button>
                    <!--一个按钮-->
                </div>
            </div>
            
            <!-- 留言列表 -->
            <div id="messages-list" class="messages-list">
                <div class="loading">加载留言中...</div>
            </div>
        </div>
    </main>
    
    <footer>
        <!--这就是页脚，也是可有可无的东西-->
        <p>简易留言板示例 | 适合前端初学者学习</p>
    </footer>

    <script src="./js/guestbook.js"></script>
    <!--导入我们会用到的guestbook.js-->
</body>
</html><!--结束html文档-->
```

- **保存成index.html，直接双击用浏览器打开一下试试看？**
- **诶？是不是和想象中的漂亮模样相差甚远？**
- **别担心，这是因为我们还没有引入CSS进行美化**