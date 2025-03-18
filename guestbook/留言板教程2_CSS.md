## 4. 设计CSS样式

### 4.1 CSS基础知识

CSS用于控制网页的外观和布局。CSS规则由选择器和声明块组成：

```css
选择器 {
    属性: 值;
    属性: 值;
}
```

常用的CSS选择器：

- 元素选择器：`div`, `p`, `h1` 	(很眼熟对吧，就是html里面的)
- 类选择器：`.class-name` （这就是为什么刚才要给class取name）
- ID选择器：`#id-name`（同理）
- 后代选择器：`div p`
- 伪类选择器：`:hover`, `:focus`

### 4.2 CSS变量和盒模型

CSS变量（自定义属性）允许你存储特定的值，以便在文档中重复使用：

```css
:root {
    --main-color: #ff0000;
}

.element {
    color: var(--main-color);
}
```

CSS盒模型描述了元素的空间占用：

- **内容区域**：元素的实际内容
- **内边距（padding）**：内容与边框之间的空间
- **边框（border）**：围绕内容和内边距的线条
- **外边距（margin）**：元素与其他元素之间的空间

### 4.3 创建留言板的CSS样式

现在，让我们为留言板创建样式。打开`css/guestbook.css`文件，输入以下代码：

```css
/**
 * 留言板系统样式
 */

/* 全局样式变量 - CSS变量是一个重要的基础知识点 */
:root {
    --main-bg-color: #ffffff;
    --container-bg-color: #f8f9fa;
    --border-color: #e1e4e8;
    --text-color: #24292e;
    --accent-color: #0366d6;
    --secondary-text-color: #586069;
}

/* 全局样式 - 基础的页面布局 */
body {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    color: var(--text-color);
    background-color: var(--main-bg-color);
    margin: 0;
    padding: 20px;
}

/* 留言板容器 - 盒模型知识点 */
.guestbook-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
    background-color: var(--container-bg-color);
    border: 1px solid var(--border-color);
    border-radius: 5px;
}

/* 留言板标题和介绍 - 文本样式知识点 */
.guestbook-container h2 {
    color: var(--accent-color);
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 10px;
    margin-top: 0;
    font-size: 24px;
}

.guestbook-intro {
    margin-bottom: 20px;
    line-height: 1.6;
    color: var(--text-color);
}

/* 留言表单 - 表单样式知识点 */
.message-form {
    margin-bottom: 30px;
    padding: 15px;
    background-color: var(--main-bg-color);
    border: 1px solid var(--border-color);
    border-radius: 4px;
}

.form-group {
    margin-bottom: 15px;
}

.form-group input,
.form-group textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid var(--border-color);
    border-radius: 4px;
    font-family: inherit;
    box-sizing: border-box;
}

.form-group textarea {
    min-height: 100px;
    resize: vertical;
}

.form-group input:focus,
.form-group textarea:focus {
    outline: none;
    border-color: var(--accent-color);
}

.form-group button {
    background-color: var(--accent-color);
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 4px;
    cursor: pointer;
    font-family: inherit;
}

.form-group button:hover {
    background-color: #0358c3;
}

.form-group button:disabled {
    background-color: #666666;
    cursor: not-allowed;
}

/* 留言列表 - 列表样式知识点 */
.messages-list {
    margin-bottom: 20px;
}

.message-item {
    padding: 15px;
    margin-bottom: 15px;
    background-color: var(--main-bg-color);
    border: 1px solid var(--border-color);
    border-radius: 4px;
}

.message-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 10px;
}

.message-author {
    color: var(--accent-color);
    font-weight: bold;
}

.message-content {
    line-height: 1.6;
    white-space: pre-wrap;
}

/* 加载中和错误提示 */
.loading,
.error-message,
.no-messages {
    padding: 15px;
    text-align: center;
    color: var(--secondary-text-color);
}
```

### 4.4 CSS样式解析

让我们分析一下这个CSS样式：

1. **全局样式变量**：
   - 使用`:root`选择器定义全局CSS变量
   - 定义了颜色方案，便于统一管理和修改

2. **全局样式**：
   - 设置了基本的字体、行高、颜色和边距
   - 创建了干净、易读的基础样式

3. **留言板容器**：
   - 使用`max-width`和`margin: 0 auto`实现居中
   - 应用了边框、圆角和背景色

4. **表单样式**：
   - 为输入框和按钮设置了统一的样式
   - 添加了`:focus`和`:hover`状态的样式增强

5. **留言列表样式**：
   - 为每条留言创建了卡片式布局
   - 使用`flex`布局实现留言头部的两端对齐

## 5. 实现JavaScript交互功能

### 5.1 JavaScript基础知识

JavaScript是一种编程语言，用于实现网页的交互功能。基本概念包括：

