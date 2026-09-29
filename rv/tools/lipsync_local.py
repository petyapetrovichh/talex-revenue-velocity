#!/usr/bin/env python3
"""Re-draw only the mouth of a generated clip to our vocal with MuseTalk 1.5 (CPU), keeping the clip's own
head, hair and eye motion. Face boxes come from MediaPipe (MuseTalk's DWPose/S3FD stack is not installed).

  python3 rv/tools/lipsync_local.py CLIP.mp4 WORDS.mp3 OUT.mp4 [--song-t0 86.2]

MuseTalk checkout + weights: rv/work/MuseTalk (models/musetalkV15, sd-vae, whisper, face-parse-bisent).
"""
import argparse, os, subprocess, sys, tempfile
import cv2, numpy as np, torch

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
MT = os.path.join(ROOT, 'work', 'MuseTalk')
MODEL = os.path.join(ROOT, 'work', 'models', 'face_landmarker.task')
SONG = os.path.join(ROOT, 'gen', 'in', 'suno-final.wav')
OVAL = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
        172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109]


def boxes(frames):
    """MuseTalk's crop: face-contour width, bottom at the chin, top as far above the nose bridge as the chin is below it."""
    from mediapipe.tasks.python import vision, BaseOptions
    import mediapipe as mp
    lm = vision.FaceLandmarker.create_from_options(vision.FaceLandmarkerOptions(
        base_options=BaseOptions(model_asset_path=MODEL), running_mode=vision.RunningMode.IMAGE, num_faces=1,
        min_face_detection_confidence=0.2, min_face_presence_confidence=0.2))
    out = []
    for fr in frames:
        s = 2 if fr.shape[0] < 700 else 1
        big = cv2.resize(fr, None, fx=s, fy=s, interpolation=cv2.INTER_CUBIC) if s > 1 else fr
        r = lm.detect(mp.Image(image_format=mp.ImageFormat.SRGB, data=cv2.cvtColor(big, cv2.COLOR_BGR2RGB)))
        if not r.face_landmarks: out.append(None); continue
        p = np.array([[q.x * fr.shape[1], q.y * fr.shape[0]] for q in r.face_landmarks[0]])
        xs = p[OVAL, 0]; chin = p[152, 1]; mid = p[195, 1]
        out.append([xs.min(), mid - (chin - mid), xs.max(), chin])
    ok = [i for i, b in enumerate(out) if b is not None]
    if len(ok) < len(out) * 0.5: raise SystemExit(f'face found in {len(ok)}/{len(out)} frames')
    B = np.array([out[i] for i in ok]); idx = np.arange(len(out))
    full = np.stack([np.interp(idx, ok, B[:, k]) for k in range(4)], 1)
    k = 5; pad = np.pad(full, ((k // 2, k // 2), (0, 0)), mode='edge')        # smooth the crop so it does not jitter
    full = np.stack([np.convolve(pad[:, j], np.ones(k) / k, 'valid') for j in range(4)], 1)
    H, W = frames[0].shape[:2]
    return [(max(0, int(a)), max(0, int(b)), min(W, int(c)), min(H, int(d))) for a, b, c, d in full], len(ok) / len(out)


@torch.no_grad()
def main(a):
    sys.path.insert(0, MT); os.chdir(MT)
    from transformers import WhisperModel
    from musetalk.utils.utils import load_all_model, datagen
    from musetalk.utils.audio_processor import AudioProcessor
    from musetalk.utils.face_parsing import FaceParsing
    from musetalk.utils.blending import get_image
    torch.set_num_threads(os.cpu_count())
    cap = cv2.VideoCapture(a.clip); fps = cap.get(cv2.CAP_PROP_FPS); frames = []
    while True:
        ok, f = cap.read()
        if not ok: break
        frames.append(f)
    dur = len(frames) / fps
    tmp = tempfile.mkdtemp(); wav = os.path.join(tmp, 'a.wav')  # the words-only vocal, padded with silence to the clip length
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', a.audio, '-af', f'apad=whole_dur={dur:.3f}', '-t', f'{dur:.3f}', '-ac', '1', '-ar', '16000', wav], check=True)
    bb, cover = boxes(frames); print(f'{len(frames)} frames @ {fps} fps, face in {cover:.0%}', flush=True)

    vae, unet, pe = load_all_model(unet_model_path='models/musetalkV15/unet.pth', vae_type='sd-vae',
                                   unet_config='models/musetalkV15/musetalk.json', device='cpu')
    ap = AudioProcessor(feature_extractor_path='models/whisper')
    whisper = WhisperModel.from_pretrained('models/whisper').eval()
    feats, n = ap.get_audio_feature(wav)
    chunks = ap.get_whisper_chunk(feats, 'cpu', unet.model.dtype, whisper, n, fps=fps, audio_padding_length_left=2, audio_padding_length_right=2)
    fp = FaceParsing(left_cheek_width=90, right_cheek_width=90)
    boxes10 = [(x1, y1, x2, min(y2 + 10, frames[0].shape[0])) for x1, y1, x2, y2 in bb]  # v1.5 extra margin under the chin
    lat = [vae.get_latents_for_unet(cv2.resize(f[y1:y2, x1:x2], (256, 256), interpolation=cv2.INTER_LANCZOS4)) for f, (x1, y1, x2, y2) in zip(frames, boxes10)]
    res = []
    for i, (wb, lb) in enumerate(datagen(chunks[:len(frames)], lat, batch_size=4, device='cpu')):
        res += list(vae.decode_latents(unet.model(lb, torch.tensor([0]), encoder_hidden_states=pe(wb)).sample))
        if i % 5 == 0: print(f'  {len(res)}/{len(frames)}', flush=True)
    vid = os.path.join(tmp, 'v.mp4')
    w = cv2.VideoWriter(vid, cv2.VideoWriter_fourcc(*'mp4v'), fps, (frames[0].shape[1], frames[0].shape[0]))
    for f, r, (x1, y1, x2, y2) in zip(frames, res, boxes10):
        w.write(get_image(f, cv2.resize(r.astype(np.uint8), (x2 - x1, y2 - y1)), [x1, y1, x2, y2], mode='jaw', fp=fp))
    w.release()
    au = ['-ss', str(a.song_t0), '-t', f'{dur:.3f}', '-i', SONG] if a.song_t0 is not None else ['-i', a.audio]
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', vid, *au, '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-crf', '16',
                    '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-shortest', os.path.abspath(a.out)], check=True)
    print('saved', a.out)


if __name__ == '__main__':
    p = argparse.ArgumentParser(); p.add_argument('clip'); p.add_argument('audio'); p.add_argument('out'); p.add_argument('--song-t0', type=float)
    a = p.parse_args(); a.clip, a.audio, a.out = map(os.path.abspath, (a.clip, a.audio, a.out)); main(a)
