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

**Verse**
- Look one. Everyone's chasing A G I → A `n-P61-2` (crowd on the overpass, all facing the fog)
- Musk says: universal income, don't ask why → **G04** billboard
- Look two. Income doesn't have to wait for machines → **G05** freeway signs
- It starts the moment a product shares what it means → A `n-P15-2` (receipt printer) + split graphic
- Look three. Not subscriptions, not ads, just revenue in the split → **G06** lit billboard
- Every purchase pays it forward — simple as that, legit → **G07** orange woven label
- Look four. Take eSIM, stay connected wherever you roam → **G08** departures board, **G09** eSIM card to lens
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

## Prompts

### G01 · robotaxi face (prelude, no text) · +refs
```
Cinematic 35mm film still, 16:9. Close-up portrait of the woman from the reference images, a young Caucasian American woman with pale skin and light freckles, a glossy black blunt jaw-length bob with heavy bangs and one clay-orange streak through the bangs, a small flat clay-orange eight-pointed star hair clip, a thin headset microphone, a white cropped puff-sleeve shirt with a black harness strap, sitting in the back seat of a driverless robotaxi at night, looking straight into the camera, deadpan, lips closed. A red light from outside falls across one side of her face, passing city lights blur in the dark window behind her, dark leather seat, shallow depth of field. Blue-black and steel blue, the red light the only warm note, fine silver-gelatin grain. Keep her face, hair and hair clip exactly as in the reference images. No text, no letters, no logos, no watermark.
```

### G02 · robotaxi arrives on the catwalk (prelude, no text, no heroine)
```
Cinematic 35mm film still, 16:9. A white driverless robotaxi with a small spinning roof sensor stopped at the far end of a long wet concrete catwalk inside a colossal dark server hall, headlights on, its rear door swinging open, a silhouetted crowd holding glowing laptops on both sides of the runway, fog, reflections on the wet floor, one small red lamp high on the wall. Blue-black and steel blue, the red lamp the only warm note, fine silver-gelatin grain. No text, no letters, no logos, no watermark.
```

### G03 · "This is not the future." · +refs
```
Cinematic 35mm film still, 16:9. The woman from the reference images stands at the end of a wet catwalk in a vast dark data hall, full length, facing the camera, deadpan: a young Caucasian American woman with a glossy black blunt bob with one clay-orange streak, a small clay-orange star hair clip, a thin headset microphone, a white cropped puff-sleeve shirt, a black pleated skirt on a harness belt with a hanging white garment tag, black knee boots. Behind her, a huge glowing white LED screen spans the back wall and shows, in giant bold black condensed sans-serif capitals, exactly the words: "NOT THE FUTURE." Silhouetted audience with laptops on both sides, fog, one small red lamp. Blue-black and steel blue, fine silver-gelatin grain. Keep her face, hair and outfit exactly as in the reference images. The only text in the image is "NOT THE FUTURE." No logos, no watermark.
```

### G04 · billboard, Musk / universal income · +refs
```
Cinematic 35mm film still, 16:9. Dawn on a foggy empty eight-lane freeway. A huge billboard on a steel pole fills the upper half of the frame, printed in bold black condensed sans-serif capitals on white, exactly: "UNIVERSAL HIGH INCOME". Standing on the road in the lower right third, small in the frame, looking up at it: the woman from the reference images, a young Caucasian American woman with a glossy black blunt bob with one clay-orange streak, a white cropped puff-sleeve shirt, a black pleated skirt with a harness belt and a hanging white garment tag, black knee boots. Pale grey fog, soft cold light, one small red lamp on the billboard frame as the only warm note, fine silver-gelatin grain. Keep her face, hair and outfit as in the reference images. The only text in the image is "UNIVERSAL HIGH INCOME". No logos, no watermark.
```

### G05 · freeway signs: don't wait for machines · +refs
```
Cinematic 35mm film still, 16:9. A foggy empty freeway at pale dawn under a steel gantry with two big green overhead road signs across the top of the frame. The left sign reads exactly "WAIT FOR MACHINES" with a white arrow pointing down-left to an exit. The right sign reads exactly "INCOME NOW" with a white arrow pointing straight up. White highway lettering. Below the signs, standing in the middle lane, three-quarter view, looking toward the camera: the woman from the reference images, a young Caucasian American woman with a glossy black blunt bob with one clay-orange streak, a white cropped puff-sleeve shirt, a black pleated skirt with a harness belt and a hanging white garment tag, black knee boots. Soft grey fog, cold light, fine silver-gelatin grain. Keep her face, hair and outfit as in the reference images. The only text is on the two signs. No logos, no watermark.
```

