/**
 * Markdown渲染和文章列表自动生成功能
 * 
 * 此文件实现两个主要功能：
 * 1. 自动扫描并生成markdown文件列表
 * 2. 使用marked.js在浏览器端渲染markdown内容
 */

// 文章列表配置
const articlesConfig = {
    // 文章目录路径（相对于网站根目录）
    directory: 'posts/',
    // 文章元数据（标题、日期等）
    articles: []
};

// 检查是否已加载预生成的文章列表
let preloadedArticlesLoaded = typeof preloadedArticles !== 'undefined';

/**
 * 初始化页面
 * 根据当前页面类型执行不同的初始化操作
 */
function initPage() {
    // 判断当前页面类型
    if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
        // 首页 - 加载文章列表
        loadArticleList();
    } else if (window.location.pathname.includes('/posts/')) {
        // 文章页 - 判断是否是动态路由
        if (window.location.pathname.endsWith('/article.html')) {
            // 动态路由 - 从URL参数获取文章文件名
            const urlParams = new URLSearchParams(window.location.search);
            const articleFile = urlParams.get('article');
            
            if (articleFile) {
                // 加载并渲染指定的Markdown文件
                // 修复路径问题：如果已经在posts目录下，不要重复添加posts/
                const mdFilePath = articleFile;
                loadAndRenderMarkdown(mdFilePath);
            } else {
                // 未指定文章，显示错误信息
                showArticleError('未指定文章');
            }
        } else if (window.location.pathname.endsWith('.html')) {
            // 传统路由 - 加载对应的Markdown文件
            const mdFilePath = window.location.pathname.replace('.html', '.md');
            loadAndRenderMarkdown(mdFilePath);
        }
        
        // 移除文章导航列表加载，只在首页显示
        // loadArticleNavigation();
    }
}

/**
 * 显示文章错误信息
 * @param {string} message 错误信息
 */
function showArticleError(message) {
    const articleContainer = document.querySelector('article');
    if (articleContainer) {
        articleContainer.innerHTML = `<h2>错误</h2><div class="error-message">${message}</div>`;
    }
}

/**
 * 加载文章导航列表
 * 在文章页面加载文章导航列表
 */
async function loadArticleNavigation() {
    try {
        // 获取文章列表
        const articles = await scanArticles();
        
        // 更新文章导航列表
        updateArticleNavigation(articles);
    } catch (error) {
        console.error('加载文章导航列表失败:', error);
    }
}

/**
 * 更新文章导航列表DOM
 * @param {Array} articles 文章列表数据
 */
function updateArticleNavigation(articles) {
    const navContainer = document.querySelector('#article-nav');
    if (!navContainer) return;
    
    // 清空现有列表
    navContainer.innerHTML = '';
    
    // 添加文章链接
    articles.forEach(article => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        // 修复导航链接，确保使用正确的文件路径
        a.href = `article.html?article=${article.file}`;
        a.textContent = article.title;
        li.appendChild(a);
        navContainer.appendChild(li);
    });
}

/**
 * 加载文章列表
 * 通过扫描posts目录下的所有.md文件，并生成文章列表
 */
async function loadArticleList() {
    try {
        // 在GitHub Pages环境中，我们需要使用预定义的文章列表
        // 但我们可以通过自动扫描文件名和解析文件内容来生成这个列表
        
        // 获取文章列表
        const articles = await scanArticles();
        
        // 更新文章列表
        updateArticleList(articles);
    } catch (error) {
        console.error('加载文章列表失败:', error);
    }
}

/**
 * 扫描文章目录，获取所有Markdown文件并解析元数据
 * @returns {Promise<Array>} 文章列表数据
 */
async function scanArticles() {
    // 首先检查是否有预加载的文章列表
    if (preloadedArticlesLoaded && preloadedArticles && preloadedArticles.length > 0) {
        console.log('使用预加载的文章列表数据');
        // 存储预加载的文章列表到localStorage以便离线使用
        storeArticles(preloadedArticles);
        return preloadedArticles;
    }
    
    // 其次检查localStorage中是否有缓存的文章列表
    let articles = getStoredArticles();
    
    // 如果有缓存的文章列表，直接使用
    if (articles && articles.length > 0) {
        console.log('使用缓存的文章列表数据');
        
        // 在后台尝试扫描新文章，但不阻塞UI渲染
        setTimeout(async () => {
            try {
                // 尝试扫描新文章
                await scanNewArticles(articles);
                // 更新缓存
                storeArticles(articles);
                // 如果有新文章，刷新页面显示
                updateArticleList(articles);
            } catch (error) {
                console.error('后台扫描新文章失败:', error);
            }
        }, 2000); // 延迟2秒执行，避免影响初始页面加载
        
        return articles;
    }
    
    // 如果没有预加载数据也没有缓存，则执行完整扫描
    console.log('执行完整文章扫描');
    
    // 确保articles是一个数组
    if (!articles) {
        articles = [];
    }
    
    // 尝试扫描新文章
    await scanNewArticles(articles);
    
    // 按日期排序（最新的文章在前面）
    articles.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // 存储文章列表到localStorage
    storeArticles(articles);
    
    return articles;
}

