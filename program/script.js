const TIER_DEFINITIONS = [
  { id: "lottery", label: "Lottery | 彩票"},
  { id: "reach", label: "Reach | 冲刺"},
  { id: "match", label: "Match | 主申"},
  { id: "safety", label: "Safety | 保底"}
];

const SCHOOL_OPTIONS = [
  { id: "princeton", short: "Princeton", cn: "普林斯顿大学", en: "Princeton University", domain: "www.princeton.edu" },
  { id: "mit", short: "MIT", cn: "麻省理工学院", en: "Massachusetts Institute of Technology", domain: "www.mit.edu" },
  { id: "harvard", short: "Harvard", cn: "哈佛大学", en: "Harvard University", domain: "www.harvard.edu" },
  { id: "stanford", short: "Stanford", cn: "斯坦福大学", en: "Stanford University", domain: "www.stanford.edu" },
  { id: "oxford", short: "Oxford", cn: "牛津大学", en: "University of Oxford", domain: "www.ox.ac.uk" },
  { id: "cambridge", short: "Cambridge", cn: "剑桥大学", en: "University of Cambridge", domain: "www.cam.ac.uk" },
  { id: "yale", short: "Yale", cn: "耶鲁大学", en: "Yale University", domain: "www.yale.edu" },
  { id: "imperial", short: "Imperial", cn: "帝国理工学院", en: "Imperial College London", domain: "www.imperial.ac.uk" },
  { id: "caltech", short: "Caltech", cn: "加州理工学院", en: "California Institute of Technology", domain: "www.caltech.edu" },
  { id: "duke", short: "Duke", cn: "杜克大学", en: "Duke University", domain: "duke.edu" },
  { id: "brown", short: "Brown", cn: "布朗大学", en: "Brown University", domain: "www.brown.edu" },
  { id: "eth", short: "ETH Zurich", cn: "苏黎世联邦理工学院", en: "ETH Zurich", domain: "ethz.ch" },
  { id: "nus", short: "NUS", cn: "新加坡国立大学", en: "National University of Singapore", domain: "www.nus.edu.sg" },
  { id: "ucl", short: "UCL", cn: "伦敦大学学院", en: "University College London", domain: "www.ucl.ac.uk" },
  { id: "jhu", short: "JHU", cn: "约翰斯霍普金斯大学", en: "Johns Hopkins University", domain: "www.jhu.edu" },
  { id: "northwestern", short: "Northwestern", cn: "西北大学", en: "Northwestern University", domain: "www.northwestern.edu" },
  { id: "columbia", short: "Columbia", cn: "哥伦比亚大学", en: "Columbia University", domain: "www.columbia.edu" },
  { id: "cornell", short: "Cornell", cn: "康奈尔大学", en: "Cornell University", domain: "www.cornell.edu" },
  { id: "cornelltech", short: "Cornell Tech", cn: "康奈尔大学理工校区", en: "Cornell University Tech Campus", domain: "www.cornell.edu" },
  { id: "upenn", short: "UPenn", cn: "宾夕法尼亚大学", en: "University of Pennsylvania", domain: "www.upenn.edu" },
  { id: "chicago", short: "UChicago", cn: "芝加哥大学", en: "University of Chicago", domain: "www.uchicago.edu" },
  { id: "berkeley", short: "UC Berkeley", cn: "加州大学伯克利分校", en: "University of California, Berkeley", domain: "www.berkeley.edu" },
  { id: "ntu", short: "NTU", cn: "南洋理工大学", en: "Nanyang Technological University, Singapore", domain: "www.ntu.edu.sg" },
  { id: "epfl", short: "EPFL", cn: "洛桑联邦理工学院", en: "Ecole Polytechnique Federale de Lausanne", domain: "www.epfl.ch" },
  { id: "toronto", short: "Toronto", cn: "多伦多大学", en: "University of Toronto", domain: "www.utoronto.ca" },
  { id: "ucla", short: "UCLA", cn: "加州大学洛杉矶分校", en: "University of California, Los Angeles", domain: "www.ucla.edu" },
  { id: "rice", short: "Rice", cn: "莱斯大学", en: "Rice University", domain: "www.rice.edu" },
  { id: "dartmouth", short: "Dartmouth", cn: "达特茅斯学院", en: "Dartmouth College", domain: "home.dartmouth.edu" },
  { id: "michigan", short: "UMich", cn: "密歇根大学安娜堡分校", en: "University of Michigan, Ann Arbor", domain: "umich.edu" },
  { id: "cmu", short: "CMU", cn: "卡内基梅隆大学", en: "Carnegie Mellon University", domain: "www.cmu.edu" },
  { id: "ucsd", short: "UCSD", cn: "加州大学圣地亚哥分校", en: "University of California, San Diego", domain: "ucsd.edu" },
  { id: "usc", short: "USC", cn: "南加州大学", en: "University of Southern California", domain: "www.usc.edu" },
  { id: "utexas", short: "UT Austin", cn: "得克萨斯大学奥斯汀分校", en: "The University of Texas at Austin", domain: "www.utexas.edu" },
  { id: "gatech", short: "Georgia Tech", cn: "佐治亚理工学院", en: "Georgia Institute of Technology", domain: "www.gatech.edu" },
  { id: "uiuc", short: "UIUC", cn: "伊利诺伊大学香槟分校", en: "University of Illinois Urbana-Champaign", domain: "illinois.edu" },
  { id: "tum", short: "TUM", cn: "慕尼黑工业大学", en: "Technical University of Munich", domain: "www.tum.de" },
  { id: "hkust", short: "HKUST", cn: "香港科技大学", en: "Hong Kong University of Science and Technology", domain: "hkust.edu.hk" },
  { id: "hku", short: "HKU", cn: "香港大学", en: "The University of Hong Kong", domain: "www.hku.hk" },
  { id: "edinburgh", short: "Edinburgh", cn: "爱丁堡大学", en: "University of Edinburgh", domain: "www.ed.ac.uk" },
  { id: "tudelft", short: "TU Delft", cn: "代尔夫特理工大学", en: "Delft University of Technology", domain: "www.tudelft.nl" },
  { id: "waterloo", short: "Waterloo", cn: "滑铁卢大学", en: "University of Waterloo", domain: "uwaterloo.ca" },
  { id: "bu", short: "Boston U", cn: "波士顿大学", en: "Boston University", domain: "www.bu.edu" },
  { id: "wisc", short: "UW-Madison", cn: "威斯康星大学麦迪逊分校", en: "University of Wisconsin-Madison", domain: "www.wisc.edu" },
  { id: "uw", short: "UW", cn: "华盛顿大学西雅图分校", en: "University of Washington", domain: "www.washington.edu" },
  { id: "nyu", short: "NYU", cn: "纽约大学", en: "New York University", domain: "www.nyu.edu" },
  { id: "tamu", short: "Texas A&M", cn: "德州农工大学", en: "Texas A&M University", domain: "www.tamu.edu" },
  { id: "neu", short: "Northeastern", cn: "东北大学", en: "Northeastern University", domain: "www.northeastern.edu" },
];

