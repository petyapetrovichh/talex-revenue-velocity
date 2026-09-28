// Kinetic lyrics. Every token appears on its own start time (never early) and is marked shown,
// so render.py can verify that every word of the song reached the screen.
'use strict';
RV.KIN = (() => {
  const shown = new Set();
  const F = { cond: 'Cond', condm: 'CondM', sans: 'Sans', mono: 'Mono', monom: 'MonoM' };
  const font = (ctx, px, fam = 'cond', wt = '') => { ctx.font = `${wt} ${Math.round(px)}px ${F[fam] || fam}`.trim(); };
  const on = (tk, t) => t >= tk.t0;
  const mark = (id, i) => shown.add(id + ':' + i);
  // draw text with tracking (letter-spacing in px)
  function track(ctx, s, x, y, sp) {
    if (!sp) { ctx.fillText(s, x, y); return ctx.measureText(s).width; }
    let w = 0; for (const ch of s) { ctx.fillText(ch, x + w, y); w += ctx.measureText(ch).width + sp; } return w - sp;
  }
  function width(ctx, s, sp = 0) { return sp ? [...s].reduce((a, ch) => a + ctx.measureText(ch).width + sp, -sp) : ctx.measureText(s).width; }
  const clean = w => w.replace(/[—]/g, '—');

  // Subtitle: a line that builds word by word. o: {x, y, size, fam, color, accent, hi:[words], align, maxW, hold, bg}
  function subtitle(ctx, id, t, o = {}) {
    const L = RV.lines[id]; if (!L) return;
    const k = L.tokens, t0 = k[0].t0, t1 = k[k.length - 1].t1, hold = o.hold ?? 0.6;
    if (t < t0 || t > (o.until ?? t1 + hold) + 0.25) return;
    const out = 1 - RV.inv((o.until ?? t1 + hold), (o.until ?? t1 + hold) + 0.25, t);
    const size = o.size ?? 44; font(ctx, size, o.fam ?? 'sans', o.wt ?? '500');
    const sp = size * 0.26, maxW = o.maxW ?? 1500;
    // layout into rows
    const rows = [[]]; let rw = 0;
    k.forEach((tk, i) => { const w = ctx.measureText(clean(tk.w)).width; if (rw + w > maxW && rows[rows.length - 1].length) { rows.push([]); rw = 0; } rows[rows.length - 1].push({ tk, i, w }); rw += w + sp; });
    const lh = size * 1.18;
    ctx.save(); ctx.globalAlpha *= out; ctx.textBaseline = 'alphabetic';
    rows.forEach((r, ri) => {
      const tw = r.reduce((a, q) => a + q.w + sp, -sp);
      let x = o.align === 'center' ? (o.x ?? 960) - tw / 2 : o.align === 'right' ? (o.x ?? 960) - tw : (o.x ?? 120);
      const y = (o.y ?? 960) + ri * lh;
      if (o.bg) { ctx.fillStyle = o.bg; }
      r.forEach(q => {
        if (on(q.tk, t)) {
          const a = RV.eout(RV.inv(q.tk.t0, q.tk.t0 + 0.09, t));
          const cur = t < q.tk.t1 + 0.05;
          const hi = (o.hi || []).some(h => q.tk.w.toLowerCase().includes(h.toLowerCase()));
          if (o.bg) { ctx.globalAlpha = out; ctx.fillStyle = o.bg; ctx.fillRect(x - 8, y - size * 0.86, q.w + 16, size * 1.12); }
          ctx.globalAlpha = out * a;
          ctx.fillStyle = hi ? (o.accent ?? RV.C.clay) : (o.color ?? RV.C.white);
          ctx.fillText(clean(q.tk.w), x, y + (1 - a) * size * 0.25);
          if (cur && o.underline !== false) { ctx.fillStyle = o.accent ?? RV.C.clay; ctx.fillRect(x, y + size * 0.14, q.w * RV.eout(RV.inv(q.tk.t0, q.tk.t1, t)), Math.max(2, size * 0.06)); }
          mark(id, q.i);
        }
        x += q.w + sp;
      });
    });
    ctx.restore();
  }

  // Masthead: one word at a time, huge, replacing the previous (strobe) or accumulating (stack).
  // o: {x, y, size, fam, color, accent, hi, stack, align, upper, lh, until, scaleIn}
  function masthead(ctx, id, t, o = {}) {
    const L = RV.lines[id]; if (!L) return;
    const k = L.tokens, until = o.until ?? k[k.length - 1].t1 + 0.5;
    if (t < k[0].t0 || t > until) return;
    const size = o.size ?? 220; font(ctx, size, o.fam ?? 'cond', o.wt ?? '');
    ctx.save(); ctx.textBaseline = 'alphabetic';
    const fadeOut = 1 - RV.inv(until - 0.12, until, t);
    let cur = -1; k.forEach((tk, i) => { if (on(tk, t)) cur = i; });
    const draw = (i, y, alpha) => {
      const tk = k[i], s = o.upper === false ? tk.w : tk.w.toUpperCase();
      const w = width(ctx, s, o.sp ?? 0);
      const x = o.align === 'center' ? (o.x ?? 960) - w / 2 : o.align === 'right' ? (o.x ?? 960) - w : (o.x ?? 120);
      const hi = (o.hi || []).some(h => tk.w.toLowerCase().includes(h.toLowerCase()));
      const pop = RV.eout(RV.inv(tk.t0, tk.t0 + 0.08, t));
      ctx.globalAlpha = alpha * fadeOut;
      ctx.fillStyle = hi ? (o.accent ?? RV.C.clay) : (o.color ?? RV.C.white);
      if (o.scaleIn) { ctx.save(); ctx.translate(x + w / 2, y); ctx.scale(1.12 - 0.12 * pop, 1.12 - 0.12 * pop); track(ctx, s, -w / 2, 0, o.sp ?? 0); ctx.restore(); }
      else track(ctx, s, x, y + (1 - pop) * size * 0.12, o.sp ?? 0);
      mark(id, i);
    };
    const vis = i => !/^[—–-]$/.test(k[i].w);
    if (o.stack) { const lh = size * (o.lh ?? 0.86); for (let i = o.stackFrom ?? 0; i <= cur; i++) if (vis(i)) draw(i, (o.y ?? 400) + (i - (o.stackFrom ?? 0)) * lh, 1); }
    else { let c = cur; while (c > 0 && !vis(c)) c--; if (c >= 0) draw(c, o.y ?? 600, 1); }
    // tokens that are already past (strobe mode) also count as shown
    for (let i = 0; i <= cur; i++) mark(id, i);
    ctx.restore();
  }

  // Row: the whole line in one row, each word typed on, sizes may vary per word (coverline style).
  // o: {x, y, size, sizes:{word:size}, fam, color, accent, hi, gap}
  function coverline(ctx, id, t, o = {}) {
    const L = RV.lines[id]; if (!L) return;
    const k = L.tokens, until = o.until ?? k[k.length - 1].t1 + 0.6;
    if (t < k[0].t0 || t > until + 0.2) return;
    const out = 1 - RV.inv(until, until + 0.2, t);
    let x = o.x ?? 120, y = o.y ?? 300; const base = o.size ?? 90, maxW = o.maxW ?? 1600;
    ctx.save(); ctx.textBaseline = 'alphabetic';
    k.forEach((tk, i) => {
      const bare = tk.w.replace(/[^\w']/g, '').toLowerCase();
      const sz = (o.sizes && o.sizes[bare]) || base; font(ctx, sz, o.fam ?? 'cond');
      const s = o.upper ? tk.w.toUpperCase() : tk.w; const w = ctx.measureText(s).width;
      if (x + w > (o.x ?? 120) + maxW) { x = o.x ?? 120; y += base * (o.lh ?? 1.0); }
      if (on(tk, t)) {
        const a = RV.eout(RV.inv(tk.t0, tk.t0 + 0.07, t));
        const hi = (o.hi || []).some(h => bare.includes(h.toLowerCase()));
        ctx.globalAlpha = out * a; ctx.fillStyle = hi ? (o.accent ?? RV.C.clay) : (o.color ?? RV.C.white);
        ctx.fillText(s, x, y - (1 - a) * 10); mark(id, i);
      }
      x += w + base * 0.22;
    });
    ctx.restore();
  }
  const report = () => [...shown];
  return { font, track, width, subtitle, masthead, coverline, mark, report };
})();
