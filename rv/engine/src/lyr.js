// Lyric layer (v5). One place decides how every line of the song reaches the screen, drawn over the shot and under
// the chrome, so text sits in the same place across cuts:
//   sub    - the original's subtitle: bottom-left, the phrase builds word by word on a chip, always legible
//   phrase - a big lockup in the empty field beside her: the words of the phrase build and stay (no one-word strobe)
//   stack  - the phrase stacked one word per row (WE'RE / SO / BACK!)
//   mark   - on screen elsewhere (baked into the plate, knock-out type, a hidden walk count): counted, not drawn
// No hit frames, no flashes: a word just appears on its sung time. Colour follows the picture under the text
// (white on dark, ink on light) with a soft halo, so a line is never dark on dark.
'use strict';
RV.LYR = (() => {
  const { C, KIN } = RV;
  const KEY = /^(agi|revenue|back|shared|earning|real|deal|esim|ownership|paid)$/i;
  const L = { mode: 'phrase', x: 110, y: 330, size: 116, maxW: 640 };
  const R = { mode: 'phrase', x: 1810, y: 330, size: 124, maxW: 700, align: 'right' };
  const CFG = {
    i1: Object.assign({}, L, { y: 300, size: 124 }), i2: { mode: 'mark' }, i3: Object.assign({}, L, { y: 760, size: 132, maxW: 600 }),
    iw: { mode: 'mark' },
    p1: { mode: 'sub' }, p2: Object.assign({}, L, { y: 620, size: 190 }),
    c1: Object.assign({}, L, { y: 300 }), c2: Object.assign({}, L, { y: 300 }), c3: Object.assign({}, L, { y: 700, maxW: 1000, size: 110 }),
    c4: Object.assign({}, L, { y: 250, maxW: 560, size: 118 }),
    c5a: { parts: [{ to: 2, mode: 'sub' }, Object.assign({}, R, { from: 3, mode: 'stack', y: 330, size: 210 })] },
    c5b: { parts: [{ to: 2, mode: 'sub' }, Object.assign({}, R, { from: 3, mode: 'stack', y: 330, size: 210 })] },
    b4: { mode: 'sub' },
    f1: { mode: 'phrase', x: 1790, y: 250, size: 88, maxW: 380, align: 'right' },
    f2: Object.assign({}, L, { y: 300 }), f3: Object.assign({}, L, { y: 300 }), f4: Object.assign({}, L, { y: 300, maxW: 700 }),
    o1: { mode: 'mark' }, o2: Object.assign({}, R, { y: 260, size: 92, maxW: 560 }),
  };
  const cfg = (id, sh) => Object.assign({ mode: 'sub' }, CFG[id] || {}, (sh && sh.lyr && sh.lyr[id]) || {});

  // mean luma (0..1) of a canvas region, in canvas units (the context carries the render scale)
  function luma(ctx, x, y, w, h) {
    const s = ctx.getTransform().a, X = Math.max(0, Math.floor(x * s)), Y = Math.max(0, Math.floor(y * s));
    const Wd = Math.max(1, Math.min(ctx.canvas.width - X, Math.floor(w * s))), Hd = Math.max(1, Math.min(ctx.canvas.height - Y, Math.floor(h * s)));
    const d = ctx.getImageData(X, Y, Wd, Hd).data, step = 4 * Math.max(1, Math.floor(Wd * Hd / 1500));
    let sum = 0, n = 0; for (let i = 0; i < d.length; i += step) { sum += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]; n++; }
    return n ? sum / n / 255 : 0;
  }
  const upper = (s, o) => (o.upper === false ? s : s.toUpperCase());

  // lay a token range out in rows; returns [{i, s, w, x, row}]
  function layout(ctx, toks, o, perRow) {
    const sp = o.size * 0.24, rows = [[]]; let rw = 0;
    toks.forEach(q => { const w = ctx.measureText(q.s).width;
      if (perRow || (rw + w > o.maxW && rows[rows.length - 1].length)) { if (rows[rows.length - 1].length) rows.push([]); rw = 0; }
      rows[rows.length - 1].push(Object.assign(q, { w })); rw += w + sp; });
    rows.forEach((r, ri) => { const tw = r.reduce((a, q) => a + q.w + sp, -sp);
      let x = o.align === 'center' ? o.x - tw / 2 : o.align === 'right' ? o.x - tw : o.x;
      r.forEach(q => { q.x = x; q.row = ri; x += q.w + sp; }); });
    return rows;
  }

  function phrase(ctx, id, t, o, from, to, until, stack) {
    const k = RV.lines[id].tokens, toks = [];
    for (let i = from; i <= to; i++) {   // a dash rides with the word before it, so it never starts or fills a row
      if (/^[—–-]$/.test(k[i].w) && toks.length) toks[toks.length - 1].s += ' —';
      else toks.push({ i, s: upper(k[i].w, o), tk: k[i] });
    }
    KIN.font(ctx, o.size, 'cond');
    const rows = layout(ctx, toks, o, stack), lh = o.size * (stack ? 0.9 : 1.0), top = o.y - o.size * 0.82;
    const wMax = Math.max(...rows.map(r => r.reduce((a, q) => a + q.w + o.size * 0.24, -o.size * 0.24)));
    const x0 = o.align === 'center' ? o.x - wMax / 2 : o.align === 'right' ? o.x - wMax : o.x, hB = rows.length * lh;
    const lum = luma(ctx, x0, top, wMax, hB), lit = lum > 0.56;
    const fg = lit ? C.ink : C.white, halo = lit ? 'rgba(241,239,233,0.75)' : 'rgba(8,10,12,0.6)';
    // accent only on a keyword whose own patch of picture is dark enough for clay to read
    toks.forEach(q => { q.acc = KEY.test(q.tk.w.replace(/[^\w]/g, '')) && luma(ctx, q.x, o.y + q.row * lh - o.size * 0.8, q.w, o.size * 0.9) < 0.36; });
    const out = 1 - RV.inv(until - 0.15, until, t);
    for (let i = from; i <= to; i++) if (t >= k[i].t0) KIN.mark(id, i);
    if (t < k[from].t0) return;
    ctx.save();
    // a soft scrim when the picture under the lockup is busy/mid-tone: static, feathered, never a flash
    const need = lit ? RV.clamp((0.82 - lum) / 0.2) : RV.clamp((lum - 0.2) / 0.25);
    if (need > 0) {
      const cx = x0 + wMax / 2, cy = top + hB / 2, rx = wMax / 2 + o.size * 1.1, ry = hB / 2 + o.size * 0.9;
      ctx.save(); ctx.translate(cx, cy); ctx.scale(1, ry / rx);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx), col = lit ? '241,239,233' : '8,10,12', a = 0.5 * need * out;
      g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(0.55, `rgba(${col},${a * 0.75})`); g.addColorStop(1, `rgba(${col},0)`);
      ctx.fillStyle = g; ctx.fillRect(-rx, -rx, rx * 2, rx * 2); ctx.restore();
    }
    ctx.textBaseline = 'alphabetic'; ctx.shadowColor = halo; ctx.shadowBlur = o.size * 0.22;
    rows.forEach(r => r.forEach(q => {
      if (t < q.tk.t0) return;
      const a = RV.eout(RV.inv(q.tk.t0, q.tk.t0 + 0.08, t));
      ctx.globalAlpha = a * out; ctx.fillStyle = q.acc ? C.clay : fg;
      ctx.fillText(q.s, q.x, o.y + q.row * lh + (1 - a) * 6);
    }));
    ctx.restore();
  }

  function sub(ctx, id, t, from, to, until) {
    const k = RV.lines[id].tokens; let n = -1;
    for (let i = from; i <= to; i++) if (t >= k[i].t0) { n = i; KIN.mark(id, i); }
    if (n < 0) return;
    KIN.font(ctx, 40, 'sans', '500'); const sp = 11, x0 = 110, y = 952;
    const ws = []; for (let i = from; i <= to; i++) ws.push(ctx.measureText(k[i].w).width);
    const full = ws.reduce((a, w) => a + w + sp, -sp), shown = ws.slice(0, n - from + 1).reduce((a, w) => a + w + sp, -sp);
    const lit = luma(ctx, x0 - 16, y - 40, full + 32, 56) > 0.66, out = 1 - RV.inv(until - 0.12, until, t);
    ctx.save(); ctx.globalAlpha = out;
    ctx.fillStyle = lit ? 'rgba(241,239,233,0.88)' : 'rgba(10,12,14,0.62)'; ctx.fillRect(x0 - 16, y - 42, shown + 32, 57);
    let x = x0; for (let i = from; i <= n; i++) { ctx.fillStyle = lit ? C.ink : C.white; ctx.fillText(k[i].w, x, y); x += ws[i - from] + sp; }
    ctx.restore();
  }

  function draw(ctx, t, sh) {
    const T = RV.T.lines;
    T.forEach((l, li) => {
      const k = l.tokens, next = T[li + 1], c = cfg(l.id, sh);
      const parts = c.parts || [Object.assign({}, c, { from: 0, to: k.length - 1 })];
      parts.forEach(p0 => {
        const p = Object.assign({ mode: 'phrase' }, p0), from = p.from ?? 0, to = p.to ?? k.length - 1;
        const hold = p.mode === 'sub' ? 0.5 : 0.9, nextT = to < k.length - 1 ? k[to + 1].t0 - 0.05 : next ? next.tokens[0].t0 - 0.05 : Infinity;
        const until = Math.min(k[to].t1 + hold, p.mode === 'sub' ? nextT : Math.max(k[to].t1 + 0.2, nextT));
        if (t < k[from].t0 || t > until) return;
        if (p.mode === 'mark') { for (let i = from; i <= to; i++) if (t >= k[i].t0) KIN.mark(l.id, i); return; }
        if (p.mode === 'sub') sub(ctx, l.id, t, from, to, until);
        else phrase(ctx, l.id, t, p, from, to, until, p.mode === 'stack');
      });
    });
  }
  return { draw, luma, CFG };
})();
