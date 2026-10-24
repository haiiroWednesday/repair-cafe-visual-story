/* Café china built in 3D, rendered the CSEN 20 way: toon shading with a soft three-step ramp,
   crayon-hatched canvas textures, an ink hull pushed out along the normals, then saved as a
   transparent PNG so the 2D page can annotate over it. */
const T = THREE;
const INK = 0x7E6E64, GOLD = '#D6B56E', GOLD2 = '#B8955A';
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const ramp = (() => { const d = new Uint8Array([178, 178, 178, 255, 222, 222, 222, 255, 255, 255, 255, 255]); const t = new T.DataTexture(d, 3, 1, T.RGBAFormat); t.minFilter = t.magFilter = T.NearestFilter; t.needsUpdate = true; return t; })();
function crayonCanvas(base, w = 512, h = 512, n = 1400) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let i = 0; i < n; i++) { const x = rnd() * w, y = rnd() * h, L = 6 + rnd() * 16, a = -.5 + rnd() * .25; g.strokeStyle = rnd() < .55 ? `rgba(90,60,70,${.035 + rnd() * .05})` : `rgba(255,255,255,${.08 + rnd() * .12})`; g.lineWidth = 1 + rnd() * 2.2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke(); }
  return c;
}
function tex(c) { const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4; return t; }
function toon(c) { return new T.MeshToonMaterial({ color: 0xffffff, map: tex(c), gradientMap: ramp }); }
function flat(hex) { return toon(crayonCanvas(hex, 128, 128, 160)); }
const outlineMat = (w) => new T.ShaderMaterial({ side: T.BackSide, uniforms: { w: { value: w } }, vertexShader: 'uniform float w; void main(){ vec3 p = position + normal * w; gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0); }', fragmentShader: 'void main(){ gl_FragColor = vec4(0.494,0.431,0.392,1.0); }' });
function inked(geo, mat, w = .012) { const g = new T.Group(); const m = new T.Mesh(geo, mat); g.add(m); g.add(new T.Mesh(geo, outlineMat(w))); return g; }
function rose(g, x, y, r, col) { g.fillStyle = '#9CCFB8'; g.beginPath(); g.ellipse(x - r * 1.6, y + r * .3, r * .9, r * .45, -.4, 0, 7); g.fill(); g.beginPath(); g.ellipse(x + r * 1.6, y + r * .3, r * .9, r * .45, .4, 0, 7); g.fill(); g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = r * .22; g.beginPath(); g.arc(x, y, r * .55, .5, 5.2); g.stroke(); g.fillStyle = '#86AEDC'; [[-2.3, 1.3], [2.3, 1.3]].forEach(([a, b]) => { g.beginPath(); g.arc(x + a * r, y + b * r, r * .22, 0, 7); g.fill(); }); }
// porcelain texture painted in lathe UV space: v=0 bottom of the profile, v=1 top
function chinaCanvas(tint, opt = {}) {
  const c = crayonCanvas('#FFFDF9', 1024, 512, 1600), g = c.getContext('2d'), H = 512;
  const band = (v0, v1, col) => { g.fillStyle = col; g.fillRect(0, H * (1 - v1), 1024, H * (v1 - v0)); };
  (opt.gold || []).forEach(v => band(v - .006, v + .006, GOLD));
  if (opt.band) band(opt.band[0], opt.band[1], tint + 'AA');
  if (opt.roses) { const [v, n, r] = opt.roses; for (let i = 0; i < n; i++) rose(g, (i + .5) * 1024 / n, H * (1 - v), r, opt.roseCol || '#EFA3A6'); }
  if (opt.dots) { const [v, n] = opt.dots; g.fillStyle = GOLD; for (let i = 0; i < n; i++) { g.beginPath(); g.arc((i + .5) * 1024 / n, H * (1 - v), 2.4, 0, 7); g.fill(); } }
  if (opt.scallop) { const [v, n] = opt.scallop; g.strokeStyle = GOLD; g.lineWidth = 2.5; for (let i = 0; i < n; i++) { const x = (i + .5) * 1024 / n; g.beginPath(); g.arc(x, H * (1 - v), 1024 / n / 2, 0, Math.PI); g.stroke(); } }
  return c;
}
function lathe(pts, seg = 96, p0 = 0, pl = Math.PI * 2) { const g = new T.LatheGeometry(pts.map(([r, y]) => new T.Vector2(r, y)), seg, p0, pl); g.computeVertexNormals(); return g; }
function goldRing(r, y, tube = .012) { const m = new T.Mesh(new T.TorusGeometry(r, tube, 10, 120), flat(GOLD)); m.rotation.x = Math.PI / 2; m.position.y = y; return m; }

