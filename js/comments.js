/**
 * 简易评论系统
 * 使用GitHub Issues API作为后端存储评论数据
 * 无需用户登录，只需填写昵称即可发表评论
 */

// 配置信息
const commentsConfig = {
    // GitHub仓库所有者
    owner: '2dog-Z',
    // GitHub仓库名称
    repo: '2dog-Z.github.io',
    // 用于存储评论的issue编号
    issueId: 1,
    // 每页显示的评论数
    perPage: 10,
    // 当前页码
    currentPage: 1,
    // GitHub Personal Access Token (需要替换为你自己的token)
    // 注意：在生产环境中，应该使用更安全的方式存储token
    token: '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' // 这里需要填入你的GitHub Personal Access Token
};

/**
 * 初始化评论系统
 */
function initComments() {
    // 检查当前页面是否为文章页面
    // 使用更通用的检测方法，同时支持正斜杠和反斜杠
    // 同时检查URL参数中是否包含article参数
    if (window.location.pathname.includes('/posts/') || 
        window.location.pathname.includes('\\posts\\') || 
        window.location.pathname.includes('article.html') ||
        new URLSearchParams(window.location.search).has('article')) {
        // 创建评论区容器
        createCommentsContainer();
        // 加载评论数据
        loadComments();
    }
}

/**
 * 创建评论区容器
 */
function createCommentsContainer() {
    // 检查是否已存在评论区
    if (document.getElementById('comments-section')) return;

    // 创建评论区容器
    const commentsSection = document.createElement('div');
    commentsSection.id = 'comments-section';
    commentsSection.className = 'comments-section';

    // 创建评论区标题
    const commentsTitle = document.createElement('h3');
    commentsTitle.textContent = '评论区';
    commentsSection.appendChild(commentsTitle);

    // 创建评论表单
    const commentForm = document.createElement('div');
    commentForm.className = 'comment-form';
    commentForm.innerHTML = `
        <div class="form-group">
            <input type="text" id="comment-nickname" placeholder="昵称" required>
        </div>
        <div class="form-group">
            <textarea id="comment-content" placeholder="说点什么吧..." required></textarea>
        </div>
        <div class="form-group">
            <button id="submit-comment">发表评论</button>
        </div>
    `;
    commentsSection.appendChild(commentForm);

    // 创建评论列表容器
    const commentsList = document.createElement('div');
    commentsList.id = 'comments-list';
    commentsList.className = 'comments-list';
    commentsSection.appendChild(commentsList);

    // 创建分页控制器
    const paginationContainer = document.createElement('div');
    paginationContainer.id = 'comments-pagination';
    paginationContainer.className = 'comments-pagination';
    commentsSection.appendChild(paginationContainer);

    // 找到home-link元素（返回首页按钮）
    const homeLink = document.querySelector('.home-link');
    if (homeLink) {
        // 在home-link元素后面插入评论区
        homeLink.parentNode.insertBefore(commentsSection, homeLink.nextSibling);
    }

    // 添加提交评论事件监听
    document.getElementById('submit-comment').addEventListener('click', submitComment);
}

/**
 * 加载评论数据
 */
async function loadComments() {
    try {
        // 显示加载中提示
        const commentsList = document.getElementById('comments-list');
        if (!commentsList) return;
        
        commentsList.innerHTML = '<div class="loading">加载评论中...</div>';

        // 获取当前文章的标识符
        const articleId = getArticleId();
        
        // 构建API请求URL
        const apiUrl = `https://api.github.com/repos/${commentsConfig.owner}/${commentsConfig.repo}/issues/${commentsConfig.issueId}/comments?per_page=${commentsConfig.perPage}&page=${commentsConfig.currentPage}`;
        
        // 准备请求头
        const headers = {
            'Accept': 'application/vnd.github.v3+json'
        };
        
        // 如果配置了token，添加到请求头中
        if (commentsConfig.token) {
            headers['Authorization'] = `token ${commentsConfig.token}`;
        }
        
        // 发送请求获取评论数据
        const response = await fetch(apiUrl, { headers });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('API错误详情:', errorData);
            
            if (response.status === 401 || response.status === 403) {
                throw new Error('获取评论失败：认证错误，请确保已配置正确的GitHub Token');
            } else {
                throw new Error(`获取评论失败：${response.status} ${response.statusText}`);
            }
        }
        
        // 解析评论数据
        const comments = await response.json();
        
        // 过滤当前文章的评论
        const articleComments = comments.filter(comment => {
            try {
                const commentData = JSON.parse(comment.body);
                return commentData.articleId === articleId;
            } catch (e) {
                return false;
            }
        });
        
        // 更新评论列表
        updateCommentsList(articleComments);
        
        // 更新分页控制器
        updatePagination(response.headers.get('Link'));
        
    } catch (error) {
        console.error('加载评论失败:', error);
        const commentsList = document.getElementById('comments-list');
        if (commentsList) {
            commentsList.innerHTML = '<div class="error-message">加载评论失败，请稍后重试</div>';
        }
    }
}

/**
 * 获取当前文章的标识符
 * @returns {string} 文章标识符
 */
function getArticleId() {
    // 从URL中获取文章文件名
    const urlParams = new URLSearchParams(window.location.search);
    const articleFile = urlParams.get('article');
    
    if (articleFile) {
        return articleFile;
    }
    
    // 如果是传统路由，从路径中提取
    return window.location.pathname.split('/').pop().replace('.html', '');
}

/**
 * 更新评论列表
 * @param {Array} comments 评论数据
 */
