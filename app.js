"use strict";

/* ============================================================================
 * 15 Minutes Later — bilingual focus roulette with a spaced-repetition core.
 *
 * Loop: spin -> research brief (concept + guiding questions) -> timed stages
 * (research, optional written recall, spoken recall) -> self-grade. The grade
 * feeds an SM-2-lite scheduler that decides when the concept comes back. Stage
 * lengths are configurable (presets or custom). Progress, streak, settings, and
 * stats persist in localStorage. Concept data lives in concepts.js.
 * ==========================================================================*/

const N = CONCEPT_DATA.length;
const DAY = 24 * 60 * 60 * 1000;

/* ---------------------------------------------------------------------------
 * UI copy per language.
 * ------------------------------------------------------------------------- */
const STRINGS = {
  ru: {
    docTitle: "15 минут спустя · Рулетка фокуса",
    heroTag: "#15минутспустя",
    heroTitle: "Тренируй память, концентрацию<br />и нейронные связи.",
    heroSubtitle: "Рулетка выбирает концепт — а ты разбираешь его за отведённое время.",
    resultLabel: "Итоговый выбор",
    resultIdle: "Ожидание запуска",
    resultExploring: "Перебираю возможности…",
    spinStart: "Запустить поиск",
    spinProcessing: "Обработка…",
    spinAgain: "Крутить снова",
    kbdHint: "Пробел — крутить",
    reset: "Сброс",
    presetCustom: "Свой",
    customStudyLabel: "иссл., мин",
    customPresentLabel: "пересказ, мин",
    writeToggle: "Письмо",
    writeToggleAria: "Письменное припоминание",
    statToday: "Сегодня",
    statStreak: "Стрик",
    statDue: "К возврату",
    statStudied: "Изучено",
    sessionLabel: "Выбранный концепт",
    briefLabel: "С чего начать",
    studyLabel: "Исследование",
    writeLabel: "Письмо по памяти",
    presentLabel: "Презентация",
    startN: (m) => `Начать ${m} мин`,
    done: "Готово",
    presentPrompt: "Теперь расскажи вслух по памяти — как будто объясняешь другому.",
    writePrompt: "Сейчас — письменное припоминание. Пиши по памяти всё, что вспомнишь.",
    writePlaceholder: "Пиши по памяти…",
    paused: "На паузе",
    timerHint: "Клик по таймеру — пауза",
    back: "← Назад",
    recallTitle: "Насколько хорошо вспомнил?",
    recallWrittenLabel: "Что ты написал",
    recallDefLabel: "Определение",
    gradeAgain: "Не помню",
    gradeHard: "Трудно",
    gradeGood: "Хорошо",
    gradeEasy: "Легко",
    soon: "скоро",
    interval: (days) => `через ${days} дн.`,
    checkToggle: "Проверка",
    checkToggleAria: "Оценивать тестом, а не самооценкой",
    testButton: "Тест",
    quizInstructionDef: "Выбери определение",
    quizInstructionName: "Какой концепт описан?",
    quizInstructionCloze: "Назови концепт по определению",
    quizCheck: "Проверить",
    quizInputPlaceholder: "название концепта…",
    quizCorrect: "Верно",
    quizWrong: "Неверно",
    quizAnswerWas: (name) => `Ответ: ${name}`,
    next: "Дальше",
    quizKeysMcq: "1–4 — выбрать",
    quizKeysCloze: "Enter — проверить",
    quizKeysNext: "Enter — дальше",
    matchInstruction: "Сопоставь концепты и определения",
    summaryTitle: "Тест завершён",
    summaryScore: (c, total) => `${c} / ${total}`,
    summarySub: (c, total) => `Верно ${c} из ${total}`,
    soundOnLabel: "Звук включён",
    soundOffLabel: "Звук выключен",
    credit: "Вдохновлено проектом 15-minutos-después",
  },
  en: {
    docTitle: "15 Minutes Later · Focus Roulette",
    heroTag: "#15minuteslater",
    heroTitle: "Train your memory, focus<br />and neural connections.",
    heroSubtitle: "The roulette picks a concept — you explore it within the time you set.",
    resultLabel: "Final selection",
    resultIdle: "Awaiting activation",
    resultExploring: "Exploring possibilities…",
    spinStart: "Start search",
    spinProcessing: "Processing…",
    spinAgain: "Spin again",
    kbdHint: "Space to spin",
    reset: "Reset",
    presetCustom: "Custom",
    customStudyLabel: "research, min",
    customPresentLabel: "recall, min",
    writeToggle: "Write",
    writeToggleAria: "Written recall",
    statToday: "Today",
    statStreak: "Streak",
    statDue: "Due",
    statStudied: "Studied",
    sessionLabel: "Selected concept",
    briefLabel: "Where to start",
    studyLabel: "Research",
    writeLabel: "Written recall",
    presentLabel: "Presentation",
    startN: (m) => `Start ${m} min`,
    done: "Done",
    presentPrompt: "Now recall it aloud from memory — as if explaining to someone.",
    writePrompt: "Time for written recall. Write down everything you can remember.",
    writePlaceholder: "Write from memory…",
    paused: "Paused",
    timerHint: "Click the timer to pause",
    back: "← Back",
    recallTitle: "How well did you recall it?",
    recallWrittenLabel: "What you wrote",
    recallDefLabel: "Definition",
    gradeAgain: "Blank",
    gradeHard: "Hard",
    gradeGood: "Good",
    gradeEasy: "Easy",
    soon: "soon",
    interval: (days) => `in ${days} d`,
    checkToggle: "Check",
    checkToggleAria: "Grade by test, not self-rating",
    testButton: "Test",
    quizInstructionDef: "Pick the definition",
    quizInstructionName: "Which concept is described?",
    quizInstructionCloze: "Name the concept from its definition",
    quizCheck: "Check",
    quizInputPlaceholder: "concept name…",
    quizCorrect: "Correct",
    quizWrong: "Wrong",
    quizAnswerWas: (name) => `Answer: ${name}`,
    next: "Next",
    quizKeysMcq: "1–4 to pick",
    quizKeysCloze: "Enter to check",
    quizKeysNext: "Enter to continue",
    matchInstruction: "Match concepts to definitions",
    summaryTitle: "Test complete",
    summaryScore: (c, total) => `${c} / ${total}`,
    summarySub: (c, total) => `${c} of ${total} correct`,
    soundOnLabel: "Sound on",
    soundOffLabel: "Sound off",
    credit: "Inspired by 15-minutos-después",
  },
};

/* ---------------------------------------------------------------------------
 * Session timing config.
 * ------------------------------------------------------------------------- */
const PRESETS = {
  fast: { study: 5, present: 1 },
  std: { study: 15, present: 1 },
  pomodoro: { study: 25, present: 5 },
};
const WRITE_MINUTES = 2;
const CUSTOM_STUDY_MIN = 1;
const CUSTOM_STUDY_MAX = 60;
const CUSTOM_PRESENT_MIN = 1;
const CUSTOM_PRESENT_MAX = 15;
const GOAL_CYCLE = [1, 3, 5, 10];

/* ---------------------------------------------------------------------------
 * DOM references.
 * ------------------------------------------------------------------------- */
const appShell = document.querySelector(".app-shell");
const viewIdle = document.getElementById("view-idle");
const viewSession = document.getElementById("view-session");
const viewRecall = document.getElementById("view-recall");

