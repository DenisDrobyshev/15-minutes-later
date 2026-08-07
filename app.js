"use strict";

/* ============================================================================
 * 15 Minutes Later — bilingual focus roulette
 *
 * A roulette picks a concept; you research it for 15 minutes, then present it
 * for 1 minute. Bilingual (RU / EN). See selectWinner() for the selection model
 * that replaces the original uniform Math.random() — it guarantees coverage and
 * spaces out repeats (spaced-repetition style), which is what a memory trainer
 * actually wants.
 * ==========================================================================*/

/* ---------------------------------------------------------------------------
 * Concepts — parallel arrays, index-aligned across languages so switching the
 * language keeps the same concept selected.
 * ------------------------------------------------------------------------- */
const CONCEPTS = {
  ru: [
    "Нейропластичность", "Закон притяжения", "Синхроничность", "Эффект бабочки",
    "Коллективное бессознательное", "Морфический резонанс", "Состояние потока",
    "Теория хаоса", "Родовая память", "Тени эго", "Осознанность",
    "Субъективная реальность", "Творческая энтропия", "Предвзятость подтверждения",
    "Расширенное восприятие", "Мысленная визуализация", "Ясность ума",
    "Подсознание", "Эмоциональный якорь", "Перепрограммирование ума",
    "Человеческий потенциал", "Согласованность ума", "Расширенное сознание",
    "Связь тела и разума", "Осознанное намерение", "Активная медитация",
    "Тренированная интуиция", "Архитектура мышления", "Тонкие поля",
    "Внутренняя алхимия", "Сакральная геометрия", "Субъективное время",
    "Клеточная память", "Символическая судьба", "Остаточная энергия",
    "Лиминальность", "Внутренний резонанс", "Расширенное присутствие",
    "Осознанный эфир", "Невидимые узоры", "Значимое совпадение",
    "Личная вибрация", "Трансмутация эмоций", "Символическое восприятие",
    "Внутренняя тишина", "Интуитивный порог", "Внутренний магнетизм",
    "Осознание-свидетель", "Эхо мысли", "Эмоциональная частота",
    "Внутреннее единство", "Тонкая связь", "Осознанная тайна",
    "Невидимый мост", "Интуитивная судьба", "Внутренний код",
    "Ментальная конвергенция", "Шестое чувство",
  ],
  en: [
    "Neuroplasticity", "Law of attraction", "Synchronicity", "Butterfly effect",
    "Collective unconscious", "Morphic resonance", "Flow state",
    "Chaos theory", "Ancestral memory", "Shadows of the ego", "Mindfulness",
    "Subjective reality", "Creative entropy", "Confirmation bias",
    "Expanded perception", "Mental visualization", "Mental clarity",
    "Subconscious mind", "Emotional anchoring", "Mental reprogramming",
    "Human potential", "Mental coherence", "Expanded consciousness",
    "Mind–body connection", "Conscious intention", "Active meditation",
    "Trained intuition", "Mental architecture", "Subtle fields",
    "Inner alchemy", "Sacred geometry", "Subjective time",
    "Cellular memory", "Symbolic destiny", "Residual energy",
    "Liminality", "Inner resonance", "Expanded presence",
    "Conscious ether", "Invisible patterns", "Meaningful coincidence",
    "Personal vibration", "Emotional transmutation", "Symbolic perception",
    "Mental silence", "Intuitive threshold", "Inner magnetism",
    "Witnessing awareness", "Echo of thought", "Emotional frequency",
    "Inner unity", "Subtle connection", "Conscious mystery",
    "Invisible bridge", "Intuitive destiny", "Inner code",
    "Mental convergence", "Sixth sense",
  ],
};

const CONCEPT_COUNT = CONCEPTS.en.length;

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
    progress: (seen, total) => `Изучено ${seen} из ${total}`,
    resetProgress: "Сбросить прогресс",
    sessionLabel: "Выбранный концепт",
    stage1Label: "15 минут исследования",
    stage1Button: "Начать 15 мин",
    stage2Label: "Презентация",
    stage2Button: "Начать 1 мин",
    sessionDone: "Сессия завершена",
    finish: "Завершить",
    back: "← Назад",
    credit: "Вдохновлено проектом 15-minutos-después — rubi_castelar",
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
    progress: (seen, total) => `Studied ${seen} of ${total}`,
    resetProgress: "Reset progress",
    sessionLabel: "Selected concept",
    stage1Label: "15 minutes of research",
    stage1Button: "Start 15 min",
    stage2Label: "Presentation",
    stage2Button: "Start 1 min",
    sessionDone: "Session complete",
    finish: "Finish",
    back: "← Back",
    credit: "Inspired by 15-minutos-después by rubi_castelar",
  },
};