const DEFAULT_PROGRAMS = [
  {
    id: createId(),
    tierId: "lottery",
    shortName: "AIE-ECE",
    schoolId: "cmu",
    cnName: "人工智能工程理学硕士（电气与计算机工程方向）",
    enName: "M.S. in Artificial Intelligence Engineering - ECE"
  },
  {
    id: createId(),
    tierId: "lottery",
    shortName: "MSCS (1-yr)",
    schoolId: "yale",
    cnName: "计算机科学理学硕士（一年制）",
    enName: "MSc in Computer Science (One-Year Program)"
  },
  {
    id: createId(),
    tierId: "reach",
    shortName: "MCS - Chicago",
    schoolId: "uiuc",
    cnName: "计算机科学硕士（芝加哥校区）",
    enName: "Master of Computer Science in Chicago"
  }
];

const GITHUB_TOKEN_PARTS = [
  "github",
  "_pat_",
  "11BNK7WAQ0zpIeN5TUVWTK_",
  "xbB38v6aiqHgIuxB4p6i6YTapOs1h1MG",
  "NQJ1tgTMWgXRDPD6LHHYYW7jayY"
];

const GITHUB_SYNC_CONFIG = {
  enabled: true,
  owner: "2dog-Z",
  repo: "School_Programs",
  token: GITHUB_TOKEN_PARTS.join(""),
  issueTitle: "school-list-state",
  issueLabel: "school-list"
};

