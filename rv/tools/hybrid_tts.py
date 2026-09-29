# Spoken lines of the hybrid in the cloned voice (ElevenLabs TTS with timestamps). Cached per line.
import json, os, base64, urllib.request, sys
root = os.path.dirname(os.path.abspath(__file__)) + '/..'
W = root + '/work/hybrid'; os.makedirs(W + '/tts', exist_ok=True)
VOICE = json.load(open(W + '/voice.json'))['voice_id']
LINES = {
 'i2': "This is not the future.",
 'v1': "Look one. Everyone's chasing A G I,", 'v2': "Musk says: universal income, don't ask why.",
 'v3': "Look two. Income doesn't have to wait for machines,", 'v4': "It starts the moment a product shares what it means.",
 'v5': "Look three. Not subscriptions, not ads, just revenue in the split,", 'v6': "Every purchase pays it forward, simple as that, legit.",
 'v7': "Look four. Take E SIM, stay connected wherever you roam,", 'v8': "Every time someone signs up, you get paid back home.",
 'p1': "This isn't charity. It's the new default.",
 'b1': "Buy once, get paid on every sale behind you,", 'b2': "Wealth building while you sleep, ownership will find you.",
 'b3': "The more people join, the more the numbers grow,", 'b4': "That's the road to A G I, one product, then more.",
 'o1': "Buy a product. Own a piece of what it earns,", 'o2': "That's not the future waiting, that's the wheel that turns.",
}
only = sys.argv[1:] or list(LINES)
for k in only:
    js = f'{W}/tts/{k}.json'
    if os.path.exists(js): continue
    body = json.dumps({'text': LINES[k], 'model_id': 'eleven_multilingual_v2',
        'voice_settings': {'stability': 0.6, 'similarity_boost': 0.95, 'style': 0.1, 'use_speaker_boost': True, 'speed': 1.0}}).encode()
    req = urllib.request.Request(f'https://api.elevenlabs.io/v1/text-to-speech/{VOICE}/with-timestamps?output_format=mp3_44100_192', data=body, headers={'Content-Type': 'application/json'})
    r = json.load(urllib.request.urlopen(req))
    open(f'{W}/tts/{k}.mp3', 'wb').write(base64.b64decode(r['audio_base64']))
    al = r['alignment']; json.dump({'text': LINES[k], 'chars': al['characters'], 'st': al['character_start_times_seconds'], 'en': al['character_end_times_seconds']}, open(js, 'w'))
    print(k, round(al['character_end_times_seconds'][-1], 2), LINES[k], flush=True)
