// Devices catalogued from the original (rv/ORIGINAL-DEVICES.md), re-implemented. Pure functions of t.
// Colour rule: black / white / cream + one clay accent on the newest word, hit frames, stamps, flap digits.
'use strict';
RV.DEV = (() => {
  const { C, KIN, GFX: G, clamp, lerp, inv, eout, hash } = RV;
  const W = () => RV.W, H = () => RV.H, FPS = 30;
  const mono = (ctx, px, b) => KIN.font(ctx, px, b ? 'monom' : 'mono');
  const typed = (s, t, t0, cps = 60) => s.slice(0, Math.max(0, Math.floor((t - t0) * cps)));
  const cursor = (t) => (Math.floor(t * 4) % 2 ? '▌' : '');

  // ---- objects from Grounding DINO -------------------------------------------------------------
  const KEY = { face: 'face', person: 'person', body: 'person', laptop: 'laptop', billboard: 'billboard', sign: 'road sign', car: 'car', tag: 'garment tag', card: 'card', screen: 'screen', hand: 'hand' };
  // best box of a kind on a plate (optionally the n-th by score, or the one nearest to x)
  function obj(plate, kind, o = {}) {
    const L = (RV.OBJ[plate] || []).filter(d => d[0].split(' ').slice(0, 3).join(' ').includes(KEY[kind] || kind));
    if (o.nearX != null) L.sort((a, b) => Math.abs(a[1] + a[3] / 2 - o.nearX) - Math.abs(b[1] + b[3] / 2 - o.nearX));
    if (o.all) return L.map(d => d.slice(1, 5));
    const d = L[o.n || 0]; return d ? d.slice(1, 5) : null;
  }

  // ---- CV corner box (tracked style): draws in from the centre over 5 frames, typed label chip, conf outside
  function box(ctx, b, t, t0, o = {}) {
    if (!b || t < t0) return;
    const k = eout(inv(t0, t0 + 5 / FPS, t), 2);
    let [x, y, w, h] = [b[0] * W(), b[1] * H(), b[2] * W(), b[3] * H()];
    const pad = o.pad ?? 0.1; x -= w * pad; y -= h * pad; w *= 1 + 2 * pad; h *= 1 + 2 * pad;
    const cx = x + w / 2, cy = y + h / 2; w *= k; h *= k; x = cx - w / 2; y = cy - h / 2;
    const col = o.color ?? C.white, arm = Math.min(w, h) * 0.18;
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = o.lw ?? 1.5; ctx.globalAlpha = o.alpha ?? 1;
    ctx.beginPath();
    [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]].forEach(([a, c, sx, sy]) => { ctx.moveTo(a + sx * arm, c); ctx.lineTo(a, c); ctx.lineTo(a, c + sy * arm); });
    ctx.stroke();
    if (o.label && k > 0.9) {
      const lbl = typed(o.label, t, t0 + 5 / FPS, 60); mono(ctx, o.fs ?? 13, true);
      const tw = ctx.measureText(o.label).width + 14;
      ctx.fillStyle = o.chip ?? C.ink; ctx.fillRect(x, y - 21, tw, 19);
      ctx.fillStyle = o.chipFg ?? C.white; ctx.fillText(lbl + (lbl.length < o.label.length ? '▌' : ''), x + 7, y - 7);
      if (o.strike && t > o.strike.t) { // relabel gag: strike the old label, a clay chip with the new one
        const ks = eout(inv(o.strike.t, o.strike.t + 0.12, t)); ctx.strokeStyle = C.clay; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x + 4, y - 12); ctx.lineTo(x + 4 + (tw - 8) * ks, y - 12); ctx.stroke();
        const nl = typed(o.strike.label, t, o.strike.t + 0.12, 60), tw2 = ctx.measureText(o.strike.label).width + 14;
        if (t > o.strike.t + 0.12) { ctx.fillStyle = C.clay; ctx.fillRect(x + tw + 6, y - 21, tw2, 19); ctx.fillStyle = C.ink; ctx.fillText(nl, x + tw + 13, y - 7); }
      }
      if (o.conf != null) { mono(ctx, 12); ctx.fillStyle = col; const s = o.conf.toFixed(2); ctx.fillText(s, x + w - ctx.measureText(s).width, y - 6); }
      if (o.tele) { mono(ctx, 11); ctx.fillStyle = col; ctx.globalAlpha *= 0.85; o.tele.forEach((s, i) => ctx.fillText(typed(s, t, t0 + 0.2 + i * 0.1, 50), x + w + 10, y + 14 + i * 15)); }
    }
    ctx.restore();
    return { x, y, w, h };
  }
  // swarm of small boxes that count up (e.g. the audience as AGENTS)
  function swarm(ctx, boxes, t, t0, o = {}) {
    let n = 0;
    boxes.forEach((b, i) => { const ti = t0 + i * (o.step ?? 0.035); if (t >= ti) n++; box(ctx, b, t, ti, { label: o.label ? `${o.label} ${String(i + 1).padStart(2, '0')}` : null, fs: 10, pad: 0.05, lw: 1.2 }); });
    if (o.counter && t >= t0) { mono(ctx, 14, true); ctx.fillStyle = C.white; ctx.fillText(`${o.counter} ${String(n).padStart(2, '0')}`, o.cx ?? 110, o.cy ?? 170); }
  }

  // ---- look card (cream): header, title, rows typed one per eighth, care symbols + barcode
  function lookCard(ctx, t, o) {
    if (t < o.t0) return; const out = o.t1 ? 1 - inv(o.t1, o.t1 + 0.12, t) : 1; if (out <= 0) return;
    const k = eout(inv(o.t0, o.t0 + 4 / FPS, t)), w = o.w ?? 300, h = o.h ?? 250;
    ctx.save(); ctx.globalAlpha = k * out; ctx.translate(o.x + (1 - k) * 20 * (o.fromRight ? 1 : -1), o.y);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, w, h); ctx.fillStyle = C.ink; mono(ctx, 11, true);
    ctx.fillText(o.head ?? `LOOK ${String(o.n).padStart(2, '0')} / 05 · TITLE CARD`, 12, 20);
    const chip = 'SS26'; const cw = ctx.measureText(chip).width + 10; ctx.fillStyle = C.clay; ctx.fillRect(w - cw - 10, 8, cw, 16); ctx.fillStyle = C.ink; ctx.fillText(chip, w - cw - 5, 20);
    ctx.fillRect(12, 28, w - 24, 1); KIN.font(ctx, 38, 'cond'); ctx.fillText(o.title, 12, 66);
    mono(ctx, 12); const eighth = (RV.bar(1) - RV.bar(0)) / 8;
    (o.rows || []).forEach(([a, b], i) => { const tr = o.t0 + 0.1 + i * eighth; if (t < tr) return; const yy = 90 + i * 20;
      ctx.globalAlpha = k * out * 0.4; ctx.fillRect(12, yy + 5, w - 24, 1); ctx.globalAlpha = k * out;
      ctx.fillText(a, 12, yy); const s = typed(b, t, tr, 40); ctx.fillText(s, w - 12 - ctx.measureText(b).width, yy); });
    // care symbols + barcode
    ctx.lineWidth = 1.5; ctx.strokeStyle = C.ink; const by = h - 38;
    ctx.beginPath(); ctx.moveTo(12, by); ctx.lineTo(16, by + 20); ctx.lineTo(34, by + 20); ctx.lineTo(38, by); ctx.stroke();
    ctx.strokeRect(46, by + 4, 22, 16); ctx.beginPath(); ctx.moveTo(46, by + 4); ctx.lineTo(68, by + 20); ctx.stroke();
    G.barcode(ctx, w - 130, by - 4, 118, 22, o.code ?? 'LOOK', t);
    ctx.restore();
  }

  // ---- masthead with accent-hit frame: first 2 frames white on a clay box, then white
  function hit(ctx, s, x, y, size, t, t0, o = {}) {
    if (t < t0 || (o.t1 && t > o.t1)) return;
    KIN.font(ctx, size, o.fam ?? 'cond'); const w = ctx.measureText(s).width, X = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
    ctx.fillStyle = o.color ?? C.white; ctx.fillText(s, X, y);
    return w;
  }
  // masthead from a lyric line: one word at a time, each with its own hit frame
  function mast(ctx, id, t, o = {}) {
    const k = RV.lines[id].tokens; let cur = -1; k.forEach((tk, i) => { if (t >= tk.t0) { cur = i; KIN.mark(id, i); } });
    if (cur < 0 || (o.until && t > o.until)) return;
    while (cur > 0 && /^[—–-]$/.test(k[cur].w)) cur--;
    const s = o.upper === false ? k[cur].w : k[cur].w.toUpperCase();
    hit(ctx, s, o.x ?? 110, o.y ?? 600, o.size ?? 240, t, k[cur].t0, o);
  }

  // ---- coverline: builds word by word, newest word in clay, older white; hairline rule draws over the line
  function cover(ctx, id, t, o = {}) {
    const k = RV.lines[id].tokens, t0 = k[0].t0, t1 = k[k.length - 1].t1, until = o.until ?? t1 + 0.6;
    if (t < t0 || t > until) return;
    const size = o.size ?? 46; KIN.font(ctx, size, o.fam ?? 'cond'); const maxW = o.maxW ?? 760, sp = size * 0.25;
    let x = o.x ?? 110, y = o.y ?? 260, cur = -1; k.forEach((tk, i) => { if (t >= tk.t0) cur = i; });
    ctx.save();
    k.forEach((tk, i) => {
      const s = o.upper ? tk.w.toUpperCase() : tk.w, w = ctx.measureText(s).width;
      if (x + w > (o.x ?? 110) + maxW) { x = o.x ?? 110; y += size * 1.05; }
      if (i <= cur) { ctx.fillStyle = i === cur ? C.clay : (o.color ?? C.white); ctx.fillText(s, x, y); KIN.mark(id, i); }
      x += w + sp;
    });
    const rk = inv(t0, t1, t); ctx.fillStyle = o.color ?? C.white; ctx.fillRect(o.x ?? 110, y + size * 0.35, maxW * rk, 1.5);
    if (o.tag && rk > 0.98) { mono(ctx, 12, true); ctx.fillText(o.tag, (o.x ?? 110) + maxW + 10, y + size * 0.35 + 4); }
    ctx.restore();
  }
  // subtitle at the bottom with the current word in an inverted chip
  function subChip(ctx, id, t, o = {}) {
    const k = RV.lines[id].tokens, t1 = k[k.length - 1].t1; if (t < k[0].t0 || t > (o.until ?? t1 + 0.4)) return;
    KIN.font(ctx, o.size ?? 34, 'sans', '500'); const sp = 10; let cur = -1; k.forEach((tk, i) => { if (t >= tk.t0) cur = i; });
    const ws = k.map(tk => ctx.measureText(tk.w).width), tot = ws.reduce((a, b) => a + b + sp, -sp);
    let x = (o.x ?? 960) - (o.align === 'left' ? 0 : tot / 2); const y = o.y ?? 990;
    k.forEach((tk, i) => { if (i <= cur) { if (i === cur) { ctx.fillStyle = o.chip ?? C.white; ctx.fillRect(x - 5, y - 30, ws[i] + 10, 40); ctx.fillStyle = C.ink; } else ctx.fillStyle = o.color ?? C.white; ctx.fillText(tk.w, x, y); KIN.mark(id, i); } x += ws[i] + sp; });
  }

  // ---- FIG. chart card (cream paper): axes, a line extending one point per beat, head readout
  function fig(ctx, t, o) {
    if (t < o.t0) return; const { x, y } = o, w = o.w ?? 600, h = o.h ?? 360, k = eout(inv(o.t0, o.t0 + 4 / FPS, t));
    ctx.save(); ctx.globalAlpha = k; ctx.fillStyle = C.paper; ctx.fillRect(x, y, w, h); ctx.fillStyle = C.ink; mono(ctx, 12, true);
    ctx.fillText(o.head, x + 14, y + 22); ctx.fillRect(x + 14, y + 30, w - 28, 1);
    const px = x + 50, py = y + 60, pw = w - 80, ph = h - 110; ctx.strokeStyle = C.ink; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py + ph); ctx.lineTo(px + pw, py + ph); ctx.stroke();
    if (o.threshold != null) { ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.moveTo(px, py + ph * (1 - o.threshold)); ctx.lineTo(px + pw, py + ph * (1 - o.threshold)); ctx.stroke(); ctx.setLineDash([]); mono(ctx, 10); ctx.fillText(o.thLabel ?? '', px + pw - 120, py + ph * (1 - o.threshold) - 6); }
    const d = o.data, n = Math.min(d.length, 1 + Math.floor(RV.beatsSince(o.t0, t) * (o.perBeat ?? 1)));
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.beginPath();
    for (let i = 0; i < n; i++) { const X = px + pw * i / (d.length - 1), Y = py + ph * (1 - d[i]); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); } ctx.stroke();
    const X = px + pw * (n - 1) / (d.length - 1), Y = py + ph * (1 - d[n - 1]); ctx.fillStyle = n === d.length && o.hitClay ? C.clay : C.ink; ctx.beginPath(); ctx.arc(X, Y, 6, 0, 7); ctx.fill();
    mono(ctx, 13, true); ctx.fillStyle = C.ink; if (o.readout) ctx.fillText(o.readout(n - 1, n === d.length), px, y + h - 18);
    ctx.restore();
  }

  // ---- full-frame flap card: two giant tiles + dimension callouts, flips once on the downbeat
  function flapCard(ctx, t, t0, a, b, o = {}) {
    ctx.fillStyle = o.dark ? '#111417' : C.paper; ctx.fillRect(0, 0, W(), H());
    if (!o.dark) G.grid(ctx, t, { step: 40, color: 'rgba(13,16,19,0.08)' });
    const tw = 300, th = 430, gap = 18, x0 = W() / 2 - tw - gap / 2, y0 = H() / 2 - th / 2 - 30;
    for (let i = 0; i < 2; i++) {
      const x = x0 + i * (tw + gap), f = clamp((t - t0 - i * 0.05) / 0.28), s = f < 1 ? b[i] : b[i];
      ctx.fillStyle = '#15191d'; ctx.fillRect(x, y0, tw, th); ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(x, y0 + th / 2 - 2, tw, 4);
      KIN.font(ctx, 400, 'monom'); ctx.fillStyle = o.clay ? C.clay : C.paper;
      const ch = f <= 0 ? a[i] : f < 1 ? (f < 0.5 ? a[i] : b[i]) : b[i], sc = f > 0 && f < 1 ? Math.abs(Math.cos(f * Math.PI)) : 1;
      ctx.save(); ctx.translate(x + tw / 2, y0 + th / 2); ctx.scale(1, Math.max(0.05, sc)); ctx.fillText(ch, -ctx.measureText(ch).width / 2, 140); ctx.restore();
    }
    const col = o.dark ? C.white : C.ink; ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 1; mono(ctx, 13);
    ctx.beginPath(); ctx.moveTo(x0 - 60, y0); ctx.lineTo(x0 - 60, y0 + th); ctx.stroke(); ctx.fillText(o.leftLabel ?? 'LEAF · FALL 0.28 S', x0 - 250, y0 + th / 2);
    ctx.beginPath(); ctx.moveTo(x0 + 2 * tw + gap + 30, y0 + th / 2); ctx.lineTo(x0 + 2 * tw + gap + 120, y0 + th / 2 - 60); ctx.stroke(); ctx.fillText(o.rightLabel ?? 'HINGE · AXLE Ø 2.9', x0 + 2 * tw + gap + 125, y0 + th / 2 - 64);
    const sy = y0 + th + 60; ctx.fillRect(x0 - 100, sy, 2 * tw + gap + 200, 1); for (let i = 0; i <= 20; i++) ctx.fillRect(x0 - 100 + i * (2 * tw + gap + 200) / 20, sy - (i % 5 ? 4 : 9), 1, i % 5 ? 4 : 9);
    ctx.fillStyle = C.clay; ctx.beginPath(); ctx.arc(x0 - 100 + (2 * tw + gap + 200) * (o.marker ?? 0.5), sy, 6, 0, 7); ctx.fill();
    ctx.fillStyle = col; if (o.caption) ctx.fillText(o.caption, x0 - 100, sy + 30);
  }

  // ---- number in the iris: thin mono number on the pupil (screen blend), reticle, dimension line
  function iris(ctx, t, t0, cx, cy, r, s, o = {}) {
    if (t < t0) return; const k = eout(inv(t0, t0 + 0.15, t));
    ctx.save(); ctx.strokeStyle = C.white; ctx.lineWidth = 1.2; ctx.globalAlpha = 0.9 * k;
    ctx.beginPath(); ctx.arc(cx, cy, r * lerp(1.4, 1, k), 0, 7); ctx.stroke();
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r * 1.05, cy + Math.sin(a) * r * 1.05); ctx.lineTo(cx + Math.cos(a) * r * 1.25, cy + Math.sin(a) * r * 1.25); ctx.stroke(); }
    ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = 0.75 * k; KIN.font(ctx, r * 0.55, 'mono'); ctx.fillStyle = C.white; ctx.fillText(s, cx - ctx.measureText(s).width / 2, cy + r * 0.18);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = k; mono(ctx, 12); ctx.fillRect(cx - r, cy + r * 1.45, 2 * r, 1); ctx.fillText(o.caption ?? '', cx - r, cy + r * 1.45 + 18);
    ctx.restore();
  }

  // ---- terminal window (Claude Code style): grows from a panel to full frame, prompt types, status ticks
  function terminal(ctx, t, t0, o) {
    if (t < t0) return; const g = eout(inv(t0, t0 + 3 / FPS, t), 3), g2 = o.t1 ? eout(inv(o.t1 - 0.1, o.t1, t), 3) : 0;
    const from = o.from ?? [W() * 0.35, H() * 0.45, 480, 280], to = [60, 60, W() - 120, H() - 120];
    const r = from.map((v, i) => lerp(lerp(v, to[i], g), from[i], g2)); const [x, y, w, h] = r;
    ctx.save(); ctx.fillStyle = C.paper; ctx.fillRect(x, y, w, h); ctx.fillStyle = C.ink; ctx.fillRect(x, y, w, 30);
    ctx.fillStyle = C.clay; [0, 1, 2].forEach(i => { ctx.beginPath(); ctx.arc(x + 18 + i * 18, y + 15, 5, 0, 7); ctx.fill(); });
    mono(ctx, 13, true); ctx.fillStyle = C.paper; ctx.fillText(o.title ?? 'claude — talex', x + 80, y + 20);
    ctx.beginPath(); ctx.rect(x, y + 30, w, h - 30); ctx.clip();
    const sc = w / (W() - 120); ctx.translate(x + 40 * sc, y + 90 * sc); ctx.scale(sc, sc);
    KIN.font(ctx, 60, 'monom'); ctx.fillStyle = C.ink; ctx.fillText('> ' + typed(o.prompt, t, t0 + 0.12, 22) + cursor(t), 0, 0);
    mono(ctx, 26); (o.lines || []).forEach((ln, i) => { const tl = ln.t ?? (t0 + 0.6 + i * 0.25); if (t < tl) return; ctx.fillStyle = ln.clay ? C.clay : C.ink; ctx.fillText(typeof ln.s === 'function' ? ln.s(t) : ln.s, 0, 90 + i * 44); });
    if (o.bars) { const n = Math.min(o.bars.length, Math.floor(RV.beatsSince(t0, t))); for (let i = 0; i < n; i++) { ctx.fillStyle = i === n - 1 ? C.clay : C.ink; ctx.fillRect(1100 + i * 40, 520 - o.bars[i] * 300, 28, o.bars[i] * 300); } }
    ctx.restore();
  }

  // ---- contact sheet: a cream page with a 3x2 grid of stills of the next plate crops; one gets selected, zooms
  function contact(ctx, t, t0, cells, sel, zoomAt, drawCell) {
    const zk = eout(inv(zoomAt, zoomAt + 3 / FPS, t), 3);
    ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W(), H());
    const cw = 470, ch = 264, gx = 90, gy = 110, gap = 26;
    cells.forEach((c, i) => {
      const cx = gx + (i % 3) * (cw + gap), cy = gy + Math.floor(i / 3) * (ch + 60);
      const x = i === sel ? lerp(cx, 0, zk) : cx, y = i === sel ? lerp(cy, 0, zk) : cy, w = i === sel ? lerp(cw, W(), zk) : cw, h = i === sel ? lerp(ch, H(), zk) : ch;
      if (i !== sel || zk < 1) { drawCell(ctx, c, x, y, w, h); mono(ctx, 12); ctx.fillStyle = C.ink; if (zk < 0.2) ctx.fillText(`${String(i + 1).padStart(2, '0')} · ${c.cap ?? c.plate}`, cx, cy + ch + 20); }
      if (i === sel && t > t0 + 0.4 && zk < 0.3) { ctx.strokeStyle = C.ink; ctx.lineWidth = 6; ctx.strokeRect(x - 4, y - 4, w + 8, h + 8); }
    });
    if (zk > 0) { const c = cells[sel]; drawCell(ctx, c, lerp(gx + (sel % 3) * (cw + gap), 0, zk), lerp(gy + Math.floor(sel / 3) * (ch + 60), 0, zk), lerp(cw, W(), zk), lerp(ch, H(), zk)); }
    mono(ctx, 12, true); ctx.fillStyle = C.ink; if (zk < 0.2) ctx.fillText('CONTACT SHEET · SELECTS · REVENUE VELOCITY S/S 26', gx, 70);
  }

  // ---- stamp slammed in (accent), exposure pulse veil, scan line, status LED, HUD tick marks
  function pulse(ctx, t, times, o = {}) { times.forEach(tt => { if (t >= tt && t < tt + 2 / FPS) { ctx.fillStyle = o.color ?? 'rgba(241,239,233,0.5)'; ctx.fillRect(0, 0, W(), H()); } }); }
  function scan(ctx, t, t0, o = {}) { // a thin horizontal scan line sweeping down once per bar with a readout
    if (t < t0) return; const bl = RV.bar(1) - RV.bar(0), p = ((t - t0) / bl) % 1, y = (o.y0 ?? 0) + p * ((o.y1 ?? H()) - (o.y0 ?? 0));
    ctx.save(); ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.fillRect(o.x0 ?? 0, y, (o.x1 ?? W()) - (o.x0 ?? 0), 1);
    mono(ctx, 11); ctx.fillStyle = C.white; ctx.fillText(`SCAN ${String(Math.floor(p * 1080)).padStart(4, '0')}`, (o.x1 ?? W()) - 90, y - 4); ctx.restore();
  }
  function led(ctx, x, y, t, o = {}) { const on = Math.floor(RV.beatPos(t) * (o.rate ?? 2)) % 2 === 0; ctx.fillStyle = on ? (o.color ?? C.clay) : 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.arc(x, y, o.r ?? 5, 0, 7); ctx.fill(); if (o.label) { mono(ctx, 11, true); ctx.fillStyle = C.white; ctx.fillText(o.label, x + 12, y + 4); } }
  function callout(ctx, from, to, s, t, t0, o = {}) { // leader line from a point to a label, drawn on
    if (t < t0) return; const k = eout(inv(t0, t0 + 0.2, t)); ctx.save(); ctx.strokeStyle = o.color ?? C.white; ctx.fillStyle = o.color ?? C.white; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(from.x, from.y, 3, 0, 7); ctx.fill(); ctx.beginPath(); ctx.moveTo(from.x, from.y); ctx.lineTo(lerp(from.x, to.x, k), lerp(from.y, to.y, k)); ctx.stroke();
    if (k >= 1) { mono(ctx, o.fs ?? 12, true); ctx.fillText(typed(s, t, t0 + 0.2, 50), to.x + (to.x > from.x ? 6 : -6 - ctx.measureText(s).width), to.y + 4); } ctx.restore();
  }
  // spec-sheet stack at right: one card per word
  function stack(ctx, t, items, o = {}) {
    items.forEach((it, i) => { if (t < it.t) return; const k = eout(inv(it.t, it.t + 4 / FPS, t)), y = (o.y ?? 170) + i * 64;
      ctx.save(); ctx.globalAlpha = k; ctx.translate((1 - k) * 30, 0); ctx.fillStyle = i === items.filter(x => t >= x.t).length - 1 ? C.clay : C.paper; ctx.fillRect(o.x ?? 1480, y, 320, 54);
      ctx.fillStyle = C.ink; KIN.font(ctx, 28, 'cond'); ctx.fillText(it.s, (o.x ?? 1480) + 14, y + 36); mono(ctx, 10); ctx.fillText(it.sub ?? '', (o.x ?? 1480) + 200, y + 34); ctx.restore(); });
  }

  // ---- outro: the revenue-sharing feed. Every purchase in life shares a slice back; the feed accelerates to a blur.
  const ITEMS = [['COFFEE', 'Oat latte', 4.8], ['CLOTHES', 'Denim jacket', 89], ['eSIM', 'eSIM · 10 GB · roaming', 12], ['INTERNET', 'Home fiber · 1 month', 39],
    ['RENT', 'Rent · October', 1450], ['PHONE BILL', 'Phone bill', 29], ['NEW PHONE', 'New phone', 999], ['COSMETICS', 'Lip serum', 24],
    ['GROCERIES', 'Groceries', 63.4], ['SNEAKERS', 'Runners', 120], ['HEADPHONES', 'Headphones', 199], ['TAXI', 'Robotaxi ride', 18.5],
    ['FLIGHT', 'Flight LIS → TYO', 640], ['COFFEE', 'Espresso', 3.2], ['CLOTHES', 'White shirt', 65], ['GROCERIES', 'Farmers market', 27]];
  const CITY = ['TOKYO', 'LISBON', 'DUBAI', 'NEW YORK', 'BERLIN', 'SEOUL', 'LAGOS', 'MEXICO CITY', 'PARIS', 'SINGAPORE'];
  const SHARE = 0.04;
  function feed(ctx, t, t0, t1, o = {}) {
    if (t < t0) return;
    const dur = t1 - t0, tau = Math.max(0, t - t0), r0 = o.r0 ?? 1.6, r1 = o.r1 ?? 80, k = Math.log(r1 / r0) / dur;
    const N = r0 * (Math.exp(k * tau) - 1) / k, rate = r0 * Math.exp(k * tau), n = Math.floor(N);
    const item = i => { const it = ITEMS[Math.floor(hash(i * 7.31 + 1) * ITEMS.length)], price = it[2] * (0.85 + 0.3 * hash(i * 2.13 + 5));
      return { cat: it[0], name: it[1], price, share: price * SHARE, city: CITY[Math.floor(hash(i * 3.7 + 2) * CITY.length)] }; };
    const X = 110, Y = 150, Wd = 1060, rh = 58, rows = 12;
    ctx.save();
    ctx.fillStyle = 'rgba(10,12,14,0.9)'; ctx.fillRect(X - 20, Y - 40, Wd + 40, rows * rh + 110);
    mono(ctx, 14, true); ctx.fillStyle = C.white; ctx.fillText('REVENUE SHARING · LIVE FEED', X, Y - 8);
    ctx.fillStyle = C.clay; ctx.beginPath(); ctx.arc(X + Wd - 6, Y - 13, 5, 0, 7); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.5)'; mono(ctx, 12, true); ctx.fillText('PURCHASE', X, Y + 26); ctx.fillText('PRICE', X + 700, Y + 26); ctx.fillText('SHARED BACK', X + 880, Y + 26);
    ctx.fillRect(X, Y + 36, Wd, 1);
    ctx.beginPath(); ctx.rect(X - 20, Y + 40, Wd + 40, rows * rh); ctx.clip();
    const slide = (N - n) * rh, blur = clamp((rate - 12) / 50);
    for (let r = -1; r < rows; r++) {
      const i = n - r; if (i < 0) continue; const q = item(i), y = Y + 40 + r * rh + slide;
      ctx.globalAlpha = (1 - r / (rows + 1)) * (1 - 0.55 * blur);
      if (r === 0) { ctx.fillStyle = C.clay; ctx.fillRect(X - 20, y + 6, 5, rh - 12); }
      KIN.font(ctx, 30, 'cond'); ctx.fillStyle = C.white; ctx.fillText(q.name.toUpperCase(), X, y + 40);
      mono(ctx, 12, true); ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillText(`${q.cat} · ${q.city} · #${String(48213 + i).padStart(6, '0')}`, X + 330, y + 36);
      KIN.font(ctx, 30, 'monom'); ctx.fillStyle = C.white; ctx.fillText(`$${RV.fmt(q.price, 2)}`, X + 700, y + 40);
      ctx.fillStyle = C.clay; ctx.fillText(`+$${RV.fmt(q.share, 2)}`, X + 880, y + 40);
    }
    ctx.restore();
    // right column: totals that run away as the feed accelerates
    const avg = ITEMS.reduce((a, it) => a + it[2], 0) / ITEMS.length * SHARE, RX = 1250;
    ctx.save(); ctx.fillStyle = 'rgba(241,239,233,0.94)'; ctx.fillRect(RX - 20, 110, 590, 830);
    ctx.fillStyle = C.ink; mono(ctx, 13, true); ctx.fillText('SHARED BACK · THIS MINUTE', RX, 150); ctx.fillRect(RX, 162, 550, 1.5);
    KIN.font(ctx, 118, 'cond'); ctx.fillText(`$${RV.fmt(N * avg, 2)}`, RX, 282);
    mono(ctx, 13, true); ctx.fillText('PURCHASES', RX, 340); ctx.fillText('PER SECOND', RX + 280, 340);
    KIN.font(ctx, 64, 'cond'); ctx.fillText(RV.fmt(n), RX, 408); ctx.fillStyle = C.clay; ctx.fillText(`${rate.toFixed(1)}`, RX + 280, 408);
    // rate curve so far
    ctx.fillStyle = C.ink; mono(ctx, 12, true); ctx.fillText('FIG. 6 · PURCHASES / SEC', RX, 460); ctx.fillRect(RX, 470, 550, 1);
    ctx.strokeStyle = C.clay; ctx.lineWidth = 3; ctx.beginPath();
    for (let j = 0; j <= 60; j++) { const tt = tau * j / 60, v = r0 * Math.exp(k * tt) / r1; const x = RX + 550 * (tt / dur), y = 650 - 160 * v; j ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
    // where the shares come from: bars by category, growing with the count
    ctx.fillStyle = C.ink; mono(ctx, 12, true); ctx.fillText('SHARED BY CATEGORY', RX, 700); ctx.fillRect(RX, 710, 550, 1);
    const cats = ['RENT', 'NEW PHONE', 'FLIGHT', 'CLOTHES', 'GROCERIES', 'COFFEE', 'eSIM', 'INTERNET'];
    cats.forEach((c, j) => { const it = ITEMS.filter(q => q[0] === c), val = it.reduce((a, q) => a + q[2], 0) * SHARE * N / ITEMS.length;
      const w = Math.min(420, 420 * Math.log10(1 + val) / 4.2); const y = 735 + j * 24;
      mono(ctx, 11, true); ctx.fillStyle = C.ink; ctx.fillText(c, RX, y + 12); ctx.fillStyle = j ? C.ink : C.clay; ctx.fillRect(RX + 120, y + 2, w, 12); });
    ctx.restore();
  }

  return { feed, obj, box, swarm, lookCard, hit, mast, cover, subChip, fig, flapCard, iris, terminal, contact, pulse, scan, led, callout, stack, typed };
})();
