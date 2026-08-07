"use strict";

/* ============================================================================
 * 15 Minutes Later — bilingual focus roulette with a spaced-repetition core.
 *
 * Loop: spin -> research brief (concept + guiding questions) -> 15-min study ->
 * 1-min recall aloud -> self-grade. The grade feeds an SM-2-lite scheduler that
 * decides when the concept comes back. Progress, streak, and stats persist in
 * localStorage. Concept data (names, definitions, questions) lives in
 * concepts.js as CONCEPT_DATA.
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
    heroSubtitle: "Рулетка выбирает концепт — у тебя 15 минут, чтобы в нём разобраться.",
    resultLabel: "Итоговый выбор",
    resultIdle: "Ожидание запуска",
    resultExploring: "Перебираю возможности…",
    spinStart: "Запустить поиск",
    spinProcessing: "Обработка…",
    spinAgain: "Крутить снова",
    kbdHint: "Пробел — крутить",
    reset: "Сброс",
    statToday: "Сегодня",
    statStreak: "Стрик",
    statDue: "К возврату",
    statStudied: "Изучено",
    sessionLabel: "Выбранный концепт",
    briefLabel: "С чего начать",
    studyLabel: "15 минут исследования",
    presentLabel: "Презентация",
    startStudy: "Начать 15 мин",
    startPresent: "Начать 1 мин",
    presentPrompt: "Теперь расскажи вслух по памяти — как будто объясняешь другому.",
    paused: "На паузе",
    timerHint: "Клик по таймеру — пауза",
    back: "← Назад",
    recallTitle: "Насколько хорошо вспомнил?",
    recallDefLabel: "Определение",
    gradeAgain: "Не помню",
    gradeHard: "Трудно",
    gradeGood: "Хорошо",
    gradeEasy: "Легко",
    soon: "скоро",
    interval: (days) => `через ${days} дн.`,
    soundOnLabel: "Звук включён",
    soundOffLabel: "Звук выключен",
    credit: "Вдохновлено проектом 15-minutos-después",
  },
  en: {
    docTitle: "15 Minutes Later · Focus Roulette",
    heroTag: "#15minuteslater",
    heroTitle: "Train your memory, focus<br />and neural connections.",
    heroSubtitle: "The roulette picks a concept — you get 15 minutes to explore it.",
    resultLabel: "Final selection",
    resultIdle: "Awaiting activation",
    resultExploring: "Exploring possibilities…",
    spinStart: "Start search",
    spinProcessing: "Processing…",
    spinAgain: "Spin again",
    kbdHint: "Space to spin",
    reset: "Reset",
    statToday: "Today",
    statStreak: "Streak",
    statDue: "Due",
    statStudied: "Studied",
    sessionLabel: "Selected concept",
    briefLabel: "Where to start",
    studyLabel: "15 minutes of research",
    presentLabel: "Presentation",
    startStudy: "Start 15 min",
    startPresent: "Start 1 min",
    presentPrompt: "Now recall it aloud from memory — as if explaining to someone.",
    paused: "Paused",
    timerHint: "Click the timer to pause",
    back: "← Back",
    recallTitle: "How well did you recall it?",
    recallDefLabel: "Definition",
    gradeAgain: "Blank",
    gradeHard: "Hard",
    gradeGood: "Good",
    gradeEasy: "Easy",
    soon: "soon",
    interval: (days) => `in ${days} d`,
    soundOnLabel: "Sound on",
    soundOffLabel: "Sound off",
    credit: "Inspired by 15-minutos-después",
  },
};

const TIMER_STAGES = [
  { key: "study", labelKey: "studyLabel", durationSeconds: 15 * 60 },
  { key: "present", labelKey: "presentLabel", durationSeconds: 60 },
];

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
const presentPromptEl = document.getElementById("present-prompt");
const orbEl = document.getElementById("timer-orb");
const timerStageEl = document.getElementById("timer-stage");
const timerValueEl = document.getElementById("timer-value");
const timerHintEl = document.getElementById("timer-hint");
const sessionButton = document.getElementById("session-button");

const recallTagEl = document.getElementById("recall-tag");
const recallTitleEl = document.getElementById("recall-title");
const recallConceptEl = document.getElementById("recall-concept");
const recallDefLabelEl = document.getElementById("recall-def-label");
const recallDefTextEl = document.getElementById("recall-def-text");
const gradeButtons = Array.from(document.querySelectorAll(".grade-button"));
const gradeLabelEls = Array.from(document.querySelectorAll(".grade-button .grade-label"));
const gradeIntervalEls = Array.from(document.querySelectorAll("[data-grade-interval]"));

const soundToggleEl = document.getElementById("sound-toggle");
const langButtons = Array.from(document.querySelectorAll(".lang-button"));

/* ---------------------------------------------------------------------------
 * Config / persistence keys.
 * ------------------------------------------------------------------------- */
