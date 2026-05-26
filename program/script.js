const TIER_DEFINITIONS = [
  { id: "lottery", label: "Lottery | 彩票" },
  { id: "reach", label: "Reach | 冲刺" },
  { id: "match", label: "Match | 主申" },
  { id: "safety", label: "Safety | 保底" }
];

const SCHOOL_OPTIONS = [
  { id: "princeton", short: "Princeton", cn: "普林斯顿大学", en: "Princeton University", domain: "www.princeton.edu", qs: 22, usNews: 16, cs: 29 },
  { id: "mit", short: "MIT", cn: "麻省理工学院", en: "Massachusetts Institute of Technology", domain: "www.mit.edu", qs: 1, usNews: 2, cs: 9 },
  { id: "harvard", short: "Harvard", cn: "哈佛大学", en: "Harvard University", domain: "www.harvard.edu", qs: 4, usNews: 1, cs: 61 },
  { id: "stanford", short: "Stanford", cn: "斯坦福大学", en: "Stanford University", domain: "www.stanford.edu", qs: 6, usNews: 3, cs: 17 },
  { id: "oxford", short: "Oxford", cn: "牛津大学", en: "University of Oxford", domain: "www.ox.ac.uk", qs: 3, usNews: 4, cs: 91 },
  { id: "cambridge", short: "Cambridge", cn: "剑桥大学", en: "University of Cambridge", domain: "www.cam.ac.uk", qs: 5, usNews: 5, cs: 72 },
  { id: "yale", short: "Yale", cn: "耶鲁大学", en: "Yale University", domain: "www.yale.edu", qs: 23, usNews: 9, cs: 65 },
  { id: "imperial", short: "Imperial", cn: "帝国理工学院", en: "Imperial College London", domain: "www.imperial.ac.uk", qs: 2, usNews: 11, cs: 81 },
  { id: "caltech", short: "Caltech", cn: "加州理工学院", en: "California Institute of Technology", domain: "www.caltech.edu", qs: 10, usNews: 23, cs: 206 },
  { id: "duke", short: "Duke", cn: "杜克大学", en: "Duke University", domain: "duke.edu", qs: 61, usNews: 27, cs: 51 },
  { id: "brown", short: "Brown", cn: "布朗大学", en: "Brown University", domain: "www.brown.edu", qs: 79, usNews: 150, cs: 87 },
  { id: "eth", short: "ETH Zurich", cn: "苏黎世联邦理工学院", en: "ETH Zurich", domain: "ethz.ch", qs: 7, usNews: 35, cs: 8 },
  { id: "nus", short: "NUS", cn: "新加坡国立大学", en: "National University of Singapore", domain: "www.nus.edu.sg", qs: 8, usNews: 20, cs: 18 },
  { id: "ucl", short: "UCL", cn: "伦敦大学学院", en: "University College London", domain: "www.ucl.ac.uk", qs: 9, usNews: 7, cs: 81 },
  { id: "jhu", short: "JHU", cn: "约翰斯霍普金斯大学", en: "Johns Hopkins University", domain: "www.jhu.edu", qs: 32, usNews: 14, cs: 65 },
  { id: "northwestern", short: "Northwestern", cn: "西北大学", en: "Northwestern University", domain: "www.northwestern.edu", qs: 50, usNews: 24, cs: 45 },
  { id: "columbia", short: "Columbia", cn: "哥伦比亚大学", en: "Columbia University", domain: "www.columbia.edu", qs: 34, usNews: 10, cs: 36 },
  { id: "cornell", short: "Cornell", cn: "康奈尔大学", en: "Cornell University", domain: "www.cornell.edu", qs: 16, usNews: 16, cs: 15 },
  { id: "cornelltech", short: "Cornell Tech", cn: "康奈尔大学Tech校区", en: "Cornell University Tech Campus", domain: "tech.cornell.edu", qs: 16, usNews: 16, cs: 15 },
  { id: "upenn", short: "UPenn", cn: "宾夕法尼亚大学", en: "University of Pennsylvania", domain: "www.upenn.edu", qs: 11, usNews: 15, cs: 31 },
  { id: "chicago", short: "UChicago", cn: "芝加哥大学", en: "University of Chicago", domain: "www.uchicago.edu", qs: 21, usNews: 26, cs: 45 },
  { id: "berkeley", short: "UC Berkeley", cn: "加州大学伯克利分校", en: "University of California, Berkeley", domain: "www.berkeley.edu", qs: 12, usNews: 6, cs: 13 },
  { id: "ntu", short: "NTU", cn: "南洋理工大学", en: "Nanyang Technological University, Singapore", domain: "www.ntu.edu.sg", qs: 15, usNews: 28, cs: 19 },
  { id: "epfl", short: "EPFL", cn: "洛桑联邦理工学院", en: "Ecole Polytechnique Federale de Lausanne", domain: "www.epfl.ch", qs: 26, usNews: 86, cs: 31 },
  { id: "toronto", short: "Toronto", cn: "多伦多大学", en: "University of Toronto", domain: "www.utoronto.ca", qs: 25, usNews: 16, cs: 21 },
  { id: "ucla", short: "UCLA", cn: "加州大学洛杉矶分校", en: "University of California, Los Angeles", domain: "www.ucla.edu", qs: 42, usNews: 13, cs: 37 },
  { id: "rice", short: "Rice", cn: "莱斯大学", en: "Rice University", domain: "www.rice.edu", qs: 141, usNews: 219, cs: 72 },
  { id: "dartmouth", short: "Dartmouth", cn: "达特茅斯学院", en: "Dartmouth College", domain: "home.dartmouth.edu", qs: 243, usNews: 326, cs: 156 },
  { id: "michigan", short: "UMich", cn: "密歇根大学安娜堡分校", en: "University of Michigan, Ann Arbor", domain: "umich.edu", qs: 44, usNews: 21, cs: 10 },
  { id: "cmu", short: "CMU", cn: "卡内基梅隆大学", en: "Carnegie Mellon University", domain: "www.cmu.edu", qs: 58, usNews: 126, cs: 1 },
  { id: "ucsd", short: "UCSD", cn: "加州大学圣地亚哥分校", en: "University of California, San Diego", domain: "ucsd.edu", qs: 72, usNews: 21, cs: 4 },
  { id: "usc", short: "USC", cn: "南加州大学", en: "University of Southern California", domain: "www.usc.edu", qs: 125, usNews: 77, cs: 39 },
  { id: "utexas", short: "UT Austin", cn: "得克萨斯大学奥斯汀分校", en: "The University of Texas at Austin", domain: "www.utexas.edu", qs: 66, usNews: 65, cs: 24 },
  { id: "gatech", short: "Georgia Tech", cn: "佐治亚理工学院", en: "Georgia Institute of Technology", domain: "www.gatech.edu", qs: 114, usNews: 79, cs: 6 },
  { id: "uiuc", short: "UIUC", cn: "伊利诺伊大学香槟分校", en: "University of Illinois Urbana-Champaign", domain: "illinois.edu", qs: 69, usNews: 109, cs: 3 },
  { id: "tum", short: "TUM", cn: "慕尼黑工业大学", en: "Technical University of Munich", domain: "www.tum.de", qs: 28, usNews: 79, cs: 41 },
  { id: "hkust", short: "HKUST", cn: "香港科技大学", en: "Hong Kong University of Science and Technology", domain: "hkust.edu.hk", qs: 47, usNews: 101, cs: 22 },
  { id: "hku", short: "HKU", cn: "香港大学", en: "The University of Hong Kong", domain: "www.hku.hk", qs: 17, usNews: 44, cs: 65 },
  { id: "edinburgh", short: "Edinburgh", cn: "爱丁堡大学", en: "University of Edinburgh", domain: "www.ed.ac.uk", qs: 27, usNews: 39, cs: 37 },
  { id: "tudelft", short: "TU Delft", cn: "代尔夫特理工大学", en: "Delft University of Technology", domain: "www.tudelft.nl", qs: 49, usNews: 191, cs: 65 },
  { id: "waterloo", short: "Waterloo", cn: "滑铁卢大学", en: "University of Waterloo", domain: "uwaterloo.ca", qs: 115, usNews: 197, cs: 28 },
  { id: "bu", short: "Boston U", cn: "波士顿大学", en: "Boston University", domain: "www.bu.edu", qs: 108, usNews: 86, cs: 58 },
  { id: "wisc", short: "UW-Madison", cn: "威斯康星大学麦迪逊分校", en: "University of Wisconsin-Madison", domain: "www.wisc.edu", qs: 116, usNews: 72, cs: 27 },
  { id: "uw", short: "UW", cn: "华盛顿大学西雅图分校", en: "University of Washington", domain: "www.washington.edu", qs: 76, usNews: 8, cs: 11 },
  { id: "nyu", short: "NYU", cn: "纽约大学", en: "New York University", domain: "www.nyu.edu", qs: 43, usNews: 32, cs: 24 },
  { id: "tamu", short: "Texas A&M", cn: "德州农工大学", en: "Texas A&M University", domain: "www.tamu.edu", qs: 154, usNews: 187, cs: 58 },
  { id: "neu", short: "Northeastern", cn: "东北大学", en: "Northeastern University", domain: "www.northeastern.edu", qs: 396, usNews: 220, cs: 16 }
];

