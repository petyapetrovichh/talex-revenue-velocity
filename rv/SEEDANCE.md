# Seedance: как оживляем кадры (плейбук)

Источник метода: `prompts/prompts-seedance.md`, `prompts/README.md`, `prompts/direction-log.md` и `prompts/orchestration.md` (автор, anabology).
Правило проекта: **оживляем только те кадры, которые оживлены в оригинале.** Всё остальное остаётся 2.5D-плейтом и анимируется в коде, как у автора.

## 1. Как это делал автор (факты из его документов)

| Что | Как у автора |
|---|---|
| Модель | `bytedance/seedance-2.5` через OpenRouter, 16:9, 720p, клипы по 4–8 с, `generate_audio: true` |
| Объём | 47 клипов + 30 «cover»-клипов + 7 тестов = 91 запуск, 421 с видео, около $93 (≈ $0.22 за секунду при 720p) |
| Вход | `@Image1`: плейт кадра (цветной, уже в грейде клипа). `@Audio1`: кусок песни ровно под окно клипа |
| Поющие кадры | в `@Audio1` идёт **вокальный стем** окна, отрезанный в паузе между словами (не посреди слова). В промпте дословно цитируются слова из окна |
| Кадры с движением | в `@Audio1` идёт **полный микс** окна, чтобы шаги и движения попадали в бит |
| Проверка lip-sync | Seedance копирует референсное аудио в свою дорожку, а рот идёт по этой дорожке. Скрипт `avsync` сравнивает дорожку клипа с нашим вокалом и находит момент, где синхрон уходит. Монтаж режет на последней восьмой перед расхождением, дальше продолжает «cover»-клип. В синхроне оказалось около 86% спетых секунд |
| Язык промптов | простой физический язык, без стилевых слов: кто, что делает, куда смотрит, камера, «No cuts» |
| Правила из заметок автора | два клипа не должны стартовать с одного и того же кадра; монохромные стартовые кадры возвращались серыми, поэтому стартовые кадры цветные; больше всего брака на длинных нотах и поворотах головы |

**Шаблон для поющего кадра** (дословно у автора):

```
@Image1 sings @Audio1. She lip-syncs to @Audio1 exactly, every word in time: "<точные слова окна>".
<крупность> of the woman from @Image1 <что делает>, <свет>. Locked camera, no cuts, no head turns.
```

**Шаблон для кадра с движением:**

```
The scene from @Image1, moving in time with @Audio1. <крупность>. The woman from @Image1 <одно простое действие>.
<камера>. No cuts. Her mouth stays closed, face expressionless.
```

**Технические детали API (проверено запросом к OpenRouter 2026-09-29):**

- `POST https://openrouter.ai/api/v1/videos` возвращает `id`. Дальше опрашиваем `GET /api/v1/videos/{id}` до `completed | failed | cancelled | expired`. Скачиваем через `GET /api/v1/videos/{id}/content?index=0`. Стоимость приходит в `usage.cost`.
- Режим референсов: `input_references: [{type:"image_url", image_url:{url}}, {type:"audio_url", audio_url:{url}}]`. Допустимые типы: `image_url | audio_url | video_url`.
- **Если задать `frame_images` (first_frame), аудиореференс игнорируется.** Поэтому lip-sync работает только в режиме референсов, как у автора (`@Image1 sings @Audio1`).
- В `input_references` принимаются только HTTPS-ссылки, data-URI не подходят. Репозиторий публичный, поэтому входы кладём в `rv/seedance/in/` (без LFS) и отдаём через `raw.githubusercontent.com`.

## 2. Что оживлено в оригинале и что это значит для нас

Кадры оригинала в моменты каждого из 47 клипов автора собраны в контакт-лист (`rv/seedance/original_seedance_shots.jpg`). Сопоставление с нашими плейтами:

| Наш плейт | Где в нашем клипе | Клип автора | Тип | Решение |
|---|---|---|---|---|
| `whitecu` (white-cu-3) | 86.5–90.2, 93.5–95.3 · «WE'RE SO BACK!» | SD29 `white-cu~3`, тот же плейт и та же строка | поёт | **A · тест 1** |
| `hallms` (hall-ms-3) | 5.7–6.6, проходки 14.7–22 | SD03 `hall-ms`, тот же плейт | движение | **A · тест 2** |
| `sing1` (n-P33) | 65.5–67.5 и 117.4–122.6 · «Feel the AGI, feel it coming fast» | SD08/SD11 `hero-cu`, `n-P33~2`, тот же сет | поёт | **A** |
| `sing2` (n-P58) | 76.6–80.8 · «Lock in, baby — revenue is the deal» | SD19 `n-P58~2`, тот же плейт | поёт | **A** |
| `walkwarm` (n-P32) | 67.5–72.4 и 114.1–117.4 · «Products that pay you back…» | SD07 `hero-walk`, тот же сет | поёт на ходу | **A** |
| `twirl` (hall-turn-3) | 15.7 и 21.1 | SD10 `hall-turn`, тот же плейт | движение (разворот) | **A** |
| `G01` (она в робо-такси) | 0.1–2.0, 2.9–3.8 | SD01 `waymo-cu` | движение | **A** |
| `G02` (такси въезжает в зал) | 5.2–5.7, 6.6–9.2 | SD02 `waymo-arrive` | движение | **A** |
| `E9` (держит eSIM) / `E10` (OWNER) | 51.8–53.8 / 101.7–103.3 | SD34 `tag-to-lens` (держит бирку к объективу) | поёт | B: на карточке запечённый текст, есть риск, что он «поплывёт» |
| `G04` (под билбордом UHI) | 24.4–28.7 | SX01 `billboard-catwalk` | движение (ветер, поворот головы) | B: фигура маленькая, эффект слабый |
| `G08` (табло CONNECTED) | 50.8–51.8 | нет прямого аналога, в кадре всего 1 с | — | не оживляем |
| `screen`, `eye`, `waymo101`, `hallwide`, `walk`, `walk2`, `crowd`, `overpass`, `line`, `around`, `sleep`, `receipt`, `headset`, `three`, `two`, `monitor`, `streak`, `closeup`, `face`, `E5`, `E6`, `E7`, `E11`, `E12`, `E13`, `belt`, `ext` | — | в оригинале это 2.5D / freeze / графика | — | **не оживляем** |

**Экономия за счёт повторов.** Припев повторяется: «Feel the AGI…» (c1 и f3) и «WE'RE SO BACK!» (c5a и c5b). Скрипт сравнит, совпадает ли вокал по таймингу. Если совпадает, один клип закрывает оба места.

## 3. Список клипов (A-лист, 8 клипов, около 40 с)

Окна даны во времени финального трека (`gen/in/suno-final.wav`). Поющие клипы получают вокальный стем (`work/stems_final`), клипы с движением получают полный микс.

| ID | Плейт | Окно | Длит. | Аудио | Промпт |
|---|---|---|---|---|---|
| RV-S01 | whitecu | 85.8 → | 5 | вокал | `@Image1 sings @Audio1. She lip-syncs to @Audio1 exactly, every word in time: "WE'RE SO BACK!". Close-up of the woman from @Image1 on a plain white background, singing hard with her mouth wide open, head tilting back on the long note, eyes closed. Locked camera, no cuts, no head turns.` |
| RV-S02 | hallms | 5.6 → | 6 | микс | `The scene from @Image1, moving in time with @Audio1. Full-length shot: the woman from @Image1 walks straight toward the camera down the wet concrete catwalk with a steady model's walk, her whole body from head to boots in frame the entire time; the silhouetted front row holds up glowing laptops on both sides; fog. The camera slowly pulls back to keep her whole figure in frame. No cuts. Her mouth stays closed, face expressionless.` |
| RV-S03 | sing1 | 65.3 → | 5 | вокал | `@Image1 sings @Audio1. She lip-syncs to @Audio1 exactly, every word in time: "Feel the A G I, feel it coming fast". Close-up of the woman from @Image1 with her black bob, clay-orange streak and headset microphone, singing with her eyes closed, her head tilting back on the long notes, her hair moving. Warm light from the side. Locked camera, very slight push in, no cuts.` |
| RV-S04 | sing2 | 76.4 → | 5 | вокал | `@Image1 sings @Audio1. She lip-syncs to @Audio1 exactly, every word in time: "Lock in, baby, revenue is the deal". Close-up of the woman from @Image1 singing into strong wind, eyes half closed, tipping her head back on the long notes, her short hair and the orange strand blowing. Pale sky behind. The camera moves slowly around her by a few degrees. No cuts.` |
| RV-S05 | walkwarm | 68.7 → | 5 | вокал | `@Image1 sings @Audio1. She lip-syncs to @Audio1 exactly, every word in time: "Products that pay you back, built to last". Full-length shot. The woman from @Image1 walks toward the camera down the middle of the huge hall, singing, with a confident model's walk; the walls of warm light panels flicker in waves. Her skirt swings. The camera moves back at her walking speed. No cuts.` |
| RV-S06 | twirl | 15.5 → | 5 | микс | `The scene from @Image1, moving in time with @Audio1. Full-length shot. The woman from @Image1 stands still at the end of the walkway for one second, then turns sharply around on one heel so her skirt flares out, her short black hair swings and the tag on her belt flies out, and she stops facing the camera, still. Static camera. No cuts. Her mouth stays closed, face expressionless.` |
| RV-S07 | G01 | 0.0 → | 5 | микс | `The scene from @Image1, moving in time with @Audio1. Close-up. The woman from @Image1 sits still in the back seat of the moving car at night. A red light slides slowly across her face from left to right. At one second she blinks and looks straight into the lens. City lights stream past the window behind her. The car rocks slightly. Locked camera, very slow push in. No cuts. Her mouth stays closed, face expressionless.` |
| RV-S08 | G02 | 5.0 → | 4 | микс | `The scene from @Image1, moving in time with @Audio1. The white robotaxi with its headlights on rolls slowly toward the camera down the wet concrete catwalk inside the dark data hall and stops; its rear door swings open. The silhouetted front row on both sides holds up glowing laptops. Fog drifts. Slow push in. No cuts.` |

