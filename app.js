const CHEAT_SHEET = [
  { cmd: "ls", args: "None", desc: "List directories or files in the current level." },
  { cmd: "cd", args: "[path/category]", desc: "Enter the specified article category." },
  { cmd: "..", args: "None", desc: "Go back to the parent directory." },
  { cmd: "cat", args: "[filename]", desc: "Open and read the specified article." },
  { cmd: "say", args: "[text]", desc: "Leave a comment or message." },
  { cmd: "theme", args: "[dark|light]", desc: "Switch theme and save preference." },
  { cmd: "help", args: "None", desc: "Show all available commands and their descriptions." },
  { cmd: "clear", args: "None", desc: "Clear the terminal screen." },
];

const FILE_SYSTEM = {
  aboutme: {
    "index.html": "./aboutme/index.html",
  },
  post: {
    "index.html": "./post/index.html",
  },
};

const DEFAULT_PAGE = "./post/index.html";
const THEME_STORAGE_KEY = "theme";

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function createContentRenderer() {
  const titleEl = document.getElementById("contentTitle");
  const viewportEl = document.getElementById("contentViewport");
  const scrollEl = viewportEl?.parentElement;

  async function renderPath(path) {
    if (!viewportEl || !titleEl) return false;
    viewportEl.classList.add("switching");
    await sleep(180);
    try {
      const res = await window.fetch(path);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, "text/html");
      const h1 = doc.body.querySelector("h1");
      if (h1) {
        const nextTitle = h1.textContent?.trim();
        if (nextTitle) titleEl.textContent = nextTitle;
        h1.remove();
      }
      viewportEl.innerHTML = doc.body.innerHTML;
      if (scrollEl) scrollEl.scrollTop = 0;
      window.requestAnimationFrame(() => {
        viewportEl.classList.remove("switching");
      });
      return true;
    } catch (e) {
      viewportEl.innerHTML =
        '<div class="contentHint">Failed to load content. If you are opening this page via <strong>file://</strong>, please run a local static server, or deploy to GitHub Pages.</div>';
      window.requestAnimationFrame(() => {
        viewportEl.classList.remove("switching");
      });
      return false;
    }
  }

  return { renderPath };
}

