# Temp soundtrack for the draft: an edit of the reference instrumental on bar boundaries,
# our TTS spoken lines placed on the bar grid, the reference vocal only where its words
# match ours ("(It's so over?) WE'RE SO BACK!"). Writes work/rv_temp.wav + engine/data/timeline.json.
# When the real Suno take exists, replace this with alignment of that take; the timeline format stays.
import json, os, numpy as np, soundfile as sf, librosa
root = os.path.dirname(os.path.abspath(__file__)) + '/..'
W = root + '/work'; SR = 44100
bt = json.load(open(W + '/ref_beats.json')); B = np.array(bt['beats']); PH = bt['downbeat_phase']
bar = lambda i: float(B[PH + 4 * i]); beat = lambda i, k: float(B[PH + 4 * i + k])
st = W + '/stems/htdemucs/Escape Velocity/'
stems = {k: sf.read(st + k + '.wav')[0] for k in ('drums', 'bass', 'other', 'vocals')}
inst = stems['drums'] + stems['bass'] + stems['other']; vox = stems['vocals']

# (name, first bar, last bar inclusive, keep reference vocal between these source times)
SEGS = [('intro', 2, 10, None), ('verse', 13, 32, None), ('prechorus', 37, 42, None),
        ('chorus', 43, 58, (bar(52) - 0.05, bar(59))), ('bridge', 102, 109, None),
        ('outro', 152, 162, None)]
LINES = json.load(open(root + '/data/lyrics.json'))['lines']; LB = {l['id']: l for l in LINES}
# spoken line -> source (bar, beat) where it starts; None = right after the previous line
PLACE = {'i1': (3, 0), 'i2': (5, 0), 'i3': (6, 2), 'v1': (13, 0), 'v2': None, 'v3': (18, 0), 'v4': None,
         'v5': (23, 0), 'v6': None, 'v7': (28, 0), 'v8': None, 'p1': (38, 0), 'p2': (40, 2),
         'b1': (102, 0), 'b2': (104, 0), 'b3': (107, 0), 'o1': (152, 0), 'o2': (154, 2), 'o3': (157, 0)}
# sung lines on the grid: (bar, beat offsets per token in beats)
SUNG = {'c1': (43, [0, 1, 1.5, 3, 4, 4.5, 6]), 'c2': (45, [0, 1, 2, 3, 4.5, 5.5]),
        'c3': (47, [0, 1, 2.5, 3.5, 4.5, 5, 6]), 'c4': (49, [0, 1, 1.5, 2.5, 3.5, 4.5, 5.5, 6])}
REF = [('c5a', [98.36, 98.72, 99.06, 101.95, 102.68, 103.2]), ('c5b', [105.58, 105.95, 106.3, 108.95, 109.51, 109.83])]

# 1. source -> output time map
maps, out_t = [], 0.0
for name, b0, b1, keep in SEGS:
    s0, s1 = bar(b0), bar(b1 + 1); maps.append(dict(name=name, src0=s0, src1=s1, out0=out_t, keep=keep)); out_t += s1 - s0
DUR = out_t
def to_out(ts):
    for m in maps:
        if m['src0'] - 1e-3 <= ts < m['src1'] + 1e-3: return m['out0'] + ts - m['src0']
    raise ValueError(ts)

# 2. mix: instrumental edit with 12 ms crossfades at the cuts
mix = np.zeros((int(DUR * SR) + SR, 2)); fade = int(0.012 * SR)
for m in maps:
    a, b = int(m['src0'] * SR), int(m['src1'] * SR); seg = inst[a:b + fade].copy()
    if m['keep']:
        k0, k1 = int(m['keep'][0] * SR) - a, int(m['keep'][1] * SR) - a
        v = vox[a:b + fade].copy(); g = np.zeros(len(v)); g[k0:k1] = 1
        r = int(0.03 * SR); g = np.convolve(g, np.ones(r) / r, 'same'); seg += v * g[:, None]
    ramp = np.linspace(0, 1, fade)[:, None]; seg[:fade] *= ramp; seg[-fade:] *= ramp[::-1]
    o = int(m['out0'] * SR); mix[o:o + len(seg)] += seg
    if m['keep']:  # let the last kept vocal ring over the cut instead of chopping it
        t = int(0.9 * SR); v = vox[b:b + t] * np.linspace(1, 0, t)[:, None] ** 2
        o2 = int((m['out0'] + m['src1'] - m['src0']) * SR); mix[o2:o2 + t] += v