const heroTagEl = document.getElementById("hero-tag");
const heroTitleEl = document.getElementById("hero-title");
const heroSubtitleEl = document.getElementById("hero-subtitle");

const windowElement = document.getElementById("roulette-window");
const spinButton = document.getElementById("spin-button");
const resultText = document.getElementById("result-text");
const resultLabelEl = document.getElementById("result-label");
const resultPanelEl = document.querySelector(".result-panel");
const kbdHintEl = document.getElementById("kbd-hint");

const presetChips = Array.from(document.querySelectorAll(".preset-chip"));
const presetCustomChip = document.getElementById("preset-custom");
const customRow = document.getElementById("custom-row");
const customStudyEl = document.getElementById("custom-study");
const customPresentEl = document.getElementById("custom-present");
const customStudyLabelEl = document.getElementById("custom-study-label");
const customPresentLabelEl = document.getElementById("custom-present-label");
const stepperEls = Array.from(document.querySelectorAll(".stepper"));
const writeToggleEl = document.getElementById("write-toggle");
const writeToggleLabelEl = document.getElementById("write-toggle-label");

const statTodayEl = document.getElementById("stat-today");
const statTodayKeyEl = document.getElementById("stat-today-key");
const statStreakEl = document.getElementById("stat-streak");
const statStreakKeyEl = document.getElementById("stat-streak-key");
const statDueEl = document.getElementById("stat-due");
const statDueKeyEl = document.getElementById("stat-due-key");
const statStudiedEl = document.getElementById("stat-studied");
const statStudiedKeyEl = document.getElementById("stat-studied-key");
const statGoalEl = document.getElementById("stat-goal");
const resetButton = document.getElementById("reset-progress");

const creditLinkEl = document.getElementById("credit-link");

const backButton = document.getElementById("back-button");
const sessionTagEl = document.getElementById("session-tag");
const sessionLabelEl = document.getElementById("session-label");
const sessionConceptEl = document.getElementById("session-concept");
const briefEl = document.getElementById("session-brief");
const briefLabelEl = document.getElementById("brief-label");
const briefQuestionsEl = document.getElementById("brief-questions");
const stagePromptEl = document.getElementById("stage-prompt");
const orbEl = document.getElementById("timer-orb");
const timerStageEl = document.getElementById("timer-stage");
const timerValueEl = document.getElementById("timer-value");
const writeAreaEl = document.getElementById("write-area");
const timerHintEl = document.getElementById("timer-hint");
const sessionButton = document.getElementById("session-button");

const recallTagEl = document.getElementById("recall-tag");
const recallTitleEl = document.getElementById("recall-title");
const recallConceptEl = document.getElementById("recall-concept");
const recallWrittenEl = document.getElementById("recall-written");
const recallWrittenLabelEl = document.getElementById("recall-written-label");
const recallWrittenTextEl = document.getElementById("recall-written-text");
const recallDefLabelEl = document.getElementById("recall-def-label");
const recallDefTextEl = document.getElementById("recall-def-text");
const gradeButtons = Array.from(document.querySelectorAll(".grade-button"));
const gradeLabelEls = Array.from(document.querySelectorAll(".grade-button .grade-label"));
const gradeIntervalEls = Array.from(document.querySelectorAll("[data-grade-interval]"));

const soundToggleEl = document.getElementById("sound-toggle");
const langButtons = Array.from(document.querySelectorAll(".lang-button"));

const checkToggleEl = document.getElementById("check-toggle");
const checkToggleLabelEl = document.getElementById("check-toggle-label");
const testButton = document.getElementById("test-button");
const testButtonLabelEl = document.getElementById("test-button-label");
const testCountEl = document.getElementById("test-count");

const viewQuiz = document.getElementById("view-quiz");
const viewMatch = document.getElementById("view-match");
const viewSummary = document.getElementById("view-summary");
const quizBackBtn = document.getElementById("quiz-back");
const quizProgressEl = document.getElementById("quiz-progress");
const quizInstructionEl = document.getElementById("quiz-instruction");
const quizPromptEl = document.getElementById("quiz-prompt");
const quizOptionsEl = document.getElementById("quiz-options");
const quizClozeEl = document.getElementById("quiz-cloze");
const quizInput = document.getElementById("quiz-input");
const quizCheckBtn = document.getElementById("quiz-check");
const quizKbdHintEl = document.getElementById("quiz-kbd-hint");
const quizFeedbackEl = document.getElementById("quiz-feedback");
const quizVerdictEl = document.getElementById("quiz-verdict");
const quizAnswerEl = document.getElementById("quiz-answer");
const quizDefEl = document.getElementById("quiz-def");
const quizNextBtn = document.getElementById("quiz-next");
const matchBackBtn = document.getElementById("match-back");
const matchInstructionEl = document.getElementById("match-instruction");
const matchConceptsEl = document.getElementById("match-concepts");
const matchDefsEl = document.getElementById("match-defs");
const matchContinueBtn = document.getElementById("match-continue");
const summaryTitleEl = document.getElementById("summary-title");
const summaryScoreEl = document.getElementById("summary-score");
const summarySubEl = document.getElementById("summary-sub");
const summaryDoneBtn = document.getElementById("summary-done");

/* ---------------------------------------------------------------------------
 * Persistence keys.
 * ------------------------------------------------------------------------- */
const bufferItems = 2;
const LANG_KEY = "fml.lang";
const SOUND_KEY = "fml.sound";
const STORE_KEY = "fml.store.v1";
const SETTINGS_KEY = "fml.settings.v1";
const STORE_VERSION = 1;

const prefersReducedMotion =
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------------------------------------------------------------------------
 * Runtime state.
 * ------------------------------------------------------------------------- */
let lang = "ru";
let audioContext;
let soundEnabled = true;
let isSpinning = false;
let currentIndex = 0;
let travelOffset = 0;
let currentWinnerIndex = null;
let lastWinnerIndex = null;
let currentMode = "idle"; // idle | brief | stageReady | running | recall
let sessionStages = [];
let currentStageIndex = 0;
let writtenText = "";
let timerIntervalId;
let timerDeadline = 0;
let timerPaused = false;
let remainingMsAtPause = 0;
let currentStageDurationSeconds = 0;

// Quiz / review state
let quizContext = "session"; // "session" | "review"
let currentQuestion = null;
let quizStartTs = 0;
let quizPendingGrade = 2;
let quizPendingCorrect = false;
let reviewQueue = [];
let reviewPos = 0;
let reviewScore = 0;
let reviewTotal = 0;
let matchSet = [];
let matchSelected = null;
let matchRemaining = 0;
let matchErrored = null;

let store = freshStore();
let settings = freshSettings();

/* ---------------------------------------------------------------------------
 * Storage helpers.
 * ------------------------------------------------------------------------- */