function getTheme() {
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function setTheme(nextTheme, options = {}) {
  const { persist = true } = options;
  const theme = nextTheme === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = theme;

  const link = document.getElementById("themeStylesheet");
  if (link) link.href = theme === "light" ? "./styles.light.css" : "./styles.css";

  if (persist) window.localStorage.setItem(THEME_STORAGE_KEY, theme);
}

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

function stripFileExtension(filename) {
  const lastDot = filename.lastIndexOf(".");
  if (lastDot <= 0) return filename;
  return filename.slice(0, lastDot);
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
    else files.push(stripFileExtension(k));
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
    const displayName = isDir ? name : stripFileExtension(name);
    lines.push(`${last ? "└──" : "├──"} ${displayName}${isDir ? "/" : ""}`);
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

function createTerminal(options = {}) {
  const output = document.getElementById("terminalOutput");
  const input = document.getElementById("terminalInput");
  const prompt = document.getElementById("promptText");
  const renderPath = options.renderPath;
  const applyTheme = options.applyTheme;
  const readTheme = options.readTheme;

  let user = "guest";
  let cwd = [];
  let isPrinting = false;
  let isLocked = false;
  let printingCount = 0;
  const history = [];
  let historyIndex = -1;

  function scrollToBottom() {
    output.scrollTop = output.scrollHeight;
  }

  function setPrompt() {
    prompt.textContent = `${user}@blog:${joinPath(cwd)}$`;
  }

  function setInputEnabled(enabled) {
    input.disabled = !enabled;
    if (enabled) focusInput();
  }

  function beginPrinting() {
    printingCount += 1;
    isPrinting = true;
  }

  function endPrinting() {
    printingCount = Math.max(0, printingCount - 1);
    if (printingCount === 0) isPrinting = false;
  }

  function appendLineInstant(text, variant) {
    const div = document.createElement("div");
    div.className = `terminalLine${variant ? ` ${variant}` : ""}`;
    div.textContent = text;
    output.appendChild(div);
    scrollToBottom();
  }

  function createBlinkCursor() {
    const existing = document.querySelector(".terminalInputRow .cursor");
    if (existing instanceof HTMLElement) return existing.cloneNode(true);
    const span = document.createElement("span");
    span.className = "cursor";
    span.setAttribute("aria-hidden", "true");
    return span;
  }

  function appendTypingLine(variant) {
    const div = document.createElement("div");
    div.className = `terminalLine${variant ? ` ${variant}` : ""}`;
    const textNode = document.createTextNode("");
    const cursor = createBlinkCursor();
    div.appendChild(textNode);
    div.appendChild(cursor);
    output.appendChild(div);
    scrollToBottom();
    return { div, textNode, cursor };
  }

  async function typeIntoTextNode(textNode, text, options = {}) {
    const { speedMs = 18 } = options;
    const s = String(text ?? "");
    for (let i = 0; i <= s.length; i += 1) {
      textNode.data = s.slice(0, i);
      scrollToBottom();
      await sleep(speedMs);
    }
  }

  function appendLinePartsInstant(parts, variant) {
    const div = document.createElement("div");
    div.className = `terminalLine${variant ? ` ${variant}` : ""}`;
    for (const p of parts) {
      if (p == null) continue;
      if (typeof p === "string") div.appendChild(document.createTextNode(p));
      else div.appendChild(p);
    }
    output.appendChild(div);
    scrollToBottom();
  }

  function createJumpLink(label, cmd) {
    const span = document.createElement("span");
    span.className = "terminalJump";
    span.textContent = label;
    span.dataset.cmd = cmd;
    span.title = "jumpto";
    return span;
  }

  function toAbsolutePath(parts) {
    if (parts.length === 0) return "/";
    return `/${parts.join("/")}`;
  }

  function typewriter(text, options = {}) {
    const { variant, speedMs = 12, lineDelayMs = 40 } = options;
    const lines = String(text ?? "").split("\n");
    beginPrinting();
    return new Promise((resolve) => {
      let i = 0;
      const step = () => {
        if (i >= lines.length) {
          endPrinting();
          scrollToBottom();
          resolve();
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
    });
  }

  async function printHelp() {
    const rows = CHEAT_SHEET.map((r) => `  ${r.cmd.padEnd(6, " ")} ${r.args.padEnd(14, " ")} ${r.desc}`);
    await typewriter(["Available commands:", ...rows].join("\n"), { variant: "dim", speedMs: 8, lineDelayMs: 28 });
  }

  async function printTreeForPath(pathParts) {
    const node = pathParts.length === 0 ? FILE_SYSTEM : resolveDir(FILE_SYSTEM, pathParts);
    if (!node) return await typewriter("ls: directory not found", { variant: "dim", speedMs: 8, lineDelayMs: 28 });

    const entries =
      pathParts.length === 0
        ? Object.keys(FILE_SYSTEM)
            .sort()
            .map((name) => [name, FILE_SYSTEM[name]])
        : Object.entries(node).sort(([a], [b]) => a.localeCompare(b));

    beginPrinting();
    appendLineInstant(".", "dim");
    for (let idx = 0; idx < entries.length; idx += 1) {
      const [name, value] = entries[idx];
      await sleep(26);
      const last = idx === entries.length - 1;
      const isDir = value && typeof value === "object";
      const prefix = `${last ? "└──" : "├──"} `;

      if (isDir) {
        const absDir = toAbsolutePath([...pathParts, name]);
        appendLinePartsInstant([prefix, createJumpLink(`${name}/`, `cd ${absDir}`)], "dim");
        continue;
      }

      const display = stripFileExtension(name);
      const absFile = toAbsolutePath([...pathParts, display]);
      appendLinePartsInstant([prefix, createJumpLink(display, `cat ${absFile}`)], "dim");
    }
    endPrinting();
  }

  async function printLs() {
    if (cwd.length === 0) return await printTreeForPath([]);
    const items = listDir(FILE_SYSTEM, cwd);
    if (!items) return await typewriter("ls: directory not found", { variant: "dim", speedMs: 8, lineDelayMs: 28 });
    if (items.length === 0) return await typewriter("(empty)", { variant: "dim", speedMs: 8, lineDelayMs: 28 });
    beginPrinting();
    for (const item of items) {
      await sleep(26);
      if (item.endsWith("/")) {
        const dirName = item.slice(0, -1);
        const absDir = toAbsolutePath([...cwd, dirName]);
        appendLinePartsInstant([createJumpLink(item, `cd ${absDir}`)], "dim");
        continue;
      }
      const absFile = toAbsolutePath([...cwd, item]);
      appendLinePartsInstant([createJumpLink(item, `cat ${absFile}`)], "dim");
    }
    endPrinting();
  }

  function resolveFileForCat(rawPath) {
    const inputPath = rawPath.trim();
    if (!inputPath) return { ok: false, error: "cat: missing file name" };

    const isAbsolute = inputPath.startsWith("/") || inputPath.startsWith("~/");
    const cleaned = inputPath.replace(/^~\//, "").replace(/^\//, "");
    const parts = cleaned.split("/").filter(Boolean);
    if (parts.length === 0) return { ok: false, error: "cat: missing file name" };

    const dirParts = isAbsolute ? [] : [...cwd];
    for (let i = 0; i < parts.length - 1; i += 1) {
      const p = parts[i];
      if (p === "." || p === "") continue;
      if (p === "..") dirParts.pop();
      else dirParts.push(p);
    }
    const filename = parts[parts.length - 1];
    if (filename === "." || filename === "..") return { ok: false, error: `cat: invalid file name ${filename}` };

    const dir = resolveDir(FILE_SYSTEM, dirParts);
    if (!dir) return { ok: false, error: "cat: directory does not exist" };
    const exactValue = dir[filename];
    if (exactValue && typeof exactValue !== "object") {
      return { ok: true, url: exactValue, display: stripFileExtension(filename) };
    }

    if (!filename.includes(".")) {
      const matches = Object.keys(dir).filter((k) => stripFileExtension(k) === filename && typeof dir[k] === "string");
      if (matches.length === 1) {
        const realKey = matches[0];
        return { ok: true, url: dir[realKey], display: stripFileExtension(realKey) };
      }
      if (matches.length > 1) return { ok: false, error: `cat: ambiguous file name ${filename}` };
    }

    return { ok: false, error: `cat: file not found ${inputPath}` };
  }

  async function runCat(name) {
    const resolved = resolveFileForCat(name);
    if (!resolved.ok) return await typewriter(resolved.error, { variant: "dim", speedMs: 8, lineDelayMs: 28 });
    if (!renderPath) return await typewriter("cat: renderer not available", { variant: "dim", speedMs: 8, lineDelayMs: 28 });
    beginPrinting();
    const ok = await renderPath(resolved.url);
    endPrinting();
    if (!ok) return await typewriter(`cat: failed to open ${resolved.display}`, { variant: "dim", speedMs: 8, lineDelayMs: 28 });
    await typewriter(`opened ${resolved.display}`, { variant: "dim", speedMs: 8, lineDelayMs: 28 });
  }

  function maybeRenderIndex() {
    if (!renderPath) return;
    if (cwd.length === 0) {
      void renderPath(DEFAULT_PAGE);
      return;
    }
    const node = resolveDir(FILE_SYSTEM, cwd);
    const indexPath = node?.["index.html"];
    if (typeof indexPath === "string") void renderPath(indexPath);
  }

  async function runCd(arg) {
    const dest = arg.trim();
    if (!dest) {
      cwd = [];
      setPrompt();
      await printTreeForPath(cwd);
      maybeRenderIndex();
      return;
    }
    if (dest === "..") {
      cwd = cwd.slice(0, -1);
      setPrompt();
      await printTreeForPath(cwd);
      maybeRenderIndex();
      return;
    }
    if (dest === "/" || dest === "~") {
      cwd = [];
      setPrompt();
      await printTreeForPath(cwd);
      maybeRenderIndex();
      return;
    }
    const isAbsolute = dest.startsWith("/") || dest.startsWith("~/");
    const cleaned = dest.replace(/^~\//, "").replace(/^\//, "");
    const parts = cleaned.split("/").filter(Boolean);
    const next = isAbsolute ? [] : [...cwd];
    for (const p of parts) {
      if (p === ".") continue;
      if (p === "..") next.pop();
      else next.push(p);
    }
    const node = resolveDir(FILE_SYSTEM, next);
    if (!node) return await typewriter("cd: directory does not exist", { variant: "dim", speedMs: 8, lineDelayMs: 28 });
    cwd = next;
    setPrompt();
    await printTreeForPath(cwd);
    maybeRenderIndex();
  }

  async function runSay(text) {
    const t = text.trim();
    if (!t) return await typewriter("say: please enter a message", { variant: "dim", speedMs: 8, lineDelayMs: 28 });
    window.__comments?.add(t);
    await typewriter("OK: added to comments", { variant: "dim", speedMs: 8, lineDelayMs: 28 });
  }

  async function runTheme(arg) {
    if (!applyTheme || !readTheme) return await typewriter("theme: theme switch not available", { variant: "dim", speedMs: 8, lineDelayMs: 28 });
    const next = arg.trim();
    if (!next) {
      await typewriter(`theme: ${readTheme()}\nusage: theme dark|light`, { variant: "dim", speedMs: 8, lineDelayMs: 28 });
      return;
    }
    if (next !== "dark" && next !== "light") {
      await typewriter("theme: invalid value (dark|light)", { variant: "dim", speedMs: 8, lineDelayMs: 28 });
      return;
    }
    applyTheme(next);
    await typewriter(`theme: switched to ${next}`, { variant: "dim", speedMs: 8, lineDelayMs: 28 });
  }

  async function runSudoEasterEgg() {
    isLocked = true;
    setInputEnabled(false);

    const prevUser = user;
    user = "root";
    setPrompt();

    appendLineInstant(`${prompt.textContent} easteregg`, "green");
    const typing = appendTypingLine("dim");
    await sleep(2000);

    beginPrinting();
    await typeIntoTextNode(typing.textNode, "Hey your naughty boy!", { speedMs: 24 });
    endPrinting();
    typing.cursor.style.display = "none";

    user = prevUser;
    setPrompt();
    isLocked = false;
    setInputEnabled(true);
  }

  async function handleCommand(raw, options = {}) {
    const { typeEcho = false } = options;
    const { cmd, args } = tokenize(raw);
    if (!cmd) return;

    if (typeEcho) await typewriter(`${prompt.textContent} ${raw}`, { variant: "green", speedMs: 7, lineDelayMs: 0 });
    else appendLineInstant(`${prompt.textContent} ${raw}`, "green");
    history.push(raw);
    historyIndex = history.length;

    if (cmd === "sudo") return await runSudoEasterEgg();
    if (cmd === "help") return await printHelp();
    if (cmd === "clear") {
      output.textContent = "";
      return;
    }
    if (cmd === "ls") return await printLs();
    if (cmd === "cd") return await runCd(args);
    if (cmd === "..") return await runCd("..");
    if (cmd === "cat") return await runCat(args);
    if (cmd === "say") return await runSay(args);
    if (cmd === "theme") return await runTheme(args);
    await typewriter(`Unknown command: ${cmd} (type \`help\`)`, { variant: "dim", speedMs: 8, lineDelayMs: 28 });
  }

  function focusInput() {
    input.focus();
  }

  function onKeyDown(e) {
    if (isPrinting || isLocked) return;
    if (e.key === "Enter") {
      const raw = input.value;
      input.value = "";
      void handleCommand(raw);
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
  output.addEventListener("click", (e) => {
    if (isPrinting) return;
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    const link = t.closest(".terminalJump");
    if (!(link instanceof HTMLElement)) return;
    const cmd = link.dataset.cmd;
    if (!cmd) return;
    void handleCommand(cmd);
  });
  window.addEventListener("click", (e) => {
    const t = e.target;
    if (t instanceof HTMLElement && t.closest(".terminal")) focusInput();
  });

  return {
    focus: focusInput,
    async boot() {
      await typewriter("Type `help` to see available commands.\n", { variant: "dim", speedMs: 8, lineDelayMs: 28 });
      await handleCommand("ls", { typeEcho: true });
    },
  };
}

window.addEventListener("DOMContentLoaded", () => {
  window.__comments = setupComments();
  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme, { persist: false });
  else setTheme("dark", { persist: false });

  const renderer = createContentRenderer();
  void renderer.renderPath(DEFAULT_PAGE);

  const term = createTerminal({
    renderPath: renderer.renderPath,
    applyTheme: (t) => setTheme(t, { persist: true }),
    readTheme: getTheme,
  });
  term.boot();
  term.focus();
});
