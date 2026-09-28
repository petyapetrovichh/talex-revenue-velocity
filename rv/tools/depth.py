# Plates -> engine/assets: 1920px JPEG + 16-bit-ish depth PNG (Depth Anything V2 Small, CPU).
import json, os, sys, numpy as np, torch
from PIL import Image
from transformers import pipeline
torch.set_num_threads(2)
root = os.path.dirname(os.path.abspath(__file__)) + '/..'
plates = json.load(open(root + '/data/plates.json'))
out = root + '/engine/assets/plates'; os.makedirs(out, exist_ok=True)
pipe = pipeline('depth-estimation', model='depth-anything/Depth-Anything-V2-Small-hf', device='cpu')
for k, rel in plates.items():
    dst = f'{out}/{k}.jpg'
    if os.path.exists(f'{out}/{k}.depth.png'): continue
    im = Image.open(root + '/../midjourney/' + rel).convert('RGB')
    im.thumbnail((1920, 1920)); im.save(dst, quality=92)
    d = pipe(im.resize((im.width // 2, im.height // 2)))['predicted_depth']
    d = d.squeeze().numpy(); d = (d - d.min()) / (np.ptp(d) + 1e-6)   # 1 = near
    Image.fromarray((d * 255).astype(np.uint8)).resize(im.size, Image.BICUBIC).save(f'{out}/{k}.depth.png')
    print(k, im.size, flush=True)
