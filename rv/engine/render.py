#!/usr/bin/env python3
"""Render driver for the REVENUE VELOCITY engine (headless Chromium via Playwright).

  python3 render.py sheet 1.2 5 12.5 --cols 4 --w 480 --out /tmp/s.jpg   contact sheet of frames
  python3 render.py lyrics                                              every lyric token on screen?
  python3 render.py video --scale 1 --fps 30 --workers 3 --out out.mp4  full render + audio mux
      [--from 10 --to 20]  render a range only
"""
import argparse, base64, functools, glob, http.server, io, os, socketserver, subprocess, sys, threading, time
from concurrent.futures import ProcessPoolExecutor

HERE = os.path.dirname(os.path.abspath(__file__))
AUDIO = os.path.join(HERE, '..', 'work', 'rv_temp.wav')
EXE = (glob.glob('/opt/pw-browsers/chromium-*/chrome-linux*/chrome') or [None])[0]
ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-web-security']


def serve():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    h = functools.partial(Q, directory=HERE)
    srv = socketserver.ThreadingTCPServer(('127.0.0.1', 0), h); srv.daemon_threads = True
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv.server_address[1]


class Page:
    def __init__(self, scale):
        from playwright.sync_api import sync_playwright
        self.pw = sync_playwright().start()
        self.b = self.pw.chromium.launch(executable_path=EXE, args=ARGS)
        self.p = self.b.new_page(viewport={'width': 400, 'height': 300})
        self.errors = []
        self.p.on('pageerror', lambda e: self.errors.append(str(e)))
        self.p.on('console', lambda m: m.type == 'error' and self.errors.append(m.text))
        self.p.goto(f'http://127.0.0.1:{serve()}/index.html')
        self.p.wait_for_function('window.RV && RV.init', timeout=20000)
        self.info = self.p.evaluate(f'RV.init({scale})')
        if self.errors: raise RuntimeError('\n'.join(self.errors))

    def frame(self, t, q=0.92):
        url = self.p.evaluate('async ([t, q]) => { await RV.render(t); return RV.jpeg(q); }', [t, q])
        if self.errors: raise RuntimeError(f't={t}: ' + '\n'.join(self.errors))
        return base64.b64decode(url.split(',', 1)[1])

    def close(self):
        self.b.close(); self.pw.stop()


def cmd_sheet(a):
    from PIL import Image, ImageDraw
    pg = Page(a.w / 1920); ims = []
    t0 = time.time()
    for t in a.times:
        ims.append((t, Image.open(io.BytesIO(pg.frame(float(t))))))
    ms = (time.time() - t0) / max(1, len(a.times)) * 1000
    pg.close()
    w, h = ims[0][1].size; cols = min(a.cols, len(ims)); rows = (len(ims) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * w, rows * (h + 18)), 'black'); d = ImageDraw.Draw(sheet)
    for i, (t, im) in enumerate(ims):
        x, y = (i % cols) * w, (i // cols) * (h + 18); sheet.paste(im, (x, y)); d.text((x + 4, y + h + 3), f't={float(t):.2f}', fill='yellow')
    sheet.save(a.out, quality=88); print(a.out, f'{ms:.0f} ms/frame')


def cmd_lyrics(a):
    pg = Page(0.25)
    r = pg.p.evaluate('RV.lyricCheck()'); pg.close()
    print(f"lyrics: {r['shown']}/{r['total']} tokens on screen")
    for m in r['miss']: print('  MISSING', m)
    sys.exit(0 if not r['miss'] else 1)


def worker(job):
    i, f0, f1, fps, scale, tmp = job
    pg = Page(scale); w, h = round(1920 * scale), round(1080 * scale)
    out = f'{tmp}/seg_{i:03d}.mp4'
    ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'image2pipe', '-framerate', str(fps), '-c:v', 'mjpeg', '-i', '-',
                           '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-s', f'{w}x{h}', out], stdin=subprocess.PIPE)
    t0 = time.time()
    for f in range(f0, f1):
        ff.stdin.write(pg.frame(f / fps, 0.95))
        if (f - f0) % 150 == 0: print(f'  worker {i}: frame {f} ({(time.time() - t0) / max(1, f - f0 + 1):.2f} s/frame)', flush=True)
    ff.stdin.close(); ff.wait(); pg.close()
    return out


def cmd_video(a):
    pg = Page(0.1); dur = pg.info['duration']; pg.close()
    t0 = a.frm or 0; t1 = a.to or dur
    f0, f1 = int(t0 * a.fps), int(t1 * a.fps)
    tmp = os.path.join(HERE, '..', 'work', 'segs'); os.makedirs(tmp, exist_ok=True)
    n = a.workers; step = (f1 - f0 + a.chunks - 1) // a.chunks  # small chunks balance load
    jobs = [(i, f, min(f + step, f1), a.fps, a.scale, tmp) for i, f in enumerate(range(f0, f1, step))]
    def done(j):  # a finished segment from an interrupted run is kept (--resume)
        f = f'{tmp}/seg_{j[0]:03d}.mp4'
        if not os.path.exists(f): return False
        r = subprocess.run(['ffprobe', '-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_frames', '-of', 'csv=p=0', f], capture_output=True, text=True)
        return r.stdout.strip() == str(j[2] - j[1])
    if a.resume: keep = {j[0] for j in jobs if done(j)}
    else:
        keep = set()
        for f in glob.glob(tmp + '/seg_*.mp4'): os.remove(f)
    print(f'{len(keep)}/{len(jobs)} segments already rendered', flush=True)
    st = time.time()
    with ProcessPoolExecutor(n) as ex: list(ex.map(worker, [j for j in jobs if j[0] not in keep]))
    segs = [f'{tmp}/seg_{j[0]:03d}.mp4' for j in jobs]
    import json
    audio = json.load(open(os.path.join(HERE, 'data', 'timeline.json'))).get('audio') or AUDIO
    lst = tmp + '/list.txt'; open(lst, 'w').write(''.join(f"file '{s}'\n" for s in segs))
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-ss', str(t0), '-t', str(t1 - t0), '-i', audio,
                    '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', a.out], check=True)
    print(a.out, f'{f1 - f0} frames in {time.time() - st:.0f} s')


if __name__ == '__main__':
    ap = argparse.ArgumentParser(); sp = ap.add_subparsers(dest='cmd', required=True)
    s = sp.add_parser('sheet'); s.add_argument('times', nargs='+'); s.add_argument('--cols', type=int, default=4); s.add_argument('--w', type=int, default=480); s.add_argument('--out', default='/tmp/sheet.jpg')
    sp.add_parser('lyrics')
    v = sp.add_parser('video'); v.add_argument('--scale', type=float, default=1); v.add_argument('--fps', type=int, default=30); v.add_argument('--workers', type=int, default=3)
    v.add_argument('--chunks', type=int, default=16); v.add_argument('--resume', action='store_true'); v.add_argument('--out', default=os.path.join(HERE, '..', 'work', 'rv_draft.mp4')); v.add_argument('--from', dest='frm', type=float); v.add_argument('--to', type=float)
    a = ap.parse_args()
    {'sheet': cmd_sheet, 'lyrics': cmd_lyrics, 'video': cmd_video}[a.cmd](a)