const STATUS_DEFINITIONS = {
  draft: { id: "draft", label: "Draft", shortLabel: "Draft", colorClass: "is-gray" },
  applied: { id: "applied", label: "Applied ✉️", shortLabel: "Applied ✉️", colorClass: "is-green" },
  interview: { id: "interview", label: "Interview 👨🏻‍💼", shortLabel: "Interview 👨🏻‍💼", colorClass: "is-green" },
  waitlist: { id: "waitlist", label: "Waitlist ⌛️", shortLabel: "Waitlist ⌛️", colorClass: "is-yellow" },
  admitted: { id: "admitted", label: "Admitted ✅", shortLabel: "Admitted ✅", colorClass: "is-green" },
  reject: { id: "reject", label: "Rejected ❌", shortLabel: "Rejected ❌", colorClass: "is-red" }
};

const TERMINAL_STATUSES = new Set(["admitted", "reject"]);

const DEFAULT_PROGRAMS = [
  {
    id: createId(),
    tierId: "lottery",
    shortName: "Loading",
    schoolId: "mit",
    cnName: "加载中",
    enName: "Loading Content.",
    statusHistory: []
  },
  {
    id: createId(),
    tierId: "reach",
    shortName: "Loading",
    schoolId: "mit",
    cnName: "加载中",
    enName: "Loading Content.",
    statusHistory: []
  },
  {
    id: createId(),
    tierId: "match",
    shortName: "Loading",
    schoolId: "mit",
    cnName: "加载中",
    enName: "Loading Content.",
    statusHistory: []
  },
  {
    id: createId(),
    tierId: "safety",
    shortName: "Loading",
    schoolId: "mit",
    cnName: "加载中",
    enName: "Loading Content.",
    statusHistory: []
  },

];