- **变量和数据类型**：存储和操作数据
- **函数**：封装可重用的代码块
- **条件语句和循环**：控制代码执行流程
- **DOM操作**：与网页元素交互
- **事件处理**：响应用户操作

### 5.2 DOM操作和事件处理

DOM（Document Object Model）是HTML文档的编程接口，允许JavaScript访问和修改网页内容：

```javascript
// 获取元素
const element = document.getElementById('element-id');

// 修改内容
element.innerHTML = '新内容';

// 添加事件监听
element.addEventListener('click', function() {
    alert('元素被点击了！');
});
```

### 5.3 创建留言板的JavaScript功能

现在，让我们实现留言板的交互功能。打开`js/guestbook.js`文件，输入以下代码：

```javascript
/**
 * 简易留言板系统
 * 使用GitHub Issues API作为后端存储留言数据
 * 适合前端初学者学习的简单示例
 */

// GitHub配置信息
const guestbookConfig = {
    owner: '你的GitHub用户名',  // 修改为你的GitHub用户名
    repo: '你的仓库名',        // 修改为你的仓库名
    issueId: 1,                // 修改为你创建的Issue编号
    _tokenParts: [             // 将你的GitHub Token分割存储于此
        // 示例：如果你的token是'ghp_123456789abcdef'
        // 可以分割为：['ghp_', '12345', '6789a', 'bcdef']
    ]
};

/**
 * 初始化留言板系统
 */
function initGuestbook() {
    // 添加提交留言事件监听
    const submitButton = document.getElementById('submit-message');
    if (submitButton) {
        submitButton.addEventListener('click', submitMessage);
    }
    
    // 加载留言数据
    loadMessages();
}

/**
 * 获取完整的GitHub Token
 * @returns {string} 完整的GitHub Token
 */
function getFullToken() {
    return guestbookConfig._tokenParts.join('');
}

/**
 * 加载留言数据
 */
function loadMessages() {
    // 显示加载中提示
    const messagesList = document.getElementById('messages-list');
    if (!messagesList) return;
    
    messagesList.innerHTML = '<div class="loading">加载留言中...</div>';
    
    // 构建API请求URL
    const apiUrl = `https://api.github.com/repos/${guestbookConfig.owner}/${guestbookConfig.repo}/issues/${guestbookConfig.issueId}/comments`;
    
    // 发起API请求
    fetch(apiUrl, {
        headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `token ${getFullToken()}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`GitHub API请求失败: ${response.status}`);
        }
        return response.json();
    })
    .then(comments => {
        // 将GitHub评论转换为留言格式
        const messages = comments.map(comment => {
            // 尝试从评论内容中解析出昵称和留言内容
            let nickname = '匿名用户';
            let content = comment.body;
            
            // 假设评论格式为："昵称: 留言内容"
            const match = comment.body.match(/^(.+?):\s*([\s\S]+)$/);
            if (match) {
                nickname = match[1].trim();
                content = match[2].trim();
            }
            
            return {
                id: comment.id,
                nickname: nickname,
                content: content,
                timestamp: new Date(comment.created_at).toISOString()
            };
        });
        
        // 更新留言列表
        updateMessagesList(messages);
    })
    .catch(error => {
        console.error('加载留言失败:', error);
        messagesList.innerHTML = `<div class="error-message">加载留言失败: ${error.message}</div>`;
    });
}

/**
 * 更新留言列表
 * @param {Array} messages 留言数据
 */
function updateMessagesList(messages) {
    const messagesList = document.getElementById('messages-list');
    if (!messagesList) return;
    
    // 清空留言列表
    messagesList.innerHTML = '';
    
    // 如果没有留言
    if (messages.length === 0) {
        messagesList.innerHTML = '<div class="no-messages">暂无留言，快来发表第一条留言吧！</div>';
        return;
    }
    
    // 添加留言到列表（按时间倒序排列）
    messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    messages.forEach(message => {
        // 创建留言元素
        const messageElement = document.createElement('div');
        messageElement.className = 'message-item';
        
        // 设置留言内容
        messageElement.innerHTML = `
            <div class="message-header">
                <span class="message-author">${escapeHtml(message.nickname)}</span>
            </div>
            <div class="message-content">${escapeHtml(message.content)}</div>
        `;
        
        // 添加到留言列表
        messagesList.appendChild(messageElement);
    });
}

/**
 * 提交留言
 */
function submitMessage() {
    // 获取留言表单数据
    const nickname = document.getElementById('message-nickname').value.trim();
    const content = document.getElementById('message-content').value.trim();
    
    // 验证表单数据
    if (!nickname) {
        alert('请输入昵称');
        return;
    }
    
    if (!content) {
        alert('请输入留言内容');
        return;
    }
    
    // 禁用提交按钮
    const submitButton = document.getElementById('submit-message');
    submitButton.disabled = true;
    submitButton.textContent = '提交中...';
    
    // 构建评论内容（格式：昵称: 留言内容）
    const commentBody = `${nickname}: ${content}`;
    
    // 构建API请求URL
    const apiUrl = `https://api.github.com/repos/${guestbookConfig.owner}/${guestbookConfig.repo}/issues/${guestbookConfig.issueId}/comments`;
    
    // 发起API请求
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `token ${getFullToken()}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ body: commentBody })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`GitHub API请求失败: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        // 清空表单
        document.getElementById('message-nickname').value = '';
        document.getElementById('message-content').value = '';
        
        // 重新加载留言
        loadMessages();
        
        // 显示成功提示
        alert('留言提交成功！');
    })
    .catch(error => {
        console.error('提交留言失败:', error);
        alert(`提交留言失败: ${error.message}`);
    })
    .finally(() => {
        // 恢复提交按钮
        submitButton.disabled = false;
        submitButton.textContent = '发表留言';
    });
}

