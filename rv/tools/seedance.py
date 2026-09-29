#!/usr/bin/env python3
"""Seedance clips through OpenRouter (method: rv/SEEDANCE.md, spec: rv/seedance/clips.json).

  python3 rv/tools/seedance.py prep                     cut audio windows, copy clean plates to rv/seedance/in/
  python3 rv/tools/seedance.py run RV-S07 RV-S02 --res 720p [--dry]   submit, poll, download, log cost
  python3 rv/tools/seedance.py status                   ledger summary

Inputs are fetched by OpenRouter from raw.githubusercontent.com, so `prep` output must be pushed first.
Every submission is appended to rv/seedance/ledger.csv (id, take, model, res, seconds, cost, job id).
"""
import argparse, csv, json, os, subprocess, sys, time, urllib.request, urllib.error

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
RV = os.path.join(ROOT, 'rv'); SD = os.path.join(RV, 'seedance')
IN, OUT, LEDGER = os.path.join(SD, 'in'), os.path.join(SD, 'out'), os.path.join(SD, 'ledger.csv')
SONG = os.path.join(RV, 'gen', 'in', 'suno-final.wav')
VOC = os.path.join(RV, 'work', 'stems_final', 'htdemucs', 'suno-final', 'vocals.wav')
RAW = 'https://raw.githubusercontent.com/petyapetrovichh/talex-revenue-velocity/claude/adoring-galileo-69d1xl/rv/seedance/in/'
API = 'https://openrouter.ai/api/v1/videos'
MODEL = 'bytedance/seedance-2.5'
# $ per second of output (OpenRouter /api/v1/videos/models, 2026-09-29); Seedance bills video tokens = w*h*24*s/1024
PRICES = {'bytedance/seedance-2.5': {'480p': 854 * 480 * 24 / 1024 * 0.0000107, '720p': 1280 * 720 * 24 / 1024 * 0.0000107},
          'alibaba/wan-3.0': {'480p': 0.05, '720p': 0.10, '1080p': 0.20},
          'minimax/hailuo-3-max': {'480p': 0.05, '768p': 0.08},
          'google/veo-3.1': {'720p': 0.20, '1080p': 0.20},  # without audio
          'heygen/avatar-iv': {'720p': 0.05, '1080p': 0.05},  # lip-sync: photo + our vocal
          'minimax/hailuo-3': {'2K': 0.13}}  # video-to-video: HeyGen lips in, natural head/hair/eyes out
SHORT = {'bytedance/seedance-2.5': 'sd25', 'alibaba/wan-3.0': 'wan30', 'minimax/hailuo-3-max': 'h3max', 'google/veo-3.1': 'veo31', 'heygen/avatar-iv': 'heygen', 'minimax/hailuo-3': 'h3v2v'}


def spec():
    return {c['id']: c for c in json.load(open(os.path.join(SD, 'clips.json')))['clips']}


def est(model, res, dur):
    return PRICES[model][res] * (5 if model == 'minimax/hailuo-3' else dur)


def req(url, data=None):
    r = urllib.request.Request(url, data=json.dumps(data).encode() if data else None, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(r, timeout=120) as f: return json.load(f)
    except urllib.error.HTTPError as e: raise SystemExit(f'HTTP {e.code}: {e.read().decode()[:800]}')


def cmd_prep(a):
    os.makedirs(IN, exist_ok=True)
    for c in spec().values():
        src = os.path.join(RV, 'engine', 'assets', 'plates', c['plate'] + '.jpg')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-q:v', '2', os.path.join(IN, c['plate'] + '.jpg')], check=True)
        if c['mode'] == 'ref':  # the exact song window, vocal stem, as the lip-sync reference
            aud = VOC if c['audio'] == 'vocals' else SONG
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(c['t0']), '-t', str(c['dur']), '-i', aud,
                            '-af', f"afade=in:d=0.02,afade=out:st={c.get('end', c['t0'] + c['dur']) - c['t0'] - 0.05:.2f}:d=0.05", '-ac', '2', '-ar', '44100', '-b:a', '192k',
                            os.path.join(IN, c['id'] + '.mp3')], check=True)
        print('prepared', c['id'], c['plate'], c['mode'])


def ledger_rows():
    return list(csv.DictReader(open(LEDGER))) if os.path.exists(LEDGER) else []


def log(row):
    new = not os.path.exists(LEDGER)
    with open(LEDGER, 'a', newline='') as f:
        w = csv.DictWriter(f, fieldnames=['id', 'take', 'model', 'res', 'seconds', 'est', 'cost', 'job', 'status', 'file', 'verdict'])
        if new: w.writeheader()
        w.writerow(row)


