# New sung chorus lines, a cappella, via ElevenLabs Music (F minor, 132 BPM), with word timestamps.
import json, os, sys, urllib.request, email
root = os.path.dirname(os.path.abspath(__file__)) + '/..'
W = root + '/work/hybrid'; tag = sys.argv[1] if len(sys.argv) > 1 else 's1'; seed = int(sys.argv[2]) if len(sys.argv) > 2 else 5
POS = ['a cappella', 'solo female sung vocal only', 'euphoric trance chorus singing', 'big clear vowels', 'F minor',
       '132 BPM', 'dry close-miked vocal', 'melody between A-flat 3 and A-flat 4', 'steady tempo, one phrase every two bars']
NEG = ['instruments', 'drums', 'bass', 'synth', 'piano', 'guitar', 'strings', 'pads', 'reverb', 'choir', 'harmonies', 'male vocal', 'rap', 'spoken word']
LINES = ["Products that pay you back, built to last", "Not a promise from the future, it's already real",
         "revenue is the deal", "More products, more revenue, shared", "Everyone earning, this is the deal",
         "This is how the future gets built"]
chunks = [{'text': f'[Chorus {i+1}]\n{l}\n{{a cappella, hold the last note}}', 'duration_ms': 4000 if i != 2 else 3000,
           'positive_styles': POS, 'negative_styles': NEG, 'context_adherence': 'high'} for i, l in enumerate(LINES)]
body = {'composition_plan': {'chunks': chunks}, 'model_id': 'music_v2_5', 'with_timestamps': True, 'seed': seed}
req = urllib.request.Request('https://api.elevenlabs.io/v1/music/detailed?output_format=mp3_44100_192', data=json.dumps(body).encode(), headers={'Content-Type': 'application/json'})
r = urllib.request.urlopen(req, timeout=600); raw = r.read()
msg = email.message_from_bytes(b'Content-Type: ' + r.headers['Content-Type'].encode() + b'\r\n\r\n' + raw)
for part in msg.walk():
    t = part.get_content_type()
    if t == 'application/json': meta = json.loads(part.get_payload(decode=True))
    elif t.startswith('audio/') or t == 'application/octet-stream': open(f'{W}/{tag}.mp3', 'wb').write(part.get_payload(decode=True))
json.dump(meta, open(f'{W}/{tag}.json', 'w'))
for x in meta['words_timestamps']:
    if x['end_ms'] > 0: print(round(x['start_ms'] / 1000, 2), round(x['end_ms'] / 1000, 2), x['word'])
