# Batch 02 — new lyrics: storyboard map + frames to generate (Nano Banana, Gemini app)

Settings as in BATCH-01: Images mode, **16:9**, one new chat per frame, 2 variants, download full size.
Attach `refs/ref-1-face.jpg`, `refs/ref-2-face-close.jpg`, `refs/ref-3-full-body.jpg` wherever she is in the frame (marked **+refs**).
Text frames: the model must spell the text exactly; if a letter is wrong, regenerate or say "fix the text to read exactly: …".

## Storyboard map (A = author's archive plate, G = generate)

**Prelude, ~9.5 s music only (same shots as the original intro)**
| t | shot | plate |
|---|---|---|
| 0–2, 4–6 | her face in the robotaxi back seat, red light, opens eyes, turns to window | **G01** |
| 2–4 | freeway at night, robotaxi in streaks | A `ev-10/waymo-101-2` |
| 6–7.5 | datacenter exterior, car | A `ev-16-narr/n-P05-4` |
| 7.5–8.5 | hand pulls harness strap, tag | A `ev-16-narr/n-P04-2` |
| 8.5–9.3 | robotaxi stops at the head of the catwalk | **G02** |
| 9.3 → | she walks down the catwalk → "Ladies." | A `ev-10/hall-ms-3` |

**Intro**
- Ladies. Gentlemen. Agents. → A `hall-ms-3` → A `hall-frontrow-1` (AGENTS.)
- This is not the future. Prepare to walk. → **G03** (screen behind her)
- walk · walk · walk · walk (cuts on each "walk") → A `hall-wide-1`, `hall-turn-3`, `hall-ms-2`, `n-P11-3`, `n-P28-2`

**Verse** (final lyrics: five looks)
- Look one. Everyone's chasing A G I → A `n-P61-2` (crowd on the overpass, all facing the fog)
- Musk says: universal high income, don't ask why → **G04** billboard UNIVERSAL HIGH INCOME
- Look two. Months ago, we asked the models what comes next → A `n-P18-2` (headset) + prompt box graphic
- ChatGPT, Gemini, Claude — same answer, same text → A `ev-12-face/face-test-ms-f1-4` (three of her = three models, chat boxes) → A `ev-17-merge/two-of-her-2` ("same text" diff)
- Look three. Income doesn't have to wait for machines → **E5** freeway signs
- It starts the moment a product shares what it means → A `n-P15-2` (receipt printer) + split graphic
- Look four. Not subscriptions, not ads, just revenue in the split → **E6** lit billboard
- Every purchase pays it forward — simple as that, legit → **E7** orange woven label
- Look five. Take eSIM, stay connected wherever you roam → **G08** departures board → **E9** eSIM card
- Every time someone signs up, you get paid back home → A `ev-17-merge/veil-monitor-1` + notification graphic

**Pre-chorus** → A `n-P64-4` (eye), `n-P56-2` (streak) — "Lock in." padlock graphic

**Chorus / Final chorus** → A singing & walking plates: `n-P33-3`, `n-P58-2`, `n-P32-2`, `n-P35-1`, `white-cu-3`, `n-P12-1`

**Bridge**
- Buy once, get paid on every sale behind you → A `n-P61-4` (line of people behind her)
- Wealth building while you sleep → A `n-P50-1` (eyes closed)
- ownership will find you → **G10** card to lens "OWNER"
- The more people join, the more the numbers grow → A `n-P41-1` (crowd around her)
- That's the road to A G I — one product, then more → **G11** freeway sign "AGI · NEXT EXIT"

**Outro (new ending)**
- Buy a product. Own a piece of what it earns → **G12** care label
- That's not the future waiting — that's the wheel that turns → G01 again (her eyes close in the robotaxi) → A `waymo-101-4` (robotaxi drives off into the fog: full circle to the prelude) → **G13** garment tag title, cut to black

---

## Prompts — v2 (after the G03 test)

Lesson from G03: generating a scene from scratch with 4 photos of her attached makes the model paste those photos
into the picture and redraw the set. So **every frame with text is an EDIT of the author's plate**: attach ONE image
(the plate), ask only to add the text, keep everything else. Only G01, G02, G08 are generated from scratch.

### EDIT frames — attach only the listed plate, nothing else

**E03 · "This is not the future."** — NOT generated. Engine shot on the author's plate `ev-16-narr/n-P07-2`:
the words appear on the screen one by one on their vocal time (like "THIS IS NOT AN AI BILLBOARD." in the original, 0:16),
black on the screen, white where they cross her (depth cut-out), CV frame + label around the screen.

Rule: text that appears **word by word in sync with the vocal** → engine, on a clean plate.
Static in-world text (billboards, road signs, labels, cards) → baked into the picture by Nano Banana.

**E04 · billboard UNIVERSAL HIGH INCOME** — done (`in/G04-billboard-uhi.jpg`).

**E05 · signs WAIT FOR MACHINES / INCOME NOW** — attach `refs/comp-G05-G11-freeway-signs.jpg`
```
Edit this image. Turn the three blank overhead panels on the gantry into green highway signs with white highway lettering. Left panel: "WAIT FOR MACHINES" with a white arrow pointing down-left to an exit. Middle panel: "INCOME NOW" with a white arrow pointing straight up. Right panel: plain green, no text. Her head stays in front of the middle sign and may hide part of it. Keep the woman, her face, pose and outfit, the road, the fog, the light and the colours exactly unchanged. No other text.
```