/**
 * 扫描新文章
 * @param {Array} articles 现有文章列表
 */
async function scanNewArticles(articles) {
    // 获取已知的文件名列表
    const knownFiles = articles.map(article => article.file);
    
    // 尝试检测新文件
    // 这里我们可以尝试请求一些可能的文件名，看它们是否存在
    // 例如，我们可以尝试post4.md, post5.md等
    
    // 在实际部署时，你可以手动更新文章列表，或使用GitHub API
    // 这里我们实现一个简单的自动检测机制
    
    const maxPostNumber = getMaxPostNumber(knownFiles);
    const nextPostNumber = maxPostNumber + 1;
    
    // 尝试检测是否存在新文章
    try {
        // 尝试请求下一个可能的文章文件
        const nextPostFile = `post${nextPostNumber}.md`;
        const response = await fetch(`${articlesConfig.directory}${nextPostFile}`);
        
        // 如果文件存在
        if (response.ok) {
            // 读取文件内容
            const content = await response.text();
            
            // 解析文章元数据（标题、日期等）
            const metadata = parseArticleMetadata(content, nextPostFile);
            
            // 添加到文章列表
            articles.push(metadata);
            
            // 递归检测更多新文章
            await scanNewArticles(articles);
        }
    } catch (error) {
        console.log('没有更多新文章');
        // 忽略错误，表示没有更多新文章
    }
}

/**
 * 从文章内容中解析元数据
 * @param {string} content 文章内容
 * @param {string} filename 文件名
 * @returns {Object} 文章元数据
 */
function parseArticleMetadata(content, filename) {
    // 默认元数据
    const metadata = {
        title: '未命名文章',
        file: filename,
        date: new Date().toISOString().split('T')[0] // 今天的日期
    };
    
    // 尝试从内容中提取标题（第一个#开头的行）
    const titleMatch = content.match(/^\s*#\s+(.+)$/m);
    if (titleMatch && titleMatch[1]) {
        metadata.title = titleMatch[1].trim();
    }
    
    // 尝试从内容中提取日期（如果有特定格式的日期标记）
    // 例如：<!-- date: 2023-09-15 -->
    const dateMatch = content.match(/<!--\s*date:\s*([\d-]+)\s*-->/i);
    if (dateMatch && dateMatch[1]) {
        metadata.date = dateMatch[1].trim();
    }
    
    return metadata;
}

/**
 * 获取最大的文章编号
 * @param {Array} files 文件名列表
 * @returns {number} 最大编号
 */
function getMaxPostNumber(files) {
    let maxNumber = 0;
    
    files.forEach(file => {
        // 从文件名中提取编号（例如：post1.md -> 1）
        const match = file.match(/post(\d+)\.md/i);
        if (match && match[1]) {
            const number = parseInt(match[1], 10);
            if (number > maxNumber) {
                maxNumber = number;
            }
        }
    });
    
    return maxNumber;
}

/**
 * 从localStorage获取存储的文章列表
 * @returns {Array|null} 文章列表或null
 */
function getStoredArticles() {
    try {
        const stored = localStorage.getItem('blog_articles');
        return stored ? JSON.parse(stored) : null;
    } catch (error) {
        console.error('读取存储的文章列表失败:', error);
        return null;
    }
}

/**
 * 将文章列表存储到localStorage
 * @param {Array} articles 文章列表
 */
function storeArticles(articles) {
    try {
        localStorage.setItem('blog_articles', JSON.stringify(articles));
    } catch (error) {
        console.error('存储文章列表失败:', error);
    }
}

/**
 * 更新文章列表DOM
 * @param {Array} articles 文章列表数据
 */
function updateArticleList(articles) {
    const navContainer = document.querySelector('.nav-container nav ul');
    if (!navContainer) return;
    
    // 清空现有列表
    navContainer.innerHTML = '';
    
    // 添加文章链接
    articles.forEach(article => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = `posts/article.html?article=${article.file}`;
        
        // 创建一个容器来包含标题和日期
        const contentDiv = document.createElement('div');
        contentDiv.className = 'article-item';
        
        // 添加标题
        const titleSpan = document.createElement('span');
        titleSpan.className = 'article-title';
        titleSpan.textContent = article.title;
        contentDiv.appendChild(titleSpan);
        
        // 添加日期
        const dateSpan = document.createElement('span');
        dateSpan.className = 'article-date';
        dateSpan.textContent = article.date;
        contentDiv.appendChild(dateSpan);
        
        a.appendChild(contentDiv);
        li.appendChild(a);
        navContainer.appendChild(li);
    });
}

