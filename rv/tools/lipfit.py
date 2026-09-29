#!/usr/bin/env python3
"""Fit a generated singing clip to the song: find the speed k and song start a so that her mouth
opening (MediaPipe jawOpen per frame) lines up with the sung words (vocal stem envelope gated to
the aligned lyric tokens). Writes the retimed clip with our song underneath and rv/seedance/lipfit.json.

  python3 rv/tools/lipfit.py RV-S01:rv/seedance/out/RV-S01_t2_h3max_480p.mp4 [...]
"""
import json, os, subprocess, sys
import numpy as np, cv2, librosa

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SONG = os.path.join(ROOT, 'gen', 'in', 'suno-final.wav')
VOC = os.path.join(ROOT, 'work', 'stems_final', 'htdemucs', 'suno-final', 'vocals.wav')
MODEL = os.path.join(ROOT, 'work', 'models', 'face_landmarker.task')
OUT = os.path.join(ROOT, 'seedance', 'fit'); FITS = os.path.join(ROOT, 'seedance', 'lipfit.json')
HZ = 100


def jaw_curve(path):
    from mediapipe.tasks.python import vision, BaseOptions
    import mediapipe as mp
    lm = vision.FaceLandmarker.create_from_options(vision.FaceLandmarkerOptions(
        base_options=BaseOptions(model_asset_path=MODEL), running_mode=vision.RunningMode.IMAGE, num_faces=1, output_face_blendshapes=True,
        min_face_detection_confidence=0.2, min_face_presence_confidence=0.2))
    cap = cv2.VideoCapture(path); fps = cap.get(cv2.CAP_PROP_FPS); vals = []
    while True:
        ok, fr = cap.read()
        if not ok: break
        fr = cv2.resize(fr, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC) if fr.shape[0] < 700 else fr  # 480p faces are small
        r = lm.detect(mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(fr, cv2.COLOR_BGR2RGB)))
        vals.append(next((b.score for b in r.face_blendshapes[0] if b.category_name == 'jawOpen'), np.nan) if r.face_blendshapes else np.nan)
    v = np.array(vals, float); ok = ~np.isnan(v)
    if ok.sum() < len(v) * 0.5: return fps, v, ok.mean()
    v[~ok] = np.interp(np.flatnonzero(~ok), np.flatnonzero(ok), v[ok])
    return fps, v, ok.mean()


def word_env(t0, t1):
    y, sr = librosa.load(VOC, sr=16000, offset=t0, duration=t1 - t0)
    rms = librosa.feature.rms(y=y, frame_length=640, hop_length=sr // HZ)[0]
    t = t0 + np.arange(len(rms)) / HZ
    T = json.load(open(os.path.join(ROOT, 'engine', 'data', 'timeline.json')))
    gate = np.zeros_like(t)
    for l in T['lines']:
        for k in l['tokens']: gate[(t >= k['t0'] - 0.03) & (t <= k['t1'] + 0.06)] = 1
    e = np.convolve(rms * gate, np.ones(5) / 5, 'same')
    return t, e / (e.max() + 1e-9)


def fit(cid, path, t0):
    fps, jaw, cover = jaw_curve(path); dur = len(jaw) / fps
    if cover < 0.5: return {'id': cid, 'error': f'face found in {cover:.0%} of frames'}
    jt = np.arange(len(jaw)) / fps
    ut, env = word_env(t0 - 2.0, t0 + dur + 2.0)
    best = (-2, 1, t0)
    for k in np.arange(0.70, 2.51, 0.02):          # video seconds per song second
        for a in np.arange(t0 - 1.5, t0 + 1.51, 0.02):  # song time of the clip's first frame
            v = (ut - a) * k; m = (v >= 0) & (v <= dur)
            if m.sum() < 2.5 * HZ: continue
            j = np.interp(v[m], jt, jaw); e = env[m]
            if j.std() < 1e-6 or e.std() < 1e-6: continue
            c = np.corrcoef(j, e)[0, 1]
            if c > best[0]: best = (c, k, a)
    c, k, a = best
    base = np.corrcoef(np.interp((ut - t0), jt, jaw, left=np.nan, right=np.nan)[(ut >= t0) & (ut <= t0 + dur)], env[(ut >= t0) & (ut <= t0 + dur)])[0, 1]
    os.makedirs(OUT, exist_ok=True); out = os.path.join(OUT, f'{cid}_fit.mp4'); L = dur / k
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', path, '-ss', f'{a:.3f}', '-t', f'{L:.3f}', '-i', SONG,
                    '-filter:v', f'setpts=PTS/{k:.4f},fps=24', '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-crf', '16',
                    '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-shortest', out], check=True)
    return {'id': cid, 'src': os.path.relpath(path, ROOT), 'speed': round(k, 3), 'song_t0': round(a, 3), 'song_t1': round(a + L, 3),
            'corr': round(c, 3), 'corr_unfitted': round(float(base), 3), 'face_cover': round(cover, 2), 'out': os.path.relpath(out, ROOT)}


if __name__ == '__main__':
    clips = {c['id']: c for c in json.load(open(os.path.join(ROOT, 'seedance', 'clips.json')))['clips']}
    fits = json.load(open(FITS)) if os.path.exists(FITS) else {}
    for arg in sys.argv[1:]:
        cid, path = arg.split(':', 1)
        r = fit(cid, os.path.join(os.path.dirname(ROOT), path) if not os.path.isabs(path) else path, clips[cid]['t0'])
        fits[cid] = r; print(json.dumps(r))
    json.dump(fits, open(FITS, 'w'), indent=1)
