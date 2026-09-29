#!/usr/bin/env python3
"""Per-frame tracking for the engine's video plates (rv/engine/data/videos.json):
  faces  - MediaPipe face landmarker (close-ups), else a head box from the pose landmarks (wide shots)
  bodies - MediaPipe pose landmarker, full figure
Boxes are normalised [x, y, w, h], gaps interpolated and smoothed over time so CV frames glide, never jitter.
"""
import json, os
import cv2, numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
ENG = os.path.join(ROOT, 'engine'); VJ = os.path.join(ENG, 'data', 'videos.json')
POSE = os.path.join(ROOT, 'work', 'models', 'pose_landmarker_full.task')


def smooth(boxes, k=7):
    ok = [i for i, b in enumerate(boxes) if b is not None]
    if len(ok) < max(3, len(boxes) * 0.3): return [None] * len(boxes)
    B = np.array([boxes[i] for i in ok]); idx = np.arange(len(boxes))
    full = np.stack([np.interp(idx, ok, B[:, j]) for j in range(4)], 1)
    pad = np.pad(full, ((k // 2, k // 2), (0, 0)), mode='edge')
    full = np.stack([np.convolve(pad[:, j], np.ones(k) / k, 'valid') for j in range(4)], 1)
    return [[round(float(v), 4) for v in b] for b in full]


def pose_boxes(frames):
    from mediapipe.tasks.python import vision, BaseOptions
    import mediapipe as mp
    lm = vision.PoseLandmarker.create_from_options(vision.PoseLandmarkerOptions(
        base_options=BaseOptions(model_asset_path=POSE), running_mode=vision.RunningMode.VIDEO, num_poses=1,
        min_pose_detection_confidence=0.3, min_pose_presence_confidence=0.3, min_tracking_confidence=0.3))
    bodies, heads = [], []
    for i, f in enumerate(frames):
        r = lm.detect_for_video(mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(cv2.imread(f), cv2.COLOR_BGR2RGB)), int(i * 1000 / 24))
        if not r.pose_landmarks: bodies.append(None); heads.append(None); continue
        p = np.array([[q.x, q.y, q.visibility] for q in r.pose_landmarks[0]])
        v = p[p[:, 2] > 0.3][:, :2]
        if len(v) < 5: bodies.append(None); heads.append(None); continue
        x0, y0 = np.clip(v.min(0), 0, 1); x1, y1 = np.clip(v.max(0), 0, 1)
        hx, hy = p[0, :2]; sw = abs(p[11, 0] - p[12, 0]) * 1.9 / 1.78  # head ~ shoulder width, in frame-height units
        top = max(0.0, y0 - (y1 - y0) * 0.07)                           # pose stops at the eyes: add the crown
        bodies.append([float(x0 - 0.01), float(top), float(x1 - x0 + 0.02), float(y1 - top + 0.01)])
        hw = max(sw * 0.62, 0.02); heads.append([float(hx - hw / 2), float(hy - hw * 0.95), float(hw), float(hw * 1.5)])
    return bodies, heads


if __name__ == '__main__':
    meta = json.load(open(VJ))
    for key, m in meta.items():
        d = os.path.join(ENG, 'assets', 'video', key); frames = [os.path.join(d, f'{i:04d}.jpg') for i in range(m['n'])]
        bodies, heads = pose_boxes(frames)
        faces = m['faces']
        n_face = sum(f is not None for f in faces)
        m['faces'] = smooth(faces if n_face >= len(faces) * 0.5 else [f if f is not None else h for f, h in zip(faces, heads)])
        m['bodies'] = smooth(bodies)
        print(key, 'face', sum(f is not None for f in m['faces']), 'body', sum(b is not None for b in m['bodies']), '/', m['n'], flush=True)
    json.dump(meta, open(VJ, 'w'))
