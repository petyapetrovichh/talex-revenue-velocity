# Hybrid soundtrack: the original instrumental, edited on bar lines to our structure; the original vocal
# wherever our words are the same; everything else in the designed ElevenLabs voice (spoken) or ElevenLabs
# Music a cappella (sung). Writes work/hybrid/rv_hybrid.wav and engine/data/timeline.json.
import json, os, numpy as np, soundfile as sf, librosa, scipy.signal as ss
root = os.path.dirname(os.path.abspath(__file__)) + '/..'
W, H = root + '/work', root + '/work/hybrid'; SR = 44100
bt = json.load(open(W + '/ref_beats.json')); B = np.array(bt['beats']); PH = bt['downbeat_phase']
bar = lambda i: float(B[PH + 4 * i]); beatl = lambda i: (bar(i + 1) - bar(i)) / 4
st = W + '/stems/htdemucs/Escape Velocity/'
S = {k: sf.read(st + k + '.wav')[0] for k in ('drums', 'bass', 'other', 'vocals')}
INST = S['drums'] + S['bass'] + S['other']; VOX = S['vocals']
OW = json.load(open(W + '/orig_words.json'))['words']

def ow(line, word, k=0):  # original word time (line index in the original lyric sheet)
    return [x for x in OW if x['line'] == line and x['w'] == word][k]

# ---------------------------------------------------------------- structure (source bars, inclusive-exclusive)
SEGS = [('intro', 0, 13), ('verse', 13, 33), ('prechorus+chorus', 37, 59), ('bridge', 102, 110),
        ('final', 136, 146), ('outro', 152, 163)]
maps, t = [], 0.0
for name, b0, b1 in SEGS:
    s0 = 0.0 if b0 == 0 else bar(b0); s1 = bar(b1)
    maps.append(dict(name=name, src0=s0, src1=s1, out0=t)); t += s1 - s0
DUR = t
def to_out(ts):
    for m in maps:
        if m['src0'] - 1e-3 <= ts <= m['src1'] + 1e-3: return m['out0'] + ts - m['src0']
    raise ValueError(ts)

# original vocal windows to KEEP (source time); everything else of the original vocal is muted
p_ = ow(1, 'prepare'); lk = ow(16, 'lock'); lb = ow(18, 'lock'); bb = ow(18, 'baby')
KEEP = [(0.0, ow(1, 'this')['t0'] - 0.08),                  # prelude + "Ladies. Gentlemen. Agents."
        (p_['t0'] - 0.06, bar(13) - 0.02),                   # "Prepare to walk." + walk echoes
        (lk['t0'] - 0.06, lk['t1'] + 0.12),                  # "Lock in."
        (lb['t0'] - 0.06, bb['t1'] + 0.10),                  # "Lock in, baby,"
        (87.62, 92.02),                                      # "Feel the A G I, feel it coming fast"
        (97.30, bar(59)),                                    # "(It's so over?) WE'RE SO BACK!" x2
        (258.55, 262.45)]                                    # final chorus "Feel the A G I, feel it coming fast"

# ---------------------------------------------------------------- mix bed
n = int(DUR * SR) + SR * 2
bed = np.zeros((n, 2)); keepvox = np.zeros((n, 2)); fade = int(0.012 * SR)
gate = np.zeros(len(VOX))
for a, b in KEEP: gate[int(a * SR):int(b * SR)] = 1
r = int(0.02 * SR); gate = np.convolve(gate, np.ones(r) / r, 'same')
for m in maps:
    a, b = int(m['src0'] * SR), int(m['src1'] * SR); o = int(m['out0'] * SR)
    seg = INST[a:b + fade].copy(); v = (VOX[a:b + fade] * gate[a:b + fade, None])
    ramp = np.linspace(0, 1, fade)[:, None]
    for x in (seg, v): x[:fade] *= ramp; x[-fade:] *= ramp[::-1]
    bed[o:o + len(seg)] += seg; keepvox[o:o + len(v)] += v
# let the last "BACK!" ring over the cut into the bridge
tail = int(0.8 * SR); b59 = int(bar(59) * SR); o = int(to_out(bar(59)) * SR)
keepvox[o:o + tail] += VOX[b59:b59 + tail] * np.linspace(1, 0, tail)[:, None] ** 2

# ---------------------------------------------------------------- processing for the new vocals
def load(f):
    y, _ = librosa.load(f, sr=SR, mono=True); return y
def eq_spoken(y):  # brighten the designed voice toward the original's presence, tame lows
    y = ss.sosfilt(ss.butter(2, 110, 'hp', fs=SR, output='sos'), y)
    hi = ss.sosfilt(ss.butter(2, 3500, 'hp', fs=SR, output='sos'), y)
    return y + 0.55 * hi