def body(c, res, model):
    img = {'type': 'image_url', 'image_url': {'url': RAW + c['plate'] + '.jpg'}}
    if model.startswith('heygen/'):  # talking/singing photo: the vocal window drives the mouth, its length the duration
        return {'model': model, 'prompt': c['prompt_lipsync'], 'resolution': res, 'aspect_ratio': '16:9',
                'input_references': [img, {'type': 'audio_url', 'audio_url': {'url': RAW + c['id'] + '_words.mp3'}}]}  # words-only vocal
    if model == 'minimax/hailuo-3':  # rework the HeyGen take: its lip motion stays, the rest of the motion becomes natural
        return {'model': model, 'prompt': c['prompt_v2v'], 'duration': 5, 'resolution': res, 'aspect_ratio': '16:9',
                'input_references': [{'type': 'video_url', 'video_url': {'url': RAW + c['id'] + '_heygen.mp4'}},
                                     {'type': 'audio_url', 'audio_url': {'url': RAW + c['id'] + '_words.mp3'}}]}
    b = {'model': model, 'prompt': c['prompt'], 'duration': c['dur'], 'resolution': res, 'aspect_ratio': '16:9'}
    if c['mode'] == 'frame':
        b['frame_images'] = [dict(img, frame_type='first_frame')]; b['generate_audio'] = False
    else:  # reference mode: @Image1 + @Audio1 (an audio reference is ignored when frame_images is set)
        b['input_references'] = [img, {'type': 'audio_url', 'audio_url': {'url': RAW + c['id'] + '.mp3'}}]; b['generate_audio'] = True
    if model.startswith('google/veo'):  # adult image-to-video of a fictional character
        b['provider'] = {'options': {'google-vertex': {'parameters': {'personGeneration': 'allow_adult'}}}}
    return b


def run_one(c, res, dry, model):
    take = sum(1 for r in ledger_rows() if r['id'] == c['id']) + 1
    b = body(c, res, model); e = est(model, res, c['dur'])
    print(f"{c['id']} take {take}: {c['plate']} {c['mode']} {c['dur']}s {model} {res} ≈ ${e:.2f}")
    if dry: print(json.dumps(b, indent=1)); return 0
    for u in [x['image_url']['url'] for x in b.get('frame_images', []) + b.get('input_references', []) if x['type'] == 'image_url'] + \
             [x['audio_url']['url'] for x in b.get('input_references', []) if x['type'] == 'audio_url']:
        if urllib.request.urlopen(urllib.request.Request(u, method='HEAD'), timeout=30).status != 200: raise SystemExit('input not reachable: ' + u)
    job = req(API, b); jid = job['id']; print('  job', jid)
    st = job
    while st.get('status') not in ('completed', 'failed', 'cancelled', 'expired'):
        time.sleep(15); st = req(f'{API}/{jid}'); print('  ', st.get('status'), flush=True)
    cost = (st.get('usage') or {}).get('cost', '')
    out = ''
    if st['status'] == 'completed':
        os.makedirs(OUT, exist_ok=True); out = os.path.join(OUT, f"{c['id']}_t{take}_{SHORT[model]}_{res}.mp4")
        urllib.request.urlretrieve(f'{API}/{jid}/content?index=0', out); print('  saved', out, f'cost ${cost}')
    else: print('  ', json.dumps(st)[:800])
    log({'id': c['id'], 'take': take, 'model': model, 'res': res, 'seconds': c['dur'], 'est': f'{e:.2f}', 'cost': cost, 'job': jid,
         'status': st['status'], 'file': os.path.relpath(out, ROOT) if out else '', 'verdict': ''})
    return float(cost or 0)


def cmd_run(a):
    S = spec(); total = sum(est(a.model, a.res, S[i]['dur']) for i in a.ids)
    print(f'{len(a.ids)} clips, estimate ${total:.2f}')
    spent = sum(run_one(S[i], a.res, a.dry, a.model) for i in a.ids)
    if not a.dry: print(f'spent ${spent:.2f}')


def cmd_status(a):
    R = ledger_rows(); print(f'{len(R)} submissions, ${sum(float(r["cost"] or 0) for r in R):.2f} spent')
    for r in R: print(' ', r['id'], 't' + r['take'], r['model'], r['res'], r['status'], '$' + (r['cost'] or '?'), r['file'], r['verdict'])


if __name__ == '__main__':
    ap = argparse.ArgumentParser(); sp = ap.add_subparsers(dest='cmd', required=True)
    sp.add_parser('prep'); sp.add_parser('status')
    r = sp.add_parser('run'); r.add_argument('ids', nargs='+'); r.add_argument('--res', default='720p', choices=['480p', '720p', '768p', '1080p', '2K']); r.add_argument('--model', default=MODEL, choices=list(PRICES)); r.add_argument('--dry', action='store_true')
    a = ap.parse_args(); {'prep': cmd_prep, 'run': cmd_run, 'status': cmd_status}[a.cmd](a)
