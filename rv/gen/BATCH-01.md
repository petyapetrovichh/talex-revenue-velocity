# Batch 01 — billboard test (Nano Banana 2, Gemini app)

## Settings (every shot)
- Mode **Images**, aspect ratio **16:9**.
- Model: generate on **3.1 Pro** and on **3.8 Flash** — compare; then keep the better one.
- Attach with **+**: `refs/ref-1-face.jpg`, `refs/ref-2-face-close.jpg`, `refs/ref-3-full-body.jpg`
- One new chat per shot (drift is lower). 2 variants per shot: generate, then "another variant, same prompt".
- Download the full-size file (download button, not a screenshot). Name it as in the table.

## Canon (already inside each prompt)
young Caucasian American woman, pale skin, light freckles; glossy black blunt jaw-length bob, heavy bangs,
one clay-orange streak through the bangs; small flat clay-orange eight-pointed star hair clip; thin headset mic;
white cropped puff-sleeve shirt; black pleated coated-nylon skirt on a harness belt with a hanging white garment tag;
black knee boots.

---

### Intro — no generation: the author's plates are used as they are and animated in Seedance
- face, red lamp, into the lens: `midjourney/ev-16-narr/n-P12-2.jpg` (alt `n-P12-1`)
- walk down the catwalk: `midjourney/ev-10/hall-ms-3.jpg` (alt `hall-ms-2`, `ev-16-narr/n-P11-3`)
- the audience / "Agents.": `midjourney/ev-10/hall-frontrow-1.jpg`
- datacenter exterior: `midjourney/ev-16-narr/n-P05-4.jpg`
Generate only what the archive doesn't have, and anything with text inside the picture.

### 04 · billboard test (UHI)  → `rv04-billboard-uhi-a.png`, `-b.png`
(test: text baked into the picture instead of an overlay)
```
Cinematic 35mm film still, 16:9. Dawn on a foggy empty eight-lane freeway. A huge billboard on a steel pole fills the upper half of the frame, printed in bold black condensed sans-serif capitals on white: "UNIVERSAL HIGH INCOME". Small below it: "own nothing. still get paid." Standing on the road in the lower right third, small in the frame, looking up at the billboard: the woman from the reference images, a young Caucasian American woman with a glossy black blunt bob with one clay-orange streak, a white cropped puff-sleeve shirt, a black pleated skirt with a harness belt and a hanging white garment tag, black knee boots. Pale grey fog, soft cold light, one small red lamp on the billboard frame as the only warm note, fine silver-gelatin grain. Keep her face, hair and outfit exactly as in the reference images. No other text, no logos, no watermark.
```

---
Return: drop the files into this chat (or upload to `rv/gen/in/`). I check identity against the refs, pick, and prepare the Seedance start frames.