function safeGet(key) {
  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

function safeSet(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch (error) {
    /* ignore */
  }
}

function clampInt(value, min, max) {
  const n = Math.round(Number(value));
  if (Number.isNaN(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function freshSettings() {
  return { preset: "std", customStudy: 20, customPresent: 2, writtenRecall: false, quizGrade: false };
}

function loadSettings() {
  const raw = safeGet(SETTINGS_KEY);
  if (!raw) return freshSettings();
  try {
    const parsed = JSON.parse(raw);
    const base = freshSettings();
    const preset = ["fast", "std", "pomodoro", "custom"].includes(parsed.preset)
      ? parsed.preset
      : "std";
    return {
      preset,
      customStudy: clampInt(parsed.customStudy ?? base.customStudy, CUSTOM_STUDY_MIN, CUSTOM_STUDY_MAX),
      customPresent: clampInt(parsed.customPresent ?? base.customPresent, CUSTOM_PRESENT_MIN, CUSTOM_PRESENT_MAX),
      writtenRecall: Boolean(parsed.writtenRecall),
      quizGrade: Boolean(parsed.quizGrade),
    };
  } catch (error) {
    return freshSettings();
  }
}

function saveSettings() {
  safeSet(SETTINGS_KEY, JSON.stringify(settings));
}

function freshCard() {
  return { seen: 0, reps: 0, lapses: 0, ease: 2.5, interval: 0, due: 0, lastGrade: -1 };
}

function freshStore() {
  return {
    version: STORE_VERSION,
    spinCounter: 0,
    cards: Array.from({ length: N }, freshCard),
    stats: {
      goal: 3,
      todayDate: "",
      todayCount: 0,
      lastStudyDate: "",
      streak: 0,
      totalGrades: 0,
      goodGrades: 0,
    },
  };
}

function loadStore() {
  const raw = safeGet(STORE_KEY);
  if (!raw) return freshStore();
  try {
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      parsed.version === STORE_VERSION &&
      Array.isArray(parsed.cards) &&
      parsed.stats
    ) {
      const base = freshStore();
      // Keep existing cards by index; pad new concepts, drop removed ones.
      const cards = Array.from({ length: N }, (_, i) => ({
        ...freshCard(),
        ...(parsed.cards[i] || {}),
      }));
      return {
        version: STORE_VERSION,
        spinCounter: Number(parsed.spinCounter) || 0,
        cards,
        stats: { ...base.stats, ...parsed.stats },
      };
    }
  } catch (error) {
    /* fall through */
  }
  return freshStore();
}

function saveStore() {
  safeSet(STORE_KEY, JSON.stringify(store));
}

/* ---------------------------------------------------------------------------
 * Date helpers for streaks.
 * ------------------------------------------------------------------------- */
function dateKey(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function prevDateKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - 1);
  return dateKey(date.getTime());
}

/* ---------------------------------------------------------------------------
 * Spaced-repetition scheduler (SM-2-lite). computeSchedule is pure.
 * Grades: 0 again, 1 hard, 2 good, 3 easy.
 * ------------------------------------------------------------------------- */
function computeSchedule(card, grade) {
  if (grade === 0) {
    return {
      reps: 0,
      lapses: card.lapses + 1,
      ease: Math.max(1.3, card.ease - 0.2),
      interval: 0,
      days: 0,
    };
  }

  let ease = card.ease;
  if (grade === 1) ease -= 0.15;
  if (grade === 3) ease += 0.15;
  ease = Math.min(2.8, Math.max(1.3, ease));

  let days;
  if (card.reps === 0) {
    days = grade === 3 ? 3 : 1;
  } else if (card.reps === 1) {
    days = grade === 1 ? 3 : grade === 3 ? 6 : 4;
  } else {
    const mult = grade === 1 ? 1.2 : grade === 3 ? ease * 1.3 : ease;
    days = Math.max(1, Math.round(card.interval * mult));
  }

  return { reps: card.reps + 1, lapses: card.lapses, ease, interval: days, days };
}

function weightedPick(list, weightFn) {
  let total = 0;
  const weights = list.map((i) => {
    const w = Math.max(0.0001, weightFn(i));
    total += w;
    return w;
  });
  let ticket = Math.random() * total;
  for (let k = 0; k < list.length; k += 1) {
    ticket -= weights[k];
    if (ticket <= 0) return list[k];
  }
  return list[list.length - 1];
}

function selectWinner() {
  store.spinCounter += 1;
  const now = Date.now();
  const due = [];
  const fresh = [];

  for (let i = 0; i < N; i += 1) {
    if (i === lastWinnerIndex) continue;
    const card = store.cards[i];
    if (card.seen) {
      if (card.due <= now) due.push(i);
    } else {
      fresh.push(i);
    }
  }

  let winner;
  if (due.length) {
    winner = weightedPick(due, (i) => now - store.cards[i].due + DAY * 0.05 + 1);
  } else if (fresh.length) {
    winner = fresh[Math.floor(Math.random() * fresh.length)];
  } else {
    const pool = [];
    for (let i = 0; i < N; i += 1) {
      if (i !== lastWinnerIndex) pool.push(i);
    }
    pool.sort((a, b) => store.cards[a].due - store.cards[b].due);
    const topK = pool.slice(0, Math.min(5, pool.length));
    winner = topK[Math.floor(Math.random() * topK.length)];
  }

  if (winner === undefined) winner = Math.floor(Math.random() * N);
  saveStore();
  return winner;
}

function applyGrade(index, grade) {
  const card = store.cards[index];
  const sched = computeSchedule(card, grade);
  const now = Date.now();

  card.reps = sched.reps;
  card.lapses = sched.lapses;
  card.ease = sched.ease;
  card.interval = sched.interval;
  card.lastGrade = grade;
  card.seen = 1;
  card.due = grade === 0 ? now : now + sched.days * DAY;

  recordStudy(grade);
}

function gradeCurrent(grade) {
  if (currentWinnerIndex === null) return;
  applyGrade(currentWinnerIndex, grade);
  saveStore();
  goToIdle();
}

function recordStudy(grade) {
  const s = store.stats;
  const today = dateKey(Date.now());
  if (s.todayDate !== today) {
    s.streak = s.lastStudyDate === prevDateKey(today) ? (s.streak || 0) + 1 : 1;
    s.todayDate = today;
    s.todayCount = 0;
    s.lastStudyDate = today;
  }
  s.todayCount += 1;
  s.totalGrades = (s.totalGrades || 0) + 1;
  if (grade >= 2) s.goodGrades = (s.goodGrades || 0) + 1;
}

/* ---------------------------------------------------------------------------
 * Derived stats.
 * ------------------------------------------------------------------------- */
function seenCount() {
  return store.cards.reduce((sum, c) => sum + (c.seen ? 1 : 0), 0);
}

function dueCount() {
  const now = Date.now();
  return store.cards.reduce((sum, c) => sum + (c.seen && c.due <= now ? 1 : 0), 0);
}

function displayTodayCount() {
  const today = dateKey(Date.now());
  return store.stats.todayDate === today ? store.stats.todayCount : 0;
}

function displayStreak() {
  const today = dateKey(Date.now());
  const last = store.stats.lastStudyDate;
  if (last === today || last === prevDateKey(today)) return store.stats.streak || 0;
  return 0;
}

/* ---------------------------------------------------------------------------
 * i18n helpers.
 * ------------------------------------------------------------------------- */
function t() {
  return STRINGS[lang];
}

function conceptName(index) {
  return CONCEPT_DATA[index][lang].name;
}

function detectInitialLang() {
  const saved = safeGet(LANG_KEY);
  if (saved === "ru" || saved === "en") return saved;
  const nav = (navigator.language || "en").toLowerCase();
  return nav.startsWith("ru") ? "ru" : "en";
}

/* ---------------------------------------------------------------------------
 * Session timing resolution.
 * ------------------------------------------------------------------------- */
function resolveDurations() {
  if (settings.preset === "custom") {
    return {
      study: clampInt(settings.customStudy, CUSTOM_STUDY_MIN, CUSTOM_STUDY_MAX),
      present: clampInt(settings.customPresent, CUSTOM_PRESENT_MIN, CUSTOM_PRESENT_MAX),
    };
  }
  const p = PRESETS[settings.preset] || PRESETS.std;
  return { study: p.study, present: p.present };
}

function buildSessionStages() {
  const { study, present } = resolveDurations();
  const list = [{ key: "study", minutes: study }];
  if (settings.writtenRecall) list.push({ key: "write", minutes: WRITE_MINUTES });
  list.push({ key: "present", minutes: present });
  return list.map((s) => ({
    key: s.key,
    minutes: s.minutes,
    durationSeconds: s.minutes * 60,
    labelKey: s.key === "study" ? "studyLabel" : s.key === "write" ? "writeLabel" : "presentLabel",
  }));
}

/* ---------------------------------------------------------------------------
 * Settings UI.
 * ------------------------------------------------------------------------- */
function applySettingsUi() {
  presetChips.forEach((chip) => {
    chip.classList.toggle("is-active", chip.dataset.preset === settings.preset);
    chip.setAttribute("aria-pressed", String(chip.dataset.preset === settings.preset));
  });
  presetCustomChip.textContent = t().presetCustom;
  customRow.hidden = settings.preset !== "custom";
  customStudyEl.textContent = String(settings.customStudy);
  customPresentEl.textContent = String(settings.customPresent);
  customStudyLabelEl.textContent = t().customStudyLabel;
  customPresentLabelEl.textContent = t().customPresentLabel;
  writeToggleEl.classList.toggle("is-active", settings.writtenRecall);
  writeToggleEl.setAttribute("aria-pressed", String(settings.writtenRecall));
  writeToggleEl.setAttribute("aria-label", t().writeToggleAria);
  writeToggleLabelEl.textContent = t().writeToggle;
  checkToggleEl.classList.toggle("is-active", settings.quizGrade);
  checkToggleEl.setAttribute("aria-pressed", String(settings.quizGrade));
  checkToggleEl.setAttribute("aria-label", t().checkToggleAria);
  checkToggleLabelEl.textContent = t().checkToggle;
}

/* ---------------------------------------------------------------------------
 * Rendering.
 * ------------------------------------------------------------------------- */
function renderStats() {
  const goal = store.stats.goal || 3;
  statTodayEl.textContent = `${displayTodayCount()}/${goal}`;
  statStreakEl.textContent = String(displayStreak());
  statDueEl.textContent = String(dueCount());
  statStudiedEl.textContent = `${seenCount()}/${N}`;
  statGoalEl.classList.toggle("is-hit", displayTodayCount() >= goal && displayTodayCount() > 0);
  renderTestButton();
}

function renderTestButton() {
  const due = dueCount();
  testCountEl.textContent = String(due);
  testCountEl.hidden = due === 0;
  const enabled = seenCount() > 0;
  testButton.disabled = !enabled;
  testButton.classList.toggle("is-disabled", !enabled);
}

function renderBrief(index) {
  briefLabelEl.textContent = t().briefLabel;
  briefQuestionsEl.innerHTML = "";
  CONCEPT_DATA[index][lang].q.forEach((question) => {
    const li = document.createElement("li");
    li.textContent = question;
    briefQuestionsEl.appendChild(li);
  });
}

function renderGradePreviews(index) {
  const card = store.cards[index];
  gradeIntervalEls.forEach((el) => {
    const grade = Number(el.dataset.gradeInterval);
    const sched = computeSchedule(card, grade);
    el.textContent = sched.days > 0 ? t().interval(sched.days) : t().soon;
  });
}

function modulo(value, length) {
  return ((value % length) + length) % length;
}

function getUiMetrics() {
  const styles = getComputedStyle(document.documentElement);
  const visibleItems = Number.parseInt(styles.getPropertyValue("--visible-items"), 10);
  const itemHeight = Number.parseInt(styles.getPropertyValue("--item-height"), 10);
  return {
    visibleItems,
    itemHeight,
    focusIndex: Math.floor(visibleItems / 2),
    renderCount: visibleItems + bufferItems * 2,
  };
}

function getDisplayedWord(slotIndex) {
  const { focusIndex } = getUiMetrics();
  const conceptIndex = modulo(currentIndex + (slotIndex - focusIndex - bufferItems), N);
  return conceptName(conceptIndex);
}

function renderRoulette(winnerIndex = null) {
  const { focusIndex, itemHeight, renderCount } = getUiMetrics();
  windowElement.innerHTML = "";
  windowElement.style.transform = `translateY(${travelOffset - bufferItems * itemHeight}px)`;

  for (let slotIndex = 0; slotIndex < renderCount; slotIndex += 1) {
    const word = getDisplayedWord(slotIndex);
    const item = document.createElement("div");
    item.className = "roulette-item";
    item.textContent = word;
    if (slotIndex === focusIndex + bufferItems) {
      item.classList.add("is-focused");
      if (winnerIndex !== null && word === conceptName(winnerIndex)) {
        item.classList.add("is-winning");
      }
    }
    windowElement.appendChild(item);
  }
}

/* ---------------------------------------------------------------------------
 * Audio.
 * ------------------------------------------------------------------------- */
function ensureAudio() {
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) return;
  if (!audioContext) audioContext = new AudioCtor();
  if (audioContext.state === "suspended") audioContext.resume();
}

function playTick(intensity = 1) {
  if (!soundEnabled || !audioContext) return;
  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  const clamped = Math.max(0.32, Math.min(intensity, 1));
  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(920 - 280 * (1 - clamped), now);
  oscillator.frequency.exponentialRampToValueAtTime(520, now + 0.038);
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(0.05 * clamped, now + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.05);
}

function playWinTone() {
  if (!soundEnabled || !audioContext) return;
  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(440, now);
  oscillator.frequency.linearRampToValueAtTime(660, now + 0.12);
  oscillator.frequency.linearRampToValueAtTime(880, now + 0.28);
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(0.09, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.48);
}

/* ---------------------------------------------------------------------------
 * Timer / stages.
 * ------------------------------------------------------------------------- */
function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function updateTimerDisplay(totalSeconds) {
  timerValueEl.textContent = formatTime(totalSeconds);
}

function updateTimerProgress(progress) {
  orbEl.style.setProperty("--timer-progress", String(progress));
}

function prepOrb(stageIndex) {
  const stage = sessionStages[stageIndex];
  updateTimerDisplay(stage.durationSeconds);
  updateTimerProgress(1);
  timerStageEl.textContent = t()[stage.labelKey];
  orbEl.classList.remove("is-running", "is-finished", "is-paused");
}

function stopTimer() {
  if (timerIntervalId) {
    window.clearInterval(timerIntervalId);
    timerIntervalId = undefined;
  }
}

function startStage(stageIndex) {
  currentStageIndex = stageIndex;
  const stage = sessionStages[stageIndex];
  currentStageDurationSeconds = stage.durationSeconds;
  timerPaused = false;
  stopTimer();
  timerDeadline = Date.now() + currentStageDurationSeconds * 1000;
  updateTimerDisplay(currentStageDurationSeconds);
  updateTimerProgress(1);
  timerStageEl.textContent = t()[stage.labelKey];
  orbEl.classList.remove("is-finished", "is-paused");
  orbEl.classList.add("is-running");
  if (stage.key === "write") writeAreaEl.value = writtenText || "";
  setMode("running");
  if (stage.key === "write") window.setTimeout(() => writeAreaEl.focus(), 0);
  timerIntervalId = window.setInterval(timerTick, 250);
}

function timerTick() {
  const remaining = Math.max(0, Math.ceil((timerDeadline - Date.now()) / 1000));
  updateTimerDisplay(remaining);
  updateTimerProgress(currentStageDurationSeconds ? remaining / currentStageDurationSeconds : 0);
  if (remaining > 0) return;
  stopTimer();
  orbEl.classList.remove("is-running");
  playWinTone();
  advanceStage();
}

function advanceStage() {
  const stage = sessionStages[currentStageIndex];
  if (stage.key === "write") writtenText = writeAreaEl.value.trim();
  if (currentStageIndex < sessionStages.length - 1) {
    enterStageReady(currentStageIndex + 1);
  } else if (settings.quizGrade) {
    enterSessionQuiz();
  } else {
    enterRecall();
  }
}

function finishStageEarly() {
  if (currentMode !== "running") return;
  stopTimer();
  orbEl.classList.remove("is-running");
  advanceStage();
}

function pauseTimer() {
  if (currentMode !== "running" || timerPaused) return;
  timerPaused = true;
  stopTimer();
  remainingMsAtPause = Math.max(0, timerDeadline - Date.now());
  orbEl.classList.add("is-paused");
  timerStageEl.textContent = t().paused;
}

function resumeTimer() {
  if (!timerPaused) return;
  timerPaused = false;
  timerDeadline = Date.now() + remainingMsAtPause;
  orbEl.classList.remove("is-paused");
  timerStageEl.textContent = t()[sessionStages[currentStageIndex].labelKey];
  timerIntervalId = window.setInterval(timerTick, 250);
}

function toggleTimerPause() {
  if (currentMode !== "running") return;
  if (timerPaused) resumeTimer();
  else pauseTimer();
}

/* ---------------------------------------------------------------------------
 * View / mode machine.
 * ------------------------------------------------------------------------- */
function applySessionSubview(mode) {
  const stage = sessionStages[currentStageIndex];
  const isRunning = mode === "running";
  const isWriteRunning = isRunning && stage && stage.key === "write";

  briefEl.hidden = mode !== "brief";
  stagePromptEl.hidden = mode !== "stageReady";
  orbEl.hidden = !(isRunning || mode === "stageReady");
  writeAreaEl.hidden = !isWriteRunning;
  timerHintEl.hidden = !(isRunning && !isWriteRunning);

  // The start button shows on ready screens; while running it hides, except the
  // write stage keeps a "Done" button to finish early.
  if (isWriteRunning) {
    sessionButton.hidden = false;
    sessionButton.textContent = t().done;
  } else {
    sessionButton.hidden = isRunning;
  }
}

function setMode(mode) {
  currentMode = mode;
  const view =
    mode === "idle" ? "idle"
    : mode === "recall" ? "recall"
    : mode === "quiz" ? "quiz"
    : mode === "match" ? "match"
    : mode === "summary" ? "summary"
    : "session";

  viewIdle.hidden = view !== "idle";
  viewSession.hidden = view !== "session";
  viewRecall.hidden = view !== "recall";
  viewQuiz.hidden = view !== "quiz";
  viewMatch.hidden = view !== "match";
  viewSummary.hidden = view !== "summary";
  appShell.dataset.mode = mode;

  if (view === "session") applySessionSubview(mode);
}

/* ---------------------------------------------------------------------------
 * Session flow.
 * ------------------------------------------------------------------------- */
function enterBrief(index) {
  sessionStages = buildSessionStages();
  currentStageIndex = 0;
  writtenText = "";
  writeAreaEl.value = "";
  sessionConceptEl.textContent = conceptName(index);
  renderBrief(index);
  prepOrb(0);
  sessionButton.textContent = t().startN(sessionStages[0].minutes);
  sessionButton.disabled = false;
  setMode("brief");
}

function enterStageReady(index) {
  currentStageIndex = index;
  const stage = sessionStages[index];
  prepOrb(index);
  stagePromptEl.textContent = stage.key === "write" ? t().writePrompt : t().presentPrompt;
  sessionButton.textContent = t().startN(stage.minutes);
  sessionButton.disabled = false;
  setMode("stageReady");
}

function enterRecall() {
  const index = currentWinnerIndex;
  recallConceptEl.textContent = conceptName(index);
  recallDefTextEl.textContent = CONCEPT_DATA[index][lang].def;
  if (writtenText) {
    recallWrittenTextEl.textContent = writtenText;
    recallWrittenEl.hidden = false;
  } else {
    recallWrittenEl.hidden = true;
  }
  renderGradePreviews(index);
  setMode("recall");
}

function goToIdle() {
  stopTimer();
  timerPaused = false;
  orbEl.classList.remove("is-running", "is-finished", "is-paused");
  resultText.textContent =
    currentWinnerIndex !== null ? conceptName(currentWinnerIndex) : t().resultIdle;
  spinButton.disabled = false;
  spinButton.textContent = currentWinnerIndex !== null ? t().spinAgain : t().spinStart;
  renderStats();
  renderRoulette();
  setMode("idle");
}

/* ---------------------------------------------------------------------------
 * Spin.
 * ------------------------------------------------------------------------- */
function advanceSteps(stepCount, progressRatio) {
  for (let step = 0; step < stepCount; step += 1) {
    currentIndex = modulo(currentIndex - 1, N);
    playTick(1 - progressRatio * 0.45);
  }
}

function finishSpin(winnerIndex) {
  currentIndex = winnerIndex;
  travelOffset = 0;
  currentWinnerIndex = winnerIndex;

  renderRoulette(winnerIndex);
  resultText.textContent = conceptName(winnerIndex);
  resultPanelEl.classList.remove("is-winning");
  void resultPanelEl.offsetWidth;
  resultPanelEl.classList.add("is-winning");

  playWinTone();
  isSpinning = false;
  spinButton.disabled = false;
  spinButton.textContent = t().spinAgain;
  enterBrief(winnerIndex);
}

function spin() {
  if (isSpinning) return;

  ensureAudio();
  isSpinning = true;
  spinButton.disabled = true;
  spinButton.textContent = t().spinProcessing;
  resultText.textContent = t().resultExploring;

  lastWinnerIndex = currentWinnerIndex;
  const { itemHeight } = getUiMetrics();
  const winnerIndex = selectWinner();
  const startIndex = currentIndex;
  const downwardDistance = modulo(startIndex - winnerIndex, N);
  const loops = prefersReducedMotion ? 1 : 3;
  const totalSteps = N * loops + downwardDistance;
  const totalDistance = totalSteps * itemHeight;
  const duration = prefersReducedMotion ? 900 : 4600;
  const start = performance.now();
  let completedSteps = 0;

  function animate(frame) {
    const progress = Math.min((frame - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const traveledDistance = eased * totalDistance;
    const nextCompletedSteps = Math.floor(traveledDistance / itemHeight);

    if (nextCompletedSteps > completedSteps) {
      advanceSteps(nextCompletedSteps - completedSteps, progress);
      completedSteps = nextCompletedSteps;
    }

    travelOffset = traveledDistance - completedSteps * itemHeight;
    renderRoulette();

    if (progress < 1) {
      requestAnimationFrame(animate);
      return;
    }
    finishSpin(winnerIndex);
  }

  requestAnimationFrame(animate);
}

/* ---------------------------------------------------------------------------
 * Quiz engine — objective testing that auto-grades into the SRS.
 * Formats: mcq-def (concept -> definition), mcq-name (definition -> concept),
 * cloze (type the concept name from its definition).
 * ------------------------------------------------------------------------- */
function shuffleInPlace(arr) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickDistractors(correctIndex, n) {
  const pool = [];
  for (let i = 0; i < N; i += 1) if (i !== correctIndex) pool.push(i);
  shuffleInPlace(pool);
  return pool.slice(0, n);
}

function makeQuestion(index) {
  const formats = ["mcq-def", "mcq-name", "cloze"];
  const format = formats[Math.floor(Math.random() * formats.length)];
  if (format === "cloze") {
    return { format, index, prompt: CONCEPT_DATA[index][lang].def, answerName: conceptName(index) };
  }
  const optionIdx = shuffleInPlace([index, ...pickDistractors(index, 3)]);
  const correctPos = optionIdx.indexOf(index);
  const options =
    format === "mcq-def"
      ? optionIdx.map((i) => CONCEPT_DATA[i][lang].def)
      : optionIdx.map((i) => conceptName(i));
  const prompt = format === "mcq-def" ? conceptName(index) : CONCEPT_DATA[index][lang].def;
  return { format, index, prompt, options, correctPos };
}

function normalizeText(s) {
  return (s || "")
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i += 1) {
    const curr = [i];
    for (let j = 1; j <= n; j += 1) {
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = curr;
  }
  return prev[n];
}

function clozeCorrect(input, answerName) {
  const a = normalizeText(input);
  const b = normalizeText(answerName);
  if (!a) return false;
  if (a === b) return true;
  return levenshtein(a, b) <= (b.length > 6 ? 2 : 1);
}

function gradeFromQuiz(correct, elapsedMs) {
  if (!correct) return 0;
  return elapsedMs <= 9000 ? 3 : 2;
}

function renderQuiz(question, progressText) {
  const instr =
    question.format === "mcq-def" ? t().quizInstructionDef
    : question.format === "mcq-name" ? t().quizInstructionName
    : t().quizInstructionCloze;
  quizInstructionEl.textContent = instr;
  quizPromptEl.textContent = question.prompt;
  quizProgressEl.hidden = !progressText;
  quizProgressEl.textContent = progressText || "";
  quizFeedbackEl.hidden = true;
  quizVerdictEl.classList.remove("is-correct", "is-wrong");
  quizNextBtn.hidden = true;

  if (question.format === "cloze") {
    quizOptionsEl.hidden = true;
    quizOptionsEl.innerHTML = "";
    quizClozeEl.hidden = false;
    quizInput.value = "";
    quizInput.disabled = false;
    quizCheckBtn.disabled = false;
    quizInput.setAttribute("placeholder", t().quizInputPlaceholder);
    quizCheckBtn.textContent = t().quizCheck;
    quizKbdHintEl.textContent = t().quizKeysCloze;
    window.setTimeout(() => quizInput.focus(), 0);
  } else {
    quizClozeEl.hidden = true;
    quizOptionsEl.hidden = false;
    quizOptionsEl.innerHTML = "";
    question.options.forEach((text, pos) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "quiz-option";
      btn.dataset.pos = String(pos);
      const key = document.createElement("span");
      key.className = "quiz-key";
      key.textContent = String(pos + 1);
      const label = document.createElement("span");
      label.className = "quiz-option-text";
      label.textContent = text;
      btn.append(key, label);
      quizOptionsEl.appendChild(btn);
    });
    quizKbdHintEl.textContent = t().quizKeysMcq;
    // Avoid a stale focused button catching Space/Enter as an answer.
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  }
}

function resolveQuiz(correct) {
  const q = currentQuestion;
  quizPendingCorrect = correct;
  quizPendingGrade = gradeFromQuiz(correct, Date.now() - quizStartTs);

  quizVerdictEl.textContent = correct ? t().quizCorrect : t().quizWrong;
  quizVerdictEl.classList.toggle("is-correct", correct);
  quizVerdictEl.classList.toggle("is-wrong", !correct);
  quizAnswerEl.textContent = t().quizAnswerWas(conceptName(q.index));
  quizDefEl.textContent = CONCEPT_DATA[q.index][lang].def;
  quizFeedbackEl.hidden = false;
  quizNextBtn.textContent = t().next;
  quizNextBtn.hidden = false;
  quizKbdHintEl.textContent = t().quizKeysNext;

  if (q.format === "cloze") {
    quizInput.disabled = true;
    quizCheckBtn.disabled = true;
  } else {
    Array.from(quizOptionsEl.children).forEach((btn) => {
      const pos = Number(btn.dataset.pos);
      btn.disabled = true;
      if (pos === q.correctPos) btn.classList.add("is-correct");
      else if (btn.classList.contains("is-chosen")) btn.classList.add("is-wrong");
    });
  }

  window.setTimeout(() => quizNextBtn.focus(), 0);
}

function onQuizOption(pos) {
  const q = currentQuestion;
  if (!q || q.format === "cloze") return;
  const btn = quizOptionsEl.querySelector(`[data-pos="${pos}"]`);
  if (btn) btn.classList.add("is-chosen");
  resolveQuiz(pos === q.correctPos);
}

function onQuizCheck() {
  const q = currentQuestion;
  if (!q || q.format !== "cloze") return;
  resolveQuiz(clozeCorrect(quizInput.value, q.answerName));
}

function onQuizNext() {
  if (quizContext === "review") {
    applyGrade(currentQuestion.index, quizPendingGrade);
    if (quizPendingCorrect) reviewScore += 1;
    saveStore();
    reviewPos += 1;
    nextReviewQuestion();
  } else {
    gradeCurrent(quizPendingGrade);
  }
}

function enterSessionQuiz() {
  quizContext = "session";
  currentQuestion = makeQuestion(currentWinnerIndex);
  quizStartTs = Date.now();
  renderQuiz(currentQuestion, null);
  setMode("quiz");
}

/* ---------------------------------------------------------------------------
 * Review ("Тест") — quiz the due cards in a batch, then a score summary.
 * ------------------------------------------------------------------------- */
function reviewableList() {
  const now = Date.now();
  const due = [];
  for (let i = 0; i < N; i += 1) {
    const c = store.cards[i];
    if (c.seen && c.due <= now) due.push(i);
  }
  if (due.length) return due;
  const seen = [];
  for (let i = 0; i < N; i += 1) if (store.cards[i].seen) seen.push(i);
  seen.sort((a, b) => store.cards[a].due - store.cards[b].due);
  return seen;
}

function startReview() {
  const list = reviewableList();
  if (!list.length) return;
  shuffleInPlace(list);
  const batch = list.slice(0, 12);
  reviewScore = 0;
  reviewTotal = batch.length;
  if (batch.length >= 4) {
    matchSet = batch.slice(0, Math.min(6, batch.length));
    reviewQueue = batch.slice(matchSet.length);
    reviewPos = 0;
    startMatch();
  } else {
    matchSet = [];
    reviewQueue = batch;
    reviewPos = 0;
    nextReviewQuestion();
  }
}

function nextReviewQuestion() {
  if (reviewPos >= reviewQueue.length) {
    enterSummary();
    return;
  }
  quizContext = "review";
  currentQuestion = makeQuestion(reviewQueue[reviewPos]);
  quizStartTs = Date.now();
  renderQuiz(currentQuestion, `${matchSet.length + reviewPos + 1} / ${reviewTotal}`);
  setMode("quiz");
}

function enterSummary() {
  summaryScoreEl.textContent = t().summaryScore(reviewScore, reviewTotal);
  summarySubEl.textContent = t().summarySub(reviewScore, reviewTotal);
  setMode("summary");
  window.setTimeout(() => summaryDoneBtn.focus(), 0);
}

/* ---------------------------------------------------------------------------
 * Matching round — pair concepts with their definitions.
 * ------------------------------------------------------------------------- */
function renderMatch() {
  matchInstructionEl.textContent = t().matchInstruction;
  matchContinueBtn.hidden = true;
  matchContinueBtn.textContent = t().next;

  matchConceptsEl.innerHTML = "";
  matchSet.forEach((idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "match-item match-concept";
    btn.textContent = conceptName(idx);
    btn.dataset.index = String(idx);
    matchConceptsEl.appendChild(btn);
  });

  matchDefsEl.innerHTML = "";
  shuffleInPlace(matchSet.slice()).forEach((idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "match-item match-def";
    btn.textContent = CONCEPT_DATA[idx][lang].def;
    btn.dataset.index = String(idx);
    matchDefsEl.appendChild(btn);
  });
}

function startMatch() {
  matchSelected = null;
  matchErrored = new Set();
  matchRemaining = matchSet.length;
  renderMatch();
  setMode("match");
}

function onMatchClick(el) {
  if (el.classList.contains("is-matched")) return;

  if (el.classList.contains("match-concept")) {
    matchConceptsEl.querySelectorAll(".is-selected").forEach((x) => x.classList.remove("is-selected"));
    matchSelected = Number(el.dataset.index);
    el.classList.add("is-selected");
    return;
  }

  if (matchSelected === null) return;
  const defIdx = Number(el.dataset.index);
  const conceptBtn = matchConceptsEl.querySelector(`.match-concept[data-index="${matchSelected}"]`);

  if (defIdx === matchSelected) {
    el.classList.add("is-matched");
    el.disabled = true;
    if (conceptBtn) {
      conceptBtn.classList.add("is-matched");
      conceptBtn.classList.remove("is-selected");
      conceptBtn.disabled = true;
    }
    matchRemaining -= 1;
    matchSelected = null;
    if (matchRemaining <= 0) {
      matchContinueBtn.hidden = false;
      window.setTimeout(() => matchContinueBtn.focus(), 0);
    }
  } else {
    matchErrored.add(matchSelected);
    const wrongConcept = matchSelected;
    el.classList.add("is-wrong");
    if (conceptBtn) conceptBtn.classList.add("is-wrong");
    matchSelected = null;
    window.setTimeout(() => {
      el.classList.remove("is-wrong");
      const cb = matchConceptsEl.querySelector(`.match-concept[data-index="${wrongConcept}"]`);
      if (cb) cb.classList.remove("is-wrong", "is-selected");
    }, 480);
  }
}

function finishMatch() {
  matchSet.forEach((idx) => {
    const clean = !matchErrored.has(idx);
    applyGrade(idx, clean ? 2 : 0);
    if (clean) reviewScore += 1;
  });
  saveStore();
  reviewPos = 0;
  nextReviewQuestion();
}

/* ---------------------------------------------------------------------------
 * Language application.
 * ------------------------------------------------------------------------- */
function updateSoundToggleUi() {
  soundToggleEl.textContent = soundEnabled ? "🔊" : "🔇";
  soundToggleEl.setAttribute("aria-pressed", String(soundEnabled));
  soundToggleEl.setAttribute("aria-label", soundEnabled ? t().soundOnLabel : t().soundOffLabel);
}

function applyLanguage(next) {
  lang = next;
  safeSet(LANG_KEY, lang);
  document.documentElement.lang = lang;
  const s = t();

  document.title = s.docTitle;
  heroTagEl.textContent = s.heroTag;
  heroTitleEl.innerHTML = s.heroTitle;
  heroSubtitleEl.textContent = s.heroSubtitle;
  resultLabelEl.textContent = s.resultLabel;
  kbdHintEl.textContent = s.kbdHint;
  resetButton.textContent = s.reset;
  writeAreaEl.setAttribute("placeholder", s.writePlaceholder);

  statTodayKeyEl.textContent = s.statToday;
  statStreakKeyEl.textContent = s.statStreak;
  statDueKeyEl.textContent = s.statDue;
  statStudiedKeyEl.textContent = s.statStudied;

  sessionTagEl.textContent = s.heroTag;
  sessionLabelEl.textContent = s.sessionLabel;
  backButton.textContent = s.back;
  backButton.setAttribute("aria-label", s.back.replace(/^[←\s]+/, ""));
  timerHintEl.textContent = s.timerHint;

  recallTagEl.textContent = s.heroTag;
  recallTitleEl.textContent = s.recallTitle;
  recallWrittenLabelEl.textContent = s.recallWrittenLabel;
  recallDefLabelEl.textContent = s.recallDefLabel;
  gradeLabelEls[0].textContent = s.gradeAgain;
  gradeLabelEls[1].textContent = s.gradeHard;
  gradeLabelEls[2].textContent = s.gradeGood;
  gradeLabelEls[3].textContent = s.gradeEasy;

  creditLinkEl.textContent = s.credit;

  langButtons.forEach((btn) => {
    const active = btn.dataset.lang === lang;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", String(active));
  });
  updateSoundToggleUi();
  applySettingsUi();
  renderStats();

  if (currentWinnerIndex !== null) {
    sessionConceptEl.textContent = conceptName(currentWinnerIndex);
    recallConceptEl.textContent = conceptName(currentWinnerIndex);
    recallDefTextEl.textContent = CONCEPT_DATA[currentWinnerIndex][lang].def;
    renderBrief(currentWinnerIndex);
    renderGradePreviews(currentWinnerIndex);
  }

  if (!isSpinning && currentMode === "idle") {
    resultText.textContent =
      currentWinnerIndex !== null ? conceptName(currentWinnerIndex) : s.resultIdle;
    spinButton.textContent = currentWinnerIndex !== null ? s.spinAgain : s.spinStart;
  }

  if (sessionStages.length) {
    if (currentMode === "brief") {
      sessionButton.textContent = s.startN(sessionStages[0].minutes);
    } else if (currentMode === "stageReady") {
      const stage = sessionStages[currentStageIndex];
      stagePromptEl.textContent = stage.key === "write" ? s.writePrompt : s.presentPrompt;
      sessionButton.textContent = s.startN(stage.minutes);
    } else if (currentMode === "running" && !timerPaused) {
      timerStageEl.textContent = s[sessionStages[currentStageIndex].labelKey];
      if (sessionStages[currentStageIndex].key === "write") sessionButton.textContent = s.done;
    }
  }

  testButtonLabelEl.textContent = s.testButton;
  summaryTitleEl.textContent = s.summaryTitle;
  summaryDoneBtn.textContent = s.done;
  quizBackBtn.textContent = s.back;
  matchBackBtn.textContent = s.back;
  quizCheckBtn.textContent = s.quizCheck;
  quizInput.setAttribute("placeholder", s.quizInputPlaceholder);

  if (currentMode === "quiz" && currentQuestion) {
    const prog = quizProgressEl.hidden ? null : quizProgressEl.textContent;
    currentQuestion = makeQuestion(currentQuestion.index);
    quizStartTs = Date.now();
    renderQuiz(currentQuestion, prog);
  } else if (currentMode === "match") {
    startMatch();
  } else if (currentMode === "summary") {
    summaryScoreEl.textContent = s.summaryScore(reviewScore, reviewTotal);
    summarySubEl.textContent = s.summarySub(reviewScore, reviewTotal);
  }

  renderRoulette(currentMode !== "idle" ? currentWinnerIndex : null);
}

/* ---------------------------------------------------------------------------
 * Events.
 * ------------------------------------------------------------------------- */
function shouldIgnoreSpaceTrigger(target) {
  if (!(target instanceof HTMLElement)) return false;
  const selector = [
    "button", "input", "textarea", "select", "a",
    '[role="button"]', '[contenteditable="true"]',
  ].join(", ");
  return Boolean(target.closest(selector));
}

window.addEventListener("resize", () => {
  if (!isSpinning) {
    travelOffset = 0;
    renderRoulette(currentMode !== "idle" ? currentWinnerIndex : null);
  }
});

window.addEventListener("keydown", (event) => {
  // Quiz keyboard: 1–4 pick an option, Enter/Space advances feedback.
  if (currentMode === "quiz") {
    if (!quizNextBtn.hidden) {
      if (event.target === quizNextBtn) return; // let the button activate natively
      if (event.key === "Enter" || event.code === "Space") {
        event.preventDefault();
        onQuizNext();
      }
      return;
    }
    if (event.target === quizInput) return; // typing the cloze answer
    const q = currentQuestion;
    if (q && q.format !== "cloze" && event.key >= "1" && event.key <= "9") {
      const pos = Number(event.key) - 1;
      if (pos < q.options.length) {
        event.preventDefault();
        onQuizOption(pos);
      }
    }
    return;
  }

  if (event.code !== "Space" || shouldIgnoreSpaceTrigger(event.target)) return;
  event.preventDefault();
  if (currentMode === "idle") spin();
  else if (currentMode === "brief") startStage(0);
  else if (currentMode === "stageReady") startStage(currentStageIndex);
  else if (currentMode === "running") toggleTimerPause();
});

spinButton.addEventListener("click", spin);

sessionButton.addEventListener("click", () => {
  if (currentMode === "brief") startStage(0);
  else if (currentMode === "stageReady") startStage(currentStageIndex);
  else if (currentMode === "running") finishStageEarly();
});

orbEl.addEventListener("click", toggleTimerPause);
backButton.addEventListener("click", goToIdle);

gradeButtons.forEach((btn) => {
  btn.addEventListener("click", () => gradeCurrent(Number(btn.dataset.grade)));
});

resetButton.addEventListener("click", () => {
  store = freshStore();
  saveStore();
  currentWinnerIndex = null;
  lastWinnerIndex = null;
  goToIdle();
});

statGoalEl.addEventListener("click", () => {
  const current = store.stats.goal || 3;
  const idx = GOAL_CYCLE.indexOf(current);
  store.stats.goal = GOAL_CYCLE[(idx + 1) % GOAL_CYCLE.length];
  saveStore();
  renderStats();
});

presetChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    settings.preset = chip.dataset.preset;
    saveSettings();
    applySettingsUi();
  });
});

