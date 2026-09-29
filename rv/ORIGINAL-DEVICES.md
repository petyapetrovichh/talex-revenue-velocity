# ESCAPE VELOCITY: catalogue of motion-design and editing devices

Source: `master-ev.mp4` (1920x1080, 24 fps, 306.48 s). Method: ffmpeg `scdet` (threshold 12), a second frame-difference pass that also catches soft transitions (wipes, dissolves, flashes), contact sheets at 4 fps for 0-26, 26-45, 80-100, 186-215, 222-240, 240-262 and 290-306, a 0.5 fps sheet for 112-180, and full-frame-rate strips around about 75 transitions. Scratch images are in `/tmp/claude-0/evcat/`.

Timestamps are in seconds. "Accent" means the one warm colour, clay orange (about `#D97757` to `#E0704A`).

---

## 0. Numbers first

### Cut detection

| Pass | Transitions | Shots |
|---|---|---|
| `scdet` threshold 12 (hard cuts plus hard-edged flashes) | 120 | 121 |
| Frame-difference pass (adds wipes, dissolves, glitch transitions; about 10 hits are in-shot motion) | 158 | 159 |
| **Best estimate of real shots** | | **about 145** (storyboard said 141) |

About 8 of the `scdet` hits are **flash pulses inside one shot**, not new shots: 8.04, 49.50, 49.96, 50.42, 76.42, 79.58 and 207.29 (the frame returns to the same image). About 10 of the frame-difference hits are fast in-shot motion from Seedance clips: 159.33, 169.54, 170.21, 210.79, 251.12, 251.75, 259.96, 269.25, 297.42 and 298.33.

### Shot length, from the frame-difference pass (159 segments)

| Section | Shots | Median | Mean | Min | Max |
|---|---|---|---|---|---|
| All | 159 | **1.79 s** | 1.93 | 0.38 | 10.83 |
| 0-26 intro | 14 | 1.81 | 1.88 | 1.17 | 2.67 |
| 26-80 verse 1 | 36 | **1.52** | 1.50 | 0.38 | 3.29 |
| 80-112 chorus 1 | 12 | **2.54** | 2.72 | 0.96 | 4.75 |
| 112-190 verse 2 + chorus 2 | 39 | 1.88 | 2.00 | 0.46 | 5.33 |
| 190-250 bridge + drop | 33 | 1.71 | 1.81 | 0.42 | 5.33 |
| 250-306 final chorus + outro | 25 | 1.79 | 2.24 | 0.40 | **10.83** (290.2-301.0) |

### Shot length, from the `scdet` pass only (121 shots)

| Section | Shots | Median | Min | Max |
|---|---|---|---|---|
| All | 121 | 1.83 | 0.04 | 16.2 |
| Intro | 16 | 1.81 | 0.21 | 4.08 |
| Verse 1 | 30 | 1.79 | 0.12 | 5.46 |
| Chorus 1 | 10 | 2.94 | 0.42 | 9.5 |
| Verse 2 + chorus 2 | 23 | 2.25 | 0.21 | 10.8 |
| Bridge + drop | 29 | 2.12 | 0.04 | 8.5 |
| Final + outro | 13 | 1.79 | 0.12 | 16.2 |

The `scdet` maximums are inflated because it misses soft transitions.

**Key fact:** at 131.5 BPM one bar lasts 1.825 s, so the median shot is exactly one bar.

- Verses run slightly faster than one bar (about 0.8 bar).
- Choruses run slightly slower (1.3-1.5 bars).
- Almost every cut lands on a beat, and most land on a downbeat.

### Brightness by section (mean luma, 0-255)

| Section | Mean luma | Look |
|---|---|---|
| Intro | 59 | night |
| Verse 1 | 68 | night |
| Chorus 1 | 60 | night |
| Verse 2 | 100 | dawn and tungsten |
| Bridge | 153 | white-pilled |
| Final | 151 | white-pilled |

---

## a. Transition types

Of about 145 transitions, **about 65-70% are plain hard cuts on the beat**. The other **45-50 are designed transitions**, roughly one every 3-4 cuts. They are motivated by the graphic or the lyric.

The same designed device is never used twice in a row. The one exception is the exposure-pulse triplet, which is deliberate. Several devices recur across the video as motifs:

- the spark or starburst (4 times)
- the slice glitch (about 5 times)
- the flash (about 6 times)
- the dissolve (about 4 times)

