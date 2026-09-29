# Word times of the ORIGINAL song (lyrics from prompts/prompts-suno.md) against its vocal stem (MMS_FA).
import json, re, os, soundfile as sf, numpy as np, torch, torchaudio
root = os.path.dirname(os.path.abspath(__file__)) + '/..'
txt = open(root + '/../prompts/prompts-suno.md').read()
lyr = txt.split('## Lyrics field')[1].split('```')[1]
lines = [l.strip() for l in lyr.splitlines() if l.strip() and not l.strip().startswith('[')]
norm = lambda s: re.sub(r"[^a-z' ]", ' ', s.lower()).replace("'", ' ').split()
words, owner = [], []
for li, l in enumerate(lines):
    for w in norm(l): words.append(w); owner.append(li)
b = torchaudio.pipelines.MMS_FA; model, tok, aligner = b.get_model(), b.get_tokenizer(), b.get_aligner()
v, sr = sf.read(root + '/work/stems/htdemucs/Escape Velocity/vocals.wav', always_2d=True)
wav = torchaudio.functional.resample(torch.tensor(v.mean(1), dtype=torch.float32)[None], sr, b.sample_rate)
with torch.inference_mode():
    em, _ = model(wav); spans = aligner(em[0], tok(words))
fps = em.shape[1] / (wav.shape[1] / b.sample_rate)
out = [dict(line=owner[i], w=words[i], t0=round(sp[0].start / fps, 3), t1=round(sp[-1].end / fps, 3)) for i, sp in enumerate(spans)]
json.dump(dict(lines=lines, words=out), open(root + '/work/orig_words.json', 'w'), indent=0)
for li, l in enumerate(lines):
    ws = [x for x in out if x['line'] == li]
    print(f"{li:2d} {ws[0]['t0']:7.2f}-{ws[-1]['t1']:7.2f}  {l}")
