# Batch 01 — intro + billboard test (Nano Banana 2, Gemini app)

## Settings (every shot)
- Mode **Images**, aspect ratio **16:9**.
- Model: first shot on **3.1 Pro** and on **3.8 Flash** — compare; then keep the better one.
- Attach with **+**: `refs/ref-1-face.jpg`, `refs/ref-2-face-close.jpg`, `refs/ref-3-full-body.jpg`
  (+ `refs/style-hall.jpg` for shots in the data hall).
- One new chat per shot (drift is lower). 2 variants per shot: generate, then "another variant, same prompt".
- Download the full-size file (download button, not a screenshot). Name it as in the table.

## Canon (already inside each prompt)
young Caucasian American woman, pale skin, light freckles; glossy black blunt jaw-length bob, heavy bangs,
one clay-orange streak through the bangs; small flat clay-orange eight-pointed star hair clip; thin headset mic;
white cropped puff-sleeve shirt; black pleated coated-nylon skirt on a harness belt with a hanging white garment tag;
black knee boots.

---

### 01 · intro-face  → `rv01-intro-face-a.png`, `-b.png`
(original 0:00 — her face, alive, looking into the lens; will be animated)
```
Cinematic 35mm film still, 16:9. Extreme close-up portrait of the woman from the reference images: a young Caucasian American woman with pale skin and light freckles, a glossy black blunt jaw-length bob with heavy bangs and one clay-orange streak through the bangs, a small flat clay-orange eight-pointed star hair clip, a thin headset microphone. She looks straight into the lens, deadpan, lips closed. One side of her face is lit by a single red warning lamp, the other side falls into blue-black shadow. Behind her, far out of focus: rows of server racks in a dark data hall with tiny blue status lights. Her face is slightly left of centre; the right third of the frame is dark and empty. Blue-black and steel-blue palette, the red lamp is the only warm light. Fine silver-gelatin grain, shallow depth of field, high-fashion editorial. Keep her face, hair, hair clip and outfit exactly as in the reference images. No text, no letters, no logos, no watermark.
```

### 02 · intro-walk  → `rv02-intro-walk-a.png`, `-b.png`
(original ~0:20 — she walks toward camera down the catwalk)
```
Cinematic 35mm film still, 16:9. Full-length shot, camera low at the end of a long wet catwalk inside a vast dark data hall. The woman from the reference images walks straight toward the camera in the middle of the frame: a young Caucasian American woman with pale skin and light freckles, a glossy black blunt jaw-length bob with heavy bangs and one clay-orange streak, a small clay-orange eight-pointed star hair clip, a thin headset microphone, a white cropped puff-sleeve shirt, a black pleated coated-nylon skirt on a harness belt with a hanging white garment tag, black knee boots. Rows of seated audience on both sides are dark silhouettes lit from below by laptop screens. Cold white backlight and drifting fog behind her, reflections on the wet floor, one small red lamp high on the wall. The top quarter of the frame is empty dark ceiling. Blue-black and steel blue, the red lamp the only warm note, fine silver-gelatin grain. Keep her face, hair and outfit exactly as in the reference images. No text, no letters, no logos, no watermark.
```

### 03 · intro-agents  → `rv03-intro-agents-a.png`, `-b.png`
(for "Ladies. Gentlemen. Agents." — the audience, no heroine)
```
Cinematic 35mm film still, 16:9. Wide shot from the end of an empty wet catwalk in a vast dark data hall. On both sides, long rows of seated fashion-show guests, all dark anonymous silhouettes, every face lit cold from below by an open laptop screen. Some wear headsets. Fog hangs over the runway, a line of cold white light at the far end, one small red lamp on the wall. The upper third of the frame is empty dark space. Blue-black and steel blue, the red lamp the only warm note, fine silver-gelatin grain. No text, no letters, no logos, no watermark.
```

### 04 · billboard test (UHI)  → `rv04-billboard-uhi-a.png`, `-b.png`
(test: text baked into the picture instead of an overlay)
```
Cinematic 35mm film still, 16:9. Dawn on a foggy empty eight-lane freeway. A huge billboard on a steel pole fills the upper half of the frame, printed in bold black condensed sans-serif capitals on white: "UNIVERSAL HIGH INCOME". Small below it: "own nothing. still get paid." Standing on the road in the lower right third, small in the frame, looking up at the billboard: the woman from the reference images, a young Caucasian American woman with a glossy black blunt bob with one clay-orange streak, a white cropped puff-sleeve shirt, a black pleated skirt with a harness belt and a hanging white garment tag, black knee boots. Pale grey fog, soft cold light, one small red lamp on the billboard frame as the only warm note, fine silver-gelatin grain. Keep her face, hair and outfit exactly as in the reference images. No other text, no logos, no watermark.
```

---
Return: drop the files into this chat (or upload to `rv/gen/in/`). I check identity against the refs, pick, and prepare the Seedance start frames.