IR = np.random.default_rng(3).standard_normal(int(0.9 * SR)) * np.exp(-np.linspace(0, 7, int(0.9 * SR)))
def eq_sung(y):
    y = ss.sosfilt(ss.butter(2, 150, 'hp', fs=SR, output='sos'), y)
    wet = ss.fftconvolve(y, IR)[:len(y)]; wet *= np.abs(y).max() / (np.abs(wet).max() + 1e-9)
    return y + 0.18 * wet
def rms(x): return float(np.sqrt(np.mean(x ** 2)) + 1e-9)
REF_SPOKEN = rms(VOX[int(26.3 * SR):int(72.7 * SR)].mean(1)[np.abs(VOX[int(26.3 * SR):int(72.7 * SR)].mean(1)) > 0.01])
REF_SUNG = rms(VOX[int(87.7 * SR):int(92.0 * SR)].mean(1)[np.abs(VOX[int(87.7 * SR):int(92.0 * SR)].mean(1)) > 0.01])
def level(y, ref):
    act = y[np.abs(y) > 0.01 * np.abs(y).max()]; return y * (ref / rms(act))
newvox = np.zeros_like(bed)
def put(y, t_out):
    o = int(t_out * SR); k = min(len(y), len(newvox) - o); newvox[o:o + k] += y[:k, None]

# ---------------------------------------------------------------- spoken lines (designed voice)
TTS = {k: json.load(open(f'{H}/tts/{k}.json')) for k in ['i2','v1','v2','v3','v4','v5','v6','v7','v8','p1','b1','b2','b3','b4','o1','o2']}
def tokens_of(k, t0, disp=None):
    d = TTS[k]; text = d['text']; words, pos = text.split(' '), 0; out = []
    for w in words:
        i0 = text.index(w, pos); i1 = i0 + len(w); pos = i1
        out.append(dict(w=w, t0=round(t0 + d['st'][i0], 3), t1=round(t0 + d['en'][i1 - 1], 3)))
    return out
beats_out = []
for m in maps:
    for k, b in enumerate(B):
        if m['src0'] - 1e-3 <= b < m['src1'] - 1e-3: beats_out.append(dict(t=round(m['out0'] + b - m['src0'], 4), down=(k - PH) % 4 == 0))
grid = sorted([x['t'] for x in beats_out] + [(p['t'] + q['t']) / 2 for p, q in zip(beats_out, beats_out[1:])])
snap = lambda t: min(g for g in grid if g >= t)
LINES = []
def speak(k, t0, lid=None, rate=1.0):
    y = load(f'{H}/tts/{k}.mp3')
    if rate != 1.0: y = librosa.effects.time_stretch(y, rate=rate)
    y = level(eq_spoken(y), REF_SPOKEN); put(y, t0)
    toks = tokens_of(k, 0)
    for tk in toks: tk['t0'] = round(t0 + tk['t0'] / rate, 3); tk['t1'] = round(t0 + tk['t1'] / rate, 3)
    LINES.append(dict(id=lid or k, kind='spoken', tokens=toks)); return toks[-1]['t1']
# intro: "This is not the future." where "This is not an A I billboard." was
speak('i2', to_out(p_['t0']) - 2.35, rate=0.9)   # ends ~0.9 s before "Prepare"
# verse: one look every 6 bars, second line right after the first
for i, (a, b2) in enumerate([('v1', 'v2'), ('v3', 'v4'), ('v5', 'v6'), ('v7', 'v8')]):
    e = speak(a, to_out(bar(13 + 5 * i))); speak(b2, snap(e + 0.3))
# pre-chorus: where "You have eighteen months..." was
speak('p1', to_out(ow(15, 'you')['t0']))
# bridge
e = to_out(bar(102))
for k in ['b1', 'b2', 'b3', 'b4']: e = speak(k, snap(e + 0.25) if k != 'b1' else e)
# outro
e = speak('o1', to_out(bar(152))); speak('o2', snap(e + 0.35))

# ---------------------------------------------------------------- sung lines (ElevenLabs Music a cappella)
SG = json.load(open(f'{H}/s1.json'))['words_timestamps']; SGA = load(f'{H}/s1.mp3')
SUNG_TXT = ["Products that pay you back, built to last", "Not a promise from the future, it's already real",
            "revenue is the deal", "More products, more revenue, shared", "Everyone earning, this is the deal",
            "This is how the future gets built"]
