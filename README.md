# 15 Minutes Later

Рулетка выбирает концепт. 15 минут разбираешь, минуту рассказываешь по памяти, ставишь себе оценку — и система решает, когда вернуть его снова. Тренажёр памяти и концентрации на русском и английском.

**Живая версия:** https://denisdrobyshev.github.io/15-minutes-later/

## Что это

Колесо крутит 80 концептов о памяти, внимании, мышлении и работе мозга и останавливается на одном. Дальше не «прочитал и забыл», а полный цикл. Смысл в ограничении: тема выбрана за тебя, время задано, отступать некуда.

## Цикл обучения

Память строится так: закодировать → вспомнить под нагрузкой → вернуть в нужный момент. Простое чтение делает только первый шаг. Здесь есть все три.

- **Бриф** — концепт и два наводящих вопроса. 15 минут получают направление, а не «читай что попало».
- **15 минут** — исследуешь тему.
- **1 минута** — рассказываешь вслух по памяти. Это активное припоминание: оно укрепляет память сильнее, чем перечитывание.
- **Оценка** — не помню / трудно / хорошо / легко.

## Планировщик

Оценка кормит планировщик в духе SM-2 — той же схемы, что у Anki. Интервал до следующего показа растёт с уверенностью: «легко» отодвигает концепт на дни вперёд, «не помню» возвращает его в ту же сессию. Предыдущий победитель исключается — два раза подряд один концепт не выпадет. Ещё до нажатия видно, через сколько вернётся каждый вариант. Всё состояние живёт в `localStorage` и переживает перезагрузку.

Это отличает тренажёр от рулетки: колесо не крутит случайное, а ведёт тебя по интервальному повторению.

## Тестирование

Самооценка субъективна. Включи «Проверку» в настройках — и в конце сессии вместо «оцени сам» появляется объективный вопрос: выбрать определение к концепту, выбрать концепт к определению или ввести название по определению. Результат сам ставит оценку планировщику: верно и быстро идёт как «легко», ошибка — как «не помню».

Кнопка «Тест» на главной — отдельный режим повторения. Он прогоняет карточки «к возврату» пачкой: сначала матчинг-сетка, потом вопросы, в конце — счёт. Варианты и определения берутся из самого набора, без бэкенда.

## Прогресс

Внизу — дневная цель (кликом меняется), стрик по дням, сколько концептов к возврату сегодня и сколько изучено из 80. То, ради чего возвращаешься.

## Языки

Русский и английский, переключатель в правом верхнем углу. Все 80 концептов, их определения и вопросы лежат параллельно с общими индексами — смена языка не меняет выбранный концепт, только его написание. Язык запоминается; по умолчанию берётся из браузера.

## Стек

Ванильные HTML, CSS и JavaScript, без зависимостей и сборки. Тёмная тема по `prefers-color-scheme`, анимации сокращаются по `prefers-reduced-motion`. Звук — на Web Audio, отключается. Хостинг — GitHub Pages.

## Запуск

Локально хватит любого статического сервера:

```bash
python -m http.server 8000
```

Открыть `http://localhost:8000`.

## Управление

- **Пробел** — крутить колесо, запускать этап, ставить таймер на паузу;
- **клик по таймеру** — пауза и продолжение.

---

# 15 Minutes Later (EN)

A roulette picks a concept. You research it for 15 minutes, recall it aloud for one, grade yourself — and the system decides when it comes back. A memory and concentration trainer in Russian and English.

**Live:** https://denisdrobyshev.github.io/15-minutes-later/

## The learning loop

Memory is built by encoding, then retrieving under load, then returning at the right moment. Plain reading only does the first step; this does all three.

- **Brief** — the concept and two guiding questions, so the 15 minutes have direction.
- **15 minutes** — research the topic.
- **1 minute** — recall it aloud from memory. Retrieval practice strengthens memory more than rereading.
- **Grade** — blank / hard / good / easy.

## The scheduler

Your grade feeds an SM-2-style scheduler, the same idea as Anki. The interval before a concept returns grows with confidence: "easy" pushes it days out, "blank" brings it back within the session. The previous winner is excluded, so nothing repeats twice in a row, and each button previews its next interval before you press it. State persists in `localStorage`. The wheel doesn't spin at random — it walks you through spaced repetition.

## Testing

Self-grading is subjective. Turn on "Check" in the settings and the end of a session becomes an objective question instead: pick the definition for a concept, pick the concept for a definition, or type the name from its definition. The result grades the scheduler for you — correct and fast counts as "easy", a miss as "blank".

The "Test" button on the home screen is a separate review mode: it runs your due cards in a batch — a matching grid first, then questions, then a score. Distractors and definitions come from the deck itself, no backend.

## Progress

A daily goal (click to change), a day streak, how many concepts are due today, and how many of the 80 you've studied.

## Languages

Russian and English, toggle in the top-right corner. Concepts, definitions, and questions are index-aligned across languages, so switching keeps the same concept — only its spelling changes.

## Stack

Vanilla HTML, CSS, and JavaScript — no dependencies, no build. Dark theme via `prefers-color-scheme`, reduced motion via `prefers-reduced-motion`, mutable Web Audio sound. Served on GitHub Pages.

## License

MIT — see [LICENSE](LICENSE). Idea inspired by the 15-minute focus format of [15-minutos-después](https://rubencastelar.github.io/15-minutos-despues/).
