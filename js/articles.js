/**
 * 预生成的文章列表数据
 * 此文件包含所有文章的元数据，用于快速加载文章列表
 * 当添加新文章时，需要更新此文件
 */

// 预生成的文章列表数据
const preloadedArticles = [
  {
    "title": "v6版本更新文档",
    "file": "post10.md",
    "date": "2025-03-10"
  },
  {
    "title": "v5版本更新文档",
    "file": "post9.md",
    "date": "2025-03-09"
  },
  {
    "title": "示例文章4",
    "file": "post7.md",
    "date": "2025-03-08"
  },
  {
    "title": "v4版本更新文档",
    "file": "post8.md",
    "date": "2025-03-08"
  },
  {
    "title": "示例文章3",
    "file": "post5.md",
    "date": "2025-03-07"
  },
  {
    "title": "v3版本更新文档",
    "file": "post6.md",
    "date": "2025-03-07"
  },
  {
    "title": "v2版本更新文档",
    "file": "post4.md",
    "date": "2025-03-06"
  },
  {
    "title": "示例文章2",
    "file": "post2.md",
    "date": "2025-03-05"
  },
  {
    "title": "V1版本开发文档",
    "file": "post3.md",
    "date": "2025-03-05"
  },
  {
    "title": "Hello World",
    "file": "post1.md",
    "date": "1999-01-01"
  }
];

// 导出文章列表，使其可以被其他模块导入
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { preloadedArticles };
}