const TIMER_STAGES = [
  { key: "focus", labelKey: "stage1Label", buttonKey: "stage1Button", durationSeconds: 15 * 60 },
  { key: "cooldown", labelKey: "stage2Label", buttonKey: "stage2Button", durationSeconds: 60 },
];

/* ---------------------------------------------------------------------------
 * DOM references.
 * ------------------------------------------------------------------------- */
const windowElement = document.getElementById("roulette-window");
const buttonElement = document.getElementById("spin-button");
const resultElement = document.getElementById("result-text");
const resultLabelElement = document.getElementById("result-label");
const resultPanelElement = document.querySelector(".result-panel");
const progressTextElement = document.getElementById("progress-text");
const resetProgressElement = document.getElementById("reset-progress");
const appShellElement = document.querySelector(".app-shell");
const heroElement = document.querySelector(".hero");
const heroTagElement = document.getElementById("hero-tag");
const heroTitleElement = document.getElementById("hero-title");
const heroSubtitleElement = document.getElementById("hero-subtitle");
const rouletteCardElement = document.querySelector(".roulette-card");
const footerElement = document.querySelector(".site-footer");
const creditLinkElement = document.getElementById("credit-link");
const sessionPanelElement = document.getElementById("session-panel");
const backButtonElement = document.getElementById("back-button");
const sessionTagElement = document.getElementById("session-tag");
const sessionLabelElement = document.getElementById("session-label");
const sessionConceptElement = document.getElementById("session-concept");
const sessionButtonElement = document.getElementById("session-button");
const timerOrbElement = document.getElementById("timer-orb");
const timerStageElement = document.getElementById("timer-stage");
const timerValueElement = document.getElementById("timer-value");
const langButtons = Array.from(document.querySelectorAll(".lang-button"));

/* ---------------------------------------------------------------------------
 * Config / state.
 * ------------------------------------------------------------------------- */
const bufferItems = 2;
const LANG_KEY = "fml.lang";
const MODEL_KEY = "fml.model.v1";
const MODEL_VERSION = 1;
// How many spins until a shown concept has fully "recovered" its weight.
const COVER_WINDOW = Math.min(CONCEPT_COUNT - 1, 14);
// Weight multiplier for concepts never shown yet — drives full coverage first.
const NOVELTY_BOOST = 3.5;
const EPSILON = 0.001;

const prefersReducedMotion =
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let lang = "ru";
let audioContext;
let isSpinning = false;
let currentIndex = 0;
let travelOffset = 0;
let timerIntervalId;
let timerDeadline = 0;
let currentWinnerIndex = null; // index of the last landed concept (no immediate repeat)
let currentMode = "idle";
let currentTimerStageIndex = 0;

let model = createFreshModel();

function createFreshModel() {
  return {
    version: MODEL_VERSION,
    spinCounter: 0,
    counts: new Array(CONCEPT_COUNT).fill(0),
    lastSpin: new Array(CONCEPT_COUNT).fill(-1),
  };
}

/* ---------------------------------------------------------------------------
 * Persistence helpers (fail-safe — private mode / disabled storage tolerated).
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

function loadModel() {
  const raw = safeGet(MODEL_KEY);
  if (!raw) {
    return createFreshModel();
  }

  try {
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      parsed.version === MODEL_VERSION &&
      Array.isArray(parsed.counts) &&
      Array.isArray(parsed.lastSpin) &&
      parsed.counts.length === CONCEPT_COUNT &&
      parsed.lastSpin.length === CONCEPT_COUNT
    ) {
      return {
        version: MODEL_VERSION,
        spinCounter: Number(parsed.spinCounter) || 0,
        counts: parsed.counts.map((value) => Number(value) || 0),
        lastSpin: parsed.lastSpin.map((value) => Number(value)),
      };
    }
  } catch (error) {
    /* fall through to fresh model */
  }

  return createFreshModel();
}

function saveModel() {
  safeSet(MODEL_KEY, JSON.stringify(model));
}

