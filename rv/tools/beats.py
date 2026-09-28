# Beat map of the reference track: beat times + fitted downbeats (4/4).
import librosa, numpy as np, json, sys
y, sr = librosa.load(sys.argv[1], sr=22050, mono=True)
oenv = librosa.onset.onset_strength(y=y, sr=sr, aggregate=np.median)
tempo, beats = librosa.beat.beat_track(onset_envelope=oenv, sr=sr, start_bpm=132, tightness=400, units='time')
beats = np.asarray(beats)
# downbeat phase: the phase (0..3) whose beats carry the strongest low-band onsets
S = np.abs(librosa.stft(y, n_fft=2048, hop_length=512))
low = librosa.onset.onset_strength(S=librosa.amplitude_to_db(S[:40]), sr=sr)
fr = librosa.time_to_frames(beats, sr=sr, hop_length=512).clip(0, len(low)-1)
score = [low[fr[p::4]].mean() for p in range(4)]
phase = int(np.argmax(score))
rms = librosa.feature.rms(y=y, hop_length=512)[0]
rt = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=512)
out = dict(tempo=float(np.atleast_1d(tempo)[0]), beats=[round(float(b),4) for b in beats],
           downbeat_phase=phase, duration=float(len(y)/sr),
           rms=[round(float(r),4) for r in rms[::4]], rms_hop=float(rt[4]-rt[0]))
json.dump(out, open(sys.argv[2],'w'))
ib = np.diff(beats); print('tempo', out['tempo'], 'beats', len(beats), 'phase', phase, 'ibi med', np.median(ib), 'bpm range', 60/np.percentile(ib,90), 60/np.percentile(ib,10))
bars = beats[phase::4]; print('first bars', np.round(bars[:12],2))
