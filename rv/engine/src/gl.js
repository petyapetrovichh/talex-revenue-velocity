// Plate renderer (WebGL2): 2.5D depth parallax over a still, a colour grade, and the print pass
// (colour CMYK halftone / duotone dither / clean). Optional foreground cut-out by depth so type can
// sit between her and the background.
'use strict';
RV.GL = (() => {
  const VS = `#version 300 es
  in vec2 p; out vec2 v; void main(){ v = p * 0.5 + 0.5; v.y = 1.0 - v.y; gl_Position = vec4(p, 0, 1); }`;
  const FS = `#version 300 es
  precision highp float;
  in vec2 v; out vec4 o;
  uniform sampler2D uImg, uDep, uImg2, uMask2;
  uniform vec3 uRev;          // enabled, reveal line (plate v), softness
  uniform vec2 uRes;          // output px
  uniform float uAsp, uImgAsp;
  uniform vec4 uCam;          // zoom, panX, panY, rot
  uniform vec3 uPar;          // parallax x, y (uv units), focus depth
  uniform int uMode;          // 0 clean, 1 colour halftone, 2 duotone dither, 3 mono halftone
  uniform float uHT, uCell, uGrain, uSeed, uVig, uFlip;
  uniform vec4 uGrade;        // exposure, contrast, saturation, warmth
  uniform vec3 uTint, uInk;   // duotone light / dark
  uniform vec2 uMask;         // enabled, depth threshold
  uniform float uFade;        // fade to black (0..1)

  vec2 plateUV(vec2 s) {
    vec2 q = s - 0.5; q.x *= uAsp;
    float c = cos(uCam.w), n = sin(uCam.w); q = mat2(c, -n, n, c) * q;
    q = q / uCam.x + uCam.yz;
    if (uFlip > 0.5) q.x = -q.x;
    return uImgAsp >= uAsp ? vec2(q.x / uImgAsp + 0.5, q.y + 0.5) : vec2(q.x / uAsp + 0.5, q.y * uImgAsp / uAsp + 0.5);
  }
  vec2 para(vec2 uv) {
    vec2 u = uv;
    for (int i = 0; i < 5; i++) { float d = texture(uDep, u).r; u = uv - uPar.xy * (d - uPar.z); }
    return u;
  }
  vec3 grade(vec3 c) {
    c *= uGrade.x;
    c = (c - 0.5) * uGrade.y + 0.5;
    float l = dot(c, vec3(0.299, 0.587, 0.114));
    c = mix(vec3(l), c, uGrade.z);
    c += vec3(0.04, 0.0, -0.04) * uGrade.w;
    return clamp(c, 0.0, 1.0);
  }
  vec3 src(vec2 uv) {
    vec3 c = texture(uImg, uv).rgb;
    if (uRev.x > 0.5) {
      float m = texture(uMask2, uv).r * (1.0 - smoothstep(uRev.y - uRev.z, uRev.y + uRev.z, uv.y));
      c = mix(c, texture(uImg2, uv).rgb, m);
    }
    return c;
  }
  vec3 scene(vec2 s) { return grade(src(para(plateUV(s)))); }
  float h(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233)) + uSeed) * 43758.5453); }
  // one halftone screen: dot area follows the ink amount sampled at the cell centre
  float screen(vec2 px, float ang, int ch) {
    float c = cos(ang), n = sin(ang);
    mat2 R = mat2(c, -n, n, c), Ri = mat2(c, n, -n, c);
    vec2 q = R * px; vec2 cq = (floor(q / uCell) + 0.5) * uCell;
    vec3 col = scene((Ri * cq) / uRes);
    float k = 1.0 - max(col.r, max(col.g, col.b));
    float ink = ch == 3 ? k : (1.0 - col[ch] - k) / max(1.0 - k, 1e-3);
    float r = sqrt(clamp(ink, 0.0, 1.0)) * uCell * 0.66;
    return smoothstep(r + 0.9, r - 0.9, length(q - cq));
  }
  float bayer(vec2 p) {
    ivec2 i = ivec2(mod(p, 4.0));
    int m[16] = int[16](0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5);
    return (float(m[i.y * 4 + i.x]) + 0.5) / 16.0;
  }
  void main() {
    vec2 px = v * uRes;
    vec2 puv = para(plateUV(v));
    vec3 base = grade(src(puv));
    vec3 col = base;
    if (uMode == 1) {
      float C = screen(px, 0.2618, 0), M = screen(px, 1.309, 1), Y = screen(px, 0.0, 2), K = screen(px, 0.7854, 3);
      vec3 ht = (1.0 - vec3(C, M, Y) * vec3(1.0, 1.0, 1.0)) * (1.0 - K * 0.92);
      ht = mix(ht, ht * vec3(0.98, 0.97, 0.94), 0.5);
      col = mix(base, ht, uHT);
    } else if (uMode == 2) {
      float l = dot(base, vec3(0.299, 0.587, 0.114));
      float cell = max(uCell * 0.5, 1.0);
      float d = step(bayer(floor(px / cell)), l);
      col = mix(base, mix(uInk, uTint, d), uHT);
    } else if (uMode == 3) {
      float K = screen(px, 0.7854, 3);
      col = mix(base, mix(uTint, uInk, K), uHT);
    }
    // vignette + grain + fade
    vec2 d = v - 0.5; col *= 1.0 - uVig * dot(d, d) * 1.6;
    col += (h(px) - 0.5) * uGrain;
    col *= 1.0 - uFade;
    float a = 1.0;
    if (uMask.x > 0.5) { float dd = texture(uDep, puv).r; a = smoothstep(uMask.y - 0.02, uMask.y + 0.02, dd); }
    o = vec4(col * a, a);
  }`;
  let gl, prog, U = {}, cache = new Map(), order = [];
  const MAXTEX = 10;
  function sh(type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; }
  function init(canvas) {
    gl = canvas.getContext('webgl2', { premultipliedAlpha: true, preserveDrawingBuffer: true, antialias: false });
    prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);
    const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    ['uImg', 'uDep', 'uRes', 'uAsp', 'uImgAsp', 'uCam', 'uPar', 'uMode', 'uHT', 'uCell', 'uGrain', 'uSeed', 'uVig', 'uFlip', 'uGrade', 'uTint', 'uInk', 'uMask', 'uFade', 'uImg2', 'uMask2', 'uRev']
      .forEach(n => (U[n] = gl.getUniformLocation(prog, n)));
    gl.uniform1i(U.uImg, 0); gl.uniform1i(U.uDep, 1); gl.uniform1i(U.uImg2, 2); gl.uniform1i(U.uMask2, 3);
  }
  const img = src => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(new Error('load ' + src)); i.src = src; });
  function mk(im) {
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }
  const masks = new Map();
  async function maskTex(key) {
    if (!masks.has(key)) masks.set(key, mk(await img(`assets/plates/${key}.mask.png`)));
    return masks.get(key);
  }
  async function plate(key) {
    if (cache.has(key)) { order = order.filter(k => k !== key); order.push(key); return cache.get(key); }
    const [a, d] = await Promise.all([img(`assets/plates/${key}.jpg`), img(`assets/plates/${key}.depth.png`)]);
    const p = { img: mk(a), dep: mk(d), asp: a.width / a.height };
    cache.set(key, p); order.push(key);
    while (order.length > MAXTEX) { const k = order.shift(), q = cache.get(k); gl.deleteTexture(q.img); gl.deleteTexture(q.dep); cache.delete(k); }
    return p;
  }
  const hex = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16) / 255);
  // o: {zoom, x, y, rot, px, py, focus, mode, ht, cell, grain, vig, grade:[exp,con,sat,warm], tint, ink, mask, fade, flip, seed}
  async function draw(key, o = {}) {
    const p = await plate(key), c = gl.canvas;
    gl.viewport(0, 0, c.width, c.height);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, p.img);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, p.dep);
    const s = c.height / 1080;
    gl.uniform2f(U.uRes, c.width, c.height); gl.uniform1f(U.uAsp, c.width / c.height); gl.uniform1f(U.uImgAsp, p.asp);
    gl.uniform4f(U.uCam, o.zoom ?? 1.05, o.x ?? 0, o.y ?? 0, o.rot ?? 0);
    gl.uniform3f(U.uPar, o.px ?? 0, o.py ?? 0, o.focus ?? 0.5);
    gl.uniform1i(U.uMode, { clean: 0, ht: 1, dither: 2, mono: 3 }[o.mode ?? 'ht']);
    gl.uniform1f(U.uHT, o.ht ?? 0.5); gl.uniform1f(U.uCell, (o.cell ?? 7) * s);
    gl.uniform1f(U.uGrain, o.grain ?? 0.06); gl.uniform1f(U.uSeed, o.seed ?? 0); gl.uniform1f(U.uVig, o.vig ?? 0.35);
    gl.uniform1f(U.uFlip, o.flip ? 1 : 0);
    const g = o.grade ?? [1.05, 1.12, 1.15, 0];
    gl.uniform4f(U.uGrade, g[0], g[1], g[2], g[3]);
    gl.uniform3f(U.uTint, ...hex(o.tint ?? RV.C.paper)); gl.uniform3f(U.uInk, ...hex(o.ink ?? RV.C.ink));
    gl.uniform2f(U.uMask, o.mask != null ? 1 : 0, o.mask ?? 0);
    gl.uniform1f(U.uFade, o.fade ?? 0);
    // reveal: o.reveal = {key, y} — the twin plate `key` shows through its text mask above plate-v `y`
    if (o.reveal) {
      const q = await plate(o.reveal.key), mt = await maskTex(o.reveal.key);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, p.img);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, p.dep);
      gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, q.img);
      gl.activeTexture(gl.TEXTURE3); gl.bindTexture(gl.TEXTURE_2D, mt);
      gl.uniform3f(U.uRev, 1, o.reveal.y, o.reveal.soft ?? 0.015);
    } else gl.uniform3f(U.uRev, 0, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    return c;
  }
  return { init, draw, plate, get canvas() { return gl.canvas; } };
})();