/* ---------------------------------------------------------------------------
 * The selection model.
 *
 * The original picked winners with a flat Math.random(): every concept equally
 * likely every spin, so it repeats and clusters and never "covers the deck".
 * For a memory trainer that is the wrong incentive. This model instead scores
 * each candidate by three factors and draws proportionally to the score:
 *
 *   novelty   — concepts never shown get a strong boost, so the whole set is
 *               surfaced before anything repeats;
 *   recency   — a concept shown recently is suppressed and recovers linearly
 *               over COVER_WINDOW spins (spaced repetition);
 *   frequency — the more often a concept has been shown, the lower its weight,
 *               keeping the long-run distribution even.
 *
 * The immediately previous winner is excluded outright (never twice in a row).
 * All state persists in localStorage, so coverage survives reloads.
 * ------------------------------------------------------------------------- */
function conceptWeight(index) {
  if (index === currentWinnerIndex) {
    return 0; // no immediate repeat
  }

  const count = model.counts[index];
  const last = model.lastSpin[index];

  const novelty = count === 0 ? NOVELTY_BOOST : 1;

  let recency;
  if (last < 0) {
    recency = 1; // never shown — fully available
  } else {
    const since = model.spinCounter - last;
    recency = Math.max(0, Math.min(1, since / COVER_WINDOW));
  }

  const frequency = 1 / (1 + count);

  return novelty * recency * frequency + EPSILON;
}

function selectWinner() {
  model.spinCounter += 1;

  const weights = new Array(CONCEPT_COUNT);
  let total = 0;
  for (let i = 0; i < CONCEPT_COUNT; i += 1) {
    const weight = conceptWeight(i);
    weights[i] = weight;
    total += weight;
  }

  let winnerIndex;
  if (total <= 0) {
    // Degenerate fallback: uniform among everything but the last winner.
    do {
      winnerIndex = Math.floor(Math.random() * CONCEPT_COUNT);
    } while (winnerIndex === currentWinnerIndex && CONCEPT_COUNT > 1);
  } else {
    let ticket = Math.random() * total;
    winnerIndex = CONCEPT_COUNT - 1;
    for (let i = 0; i < CONCEPT_COUNT; i += 1) {
      ticket -= weights[i];
      if (ticket <= 0) {
        winnerIndex = i;
        break;
      }
    }
  }

  model.counts[winnerIndex] += 1;
  model.lastSpin[winnerIndex] = model.spinCounter;
  saveModel();

  return winnerIndex;
}

function seenCount() {
  return model.counts.reduce((sum, count) => sum + (count > 0 ? 1 : 0), 0);
}

function resetModel() {
  model = createFreshModel();
  saveModel();
  currentWinnerIndex = null;
  updateProgress();
}

/* ---------------------------------------------------------------------------
 * i18n.
 * ------------------------------------------------------------------------- */
function t() {
  return STRINGS[lang];
}

function detectInitialLang() {
  const saved = safeGet(LANG_KEY);
  if (saved === "ru" || saved === "en") {
    return saved;
  }
  const nav = (navigator.language || "en").toLowerCase();
  return nav.startsWith("ru") ? "ru" : "en";
}

function updateProgress() {
  progressTextElement.textContent = t().progress(seenCount(), CONCEPT_COUNT);
}

function applyLanguage(next) {
  lang = next;
  safeSet(LANG_KEY, lang);
  document.documentElement.lang = lang;

  const s = t();
  document.title = s.docTitle;
  heroTagElement.textContent = s.heroTag;
  heroTitleElement.innerHTML = s.heroTitle;
  heroSubtitleElement.textContent = s.heroSubtitle;
  resultLabelElement.textContent = s.resultLabel;
  resetProgressElement.textContent = s.resetProgress;
  sessionTagElement.textContent = s.heroTag;
  sessionLabelElement.textContent = s.sessionLabel;
  backButtonElement.textContent = s.back;
  backButtonElement.setAttribute("aria-label", s.back.replace(/^[←\s]+/, ""));
  creditLinkElement.textContent = s.credit;

  langButtons.forEach((btn) => {
    const active = btn.dataset.lang === lang;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-pressed", String(active));
  });

  // Re-render language-dependent content in whatever state we are in.
  updateProgress();

  if (currentWinnerIndex !== null && currentMode === "idle") {
    resultElement.textContent = CONCEPTS[lang][currentWinnerIndex];
  } else if (currentMode === "idle" && !isSpinning) {
    resultElement.textContent = s.resultIdle;
  }

  if (currentMode !== "idle" && currentWinnerIndex !== null) {
    sessionConceptElement.textContent = CONCEPTS[lang][currentWinnerIndex];
  }

  // Spin button label.
  if (!isSpinning) {
    buttonElement.textContent =
      currentWinnerIndex !== null ? s.spinAgain : s.spinStart;
  }

  syncTimerStageUi();
  renderRoulette(currentMode !== "idle" ? currentWinnerIndex : null);
}

