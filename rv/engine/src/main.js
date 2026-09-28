// Frame assembly: shot lookup, per-shot render (plate -> back layer -> depth cut-out -> front layer),
// transitions, chrome. API for render.py: RV.init(scale), await RV.render(t), RV.jpeg(q), RV.lyricCheck().
'use strict';
(() => {
  const { GL, GFX, TRANS, CHROME } = RV;
  let out, octx, S = 1;
  RV.init = async (scale = 1) => {
    S = scale; await RV.load();
    await Promise.all(['Cond', 'CondM', 'Sans', 'Mono', 'MonoM'].map(f => document.fonts.load(`40px ${f}`)));
    out = document.getElementById('out'); out.width = Math.round(RV.W * S); out.height = Math.round(RV.H * S);
    octx = out.getContext('2d');
    const g = document.getElementById('gl'); g.width = out.width; g.height = out.height; GL.init(g);
    RV.SHOTS = RV.buildShots();
    return { shots: RV.SHOTS.length, duration: RV.DUR };
  };
  // plate coords -> frame coords under the shot's camera (inverse of the shader's plateUV)
  function mapper(cam) {
    const asp = RV.W / RV.H, z = cam.zoom ?? 1.05, r = cam.rot ?? 0, c = Math.cos(r), s = Math.sin(r);
    const pt = (u, v, d = 0.85) => {
      u += (cam.px ?? 0) * (d - (cam.focus ?? 0.5)); v += (cam.py ?? 0) * (d - (cam.focus ?? 0.5));
      let qx = (u - 0.5) * asp, qy = v - 0.5; if (cam.flip) qx = -qx;
      qx = (qx - (cam.x ?? 0)) * z; qy = (qy - (cam.y ?? 0)) * z;
      const rx = c * qx - s * qy, ry = s * qx + c * qy; // inverse (transpose) of the shader's mat2(c,-n,n,c)
      return { x: (rx / asp + 0.5) * RV.W, y: (ry + 0.5) * RV.H };
    };
    const box = (b, d) => { if (!b) return null; const a = pt(b[0], b[1], d), e = pt(b[0] + b[2], b[1] + b[3], d); return [Math.min(a.x, e.x) / RV.W, Math.min(a.y, e.y) / RV.H, Math.abs(e.x - a.x) / RV.W, Math.abs(e.y - a.y) / RV.H]; };
    return { pt, box };
  }
  async function shot(sh, t, name) {
    const [cv, ctx] = GFX.scratch(name, out.width, out.height); ctx.setTransform(S, 0, 0, S, 0, 0);
    const p = (t - sh.t0) / (sh.t1 - sh.t0), cam = sh.cam ? sh.cam(p, t) : {};
    const look = Object.assign({ seed: Math.floor(t * 30) % 97 }, sh.look || {}, cam);
    const m = Object.assign(mapper(look), { p, cam: look, sh, face: (i = 0, d) => mapper(look).box(GFX.face(sh.plate, i), d) });
    if (sh.plate) { await GL.draw(sh.plate, look); ctx.drawImage(GL.canvas, 0, 0, RV.W, RV.H); }
    else { ctx.fillStyle = sh.bg ?? RV.C.ink; ctx.fillRect(0, 0, RV.W, RV.H); }
    if (sh.back) { ctx.save(); sh.back(ctx, t, m); ctx.restore(); }
    if (sh.plate && sh.cut != null) { await GL.draw(sh.plate, Object.assign({}, look, { mask: sh.cut })); ctx.drawImage(GL.canvas, 0, 0, RV.W, RV.H); }
    if (sh.draw) { ctx.save(); sh.draw(ctx, t, m); ctx.restore(); }
    return cv;
  }
  RV.render = async t => {
    const L = RV.SHOTS; let i = L.findIndex(s => t >= s.t0 && t < s.t1); if (i < 0) i = t < L[0].t0 ? 0 : L.length - 1;
    const cur = L[i], nxt = L[i + 1];
    octx.setTransform(1, 0, 0, 1, 0, 0);
    // transition window: into `cur` (its `tin`) or out of it into `nxt`
    let done = false;
    const tryT = async (A, B) => {
      const tr = B.tin; if (!tr) return false;
      const d = tr.d ?? 0.3, c = B.t0, k = (t - (c - d / 2)) / d;
      if (k < 0 || k >= 1) return false;
      const a = await shot(A, t, 'A'), b = await shot(B, t, 'B');
      octx.setTransform(S, 0, 0, S, 0, 0); TRANS.types[tr.type](octx, a, b, k, tr); octx.setTransform(1, 0, 0, 1, 0, 0);
      return true;
    };
    if (i > 0) done = await tryT(L[i - 1], cur);
    if (!done && nxt) done = await tryT(cur, nxt);
    if (!done) { const a = await shot(cur, t, 'A'); octx.drawImage(a, 0, 0); }
    octx.setTransform(S, 0, 0, S, 0, 0);
    const ch = cur.chrome ?? {}; CHROME.draw(octx, t, Object.assign({ theme: cur.theme, look: cur.lookN, lookName: cur.lookName }, ch));
    // global fade in/out
    const fi = 1 - RV.inv(0, 0.5, t), fo = RV.inv(RV.DUR - 2.2, RV.DUR - 0.2, t);
    if (fi > 0 || fo > 0) { octx.fillStyle = `rgba(0,0,0,${Math.max(fi, fo)})`; octx.fillRect(0, 0, RV.W, RV.H); }
    octx.setTransform(1, 0, 0, 1, 0, 0);
  };
  RV.jpeg = (q = 0.92) => out.toDataURL('image/jpeg', q);
  // every lyric token must reach the screen: render the middle of each token and check it was marked
  RV.lyricCheck = async () => {
    const miss = [], all = [];
    for (const l of RV.T.lines) for (let i = 0; i < l.tokens.length; i++) {
      const tk = l.tokens[i]; all.push(l.id + ':' + i); await RV.render(Math.min(tk.t0 + 0.06, (tk.t0 + tk.t1) / 2));
    }
    const shown = new Set(RV.KIN.report());
    all.forEach(k => { if (!shown.has(k)) { const [id, i] = k.split(':'); miss.push(`${id}:${RV.lines[id].tokens[i].w}@${RV.lines[id].tokens[i].t0}`); } });
    return { total: all.length, shown: all.length - miss.length, miss };
  };
})();
