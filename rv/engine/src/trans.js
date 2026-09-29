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
    // RGB split glitch: channels of A and B offset, bands jump, cut at the middle
    rgb(ctx, A, B, k, o = {}) {
      const src = k < 0.5 ? A : B, amt = Math.sin(Math.PI * k) * (o.amt ?? 60);
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W(), H());
      ctx.globalCompositeOperation = 'lighter';
      [['#f00', -amt], ['#0f0', 0], ['#00f', amt]].forEach(([c, dx]) => {
        const [cv, x] = RV.GFX.scratch('rgb' + c, src.width, src.height); x.drawImage(src, 0, 0);
        x.globalCompositeOperation = 'multiply'; x.fillStyle = c; x.fillRect(0, 0, cv.width, cv.height); x.globalCompositeOperation = 'source-over';
        ctx.drawImage(cv, dx, 0, W(), H());
      });
      ctx.globalCompositeOperation = 'source-over';
      const n = 7; for (let i = 0; i < n; i++) { if (hash(i + Math.floor(k * 9)) > 0.55) continue; const y = hash(i * 3.3 + Math.floor(k * 9)) * H(), h = 12 + hash(i) * 60; ctx.drawImage(src, 0, y * src.height / H(), src.width, h * src.height / H(), (hash(i + 7) - 0.5) * 140 * Math.sin(Math.PI * k), y, W(), h); }
    },
    // strobe: alternating white / black / frames around the cut
    strobe(ctx, A, B, k) {
      const f = Math.floor(k * 8); ctx.drawImage(k < 0.5 ? A : B, 0, 0, W(), H());
      if (f % 2 === 0 && f > 1 && f < 7) { ctx.fillStyle = f % 4 === 0 ? '#fff' : '#000'; ctx.globalAlpha = 0.85; ctx.fillRect(0, 0, W(), H()); ctx.globalAlpha = 1; }
    },
    // mirror flip: A folds on the vertical axis, B unfolds
    flip(ctx, A, B, k) {
      const src = k < 0.5 ? A : B, s = Math.abs(Math.cos(Math.PI * k));
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W(), H());
      ctx.save(); ctx.translate(W() / 2, 0); ctx.scale(k < 0.5 ? s : -s, 1); ctx.drawImage(src, -W() / 2, 0, W(), H()); ctx.restore();
    },
    // spin: A rotates and scales out, B rotates in
    spin(ctx, A, B, k, o = {}) {
      const src = k < 0.5 ? A : B, e = k < 0.5 ? RV.ein(k * 2, 3) : 1 - RV.eout((k - 0.5) * 2, 3);
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W(), H());
      ctx.save(); ctx.translate(W() / 2, H() / 2); ctx.rotate((o.dir ?? 1) * e * Math.PI * 0.5); ctx.scale(1 + e * 1.5, 1 + e * 1.5); ctx.drawImage(src, -W() / 2, -H() / 2, W(), H()); ctx.restore();
    },
    // spark wipe: the 8-point hair-clip star grows from a point; B is revealed inside the rays
    spark(ctx, A, B, k, o = {}) {
      ctx.drawImage(A, 0, 0, W(), H());
      const cx = (o.cx ?? 0.5) * W(), cy = (o.cy ?? 0.5) * H(), R = Math.hypot(W(), H()) * RV.ein(k, 2) * 1.1, wr = R * 0.22;
      ctx.save(); ctx.beginPath();
      for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4 + (o.rot ?? 0.2); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a - 0.13) * R, cy + Math.sin(a - 0.13) * R); ctx.lineTo(cx + Math.cos(a) * R * 1.05, cy + Math.sin(a) * R * 1.05); ctx.lineTo(cx + Math.cos(a + 0.13) * R, cy + Math.sin(a + 0.13) * R); ctx.closePath(); }
      ctx.arc(cx, cy, wr, 0, 7); ctx.clip(); ctx.drawImage(B, 0, 0, W(), H());
      ctx.restore(); if (k > 0.85) { ctx.globalAlpha = (k - 0.85) / 0.15; ctx.drawImage(B, 0, 0, W(), H()); ctx.globalAlpha = 1; }
    },
    // iris wipe: a circle opens from a point (a halo, an eye)
    iris(ctx, A, B, k, o = {}) {
      ctx.drawImage(A, 0, 0, W(), H());
      const cx = (o.cx ?? 0.5) * W(), cy = (o.cy ?? 0.5) * H(), r = Math.hypot(W(), H()) * RV.eio(k);
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.clip(); ctx.drawImage(B, 0, 0, W(), H()); ctx.restore();
      ctx.strokeStyle = C.white; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.stroke();
    },
    // 3D card flip around the vertical axis
    cardflip(ctx, A, B, k) {
      ctx.fillStyle = '#0d1013'; ctx.fillRect(0, 0, W(), H());
      const src = k < 0.5 ? A : B, s = Math.abs(Math.cos(Math.PI * k)), sk = Math.sin(Math.PI * k) * 0.12;
      ctx.save(); ctx.translate(W() / 2, H() / 2); ctx.transform(s, (k < 0.5 ? 1 : -1) * sk, 0, 1, 0, 0); ctx.scale(0.92 + 0.08 * s, 0.92 + 0.08 * s); ctx.drawImage(src, -W() / 2, -H() / 2, W(), H()); ctx.restore();
    },
    // 1-bit threshold flash: A goes to hard black/white, cut, B comes back from 1-bit
    threshold(ctx, A, B, k) {
      const src = k < 0.5 ? A : B, amt = 1 - Math.abs(k - 0.5) * 2;
      ctx.drawImage(src, 0, 0, W(), H());
      ctx.save(); ctx.globalAlpha = amt; ctx.filter = 'grayscale(1) contrast(12) brightness(1.1)'; ctx.drawImage(src, 0, 0, W(), H()); ctx.restore();
    },
    // halftone-dot dissolve: B appears through a growing dot screen
    dots(ctx, A, B, k, o = {}) {
      ctx.drawImage(A, 0, 0, W(), H()); const cell = o.cell ?? 28, rmax = cell * 0.75, r = rmax * RV.eio(k);
      ctx.save(); ctx.beginPath();
      for (let y = 0; y < H() + cell; y += cell) for (let x = (Math.floor(y / cell) % 2) * cell / 2; x < W() + cell; x += cell) { ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, 7); }
      ctx.clip(); ctx.drawImage(B, 0, 0, W(), H()); ctx.restore();
    },
    // page peel: A curls away from the bottom-right corner showing B underneath
    peel(ctx, A, B, k) {
      ctx.drawImage(B, 0, 0, W(), H()); const e = RV.eio(k), d = (W() + H()) * 1.1 * e;
      ctx.save(); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(W(), 0); ctx.lineTo(W(), Math.max(0, H() - d)); ctx.lineTo(Math.max(0, W() - d), H()); ctx.lineTo(0, H()); ctx.closePath(); ctx.clip(); ctx.drawImage(A, 0, 0, W(), H()); ctx.restore();
      ctx.save(); ctx.fillStyle = C.paper; ctx.beginPath(); ctx.moveTo(W(), Math.max(0, H() - d)); ctx.lineTo(Math.max(0, W() - d), H()); ctx.lineTo(W() - d * 0.55, H() - d * 0.55); ctx.closePath(); ctx.fill(); ctx.restore();
    },
    // torn paper: a ragged cream edge sweeps across
    torn(ctx, A, B, k) {
      const x = RV.lerp(-0.1, 1.15, RV.eio(k)) * W(); ctx.drawImage(A, 0, 0, W(), H());
      ctx.save(); ctx.beginPath(); ctx.moveTo(0, 0); for (let y = 0; y <= H(); y += 24) ctx.lineTo(x + (hash(y * 0.37) - 0.5) * 60, y); ctx.lineTo(0, H()); ctx.closePath(); ctx.clip(); ctx.drawImage(B, 0, 0, W(), H()); ctx.restore();
      ctx.fillStyle = C.paper; ctx.beginPath(); for (let y = 0; y <= H(); y += 24) ctx.lineTo(x + (hash(y * 0.37) - 0.5) * 60, y); for (let y = H(); y >= 0; y -= 24) ctx.lineTo(x + 26 + (hash(y * 0.91) - 0.5) * 40, y); ctx.closePath(); ctx.fill();
    },
    // vertical bars wipe: bars close over A on the beat, open on B
    bars(ctx, A, B, k, o = {}) {
      const n = o.n ?? 8, bw = W() / n; ctx.drawImage(k < 0.5 ? A : B, 0, 0, W(), H());
      const c = k < 0.5 ? k * 2 : (1 - k) * 2; ctx.fillStyle = o.color ?? C.ink;
      for (let i = 0; i < n; i++) { const d = clamp(c * 1.4 - (i % 2 ? 0.2 : 0)); ctx.fillRect(i * bw, 0, bw * d, H()); }
    },
    // dither band: a band of 1-bit dither sweeps down, the picture changes under it
    ditherband(ctx, A, B, k) {
      const y = RV.lerp(-0.2, 1.2, k) * H(), bh = H() * 0.22;
      ctx.drawImage(A, 0, 0, W(), H()); ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W(), Math.max(0, y)); ctx.clip(); ctx.drawImage(B, 0, 0, W(), H()); ctx.restore();
      ctx.fillStyle = C.ink; for (let yy = y - bh / 2; yy < y + bh / 2; yy += 6) for (let xx = 0; xx < W(); xx += 6) if (hash(xx * 0.13 + yy * 0.71 + Math.floor(k * 12)) > 0.5) ctx.fillRect(xx, yy, 6, 6);
    },
    cross(ctx, A, B, k) { ctx.drawImage(A, 0, 0, W(), H()); ctx.globalAlpha = RV.smooth(k); ctx.drawImage(B, 0, 0, W(), H()); ctx.globalAlpha = 1; },
  };
  return { types };
})();
