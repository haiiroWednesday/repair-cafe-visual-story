  // ---------- watercolour, after Tyler Hobbs: deform a polygon by recursive midpoint offsets, then stack many faint layers ----------
  const gauss = () => { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  function deform(pts, depth, vari) { if (!depth) return pts; const out = [];
    for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; const v = a[2]; out.push(a);
      out.push([(a[0] + b[0]) / 2 + gauss() * vari * v, (a[1] + b[1]) / 2 + gauss() * vari * v, v * (.85 + r() * .3)]); }
    return deform(out, depth - 1, vari / 2); }
  function wash(g, cx, cy, rx, ry, col, layers = 26, alpha = .05) {
    const base = []; for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; base.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry, .6 + r() * .8]); }
    const b0 = deform(base, 4, (rx + ry) / 14);
    g.save(); g.fillStyle = col; g.globalAlpha = alpha;
    for (let l = 0; l < layers; l++) { const p = deform(b0, 3, (rx + ry) / 22); g.beginPath(); p.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill(); }
    g.restore();
  }
  // a painted tree: watercolour canopy clusters in three greens, a few lit leaves, ink twigs and a soft ink contour
  function tree(seed = 1, kind = 'round') {
    s = 101 + seed * 977; const W = 520, H = 700, [c, g] = C(W, H), cx = W / 2;
    g.strokeStyle = '#6B5040'; g.lineCap = 'round';
    const trunk = (x0, y0, x1, y1, w) => { g.lineWidth = w; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2 + gauss() * 10, (y0 + y1) / 2, x1, y1); g.stroke(); };
    trunk(cx, H - 20, cx + 6, H * .48, 16); trunk(cx + 4, H * .62, cx - 70, H * .38, 7); trunk(cx + 6, H * .56, cx + 80, H * .34, 6); trunk(cx + 6, H * .5, cx + 10, H * .2, 6);
    const greens = kind === 'blossom' ? ['#F2B7C3', '#E895A8', '#F7D2DA', '#FFFFFF'] : ['#9CC59A', '#7DAE86', '#B9D8A6', '#E2EFC4'];
    const clusters = kind === 'cone' ? [[0, .2, 70, 90], [-30, .34, 100, 90], [30, .34, 100, 90], [0, .48, 140, 90]] :
      [[-90, .36, 110, 100], [90, .34, 110, 100], [0, .2, 130, 110], [-40, .5, 120, 90], [60, .52, 120, 90], [0, .4, 150, 120]];
    clusters.forEach(([dx, fy, rx, ry], i) => { wash(g, cx + dx, H * fy, rx, ry, greens[i % 2], 22, .055); wash(g, cx + dx - rx * .25, H * fy - ry * .3, rx * .6, ry * .5, greens[2], 16, .06); });
    for (let i = 0; i < 70; i++) { const cl = clusters[i % clusters.length]; const x = cx + cl[0] + gauss() * cl[2] * .5, y = H * cl[1] + gauss() * cl[3] * .45; g.fillStyle = greens[3]; g.globalAlpha = .55; g.beginPath(); g.ellipse(x, y, 7, 4, r() * 3, 0, 7); g.fill(); g.globalAlpha = 1; }
    if (kind === 'blossom') for (let i = 0; i < 40; i++) { const cl = clusters[i % clusters.length]; star(g, cx + cl[0] + gauss() * cl[2] * .45, H * cl[1] + gauss() * cl[3] * .4, 5, '#FFFFFF', .9); }
    // ink: broken contour arcs around each cluster
    g.strokeStyle = 'rgba(70,90,70,.55)'; g.lineWidth = 2;
    clusters.forEach(([dx, fy, rx, ry]) => { for (let k = 0; k < 6; k++) { const a = r() * 7, L = .4 + r() * .5; g.beginPath(); g.ellipse(cx + dx, H * fy, rx * .92, ry * .88, 0, a, a + L); g.stroke(); } });
    grain(g, W, H, .06); return c;
  }
  function bush(seed = 1, flowers = ['#F4B9C6', '#FFFFFF', '#F7D9A8']) {
    s = 303 + seed * 131; const W = 360, H = 220, [c, g] = C(W, H);
    [[-80, 130, 90, 70], [60, 130, 100, 74], [-10, 100, 110, 80]].forEach(([dx, y, rx, ry]) => { wash(g, W / 2 + dx, y, rx, ry, '#8DBB8E', 22, .06); wash(g, W / 2 + dx - 20, y - 20, rx * .6, ry * .5, '#B8D9A8', 14, .06); });
    for (let i = 0; i < 26; i++) { const x = W / 2 + gauss() * 90, y = 110 + gauss() * 40; const col = flowers[i % flowers.length]; for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; g.fillStyle = col; g.beginPath(); g.arc(x + Math.cos(a) * 5, y + Math.sin(a) * 5, 4.5, 0, 7); g.fill(); } g.fillStyle = '#E9C46A'; g.beginPath(); g.arc(x, y, 2.4, 0, 7); g.fill(); }
    grain(g, W, H, .05); return c;
  }
  // a painted lamp post with a warm globe
  function lampPost() {
    const W = 200, H = 760, [c, g] = C(W, H), cx = W / 2;
    blob(g, cx, 110, 80, ['rgba(255,226,160,.9)', 'rgba(255,226,160,0)'], 16);
    g.fillStyle = '#2E3550'; g.strokeStyle = INKC; g.lineWidth = 2;
    const P = new Path2D(); P.moveTo(cx - 34, H - 6); P.lineTo(cx + 34, H - 6); P.lineTo(cx + 22, H - 60); P.lineTo(cx + 9, H - 80); P.lineTo(cx + 7, 190); P.lineTo(cx - 7, 190); P.lineTo(cx - 9, H - 80); P.lineTo(cx - 22, H - 60); P.closePath(); g.fill(P); ink(g, P, 1.6);
    g.fillRect(cx - 40, 168, 80, 10); g.beginPath(); g.moveTo(cx - 30, 168); g.lineTo(cx - 40, 70); g.lineTo(cx + 40, 70); g.lineTo(cx + 30, 168); g.closePath(); g.strokeStyle = '#2E3550'; g.lineWidth = 5; g.stroke();
    const gl = g.createLinearGradient(0, 70, 0, 168); gl.addColorStop(0, '#FFF6DA'); gl.addColorStop(1, '#FFD98E'); g.fillStyle = gl; g.beginPath(); g.moveTo(cx - 27, 165); g.lineTo(cx - 36, 74); g.lineTo(cx + 36, 74); g.lineTo(cx + 27, 165); g.closePath(); g.fill();
    g.fillStyle = '#2E3550'; g.beginPath(); g.moveTo(cx - 48, 72); g.quadraticCurveTo(cx, 20, cx + 48, 72); g.closePath(); g.fill(); g.beginPath(); g.arc(cx, 26, 8, 0, 7); g.fill();
    g.strokeStyle = '#C8A866'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx - 60, 230); g.quadraticCurveTo(cx, 210, cx + 60, 230); g.stroke();
    star(g, cx, 120, 18, '#FFFFFF', .9); grain(g, W, H, .04); return c;
  }
  // an arched window with a flower box and a little striped awning, to sit on the outside of the teapot
  function windowBox(stripe = '#E9A3B1') {
    const W = 300, H = 420, [c, g] = C(W, H), cx = W / 2;
    const fr = new Path2D(); fr.moveTo(cx - 90, 330); fr.lineTo(cx - 90, 150); fr.arc(cx, 150, 90, Math.PI, 0); fr.lineTo(cx + 90, 330); fr.closePath(); g.fillStyle = '#FFFDF8'; g.fill(fr); ink(g, fr, 2);
    const gl = new Path2D(); gl.moveTo(cx - 72, 318); gl.lineTo(cx - 72, 152); gl.arc(cx, 152, 72, Math.PI, 0); gl.lineTo(cx + 72, 318); gl.closePath(); const gg = g.createLinearGradient(0, 80, 0, 318); gg.addColorStop(0, '#CFE3F2'); gg.addColorStop(.6, '#F6E2C6'); gg.addColorStop(1, '#F9D59B'); g.fillStyle = gg; g.fill(gl);
    blob(g, cx, 260, 60, ['rgba(255,214,140,.7)', 'rgba(255,214,140,0)'], 12);
    g.strokeStyle = '#FFFDF8'; g.lineWidth = 8; g.beginPath(); g.moveTo(cx, 80); g.lineTo(cx, 318); g.moveTo(cx - 72, 220); g.lineTo(cx + 72, 220); g.stroke(); ink(g, gl, 1.4);
    g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 5; g.beginPath(); g.moveTo(cx - 50, 140); g.lineTo(cx - 20, 110); g.stroke();
    // awning
    const aw = new Path2D(); aw.moveTo(cx - 104, 110); aw.lineTo(cx + 104, 110); aw.lineTo(cx + 116, 150); aw.lineTo(cx - 116, 150); aw.closePath();
    g.save(); g.clip(aw); for (let i = -6; i < 7; i++) { g.fillStyle = i % 2 ? stripe : '#FFFDF8'; g.fillRect(cx + i * 20 - 10, 100, 20, 60); } g.restore(); ink(g, aw, 1.8);
    for (let i = -5; i <= 5; i++) { g.fillStyle = i % 2 ? stripe : '#FFFDF8'; g.beginPath(); g.arc(cx + i * 21, 150, 10.5, 0, Math.PI); g.fill(); g.strokeStyle = INKC; g.lineWidth = 1.2; g.stroke(); }
    // flower box
    const bxp = new Path2D(); bxp.roundRect(cx - 104, 320, 208, 40, 6); g.fillStyle = '#9CC2E6'; g.fill(bxp); ink(g, bxp, 1.8);
    for (let i = 0; i < 18; i++) { const x = cx - 96 + i * 11.5 + gauss() * 3, y = 312 + gauss() * 6; g.fillStyle = '#8DBB8E'; g.beginPath(); g.ellipse(x, y + 6, 9, 6, r(), 0, 7); g.fill(); }
    for (let i = 0; i < 14; i++) { const x = cx - 92 + r() * 184, y = 302 + r() * 16, col = ['#F4B9C6', '#FFFFFF', '#E8857B', '#F7D9A8'][i % 4]; for (let k = 0; k < 5; k++) { const a = k / 5 * 7; g.fillStyle = col; g.beginPath(); g.arc(x + Math.cos(a) * 4.5, y + Math.sin(a) * 4.5, 4, 0, 7); g.fill(); } }
    for (let i = 0; i < 6; i++) { g.strokeStyle = '#8DBB8E'; g.lineWidth = 2.5; g.beginPath(); const x = cx - 90 + i * 36; g.moveTo(x, 358); g.quadraticCurveTo(x + 10, 384, x - 2, 404); g.stroke(); }
    grain(g, W, H, .05); return c;
  }
  // small framed pictures for the walls
  function framed(kind = 0) {
    const W = 220, H = 270, [c, g] = C(W, H);
    const gf = goldGrad(g, 0, 0, W, H); g.fillStyle = gf; g.beginPath(); g.roundRect(4, 4, W - 8, H - 8, kind === 2 ? 100 : 8); g.fill(); ink(g, (() => { const p = new Path2D(); p.roundRect(4, 4, W - 8, H - 8, kind === 2 ? 100 : 8); return p; })(), 1.6);
    const inner = new Path2D(); inner.roundRect(24, 24, W - 48, H - 48, kind === 2 ? 80 : 4); g.fillStyle = ['#F7E9EC', '#E4EEF6', '#FBF3E2'][kind % 3]; g.fill(inner);
    g.save(); g.clip(inner);
    if (kind === 0) { const p = teacupMini(g, W / 2, H / 2 + 20); void p; }
    else if (kind === 1) { [[W / 2 - 30, H / 2 - 10], [W / 2 + 26, H / 2 + 20], [W / 2 - 4, H / 2 + 50]].forEach(([x, y], i) => { const rg = g.createRadialGradient(x - 4, y - 4, 2, x, y, 22); rg.addColorStop(0, '#FFF2F4'); rg.addColorStop(.7, ['#F2A9BA', '#F7D2B7', '#CFE0F5'][i]); rg.addColorStop(1, '#C98095'); g.fillStyle = rg; g.beginPath(); g.arc(x, y, 22, 0, 7); g.fill(); }); g.strokeStyle = '#8EB79A'; g.lineWidth = 3; g.beginPath(); g.moveTo(W / 2, H - 40); g.lineTo(W / 2 - 4, H / 2 + 60); g.stroke(); }
    else { g.strokeStyle = '#5A6383'; g.lineWidth = 3; g.beginPath(); g.arc(W / 2, H / 2, 40, 0, 7); g.stroke(); g.beginPath(); g.moveTo(W / 2, H / 2); g.lineTo(W / 2, H / 2 - 28); g.moveTo(W / 2, H / 2); g.lineTo(W / 2 + 20, H / 2 + 6); g.stroke(); for (let k = 0; k < 12; k++) { const a = k / 12 * 7; g.fillStyle = '#B8945A'; g.beginPath(); g.arc(W / 2 + Math.cos(a) * 34, H / 2 + Math.sin(a) * 34, 2.5, 0, 7); g.fill(); } }
    g.restore(); grain(g, W, H, .05); return c;
  }
  function teacupMini(g, x, y) { g.fillStyle = '#FFFFFF'; g.strokeStyle = INKC; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y + 24, 56, 12, 0, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.moveTo(x - 38, y - 20); g.quadraticCurveTo(x - 36, y + 22, x, y + 22); g.quadraticCurveTo(x + 36, y + 22, x + 38, y - 20); g.closePath(); g.fill(); g.stroke(); g.beginPath(); g.arc(x + 42, y - 4, 12, -1.4, 1.4); g.stroke(); g.fillStyle = '#F2A9BA'; [[-16, 0], [8, 6]].forEach(([dx, dy]) => { g.beginPath(); g.arc(x + dx, y + dy, 5, 0, 7); g.fill(); }); g.strokeStyle = 'rgba(160,140,130,.6)'; g.beginPath(); g.moveTo(x - 6, y - 30); g.bezierCurveTo(x - 16, y - 46, x + 4, y - 56, x - 4, y - 70); g.stroke(); }
  // a potted plant, leafy and loose
  function plant(seed = 1) {
    s = 707 + seed * 37; const W = 240, H = 320, [c, g] = C(W, H), cx = W / 2;
    for (let i = 0; i < 16; i++) { const a = -Math.PI / 2 + gauss() * .7, L = 80 + r() * 90; const x1 = cx + Math.cos(a) * L, y1 = 210 + Math.sin(a) * L; g.strokeStyle = '#6E9B74'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(cx, 210); g.quadraticCurveTo(cx + (x1 - cx) * .3, y1 + 40, x1, y1); g.stroke();
      g.save(); g.translate(x1, y1); g.rotate(a + Math.PI / 2); const lg = g.createLinearGradient(-14, 0, 14, 0); lg.addColorStop(0, '#9CC59A'); lg.addColorStop(1, '#6E9B74'); g.fillStyle = lg; g.beginPath(); g.ellipse(0, 0, 13, 26, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(60,90,60,.5)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, -22); g.lineTo(0, 22); g.stroke(); g.restore(); }
    const pt = new Path2D(); pt.moveTo(cx - 52, 206); pt.lineTo(cx + 52, 206); pt.lineTo(cx + 40, 312); pt.lineTo(cx - 40, 312); pt.closePath(); g.fillStyle = '#F3E6DA'; g.fill(pt); ink(g, pt, 1.8);
    g.strokeStyle = '#9CC2E6'; g.lineWidth = 6; g.beginPath(); g.moveTo(cx - 48, 232); g.lineTo(cx + 48, 232); g.stroke(); g.fillStyle = '#F4B9C6'; [[-24, 270], [0, 262], [24, 270]].forEach(([dx, y]) => { g.beginPath(); g.arc(cx + dx, y, 6, 0, 7); g.fill(); });
    grain(g, W, H, .05); return c;
  }
  // a soft contact shadow
  function shadowBlob() { const [c, g] = C(256, 128); const rg = g.createRadialGradient(128, 64, 4, 128, 64, 120); rg.addColorStop(0, 'rgba(60,50,80,.42)'); rg.addColorStop(1, 'rgba(60,50,80,0)'); g.save(); g.scale(1, .5); g.fillStyle = rg; g.fillRect(0, 0, 256, 256); g.restore(); return c; }