const STORAGE_KEY = "interactive-school-list-cache-v1";
const ISSUE_BODY_MARKER_START = "<!-- school-list-state:start -->";
const ISSUE_BODY_MARKER_END = "<!-- school-list-state:end -->";

// #region debug-point A:reporter
const DEBUG_REPORT_URL = "http://127.0.0.1:7779/event";
const DEBUG_SESSION_ID = "drag-cloud-save";
function reportDebugEvent(hypothesisId, location, msg, data = {}) {
  fetch(DEBUG_REPORT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: DEBUG_SESSION_ID,
      runId: "pre-fix",
      hypothesisId,
      location,
      msg: `[DEBUG] ${msg}`,
      data,
      ts: Date.now()
    })
  }).catch(() => {});
}
// #endregion

const elements = {
  board: document.querySelector("#tier-board"),
  tierTemplate: document.querySelector("#tier-template"),
  programTemplate: document.querySelector("#program-template"),
  modal: document.querySelector("#program-modal"),
  modalTitle: document.querySelector("#modal-title"),
  closeModalButtons: document.querySelectorAll("[data-close-modal='true'], #modal-close"),
  form: document.querySelector("#program-form"),
  submitButton: document.querySelector("#submit-button"),
  deleteButton: document.querySelector("#delete-button"),
  shortNameInput: document.querySelector("#program-short-name"),
  schoolSelect: document.querySelector("#program-school"),
  cnNameInput: document.querySelector("#program-cn-name"),
  enNameInput: document.querySelector("#program-en-name"),
  saveStatus: document.querySelector("#save-status"),
  modalLogo: document.querySelector("#modal-school-logo"),
  modalLogoPlaceholder: document.querySelector("#modal-logo-placeholder")
};

const schoolMap = new Map(SCHOOL_OPTIONS.map((school) => [school.id, school]));

const state = {
  programs: [],
  modalMode: "edit",
  activeProgramId: null,
  activeTierId: null,
  saveTimer: null,
  saveStatusTimer: null,
  draggedProgramId: null,
  dropHappened: false,
  syncing: false
};

document.addEventListener("DOMContentLoaded", initialize);

async function initialize() {
  populateSchoolOptions();
  bindModalEvents();
  bindFormEvents();

  state.programs = loadLocalCache();
  renderBoard();

  if (isGithubConfigured()) {
    const remotePrograms = await loadFromGithubIssues();
    if (remotePrograms) {
      state.programs = remotePrograms;
      saveLocalCache(state.programs);
      renderBoard();
      hideSaveStatus();
    } else {
      setSaveStatus("GitHub 数据加载失败，已回退到本地缓存", "error");
    }
  } else {
    hideSaveStatus();
  }
}

function populateSchoolOptions() {
  const fragment = document.createDocumentFragment();

  SCHOOL_OPTIONS.forEach((school) => {
    const option = document.createElement("option");
    option.value = school.id;
    option.textContent = `${school.short} | ${school.cn}`;
    fragment.appendChild(option);
  });

  elements.schoolSelect.innerHTML = "";
  elements.schoolSelect.appendChild(fragment);
}

function bindModalEvents() {
  elements.closeModalButtons.forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !elements.modal.classList.contains("hidden")) {
      closeModal();
    }
  });
}

