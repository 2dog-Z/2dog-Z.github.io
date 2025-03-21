# 2Dog的个人博客系统

这是一个见证个人技术成长的渐进式项目，完整呈现了如何从基础静态网页起步，逐步构建动态内容管理系统的个人博客项目的技术演进路线



## 项目概述

这个博客系统经历了多个版本的迭代，从最初的纯静态HTML页面，发展为具有动态路由和自动化内容管理的现代Web应用。整个演变过程实践了前端开发中的多种设计模式，更体现了对Web开发实践的持续探索。



## 发展历程

### v1版本：静态HTML起点

最初的版本采用纯静态HTML构建，实现了基本的博客功能：
- 简单的文章列表和文章页面

- 基础的明暗主题切换功能

- VSCode风格的UI设计

  

### v2版本：结构与UI优化

第二个版本关注于改善页面结构即美化UI：
- 添加了"关于我"页面

- 统一了页面导航和页脚

- 优化了主题切换功能，支持不同页面路径

  

### v3版本：实现实时渲染Markdown（重要结构转变）

- 引入Markdown格式存储文章内容，使用户能更加专注于内容书写

- 添加了marked.js实现浏览器端渲染，将内容与展示分离

  

### v4版本：模板与自动化（重要思路转变）

- 引入了模板化设计和更多自动化功能

- 添加了文章模板，支持变量替换

- 实现了导航自动生成和更新

  

### v5版本：动态路由（重要功能更新）

- 统一文章页面，通过URL参数加载不同内容

- 简化了文件结构，降低了维护成本

- 优化了用户界面和导航体验

- 提高了系统的扩展性和灵活性

- 现用户仅需添加md文件，剩余所有步骤将由系统完成

### v6版本：性能优化与缓存系统（重要性能更新）

- 引入预生成文章列表（articles.js），显著提升加载速度

- 实现多级缓存策略，支持离线访问能力

- 添加自动化文章列表更新脚本（update_articles.js）

- 优化用户体验，实现无闪烁内容更新

- 增强文章列表显示，添加日期信息与排序功能

### v7版本：社区互动与移动体验（重要功能扩展）

- 集成基于GitHub Issues的轻量级评论系统，无需额外数据库

- 添加自定义域名支持，通过CNAME文件实现域名绑定

- 评论系统支持主题自适应，保持与博客整体风格一致

- 全面优化移动端体验，包括响应式布局、触控友好设计和内容边距调整

- 针对移动设备优化资源加载和性能，提升首屏加载速度

- 模块化设计评论功能，便于维护和扩展

  

## 如何使用

### 添加新文章

1. 在`posts`目录下创建一个新的`.md`文件
2. 在文件开头添加标题和日期信息：

```markdown
# 文章标题

<!-- date: YYYY-MM-DD -->

文章内容...
```

3. 保存文件后，运行update_articles_list.bat更新文章列表
4. 系统会自动处理剩余工作，包括更新导航和文章列表


### 文章访问方式

```
/posts/article.html?article=文件名.md
```

### 评论系统配置

1. 在GitHub仓库中创建一个用于存储评论的Issue
2. 在js/comments.js文件中设置GitHub仓库信息和Issue ID
3. 申请Github Api Token，仅允许本仓库的issue的读写操作
4. 在comments.js里面分块填写Token（防止Secret检查）
5. 评论系统会自动集成到每篇文章页面底部


## 项目初衷与理念

这个博客系统的开发初衷是创建一个简单、高效且易于维护的博客系统，帮助我本人熟练掌握和运用前端的各种技术。

核心理念是 **简约至上，易于维护**



## 未来展望

- 标签和分类系统
- 搜索功能

---

> 持续迭代的数字足迹，Let's build something meaningful!