### G06 · lit billboard: no subscriptions, no ads
```
Cinematic 35mm film still, 16:9. Low angle at dusk: a lone lit billboard on a steel pole against a grey overcast sky, power lines crossing the frame. The billboard is bright white and printed in bold black condensed sans-serif capitals on two lines, exactly: "NO SUBSCRIPTIONS. NO ADS." and below it in clay-orange: "JUST THE SPLIT." Monochrome grey scene, the clay-orange line is the only colour, fine silver-gelatin grain. The only text in the image is on the billboard. No logos, no watermark.
```

### G07 · orange woven label: pays it forward
```
Extreme macro photograph, 16:9. A clay-orange woven garment label lies on a stack of off-white canvas tags, lit by soft window light from the side, the coarse weave clearly visible. Woven into the label in black thread, bold condensed sans-serif capitals on two lines, exactly: "EVERY PURCHASE" / "PAYS IT FORWARD". Shallow depth of field, the edges of the stack out of focus, fine grain, high-fashion still life. The only text in the image is on the label. No logos, no watermark.
```

### G08 · departures board: eSIM, connected everywhere · +refs
```
Cinematic 35mm film still, 16:9. A vast empty airport terminal at night. A giant black split-flap departures board fills the upper half of the frame, white flap letters in four rows, exactly: "TOKYO     CONNECTED" / "LISBON    CONNECTED" / "DUBAI     CONNECTED" / "NEW YORK  CONNECTED". Below it the woman from the reference images walks past from left to right, full length, a small carry-on in hand: a young Caucasian American woman with a glossy black blunt bob with one clay-orange streak, a small clay-orange star hair clip, a thin headset microphone, a white cropped puff-sleeve shirt, a black pleated skirt with a harness belt and a hanging white garment tag, black knee boots. Polished floor reflections, cold white light, one small red lamp. Blue-black and steel blue, fine silver-gelatin grain. Keep her face, hair and outfit as in the reference images. The only text is on the board. No logos, no watermark.
```

### G09 · eSIM card to the lens · +refs (+ attach `refs/ref-1-face.jpg` as the composition)
```
Photograph, 16:9, high-key. Medium close-up of the woman from the reference images holding a small white plastic card up toward the lens with one hand, the card sharp in the foreground, her face just behind it looking into the camera, deadpan: a young Caucasian American woman with pale skin and light freckles, a glossy black blunt bob with heavy bangs and one clay-orange streak, a small clay-orange eight-pointed star hair clip, a thin headset microphone, a white puff-sleeve shirt. The card is printed in bold black condensed sans-serif, exactly: "eSIM" and under it in small capitals "CONNECTED WHEREVER YOU ROAM". Plain pale grey paper background, soft light, fine grain. Keep her face, hair and hair clip exactly as in the reference images. The only text is on the card. No logos, no watermark.
```

### G10 · "ownership will find you" — card "OWNER" · +refs
(same composition as G09 — do it in the same chat: "same image, but the card reads exactly: OWNER, and under it: 1 PIECE OF EVERY SALE")

### G11 · freeway sign: road to AGI · +refs
```
Cinematic 35mm film still, 16:9. Wide shot of an empty foggy freeway at pale dawn, a single huge green overhead road sign on a steel gantry across the top of the frame, white highway lettering, exactly: "A G I" and below it "NEXT EXIT" with a white arrow pointing up-right. The woman from the reference images walks away from the camera down the middle lane toward the sign, small in the frame, full length: glossy black bob, white cropped puff-sleeve shirt, black pleated skirt with a harness belt and a hanging white garment tag, black knee boots. Soft grey fog, cold light, fine silver-gelatin grain. The only text is on the sign. No logos, no watermark.
```

### G12 · care label: own a piece
```
Extreme macro photograph, 16:9, high-key. A white woven care label stitched into the inside of a white cotton garment, soft shadowless light, the weave clearly visible. Printed on the label in black monospace capitals, exactly three lines: "BUY A PRODUCT." / "OWN A PIECE" / "OF WHAT IT EARNS." with small care symbols (wash tub, crossed-out iron) beneath. Monochrome off-white, fine grain, high-fashion still life. The only text in the image is on the label. No logos, no watermark.
```

### G13 · final title on the garment tag
```
Extreme macro photograph, 16:9. A white woven garment tag with a barcode hanging on a thin string from a black pleated coated-nylon skirt, dark background, soft side light, the weave and stitched hem clearly visible. Printed on the tag in bold black condensed sans-serif capitals, exactly: "REVENUE VELOCITY" and below it, small: "S/S 26". Blue-black background, fine silver-gelatin grain. The only text in the image is on the tag. No logos, no watermark.
```
