// Core: constants, math, hashing, the beat grid and the lyric timeline.
// Every frame is a pure function of t: no state between frames, no Math.random, no Date.
'use strict';
const RV = window.RV = {};
RV.W = 1920; RV.H = 1080;
RV.C = {
  ink: '#0d1013', ink2: '#1b2026', paper: '#f1efe9', paper2: '#e4e1d8',
  clay: '#d97757', clayHi: '#ec8a68', red: '#e0412f', steel: '#9aabb9', white: '#ffffff', grey: '#8a8f94',
};

RV.clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
RV.lerp = (a, b, k) => a + (b - a) * k;
RV.inv = (a, b, x) => RV.clamp((x - a) / (b - a));
RV.smooth = k => (k = RV.clamp(k), k * k * (3 - 2 * k));
RV.eout = (k, p = 3) => 1 - Math.pow(1 - RV.clamp(k), p);
RV.ein = (k, p = 3) => Math.pow(RV.clamp(k), p);
RV.eio = k => (k = RV.clamp(k), k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
RV.back = (k, s = 1.7) => (k = RV.clamp(k) - 1, k * k * ((s + 1) * k + s) + 1);
RV.hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
RV.hash2 = (a, b) => RV.hash(a * 57.3 + b * 13.7);
RV.fmt = (n, d = 0) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

// ---- timeline -------------------------------------------------------------
RV.load = async () => {
  RV.T = await (await fetch('data/timeline.json')).json();
  RV.F = await (await fetch('data/facts.json')).json();
  RV.FACES = await (await fetch('data/faces.json')).json();
  const T = RV.T;
  RV.beats = T.beats.map(b => b.t);
  // storyboard bars: the draft grid, warped onto the real take when tools/align.py has run
  RV.bars = T.storyBars || T.beats.filter(b => b.down).map(b => b.t);
  RV.lines = {}; T.lines.forEach(l => (RV.lines[l.id] = l));
  RV.DUR = T.duration;
};
// time of output bar n (fractional n allowed: interpolates across the bar)
RV.bar = n => {
  const B = RV.bars, i = Math.floor(n), f = n - i;
  if (i >= B.length - 1) { const d = B[B.length - 1] - B[B.length - 2]; return B[B.length - 1] + (n - (B.length - 1)) * d; }
  if (i < 0) return B[0] + n * (B[1] - B[0]);
  return B[i] + f * (B[i + 1] - B[i]);
};
RV.beatIdx = t => { // index of the last beat <= t (binary search)
  const B = RV.beats; let lo = 0, hi = B.length - 1;
  if (t < B[0]) return -1;
  while (lo < hi) { const m = (lo + hi + 1) >> 1; if (B[m] <= t) lo = m; else hi = m - 1; }
  return lo;
};
RV.beatPos = t => { // continuous beat position
  const B = RV.beats, i = RV.beatIdx(t);
  if (i < 0) return (t - B[0]) / (B[1] - B[0]);
  const n = i + 1 < B.length ? B[i + 1] : B[i] + (B[i] - B[i - 1]);
  return i + (t - B[i]) / (n - B[i]);
};
RV.pulse = (t, k = 7) => { const i = RV.beatIdx(t); return i < 0 ? 0 : Math.exp(-(t - RV.beats[i]) * k); };
RV.barPulse = (t, k = 5) => { let last = -1e9; for (const b of RV.bars) { if (b <= t) last = b; else break; } return Math.exp(-(t - last) * k); };
RV.beatsSince = (t0, t) => RV.beatPos(t) - RV.beatPos(t0);
RV.snapBeat = t => RV.beats[Math.max(0, RV.beatIdx(t))];
// words
RV.words = id => RV.lines[id].tokens;
RV.lineT0 = id => RV.lines[id].tokens[0].t0;
RV.lineT1 = id => { const k = RV.lines[id].tokens; return k[k.length - 1].t1; };
// word start by display text (first match at or after index `from`)
RV.wordT = (id, w, from = 0) => { const k = RV.lines[id].tokens; for (let i = from; i < k.length; i++) if (k[i].w.replace(/[^\w']/g, '').toLowerCase() === w.toLowerCase()) return k[i].t0; return RV.lineT0(id); };