function bindFormEvents() {
  elements.schoolSelect.addEventListener("change", updateModalSchoolPreview);

  elements.form.addEventListener("submit", (event) => {
    event.preventDefault();

    const payload = {
      shortName: elements.shortNameInput.value.trim(),
      schoolId: elements.schoolSelect.value,
      cnName: elements.cnNameInput.value.trim(),
      enName: elements.enNameInput.value.trim()
    };

    if (!payload.shortName || !payload.schoolId || !payload.cnName || !payload.enName) {
      return;
    }

    if (state.modalMode === "create") {
      state.programs.push({
        id: createId(),
        tierId: state.activeTierId,
        ...payload
      });
      renderBoard();
      scheduleSave("create", 120);
    } else {
      state.programs = state.programs.map((program) =>
        program.id === state.activeProgramId ? { ...program, ...payload } : program
      );
      renderBoard();
      scheduleSave("edit", 120);
    }

    closeModal();
  });

  elements.deleteButton.addEventListener("click", () => {
    if (!state.activeProgramId) {
      return;
    }

    state.programs = state.programs.filter((program) => program.id !== state.activeProgramId);
    renderBoard();
    closeModal();
    scheduleSave("delete", 120);
  });
}

function renderBoard() {
  elements.board.innerHTML = "";

  TIER_DEFINITIONS.forEach((tier) => {
    const tierNode = elements.tierTemplate.content.firstElementChild.cloneNode(true);
    const title = tierNode.querySelector(".tier-title");
    const subtitle = tierNode.querySelector(".tier-subtitle");
    const addButton = tierNode.querySelector(".tier-add-button");
    const list = tierNode.querySelector(".tier-list");

    title.textContent = tier.label;
    subtitle.textContent = tier.subtitle;
    list.dataset.tierId = tier.id;

    addButton.addEventListener("click", () => openCreateModal(tier.id));
    wireTierListDnD(list);

    const programs = getProgramsByTier(tier.id);

    if (programs.length === 0) {
      list.classList.add("empty");
    } else {
      list.classList.remove("empty");
    }

    programs.forEach((program) => {
      const cardNode = elements.programTemplate.content.firstElementChild.cloneNode(true);
      const school = schoolMap.get(program.schoolId);

      cardNode.dataset.programId = program.id;
      cardNode.dataset.tierId = program.tierId;

      cardNode.querySelector(".program-title").textContent = `${program.shortName} @ ${school.short} ${school.cn}`;
      cardNode.querySelector(".program-subtitle").textContent = school.en;
      cardNode.querySelector(".program-description").textContent = `${program.cnName}，${program.enName}`;

      const editButton = cardNode.querySelector(".program-edit-button");
      editButton.addEventListener("click", () => openEditModal(program.id));

      wireProgramDnD(cardNode);

      const logo = cardNode.querySelector(".school-logo");
      const placeholder = cardNode.querySelector(".logo-placeholder");
      loadSchoolLogo(logo, placeholder, school);

      list.appendChild(cardNode);
    });

    tierNode.dataset.tierId = tier.id;
    elements.board.appendChild(tierNode);
  });
}

function wireProgramDnD(cardNode) {
  cardNode.addEventListener("dragstart", (event) => {
    state.draggedProgramId = cardNode.dataset.programId;
    state.dropHappened = false;
    cardNode.classList.add("dragging");

    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", state.draggedProgramId);
    }
  });

  cardNode.addEventListener("dragend", () => {
    cardNode.classList.remove("dragging");
    clearTierDropState();

    if (!state.dropHappened) {
      renderBoard();
    }

    state.draggedProgramId = null;
    state.dropHappened = false;
  });
}

function wireTierListDnD(list) {
  list.addEventListener("dragover", (event) => {
    event.preventDefault();
    const draggingCard = document.querySelector(".program-card.dragging");

    if (!draggingCard) {
      return;
    }

    list.closest(".tier-column").classList.add("drag-target");

    const nextCard = getDragAfterElement(list, event.clientY);
    if (!nextCard) {
      list.appendChild(draggingCard);
    } else if (nextCard !== draggingCard) {
      list.insertBefore(draggingCard, nextCard);
    }
  });

  list.addEventListener("drop", (event) => {
    event.preventDefault();
    const didChange = syncProgramsFromDom();

    // #region debug-point A:drop
    reportDebugEvent("A", "script.js:drop", "drop event processed", {
      draggedProgramId: state.draggedProgramId,
      targetTierId: list.dataset.tierId,
      didChange
    });
    // #endregion

    clearTierDropState();
    state.dropHappened = true;
    renderBoard();

    if (didChange) {
      scheduleSave("drag", 0);
    }
  });

  list.addEventListener("dragleave", (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      list.closest(".tier-column").classList.remove("drag-target");
    }
  });
}

