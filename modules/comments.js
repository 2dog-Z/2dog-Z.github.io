import { formatDate, randomNickname } from "./utils.js";

/**
 * 评论模块：负责右侧评论区的渲染与新增。
 * 功能：
 * - 初始化一组示例评论（用于静态站点的“内容填充”与视觉效果）
 * - 提供 add(text) 方法供终端 say 命令调用
 * 目的：把评论 DOM 拼装逻辑从主入口/终端逻辑中剥离，提升复用与可读性。
 */

/**
 * 构建单条评论的 DOM 结构。
 * 功能：将 {name,text,date} 转换为页面需要的节点树，并设置必要 class/role。
 * 目的：集中管理评论的 DOM 结构，后续改样式或结构只需改一个地方。
 */
function createCommentElement({ name, text, date }) {
  const item = document.createElement("div");
  item.className = "commentItem";
  item.setAttribute("role", "listitem");

  const meta = document.createElement("div");
  meta.className = "commentMeta";

  const nick = document.createElement("div");
  nick.className = "commentName";
  nick.textContent = name;

  const time = document.createElement("div");
  time.className = "commentDate";
  time.textContent = date;

  const p = document.createElement("p");
  p.className = "commentText";
  p.textContent = text;

  meta.appendChild(nick);
  meta.appendChild(time);
  item.appendChild(meta);
  item.appendChild(p);
  return item;
}

/**
 * 初始化评论区并返回操作接口。
 * 功能：
 * - 生成若干条示例评论并插入到列表中
 * - 返回 { add(text) } 用于在顶部插入新评论
 * 目的：让评论区对外只暴露一个最小 API（add），避免其它模块直接操作评论 DOM。
 */
export function setupComments() {
  const list = document.getElementById("commentsList");
  const samples = [
    "sample comment",
    "Love the terminal interaction.",
    "Clean layout—feels like building a homepage in VS Code.",
    "Could you add a longer article example?",
    "This page feels very geeky.",
  ];
  const now = new Date();
  const initial = Array.from({ length: 6 }).map((_, i) => ({
    name: randomNickname(),
    text: samples[i % samples.length],
    date: formatDate(new Date(now.getTime() - i * 86400000)),
  }));

  for (const c of initial) list.appendChild(createCommentElement(c));
  return {
    /**
     * 新增一条评论（插入到最顶部）。
     * 功能：模拟“最新留言在前”的时间线。
     * 目的：终端 say 命令只需调用 window.__comments.add(text)，不关心 DOM 细节。
     */
    add(text) {
      const c = { name: randomNickname(), text, date: formatDate(new Date()) };
      list.insertBefore(createCommentElement(c), list.firstChild);
    },
  };
}