B-лист (решаем после A): `E9`, `E10` (добавить в промпт: «She holds the card perfectly still toward the lens; the card and its printed text stay sharp and unchanged»), `G04`.

## 4. Бюджет

Цены OpenRouter на 2026-09-29 (`/api/v1/videos/models`). Seedance считает видеотокены: ширина × высота × 24 fps × секунды / 1024. Цифры ниже пересчитаны в доллары за секунду и сверяются с `usage.cost` первого клипа.

| Модель | 480p | 720p |
|---|---|---|
| **seedance-2.5** (автор) | ≈ $0.10/с | ≈ $0.23/с |
| seedance-2.0 | ≈ $0.07/с | ≈ $0.15/с |
| seedance-2.0-fast | ≈ $0.04/с | ≈ $0.09/с |

| Сценарий (seedance-2.5) | 480p | 720p |
|---|---|---|
| A-лист, 40 с | ≈ $4 | ≈ $9 |
| A + B, 52 с | ≈ $5.5 | ≈ $12 |
| **С запасом ×1.5 на переделки и cover-клипы** | **≈ $8** | **≈ $18** |

Даже худший вариант укладывается в $30 с запасом.

## 5. Порядок работы

1. **Пополнение** (Петр): openrouter.ai → Settings → Credits → Add credits. Карта, есть комиссия около 5.5%. Auto top-up не включать. Для защиты в Settings → Keys у нашего ключа поставить **Credit limit $25**: тогда ключ физически не потратит больше.
2. **Подготовка** (я, бесплатно): вокальный стем, нарезка аудиоокон в паузах между словами, чистые плейты без эффектов в `rv/seedance/in/`, скрипт `tools/seedance.py` (отправка, опрос, скачивание, журнал расходов `seedance/ledger.csv`), скрипт `tools/avsync.py` (проверка lip-sync).
3. **Тест** (около $2.3): RV-S01 (поёт) в 480p и в 720p плюс RV-S02 (ходьба) в 480p. Эти тесты и есть настоящие кадры клипа: если они приняты, деньги не потеряны.
4. **Показ**: сырые клипы без монтажа, рядом плейт, в том же halftone-грейде, что и в клипе, и график синхрона для поющих. Петр отвечает «да» или «нет» по каждому. Заодно решаем 480p или 720p.
5. **Партия**: остальные клипы A-листа в выбранном качестве, по 2–3 за раз, с тем же показом. Если синхрон уходит, делаем cover-клип только на проблемный кусок (4 с), а не переделываем весь клип.
6. **B-лист**, если бюджет и вкус позволяют.
7. **Монтаж**: движок получает видеоплейты (кадры клипа по времени t). Лица и детекции пересчитываются по кадрам клипа, CV-рамки едут за ней, все надписи и эффекты накладываются поверх, как в v4.

### Почему не делаем «сначала всё в плохом качестве, потом в хорошем»

Seedance недетерминирован: повторный запуск в 720p даст **другой** клип (другие движения, другой синхрон), и принятый вариант не повторится. Мы заплатили бы дважды и всё равно получили бы новый кадр. Поэтому:

- качество выбираем один раз, на тесте: RV-S01 в 480p и в 720p, уже в нашем halftone-грейде;
- у нас сильный halftone/dither (точка 5–7 px на 1080p), он прячет разницу 480p и 720p лучше, чем «чистая» картинка. Если на тесте разница не видна, 480p даёт экономию в 2 раза (≈ $8 вместо ≈ $18 на всё);
- «черновик» у нас уже есть бесплатно: это статичный монтаж v4. Seedance запускаем только для кадров, где монтаж утвержден.

## 6. Чек-лист перед каждым запуском (чтобы не было перегенераций)

- [ ] Плейт цветной, без наложений и текста поверх (запечённый текст на объекте допустим, в промпте просим держать объект неподвижно).
- [ ] Окно аудио начинается и заканчивается в паузе между словами; длительность клипа = окно (4–6 с, не больше 8).
- [ ] Слова в кавычках совпадают с тем, что звучит в окне, дословно (как в `LYRICS.md`, «A G I» по буквам).
- [ ] Одно простое действие на клип. Никаких «cinematic», «beautiful» и прочих стилевых слов.
- [ ] Для поющих: «Locked camera, no cuts, no head turns» (повороты головы ломают синхрон).
- [ ] Для движения: «Her mouth stays closed, face expressionless».
- [ ] Два клипа не стартуют с одного и того же плейта в одном и том же ракурсе.
- [ ] После генерации: `avsync` по поющим, просмотр по кадрам, запись в `ledger.csv` (id, модель, разрешение, секунды, `usage.cost`, вердикт).