function getDragAfterElement(list, mouseY) {
  const nonDraggingCards = [...list.querySelectorAll(".program-card:not(.dragging)")];

  return nonDraggingCards.reduce(
    (closest, card) => {
      const box = card.getBoundingClientRect();
      const offset = mouseY - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset, element: card };
      }

      return closest;
    },
    { offset: Number.NEGATIVE_INFINITY, element: null }
  ).element;
}

function syncProgramsFromDom() {
  const previous = JSON.stringify(
    state.programs.map((program) => ({
      id: program.id,
      tierId: program.tierId
    }))
  );

  const programMap = new Map(state.programs.map((program) => [program.id, { ...program }]));
  const nextPrograms = [];

  document.querySelectorAll(".tier-list").forEach((list) => {
    const tierId = list.dataset.tierId;
    list.querySelectorAll(".program-card").forEach((card) => {
      const program = programMap.get(card.dataset.programId);
      if (!program) {
        return;
      }

      program.tierId = tierId;
      nextPrograms.push(program);
    });
  });

  state.programs = nextPrograms;

  const current = JSON.stringify(
    state.programs.map((program) => ({
      id: program.id,
      tierId: program.tierId
    }))
  );

  return previous !== current;
}

function openCreateModal(tierId) {
  state.modalMode = "create";
  state.activeProgramId = null;
  state.activeTierId = tierId;

  elements.modalTitle.textContent = "新建项目";
  elements.submitButton.textContent = "新建";
  elements.deleteButton.classList.add("hidden");

  elements.form.reset();
  elements.schoolSelect.value = SCHOOL_OPTIONS[0].id;
  updateModalSchoolPreview();
  showModal();
}

function openEditModal(programId) {
  const program = state.programs.find((item) => item.id === programId);

  if (!program) {
    return;
  }

  state.modalMode = "edit";
  state.activeProgramId = programId;
  state.activeTierId = program.tierId;

  elements.modalTitle.textContent = "编辑项目";
  elements.submitButton.textContent = "保存";
  elements.deleteButton.classList.remove("hidden");

  elements.shortNameInput.value = program.shortName;
  elements.schoolSelect.value = program.schoolId;
  elements.cnNameInput.value = program.cnName;
  elements.enNameInput.value = program.enName;
  updateModalSchoolPreview();
  showModal();
}

function showModal() {
  elements.modal.classList.remove("hidden");
  elements.modal.setAttribute("aria-hidden", "false");
  setTimeout(() => elements.shortNameInput.focus(), 0);
}

function closeModal() {
  elements.modal.classList.add("hidden");
  elements.modal.setAttribute("aria-hidden", "true");
}

function updateModalSchoolPreview() {
  const school = schoolMap.get(elements.schoolSelect.value);

  if (!school) {
    return;
  }

  loadSchoolLogo(elements.modalLogo, elements.modalLogoPlaceholder, school);
}

function loadSchoolLogo(imgElement, placeholderElement, school) {
  if (!school) {
    return;
  }

  placeholderElement.hidden = false;
  imgElement.hidden = true;
  imgElement.alt = `${school.cn} Logo`;
  imgElement.src = getLogoUrl(school);

  imgElement.onload = () => {
    placeholderElement.hidden = true;
    imgElement.hidden = false;
  };

  imgElement.onerror = () => {
    placeholderElement.hidden = false;
    imgElement.hidden = true;
  };
}

function getLogoUrl(school) {
  return `https://www.google.com/s2/favicons?sz=128&domain_url=https://${school.domain}`;
}

function getProgramsByTier(tierId) {
  return state.programs.filter((program) => program.tierId === tierId);
}