/* ---------- props ---------- */
function teacup(o) {
  const tint = o.tint || '#EFA3A6', root = new T.Group();
  // saucer
  const sp = [[0, 0], [.34, .0], [.38, .02], [.52, .05], [.54, .065], [.5, .07], [.37, .045], [.17, .04], [0, .04]];
  root.add(inked(lathe(sp), toon(chinaCanvas(tint, { gold: [.86], roses: [.55, 6, 16], roseCol: tint, dots: [.95, 60] }))));
  root.add(goldRing(.535, .063, .008));
  // cup: foot, bowl outer then inner
  const cp = [[0, .045], [.12, .045], [.13, .06], [.09, .1], [.1, .13], [.26, .2], [.36, .32], [.42, .46], [.44, .5], [.43, .505], [.4, .46], [.34, .33], [.24, .22], [.0, .19]];
  const glass = !!o.cut;
  if (glass) { cp.splice(0, cp.length, [0, .045], [.12, .045], [.13, .06], [.06, .1], [.05, .16], [.12, .2], [.22, .28], [.28, .42], [.3, .58], [.31, .72], [.3, .73], [.28, .58], [.26, .42], [.2, .29], [0, .26]); }
  if (!glass) { root.add(inked(lathe(cp), toon(chinaCanvas(tint, { gold: [.06, .9, .94], band: o.band === false ? null : [.78, .86], roses: [.42, 6, 22], roseCol: tint, scallop: [.82, 18] })))); root.add(goldRing(.435, .5, .01)); }
  else {
    // a glass cup on a china saucer: the tea level reads from the side, like a parfait glass
    const yb = .27, yLevel = .27 + (.71 - .27) * o.pct / 100, rAt = y => y < .42 ? .2 + (.26 - .2) * (y - .29) / (.42 - .29) : y < .58 ? .26 + .02 * (y - .42) / .16 : .28 + .015 * (y - .58) / .14;
    const tg = new T.CylinderGeometry(rAt(yLevel) * .96, .2, yLevel - yb, 64); const tea = new T.Mesh(tg, toon(crayonCanvas('#C99A72', 256, 256, 260))); tea.position.y = (yLevel + yb) / 2; tea.renderOrder = 1; root.add(tea);
    const top = new T.Mesh(new T.CircleGeometry(rAt(yLevel) * .96, 64), toon(crayonCanvas('#DDB892', 128, 128, 80))); top.rotation.x = -Math.PI / 2; top.position.y = yLevel + .001; root.add(top);
    const lvl = new T.Mesh(new T.TorusGeometry(rAt(yLevel) * .97, .005, 6, 96), new T.MeshBasicMaterial({ color: 0x9A6E4C })); lvl.rotation.x = Math.PI / 2; lvl.position.y = yLevel; root.add(lvl);
    const gm = new T.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: .22, depthWrite: false, side: T.FrontSide });
    const cg = lathe(cp); const cup = new T.Mesh(cg, gm); cup.renderOrder = 2; root.add(cup);
    // glass outline: only the silhouette edges and the rim, drawn as lines
    const prof = cp.slice(0, glass ? 11 : 10); [-1, 1].forEach(sd => { const pts = prof.map(([r, y]) => new T.Vector3(sd * r, y, 0)); const L = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 60, .004, 6), new T.MeshBasicMaterial({ color: 0x7E6E64 })); L.userData.billboard = 1; root.add(L); });
    const rimL = new T.Mesh(new T.TorusGeometry(.31, .004, 6, 120), new T.MeshBasicMaterial({ color: 0x7E6E64 })); rimL.rotation.x = Math.PI / 2; rimL.position.y = .73; root.add(rimL);
    const tintBand = new T.Mesh(new T.TorusGeometry(.3, .014, 8, 120), toon(crayonCanvas(tint, 64, 64, 40))); tintBand.rotation.x = Math.PI / 2; tintBand.position.y = .69; root.add(tintBand);
    root.add(goldRing(.31, .725, .009)); root.add(goldRing(.12, .06, .01));
    // shine strokes on the glass
    const sh = new T.Mesh(new T.PlaneGeometry(.025, .16), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .8 })); sh.position.set(-.2, .52, .3); sh.rotation.z = .15; root.add(sh);
    window.__teaY = yLevel;
  }
  if (!glass && o.pct != null) {
    const yLevel = .2 + (.46 - .2) * o.pct / 100, rLevel = .24 + (.4 - .24) * (yLevel - .22) / (.46 - .22);
    const tea = new T.Mesh(new T.CircleGeometry(Math.max(.05, rLevel), 64), toon(crayonCanvas('#C99A72', 256, 256, 300))); tea.rotation.x = -Math.PI / 2; tea.position.y = yLevel; root.add(tea);
    const ring = new T.Mesh(new T.TorusGeometry(rLevel * .82, .006, 6, 80), new T.MeshBasicMaterial({ color: 0xE8C9A6 })); ring.rotation.x = Math.PI / 2; ring.position.y = yLevel + .002; root.add(ring);
  }
  // handle: a curl of gold
  if (!glass) {
  const curve = new T.CatmullRomCurve3([new T.Vector3(.41, .43, 0), new T.Vector3(.58, .46, 0), new T.Vector3(.62, .36, 0), new T.Vector3(.52, .26, 0), new T.Vector3(.36, .26, 0)]);
  root.add(inked(new T.TubeGeometry(curve, 60, .028, 12), flat(GOLD), .008));
  const curl = new T.CatmullRomCurve3([new T.Vector3(.56, .465, 0), new T.Vector3(.64, .5, 0), new T.Vector3(.66, .45, 0), new T.Vector3(.61, .44, 0)]);
  root.add(inked(new T.TubeGeometry(curl, 30, .014, 8), flat(GOLD), .006));
  }
  return root;
}
function teapot(o) {
  const tint = o.tint || '#86AEDC', root = new T.Group();
  const bp = [[0, 0], [.2, 0], [.22, .03], [.2, .05], [.3, .12], [.38, .26], [.37, .4], [.3, .52], [.22, .58], [.2, .6], [0, .6]];
  root.add(inked(lathe(bp), toon(chinaCanvas(tint, { gold: [.06, .1, .93], roses: [.45, 3, 30], roseCol: '#EFA3A6', scallop: [.85, 16], band: [.7, .74] }))));
  const lp = [[0, .6], [.21, .6], [.2, .64], [.15, .7], [.08, .73], [.05, .76], [.07, .8], [.0, .84]];
  root.add(inked(lathe(lp), toon(chinaCanvas(tint, { gold: [.1, .6], dots: [.3, 40] }))));
  const knob = new T.Mesh(new T.SphereGeometry(.05, 24, 16), flat(GOLD)); knob.position.y = .85; root.add(knob);
  const spout = new T.CatmullRomCurve3([new T.Vector3(-.3, .22, 0), new T.Vector3(-.45, .3, 0), new T.Vector3(-.52, .48, 0), new T.Vector3(-.6, .56, 0)]);
  root.add(inked(new T.TubeGeometry(spout, 40, .05, 16), toon(crayonCanvas('#FFFDF9', 128, 128, 120)), .01));
  const hc = new T.CatmullRomCurve3([new T.Vector3(.34, .48, 0), new T.Vector3(.56, .52, 0), new T.Vector3(.6, .32, 0), new T.Vector3(.46, .16, 0), new T.Vector3(.34, .16, 0)]);
  root.add(inked(new T.TubeGeometry(hc, 60, .035, 12), flat(GOLD), .01));
  return root;
}
function candle(o) {
  const col = o.col || '#F2B8C6', root = new T.Group();
  const holder = [[0, 0], [.16, 0], [.16, .02], [.06, .05], [.04, .12], [.06, .15], [.03, .2], [.1, .24], [.11, .26], [0, .26]];
  root.add(inked(lathe(holder), flat(GOLD), .008));
  const c = crayonCanvas(col, 256, 512, 400), g = c.getContext('2d'); g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 7; for (let k = -10; k < 20; k++) { g.beginPath(); g.moveTo(-20, k * 40); g.lineTo(280, k * 40 + 120); g.stroke(); }
  const body = new T.Mesh(new T.CylinderGeometry(.045, .05, .7, 32), toon(c)); body.position.y = .61; const bg = new T.Group(); bg.add(body); const bo = new T.Mesh(body.geometry, outlineMat(.006)); bo.position.copy(body.position); bg.add(bo); root.add(bg);
  const fl = new T.Mesh(new T.SphereGeometry(.04, 20, 12), new T.MeshBasicMaterial({ color: 0xFBE3A0 })); fl.scale.set(.8, 1.9, .8); fl.position.y = 1.03; root.add(fl);
  const core = new T.Mesh(new T.SphereGeometry(.018, 12, 8), new T.MeshBasicMaterial({ color: 0xF0A05A })); core.scale.set(.8, 1.6, .8); core.position.y = 1.01; root.add(core);
  const glow = new T.Mesh(new T.SphereGeometry(.11, 20, 12), new T.MeshBasicMaterial({ color: 0xFFF3C8, transparent: true, opacity: .35 })); glow.position.y = 1.04; root.add(glow);
  return root;
}
function vase(o) {
  const root = new T.Group();
  const vp = [[0, 0], [.12, 0], [.12, .02], [.08, .05], [.16, .16], [.2, .3], [.17, .42], [.1, .5], [.09, .56], [.13, .6], [.12, .61], [.08, .58], [0, .58]];
  root.add(inked(lathe(vp, 72), toon(chinaCanvas('#86AEDC', { gold: [.04, .97], dots: [.5, 30] })), .008));
  const cols = o.cols || ['#EFA3A6', '#F6DEA2', '#C9B8E8', '#EFA3A6', '#F7D3CC', '#C9B8E8', '#F6DEA2'];
  const pos = [[0, .86, 0], [-.16, .78, .05], [.16, .8, .04], [-.07, .96, -.05], [.09, .95, .02], [-.24, .66, 0], [.24, .68, 0]];
  pos.forEach((p, i) => {
    const stem = new T.Mesh(new T.CylinderGeometry(.006, .006, Math.hypot(p[0], p[1] - .56), 6), flat('#86A97A')); stem.position.set(p[0] / 2, (p[1] + .56) / 2, p[2] / 2); stem.lookAt(p[0], p[1], p[2]); stem.rotateX(Math.PI / 2); root.add(stem);
    const leaf = new T.Mesh(new T.SphereGeometry(.05, 12, 8), flat('#A8D5C2')); leaf.scale.set(1.4, .35, .7); leaf.position.set(p[0] * .7 + .04, p[1] * .9, p[2]); leaf.rotation.z = .5 * (i % 2 ? 1 : -1); root.add(leaf);
    const c = crayonCanvas(cols[i], 256, 256, 300), g = c.getContext('2d'); g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 6; for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(128, 128, 20 + k * 22, k, k + 4); g.stroke(); }
    const rad = .075 + (i % 3) * .01, bl = new T.Group();
    const head = inked(new T.SphereGeometry(rad, 24, 16), toon(c), .005); head.scale.set(1, .78, 1); bl.add(head);
    for (let k = 0; k < 2; k++) { const pet = new T.Mesh(new T.TorusGeometry(rad * (.95 + k * .2), rad * .28, 10, 32), toon(crayonCanvas(cols[i], 64, 64, 30))); pet.rotation.x = Math.PI / 2; pet.position.y = -rad * (.15 + k * .22); bl.add(pet); }
    bl.position.set(p[0], p[1], p[2]); bl.rotation.x = .5; root.add(bl);
  });
  return root;
}
// three-tier stand. tiers given as [screenYfrac, radiusFrac] of the target box; orthographic so the 2D layout lines up
function stand(o) {
  const root = new T.Group(), tint = o.tint || '#EFA3A6';
  const mat = toon(chinaCanvas(tint, { gold: [.63, .66], roses: [.74, 12, 13], roseCol: tint, dots: [.6, 90] }));
  o.tiers.forEach(([Y, R]) => {
    const pp = [[0, 0], [R * .25, 0], [R * .3, .006], [R * .9, .02], [R, .04], [R * .99, .05], [R * .9, .036], [R * .3, .024], [0, .024]];
    const g = inked(lathe(pp), mat, .006); g.position.y = Y; root.add(g);
    const r = goldRing(R * .995, Y + .046, .006); root.add(r);
  });
  const top = o.tiers[0][0], bot = o.tiers[o.tiers.length - 1][0];
  const stem = new T.Mesh(new T.CylinderGeometry(.012, .012, top - bot + .32, 16), flat(GOLD)); stem.position.y = (top + bot) / 2 + .1; root.add(stem);
  for (let k = 0; k < o.tiers.length - 1; k++) { const b = new T.Mesh(new T.SphereGeometry(.025, 16, 12), flat(GOLD)); b.position.y = (o.tiers[k][0] + o.tiers[k + 1][0]) / 2; root.add(b); }
  const loop = new T.Mesh(new T.TorusGeometry(.06, .01, 10, 60), flat(GOLD)); loop.position.y = top + .3; root.add(loop);
  const fin = new T.Mesh(new T.SphereGeometry(.022, 16, 12), flat(GOLD)); fin.position.y = top + .38; root.add(fin);
  const foot = lathe([[0, 0], [.12, 0], [.12, .01], [.05, .04], [.02, .06], [0, .06]]); const f = new T.Mesh(foot, flat(GOLD)); f.position.y = bot - .07; root.add(f);
  return root;
}
function cake(o) {
  const root = new T.Group();
  root.add(inked(lathe([[0, 0], [.44, 0], [.46, .015], [.44, .025], [0, .025]]), toon(chinaCanvas('#86AEDC', { gold: [.6], dots: [.8, 80] })), .006));
  const tier = (r, y0, h, col, drip) => {
    const c = crayonCanvas(col, 1024, 256, 900), g = c.getContext('2d'); g.fillStyle = drip;
    for (let i = 0; i < 24; i++) { const x = i * 1024 / 24; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 43, 0); g.lineTo(x + 43, 30 + (i * 37) % 40); g.arc(x + 21, 30 + (i * 37) % 40, 21, 0, Math.PI); g.fill(); }
    const cyl = new T.CylinderGeometry(r, r, h, 96, 1, true); const m = inked(cyl, toon(c), .006); m.position.y = y0 + h / 2; root.add(m);
    const lid = new T.Mesh(new T.CircleGeometry(r, 96), toon(crayonCanvas(drip, 256, 256, 200))); lid.rotation.x = -Math.PI / 2; lid.position.y = y0 + h; root.add(lid);
    const bead = new T.Mesh(new T.TorusGeometry(r, .018, 10, 120), toon(crayonCanvas('#FFFDF9', 128, 128, 80))); bead.rotation.x = Math.PI / 2; bead.position.y = y0 + h; root.add(bead);
    const bead2 = bead.clone(); bead2.position.y = y0 + .01; root.add(bead2);
  };
  const y0 = o.y0, y1 = o.y1, y2 = o.y2; root.children[0].position.y = y0 - .025;
  tier(.4, y0, y1 - y0, '#F8E6B4', '#F7D3CC'); tier(.28, y1, y2 - y1, '#F7D3CC', '#FFFDF9');
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 + .2, ch = new T.Mesh(new T.SphereGeometry(.02, 16, 12), toon(crayonCanvas('#E8857B', 64, 64, 30))); ch.position.set(Math.cos(a) * .35, y1 + .02, Math.sin(a) * .35); root.add(ch); }
  const cols = ['#E8857B', '#EFC15E', '#8FCBB2', '#86AEDC', '#B79FD6'];
  (o.candles || []).forEach(([x, z], i) => {
    const cn = new T.Mesh(new T.CylinderGeometry(.007, .007, .11, 12), toon(crayonCanvas(cols[i % 5], 64, 64, 40))); cn.position.set(x, o.y2 + .06, z); root.add(cn);
    const fl = new T.Mesh(new T.SphereGeometry(.014, 12, 8), new T.MeshBasicMaterial({ color: 0xFBE3A0 })); fl.scale.set(.8, 1.8, .8); fl.position.set(x, o.y2 + .14, z); root.add(fl);
  });
  return root;
}


