# Re-time the edit to a real song take (e.g. the Suno track).
#   python3 tools/align.py work/suno.wav [--vocals work/stems/.../vocals.wav]
# 1. beat map of the new take (librosa)
# 2. word-level forced alignment of data/lyrics.json against the vocal stem (torchaudio MMS_FA)
# 3. storyboard warp: scenes.js addresses time in *storyboard bars* (the draft's bar grid). Each draft
#    lyric line start is matched to the same line in the new take and draft bar times are warped
#    piecewise-linearly through those anchors, so every shot, cut and graphic lands on the same word.
# Writes engine/data/timeline.json (same format + storyBars + audio path for render.py).
import argparse, json, os, re, subprocess, numpy as np
root = os.path.dirname(os.path.abspath(__file__)) + '/..'
ap = argparse.ArgumentParser(); ap.add_argument('song'); ap.add_argument('--vocals'); ap.add_argument('--out', default=root + '/engine/data/timeline.json'); ap.add_argument('--draft', default=root + '/engine/data/timeline.json')
a = ap.parse_args()

import librosa, soundfile as sf, torch, torchaudio
draft = json.load(open(a.draft))
if 'draft' in draft: draft = draft['draft']  # always warp from the original draft grid
LY = json.load(open(root + '/data/lyrics.json'))['lines']
ORDER = [l['id'] for l in LY if l['id'] != 'c5']
ORDER.insert(ORDER.index('c4') + 1, 'c5a'); ORDER.insert(ORDER.index('c5a') + 1, 'c5b')
TOK = {l['id']: l['t'] for l in LY}; TOK['c5a'] = TOK['c5b'] = TOK['c5']

# --- 1. beats ---------------------------------------------------------------------------------
y, sr = librosa.load(a.song, sr=22050, mono=True); dur = len(y) / sr
oenv = librosa.onset.onset_strength(y=y, sr=sr, aggregate=np.median)
_, beats = librosa.beat.beat_track(onset_envelope=oenv, sr=sr, tightness=400, units='time')
S = np.abs(librosa.stft(y, n_fft=2048, hop_length=512)); low = librosa.onset.onset_strength(S=librosa.amplitude_to_db(S[:40]), sr=sr)
fr = librosa.time_to_frames(beats, sr=sr, hop_length=512).clip(0, len(low) - 1); ph = int(np.argmax([low[fr[p::4]].mean() for p in range(4)]))

# --- 2. vocal stem + alignment ------------------------------------------------------------------
voc = a.vocals
if not voc:
    subprocess.run(['python3', '-m', 'demucs', '-n', 'htdemucs', '--two-stems=vocals', '-o', root + '/work/stems_take', a.song], check=True)
    voc = f"{root}/work/stems_take/htdemucs/{os.path.splitext(os.path.basename(a.song))[0]}/vocals.wav"
bundle = torchaudio.pipelines.MMS_FA
model, tokenizer, aligner = bundle.get_model(), bundle.get_tokenizer(), bundle.get_aligner()
wav, vsr = torchaudio.load(voc); wav = torchaudio.functional.resample(wav.mean(0, keepdim=True), vsr, bundle.sample_rate)
norm = lambda s: re.sub(r"[^a-z' ]", ' ', s.lower()).replace("'", ' ').split()
words, owner = [], []  # flat spoken words and (line, token index) they belong to
for lid in ORDER:
    for ti, tk in enumerate(TOK[lid]):
        for w in norm(tk[1] if len(tk) > 1 else tk[0]): words.append(w); owner.append((lid, ti))
with torch.inference_mode():
    em, _ = model(wav)  # (1, frames, labels); ~50 frames/s
    spans = aligner(em[0], tokenizer(words))
fps = em.shape[1] / (wav.shape[1] / bundle.sample_rate)
lines = {}
for (lid, ti), sp in zip(owner, spans):
    t0, t1 = sp[0].start / fps, sp[-1].end / fps
    L = lines.setdefault(lid, {}); cur = L.get(ti)
    L[ti] = (min(cur[0], t0), max(cur[1], t1)) if cur else (t0, t1)
out_lines = []
for lid in ORDER:
    toks = [dict(w=tk[0], t0=round(lines[lid][i][0], 3), t1=round(lines[lid][i][1], 3)) for i, tk in enumerate(TOK[lid])]
    base = 'c5' if lid.startswith('c5') else lid
    sec = next(l['sec'] for l in LY if l['id'] == base)
    out_lines.append(dict(id=lid, sec=sec, kind='sung' if lid.startswith('c') else 'spoken', tokens=toks))

# --- 3. storyboard warp -----------------------------------------------------------------------------
dl = {l['id']: l['tokens'][0]['t0'] for l in draft['lines']}; nl = {l['id']: l['tokens'][0]['t0'] for l in out_lines}
anc = sorted([(0.0, 0.0)] + [(dl[i], nl[i]) for i in dl if i in nl] + [(draft['duration'], dur)])
dx, nx = np.array([p[0] for p in anc]), np.array([p[1] for p in anc])
keep = np.concatenate([[True], (np.diff(dx) > 0.05) & (np.diff(nx) > 0.05)]); dx, nx = dx[keep], nx[keep]
dbars = [b['t'] for b in draft['beats'] if b['down']]
story = [round(float(np.interp(b, dx, nx)), 4) for b in dbars]
beats_out = [dict(t=round(float(b), 4), down=(k - ph) % 4 == 0) for k, b in enumerate(beats)]
sections = [dict(name=s['name'], t0=round(float(np.interp(s['t0'], dx, nx)), 3), t1=round(float(np.interp(s['t1'], dx, nx)), 3)) for s in draft['sections']]
json.dump(dict(duration=round(dur, 3), audio=os.path.abspath(a.song), beats=beats_out, storyBars=story, sections=sections, lines=out_lines, draft=draft), open(a.out, 'w'), indent=1)
print('aligned', sum(len(l['tokens']) for l in out_lines), 'tokens; duration', round(dur, 2))
for l in out_lines: print(f"{l['id']:4s} {l['tokens'][0]['t0']:7.2f}  {' '.join(t['w'] for t in l['tokens'])}")
