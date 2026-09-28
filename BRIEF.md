# REVENUE VELOCITY — бриф для Claude Code (ветка "вирусный клип TLXJ")

Прочитай этот файл первым — здесь весь контекст, дальше просто продолжай работу, ничего переспрашивать не нужно.

## 🛑 СТОП-СИГНАЛ — прочитай перед тем, как что-либо генерить

Лирика ниже — **черновик**, ещё не подтверждена Петром финально. Не запускай генерацию трека, картинок, видео или рендер, пока Пётр явно не напишет что-то вроде "лирика утверждена, начинай" / "го" / "старт". До этого сигнала можно: читать референсы, готовить код движка, писать/дорабатывать сценарий и промпты, планировать — но не тратить генерации и не запускать полный прогон. Если непонятно, разрешение уже дано или нет — спроси прямо, не запускай по умолчанию.

## Контекст

Пётр (CMO TaleX) увидел вирусный AI-музыкальный клип **"Escape Velocity"** (18M просмотров за 12ч, репостнул Илон Маск). Автор (ник anabology) полностью open-source выложил методику: промпты, инструменты, референсы. У Петра есть **личное разрешение автора использовать его персонажа** в своём видео.

Задача: сделать **свой** клип 1–2 минуты, тем же методом и в том же визуальном языке, но:
- сюжет и текст — про TaleX / AGI / Universal High Income / revenue sharing, а не про их SF-мемы
- бюджет — **только подписка Claude Max + бесплатные инструменты**, без платных Midjourney/Seedance/GPU-бокса как у оригинала (там ушло ~$700 и 19 часов)
- персонажа можно использовать (разрешение есть), но новых кадров под наш сюжет всё равно нужно сгенерить (их кадры — под их сцены: Waymo, датацентр и т.д., нам не подходят один в один)
- мелодию **нельзя** копировать нота-в-ноту (Suno так не умеет + это была бы прямая копия чужой композиции) — вместо этого берём их **style-промпт** (жанр/BPM/структура), текст свой

## Референсные файлы

Лежат в GitHub-репозитории/ветке рядом с этим брифом (Пётр указал путь при запуске Claude Code) — читай оттуда, ничего не проси у Петра повторно:

- `prompts/README.md`, `direction-log.md`, `orchestration.md`, `prompts-suno.md`, `prompts-seedance.md`, `prompts-midjourney.md`, `how-escape-velocity-was-made.pdf` — полная методика оригинала
- `midjourney/` — Google Drive архив автора, midjourney-референсы персонажа, папки `ev-01`…`ev-17`
- `master-ev.mp4` — финальное видео оригинала
- `audio/` — аудио-стемы/референсы оригинала (.wav/.mp3/.m4a)

Возьми оттуда: **канон персонажа** (см. ниже), общую механику (2.5D параллакс по стиллам, кинетическая типографика на биты, halftone-фильтр, split-flap счётчик, CV-рамки, монтажные переходы) и структуру пайплайна (research→lyrics→storyboard→per-chapter animation→render).

## Канон персонажа (из оригинала, разрешено использовать)

Молодая женщина: чёрный дерзкий боб до подбородка, одна прядь цвета clay-orange, маленький клипса-звёздочка того же цвета, гарнитура-микрофон, белая укороченная блуза с рукавом-фонариком, чёрная плиссированная юбка на харнес-ремне с биркой, ботинки до колена. Описывать явно как "a young Caucasian American woman..." в промптах — иначе Midjourney/генераторы плывут по этничности (проблема была у оригинала).

## Наше решение (утверждено Петром, не переспрашивать)

**Название:** REVENUE VELOCITY

**Suno style-промпт:**
```
fashion show electroclash techno, 128 BPM, 4/4, dry analog kick, rolling acid bassline, cold detuned synth stabs, sweeping orchestral strings on builds, deadpan female spoken-word verses, euphoric sung female trance chorus with supersaw lift, stacked chanted vocals in the drop, catwalk energy, cold luxurious optimistic, clean modern mix
exclude: rap, rock guitar, lo-fi, male lead vocal, mumbled vocals
```

**Лирика (черновик, дорабатывать по месту под тайминг трека):**
```
[Intro - spoken, deadpan]
Ladies. Gentlemen. Agents.
This is not a pitch deck. Prepare to profit.

[Verse - spoken, deadpan]
Look one. AGI era. Everyone's talking U H I.
Musk said it: own nothing, still get paid.
Look two. Revenue sharing, not a subscription trap.
Every purchase splits back — cashflow, tokenized.
Look three. Months ago, we asked the models.
ChatGPT. Gemini. Claude. Same answer, same plan.
Look four. We didn't just talk. We shipped it.
Selling live. On-chain buybacks, daily.

[Pre-Chorus - spoken, strings swell]
This isn't a promise. It's already running.
Lock in.

[Chorus - sung, trance lift]
Feel the A G I, feel it coming fast
Revenue for everyone, built to last
They predicted it, we made it real
Lock in, baby — this is the deal
(It's so over?) WE'RE SO BACK!

[Bridge - spoken, kick + strings only]
Not a vision. A dashboard.
Buybacks: daily. Burn: real.
There is no waiting list.

[Outro - spoken, deadpan, care-label style]
Shell: AI-proposed. Lining: human-built.
Wash cold. Do not iron. Do not gatekeep.
Made with Claude.
```

**Раскадровка (черновик, ~7 сцен под 1-2 мин, расширяй под финальный тайминг трека):**

| # | Визуал | Chrome/графика |
|---|---|---|
| 1 | Хук: героиня в дата-холле, красный луч, взгляд в камеру | "This is not a pitch deck." |
| 2 | Look 1-2: подиум, билборды AGI/UHI/Musk-quote мелькают фоном | тикер новостей вместо countdown |
| 3 | Look 3: она в наушнике, стилизованные UI-чаты ChatGPT/Gemini/Claude | текст = сам факт |
| 4 | Look 4: реальные цифры — buyback-график, RoamFi UI рядом с ней | live-counter (растущий revenue/buyback вместо countdown до underclass) |
| 5 | Chorus: поёт, идёт на камеру, вспышки цифр/токенов вокруг | kinetic type припева |
| 6 | Bridge: держит "гарантийный тег" с данными buyback | crisp label card |
| 7 | Outro: care-label крупно, белый фон, затухание | "Made with Claude" |

## Бюджетный стек (без платных инструментов, только Claude Max)

- **Картинки** — бесплатные тарифы генераторов (не unlimited Midjourney)
- **Музыка** — бесплатный тариф Suno
- **Движение** — упор на код: параллакс/2.5D по стиллам + кинетический текст, а не платная видео-генерация; видео-ген (если нужен) — по минимуму, 1-2 хайлайт-кадра
- **Липсинк** — по минимуму / open-source Wav2Lip локально, если нужно
- **Монтаж** — ffmpeg + скрипт

## Следующие шаги в Claude Code

1. Прочитать референсы, вытащить точную механику движка (2.5D, kinetic type, halftone, split-flap, CV-рамки, переходы) — своя реализация на JS/Canvas, как у оригинала, но своя
2. Сгенерить трек в Suno (style-промпт выше + финальный текст)
3. Разбить трек на биты/слова (как в оригинале: librosa/wav2vec2 или доступные бесплатные аналоги)
4. Сгенерить кадры персонажа под наши 7 сцен (бесплатным генератором), самопроверка качества против референсных midjourney-кадров автора
5. Собрать движок, отрендерить, смонтировать
6. Показать Петру промежуточный результат до финального рендера
