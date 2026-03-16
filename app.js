const CHEAT_SHEET = [
  { cmd: "ls", args: "None", desc: "List directories or files in the current level." },
  { cmd: "cd", args: "[path/category]", desc: "Enter the specified article category." },
  { cmd: "..", args: "None", desc: "Go back to the parent directory." },
  { cmd: "cat", args: "[filename]", desc: "Open and read the specified article." },
  { cmd: "say", args: "[text]", desc: "Leave a comment or message." },
  { cmd: "help", args: "None", desc: "Show all available commands and their descriptions." },
  { cmd: "clear", args: "None", desc: "Clear the terminal screen." },
];

const FILE_SYSTEM = {
  tech: {
    "welcome.md": [
      "# Tech Notes",
      "",
      "This is where I keep technical notes and ideas.",
      "",
      "- Try:",
      "  - ls",
      "  - cd tech",
      "  - cat welcome.md",
    ].join("\n"),
    "vscode-theme.md": [
      "# VS Code Dark Theme Palette",
      "",
      "This page is mainly for demonstrating the reading experience.",
      "Colors are inspired by VS Code's default dark theme.",
    ].join("\n"),
  },
  life: {
    "notes.txt": [
      "Life reminders:",
      "- Sleep early",
      "- Drink more water",
      "- Keep exercising",
    ].join("\n"),
  },
  reading: {
    "list.md": [
      "# Reading List",
      "",
      "- Design & Product",
      "- Engineering & Performance",
      "- Writing & Communication",
    ].join("\n"),
  },
};

function randomNickname() {
  const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
  const segments = [];
  const segCount = 2 + Math.floor(Math.random() * 2);
  for (let i = 0; i < segCount; i += 1) {
    const len = 4 + Math.floor(Math.random() * 4);
    let seg = "";
    for (let j = 0; j < len; j += 1) seg += alphabet[Math.floor(Math.random() * alphabet.length)];
    segments.push(seg);
  }
  return segments.join("_");
}

function formatDate(d) {
  const yyyy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function tokenize(input) {
  const trimmed = input.trim();
  if (!trimmed) return { cmd: "", args: "" };
  const firstSpace = trimmed.indexOf(" ");
  if (firstSpace === -1) return { cmd: trimmed, args: "" };
  return { cmd: trimmed.slice(0, firstSpace), args: trimmed.slice(firstSpace + 1).trim() };
}

function joinPath(parts) {
  if (parts.length === 0) return "~";
  return `~/${parts.join("/")}`;
}

function resolveDir(fs, pathParts) {
  let node = fs;
  for (const p of pathParts) {
    if (!node || typeof node !== "object") return null;
    const next = node[p];
    if (!next || typeof next !== "object") return null;
    node = next;
  }
  return node;
}

function listDir(fs, pathParts) {
  if (pathParts.length === 0) return Object.keys(fs).sort().map((name) => `${name}/`);
  const node = resolveDir(fs, pathParts);
  if (!node) return null;
  const dirs = [];
  const files = [];
  for (const [k, v] of Object.entries(node)) {
    if (v && typeof v === "object") dirs.push(`${k}/`);
    else files.push(k);
  }
  return [...dirs.sort(), ...files.sort()];
}

function treeAtRoot(fs) {
  const dirs = Object.keys(fs).sort();
  const lines = ["."];
  dirs.forEach((d, idx) => {
    const last = idx === dirs.length - 1;
    lines.push(`${last ? "└──" : "├──"} ${d}/`);
  });
  return lines.join("\n");
}

function treeAtPath(fs, pathParts) {
  const node = pathParts.length === 0 ? fs : resolveDir(fs, pathParts);
  if (!node) return null;
  const entries = Object.entries(node).sort(([a], [b]) => a.localeCompare(b));
  const lines = ["."];
  entries.forEach(([name, value], idx) => {
    const last = idx === entries.length - 1;
    const isDir = value && typeof value === "object";
    lines.push(`${last ? "└──" : "├──"} ${name}${isDir ? "/" : ""}`);
  });
  return lines.join("\n");
}

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

function setupComments() {
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
    add(text) {
      const c = { name: randomNickname(), text, date: formatDate(new Date()) };
      list.insertBefore(createCommentElement(c), list.firstChild);
    },
  };
}