/**
 * 加载并渲染Markdown内容
 * @param {string} mdFilePath Markdown文件路径
 */
async function loadAndRenderMarkdown(mdFilePath) {
    try {
        // 加载marked.js库（如果尚未加载）
        await loadMarkedIfNeeded();
        
        // 获取文章容器
        const articleContainer = document.querySelector('article');
        if (!articleContainer) return;
        
        // 保存日期元素（如果存在）
        const dateElement = articleContainer.querySelector('time');
        
        // 清空文章容器（保留日期）
        articleContainer.innerHTML = '';
        
        // 恢复日期（如果存在）
        if (dateElement) articleContainer.appendChild(dateElement);
        
        // 获取Markdown内容
        let markdownContent;
        
        try {
            // 尝试从服务器获取Markdown文件内容
            const response = await fetch(mdFilePath);
            
            if (response.ok) {
                // 如果文件存在，读取内容
                markdownContent = await response.text();
                
                // 解析文章元数据
                const metadata = parseArticleMetadata(markdownContent, mdFilePath.split('/').pop());
                
                // 创建标题元素
                const titleElement = document.createElement('h2');
                titleElement.textContent = metadata.title;
                articleContainer.appendChild(titleElement);
                
                // 更新日期（如果存在）
                if (dateElement && metadata.date) {
                    dateElement.textContent = metadata.date;
                    articleContainer.appendChild(dateElement);
                }
            } else {
                // 如果文件不存在，显示错误信息
                markdownContent = '# 文章未找到\n\n请确认文件路径是否正确。';
            }
        } catch (error) {
            console.error('获取Markdown文件失败:', error);
            markdownContent = '# 加载文章失败\n\n请检查网络连接或刷新页面重试。';
        }
        
        // 检查marked对象是否已加载
        if (typeof marked === 'undefined') {
            console.error('marked库未成功加载，无法渲染Markdown内容');
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = '无法加载Markdown渲染库，请检查网络连接或刷新页面重试。';
            articleContainer.appendChild(errorDiv);
            return;
        }
        
        // 渲染Markdown内容
        const htmlContent = marked.parse(markdownContent);
        
        // 创建内容容器
        const contentDiv = document.createElement('div');
        contentDiv.className = 'markdown-content';
        
        // 修改：移除Markdown内容中的第一个标题，避免重复显示
        // 查找第一个h1或h2标签并移除
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        const firstHeading = tempDiv.querySelector('h1, h2');
        if (firstHeading) {
            firstHeading.remove();
        }
        contentDiv.innerHTML = tempDiv.innerHTML;
        
        // 添加内容到文章容器
        articleContainer.appendChild(contentDiv);
        
        console.log('Markdown内容已成功渲染');
    } catch (error) {
        console.error('加载Markdown内容失败:', error);
        // 显示错误信息给用户
        const articleContainer = document.querySelector('article');
        if (articleContainer) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = '加载文章内容时出错，请稍后重试。';
            articleContainer.appendChild(errorDiv);
        }
    }
}

/**
 * 加载marked.js库（如果尚未加载）
 * @returns {Promise} 加载完成的Promise
 */
function loadMarkedIfNeeded() {
    return new Promise((resolve, reject) => {
        // 检查marked是否已加载
        if (window.marked) {
            resolve();
            return;
        }
        
        // 创建script元素
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
        script.onload = () => {
            console.log('marked.js库已成功加载');
            resolve();
        };
        script.onerror = () => {
            console.error('无法加载marked.js库');
            reject(new Error('Failed to load marked.js'));
        };
        
        // 添加到文档
        document.head.appendChild(script);
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initPage);