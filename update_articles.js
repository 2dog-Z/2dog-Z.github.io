/**
 * 自动更新文章列表脚本
 * 此脚本用于扫描posts目录下的所有Markdown文件，并更新articles.js文件
 * 使用方法：node update_articles.js
 */

const fs = require('fs');
const path = require('path');

// 配置
const config = {
  postsDir: path.join(__dirname, 'posts'),
  outputFile: path.join(__dirname, 'js', 'articles.js'),
  filePattern: /^post\d+\.md$/i
};

/**
 * 从Markdown内容中解析元数据
 * @param {string} content Markdown内容
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
 * 扫描文章目录，获取所有Markdown文件并解析元数据
 * @returns {Array} 文章列表数据
 */
function scanArticles() {
  console.log(`扫描目录: ${config.postsDir}`);
  
  // 读取posts目录下的所有文件
  const files = fs.readdirSync(config.postsDir);
  
  // 过滤出Markdown文件
  const mdFiles = files.filter(file => 
    config.filePattern.test(file) && fs.statSync(path.join(config.postsDir, file)).isFile()
  );
  
  console.log(`找到 ${mdFiles.length} 个Markdown文件`);
  
  // 解析每个文件的元数据
  const articles = mdFiles.map(file => {
    const filePath = path.join(config.postsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    return parseArticleMetadata(content, file);
  });
  
  // 按日期排序（最新的文章在前面）
  articles.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  return articles;
}

/**
 * 生成articles.js文件内容
 * @param {Array} articles 文章列表数据
 * @returns {string} 生成的文件内容
 */
function generateArticlesJs(articles) {
  const articlesJson = JSON.stringify(articles, null, 2)
    .replace(/^\[/m, 'const preloadedArticles = [')
    .replace(/\]$/m, '];');
  
  return `/**
 * 预生成的文章列表数据
 * 此文件包含所有文章的元数据，用于快速加载文章列表
 * 当添加新文章时，需要更新此文件
 */

// 预生成的文章列表数据
${articlesJson}

// 导出文章列表，使其可以被其他模块导入
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { preloadedArticles };
}
`;
}

/**
 * 主函数
 */
function main() {
  try {
    // 扫描文章
    const articles = scanArticles();
    
    // 生成articles.js文件内容
    const content = generateArticlesJs(articles);
    
    // 写入文件
    fs.writeFileSync(config.outputFile, content, 'utf8');
    
    console.log(`成功更新文章列表，共 ${articles.length} 篇文章`);
    console.log(`文件已保存到: ${config.outputFile}`);
  } catch (error) {
    console.error('更新文章列表失败:', error);
    process.exit(1);
  }
}

// 执行主函数
main();