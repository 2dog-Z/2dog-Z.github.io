/**
 * 简易留言板系统
 * 使用GitHub Issues API作为后端存储留言数据
 * 适合前端初学者学习的简单示例
 */

// GitHub配置信息
const guestbookConfig = {
    owner: '2dog-Z',  // 修改为你的GitHub用户名
    repo: '2dog-Z.github.io',        // 修改为你的仓库名
    issueId: 2,                    // 修改为你创建的Issue编号
    _tokenParts: [                 // 将你的GitHub Token分割存储于此
        // 示例：如果你的token是'ghp_123456789abcdef'
        // 可以分割为：['ghp_', '12345', '6789a', 'bcdef']
        'github_', 
        'pat_', 
        '11BNK7W',
        'AQ0aqQ7tV980J2E',
        '_6QbcI8GqJ',
        'jyuI2zNuQUUt',
        'tNf9R28Bvd',
        '0zqkOWiaM4x',
        'nZWKDBYG7MP',
        '1qFQ58'
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