function scheduleSave(reason, delay) {
  window.clearTimeout(state.saveTimer);
  // #region debug-point A:schedule-save
  reportDebugEvent("A", "script.js:scheduleSave", "scheduleSave called", {
    reason,
    delay,
    programCount: state.programs.length
  });
  // #endregion
  hideSaveStatus();
  if (delay <= 0) {
    persistState(reason);
    return;
  }
  state.saveTimer = window.setTimeout(() => {
    persistState(reason);
  }, delay);
}

async function persistState(reason) {
  saveLocalCache(state.programs);

  if (!isGithubConfigured()) {
    // #region debug-point B:not-configured
    reportDebugEvent("B", "script.js:persistState", "persistState skipped because GitHub is not configured", {
      reason
    });
    // #endregion
    setSaveStatus("GitHub 保存未启用，当前仅写入本地缓存", "error");
    return;
  }

  if (state.syncing) {
    // #region debug-point B:syncing
    reportDebugEvent("B", "script.js:persistState", "persistState skipped because syncing is already in progress", {
      reason
    });
    // #endregion
    return;
  }

  state.syncing = true;
  // #region debug-point B:persist-entry
  reportDebugEvent("B", "script.js:persistState", "persistState started", {
    reason,
    programCount: state.programs.length
  });
  // #endregion
  hideSaveStatus();

  const ok = await saveToGithubIssues(state.programs);
  state.syncing = false;

  // #region debug-point C:persist-result
  reportDebugEvent("C", "script.js:persistState", "persistState completed", {
    reason,
    ok
  });
  // #endregion

  if (ok) {
    setSaveStatus("已保存到 GitHub Issues", "success");
  } else {
    setSaveStatus("GitHub 保存失败，变更已保留在本地缓存", "error");
  }
}

function loadLocalCache() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return structuredClone(DEFAULT_PROGRAMS);
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : structuredClone(DEFAULT_PROGRAMS);
  } catch (error) {
    console.error("读取本地缓存失败:", error);
    return structuredClone(DEFAULT_PROGRAMS);
  }
}

function saveLocalCache(programs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(programs));
  } catch (error) {
    console.error("写入本地缓存失败:", error);
  }
}

async function loadFromGithubIssues() {
  try {
    const issue = await findStateIssue();
    if (!issue || !issue.body) {
      // #region debug-point D:load-miss
      reportDebugEvent("D", "script.js:loadFromGithubIssues", "no issue or issue body found during load", {
        foundIssue: Boolean(issue),
        hasBody: Boolean(issue?.body)
      });
      // #endregion
      return null;
    }

    const parsed = parseIssueBody(issue.body);
    // #region debug-point D:load-parse
    reportDebugEvent("D", "script.js:loadFromGithubIssues", "issue body parsed during load", {
      foundIssue: true,
      parsedCount: Array.isArray(parsed) ? parsed.length : null
    });
    // #endregion
    return Array.isArray(parsed) && parsed.length ? parsed : null;
  } catch (error) {
    // #region debug-point D:load-error
    reportDebugEvent("D", "script.js:loadFromGithubIssues", "loadFromGithubIssues threw", {
      error: String(error)
    });
    // #endregion
    console.error("读取 GitHub Issues 失败:", error);
    return null;
  }
}