/* ---------------------------------------------------------------------------
 * Roulette rendering.
 * ------------------------------------------------------------------------- */
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
  const conceptIndex = modulo(
    currentIndex + (slotIndex - focusIndex - bufferItems),
    CONCEPT_COUNT,
  );
  return CONCEPTS[lang][conceptIndex];
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
      if (winnerIndex !== null && word === CONCEPTS[lang][winnerIndex]) {
        item.classList.add("is-winning");
      }
    }

    windowElement.appendChild(item);
  }
}

/* ---------------------------------------------------------------------------
 * Audio feedback.
 * ------------------------------------------------------------------------- */
function ensureAudio() {
  const AudioCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtor) {
    return;
  }
  if (!audioContext) {
    audioContext = new AudioCtor();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
}

function playTick(intensity = 1) {
  if (!audioContext) {
    return;
  }
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
  if (!audioContext) {
    return;
  }
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
 * Timer / session.
 * ------------------------------------------------------------------------- */
function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function updateTimerDisplay(totalSeconds) {
  timerValueElement.textContent = formatTime(totalSeconds);
}

function updateTimerProgress(progress) {
  timerOrbElement.style.setProperty("--timer-progress", String(progress));
}

function getCurrentTimerStage() {
  return TIMER_STAGES[currentTimerStageIndex];
}

function syncTimerStageUi() {
  const stage = getCurrentTimerStage();
  if (!stage) {
    return;
  }
  timerStageElement.textContent = t()[stage.labelKey];
  sessionButtonElement.textContent = t()[stage.buttonKey];
  updateTimerDisplay(stage.durationSeconds);
  updateTimerProgress(1);
}

function stopTimer() {
  if (timerIntervalId) {
    window.clearInterval(timerIntervalId);
    timerIntervalId = undefined;
  }
}

function setSessionMode(mode) {
  currentMode = mode;
  const sessionVisible = mode !== "idle";
  appShellElement.classList.toggle("is-idle", mode === "idle");
  appShellElement.classList.toggle("is-session", mode !== "idle");

  heroElement.hidden = sessionVisible;
  rouletteCardElement.hidden = sessionVisible;
  footerElement.hidden = sessionVisible;
  sessionPanelElement.hidden = !sessionVisible;
  sessionPanelElement.setAttribute("aria-hidden", String(!sessionVisible));

  if (!sessionVisible) {
    sessionPanelElement.classList.remove("is-visible");
    return;
  }

  requestAnimationFrame(() => {
    sessionPanelElement.classList.add("is-visible");
  });
}

function enterSessionMode(winnerIndex) {
  currentTimerStageIndex = 0;
  sessionConceptElement.textContent = CONCEPTS[lang][winnerIndex];
  timerOrbElement.classList.remove("is-running", "is-finished");
  sessionButtonElement.hidden = false;
  sessionButtonElement.disabled = false;
  syncTimerStageUi();
  setSessionMode("ready");
}

function startTimer() {
  const stage = getCurrentTimerStage();
  if (!stage) {
    return;
  }

  const durationSeconds = stage.durationSeconds;
  stopTimer();
  timerDeadline = Date.now() + durationSeconds * 1000;
  updateTimerDisplay(durationSeconds);
  updateTimerProgress(1);
  timerOrbElement.classList.remove("is-finished");
  timerOrbElement.classList.add("is-running");
  sessionButtonElement.hidden = true;
  setSessionMode("running");

  timerIntervalId = window.setInterval(() => {
    const remainingSeconds = Math.max(0, Math.ceil((timerDeadline - Date.now()) / 1000));
    const progress = remainingSeconds / durationSeconds;

    updateTimerDisplay(remainingSeconds);
    updateTimerProgress(progress);

    if (remainingSeconds > 0) {
      return;
    }

    stopTimer();
    timerOrbElement.classList.remove("is-running");
    sessionButtonElement.hidden = false;
    sessionButtonElement.disabled = false;

    if (currentTimerStageIndex < TIMER_STAGES.length - 1) {
      currentTimerStageIndex += 1;
      syncTimerStageUi();
      setSessionMode("ready");
      return;
    }

    timerOrbElement.classList.add("is-finished");
    timerStageElement.textContent = t().sessionDone;
    sessionButtonElement.textContent = t().finish;
    setSessionMode("finished");
  }, 250);
}

/* ---------------------------------------------------------------------------
 * Spin flow.
 * ------------------------------------------------------------------------- */
function resetToInitialState() {
  stopTimer();
  travelOffset = 0;
  timerDeadline = 0;
  currentTimerStageIndex = 0;
  resultElement.textContent = t().resultIdle;
  timerOrbElement.classList.remove("is-running", "is-finished");
  sessionButtonElement.hidden = false;
  sessionButtonElement.disabled = false;
  syncTimerStageUi();
  buttonElement.disabled = false;
  buttonElement.textContent =
    currentWinnerIndex !== null ? t().spinAgain : t().spinStart;
  sessionPanelElement.classList.remove("is-visible");
  setSessionMode("idle");
  renderRoulette();
}

function advanceSteps(stepCount, progressRatio) {
  for (let step = 0; step < stepCount; step += 1) {
    currentIndex = modulo(currentIndex - 1, CONCEPT_COUNT);
    playTick(1 - progressRatio * 0.45);
  }
}

function finishSpin(winnerIndex) {
  currentIndex = winnerIndex;
  travelOffset = 0;
  currentWinnerIndex = winnerIndex;

  renderRoulette(winnerIndex);
  resultElement.textContent = CONCEPTS[lang][winnerIndex];
  resultPanelElement.classList.remove("is-winning");
  void resultPanelElement.offsetWidth;
  resultPanelElement.classList.add("is-winning");

  playWinTone();
  updateProgress();
  enterSessionMode(winnerIndex);
  buttonElement.disabled = false;
  buttonElement.textContent = t().spinAgain;
  isSpinning = false;
}

function spin() {
  if (isSpinning) {
    return;
  }

  ensureAudio();
  isSpinning = true;
  buttonElement.disabled = true;
  buttonElement.textContent = t().spinProcessing;
  resultElement.textContent = t().resultExploring;

  const { itemHeight } = getUiMetrics();
  const winnerIndex = selectWinner();
  const startIndex = currentIndex;
  const downwardDistance = modulo(startIndex - winnerIndex, CONCEPT_COUNT);
  // Fewer full turns and a shorter ride when the user prefers reduced motion.
  const loops = prefersReducedMotion ? 1 : 3;
  const totalSteps = CONCEPT_COUNT * loops + downwardDistance;
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
 * Events.
 * ------------------------------------------------------------------------- */
function shouldIgnoreSpaceTrigger(target) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }
  const interactiveSelector = [
    "button", "input", "textarea", "select", "a",
    '[role="button"]', '[contenteditable="true"]',
  ].join(", ");
  return Boolean(target.closest(interactiveSelector));
}

