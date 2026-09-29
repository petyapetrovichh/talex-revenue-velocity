# Final track -> engine/data/timeline.json: beats/downbeats of the track + word times (MMS_FA on the vocal stem).
# Lines the singer skipped come out squeezed; they're reported so they can be fixed by ear.
import json, os, re, numpy as np, soundfile as sf, torch, torchaudio
root = os.path.dirname(os.path.abspath(__file__)) + '/..'
W = root + '/work/final'
bt = json.load(open(W + '/beats.json')); B = np.array(bt['beats']); PH = bt['downbeat_phase']
LY = json.load(open(root + '/data/lyrics.json'))['lines']
norm = lambda s: re.sub(r"[^a-z' ]", ' ', s.lower()).replace("'", ' ').split()
words, owner = [], []
for li, l in enumerate(LY):
    for ti, tk in enumerate(l['t']):
        for w in norm(tk[-1]): words.append(w); owner.append((li, ti))
b = torchaudio.pipelines.MMS_FA; model, tok, aligner = b.get_model(), b.get_tokenizer(), b.get_aligner()
v, sr = sf.read(W + '/stems/htdemucs/suno/vocals.wav', always_2d=True)
wav = torchaudio.functional.resample(torch.tensor(v.mean(1), dtype=torch.float32)[None], sr, b.sample_rate)
with torch.inference_mode():
    em, _ = model(wav); spans = aligner(em[0], tok(words))
fps = em.shape[1] / (wav.shape[1] / b.sample_rate)
T = {}
for (li, ti), sp in zip(owner, spans):
    a, c = sp[0].start / fps, sp[-1].end / fps; k = (li, ti)
    T[k] = (min(T[k][0], a), max(T[k][1], c)) if k in T else (a, c)
lines = []
for li, l in enumerate(LY):
    toks = []
    for ti, tk in enumerate(l['t']):
        a, c = T.get((li, ti)) or T.get((li, ti - 1)) or (0, 0)
        toks.append(dict(w=tk[0], t0=round(a, 3), t1=round(c, 3)))
    span = toks[-1]['t1'] - toks[0]['t0']
    lines.append(dict(id=l['id'], sec=l['sec'], kind=l['kind'], tokens=toks, squeezed=span < 0.1 * len(toks)))
dur = len(v) / sr
beats = [dict(t=round(float(x), 4), down=(k - PH) % 4 == 0) for k, x in enumerate(B)]
json.dump(dict(duration=round(dur, 3), audio=os.path.abspath(root + '/gen/in/suno-final.wav'), beats=beats, lines=lines),
          open(root + '/engine/data/timeline.json', 'w'), indent=1)
bars = [x['t'] for x in beats if x['down']]
for l in lines:
    t0 = l['tokens'][0]['t0']; bi = max([i for i, x in enumerate(bars) if x <= t0 + 1e-3] or [0])
    print(f"{l['id']:4s} {t0:7.2f}-{l['tokens'][-1]['t1']:7.2f} bar {bi:3d} {'SQUEEZED ' if l['squeezed'] else ''}{' '.join(t['w'] for t in l['tokens'])}")
print('duration', round(dur, 2), 'bars', len(bars))
