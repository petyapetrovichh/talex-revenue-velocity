// The storyboard as code: 34 shots over 7 chapters, cut on the bar grid.
// Each shot: plate + camera + print look, a back layer (behind her, via the depth cut-out),
// a front layer (lyrics + the graphic that explains the line), a transition in, chrome options.
'use strict';
RV.buildShots = () => {
  const { C, KIN, GFX: G, lerp, inv, eout, clamp, hash } = RV;
  const B = RV.bar, W = RV.W, H = RV.H, F = RV.F;
  const wt = RV.wordT, T0 = RV.lineT0, T1 = RV.lineT1;
  const P = (x, y) => ({ x: x * W, y: y * H });
  // print looks
  const LK = {
    night: { mode: 'ht', ht: 0.42, cell: 6, grade: [1.12, 1.16, 1.3, 0], grain: 0.05, vig: 0.45 },
    hall: { mode: 'ht', ht: 0.5, cell: 7, grade: [1.15, 1.2, 1.35, -0.2], grain: 0.05, vig: 0.4 },
    warm: { mode: 'ht', ht: 0.48, cell: 7, grade: [1.08, 1.14, 1.35, 0.7], grain: 0.045, vig: 0.4 },
    day: { mode: 'ht', ht: 0.34, cell: 5, grade: [1.04, 1.1, 1.2, 0.15], grain: 0.05, vig: 0.2 },
    paper: { mode: 'ht', ht: 0.3, cell: 5, grade: [1.03, 1.06, 1.1, 0.25], grain: 0.045, vig: 0.12 },
    clayDither: { mode: 'dither', ht: 0.92, cell: 4, tint: C.clay, ink: C.ink, grade: [1.1, 1.3, 1, 0], grain: 0.04, vig: 0.1 },
    mono: { mode: 'mono', ht: 0.8, cell: 9, tint: C.paper, ink: C.ink, grade: [1.05, 1.25, 1, 0], grain: 0.05, vig: 0.1 },
    clean: { mode: 'clean', grade: [1.05, 1.1, 1.2, 0], grain: 0.05, vig: 0.3 },
  };
  // camera: push/pan/parallax over the shot, a small zoom bump on every beat
  const cam = (o = {}) => (p, t) => {
    const e = o.ease === 'lin' ? p : RV.eio(p) * 0.35 + p * 0.65;
    const shake = o.shake ? o.shake(t) : 0;
    return {
      zoom: lerp(o.z0 ?? 1.05, o.z1 ?? 1.13, e) + (o.bump ?? 0.012) * RV.pulse(t, 8),
      x: lerp(o.x0 ?? 0, o.x1 ?? 0, e) + shake * (hash(Math.floor(t * 30)) - 0.5) * 0.02,
      y: lerp(o.y0 ?? 0, o.y1 ?? 0, e) + shake * (hash(Math.floor(t * 30) + 7) - 0.5) * 0.02,
      rot: lerp(o.r0 ?? 0, o.r1 ?? 0, e),
      px: lerp(o.px0 ?? -0.025, o.px1 ?? 0.025, e), py: o.py ?? 0, focus: o.focus ?? 0.55, flip: o.flip,
    };
  };
  const quadOf = (m, q, d = 0.5) => q.map(([u, v]) => m.pt(u, v, d));
  // a paper card that carries a lyric line (subtitle mode on a slab)
  const sub = (ctx, id, t, o = {}) => KIN.subtitle(ctx, id, t, Object.assign({ x: 960, y: 952, size: 44, align: 'center', hold: 0.5 }, o));
  const lookCard = (ctx, t, n, name, rows, t0, o = {}) => G.tag(ctx, t, Object.assign({ x: 1520, y: 190, w: 330, h: 300, title: `LOOK 0${n}`, sub: name, rows, t0, code: 'LOOK' + n, stamp: 'MODEL: THE LEAD' }, o));
  const shots = [];
  const S = (b0, b1, plate, o) => shots.push(Object.assign({ t0: B(b0), t1: B(b1), plate }, o));

  // ============================ 1. INTRO — the data hall =================================
  S(0, 1, 'ext', {
    look: LK.night, cam: cam({ z0: 1.02, z1: 1.1, px0: -0.03, px1: 0.03 }), chrome: { level: 'min' },
    draw(ctx, t) {
      const L = ['TLXJ // SHOW 001', 'VENUE: DATA HALL 07', 'GUESTS: HUMANS + AGENTS', 'STATUS: DOORS OPEN'];
      G.mono(ctx, 22, true); ctx.fillStyle = C.white;
      L.forEach((s, i) => { const t0 = 0.25 + i * 0.32; if (t < t0) return; const n = Math.floor((t - t0) * 60); ctx.fillText(s.slice(0, n) + (n < s.length && Math.floor(t * 8) % 2 ? '▌' : ''), 120, 640 + i * 34); });
      ctx.fillStyle = C.clay; ctx.fillRect(120, 610, 180 * eout(inv(0.2, 1.2, t)), 4);
    },
  });
  S(1, 3, 'front', {
    look: LK.hall, cam: cam({ z0: 1.08, z1: 1.16, px0: 0.02, px1: -0.02 }), chrome: { level: 'min' },
    draw(ctx, t) {
      // every seat is an agent: CV boxes pop in over the audience on "Agents."
      const ta = wt('i1', 'agents');
      for (let i = 0; i < 26; i++) {
        const x = 0.04 + hash(i * 3.3) * 0.9, y = 0.52 + hash(i * 7.7) * 0.36, s = 0.03 + (y - 0.5) * 0.12;
        if (Math.abs(x - 0.5) < 0.09) continue;
        G.cv(ctx, [x, y, s, s * 1.3], t, ta + (i % 8) * 0.045, { label: i % 4 ? null : 'AGENT', conf: 0.9 + hash(i) * 0.09, lw: 1.5, fs: 12, seed: i });
      }
      KIN.masthead(ctx, 'i1', t, { align: 'center', x: 960, y: 520, size: 250, hi: ['agents'], scaleIn: true, until: B(3) });
      if (t > ta) { ctx.fillStyle = C.clay; ctx.fillRect(960 - 330 * eout(inv(ta, ta + 0.3, t)), 548, 660 * eout(inv(ta, ta + 0.3, t)), 6); }
    },
  });
  S(3, 4.5, 'screen', {
    look: LK.hall, cam: cam({ z0: 1.04, z1: 1.1, px0: -0.02, px1: 0.02, focus: 0.7 }), cut: 0.45, chrome: { level: 'min' },
    back(ctx, t, m) {
      // the screen behind her shows a pitch deck that gets rejected word by word
      const [c, x] = G.scratch('deck', 800, 450);
      const tn = wt('i2', 'not'), td = wt('i2', 'deck');
      x.fillStyle = C.paper; x.fillRect(0, 0, 800, 450);
      x.fillStyle = C.ink; KIN.font(x, 64, 'cond'); x.fillText('SERIES A', 48, 110); G.mono(x, 20); x.fillText('TAM: EVERYTHING · SLIDE 01 / 47', 48, 150);
      G.bars(x, t, { x: 48, y: 200, w: 420, h: 190, data: [0.1, 0.15, 0.2, 0.3, 0.45, 0.7, 1], t0: B(3), color: C.ink, axis: C.ink, perBeat: 3 });
      G.mono(x, 18); x.fillText('HOCKEY STICK (PROJECTED)', 500, 380);
      if (t > tn) { x.strokeStyle = C.red; x.lineWidth = 16; const k = eout(inv(tn, tn + 0.2, t)); x.beginPath(); x.moveTo(30, 30); x.lineTo(30 + 740 * k, 30 + 390 * k); x.moveTo(770, 30); x.lineTo(770 - 740 * k, 30 + 390 * k); x.stroke(); }
      if (t > td) { x.fillStyle = C.ink; x.fillRect(0, 0, 800, 450 * eout(inv(td, td + 0.25, t))); x.fillStyle = C.clay; KIN.font(x, 120, 'cond'); if (t > td + 0.2) x.fillText('NOT A DECK.', 60, 270); }
      G.quad(ctx, c, quadOf(m, [[0.325, 0.1], [0.67, 0.1], [0.67, 0.43], [0.325, 0.43]], 0.3));
    },
    draw(ctx, t, m) {
      KIN.coverline(ctx, 'i2', t, { x: 110, y: 820, size: 96, hi: ['not'], until: B(4.5) });
      G.cv(ctx, m.face(), t, T0('i2'), { label: 'LEAD', conf: 0.99, sub: ['ID TLXJ-01', 'ROLE: HOST'] });
    },
  });
  S(4.5, 6, 'face', {
    look: LK.hall, cam: cam({ z0: 1.1, z1: 1.2, px0: 0.02, px1: -0.02, focus: 0.8 }), chrome: { level: 'min' },
    draw(ctx, t, m) {
      KIN.masthead(ctx, 'i3', t, { stack: true, x: 1180, y: 360, size: 170, hi: ['profit'], until: B(6) });
      G.cv(ctx, m.face(), t, B(4.5) + 0.05, { label: 'SUBJECT: LEAD', conf: 0.99, sub: ['INTENT: ' + (t > wt('i3', 'profit') ? 'PROFIT' : '…'), 'SMILE: 0.02'] });
    },
  });
  S(6, 9, 'hallms', {
    tin: { type: 'flash', d: 0.3 }, look: LK.hall, cam: cam({ z0: 1.04, z1: 1.2, y0: 0.02, y1: -0.02, px0: -0.03, px1: 0.03, focus: 0.6 }), cut: 0.56,
    back(ctx, t) {
      // the title sits behind her, like a masthead behind a cover model
      KIN.font(ctx, 330, 'cond'); ctx.fillStyle = C.white;
      const a = eout(inv(B(6), B(6) + 0.25, t)), b = eout(inv(B(7), B(7) + 0.25, t));
      ctx.globalAlpha = a; KIN.track(ctx, 'REVENUE', 960 - KIN.width(ctx, 'REVENUE', 10) / 2, 400 - (1 - a) * 60, 10);
      ctx.globalAlpha = b; ctx.fillStyle = C.clay; KIN.track(ctx, 'VELOCITY', 960 - KIN.width(ctx, 'VELOCITY', 10) / 2, 700 + (1 - b) * 60, 10); ctx.globalAlpha = 1;
    },
    draw(ctx, t, m) {
      G.cv(ctx, G.body(m.face()), t, B(8), { label: 'LOOK 00 · OPENING', lw: 1.5 });
      if (t > B(8)) G.flap(ctx, 120, 880, 18, '                  ', 'AGI-ERA COLLECTION', t, B(8), { cw: 30, ch: 44 });
    },
  });

  // ============================ 2. LOOKS 1–2 — the idea =================================
  S(9, 11.25, 'walk', {
    look: LK.hall, cam: cam({ z0: 1.06, z1: 1.18, px0: 0.03, px1: -0.03, focus: 0.6 }), lookN: 1, lookName: 'AGI ERA',
    draw(ctx, t, m) {
      lookCard(ctx, t, 1, 'AGI ERA', [['FABRIC', 'COMPUTE'], ['CUT', 'POST-LABOUR'], ['INCOME', 'UHI']], wt('v1', 'one'));
      KIN.coverline(ctx, 'v1', t, { x: 110, y: 300, size: 120, sizes: { look: 60, one: 60, everyone: 60, "everyone's": 60, talking: 60 }, maxW: 760, lh: 1.05, hi: ['agi', 'uhi'], until: B(11.25) });
      const tu = wt('v1', 'uhi');
      if (t > tu) {
        const k = eout(inv(tu, tu + 0.25, t)); ctx.globalAlpha = k;
        G.panel(ctx, 110, 560, 560, 150, 'DEFINITION', { status: 'n.' });
        KIN.font(ctx, 46, 'cond'); ctx.fillStyle = C.white; ctx.fillText('U·H·I  —  UNIVERSAL HIGH INCOME', 130, 630);
        G.mono(ctx, 16); ctx.fillStyle = C.steel; ctx.fillText('income that keeps arriving after the job doesn\'t.', 130, 670); ctx.globalAlpha = 1;
        G.label(ctx, 'EVERYONE\'S TALKING', 690, 600, { to: { x: 790, y: 520 }, fs: 13 });
      }
      G.cv(ctx, m.face(), t, T0('v1'), { label: 'LEAD', conf: 0.98 });
    },
  });
  S(11.25, 12.5, 'bb2', {
    look: LK.day, cam: cam({ z0: 1.03, z1: 1.09, x0: -0.01, x1: 0.02, px0: -0.03, px1: 0.03 }), lookN: 1, lookName: 'AGI ERA',
    back(ctx, t, m) {
      const [c, x] = G.scratch('bb2', 1100, 520);
      x.fillStyle = C.paper; x.fillRect(0, 0, 1100, 520);
      G.mono(x, 26, true); x.fillStyle = C.ink; x.fillText('AS SEEN ON YOUR TIMELINE', 60, 80);
      KIN.coverline(x, 'v2', t, { x: 60, y: 210, size: 120, maxW: 980, lh: 1.0, upper: true, color: C.ink, hi: ['paid'], until: B(12.5) + 0.5 });
      G.quad(ctx, c, quadOf(m, [[0.22, 0.345], [0.785, 0.02], [0.785, 0.345], [0.22, 0.6]], 0.5), 8);
    },
    draw(ctx, t) { sub(ctx, 'v2', t, { bg: 'rgba(13,16,19,0.72)', color: C.white, until: B(12.5) + 0.5 }); },
  });
  S(12.5, 14, 'bb4', {
    tin: { type: 'whip', d: 0.28, dir: -1 }, look: LK.mono, cam: cam({ z0: 1.04, z1: 1.12, px0: 0.03, px1: -0.03 }), lookN: 1, lookName: 'AGI ERA',
    back(ctx, t, m) {
      const [c, x] = G.scratch('bb4', 900, 520);
      x.fillStyle = C.white; x.fillRect(0, 0, 900, 520);
      // payslip: hours worked 0, still paid
      x.fillStyle = C.ink; KIN.font(x, 70, 'cond'); x.fillText('PAYSLIP · UHI', 50, 100);
      G.mono(x, 28);
      [['HOURS WORKED', '0.0'], ['ASSETS OWNED', '0'], ['PAID', 'YES']].forEach(([a, b], i) => { if (t < B(12.5) + 0.2 + i * 0.25) return; x.fillText(a, 50, 190 + i * 70); x.fillText(b, 700, 190 + i * 70); x.fillRect(50, 205 + i * 70, 800, 2); });
      if (t > wt('v2', 'paid')) { x.fillStyle = C.clay; KIN.font(x, 120, 'cond'); x.fillText('STILL GET PAID.', 50, 470); }
      G.quad(ctx, c, quadOf(m, [[0.475, 0.09], [0.805, 0.325], [0.835, 0.635], [0.49, 0.465]], 0.5), 8);
    },
    draw(ctx, t) { sub(ctx, 'v2', t, { bg: 'rgba(13,16,19,0.72)', color: C.white, until: B(13.5) }); },
  });
  S(14, 16, 'signs', {
    tin: { type: 'flash', d: 0.2 }, look: LK.day, cam: cam({ z0: 1.03, z1: 1.1, y0: 0.01, y1: -0.01, px0: -0.03, px1: 0.03, focus: 0.7 }), cut: 0.62,
    lookN: 2, lookName: 'REVENUE SHARING', theme: 'light',
    back(ctx, t, m) {
      // overhead gantry signs become the choice: subscription (exit) vs revenue sharing (thru)
      const sign = (name, q, a, b, tf) => { const [c, x] = G.scratch(name, 520, 300); x.fillStyle = '#1a3a2a'; x.fillRect(0, 0, 520, 300); G.flap(x, 20, 40, 10, a, b, t, tf, { cw: 44, ch: 60, gap: 5, bg: '#10261b', hi: (i, ch) => /✕|↑/.test(ch) }); G.quad(ctx, c, quadOf(m, q, 0.4), 5); };
      sign('s1', [[0.0, 0.01], [0.2, 0.01], [0.2, 0.24], [0.0, 0.24]], 'EXIT 26   SLOWER    TRAFFIC ', 'SUBSCRIP- TION      TRAP ✕     ', wt('v3', 'subscription'));
      sign('s2', [[0.3, 0.0], [0.73, 0.0], [0.73, 0.26], [0.3, 0.26]], 'LANE 1    ALL       TRAFFIC   ', 'REVENUE   SHARING   ↑ THRU    ', wt('v3', 'revenue'));
    },
    draw(ctx, t, m) {
      lookCard(ctx, t, 2, 'REVENUE SHARING', [['MODEL', 'SHARE'], ['NOT', 'SUBSCRIPTION'], ['FIT', 'EVERYONE']], wt('v3', 'two'), { y: 330 });
      sub(ctx, 'v3', t, { bg: 'rgba(241,239,233,0.9)', color: C.ink, hi: ['revenue', 'sharing', 'trap'], until: B(16) + 0.2 });
    },
  });
  S(16, 19, 'receipt', {
    tin: { type: 'flapwipe', d: 0.45 }, look: LK.night, cam: cam({ z0: 1.06, z1: 1.14, px0: 0.02, px1: -0.02, focus: 0.6 }), lookN: 2, lookName: 'REVENUE SHARING',
    draw(ctx, t, m) {
      // one purchase, split three ways, streamed back as tokenized cashflow
      const tp = wt('v4', 'purchase'), ts = wt('v4', 'splits'), tc = wt('v4', 'cashflow'), tt = wt('v4', 'tokenized');
      const o = F.order, rx = 110, ry = 200;
      if (t > tp) {
        const k = eout(inv(tp, tp + 0.3, t)); ctx.fillStyle = C.paper; ctx.fillRect(rx, ry, 360, 300 * k);
        ctx.save(); ctx.beginPath(); ctx.rect(rx, ry, 360, 300 * k); ctx.clip(); ctx.fillStyle = C.ink; G.mono(ctx, 17, true);
        ['RECEIPT ' + o.id, '— — — — — — — — — —', o.item, '', 'TOTAL           ' + o.price, '', 'REVENUE SHARE:   ON'].forEach((s, i) => ctx.fillText(s, rx + 20, ry + 40 + i * 32));
        ctx.restore();
      }
      const src = { x: rx + 360, y: ry + 150 };
      F.split.forEach(([name, pct], i) => {
        const dst = { x: 600, y: 200 + i * 130 }, k = eout(inv(ts + i * 0.08, ts + 0.35 + i * 0.08, t));
        G.arrow(ctx, src, dst, k, { color: i === 1 ? C.clay : C.white, lw: 2 });
        if (k >= 1) {
          G.panel(ctx, dst.x + 10, dst.y - 36, 260, 72, name, { status: pct });
          G.mono(ctx, 13); ctx.fillStyle = C.steel; ctx.fillText(i === 1 ? 'BOUGHT BACK ON-CHAIN' : i === 0 ? 'PAID TO EVERY HOLDER' : 'RUNS THE COMPANY', dst.x + 22, dst.y + 22);
          // cashflow: dots streaming along the arrow after "cashflow"
          if (t > tc) for (let j = 0; j < 5; j++) { const f = ((t - tc) * 1.6 + j / 5 + i * 0.1) % 1; ctx.fillStyle = C.clay; ctx.beginPath(); ctx.arc(lerp(src.x, dst.x, f), lerp(src.y, dst.y, f), 5, 0, 7); ctx.fill(); }
        }
      });
      if (t > tt) {
        const k = RV.back(inv(tt, tt + 0.3, t)); ctx.save(); ctx.translate(360, 720); ctx.scale(k * 0.8, k * 0.8);
        ctx.strokeStyle = C.clay; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, 110, 0, 7); ctx.stroke(); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 90, 0, 7); ctx.stroke();
        KIN.font(ctx, 44, 'cond'); ctx.fillStyle = C.white; const s = 'TOKENIZED'; ctx.fillText(s, -ctx.measureText(s).width / 2, 14);
        G.mono(ctx, 13); const a = '0x7a3f…c91e'; ctx.fillText(a, -ctx.measureText(a).width / 2, 44); ctx.restore();
      }
      sub(ctx, 'v4', t, { hi: ['splits', 'tokenized'], until: B(19) });
    },
  });

  // ============================ 3. LOOK 3 — the models =================================
  S(19, 20.75, 'headset', {
    tin: { type: 'slices', d: 0.3 }, look: LK.night, cam: cam({ z0: 1.08, z1: 1.16, px0: -0.02, px1: 0.02, focus: 0.7 }), lookN: 3, lookName: 'THE MODELS AGREE',
    draw(ctx, t, m) {
      lookCard(ctx, t, 3, 'THE MODELS AGREE', [['ASKED', F.asked], ['MODELS', '3'], ['ANSWERS', '1']], wt('v5', 'three'));
      const tm = wt('v5', 'months'), tq = wt('v5', 'asked');
      if (t > tm) { G.mono(ctx, 14, true); ctx.fillStyle = C.white; ctx.fillText('DATE', 1100, 640); G.flap(ctx, 1100, 652, 7, '2026-09', F.asked, t, tm, { cw: 40, ch: 58, hi: (i, c) => i > 4 }); }
      if (t > tq) G.chat(ctx, t, { x: 110, y: 640, w: 700, h: 150, name: 'PROMPT · SENT TO 3 MODELS', prompt: 'after AGI, how should value reach people?', p0: tq, pd: 0.7, a0: 1e9, answer: '' });
      sub(ctx, 'v5', t, { hi: ['models'], until: B(20.75) });
      G.cv(ctx, m.face(), t, T0('v5'), { label: 'LEAD · LISTENING', conf: 0.97 });
    },
  });
  // three of her = three models; identical answers
  const threeX = () => (RV.FACES.three || []).slice().sort((a, b) => a[0] - b[0]);
  S(20.75, 22.5, 'three', {
    look: LK.hall, cam: cam({ z0: 1.04, z1: 1.08, px0: 0.02, px1: -0.02, bump: 0.006 }), lookN: 3, lookName: 'THE MODELS AGREE',
    draw(ctx, t, m) {
      const names = ['ChatGPT', 'Gemini', 'Claude'], fx = threeX();
      const ts = wt('v6', 'same');
      fx.forEach((f, i) => {
        const b = m.box(f), tn = wt('v6', names[i].toLowerCase());
        G.cv(ctx, b, t, tn, { label: names[i].toUpperCase(), conf: 0.99, tagBg: i === 2 ? C.clay : C.paper });
        const x = clamp(b[0] * W - 60, 60, W - 420);
        G.chat(ctx, t, { x, y: 640, w: 360, h: 170, name: names[i], status: 'answer', prompt: 'value after AGI?', p0: tn, pd: 0.3, a0: ts, ad: 0.25, answer: 'REVENUE SHARING.', as: 40, check: 'match', accent: i === 2 ? C.clay : C.steel });
      });
      KIN.coverline(ctx, 'v6', t, { x: 110, y: 170, size: 64, hi: ['same'], until: B(22.5) });
    },
  });
  S(22.5, 24, 'two', {
    tin: { type: 'zoom', d: 0.36, box: [0.68, 0.1, 0.16, 0.34] }, look: LK.clean, cam: cam({ z0: 1.05, z1: 1.12, px0: -0.02, px1: 0.02 }), lookN: 3, lookName: 'THE MODELS AGREE',
    draw(ctx, t, m) {
      const f = (RV.FACES.two || []).slice().sort((a, b) => a[0] - b[0]);
      f.forEach((b, i) => G.cv(ctx, m.box(b), t, B(22.5) + i * 0.08, { label: i ? 'PLAN B' : 'PLAN A', conf: 1 }));
      const tp = wt('v6', 'plan', 4);
      if (t > B(22.5) + 0.2) {
        G.panel(ctx, 700, 760, 520, 120, 'diff plan_a.md plan_b.md', { status: t > tp ? '0 CHANGES' : '…' });
        G.mono(ctx, 17); ctx.fillStyle = C.white; ['  share revenue with users', '  buy back on-chain, daily', '  ship it'].forEach((s, i) => ctx.fillText('=' + s, 720, 815 + i * 22));
      }
      G.stamp(ctx, 'SAME PLAN', 960, 300, t, tp, { size: 120, rot: -0.08 });
      sub(ctx, 'v6', t, { y: 1000, size: 38, until: B(24) });
    },
  });

  // ============================ 4. LOOK 4 — shipped ====================================
  S(24, 25.5, 'stamp', {
    tin: { type: 'flash', d: 0.2 }, look: LK.warm, lookN: 4, lookName: 'SHIPPED',
    cam: cam({ z0: 1.06, z1: 1.12, px0: 0.02, px1: -0.02, focus: 0.6, shake: t => 3 * Math.exp(-Math.max(0, t - wt('v7', 'shipped')) * 8) * (t > wt('v7', 'shipped') ? 1 : 0) }),
    draw(ctx, t, m) {
      lookCard(ctx, t, 4, 'SHIPPED', [['TALK', '—'], ['CODE', 'MERGED'], ['STATUS', 'LIVE']], wt('v7', 'four'), { x: 110, y: 190 });
      const tk = wt('v7', 'talk');
      if (t > tk) { KIN.font(ctx, 60, 'cond'); ctx.fillStyle = C.grey; ctx.fillText('“BLAH BLAH ROADMAP”', 1180, 330); ctx.strokeStyle = C.clay; ctx.lineWidth = 6; const k = eout(inv(tk, tk + 0.2, t)); ctx.beginPath(); ctx.moveTo(1170, 312); ctx.lineTo(1170 + 560 * k, 312); ctx.stroke(); }
      G.stamp(ctx, 'SHIPPED', 1450, 560, t, wt('v7', 'shipped'), { size: 170 });
      sub(ctx, 'v7', t, { hi: ['shipped'], until: B(25.5) });
    },
  });
  S(25.5, 29, 'monitor', {
    look: LK.day, cam: cam({ z0: 1.05, z1: 1.12, px0: -0.02, px1: 0.02, focus: 0.6 }), lookN: 4, lookName: 'SHIPPED', theme: 'light',
    draw(ctx, t, m) {
      // live dashboard: orders stream in, daily buyback bars
      const tl = wt('v8', 'live'), tb = wt('v8', 'buybacks');
      if (t > B(25.5) + 0.1) {
        G.panel(ctx, 1180, 170, 600, 330, `${F.product} · SALES`, { status: (Math.floor(t * 2) % 2 ? '● ' : '○ ') + 'LIVE' });
        G.mono(ctx, 15);
        const n = Math.floor(RV.beatsSince(tl, t) * 2);
        for (let i = 0; i < 9; i++) { const k = n - i; if (k < 0 || t < tl) continue; ctx.fillStyle = i === 0 ? C.clay : C.white; ctx.globalAlpha = 1 - i * 0.09; ctx.fillText(`ORDER #${48213 + k}   eSIM ${[1, 3, 5, 10, 20][Math.floor(hash(k) * 5)]} GB   $${(4 + hash(k + 3) * 30).toFixed(2)}`, 1200, 230 + i * 28); }
        ctx.globalAlpha = 1;
      }
      if (t > tb) {
        G.panel(ctx, 1180, 530, 600, 300, 'ON-CHAIN BUYBACKS · DAILY', { status: 'VERIFIED' });
        G.bars(ctx, t, { x: 1210, y: 590, w: 540, h: 200, data: F.buyback, t0: tb, perBeat: 3 });
      }
      sub(ctx, 'v8', t, { x: 110, y: 930, align: 'left', bg: 'rgba(241,239,233,0.9)', color: C.ink, hi: ['live', 'daily'], until: B(28.6) });
    },
  });

  // ============================ 5. PRE-CHORUS — lock in =================================
  S(29, 31, 'eye', {
    tin: { type: 'crt', d: 0.5 }, look: LK.clean, cam: cam({ z0: 1.1, z1: 1.2, px0: 0.01, px1: -0.01, bump: 0.004 }), chrome: { level: 'min' },
    draw(ctx, t) {
      const cx = 1090, cy = 560, k = eout(inv(B(29), B(29) + 0.6, t));
      ctx.save(); ctx.strokeStyle = C.white; ctx.globalAlpha = 0.8; ctx.lineWidth = 1.5; ctx.setLineDash([6, 8]); ctx.lineDashOffset = -t * 40;
      ctx.beginPath(); ctx.arc(cx, cy, 230 * k, 0, 7); ctx.stroke(); ctx.setLineDash([]); ctx.beginPath(); ctx.arc(cx, cy, 150 * k, -t, -t + 4); ctx.stroke(); ctx.restore();
      G.mono(ctx, 15, true); ctx.fillStyle = C.white;
      const tp = wt('p1', 'promise'), tr = wt('p1', 'running');
      ctx.fillText(t < tp ? 'SCANNING…' : t < tr ? 'CLAIM: PROMISE → NOT FOUND' : 'PROCESS: RUNNING', cx + 250, cy - 140);
      if (t > tr) { const s = `● RUNNING · UPTIME ${F.uptimeDays} DAYS`; G.mono(ctx, 22, true); const w = ctx.measureText(s).width; ctx.fillStyle = C.clay; ctx.fillRect(cx + 250, cy - 110, w + 30, 44); ctx.fillStyle = C.ink; ctx.fillText(s, cx + 265, cy - 80); }
      sub(ctx, 'p1', t, { size: 52, hi: ['running'], until: B(31) });
    },
  });
  S(31, 33, 'streak', {
    look: LK.warm, cam: cam({ z0: 1.06, z1: 1.2, px0: -0.03, px1: 0.03, focus: 0.7, bump: 0.02 }),
    draw(ctx, t, m) {
      // a padlock whose shackle closes on "in."
      const tl = wt('p2', 'lock'), ti = wt('p2', 'in');
      const x = 170, y = 380, k = eout(inv(ti, ti + 0.12, t));
      if (t > B(31) + 0.2) {
        ctx.save(); ctx.strokeStyle = C.white; ctx.fillStyle = C.white; ctx.lineWidth = 14; ctx.globalAlpha = eout(inv(B(31) + 0.2, B(31) + 0.8, t));
        ctx.beginPath(); ctx.arc(x + 110, y + 40 * (1 - k) - 40 + 40, 80, Math.PI, 0); ctx.stroke();
        ctx.fillStyle = t > ti ? C.clay : C.white; ctx.fillRect(x, y + 40, 220, 170); ctx.restore();
      }
      KIN.masthead(ctx, 'p2', t, { stack: true, x: 440, y: 470, size: 220, lh: 0.85, hi: ['in'], until: B(33) });
      G.cv(ctx, m.face(), t, tl, { label: 'LOCKED IN', conf: 1, color: C.clay });
    },
  });
  S(33, 35, 'twirl', {
    tin: { type: 'flash', d: 0.25 }, look: LK.hall, cam: cam({ z0: 1.04, z1: 1.14, r0: -0.02, r1: 0.02, px0: -0.03, px1: 0.03, focus: 0.6 }),
    draw(ctx, t, m) {
      // bar 34 is the break: count the chorus in, one flap per beat
      for (let i = 3; i >= 0; i--) {
        const tb = RV.bar(34 + i / 4); if (t < tb) continue;
        const s = ['3', '2', '1', 'GO'][i];
        G.flap(ctx, 960 - (s.length * 92) / 2, 400, s.length, ' '.repeat(s.length), s, t, tb, { cw: 88, ch: 130, dur: 0.12, spread: 0.02, hi: () => i === 3 });
        break;
      }
      const deg = Math.floor(RV.clamp((t - B(33)) / (B(35) - B(33))) * 360);
      G.mono(ctx, 40); ctx.fillStyle = C.white; ctx.fillText(deg + '°', 110, 880);
      G.cv(ctx, G.body(m.face()), t, B(33) + 0.1, { label: 'SPIN', lw: 1.5 });
    },
  });

  // ============================ 6. CHORUS — feel it ====================================
  S(35, 37, 'sing1', {
    tin: { type: 'clayflash', d: 0.3 }, look: LK.warm, cam: cam({ z0: 1.08, z1: 1.18, px0: 0.03, px1: -0.03, focus: 0.7, bump: 0.025 }),
    draw(ctx, t) {
      KIN.masthead(ctx, 'c1', t, { x: 110, y: 560, size: 260, hi: ['agi'], until: B(37) });
      const v = RV.clamp((t - B(35)) / (B(37) - B(35)));
      G.gauge(ctx, 1560, 780, 170, 0.15 + 0.8 * RV.eio(v), { label: 'VELOCITY', value: (0.3 + 11 * RV.eio(v)).toFixed(1) });
      sub(ctx, 'c1', t, { x: 110, y: 700, align: 'left', size: 34, underline: false, until: B(37) });
    },
  });
  S(37, 39, 'walkwarm', {
    look: LK.warm, cam: cam({ z0: 1.05, z1: 1.2, px0: -0.03, px1: 0.03, focus: 0.5, bump: 0.02 }), cut: 0.4,
    back(ctx, t, m) {
      // revenue for everyone: a grid of people fills in clay, beat by beat, behind her
      const te = wt('c2', 'everyone'), n = Math.floor(RV.beatsSince(te, t) * 16);
      for (let i = 0; i < 160; i++) {
        const x = 110 + (i % 20) * 90, y = 180 + Math.floor(i / 20) * 82;
        ctx.globalAlpha = 0.95; ctx.fillStyle = t > te && hash(i * 1.7) * 160 < n ? C.clay : 'rgba(255,255,255,0.32)';
        ctx.beginPath(); ctx.arc(x, y, 13, 0, 7); ctx.fill(); ctx.fillRect(x - 16, y + 18, 32, 36);
      }
      ctx.globalAlpha = 1;
    },
    draw(ctx, t) {
      KIN.coverline(ctx, 'c2', t, { x: 110, y: 850, size: 110, hi: ['everyone'], until: B(39) });
      G.mono(ctx, 14, true); ctx.fillStyle = C.white; if (t > wt('c2', 'everyone')) ctx.fillText(`SHAREHOLDERS: EVERYONE · ${RV.fmt(Math.floor(RV.beatsSince(wt('c2', 'everyone'), t) * 24 * 419))} PAID`, 110, 150);
    },
  });
  S(39, 41, 'crowd', {
    tin: { type: 'slices', d: 0.26, seed: 3 }, look: LK.warm, cam: cam({ z0: 1.03, z1: 1.1, px0: 0.03, px1: -0.03, focus: 0.4 }),
    draw(ctx, t) {
      // predicted (dashed, grey) vs real (solid, clay)
      const tp = wt('c3', 'predicted'), tr = wt('c3', 'real');
      const x = 980, y = 200, w = 800, h = 380;
      if (t > tp) {
        G.panel(ctx, x - 20, y - 60, w + 40, h + 110, 'FORECAST vs ACTUAL', { status: t > tr ? 'ACTUAL > FORECAST' : 'FORECAST' });
        ctx.save(); ctx.setLineDash([10, 10]); G.line(ctx, t, { x, y, w, h, data: [0.05, 0.1, 0.16, 0.22, 0.3, 0.36, 0.44, 0.5], t0: tp, dur: 0.8, color: C.grey, grid: true, lw: 3 }); ctx.restore();
        G.mono(ctx, 14); ctx.fillStyle = C.grey; ctx.fillText('THEY PREDICTED', x + w - 150, y + h * 0.45);
      }
      if (t > wt('c3', 'made')) { const e = G.line(ctx, t, { x, y, w, h, data: [0.05, 0.12, 0.2, 0.33, 0.46, 0.62, 0.8, 0.98], t0: wt('c3', 'made'), dur: 0.9, color: C.clay, grid: false, lw: 5 }); if (t > tr) G.label(ctx, 'WE MADE IT REAL', e.x - 250, e.y - 20, { color: C.clay, bold: true }); }
      KIN.masthead(ctx, 'c3', t, { x: 110, y: 900, size: 190, hi: ['real'], until: B(41) });
    },
  });
  S(41, 43, 'sing2', {
    tin: { type: 'whip', d: 0.26, dir: 1 }, look: LK.day, cam: cam({ z0: 1.06, z1: 1.16, r0: 0.02, r1: -0.02, px0: -0.03, px1: 0.03, focus: 0.6, bump: 0.02 }),
    draw(ctx, t) {
      const td = wt('c4', 'deal');
      G.tag(ctx, t, { x: 1300, y: 170, w: 460, h: 420, title: 'THE DEAL', sub: 'TERMS · NON-NEGOTIABLE', t0: B(41) + 0.1, rows: [['01', 'SHARE THE REVENUE'], ['02', 'BUY BACK DAILY'], ['03', 'BURN FOR REAL'], ['04', 'NO WAITING LIST']], rowGap: 0.18, code: 'DEAL' });
      if (t > td) { ctx.save(); ctx.strokeStyle = C.clay; ctx.lineWidth = 4; ctx.beginPath(); const k = eout(inv(td, td + 0.35, t)); for (let i = 0; i <= 60 * k; i++) { const x = 1330 + i * 6, y = 520 + Math.sin(i * 0.5) * 16 * Math.sin(i * 0.11); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); ctx.restore(); }
      KIN.masthead(ctx, 'c4', t, { x: 110, y: 880, size: 200, hi: ['deal', 'lock'], until: B(43) });
    },
  });
  S(43, 44.5, 'freeway', {
    tin: { type: 'flash', d: 0.2 }, look: LK.day, cam: cam({ z0: 1.04, z1: 1.2, px0: 0.04, px1: -0.04, focus: 0.6, bump: 0.03 }), theme: 'light',
    draw(ctx, t) {
      // instrumental bar: payouts burst across the frame on each eighth
      const n = Math.floor(RV.beatsSince(B(43), t) * 2);
      for (let i = 0; i <= n && i < 12; i++) {
        const x = 120 + hash(i * 9.1) * 1500, y = 170 + hash(i * 4.3) * 700, s = `+$${RV.fmt(Math.floor(500 + hash(i) * 14000))}`;
        KIN.font(ctx, 40 + hash(i + 2) * 50, 'cond'); ctx.fillStyle = i === n ? C.clay : C.ink; ctx.globalAlpha = 1 - (n - i) * 0.07; ctx.fillText(s, x, y);
      }
      ctx.globalAlpha = 1;
      G.flap(ctx, 520, 940, 22, 'REVENUE  →  SOMEONE  ', 'REVENUE  →  EVERYONE  ', t, B(43.5), { cw: 36, ch: 54 });
    },
  });
  S(44.5, 46.5, 'closeup', {
    look: LK.paper, cam: cam({ z0: 1.06, z1: 1.14, px0: -0.02, px1: 0.02, focus: 0.7 }), theme: 'light',
    draw(ctx, t, m) {
      // the doom chart everyone screenshots, drifting down
      const x = 1180, y = 250, w = 600, h = 320;
      G.panel(ctx, x - 20, y - 60, w + 40, h + 100, 'VIBES INDEX', { status: 'IT\'S SO OVER?', bg: 'rgba(241,239,233,0.92)', fg: C.ink, line: 'rgba(13,16,19,0.4)', head: 'rgba(13,16,19,0.08)' });
      G.line(ctx, t, { x, y, w, h, data: [0.8, 0.72, 0.75, 0.6, 0.55, 0.42, 0.38, 0.25, 0.2, 0.12], t0: B(44.5), dur: 1.8, color: C.grey, grid: false });
      KIN.subtitle(ctx, 'c5a', t, { x: 110, y: 900, size: 64, fam: 'mono', wt: '', color: C.ink, align: 'left', underline: false, until: B(46.5) });
      G.cv(ctx, m.face(), t, B(44.5) + 0.2, { label: 'MOOD: OVER?', conf: 0.51, color: C.ink, tagBg: C.ink, tagFg: C.paper });
    },
  });
  S(46.5, 48.5, 'whitecu', {
    tin: { type: 'slices', d: 0.22, seed: 7 }, look: LK.mono, cam: cam({ z0: 1.1, z1: 1.22, px0: 0.02, px1: -0.02, bump: 0.04 }), theme: 'light',
    draw(ctx, t) {
      KIN.masthead(ctx, 'c5a', t, { stack: true, stackFrom: 3, x: 110, y: 330, size: 270, lh: 0.84, color: C.ink, hi: ['back'], until: B(48.5) });
      G.line(ctx, t, { x: 1180, y: 250, w: 600, h: 320, data: [0.12, 0.1, 0.18, 0.3, 0.5, 0.72, 0.9, 1.0], t0: wt('c5a', 'back'), dur: 0.35, color: C.clay, grid: false, lw: 6 });
    },
  });
  S(48.5, 50.25, 'face', {
    tin: { type: 'flash', d: 0.2 }, look: LK.clayDither, cam: cam({ z0: 1.14, z1: 1.2, px0: 0.02, px1: -0.02, flip: true }),
    draw(ctx, t, m) {
      KIN.subtitle(ctx, 'c5b', t, { x: 1810, y: 900, size: 64, fam: 'mono', wt: '', color: C.paper, bg: C.ink, align: 'right', underline: false, until: B(50.25) });
      G.cv(ctx, m.face(), t, B(48.5) + 0.1, { label: 'MOOD: OVER?', conf: 0.49, color: C.ink, tagBg: C.ink, tagFg: C.paper });
    },
  });
  S(50.25, 51, 'whitecu', {
    tin: { type: 'slices', d: 0.2, seed: 11 }, look: LK.mono, cam: cam({ z0: 1.2, z1: 1.3, flip: true, bump: 0.05 }), theme: 'light',
    draw(ctx, t) {
      // BACK repeated down the frame, the last one in clay
      const tb = wt('c5b', 'back');
      KIN.masthead(ctx, 'c5b', t, { stack: true, stackFrom: 3, x: 1000, y: 330, size: 250, lh: 0.84, color: C.ink, hi: ['back'], until: B(51) });
      if (t > tb) for (let i = 1; i < 4; i++) { if (RV.beatsSince(tb, t) * 4 < i) continue; KIN.font(ctx, 250, 'cond'); ctx.fillStyle = i === 3 ? C.clay : C.ink; ctx.globalAlpha = 0.25 + i * 0.2; ctx.fillText('BACK!', 110, 250 + i * 210); }
      ctx.globalAlpha = 1;
    },
  });

  // ============================ 7. BRIDGE — the dashboard ===============================
  S(51, 53, 'label', {
    tin: { type: 'wipe', d: 0.5 }, look: LK.paper, cam: cam({ z0: 1.04, z1: 1.1, px0: -0.03, px1: 0.03, focus: 0.6 }), theme: 'light',
    back(ctx, t, m) {
      const [c, x] = G.scratch('lbl', 600, 560);
      const tv = wt('b1', 'vision'), td = wt('b1', 'dashboard');
      x.fillStyle = C.ink; KIN.font(x, 96, 'cond');
      if (t > T0('b1')) { x.globalAlpha = 0.75; x.filter = t > tv ? 'blur(3px)' : 'none'; x.fillText('A VISION', 40, 150); x.filter = 'none'; x.globalAlpha = 1; }
      if (t > tv) { x.strokeStyle = C.ink; x.lineWidth = 10; x.beginPath(); x.moveTo(30, 118); x.lineTo(30 + 380 * eout(inv(tv, tv + 0.2, t)), 118); x.stroke(); }
      if (t > td) { G.mono(x, 26, true); x.fillText('→ A DASHBOARD', 40, 260); G.bars(x, t, { x: 40, y: 300, w: 500, h: 200, data: F.buyback, t0: td, perBeat: 4, color: C.ink, axis: C.ink, accent: C.paper }); }
      G.quad(ctx, c, quadOf(m, [[0.44, 0.25], [0.81, 0.24], [0.81, 0.8], [0.45, 0.81]], 0.6), 6);
    },
    draw(ctx, t) { sub(ctx, 'b1', t, { x: 110, y: 930, align: 'left', bg: 'rgba(241,239,233,0.9)', color: C.ink, hi: ['dashboard'], until: B(53) }); },
  });
  S(53, 56, 'tag', {
    tin: { type: 'flash', d: 0.2 }, look: LK.paper, cam: cam({ z0: 1.04, z1: 1.1, px0: 0.02, px1: -0.02, focus: 0.7 }), theme: 'light',
    back(ctx, t, m) {
      // the white card in her hand becomes the guarantee tag
      const [c, x] = G.scratch('gtag', 640, 400);
      x.fillStyle = C.white; x.fillRect(0, 0, 640, 400); x.fillStyle = C.clay; x.fillRect(0, 0, 640, 12);
      x.fillStyle = C.ink; G.mono(x, 22, true); x.fillText('GUARANTEE · VERIFIED ON-CHAIN', 30, 60);
      const rows = [['BUYBACKS', 'DAILY', wt('b2', 'daily')], ['BURN', 'REAL', wt('b2', 'real')]];
      rows.forEach(([a, b, tt], i) => { if (t < wt('b2', a.toLowerCase())) return; KIN.font(x, 84, 'cond'); x.fillStyle = C.ink; x.fillText(a + ':', 30, 160 + i * 100); if (t > tt) { x.fillStyle = C.clay; x.fillText(b + ' ✓', 360, 160 + i * 100); } });
      G.barcode(x, 30, 320, 330, 44, 'BUYBACK', t);
      G.quad(ctx, c, quadOf(m, [[0.405, 0.6], [0.6, 0.695], [0.59, 0.89], [0.38, 0.79]], 0.8), 6);
    },
    draw(ctx, t, m) {
      G.cv(ctx, m.face(), t, B(53) + 0.1, { label: 'LEAD · HOLDING PROOF', conf: 1, color: C.ink, tagBg: C.ink, tagFg: C.paper });
      sub(ctx, 'b2', t, { x: 1810, y: 930, align: 'right', bg: 'rgba(241,239,233,0.9)', color: C.ink, hi: ['daily', 'real'], until: B(56) });
    },
  });
  S(56, 59, 'lie', {
    tin: { type: 'flapwipe', d: 0.45 }, look: LK.paper, cam: cam({ z0: 1.04, z1: 1.1, px0: -0.02, px1: 0.02 }), theme: 'light',
    draw(ctx, t) {
      // the through-line flips: a waiting list becomes no waiting list
      ctx.fillStyle = 'rgba(241,239,233,0.55)'; ctx.fillRect(0, 0, W, H);
      const tn = wt('b3', 'no');
      G.flap(ctx, 330, 330, 14, 'WAITING LIST:'.padEnd(14) + (F.waitingList + ' AHEAD').padEnd(14), 'THERE IS NO'.padEnd(14) + 'WAITING LIST.'.padEnd(14), t, tn, { cw: 80, ch: 116, gap: 6, spread: 0.3, hi: (i, c) => i >= 14 });
      sub(ctx, 'b3', t, { bg: 'rgba(241,239,233,0.9)', color: C.ink, size: 52, until: B(59) });
    },
  });

  // ============================ 8. OUTRO — the care label ===============================
  S(59, 61.5, 'care', {
    tin: { type: 'fade', d: 0.4 }, look: LK.paper, cam: cam({ z0: 1.03, z1: 1.08, px0: -0.02, px1: 0.02, bump: 0.004 }), theme: 'light', chrome: { level: 'min' },
    back(ctx, t, m) {
      const [c, x] = G.scratch('care', 900, 560);
      x.clearRect(0, 0, 900, 560); x.fillStyle = C.ink;
      const lines = [['SHELL:', 'AI-PROPOSED.', wt('o1', 'shell'), wt('o1', 'aiproposed')], ['LINING:', 'HUMAN-BUILT.', wt('o1', 'lining'), wt('o1', 'humanbuilt')]];
      lines.forEach(([a, b, ta, tb], i) => {
        if (t < ta) return; G.mono(x, 64, true); x.fillStyle = C.ink; x.fillText(a, 60, 160 + i * 150);
        if (t > tb) { x.fillStyle = i ? C.ink : C.clay; x.fillText(b, 340, 160 + i * 150); }
      });
      G.mono(x, 24); x.fillStyle = C.ink; x.globalAlpha = 0.7; x.fillText('100% REVENUE-SHARING · MADE IN THE AGI ERA', 60, 460); x.globalAlpha = 1;
      G.quad(ctx, c, quadOf(m, [[0.205, 0.23], [0.825, 0.34], [0.775, 0.94], [0.16, 0.815]], 0.5), 6);
    },
    draw(ctx, t) { KIN.mark('o1', 0); KIN.mark('o1', 1); KIN.mark('o1', 2); KIN.mark('o1', 3); },
  });
  S(61.5, 64, 'tagmacro', {
    look: LK.paper, cam: cam({ z0: 1.04, z1: 1.1, px0: 0.02, px1: -0.02 }), theme: 'light', chrome: { level: 'min' },
    draw(ctx, t) {
      ctx.fillStyle = 'rgba(241,239,233,0.8)'; ctx.fillRect(1060, 130, 740, 820);
      const items = [['wash', 'wash', false], ['iron', 'iron', true], ['lock', 'gatekeep', true]];
      items.forEach(([k, w, cross], i) => { G.care(ctx, k, 1110, 190 + i * 250, 160, t, wt('o2', w), { cross }); });
      KIN.coverline(ctx, 'o2', t, { x: 1320, y: 300, size: 76, maxW: 460, lh: 1.6, color: C.ink, hi: ['gatekeep'], upper: true, until: B(64) });
    },
  });
  S(64, 66, 'star', {
    tin: { type: 'cross', d: 0.4 }, look: LK.paper, cam: cam({ z0: 1.06, z1: 1.14, r0: 0, r1: 0.05, bump: 0.004 }), theme: 'light', chrome: { level: 'min' },
    draw(ctx, t) {
      G.cv(ctx, [0.5, 0.22, 0.19, 0.44], t, T0('o3'), { label: 'SPARK', conf: 1, color: C.ink, tagBg: C.clay });
      ctx.fillStyle = 'rgba(241,239,233,0.9)'; if (t > T0('o3')) ctx.fillRect(90, 150, 760 * eout(inv(T0('o3'), T0('o3') + 0.2, t)), 150);
      KIN.coverline(ctx, 'o3', t, { x: 120, y: 262, size: 110, color: C.ink, hi: ['claude'], until: B(66) });
    },
  });
  S(66, 70, 'walkaway', {
    tin: { type: 'flash', d: 0.3 }, look: LK.paper, cam: cam({ z0: 1.03, z1: 1.12, px0: 0.02, px1: -0.02 }), theme: 'light',
    draw(ctx, t) {
      // end card: END OF SHOW, the counter, credits
      G.flap(ctx, 120, 170, 12, '            ', 'END OF SHOW.', t, B(66) + 0.1, { cw: 60, ch: 88 });
      if (t > B(67)) { KIN.font(ctx, 150, 'cond'); ctx.fillStyle = C.ink; ctx.globalAlpha = eout(inv(B(67), B(67) + 0.4, t)); ctx.fillText('REVENUE', 120, 470); ctx.fillStyle = C.clay; ctx.fillText('VELOCITY', 120, 610); ctx.globalAlpha = 1; }
      if (t > B(68)) {
        G.mono(ctx, 18, true); ctx.fillStyle = C.ink; ctx.fillText('REVENUE SHARED SO FAR', 120, 700);
        G.counter(ctx, 120, 715, RV.CHROME.revenue(t), { prefix: '$', cw: 40, ch: 58, bg: C.ink, fg: C.paper });
        G.mono(ctx, 15); ctx.fillText(`${F.brand} · S/S 26  ·  MADE WITH CLAUDE`, 120, 830);
      }
    },
  });
  return shots;
};