stepperEls.forEach((stepper) => {
  const field = stepper.dataset.field;
  const min = field === "study" ? CUSTOM_STUDY_MIN : CUSTOM_PRESENT_MIN;
  const max = field === "study" ? CUSTOM_STUDY_MAX : CUSTOM_PRESENT_MAX;
  const key = field === "study" ? "customStudy" : "customPresent";
  stepper.querySelector(".step-down").addEventListener("click", () => {
    settings[key] = clampInt(settings[key] - 1, min, max);
    saveSettings();
    applySettingsUi();
  });
  stepper.querySelector(".step-up").addEventListener("click", () => {
    settings[key] = clampInt(settings[key] + 1, min, max);
    saveSettings();
    applySettingsUi();
  });
});

writeToggleEl.addEventListener("click", () => {
  settings.writtenRecall = !settings.writtenRecall;
  saveSettings();
  applySettingsUi();
});

soundToggleEl.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  safeSet(SOUND_KEY, soundEnabled ? "on" : "off");
  if (soundEnabled) ensureAudio();
  updateSoundToggleUi();
});

langButtons.forEach((btn) => {
  btn.addEventListener("click", () => applyLanguage(btn.dataset.lang));
});

checkToggleEl.addEventListener("click", () => {
  settings.quizGrade = !settings.quizGrade;
  saveSettings();
  applySettingsUi();
});