const WORKER_URL = "https://schoolprogram.twodogz.workers.dev"; // 替换为你的 Cloudflare Worker 网址

const STORAGE_KEY = "interactive-school-list-cache-v1";


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
  unlockButton: document.querySelector("#unlock-button"),
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
  durationSelect: document.querySelector("#program-duration"),
  statusSelect: document.querySelector("#program-status"),
  saveStatus: document.querySelector("#save-status"),
  programCount: document.querySelector("#program-count"),
  modalLogo: document.querySelector("#modal-school-logo"),
  modalLogoPlaceholder: document.querySelector("#modal-logo-placeholder"),
  unlockModal: document.querySelector("#unlock-modal"),
  unlockCloseButtons: document.querySelectorAll("[data-close-unlock-modal='true'], #unlock-modal-close"),
  unlockForm: document.querySelector("#unlock-form"),
  unlockPasswordInput: document.querySelector("#unlock-password"),
  unlockError: document.querySelector("#unlock-error")
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
  syncing: false,
  isUnlocked: false,
  authToken: null
};

document.addEventListener("DOMContentLoaded", initialize);

async function initialize() {
  populateSchoolOptions();
  bindModalEvents();
  bindFormEvents();
  bindUnlockEvents();

  state.programs = normalizePrograms(loadLocalCache());
  renderBoard();

  if (!isGithubConfigured()) {
    hideSaveStatus();
    return;
  }

  const remotePrograms = await loadFromGithubIssues();
  if (remotePrograms) {
    state.programs = normalizePrograms(remotePrograms);
    saveLocalCache(state.programs);
    renderBoard();
    hideSaveStatus();
  } else {
    setSaveStatus("GitHub 数据加载失败，已回退到本地缓存", "error");
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

    if (event.key === "Escape" && !elements.unlockModal.classList.contains("hidden")) {
      closeUnlockModal();
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
      enName: elements.enNameInput.value.trim(),
      duration: elements.durationSelect.value,
      selectedStatus: elements.statusSelect.value
    };

    if (!payload.shortName || !payload.schoolId || !payload.cnName || !payload.enName || !payload.selectedStatus) {
      return;
    }

    if (state.modalMode === "create") {
      const statusHistory = buildNextStatusHistory([], payload.selectedStatus);

      state.programs.push(
        normalizeProgram({
          id: createId(),
          tierId: state.activeTierId,
          shortName: payload.shortName,
          schoolId: payload.schoolId,
          cnName: payload.cnName,
          enName: payload.enName,
          duration: payload.duration,
          statusHistory
        })
      );
      renderBoard();
      scheduleSave("create", 120);
    } else {
      state.programs = state.programs.map((program) => {
        if (program.id !== state.activeProgramId) {
          return program;
        }

        return normalizeProgram({
          ...program,
          shortName: payload.shortName,
          schoolId: payload.schoolId,
          cnName: payload.cnName,
          enName: payload.enName,
          duration: payload.duration,
          statusHistory: buildNextStatusHistory(program.statusHistory, payload.selectedStatus)
        });
      });
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

function bindUnlockEvents() {
  elements.unlockButton.addEventListener("click", openUnlockModal);

  elements.unlockCloseButtons.forEach((button) => {
    button.addEventListener("click", closeUnlockModal);
  });

  elements.unlockForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setUnlockError("");

    const password = elements.unlockPasswordInput.value;
    if (!password) {
      setUnlockError("请输入密码。");
      return;
    }

    try {
      const sha256 = await sha256Hex(password);
      
      const response = await fetch(`${WORKER_URL}/api/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passwordSha256: sha256 })
      });
      
      const result = await response.json();
      
      if (!result.success) {
        setUnlockError("密码错误。");
        return;
      }

      state.authToken = sha256;
      state.isUnlocked = true;
      updateUnlockButtonState();
      closeUnlockModal();
      renderBoard();
      setSaveStatus("已登陆", "success");
    } catch (error) {
      setUnlockError("登陆验证请求失败。");
    }
  });
}

function renderBoard() {
  updateUnlockButtonState();
  updateProgramCount();
  elements.board.innerHTML = "";

  TIER_DEFINITIONS.forEach((tier) => {
    const tierNode = elements.tierTemplate.content.firstElementChild.cloneNode(true);
    const title = tierNode.querySelector(".tier-title");
    const subtitle = tierNode.querySelector(".tier-subtitle");
    const addButton = tierNode.querySelector(".tier-add-button");
    const list = tierNode.querySelector(".tier-list");

    title.textContent = tier.label;
    subtitle.textContent = tier.subtitle || "";
    list.dataset.tierId = tier.id;
    list.dataset.locked = state.isUnlocked ? "false" : "true";
    tierNode.classList.toggle("is-locked", !state.isUnlocked);
    addButton.hidden = !state.isUnlocked;

    if (state.isUnlocked) {
      addButton.addEventListener("click", () => openCreateModal(tier.id));
      wireTierListDnD(list);
    }

    const programs = getProgramsByTier(tier.id);
    list.classList.toggle("empty", programs.length === 0);

    programs.forEach((program) => {
      const cardNode = elements.programTemplate.content.firstElementChild.cloneNode(true);
      const school = getSchoolById(program.schoolId);

      cardNode.dataset.programId = program.id;
      cardNode.dataset.tierId = program.tierId;
      cardNode.draggable = state.isUnlocked;
      cardNode.classList.toggle("is-locked", !state.isUnlocked);

      cardNode.querySelector(".program-short-name").textContent = program.shortName;
      cardNode.querySelector(".program-school-name").textContent = `@ ${school.short} ${school.cn}`;
      cardNode.querySelector(".program-subtitle").textContent = school.en;
      cardNode.querySelector(".program-cn-name").textContent = program.cnName;
      cardNode.querySelector(".program-en-name").textContent = program.enName;
      cardNode.querySelector(".program-status-text").textContent = getCurrentStatusLabel(program);

      const rankingsContainer = cardNode.querySelector(".program-rankings");
      const qsNode = cardNode.querySelector(".qs-ranking");
      const usnNode = cardNode.querySelector(".usnews-ranking");
      const csNode = cardNode.querySelector(".cs-ranking");
      const durationBadge = cardNode.querySelector(".duration-badge");

      if (program.duration) {
        durationBadge.textContent = program.duration;
        durationBadge.className = "ranking-badge duration-badge"; // Reset classes
        if (program.duration === "1 year") {
          durationBadge.classList.add("duration-1");
        } else if (program.duration === "1.5 year") {
          durationBadge.classList.add("duration-1-5");
        } else if (program.duration === "2 year") {
          durationBadge.classList.add("duration-2");
        }
        durationBadge.hidden = false;
      } else {
        durationBadge.hidden = true;
      }
      
      // Determine display order based on ranking (lower number = higher rank)
      const rankings = [
        { node: qsNode, rank: school.qs || Infinity },
        { node: usnNode, rank: school.usNews || Infinity },
        { node: csNode, rank: school.cs || Infinity }
      ];
      
      rankings.sort((a, b) => a.rank - b.rank);
      
      rankings.forEach(item => {
        rankingsContainer.appendChild(item.node);
      });

      if (school.usNews) {
        usnNode.hidden = false;
        usnNode.querySelector(".usnews-value").textContent = school.usNews;
      }
      if (school.qs) {
        qsNode.hidden = false;
        qsNode.querySelector(".qs-value").textContent = school.qs;
      }
      if (school.cs) {
        csNode.hidden = false;
        csNode.querySelector(".cs-value").textContent = school.cs;
      }

      const progressNode = cardNode.querySelector(".program-progress");
      renderStatusProgress(progressNode, program);

      const editButton = cardNode.querySelector(".program-edit-button");
      editButton.hidden = !state.isUnlocked;
      if (state.isUnlocked) {
        editButton.addEventListener("click", () => openEditModal(program.id));
        wireProgramDnD(cardNode);
      }

      const logo = cardNode.querySelector(".school-logo");
      const placeholder = cardNode.querySelector(".logo-placeholder");
      loadSchoolLogo(logo, placeholder, school);

      list.appendChild(cardNode);
    });

    tierNode.dataset.tierId = tier.id;
    elements.board.appendChild(tierNode);
  });
}

function updateProgramCount() {
  const count = Array.isArray(state.programs) ? state.programs.length : 0;
  elements.programCount.textContent = `${count} Programs In Total`;
}

function renderStatusProgress(progressNode, program) {
  progressNode.innerHTML = "";

  const segments = getProgressSegments(program);
  segments.forEach((segment) => {
    const segmentNode = document.createElement("span");
    segmentNode.className = `program-progress-segment ${segment.colorClass}`;
    if (segment.title) {
      segmentNode.title = segment.title;
    }
    progressNode.appendChild(segmentNode);
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

  const programMap = new Map(state.programs.map((program) => [program.id, normalizeProgram(program)]));
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
  if (!state.isUnlocked) {
    return;
  }

  state.modalMode = "create";
  state.activeProgramId = null;
  state.activeTierId = tierId;

  elements.modalTitle.textContent = "新建项目";
  elements.submitButton.textContent = "新建";
  elements.deleteButton.classList.add("hidden");

  elements.form.reset();
  elements.schoolSelect.value = SCHOOL_OPTIONS[0].id;
  elements.durationSelect.value = "";
  populateStatusSelect([], "draft:stay");
  updateModalSchoolPreview();
  showModal();
}

function openEditModal(programId) {
  if (!state.isUnlocked) {
    return;
  }

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
  elements.durationSelect.value = program.duration || "";

  populateStatusSelect(program.statusHistory, `${getCurrentStatus(program)}:stay`);
  updateModalSchoolPreview();
  showModal();
}

function populateStatusSelect(statusHistory, selectedValue) {
  const options = getStatusSelectChoices(statusHistory);
  const fragment = document.createDocumentFragment();

  options.forEach((choice) => {
    const option = document.createElement("option");
    option.value = choice.value;
    option.textContent = choice.label;
    fragment.appendChild(option);
  });

  elements.statusSelect.innerHTML = "";
  elements.statusSelect.appendChild(fragment);
  elements.statusSelect.value = options.some((choice) => choice.value === selectedValue)
    ? selectedValue
    : options[0].value;
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

function openUnlockModal() {
  setUnlockError("");
  elements.unlockForm.reset();
  elements.unlockModal.classList.remove("hidden");
  elements.unlockModal.setAttribute("aria-hidden", "false");
  setTimeout(() => elements.unlockPasswordInput.focus(), 0);
}

function closeUnlockModal() {
  elements.unlockModal.classList.add("hidden");
  elements.unlockModal.setAttribute("aria-hidden", "true");
  setUnlockError("");
}

function setUnlockError(message) {
  elements.unlockError.textContent = message;
  elements.unlockError.classList.toggle("hidden", !message);
}

function updateUnlockButtonState() {
  elements.unlockButton.classList.toggle("is-unlocked", state.isUnlocked);
  elements.unlockButton.title = state.isUnlocked ? "编辑功能已解锁" : "解锁编辑功能";
  elements.unlockButton.setAttribute("aria-label", state.isUnlocked ? "编辑功能已解锁" : "解锁编辑功能");
}

function updateModalSchoolPreview() {
  const school = getSchoolById(elements.schoolSelect.value);
  loadSchoolLogo(elements.modalLogo, elements.modalLogoPlaceholder, school);
}

function normalizePrograms(programs) {
  if (!Array.isArray(programs) || programs.length === 0) {
    return structuredClone(DEFAULT_PROGRAMS).map(normalizeProgram);
  }

  return programs.map(normalizeProgram);
}

function normalizeProgram(program) {
  const history = Array.isArray(program?.statusHistory)
    ? program.statusHistory
        .filter((entry) => entry && STATUS_DEFINITIONS[entry.status])
        .map((entry) => ({
          status: entry.status,
          changedAt: typeof entry.changedAt === "string" ? entry.changedAt : new Date().toISOString()
        }))
    : [];

  return {
    id: typeof program?.id === "string" ? program.id : createId(),
    tierId: program?.tierId || "match",
    shortName: program?.shortName || "",
    schoolId: schoolMap.has(program?.schoolId) ? program.schoolId : SCHOOL_OPTIONS[0].id,
    cnName: program?.cnName || "",
    enName: program?.enName || "",
    duration: program?.duration || "",
    statusHistory: history
  };
}

function getCurrentStatus(program) {
  const history = Array.isArray(program?.statusHistory) ? program.statusHistory : [];
  return history.length ? history[history.length - 1].status : "draft";
}

function getCurrentStatusLabel(program) {
  const history = Array.isArray(program?.statusHistory) ? program.statusHistory : [];
  if (history.length === 0) {
    return STATUS_DEFINITIONS.draft.label;
  }

  return getHistoryEntryLabel(history[history.length - 1], history, history.length - 1);
}

function getStatusSelectChoices(statusHistory) {
  const history = Array.isArray(statusHistory) ? statusHistory : [];
  const currentStatus = history.length ? history[history.length - 1].status : "draft";
  const currentInterviewRound = getInterviewRoundFromHistory(history);

  if (currentStatus === "draft") {
    return [
      { value: "draft:stay", label: STATUS_DEFINITIONS.draft.label },
      { value: "applied:append", label: STATUS_DEFINITIONS.applied.label }
    ];
  }

  if (currentStatus === "applied") {
    return [
      { value: "applied:stay", label: STATUS_DEFINITIONS.applied.label },
      { value: "interview:append", label: "Interview Round 1 👨🏻‍💼" },
      { value: "admitted:append", label: STATUS_DEFINITIONS.admitted.label },
      { value: "waitlist:append", label: STATUS_DEFINITIONS.waitlist.label },
      { value: "reject:append", label: STATUS_DEFINITIONS.reject.label }
    ];
  }

  if (currentStatus === "interview") {
    return [
      { value: "interview:stay", label: `Interview Round ${currentInterviewRound} 👨🏻‍💼` },
      { value: "interview:append", label: `Interview Round ${currentInterviewRound + 1} 👨🏻‍💼` },
      { value: "admitted:append", label: STATUS_DEFINITIONS.admitted.label },
      { value: "waitlist:append", label: STATUS_DEFINITIONS.waitlist.label },
      { value: "reject:append", label: STATUS_DEFINITIONS.reject.label }
    ];
  }

  if (currentStatus === "waitlist") {
    return [
      { value: "waitlist:stay", label: STATUS_DEFINITIONS.waitlist.label },
      { value: "admitted:append", label: STATUS_DEFINITIONS.admitted.label },
      { value: "reject:append", label: STATUS_DEFINITIONS.reject.label }
    ];
  }

  if (currentStatus === "admitted") {
    return [{ value: "admitted:stay", label: STATUS_DEFINITIONS.admitted.label }];
  }

  if (currentStatus === "reject") {
    return [{ value: "reject:stay", label: STATUS_DEFINITIONS.reject.label }];
  }

  return [{ value: "draft:stay", label: STATUS_DEFINITIONS.draft.label }];
}

function buildNextStatusHistory(currentHistory, selectedStatus) {
  const history = Array.isArray(currentHistory) ? currentHistory.map((entry) => ({ ...entry })) : [];
  const [targetStatus, action] = String(selectedStatus || "").split(":");

  if (action !== "append" || !STATUS_DEFINITIONS[targetStatus]) {
    return history;
  }

  const allowedChoices = getStatusSelectChoices(history)
    .filter((choice) => choice.value.endsWith(":append"))
    .map((choice) => choice.value);

  if (!allowedChoices.includes(`${targetStatus}:append`)) {
    return history;
  }

  history.push({
    status: targetStatus,
    changedAt: new Date().toISOString()
  });

  return history;
}

function getProgressSegments(program) {
  const history = Array.isArray(program.statusHistory) ? program.statusHistory : [];

  if (history.length === 0) {
    return [{ colorClass: STATUS_DEFINITIONS.draft.colorClass, title: "" }];
  }

  const segments = history.map((entry, index) => {
    const definition = STATUS_DEFINITIONS[entry.status];
    return {
      colorClass: definition.colorClass,
      title: `${getHistoryEntryLabel(entry, history, index)}\n${formatStatusTime(entry.changedAt)}`
    };
  });

  if (!TERMINAL_STATUSES.has(getCurrentStatus(program))) {
    segments.push({ colorClass: STATUS_DEFINITIONS.draft.colorClass, title: "" });
  }

  return segments;
}

function formatStatusTime(changedAt) {
  try {
    return `Updated: ${new Date(changedAt).toLocaleString("en-US", { hour12: false })}`;
  } catch (error) {
    return "Updated: Unknown";
  }
}

function getInterviewRoundFromHistory(history, targetIndex = history.length - 1) {
  let round = 0;
  for (let index = 0; index <= targetIndex; index += 1) {
    if (history[index]?.status === "interview") {
      round += 1;
    }
  }
  return round;
}

function getHistoryEntryLabel(entry, history, index) {
  if (entry.status === "interview") {
    return `Interview Round ${getInterviewRoundFromHistory(history, index)} 👨🏻‍💼`;
  }

  return STATUS_DEFINITIONS[entry.status]?.label || "";
}

function getSchoolById(schoolId) {
  return schoolMap.get(schoolId) || SCHOOL_OPTIONS[0];
}

function loadSchoolLogo(imgElement, placeholderElement, school) {
  if (!school || !school.domain) {
    placeholderElement.hidden = false;
    imgElement.hidden = true;
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
  state.programs = normalizePrograms(state.programs);
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizePrograms(programs)));
  } catch (error) {
    console.error("写入本地缓存失败:", error);
  }
}

async function loadFromGithubIssues() {
  try {
    const response = await fetch(`${WORKER_URL}/api/data`);
    if (!response.ok) {
      reportDebugEvent("D", "script.js:loadFromGithubIssues", "worker fetch error", {
        status: response.status
      });
      return null;
    }
    const result = await response.json();
    if (!result.data) {
      reportDebugEvent("D", "script.js:loadFromGithubIssues", "no data found", {});
      return null;
    }
    return Array.isArray(result.data) && result.data.length ? normalizePrograms(result.data) : null;
  } catch (error) {
    reportDebugEvent("D", "script.js:loadFromGithubIssues", "loadFromGithubIssues threw", {
      error: String(error)
    });
    console.error("读取数据失败:", error);
    return null;
  }
}

async function saveToGithubIssues(programs) {
  try {
    const response = await fetch(`${WORKER_URL}/api/data`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${state.authToken}`
      },
      body: JSON.stringify({ programs })
    });
    
    reportDebugEvent("C", "script.js:saveToGithubIssues", "save response received", {
      status: response.status,
      ok: response.ok
    });
    
    return response.ok;
  } catch (error) {
    reportDebugEvent("C", "script.js:saveToGithubIssues", "saveToGithubIssues threw", {
      error: String(error)
    });
    console.error("保存数据失败:", error);
    return false;
  }
}

function isGithubConfigured() {
  return Boolean(WORKER_URL && WORKER_URL.startsWith("http"));
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

async function sha256Hex(value) {
  if (!window.crypto?.subtle) {
    throw new Error("crypto.subtle is unavailable");
  }

  const encoded = new TextEncoder().encode(value);
  const digest = await window.crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function createId() {
  return `program-${Math.random().toString(36).slice(2, 10)}`;
}
