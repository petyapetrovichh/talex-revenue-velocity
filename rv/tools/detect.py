# Object boxes per plate with Grounding DINO (the original's tracker family), for CV frames on real things.
# engine/data/objects.json: {plate: [[label, x, y, w, h, score], ...]} normalized to the plate.
import json, os, sys, torch
from PIL import Image
from transformers import AutoProcessor, AutoModelForZeroShotObjectDetection
torch.set_num_threads(4)
root = os.path.dirname(os.path.abspath(__file__)) + '/..'
mid = 'IDEA-Research/grounding-dino-tiny'
proc = AutoProcessor.from_pretrained(mid); model = AutoModelForZeroShotObjectDetection.from_pretrained(mid).eval()
QUERY = 'a person. a face. a laptop. a billboard. a road sign. a car. a garment tag. a card. a screen. a hand.'
P = root + '/engine/assets/plates/'
keys = sys.argv[1:] or [k for k in json.load(open(root + '/data/plates.json')) if not k.endswith('blank')]
out_p = root + '/engine/data/objects.json'
out = json.load(open(out_p)) if os.path.exists(out_p) else {}
for k in keys:
    im = Image.open(P + k + '.jpg').convert('RGB'); w, h = im.size
    inp = proc(images=im, text=QUERY, return_tensors='pt')
    with torch.no_grad(): o = model(**inp)
    r = proc.post_process_grounded_object_detection(o, inp.input_ids, threshold=0.25, text_threshold=0.2, target_sizes=[(h, w)])[0]
    labs = r.get('text_labels', r.get('labels'))
    dets = []
    for box, s, lab in zip(r['boxes'].tolist(), r['scores'].tolist(), labs):
        x0, y0, x1, y1 = box
        dets.append([str(lab).strip(), round(x0 / w, 4), round(y0 / h, 4), round((x1 - x0) / w, 4), round((y1 - y0) / h, 4), round(s, 2)])
    dets.sort(key=lambda d: -d[5]); out[k] = dets
    print(k, len(dets), [(d[0], d[5]) for d in dets[:6]], flush=True)
    json.dump(out, open(out_p, 'w'))
