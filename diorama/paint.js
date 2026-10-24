/* Painted café pieces for the pop-up teapot: soft gradients clipped inside shapes, blurred blobs,
   inner and outer glows, sparkles and grain (the Illustrator drink and pudding recipes, redone in Canvas2D),
   plus thin warm-brown ink in the manner of pastel tea-party illustration. Each painter returns a canvas. */
const PT = (() => {
  const INKC = '#6E5040';
  const C = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
  let s = 11; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  const grain = (g, w, h, a = .07) => { const d = g.getImageData(0, 0, w, h), p = d.data; for (let i = 0; i < p.length; i += 4) { if (!p[i + 3]) continue; const n = (r() - .5) * 255 * a; p[i] += n; p[i + 1] += n; p[i + 2] += n; } g.putImageData(d, 0, 0); };
  const star = (g, x, y, R, col = '#FFFFFF', a = 1) => { g.save(); g.globalAlpha = a; g.fillStyle = col; g.beginPath(); for (let k = 0; k < 8; k++) { const rr = k % 2 ? R * .22 : R, t = k / 8 * Math.PI * 2; g.lineTo(x + Math.sin(t) * rr, y - Math.cos(t) * rr); } g.fill(); g.restore(); };
  const blob = (g, x, y, rad, col, blur) => { g.save(); g.filter = `blur(${blur}px)`; const gr = g.createRadialGradient(x - rad * .3, y - rad * .3, rad * .1, x, y, rad); gr.addColorStop(0, col[0]); gr.addColorStop(1, col[1]); g.fillStyle = gr; g.beginPath(); g.arc(x, y, rad, 0, 7); g.fill(); g.restore(); };
  // inner glow: stroke the clipped path with a wide blurred line
  const innerGlow = (g, path, col, wdt, blur) => { g.save(); g.clip(path); g.filter = `blur(${blur}px)`; g.strokeStyle = col; g.lineWidth = wdt; g.stroke(path); g.restore(); };
  const outerGlow = (g, path, col, blur) => { g.save(); g.shadowColor = col; g.shadowBlur = blur; g.fillStyle = col; g.fill(path); g.restore(); };
  const ink = (g, path, w = 2.2, col = INKC) => { g.save(); g.lineJoin = g.lineCap = 'round'; g.strokeStyle = col; g.lineWidth = w; g.stroke(path); g.restore(); };
  const goldGrad = (g, x0, y0, x1, y1) => { const gr = g.createLinearGradient(x0, y0, x1, y1); [['#FFF3C4', 0], ['#E9C878', .22], ['#B98B3E', .45], ['#F4DB8E', .62], ['#C59A4B', .82], ['#FBE9A9', 1]].forEach(([c, t]) => gr.addColorStop(t, c)); return gr; };
  // a flower path from a polygon by bloating every edge (pucker and bloat at +22%)
  const bloat = (cx, cy, R, n, amt, sx = 1, sy = 1) => { const p = new Path2D(); for (let i = 0; i <= n; i++) { const a0 = (i - 1) / n * Math.PI * 2, a1 = i / n * Math.PI * 2, am = (a0 + a1) / 2;
      const x1 = cx + Math.cos(a1) * R * sx, y1 = cy + Math.sin(a1) * R * sy; if (!i) { p.moveTo(x1, y1); continue; } p.quadraticCurveTo(cx + Math.cos(am) * R * (1 + amt) * sx, cy + Math.sin(am) * R * (1 + amt) * sy, x1, y1); } p.closePath(); return p; };
  const lerpC = (a, b, t) => { const h = x => [1, 3, 5].map(i => parseInt(x.slice(i, i + 2), 16)); const A = h(a), B = h(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`; };

  // --- the heart clock, from the photograph: gold heart, roses cast up the right lobe, black dial with a pink rose bouquet ---
  function heartClock() {
    const W = 560, H = 540, [c, g] = C(W, H);
    const hp = (sc, ox = 0, oy = 0) => { const p = new Path2D(); for (let i = 0; i <= 120; i++) { const t = i / 120 * Math.PI * 2; const x = 16 * Math.pow(Math.sin(t), 3), y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)); i ? p.lineTo(W / 2 + ox + x * sc, H * .45 + oy + y * sc) : p.moveTo(W / 2 + ox + x * sc, H * .45 + oy + y * sc); } p.closePath(); return p; };
    const outer = hp(15.6), inner = hp(12.6, 0, -6);
    outerGlow(g, outer, 'rgba(255,224,150,.55)', 26);
    g.fillStyle = goldGrad(g, 0, 0, W, H); g.fill(outer);
    // the inner plate, a slightly darker satin gold
    const ig = g.createLinearGradient(0, 60, W, H); ig.addColorStop(0, '#E9CF86'); ig.addColorStop(1, '#C9A157'); g.fillStyle = ig; g.fill(inner);
    innerGlow(g, outer, 'rgba(255,248,214,.9)', 16, 6); innerGlow(g, inner, 'rgba(120,80,30,.45)', 14, 6);
    ink(g, outer, 2.4); ink(g, inner, 1.6, 'rgba(110,80,64,.7)');
    // cast roses climbing the right lobe and down the right side
    const rose = (x, y, R) => { // cast rose: rings of cupped petals, darker in the gaps, a bright lip on each petal
      const pet = (px, py, pr, ang) => { g.save(); g.translate(px, py); g.rotate(ang); const pg = g.createLinearGradient(0, -pr, 0, pr); pg.addColorStop(0, '#FFF4CC'); pg.addColorStop(.5, '#E4C26E'); pg.addColorStop(1, '#9C7130'); g.fillStyle = pg; g.beginPath(); g.ellipse(0, 0, pr, pr * .62, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(104,70,30,.7)'; g.lineWidth = 1.1; g.stroke(); g.strokeStyle = 'rgba(255,250,228,.9)'; g.lineWidth = 1.3; g.beginPath(); g.ellipse(0, -pr * .1, pr * .8, pr * .42, 0, 3.5, 5.9); g.stroke(); g.restore(); };
      g.save(); g.shadowColor = 'rgba(90,60,20,.45)'; g.shadowBlur = 6; g.fillStyle = '#B48A44'; g.beginPath(); g.arc(x, y, R, 0, 7); g.fill(); g.restore();
      for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2 + .3; pet(x + Math.cos(a) * R * .55, y + Math.sin(a) * R * .5, R * .5, a + Math.PI / 2); }
      for (let k = 0; k < 4; k++) { const a = k / 4 * Math.PI * 2 + 1; pet(x + Math.cos(a) * R * .26, y + Math.sin(a) * R * .24, R * .34, a + Math.PI / 2); }
      g.strokeStyle = 'rgba(104,70,30,.8)'; g.lineWidth = 1.3; g.beginPath(); for (let k = 0; k < 16; k++) { const t = k / 16 * Math.PI * 3, rr = R * (.04 + k / 16 * .16); g.lineTo(x + Math.cos(t) * rr, y + Math.sin(t) * rr); } g.stroke(); };
    const leaf = (x, y, a, L) => { g.save(); g.translate(x, y); g.rotate(a); const lg = g.createLinearGradient(0, -L * .3, 0, L * .3); lg.addColorStop(0, '#F3DC97'); lg.addColorStop(1, '#A47A36'); g.fillStyle = lg; g.beginPath(); g.ellipse(L / 2, 0, L / 2, L * .22, 0, 0, 7); g.fill(); g.strokeStyle = 'rgba(110,74,30,.7)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, 0); g.lineTo(L, 0); g.stroke(); g.restore(); };
    [[400, 92, -.4, 40], [458, 170, .9, 38], [470, 268, 1.6, 34], [352, 70, -1.2, 32]].forEach(a => leaf(...a));
    [[394, 126, 40], [444, 200, 36], [458, 266, 30], [424, 322, 24], [336, 100, 26], [478, 140, 22]].forEach(a => rose(...a));
    // the dial: black bezel, a deep plum face with a magenta bloom, roses and baby's breath
    const cx = 248, cy = 232, R = 150;
    g.save(); g.shadowColor = 'rgba(40,20,40,.45)'; g.shadowBlur = 18; g.fillStyle = '#17121C'; g.beginPath(); g.arc(cx, cy, R + 14, 0, 7); g.fill(); g.restore();
    const face = new Path2D(); face.arc(cx, cy, R, 0, 7);
    g.save(); g.clip(face);
    const fg = g.createRadialGradient(cx, cy + 60, 10, cx, cy, R * 1.1); fg.addColorStop(0, '#C9407F'); fg.addColorStop(.35, '#5B2A73'); fg.addColorStop(.75, '#22163E'); fg.addColorStop(1, '#0E0B18'); g.fillStyle = fg; g.fillRect(cx - R, cy - R, R * 2, R * 2);
    blob(g, cx - 40, cy + 70, 70, ['rgba(255,120,190,.55)', 'rgba(255,120,190,0)'], 14); blob(g, cx + 60, cy - 30, 60, ['rgba(120,140,255,.35)', 'rgba(120,140,255,0)'], 18);
    for (let i = 0; i < 260; i++) { const a = r() * 7, d = Math.sqrt(r()) * R * .9; const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * .9 - 10; g.fillStyle = `rgba(255,255,255,${.35 + r() * .6})`; g.beginPath(); g.arc(x, y, .8 + r() * 1.8, 0, 7); g.fill(); }
    // stems, then the bouquet
    g.strokeStyle = '#4E8B5F'; g.lineWidth = 3; [[-50, -40], [-20, -60], [10, -70], [40, -50], [60, -20], [-70, -5]].forEach(([dx, dy]) => { g.beginPath(); g.moveTo(cx, cy + 92); g.quadraticCurveTo(cx + dx * .3, cy + 40, cx + dx, cy + dy); g.stroke(); });
    const pr = (x, y, R0, col) => { const rg = g.createRadialGradient(x, y, 1, x, y, R0); rg.addColorStop(0, '#FFE1EC'); rg.addColorStop(.5, col); rg.addColorStop(1, '#8E1F55'); g.fillStyle = rg; g.beginPath(); g.arc(x, y, R0, 0, 7); g.fill(); g.strokeStyle = 'rgba(255,230,240,.85)'; g.lineWidth = 1.5; for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(x + (k - 1) * 2, y + k, R0 * (.35 + k * .2), 3.4 + k, 5.6 + k); g.stroke(); } };
    [[-50, -40, 21], [-20, -62, 22], [12, -72, 20], [42, -50, 22], [62, -20, 19], [-70, -4, 18]].forEach(([dx, dy, rr]) => pr(cx + dx, cy + dy, rr, '#E2508F'));
    // a pale blue ribbon bow at the gathered stems
    g.fillStyle = '#CFE3FF'; g.strokeStyle = 'rgba(70,90,140,.7)'; g.lineWidth = 1.3; [[-1], [1]].forEach(([sd]) => { g.beginPath(); g.ellipse(cx + sd * 18, cy + 92, 18, 9, sd * .4, 0, 7); g.fill(); g.stroke(); });
    g.beginPath(); g.moveTo(cx - 4, cy + 96); g.lineTo(cx - 16, cy + 128); g.moveTo(cx + 4, cy + 96); g.lineTo(cx + 20, cy + 126); g.strokeStyle = '#CFE3FF'; g.lineWidth = 5; g.stroke();
    // hands
    g.strokeStyle = '#E8C979'; g.lineCap = 'round'; g.lineWidth = 4; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx - 40, cy - 52); g.stroke(); g.lineWidth = 3; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + 78, cy - 24); g.stroke(); g.fillStyle = '#E8C979'; g.beginPath(); g.arc(cx, cy, 6, 0, 7); g.fill();
    // glass: a soft white arc and a sparkle
    g.restore();
    g.save(); g.clip(face); const gl = g.createLinearGradient(cx - R, cy - R, cx + R * .2, cy); gl.addColorStop(0, 'rgba(255,255,255,.38)'); gl.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gl; g.beginPath(); g.ellipse(cx - 40, cy - 70, R * .9, R * .45, -.5, 0, 7); g.fill(); g.restore();
    star(g, cx - 92, cy - 92, 14); star(g, cx + 70, cy + 100, 8, '#FFFFFF', .8);
    g.strokeStyle = '#E2C77E'; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, R + 7, 0, 7); g.stroke();
    grain(g, W, H, .06); return c;
  }

  // --- the brass lamp: a bouillotte-style candelabra with three candle sleeves and soft bulbs ---
  function candelabra() {
    const W = 380, H = 640, [c, g] = C(W, H), cx = W / 2;
    const gold = goldGrad(g, cx - 120, 0, cx + 120, 0);
    // glows first so the brass sits in light
    [[cx, 92], [cx - 112, 168], [cx + 112, 168]].forEach(([x, y]) => blob(g, x, y, 70, ['rgba(255,226,160,.85)', 'rgba(255,226,160,0)'], 18));
    const P = new Path2D();
    // foot, stem, knops
    P.ellipse(cx, 600, 120, 22, 0, 0, 7);
    g.fillStyle = gold; g.fill(P); ink(g, P);
    const sh = (y0, y1, w0, w1) => { const p = new Path2D(); p.moveTo(cx - w0, y0); p.bezierCurveTo(cx - w0 * .6, (y0 + y1) / 2, cx - w1 * 1.2, (y0 + y1) / 2, cx - w1, y1); p.lineTo(cx + w1, y1); p.bezierCurveTo(cx + w1 * 1.2, (y0 + y1) / 2, cx + w0 * .6, (y0 + y1) / 2, cx + w0, y0); p.closePath(); g.fillStyle = gold; g.fill(p); ink(g, p, 1.8); };
    sh(598, 520, 96, 22); sh(522, 330, 16, 14); sh(332, 300, 30, 12); sh(302, 220, 12, 10);
    // reeding on the column
    g.strokeStyle = 'rgba(120,84,36,.5)'; g.lineWidth = 1.2; for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(cx + k * 5, 520); g.lineTo(cx + k * 5, 334); g.stroke(); }
    // two curved arms
    [-1, 1].forEach(sd => { const p = new Path2D(); p.moveTo(cx, 300); p.bezierCurveTo(cx + sd * 70, 330, cx + sd * 120, 290, cx + sd * 112, 214); g.strokeStyle = gold; g.lineWidth = 13; g.lineCap = 'round'; g.stroke(p); g.strokeStyle = INKC; g.lineWidth = 1.6; g.save(); g.lineWidth = 15; g.globalCompositeOperation = 'destination-over'; g.strokeStyle = INKC; g.stroke(p); g.restore();
      const sc = new Path2D(); sc.arc(cx + sd * 70, 330, 18, sd > 0 ? 3.6 : -.5, sd > 0 ? 6.6 : 2.6); g.strokeStyle = gold; g.lineWidth = 6; g.stroke(sc); });
    // bobeches, candle sleeves, bulbs
    [[cx, 92, 210], [cx - 112, 168, 214], [cx + 112, 168, 214]].forEach(([x, by, top]) => {
      const bob = new Path2D(); bob.ellipse(x, top, 34, 9, 0, 0, 7); g.fillStyle = gold; g.fill(bob); ink(g, bob, 1.6);
      const sl = new Path2D(); sl.roundRect(x - 13, by + 26, 26, top - by - 28, 4); const sg = g.createLinearGradient(x - 13, 0, x + 13, 0); sg.addColorStop(0, '#FFFFFF'); sg.addColorStop(.5, '#F4EFE6'); sg.addColorStop(1, '#D9D0C2'); g.fillStyle = sg; g.fill(sl); ink(g, sl, 1.5);
      g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.ellipse(x - 2, by + 40, 6, 9, 0, 0, 7); g.fill();
      const bulb = new Path2D(); bulb.moveTo(x, by - 34); bulb.bezierCurveTo(x + 22, by - 8, x + 18, by + 24, x, by + 26); bulb.bezierCurveTo(x - 18, by + 24, x - 22, by - 8, x, by - 34);
      outerGlow(g, bulb, 'rgba(255,236,190,.95)', 26); const bg = g.createRadialGradient(x, by + 8, 2, x, by, 30); bg.addColorStop(0, '#FFFFFF'); bg.addColorStop(.6, '#FFF3D6'); bg.addColorStop(1, '#F8D99A'); g.fillStyle = bg; g.fill(bulb); ink(g, bulb, 1.3, 'rgba(110,80,64,.6)');
      star(g, x + 8, by - 8, 7, '#FFFFFF', .9); });
    grain(g, W, H, .05); return c;
  }

  // --- a dreamy iced drink in a glass (the five-step glass recipe) ---
  function drink(cols = ['#F49B5B', '#F6D34A', '#E8456E', '#7EC4EE']) {
    const W = 260, H = 380, [c, g] = C(W, H);
    const gp = new Path2D(); gp.moveTo(52, 92); gp.lineTo(208, 92); gp.lineTo(192, 352); gp.quadraticCurveTo(190, 364, 176, 364); gp.lineTo(84, 364); gp.quadraticCurveTo(70, 364, 68, 352); gp.closePath();
    outerGlow(g, gp, 'rgba(255,255,255,.95)', 22);
    g.fillStyle = 'rgba(253,240,236,.9)'; g.fill(gp);
    g.save(); g.clip(gp);
    blob(g, 104, 150, 38, [cols[0], '#C0602A'], 7); blob(g, 170, 210, 34, [cols[1], '#E8B530'], 8); blob(g, 96, 262, 34, [cols[2], '#B81F4E'], 8);
    [[150, 270, 46, 0.3], [120, 316, 40, -0.4], [172, 320, 38, 0.6]].forEach(([x, y, sz, a]) => { g.save(); g.filter = 'blur(6px)'; g.translate(x, y); g.rotate(a); const ig = g.createLinearGradient(-sz / 2, -sz / 2, sz / 2, sz / 2); ig.addColorStop(0, '#DFF3FF'); ig.addColorStop(1, cols[3]); g.fillStyle = ig; g.globalAlpha = .85; g.fillRect(-sz / 2, -sz / 2, sz, sz); g.restore(); });
    g.restore();
    innerGlow(g, gp, 'rgba(255,255,255,.95)', 18, 5);
    // straw: a curl above the rim
    g.strokeStyle = '#3B3F6E'; g.lineWidth = 7; g.lineCap = 'round'; g.beginPath(); g.moveTo(120, 330); g.lineTo(170, 70); g.bezierCurveTo(176, 36, 214, 30, 214, 58); g.bezierCurveTo(214, 82, 186, 80, 190, 62); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 2; g.beginPath(); g.moveTo(168, 80); g.lineTo(150, 170); g.stroke();
    // orange wheel perched on the rim
    const ow = new Path2D(); ow.arc(76, 92, 34, 0, 7); const og = g.createRadialGradient(70, 86, 4, 76, 92, 34); og.addColorStop(0, '#FFC48A'); og.addColorStop(.8, '#F08A3C'); og.addColorStop(1, '#C2601E'); g.fillStyle = og; g.fill(ow); blob(g, 76, 92, 14, ['rgba(255,80,90,.8)', 'rgba(255,80,90,0)'], 4); ink(g, ow, 1.4, 'rgba(110,80,64,.5)');
    g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 6; g.beginPath(); g.moveTo(64, 120); g.lineTo(78, 340); g.stroke();
    [[96, 180, 7], [150, 240, 9], [180, 150, 6], [120, 300, 6], [190, 290, 5]].forEach(a => star(g, ...a));
    ink(g, gp, 1.4, 'rgba(110,80,64,.35)');
    grain(g, W, H, .05); return c;
  }

  // --- caramel pudding on a plate (pucker-and-bloat flower, blended tiers, inner glow, grain), with a cherry ---
  function pudding() {
    const W = 300, H = 300, [c, g] = C(W, H), cx = W / 2;
    const pl = new Path2D(); pl.ellipse(cx, 252, 130, 30, 0, 0, 7); g.fillStyle = '#5A3A2E'; g.fill(pl); const pl2 = new Path2D(); pl2.ellipse(cx, 248, 112, 22, 0, 0, 7); g.fillStyle = '#FFFDF7'; g.fill(pl2);
    for (let k = 0; k <= 14; k++) { const t = k / 14; const y = 236 - t * 120, R = 70 - t * 14, col = t < .78 ? lerpC('#FBEBB8', '#F2C64E', t / .78) : lerpC('#F2C64E', '#3A1D10', (t - .78) / .22);
      const p = bloat(cx, y, R, 9, .22, 1, .32); g.fillStyle = col; g.fill(p); }
    const top = bloat(cx, 116, 56, 9, .22, 1, .32); g.fillStyle = '#3A1D10'; g.fill(top); innerGlow(g, top, 'rgba(255,240,220,.7)', 10, 4);
    blob(g, cx - 18, 160, 30, ['rgba(255,255,255,.55)', 'rgba(255,255,255,0)'], 6);
    // syrup drips
    g.fillStyle = '#3A1D10'; [[-34, 20], [-6, 30], [26, 18], [44, 12]].forEach(([dx, L]) => { g.beginPath(); g.ellipse(cx + dx, 126 + L / 2, 6, L / 2 + 4, 0, 0, 7); g.fill(); });
    // cherry
    const ch = new Path2D(); ch.arc(cx + 4, 96, 16, 0, 7); const cg = g.createRadialGradient(cx - 2, 90, 2, cx + 4, 96, 16); cg.addColorStop(0, '#FF8A8A'); cg.addColorStop(1, '#B3132C'); g.fillStyle = cg; g.fill(ch); ink(g, ch, 1.4);
    g.strokeStyle = '#5E7A3A'; g.lineWidth = 3; g.beginPath(); g.moveTo(cx + 6, 82); g.quadraticCurveTo(cx + 12, 62, cx + 26, 58); g.stroke(); star(g, cx - 2, 90, 6);
    // little yellow-blue sugar dots, the "L.T.cake" kind of finish
    for (let i = 0; i < 26; i++) { g.fillStyle = i % 2 ? '#9CC2EC' : '#FFFFFF'; g.beginPath(); g.arc(cx - 60 + r() * 120, 160 + r() * 70, 2.2, 0, 7); g.fill(); }
    grain(g, W, H, .09); return c;
  }

  // --- a glass cloche on a footed cake plate: the order-up dome ---
  function cloche() {
    const W = 360, H = 420, [c, g] = C(W, H), cx = W / 2;
    const foot = new Path2D(); foot.moveTo(cx - 40, 400); foot.lineTo(cx + 40, 400); foot.lineTo(cx + 16, 340); foot.lineTo(cx - 16, 340); foot.closePath(); g.fillStyle = '#F3F6FA'; g.fill(foot); ink(g, foot, 1.6);
    const plate = new Path2D(); plate.ellipse(cx, 336, 160, 26, 0, 0, 7); g.fillStyle = '#FFFFFF'; g.fill(plate); g.strokeStyle = '#C8A866'; g.lineWidth = 3; g.beginPath(); g.ellipse(cx, 336, 150, 22, 0, 0, 7); g.stroke(); ink(g, plate, 1.6);
    const dome = new Path2D(); dome.moveTo(cx - 130, 330); dome.bezierCurveTo(cx - 140, 120, cx + 140, 120, cx + 130, 330); dome.closePath();
    blob(g, cx, 270, 90, ['rgba(255,236,190,.55)', 'rgba(255,236,190,0)'], 24);
    g.fillStyle = 'rgba(224,240,248,.28)'; g.fill(dome); innerGlow(g, dome, 'rgba(255,255,255,.95)', 22, 6);
    g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx - 100, 290); g.bezierCurveTo(cx - 110, 200, cx - 70, 170, cx - 40, 160); g.stroke();
    const knob = new Path2D(); knob.arc(cx, 162, 16, 0, 7); g.fillStyle = goldGrad(g, cx - 16, 146, cx + 16, 178); g.fill(knob); ink(g, knob, 1.4);
    ink(g, dome, 1.5, 'rgba(110,80,64,.45)'); star(g, cx + 70, 200, 12); star(g, cx - 60, 240, 7);
    grain(g, W, H, .04); return c;
  }

  // --- the pavement menu board: what the kitchen fixes, written like a menu ---
  function menuBoard(title, items) {
    const W = 380, H = 560, [c, g] = C(W, H);
    g.fillStyle = '#B88A5E'; g.beginPath(); g.roundRect(6, 6, W - 12, H - 12, 18); g.fill();
    g.fillStyle = '#2F3B34'; g.beginPath(); g.roundRect(26, 26, W - 52, H - 52, 10); g.fill();
    g.save(); g.globalAlpha = .08; for (let i = 0; i < 900; i++) { g.fillStyle = '#FFFFFF'; g.fillRect(30 + r() * (W - 60), 30 + r() * (H - 60), 1.5, 1.5); } g.restore();
    g.textAlign = 'center'; g.fillStyle = '#F6EFE2'; g.font = 'italic 600 56px Roffelia'; g.fillText(title, W / 2, 96);
    g.strokeStyle = '#F2C4CC'; g.lineWidth = 2; g.beginPath(); g.moveTo(90, 112); g.quadraticCurveTo(W / 2, 124, W - 90, 112); g.stroke();
    g.font = 'italic 500 32px Roffelia'; items.forEach((t, i) => { const y = 168 + i * 50; g.fillStyle = ['#F6EFE2', '#F2C4CC', '#CFE3EA', '#F3E39A', '#CDE7D3', '#E2D6F3'][i % 6]; g.textAlign = 'left'; g.fillText(t, 58, y); g.fillStyle = 'rgba(246,239,226,.35)'; g.textAlign = 'right'; g.fillText('. . . . .', W - 54, y); });
    grain(g, W, H, .05); return c;
  }

  // --- an order ticket for the rail ---
  function ticket(n, col) {
    const W = 120, H = 180, [c, g] = C(W, H);
    g.fillStyle = '#FFFDF7'; g.beginPath(); g.moveTo(0, 0); g.lineTo(W, 0); for (let x = W; x >= 0; x -= 10) g.lineTo(x, H - (x / 10 % 2 ? 0 : 8)); g.closePath(); g.fill();
    g.fillStyle = col; g.fillRect(0, 0, W, 22); g.fillStyle = '#3B3531'; g.font = '600 24px Roffelia'; g.fillText('#' + n, 12, 52);
    g.strokeStyle = 'rgba(80,70,64,.55)'; g.lineWidth = 2; for (let k = 0; k < 5; k++) { g.beginPath(); g.moveTo(12, 74 + k * 18); g.lineTo(12 + 40 + r() * 54, 74 + k * 18); g.stroke(); }
    grain(g, W, H, .05); return c;
  }

  // --- pearl ombré sheer drape: no flag stripes, a sugared-almond glaze drifting through blush, butter, mint and lilac ---
  function drape(W = 512, H = 640, seed = 0) {
    const [c, g] = C(W, H);
    const base = g.createLinearGradient(0, 0, W * .4, H); [['#F7E3E6', 0], ['#FBEBD7', .25], ['#F4F1DA', .45], ['#E2F0E8', .62], ['#DDE9F6', .8], ['#EADFF3', 1]].forEach(([cc, t]) => base.addColorStop(t, cc)); g.fillStyle = base; g.fillRect(0, 0, W, H);
    // folds: soft vertical light and shade
    for (let x = 0; x < W; x += 2) { const v = Math.sin(x / W * Math.PI * 9 + seed) * .5 + Math.sin(x / W * Math.PI * 23 + seed * 2) * .2; g.fillStyle = v > 0 ? `rgba(255,255,255,${v * .35})` : `rgba(150,120,150,${-v * .14})`; g.fillRect(x, 0, 2, H); }
    // an iridescent sheen band, diagonal
    g.save(); g.globalCompositeOperation = 'soft-light'; const sh = g.createLinearGradient(0, H * .2, W, H * .7); ['rgba(255,190,210,0)', 'rgba(255,190,210,.7)', 'rgba(190,230,255,.7)', 'rgba(220,200,255,.6)', 'rgba(255,255,255,0)'].forEach((cc, i) => sh.addColorStop(i / 4, cc)); g.fillStyle = sh; g.fillRect(0, 0, W, H); g.restore();
    // a scalloped hem with a gold thread
    g.fillStyle = 'rgba(255,255,255,.75)'; for (let x = 0; x < W; x += 32) { g.beginPath(); g.arc(x + 16, H - 6, 16, Math.PI, 0); g.fill(); }
    g.strokeStyle = '#D9BC7A'; g.lineWidth = 2; g.beginPath(); for (let x = 0; x <= W; x += 32) { g.moveTo(x, H - 6); g.arc(x + 16, H - 6, 16, Math.PI, 0); } g.stroke();
    for (let i = 0; i < 40; i++) star(g, r() * W, r() * H * .9, 2 + r() * 4, '#FFFFFF', .5 + r() * .4);
    grain(g, W, H, .04); return c;
  }

  // --- a rose garland swag for valances and cornices ---
  function garland(W = 1024, H = 160) {
    const [c, g] = C(W, H);
    const pts = []; for (let i = 0; i <= 60; i++) { const t = i / 60; pts.push([t * W, 30 + Math.sin(t * Math.PI * 3) * 6 + Math.abs(Math.sin(t * Math.PI * 3)) * 70]); }
    g.strokeStyle = '#8EB79A'; g.lineWidth = 6; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke();
    pts.forEach(([x, y], i) => { if (i % 2) { g.fillStyle = '#A7CDB0'; g.beginPath(); g.ellipse(x, y + (i % 4 ? 8 : -8), 10, 5, i, 0, 7); g.fill(); } });
    pts.forEach(([x, y], i) => { if (i % 5 === 0) { const R = 12 + (i % 3) * 3; const rg = g.createRadialGradient(x - 3, y - 3, 1, x, y, R); rg.addColorStop(0, '#FFF2F4'); rg.addColorStop(.6, ['#F4B9C6', '#F7D2B7', '#FFFFFF', '#CFE0F5'][i % 4]); rg.addColorStop(1, '#D98DA0'); g.fillStyle = rg; g.beginPath(); g.arc(x, y, R, 0, 7); g.fill(); g.strokeStyle = 'rgba(160,80,100,.5)'; g.lineWidth = 1.2; g.beginPath(); g.arc(x, y, R * .5, 3.5, 5.8); g.stroke(); } });
    for (let k = 1; k < 3; k++) { const x = W * k / 3; g.strokeStyle = '#F2C4CC'; g.lineWidth = 4; g.beginPath(); g.moveTo(x, 30); g.quadraticCurveTo(x - 20, 70, x - 10, 120); g.moveTo(x, 30); g.quadraticCurveTo(x + 24, 70, x + 14, 116); g.stroke(); g.fillStyle = '#F2C4CC'; g.beginPath(); g.ellipse(x - 12, 26, 14, 8, -.4, 0, 7); g.ellipse(x + 12, 26, 14, 8, .4, 0, 7); g.fill(); }
    grain(g, W, H, .05); return c;
  }

  // --- a tiered parfait glass and a macaron stack for the counter ---
  function parfait() {
    const W = 220, H = 380, [c, g] = C(W, H), cx = W / 2;
    const cup = new Path2D(); cup.moveTo(cx - 70, 70); cup.lineTo(cx + 70, 70); cup.bezierCurveTo(cx + 70, 200, cx + 20, 230, cx + 10, 250); cup.lineTo(cx - 10, 250); cup.bezierCurveTo(cx - 20, 230, cx - 70, 200, cx - 70, 70); cup.closePath();
    outerGlow(g, cup, 'rgba(255,255,255,.95)', 18);
    g.save(); g.clip(cup); [['#F7E7C8', 70, 110], ['#E8456E', 110, 150], ['#FFF6EE', 150, 185], ['#9CC2EC', 185, 220], ['#F49B5B', 220, 260]].forEach(([col, y0, y1]) => { g.save(); g.filter = 'blur(5px)'; g.fillStyle = col; g.fillRect(0, y0, W, y1 - y0 + 6); g.restore(); }); g.restore();
    innerGlow(g, cup, 'rgba(255,255,255,.9)', 14, 4);
    g.fillStyle = '#FFFFFF'; [[-30, 60, 26], [0, 46, 30], [30, 60, 26]].forEach(([dx, y, R]) => { g.beginPath(); g.arc(cx + dx, y, R, 0, 7); g.fill(); });
    const ch = new Path2D(); ch.arc(cx + 6, 22, 14, 0, 7); g.fillStyle = '#D61F45'; g.fill(ch); star(g, cx + 2, 18, 5);
    const st = new Path2D(); st.moveTo(cx - 6, 250); st.lineTo(cx - 4, 330); st.lineTo(cx - 50, 352); st.lineTo(cx + 50, 352); st.lineTo(cx + 4, 330); st.lineTo(cx + 6, 250); g.fillStyle = 'rgba(235,245,250,.9)'; g.fill(st); ink(g, st, 1.2, 'rgba(110,80,64,.4)');
    g.strokeStyle = '#F2C4CC'; g.lineWidth = 4; g.beginPath(); g.moveTo(cx - 8, 300); g.quadraticCurveTo(cx - 30, 320, cx - 22, 340); g.moveTo(cx + 8, 300); g.quadraticCurveTo(cx + 34, 316, cx + 26, 338); g.stroke();
    grain(g, W, H, .05); return c;
  }

  // ---------- watercolour, after Tyler Hobbs: deform a polygon by recursive midpoint offsets, then stack many faint layers ----------
  const gauss = () => { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  function deform(pts, depth, vari) { if (!depth) return pts; const out = [];
    for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; const v = a[2]; out.push(a);
      out.push([(a[0] + b[0]) / 2 + gauss() * vari * v, (a[1] + b[1]) / 2 + gauss() * vari * v, v * (.85 + r() * .3)]); }
    return deform(out, depth - 1, vari / 2); }
  function wash(g, cx, cy, rx, ry, col, layers = 26, alpha = .05) {
    const base = []; for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; base.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry, .6 + r() * .8]); }
    const b0 = deform(base, 3, (rx + ry) / 12);
    g.save(); g.fillStyle = col; g.globalAlpha = alpha;
    for (let l = 0; l < layers; l++) { const p = deform(b0, 2, (rx + ry) / 18); g.beginPath(); p.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill(); }
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
    clusters.forEach(([dx, fy, rx, ry], i) => { wash(g, cx + dx, H * fy, rx, ry, greens[i % 2], 14, .08); wash(g, cx + dx - rx * .25, H * fy - ry * .3, rx * .6, ry * .5, greens[2], 10, .085); });
    for (let i = 0; i < 70; i++) { const cl = clusters[i % clusters.length]; const x = cx + cl[0] + gauss() * cl[2] * .5, y = H * cl[1] + gauss() * cl[3] * .45; g.fillStyle = greens[3]; g.globalAlpha = .55; g.beginPath(); g.ellipse(x, y, 7, 4, r() * 3, 0, 7); g.fill(); g.globalAlpha = 1; }
    if (kind === 'blossom') for (let i = 0; i < 40; i++) { const cl = clusters[i % clusters.length]; star(g, cx + cl[0] + gauss() * cl[2] * .45, H * cl[1] + gauss() * cl[3] * .4, 5, '#FFFFFF', .9); }
    // ink: broken contour arcs around each cluster
    g.strokeStyle = 'rgba(70,90,70,.32)'; g.lineWidth = 1.6;
    clusters.forEach(([dx, fy, rx, ry]) => { for (let k = 0; k < 2; k++) { const a = Math.PI * (1.05 + r() * .8), L = .25 + r() * .35; g.beginPath(); g.ellipse(cx + dx, H * fy, rx * .92, ry * .88, 0, a, a + L); g.stroke(); } });
    grain(g, W, H, .06); return c;
  }
  function bush(seed = 1, flowers = ['#F4B9C6', '#FFFFFF', '#F7D9A8']) {
    s = 303 + seed * 131; const W = 360, H = 220, [c, g] = C(W, H);
    [[-80, 130, 90, 70], [60, 130, 100, 74], [-10, 100, 110, 80]].forEach(([dx, y, rx, ry]) => { wash(g, W / 2 + dx, y, rx, ry, '#8DBB8E', 14, .085); wash(g, W / 2 + dx - 20, y - 20, rx * .6, ry * .5, '#B8D9A8', 10, .085); });
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

  return { heartClock, candelabra, drink, pudding, cloche, menuBoard, ticket, drape, garland, parfait, star, grain, goldGrad, tree, bush, lampPost, windowBox, framed, plant, shadowBlob, wash };
})();