| # | Type | What it is | Examples | Count |
|---|---|---|---|---|
| 1 | **Hard cut** | Straight cut on the beat. The overlay chrome (ticker, counters, frame marks) continues across the cut unchanged, which ties the shots together. | 3.96, 5.79, 7.62, 9.42, 12.17, 19.00, 22.62, 27.67, 29.46, 34.96, 42.25, 53.21, 56.83, 62.29... | ~95-100 |
| 2 | **Flash frame / exposure pulse** | 1-2 frames lifted to cream-white (luma +80 to +150), then back. Often carries a stamp or word. Sometimes a *half* lift (a milky 50% white veil) fires on 3 consecutive beats. | 8.04 (white frame with the SECURED stamp); 49.50 / 49.96 / 50.42 (three pulses on beats, $60B counter); 76.42; 79.58 (white frame plus an accent box behind LOCK) | ~6 |
| 3 | **Accent-hit frame on a masthead** | Not a picture transition. On the cut, the new masthead word shows for 1-2 frames as white text on an **accent-orange filled box**, then drops to plain white. Works as a colour "flash" on the cut. | 49.08 $60B, 79.58 LOCK, 83.00 UNDERCLASS, 159.21 LOCK, 169.42 IT, 181.42 WE'RE, 269.17 WE'RE, 252.75 "0" | ~10 |
| 4 | **Slice / row glitch** | The frame is cut into horizontal (or vertical) strips, each offset or showing the incoming shot, for 2-4 frames. Sometimes the strips carry the flap-board tiles or type. | 26.21 (horizontal band), 47.17 (vertical strips), 74.08 (row slats reveal a shot from the flap graphic), 159.92 (TV row-scan with LOCK IN held), 207.25 (rows of flap zeros), 226.54 (smear plus blocks), 274.08 | ~7 |
| 5 | **Grid-tile displacement glitch** | The frame is split into roughly 8x5 tiles, some offset or blue-tinted, for 2 frames. | 252.50; 110.54 (tiles plus scattered letters of WE'RE SO BACK) | 2 |
| 6 | **Dither band / print slab** | A horizontal band of 1-bit dithered image slides across. A cream paper field covers the rest, then withdraws. | 37.21-37.46 | 1 |
| 7 | **Page peel / diagonal wipe** | A diagonal edge with a warm highlight sweeps across like a turned page. | 40.33 | 1 |
| 8 | **Diagonal strip wipe** | Parallel diagonal white strips (barcode tag strips) sweep across and reveal the next shot between them. | 124.50 | 1 |
| 9 | **Vertical bars wipe** | Black vertical bars (barcode or prison bars) of varying width fill the frame over 3-4 frames, then clear onto the next shot. | 246.67 | 1 |
| 10 | **Torn-paper / jagged wipe** | A jagged, irregular edge crosses the frame, and the new shot is revealed behind it. | 131.17 | 1 |
| 11 | **Ink-blot / halftone mask wipe** | The next shot is revealed through an organic white halftone blotch that eats the subject. | 70.88 | 1 |
| 12 | **Subject cut-out wipe** | The subject is masked (from depth or segmentation). The mask becomes white paper or a line sketch, dissolving into a chart on cream paper. | 105.42 (she turns into an orange line drawing on the chart card) | 1 |
| 13 | **Shape wipe: 8-point spark / starburst** | The clay spark clip shape, or radial rays, expands from a point and wipes to the next shot. Rounded white or black rays, 3-6 frames. **Motif.** | 16.46 (white rounded spark rays), 250.38 (rays burst from her mouth), 301.00 (black and white radial burst around the real star clip), 305.5-306.0 (black rays close to black, the end) | 4 |
| 14 | **Iris / halo wipe** | A thin white ring (the halo prop in the next shot) expands from a point as a circular wipe. It becomes the halo in the incoming shot: a match wipe. | 145.08-145.25 | 1 |
| 15 | **Zoom-through an object** | The object or graphic rushes to camera (price tag at 50.79, chart card at 108.04, terminal window at 241.38), fills the frame, then gives way to the next shot. | 50.79 ($60B tag flies to camera, goes white, reveals her), 108.04 (chart card tilts and flies off, revealing a close-up), 241.38 (the Claude Code window grows from a small panel to full frame), 2.12 (fast push out of the Waymo into light trails) | 4 |
| 16 | **Contact-sheet → zoom** | Cut to a cream page with a 3x2 contact sheet of the next shot's frames. One tile gets a black frame (selected) and scales up to full frame. | 248.25 → 248.67 | 1 |
| 17 | **Panel slide / split** | The outgoing shot compresses into a vertical panel that slides off while the new shot is revealed; or a new shot enters as a tilted card. | 60.00 (shot shrinks to a right-hand strip), 170.71 (new shot slides in as a rotated card from the lower right), 217.71 (bottom-up panel), 288.21 (white panel slides) | ~4 |
| 18 | **3D card flip / hinge** | The frame, treated as a card, rotates in 3D around a vertical axis to black, and the next shot flips in. | 279.38-279.54 | 1 |
| 19 | **Whip / rotation** | A motion-blurred rotation of about 90° as she flies, landing on an aerial of the datacenter. | 228.71-228.83 | 1 |
| 20 | **1-bit threshold transition** | Image to pure black and white posterisation, with a wipe of the 1-bit edge. | 235.67-236.00 (DARK → STARGATE) | 1 |
| 21 | **Dissolve / double exposure** | 3-6 frame crossfade. Rare, and used in soft moments. | 165.04, 188.25 (wide → eye close-up), 264.71, 49.5 (the exposure pulses read like double exposure) | ~4 |
| 22 | **Halftone-cell dissolve** | The halftone dot size grows until the image is a coarse dot field, then a new image resolves. | 271.29-271.42 (face → white room) | 1 (plus the outro ramp) |
| 23 | **Full-frame graphic interstitial** | Cut to a pure motion-graphic card for 0.5-1.5 s: a flap counter, a typographic card, or a terminal. Acts as punctuation. | 10.79-12.17 (black card: AGENTS. then an AGENTS/PEOPLE count with a swarm of detection boxes), 77.79 (flap "18"), 205.50-206.42 (giant flap "02" on graph paper), 241.5-242.7 (terminal /loop) | ~5 |
| 24 | **Match cut on the eye** | Close-ups of her eye with a number *reflected in the iris*, used as the countdown beat. | 155.25 (06), 188.5 (km/s), 204.25 (03 MO), 206.5 (01) | 4 |
| 25 | **Tilted frame (dutch)** | The whole shot is rotated about 8° on the cut. | 214.54 | 1 |

---

## b. Overlay and graphic devices

### Persistent chrome: every frame, 0-306 s

It never leaves, and it continues through every cut. Fine white lines, tiny monospace caps (about 9-11 px tall), letter-spaced.

- **Top-left:** `LOOK 00 / 11`, the look counter. It increments per look.
- **Top-right:** `ESCAPE VELOCITY · SS27` with a tiny waveform or sparkline under it. Under that, a **mini split-flap counter**: two dark flap tiles with digits in accent orange, next to `MONTHS / TO ESCAPE` in mono.
  - The counter reads 18 in 0-150, then 07, 06, 03, 02, 01 and 00 across the bridge.
  - At the end it shows `THERE IS NO UNDERCLASS` or `END OF SHOW`.
- **Left edge:** a vertical ruler with tick marks and tiny numbers (001, 002...). Small accent ticks mark the current value.
- **Bottom:** a hairline rule with a **crawling ticker** (right to left, constant slow speed, mono caps, `✱` separators). Example: `SUNCATCHER T-6 DAYS ✱ LEV 0.61 YR/YR ✱ STOP HIRING HUMANS → RETIRED · SEP 10 ✱ TOKENS BURNED 221,315,000 ▲ ✱ MAC MINIS 13 ✱ UNDERCLASS -18 MO ✱ NVDA ▲ 5.3T ✱ CURSOR → SPACEX $60B ✱ WAYMO RECALL 3,900 ✱ HUGGING FACE × NVIDIA $12.93B ✱ IMO 2026 · 42 / 42`. TOKENS BURNED is a live counter that keeps increasing.
- **Bottom-right:** a running timecode, `00:15:12`.
- **Frame corners:** small `+` crop marks, and a very faint grid over the image.

### CV boxes (computer-vision detections)

**Style**
- Corner brackets only: four L-shaped corners, about 30-60 px arms, 1-1.5 px white. Not a closed rectangle.
- A **label chip** sits on the top edge: a dark or black chip with tiny white mono caps, e.g. `FACE · MODEL 01`, `MODEL 01 · LOOK 01`, `PAYLOAD 01 · WALKING 0.95`, `WAYMO · NO DRIVER`, `BILLBOARD · 0.99`, `BUCKLE · CLOSED`, `AGENT · 0.9x`.
- A **confidence value** (0.97, 0.98) sits outside the top-right corner.
- Often a second line of telemetry beside the box, e.g. `G1 → G2 · 12.8 M / PACE 1.4 M/S`, `AF-C · SEARCHING · 1.9 M`, or `GAZE ↑ 42°`.

**What they box**
- **Mostly her face.** In close-ups and medium shots the box sits on the head, bangs to chin.
- Her **full body** in wide walking shots (19-20, 190-194, 290-300).
- **Objects** as well:
  - the Waymo car (2-9 s)
  - billboards (12-18, 72)
  - the buckle and barcode tag (7-8, 79)
  - loading bays
  - mannequins in a row, each with a small leader label (259)
  - a swarm of about 15-30 small `AGENT` boxes on black (11.25-12.1), counting up against `PEOPLE 00`

So they are not faces only. They are on whatever the line is about.

**Callout leaders**
Thin lines from a feature to a label, e.g.:
- `STREAK · CLAY #D97757` pointing at the orange streak
- `CLIP · SPARK 8-PT` pointing at the star clip
- `SCAN 0000 · AGE 34.0` bars across the face (256-258)
- `THE LAST MARK / WORN SINCE LOOK 00` (304)

**Behaviour**
- Boxes **track** the subject (from Grounding DINO) and follow walking and head turns smoothly. There is **no deliberate jitter or noise**, and no lag.
- On shot start they appear with the cut, or **draw in on the beat**: corners slide out from the centre over about 4-6 frames, and the label chip types on character by character with a block cursor.
- They stay for the whole shot, often 1-3 s.
- **Gag: relabel.** At 14.0 `BILLBOARD · 0.99` gets struck through and becomes `AI BILLBOARD · 0.97` in an accent chip.
- The outro (290-300) boxes her small figure with a circle reticle on the black square beside her.

### Model cards / garment tags

- A cream (#F2EFE8) card with a slight shadow and rounded corners.
- **Header:** `LOOK 00 / 11 · TITLE CARD` in mono, plus a small accent `SS27` chip at top right.
- **Title:** a bold condensed sans headline, e.g. `ESCAPE VELOCITY`, `AGI ERA`, `DAD CAP`, `SHOES OFF`, `CASHMERE`, `THE IMMORTALS`, `SEAT 1 OF 3`.
- **Body:** key-value rows in mono, e.g. `MODEL 01 / SHELL OPTIMISM / SIZE AGI / MIC ON / MADE IN SAN FRANCISCO`.
- **Footer:** a row of laundry-care symbols, a barcode, and a serial like `EV-00 / 18`.
- **Placement:** in the empty field beside her head or torso, usually on the side she faces away from. Size is about 10% of frame width.
- **Animation:** it slides or scales in on a beat, and rows **type in one at a time** over about 1 s (4.5-5.3 s). It stays for the whole shot.
- **Variants:**
  - a thermal **receipt** with a torn bottom edge ("Half your pay in tokens", 36.75-40)
  - a shipping label `CONTENTS: AGI`
  - a hanging price tag `$60,000,000,000 · AT THE DOOR · NORTH BEACH`
  - `CONTENT CREDENTIALS` cards (245)

### Stamps

- A rubber-stamp rectangle rotated about -5° to -8°, with a double border.
- Accent orange with a grainy, distressed ink texture.
- Words include `SECURED`, `ALARMED`, `MILD.`, `LOCKED`, `RESOLVED`, `SOLD`.
- Black-on-white **stickers** are also used, rotated: `NOT OURS`, `NOT`, `DOES NOT FIT ✗`.
- A stamp **slams in** on the stressed word: it scales from about 130% to 100% in 2-3 frames, sometimes on a flash frame (8.04), then holds.

### Split-flap board: the through-line device

- Dark charcoal tiles, each with a horizontal hinge line through the middle.
- Off-white mono caps; digits often in accent.
- **Flip animation:**
  - Each tile scrambles through random glyphs for about 6-18 frames. The glyphs include non-Latin junk: `ñ ö ĥ 9 ʒ ¥ Ω`.
  - Tiles then settle **left to right in a cascade**, with a stagger of about 1-2 frames per tile.
- **Uses:**
  - A **lower-third band** across the bottom of the intro: `18 MONTHS TO ESCAPE THE PERMANENT UNDERCLASS`. It scrambles in at 0.0-1.0; the number counts 99 → 60 → 38 → 20 → 18.
  - Full-screen **counter cards**: 77.79 (`18`), 205.5 (a giant `02` on graph paper with dimension callouts `LEAF · 04 → 02`).
  - **Billboards** turn into flap walls (73.3).
  - The **highway gantry signs** in the bridge (186-214): the boards read `ESCAPE VELOCITY 5.9 → 11.2 KM/S`, `LONGEVITY ESCAPE VELOCITY +1 YR/YR PAST 2029`, `PERMANENT UNDERCLASS 06 → 00 MONTHS`, then `THERE IS NO / UNDERCLASS`.
  - The **outro wall board** `THERE IS NO UNDERCLASS` → `END OF SHOW.`, with `LOOKS 11/11` and `MONTHS 00`.

### Charts and figure panels

- Cream paper panels with a `FIG. N · TITLE` mono header and `BOARD 0N` at top right, black hairline axes, and tiny mono labels.
- Data lines **draw progressively** with a dot at the head, advancing on beats. Values tick up as a counter.
- **Placement:** the right third of the frame beside her, about 30% of frame width.
- **Examples:**
  - escape-velocity orbit diagram, 186-188: the projectile falls back at 8.4 km/s, then climbs off at 10.1-11.2
  - life-expectancy-gained curve crossing the "1 YR/YR ESCAPE" dashed line, 192-194
  - step-down countdown chart 18 → 00, 202-204
  - sentiment sine "SO OVER ↔ SO BACK" that grows extra cycles and then spikes to ATH, 250-252.5
  - 10x6 dot-matrix population that fills and drains, 254-255
  - bar chart "it's so over", 107
  - LEV curve on the face, 257-258
  - class-mobility ladder, 81-84
  - speedometer, 84.5
  - ECG line, 168-170

### UI panels

- **Claude Code terminal**, dark or cream. It has a title bar `Claude Code ~/bridge · status: pending`, typed tool calls `Read(gantries/01..03)`, and a prompt `> did we make`.
  - Examples: 36-37 (`/loop keep all 13 grinding`, 24:00:00 uptime), 210-212, and 241-244 (`/loop make me happier`, `Happiness.measure() 0.652 ▲ +0.007 per loop`, `✳ You're absolutely right!`, a growing bar chart).
- **Toggle settings** panel: `LOCK-IN MODE ● ON`, 84 and 223.
- **Survey slider**: UNREASONABLE ↔ NOT UNREASONABLE, with a marker that slides, 28.
- **Mono data tables**: guest list with share of seats, the show report, and the `LOOK 01..11` notes list that types out line by line, 296-300.

### Counters

Numbers roll or tick on every frame. The last digit is often mid-roll, in a slot-machine style.

- `v 3.8 → 11.2 km/s`
- `$2,837,000,000 → $60,000,000,000`
- `1,434,923` puzzles
- `AGENTS 02 → 15 / PEOPLE 00`
- `2025 → 2026 / 34.0`, bio age
- `T-6 … T-1`
- `08 PX → 60 PX`, the halftone cell size shown as a readout

### Scan lines, grids and texture

- A faint **graph-paper grid** covers everything.
- **Horizontal scan-bar callouts** (translucent grey bars with a mono label) sweep across the face at 255-258.
- Circle **reticles** around the eye or iris (188-190, 204).

---

## c. Kinetic typography

Every sung word is on screen on its aligned time. Five families of type are used.

| Mode | Font style | Size (at 1080p) | Placement | Colour | Entry and exit |
|---|---|---|---|---|---|
| **Subtitle** | Neo-grotesk sans (Helvetica / Inter), regular | ~22-26 px | Bottom-left, above the ticker, on a **translucent cream chip** (white at about 80%), or plain white on dark shots | Dark on cream. The **current word is accent orange**, or white on a black inverted chip (drop). | Each word appears on its onset, hard with no fade, and the line builds left to right. The previous line clears when the next starts. It persists under the other modes, so the lyric is always readable. |
| **Coverline** | Same grotesk, bold | ~40-50 px, 2-3 lines stacked | In the empty field beside her: top-left or right third, aligned to a hairline rule | White. The **newest word is accent**, then turns white when the next word arrives. | Word by word on onsets. A hairline underline draws under the line. Examples: `Look 01. AGI era. Not unreasonable.`, `Look 04. Shoes off in North Beach. $60B at the door.` |
| **Masthead** | Tall condensed sans (DIN Condensed / Bebas style) | 150-300 px, one or two words | In negative space. Sometimes **behind her** (depth-occluded) or ghosted at 20-30% opacity behind the subject. | White. The **first 1-2 frames sit on an accent-filled box**, then plain. Big numerals can be accent (the orange `0` at 252.75). | Hard on the stressed word, held for the shot. Examples: `AGENTS.`, `IN.`, `UNDERCLASS`, `LOCK`, `$60B`, `CASHMERE.`, `ZERO-DAY.`, `11.2 KM/S.`, `3.` `1.` `0.` |
| **Strobe / word-by-word (drop)** | **Extended wide geometric sans** (Eurostile Extended / Michroma) | 80-150 px, one word at a time | Top-left or top band, sometimes crossing her head | Black on white, alternating with white on a black box, frame to frame | One word per beat or eighth, each **replacing** the last: `FEEL` `THE` `AGI.`, `LEAN` `PROOFS` `PHAGES.` `ENZYMES.` `KIDNEYS.` `BOYS.`, `WE'RE` `SO` `BACK!`, `SLOPACOLYPSE?`. Some letters are knocked out by her silhouette (the `O` in SLOPACOLYPSE at 243.5). |
| **Mono / flap caps** | Monospace, wide letter-spacing | 12-60 px | Chrome, boards, the lower-third flap band | Off-white, with accent digits | Scramble-settle (see split-flap) |
| Accents | Light **italic serif** (`Look 00.`, 19.5); lowercase **mono stacked vertically** (`we / are / so / back`, 303-304, with the current word in accent and a cursor) | | | | |

**Knock-out and behind-subject text** (uses a depth or segmentation matte):

- 13-14 and 16.75-18.75: `THIS IS NOT AN AI BILLBOARD.` sits on the billboard *behind* her. Her head and shoulder occlude `NOT` and `BOARD`.
- 26.75-29.5: `A G I   E R A` is laid on the **runway floor plane** in perspective, huge and letter-spaced, low in frame.
- 184.8-188: a ghosted grey `ESCAPE` behind her.
- 245-246.5: `NOT OURS.`, where her head covers part of `OURS`.
- 248.75-250: ghosted halftone `THE` and `BOX.` behind her.
- 259: `FEEL THE AGI` behind the mannequins and her head.
- 264.6: `ESCAPE VELOCITY...` behind her.

**Strike-through edits (gag):**

- `PREPARE TO ~~DIE~~ WALK.`: DIE is struck and small, and WALK has an accent underline (18.25-18.9).
- `~~It's So Over region?~~` / `We're So Back region.` (240-241).
- `NOT ~~AI~~ [SL]`, with accent bracket marks (139.6).

**Colour rule:** mono (white, black, cream), plus **one accent, clay orange**, used on:

- the newest word
- the first frame of a masthead
- stamps
- flap digits
- chart highlights
- the ONE lamp or streak in the plate

No other hues are added by the graphics.

---

## d. Image treatments

- **Halftone / print pass on everything.**
  - A fine dot screen is always visible over the footage. It is strongest in the white sections (240-306), where every grey becomes visible dots.
  - Verses carry grain plus a fine dot. Faces in the final chorus (250-258) get heavy **magazine-print contrast halftone**, with crushed blacks and warm skin.
  - The outro **ramps halftone cell size** from 7 px to 60 px over 296-301, shown by a `NN PX` readout card. The image dissolves into big dots and then the starburst.
- **1-bit / dither.** The dither band at 37.2 and the 1-bit threshold at 235.7-236 (DARK / STARGATE) are posterised pure black and white. The drop is desaturated and high-contrast.
- **Grade per section:**

| Time | Grade |
|---|---|
| 0-80 | Night: blue-black with a single red lamp. Red car tail-lights and red status LEDs are the only warm light. |
| 80-93 | Warm amber / copper (the hallway of lit windows). |
| 93-112 | Cold blue tunnel. |
| 112-180 | Mixed: tungsten interiors, grey-white grid room, dawn. |
| 186-215 | Pale foggy blue-grey highway day. |
| 215-306 | High-key white paper, near-monochrome, with the clay accent (orange streak, star clip). |
| 288-290 | Warm colour portrait (the streak saturated). |

- **Motion on stills (2.5D plates).** Most footage is Seedance video. The plates get:
  - a slow push-in or drift, about 2-5% over the shot
  - depth parallax: the subject moves against the background
  - pose swaps on the beat between 2-3 stills of the same set-up (29.46 → 30 → 31.25)

  Examples: 12.2-14.9 (billboard), 36-37 (Mac minis wall), 186-188 and 198-201 (face held, graphics animate), 245-246.5 (cut-out with an animated white outline offset).
- **Cut-out sticker outline.** At 245.25-246.5 a white outline, offset from the subject matte, animates around her like a sticker. At 105.4 she turns into a line drawing.
- **Mirror / flip.** At 116 there are two copies of her profile, mirrored and facing each other. At 118 she is cloned into a crowd of agents.
- **Rotation.** A dutch tilt of about 8° at 214.5, a rotated card at 170.7, and a 90° whip at 228.7.
- **Freeze frames.** The eye close-ups (188.5-190.5, 204.25-205.25, 206.5-207.0) are near-frozen while the numbers in the iris roll. The final star clip (301-306) is a near-still macro with the graphics building.
- **Speed.** Motion-blur smear at 226.5-226.7 (her jump, with a speed readout of 0.2 → 11.1 km/s). There is no obvious speed ramp on footage; the "ramp" is done with counters.
- **Pixelation / mosaic.** Blocky mosaic over the face on "CSI: enhance" (31.75-32.25), then a pair of pixel "deal-with-it" sunglasses drops onto her face (32.3-33).

---

## e. In-scene text (billboards, screens, signs)

The plates were generated with **"no text"**, so every sign surface is blank. The code composites text onto it, and that text is **always animated in sync with the lyric**, never static:

- **Billboard 12.2-18.9.**
  - The blank lit billboard gets `THIS IS NOT AN AI BILLBOARD.` word by word on the lyric onsets. It is large grotesk bold, black on the pale screen, perspective-matched, and **occluded by her** (she stands in front).
  - The CV label on the billboard flips from BILLBOARD to AI BILLBOARD.
  - It then adds `PREPARE TO ~~DIE~~ WALK.`
  - A cutaway card at lower left (15-16.5) quotes the billboard with a map of its location.
- **Billboard 72.7-73.5.** Small `THAT'S SO AGENTIC.` in the corner, then the board **tiles into a split-flap grid** that scrambles to `18 MONTHS TO ESCAPE`.
- **Highway gantries 186-214.** The overhead signs are replaced with split-flap boards that flip on the words. They carry the bridge's argument: escape velocity, then LEV, then the underclass countdown, then THERE IS NO UNDERCLASS.
- **Eyes as screens.** Numbers (`06`, `11.2 KM/S`, `03 MO`, `01`) are composited **inside the iris** as a reflection, with a circle reticle.
- **Outro wall** (290-300). A flap board next to her acts as the in-world scoreboard.
- **Screens.** The Mac minis wall (35-37) shows a glowing blue screen texture with no readable text; the terminal overlay beside it carries the words. The T-shirt print at 124 is an image, not text.

The rule: **world text is written by the graphics layer, timed to the words, perspective-matched and depth-occluded.** No legible generated text is left in the plates.

---

## f. Pacing

- **Verse 1 (26-80): about one shot per bar or faster.**
  - Median 1.5 s, which is 36 shots in 54 s. One look per 2-4 bars; each look gets 2-4 shots (walk, close-up, detail).
  - Within each shot, **graphics change on every word or beat**: coverline words, card rows, counter ticks, stamp. So information changes 2-4 times per second even when the picture does not.
- **Chorus 1 (80-112): slower cuts, about 1.4 bars (2.5 s).**
  - Longer singing Seedance takes. One masthead word per shot (`IN.`, `UNDERCLASS`, `LOCK`, `ESCAPE VELOCITY...`).
  - A chart or instrument builds over the hold.
- **Verse 2 / chorus 2 (112-190): 1.9 s median.** Same rhythm as verse 1, with more designed transitions (105, 108, 110, 124, 131, 145, 155, 159, 165, 170).
- **Bridge (186-215): longer holds, 3-4 s.**
  - One image is held while the **graphics carry the change**: flap boards flip, charts draw, subtitles build.
  - Then punctuated by fast eye inserts and full-screen counters (1 s each) as the countdown speeds up (06 → 03 → 02 → 01 → 00).
- **Drop (222-240): fast.** Word per beat. Shots of 0.4-1.5 s, with rapid cuts at 234.7-235.7 (five cuts in one second), 1-bit, the strobe type.
- **Final chorus (250-290): mixed.** Half-bar face close-ups with a word strobe (`WE'RE / SO / BACK!`), alternating with 2-4 s white-room holds with a chart.
- **Outro (290-306): the longest shot, 10.8 s (290.2-301.0).** One static wide of her by the black square. Board, report and notes list type in progressively while the halftone coarsens. Then a 5 s macro of the star clip, with callouts and the final card, and a starburst to black.
- **Summary:** images change about once per bar, and graphics change on every beat. Long holds (over 3 s) only happen when a graphic is doing the storytelling.

---

## g. The 15 most distinctive devices

### 1. Split-flap lower-third countdown (0.0-4.0)

- **Geometry:** a full-width band of dark flap tiles at about 72% of frame height, 44 tiles in mono caps, tile height about 36 px, with a 1 px gap and a hinge line.
- **Start:** at t=0 the tiles show random glyphs.
- **Settle:** from 0.25 s, tiles settle left to right (about 1 frame of stagger each) into `NN MONTHS TO ESCAPE THE PERMANENT UNDERCLASS`, while tiles to the right keep scrambling.
- **Count:** the number tiles are accent orange and count down 99 → 60 → 38 → 20 → 18 on successive beats, then lock.
- **Captions:** small mono captions above and below (`DEPARTURES · SS27 · COLLECTION 01` / `STATUS · BOARDING` → `LOCKED 18 MO`).
- **Carry and exit:** it persists across the cut to the highway, then at 4.0 it collapses into the small top-right counter chip, which carries the number for the rest of the video.

### 2. Tracked CV corner-box with typed label (throughout; e.g. 0.5-5.5, 19-20, 190-194)

- **Box:** the face or body bbox per frame from tracking, with 10% padding.
- **Drawing:** four L corners (arm = 18% of the shorter side, 1.5 px white), drawn in over 5 frames from the box centre on a beat.
- **Label chip:** on the top-left edge, 9 px mono caps on a black chip, typing at 2 chars per frame with a block cursor. Confidence `0.98` outside the top-right.
- **Telemetry:** optionally a second telemetry line to the right (distance, pace).
- **Behaviour:** no jitter. It follows smoothly and stays for the shot.
- **Variants:** relabel with strike-through and an accent chip (BILLBOARD → AI BILLBOARD, 14.0); a swarm of 20+ small boxes that count up (11.25-12.1).

### 3. Look card / garment tag (4.25-5.75; recurs every look)

- **Card:** cream, about 190x130 px, beside her face.
- **Contents:**
  - header `LOOK 00 / 11 · TITLE CARD`, plus an accent `SS27` chip
  - condensed bold title
  - 4-6 mono key/value rows that type in one per beat-eighth
  - care symbols and a barcode at the bottom
- **Entry:** slides 20 px from the side with an opacity ramp over 4 frames.
- **Later variants:** receipt, shipping label, hang-tag, credentials card.

### 4. Word-on-billboard with occlusion and strike-through (12.2-18.9)

- **Setup:** track the four corners of a blank billboard (a homography). Draw the lyric word by word on its onsets in bold grotesk, black, left-aligned in the board, with a thin accent underline under the newest word.
- **Occlusion:** composite the subject matte over the text so she occludes it.
- **Strike-through:** replace a word with a struck-through small version plus the new word in the same line (`DIE` → `WALK.`).
- **Cutaway:** a dark card quotes the text with a mini street map.

### 5. Masthead with accent-hit frame (49.08 $60B, 79.58 LOCK, 83.0 UNDERCLASS, 181.4 WE'RE...)

- **Size and placement:** a giant condensed word (150-300 px) in negative space, placed on the cut or the stressed syllable.
- **Hit frame:** for the first 1-2 frames draw it as white on an accent-orange rectangle (padding 0.15 em). Then remove the box and hold it white for the shot.
- **Numbers:** numeric mastheads roll their digits, or show a small mono exact value under them (`$2,837,000,000 …`).

### 6. Coverline that builds word by word with an accent head (26.25-29.5, 36-40, 49-51)

- **Type:** a 2-3 line bold grotesk block at about 45 px, in the empty third.
- **Timing:** each word appears on its onset, hard, in accent. When the next word appears, the previous turns white.
- **Rule:** a hairline rule under the block draws left to right over the line's duration, with a mono tag at its end (`LOOK 01 / 11 · AGI ERA`).
- **Subtitle:** the subtitle at the bottom-left mirrors it with the same accent word.

### 7. Explaining chart that draws on the beat (186-188 orbit, 192-194 LEV, 202-204 steps, 250-252 sentiment)

- **Panel:** a cream paper card at about 32% of frame width on the right. Header `FIG. N · TITLE · BOARD 0N` in mono.
- **Drawing:** axes appear first. The data line extends on each beat, with a solid dot at the head and a mono readout of the head value that ticks (`v 8.4 KM/S · FALLS BACK` → `10.4 · CLIMBING`).
- **Hit:** on the key lyric word, the line crosses a dashed threshold, or the curve spikes out of the box (`ATH`).

### 8. Split-flap gantry boards replacing in-scene signs (186-214)

- **Setup:** track the overhead highway sign rectangles and replace them with flap boards (dark tiles, mono caps, accent digits).
- **Flip:** on each lyric phrase the boards flip (per tile 6-18 frames of scramble, cascading left to right), so the world itself says the lyric.
- **Coverage:** numbers count across shots, e.g. 5.9 → 11.2 km/s during the wide, continued in the eye close-up.
- **Punchline:** the last board spells `THERE IS NO / UNDERCLASS` (212-214). A matching overlay flap block at lower-left carries the same text.

### 9. Number in the iris (155.2, 188.5-190.5, 204.25-205.2, 206.5-207)

- **Shot:** an extreme close-up of her eye, nearly still.
- **Number:** the countdown number sits centred on the pupil in thin mono (`03 / MO`), with screen blend at about 70%. A thin circle reticle surrounds the iris, and a small dimension line and mono value sit below.
- **Masthead:** a huge condensed ordinal sits at the bottom-left (`3.`, `1.`).
- **Placement:** used as the fast punctuation between bridge holds.

### 10. Full-frame flap counter card (77.79 `18`, 205.5-206.4 `02`)

- **Card:** cut to graph paper (cream) or dark. Two giant flap tiles (about 40% of frame height) show the count.
- **Annotation:** thin dimension callouts with mono leader labels (`LEAF · 04 → 02 / FALL 0.28 S`, `HINGE · AXLE Ø 2.9`), and a timeline scale under it with a dot marker.
- **Flip:** the flap physically flips once, on the downbeat.
- **Length:** holds for about 1 s.

### 11. Spark-shape wipe (16.46, 250.38, 301.0, 305.5)

- **Motif:** the clay 8-point star from her hair clip is the transition shape.
- **Build:** 8 rounded rays (capsules) grow radially from a point, e.g. her mouth or the clip, over 3-5 frames. They are filled white (16.5), cream and black (250.4), or black on white radial stripes (301). The next shot is revealed inside or behind the rays.
- **End:** at 305.5-306 black rays converge from the edges to black.

### 12. Contact-sheet select → zoom (248.25-248.67)

- **Layout:** cut to a cream page with a 3x2 grid of stills of the next shot, with small mono captions under each and a notes column at right.
- **Select:** on the beat, one tile gets a heavy black border (selected).
- **Zoom:** over 3 frames that tile scales to full frame and becomes the live shot. A coverline word (`IN`) sits top-left throughout.

### 13. Terminal zoom-through (241.3-243.0)

- **Grow:** a small Claude Code window (cream, mono, title bar) appears over her torso, then scales to full frame over 3 frames.
- **Type:** `> /loop` in large mono (about 60 px) with a block cursor on the lyric.
- **Loop:** status lines tick (`Looping… iteration 0004 of ∞`, `Happiness.measure() 0.652 ▲ +0.007 per loop`), a bar chart grows one bar per beat, and `✳ You're absolutely right!` pops.
- **Exit:** it shrinks back to a top-left panel as the footage returns.

### 14. Drop word strobe in wide extended type with silhouette knock-out (225-234, 243-244, 250-252)

- **Strobe:** one word per beat in extended geometric sans (Michroma-like, 100-150 px) at the top band. Each word replaces the previous.
- **Alternation:** black text on white, or white on a black box.
- **Knock-out:** letters overlapping her silhouette are drawn behind her or clipped by her matte.
- **Subtitle:** it shows the full line with the current word in an inverted black chip.
- **Side stack:** at right, a stack of spec-sheet cards (`LEAN PROOF`, `PHAGE`, `ENZYME · ART`, `KIDNEY · 99 DAYS`) adds one per word.

### 15. Halftone-cell ramp outro (296-301) and exposure-pulse triplet (49.5-50.4)

- **Ramp:** during the final 10.8 s wide, a card at lower-left reads `SCREEN · DOT PITCH / NN PX` with a dot scale. On each bar the print-pass halftone cell size steps up: 7 → 8 → 10 → 12 → 16 → 21 → 27 → 36 → 47 → 60 px. The whole image becomes coarse dots, then the starburst transition hits.
- **Pulse:** separately, as a beat device, the frame gets a 50% cream veil for 2 frames on three consecutive beats while a counter races, like light leaks on the kick.
