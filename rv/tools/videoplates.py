#!/usr/bin/env python3
"""Approved generated clips -> engine video plates (rv/seedance/SELECTED.json -> rv/engine/assets/video/<key>/NNNN.jpg).

Each clip is scaled/cropped to 1920x1080 (cover) and split into JPG frames; MediaPipe finds her face in every frame so
CV boxes follow her. Writes rv/engine/data/videos.json: {key: {n, fps, song_t0, faces: [[x,y,w,h] | null, ...]}}.
song_t0 is the song time of the clip's first frame when the clip plays in sync (sung shots); motion shots pick their own.
"""
import glob, json, os, subprocess
import cv2, numpy as np

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
ENG = os.path.join(ROOT, 'engine'); MODEL = os.path.join(ROOT, 'work', 'models', 'face_landmarker.task')
CLIPS = {  # engine key: (file, song_t0 when played in sync)
    'vTaxi': ('seedance/out/RV-S07_t1_h3max_768p.mp4', 0.0),
    'vWalk': ('seedance/out/RV-S02_t1_h3max_768p.mp4', None),
    'vArrive': ('seedance/out/RV-S08_t3_h3_2K.mp4', None),
    'vTwirl': ('seedance/out/RV-S06_t3_h3_2K.mp4', None),
    'vAgi': ('seedance/out/RV-S03_t4_h3_2K.mp4', 65.53),
    'vLock': ('seedance/out/RV-S04_t4_h3_2K.mp4', 76.5),
    'vHall1': ('seedance/out/RV-S05_t3_h3_2K.mp4', 68.85),
    'vHall2': ('seedance/out/RV-S09_t1_h3_2K.mp4', 114.0),
    'vBack': ('seedance/fit/RV-S01_t6_warp_B.mp4', 86.362),
}


def faces(frames):
    from mediapipe.tasks.python import vision, BaseOptions
    import mediapipe as mp
    lm = vision.FaceLandmarker.create_from_options(vision.FaceLandmarkerOptions(
        base_options=BaseOptions(model_asset_path=MODEL), running_mode=vision.RunningMode.IMAGE, num_faces=1,
        min_face_detection_confidence=0.3, min_face_presence_confidence=0.3))
    out = []
    for f in frames:
        r = lm.detect(mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(cv2.imread(f), cv2.COLOR_BGR2RGB)))
        if not r.face_landmarks: out.append(None); continue
        p = np.array([[q.x, q.y] for q in r.face_landmarks[0]])
        x0, y0 = p.min(0); x1, y1 = p.max(0)
        out.append([round(float(x0), 4), round(float(y0), 4), round(float(x1 - x0), 4), round(float(y1 - y0), 4)])
    return out


if __name__ == '__main__':
    meta = {}
    for key, (src, t0) in CLIPS.items():
        d = os.path.join(ENG, 'assets', 'video', key); os.makedirs(d, exist_ok=True)
        for f in glob.glob(d + '/*.jpg'): os.remove(f)
        path = os.path.join(ROOT, src)
        fps = eval(subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=r_frame_rate', '-of', 'csv=p=0', path],
                                  capture_output=True, text=True).stdout.strip())
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', path, '-vf', 'scale=1920:1080:force_original_aspect_ratio=increase:flags=lanczos,crop=1920:1080',
                        '-q:v', '3', '-start_number', '0', f'{d}/%04d.jpg'], check=True)
        fr = sorted(glob.glob(d + '/*.jpg'))
        meta[key] = {'n': len(fr), 'fps': fps, 'song_t0': t0, 'src': src, 'faces': faces(fr)}
        print(key, len(fr), 'frames', fps, 'fps, face in', sum(x is not None for x in meta[key]['faces']), flush=True)
    json.dump(meta, open(os.path.join(ENG, 'data', 'videos.json'), 'w'))