function createTerminal() {
  const output = document.getElementById("terminalOutput");
  const input = document.getElementById("terminalInput");
  const prompt = document.getElementById("promptText");

  let cwd = [];
  let isPrinting = false;
  const history = [];
  let historyIndex = -1;

  function scrollToBottom() {
    output.scrollTop = output.scrollHeight;
  }

  function setPrompt() {
    prompt.textContent = `guest@home:${joinPath(cwd)}$`;
  }

  function appendLine(text, variant) {
    const div = document.createElement("div");
    div.className = `terminalLine${variant ? ` ${variant}` : ""}`;
    div.textContent = text;
    output.appendChild(div);
    scrollToBottom();
  }

  function typewriter(text, options = {}) {
    const { variant, speedMs = 12, lineDelayMs = 50 } = options;
    const lines = String(text ?? "").split("\n");
    isPrinting = true;
    let i = 0;

    const step = () => {
      if (i >= lines.length) {
        isPrinting = false;
        scrollToBottom();
        return;
      }
      const div = document.createElement("div");
      div.className = `terminalLine${variant ? ` ${variant}` : ""}`;
      output.appendChild(div);
      const line = lines[i];
      let pos = 0;
      const tick = () => {
        div.textContent = line.slice(0, pos);
        pos += 1;
        scrollToBottom();
        if (pos <= line.length) {
          window.setTimeout(tick, speedMs);
        } else {
          i += 1;
          window.setTimeout(step, lineDelayMs);
        }
      };
      tick();
    };

    step();
  }

  function printHelp() {
    const rows = CHEAT_SHEET.map((r) => `  ${r.cmd.padEnd(6, " ")} ${r.args.padEnd(14, " ")} ${r.desc}`);
    appendLine("Available commands:", "dim");
    for (const r of rows) appendLine(r, "dim");
  }

  function printLs() {
    if (cwd.length === 0) return typewriter(treeAtRoot(FILE_SYSTEM), { variant: "dim" });
    const items = listDir(FILE_SYSTEM, cwd);
    if (!items) return appendLine("ls: directory not found", "dim");
    if (items.length === 0) return appendLine("(empty)", "dim");
    typewriter(items.join("\n"), { variant: "dim" });
  }

  function runCat(name) {
    const dir = resolveDir(FILE_SYSTEM, cwd);
    if (!dir) return appendLine("cat: current directory does not exist", "dim");
    const value = dir[name];
    if (!value || typeof value === "object") return appendLine(`cat: file not found ${name}`, "dim");
    appendLine("", "dim");
    appendLine(value, "dim");
    appendLine("", "dim");
  }

  function runCd(arg) {
    const dest = arg.trim();
    if (!dest) {
      cwd = [];
      setPrompt();
      typewriter(treeAtPath(FILE_SYSTEM, cwd), { variant: "dim" });
      return;
    }
    if (dest === "..") {
      cwd = cwd.slice(0, -1);
      setPrompt();
      typewriter(treeAtPath(FILE_SYSTEM, cwd), { variant: "dim" });
      return;
    }
    const parts = dest.split("/").filter(Boolean);
    const next = [...cwd];
    for (const p of parts) {
      if (p === ".") continue;
      if (p === "..") next.pop();
      else next.push(p);
    }
    const node = resolveDir(FILE_SYSTEM, next);
    if (!node) return appendLine("cd: directory does not exist", "dim");
    cwd = next;
    setPrompt();
    typewriter(treeAtPath(FILE_SYSTEM, cwd), { variant: "dim" });
  }

  function runSay(text) {
    const t = text.trim();
    if (!t) return appendLine("say: please enter a message", "dim");
    window.__comments?.add(t);
    appendLine("OK: added to comments", "dim");
  }

  function handleCommand(raw) {
    const { cmd, args } = tokenize(raw);
    if (!cmd) return;
    appendLine(`${prompt.textContent} ${raw}`, "green");
    history.push(raw);
    historyIndex = history.length;

    if (cmd === "help") return printHelp();
    if (cmd === "clear") {
      output.textContent = "";
      return;
    }
    if (cmd === "ls") return printLs();
    if (cmd === "cd") return runCd(args);
    if (cmd === "..") return runCd("..");
    if (cmd === "cat") return runCat(args);
    if (cmd === "say") return runSay(args);
    appendLine(`Unknown command: ${cmd} (type \`help\`)`, "dim");
  }

  function focusInput() {
    input.focus();
  }

  function onKeyDown(e) {
    if (isPrinting) return;
    if (e.key === "Enter") {
      const raw = input.value;
      input.value = "";
      handleCommand(raw);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      historyIndex = Math.max(0, historyIndex - 1);
      input.value = history[historyIndex] ?? "";
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (history.length === 0) return;
      historyIndex = Math.min(history.length, historyIndex + 1);
      input.value = historyIndex >= history.length ? "" : history[historyIndex];
      return;
    }
  }

  setPrompt();
  input.addEventListener("keydown", onKeyDown);
  window.addEventListener("click", (e) => {
    const t = e.target;
    if (t instanceof HTMLElement && t.closest(".terminal")) focusInput();
  });

  return {
    focus: focusInput,
    boot() {
      appendLine("Type `help` to see available commands.", "dim");
      appendLine("", "dim");
      handleCommand("ls");
    },
  };
}

window.addEventListener("DOMContentLoaded", () => {
  window.__comments = setupComments();
  const term = createTerminal();
  term.boot();
  term.focus();
});
