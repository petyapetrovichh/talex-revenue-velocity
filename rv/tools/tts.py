# Placeholder spoken vocal: ElevenLabs TTS per spoken line, with character timestamps -> token times.
# Auth is injected by the proxy for api.elevenlabs.io. Cached per line; re-run is free.
import json, os, sys, base64, urllib.request
root = os.path.dirname(os.path.abspath(__file__)) + '/..'
VOICE = os.environ.get('RV_VOICE', 'EXAVITQu4vr4xnSDxMaL')  # Sarah: young, confident, American
out = root + '/work/tts'; os.makedirs(out, exist_ok=True)
L = json.load(open(root + '/data/lyrics.json'))['lines']
for ln in L:
    if ln['kind'] != 'spoken': continue
    mp3, js = f"{out}/{ln['id']}.mp3", f"{out}/{ln['id']}.json"
    if os.path.exists(js): continue
    spoken = [tk[1] if len(tk) > 1 else tk[0] for tk in ln['t']]
    text = ' '.join(spoken)
    body = json.dumps({'text': text, 'model_id': 'eleven_multilingual_v2',
        'voice_settings': {'stability': 0.85, 'similarity_boost': 0.8, 'style': 0.0, 'use_speaker_boost': True, 'speed': 0.95}}).encode()
    req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{VOICE}/with-timestamps?output_format=mp3_44100_128',
                                 data=body, headers={'Content-Type': 'application/json'})
    r = json.load(urllib.request.urlopen(req))
    open(mp3, 'wb').write(base64.b64decode(r['audio_base64']))
    a = r['alignment']; st, en = a['character_start_times_seconds'], a['character_end_times_seconds']
    toks, pos = [], 0
    for tk, sp in zip(ln['t'], spoken):
        i0 = text.index(sp, pos); i1 = i0 + len(sp); pos = i1
        toks.append({'w': tk[0], 't0': st[i0], 't1': en[i1 - 1]})
    json.dump({'id': ln['id'], 'text': text, 'dur': en[-1], 'tokens': toks}, open(js, 'w'))
    print(ln['id'], round(en[-1], 2), text, flush=True)
