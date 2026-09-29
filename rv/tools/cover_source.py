# Upload file for Suno Cover: the ORIGINAL mix (with vocals), edited on bar lines to our song form.
import json, os, numpy as np, soundfile as sf
root = os.path.dirname(os.path.abspath(__file__)) + '/..'
W = root + '/work'
bt = json.load(open(W + '/ref_beats.json')); B = np.array(bt['beats']); PH = bt['downbeat_phase']
bar = lambda i: float(B[PH + 4 * i])
y, SR = sf.read(root + '/../audio/Escape Velocity.wav')
# intro+verse+pre+chorus (x2 so-back) | bridge | final chorus (4 lines) | outro + ending
SEGS = [(0.0, bar(59)), (bar(102), bar(110)), (bar(137), bar(146)), (bar(152), bar(163))]
fade = int(0.015 * SR); out = []
for a, b in SEGS:
    s = y[int(a * SR):int(b * SR)].copy(); r = np.linspace(0, 1, fade)[:, None]; s[:fade] *= r; s[-fade:] *= r[::-1]; out.append(s)
mix = np.concatenate(out); n = int(4 * SR); mix[-n:] *= np.linspace(1, 0, n)[:, None] ** 1.5
sf.write(W + '/suno_cover_source.wav', mix, SR, subtype='PCM_16')
t = 0
for (a, b), name in zip(SEGS, ['intro / verse / pre-chorus / chorus', 'bridge', 'final chorus', 'outro']):
    print(f'{t:6.1f}-{t + b - a:6.1f}  {name}  (original {a:.1f}-{b:.1f})'); t += b - a
print('total', round(t, 1))