/**
 * 转义HTML特殊字符
 * @param {string} text 原始文本
 * @returns {string} 转义后的文本
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 页面加载完成后初始化留言板系统
document.addEventListener('DOMContentLoaded', initGuestbook);
```

### 5.4 JavaScript功能解析

让我们分析一下这个JavaScript代码：

1. **配置信息**：
   - 定义了GitHub API所需的配置信息
   - 使用数组分割存储Token，提高安全性

2. **初始化函数**：
   - 添加事件监听器
   - 加载留言数据

3. **加载留言**：
   - 使用`fetch` API发起HTTP请求
   - 处理响应数据并更新页面

4. **提交留言**：
   - 获取并验证表单数据
   - 发送POST请求到GitHub API
   - 处理成功和失败情况

5. **辅助函数**：
   - `escapeHtml`：防止XSS攻击
   - `updateMessagesList`：更新留言列表UI

## 6. 使用GitHub API存储数据

### 6.1 GitHub API简介

GitHub API是GitHub提供的编程接口，允许开发者通过HTTP请求与GitHub交互。在本项目中，我们使用GitHub Issues API作为留言板的后端存储。

### 6.2 创建GitHub Token

要使用GitHub API，你需要创建一个Personal Access Token：

1. 登录GitHub，点击右上角头像
2. 选择Settings → Developer settings → Personal access tokens → Generate new token
3. 勾选「repo」权限，设置合适的过期时间
4. 点击「Generate token」按钮
5. 复制并安全保存生成的token

### 6.3 创建Issue作为留言存储

1. 在你的GitHub仓库中创建一个新的Issue
2. 给Issue起一个标题，如「留言板数据」
3. 记下Issue的编号（URL中的数字）

### 6.4 配置留言板

打开`js/guestbook.js`文件，修改配置信息：

```javascript
const guestbookConfig = {
    owner: '你的GitHub用户名',  // 修改为你的GitHub用户名
    repo: '你的仓库名',        // 修改为你的仓库名
    issueId: 1,                // 修改为你创建的Issue编号
    _tokenParts: [             // 将你的GitHub Token分割存储于此
        // 示例：如果你的token是'ghp_123456789abcdef'
        // 可以分割为：['ghp_', '12345', '6789a', 'bcdef']
    ]
};
```

## 7. 测试与部署

### 7.1 本地测试

1. windows+r输入cmd，进入命令行输入cd （你的guestbook文件夹路径）
2. 输入python -m http.server 8000
3. 在浏览器中打开 localhost:8000
4. 尝试提交一条留言
5. 检查留言是否成功显示
6. 刷新页面，确认留言数据是否正确加载

### 7.2 常见问题排查

如果遇到问题，请检查：

1. **留言提交失败**：
   - GitHub Token是否正确
   - 网络连接是否正常
   - 控制台是否有错误信息

2. **留言加载失败**：
   - GitHub配置是否正确
   - Issue编号是否正确
   - Token权限是否足够

### 7.3 部署到网站

你可以将留言板部署到任何静态网站托管服务：

**GitHub Pages**：

   - 将代码推送到GitHub仓库
   - 启用GitHub Pages功能




## 总结

恭喜你完成了这个简易留言板项目！通过这个项目，你学习了：

1. **HTML基础**：页面结构、标签使用、表单元素
2. **CSS样式**：选择器、盒模型、变量、布局技术
3. **JavaScript编程**：DOM操作、事件处理、异步请求
4. **API集成**：使用GitHub API存储和获取数据

这只是前端开发的开始，随着你的不断学习和实践，你将能够构建更复杂、更强大的web应用。继续探索，享受编程的乐趣！

---

如有问题或建议，欢迎在GitHub上提交Issue或Pull Request。祝你学习愉快！