# 3. spoken lines (on their own bus, the music ducks under them)
vbus = np.zeros_like(mix)
def load_tts(i):
    y, _ = librosa.load(f'{W}/tts/{i}.mp3', sr=SR, mono=True)
    y = librosa.effects.preemphasis(y, coef=0.3)  # a little presence
    return y
lines_out, prev_end = [], 0
for ln in LINES:
    i = ln['id']
    if ln['kind'] == 'spoken':
        meta = json.load(open(f'{W}/tts/{i}.json'))
        if PLACE[i] is None:  # next half beat after the previous line + a breath
            ob = [to_out(float(b)) for b in B if any(m['src0'] <= b < m['src1'] for m in maps)]
            half = sorted(ob + [(x + y) / 2 for x, y in zip(ob, ob[1:])])
            t0 = min(h for h in half if h >= prev_end + 0.28)
        else:
            t0 = to_out(beat(*PLACE[i]))
        y = load_tts(i); o = int(t0 * SR); n = min(len(y), len(mix) - o)
        vbus[o:o + n] += y[:n, None]
        toks = [dict(w=tk['w'], t0=round(t0 + tk['t0'], 3), t1=round(t0 + tk['t1'], 3)) for tk in meta['tokens']]
        prev_end = t0 + meta['dur']
    elif i in SUNG:
        b0, offs = SUNG[i]; bl = (bar(b0 + 2) - bar(b0)) / 8
        ts = [to_out(bar(b0)) + k * bl for k in offs] + [to_out(bar(b0)) + 7.6 * bl]
        toks = [dict(w=tk[0], t0=round(ts[j], 3), t1=round(ts[j + 1] - 0.05, 3)) for j, tk in enumerate(ln['t'])]
    else:
        continue
    lines_out.append(dict(id=i, sec=ln['sec'], kind=ln['kind'], tokens=toks))
for rid, ts in REF:
    ln = LB['c5']; o = [to_out(t) for t in ts]
    toks = [dict(w=tk[0], t0=round(o[j], 3), t1=round((o[j + 1] if j + 1 < len(o) else o[j] + 0.5) - 0.04, 3)) for j, tk in enumerate(ln['t'])]
    lines_out.append(dict(id=rid, sec='chorus', kind='sung', tokens=toks))
lines_out.sort(key=lambda l: l['tokens'][0]['t0'])

env = np.abs(vbus[:, 0]); r = int(0.12 * SR); env = np.convolve(env, np.ones(r) / r, 'same'); env = np.clip(env / (env.max() + 1e-9) * 4, 0, 1)
mix = mix * (1 - 0.35 * env)[:, None] + vbus * 1.25
# 4. master: fade the tail over the last bar, normalise
last = maps[-1]; tail0 = last['out0'] + bar(162) - last['src0']
n0, n1 = int(tail0 * SR), int(DUR * SR); mix[n0:n1] *= np.linspace(1, 0, n1 - n0)[:, None] ** 1.5; mix = mix[:n1]
mix *= 0.89 / np.abs(mix).max()
sf.write(W + '/rv_temp.wav', mix, SR, subtype='PCM_16')

# 5. beat grid in output time
beats_out = []
for m in maps:
    for k, b in enumerate(B):
        if m['src0'] - 1e-3 <= b < m['src1'] - 1e-3:
            beats_out.append(dict(t=round(m['out0'] + b - m['src0'], 4), down=(k - PH) % 4 == 0))
sections = [dict(name=m['name'], t0=round(m['out0'], 3), t1=round(m['out0'] + m['src1'] - m['src0'], 3)) for m in maps]
json.dump(dict(duration=round(DUR, 3), audio=os.path.abspath(W + '/rv_temp.wav'), beats=beats_out, sections=sections, lines=lines_out,
               edit=[{k: (round(v, 3) if isinstance(v, float) else v) for k, v in m.items() if k != 'keep'} for m in maps]),
          open(root + '/engine/data/timeline.json', 'w'), indent=1)
print('duration', round(DUR, 2), 'beats', len(beats_out))
for s in sections: print(s)
for l in lines_out: print(l['id'], l['tokens'][0]['t0'], l['tokens'][-1]['t1'], ' '.join(t['w'] for t in l['tokens']))
