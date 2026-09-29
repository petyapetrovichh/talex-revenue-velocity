// Storyboard v4 — built on the devices catalogued from the original (rv/ORIGINAL-DEVICES.md):
// the picture changes about once a bar, graphics change on every word; ~2/3 hard cuts on the beat, the rest designed
// transitions, never the same one twice in a row; CV boxes only on detected faces / bodies / the object the lyric names;
// in-scene texts (billboards, signs, labels) stay on screen from the first frame; colour goes night -> dawn -> high-key.
'use strict';
RV.buildShots = () => {
  const { C, KIN, GFX: G, DEV: D, lerp, inv, eout, clamp, hash } = RV;
  const B = RV.bar, W = RV.wordT, T0 = RV.lineT0, T1 = RV.lineT1, WW = RV.W, HH = RV.H, F = RV.F;
  const LK = {
    night: { mode: 'ht', ht: 0.32, cell: 6, grade: [1.1, 1.14, 1.3, 0], grain: 0.05, vig: 0.42 },
    hall: { mode: 'ht', ht: 0.38, cell: 6, grade: [1.14, 1.18, 1.32, -0.2], grain: 0.05, vig: 0.38 },
    dawn: { mode: 'ht', ht: 0.3, cell: 5, grade: [1.06, 1.1, 1.22, 0.25], grain: 0.04, vig: 0.22 },
    warm: { mode: 'ht', ht: 0.36, cell: 6, grade: [1.08, 1.14, 1.35, 0.6], grain: 0.045, vig: 0.36 },
    day: { mode: 'ht', ht: 0.28, cell: 5, grade: [1.05, 1.1, 1.2, 0.1], grain: 0.04, vig: 0.18 },
    key: { mode: 'ht', ht: 0.5, cell: 7, grade: [1.2, 1.2, 1.05, 0.1], grain: 0.04, vig: 0.05 },
    clay: { mode: 'dither', ht: 0.9, cell: 4, tint: C.clay, ink: C.ink, grade: [1.1, 1.3, 1, 0], grain: 0.03, vig: 0.1 },
    mono: { mode: 'mono', ht: 0.8, cell: 8, tint: C.paper, ink: C.ink, grade: [1.05, 1.25, 1, 0], grain: 0.04, vig: 0.1 },
    clean: { mode: 'clean', grade: [1.05, 1.1, 1.18, 0], grain: 0.04, vig: 0.3 },
  };
  const cam = (o = {}) => (p, t) => { const e = RV.eio(p) * 0.3 + p * 0.7;
    return { zoom: lerp(o.z0 ?? 1.04, o.z1 ?? 1.1, e), x: lerp(o.x0 ?? 0, o.x1 ?? 0, e), y: lerp(o.y0 ?? 0, o.y1 ?? 0, e),
      rot: lerp(o.r0 ?? 0, o.r1 ?? 0, e), px: lerp(o.px0 ?? -0.02, o.px1 ?? 0.02, e), py: o.py ?? 0, focus: o.focus ?? 0.55, flip: o.flip }; };
  const quadOf = (m, q, d = 0.5) => q.map(([u, v]) => m.pt(u, v, d));
  const obj = (m, kind, o) => { const b = D.obj(m.sh.plate, kind, o); return b && m.box(b); };
  const objs = (m, kind) => (D.obj(m.sh.plate, kind, { all: true }) || []).map(b => m.box(b));
  const crowd = (m, what) => (RV.OBJ[m.sh.plate] || []).filter(d => d[0].startsWith('crowd') && d[0].includes(what)).sort((a, b) => a[1] - b[1]).map(d => m.box(d.slice(1, 5)));
  const face = m => m.face() || obj(m, 'face');
  const body = m => obj(m, 'person');
  const shots = [];
  const S = (a, b, plate, o) => shots.push(Object.assign({ t0: typeof a === 'number' ? B(a) : a.t, t1: typeof b === 'number' ? B(b) : b.t, plate }, o));
  const tw = (t) => ({ t });
  // knock-out type on a surface: black behind her, white where it crosses her silhouette
  function knockBack(ctx, m, name, q, d, paint) { const [c, x] = G.scratch(name, 1100, 600); paint(x, C.ink); G.quad(ctx, c, quadOf(m, q, d), 6); }
  function knockFront(ctx, m, name, q, d, paint, alpha = 0.92) {
    if (!m.mask) return; const [c, x] = G.scratch(name + 'W', 1100, 600); paint(x, C.white);
    const Sx = m.mask.width / WW, [k, kx] = G.scratch('knock', m.mask.width, m.mask.height);
    kx.setTransform(Sx, 0, 0, Sx, 0, 0); G.quad(kx, c, quadOf(m, q, d), 6); kx.setTransform(1, 0, 0, 1, 0, 0);
    kx.globalCompositeOperation = 'destination-in'; kx.drawImage(m.mask, 0, 0); kx.globalCompositeOperation = 'source-over';
    ctx.save(); ctx.globalAlpha = alpha; ctx.drawImage(k, 0, 0, WW, HH); ctx.restore();
  }
  const markAll = (id, t) => RV.lines[id].tokens.forEach((tk, i) => { if (t >= tk.t0) KIN.mark(id, i); });

  // ======================================================= PRELUDE (bars 0–3): flap lower-third that collapses into the counter
  const band = (ctx, t) => {
    if (t > B(3)) return; const tf = B(0.15), s = 'REVENUE SHARED BACK · S/S 26 · COLLECTION 01', y = 760;
    const r = G.flap(ctx, 110, y, 44, 'X7Q2M9W4K0Z3R8T1V6B5N2H9J4F7D0S3L8P1C6G5Y2', s, t, tf, { cw: 36, ch: 52, gap: 3, stagger: 0.02, spread: 0.1, hi: (i) => i < 13 });
    G.mono(ctx, 12, true); ctx.fillStyle = C.white; ctx.fillText('DEPARTURES · SS26 · COLLECTION 01', 110, y - 12);
    ctx.fillText(t < B(2) ? 'STATUS · BOARDING' : 'STATUS · LOCKED', 110, y + 52 + 20);
  };
  S(0, 1, 'G01', { look: LK.night, cam: cam({ z0: 1.1, z1: 1.18, focus: 0.7 }), chrome: { level: 'min' },
    draw(ctx, t, m) { D.box(ctx, face(m), t, B(0.25), { label: 'FACE · MODEL 01', conf: 0.98, tele: ['ROUTE 101 · NB', 'ETA · THE SHOW'] }); band(ctx, t); } });
  S(1, 1.5, 'waymo101', { look: LK.night, cam: cam({ z0: 1.05, z1: 1.12, x0: 0.02, x1: -0.02 }), chrome: { level: 'min' },
    draw(ctx, t, m) { D.box(ctx, obj(m, 'car'), t, B(1), { label: 'ROBOTAXI', conf: 0.97, tele: ['64 MPH'] }); band(ctx, t); } });
  S(1.5, 2, 'G01', { tin: { type: 'slices', d: 0.16 }, look: LK.night, cam: cam({ z0: 1.5, z1: 1.58, x0: 0.05, x1: 0.06, y0: -0.05, focus: 0.7 }), chrome: { level: 'min' },
    draw(ctx, t, m) { const f = face(m); if (f) D.iris(ctx, t, B(1.5), (f[0] + f[2] * 0.33) * WW, (f[1] + f[3] * 0.42) * HH, 70, '00', { caption: 'PUPIL · LOCK' }); band(ctx, t); } });
  S(2, 2.5, 'ext', { look: LK.night, cam: cam({ z0: 1.03, z1: 1.09 }), chrome: { level: 'min' },
    draw(ctx, t, m) { D.box(ctx, obj(m, 'car'), t, B(2), { label: 'ARRIVAL', conf: 0.96 }); G.mono(ctx, 13, true); ctx.fillStyle = C.white; ctx.fillText('VENUE · DATA HALL 07', 110, 160); band(ctx, t); } });
  S(2.5, 2.75, 'belt', { look: LK.night, cam: cam({ z0: 1.1, z1: 1.14 }), chrome: { level: 'min' },
    draw(ctx, t, m) { D.box(ctx, obj(m, 'tag'), t, B(2.5), { label: 'TAG · SS26', conf: 0.99 }); G.stamp(ctx, 'SECURED', 1350, 760, t, B(2.6), { size: 70 }); } });
  S(2.75, tw(T0('i1') - 0.05), 'G02', { tin: { type: 'flash', d: 0.14 }, look: LK.night, cam: cam({ z0: 1.04, z1: 1.1 }), chrome: { level: 'min' },
    draw(ctx, t, m) { D.box(ctx, obj(m, 'car'), t, B(2.8), { label: 'ROBOTAXI · DOOR OPEN', conf: 0.95 }); } });

  // ======================================================= INTRO
  S(tw(T0('i1') - 0.05), tw(W('i1', 'agents') - 0.03), 'hallms', { look: LK.hall, cam: cam({ z0: 1.04, z1: 1.1, focus: 0.6 }),
    draw(ctx, t, m) { D.box(ctx, body(m), t, T0('i1'), { label: 'BODY · MODEL 01', conf: 0.97, tele: ['PACE 1.2 M/S'] }); D.mast(ctx, 'i1', t, { x: 110, y: 560, size: 190 }); } });
  S(tw(W('i1', 'agents') - 0.03), tw(T0('i2') - 0.1), 'G02', { look: LK.hall, cam: cam({ z0: 1.06, z1: 1.1 }),
    draw(ctx, t, m) { D.swarm(ctx, crowd(m, 'laptop').concat(crowd(m, 'person')).slice(0, 26), t, W('i1', 'agents'), { label: 'AGENT', counter: 'AGENTS', step: 0.03 });
      D.mast(ctx, 'i1', t, { x: 960, y: 600, size: 250, align: 'center' }); } });
  const SCR = [[0.326, 0.097], [0.668, 0.097], [0.668, 0.428], [0.326, 0.428]];
  const scrPaint = t => (x, col) => { x.clearRect(0, 0, 1100, 600); const k = RV.lines.i2.tokens; KIN.font(x, 190, 'cond'); x.fillStyle = col;
    [[0, 1, 2], [3, 4]].forEach((r, ri) => { let xx = 60; r.forEach(i => { const s = k[i].w.toUpperCase(); if (t >= k[i].t0) { x.fillText(s, xx, 250 + ri * 200); KIN.mark('i2', i); } xx += x.measureText(s + ' ').width; }); });
    if (col === C.ink) { const cur = k.filter(tk => t >= tk.t0).length - 1; if (cur >= 0) { x.fillStyle = C.clay; x.fillRect(60, 480, 900 * eout(inv(k[0].t0, k[4].t1, t)), 12); } } };
  S(tw(T0('i2') - 0.1), tw(T0('i3') - 0.08), 'screen', { tin: { type: 'dots', d: 0.24 }, look: LK.hall, cam: cam({ z0: 1.03, z1: 1.07, focus: 0.7 }), cut: 0.45,
    back(ctx, t, m) { knockBack(ctx, m, 'scr', SCR, 0.1, scrPaint(t)); },
    draw(ctx, t, m) { knockFront(ctx, m, 'scr', SCR, 0.1, scrPaint(t));
      const a = m.pt(0.326, 0.097, 0.1), b = m.pt(0.668, 0.428, 0.1);
      D.box(ctx, [a.x / WW, a.y / HH, (b.x - a.x) / WW, (b.y - a.y) / HH], t, T0('i2'), { label: 'SCREEN', conf: 0.99, pad: 0.02, strike: { t: W('i2', 'future'), label: 'NOT A FORECAST 0.97' } }); } });
  S(tw(T0('i3') - 0.08), 8, 'hallwide', { look: LK.hall, cam: cam({ z0: 1.02, z1: 1.12, focus: 0.6 }),
    draw(ctx, t, m) { D.box(ctx, body(m), t, T0('i3'), { label: 'MODEL 01 · READY', conf: 0.98 }); D.mast(ctx, 'i3', t, { x: 960, y: 880, size: 170, align: 'center' }); } });
  // WALK: the drums enter on bar 8 — one look per half bar, a telemetry box per walk
  const WALKS = [['walk', null], ['twirl', 'iris'], ['hallms2', null], ['walk2', 'threshold'], ['hallwide', null], ['walk', 'bars'], ['hallms2', null], ['twirl', 'spark']];
  WALKS.forEach(([pl, tr], i) => S(8 + i * 0.5, 8 + (i + 1) * 0.5, pl, { tin: tr ? { type: tr, d: 0.18, cx: 0.5, cy: 0.35 } : null, look: i === 3 ? LK.mono : LK.hall,
    cam: cam({ z0: 1.06 + (i % 3) * 0.08, z1: 1.12 + (i % 3) * 0.08, flip: i >= 5, focus: 0.6 }),
    draw(ctx, t, m) { markAll('iw', t); const k = RV.lines.iw.tokens.filter(tk => t >= tk.t0 && t < tk.t1 + 0.3);
      if (k.length) D.hit(ctx, 'WALK.', 960, 620, 260, t, k[0].t0, { align: 'center' });
      D.box(ctx, body(m), t, B(8 + i * 0.5), { label: `WALK ${String(i + 1).padStart(2, '0')} / 08`, conf: 0.95 + (i % 4) / 100, tele: [`PACE ${(1.1 + i * 0.07).toFixed(2)} M/S`] }); } }));

  // ======================================================= VERSE — five looks
  const card = (n, title, rows, t0, o = {}) => (ctx, t) => D.lookCard(ctx, t, Object.assign({ n, title, rows, t0, x: 1500, y: 180, code: 'LOOK' + n, fromRight: true }, o));
  S(12, 13.3, 'overpass', { look: LK.dawn, cam: cam({ z0: 1.03, z1: 1.08 }), lookN: 1, lookName: 'AGI ERA', theme: 'light',
    draw(ctx, t, m) { card(1, 'AGI ERA', [['CHASING', 'A G I'], ['WHO', 'EVERYONE'], ['WHY', '—']], W('v1', 'one'))(ctx, t);
      D.swarm(ctx, crowd(m, 'person').slice(0, 18), t, W('v1', 'everyones'), { label: 'CHASER', counter: 'CHASING AGI', cx: 110, cy: 470 });
      D.cover(ctx, 'v1', t, { x: 110, y: 250, size: 64, maxW: 900, color: C.ink, tag: 'LOOK 01 / 05 · AGI ERA' }); } });
  S(13.3, tw(T0('v3') - 0.05), 'G04', { look: LK.dawn, cam: cam({ z0: 1.03, z1: 1.1, y0: 0.02, y1: -0.01 }), lookN: 1, lookName: 'AGI ERA', theme: 'light',
    draw(ctx, t, m) { D.box(ctx, obj(m, 'billboard'), t, B(13.3) + 0.05, { label: 'BILLBOARD', conf: 0.99, color: C.ink, pad: 0.03, strike: { t: W('v2', 'income'), label: 'MUSK · UHI 0.97' } });
      D.box(ctx, body(m), t, W('v2', 'dont'), { label: "DON'T ASK", conf: 0.91, color: C.ink });
      D.subChip(ctx, 'v2', t, { color: C.ink, chip: C.ink }); } });
  S(tw(T0('v3') - 0.05), tw(W('v3', 'asked') - 0.05), 'headset', { tin: { type: 'cardflip', d: 0.28 }, look: LK.night, cam: cam({ z0: 1.06, z1: 1.12, focus: 0.7 }), lookN: 2, lookName: 'THE MODELS AGREE',
    draw(ctx, t, m) { card(2, 'THE MODELS', [['ASKED', 'MONTHS AGO'], ['MODELS', '3'], ['ANSWERS', '1']], W('v3', 'two'))(ctx, t);
      D.box(ctx, face(m), t, T0('v3'), { label: 'FACE · LISTENING', conf: 0.97 }); D.cover(ctx, 'v3', t, { x: 110, y: 760, size: 56, maxW: 1000, until: W('v3', 'asked') }); } });
  S(tw(W('v3', 'asked') - 0.05), tw(T0('v4') - 0.05), 'headset', { look: LK.night, cam: cam({ z0: 1.1, z1: 1.14 }), lookN: 2, lookName: 'THE MODELS AGREE',
    draw(ctx, t) { D.terminal(ctx, t, W('v3', 'asked') - 0.05, { prompt: 'what comes next?', t1: T0('v4') - 0.05, from: [WW * 0.55, HH * 0.5, 480, 280],
      lines: [{ s: 'asking chatgpt… gemini… claude…' }, { s: '3 / 3 responded', t: W('v3', 'next') }] });
      D.cover(ctx, 'v3', t, { x: 110, y: 980, size: 40, maxW: 1400 }); } });
  S(tw(T0('v4') - 0.05), tw(W('v4', 'same', 5) - 0.05), 'three', { look: LK.hall, cam: cam({ z0: 1.03, z1: 1.06 }), lookN: 2, lookName: 'THE MODELS AGREE',
    draw(ctx, t, m) { const names = ['CHATGPT', 'GEMINI', 'CLAUDE'], keys = ['chatgpt', 'gemini', 'claude'];
      const fx = (RV.FACES.three || []).slice().sort((a, b) => a[0] - b[0]);
      fx.forEach((f, i) => { const b = m.box(f), tn = W('v4', keys[i]); D.box(ctx, b, t, tn, { label: names[i], conf: 0.99, chip: i === 2 ? C.clay : C.ink, chipFg: i === 2 ? C.ink : C.white });
        if (t > W('v4', 'same')) { G.mono(ctx, 18, true); ctx.fillStyle = C.white; const s = D.typed('"REVENUE SHARING."', t, W('v4', 'same') + i * 0.06, 40); ctx.fillText(s, b[0] * WW - 20, (b[1] + b[3]) * HH + 60); } });
      D.subChip(ctx, 'v4', t, { until: W('v4', 'same', 5) }); } });
  S(tw(W('v4', 'same', 5) - 0.05), tw(T0('v5') - 0.05), 'two', { tin: { type: 'flash', d: 0.14 }, look: LK.clean, cam: cam({ z0: 1.05, z1: 1.09 }), lookN: 2, lookName: 'THE MODELS AGREE',
    draw(ctx, t, m) { (RV.FACES.two || []).slice().sort((a, b) => a[0] - b[0]).forEach((b, i) => D.box(ctx, m.box(b), t, W('v4', 'same', 5) + i * 0.05, { label: i ? 'ANSWER B' : 'ANSWER A', conf: 1 }));
      D.hit(ctx, 'SAME TEXT.', 960, 620, 200, t, W('v4', 'text'), { align: 'center' }); G.mono(ctx, 14, true); ctx.fillStyle = C.white; if (t > W('v4', 'text')) ctx.fillText('DIFF · 0 CHANGES', 960 - 80, 680);
      markAll('v4', t); } });
  S(tw(T0('v5') - 0.05), tw(T0('v6') - 0.05), 'E5', { tin: { type: 'whip', d: 0.22, dir: -1 }, look: LK.dawn, cam: cam({ z0: 1.03, z1: 1.07, focus: 0.6 }), lookN: 3, lookName: 'INCOME NOW', theme: 'light',
    draw(ctx, t, m) { card(3, 'INCOME NOW', [['WAIT FOR', 'MACHINES'], ['EXIT', 'SKIPPED'], ['LANE', 'INCOME']], W('v5', 'three'), { y: 420 })(ctx, t);
      const signs = objs(m, 'sign').sort((a, b) => a[0] - b[0]);
      D.box(ctx, signs[0], t, W('v5', 'wait'), { label: 'EXIT', conf: 0.96, color: C.ink, pad: 0.02, strike: { t: W('v5', 'machines'), label: 'SKIP 0.99' } });
      D.box(ctx, face(m), t, W('v5', 'income'), { label: 'LANE · INCOME', conf: 0.98, color: C.ink });
      D.subChip(ctx, 'v5', t, { color: C.ink, chip: C.ink }); } });
  S(tw(T0('v6') - 0.05), tw(T0('v7') - 0.05), 'receipt', { look: LK.night, cam: cam({ z0: 1.05, z1: 1.1, focus: 0.6 }), lookN: 3, lookName: 'INCOME NOW',
    draw(ctx, t, m) { D.box(ctx, face(m), t, T0('v6'), { label: 'FACE · MODEL 01', conf: 0.97 });
      D.fig(ctx, t, { x: 110, y: 180, w: 560, h: 340, t0: W('v6', 'product'), head: 'FIG. 1 · SHARE PER PURCHASE · BOARD 03', data: [0.05, 0.12, 0.2, 0.3, 0.42, 0.55, 0.7, 0.86], hitClay: true,
        readout: (i, end) => `PURCHASE #${48213 + i} · SHARED ${end ? '▲ BACK TO YOU' : '…'}` });
      D.cover(ctx, 'v6', t, { x: 110, y: 640, size: 52, maxW: 800 }); } });
  S(tw(T0('v7') - 0.05), tw(T0('v8') - 0.05), 'E6', { tin: { type: 'ditherband', d: 0.3 }, look: LK.mono, cam: cam({ z0: 1.03, z1: 1.08 }), lookN: 4, lookName: 'THE SPLIT', theme: 'light',
    draw(ctx, t, m) { card(4, 'THE SPLIT', [['SUBSCRIPTION', 'NO'], ['ADS', 'NO'], ['REVENUE', 'SPLIT']], W('v7', 'four'), { x: 110, y: 180, fromRight: false })(ctx, t);
      D.box(ctx, obj(m, 'billboard'), t, W('v7', 'not'), { label: 'AD SPACE', conf: 0.99, color: C.ink, pad: 0.03, strike: { t: W('v7', 'split'), label: 'THE SPLIT 0.97' } });
      D.subChip(ctx, 'v7', t, { color: C.ink, chip: C.ink }); } });
  S(tw(T0('v8') - 0.05), tw(T0('v9') - 0.05), 'E7', { look: LK.dawn, cam: cam({ z0: 1.04, z1: 1.09 }), lookN: 4, lookName: 'THE SPLIT', theme: 'light',
    draw(ctx, t, m) { D.box(ctx, [0.46, 0.25, 0.37, 0.53], t, T0('v8'), { label: 'WOVEN LABEL', conf: 0.99, color: C.ink, pad: 0 });
      D.stack(ctx, t, [{ t: W('v8', 'purchase'), s: 'PURCHASE', sub: '#48214' }, { t: W('v8', 'forward'), s: 'PAYS FORWARD', sub: '+ SHARE' }, { t: W('v8', 'simple'), s: 'SIMPLE', sub: '1 STEP' }, { t: W('v8', 'legit'), s: 'LEGIT', sub: 'ON-CHAIN' }], { x: 110, y: 200 });
      D.subChip(ctx, 'v8', t, { color: C.ink, chip: C.ink }); } });
  S(tw(T0('v9') - 0.05), tw(W('v9', 'esim') - 0.05), 'G08', { tin: { type: 'flapwipe', d: 0.36 }, look: LK.night, cam: cam({ z0: 1.03, z1: 1.07 }), lookN: 5, lookName: 'ROAM · EARN',
    draw(ctx, t, m) { card(5, 'ROAM · EARN', [['PRODUCT', 'eSIM'], ['COVERAGE', 'EVERYWHERE'], ['SIGN-UPS', 'PAY BACK']], W('v9', 'five'), { y: 560 })(ctx, t);
      D.box(ctx, body(m), t, W('v9', 'five'), { label: 'PASSENGER 01', conf: 0.96, tele: ['GATE · ANY'] });
      for (let i = 0; i < 4; i++) D.led(ctx, 1830, (0.08 + i * 0.13) * HH + 40, t + i * 0.1, { rate: 2 });
      D.subChip(ctx, 'v9', t); } });
  S(tw(W('v9', 'esim') - 0.05), tw(T0('v10') - 0.05), 'E9', { look: LK.day, cam: cam({ z0: 1.04, z1: 1.09, focus: 0.7 }), lookN: 5, lookName: 'ROAM · EARN', theme: 'light',
    draw(ctx, t, m) { D.box(ctx, [0.41, 0.66, 0.17, 0.19], t, W('v9', 'esim'), { label: 'CARD', conf: 0.99, color: C.ink, pad: 0.05, strike: { t: W('v9', 'connected'), label: 'eSIM · LIVE 1.00' } });
      D.callout(ctx, { x: 0.58 * WW, y: 0.3 * HH }, { x: 0.8 * WW, y: 0.22 * HH }, 'STREAK · CLAY #D97757', t, W('v9', 'stay'), { color: C.ink });
      D.subChip(ctx, 'v9', t, { color: C.ink, chip: C.ink }); } });
  S(tw(T0('v10') - 0.05), 32, 'monitor', { tin: { type: 'torn', d: 0.3 }, look: LK.day, cam: cam({ z0: 1.05, z1: 1.09, focus: 0.6 }), lookN: 5, lookName: 'ROAM · EARN', theme: 'light',
    draw(ctx, t, m) { D.box(ctx, face(m), t, T0('v10'), { label: 'FACE · MODEL 01', conf: 0.98, color: C.ink });
      const t0 = W('v10', 'signs'), n = Math.floor(RV.beatsSince(t0, t) * 2); G.panel(ctx, 1180, 170, 600, 360, `${F.product} · SIGN-UPS`, { status: (Math.floor(t * 2) % 2 ? '● ' : '○ ') + 'LIVE' });
      G.mono(ctx, 16); for (let i = 0; i < 9; i++) { const k = n - i; if (k < 0 || t < t0) continue; ctx.fillStyle = i === 0 ? C.clay : C.white; ctx.globalAlpha = 1 - i * 0.09;
        ctx.fillText(`NEW SIGN-UP · ${['TOKYO', 'LISBON', 'DUBAI', 'NEW YORK', 'BERLIN'][Math.floor(hash(k) * 5)]}  +$${(0.4 + hash(k + 3) * 3).toFixed(2)} → YOU`, 1200, 235 + i * 32); } ctx.globalAlpha = 1;
      D.subChip(ctx, 'v10', t, { color: C.ink, chip: C.ink }); } });

  // ======================================================= PRE-CHORUS (no drums): iris number, full-frame flap card, lock
  S(32, tw(W('p1', 'its') - 0.05), 'eye', { tin: { type: 'crt', d: 0.4 }, look: LK.clean, cam: cam({ z0: 1.1, z1: 1.16 }), chrome: { level: 'min' },
    draw(ctx, t) { D.iris(ctx, t, B(32) + 0.1, 0.36 * WW, 0.52 * HH, 120, '0%', { caption: 'CHARITY · NOT FOUND' }); D.subChip(ctx, 'p1', t); } });
  S(tw(W('p1', 'its') - 0.05), tw(T1('p1') + 0.3), null, { chrome: { level: 'min' },
    draw(ctx, t) { D.flapCard(ctx, t, W('p1', 'default'), ['0', 'F'], ['0', 'N'], { caption: 'DEFAULT · SWITCHED ON', leftLabel: 'SETTING · DEFAULT', rightLabel: 'STATE · ON', marker: 0.9, clay: true });
      KIN.font(ctx, 60, 'cond'); ctx.fillStyle = C.ink; ctx.fillText('THE NEW DEFAULT.', 110, 150); D.subChip(ctx, 'p1', t, { color: C.ink, chip: C.ink }); } });
  S(tw(T1('p1') + 0.3), tw(T0('c1') - 0.03), 'streak', { look: LK.warm, cam: cam({ z0: 1.06, z1: 1.16, focus: 0.7 }),
    draw(ctx, t, m) { const ti = W('p2', 'in'), x = 170, y = 380, k = eout(inv(ti, ti + 0.12, t));
      ctx.save(); ctx.strokeStyle = C.white; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(x + 110, y + 40 - 40 * (1 - k), 80, Math.PI, 0); ctx.stroke(); ctx.fillStyle = t > ti ? C.clay : C.white; ctx.fillRect(x, y + 40, 220, 170); ctx.restore();
      D.mast(ctx, 'p2', t, { x: 460, y: 560, size: 230 }); D.box(ctx, face(m), t, T0('p2'), { label: 'LOCKED IN', conf: 1, chip: C.clay, chipFg: C.ink }); } });

  // ======================================================= CHORUS
  S(tw(T0('c1') - 0.03), 37, 'sing1', { tin: { type: 'clayflash', d: 0.24 }, look: LK.warm, cam: cam({ z0: 1.08, z1: 1.16, focus: 0.7 }),
    draw(ctx, t, m) { D.mast(ctx, 'c1', t, { x: 110, y: 560, size: 250 }); const v = inv(T0('c1'), T1('c1'), t);
      G.gauge(ctx, 1560, 780, 170, 0.15 + 0.8 * RV.eio(v), { label: 'VELOCITY · KM/S', value: (0.3 + 11 * RV.eio(v)).toFixed(1) }); D.box(ctx, face(m), t, T0('c1'), { label: 'FACE · SINGING', conf: 0.97 }); } });
  S(37, tw(T0('c3') - 0.03), 'walkwarm', { look: LK.warm, cam: cam({ z0: 1.05, z1: 1.14, focus: 0.5 }), cut: 0.4,
    back(ctx, t) { const te = W('c2', 'pay'), n = Math.floor(RV.beatsSince(te, t) * 16);
      for (let i = 0; i < 160; i++) { const x = 110 + (i % 20) * 90, y = 180 + Math.floor(i / 20) * 82; ctx.fillStyle = t > te && hash(i * 1.7) * 160 < n ? C.clay : 'rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.arc(x, y, 13, 0, 7); ctx.fill(); ctx.fillRect(x - 16, y + 18, 32, 36); } },
    draw(ctx, t, m) { D.mast(ctx, 'c1', t, { x: 110, y: 880, size: 230, until: T0('c2') - 0.05 }); D.cover(ctx, 'c2', t, { x: 110, y: 880, size: 96, maxW: 1500 }); D.box(ctx, body(m), t, T0('c2'), { label: 'MODEL 01 · PAID BACK', conf: 0.98 }); } });
  S(tw(T0('c3') - 0.03), tw(T0('c4') - 0.03), 'crowd', { tin: { type: 'rgb', d: 0.2 }, look: LK.warm, cam: cam({ z0: 1.03, z1: 1.08, focus: 0.4 }),
    draw(ctx, t, m) { D.fig(ctx, t, { x: 1150, y: 170, w: 620, h: 340, t0: W('c3', 'promise'), head: 'FIG. 2 · PROMISE vs SHIPPED', data: [0.05, 0.1, 0.18, 0.3, 0.46, 0.64, 0.82, 1], threshold: 0.7, thLabel: 'REAL', hitClay: true, readout: (i, e) => e ? 'STATUS · ALREADY REAL' : 'STATUS · FUTURE…' });
      D.mast(ctx, 'c3', t, { x: 110, y: 900, size: 170 }); D.box(ctx, obj(m, 'billboard'), t, W('c3', 'future'), { label: 'STAGE', conf: 0.95, strike: { t: W('c3', 'real'), label: 'REAL 1.00' } }); } });
  S(tw(T0('c4') - 0.03), tw(T1('c4') + 0.4), 'sing2', { tin: { type: 'spin', d: 0.3 }, look: LK.day, cam: cam({ z0: 1.06, z1: 1.14, focus: 0.6 }),
    draw(ctx, t, m) { D.lookCard(ctx, t, { head: 'TERMS · NON-NEGOTIABLE', title: 'THE DEAL', rows: [['01', 'PRODUCTS PAY BACK'], ['02', 'EVERY PURCHASE SPLITS'], ['03', 'ALREADY LIVE']], t0: W('c4', 'revenue'), x: 1480, y: 170, w: 340, fromRight: true, code: 'DEAL' });
      D.mast(ctx, 'c4', t, { x: 110, y: 880, size: 200 }); } });
  S(tw(T1('c4') + 0.4), tw(T0('c5a') - 0.05), 'freeway', { look: LK.day, cam: cam({ z0: 1.04, z1: 1.14, px0: 0.04, px1: -0.04, focus: 0.6 }), theme: 'light',
    draw(ctx, t, m) { const t0 = T1('c4') + 0.4; D.box(ctx, body(m), t, t0, { label: 'MODEL 01 · 64 MPH', conf: 0.96, color: C.ink });
      D.pulse(ctx, t, [RV.beats[RV.beatIdx(t0) + 1], RV.beats[RV.beatIdx(t0) + 2], RV.beats[RV.beatIdx(t0) + 3]]);
      const n = Math.min(5, Math.floor(RV.beatsSince(t0, t)));   // payout ledger: one row per beat, newest in clay
      G.mono(ctx, 13, true); ctx.fillStyle = C.ink; ctx.fillText('PAYOUTS · LIVE', 120, 190); ctx.fillRect(120, 200, 430, 1.5);
      for (let i = 0; i <= n; i++) { KIN.font(ctx, 64, 'cond'); ctx.fillStyle = i === n ? C.clay : C.ink; ctx.fillText(`+$${RV.fmt(Math.floor(500 + hash(i) * 14000))}`, 120, 270 + i * 72);
        G.mono(ctx, 12, true); ctx.fillText(`HOLDER #${1000 + Math.floor(hash(i * 3.1) * 8999)}`, 420, 262 + i * 72); } } });
  const soBack = (id, plate, look, flip, t0, t1, tin) => {
    S(tw(t0), tw(W(id, 'were') - 0.03), plate, { tin, look, cam: cam({ z0: 1.1, z1: 1.14, flip }),
      draw(ctx, t, m) { D.box(ctx, face(m), t, t0 + 0.05, { label: 'MOOD · OVER?', conf: 0.49 }); D.subChip(ctx, id, t, { until: W(id, 'were') }); } });
    S(tw(W(id, 'were') - 0.03), tw(t1), 'whitecu', { look: LK.key, cam: cam({ z0: 1.12, z1: 1.2, flip: !flip }), theme: 'light',
      draw(ctx, t, m) { const k = RV.lines[id].tokens; markAll(id, t); [3, 4, 5].forEach((i, j) => { if (t < k[i].t0) return; KIN.font(ctx, 230, 'cond'); const s = k[i].w.toUpperCase();
          const x = flip ? 110 : 1060, y = 330 + j * 200; if (t < k[i].t0 + 2 / 30) { ctx.fillStyle = C.clay; ctx.fillRect(x - 20, y - 200, ctx.measureText(s).width + 40, 230); }
          ctx.fillStyle = i === 5 ? C.clay : C.ink; ctx.fillText(s, x, y); });
        D.pulse(ctx, t, [k[3].t0, k[4].t0, k[5].t0], { color: 'rgba(241,239,233,0.5)' }); } });
  };
  soBack('c5a', 'closeup', LK.dawn, false, T0('c5a') - 0.05, T0('c5b') - 0.05, { type: 'threshold', d: 0.2 });
  soBack('c5b', 'face', LK.clay, true, T0('c5b') - 0.05, T1('c5b') + 0.35, null);

  // ======================================================= BRIDGE (no drums) — high-key from here on
  S(tw(T1('c5b') + 0.35), tw(T0('b2') - 0.05), 'line', { tin: { type: 'peel', d: 0.4 }, look: LK.key, cam: cam({ z0: 1.03, z1: 1.07 }), theme: 'light',
    draw(ctx, t, m) { D.swarm(ctx, crowd(m, 'person').slice(0, 14), t, W('b1', 'sale'), { label: 'SALE', counter: 'SALES BEHIND YOU', step: 0.12, cx: 110, cy: 170 });
      D.subChip(ctx, 'b1', t, { color: C.ink, chip: C.ink }); } });
  S(tw(T0('b2') - 0.05), tw(W('b2', 'ownership') - 0.05), 'sleep', { look: LK.key, cam: cam({ z0: 1.04, z1: 1.08 }), theme: 'light',
    draw(ctx, t, m) { D.box(ctx, face(m), t, T0('b2'), { label: 'FACE · ASLEEP', conf: 0.97, color: C.ink, tele: ['EARNING · YES'] });
      D.fig(ctx, t, { x: 1200, y: 170, w: 580, h: 320, t0: W('b2', 'wealth'), head: 'FIG. 3 · WEALTH WHILE ASLEEP', data: [0.1, 0.16, 0.22, 0.3, 0.4, 0.52, 0.66], readout: (i) => `0${2 + i}:00 · +$${(i * 1.7).toFixed(2)}` });
      D.subChip(ctx, 'b2', t, { color: C.ink, chip: C.ink, until: W('b2', 'ownership') }); } });
  S(tw(W('b2', 'ownership') - 0.05), tw(T0('b3') - 0.05), 'E10', { tin: { type: 'iris', d: 0.3, cx: 0.52, cy: 0.35 }, look: LK.day, cam: cam({ z0: 1.05, z1: 1.09, focus: 0.7 }), theme: 'light',
    draw(ctx, t, m) { D.box(ctx, [0.41, 0.63, 0.19, 0.22], t, W('b2', 'ownership'), { label: 'CARD', conf: 0.99, color: C.ink, pad: 0.05, strike: { t: W('b2', 'find'), label: 'OWNER 1.00' } }); D.subChip(ctx, 'b2', t, { color: C.ink, chip: C.ink }); } });
  S(tw(T0('b3') - 0.05), tw(T0('b4') - 0.05), 'around', { look: LK.key, cam: cam({ z0: 1.03, z1: 1.08 }), theme: 'light',
    draw(ctx, t, m) { D.swarm(ctx, crowd(m, 'person').slice(0, 12), t, W('b3', 'join'), { label: 'JOINED', counter: 'PEOPLE', step: 0.1, cx: 110, cy: 170 });
      D.fig(ctx, t, { x: 1200, y: 170, w: 580, h: 320, t0: W('b3', 'numbers'), head: 'FIG. 4 · PEOPLE × REVENUE', data: [0.05, 0.08, 0.14, 0.24, 0.38, 0.58, 0.84, 1], hitClay: true, readout: (i, e) => e ? 'GROWING ▲' : '…' });
      D.subChip(ctx, 'b3', t, { color: C.ink, chip: C.ink }); } });
  const SIGN = [[0.251, 0.0887], [0.701, 0.19], [0.701, 0.3082], [0.251, 0.212]];
  const signPaint = t => (x) => { x.clearRect(0, 0, 1100, 600); const ta = W('b4', 'agi'), tn = ta + 0.45; x.fillStyle = '#ffffff';
    if (t > ta) { KIN.font(x, 270, 'cond'); KIN.track(x, 'A G I', 70, 290, 30); } if (t > tn) { KIN.font(x, 120, 'cond'); x.fillText('NEXT EXIT', 70, 480);
      x.lineWidth = 16; x.strokeStyle = '#fff'; x.beginPath(); x.moveTo(760, 500); x.lineTo(900, 360); x.stroke(); x.beginPath(); x.moveTo(900, 360); x.lineTo(830, 370); x.lineTo(890, 430); x.closePath(); x.fill(); } };
  S(tw(T0('b4') - 0.05), tw(T1('b4') + 0.12), 'E11', { hold: true, tin: { type: 'cross', d: 0.3 }, look: LK.day, cam: cam({ z0: 1.03, z1: 1.07, focus: 0.65 }), cut: 0.5, theme: 'light',
    back(ctx, t, m) { knockBack(ctx, m, 'sign', SIGN, 0.26, signPaint(t)); },
    draw(ctx, t, m) { knockFront(ctx, m, 'sign', SIGN, 0.26, signPaint(t), 0.45);
      D.box(ctx, obj(m, 'sign'), t, T0('b4'), { label: 'ROAD SIGN', conf: 0.97, color: C.ink, pad: 0.02, strike: { t: W('b4', 'agi'), label: 'ROAD TO AGI 0.99' } });
      D.subChip(ctx, 'b4', t, { color: C.ink, chip: C.ink }); } });

  // ======================================================= FINAL CHORUS: contact sheet of the products → zoom into her
  const cells = RV.THUMBS = [{ plate: 'E6', cap: 'PRODUCT 01' }, { plate: 'E7', cap: 'PRODUCT 02' }, { plate: 'E9', cap: 'PRODUCT 03' }, { plate: 'G04', cap: 'PRODUCT 04' }, { plate: 'sing2', cap: 'MODEL 01' }, { plate: 'E13', cap: 'PRODUCT 05' }];
  S(tw(T1('b4') + 0.12), tw(W('f1', 'shared') - 0.05), null, { chrome: { level: 'min' },
    draw(ctx, t, m) { D.contact(ctx, t, T1('b4') + 0.12, cells, 4, W('f1', 'shared') - 0.2, (cx, c, x, y, w, h) => { const im = RV.THUMB && RV.THUMB[c.plate]; if (im) cx.drawImage(im, x, y, w, h); else { cx.fillStyle = C.ink; cx.fillRect(x, y, w, h); } });
      KIN.font(ctx, 80, 'cond'); ctx.fillStyle = C.ink; D.cover(ctx, 'f1', t, { x: 1500, y: 180, size: 60, maxW: 360, color: C.ink }); } });
  S(tw(W('f1', 'shared') - 0.05), tw(T0('f2') - 0.03), 'sing2', { look: LK.warm, cam: cam({ z0: 1.06, z1: 1.14, flip: true, focus: 0.6 }),
    draw(ctx, t, m) { D.mast(ctx, 'f1', t, { x: 110, y: 880, size: 200 }); D.box(ctx, face(m), t, W('f1', 'shared'), { label: 'SHARED · 100%', conf: 1 }); } });
  S(tw(T0('f2') - 0.03), tw(T0('f3') - 0.03), 'walkwarm', { tin: { type: 'slices', d: 0.2 }, look: LK.warm, cam: cam({ z0: 1.08, z1: 1.16, focus: 0.5 }), cut: 0.4,
    back(ctx, t) { for (let i = 0; i < 160; i++) { const x = 110 + (i % 20) * 90, y = 180 + Math.floor(i / 20) * 82; ctx.fillStyle = hash(i * 1.7) < inv(T0('f2'), T1('f2'), t) ? C.clay : 'rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.arc(x, y, 13, 0, 7); ctx.fill(); ctx.fillRect(x - 16, y + 18, 32, 36); } },
    draw(ctx, t) { D.mast(ctx, 'f2', t, { x: 110, y: 900, size: 190 }); } });
  S(tw(T0('f3') - 0.03), tw(T0('f4') - 0.03), 'sing1', { look: LK.warm, cam: cam({ z0: 1.12, z1: 1.2, flip: true, focus: 0.7 }),
    draw(ctx, t, m) { D.mast(ctx, 'f3', t, { x: 1810, y: 560, size: 250, align: 'right' }); const v = inv(T0('f3'), T1('f3'), t);
      G.gauge(ctx, 360, 780, 170, 0.15 + 0.84 * RV.eio(v), { label: 'VELOCITY · KM/S', value: (0.3 + 11.2 * RV.eio(v)).toFixed(1) }); } });
  S(tw(T0('f4') - 0.03), 69, 'hallwide', { tin: { type: 'zoom', d: 0.3, box: [0.45, 0.3, 0.1, 0.1] }, look: LK.hall, cam: cam({ z0: 1.02, z1: 1.14, focus: 0.6 }),
    draw(ctx, t, m) { G.grid(ctx, t, { step: 60, color: `rgba(255,255,255,${0.05 + 0.12 * inv(T0('f4'), T1('f4'), t)})` }); D.cover(ctx, 'f4', t, { x: 110, y: 300, size: 120, maxW: 700, upper: true });
      D.box(ctx, body(m), t, T0('f4'), { label: 'MODEL 01 · FINAL LOOK', conf: 0.99 }); } });

  // ======================================================= OUTRO: care label, the ride home, dot-pitch ramp, spark to the title tag
  S(69, tw(T0('o2') - 0.05), 'E12', { tin: { type: 'fade', d: 0.4 }, look: LK.key, cam: cam({ z0: 1.03, z1: 1.07 }), chrome: { level: 'min' }, theme: 'light',
    draw(ctx, t, m) { D.box(ctx, [0.25, 0.3, 0.5, 0.55], t, T0('o1'), { label: 'CARE LABEL', conf: 0.99, color: C.ink, pad: 0 });
      D.callout(ctx, { x: 0.3 * WW, y: 0.42 * HH }, { x: 0.12 * WW, y: 0.3 * HH }, 'BUY', t, W('o1', 'buy'), { color: C.ink });
      D.callout(ctx, { x: 0.7 * WW, y: 0.5 * HH }, { x: 0.86 * WW, y: 0.42 * HH }, 'OWN', t, W('o1', 'own'), { color: C.ink });
      D.callout(ctx, { x: 0.62 * WW, y: 0.6 * HH }, { x: 0.86 * WW, y: 0.7 * HH }, 'EARNS', t, W('o1', 'earns'), { color: C.ink }); markAll('o1', t); } });
  S(tw(T0('o2') - 0.05), tw(W('o2', 'wheel') - 0.05), 'G01', { look: LK.night, cam: cam({ z0: 1.12, z1: 1.18, focus: 0.7 }), chrome: { level: 'min' },
    draw(ctx, t, m) { D.box(ctx, face(m), t, T0('o2'), { label: 'FACE · MODEL 01', conf: 0.98, tele: ['ROUTE · HOME'] }); D.subChip(ctx, 'o2', t, { until: W('o2', 'wheel') - 0.05 }); } });
  // the ride away: halftone cell steps up every bar, then the spark wipe to the tag
  S(tw(W('o2', 'wheel') - 0.05), 82, 'waymoaway', { tin: { type: 'torn', d: 0.3 }, look: LK.night, chrome: { level: 'min' },
    cam: (p, t) => { const bar = Math.max(0, Math.floor(RV.beatPos(t) / 4) - Math.floor(RV.beatPos(B(76)) / 4)); const cells = [7, 8, 10, 12, 16, 21, 27, 36, 47, 60];
      return Object.assign(cam({ z0: 1.02, z1: 1.12 })(p, t), { cell: cells[Math.min(cells.length - 1, bar)], ht: t > B(76) ? 0.85 : 0.35 }); },
    draw(ctx, t, m) { D.subChip(ctx, 'o2', t); D.box(ctx, obj(m, 'car'), t, W('o2', 'wheel'), { label: 'ROBOTAXI · LEAVING', conf: 0.97 });
      if (t > B(76)) { const bar = Math.floor(RV.beatPos(t) / 4) - Math.floor(RV.beatPos(B(76)) / 4); const cells = [7, 8, 10, 12, 16, 21, 27, 36, 47, 60];
        ctx.fillStyle = C.paper; ctx.fillRect(110, 820, 330, 110); ctx.fillStyle = C.ink; G.mono(ctx, 13, true); ctx.fillText('SCREEN · DOT PITCH', 126, 848); KIN.font(ctx, 48, 'monom'); ctx.fillText(`${cells[Math.min(9, bar)]} PX`, 126, 904); } } });
  S(82, 85.5, 'E13', { tin: { type: 'spark', d: 0.5, cx: 0.5, cy: 0.5 }, look: LK.key, cam: cam({ z0: 1.04, z1: 1.1 }), chrome: { level: 'min' },
    draw(ctx, t, m) { D.box(ctx, [0.42, 0.08, 0.3, 0.38], t, B(82.5), { label: 'TAG · REVENUE VELOCITY', conf: 1, color: C.ink, pad: 0.02 });
      if (t > B(83.5)) { G.mono(ctx, 18, true); ctx.fillStyle = C.white; ctx.globalAlpha = eout(inv(B(83.5), B(83.5) + 0.5, t)); ctx.fillText(`${F.brand} · S/S 26 · THE AGI-ERA COLLECTION`, 110, 980); ctx.globalAlpha = 1; } } });

  // no designed transition twice in a row
  // faster cutting without touching the plates: a shot longer than ~1.3 bars is re-cut on the downbeats into
  // alternate framings of the same plate (as-is -> punch-in on her face -> reframe on the other side ...).
  // Overlays are functions of t, so texts, cards and boxes stay put across the cuts; boxes follow the new framing.
  const asp = WW / HH;
  const aim = (sh, z, u, v) => ({ zoom: z, x: clamp((u - 0.5) * asp, -asp / 2 * (1 - 1 / z), asp / 2 * (1 - 1 / z)), y: clamp(v - 0.5, -0.5 * (1 - 1 / z), 0.5 * (1 - 1 / z)) });
  const target = (sh) => { const f = G.face(sh.plate, 0) || D.obj(sh.plate, 'face') || D.obj(sh.plate, 'person'); return f ? [f[0] + f[2] / 2, f[1] + f[3] * (G.face(sh.plate, 0) ? 0.5 : 0.3)] : null; };
  const TEXTP = new Set(['G04', 'E5', 'E6', 'E7', 'E9', 'E10', 'E11', 'E12', 'E13', 'screen']);
  const recut = [];
  shots.forEach((sh, si) => {
    const len = sh.t1 - sh.t0, bar = B(1) - B(0);
    if (!sh.plate || sh.hold || len < 1.3 * bar) { recut.push(sh); return; }
    // cut points: next downbeat 0.75–1.3 bars on, else the half-bar; never leave a sliver under half a bar
    const cuts = []; let cur = sh.t0;
    for (;;) { const lo = cur + 0.75 * bar, hi = Math.min(cur + 1.3 * bar, sh.t1 - 0.5 * bar);
      const c = RV.bars.find(b => b >= lo && b <= hi) ?? RV.bars.map(b => b + bar / 2).find(b => b >= lo && b <= hi);
      if (c == null) break; cuts.push(c); cur = c; }
    if (!cuts.length) { recut.push(sh); return; }
    const edges = [sh.t0, ...cuts, sh.t1], tg = target(sh), base = sh.cam || (() => ({}));
    edges.slice(0, -1).forEach((a, j) => {
      const b = edges[j + 1], k = (j + si) % 3, gp = t => clamp((t - sh.t0) / len);
      const sub = Object.assign({}, sh, { t0: a, t1: b });
      if (j > 0) { delete sub.tin; sub.cam = (p, t) => { const c = Object.assign({}, base(gp(t), t)), z0 = c.zoom ?? 1.05;
        if (k === 0 && tg && !TEXTP.has(sh.plate)) return Object.assign(c, aim(sh, z0 * 1.55, tg[0], tg[1]));          // tight on her
        if (TEXTP.has(sh.plate)) return Object.assign(c, aim(sh, z0 * (k === 0 ? 1.1 : 1.18), 0.5, 0.5)); // baked text stays whole
        if (k === 1) return Object.assign(c, aim(sh, z0 * 1.22, tg && tg[0] > 0.5 ? 0.25 : 0.75, 0.45)); // other side of the frame
        return Object.assign(c, aim(sh, z0 * 1.3, 0.5, tg ? tg[1] : 0.4)); }; }                // centred medium
      recut.push(sub);
    });
  });
  shots.length = 0; shots.push(...recut);
  let prev = null; shots.forEach((s, i) => { const ty = s.tin && s.tin.type; if (ty && ty === prev) console.error(`repeat transition ${ty} at shot ${i}`); if (ty) prev = ty; });
  return shots;
};