testButton.addEventListener("click", () => {
  if (seenCount() > 0) startReview();
});

quizOptionsEl.addEventListener("click", (event) => {
  const btn = event.target.closest(".quiz-option");
  if (btn && !btn.disabled) onQuizOption(Number(btn.dataset.pos));
});
quizCheckBtn.addEventListener("click", onQuizCheck);
quizInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    if (!quizCheckBtn.disabled) onQuizCheck();
  }
});
quizNextBtn.addEventListener("click", onQuizNext);
quizBackBtn.addEventListener("click", goToIdle);

matchConceptsEl.addEventListener("click", (event) => {
  const btn = event.target.closest(".match-item");
  if (btn) onMatchClick(btn);
});
matchDefsEl.addEventListener("click", (event) => {
  const btn = event.target.closest(".match-item");
  if (btn) onMatchClick(btn);
});
matchContinueBtn.addEventListener("click", finishMatch);
matchBackBtn.addEventListener("click", goToIdle);
summaryDoneBtn.addEventListener("click", goToIdle);

/* ---------------------------------------------------------------------------
 * Boot.
 * ------------------------------------------------------------------------- */
store = loadStore();
settings = loadSettings();
lang = detectInitialLang();
soundEnabled = safeGet(SOUND_KEY) !== "off";
applyLanguage(lang);
goToIdle();
resultText.textContent = currentWinnerIndex !== null ? conceptName(currentWinnerIndex) : t().resultIdle;

if (location.search.indexOf("debug") !== -1) {
  window.__fml = {
    get store() { return store; },
    get settings() { return settings; },
    get mode() { return currentMode; },
    get winner() { return currentWinnerIndex; },
    get stages() { return sessionStages; },
    get written() { return writtenText; },
    get question() { return currentQuestion; },
    get review() { return { pos: reviewPos, total: reviewTotal, score: reviewScore, queue: reviewQueue, matchSet }; },
    spin, startStage, enterRecall, enterSessionQuiz, gradeCurrent, selectWinner, computeSchedule,
    startReview, onQuizOption, onQuizCheck, onQuizNext, onMatchClick, finishMatch,
    clozeCorrect, makeQuestion,
    expireTimer() { timerDeadline = Date.now() - 1; timerTick(); },
  };
}
