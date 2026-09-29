# Song via ElevenLabs Music (official API; auth injected by the proxy for api.elevenlabs.io).
#   python3 tools/music.py --tag a [--seed 7] [--model music_v2_5]
# Writes work/music/<tag>.mp3 + <tag>.json (song metadata, composition plan, word timestamps).
import argparse, json, os, sys, urllib.request, email
root = os.path.dirname(os.path.abspath(__file__)) + '/..'
ap = argparse.ArgumentParser(); ap.add_argument('--tag', default='a'); ap.add_argument('--seed', type=int)
ap.add_argument('--model', default='music_v2_5'); ap.add_argument('--dry', action='store_true')
a = ap.parse_args()

# v2: described from the original (analysis: F minor, 131.5-134 BPM, sparse Berlin-minimal arrangement)
STYLE = ['fashion show electroclash techno', '132 BPM', '4/4', 'F minor', 'Berlin minimal austerity',
         'dry analog 909 kick', 'rolling sixteenth-note acid 303 bassline', 'cold detuned minor synth stabs',
         'sweeping orchestral strings only on builds', 'sparse arrangement with lots of space', 'catwalk energy',
         'cold, luxurious, optimistic', 'clean modern mix', 'the same single young American female voice throughout']
NO = ['rap', 'rock guitar', 'guitar', 'piano', 'lo-fi', 'male lead vocal', 'mumbled vocals', 'big room EDM', 'dubstep',
      'risers', 'white noise sweeps', 'vocal chops', 'extra percussion', 'trailer hits', 'cinematic booms', 'autotune',
      'reverb-drenched vocals', 'choir', 'saxophone', 'trap hi-hats']
SPOKEN = ['deadpan female spoken-word vocal in a low register', 'close and dry, no reverb', 'clipped and confident',
          'every word crisp and intelligible', 'rhythmic, on the beat, not sung']
SUNG = ['euphoric sung female trance vocal', 'supersaw lift', 'big clear vowels', 'melody in F minor between A-flat 3 and A-flat 4']

chunks = [
    (9000, 'Prelude', ['cold ambient pad and a distant filtered synth, no drums', 'one single kick hit near the end'],
     ['vocals', 'singing', 'speech', 'drums'], '{instrumental, no vocals}'),
    (9000, 'Intro', SPOKEN + ['pad only, the acid bass enters halfway', 'no drums yet', 'room tone'], ['drums'],
     'Ladies. Gentlemen. Agents.\nThis is not the future. Prepare to walk.'),
    (7000, 'Walk', ['the full kick drum and hats enter hard on the first beat', 'groove starts'], ['singing'],
     'walk... walk... walk... walk... {whispered echo, repeating on each beat}'),
    (44000, 'Verse', SPOKEN + ['full four-on-the-floor groove: kick, closed hats, acid bass, sparse stabs'], ['singing'],
     "Look one. Everyone's chasing A G I,\nMusk says: universal income, don't ask why.\n"
     "Look two. Income doesn't have to wait for machines,\nIt starts the moment a product shares what it means.\n"
     "Look three. Not subscriptions, not ads, just revenue in the split,\nEvery purchase pays it forward, simple as that, legit.\n"
     "Look four. Take E SIM, stay connected wherever you roam,\nEvery time someone signs up, you get paid back home."),
    (8000, 'Pre-Chorus', SPOKEN + ['drums and bass drop out completely', 'only strings swelling', 'tension'], ['singing', 'drums'],
     "This isn't charity. It's the new default.\nLock in."),
    (22000, 'Chorus', SUNG + ['kick and acid bass return at full energy', 'crowd call-and-response shouts'], ['spoken word', 'rap'],
     "Feel the A G I, feel it coming fast\nProducts that pay you back, built to last\n"
     "Not a promise from the future, it's already real\nLock in, baby, revenue is the deal\n"
     "{melody: each line starts high on A-flat 4 and falls step by step to C 4, the last line climbs back to A-flat 4}\n"
     "(It's so over?) WE'RE SO BACK! {stacked chanted shout}"),
    (16000, 'Bridge', SPOKEN + ['kick and strings only', 'no bass', 'breakdown'], ['singing'],
     "Buy once, get paid on every sale behind you,\nWealth building while you sleep, ownership will find you.\n"
     "The more people join, the more the numbers grow,\nThat's the road to A G I, one product, then more."),
    (22000, 'Final Chorus', SUNG + ['key change up one step', 'biggest energy', 'stacked vocals'], ['spoken word', 'rap'],
     "More products, more revenue, shared\nEveryone earning, this is the deal\n"
     "Feel the A G I, feel it coming fast\nThis is how the future gets built"),
    (16000, 'Outro', SPOKEN + ['drums and bass fall away', 'only the cold pad remains', 'ends on silence'], ['singing', 'drums'],
     "Buy a product. Own a piece of what it earns,\nThat's not the future waiting, that's the wheel that turns."),
]
plan = {'chunks': [{'text': f'[{name}]\n{txt}', 'duration_ms': d, 'positive_styles': STYLE + pos,
                    'negative_styles': NO + neg, 'context_adherence': 'high'} for d, name, pos, neg, txt in chunks]}
body = {'composition_plan': plan, 'model_id': a.model, 'with_timestamps': True}
if a.seed is not None: body['seed'] = a.seed
total = sum(c[0] for c in chunks) / 1000
print(f'{len(chunks)} chunks, {total:.0f} s, ~{total / 60 * 900:.0f} credits')
if a.dry: print(json.dumps(body, indent=1)[:3000]); sys.exit()

out = root + '/work/music'; os.makedirs(out, exist_ok=True)
req = urllib.request.Request('https://api.elevenlabs.io/v1/music/detailed?output_format=mp3_44100_192',
                             data=json.dumps(body).encode(), headers={'Content-Type': 'application/json'})
try:
    r = urllib.request.urlopen(req, timeout=600)
except urllib.error.HTTPError as e:
    print('HTTP', e.code, e.read().decode()[:2000]); sys.exit(1)
ctype, raw = r.headers.get('Content-Type'), r.read()
msg = email.message_from_bytes(b'Content-Type: ' + ctype.encode() + b'\r\n\r\n' + raw)
meta = None
for part in msg.walk():
    t = part.get_content_type()
    if t == 'application/json': meta = json.loads(part.get_payload(decode=True))
    elif t.startswith('audio/') or t == 'application/octet-stream':
        open(f'{out}/{a.tag}.mp3', 'wb').write(part.get_payload(decode=True))
json.dump({'request': body, 'response': meta}, open(f'{out}/{a.tag}.json', 'w'), indent=1)
print('saved', f'{out}/{a.tag}.mp3', 'meta keys:', list((meta or {}).keys()))
