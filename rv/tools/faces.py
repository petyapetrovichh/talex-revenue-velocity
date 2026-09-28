# Face boxes per plate (normalized x,y,w,h,score) for CV frames and type placement.
import cv2, json, os
root = os.path.dirname(os.path.abspath(__file__)) + '/..'
det = cv2.FaceDetectorYN.create(root + '/work/yunet.onnx', '', (320, 320), 0.6)
out = {}
for k in json.load(open(root + '/data/plates.json')):
    im = cv2.imread(f'{root}/engine/assets/plates/{k}.jpg'); h, w = im.shape[:2]
    s = 960 / w; sm = cv2.resize(im, (960, int(h * s))); det.setInputSize((sm.shape[1], sm.shape[0]))
    _, f = det.detect(sm)
    faces = [] if f is None else sorted([[round(float(v) / s / d, 4) for v, d in zip(r[:4], (w, h, w, h))] + [round(float(r[14]), 2)] for r in f], key=lambda r: -r[2])
    out[k] = faces
    print(k, faces[:3])
json.dump(out, open(root + '/data/faces.json', 'w'))
