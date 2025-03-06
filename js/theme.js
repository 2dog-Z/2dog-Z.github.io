/**
 * 切换网站主题
 * 
 * 此函数通过更改CSS链接来切换网站的主题（暗黑或明亮）它首先找到主题样式链接，
 * 然后根据当前主题（暗黑或明亮）来决定切换到哪种主题，并更新CSS链接相应地
 * 它还根据当前页面路径来调整CSS文件路径最后，它将在本地存储中保存当前主题，
 * 以便在用户下次访问时保持相同的主题
 */
function toggleTheme() {
    // 获取主题样式链接元素
    const themeLink = document.getElementById('theme-style');
    // 判断当前主题是否为暗黑主题
    const isDark = themeLink.href.includes('dark');
    // 判断当前页面路径是否包含'/posts/'，用于调整CSS文件路径
    const isInPostsDir = window.location.pathname.includes('/posts/');
    
    // 根据当前页面位置设置正确的CSS路径
    const cssPath = isInPostsDir ? '../css' : 'css';
    
    // 切换CSS文件
    themeLink.href = isDark ? `${cssPath}/light.css` : `${cssPath}/dark.css`;
    
    // 保存到LocalStorage
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
}

// 初始化主题
// 从LocalStorage获取保存的主题，如果没有则默认为夜间主题
const savedTheme = localStorage.getItem('theme') || 'dark';
// 判断当前页面路径是否包含'/posts/'，用于调整CSS文件路径
const isInPostsDir = window.location.pathname.includes('/posts/');
// 根据当前页面位置设置正确的CSS路径
const cssPath = isInPostsDir ? '../css' : 'css';
// 根据保存的主题和当前页面路径，设置主题样式链接
document.getElementById('theme-style').href = `${cssPath}/${savedTheme}.css`;