**E06 · lit billboard NO SUBSCRIPTIONS** — attach `refs/comp-G06-lit-billboard.jpg`
```
Edit this image. On the glowing white billboard, print in bold black condensed sans-serif capitals, following the billboard's perspective, two lines: "NO SUBSCRIPTIONS. NO ADS." and below it in clay-orange: "JUST THE SPLIT." Keep the billboard structure, the sky, the power lines, the light and the black-and-white look exactly unchanged. No other text.
```

**E07 · orange label EVERY PURCHASE / PAYS IT FORWARD** — attach `refs/comp-G07-orange-label.jpg`
```
Edit this image. Weave into the clay-orange label, in black thread, bold condensed sans-serif capitals on two lines, following the label's angle and the texture of the weave: "EVERY PURCHASE" / "PAYS IT FORWARD". Keep the label, the stack of canvas tags, the light and the colours exactly unchanged. No other text.
```

**E09 · card eSIM** — attach `refs/comp-E09-E10-card.jpg`
```
Edit this image. Print on the small white card in her hand, following the card's angle, in bold black condensed sans-serif: "eSIM" and under it in small capitals: "CONNECTED WHEREVER YOU ROAM". Keep the woman, her face, hair, hair clip, hand and pose, the background and the light exactly unchanged. No other text.
```

**E10 · card OWNER** — same chat as E09:
```
Same image, but the card reads exactly: "OWNER" and under it: "1 PIECE OF EVERY SALE". Change nothing else.
```

**E11 · sign A G I / NEXT EXIT** — attach `refs/comp-E11-freeway-gantry.jpg`
```
Edit this image. Turn the blank panels on the overhead gantry into one long green highway sign with white highway lettering: "A G I" in large letters and "NEXT EXIT" below it, with a white arrow pointing up-right. Her head stays in front of the sign and may hide part of it. Keep the woman, her face, pose and outfit, the road, the fog, the light and the colours exactly unchanged. No other text.
```

**E12 · care label BUY A PRODUCT / OWN A PIECE / OF WHAT IT EARNS** — attach `refs/comp-G12-care-label.jpg`
```
Edit this image. Print on the blank white care label, in black monospace capitals, following the label's angle and the weave, three lines: "BUY A PRODUCT." / "OWN A PIECE" / "OF WHAT IT EARNS." and below them two small care symbols: a wash tub and a crossed-out iron. Keep the label, the fabric, the stitching, the light and the colours exactly unchanged. No other text.
```

**E13 · final tag REVENUE VELOCITY** — attach `refs/comp-G13-tag.jpg`
```
Edit this image. Print on the white garment tag, above the barcode, following the tag's angle, in bold black condensed sans-serif capitals: "REVENUE VELOCITY" and below it, small: "S/S 26". Keep the tag, the barcode, the fabric, the light and the colours exactly unchanged. No other text.
```

### GENERATE frames (nothing like them in the archive)

**G01 · her face in the robotaxi** — attach `refs/ref-1-face.jpg`, `refs/ref-2-face-close.jpg`, `refs/comp-G01-robotaxi-seat.jpg`
```
Create a new photograph, 16:9, cinematic 35mm film still. Close-up of the same woman as in the first two images (same face, freckles, black blunt bob with heavy bangs and one clay-orange streak, small clay-orange star hair clip, thin headset microphone, white cropped puff-sleeve shirt with a black harness strap), sitting in the back seat of a driverless robotaxi at night like in the third image, looking straight into the camera, deadpan, lips closed. A red light from outside falls across one side of her face, passing city lights blur in the dark window behind her. Blue-black and steel blue, the red light the only warm note, fine silver-gelatin grain, shallow depth of field. One single photograph: do not place the reference photos inside the picture, no collage, no screens. No text, no logos, no watermark.
```

**G02 · robotaxi at the head of the catwalk** — attach `refs/comp-G02-hall-laptops.jpg`, `refs/comp-G02-robotaxi.jpg`
```
Create a new photograph, 16:9, cinematic 35mm film still, in the same dark data hall as the first image: a white driverless robotaxi like the one in the second image, with a small spinning roof sensor, stopped at the far end of the long wet concrete catwalk, headlights on, its rear door swinging open, the silhouetted crowd with glowing laptops on both sides, fog, reflections on the wet floor, one small red lamp high on the wall. Blue-black and steel blue, fine silver-gelatin grain. One single photograph, no collage. No text, no logos, no watermark.
```

**G08 · airport departures board CONNECTED** — attach `refs/ref-3-full-body.jpg`, `refs/ref-1-face.jpg`
```
Create a new photograph, 16:9, cinematic 35mm film still. A vast empty airport terminal at night. A giant black split-flap departures board fills the upper half of the frame, white flap letters in four rows, exactly: "TOKYO     CONNECTED" / "LISBON    CONNECTED" / "DUBAI     CONNECTED" / "NEW YORK  CONNECTED". Below it, the same woman as in the reference images (same face, black blunt bob with one clay-orange streak, star hair clip, headset microphone, white cropped puff-sleeve shirt, black pleated skirt with harness belt and white garment tag, black knee boots) walks past from left to right, full length, a small carry-on in hand. Polished floor reflections, cold white light, one small red lamp, blue-black and steel blue, fine silver-gelatin grain. One single photograph: do not place the reference photos inside the picture, no collage, no screens with photos. The only text is on the board. No logos, no watermark.
```
