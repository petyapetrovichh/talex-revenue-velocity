// Explaining graphics: CV frames, garment-tag cards, chat windows, charts, split-flap boards,
// quad mapping (billboards, screens, the tag in her hand), care symbols. All pure functions of t.
'use strict';
RV.GFX = (() => {
  const { C, KIN, clamp, lerp, inv, eout, hash } = RV;
  const mono = (ctx, px, m) => KIN.font(ctx, px, m ? 'monom' : 'mono');
  const P = (x, y) => ({ x, y });

  // --- CV box tracked to a normalized face/body box ----------------------------------------
  // b: [x,y,w,h] normalized to the frame; appear at t0; label, conf
  function cv(ctx, b, t, t0, o = {}) {
    if (t < t0 || !b) return;
    const k = eout(inv(t0, t0 + 0.18, t)), W = RV.W, H = RV.H;
    const j = (o.jitter ?? 3) * (hash(Math.floor(t * 12) + (o.seed ?? 0)) - 0.5);
    let [x, y, w, h] = [b[0] * W + j, b[1] * H - j, b[2] * W, b[3] * H];
    const pad = o.pad ?? 0.12; x -= w * pad; y -= h * pad; w *= 1 + 2 * pad; h *= 1 + 2 * pad;
    const cx = x + w / 2, cy = y + h / 2; w *= lerp(1.6, 1, k); h *= lerp(1.6, 1, k); x = cx - w / 2; y = cy - h / 2;
    const col = o.color ?? C.white, L = Math.min(w, h) * 0.18;
    ctx.save(); ctx.globalAlpha = (o.alpha ?? 1) * k; ctx.strokeStyle = col; ctx.lineWidth = o.lw ?? 2;
    ctx.beginPath();
    [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]].forEach(([a, b2, sx, sy]) => { ctx.moveTo(a + sx * L, b2); ctx.lineTo(a, b2); ctx.lineTo(a, b2 + sy * L); });
    ctx.stroke();
    if (o.full) { ctx.globalAlpha *= 0.35; ctx.strokeRect(x, y, w, h); ctx.globalAlpha /= 0.35; }
    if (o.label) {
      mono(ctx, o.fs ?? 15, true); const s = o.label + (o.conf != null ? ' ' + o.conf.toFixed(2) : '');
      const tw = ctx.measureText(s).width + 12;
      ctx.fillStyle = o.tagBg ?? C.clay; ctx.fillRect(x, y - 22, tw, 20);
      ctx.fillStyle = o.tagFg ?? C.ink; ctx.fillText(s, x + 6, y - 7);
    }
    if (o.sub) { mono(ctx, 13); ctx.fillStyle = col; o.sub.forEach((s, i) => ctx.fillText(s, x, y + h + 18 + i * 16)); }
    ctx.restore();
    return { x, y, w, h };
  }
  const face = (key, i = 0) => (RV.FACES[key] || [])[i];
  // body box from a face box
  const body = f => f && [f[0] - f[2] * 1.4, f[1] - f[3] * 0.2, f[2] * 3.8, Math.min(1 - f[1], f[3] * 7)];

  // --- garment tag / model card -----------------------------------------------------------
  // o: {x,y,w,h,title,sub,rows:[[k,v]],code,accent,t0,theme}
  function tag(ctx, t, o) {
    if (t < o.t0) return;
    const k = eout(inv(o.t0, o.t0 + 0.22, t)), out = o.t1 ? 1 - inv(o.t1, o.t1 + 0.15, t) : 1;
    if (out <= 0) return;
    const { x, y, w, h } = o;
    ctx.save(); ctx.globalAlpha = out; ctx.translate(x + (1 - k) * (o.dx ?? 40), y); ctx.rotate(o.rot ?? 0);
    ctx.fillStyle = o.bg ?? C.paper; ctx.fillRect(0, 0, w, h * k);
    ctx.beginPath(); ctx.rect(0, 0, w, h * k); ctx.clip();
    ctx.fillStyle = o.accent ?? C.clay; ctx.fillRect(0, 0, w, 6);
    ctx.fillStyle = C.ink; mono(ctx, 13); ctx.fillText(o.kicker ?? 'REVENUE VELOCITY  ·  S/S 26', 14, 28);
    if (o.hole !== false) { ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(w - 22, 24, 7, 0, 7); ctx.stroke(); }
    KIN.font(ctx, o.ts ?? 44, 'cond'); ctx.fillText(o.title, 14, 74);
    if (o.sub) { mono(ctx, 15, true); ctx.fillStyle = o.accent ?? C.clay; ctx.fillText(o.sub, 14, 100); }
    ctx.fillStyle = C.ink; mono(ctx, 14);
    (o.rows || []).forEach(([a, b], i) => {
      const yy = 130 + i * 24; if (t < o.t0 + 0.15 + i * (o.rowGap ?? 0.07)) return;
      ctx.globalAlpha = out * 0.55; ctx.fillRect(14, yy + 7, w - 28, 1); ctx.globalAlpha = out;
      ctx.fillText(a, 14, yy); const bw = ctx.measureText(b).width; ctx.fillText(b, w - 14 - bw, yy);
    });
    if (o.code !== false) barcode(ctx, 14, h - 56, w * 0.55, 40, o.code ?? 'TLXJ', t);
    if (o.stamp) { ctx.fillStyle = C.ink; mono(ctx, 12); ctx.fillText(o.stamp, w * 0.62, h - 20); }
    ctx.restore();
  }
  function barcode(ctx, x, y, w, h, seed = 'x', t = 0) {
    let s = 0; for (const ch of seed) s += ch.charCodeAt(0);
    let xx = x; ctx.fillStyle = C.ink;
    for (let i = 0; xx < x + w; i++) { const bw = 1 + Math.floor(hash(s + i) * 4); if (i % 2 === 0) ctx.fillRect(xx, y, bw, h); xx += bw; }
    mono(ctx, 10); ctx.fillText(String(Math.floor(hash(s) * 1e12)).padStart(12, '0'), x, y + h + 12);
  }

  // --- panel (UI window) ------------------------------------------------------------------
  function panel(ctx, x, y, w, h, title, o = {}) {
    ctx.save();
    ctx.fillStyle = o.bg ?? 'rgba(13,16,19,0.86)'; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = o.line ?? 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    ctx.fillStyle = o.head ?? 'rgba(255,255,255,0.08)'; ctx.fillRect(x, y, w, 28);
    mono(ctx, 13, true); ctx.fillStyle = o.fg ?? C.white; ctx.fillText(title, x + 12, y + 19);
    if (o.status) { const s = o.status; const sw = ctx.measureText(s).width; ctx.fillStyle = o.statusColor ?? C.clay; ctx.fillText(s, x + w - sw - 12, y + 19); }
    ctx.restore();
  }
  // chat window: name, prompt typed, answer typed. p0: prompt start time, a0: answer start time
  function chat(ctx, t, o) {
    if (t < o.t0) return;
    const k = eout(inv(o.t0, o.t0 + 0.2, t));
    const { x, y, w } = o, h = o.h ?? 190;
    ctx.save(); ctx.globalAlpha = k; ctx.translate(0, (1 - k) * 30);
    panel(ctx, x, y, w, h, o.name, { status: o.status ?? '● online', statusColor: o.accent ?? C.clay });
    const type = (s, a, b) => s.slice(0, Math.floor(s.length * clamp((t - a) / Math.max(0.05, b - a))));
    mono(ctx, 15); ctx.fillStyle = C.steel;
    ctx.fillText('> ' + type(o.prompt, o.p0, o.p0 + (o.pd ?? 0.6)), x + 14, y + 56);
    if (t >= o.a0) {
      KIN.font(ctx, o.as ?? 34, 'cond'); ctx.fillStyle = C.white;
      const s = type(o.answer, o.a0, o.a0 + (o.ad ?? 0.4));
      wrap(ctx, s, x + 14, y + 104, w - 28, (o.as ?? 34) * 1.05);
      if (o.check && t > o.a0 + (o.ad ?? 0.4)) { ctx.fillStyle = C.clay; mono(ctx, 14, true); ctx.fillText('✓ ' + o.check, x + 14, y + h - 16); }
    }
    ctx.restore();
  }
  function wrap(ctx, s, x, y, w, lh) {
    const words = s.split(' '); let line = '', yy = y;
    for (const wd of words) { const tst = line ? line + ' ' + wd : wd; if (ctx.measureText(tst).width > w && line) { ctx.fillText(line, x, yy); line = wd; yy += lh; } else line = tst; }
    if (line) ctx.fillText(line, x, yy);
  }

  // --- charts ----------------------------------------------------------------------------
  // bars that grow on beats. data: array of values 0..1; t0 start; perBeat bars revealed per beat
  function bars(ctx, t, o) {
    if (t < o.t0) return;
    const { x, y, w, h, data } = o, n = data.length, gap = o.gap ?? 4, bw = (w - gap * (n - 1)) / n;
    const shown = RV.beatsSince(o.t0, t) * (o.perBeat ?? 2);
    ctx.save();
    ctx.strokeStyle = o.axis ?? 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y + h + 0.5); ctx.lineTo(x + w, y + h + 0.5); ctx.stroke();
    data.forEach((v, i) => {
      const g = eout(clamp(shown - i)); if (g <= 0) return;
      const bh = v * h * g, last = i === n - 1 || (o.hiFrom != null && i >= o.hiFrom);
      ctx.fillStyle = last ? (o.accent ?? C.clay) : (o.color ?? C.white);
      ctx.fillRect(x + i * (bw + gap), y + h - bh, bw, bh);
    });
    if (o.label) { mono(ctx, 13); ctx.fillStyle = o.color ?? C.white; ctx.fillText(o.label, x, y - 10); }
    ctx.restore();
  }
  // line chart drawn on from t0 over dur
  function line(ctx, t, o) {
    if (t < o.t0) return;
    const { x, y, w, h, data } = o, k = eout(inv(o.t0, o.t0 + (o.dur ?? 1.2), t), 2), n = data.length;
    ctx.save(); ctx.strokeStyle = o.color ?? C.clay; ctx.lineWidth = o.lw ?? 3; ctx.beginPath();
    const m = Math.max(2, Math.ceil(n * k));
    for (let i = 0; i < m; i++) { const px = x + (i / (n - 1)) * w, py = y + h - data[i] * h; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    ctx.stroke();
    const i = m - 1, px = x + (i / (n - 1)) * w, py = y + h - data[i] * h;
    ctx.fillStyle = o.color ?? C.clay; ctx.beginPath(); ctx.arc(px, py, 6, 0, 7); ctx.fill();
    if (o.grid !== false) { ctx.strokeStyle = 'rgba(255,255,255,0.18)'; ctx.lineWidth = 1; for (let g = 0; g <= 4; g++) { ctx.beginPath(); ctx.moveTo(x, y + g * h / 4 + 0.5); ctx.lineTo(x + w, y + g * h / 4 + 0.5); ctx.stroke(); } }
    if (o.label) { mono(ctx, 13); ctx.fillStyle = C.white; ctx.fillText(o.label, x, y - 10); }
    ctx.restore();
    return { x: px, y: py };
  }
  // gauge (speedometer): value 0..1
  function gauge(ctx, cx, cy, r, v, o = {}) {
    ctx.save(); ctx.lineWidth = 2; ctx.strokeStyle = o.color ?? C.white;
    const a0 = Math.PI * 0.8, a1 = Math.PI * 2.2;
    ctx.beginPath(); ctx.arc(cx, cy, r, a0, a1); ctx.stroke();
    for (let i = 0; i <= 20; i++) { const a = lerp(a0, a1, i / 20), l = i % 5 ? 8 : 16; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); ctx.lineTo(cx + Math.cos(a) * (r - l), cy + Math.sin(a) * (r - l)); ctx.stroke(); }
    ctx.strokeStyle = o.accent ?? C.clay; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(cx, cy, r - 24, a0, lerp(a0, a1, v)); ctx.stroke();
    const a = lerp(a0, a1, v); ctx.lineWidth = 3; ctx.strokeStyle = o.accent ?? C.clay; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * (r - 30), cy + Math.sin(a) * (r - 30)); ctx.stroke();
    mono(ctx, 14); ctx.fillStyle = o.color ?? C.white; if (o.label) ctx.fillText(o.label, cx - r, cy + r * 0.75);
    if (o.value) { KIN.font(ctx, 40, 'cond'); ctx.fillText(o.value, cx - ctx.measureText(o.value).width / 2, cy + r * 0.55); }
    ctx.restore();
  }

  // --- split-flap -------------------------------------------------------------------------
  const FLAP = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$.,:%-+/∞●';
  // board: from string a to string b starting at tf; each cell settles after a hashed delay
  function flap(ctx, x, y, cols, a, b, t, tf, o = {}) {
    const cw = o.cw ?? 34, ch = o.ch ?? 50, g = o.gap ?? 4, rows = Math.ceil(Math.max(a.length, b.length) / cols);
    const A = a.padEnd(rows * cols), B = b.padEnd(rows * cols);
    ctx.save(); KIN.font(ctx, ch * 0.78, 'monom');
    for (let i = 0; i < rows * cols; i++) {
      const cx = x + (i % cols) * (cw + g), cy = y + Math.floor(i / cols) * (ch + g);
      const d = (o.stagger ?? 0.012) * i + hash(i + (o.seed ?? 0)) * (o.spread ?? 0.35);
      const dur = o.dur ?? 0.45; let c;
      if (t < tf + d) c = A[i]; else if (t > tf + d + dur) c = B[i];
      else { const f = Math.floor((t - tf - d) * 30); c = A[i] === B[i] ? B[i] : FLAP[Math.floor(hash(i * 7 + f) * FLAP.length)]; }
      const flip = t > tf + d && t < tf + d + dur && A[i] !== B[i];
      ctx.fillStyle = o.bg ?? '#15191d'; ctx.fillRect(cx, cy, cw, ch);
      ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(cx, cy + ch / 2 - 1, cw, 2);
      const hi = o.hi && o.hi(i, c);
      ctx.fillStyle = hi ? C.clay : (o.fg ?? C.paper);
      if (flip) { ctx.save(); ctx.translate(cx + cw / 2, cy + ch / 2); ctx.scale(1, 0.6 + 0.4 * Math.abs(Math.cos((t - tf - d) * 40))); ctx.fillText(c, -ctx.measureText(c).width / 2, ch * 0.28); ctx.restore(); }
      else ctx.fillText(c, cx + cw / 2 - ctx.measureText(c).width / 2, cy + ch * 0.72);
    }
    ctx.restore();
    return { w: cols * (cw + g) - g, h: rows * (ch + g) - g };
  }
  // odometer-like number with flap digits
  function counter(ctx, x, y, v, o = {}) {
    const s = (o.prefix ?? '') + RV.fmt(Math.floor(v)) + (o.suffix ?? '');
    return flap(ctx, x, y, s.length, s, s, 0, 1e9, o);
  }

  // --- quad mapping: draw a source canvas/image onto an arbitrary quad (2 affine triangles) --
  // affine map of source triangle s0..s2 onto destination d0..d2, clipped to a slightly grown triangle
  function tri(ctx, src, s0, s1, s2, d0, d1, d2) {
    const du1 = s1.x - s0.x, dv1 = s1.y - s0.y, du2 = s2.x - s0.x, dv2 = s2.y - s0.y, det = du1 * dv2 - du2 * dv1;
    if (Math.abs(det) < 1e-9) return;
    const dx1 = d1.x - d0.x, dy1 = d1.y - d0.y, dx2 = d2.x - d0.x, dy2 = d2.y - d0.y;
    const a = (dx1 * dv2 - dx2 * dv1) / det, c = (dx2 * du1 - dx1 * du2) / det;
    const b = (dy1 * dv2 - dy2 * dv1) / det, d = (dy2 * du1 - dy1 * du2) / det;
    const e = d0.x - a * s0.x - c * s0.y, f = d0.y - b * s0.x - d * s0.y;
    const mx = (d0.x + d1.x + d2.x) / 3, my = (d0.y + d1.y + d2.y) / 3, g = p => { const l = Math.hypot(p.x - mx, p.y - my) || 1; return { x: p.x + (p.x - mx) / l * 0.8, y: p.y + (p.y - my) / l * 0.8 }; };
    const [p0, p1, p2] = [g(d0), g(d1), g(d2)];
    ctx.save(); ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.closePath(); ctx.clip();
    ctx.transform(a, b, c, d, e, f); ctx.drawImage(src, 0, 0); ctx.restore();
  }
  // q: [tl, tr, br, bl] points in frame px; the source is subdivided so perspective reads right
  function quad(ctx, src, q, n = 6) {
    const W = src.width, H = src.height;
    const at = (u, v) => { const top = { x: lerp(q[0].x, q[1].x, u), y: lerp(q[0].y, q[1].y, u) }, bot = { x: lerp(q[3].x, q[2].x, u), y: lerp(q[3].y, q[2].y, u) }; return { x: lerp(top.x, bot.x, v), y: lerp(top.y, bot.y, v) }; };
    const s = (u, v) => P(u * W, v * H);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const u0 = i / n, u1 = (i + 1) / n, v0 = j / n, v1 = (j + 1) / n;
      const a = at(u0, v0), b = at(u1, v0), c = at(u1, v1), d = at(u0, v1);
      tri(ctx, src, s(u0, v0), s(u1, v0), s(u1, v1), a, b, c);
      tri(ctx, src, s(u0, v0), s(u1, v1), s(u0, v1), a, c, d);
    }
  }
  // scratch canvases (reused; content is always fully redrawn)
  const pool = {};
  function scratch(name, w, h) {
    let c = pool[name]; if (!c) { c = pool[name] = document.createElement('canvas'); }
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
    const x = c.getContext('2d'); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, w, h); return [c, x];
  }

  // --- care symbols -------------------------------------------------------------------------
  function care(ctx, kind, x, y, s, t, t0, o = {}) {
    if (t < t0) return;
    const k = eout(inv(t0, t0 + 0.3, t));
    ctx.save(); ctx.translate(x, y); ctx.scale(s / 100, s / 100); ctx.strokeStyle = o.color ?? C.ink; ctx.fillStyle = o.color ?? C.ink; ctx.lineWidth = 5; ctx.lineJoin = 'round';
    ctx.setLineDash([400]); ctx.lineDashOffset = 400 * (1 - k);
    if (kind === 'wash') { ctx.beginPath(); ctx.moveTo(5, 25); ctx.lineTo(15, 90); ctx.lineTo(85, 90); ctx.lineTo(95, 25); ctx.stroke(); ctx.beginPath(); for (let i = 0; i <= 20; i++) { const xx = 10 + i * 4; ctx.lineTo(xx, 35 + Math.sin(i * 0.9) * 5); } ctx.stroke(); ctx.setLineDash([]); KIN.font(ctx, 38, 'cond'); ctx.globalAlpha = k; ctx.fillText('30', 32, 76); }
    if (kind === 'iron') { ctx.beginPath(); ctx.moveTo(10, 80); ctx.lineTo(90, 80); ctx.lineTo(82, 40); ctx.quadraticCurveTo(80, 28, 60, 28); ctx.lineTo(30, 28); ctx.quadraticCurveTo(12, 40, 10, 80); ctx.stroke(); }
    if (kind === 'lock') { ctx.strokeRect(22, 45, 56, 45); ctx.beginPath(); ctx.arc(50, 45, 20, Math.PI, 0); ctx.stroke(); }
    if (o.cross) { const kc = eout(inv(t0 + 0.25, t0 + 0.45, t)); ctx.setLineDash([]); ctx.strokeStyle = o.crossColor ?? C.clay; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(100 * kc, 100 * kc); ctx.moveTo(100, 0); ctx.lineTo(100 - 100 * kc, 100 * kc); ctx.stroke(); }
    ctx.restore();
  }

  // --- misc -----------------------------------------------------------------------------------
  function label(ctx, s, x, y, o = {}) { // small mono label with a leader line
    mono(ctx, o.fs ?? 14, o.bold); ctx.save(); ctx.fillStyle = o.color ?? C.white; ctx.strokeStyle = o.color ?? C.white; ctx.lineWidth = 1;
    if (o.to) { ctx.beginPath(); ctx.moveTo(x, y + 4); ctx.lineTo(o.to.x, o.to.y); ctx.stroke(); ctx.beginPath(); ctx.arc(o.to.x, o.to.y, 3, 0, 7); ctx.fill(); }
    ctx.fillText(s, x, y); ctx.restore();
  }
  function arrow(ctx, a, b, k, o = {}) { // animated arrow from a to b (k 0..1)
    if (k <= 0) return; const x = lerp(a.x, b.x, k), y = lerp(a.y, b.y, k);
    ctx.save(); ctx.strokeStyle = o.color ?? C.white; ctx.fillStyle = o.color ?? C.white; ctx.lineWidth = o.lw ?? 2;
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(x, y); ctx.stroke();
    const an = Math.atan2(b.y - a.y, b.x - a.x); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 12 * Math.cos(an - 0.4), y - 12 * Math.sin(an - 0.4)); ctx.lineTo(x - 12 * Math.cos(an + 0.4), y - 12 * Math.sin(an + 0.4)); ctx.fill();
    ctx.restore();
  }
  function stamp(ctx, s, x, y, t, t0, o = {}) { // slams in with overshoot
    if (t < t0) return; const k = inv(t0, t0 + 0.12, t), sc = lerp(o.from ?? 2.4, 1, eout(k, 4));
    ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot ?? -0.12); ctx.scale(sc, sc); ctx.globalAlpha = Math.min(1, k * 3) * (o.alpha ?? 1);
    KIN.font(ctx, o.size ?? 140, 'cond'); const w = ctx.measureText(s).width, h = (o.size ?? 140) * 0.9;
    ctx.strokeStyle = o.color ?? C.clay; ctx.lineWidth = o.size ? o.size * 0.05 : 7; ctx.strokeRect(-w / 2 - 24, -h * 0.72 - 10, w + 48, h + 10);
    ctx.fillStyle = o.color ?? C.clay; ctx.fillText(s, -w / 2, h * 0.14);
    ctx.restore();
  }
  function grid(ctx, t, o = {}) { // faint measurement grid
    ctx.save(); ctx.strokeStyle = o.color ?? 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1; const s = o.step ?? 60;
    for (let x = (o.ox ?? 0) % s; x < RV.W; x += s) { ctx.beginPath(); ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, RV.H); ctx.stroke(); }
    for (let y = (o.oy ?? 0) % s; y < RV.H; y += s) { ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(RV.W, y + 0.5); ctx.stroke(); }
    ctx.restore();
  }
  return { cv, face, body, tag, barcode, panel, chat, wrap, bars, line, gauge, flap, counter, quad, scratch, care, label, arrow, stamp, grid, mono };
})();