window.addEventListener("resize", () => {
  if (!isSpinning) {
    travelOffset = 0;
    renderRoulette(currentMode !== "idle" ? currentWinnerIndex : null);
  }
});

window.addEventListener("keydown", (event) => {
  if (event.code !== "Space" || shouldIgnoreSpaceTrigger(event.target)) {
    return;
  }
  event.preventDefault();
  if (currentMode === "ready") {
    startTimer();
    return;
  }
  if (currentMode === "finished") {
    resetToInitialState();
    return;
  }
  if (currentMode === "idle") {
    spin();
  }
});

sessionButtonElement.addEventListener("click", () => {
  if (currentMode === "ready") {
    startTimer();
    return;
  }
  if (currentMode === "finished") {
    resetToInitialState();
  }
});

backButtonElement.addEventListener("click", resetToInitialState);
buttonElement.addEventListener("click", spin);

resetProgressElement.addEventListener("click", () => {
  resetModel();
  if (currentMode === "idle" && !isSpinning) {
    resultElement.textContent = t().resultIdle;
    buttonElement.textContent = t().spinStart;
  }
});

langButtons.forEach((btn) => {
  btn.addEventListener("click", () => applyLanguage(btn.dataset.lang));
});

/* ---------------------------------------------------------------------------
 * Boot.
 * ------------------------------------------------------------------------- */
model = loadModel();
lang = detectInitialLang();
applyLanguage(lang);
setSessionMode("idle");
resultElement.textContent = t().resultIdle;
buttonElement.textContent = t().spinStart;