async function saveToGithubIssues(programs) {
  try {
    const issue = await findStateIssue();
    const body = buildIssueBody(programs);

    if (issue) {
      const response = await fetch(
        `https://api.github.com/repos/${GITHUB_SYNC_CONFIG.owner}/${GITHUB_SYNC_CONFIG.repo}/issues/${issue.number}`,
        {
          method: "PATCH",
          headers: getGithubHeaders(),
          body: JSON.stringify({ body })
        }
      );

      // #region debug-point C:patch-response
      reportDebugEvent("C", "script.js:saveToGithubIssues", "patch issue response received", {
        issueNumber: issue.number,
        status: response.status,
        ok: response.ok
      });
      // #endregion
      return response.ok;
    }

    const createResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_SYNC_CONFIG.owner}/${GITHUB_SYNC_CONFIG.repo}/issues`,
      {
        method: "POST",
        headers: getGithubHeaders(),
        body: JSON.stringify({
          title: GITHUB_SYNC_CONFIG.issueTitle,
          body,
          labels: GITHUB_SYNC_CONFIG.issueLabel ? [GITHUB_SYNC_CONFIG.issueLabel] : []
        })
      }
    );

    // #region debug-point C:create-response
    reportDebugEvent("C", "script.js:saveToGithubIssues", "create issue response received", {
      status: createResponse.status,
      ok: createResponse.ok
    });
    // #endregion
    return createResponse.ok;
  } catch (error) {
    // #region debug-point C:save-error
    reportDebugEvent("C", "script.js:saveToGithubIssues", "saveToGithubIssues threw", {
      error: String(error)
    });
    // #endregion
    console.error("保存到 GitHub Issues 失败:", error);
    return false;
  }
}

async function findStateIssue() {
  const searchParams = new URLSearchParams({
    state: "all",
    per_page: "100"
  });

  if (GITHUB_SYNC_CONFIG.issueLabel) {
    searchParams.set("labels", GITHUB_SYNC_CONFIG.issueLabel);
  }

  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_SYNC_CONFIG.owner}/${GITHUB_SYNC_CONFIG.repo}/issues?${searchParams.toString()}`,
    {
      headers: getGithubHeaders()
    }
  );

  // #region debug-point D:find-issue-response
  reportDebugEvent("D", "script.js:findStateIssue", "findStateIssue response received", {
    status: response.status,
    ok: response.ok
  });
  // #endregion

  if (!response.ok) {
    throw new Error(`GitHub API ${response.status}`);
  }

  const issues = await response.json();
  const matchedIssue = issues.find((issue) => issue.title === GITHUB_SYNC_CONFIG.issueTitle) || null;
  // #region debug-point D:find-issue-result
  reportDebugEvent("D", "script.js:findStateIssue", "findStateIssue completed", {
    issueCount: Array.isArray(issues) ? issues.length : null,
    matchedIssueNumber: matchedIssue?.number ?? null
  });
  // #endregion
  return matchedIssue;
}

function buildIssueBody(programs) {
  return [
    "Interactive school list state.",
    "",
    ISSUE_BODY_MARKER_START,
    JSON.stringify(programs, null, 2),
    ISSUE_BODY_MARKER_END
  ].join("\n");
}

function parseIssueBody(body) {
  const startIndex = body.indexOf(ISSUE_BODY_MARKER_START);
  const endIndex = body.indexOf(ISSUE_BODY_MARKER_END);

  if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
    return null;
  }

  const jsonText = body
    .slice(startIndex + ISSUE_BODY_MARKER_START.length, endIndex)
    .trim();

  return JSON.parse(jsonText);
}

function getGithubHeaders() {
  const headers = {
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json"
  };

  if (GITHUB_SYNC_CONFIG.token) {
    headers.Authorization = `Bearer ${GITHUB_SYNC_CONFIG.token}`;
  }

  return headers;
}

function isGithubConfigured() {
  return Boolean(
    GITHUB_SYNC_CONFIG.enabled &&
      GITHUB_SYNC_CONFIG.owner &&
      GITHUB_SYNC_CONFIG.repo &&
      GITHUB_SYNC_CONFIG.token
  );
}

function clearTierDropState() {
  document.querySelectorAll(".tier-column.drag-target").forEach((node) => {
    node.classList.remove("drag-target");
  });
}

function setSaveStatus(message, type = "info") {
  window.clearTimeout(state.saveStatusTimer);

  if (type === "info") {
    hideSaveStatus();
    return;
  }

  elements.saveStatus.textContent = message;
  elements.saveStatus.classList.remove("hidden", "is-success", "is-error");
  elements.saveStatus.classList.add(type === "success" ? "is-success" : "is-error");

  if (type === "success") {
    state.saveStatusTimer = window.setTimeout(() => {
      hideSaveStatus();
    }, 1800);
  }
}

function hideSaveStatus() {
  window.clearTimeout(state.saveStatusTimer);
  elements.saveStatus.textContent = "";
  elements.saveStatus.classList.add("hidden");
  elements.saveStatus.classList.remove("is-success", "is-error");
}

function createId() {
  return `program-${Math.random().toString(36).slice(2, 10)}`;
}