/* More props for the café pages: repair objects modelled where depth explains the fault.
   Same house style as props.html: crayon canvas textures, toon ramp, ink hull. */
(function () {
  const T = THREE;
  const SILVER = '#D9DCE2', BRASS = '#D6B56E', BRASS2 = '#C9A458';
  const sstep = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const dbl = c => { const m = toon(c); m.side = T.DoubleSide; return m; };
  function metalCanvas(base, w = 256, h = 512) {
    const c = crayonCanvas(base, w, h, 500), g = c.getContext('2d');
    g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(w * .08, 0, w * .06, h); g.fillRect(w * .58, 0, w * .03, h);
    g.fillStyle = 'rgba(80,80,100,.10)'; g.fillRect(w * .3, 0, w * .12, h);
    return c;
  }
  function inkedD(geo, mat, w) { const g = new T.Group(); g.add(new T.Mesh(geo, mat)); g.add(new T.Mesh(geo, outlineMat(w))); return g; }
  function tube(pts, r, col, seg = 60, rs = 10) { return new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(p => new T.Vector3(...p))), seg, r, rs), toon(crayonCanvas(col, 64, 64, 30))); }
  function box(w, h, d, col, n = 200) { return new T.Mesh(new T.BoxGeometry(w, h, d), toon(crayonCanvas(col, 128, 128, n))); }
  function inkBox(w, h, d, col, ow = .006, n = 200) { return inked(new T.BoxGeometry(w, h, d), toon(crayonCanvas(col, 128, 128, n)), ow); }

  /* ---------- sewing machine needle, 130/705H, size 70/10 ---------- */
  function needle(o) {
    const root = new T.Group();
    const R = .075, r = .033, pts = [[0, 0], [.004, .01], [.012, .035], [.022, .07], [.03, .11]];
    for (let y = .14; y < .96; y += .008) pts.push([r, y]);
    for (let y = .96; y <= 1.06; y += .01) pts.push([r + (R - r) * sstep(.96, 1.06, y), y]);
    for (let y = 1.08; y < 1.7; y += .02) pts.push([R, y]);
    pts.push([R, 1.7], [R * .85, 1.715], [0, 1.715]);
    const geo = lathe(pts, 72);
    const pos = geo.attributes.position, col = new Float32Array(pos.count * 3).fill(1);
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
      let rr = Math.hypot(x, z); if (rr < 1e-6) continue;
      const phi = Math.atan2(x, z);
      let nr = rr;
      // long groove down the front: the thread lies in it on the way down
      let shade = 0;
      if (y > .25 && y < 1.02) { const a = Math.abs(phi); if (a < .62) { const g = Math.cos(a / .62 * Math.PI / 2) * sstep(.25, .3, y) * (1 - sstep(.96, 1.02, y)); nr -= rr * .42 * g; shade = Math.max(shade, Math.min(1, g * 1.6)); } }
      // scarf scooped out of the back, just above the eye, so the hook can pass
      const b = Math.PI - Math.abs(phi);
      if (y > .28 && y < .43 && b < .95) { const g = Math.sin(Math.PI * (y - .28) / .15) * Math.cos(b / .95 * Math.PI / 2); nr -= rr * .5 * g; shade = Math.max(shade, Math.min(1, g * 1.8)); }
      x = x / rr * nr; z = z / rr * nr;
      // flat side on the back of the shank
      if (y > 1.03 && z < -R * .55) { z = -R * .55; shade = Math.max(shade, .35); }
      pos.setXYZ(i, x, y, z); const c = 1 - .3 * shade; col[i * 3] = c * .97; col[i * 3 + 1] = c * .97; col[i * 3 + 2] = c;
    }
    // the eye: remove the faces that cross it, front and back, so it is a real hole
    const idx = geo.index.array, keep = [];
    for (let t = 0; t < idx.length; t += 3) {
      let cx = 0, cy = 0; for (let k = 0; k < 3; k++) { cx += pos.getX(idx[t + k]) / 3; cy += pos.getY(idx[t + k]) / 3; }
      const ex = cx / .0115, ey = (cy - .235) / .036;
      if (ex * ex + ey * ey < 1) continue;
      keep.push(idx[t], idx[t + 1], idx[t + 2]);
    }
    geo.setIndex(keep); geo.computeVertexNormals();
    geo.setAttribute('color', new T.BufferAttribute(col, 3));
    const nm = dbl(metalCanvas(SILVER)); nm.vertexColors = true;
    root.add(inkedD(geo, nm, .0045));
    // walls of the eye: a short slot running front to back
    const slot = new T.Mesh(new T.CylinderGeometry(1, 1, r * 2.1, 32, 1, true), new T.MeshBasicMaterial({ color: 0x8A8F99, side: T.DoubleSide }));
    slot.scale.set(.0108, 1, .034); slot.rotation.x = Math.PI / 2; slot.position.y = .235;
    slot.geometry.scale(1, 1, 1); slot.scale.set(.0108, 1, .034); root.add(slot);
    // size stamp on the shank
    window.__marks = { top: [0, 1.715, 0], shank: [0, 1.4, 0], flat: [0, 1.4, -R * .55], shoulder: [0, 1.0, 0], groove: [0, .65, r * .6], scarf: [0, .355, -r * .5], eye: [0, .235, 0], point: [0, 0, 0] };
    return root;
  }


  /* ---------- zipper slider, top plate drawn as glass so the teeth show ---------- */
  function slider(o) {
    const root = new T.Group(), SP = !!o.spread;
    const gap = SP ? .06 : 0;
    const off = x => x < -.45 && SP ? gap + (-.45 - x) * .32 : x < -.35 ? gap : x < .45 ? gap + (.2 - gap) * sstep(-.35, .45, x) : .2 + .35 * (x - .45) / .65;
    const doff = x => (off(x + .01) - off(x - .01)) / .02;
    const pitch = .1, tl = .14, tw = .07, th = .05;
    const tGeo = new T.BoxGeometry(tw, th, tl); // rounded enough under the ink
    const tMat = toon(crayonCanvas(BRASS, 64, 64, 40));
    for (let side = -1; side <= 1; side += 2) {
      for (let k = -11; k <= 11; k++) {
        const x = k * pitch + (side > 0 ? pitch / 2 : 0); if (x < -1.1 || x > 1.1) continue;
        const z = side * (.06 + off(x));
        const g = inked(tGeo, tMat, .004); g.position.set(x, 0, z); g.rotation.y = -side * Math.atan(doff(x)) * .9; root.add(g);
        // the little scoop on each tooth head
        const head = new T.Mesh(new T.SphereGeometry(.022, 10, 8), tMat); head.position.set(x, .02, z - side * tl * .38); head.scale.set(1, .6, 1); root.add(head);
      }
      // tape: a ribbon following the row
      const P = [], I = []; let n = 0;
      for (let x = -1.15; x <= 1.15001; x += .02) { const zi = side * (.06 + off(x) + .03), zo = zi + side * .3; P.push(x, -.005, zi, x, -.005, zo); if (n) { const a = (n - 1) * 2; I.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } n++; }
      const tg = new T.BufferGeometry(); tg.setAttribute('position', new T.Float32BufferAttribute(P, 3)); tg.setIndex(I); tg.computeVertexNormals();
      const tm = toon(crayonCanvas('#86AEDC', 256, 256, 300)); tm.side = T.DoubleSide; root.add(new T.Mesh(tg, tm));
      const edge = [], stitch = [];
      for (let x = -1.15; x <= 1.15001; x += .02) { const zi = side * (.06 + off(x) + .03); edge.push(new T.Vector3(x, 0, zi + side * .3)); stitch.push(new T.Vector3(x, .002, zi + side * .07)); }
      root.add(new T.Line(new T.BufferGeometry().setFromPoints(edge), new T.LineBasicMaterial({ color: 0x7E6E64 })));
      const st = new T.Line(new T.BufferGeometry().setFromPoints(stitch), new T.LineDashedMaterial({ color: 0xFFFDF9, dashSize: .025, gapSize: .018 })); st.computeLineDistances(); root.add(st);
    }
    // plates: trapezoids, narrow end at -x
    const hw0 = SP ? .22 : .155, hw1 = .33;
    const shape = new T.Shape(); shape.moveTo(-.45, -hw0); shape.lineTo(.45, -hw1); shape.lineTo(.45, hw1); shape.lineTo(-.45, hw0); shape.closePath();
    const plate = (y, glass) => {
      const g = new T.ExtrudeGeometry(shape, { depth: .03, bevelEnabled: true, bevelSize: .012, bevelThickness: .008, bevelSegments: 2 }); g.rotateX(Math.PI / 2); g.translate(0, y + .03, 0);
      if (!glass) return inked(g, toon(metalCanvas(SILVER, 256, 256)), .005);
      const grp = new T.Group(); const m = new T.Mesh(g, new T.MeshBasicMaterial({ color: 0xEEF3FA, transparent: true, opacity: .28, depthWrite: false })); m.renderOrder = 3; grp.add(m);
      grp.add(new T.LineSegments(new T.EdgesGeometry(g, 30), new T.LineBasicMaterial({ color: 0x7E6E64 }))); return grp;
    };
    const lift = SP ? .03 : 0;
    root.add(plate(.075 + lift, true)); root.add(plate(-.105 - lift, false));
    // flanges that curl round the teeth, on the bottom plate (the top ones are glass too)
    for (let sd = -1; sd <= 1; sd += 2) {
      const len = Math.hypot(.9, hw1 - hw0), ang = Math.atan2(hw1 - hw0, .9);
      const fl = new T.BoxGeometry(len, .05, .02); const fm = inked(fl, toon(metalCanvas(SILVER, 128, 128)), .004);
      fm.position.set(0, -.06 - lift, sd * (hw0 + hw1) / 2); fm.rotation.y = -sd * ang; root.add(fm);
      const ft = new T.Mesh(fl, new T.MeshBasicMaterial({ color: 0xEEF3FA, transparent: true, opacity: .25, depthWrite: false })); ft.position.set(0, .06 + lift, sd * (hw0 + hw1) / 2); ft.rotation.y = -sd * ang; root.add(ft);
      const fe = new T.LineSegments(new T.EdgesGeometry(fl), new T.LineBasicMaterial({ color: 0x7E6E64 })); fe.position.copy(ft.position); fe.rotation.copy(ft.rotation); root.add(fe);
    }
    // the wedge (the diamond) between the plates at the wide end
    const ws = new T.Shape(); ws.moveTo(.06, 0); ws.lineTo(.45, -.09); ws.lineTo(.45, .09); ws.closePath();
    const wg = new T.ExtrudeGeometry(ws, { depth: .15 + lift * 2, bevelEnabled: false }); wg.rotateX(Math.PI / 2); wg.translate(0, .075 + lift, 0);
    root.add(inked(wg, toon(crayonCanvas('#C9CDD6', 128, 128, 120)), .004));
    // bridge and pull tab, the tab held up
    const br = new T.Mesh(new T.TorusGeometry(.07, .018, 10, 30, Math.PI), toon(metalCanvas(SILVER, 64, 64))); br.position.set(.12, .12 + lift, 0); root.add(br);
    window.__marks = { narrow: [-.45, .1 + lift, 0], wide: [.45, .1 + lift, 0], wedge: [.3, .09 + lift, 0], jaw: [-.44, .09 + lift, -hw0], out: [-.9, .03, 0], inA: [.95, .03, -.45], inB: [.95, .03, .45], tab: [.12, .55, 0] };
    return root;
  }

  /* ---------- shared: wood, chains, pine-cone weights ---------- */
  function woodCanvas(base, w = 512, h = 512, dark = 'rgba(70,35,15,.25)') {
    const c = crayonCanvas(base, w, h, 700), g = c.getContext('2d');
    for (let i = 0; i < 46; i++) { const y = rnd() * h; g.strokeStyle = dark; g.lineWidth = .8 + rnd() * 1.8; g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x * .02 + i) * 4 + (rnd() - .5) * 3); g.stroke(); }
    return c;
  }
  const linkGeo = new T.TorusGeometry(.016, .0042, 6, 18);
  function chain(pts, opt = {}) {
    const grp = new T.Group(), cur = new T.CatmullRomCurve3(pts.map(p => new T.Vector3(...p)), false, 'catmullrom', .2);
    const L = cur.getLength(), step = opt.step || .027, n = Math.floor(L / step);
    const mat = opt.mat || toon(crayonCanvas(BRASS, 64, 64, 30)), up = new T.Vector3(0, 1, 0);
    for (let i = 0; i <= n; i++) {
      const u = i / n, p = cur.getPointAt(u), t = cur.getTangentAt(u);
      const m = new T.Mesh(linkGeo, mat); m.scale.set(1, 1.75, 1);
      m.quaternion.setFromUnitVectors(up, t); m.rotateY(i % 2 ? Math.PI / 2 : 0); m.position.copy(p); grp.add(m);
    }
    return grp;
  }
  function pinecone(h = .42) {
    const c = crayonCanvas('#8A5A3C', 512, 512, 300), g = c.getContext('2d');
    for (let row = 0; row < 14; row++) for (let k = 0; k < 12; k++) { const x = (k + (row % 2) * .5) * 512 / 12, y = row * 512 / 14 + 10; g.fillStyle = row % 3 ? '#9C6A47' : '#7A4A2E'; g.beginPath(); g.ellipse(x, y, 22, 18, 0, 0, Math.PI); g.fill(); g.strokeStyle = 'rgba(50,25,10,.55)'; g.lineWidth = 2; g.beginPath(); g.arc(x, y, 20, 0, Math.PI); g.stroke(); }
    const pts = [[0, 0], [.015, .01], [.04, .05], [.07, .13], [.088, .22], [.09, .3], [.082, .36], [.06, .41], [.04, .43], [.0, .44]].map(([r, y]) => [r * h / .44, y * h / .44]);
    const grp = new T.Group(); grp.add(inked(lathe(pts, 40), toon(c), .006));
    const hook = new T.Mesh(new T.TorusGeometry(.022, .006, 8, 20), toon(crayonCanvas(BRASS, 32, 32, 10))); hook.position.y = h + .02; grp.add(hook);
    return grp;
  }
  function sprocket(R = .07) {
    const g = new T.Group(), mat = toon(metalCanvas(BRASS, 128, 128));
    const d = new T.Mesh(new T.CylinderGeometry(R, R, .03, 40), mat); d.rotation.x = Math.PI / 2; g.add(d);
    const rim = new T.Mesh(new T.TorusGeometry(R, .006, 6, 40), new T.MeshBasicMaterial({ color: 0x7E6E64 })); rim.position.z = .016; g.add(rim);
    for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2, pin = new T.Mesh(new T.CylinderGeometry(.005, .005, .026, 6), toon(crayonCanvas(SILVER, 16, 16, 4))); pin.position.set(Math.cos(a) * (R + .01), Math.sin(a) * (R + .01), 0); pin.rotation.z = a - Math.PI / 2; g.add(pin); }
    const hub = new T.Mesh(new T.CylinderGeometry(.018, .018, .05, 16), mat); hub.rotation.x = Math.PI / 2; g.add(hub);
    return g;
  }

  /* ---------- cuckoo clock, whole, hanging ---------- */
  function cuckoo(o) {
    const root = new T.Group(), W = 1.0, H = .82, D = .42;
    const woodM = toon(woodCanvas('#A0673F')), darkM = toon(woodCanvas('#7A4A2E', 256, 256));
    root.add(inkBox2(W, H, D, woodM, [0, H / 2, 0]));
    // roof: two boards with an overhang, and a carved ridge
    for (const sd of [-1, 1]) { const rb = inked(new T.BoxGeometry(.66, .035, D + .22), darkM, .006); rb.position.set(sd * .27, H + .18, .02); rb.rotation.z = -sd * .58; root.add(rb); }
    const gable = new T.Shape(); gable.moveTo(-W / 2, 0); gable.lineTo(W / 2, 0); gable.lineTo(0, .33); gable.closePath();
    const gg = new T.ExtrudeGeometry(gable, { depth: D, bevelEnabled: false }); gg.translate(0, H, -D / 2); root.add(inked(gg, woodM, .006));
    // bird door with a small balcony
    // the bird door, on a hinge, with a lit nook behind it
    const nook = new T.Mesh(new T.BoxGeometry(.15, .15, .03), new T.MeshBasicMaterial({ color: 0xFFD9A0 })); nook.position.set(0, H + .1, D / 2 - .004); root.add(nook);
    const doorPivot = new T.Group(); doorPivot.position.set(-.08, H + .1, D / 2 + .012); root.add(doorPivot);
    const door = inkBox2(.16, .16, .02, darkM, [.08, 0, 0]); doorPivot.add(door);
    const knob = new T.Mesh(new T.SphereGeometry(.012, 10, 8), flat(BRASS)); knob.position.set(.14, 0, .014); doorPivot.add(knob);
    root.userData.door = doorPivot; root.userData.nook = nook;
    const bal = inkBox2(.62, .03, .12, darkM, [0, H - .06, D / 2 + .06]); root.add(bal);
    for (let k = 0; k < 9; k++) { const post = new T.Mesh(new T.CylinderGeometry(.008, .008, .07, 6), darkM); post.position.set(-.28 + k * .07, H - .01, D / 2 + .11); root.add(post); }
    // dial: cream face with roman hours, hands at a little before twelve
    const dc = document.createElement('canvas'); dc.width = dc.height = 512; const g = dc.getContext('2d');
    g.fillStyle = '#7A4A2E'; g.fillRect(0, 0, 512, 512); g.fillStyle = '#F4E6C8'; g.font = '700 46px serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'].forEach((t, i) => { const a = i / 12 * Math.PI * 2; g.save(); g.translate(256 + Math.sin(a) * 196, 256 - Math.cos(a) * 196); g.rotate(a); g.fillText(t, 0, 0); g.restore(); });
    g.strokeStyle = 'rgba(244,230,200,.5)'; g.lineWidth = 3; [150, 120, 90].forEach(r => { g.beginPath(); g.arc(256, 256, r, 0, 7); g.stroke(); });
    const dial = new T.Mesh(new T.CircleGeometry(.2, 48), new T.MeshToonMaterial({ map: tex(dc), gradientMap: ramp })); dial.position.set(0, H * .42, D / 2 + .015); root.add(dial);
    const dr = new T.Mesh(new T.TorusGeometry(.2, .012, 8, 48), darkM); dr.position.copy(dial.position); root.add(dr);
    const handM = new T.MeshBasicMaterial({ color: 0xF4E6C8 });
    const hh = new T.Mesh(new T.BoxGeometry(.016, .11, .006), handM); hh.position.set(-.01, H * .42 + .05, D / 2 + .022); hh.rotation.z = .2; root.add(hh);
    const mh = new T.Mesh(new T.BoxGeometry(.012, .16, .006), handM); mh.position.set(.006, H * .42 + .075, D / 2 + .024); mh.rotation.z = -.08; root.add(mh);
    // carved leaves: flat maple shapes stood on the front, round the dial
    const leaf = s2 => {
      const sh = new T.Shape(), N = 220;
      for (let i = 0; i <= N; i++) {
        const a = i / N * Math.PI * 2, b = a - Math.PI / 2; // b = 0 points up
        const lobe = Math.pow(Math.abs(Math.cos(2.5 * b)), 1.6), low = Math.cos(b) < -.55 ? .55 : 1;
        let rr = (.42 + .58 * lobe) * low + .05 * Math.abs(Math.sin(a * 17)) * lobe;
        if (Math.abs(b - Math.PI) < .12 || Math.abs(b + Math.PI) < .12) rr = .9; // the stem
        const x = Math.cos(a) * rr, y = Math.sin(a) * rr;
        i ? sh.lineTo(x * s2, y * s2) : sh.moveTo(x * s2, y * s2);
      }
      return new T.ExtrudeGeometry(sh, { depth: .025, bevelEnabled: true, bevelSize: .008, bevelThickness: .012, bevelSegments: 2 });
    };
    const veins = (grp, s2) => { [0, 1.1, -1.1, 2.2, -2.2].forEach(a => { const v = new T.Mesh(new T.BoxGeometry(.006, s2 * .8, .004), new T.MeshBasicMaterial({ color: 0x5E3A22 })); v.position.set(Math.sin(-a) * s2 * .4, Math.cos(a) * s2 * .4, .04); v.rotation.z = a; grp.add(v); }); };
    [[-.36, .62, .17, .3], [.36, .62, .17, -.3], [-.38, .18, .19, 2.6], [.38, .18, .19, -2.6], [-.2, .02, .14, 3.3], [.2, .02, .14, -3.3], [0, -.06, .16, 3.14]].forEach(([x, y, sz, r]) => { const lm = inked(leaf(sz), darkM, .005); veins(lm, sz); lm.position.set(x, y, D / 2 + .01); lm.rotation.z = r; root.add(lm); });
    // chains and weights: three wheels inside, two strands each; weights on one side, rings on the other
    const yb = -.0, drop = o.drop || 1.3;
    [-.24, 0, .24].forEach((x, i) => {
      const wy = -drop + (i === 1 ? .25 : 0) - (i === 2 ? .12 : 0);
      root.add(chain([[x - .06, yb, .04], [x - .06, (yb + wy) / 2, .05], [x - .06, wy + .46, .05]]));
      const pc = pinecone(); pc.position.set(x - .06, wy, .05); root.add(pc);
      const ry = -drop + .9 - wy * .3;
      root.add(chain([[x + .06, yb, .04], [x + .07, (yb - .5) / 2, .05], [x + .07, -.5 - i * .1, .05]]));
      const ring = new T.Mesh(new T.TorusGeometry(.035, .007, 8, 24), toon(crayonCanvas(BRASS, 32, 32, 10))); ring.position.set(x + .07, -.5 - i * .1 - .04, .05); root.add(ring);
    });
    const pend = new T.Group(); const rod = new T.Mesh(new T.BoxGeometry(.012, .7, .004), darkM); rod.position.y = -.35; pend.add(rod);
    const bob = inked(leaf(.09), darkM, .004); bob.position.y = -.72; pend.add(bob); pend.position.set(0, .02, -.02); pend.rotation.z = .12; root.add(pend);
    window.__marks = { dial: [0, H * .42, D / 2], door: [0, H + .1, D / 2], wheels: [0, .05, 0], weight: [-.06, -drop + .2, .05], ring: [.31, -.74, .05], chain: [-.06, -.4, .05], top: [0, H + .36, 0], bottom: [0, -drop, 0] };
    return root;
  }
  function inkBox2(w, h, d, mat, p) { const g = inked(new T.BoxGeometry(w, h, d), mat, .006); g.position.set(...p); return g; }

  /* ---------- the chain wheels, close up, in three states ---------- */
  function chainwheels(o) {
    const root = new T.Group(), st = o.state || 'off', R = .07, yw = .2;
    const woodM = toon(woodCanvas('#A0673F', 512, 256));
    // floor board with six holes, drawn as a slab with dark holes
    const fl = new T.Shape(); fl.moveTo(-.55, -.2); fl.lineTo(.55, -.2); fl.lineTo(.55, .2); fl.lineTo(-.55, .2); fl.closePath();
    const xs = [-.32, 0, .32];
    xs.forEach(x => [-1, 1].forEach(sd => { const h = new T.Path(); h.absellipse(x + sd * (R + .01), 0, .02, .02, 0, Math.PI * 2, true); fl.holes.push(h); }));
    const fg = new T.ExtrudeGeometry(fl, { depth: .04, bevelEnabled: false }); fg.rotateX(Math.PI / 2); root.add(inked(fg, woodM, .005));
    // back plate of the movement
    const bp = inkBox2(1.0, .36, .012, toon(crayonCanvas('#EFE6D2', 256, 256, 200)), [0, .2, -.12]); root.add(bp);
    xs.forEach((x, i) => {
      const w = sprocket(R); w.position.set(x, yw, 0); root.add(w);
      const arb = new T.Mesh(new T.CylinderGeometry(.008, .008, .12, 8), toon(crayonCanvas(SILVER, 16, 16, 4))); arb.rotation.x = Math.PI / 2; arb.position.set(x, yw, -.06); root.add(arb);
      const L = x - (R + .01), Rr = x + (R + .01), low = -.55;
      const cz = .028, over = [[L, low, cz], [L, -.1, cz], [L, yw - .02, cz], [x - R * .72, yw + R * .72 + .01, cz], [x, yw + R + .012, cz], [x + R * .72, yw + R * .72 + .01, cz], [Rr, yw - .02, cz], [Rr, -.1, cz], [Rr, low, cz]];
      if (st === 'off' && i === 1) {
        // fallen off: the chain slumps on the floor beside the wheel and hangs out of one hole
        root.add(chain([[L, low, 0], [L, -.1, 0], [L, .03, 0], [L - .05, .05, .06], [L - .12, .045, .1], [L - .04, .045, .14], [L + .08, .045, .12], [L + .12, .048, .05]]));
      } else if (st === 'fed' && i === 1) {
        // a stiff wire comes up through the right hole, over the wheel, and draws the chain after it
        root.add(chain(over.slice(0, 5)));
        const wire = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([[x, yw + R + .012, cz], [x + R * .72, yw + R * .72 + .012, cz], [Rr, yw - .02, cz], [Rr, -.1, cz], [Rr, -.35, cz + .02], [Rr + .05, -.55, cz + .06]].map(p => new T.Vector3(...p))), 60, .004, 6), new T.MeshBasicMaterial({ color: 0x5E6470 })); root.add(wire);
        const hook = new T.Mesh(new T.TorusGeometry(.012, .004, 6, 16, Math.PI * 1.4), new T.MeshBasicMaterial({ color: 0x5E6470 })); hook.position.set(x - .005, yw + R + .015, cz); root.add(hook);
      } else root.add(chain(over));
      if (st === 'tied') {
        const tie = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(Array.from({ length: 40 }, (_, k) => { const a = k / 39 * Math.PI * 2 * 2.2; return new T.Vector3(x + Math.cos(a) * (R + .03), -.12 - k * .0012, Math.sin(a) * .03); })), 80, .006, 6), toon(crayonCanvas('#E8857B', 32, 32, 10)));
        root.add(tie);
        const tail = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([[x + R + .03, -.165, 0], [x + R + .07, -.2, .02], [x + R + .08, -.26, .03]].map(p => new T.Vector3(...p))), 20, .006, 6), toon(crayonCanvas('#E8857B', 32, 32, 10))); root.add(tail);
      }
    });
    window.__marks = { wheel: [0, yw, .02], wheelL: [-.32, yw, .02], floor: [-.5, .02, .2], hole: [.08, 0, 0], loose: [-.15, .05, .1], wire: [.08, -.4, .03], tie: [.32 + R + .03, -.14, 0], tieM: [R + .03, -.14, 0] };
    return root;
  }

  /* ---------- pull-string voice unit: drum, cord and a flat spiral spring ---------- */
  function pullspring(o) {
    const root = new T.Group(), bent = o.state === 'bent';
    // housing: a shallow cup, a quarter cut away so the spring shows
    const hp = [[0, 0], [.5, 0], [.52, .01], [.52, .16], [.5, .17], [.49, .16], [.49, .02], [0, .02]];
    const cutA = .9, hm = toon(crayonCanvas('#F2E6C8', 512, 256, 400)); hm.side = T.DoubleSide;
    root.add(inked(lathe(hp, 80, cutA, Math.PI * 2 - 1.5), hm, .005));
    // spring: a flat steel strip wound in a spiral, outer end hooked to the wall
    const PL = !!o.pulled, r0 = .085, r1 = PL ? .25 : .46, turns = PL ? 8.5 : 6.2, N = 900, P = [], I = [], top = [], bot = [], S = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N, th = u * turns * Math.PI * 2;
      let r = r0 + (r1 - r0) * u, y0 = .03;
      if (bent) {
        const k = (c, w, a) => a * Math.exp(-Math.pow((u - c) / w, 2));
        r += k(.55, .03, .07) + k(.7, .02, -.05) + k(.82, .05, .06) + .025 * Math.sin(th * 3) * u;
        y0 += k(.62, .06, .05) - k(.9, .04, .03);
        r += .05 * Math.max(0, Math.sin(th * 1.5 + 1)) * (u > .45 && u < .75 ? 1 : 0);
      }
      S.push([Math.cos(th) * r, y0, Math.sin(th) * r]);
    }
    if (PL) { const th = turns * Math.PI * 2; for (let k = 1; k <= 40; k++) { const a = th + k / 40 * 1.2, r = r1 + (.485 - r1) * k / 40; S.push([Math.cos(a) * r, .03, Math.sin(a) * r]); } }
    const hh = .1;
    S.forEach(([x, y0, z], i) => { P.push(x, y0, z, x, y0 + hh, z); top.push(new T.Vector3(x, y0 + hh, z)); bot.push(new T.Vector3(x, y0, z)); if (i) { const a = (i - 1) * 2; I.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } });
    const sg = new T.BufferGeometry(); sg.setAttribute('position', new T.Float32BufferAttribute(P, 3)); sg.setIndex(I); sg.computeVertexNormals();
    const sm = toon(crayonCanvas(bent ? '#9AA2B4' : '#A9B6CC', 256, 256, 200)); sm.side = T.DoubleSide; root.add(new T.Mesh(sg, sm));
    const lm = new T.LineBasicMaterial({ color: 0x5E5450 }); root.add(new T.Line(new T.BufferGeometry().setFromPoints(top), lm)); root.add(new T.Line(new T.BufferGeometry().setFromPoints(bot), lm));
    // arbor and the drum the cord winds on
    const arb = new T.Mesh(new T.CylinderGeometry(.03, .03, .34, 16), toon(metalCanvas(SILVER, 64, 64))); arb.position.y = .17; root.add(arb);
    const drum = inked(new T.CylinderGeometry(.11, .11, .09, 40), toon(crayonCanvas('#E8857B', 128, 128, 80)), .005); drum.position.y = .25; root.add(drum);
    const fl1 = inked(new T.CylinderGeometry(.14, .14, .012, 40), toon(crayonCanvas('#E8857B', 128, 128, 80)), .004); fl1.position.y = .2; root.add(fl1);
    const fl2 = fl1.clone(); fl2.position.y = .3; root.add(fl2);
    const cordM = toon(crayonCanvas('#F4EEDF', 64, 64, 20)), cp = [];
    const wraps = o.pulled ? 1.2 : 4.5;
    for (let i = 0; i <= 160; i++) { const a = i / 160 * wraps * Math.PI * 2; cp.push(new T.Vector3(Math.cos(a) * .118, .215 + i / 160 * .07, Math.sin(a) * .118)); }
    const aEnd = wraps * Math.PI * 2, ex = Math.cos(aEnd) * .118, ez = Math.sin(aEnd) * .118;
    const out = o.pulled ? .78 : .74;
    cp.push(new T.Vector3(ex + .1, .29, ez + .25), new T.Vector3(.2, .27, .52), new T.Vector3(.25, .26, out));
    root.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(cp), 400, .012, 6), cordM));
    const ring = inked(new T.TorusGeometry(.08, .022, 12, 32), toon(crayonCanvas('#86AEDC', 64, 64, 30)), .004); ring.position.set(.25, .26, out + .1); ring.rotation.x = -.95; root.add(ring);
    window.__marks = { spring: [Math.cos(1) * .3, .13, Math.sin(1) * .3], kink: [Math.cos(.55 * turns * Math.PI * 2) * .34, .14, Math.sin(.55 * turns * Math.PI * 2) * .34], drum: [0, .3, .14], cord: [.2, .27, .52], ring: [.25, .26, out + .1], wall: [-.45, .16, -.2], hookEnd: [S[S.length - 1][0], .13, S[S.length - 1][2]] };
    return root;
  }

  /* ---------- E12 candelabra socket, a quarter cut away ---------- */
  function socket(o) {
    const root = new T.Group(), az = o.cut == null ? .5 : o.cut, wedge = .85;
    const p0 = az + wedge, pl = Math.PI * 2 - wedge * 2;
    const inWedge = phi => { let d = ((phi - az) % (Math.PI * 2) + Math.PI * 3) % (Math.PI * 2) - Math.PI; return Math.abs(d) < wedge; };
    // cream sleeve with a floor
    const sl = [[0, 0], [.3, 0], [.3, 1.0], [.27, 1.0], [.27, .07], [0, .07]];
    const sm = toon(crayonCanvas('#F2E6C8', 512, 256, 400)); sm.side = T.DoubleSide;
    root.add(inked(lathe(sl, 80, p0, pl), sm, .005));
    // brass threaded shell
    const sh = [[.2, .3], [.225, .3], [.225, .96], [.2, .96]];
    const bm = toon(metalCanvas(BRASS, 256, 256)); bm.side = T.DoubleSide;
    root.add(inked(lathe(sh, 80, p0, pl), bm, .004));
    const thr = (r, y0, y1, mat, cutIt) => { let seg = []; const segs = []; for (let i = 0; i <= 600; i++) { const t = i / 600, ph = t * (y1 - y0) / .07 * Math.PI * 2, y = y0 + t * (y1 - y0); if (cutIt && inWedge(ph)) { if (seg.length > 1) segs.push(seg); seg = []; continue; } seg.push(new T.Vector3(Math.sin(ph) * r, y, Math.cos(ph) * r)); } if (seg.length > 1) segs.push(seg); segs.forEach(sg => root.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(sg), sg.length, .012, 6), mat))); };
    thr(.205, .34, .92, bm, true);
    // the centre tab: a springy brass tongue, bent up to meet the bulb
    const tabPts = [[.19, .08, 0], [.12, .1, 0], [.05, .2, 0], [0, .27, 0], [-.04, .28, 0]].map(p => new T.Vector3(...p));
    const tc = new T.CatmullRomCurve3(tabPts), P = [], I = [];
    for (let i = 0; i <= 40; i++) { const q = tc.getPoint(i / 40); P.push(q.x, q.y, -.035, q.x, q.y, .035); if (i) { const a = (i - 1) * 2; I.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } }
    const tg = new T.BufferGeometry(); tg.setAttribute('position', new T.Float32BufferAttribute(P, 3)); tg.setIndex(I); tg.computeVertexNormals();
    const tgm = toon(metalCanvas(BRASS2, 64, 64)); tgm.side = T.DoubleSide; const tabM = new T.Mesh(tg, tgm); tabM.rotation.y = az; root.add(tabM);
    const rivet = new T.Mesh(new T.CylinderGeometry(.03, .03, .02, 12), toon(crayonCanvas(SILVER, 16, 16, 4))); rivet.position.set(Math.sin(az) * .17, .09, Math.cos(az) * .17); root.add(rivet);
    // the bulb: screw base, black glass insulator, solder tip, and the candle-flame glass
    const lift = o.loose ? .06 : 0;
    const bb = new T.Group();
    bb.add(inked(lathe([[0, .33], [.06, .31], [.1, .33], [.12, .36], [0, .36]], 32), toon(crayonCanvas('#3E3A3F', 32, 32, 10)), .003));
    const tip = new T.Mesh(new T.SphereGeometry(.04, 16, 10), toon(crayonCanvas(SILVER, 16, 16, 4))); tip.scale.y = .5; tip.position.y = .305; bb.add(tip);
    bb.add(inked(lathe([[.12, .36], [.19, .37], [.19, 1.0], [.17, 1.02]], 48), toon(metalCanvas(SILVER, 128, 128)), .004));
    const bthr = []; for (let i = 0; i <= 400; i++) { const t = i / 400, ph = t * 9 * Math.PI * 2; bthr.push(new T.Vector3(Math.sin(ph) * .192, .4 + t * .55, Math.cos(ph) * .192)); }
    bb.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(bthr), 400, .01, 6), toon(metalCanvas(SILVER, 32, 32))));
    const gl = lathe([[.17, 1.0], [.2, 1.08], [.23, 1.25], [.22, 1.42], [.16, 1.58], [.07, 1.72], [0, 1.78]], 48);
    const gm = new T.Mesh(gl, new T.MeshBasicMaterial({ color: 0xFFF6DA, transparent: true, opacity: .45, depthWrite: false })); gm.renderOrder = 3; bb.add(gm);
    bb.add(new T.LineSegments(new T.EdgesGeometry(gl, 25), new T.LineBasicMaterial({ color: 0x9C8C7E })));
    const fil = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([[-.05, 1.08, 0], [-.04, 1.3, 0], [0, 1.36, 0], [.04, 1.3, 0], [.05, 1.08, 0]].map(p => new T.Vector3(...p))), 30, .006, 6), new T.MeshBasicMaterial({ color: 0xD49A3A })); bb.add(fil);
    bb.position.y = lift; root.add(bb);
    // wires: black to the tab, white ribbed to the shell
    root.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([[Math.sin(az) * .17, .05, Math.cos(az) * .17], [.05, -.1, .05], [.06, -.4, .02], [.02, -.6, 0]].map(p => new T.Vector3(...p))), 30, .025, 8), toon(crayonCanvas('#3E3A3F', 32, 32, 10))));
    root.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([[-.12, .05, -.12], [-.08, -.1, -.06], [-.06, -.4, -.02], [-.08, -.6, 0]].map(p => new T.Vector3(...p))), 30, .025, 8), toon(crayonCanvas('#F4EEDF', 32, 32, 10))));
    window.__marks = { tab: [Math.sin(az) * .08, .17, Math.cos(az) * .08], tip: [0, .3 + lift, 0], shell: [Math.sin(az + Math.PI) * .2, .6, Math.cos(az + Math.PI) * .2], threads: [Math.sin(az + 1.1) * .2, .5, Math.cos(az + 1.1) * .2], sleeve: [Math.sin(az + 1.6) * .3, .85, Math.cos(az + 1.6) * .3], glass: [.2, 1.3, 0], hot: [.06, -.4, .02], neutral: [-.06, -.4, -.02] };
    return root;
  }

  /* ---------- the stereo, exploded: five layers and the hand-made cable ---------- */
  const WIRE = ['#E8857B', '#F0A05A', '#EFC15E', '#B8D86E', '#8FCBB2', '#5BA7A3', '#86AEDC', '#6B88B8', '#B79FD6', '#E88AA6'];
  // strand colours sampled from the photo of the back of my stereo, left to right on the top connector
  const PHOTO = ['#67C1AA', '#6FA88C', '#9CE0AC', '#669FD4', '#9796C2', '#F7B48E', '#D4717F', '#F28C8C', '#F6CBB0', '#EBA7A2', '#D8B7A2', '#E2E08A', '#C2EAE9', '#F4F6E2', '#E1DCEC', '#A595CF', '#BFDBCC', '#C4C6B8', '#ECEDE6', '#AE6E6C'];
  const STRAY = ['#E4E367', '#5F7669', '#48728C'];
  function discCanvas() {
    const c = document.createElement('canvas'); c.width = c.height = 1024; const g = c.getContext('2d');
    const cg = g.createConicGradient(3.6, 512, 512);
    ['#EEF1F5', '#E7DDF3', '#D6E4F7', '#DDF1E7', '#F7EED2', '#F7DCD9', '#EEF1F5', '#E9ECF1', '#E7DDF3', '#D6E4F7', '#DDF1E7', '#F7EED2', '#F7DCD9', '#EEF1F5'].forEach((col, i, a) => cg.addColorStop(i / (a.length - 1), col));
    g.fillStyle = cg; g.beginPath(); g.arc(512, 512, 510, 0, 7); g.fill();
    for (let r = 160; r < 505; r += 3) { g.strokeStyle = `rgba(255,255,255,${.05 + .08 * Math.random()})`; g.lineWidth = 1; g.beginPath(); g.arc(512, 512, r, 0, 7); g.stroke(); }
    const fl = g.createLinearGradient(560, 300, 900, 520); WIRE.filter((_, i) => i % 2 === 0).forEach((col, i) => fl.addColorStop(i / 4, col));
    g.strokeStyle = fl; g.globalAlpha = .55; g.lineWidth = 22; g.lineCap = 'round'; g.beginPath(); g.moveTo(600, 420); g.lineTo(880, 470); g.stroke(); g.globalAlpha = 1;
    g.fillStyle = '#D7D9DE'; g.beginPath(); g.arc(512, 512, 150, 0, 7); g.fill(); g.fillStyle = '#C4C8CF'; g.beginPath(); g.arc(512, 512, 70, 0, 7); g.fill();
    g.clearRect(0, 0, 1, 1); return c;
  }
  function pcbCanvas() {
    const c = crayonCanvas('#5E9C7A', 512, 512, 500), g = c.getContext('2d');
    g.strokeStyle = 'rgba(214,181,110,.75)'; g.lineWidth = 3;
    for (let i = 0; i < 70; i++) { let x = rnd() * 512, y = rnd() * 512; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 4; k++) { if (k % 2) x += (rnd() - .5) * 160; else y += (rnd() - .5) * 160; g.lineTo(x, y); } g.stroke(); }
    g.fillStyle = 'rgba(214,181,110,.9)'; for (let i = 0; i < 120; i++) { g.beginPath(); g.arc(rnd() * 512, rnd() * 512, 3, 0, 7); g.fill(); }
    return c;
  }
  function stereo(o) {
    const root = new T.Group(), W = 1.0, D = .86, gap = o.gap || .42;
    const alu = toon(metalCanvas('#DADCE1', 256, 256)), wood = toon(woodCanvas('#7A4A48', 256, 256, 'rgba(40,20,20,.3)'));
    const Ls = [0, 1, 2, 3, 4].map(i => i * gap);
    // L0 chassis: base tray, wood cheeks, front strip with buttons, back panel
    const base = inkBox2(W, .04, D, alu, [0, .02, 0]); root.add(base);
    [-1, 1].forEach(sd => root.add(inkBox2(.05, .3, D + .02, wood, [sd * (W / 2 + .025), .15, 0])));
    root.add(inkBox2(W, .26, .03, toon(crayonCanvas('#E9E8E4', 256, 128, 200)), [0, .15, D / 2 - .015]));
    for (let k = 0; k < 8; k++) { const b = new T.Mesh(new T.CylinderGeometry(k === 3 ? .032 : .024, k === 3 ? .032 : .024, .02, 20), toon(crayonCanvas('#F4F2EC', 32, 32, 10))); b.rotation.x = Math.PI / 2; b.position.set(-.38 + k * .105, .14, D / 2 + .005); root.add(b); }
    const back = inkBox2(W, .26, .03, toon(crayonCanvas('#D2CFC6', 256, 128, 200)), [0, .15, -D / 2 + .015]); root.add(back);
    const sock = inkBox2(.24, .06, .03, toon(crayonCanvas('#3E3A3F', 64, 64, 20)), [-.22, .12, -D / 2 - .01]); root.add(sock);
    const lbl = new T.Mesh(new T.PlaneGeometry(.28, .045), toon(crayonCanvas('#F7F3E6', 64, 32, 10))); lbl.position.set(.22, .07, -D / 2 - .002); lbl.rotation.y = Math.PI; root.add(lbl);
    const lz = new T.Mesh(new T.PlaneGeometry(.2, .04), new T.MeshBasicMaterial({ color: 0xF2D24A })); lz.position.set(.25, .22, -D / 2 - .002); lz.rotation.y = Math.PI; root.add(lz);
    // L1 main board
    const pcb = inkBox2(W - .1, .02, D - .1, toon(pcbCanvas()), [0, Ls[1], 0]); root.add(pcb);
    const chipM = toon(crayonCanvas('#3E3A3F', 32, 32, 10));
    [[-.25, .1, .16, .14], [.1, .15, .1, .1], [.28, -.1, .18, .08], [-.1, -.2, .08, .08]].forEach(([x, z, w, d]) => { const ch = inkBox2(w, .025, d, chipM, [x, Ls[1] + .022, z]); root.add(ch); });
    const capCols = ['#86AEDC', '#B79FD6', '#3E3A3F', '#86AEDC', '#E8857B', '#3E3A3F'];
    [[.32, .22], [.38, .22], [.35, .3], [-.36, -.25], [-.3, -.27], [.02, -.3]].forEach(([x, z], i) => { const cp = inked(new T.CylinderGeometry(.022, .022, .08, 16), toon(crayonCanvas(capCols[i], 32, 32, 10)), .004); cp.position.set(x, Ls[1] + .05, z); root.add(cp); const top = new T.Mesh(new T.CircleGeometry(.02, 16), new T.MeshBasicMaterial({ color: 0xCFD2D8 })); top.rotation.x = -Math.PI / 2; top.position.set(x, Ls[1] + .091, z); root.add(top); });
    const hdr = inkBox2(.24, .05, .05, toon(crayonCanvas('#F4F2EC', 64, 32, 10)), [-.22, Ls[1] + .035, -D / 2 + .1]); root.add(hdr);
    // L2 the CD mechanism: plate, spindle, two rails and the laser sled
    const mech = inkBox2(.7, .02, .62, toon(crayonCanvas('#9EA3AE', 256, 256, 200)), [0, Ls[2], 0]); root.add(mech);
    const spin = inked(new T.CylinderGeometry(.06, .07, .07, 24), toon(metalCanvas(SILVER, 64, 64)), .004); spin.position.set(0, Ls[2] + .045, 0); root.add(spin);
    [-.07, .07].forEach(z => { const rail = new T.Mesh(new T.CylinderGeometry(.008, .008, .5, 8), toon(metalCanvas(SILVER, 32, 32))); rail.rotation.z = Math.PI / 2; rail.position.set(.18, Ls[2] + .03, z); root.add(rail); });
    const sled = inkBox2(.12, .05, .18, toon(crayonCanvas('#3E3A3F', 64, 64, 20)), [.26, Ls[2] + .045, 0]); root.add(sled);
    const lens = new T.Mesh(new T.CircleGeometry(.025, 20), new T.MeshBasicMaterial({ color: 0x4C7BFF })); lens.rotation.x = -Math.PI / 2; lens.position.set(.26, Ls[2] + .072, 0); root.add(lens);
    const beam = new T.Mesh(new T.CylinderGeometry(.006, .02, gap - .06, 10, 1, true), new T.MeshBasicMaterial({ color: 0xE8857B, transparent: true, opacity: .5 })); beam.position.set(.26, Ls[2] + .07 + (gap - .06) / 2, 0); root.add(beam);
    // L3 the disc
    const dm = new T.MeshToonMaterial({ map: tex(discCanvas()), gradientMap: ramp });
    const disc = new T.Mesh(new T.CylinderGeometry(.34, .34, .012, 96), [new T.MeshBasicMaterial({ color: 0xC9CDD6 }), dm, dm]); disc.position.y = Ls[3]; root.add(disc);
    const dr = new T.Mesh(new T.TorusGeometry(.34, .004, 6, 96), new T.MeshBasicMaterial({ color: 0x7E6E64 })); dr.rotation.x = Math.PI / 2; dr.position.y = Ls[3] + .007; root.add(dr);
    // L4 the lid: aluminium with a clear window and the blue ring of light
    const ls = new T.Shape(); ls.moveTo(-W / 2, -D / 2); ls.lineTo(W / 2, -D / 2); ls.lineTo(W / 2, D / 2); ls.lineTo(-W / 2, D / 2); ls.closePath();
    const hole = new T.Path(); hole.absarc(0, 0, .38, 0, Math.PI * 2, true); ls.holes.push(hole);
    const lg = new T.ExtrudeGeometry(ls, { depth: .03, bevelEnabled: false, curveSegments: 64 }); lg.rotateX(-Math.PI / 2); lg.translate(0, Ls[4], 0);
    root.add(inked(lg, alu, .004));
    const win = new T.Mesh(new T.CircleGeometry(.38, 64), new T.MeshBasicMaterial({ color: 0xCFE3E6, transparent: true, opacity: .35, depthWrite: false })); win.rotation.x = -Math.PI / 2; win.position.y = Ls[4] + .015; win.renderOrder = 4; root.add(win);
    const led = new T.Mesh(new T.TorusGeometry(.385, .012, 10, 96), new T.MeshBasicMaterial({ color: 0x4C7BFF })); led.rotation.x = Math.PI / 2; led.position.y = Ls[4] + .032; root.add(led);
    const glow = new T.Mesh(new T.TorusGeometry(.385, .045, 10, 96), new T.MeshBasicMaterial({ color: 0x9DB7FF, transparent: true, opacity: .35, depthWrite: false })); glow.rotation.x = Math.PI / 2; glow.position.y = Ls[4] + .032; root.add(glow);
    // guide lines between the layers
    const gm = new T.LineDashedMaterial({ color: 0x9C8C7E, dashSize: .02, gapSize: .025 });
    [[-1, -1], [1, -1], [1, 1], [-1, 1]].forEach(([a, b]) => { const ln = new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(a * (W / 2 - .06), .3, b * (D / 2 - .06)), new T.Vector3(a * (W / 2 - .06), Ls[4], b * (D / 2 - .06))]), gm); ln.computeLineDistances(); root.add(ln); });
    // second box, to the right and back, with its own socket
    const B2 = new T.Vector3(o.b2x == null ? -1.55 : o.b2x, 0, o.b2z == null ? .25 : o.b2z);
    root.add(inkBox2(W, .3, D, toon(crayonCanvas('#D9D7CF', 256, 256, 200)), [B2.x, .15, B2.z]));
    [-1, 1].forEach(sd => root.add(inkBox2(.05, .3, D + .02, wood, [B2.x + sd * (W / 2 + .025), .15, B2.z])));
    const sock2 = inkBox2(.24, .06, .03, toon(crayonCanvas('#3E3A3F', 64, 64, 20)), [B2.x + .2, .12, B2.z - D / 2 - .01]); root.add(sock2);
    const lb2 = new T.Mesh(new T.PlaneGeometry(.3, .05), toon(crayonCanvas('#F7F3E6', 64, 32, 10))); lb2.position.set(B2.x - .2, .2, B2.z - D / 2 - .002); lb2.rotation.y = Math.PI; root.add(lb2);
    // the cable: twenty strands fanning from the header, into one cream sheath, out again at the far socket
    const A = new T.Vector3(-.22, Ls[1] + .04, -D / 2 + .08), Z = new T.Vector3(B2.x + .2, .12, B2.z - D / 2 - .03);
    const m1 = new T.Vector3(-.42, .3, -D / 2 - .42), m2 = new T.Vector3(B2.x + .5, .16, B2.z - D / 2 - .38), mid = new T.Vector3((m1.x + m2.x) / 2, .1, Math.min(m1.z, m2.z) - .22);
    root.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([m1, mid, m2]), 40, .035, 12), toon(crayonCanvas('#F4EEDF', 64, 64, 20))));
    const j = a => (rnd() - .5) * a;
    for (let k = 0; k < 20; k++) {
      const off = (k - 9.5) * .011, col = PHOTO[k], mat = toon(crayonCanvas(col, 16, 16, 4)), r = .0038 + rnd() * .0018;
      root.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([A.clone().add(new T.Vector3(off, 0, 0)), A.clone().add(new T.Vector3(off * 1.6 + j(.04), -.02 + j(.05), -.18 + j(.06))), new T.Vector3(m1.x + off * 1.4 + j(.05), m1.y + .1 + j(.06), m1.z + .12 + j(.05)), m1.clone().add(new T.Vector3(off * .15, 0, 0))]), 30, r, 5), mat));
      root.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([m2.clone().add(new T.Vector3(off * .15, 0, 0)), new T.Vector3(m2.x + .08 + j(.05), m2.y - .02 + j(.05), m2.z + .2 + off + j(.05)), Z.clone().add(new T.Vector3(off + j(.02), j(.03), -.12)), Z.clone().add(new T.Vector3(off, 0, 0))]), 30, r, 5), mat));
    }
    // a few strands skip the sheath and loop straight across, the way they do in the photo
    STRAY.forEach((col, i) => {
      const a0 = A.clone().add(new T.Vector3(.1 + i * .01, 0, 0)), z0 = Z.clone().add(new T.Vector3(.1 + i * .01, 0, 0));
      const mid1 = new T.Vector3((a0.x + z0.x) / 2 + .25 - i * .1, .5 - i * .08, a0.z - .55 - i * .1), mid2 = new T.Vector3(z0.x + .45, .05, z0.z - .35 - i * .08);
      root.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([a0, a0.clone().add(new T.Vector3(.05, -.02, -.2)), mid1, mid2, z0.clone().add(new T.Vector3(0, 0, -.12)), z0]), 60, .0048, 5), toon(crayonCanvas(col, 16, 16, 4))));
    });
    const bb = new T.Box3(), cc = new T.Vector3();
    root.children.forEach(ch => { bb.setFromObject(ch); bb.getCenter(cc); let k = 0;
      if (Math.abs(cc.x - B2.x) < .6 || cc.z < -D / 2 - .05) k = 0; else Ls.forEach((L, i) => { if (Math.abs(cc.y - L) < Math.abs(cc.y - Ls[k])) k = i; });
      if (ch.type === 'Line') k = -1; ch.userData.layer = k; ch.userData.y0 = ch.position.y; });
    root.userData.gap = gap;
    window.__marks = { lid: [-W / 2 + .05, Ls[4] + .03, D / 2 - .05], led: [-.38, Ls[4] + .03, .05], disc: [-.3, Ls[3], .1], sled: [.26, Ls[2] + .07, .09], spindle: [0, Ls[2] + .08, 0], pcb: [-W / 2 + .1, Ls[1], D / 2 - .1], caps: [.35, Ls[1] + .09, .26], header: [-.22, Ls[1] + .06, -D / 2 + .1], chassis: [-W / 2 - .03, .15, D / 2 - .1], buttons: [-.2, .14, D / 2], label: [.22, .07, -D / 2], cable: [mid.x, mid.y + .03, mid.z], box2: [B2.x, .3, B2.z], sock2: [Z.x, Z.y, Z.z] };
    return root;
  }

  window.EXTRA = Object.assign(window.EXTRA || {}, { needle, slider, cuckoo, chainwheels, pullspring, socket, stereo });
  window.P2 = { metalCanvas, inkedD, tube, box, inkBox, dbl, sstep, SILVER, BRASS, BRASS2, woodCanvas, chain, pinecone, inkBox2 };
})();
