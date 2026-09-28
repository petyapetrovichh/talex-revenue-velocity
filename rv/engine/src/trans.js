// Transitions between two rendered shots A (outgoing) and B (incoming), both full-frame canvases.
// k runs 0..1 across the transition window; the cut point is k = 0.5 unless noted.
'use strict';
RV.TRANS = (() => {
  const { C, clamp, lerp, inv, eout, ein, hash } = RV;
  const W = () => RV.W, H = () => RV.H;
  const types = {
    // hard cut + white flash on the cut
    flash(ctx, A, B, k) { ctx.drawImage(k < 0.5 ? A : B, 0, 0, W(), H()); if (k >= 0.5) { ctx.fillStyle = `rgba(255,255,255,${Math.pow(1 - (k - 0.5) * 2, 2)})`; ctx.fillRect(0, 0, W(), H()); } },
    // clay flash (accent)
    clayflash(ctx, A, B, k) { ctx.drawImage(k < 0.5 ? A : B, 0, 0, W(), H()); if (k >= 0.5) { ctx.globalAlpha = Math.pow(1 - (k - 0.5) * 2, 2); ctx.fillStyle = C.clay; ctx.fillRect(0, 0, W(), H()); ctx.globalAlpha = 1; } },
    // whip pan: A exits left with a streak, B enters from the right
    whip(ctx, A, B, k, o = {}) {
      const dir = o.dir ?? -1, e = RV.eio(k), off = e * W() * dir;
      for (let i = 0; i < 6; i++) { const s = i * 22 * Math.sin(Math.PI * k); ctx.globalAlpha = i ? 0.22 : 1; ctx.drawImage(A, off + s * dir, 0, W(), H()); ctx.drawImage(B, off - dir * W() + s * dir, 0, W(), H()); }
      ctx.globalAlpha = 1;
    },
    // glitch slices: horizontal bands swap from A to B in hashed order around the cut
    slices(ctx, A, B, k, o = {}) {
      const n = o.n ?? 18, h = H() / n; ctx.drawImage(A, 0, 0, W(), H());
      for (let i = 0; i < n; i++) {
        const th = 0.2 + 0.6 * hash(i * 3.1 + (o.seed ?? 0));
        if (k > th) { const sh = (k < th + 0.08 ? (hash(i + 9) - 0.5) * 120 : 0); ctx.drawImage(B, 0, i * h * B.height / H(), B.width, h * B.height / H(), sh, i * h, W(), h + 1); }
        else if (k > th - 0.1) { const sh = (hash(i + 5) - 0.5) * 160; ctx.drawImage(A, 0, i * h * A.height / H(), A.width, h * A.height / H(), sh, i * h, W(), h + 1); }
      }
    },
    // split-flap wipe: a grid of cells flip from A to B, left to right
    flapwipe(ctx, A, B, k, o = {}) {
      const cols = o.cols ?? 16, rows = o.rows ?? 9, cw = W() / cols, ch = H() / rows, sx = A.width / W();
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        const d = (i / cols) * 0.6 + hash(i * 13 + j) * 0.2, f = clamp((k - d) / 0.2);
        const src = f < 0.5 ? A : B, sy = f < 0.5 ? 1 - f * 2 : (f - 0.5) * 2;
        ctx.drawImage(src, i * cw * sx, j * ch * sx, cw * sx, ch * sx, i * cw, j * ch + ch * (1 - sy) / 2, cw + 0.5, ch * sy + 0.5);
      }
    },
    // push through a box: A scales up into the focus box, B grows out of it
    zoom(ctx, A, B, k, o = {}) {
      const b = o.box ?? [0.45, 0.4, 0.1, 0.1], cx = (b[0] + b[2] / 2) * W(), cy = (b[1] + b[3] / 2) * H();
      if (k < 0.5) { const s = lerp(1, 1 / b[2], ein(k * 2, 3)); ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s); ctx.translate(-cx, -cy); ctx.drawImage(A, 0, 0, W(), H()); ctx.restore(); }
      else { const e = eout((k - 0.5) * 2, 3), x = lerp(b[0] * W(), 0, e), y = lerp(b[1] * H(), 0, e), w = lerp(b[2] * W(), W(), e), h = lerp(b[2] * W() * 9 / 16, H(), e);
        ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W(), H()); ctx.drawImage(B, x, y, w, h); ctx.strokeStyle = C.clay; ctx.lineWidth = 3 * (1 - e); ctx.strokeRect(x, y, w, h); }
    },
    // CRT power-off of A, then B
    crt(ctx, A, B, k) {
      if (k >= 0.62) { ctx.drawImage(B, 0, 0, W(), H()); return; }
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W(), H());
      const a = clamp(k / 0.4), sy = lerp(1, 0.004, ein(a, 2)), sx = k < 0.4 ? 1 : lerp(1, 0, (k - 0.4) / 0.22);
      ctx.save(); ctx.translate(W() / 2, H() / 2); ctx.scale(sx, sy); ctx.drawImage(A, -W() / 2, -H() / 2, W(), H()); ctx.restore();
      ctx.fillStyle = `rgba(255,255,255,${a})`; ctx.fillRect(W() / 2 - W() * sx / 2, H() / 2 - 2, W() * sx, 4);
    },
    // paper wipe: a paper-coloured band with a tag edge sweeps across
    wipe(ctx, A, B, k, o = {}) {
      const e = RV.eio(k), x = lerp(-0.3, 1.3, e) * W(), band = W() * 0.22;
      ctx.drawImage(A, 0, 0, W(), H());
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, Math.max(0, x - band / 2), H()); ctx.clip(); ctx.drawImage(B, 0, 0, W(), H()); ctx.restore();
      ctx.fillStyle = o.color ?? C.paper; ctx.fillRect(x - band / 2, 0, band, H());
      ctx.fillStyle = C.clay; ctx.fillRect(x + band / 2 - 8, 0, 8, H());
    },
    // dip to black
    fade(ctx, A, B, k) { ctx.drawImage(k < 0.5 ? A : B, 0, 0, W(), H()); ctx.fillStyle = `rgba(0,0,0,${1 - Math.abs(k - 0.5) * 2})`; ctx.fillRect(0, 0, W(), H()); },
    cross(ctx, A, B, k) { ctx.drawImage(A, 0, 0, W(), H()); ctx.globalAlpha = RV.smooth(k); ctx.drawImage(B, 0, 0, W(), H()); ctx.globalAlpha = 1; },
  };
  return { types };
})();
