# REVENUE VELOCITY — production folder

Draft music video for TaleX, made with the ESCAPE VELOCITY method (see `../prompts/`) on a zero-budget stack:
existing character plates from `../midjourney/`, a code-driven motion engine, headless Chromium, ffmpeg.

## What the draft is (and isn't)

- **Picture:** final-ish. 34 shots in 8 chapters, every word of our lyrics on its own time, explaining graphics per line,
  2.5D depth parallax, colour halftone print pass, split-flap through-line counter, CV frames, transitions.
- **Sound: temporary.** No Suno account was reachable from the build machine, so the soundtrack is a stand-in:
  - the *instrumental* of the original "Escape Velocity" (stems split with demucs), re-edited on bar lines to 2:07;
  - our **spoken** lines voiced with ElevenLabs TTS (free tier) and placed on the bar grid;
  - the original's sung vocal kept only for "(It's so over?) WE'RE SO BACK!" (identical words);
  - chorus lines 1–4 are instrumental under the on-screen type (no singer yet).
  This is a timing scaffold only — do not publish it. It is the author's composition.
- **Numbers are placeholders.** Everything in `engine/data/facts.json` (revenue counter, split %, buyback bars,
  uptime, waiting list, order) is illustrative. Replace with real TaleX/RoamFi figures.

## Layout

```
rv/
  SUNO.md               style / exclude / lyrics fields, ready to paste
  data/plates.json      which Midjourney plate each shot uses
  data/lyrics.json      lyric sheet as tokens ([display, spoken])
  tools/
    beats.py            beat map + downbeats (librosa)
    build_audio.py      temp soundtrack + engine/data/timeline.json (words, beats, sections)
    tts.py              ElevenLabs placeholder voice with character timestamps
    depth.py            plate prep: 1920px JPEG + depth map (Depth Anything V2 Small, CPU)
    faces.py            face boxes for CV frames and camera mapping (OpenCV YuNet)
  engine/
    index.html, src/    the JS engine (every frame is a pure function of t)
      core.js           math, beat grid, lyric lookups
      gl.js             WebGL2 plate pass: depth parallax, grade, CMYK halftone / dither / mono, depth cut-out
      type.js           kinetic lyrics: subtitle, masthead (strobe/stack), coverline
      gfx.js            CV boxes, garment tags, chat windows, charts, gauge, split-flap, quad mapping, care symbols
      chrome.js         HUD frame, revenue counter, look counter, beat readout, ticker
      trans.js          flash, whip, slices, flap-wipe, zoom-through-box, CRT, paper wipe, fade, cross
      scenes.js         the storyboard as code
      main.js           shot render, transitions, API for render.py
    data/               timeline.json, facts.json, faces.json
    assets/             plates (+ depth), fonts (OFL)
    render.py           sheet / lyrics / video
  work/                 (git-ignored) stems, TTS, temp mix, renders
```

## Run

```bash
pip install playwright librosa soundfile numpy pillow   # + torch, demucs, transformers, opencv for tools/
cd rv/engine
python3 render.py sheet 5 20 64 --out /tmp/s.jpg        # contact sheet
python3 render.py lyrics                                # must print N/N
python3 render.py video --workers 4 --out ../work/rv.mp4
```

## Swapping in the real Suno take

1. Generate with `SUNO.md`, pick the take by ear, save it as `rv/work/suno.wav`.
2. `python3 tools/beats.py work/suno.wav work/ref_beats.json` and split stems with demucs.
3. Replace the TTS/cut logic in `tools/build_audio.py` with word alignment of the new vocal
   (forced alignment of `data/lyrics.json` against the vocal stem, e.g. torchaudio MMS_FA), writing the same
   `engine/data/timeline.json` format: `beats[{t,down}]`, `sections[]`, `lines[{id,tokens[{w,t0,t1}]}]`.
4. `scenes.js` addresses time by **bar number** (`B(n)`) and **word** (`wordT(line, word)`), so shots re-time
   themselves; re-check the bar numbers of the section starts and re-run `render.py lyrics`.
