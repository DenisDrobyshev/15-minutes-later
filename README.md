# 15 Minutes Later

Рулетка выбирает концепт — у тебя 15 минут, чтобы в нём разобраться, и 1 минута, чтобы пересказать. Тренажёр памяти и концентрации на двух языках: русском и английском.

**Живая версия:** https://denisdrobyshev.github.io/15-minutes-later/

Это аналог проекта [15-minutos-después](https://rubencastelar.github.io/15-minutos-despues/) (rubi_castelar). Взяты идея и внешний вид; переписаны язык, модель выбора и часть поведения.

## Что это

Колесо прокручивает список из 58 концептов о сознании, психологии и нейронауке и останавливается на одном. Дальше начинается сессия: таймер на 15 минут исследования, потом на 1 минуту презентации. Тики и финальный тон — на Web Audio, без файлов.

Смысл не в рулетке, а в ограничении: тема выбрана за тебя, время задано, отступать некуда.

## Модель выбора

Главное отличие от оригинала. Там победитель берётся плоским `Math.random()`: каждый концепт равновероятен каждый раз. Для тренажёра памяти это плохой стимул — колесо повторяется, кучкуется и никогда не проходит весь набор.

Здесь выбор взвешенный. Каждый кандидат получает вес из трёх множителей:

- **новизна** — концепты, которые ещё не выпадали, получают буст, поэтому сначала показывается весь набор, а не одни и те же фавориты;
- **давность** — недавно показанный концепт подавляется и восстанавливается линейно за `COVER_WINDOW` прокруток: это разнесённое повторение;
- **частота** — чем чаще концепт уже выпадал, тем ниже его вес, чтобы распределение на длинной дистанции оставалось ровным.

Предыдущий победитель исключается полностью: два раза подряд один концепт не выпадет. Прогресс живёт в `localStorage`, поэтому покрытие переживает перезагрузку. Внизу видно «Изучено N из 58», рядом — сброс.

Итог: колесо ведёт тебя по всему набору, а не крутит любимые пять слов.

## Языки

Русский и английский, переключатель в правом верхнем углу. Все 58 концептов лежат параллельными массивами с одинаковыми индексами, поэтому смена языка не меняет выбранный концепт — только его написание. Выбранный язык запоминается; по умолчанию берётся из языка браузера.

## Стек

Ванильные HTML, CSS и JavaScript, без зависимостей и сборки. Шрифты — Space Grotesk и Syne. Тёмная тема включается по `prefers-color-scheme`, анимации сокращаются по `prefers-reduced-motion`.

## Запуск

Локально хватит любого статического сервера:

```bash
python -m http.server 8000
```

Открыть `http://localhost:8000`. Хостинг — GitHub Pages из ветки `main`.

## Управление

- **Пробел** — крутить колесо, запускать таймер этапа, завершать сессию;
- **Кнопки** делают то же самое мышью или касанием.

---

# 15 Minutes Later (EN)

A roulette picks a concept — you get 15 minutes to research it and 1 minute to present it. A memory and concentration trainer in two languages, Russian and English.

**Live:** https://denisdrobyshev.github.io/15-minutes-later/

An adaptation of [15-minutos-después](https://rubencastelar.github.io/15-minutos-despues/) by rubi_castelar: same idea and look, rewritten copy, selection model, and behaviour.

## The selection model

The main change from the original. There the winner came from a flat `Math.random()` — every concept equally likely every spin, so the wheel repeats, clusters, and never covers the deck. Wrong incentive for a memory trainer.

Here selection is weighted by three factors: **novelty** (unseen concepts get a boost, so the whole set surfaces first), **recency** (a recently shown concept is suppressed and recovers over `COVER_WINDOW` spins — spaced repetition), and **frequency** (the more often shown, the lower the weight, keeping the long-run distribution even). The previous winner is excluded outright, so nothing repeats twice in a row. State persists in `localStorage`, so coverage survives a reload.

## Languages

Russian and English, toggle in the top-right corner. All 58 concepts are index-aligned parallel arrays, so switching languages keeps the same concept — only its spelling changes. Your choice is remembered; the default follows the browser language.

## Stack

Vanilla HTML, CSS, and JavaScript — no dependencies, no build. Dark theme via `prefers-color-scheme`, reduced motion via `prefers-reduced-motion`. Served on GitHub Pages.

## License

MIT — see [LICENSE](LICENSE).
