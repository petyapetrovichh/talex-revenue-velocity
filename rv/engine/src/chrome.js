// Chrome: the show's HUD. Frame, title block, the through-line counter (revenue shared, flap digits),
// look counter, beat readout, ticker. Theme 'dark' (white lines) or 'light' (ink lines).
'use strict';
RV.CHROME = (() => {
  const { C, KIN, GFX, clamp, inv, eout } = RV;
  // the through-line: revenue shared keeps counting up, faster from the chorus on
  function revenue(t) {
    const F = RV.F.revenueShared, p = RV.clamp(t / RV.DUR);
    const ch = RV.T.sections.find(s => s.name === 'chorus');
    const boost = RV.clamp((t - ch.t0) / (ch.t1 - ch.t0));
    const k = 0.55 * Math.pow(p, 1.3) + 0.45 * RV.smooth(boost) * p;
    return F.start + (F.end - F.start) * RV.clamp(k) + Math.floor(RV.beatPos(t)) * 137;
  }
  function draw(ctx, t, o = {}) {
    const level = o.level ?? 'full'; if (level === 'none') return;
    const light = o.theme === 'light', fg = light ? C.ink : C.white, W = RV.W, H = RV.H;
    const a = o.alpha ?? 1;
    ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = fg; ctx.fillStyle = fg; ctx.lineWidth = 1;
    // frame: corner crosses and a thin inset border
    const m = 36;
    ctx.globalAlpha = a * 0.55; ctx.strokeRect(m + 0.5, m + 0.5, W - 2 * m - 1, H - 2 * m - 1); ctx.globalAlpha = a;
    [[m, m], [W - m, m], [m, H - m], [W - m, H - m]].forEach(([x, y]) => { ctx.beginPath(); ctx.moveTo(x - 10, y + 0.5); ctx.lineTo(x + 10, y + 0.5); ctx.moveTo(x + 0.5, y - 10); ctx.lineTo(x + 0.5, y + 10); ctx.stroke(); });
    // title block
    KIN.font(ctx, 20, 'cond'); ctx.fillText('REVENUE VELOCITY', m + 18, m + 30);
    GFX.mono(ctx, 12); ctx.globalAlpha = a * 0.8; ctx.fillText(`${RV.F.brand} · S/S 26 · THE AGI-ERA COLLECTION`, m + 18, m + 48); ctx.globalAlpha = a;
    if (level === 'full') {
      // through-line counter
      GFX.mono(ctx, 12, true); ctx.fillText('REVENUE SHARED · LIVE', W - m - 330, m + 24);
      ctx.fillStyle = C.clay; ctx.beginPath(); ctx.arc(W - m - 342, m + 20, 4 + 2 * RV.pulse(t, 10), 0, 7); ctx.fill(); ctx.fillStyle = fg;
      GFX.counter(ctx, W - m - 330, m + 34, revenue(t), { prefix: '$', cw: 22, ch: 32, gap: 3, bg: light ? C.ink : '#15191d', fg: C.paper, hi: (i, c) => c === '$' });
      // look counter
      if (o.look) { GFX.mono(ctx, 13, true); const s = `LOOK ${String(o.look).padStart(2, '0')} / 04`; ctx.fillText(s, W - m - 330, m + 94); ctx.globalAlpha = a * 0.7; GFX.mono(ctx, 12); ctx.fillText(o.lookName ?? '', W - m - 330, m + 112); ctx.globalAlpha = a; }
      // beat readout
      const bp = RV.beatPos(t), bi = Math.floor(bp), bar = Math.floor(bi / 4) + 1, beat = (bi % 4 + 4) % 4;
      GFX.mono(ctx, 12); ctx.fillText(`BAR ${String(Math.max(bar, 0)).padStart(3, '0')} · ${RV.F.bpm} BPM`, m + 18, H - m - 40);
      for (let i = 0; i < 4; i++) { ctx.globalAlpha = a * (i === beat ? 1 : 0.35); ctx.fillStyle = i === beat ? C.clay : fg; ctx.fillRect(m + 18 + i * 16, H - m - 30, 11, 11); }
      ctx.globalAlpha = a; ctx.fillStyle = fg;
      // timecode
      const f = Math.floor(t * 30), tc = `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(Math.floor(t % 60)).padStart(2, '0')}:${String(f % 30).padStart(2, '0')}`;
      GFX.mono(ctx, 12); ctx.fillText(tc, W - m - 90, H - m - 22);
    }
    // ticker along the bottom edge
    if (level !== 'min' || o.ticker) {
      const items = (o.ticker ?? RV.F.ticker).join('   ▪   ') + '   ▪   ';
      GFX.mono(ctx, 12); const w = ctx.measureText(items).width, off = (t * 70) % w;
      ctx.save(); ctx.beginPath(); ctx.rect(m + 120, H - m - 8 - 14, W - 2 * m - 240, 20); ctx.clip();
      ctx.globalAlpha = a * 0.8; for (let x = m + 120 - off; x < W; x += w) ctx.fillText(items, x, H - m - 8); ctx.restore();
    }
    ctx.restore();
  }
  return { draw, revenue };
})();
