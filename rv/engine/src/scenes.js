// Storyboard v3 — the final Suno track. Shots are placed on bars (B(n)) or on word times (W(line, word)).
// Prelude like the original intro; "walk" cuts on the drum entry; five looks; baked-in texts revealed word by word;
// knock-out type over her on the screen and the AGI sign; recap montage and the title tag at the end.
'use strict';
RV.buildShots = () => {
  const { C, KIN, GFX: G, lerp, inv, eout, clamp, hash } = RV;
  const B = RV.bar, W = RV.wordT, T0 = RV.lineT0, T1 = RV.lineT1, WW = RV.W, HH = RV.H, F = RV.F;
  const LK = {
    night: { mode: 'ht', ht: 0.36, cell: 6, grade: [1.1, 1.14, 1.28, 0], grain: 0.05, vig: 0.42 },
    hall: { mode: 'ht', ht: 0.42, cell: 6, grade: [1.14, 1.18, 1.32, -0.2], grain: 0.05, vig: 0.38 },
    warm: { mode: 'ht', ht: 0.4, cell: 6, grade: [1.08, 1.14, 1.35, 0.6], grain: 0.045, vig: 0.38 },
    day: { mode: 'ht', ht: 0.3, cell: 5, grade: [1.04, 1.1, 1.2, 0.1], grain: 0.04, vig: 0.2 },
    paper: { mode: 'ht', ht: 0.26, cell: 5, grade: [1.03, 1.06, 1.1, 0.2], grain: 0.035, vig: 0.12 },
    clay: { mode: 'dither', ht: 0.9, cell: 4, tint: C.clay, ink: C.ink, grade: [1.1, 1.3, 1, 0], grain: 0.03, vig: 0.1 },
    mono: { mode: 'mono', ht: 0.8, cell: 8, tint: C.paper, ink: C.ink, grade: [1.05, 1.25, 1, 0], grain: 0.04, vig: 0.1 },
    clean: { mode: 'clean', grade: [1.05, 1.1, 1.18, 0], grain: 0.04, vig: 0.3 },
  };
  // smooth camera: slow push/pan/parallax, no per-beat bump
  const cam = (o = {}) => (p, t) => {
    const e = RV.eio(p) * 0.3 + p * 0.7;
    return { zoom: lerp(o.z0 ?? 1.04, o.z1 ?? 1.1, e) + (o.bump ?? 0) * RV.pulse(t, 8), x: lerp(o.x0 ?? 0, o.x1 ?? 0, e), y: lerp(o.y0 ?? 0, o.y1 ?? 0, e),
      rot: lerp(o.r0 ?? 0, o.r1 ?? 0, e), px: lerp(o.px0 ?? -0.02, o.px1 ?? 0.02, e), py: o.py ?? 0, focus: o.focus ?? 0.55, flip: o.flip };
  };
  const quadOf = (m, q, d = 0.5) => q.map(([u, v]) => m.pt(u, v, d));
  const sub = (ctx, id, t, o = {}) => KIN.subtitle(ctx, id, t, Object.assign({ x: 960, y: 960, size: 42, align: 'center', hold: 0.4 }, o));
  const INK = 'rgba(13,16,19,0.72)', PAPER = 'rgba(241,239,233,0.9)';
  const lookCard = (ctx, t, n, name, rows, t0, o = {}) => G.tag(ctx, t, Object.assign({ x: 1520, y: 190, w: 330, h: 300, title: `LOOK 0${n}`, sub: name, rows, t0, code: 'LOOK' + n, stamp: 'MODEL: THE LEAD' }, o));
  // progress of a line: 0 before its first word, 1 at its last word
  const lineP = (id, t) => { const k = RV.lines[id].tokens; let n = 0; k.forEach(tk => { if (t >= tk.t0) n++; }); return n / k.length; };
  // reveal of a baked-in text: blank plate with the edited twin showing through, top to bottom with the words
  const reveal = (key, ids, box) => (p, t) => {
    let prog = 0; ids.forEach((id, i) => { prog = Math.max(prog, (i + lineP(id, t)) / ids.length); });
    const y = box[1] + box[3] * prog; return { reveal: { key, y: prog <= 0 ? -1 : prog >= 1 ? 2 : y, soft: 0.02 } };
  };
  const merge = (...fs) => (p, t) => Object.assign({}, ...fs.map(f => f(p, t)));
  // knock-out type: black behind her (back layer), white where it crosses her (front layer, masked by her silhouette)
  function knockBack(ctx, m, name, q, d, paint) { const [c, x] = G.scratch(name, 1100, 600); paint(x, C.ink); G.quad(ctx, c, quadOf(m, q, d), 6); }
  function knockFront(ctx, m, name, q, d, paint) {
    if (!m.mask) return;
    const [c, x] = G.scratch(name + 'W', 1100, 600); paint(x, C.white);
    const S = m.mask.width / WW, [k, kx] = G.scratch('knock', m.mask.width, m.mask.height);
    kx.setTransform(S, 0, 0, S, 0, 0); G.quad(kx, c, quadOf(m, q, d), 6);
    kx.setTransform(1, 0, 0, 1, 0, 0); kx.globalCompositeOperation = 'destination-in'; kx.drawImage(m.mask, 0, 0); kx.globalCompositeOperation = 'source-over';
    ctx.save(); ctx.globalAlpha = 0.92; ctx.drawImage(k, 0, 0, WW, HH); ctx.restore();
  }
  const shots = [];
  const S = (a, b, plate, o) => shots.push(Object.assign({ t0: typeof a === 'number' ? B(a) : a.t, t1: typeof b === 'number' ? B(b) : b.t, plate }, o));
  const at = t => ({ t });

  // ===================================== PRELUDE (bars 0–3): the original's opening, on our frames
  S(0, 1, 'G01', { look: LK.night, cam: cam({ z0: 1.12, z1: 1.2, px0: -0.01, px1: 0.01, focus: 0.7 }), chrome: { level: 'min' },
    draw(ctx, t, m) {
      const k = inv(B(0), B(1), t); ctx.save(); ctx.globalCompositeOperation = 'screen'; const g = ctx.createLinearGradient(lerp(-600, 2200, k), 0, lerp(-200, 2600, k), 0);
      g.addColorStop(0, 'rgba(224,65,47,0)'); g.addColorStop(0.5, 'rgba(224,65,47,0.35)'); g.addColorStop(1, 'rgba(224,65,47,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, WW, HH); ctx.restore();
      G.cv(ctx, m.face(), t, B(0.5), { label: 'PASSENGER', conf: 0.97, lw: 1.5 });
      G.flap(ctx, 110, 900, 24, ' '.repeat(24), 'REVENUE VELOCITY  S/S 26', t, B(0.25), { cw: 26, ch: 38 });
    } });
  S(1, 1.5, 'waymo101', { tin: { type: 'flash', d: 0.16 }, look: LK.night, cam: cam({ z0: 1.05, z1: 1.14, x0: 0.02, x1: -0.02 }), chrome: { level: 'min' },
    draw(ctx, t) { G.mono(ctx, 14, true); ctx.fillStyle = C.white; ctx.fillText('ROBOTAXI · ROUTE 101 · NB', 110, 150); ctx.fillText('ETA: THE SHOW', 110, 172); } });
  S(1.5, 2, 'G01', { tin: { type: 'slices', d: 0.18 }, look: LK.night, cam: cam({ z0: 1.35, z1: 1.45, x0: 0.06, x1: 0.08, flip: true, focus: 0.7 }), chrome: { level: 'min' },
    draw(ctx, t, m) { G.cv(ctx, m.face(), t, B(1.5), { label: 'EYES: OPEN', conf: 0.99, lw: 1.5 }); } });
  S(2, 2.5, 'ext', { tin: { type: 'flash', d: 0.16 }, look: LK.night, cam: cam({ z0: 1.03, z1: 1.1 }), chrome: { level: 'min' },
    draw(ctx, t) { G.mono(ctx, 14, true); ctx.fillStyle = C.white; ctx.fillText('VENUE: DATA HALL 07', 110, 150); ctx.fillText('GUESTS: HUMANS + AGENTS', 110, 172); } });
  S(2.5, 2.75, 'belt', { tin: { type: 'rgb', d: 0.14, amt: 40 }, look: LK.night, cam: cam({ z0: 1.1, z1: 1.16 }), chrome: { level: 'min' },
    draw(ctx, t) { G.stamp(ctx, 'SECURED', 1350, 760, t, B(2.55), { size: 70 }); } });
  S(2.75, { t: T0('i1') - 0.05 }, 'G02', { tin: { type: 'flash', d: 0.14 }, look: LK.night, cam: cam({ z0: 1.04, z1: 1.12 }), chrome: { level: 'min' } });

  // ===================================== INTRO
  S({ t: T0('i1') - 0.05 }, { t: W('i1', 'agents') - 0.02 }, 'hallms', { look: LK.hall, cam: cam({ z0: 1.04, z1: 1.12, px0: -0.03, px1: 0.03, focus: 0.6 }),
    draw(ctx, t) { KIN.masthead(ctx, 'i1', t, { stack: true, x: 110, y: 420, size: 150, lh: 0.95, until: W('i1', 'agents') }); } });
  S({ t: W('i1', 'agents') - 0.02 }, { t: T0('i2') - 0.1 }, 'front', { tin: { type: 'flash', d: 0.14 }, look: LK.hall, cam: cam({ z0: 1.08, z1: 1.14, px0: 0.02, px1: -0.02 }),
    draw(ctx, t) {
      const ta = W('i1', 'agents');
      for (let i = 0; i < 26; i++) { const x = 0.04 + hash(i * 3.3) * 0.9, y = 0.52 + hash(i * 7.7) * 0.36, s = 0.03 + (y - 0.5) * 0.12; if (Math.abs(x - 0.5) < 0.09) continue;
        G.cv(ctx, [x, y, s, s * 1.3], t, ta + (i % 8) * 0.04, { label: i % 4 ? null : 'AGENT', conf: 0.9 + hash(i) * 0.09, lw: 1.5, fs: 12, seed: i }); }
      KIN.masthead(ctx, 'i1', t, { align: 'center', x: 960, y: 560, size: 250, hi: ['agents'], scaleIn: true, until: T0('i2') - 0.1 });
      KIN.mark('i1', 0); KIN.mark('i1', 1);
    } });
  // "This is not the future." — on the screen behind her, word by word, knocked out over her (like the original's AI BILLBOARD)
  const SCR = [[0.326, 0.097], [0.668, 0.097], [0.668, 0.428], [0.326, 0.428]];
  const scrPaint = t => (x, col) => {
    x.fillStyle = col === C.ink ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0)'; x.clearRect(0, 0, 1100, 600);
    const k = RV.lines.i2.tokens; KIN.font(x, 190, 'cond'); x.fillStyle = col;
    const rows = [[0, 1, 2], [3, 4]]; rows.forEach((r, ri) => { let xx = 60; r.forEach(i => { const tk = k[i], s = tk.w.toUpperCase(); if (t >= tk.t0) { x.fillText(s, xx, 250 + ri * 200); KIN.mark('i2', i); } xx += x.measureText(s + ' ').width; }); });
    if (col === C.ink && t > k[4].t0) { x.fillStyle = C.clay; x.fillRect(60, 480, 900 * eout(inv(k[4].t0, k[4].t1, t)), 14); }
  };
  S({ t: T0('i2') - 0.1 }, { t: T0('i3') - 0.08 }, 'screen', { tin: { type: 'cross', d: 0.12 }, look: LK.hall, cam: cam({ z0: 1.03, z1: 1.08, px0: -0.015, px1: 0.015, focus: 0.7 }), cut: 0.45,
    back(ctx, t, m) { knockBack(ctx, m, 'scr', SCR, 0.1, scrPaint(t)); },
    draw(ctx, t, m) {
      knockFront(ctx, m, 'scr', SCR, 0.1, scrPaint(t));
      const a = m.pt(0.326, 0.097, 0.1), b = m.pt(0.668, 0.428, 0.1);
      G.cv(ctx, [a.x / WW, a.y / HH, (b.x - a.x) / WW, (b.y - a.y) / HH], t, T0('i2'), { label: 'NOT A FORECAST', conf: 0.97, pad: 0.02, lw: 1.5 });
      G.cv(ctx, m.face(), t, W('i2', 'future'), { label: 'LEAD', conf: 0.99, sub: ['ROLE: HOST'] });
    } });
  S({ t: T0('i3') - 0.08 }, 8, 'hallwide', { tin: { type: 'flash', d: 0.14 }, look: LK.hall, cam: cam({ z0: 1.02, z1: 1.14, focus: 0.6 }),
    draw(ctx, t) { KIN.coverline(ctx, 'i3', t, { x: 960 - 520, y: 900, size: 150, upper: true, hi: ['walk'], until: B(8) }); } });
  // WALK: the drums enter on bar 8 — a cut on every other beat, a flash on each echo
  const WALKS = ['walk', 'twirl', 'hallms2', 'walk2', 'hallwide', 'walk', 'hallms2', 'twirl'];
  const walkTr = ['flash', 'slices', 'flip', 'rgb', 'strobe', 'whip', 'flash', 'spin'];
  WALKS.forEach((pl, i) => S(8 + i * 0.5, 8 + (i + 1) * 0.5, pl, {
    tin: { type: walkTr[i], d: 0.16, dir: i % 2 ? 1 : -1, seed: i }, look: i % 3 === 2 ? LK.mono : LK.hall,
    cam: cam({ z0: 1.06 + (i % 3) * 0.06, z1: 1.14 + (i % 3) * 0.06, flip: i >= 5, r0: (i % 2 ? -0.02 : 0.02), r1: 0, focus: 0.6 }),
    draw(ctx, t, m) {
      const k = RV.lines.iw.tokens; k.forEach((tk, j) => { if (t >= tk.t0) KIN.mark('iw', j); });
      const cur = k.filter(tk => t >= tk.t0 && t < tk.t1 + 0.35);
      if (cur.length) { KIN.font(ctx, 260, 'cond'); ctx.fillStyle = C.white; ctx.globalAlpha = 1 - inv(cur[0].t1, cur[0].t1 + 0.35, t); const s = 'WALK.'; ctx.fillText(s, 960 - ctx.measureText(s).width / 2, 620); ctx.globalAlpha = 1; }
      G.cv(ctx, G.body(m.face()), t, B(8 + i * 0.5), { label: `WALK ${String(i + 1).padStart(2, '0')}`, lw: 1.5 });
    } }));

  // ===================================== VERSE — five looks
  S(12, { t: T0('v2') - 0.05 }, 'overpass', { tin: { type: 'flash', d: 0.16 }, look: LK.day, cam: cam({ z0: 1.03, z1: 1.1, px0: -0.02, px1: 0.02 }), lookN: 1, lookName: 'AGI ERA', theme: 'light',
    draw(ctx, t) {
      lookCard(ctx, t, 1, 'AGI ERA', [['CHASING', 'A G I'], ['EVERYONE', 'YES'], ['WHY', '—']], W('v1', 'one'));
      KIN.coverline(ctx, 'v1', t, { x: 110, y: 260, size: 110, sizes: { look: 56, one: 56 }, maxW: 900, color: C.ink, hi: ['agi'] });
      for (let i = 0; i < 9; i++) G.cv(ctx, [0.12 + i * 0.085, 0.52 + hash(i) * 0.1, 0.03, 0.08], t, W('v1', 'everyones') + i * 0.05, { label: i === 4 ? 'CHASING' : null, color: C.ink, tagBg: C.ink, tagFg: C.paper, lw: 1.2, fs: 11 });
    } });
  S({ t: T0('v2') - 0.05 }, { t: T0('v3') - 0.05 }, 'G04', { tin: { type: 'whip', d: 0.22, dir: -1 }, look: LK.day, cam: cam({ z0: 1.03, z1: 1.12, y0: 0.02, y1: -0.02, px0: 0.02, px1: -0.02 }), lookN: 1, lookName: 'AGI ERA', theme: 'light',
    draw(ctx, t) { sub(ctx, 'v2', t, { bg: PAPER, color: C.ink, hi: ['universal', 'high', 'income'] }); G.stamp(ctx, "DON'T ASK WHY", 400, 780, t, W('v2', 'dont'), { size: 64, rot: -0.06 }); } });
  S({ t: T0('v3') - 0.05 }, { t: T0('v4') - 0.05 }, 'headset', { tin: { type: 'slices', d: 0.2 }, look: LK.night, cam: cam({ z0: 1.06, z1: 1.14, focus: 0.7 }), lookN: 2, lookName: 'THE MODELS AGREE',
    draw(ctx, t, m) {
      lookCard(ctx, t, 2, 'THE MODELS AGREE', [['ASKED', 'MONTHS AGO'], ['MODELS', '3'], ['ANSWERS', '1']], W('v3', 'two'));
      const tq = W('v3', 'asked');
      if (t > tq) G.chat(ctx, t, { x: 110, y: 640, w: 720, h: 150, name: 'PROMPT · SENT TO 3 MODELS', prompt: 'what comes next?', p0: tq, pd: 0.6, a0: 1e9, answer: '' });
      sub(ctx, 'v3', t, { bg: INK, hi: ['models'] }); G.cv(ctx, m.face(), t, T0('v3'), { label: 'LEAD · LISTENING', conf: 0.97 });
    } });
  S({ t: T0('v4') - 0.05 }, { t: W('v4', 'same', 5) - 0.05 }, 'three', { tin: { type: 'rgb', d: 0.2 }, look: LK.hall, cam: cam({ z0: 1.03, z1: 1.07 }), lookN: 2, lookName: 'THE MODELS AGREE',
    draw(ctx, t, m) {
      const names = ['ChatGPT', 'Gemini', 'Claude'], keys = ['chatgpt', 'gemini', 'claude'], fx = (RV.FACES.three || []).slice().sort((a, b) => a[0] - b[0]);
      const ts = W('v4', 'same');
      fx.forEach((f, i) => { const b = m.box(f), tn = W('v4', keys[i]); G.cv(ctx, b, t, tn, { label: names[i].toUpperCase(), conf: 0.99, tagBg: i === 2 ? C.clay : C.paper });
        G.chat(ctx, t, { x: clamp(b[0] * WW - 60, 60, WW - 420), y: 640, w: 360, h: 170, name: names[i], status: 'answer', prompt: 'what comes next?', p0: tn, pd: 0.3, a0: ts, ad: 0.25, answer: 'REVENUE SHARING.', as: 40, check: 'match', accent: i === 2 ? C.clay : C.steel }); });
      KIN.coverline(ctx, 'v4', t, { x: 110, y: 170, size: 60, hi: ['same'], until: W('v4', 'same', 5) });
    } });
  S({ t: W('v4', 'same', 5) - 0.05 }, { t: T0('v5') - 0.05 }, 'two', { tin: { type: 'flash', d: 0.14 }, look: LK.clean, cam: cam({ z0: 1.05, z1: 1.1 }), lookN: 2, lookName: 'THE MODELS AGREE',
    draw(ctx, t, m) {
      (RV.FACES.two || []).slice().sort((a, b) => a[0] - b[0]).forEach((b, i) => G.cv(ctx, m.box(b), t, W('v4', 'same', 5) + i * 0.06, { label: i ? 'TEXT B' : 'TEXT A', conf: 1 }));
      G.panel(ctx, 700, 760, 520, 110, 'diff answer_a.txt answer_b.txt', { status: '0 CHANGES' });
      G.mono(ctx, 17); ctx.fillStyle = C.white; ['  share the revenue with users', '  every purchase pays it forward'].forEach((s, i) => ctx.fillText('=' + s, 720, 815 + i * 24));
      G.stamp(ctx, 'SAME TEXT', 960, 300, t, W('v4', 'text'), { size: 120, rot: -0.08 });
      KIN.mark('v4', RV.lines.v4.tokens.length - 1); KIN.mark('v4', RV.lines.v4.tokens.length - 2);
    } });
  S({ t: T0('v5') - 0.05 }, { t: T0('v6') - 0.05 }, 'E5blank', { tin: { type: 'whip', d: 0.22, dir: 1 }, look: LK.day, lookN: 3, lookName: 'INCOME NOW', theme: 'light',
    cam: merge(cam({ z0: 1.03, z1: 1.08, focus: 0.6 }), reveal('E5', ['v5'], [0, 0, 1, 0.31])),
    draw(ctx, t) { lookCard(ctx, t, 3, 'INCOME NOW', [['WAIT FOR', 'MACHINES'], ['INCOME', 'NOW'], ['EXIT', 'SKIPPED']], W('v5', 'three'), { y: 420 }); sub(ctx, 'v5', t, { bg: PAPER, color: C.ink, hi: ['income', 'machines'] }); } });
  S({ t: T0('v6') - 0.05 }, { t: T0('v7') - 0.05 }, 'receipt', { tin: { type: 'flapwipe', d: 0.4 }, look: LK.night, cam: cam({ z0: 1.05, z1: 1.12, focus: 0.6 }), lookN: 3, lookName: 'INCOME NOW',
    draw(ctx, t) {
      const tp = W('v6', 'product'), ts = W('v6', 'shares'), o = F.order, rx = 110, ry = 200;
      if (t > tp) { const k = eout(inv(tp, tp + 0.3, t)); ctx.fillStyle = C.paper; ctx.fillRect(rx, ry, 360, 260 * k); ctx.save(); ctx.beginPath(); ctx.rect(rx, ry, 360, 260 * k); ctx.clip(); ctx.fillStyle = C.ink; G.mono(ctx, 17, true);
        ['RECEIPT ' + o.id, '— — — — — — — — — —', o.item, '', 'TOTAL           ' + o.price, 'REVENUE SHARE:   ON'].forEach((s, i) => ctx.fillText(s, rx + 20, ry + 40 + i * 34)); ctx.restore(); }
      const src = { x: rx + 360, y: ry + 130 };
      ['YOU', 'YOU', 'YOU'].forEach((name, i) => { const dst = { x: 620, y: 200 + i * 120 }, k = eout(inv(ts + i * 0.08, ts + 0.35 + i * 0.08, t)); G.arrow(ctx, src, dst, k, { color: i === 1 ? C.clay : C.white });
        if (k >= 1) { G.panel(ctx, dst.x + 10, dst.y - 30, 230, 60, 'SHARE → ' + name, { status: '+' }); } });
      sub(ctx, 'v6', t, { bg: INK, hi: ['shares'] });
    } });
  S({ t: T0('v7') - 0.05 }, { t: T0('v8') - 0.05 }, 'E6blank', { tin: { type: 'slices', d: 0.2, seed: 5 }, look: LK.mono, lookN: 4, lookName: 'THE SPLIT', theme: 'light',
    cam: merge(cam({ z0: 1.03, z1: 1.1, x0: -0.01, x1: 0.01 }), reveal('E6', ['v7'], [0, 0.12, 1, 0.62])),
    draw(ctx, t) { lookCard(ctx, t, 4, 'THE SPLIT', [['SUBSCRIPTIONS', 'NO'], ['ADS', 'NO'], ['REVENUE', 'SPLIT']], W('v7', 'four'), { x: 110, y: 190 }); sub(ctx, 'v7', t, { bg: PAPER, color: C.ink, hi: ['revenue', 'split'] }); } });
  S({ t: T0('v8') - 0.05 }, { t: T0('v9') - 0.05 }, 'E7blank', { tin: { type: 'flash', d: 0.16 }, look: LK.paper, lookN: 4, lookName: 'THE SPLIT', theme: 'light',
    cam: merge(cam({ z0: 1.04, z1: 1.1 }), reveal('E7', ['v8'], [0, 0.39, 1, 0.26])),
    draw(ctx, t) { sub(ctx, 'v8', t, { bg: PAPER, color: C.ink, hi: ['forward', 'legit'] }); } });
  S({ t: T0('v9') - 0.05 }, { t: W('v9', 'esim') - 0.05 }, 'G08', { tin: { type: 'flapwipe', d: 0.4 }, look: LK.night, cam: cam({ z0: 1.03, z1: 1.08, x0: -0.01, x1: 0.01 }), lookN: 5, lookName: 'ROAM · EARN',
    draw(ctx, t, m) { lookCard(ctx, t, 5, 'ROAM · EARN', [['PRODUCT', 'eSIM'], ['COVERAGE', 'EVERYWHERE'], ['SIGN-UPS', 'PAY BACK']], W('v9', 'five'), { y: 520 }); sub(ctx, 'v9', t, { bg: INK, hi: ['esim'] }); } });
  S({ t: W('v9', 'esim') - 0.05 }, { t: T0('v10') - 0.05 }, 'E9blank', { tin: { type: 'flash', d: 0.14 }, look: LK.paper, lookN: 5, lookName: 'ROAM · EARN', theme: 'light',
    cam: merge(cam({ z0: 1.04, z1: 1.1, focus: 0.7 }), (p, t) => ({ reveal: { key: 'E9', y: t > W('v9', 'esim') ? 2 : -1 } })),
    draw(ctx, t, m) { G.cv(ctx, m.face(), t, W('v9', 'esim'), { label: 'LEAD · CONNECTED', conf: 1, color: C.ink, tagBg: C.ink, tagFg: C.paper }); sub(ctx, 'v9', t, { bg: PAPER, color: C.ink, hi: ['esim', 'roam'], x: 1800, align: 'right' }); } });
  S({ t: T0('v10') - 0.05 }, 32, 'monitor', { tin: { type: 'slices', d: 0.2, seed: 9 }, look: LK.day, cam: cam({ z0: 1.05, z1: 1.1, focus: 0.6 }), lookN: 5, lookName: 'ROAM · EARN', theme: 'light',
    draw(ctx, t) {
      const t0 = W('v10', 'signs'); G.panel(ctx, 1180, 170, 600, 360, `${F.product} · SIGN-UPS`, { status: (Math.floor(t * 2) % 2 ? '● ' : '○ ') + 'LIVE' });
      const n = Math.floor(RV.beatsSince(t0, t) * 2); G.mono(ctx, 16);
      for (let i = 0; i < 9; i++) { const k = n - i; if (k < 0 || t < t0) continue; ctx.fillStyle = i === 0 ? C.clay : C.white; ctx.globalAlpha = 1 - i * 0.09;
        ctx.fillText(`NEW SIGN-UP · ${['TOKYO', 'LISBON', 'DUBAI', 'NEW YORK', 'BERLIN'][Math.floor(hash(k) * 5)]}   +$${(0.4 + hash(k + 3) * 3).toFixed(2)} → YOU`, 1200, 235 + i * 32); }
      ctx.globalAlpha = 1; sub(ctx, 'v10', t, { x: 110, y: 930, align: 'left', bg: PAPER, color: C.ink, hi: ['paid', 'home'] });
    } });

  // ===================================== PRE-CHORUS
  S(32, { t: T1('p1') + 0.25 }, 'eye', { tin: { type: 'strobe', d: 0.3 }, look: LK.clean, cam: cam({ z0: 1.1, z1: 1.2, bump: 0 }), chrome: { level: 'min' },
    draw(ctx, t) {
      const cx = 1090, cy = 560, k = eout(inv(B(32), B(32) + 0.6, t));
      ctx.save(); ctx.strokeStyle = C.white; ctx.globalAlpha = 0.8; ctx.lineWidth = 1.5; ctx.setLineDash([6, 8]); ctx.lineDashOffset = -t * 40; ctx.beginPath(); ctx.arc(cx, cy, 230 * k, 0, 7); ctx.stroke(); ctx.restore();
      G.mono(ctx, 15, true); ctx.fillStyle = C.white; const tc = W('p1', 'charity'), td = W('p1', 'default');
      ctx.fillText(t < tc ? 'SCANNING…' : t < td ? 'CLAIM: CHARITY → NOT FOUND' : 'MODE: DEFAULT', cx + 250, cy - 140);
      G.stamp(ctx, 'THE NEW DEFAULT', 700, 300, t, td, { size: 90, rot: -0.05 });
      sub(ctx, 'p1', t, { size: 50, bg: INK, hi: ['default'] });
    } });
  S({ t: T1('p1') + 0.25 }, { t: T0('c1') - 0.03 }, 'streak', { tin: { type: 'flash', d: 0.16 }, look: LK.warm, cam: cam({ z0: 1.06, z1: 1.18, focus: 0.7 }),
    draw(ctx, t, m) {
      const ti = W('p2', 'in'), x = 170, y = 380, k = eout(inv(ti, ti + 0.12, t));
      ctx.save(); ctx.strokeStyle = C.white; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(x + 110, y + 40 - 40 * (1 - k), 80, Math.PI, 0); ctx.stroke(); ctx.fillStyle = t > ti ? C.clay : C.white; ctx.fillRect(x, y + 40, 220, 170); ctx.restore();
      KIN.masthead(ctx, 'p2', t, { stack: true, x: 440, y: 470, size: 220, lh: 0.85, hi: ['in'] }); sub(ctx, 'p1', t, { size: 50, bg: INK, hi: ['default'] });
      G.cv(ctx, m.face(), t, T0('p2'), { label: 'LOCKED IN', conf: 1, color: C.clay });
    } });

  // ===================================== CHORUS
  S({ t: T0('c1') - 0.03 }, { t: T0('c2') - 0.03 }, 'sing1', { tin: { type: 'clayflash', d: 0.24 }, look: LK.warm, cam: cam({ z0: 1.08, z1: 1.18, px0: 0.03, px1: -0.03, focus: 0.7 }),
    draw(ctx, t) { KIN.masthead(ctx, 'c1', t, { x: 110, y: 560, size: 250, hi: ['agi'] }); const v = inv(T0('c1'), T1('c1'), t);
      G.gauge(ctx, 1560, 780, 170, 0.15 + 0.8 * RV.eio(v), { label: 'VELOCITY', value: (0.3 + 11 * RV.eio(v)).toFixed(1) }); } });
  S({ t: T0('c2') - 0.03 }, { t: T0('c3') - 0.03 }, 'walkwarm', { tin: { type: 'whip', d: 0.22, dir: 1 }, look: LK.warm, cam: cam({ z0: 1.05, z1: 1.18, focus: 0.5 }), cut: 0.4,
    back(ctx, t) { const te = W('c2', 'pay'), n = Math.floor(RV.beatsSince(te, t) * 16);
      for (let i = 0; i < 160; i++) { const x = 110 + (i % 20) * 90, y = 180 + Math.floor(i / 20) * 82; ctx.fillStyle = t > te && hash(i * 1.7) * 160 < n ? C.clay : 'rgba(255,255,255,0.3)';
        ctx.beginPath(); ctx.arc(x, y, 13, 0, 7); ctx.fill(); ctx.fillRect(x - 16, y + 18, 32, 36); } },
    draw(ctx, t) { KIN.coverline(ctx, 'c2', t, { x: 110, y: 880, size: 100, hi: ['pay', 'back'] }); } });
  S({ t: T0('c3') - 0.03 }, { t: T0('c4') - 0.03 }, 'crowd', { tin: { type: 'rgb', d: 0.2 }, look: LK.warm, cam: cam({ z0: 1.03, z1: 1.1, focus: 0.4 }),
    draw(ctx, t) {
      const tf = W('c3', 'future'), tr = W('c3', 'real');
      if (t > tf) { G.panel(ctx, 1060, 170, 700, 300, 'ROADMAP', { status: t > tr ? 'SHIPPED' : 'FUTURE' }); G.mono(ctx, 20); ctx.fillStyle = C.white;
        ['Q? · revenue sharing', 'Q? · pays you back', 'Q? · built to last'].forEach((s, i) => { ctx.fillText((t > tr ? '[x] ' : '[ ] ') + s, 1090, 250 + i * 60); if (t > tr) { ctx.fillStyle = C.clay; ctx.fillRect(1090, 243 + i * 60, 420 * eout(inv(tr + i * 0.08, tr + 0.3 + i * 0.08, t)), 3); ctx.fillStyle = C.white; } }); }
      G.stamp(ctx, 'ALREADY REAL', 1400, 620, t, tr, { size: 100 });
      KIN.masthead(ctx, 'c3', t, { x: 110, y: 900, size: 170, hi: ['real'] });
    } });
  S({ t: T0('c4') - 0.03 }, { t: T1('c4') + 0.4 }, 'sing2', { tin: { type: 'spin', d: 0.3 }, look: LK.day, cam: cam({ z0: 1.06, z1: 1.16, r0: 0.02, r1: -0.02, focus: 0.6 }),
    draw(ctx, t) { const td = W('c4', 'deal');
      G.tag(ctx, t, { x: 1300, y: 170, w: 460, h: 420, title: 'THE DEAL', sub: 'TERMS · NON-NEGOTIABLE', t0: W('c4', 'revenue'), rows: [['01', 'PRODUCTS PAY YOU BACK'], ['02', 'EVERY PURCHASE SPLITS'], ['03', 'ALREADY LIVE']], rowGap: 0.18, code: 'DEAL' });
      if (t > td) { ctx.save(); ctx.strokeStyle = C.clay; ctx.lineWidth = 4; ctx.beginPath(); const k = eout(inv(td, td + 0.35, t)); for (let i = 0; i <= 60 * k; i++) { const x = 1330 + i * 6, y = 520 + Math.sin(i * 0.5) * 16 * Math.sin(i * 0.11); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.restore(); }
      KIN.masthead(ctx, 'c4', t, { x: 110, y: 880, size: 200, hi: ['deal', 'revenue'] }); } });
  S({ t: T1('c4') + 0.4 }, { t: T0('c5a') - 0.05 }, 'freeway', { tin: { type: 'flash', d: 0.16 }, look: LK.day, cam: cam({ z0: 1.04, z1: 1.18, px0: 0.04, px1: -0.04, focus: 0.6 }), theme: 'light',
    draw(ctx, t) { const t0 = T1('c4') + 0.4, n = Math.floor(RV.beatsSince(t0, t) * 2);
      for (let i = 0; i <= n && i < 12; i++) { const x = 120 + hash(i * 9.1) * 1500, y = 170 + hash(i * 4.3) * 700; KIN.font(ctx, 40 + hash(i + 2) * 50, 'cond'); ctx.fillStyle = i === n ? C.clay : C.ink; ctx.globalAlpha = 1 - (n - i) * 0.07; ctx.fillText(`+$${RV.fmt(Math.floor(500 + hash(i) * 14000))}`, x, y); }
      ctx.globalAlpha = 1; } });
  const back = (id, plate, look, flip, t0, t1, lab) => {
    S({ t: t0 }, { t: W(id, 'were') - 0.03 }, plate, { tin: { type: 'slices', d: 0.2, seed: 3 }, look, cam: cam({ z0: 1.1, z1: 1.16, flip }),
      draw(ctx, t, m) { KIN.subtitle(ctx, id, t, { x: flip ? 1810 : 110, y: 900, size: 64, fam: 'mono', wt: '', color: C.paper, bg: C.ink, align: flip ? 'right' : 'left', underline: false });
        G.cv(ctx, m.face(), t, t0 + 0.1, { label: 'MOOD: OVER?', conf: 0.49, color: C.ink, tagBg: C.ink, tagFg: C.paper }); } });
    S({ t: W(id, 'were') - 0.03 }, { t: t1 }, 'whitecu', { tin: { type: 'strobe', d: 0.24 }, look: LK.mono, cam: cam({ z0: 1.12, z1: 1.24, flip: !flip }), theme: 'light',
      draw(ctx, t) { KIN.masthead(ctx, id, t, { stack: true, stackFrom: 3, x: flip ? 110 : 1000, y: 330, size: 260, lh: 0.84, color: C.ink, hi: ['back'] });
        const tb = W(id, 'back'); if (t > tb) for (let i = 1; i < 4; i++) { if (RV.beatsSince(tb, t) * 4 < i) continue; KIN.font(ctx, 200, 'cond'); ctx.fillStyle = i === 3 ? C.clay : C.ink; ctx.globalAlpha = 0.25 + i * 0.2; ctx.fillText('BACK!', flip ? 1100 : 110, 250 + i * 190); }
        ctx.globalAlpha = 1; } });
  };
  back('c5a', 'closeup', LK.paper, false, T0('c5a') - 0.05, T0('c5b') - 0.05);
  back('c5b', 'face', LK.clay, true, T0('c5b') - 0.05, T1('c5b') + 0.35);

  // ===================================== BRIDGE (no drums)
  S({ t: T1('c5b') + 0.35 }, { t: T0('b2') - 0.05 }, 'line', { tin: { type: 'fade', d: 0.4 }, look: LK.day, cam: cam({ z0: 1.03, z1: 1.1, x0: 0.02, x1: -0.02 }), theme: 'light',
    draw(ctx, t) { const t0 = W('b1', 'sale'), n = Math.max(0, Math.floor(RV.beatsSince(t0, t) * 2));
      if (t > W('b1', 'once')) { G.panel(ctx, 1260, 170, 520, 180, 'SALES BEHIND YOU', { status: 'PAID TO YOU', bg: 'rgba(241,239,233,0.92)', fg: C.ink, line: 'rgba(13,16,19,0.4)', head: 'rgba(13,16,19,0.08)' });
        G.mono(ctx, 40, true); ctx.fillStyle = C.ink; ctx.fillText(`#${String(1 + n).padStart(4, '0')}`, 1290, 270); G.mono(ctx, 15); ctx.fillText(`YOU BOUGHT ONCE · +$${(n * 0.37).toFixed(2)} SO FAR`, 1290, 320); }
      sub(ctx, 'b1', t, { bg: PAPER, color: C.ink, hi: ['once', 'behind'] }); } });
  S({ t: T0('b2') - 0.05 }, { t: W('b2', 'ownership') - 0.05 }, 'sleep', { tin: { type: 'cross', d: 0.4 }, look: LK.paper, cam: cam({ z0: 1.04, z1: 1.1 }), theme: 'light',
    draw(ctx, t) { const k = inv(T0('b2'), W('b2', 'ownership'), t); G.mono(ctx, 60, true); ctx.fillStyle = C.ink; const h = (2 + Math.floor(k * 5)) % 12, mm = Math.floor(k * 59);
      ctx.fillText(`0${h}:${String(mm).padStart(2, '0')}`, 1400, 260); G.mono(ctx, 15); ctx.fillText('WHILE YOU SLEEP · WEALTH: BUILDING', 1400, 295); ctx.fillStyle = C.clay; ctx.fillRect(1400, 310, 360 * k, 6);
      sub(ctx, 'b2', t, { bg: PAPER, color: C.ink, hi: ['sleep'], until: W('b2', 'ownership') }); } });
  S({ t: W('b2', 'ownership') - 0.05 }, { t: T0('b3') - 0.05 }, 'E10', { tin: { type: 'flash', d: 0.16 }, look: LK.paper, cam: cam({ z0: 1.05, z1: 1.1, focus: 0.7 }), theme: 'light',
    draw(ctx, t, m) { G.cv(ctx, m.face(), t, W('b2', 'ownership'), { label: 'OWNER', conf: 1, color: C.ink, tagBg: C.clay }); sub(ctx, 'b2', t, { bg: PAPER, color: C.ink, hi: ['ownership'], x: 1800, align: 'right' }); } });
  S({ t: T0('b3') - 0.05 }, { t: T0('b4') - 0.05 }, 'around', { tin: { type: 'slices', d: 0.2, seed: 13 }, look: LK.warm, cam: cam({ z0: 1.03, z1: 1.12 }),
    draw(ctx, t) { const tj = W('b3', 'join');
      const pts = []; for (let i = 0; i < 12; i++) pts.push(0.05 + Math.pow(i / 11, 2) * 0.9);
      if (t > tj) { G.panel(ctx, 1180, 170, 600, 330, 'PEOPLE × REVENUE', { status: 'GROWING' }); G.line(ctx, t, { x: 1210, y: 230, w: 540, h: 240, data: pts, t0: tj, dur: 1.6, color: C.clay }); }
      sub(ctx, 'b3', t, { bg: INK, hi: ['join', 'grow'] }); } });
  // "That's the road to A G I" — white letters on the green sign, knocked out over her
  const SIGN = [[0.251, 0.0887], [0.701, 0.19], [0.701, 0.3082], [0.251, 0.212]];
  const signPaint = t => (x, col) => {
    x.clearRect(0, 0, 1100, 600); const ta = W('b4', 'agi'), tn = ta + 0.45;
    x.fillStyle = col === C.ink ? '#ffffff' : 'rgba(255,255,255,1)';
    KIN.font(x, 270, 'cond'); if (t > ta) { const a = eout(inv(ta, ta + 0.1, t)); x.globalAlpha = a; KIN.track(x, 'A G I', 70, 290, 30); }
    KIN.font(x, 120, 'cond'); if (t > tn) { x.globalAlpha = eout(inv(tn, tn + 0.1, t)); x.fillText('NEXT EXIT', 70, 480);
      x.lineWidth = 16; x.strokeStyle = x.fillStyle; x.beginPath(); x.moveTo(760, 500); x.lineTo(900, 360); x.stroke(); x.beginPath(); x.moveTo(900, 360); x.lineTo(830, 370); x.lineTo(890, 430); x.closePath(); x.fill(); }
    x.globalAlpha = 1;
  };
  S({ t: T0('b4') - 0.05 }, { t: T1('b4') + 0.12 }, 'E11', { tin: { type: 'whip', d: 0.24, dir: -1 }, look: LK.day, cam: cam({ z0: 1.03, z1: 1.08, focus: 0.65 }), cut: 0.5, theme: 'light',
    back(ctx, t, m) { knockBack(ctx, m, 'sign', SIGN, 0.26, signPaint(t)); },
    draw(ctx, t, m) {
      if (m.mask) { const [c, x] = G.scratch('signW', 1100, 600); signPaint(t)(x, C.white); const S2 = m.mask.width / WW, [k, kx] = G.scratch('knock', m.mask.width, m.mask.height);
        kx.setTransform(S2, 0, 0, S2, 0, 0); G.quad(kx, c, quadOf(m, SIGN, 0.26), 6); kx.setTransform(1, 0, 0, 1, 0, 0); kx.globalCompositeOperation = 'destination-in'; kx.drawImage(m.mask, 0, 0); kx.globalCompositeOperation = 'source-over';
        ctx.save(); ctx.globalAlpha = 0.45; ctx.drawImage(k, 0, 0, WW, HH); ctx.restore(); }
      sub(ctx, 'b4', t, { bg: PAPER, color: C.ink, hi: ['agi'] });
    } });

  // ===================================== FINAL CHORUS
  S({ t: T1('b4') + 0.12 }, { t: T0('f2') - 0.03 }, 'sing2', { tin: { type: 'clayflash', d: 0.26 }, look: LK.warm, cam: cam({ z0: 1.08, z1: 1.2, flip: true, focus: 0.6 }),
    draw(ctx, t) { KIN.coverline(ctx, 'f1', t, { x: 110, y: 880, size: 110, hi: ['revenue', 'shared'] }); } });
  S({ t: T0('f2') - 0.03 }, { t: T0('f3') - 0.03 }, 'walkwarm', { tin: { type: 'rgb', d: 0.2 }, look: LK.warm, cam: cam({ z0: 1.08, z1: 1.2, focus: 0.5 }), cut: 0.4,
    back(ctx, t) { for (let i = 0; i < 160; i++) { const x = 110 + (i % 20) * 90, y = 180 + Math.floor(i / 20) * 82; ctx.fillStyle = hash(i * 1.7) < inv(T0('f2'), T1('f2'), t) ? C.clay : 'rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.arc(x, y, 13, 0, 7); ctx.fill(); ctx.fillRect(x - 16, y + 18, 32, 36); } },
    draw(ctx, t) { KIN.masthead(ctx, 'f2', t, { x: 110, y: 900, size: 190, hi: ['everyone', 'earning', 'deal'] }); } });
  S({ t: T0('f3') - 0.03 }, { t: T0('f4') - 0.03 }, 'sing1', { tin: { type: 'spin', d: 0.3, dir: -1 }, look: LK.warm, cam: cam({ z0: 1.1, z1: 1.22, flip: true, focus: 0.7 }),
    draw(ctx, t) { KIN.masthead(ctx, 'f3', t, { x: 1810, align: 'right', y: 560, size: 250, hi: ['agi'] }); const v = inv(T0('f3'), T1('f3'), t);
      G.gauge(ctx, 360, 780, 170, 0.15 + 0.84 * RV.eio(v), { label: 'VELOCITY', value: (0.3 + 11.2 * RV.eio(v)).toFixed(1) }); } });
  S({ t: T0('f4') - 0.03 }, 69, 'hallwide', { tin: { type: 'strobe', d: 0.26 }, look: LK.hall, cam: cam({ z0: 1.02, z1: 1.18, focus: 0.6 }),
    draw(ctx, t) { G.grid(ctx, t, { step: 60, color: 'rgba(255,255,255,' + (0.05 + 0.12 * inv(T0('f4'), T1('f4'), t)) + ')' }); KIN.masthead(ctx, 'f4', t, { stack: true, x: 110, y: 300, size: 150, lh: 0.9, hi: ['built'] }); } });

  // ===================================== OUTRO (no drums), then the recap and the title
  S(69, { t: T0('o2') - 0.05 }, 'E12blank', { tin: { type: 'fade', d: 0.4 }, look: LK.paper, chrome: { level: 'min' }, theme: 'light',
    cam: merge(cam({ z0: 1.03, z1: 1.08 }), reveal('E12', ['o1'], [0, 0.33, 1, 0.48])),
    draw(ctx, t) { RV.lines.o1.tokens.forEach((tk, i) => { if (t >= tk.t0) KIN.mark('o1', i); }); } });
  S({ t: T0('o2') - 0.05 }, { t: W('o2', 'wheel') - 0.05 }, 'G01', { tin: { type: 'cross', d: 0.4 }, look: LK.night, cam: cam({ z0: 1.12, z1: 1.2, focus: 0.7 }), chrome: { level: 'min' },
    draw(ctx, t) { sub(ctx, 'o2', t, { bg: INK, until: W('o2', 'wheel') - 0.05 }); } });
  S({ t: W('o2', 'wheel') - 0.05 }, 77, 'waymoaway', { tin: { type: 'flash', d: 0.2 }, look: LK.night, cam: cam({ z0: 1.02, z1: 1.14 }), chrome: { level: 'min' },
    draw(ctx, t) { sub(ctx, 'o2', t, { bg: INK, hi: ['wheel', 'turns'] }); } });
  // drums return: recap of every look, two beats each, then the title tag
  const RECAP = ['overpass', 'G04', 'three', 'E5', 'E6', 'E7', 'E9', 'E10', 'sing1', 'whitecu', 'E11', 'hallms'];
  const recTr = ['strobe', 'flash', 'rgb', 'slices', 'flip', 'flash', 'spin', 'strobe', 'rgb', 'flash', 'slices', 'whip'];
  const RECAP_LBL = ['AGI ERA', 'HIGH INCOME', 'SAME TEXT', 'INCOME NOW', 'THE SPLIT', 'PAY FORWARD', 'ESIM', 'OWNER', 'FEEL THE AGI', "WE'RE SO BACK", 'NEXT EXIT', 'LOCK IN'];
  RECAP.forEach((pl, i) => S(77 + i * 0.5, 77 + (i + 1) * 0.5, pl, { tin: { type: recTr[i] === 'flip' ? 'flash' : recTr[i], d: 0.14, seed: i }, look: i % 4 === 3 ? LK.mono : LK.day, cam: cam({ z0: 1.08, z1: 1.16 }),
    draw(ctx, t) { G.flap(ctx, 110, 880, 14, ' '.repeat(14), RECAP_LBL[i].padEnd(14), t, B(77 + i * 0.5), { cw: 34, ch: 50, dur: 0.2, spread: 0.1, hi: () => true }); } }));
  S(83, 85.5, 'E13', { tin: { type: 'flash', d: 0.3 }, look: LK.paper, cam: cam({ z0: 1.04, z1: 1.12 }), chrome: { level: 'min' },
    draw(ctx, t) { if (t > B(83.5)) { G.mono(ctx, 18, true); ctx.fillStyle = C.white; ctx.globalAlpha = eout(inv(B(83.5), B(83.5) + 0.5, t)); ctx.fillText(`${F.brand} · S/S 26 · THE AGI-ERA COLLECTION`, 110, 980); ctx.globalAlpha = 1; } } });
  return shots;
};