const bufferItems = 2;
const LANG_KEY = "fml.lang";
const SOUND_KEY = "fml.sound";
const STORE_KEY = "fml.store.v1";
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
let currentMode = "idle"; // idle | brief | studying | presentReady | presenting | recall
let currentStageIndex = 0;
let timerIntervalId;
let timerDeadline = 0;
let timerPaused = false;
let remainingMsAtPause = 0;
let currentStageDurationSeconds = 0;

let store = freshStore();

/* ---------------------------------------------------------------------------
 * Storage helpers (fail-safe).
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
  if (!raw) {
    return freshStore();
  }
  try {
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      parsed.version === STORE_VERSION &&
      Array.isArray(parsed.cards) &&
      parsed.cards.length === N &&
      parsed.stats
    ) {
      const base = freshStore();
      return {
        version: STORE_VERSION,
        spinCounter: Number(parsed.spinCounter) || 0,
        cards: parsed.cards.map((c) => ({ ...freshCard(), ...c })),
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
 * Spaced-repetition scheduler (SM-2-lite).
 *
 * computeSchedule is pure: it returns the next card state for a grade without
 * mutating anything, so the recall screen can preview each button's interval.
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

/* ---------------------------------------------------------------------------
 * Selection model — review-first, then new, weighted by how overdue a card is.
 * The previous winner is excluded so nothing repeats twice in a row.
 * ------------------------------------------------------------------------- */
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

  if (winner === undefined) {
    winner = Math.floor(Math.random() * N);
  }

  saveStore();
  return winner;
}