real = [x for x in SG if x['end_ms'] > x['start_ms']]  # directions come back with zero length
cur, groups = 0, []
for txt in SUNG_TXT:
    k = len(txt.split(' ')); groups.append(real[cur:cur + k]); cur += k
def sing(gi, t_out, lid, hold=0.45, rate=1.0):
    g = groups[gi]; a = g[0]['start_ms'] / 1000 - 0.04; b = g[-1]['end_ms'] / 1000 + hold
    y = SGA[int(a * SR):int(b * SR)]
    if rate != 1.0: y = librosa.effects.time_stretch(y, rate=rate)
    y = level(eq_sung(y), REF_SUNG)
    y[-int(0.08 * SR):] *= np.linspace(1, 0, int(0.08 * SR)); put(y, t_out)
    LINES.append(dict(id=lid, kind='sung', tokens=[dict(w=w['word'], t0=round(t_out + (w['start_ms'] / 1000 - a) / rate, 3), t1=round(t_out + (w['end_ms'] / 1000 - a) / rate, 3)) for w in g]))
def orig_line(lid, src_a, src_b, words):  # timeline entry for a kept original vocal line (even spread + onsets)
    t0, t1 = to_out(src_a), to_out(src_b); n = len(words)
    LINES.append(dict(id=lid, kind='sung', tokens=[dict(w=w, t0=round(t0 + (t1 - t0) * i / n, 3), t1=round(t0 + (t1 - t0) * (i + 1) / n - 0.04, 3)) for i, w in enumerate(words)]))
# chorus 1 slots (pickups of the original lines): 80.27, 84.35, 87.73, 92.07
sing(0, to_out(80.27), 'c1')                                             # Products that pay you back, built to last
orig_line('c2a', lb['t0'], bb['t1'], ['Lock', 'in,', 'baby,'])           # original "Lock in, baby,"
sing(2, to_out(bb['t1'] + 0.05), 'c2b', hold=0.05, rate=1.25)                                   # revenue is the deal
orig_line('c3', 87.73, 91.99, ['Feel', 'the', 'A', 'G', 'I,', 'feel', 'it', 'coming', 'fast'])
sing(1, to_out(92.07), 'c4')                                             # Not a promise from the future, it's already real
orig_line('c5a', 98.36, 104.4, ["(It's", 'so', 'over?)', "WE'RE", 'SO', 'BACK!'])
orig_line('c5b', 105.58, bar(59) - 0.02, ["(It's", 'so', 'over?)', "WE'RE", 'SO', 'BACK!'])
# final chorus slots: 251.7, 255.3, 258.9, 262.5
sing(3, to_out(251.70), 'f1'); sing(4, to_out(255.30), 'f2')
orig_line('f3', 258.6, 262.4, ['Feel', 'the', 'A', 'G', 'I,', 'feel', 'it', 'coming', 'fast'])
sing(5, to_out(262.50), 'f4', hold=0.9)
# original kept spoken lines for the timeline
orig_line('i1', ow(0, 'ladies')['t0'], ow(0, 'agents')['t1'], ['Ladies.', 'Gentlemen.', 'Agents.'])
orig_line('i3', p_['t0'], ow(1, 'walk')['t1'], ['Prepare', 'to', 'walk.'])
orig_line('p2', lk['t0'], lk['t1'], ['Lock', 'in.'])

# ---------------------------------------------------------------- master
mix = bed + keepvox + newvox
tail0 = int(to_out(bar(161)) * SR); n1 = int(DUR * SR)
mix[tail0:n1] *= np.linspace(1, 0, n1 - tail0)[:, None] ** 1.5; mix = mix[:n1]
mix *= 0.89 / np.abs(mix).max()
sf.write(H + '/rv_hybrid.wav', mix, SR, subtype='PCM_16')
LINES.sort(key=lambda l: l['tokens'][0]['t0'])
secs = [dict(name=m['name'], t0=round(m['out0'], 3), t1=round(m['out0'] + m['src1'] - m['src0'], 3)) for m in maps]
json.dump(dict(duration=round(DUR, 3), audio=os.path.abspath(H + '/rv_hybrid.wav'), beats=beats_out, sections=secs, lines=LINES,
               edit=[{k: (round(v, 3) if isinstance(v, float) else v) for k, v in m.items()} for m in maps]),
          open(root + '/engine/data/timeline_hybrid.json', 'w'), indent=1)
print('duration', round(DUR, 2))
for l in LINES: print(f"{l['id']:4s} {l['tokens'][0]['t0']:7.2f}-{l['tokens'][-1]['t1']:7.2f}  {' '.join(t['w'] for t in l['tokens'])}")