function updateCommentsList(comments) {
    const commentsList = document.getElementById('comments-list');
    if (!commentsList) return;
    
    // 清空评论列表
    commentsList.innerHTML = '';
    
    // 如果没有评论
    if (comments.length === 0) {
        commentsList.innerHTML = '<div class="no-comments">暂无评论，快来发表第一条评论吧！</div>';
        return;
    }
    
    // 添加评论到列表
    comments.forEach(comment => {
        try {
            // 解析评论数据
            const commentData = JSON.parse(comment.body);
            
            // 创建评论元素
            const commentElement = document.createElement('div');
            commentElement.className = 'comment-item';
            
            // 设置评论内容
            commentElement.innerHTML = `
                <div class="comment-header">
                    <span class="comment-author">${escapeHtml(commentData.nickname)}</span>
                    <span class="comment-date">${formatDate(new Date(comment.created_at))}</span>
                </div>
                <div class="comment-content">${escapeHtml(commentData.content)}</div>
            `;
            
            // 添加到评论列表
            commentsList.appendChild(commentElement);
        } catch (e) {
            console.error('解析评论数据失败:', e);
        }
    });
}

/**
 * 更新分页控制器
 * @param {string} linkHeader GitHub API返回的Link头信息
 */
function updatePagination(linkHeader) {
    const paginationContainer = document.getElementById('comments-pagination');
    if (!paginationContainer) return;
    
    // 清空分页控制器
    paginationContainer.innerHTML = '';
    
    // 如果没有分页信息
    if (!linkHeader) return;
    
    // 解析Link头信息
    const links = parseLinkHeader(linkHeader);
    
    // 创建分页控制器
    const pagination = document.createElement('div');
    pagination.className = 'pagination';
    
    // 上一页按钮
    if (links.prev) {
        const prevButton = document.createElement('button');
        prevButton.textContent = '上一页';
        prevButton.addEventListener('click', () => {
            commentsConfig.currentPage--;
            loadComments();
        });
        pagination.appendChild(prevButton);
    }
    
    // 当前页码
    const pageInfo = document.createElement('span');
    pageInfo.className = 'page-info';
    pageInfo.textContent = `第 ${commentsConfig.currentPage} 页`;
    pagination.appendChild(pageInfo);
    
    // 下一页按钮
    if (links.next) {
        const nextButton = document.createElement('button');
        nextButton.textContent = '下一页';
        nextButton.addEventListener('click', () => {
            commentsConfig.currentPage++;
            loadComments();
        });
        pagination.appendChild(nextButton);
    }
    
    // 添加分页控制器到容器
    paginationContainer.appendChild(pagination);
}

/**
 * 解析Link头信息
 * @param {string} linkHeader GitHub API返回的Link头信息
 * @returns {Object} 解析后的链接对象
 */
function parseLinkHeader(linkHeader) {
    const links = {};
    
    if (!linkHeader) return links;
    
    // 分割多个链接
    linkHeader.split(',').forEach(part => {
        // 提取URL和rel值
        const match = part.match(/<(.+)>; rel="(.+)"/i);
        if (match) {
            const url = match[1];
            const rel = match[2];
            links[rel] = url;
        }
    });
    
    return links;
}

/**
 * 提交评论
 */
async function submitComment() {
    try {
        // 获取评论表单数据
        const nickname = document.getElementById('comment-nickname').value.trim();
        const content = document.getElementById('comment-content').value.trim();
        
        // 验证表单数据
        if (!nickname) {
            alert('请输入昵称');
            return;
        }
        
        if (!content) {
            alert('请输入评论内容');
            return;
        }
        
        // 禁用提交按钮
        const submitButton = document.getElementById('submit-comment');
        submitButton.disabled = true;
        submitButton.textContent = '提交中...';
        
        // 获取当前文章的标识符
        const articleId = getArticleId();
        
        // 构建评论数据
        const commentData = {
            articleId: articleId,
            nickname: nickname,
            content: content,
            timestamp: new Date().toISOString()
        };
        
        // 构建API请求URL
        const apiUrl = `https://api.github.com/repos/${commentsConfig.owner}/${commentsConfig.repo}/issues/${commentsConfig.issueId}/comments`;
        
        // 准备请求头
        const headers = {
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        };
        
        // 如果配置了token，添加到请求头中
        if (commentsConfig.token) {
            headers['Authorization'] = `token ${commentsConfig.token}`;
        }
        
        // 发送请求提交评论
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                body: JSON.stringify(commentData)
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('API错误详情:', errorData);
            
            if (response.status === 401 || response.status === 403) {
                throw new Error('提交评论失败：认证错误，请确保已配置正确的GitHub Token');
            } else {
                throw new Error(`提交评论失败：${response.status} ${response.statusText}`);
            }
        }
        
        // 清空表单
        document.getElementById('comment-nickname').value = '';
        document.getElementById('comment-content').value = '';
        
        // 重新加载评论
        loadComments();
        
        // 显示成功提示
        alert('评论提交成功！');
        
    } catch (error) {
        console.error('提交评论失败:', error);
        alert('提交评论失败，请稍后重试');
    } finally {
        // 恢复提交按钮
        const submitButton = document.getElementById('submit-comment');
        submitButton.disabled = false;
        submitButton.textContent = '发表评论';
    }
}

/**
 * 格式化日期
 * @param {Date} date 日期对象
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(date) {
    return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())} ${padZero(date.getHours())}:${padZero(date.getMinutes())}`;
}

/**
 * 数字补零
 * @param {number} num 数字
 * @returns {string} 补零后的字符串
 */
function padZero(num) {
    return num < 10 ? `0${num}` : num;
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

// 页面加载完成后初始化评论系统
document.addEventListener('DOMContentLoaded', initComments);