function gradeCurrent(grade) {
  if (currentWinnerIndex === null) {
    return;
  }
  const card = store.cards[currentWinnerIndex];
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
  if (last === today || last === prevDateKey(today)) {
    return store.stats.streak || 0;
  }
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
 * Rendering.
 * ------------------------------------------------------------------------- */
function renderStats() {
  const goal = store.stats.goal || 3;
  statTodayEl.textContent = `${displayTodayCount()}/${goal}`;
  statStreakEl.textContent = String(displayStreak());
  statDueEl.textContent = String(dueCount());
  statStudiedEl.textContent = `${seenCount()}/${N}`;
  statGoalEl.classList.toggle("is-hit", displayTodayCount() >= goal && displayTodayCount() > 0);
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
 * Timer.
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
  const stage = TIMER_STAGES[stageIndex];
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
  const stage = TIMER_STAGES[stageIndex];
  currentStageDurationSeconds = stage.durationSeconds;
  timerPaused = false;
  stopTimer();
  timerDeadline = Date.now() + currentStageDurationSeconds * 1000;
  updateTimerDisplay(currentStageDurationSeconds);
  updateTimerProgress(1);
  timerStageEl.textContent = t()[stage.labelKey];
  orbEl.classList.remove("is-finished", "is-paused");
  orbEl.classList.add("is-running");
  setMode(stageIndex === 0 ? "studying" : "presenting");
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

  if (currentStageIndex === 0) {
    enterPresentReady();
  } else {
    enterRecall();
  }
}

function pauseTimer() {
  if (!(currentMode === "studying" || currentMode === "presenting") || timerPaused) return;
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
  timerStageEl.textContent = t()[TIMER_STAGES[currentStageIndex].labelKey];
  timerIntervalId = window.setInterval(timerTick, 250);
}

function toggleTimerPause() {
  if (!(currentMode === "studying" || currentMode === "presenting")) return;
  if (timerPaused) resumeTimer();
  else pauseTimer();
}

/* ---------------------------------------------------------------------------
 * View / mode machine.
 * ------------------------------------------------------------------------- */
function applySessionSubview(mode) {
  const showBrief = mode === "brief";
  const showPresentPrompt = mode === "presentReady";
  const showOrb = mode === "studying" || mode === "presenting" || mode === "presentReady";
  const running = mode === "studying" || mode === "presenting";
  briefEl.hidden = !showBrief;
  presentPromptEl.hidden = !showPresentPrompt;
  orbEl.hidden = !showOrb;
  timerHintEl.hidden = !running;
  sessionButton.hidden = running;
}

function setMode(mode) {
  currentMode = mode;
  const isIdle = mode === "idle";
  const isRecall = mode === "recall";
  const isSession = !isIdle && !isRecall;

  viewIdle.hidden = !isIdle;
  viewSession.hidden = !isSession;
  viewRecall.hidden = !isRecall;
  appShell.dataset.mode = mode;

  if (isSession) applySessionSubview(mode);
}

/* ---------------------------------------------------------------------------
 * Session flow.
 * ------------------------------------------------------------------------- */
function enterBrief(index) {
  currentStageIndex = 0;
  sessionConceptEl.textContent = conceptName(index);
  renderBrief(index);
  prepOrb(0);
  sessionButton.textContent = t().startStudy;
  sessionButton.disabled = false;
  setMode("brief");
}

function enterPresentReady() {
  currentStageIndex = 1;
  prepOrb(1);
  presentPromptEl.textContent = t().presentPrompt;
  sessionButton.textContent = t().startPresent;
  sessionButton.disabled = false;
  setMode("presentReady");
}

function enterRecall() {
  const index = currentWinnerIndex;
  recallConceptEl.textContent = conceptName(index);
  recallDefTextEl.textContent = CONCEPT_DATA[index][lang].def;
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

  statTodayKeyEl.textContent = s.statToday;
  statStreakKeyEl.textContent = s.statStreak;
  statDueKeyEl.textContent = s.statDue;
  statStudiedKeyEl.textContent = s.statStudied;

  sessionTagEl.textContent = s.heroTag;
  sessionLabelEl.textContent = s.sessionLabel;
  backButton.textContent = s.back;
  backButton.setAttribute("aria-label", s.back.replace(/^[←\s]+/, ""));
  presentPromptEl.textContent = s.presentPrompt;
  timerHintEl.textContent = s.timerHint;

  recallTagEl.textContent = s.heroTag;
  recallTitleEl.textContent = s.recallTitle;
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

  // Re-render language-dependent, state-aware content.
  renderStats();

  if (currentWinnerIndex !== null) {
    sessionConceptEl.textContent = conceptName(currentWinnerIndex);
    recallConceptEl.textContent = conceptName(currentWinnerIndex);
    recallDefTextEl.textContent = CONCEPT_DATA[currentWinnerIndex][lang].def;
    renderBrief(currentWinnerIndex);
    renderGradePreviews(currentWinnerIndex);
  }

  if (!isSpinning) {
    if (currentMode === "idle") {
      resultText.textContent =
        currentWinnerIndex !== null ? conceptName(currentWinnerIndex) : s.resultIdle;
      spinButton.textContent = currentWinnerIndex !== null ? s.spinAgain : s.spinStart;
    }
  }

  // Session button label reflects the current stage when not running.
  if (currentMode === "brief") sessionButton.textContent = s.startStudy;
  if (currentMode === "presentReady") sessionButton.textContent = s.startPresent;
  if (!timerPaused && (currentMode === "studying" || currentMode === "presenting")) {
    timerStageEl.textContent = s[TIMER_STAGES[currentStageIndex].labelKey];
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
  if (event.code !== "Space" || shouldIgnoreSpaceTrigger(event.target)) return;
  event.preventDefault();
  if (currentMode === "idle") {
    spin();
  } else if (currentMode === "brief") {
    startStage(0);
  } else if (currentMode === "presentReady") {
    startStage(1);
  } else if (currentMode === "studying" || currentMode === "presenting") {
    toggleTimerPause();
  }
});

spinButton.addEventListener("click", spin);

sessionButton.addEventListener("click", () => {
  if (currentMode === "brief") startStage(0);
  else if (currentMode === "presentReady") startStage(1);
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

soundToggleEl.addEventListener("click", () => {
  soundEnabled = !soundEnabled;
  safeSet(SOUND_KEY, soundEnabled ? "on" : "off");
  if (soundEnabled) ensureAudio();
  updateSoundToggleUi();
});

langButtons.forEach((btn) => {
  btn.addEventListener("click", () => applyLanguage(btn.dataset.lang));
});

/* ---------------------------------------------------------------------------
 * Boot.
 * ------------------------------------------------------------------------- */
store = loadStore();
lang = detectInitialLang();
soundEnabled = safeGet(SOUND_KEY) !== "off";
applyLanguage(lang);
goToIdle();
resultText.textContent = currentWinnerIndex !== null ? conceptName(currentWinnerIndex) : t().resultIdle;

if (location.search.indexOf("debug") !== -1) {
  window.__fml = {
    get store() { return store; },
    get mode() { return currentMode; },
    get winner() { return currentWinnerIndex; },
    spin, startStage, enterRecall, gradeCurrent, selectWinner, computeSchedule,
    expireTimer() { timerDeadline = Date.now() - 1; timerTick(); },
  };
}
