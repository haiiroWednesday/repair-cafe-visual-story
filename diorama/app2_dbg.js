/* The Repair Teapot: a pop-up café, cut open like a paper dollhouse. A marked five-course reading route
   (the menu, the kitchen, the cook, the keepsake, order up) plus à-la-carte discoveries.
   All story text is placeholder for the author to replace. */
(async function () {
  const $ = id => document.getElementById(id);
  const canvas = $('stage');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = () => innerWidth <= 820;

  // ---------------- story content (placeholders only) ----------------
  const P = t => `<span class="ph">${t}</span>`;
  const credit = 'Photo: the author, Repair Café Silicon Valley, Billy DeFrank Center, San Jose, Oct 18 2026.';
  const STOPS = [
    { id: 'entrance', course: 'read the menu', name: 'At the entrance', photo: 'entrance', anchor: 'menu', title: P('Section title'),
      body: P('Caption for the feature photograph: who is here, what is happening, where. One or two sentences.'), src: credit },
    { id: 'bench', course: 'the kitchen', name: 'At the workbench', photo: 'hands', anchor: 'stereo', title: P('Section title'),
      body: P('Caption for the hands-and-tools photograph. What is being opened, and what the fixer is looking for.'), src: credit, extra: [{ label: 'Lift the stereo apart', act: 'explode' }] },
    { id: 'volunteer', course: 'the cook', name: 'Beside the volunteer', photo: 'volunteer', anchor: 'chair', title: P('Section title'),
      body: P('Caption for the photograph of the volunteer at work, with one documented detail from the interview.'), src: credit },
    { id: 'clock', course: 'the keepsake', name: 'Inside the clock', photo: null, anchor: 'clockdoor', clock: true, title: P('Section title'),
      body: P('A line that leads the reader to the clock on the wall.'), src: '' },
    { id: 'final', course: 'order up', name: 'The final object', photo: null, finalPh: true, anchor: 'cloche', title: P('Section title'),
      body: P('The closing image and passage, served under the glass.'), src: P('Source line for the final image.') }
  ];
  const CLOCK_REVEAL = { photo: 'clock', tag: 'told by Jazz · an earlier event', body: P('The clock passage goes here, in the main reading route.'),
    src: 'Repair recounted by Jazz, volunteer fixer, Repair Café Silicon Valley, at an earlier event. Photo: [credit].' };
  const SUPP = {
    menu: { label: 'the pavement menu', photo: null, title: 'What the kitchen fixes', body: P('Supplementary note: the categories on the real check-in board, read like a menu.') },
    intake: { label: 'the order counter', photo: 'intake', title: 'Where orders are taken', body: P('Supplementary note about check-in.') },
    ticket: { label: 'an order ticket', photo: 'ticket', title: 'The ticket', body: P('Supplementary note about intake tickets.') },
    stereo: { label: 'the stereo', photo: 'stereo', title: 'The stereo', body: P('Supplementary note about the stereo and its cable.'), act: 'explode' },
    lamp: { label: 'the brass lamp', photo: 'candelabra', title: 'The lamp', body: P('Supplementary note on the lamp’s connector detail.') },
    heart: { label: 'the heart clock', photo: 'heart', title: 'The heart clock', body: P('Supplementary note about the heart-shaped clock.') },
    shelf: { label: 'the pass', photo: null, title: 'Orders waiting at the pass', body: P('Supplementary note: what kinds of things people bring in.') },
    drawer: { label: 'a drawer', photo: null, title: 'In the drawer', body: P('Longer interview excerpt goes here, marked as supplementary.'), act: 'drawer' },
    board: { label: 'the chalkboard', photo: 'board', title: '“We fixed it!”', body: P('Supplementary note about the chalkboard.') },
    sewing: { label: 'the patisserie', photo: 'sewing', title: 'The sewing table', body: P('Supplementary note about the textile table.') },
    toolbox: { label: 'the toolboxes', photo: 'motor', title: 'What the fixers bring', body: P('Supplementary note about the volunteers’ own toolboxes and kits.') }
  };

  // ---------------- renderer ----------------
  let R;
  try { R = new T.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch (e) { return noGL(); }
  R.setPixelRatio(Math.min(2, devicePixelRatio)); R.outputColorSpace = T.SRGBColorSpace;
  const scene = new T.Scene();
  const cam = new T.PerspectiveCamera(30, innerWidth / innerHeight, .05, 160);
  scene.add(new T.HemisphereLight(0xFFF8F0, 0xCFC6DC, 1.2));
  const sun = new T.DirectionalLight(0xFFF0DD, 1.05); sun.position.set(-4, 9, 7); scene.add(sun);
  const fill = new T.DirectionalLight(0xDCE8FF, .6); fill.position.set(7, 3, 2); scene.add(fill);
  try { await document.fonts.ready; await Promise.all(['italic 500 40px "Cormorant Garamond"', '600 40px "Cormorant Garamond"', '20px Italiana', '16px Newsreader'].map(f => document.fonts.load(f))); } catch (e) {}

  // ---------------- small helpers ----------------
  const cnv = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); return c; };
  const img = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = src; });
  const imgTex = async src => { const t = new T.Texture(await img(src)); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4; t.needsUpdate = true; return t; };
  const grainOver = (g, w, h, n = 1400) => { for (let i = 0; i < n; i++) { const x = rnd() * w, y = rnd() * h, L = 6 + rnd() * 14; g.strokeStyle = rnd() < .55 ? `rgba(90,60,70,${.025 + rnd() * .03})` : `rgba(255,255,255,${.08 + rnd() * .1})`; g.lineWidth = 1 + rnd() * 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + L * .88, y - L * .48); g.stroke(); } };
  const wp = o => o.getWorldPosition(new T.Vector3());
  const add = (o, p, parent) => { if (p) o.position.set(...p); parent.add(o); return o; };
  const paper = new T.MeshToonMaterial({ color: 0xFFFDF8, gradientMap: ramp });
  const bx = (w, h, d, m, p, parent, ink = .004) => { const o = inked(new T.BoxGeometry(w, h, d), m, ink); o.position.set(...p); parent.add(o); return o; };
  function card(w, h, d, frontCanvas, sideHex) { const side = sideHex ? flat(sideHex) : paper; return inked(new T.BoxGeometry(w, h, d), [side, side, side, side, toon(frontCanvas), side], .005); }
  // die-cut a painted canvas: a white paper margin traced around its silhouette
  function diecut(src, b = 8) {
    const w = src.width + b * 4, h = src.height + b * 4;
    const sil = cnv(w, h, g => { g.drawImage(src, b * 2, b * 2); g.globalCompositeOperation = 'source-in'; g.fillStyle = '#FFFDF8'; g.fillRect(0, 0, w, h); });
    return cnv(w, h, g => { for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; g.drawImage(sil, Math.cos(a) * b, Math.sin(a) * b); } g.globalCompositeOperation = 'source-atop'; g.fillStyle = 'rgba(255,253,248,1)'; g.fillRect(0, 0, w, h); g.globalCompositeOperation = 'source-over'; g.drawImage(src, b * 2, b * 2); });
  }
  function cutout(map, w, h, opt) {
    const m = new T.MeshToonMaterial({ map, gradientMap: ramp, transparent: true, alphaTest: .45, side: T.DoubleSide });
    if (opt.lit === false) { m.emissive = new T.Color(0xFFFFFF); m.emissiveMap = map; m.emissiveIntensity = .55; }
    const g = new T.Group(); const pl = new T.Mesh(new T.PlaneGeometry(w, h), m); pl.position.y = h / 2; g.add(pl);
    if (!opt.flat) { const tab = new T.Mesh(new T.PlaneGeometry(w * .5, h * .3), paper); tab.position.set(0, h * .14, -h * .1); tab.rotation.x = -.6; g.add(tab); }
    g.userData.w = w; g.userData.h = h; return g;
  }
  async function standee(key, h, opt = {}) { const a = ASSETS.standee[key]; return cutout(await imgTex(a[0]), h * a[1] / a[2], h, opt); }
  function painted(c, h, opt = {}) { const d = diecut(c, opt.border ?? 7); return cutout(tex(d), h * d.width / d.height, h, opt); }
  function foldingTable(w, d, h, top = '#E4E2DC') {
    const g = new T.Group(), metal = flat('#5A5560');
    bx(w, .04, d, flat(top), [0, h, 0], g, .006); bx(w, .06, .02, flat('#C9C5BD'), [0, h - .04, d / 2 - .01], g);
    [-1, 1].forEach(s => [[-1], [1]].forEach(([a]) => { const leg = new T.Mesh(new T.CylinderGeometry(.012, .012, h * 1.05, 8), metal); leg.position.set(s * (w / 2 - .12), h / 2, 0); leg.rotation.x = a * .32; g.add(leg); }));
    return g;
  }
  function clothTable(w, d, h, col = '#F7E4E8') {
    const g = new T.Group();
    const clothC = cnv(512, 256, (gg, W, Hh) => { gg.fillStyle = col; gg.fillRect(0, 0, W, Hh); for (let x = 0; x < W; x += 3) { const v = Math.sin(x / W * Math.PI * 18) * .5 + .5; gg.fillStyle = `rgba(255,255,255,${v * .22})`; gg.fillRect(x, 0, 3, Hh); gg.fillStyle = `rgba(120,70,90,${(1 - v) * .07})`; gg.fillRect(x, 0, 3, Hh); }
      gg.fillStyle = '#FFFFFF'; for (let x = 0; x < W; x += 24) { gg.beginPath(); gg.arc(x + 12, Hh - 14, 12, 0, Math.PI); gg.fill(); } gg.fillRect(0, Hh - 26, W, 12);
      gg.fillStyle = 'rgba(200,170,120,.8)'; for (let x = 6; x < W; x += 12) { gg.beginPath(); gg.arc(x, Hh - 20, 1.6, 0, 7); gg.fill(); } grainOver(gg, W, Hh, 300); });
    const cm = toon(clothC); cm.side = T.DoubleSide;
    bx(w, .035, d, toon(cnv(256, 256, (gg, W, Hh) => { gg.fillStyle = '#FFFDF9'; gg.fillRect(0, 0, W, Hh); gg.strokeStyle = '#E3CB92'; gg.lineWidth = 3; gg.strokeRect(10, 10, W - 20, Hh - 20); })), [0, h, 0], g, .005);
    const skirt = (len, p, ry) => { const m = new T.Mesh(new T.PlaneGeometry(len, h - .02), cm); m.position.set(...p); m.rotation.y = ry; g.add(m); };
    skirt(w, [0, h / 2, d / 2 + .004], 0); skirt(d, [w / 2 + .004, h / 2, 0], Math.PI / 2); skirt(d, [-w / 2 - .004, h / 2, 0], -Math.PI / 2); skirt(w, [0, h / 2, -d / 2 - .004], Math.PI);
    return g;
  }
  function chair(col = '#3E3A4A') {
    const g = new T.Group(), m = flat(col);
    bx(.32, .03, .3, m, [0, .34, 0], g, .005); const b = bx(.32, .2, .03, m, [0, .62, -.15], g, .005); b.rotation.x = -.1;
    [[-.15, -.14], [.15, -.14], [-.15, .14], [.15, .14]].forEach(([x, z]) => { const l = new T.Mesh(new T.CylinderGeometry(.01, .01, z < 0 ? .78 : .36, 6), m); l.position.set(x, z < 0 ? .39 : .17, z); g.add(l); });
    return g;
  }
  function bistroChair() {
    const g = new T.Group(), m = flat('#F6F1E8'), wire = new T.MeshToonMaterial({ color: 0xC8A866, gradientMap: ramp });
    const seat = inked(new T.CylinderGeometry(.15, .15, .025, 24), m, .004); seat.position.y = .4; g.add(seat);
    const back = new T.Mesh(new T.TorusGeometry(.14, .012, 6, 24, Math.PI), wire); back.position.set(0, .55, -.12); g.add(back);
    [[-.1, -.1], [.1, -.1], [-.1, .1], [.1, .1]].forEach(([x, z]) => { const l = new T.Mesh(new T.CylinderGeometry(.008, .008, .4, 6), wire); l.position.set(x, .2, z); g.add(l); });
    return g;
  }
  function shelfUnit(w, d, h, levels, hex) {
    const g = new T.Group(), m = flat(hex), back = flat('#E9DFD2');
    [-1, 1].forEach(sd => bx(.025, h, d, m, [sd * (w / 2 - .0125), h / 2, 0], g));
    bx(w, h, .012, back, [0, h / 2, -d / 2 + .006], g); levels.forEach(y => bx(w - .05, .02, d, m, [0, y, 0], g)); bx(w + .02, .03, d + .02, m, [0, h, 0], g);
    // a scalloped valance, like a pastry case
    for (let x = -w / 2 + .04; x < w / 2; x += .08) { const s = new T.Mesh(new T.CircleGeometry(.04, 12, 0, Math.PI), flat('#F2C4CC')); s.rotation.z = Math.PI; s.position.set(x, h - .01, d / 2 + .012); g.add(s); }
    return g;
  }
  const glowTex = tex(cnv(128, 128, g => { const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,244,214,1)'); r.addColorStop(.3, 'rgba(255,220,160,.5)'); r.addColorStop(1, 'rgba(255,200,140,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); }));
  const glows = [];
  function glow(p, s, parent) { const sp = new T.Sprite(new T.SpriteMaterial({ map: glowTex, blending: T.AdditiveBlending, depthWrite: false, transparent: true })); sp.scale.set(s, s, s); sp.position.set(...p); parent.add(sp); glows.push(sp); return sp; }
  // a tube whose radius changes along its length (spout, handle)
  function sweep(curve, radius, segs = 60, radial = 18) {
    const fr = curve.computeFrenetFrames(segs, false), pos = [], uv = [], idx = [];
    for (let i = 0; i <= segs; i++) { const t = i / segs, p = curve.getPointAt(t), N = fr.normals[i], B = fr.binormals[i], r = radius(t);
      for (let j = 0; j <= radial; j++) { const a = j / radial * Math.PI * 2; pos.push(p.x + r * (Math.cos(a) * N.x + Math.sin(a) * B.x), p.y + r * (Math.cos(a) * N.y + Math.sin(a) * B.y), p.z + r * (Math.cos(a) * N.z + Math.sin(a) * B.z)); uv.push(j / radial, t); } }
    for (let i = 0; i < segs; i++) for (let j = 0; j < radial; j++) { const a = i * (radial + 1) + j, b = a + radial + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
  }

  // ---------------- painted surfaces ----------------
  const ROSES = ['#F4B9C6', '#F7D2B7', '#FFFFFF', '#CFE0F5'];
  const sprig = (g, x, y, s) => { g.strokeStyle = '#8EB79A'; g.lineWidth = 2 * s; g.beginPath(); g.moveTo(x - 14 * s, y + 10 * s); g.quadraticCurveTo(x, y, x + 14 * s, y + 8 * s); g.stroke();
    g.fillStyle = '#A7CDB0'; [[-8, 6], [8, 5]].forEach(([dx, dy]) => { g.beginPath(); g.ellipse(x + dx * s, y + dy * s, 5 * s, 2.6 * s, dx * .05, 0, 7); g.fill(); });
    const rr = 7 * s; const rg = g.createRadialGradient(x - 2 * s, y - 2 * s, 1, x, y, rr); rg.addColorStop(0, '#FFF3F5'); rg.addColorStop(.7, '#F2A9BA'); rg.addColorStop(1, '#D48098'); g.fillStyle = rg; g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill(); };
  // porcelain outside: glaze, a powder-blue scalloped collar with gold, scattered rose sprigs, a gold foot
  const porcelainC = cnv(2048, 1024, (g, w, h) => {
    const bg = g.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#FFFFFF'); bg.addColorStop(.6, '#FBF8F4'); bg.addColorStop(1, '#F1ECE6'); g.fillStyle = bg; g.fillRect(0, 0, w, h);
    g.fillStyle = '#CFE0EE'; g.fillRect(0, h * .1, w, h * .08); for (let x = 0; x < w; x += 64) { g.beginPath(); g.arc(x + 32, h * .18, 32, 0, Math.PI); g.fill(); }
    g.strokeStyle = '#C8A866'; g.lineWidth = 6; g.beginPath(); g.moveTo(0, h * .1); g.lineTo(w, h * .1); g.stroke(); g.lineWidth = 3; g.beginPath(); for (let x = 0; x < w; x += 64) { g.moveTo(x, h * .18); g.arc(x + 32, h * .18, 32, Math.PI, 0, true); } g.stroke();
    for (let x = 32; x < w; x += 64) { g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(x, h * .14, 6, 0, 7); g.fill(); }
    for (let i = 0; i < 48; i++) sprig(g, (i % 12) * (w / 12) + (Math.floor(i / 12) % 2) * (w / 24) + 30, h * (.34 + Math.floor(i / 12) * .14), 2.2);
    g.fillStyle = '#C8A866'; g.fillRect(0, h * .93, w, h * .025); g.fillRect(0, h * .965, w, h * .01);
    grainOver(g, w, h, 2500);
  });
  // wallpaper inside: powder blue with white garlands and gold-framed panels downstairs; blush stripes upstairs
  const wallpaperC = cnv(2048, 1024, (g, w, h) => {
    const upTop = 0, floorY = h * .52;
    g.fillStyle = '#F7E8EC'; g.fillRect(0, upTop, w, floorY);
    for (let x = 0; x < w; x += 48) { g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(x, 0, 20, floorY); }
    for (let i = 0; i < 40; i++) sprig(g, (i % 20) * (w / 20) + 50, h * (.16 + Math.floor(i / 20) * .2), 1.6);
    g.fillStyle = '#D9E8F2'; g.fillRect(0, floorY, w, h - floorY);
    // damask: little white crowns of leaves in a half-drop
    g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 2.5;
    for (let y = floorY + 40, row = 0; y < h * .84; y += 70, row++) for (let x = (row % 2) * 40; x < w; x += 80) { g.beginPath(); g.moveTo(x, y - 18); g.quadraticCurveTo(x + 18, y - 10, x + 10, y + 6); g.quadraticCurveTo(x, y + 14, x - 10, y + 6); g.quadraticCurveTo(x - 18, y - 10, x, y - 18); g.stroke(); g.beginPath(); g.arc(x, y - 22, 3, 0, 7); g.stroke(); }
    // gold moulding panels
    g.strokeStyle = '#C8A866'; g.lineWidth = 4; for (let x = 30; x < w - 120; x += 256) { g.beginPath(); g.roundRect(x, floorY + 46, 196, h * .3, 16); g.stroke(); g.lineWidth = 1.5; g.beginPath(); g.roundRect(x + 10, floorY + 56, 176, h * .3 - 20, 10); g.stroke(); g.lineWidth = 4; }
    // cornice between floors, wainscot at the bottom
    g.fillStyle = '#FFFDF8'; g.fillRect(0, floorY - 10, w, 22); g.fillStyle = '#C8A866'; g.fillRect(0, floorY + 12, w, 4); g.fillRect(0, floorY - 12, w, 3);
    g.fillStyle = '#FFFDF8'; g.fillRect(0, h * .86, w, h * .14); g.fillStyle = '#C8A866'; g.fillRect(0, h * .86, w, 4);
    grainOver(g, w, h, 2400);
  });
  const checkerC = cnv(1024, 1024, (g, w, h) => { const n = 16; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = (i + j) % 2 ? '#FBF6EF' : '#E2EAF1'; g.fillRect(i * w / n, j * h / n, w / n, h / n); }
    g.strokeStyle = 'rgba(200,168,102,.45)'; g.lineWidth = 2; for (let i = 0; i <= n; i++) { g.beginPath(); g.moveTo(i * w / n, 0); g.lineTo(i * w / n, h); g.moveTo(0, i * h / n); g.lineTo(w, i * h / n); g.stroke(); } grainOver(g, w, h, 1600); });
  const parquetC = cnv(1024, 1024, (g, w, h) => { g.fillStyle = '#E2C08D'; g.fillRect(0, 0, w, h); const L = 96, W = 32;
    for (let y = -L; y < h + L; y += W * 2) for (let x = -L; x < w + L; x += L) { [[0, 0, '#E8C996'], [W, W, '#D7B07A']].forEach(([dx, dy, c]) => { g.save(); g.translate(x + dx + (y / (W * 2)) % 2 * W, y + dy); g.rotate(Math.PI / 4); g.fillStyle = c; g.fillRect(0, 0, L * .7, W * .7); g.strokeStyle = 'rgba(120,80,40,.35)'; g.lineWidth = 2; g.strokeRect(0, 0, L * .7, W * .7); g.restore(); }); } grainOver(g, w, h, 1200); });
  // the floor edges are cake layers: sponge, cream, jam, sponge
  const cakeC = cnv(1024, 128, (g, w, h) => { [['#F3D9A4', 0, .34], ['#FFFDF8', .34, .52], ['#E98AA0', .52, .62], ['#F0D29A', .62, 1]].forEach(([c, a, b]) => { g.fillStyle = c; g.fillRect(0, a * h, w, (b - a) * h); });
    for (let i = 0; i < 500; i++) { g.fillStyle = `rgba(170,120,60,${.15 + rnd() * .2})`; g.beginPath(); g.arc(rnd() * w, (rnd() < .5 ? rnd() * .3 : .65 + rnd() * .33) * h, 1 + rnd() * 2, 0, 7); g.fill(); } });
  const clothC = cnv(1024, 1024, (g, w, h) => { g.fillStyle = '#26356B'; g.fillRect(0, 0, w, h); for (let i = 0; i < h; i += 3) { g.fillStyle = `rgba(255,255,255,${.02 + rnd() * .025})`; g.fillRect(0, i, w, 1); }
    g.strokeStyle = '#D9BC7A'; g.lineWidth = 5; g.strokeRect(36, 36, w - 72, h - 72); g.lineWidth = 2; g.strokeRect(52, 52, w - 104, h - 104); });
  const pagesC = cnv(512, 512, (g, w, h) => { g.fillStyle = '#FBF5EA'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(150,130,110,.3)'; for (let y = 0; y < h; y += 5) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } });
  const endpaperC = cnv(1024, 1024, (g, w, h) => { g.fillStyle = '#DCE7F0'; g.fillRect(0, 0, w, h); for (let y = 16, r = 0; y < h; y += 32, r++) for (let x = (r % 2) * 16 + 16; x < w; x += 32) { g.fillStyle = 'rgba(255,255,255,.75)'; g.beginPath(); g.arc(x, y, 2.6, 0, 7); g.fill(); } g.strokeStyle = '#C8A866'; g.lineWidth = 3; g.strokeRect(18, 18, w - 36, h - 36); grainOver(g, w, h, 1500); });

  // ---------------- the open book ----------------
  const AC = .74;                 // the reader's side of the teapot (azimuth of the camera)
  const world = new T.Group(); scene.add(world);
  const book = new T.Group(); book.rotation.y = AC; world.add(book);
  const BW = 4.7, BD = 7.8;
  const coverM = toon(clothC), pageM = toon(pagesC), endM = toon(endpaperC);
  [-1, 1].forEach(sd => {
    bx(BW, .08, BD, coverM, [sd * BW / 2, .04, 0], book, .01);
    const pg = inked(new T.BoxGeometry(BW - .12, .07, BD - .14), [pageM, pageM, endM, paper, pageM, pageM], .006); pg.position.set(sd * (BW / 2 - .02), .115, 0); book.add(pg);
  });
  const shadow = new T.Mesh(new T.PlaneGeometry(12.5, 10.5), new T.MeshBasicMaterial({ map: tex(cnv(256, 256, g => { const r = g.createRadialGradient(128, 128, 20, 128, 128, 128); r.addColorStop(0, 'rgba(36,49,95,.28)'); r.addColorStop(1, 'rgba(36,49,95,0)'); g.fillStyle = r; g.fillRect(0, 0, 256, 256); })), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = -.01; book.add(shadow);
  const BASE = .15;                // top of the pages

  // ---------------- the teapot ----------------
  const TC = new T.Vector3(0, BASE, -.35);
  const pot = new T.Group(); pot.position.copy(TC); world.add(pot);
  const H = 3.25, rr = y => { const t = Math.min(1, Math.max(0, y / H)); return 1.2 + .65 * (1 - t) + 1.1 * Math.pow(Math.sin(Math.PI * t), .9); };
  const OPEN = 1.2, PH0 = AC + OPEN, PHL = Math.PI * 2 - OPEN * 2;
  const pol = (az, r, y = 0) => new T.Vector3(Math.sin(az) * r, y, Math.cos(az) * r);
  const prof = (off = 0) => { const p = []; for (let i = 0; i <= 40; i++) { const y = .14 + i / 40 * (H - .14); p.push(new T.Vector2(rr(y) - off, y)); } return p; };
  const potM = toon(porcelainC); potM.side = T.FrontSide;
  const shellOut = new T.Mesh(new T.LatheGeometry(prof(0), 96, PH0, PHL), potM); pot.add(shellOut);
  const wallM = toon(wallpaperC); wallM.side = T.BackSide;
  const shellIn = new T.Mesh(new T.LatheGeometry(prof(.09), 96, PH0, PHL), wallM); pot.add(shellIn);
  // the cut edges show the porcelain's thickness, like the edge of a paper wall
  [PH0, PH0 + PHL].forEach(ph => { const a = prof(0), b = prof(.09), pos = [], idx = [];
    a.forEach((v, i) => { pos.push(Math.sin(ph) * v.x, v.y, Math.cos(ph) * v.x, Math.sin(ph) * b[i].x, b[i].y, Math.cos(ph) * b[i].x); if (i) { const k = (i - 1) * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); } });
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    const m = new T.MeshToonMaterial({ color: 0xFFF8EE, gradientMap: ramp, side: T.DoubleSide }); pot.add(new T.Mesh(g, m));
    pot.add(new T.Line(new T.BufferGeometry().setFromPoints(a.map(v => new T.Vector3(Math.sin(ph) * v.x, v.y, Math.cos(ph) * v.x))), new T.LineBasicMaterial({ color: 0x8C6E5E }))); });
  { const pts = []; for (let i = 0; i <= 96; i++) { const ph = PH0 + PHL * i / 96; pts.push(new T.Vector3(Math.sin(ph) * rr(H), H, Math.cos(ph) * rr(H))); } pot.add(new T.Line(new T.BufferGeometry().setFromPoints(pts), new T.LineBasicMaterial({ color: 0x8C6E5E }))); }
  // the ground floor: a cake layer with a checkered top; the upper floor: a cake slice with a parquet top and a gold rail
  const F0 = .14, F1 = 1.62, F1T = .12;
  function cakeFloor(r, y0, y1, ph0, phl, topCanvas, full) {
    const g = new T.Group();
    const top = new T.Mesh(new T.CircleGeometry(r, 96, ph0 - Math.PI / 2, phl), toon(topCanvas)); top.rotation.x = -Math.PI / 2; top.rotation.z = 0; top.position.y = y1;
    // CircleGeometry lies in XY with angle measured from +X; after rotating flat, angle a maps to world (cos a, -sin a). Build our own fan instead for exact azimuths.
    const pos = [0, y1, 0], uv = [.5, .5], idx = []; const N = 96;
    for (let i = 0; i <= N; i++) { const a = ph0 + phl * i / N; pos.push(Math.sin(a) * r, y1, Math.cos(a) * r); uv.push(.5 + Math.sin(a) * .5, .5 + Math.cos(a) * .5); if (i) idx.push(0, i, i + 1); }
    const tg = new T.BufferGeometry(); tg.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); tg.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); tg.setIndex(idx); tg.computeVertexNormals();
    const tm = toon(topCanvas); tm.side = T.DoubleSide; g.add(new T.Mesh(tg, tm));
    const sp = [], su = [], si = []; for (let i = 0; i <= N; i++) { const a = ph0 + phl * i / N; sp.push(Math.sin(a) * r, y1, Math.cos(a) * r, Math.sin(a) * r, y0, Math.cos(a) * r); su.push(i / N * 6, 1, i / N * 6, 0); if (i) { const k = (i - 1) * 2; si.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); } }
    const sg = new T.BufferGeometry(); sg.setAttribute('position', new T.Float32BufferAttribute(sp, 3)); sg.setAttribute('uv', new T.Float32BufferAttribute(su, 2)); sg.setIndex(si); sg.computeVertexNormals();
    const ct = tex(cakeC); ct.wrapS = T.RepeatWrapping; const cm = new T.MeshToonMaterial({ map: ct, gradientMap: ramp, side: T.DoubleSide }); g.add(new T.Mesh(sg, cm));
    if (!full) [ph0, ph0 + phl].forEach(a => { const q = new T.Mesh(new T.PlaneGeometry(r, y1 - y0), cm); q.position.set(Math.sin(a) * r / 2, (y0 + y1) / 2, Math.cos(a) * r / 2); q.rotation.y = a + Math.PI / 2; g.add(q); });
    // under the slab, a plain cream ceiling
    if (!full) { const cg = tg.clone(); const cp = cg.attributes.position; for (let i = 0; i < cp.count; i++) cp.setY(i, y0); cp.needsUpdate = true; g.add(new T.Mesh(cg, new T.MeshToonMaterial({ color: 0xFFF8EE, gradientMap: ramp, side: T.DoubleSide }))); }
    return g;
  }
  pot.add(cakeFloor(rr(F0) + .02, -.0, F0, 0, Math.PI * 2, checkerC, true));
  const upper = cakeFloor(rr(F1) - .07, F1 - F1T, F1, PH0 + .03, PHL - .06, parquetC, false); pot.add(upper);
  // a gold rail along the upper floor's cut edges
  { const railM = new T.MeshToonMaterial({ color: 0xD8B76E, gradientMap: ramp }), r1 = rr(F1) - .1;
    [PH0 + .03, PH0 + PHL - .03].forEach(a => { const p0 = pol(a, .25, F1 + .32), p1 = pol(a, r1, F1 + .32); const rail = new T.Mesh(new T.CylinderGeometry(.012, .012, p0.distanceTo(p1), 8), railM); rail.position.copy(p0.clone().add(p1).multiplyScalar(.5)); rail.lookAt(p1); rail.rotateX(Math.PI / 2); pot.add(rail);
      for (let k = 0; k <= 8; k++) { const p = pol(a, .25 + (r1 - .25) * k / 8, F1 + .16); const post = new T.Mesh(new T.CylinderGeometry(.008, .008, .32, 6), railM); post.position.copy(p); pot.add(post); } }); }
  // the lid, tipped open on its hinge, a gold rose for a knob
  const lid = new T.Group(); lid.position.set(...pol(AC + Math.PI, rr(H) - .05, H).toArray()); pot.add(lid);
  { const lp = [[0, 0], [1.28, 0], [1.3, .06], [1.2, .2], [.9, .48], [.45, .66], [.16, .7], [.18, .82], [.1, .92], [0, .95]].map(([x, y]) => new T.Vector2(x, y));
    const lm = toon(cnv(512, 256, (g, w, h) => { g.fillStyle = '#FBE7EA'; g.fillRect(0, 0, w, h); g.fillStyle = '#C8A866'; g.fillRect(0, h * .78, w, 8); for (let i = 0; i < 12; i++) sprig(g, i * 44 + 20, h * .5, 1.2); grainOver(g, w, h, 500); }));
    const lmesh = inked(new T.LatheGeometry(lp, 64), lm, .01); lmesh.position.set(...pol(AC, rr(H) - .05, 0).toArray()); lid.add(lmesh);
    const knob = new T.Mesh(new T.SphereGeometry(.13, 18, 14), new T.MeshToonMaterial({ color: 0xE3C276, gradientMap: ramp })); knob.position.set(...pol(AC, rr(H) - .05, 1.02).toArray()); lid.add(knob);
    lid.rotation.set(0, 0, 0); lid.userData.axis = pol(AC + Math.PI / 2, 1, 0).normalize(); lid.rotateOnAxis(lid.userData.axis, -.14); }
  // spout and handle
  const spCurve = new T.CatmullRomCurve3([pol(AC - 1.75, rr(1.0) - .3, 1.0), pol(AC - 1.75, rr(1.0) + .5, 1.15), pol(AC - 1.68, rr(1.0) + 1.2, 1.75), pol(AC - 1.6, rr(1.0) + 1.55, 2.55)]);
  pot.add(new T.Mesh(sweep(spCurve, t => .46 - .26 * t + .05 * Math.max(0, t - .9) * 10), potM));
  const hdCurve = new T.CatmullRomCurve3([pol(AC + 2.05, rr(2.5) - .2, 2.5), pol(AC + 2.05, rr(2.5) + .75, 2.55), pol(AC + 2.05, rr(1.6) + .9, 1.7), pol(AC + 2.05, rr(.8) + .5, .85), pol(AC + 2.05, rr(.7) - .2, .7)]);
  pot.add(new T.Mesh(sweep(hdCurve, () => .15, 60, 14), potM));

  // ---------------- stations: a group per place, facing the middle of the café ----------------
  const pops = []; const pop = (o, t0) => { pops.push({ o, t0, s: o.scale.x }); return o; };
  function station(az, r, y) { const g = new T.Group(); g.position.copy(pol(az, r, y)); g.rotation.y = az + Math.PI; pot.add(g); return g; }
  async function lay(items, o) {
    const S = []; for (const [k, h] of items) { if (!ASSETS.standee[k]) continue; S.push(await standee(k, h, o)); }
    const tot = S.reduce((t, g) => t + g.userData.w, 0), span = o.a1 - o.a0, sc = tot > span * .96 ? span * .96 / tot : 1, gap = (span - tot * sc) / (S.length + 1);
    let a = o.a0 + gap;
    S.forEach((g, i) => { g.scale.setScalar(sc); const w = g.userData.w * sc, c = a + w / 2; a += w + gap; const jit = o.flat ? 0 : (rnd() - .5) * (o.jit ?? .03);
      g.position.set(c, o.y, o.c + jit); g.rotation.y = (o.ry || 0) + (o.flat ? 0 : (rnd() - .5) * .25); if (o.flat) g.rotation.z = (rnd() - .5) * .18;
      o.parent.add(g); pop(g, (o.t0 || 2.1) + i * .02); });
    return S;
  }

  // the kitchen: the electronics bench, its pegboard, the stereo
  const kitchen = station(AC + Math.PI, 1.0, F0); pop(kitchen, 1.6);
  kitchen.add(clothTable(1.5, .6, .62, '#DCE8F2'));
  const mat = new T.Mesh(new T.BoxGeometry(.7, .006, .42), flat('#5C93CF')); mat.position.set(.05, .645, 0); kitchen.add(mat);
  const stereo = EXTRA.stereo({ gap: .42 }); stereo.scale.setScalar(.3); stereo.position.set(.33, .645, -.1); kitchen.add(stereo);
  const LAYER_GAP = stereo.userData.gap; let explodeT = 0, explodeTo = 0;
  function setExplode(t) { stereo.children.forEach(ch => { const k = ch.userData.layer; if (k == null) return; if (k < 0) { ch.visible = t > .55; return; } ch.position.y = ch.userData.y0 + k * (.07 + (LAYER_GAP - .07) * t - LAYER_GAP); }); }
  setExplode(0);
  const pegC = cnv(900, 280, (g, w, h) => { g.fillStyle = '#F3E3C6'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(140,100,60,.5)'; for (let y = 14; y < h; y += 22) for (let x = 14; x < w; x += 22) { g.beginPath(); g.arc(x, y, 3, 0, 7); g.fill(); } grainOver(g, w, h, 400); });
  const peg = card(1.42, .44, .025, pegC, '#D6B98A'); peg.position.set(0, .865, -.285); kitchen.add(peg);
  [-.7, .7].forEach(x => bx(.03, .46, .03, flat('#D6B98A'), [x, .875, -.28], kitchen));
  await lay([['pliers', .17], ['cutters', .15], ['drivers', .13], ['tweezers', .15], ['zippliers', .14], ['brush', .15], ['awl', .14], ['knife', .12]], { a0: -.68, a1: .68, c: -.265, y: .8, flat: true, parent: kitchen });
  await lay([['wire', .1], ['braid', .1], ['zipties', .14], ['fluxpen', .13], ['mat', .12], ['tape', .1], ['strain', .09], ['wool', .1]], { a0: -.68, a1: .68, c: -.265, y: .67, flat: true, parent: kitchen });
  await lay([['iron', .2], ['worklight', .19], ['killawatt', .16], ['meter', .19]], { a0: -.74, a1: -.24, c: -.16, y: .645, ry: .2, parent: kitchen });
  await lay([['psu', .11], ['tester', .12], ['magnifier', .15], ['loupe', .1]], { a0: -.74, a1: -.24, c: .14, y: .645, ry: .2, parent: kitchen });
  await lay([['caps', .09], ['led', .08], ['screws', .08]], { a0: .52, a1: .74, c: -.16, y: .645, ry: -.1, parent: kitchen });
  await lay([['crimps', .08], ['fuses', .07], ['flux', .09]], { a0: .52, a1: .74, c: .12, y: .645, ry: -.1, parent: kitchen });
  // the volunteer's empty chair, an apron over its back
  const ch = chair('#56608A'); ch.position.set(.02, 0, .62); ch.rotation.y = Math.PI + .25; kitchen.add(ch);
  const apron = new T.Mesh(new T.PlaneGeometry(.26, .36), toon(cnv(256, 340, (g, w, h) => { g.fillStyle = '#F2C4CC'; g.fillRect(0, 0, w, h); g.fillStyle = '#FFFFFF'; g.fillRect(40, 120, w - 80, 60); g.font = '24px Italiana'; g.fillStyle = '#24315F'; g.textAlign = 'center'; g.fillText('VOLUNTEER', w / 2, 160); grainOver(g, w, h, 300); })));
  apron.material.side = T.DoubleSide; apron.position.set(0, .54, -.175); apron.rotation.set(.1, Math.PI, 0); ch.add(apron);
  // a pearl drape behind the kitchen: a sugared-almond ombré, gathered with gold tiebacks
  { const a0 = AC + Math.PI - .62, a1 = AC + Math.PI + .62, yb = F0 + .02, yt = F1 - F1T - .04, pos = [], uv = [], idx = [], N = 60, M = 8;
    for (let i = 0; i <= N; i++) for (let j = 0; j <= M; j++) { const a = a0 + (a1 - a0) * i / N, y = yb + (yt - yb) * j / M, r = rr(y) - .14 - Math.sin(i / N * Math.PI * 14) * .03 * (1 - j / M * .3); pos.push(Math.sin(a) * r, y, Math.cos(a) * r); uv.push(i / N, j / M); }
    for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) { const a = i * (M + 1) + j, b = a + M + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    const m = new T.MeshToonMaterial({ map: tex(PT.drape(1024, 512, 1)), gradientMap: ramp, side: T.DoubleSide }); pot.add(new T.Mesh(g, m));
    const gar = new T.Mesh(new T.PlaneGeometry(2.3, .36), new T.MeshToonMaterial({ map: tex(PT.garland()), gradientMap: ramp, transparent: true, alphaTest: .4, side: T.DoubleSide }));
    gar.position.copy(pol(AC + Math.PI, rr(yt) - .3, yt - .14)); gar.rotation.y = AC; pot.add(gar); }

  // the order counter: intake, a ticket rail, the menu of what gets fixed
  const intake = station(AC + 2.3, 1.28, F0); pop(intake, 1.7);
  { const marble = toon(cnv(256, 256, (g, w, h) => { g.fillStyle = '#FBF9F6'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(150,160,180,.35)'; g.lineWidth = 1.5; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(rnd() * w, 0); g.bezierCurveTo(rnd() * w, h * .3, rnd() * w, h * .6, rnd() * w, h); g.stroke(); } }));
    const front = toon(cnv(256, 160, (g, w, h) => { g.fillStyle = '#D9E8F2'; g.fillRect(0, 0, w, h); g.strokeStyle = '#C8A866'; g.lineWidth = 3; [[14, 16], [134, 16]].forEach(([x, y]) => { g.beginPath(); g.roundRect(x, y, 108, h - 32, 10); g.stroke(); }); }));
    bx(1.0, .6, .42, [front, front, marble, marble, front, front], [0, .3, 0], intake, .006); bx(1.06, .03, .46, marble, [0, .615, 0], intake);
    // ticket rail above
    const railM = new T.MeshToonMaterial({ color: 0xD8B76E, gradientMap: ramp }); const rail = new T.Mesh(new T.CylinderGeometry(.01, .01, 1.0, 8), railM); rail.rotation.z = Math.PI / 2; rail.position.set(0, 1.18, -.12); intake.add(rail);
    ['#F2C4CC', '#CFE6DA', '#F6E6A8', '#D9E8F2', '#E2D6F3', '#F2C4CC'].forEach((col, i) => { const tk = new T.Mesh(new T.PlaneGeometry(.1, .15), new T.MeshToonMaterial({ map: tex(PT.ticket(String(11 + i * 7).padStart(3, '0'), col)), gradientMap: ramp, transparent: true, side: T.DoubleSide })); tk.position.set(-.42 + i * .17, 1.1, -.115); tk.rotation.z = (rnd() - .5) * .2; intake.add(tk); }); }
  await lay([['laptop', .14], ['spike', .17], ['tin', .08]], { a0: -.45, a1: .45, c: .02, y: .63, parent: intake, t0: 2.0 });
  const menuWall = painted(PT.menuBoard('Menu', ['Appliances', 'Electronics', 'Mechanical', 'PC / Phone', 'Woodwork', 'Sewing']), .58, { flat: true, border: 5 }); menuWall.position.set(0, 1.28 - F0 + .1, -.2); intake.add(menuWall);

  // the appliance table: the brass lamp, the heart clock, an aluminium case left open
  const appl = station(AC + Math.PI + .95, 1.25, F0); pop(appl, 1.75);
  appl.add(clothTable(1.0, .55, .62, '#F6E9C8'));
  const cand = painted(PT.candelabra(), .62); cand.position.set(-.22, .645, -.08); appl.add(cand);
  const heart = painted(PT.heartClock(), .36); heart.position.set(.25, .645, -.06); heart.rotation.y = -.15; appl.add(heart);
  const lampLight = new T.PointLight(0xFFD9A0, .9, 2.2); lampLight.position.set(-.22, 1.3, .2); appl.add(lampLight);
  [[0, 1.2], [-.11, 1.1], [.11, 1.1]].forEach(([dx, y]) => glow([-.22 + dx, y, -.07], .26, appl));
  { const ac = new T.Group(); ac.position.set(.3, .645, .16); ac.rotation.y = -.3; appl.add(ac);
    const alu = toon(cnv(128, 128, (g, w, h) => { g.fillStyle = '#D2D6DC'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 6) { g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(x, 0, 2, h); } }));
    bx(.26, .07, .17, alu, [0, .035, 0], ac); const hinge = new T.Group(); hinge.position.set(0, .07, -.085); hinge.rotation.x = -1.95; ac.add(hinge); bx(.26, .02, .17, alu, [0, .01, .085], hinge);
    const ring = new T.Mesh(new T.TorusGeometry(.055, .009, 8, 40), new T.MeshToonMaterial({ color: 0xE0C177, gradientMap: ramp })); ring.rotation.x = Math.PI / 2; ring.position.set(0, .08, 0); ac.add(ring);
    [['#4C8FD0', -.07], ['#E8857B', .07]].forEach(([c, x]) => bx(.05, .03, .05, flat(c), [x, .07, .02], ac)); }
  await lay([['socket3', .12], ['chain3', .12], ['bulbs', .09], ['plug', .08], ['switch', .08], ['mixerparts', .09], ['belts', .07], ['glasses', .06]], { a0: -.5, a1: .2, c: .18, y: .645, ry: .1, parent: appl });

  // the pass: orders waiting on a shelf
  const pass = station(AC - 1.55, 1.48, F0); pop(pass, 1.8);
  const shelf = shelfUnit(.8, .24, .84, [.02, .29, .56], '#FFFDF8'); pass.add(shelf);
  await lay([['vacuum', .2], ['bike', .17], ['fan', .2], ['trousers', .2], ['coat', .2]], { a0: -.38, a1: .38, c: .02, y: .03, parent: shelf, t0: 2.2 });
  await lay([['lamp', .2], ['blender', .21], ['coffeemaker', .2], ['ultrasonic', .13], ['printer', .13]], { a0: -.38, a1: .38, c: .02, y: .3, parent: shelf, t0: 2.25 });
  await lay([['radio', .14], ['clock', .16], ['doll3', .17], ['toolbox', .14]], { a0: -.38, a1: .38, c: .02, y: .57, parent: shelf, t0: 2.3 });
  await lay([['vase', .2]], { a0: -.3, a1: .1, c: 0, y: .855, parent: shelf, t0: 2.35 });

  // a tea corner for the people waiting
  const tea = station(AC + .75, 1.15, F0); pop(tea, 1.85);
  { const top = inked(new T.CylinderGeometry(.36, .36, .03, 40), toon(cnv(256, 256, (g, w, h) => { g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, w, h); g.strokeStyle = '#F2C4CC'; g.lineWidth = 6; g.beginPath(); g.arc(128, 128, 112, 0, 7); g.stroke(); for (let i = 0; i < 24; i++) { const a = i / 24 * 7; g.fillStyle = '#F2C4CC'; g.beginPath(); g.arc(128 + Math.cos(a) * 120, 128 + Math.sin(a) * 120, 7, 0, 7); g.fill(); } })), .005); top.position.y = .52; tea.add(top);
    const leg = new T.Mesh(new T.CylinderGeometry(.025, .04, .52, 12), new T.MeshToonMaterial({ color: 0xD8B76E, gradientMap: ramp })); leg.position.y = .26; tea.add(leg);
    const tp = teapot({ tint: '#9CC2E6' }); tp.scale.setScalar(.2); tp.position.set(-.12, .535, -.06); tea.add(tp);
    [['#F4B9C6', .14, .12], ['#CFE6DA', -.04, .2]].forEach(([c, x, z]) => { const cu = teacup({ tint: c, pct: 70 }); cu.scale.setScalar(.14); cu.position.set(x, .535, z); tea.add(cu); });
    const dr = painted(PT.drink(), .2); dr.position.set(.16, .535, -.1); tea.add(dr);
    const pu = painted(PT.pudding(), .13); pu.position.set(-.18, .535, .15); tea.add(pu);
    [[-.5, .1, .6], [.45, -.2, -.6]].forEach(([x, z, r]) => { const c = bistroChair(); c.position.set(x, 0, z); c.rotation.y = r + Math.PI / 2 * Math.sign(x); tea.add(c); }); }
  await lay([['plate', .05], ['croissant', .05], ['macaron', .045], ['cherry', .06], ['sugarbowl', .07], ['creamer', .07], ['spoon', .06]], { a0: -.3, a1: .3, c: .02, y: .535, parent: tea, ry: .3, t0: 2.3 });

  // toolboxes on the floor by the kitchen
  const tools = station(AC - .75, 1.25, F0); pop(tools, 1.9);
  { const rb = new T.Group(); rb.rotation.y = .3; tools.add(rb); const blk = flat('#3B4672'), yel = flat('#E3CB92');
    bx(.32, .22, .2, blk, [0, .13, 0], rb); bx(.32, .14, .2, blk, [0, .32, 0], rb); bx(.3, .02, .19, flat('#45424F'), [0, .4, 0], rb);
    [-.11, .11].forEach(x => { bx(.04, .03, .012, yel, [x, .22, .105], rb); bx(.04, .03, .012, yel, [x, .37, .105], rb); });
    [-.13, .13].forEach(x => { const wh = new T.Mesh(new T.CylinderGeometry(.04, .04, .03, 18), flat('#1E1C25')); wh.rotation.z = Math.PI / 2; wh.position.set(x, .04, -.08); rb.add(wh); const rod = new T.Mesh(new T.CylinderGeometry(.007, .007, .3, 8), flat('#9AA0AA')); rod.position.set(x * .8, .55, -.1); rb.add(rod); });
    bx(.24, .025, .025, blk, [0, .7, -.1], rb);
    const tt = new T.Group(); tt.position.set(.42, 0, .1); tt.rotation.y = -.4; tools.add(tt); const pine = toon(P2.woodCanvas('#E3C28E', 256, 256));
    bx(.3, .06, .16, pine, [0, .03, 0], tt); bx(.3, .008, .16, pine, [0, .064, 0], tt); [-1, 1].forEach(sd => bx(.3, .07, .008, pine, [0, .1, sd * .076], tt));
    const end = new T.Shape(); end.moveTo(-.08, 0); end.lineTo(.08, 0); end.lineTo(.08, .07); end.quadraticCurveTo(.04, .17, 0, .17); end.quadraticCurveTo(-.04, .17, -.08, .07); end.closePath();
    [-1, 1].forEach(sd => { const eg = new T.ExtrudeGeometry(end, { depth: .012, bevelEnabled: false }); eg.rotateY(Math.PI / 2); const e = inked(eg, pine, .004); e.position.set(sd * .15 - .006, .064, 0); tt.add(e); });
    const hd = new T.Mesh(new T.CylinderGeometry(.01, .01, .3, 10), pine); hd.rotation.z = Math.PI / 2; hd.position.y = .21; tt.add(hd);
    [['#E8857B', -.08], ['#86AEDC', .02], ['#EFC15E', .09]].forEach(([c, x]) => bx(.06, .05, .05, flat(c), [x, .1, -.03], tt));
    const og = new T.Group(); og.position.set(-.38, 0, .12); tools.add(og); const clear = new T.MeshBasicMaterial({ color: 0xE6F0F2, transparent: true, opacity: .5, depthWrite: false });
    const sh = new T.Mesh(new T.BoxGeometry(.2, .045, .12), clear); sh.position.y = .0225; og.add(sh); for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) { const bit = new T.Mesh(new T.BoxGeometry(.03, .015, .03), flat(['#E8857B', '#EFC15E', '#86AEDC', '#8FCBB2', '#B79FD6', '#3E3A3F', '#F0A05A', '#C8A866'][i * 2 + j])); bit.position.set(-.075 + i * .05, .01, -.026 + j * .052); og.add(bit); } }

  // a spiral stair up to the patisserie
  { const st = new T.Group(); st.position.copy(pol(AC + 1.6, 1.38, F0)); pot.add(st); pop(st, 1.95);
    const stepM = toon(cnv(64, 64, (g) => { g.fillStyle = '#FFFDF8'; g.fillRect(0, 0, 64, 64); g.fillStyle = '#F2C4CC'; g.fillRect(0, 54, 64, 10); }));
    const pole = new T.Mesh(new T.CylinderGeometry(.025, .025, F1 - F0, 10), new T.MeshToonMaterial({ color: 0xD8B76E, gradientMap: ramp })); pole.position.y = (F1 - F0) / 2; st.add(pole);
    for (let k = 0; k < 12; k++) { const s = inked(new T.BoxGeometry(.32, .03, .1), stepM, .003); const a = k / 12 * Math.PI * 1.6; s.position.set(Math.cos(a) * .17, (k + 1) * (F1 - F0) / 13, -Math.sin(a) * .17); s.rotation.y = a; st.add(s); } }

  // ---------------- upstairs: the keepsake room and the patisserie ----------------
  const keep = station(AC + Math.PI, 1.45, F1); pop(keep, 2.0);
  const wood = toon(P2.woodCanvas('#B07A52', 256, 256));
  const body = bx(.52, .62, .34, toon(cnv(256, 256, (g, w, h) => { g.fillStyle = '#FFFDF8'; g.fillRect(0, 0, w, h); g.strokeStyle = '#C8A866'; g.lineWidth = 4; g.strokeRect(10, 10, w - 20, h - 20); })), [0, .31, 0], keep);
  const drawers = []; [.5, .32, .14].forEach(y => { const d = new T.Group(); bx(.46, .15, .3, toon(cnv(128, 64, (g, w, h) => { g.fillStyle = '#F7E3E8'; g.fillRect(0, 0, w, h); g.strokeStyle = '#C8A866'; g.lineWidth = 3; g.strokeRect(6, 6, w - 12, h - 12); })), [0, 0, .03], d);
    const k = new T.Mesh(new T.SphereGeometry(.016, 10, 8), new T.MeshToonMaterial({ color: 0xE0C177, gradientMap: ramp })); k.position.set(0, 0, .19); d.add(k); d.position.set(0, y, 0); keep.add(d); drawers.push(d); });
  const clock = EXTRA.cuckoo({ drop: .5 }); clock.scale.setScalar(.44); clock.position.set(0, .9, -.12); keep.add(clock);
  const clockLight = new T.PointLight(0xFFC98A, 0, 1.2); clockLight.position.set(0, 1.25, .3); keep.add(clockLight);
  await lay([['cakewhole', .09], ['cakemissing', .09]], { a0: -.26, a1: .26, c: .08, y: .62, parent: keep, ry: 0, t0: 2.3 });
  // the rainbow-fringed "We fixed it!" board hangs to one side
  const fixB = cutout(await imgTex(ASSETS.tex.fixboard[0]), .62 * ASSETS.tex.fixboard[1] / ASSETS.tex.fixboard[2], .62, { flat: true }); const fbAz = AC + Math.PI - .78; fixB.position.copy(pol(fbAz, rr(F1 + .9) - .2, F1 + .45)); fixB.rotation.y = fbAz + Math.PI; pot.add(fixB); pop(fixB, 2.2);
  // the patisserie: sewing tables and a notions cart
  const sew = station(AC + Math.PI + .95, 1.62, F1); pop(sew, 2.05);
  sew.add(clothTable(1.0, .55, .62, '#F7E1E6'));
  await lay([['machine', .3], ['bernina', .28]], { a0: -.48, a1: .32, c: -.12, y: .645, parent: sew });
  await lay([['tomato', .09], ['spools', .09], ['bobbins', .07], ['needles', .08], ['needle3', .09], ['pins', .07], ['thimble', .05]], { a0: -.48, a1: .48, c: .08, y: .645, ry: -.1, parent: sew });
  await lay([['ripper', .09], ['scissors', .09], ['tapemeasure', .08], ['feltbook', .08], ['zipkit', .08], ['slider3', .07], ['buttons', .07], ['beads', .05], ['jumprings', .05], ['clasps', .05], ['earrings', .06]], { a0: -.48, a1: .48, c: .21, y: .645, ry: -.1, parent: sew });
  const cart = station(AC - 1.85, 1.8, F1); pop(cart, 2.1);
  { const cm = flat('#FFFDF8'), leg = new T.MeshToonMaterial({ color: 0xD8B76E, gradientMap: ramp }); bx(.44, .02, .28, cm, [0, .52, 0], cart); bx(.44, .02, .28, cm, [0, .24, 0], cart);
    [[-.2, -.12], [.2, -.12], [-.2, .12], [.2, .12]].forEach(([x, z]) => { const l = new T.Mesh(new T.CylinderGeometry(.008, .008, .52, 8), leg); l.position.set(x, .27, z); cart.add(l); }); }
  await lay([['innovis', .22], ['sewingmachine', .22]], { a0: -.21, a1: .21, c: 0, y: .53, parent: cart });
  await lay([['ribbons', .1], ['biastape', .1], ['velcro', .07], ['webbing', .07], ['hooks', .09]], { a0: -.21, a1: .21, c: 0, y: .25, parent: cart });
  // the notions stand, dressed up as pastry, and the supplies case
  const pat = station(AC + 1.95, 1.6, F1); pop(pat, 2.1);
  const stand = await standee('stand', .55); pat.add(stand);
  const supply = station(AC + Math.PI - 1.9, 1.8, F1); pop(supply, 2.0);
  const sshelf = shelfUnit(.7, .22, .8, [.02, .27, .52], '#FFFDF8'); supply.add(sshelf);
  await lay([['vinegar', .16], ['lube', .14], ['glue', .12], ['wipes', .14]], { a0: -.33, a1: .33, c: .02, y: .03, parent: sshelf });
  await lay([['sandpaper', .1], ['dowels', .09], ['string', .1], ['fraycheck', .11], ['bag', .11]], { a0: -.33, a1: .33, c: .02, y: .28, parent: sshelf });
  await lay([['caution', .1], ['vase2', .18], ['bow', .06], ['napkin', .06]], { a0: -.33, a1: .33, c: .02, y: .53, parent: sshelf });
  // chandeliers: one under the lid, one under the upper floor
  function chandelier(p, r, n, parent) { const g = new T.Group(); g.position.copy(p); parent.add(g); const gm = new T.MeshToonMaterial({ color: 0xE3C276, gradientMap: ramp });
    const ring = new T.Mesh(new T.TorusGeometry(r, .012, 8, 48), gm); ring.rotation.x = Math.PI / 2; g.add(ring); const rod = new T.Mesh(new T.CylinderGeometry(.006, .006, .5, 6), gm); rod.position.y = .25; g.add(rod);
    for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; const b = new T.Mesh(new T.SphereGeometry(.03, 14, 10), new T.MeshBasicMaterial({ color: 0xFFF3D6 })); b.position.set(Math.cos(a) * r, .04, Math.sin(a) * r); g.add(b); glow([Math.cos(a) * r, .04, Math.sin(a) * r], .16, g);
      const drop = new T.Mesh(new T.OctahedronGeometry(.02), new T.MeshBasicMaterial({ color: 0xF5E9FF })); drop.position.set(Math.cos(a + .3) * r, -.08, Math.sin(a + .3) * r); g.add(drop); } return g; }
  const ch1 = chandelier(new T.Vector3(...pol(AC + Math.PI, .9, H - .2).toArray()), .2, 6, pot); pop(ch1, 2.2);
  const ch2 = chandelier(new T.Vector3(...pol(AC + Math.PI, .6, F1 - F1T - .32).toArray()), .2, 6, pot); pop(ch2, 2.2);
  const lightA = new T.PointLight(0xFFDDA8, 1.0, 4); lightA.position.copy(pol(AC + Math.PI, .9, H - .5)); pot.add(lightA);
  const lightB = new T.PointLight(0xFFDDA8, .7, 3); lightB.position.copy(pol(AC + Math.PI, .6, F1 - .6)); pot.add(lightB);

  // ---------------- outside, on the open pages ----------------
  // the pavement: a menu board, a bistro table under a striped parasol, potted bay trees
  const door = station(AC + .95, 3.35, 0); door.rotation.y = AC + .35; pop(door, 2.3);
  const menuBoard = painted(PT.menuBoard('Today’s menu', ['Lamps', 'Toasters', 'Zippers', 'Radios', 'Clocks', 'Anything else?']), .62, { border: 5 }); menuBoard.position.set(-.35, 0, .2); menuBoard.rotation.x = -.12; door.add(menuBoard);
  { const t = new T.Group(); t.position.set(.42, 0, -.15); door.add(t); const gm = new T.MeshToonMaterial({ color: 0xD8B76E, gradientMap: ramp });
    const top = inked(new T.CylinderGeometry(.2, .2, .02, 32), flat('#FFFDF8'), .004); top.position.y = .5; t.add(top); const pole = new T.Mesh(new T.CylinderGeometry(.012, .012, 1.25, 8), gm); pole.position.y = .62; t.add(pole);
    const para = new T.Mesh(new T.ConeGeometry(.55, .22, 16, 1, true), toon(cnv(512, 64, (g, w, h) => { for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? '#FFFDF8' : '#F2C4CC'; g.fillRect(i * w / 16, 0, w / 16, h); } }))); para.material.side = T.DoubleSide; para.position.y = 1.3; t.add(para);
    for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; const s = new T.Mesh(new T.CircleGeometry(.04, 10, 0, Math.PI), flat(i % 2 ? '#FFFDF8' : '#F2C4CC')); s.position.set(Math.sin(a) * .55, 1.19, Math.cos(a) * .55); s.rotation.set(Math.PI, a, 0); s.material.side = T.DoubleSide; t.add(s); }
    [[-.32, 0], [.32, Math.PI]].forEach(([x, r]) => { const c = bistroChair(); c.position.set(x, 0, 0); c.rotation.y = r + Math.PI / 2; t.add(c); });
    const pd = painted(PT.parfait(), .2); pd.position.set(.06, .51, .02); t.add(pd); }
  [[-.85, .1], [.95, .35]].forEach(([x, z]) => { const p = new T.Group(); p.position.set(x, 0, z); door.add(p); const potM2 = toon(chinaCanvas('#9CC2E6', { gold: [.9], dots: [.5, 24] }));
    p.add(inked(lathe([[0, 0], [.1, 0], [.13, .16], [.14, .2], [0, .2]], 24), potM2, .004)); const stem = new T.Mesh(new T.CylinderGeometry(.012, .012, .3, 6), flat('#7A5A40')); stem.position.y = .32; p.add(stem);
    const ball = inked(new T.SphereGeometry(.17, 16, 12), flat('#9CCBA6'), .006); ball.position.y = .56; p.add(ball); [0, 1, 2, 3, 4].forEach(k => { const f = new T.Mesh(new T.SphereGeometry(.025, 8, 6), flat(ROSES[k % 4])); const a = k * 1.3; f.position.set(Math.cos(a) * .15, .56 + Math.sin(k) * .08, Math.sin(a) * .15); p.add(f); }); });
  // order up: a marble console under the spout, the final object under a glass cloche, a service bell
  const order = station(AC - .9, 3.3, 0); order.rotation.y = AC - .3; pop(order, 2.35);
  { const marble = toon(cnv(256, 256, (g, w, h) => { g.fillStyle = '#FBF9F6'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(150,160,180,.35)'; g.lineWidth = 1.5; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(rnd() * w, 0); g.bezierCurveTo(rnd() * w, h * .3, rnd() * w, h * .6, rnd() * w, h); g.stroke(); } }));
    const gm = new T.MeshToonMaterial({ color: 0xD8B76E, gradientMap: ramp });
    bx(.9, .04, .4, marble, [0, .6, 0], order); [[-.4, -.16], [.4, -.16], [-.4, .16], [.4, .16]].forEach(([x, z]) => { const l = new T.Mesh(new T.CylinderGeometry(.015, .01, .6, 8), gm); l.position.set(x, .3, z); order.add(l); });
    const bell = new T.Group(); bell.position.set(-.3, .62, .06); order.add(bell); const bd = new T.Mesh(new T.SphereGeometry(.05, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), gm); bell.add(bd); const bb = new T.Mesh(new T.CylinderGeometry(.06, .06, .012, 20), flat('#3E3A4A')); bell.add(bb); }
  const clocheS = painted(PT.cloche(), .62, { border: 4 }); clocheS.position.set(.12, .62, 0); order.add(clocheS);
  
  const orderSign = painted(cnv(360, 120, (g, w, h) => { g.fillStyle = '#24315F'; g.beginPath(); g.roundRect(4, 4, w - 8, h - 8, 50); g.fill(); g.strokeStyle = '#D9BC7A'; g.lineWidth = 3; g.beginPath(); g.roundRect(14, 14, w - 28, h - 28, 40); g.stroke(); g.fillStyle = '#FFFCF6'; g.textAlign = 'center'; g.font = 'italic 600 60px "Cormorant Garamond"'; g.fillText('Order up', w / 2, 80); }), .11, { flat: true, border: 4 }); orderSign.position.set(-.32, 1.02, -.12); order.add(orderSign);
  { const pole = new T.Mesh(new T.CylinderGeometry(.01, .01, .5, 6), new T.MeshToonMaterial({ color: 0xD8B76E, gradientMap: ramp })); pole.position.set(-.32, .85, -.14); order.add(pole); }
  // sparkles poured from the spout toward the counter
  const pour = new T.Points(new T.BufferGeometry(), new T.PointsMaterial({ map: glowTex, size: .07, transparent: true, depthWrite: false, blending: T.AdditiveBlending, color: 0xFFE9C8 }));
  { const n = 60, a = new Float32Array(n * 3); pour.geometry.setAttribute('position', new T.BufferAttribute(a, 3)); pour.userData.t = Array.from({ length: n }, () => rnd()); }
  world.add(pour);
  const spoutTip = spCurve.getPointAt(1).clone().add(TC), counterTop = new T.Vector3(); order.updateMatrixWorld(true);
  // ---------------- dressing the scene: shadows, garden, lamps, string lights, windows, pictures ----------------
  const shTex = tex(PT.shadowBlob());
  function shadowUnder(parent, w, d, y = .004, op = 1) { const m = new T.Mesh(new T.PlaneGeometry(w, d), new T.MeshBasicMaterial({ map: shTex, transparent: true, depthWrite: false, opacity: op })); m.rotation.x = -Math.PI / 2; m.position.y = y; parent.add(m); return m; }
  [[kitchen, 1.9, 1.0], [intake, 1.3, .7], [appl, 1.3, .8], [pass, 1.0, .5], [tea, 1.3, 1.1], [tools, 1.3, .8], [keep, .8, .6], [sew, 1.3, .8], [cart, .7, .5], [supply, .9, .5], [door, 2.4, 1.4], [order, 1.3, .8]].forEach(([o, w, d]) => shadowUnder(o, w, d));
  { const potSh = new T.Mesh(new T.PlaneGeometry(7.2, 4.2), new T.MeshBasicMaterial({ map: shTex, transparent: true, depthWrite: false, opacity: .8 })); potSh.rotation.x = -Math.PI / 2; potSh.position.set(TC.x, BASE + .003, TC.z); world.add(potSh); }
  console.warn('MARK // the garden on the open page', performance.now()|0);
  // the garden on the open pages: painted trees and flowering bushes, with a stepping-stone path to the door
  const garden = new T.Group(); world.add(garden);
  const atW = (az, r) => pol(az, r, 0).add(TC).setY(BASE);
  const trees = [[AC + Math.PI - .55, 3.45, 3.0, 1, 'round'], [AC + Math.PI + .5, 3.6, 2.6, 2, 'blossom'], [AC + Math.PI + 1.25, 3.5, 2.3, 3, 'cone'], [AC + 2.25, 3.55, 2.2, 4, 'blossom'], [AC - 2.0, 3.6, 2.5, 5, 'round'], [AC - 1.55, 3.9, 1.9, 6, 'cone']];
  trees.forEach(([az, r, h, seed, kind], i) => { const t = painted(PT.tree(seed, kind), h, { border: 0, flat: true }); t.position.copy(atW(az, r)); t.rotation.y = AC; garden.add(t); shadowUnder(t, h * .7, h * .3, .006, .7); pop(t, 1.4 + i * .06); });
  [[AC + .62, 3.0, .5, 1], [AC - .62, 3.0, .45, 2], [AC + 1.35, 3.0, .55, 3], [AC - 1.3, 3.05, .5, 4], [AC + .2, 3.55, .4, 5], [AC + Math.PI, 3.1, .5, 6]].forEach(([az, r, h, seed]) => { const b = painted(PT.bush(seed), h, { border: 0, flat: true }); b.position.copy(atW(az, r)); b.rotation.y = AC; garden.add(b); pop(b, 1.9); });
  { const stoneM = new T.MeshToonMaterial({ color: 0xEDE6DA, gradientMap: ramp }); const p0 = atW(AC + .28, 4.6), p1 = atW(AC + .5, 2.45);
    for (let k = 0; k < 7; k++) { const p = p0.clone().lerp(p1, k / 6); const st = inked(new T.CylinderGeometry(.16 + (k % 2) * .03, .17, .03, 18), stoneM, .004); st.position.set(p.x + Math.sin(k * 1.7) * .08, BASE + .015, p.z); st.scale.z = .75; garden.add(st); } }
  console.warn('MARK // lamp posts by the door', performance.now()|0);
  // lamp posts by the door and by the counter
  const lamps = [door, order].map((st, i) => { const L = painted(PT.lampPost(), 1.85, { border: 0, flat: true }); L.position.set(i ? .7 : -.95, 0, i ? -.25 : -.35); L.rotation.y = AC - st.rotation.y; st.add(L); glow([L.position.x, 1.7, L.position.z + .02], .55, st); return L; });
  // string lights: from the lid knob out to each lamp, sagging, with warm bulbs
  scene.updateMatrixWorld(true);
  const knobW = pol(AC + Math.PI, .2, H + .9).add(TC);
  function stringLights(a, b, sag, n, cols) { const pts = []; for (let i = 0; i <= 40; i++) { const t = i / 40; pts.push(a.clone().lerp(b, t).add(new T.Vector3(0, -Math.sin(t * Math.PI) * sag, 0))); }
    world.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 60, .006, 4), new T.MeshBasicMaterial({ color: 0x5A4E48 })));
    for (let k = 1; k < n; k++) { const t = k / n, p = a.clone().lerp(b, t).add(new T.Vector3(0, -Math.sin(t * Math.PI) * sag - .03, 0)); const bulb = new T.Mesh(new T.SphereGeometry(.028, 10, 8), new T.MeshBasicMaterial({ color: cols[k % cols.length] })); bulb.position.copy(p); world.add(bulb); glow(p.toArray(), .2, world); } }
  lamps.forEach(L => { const p = wp(L).add(new T.Vector3(0, 1.62, 0)); stringLights(knobW, p, .9, 16, [0xFFF1C9, 0xFFD9E0, 0xFFF1C9, 0xD9ECFF]); });
  // bunting from the spout to the far tree
  { const a = spCurve.getPointAt(.95).clone().add(TC), b = atW(AC - 2.0, 3.6).add(new T.Vector3(0, 1.9, 0)); const cols = ['#F3D5DA', '#E3EDF5', '#F6E6B4', '#DCEEDF', '#E9DDF3'];
    const pts = []; for (let i = 0; i <= 30; i++) { const t = i / 30; pts.push(a.clone().lerp(b, t).add(new T.Vector3(0, -Math.sin(t * Math.PI) * .35, 0))); }
    world.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 40, .005, 4), new T.MeshBasicMaterial({ color: 0x8C7B74 })));
    for (let k = 1; k < 12; k++) { const p = pts[Math.round(k / 12 * 30)]; const sh = new T.Shape(); sh.moveTo(-.07, 0); sh.lineTo(.07, 0); sh.lineTo(0, -.15); sh.closePath(); const f = new T.Mesh(new T.ShapeGeometry(sh), new T.MeshToonMaterial({ color: new T.Color(cols[k % 5]), gradientMap: ramp, side: T.DoubleSide })); f.position.copy(p); f.rotation.y = AC; world.add(f); } }
  // windows with flower boxes on the porcelain, on both sides
  [[AC + 1.62, .9, '#E9A3B1'], [AC - 1.42, .95, '#9CC2E6'], [AC + 2.35, 2.25, '#9CC2E6'], [AC - 2.25, 2.2, '#E9A3B1'], [AC + 1.55, 2.3, '#F2C4CC']].forEach(([az, y, col]) => { const w = painted(PT.windowBox(col), .78, { border: 0, flat: true }); w.position.copy(pol(az, rr(y) + .07, y - .39)); w.rotation.y = az; pot.add(w); pop(w, 2.0); });
  // pictures on the inside walls, a rug under the tea table, plants in the corners, fairy lights along the upper rail
  [[AC + Math.PI + .78, 1.05, 0, .32], [AC + Math.PI - .8, 1.12, 1, .3], [AC + Math.PI + .42, F1 + .95, 2, .28], [AC + Math.PI - .45, F1 + 1.0, 1, .26], [AC - 1.95, 1.0, 2, .26]].forEach(([az, y, kind, h]) => { const f = painted(PT.framed(kind), h, { border: 0, flat: true }); f.position.copy(pol(az, rr(y) - .14, y - h / 2)); f.rotation.y = az + Math.PI; pot.add(f); pop(f, 2.1); });
  { const rug = new T.Mesh(new T.CircleGeometry(.62, 48), toon(cnv(512, 512, (g, w, h) => { g.fillStyle = '#F3D5DA'; g.beginPath(); g.arc(256, 256, 256, 0, 7); g.fill(); g.strokeStyle = '#FFFDF9'; g.lineWidth = 10; g.beginPath(); g.arc(256, 256, 220, 0, 7); g.stroke(); g.strokeStyle = '#C4566B'; g.lineWidth = 3; g.setLineDash([6, 10]); g.beginPath(); g.arc(256, 256, 200, 0, 7); g.stroke(); g.setLineDash([]); for (let i = 0; i < 12; i++) { const a = i / 12 * 7; g.fillStyle = '#FFFDF9'; g.beginPath(); g.ellipse(256 + Math.cos(a) * 130, 256 + Math.sin(a) * 130, 22, 10, a, 0, 7); g.fill(); } })));
    rug.rotation.x = -Math.PI / 2; rug.position.y = .006; tea.add(rug); }
  [[AC + Math.PI + 1.65, 1.55, F0, .5, 1], [AC + Math.PI - 1.75, 1.5, F0, .45, 2], [AC + 2.6, 2.0, F1, .42, 3], [AC - 2.65, 2.05, F1, .4, 4]].forEach(([az, r, y, h, seed]) => { const pl = painted(PT.plant(seed), h, { border: 0 }); pl.position.copy(pol(az, r, y)); pl.rotation.y = AC; pot.add(pl); pop(pl, 2.2); });
  { const r1 = rr(F1) - .1; [PH0 + .03, PH0 + PHL - .03].forEach(a => { for (let k = 0; k <= 10; k++) { const p = pol(a, .3 + (r1 - .3) * k / 10, F1 + .34 + Math.sin(k / 10 * Math.PI * 2) * .02); const b = new T.Mesh(new T.SphereGeometry(.018, 8, 6), new T.MeshBasicMaterial({ color: k % 2 ? 0xFFE9C2 : 0xFFD6DE })); b.position.copy(p); pot.add(b); glow(p.toArray(), .12, pot); } }); }

  // motes around the café
  const motes = new T.Points(new T.BufferGeometry(), new T.PointsMaterial({ map: glowTex, size: .06, transparent: true, depthWrite: false, blending: T.AdditiveBlending, color: 0xFFEBD0 }));
  { const n = 120, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const p = pol(rnd() * 7, rnd() * 2.4, .3 + rnd() * 3); a[i * 3] = p.x + TC.x; a[i * 3 + 1] = p.y + BASE; a[i * 3 + 2] = p.z + TC.z; } motes.geometry.setAttribute('position', new T.BufferAttribute(a, 3)); }
  world.add(motes);

  console.warn('MARK // ---------------- anchors, v', performance.now()|0);
  // ---------------- anchors, views, hotspots ----------------
  const ANCH = { menu: [menuBoard, [0, .45, 0]], stereo: [stereo, [0, .1, 0]], chair: [ch, [0, .55, 0]], clockdoor: [clock.userData.door, [0, 0, 0]], cloche: [clocheS, [0, .3, 0]] };
  const anchor = k => wp(ANCH[k][0]).add(new T.Vector3(...ANCH[k][1]));
  scene.updateMatrixWorld(true);
  const W = (az, r, y) => pol(az, r, y).add(TC).toArray();
  const at = o => wp(o).toArray();
  const VIEWS = {
    entrance: { p: W(AC + .08, 13.5, 7.2), t: [TC.x, 1.35, TC.z + .2] },
    bench: { p: W(AC + .38, 2.55, 1.95), t: (() => { const v = wp(kitchen); return [v.x, .9, v.z]; })() },
    volunteer: { p: W(AC + .78, 1.95, 1.25), t: (() => { const v = wp(ch); return [v.x, .62, v.z]; })() },
    clock: (() => { const c = clock.localToWorld(new T.Vector3(0, .5, 0)); const d = pol(AC + .12, 1, 0); return { p: [c.x + d.x * 1.75, c.y + .12, c.z + d.z * 1.75], t: c.toArray() }; })(),
    clockOpen: (() => { const c = clock.localToWorld(new T.Vector3(0, .85, 0)); const d = pol(AC + .05, 1, 0); return { p: [c.x + d.x * 1.3, c.y + .08, c.z + d.z * 1.3], t: c.toArray() }; })(),
    final: { p: (() => { const v = wp(order); return [v.x + Math.sin(AC - .45) * 3.6, 2.2, v.z + Math.cos(AC - .45) * 3.6]; })(), t: (() => { const v = wp(order); return [v.x, .85, v.z]; })() },
    closed: { p: W(AC, 13, 9.5), t: [TC.x, .2, TC.z + .3] }
  };
  const HOT = [
    { id: 'menu', obj: menuBoard, off: [0, .7, 0] }, { id: 'intake', obj: intake, off: [0, .75, 0] }, { id: 'ticket', obj: intake, off: [.3, 1.1, -.1] },
    { id: 'stereo', obj: stereo, off: [0, .2, 0] }, { id: 'lamp', obj: cand, off: [0, .7, 0] }, { id: 'heart', obj: heart, off: [0, .4, 0] },
    { id: 'shelf', obj: shelf, off: [0, .95, .1] }, { id: 'drawer', obj: drawers[0], off: [0, 0, .25] }, { id: 'board', obj: fixB, off: [0, .7, 0] },
    { id: 'sewing', obj: sew, off: [0, .95, 0] }, { id: 'toolbox', obj: tools, off: [0, .8, 0] }
  ];
  const hotEls = HOT.map(h => { const b = document.createElement('button'); b.className = 'hot'; b.innerHTML = `<i></i><span>${SUPP[h.id].label}</span>`; b.setAttribute('aria-label', 'À la carte: ' + SUPP[h.id].label); b.style.display = 'none'; b.onclick = () => openSupp(h.id); document.body.appendChild(b); return b; });

  // ---------------- camera ----------------
  const camPos = new T.Vector3(...VIEWS.closed.p), camTgt = new T.Vector3(...VIEWS.closed.t);
  let tween = null; const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  function flyTo(v, dur = 1.7) { const p0 = camPos.clone(), t0 = camTgt.clone(), t1 = new T.Vector3(...v.t), p1 = new T.Vector3(...v.p);
    // portrait screens see less sideways, so step the camera back along its line of sight
    if (innerWidth < innerHeight) p1.sub(t1).multiplyScalar(v === VIEWS.entrance || v === VIEWS.closed ? 1.35 : 1.75).add(t1);
    if (reduce) { camPos.copy(p1); camTgt.copy(t1); return Promise.resolve(); }
    // arc over the top so the camera does not pass through walls
    const lift = Math.min(1.2, p0.distanceTo(p1) * .15);
    return new Promise(res => { tween = { s: performance.now(), dur: dur * 1000, f: k => { camPos.lerpVectors(p0, p1, k); camPos.y += Math.sin(k * Math.PI) * lift; camTgt.lerpVectors(t0, t1, k); }, res }; }); }
  let exploring = false, orb = null, drag = null;
  function startOrbit() { const d = camPos.clone().sub(camTgt); orb = { r: d.length(), th: Math.atan2(d.x, d.z), ph: Math.acos(d.y / d.length()) }; orb.th0 = orb.th; orb.r0 = orb.r; }
  canvas.addEventListener('pointerdown', e => { if (!exploring) return; drag = { x: e.clientX, y: e.clientY, th: orb.th, ph: orb.ph }; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', e => { if (!drag) return; orb.th = Math.max(orb.th0 - 1.1, Math.min(orb.th0 + 1.1, drag.th - (e.clientX - drag.x) * .006)); orb.ph = Math.max(.3, Math.min(1.45, drag.ph - (e.clientY - drag.y) * .005)); applyOrbit(); });
  canvas.addEventListener('pointerup', () => drag = null);
  function applyOrbit() { camPos.set(camTgt.x + orb.r * Math.sin(orb.ph) * Math.sin(orb.th), camTgt.y + orb.r * Math.cos(orb.ph), camTgt.z + orb.r * Math.sin(orb.ph) * Math.cos(orb.th)); }

  // ---------------- UI ----------------
  let cur = -1, clockOpen = false, opened = false, drawerT = 0, drawerTo = 0, suppAnchor = null; const seen = new Set();
  const RN = ['I', 'II', 'III', 'IV', 'V'];
  const SCRIPT = ['The Menu', 'The Kitchen', 'The Cook', 'The Keepsake', 'Order Up'];
  const DETAIL = { entrance: '64% 60%', hands: '60% 72%', intake: '30% 75%', stereo: '50% 55%' };
  const ico = i => `<svg class="ico"><use href="#i${i}"/></svg>`;
  $('nav').innerHTML = STOPS.map((s, i) => `<button data-i="${i}"><i>${RN[i]}</i>${SCRIPT[i].replace(/^The /, '')}</button>`).join('');
  $('strip').innerHTML = STOPS.map((s, i) => `<button class="course" role="tab" data-i="${i}" aria-label="Course ${RN[i]}: ${s.name}"><span class="ic">${ico(i)}</span><span class="t"><b>${RN[i]}</b><span>${SCRIPT[i]}</span></span></button>`).join('');
  $('introMenu').innerHTML = STOPS.map((s, i) => `<li><i>${RN[i]}</i><span>${s.name}</span><em>${SCRIPT[i].toLowerCase()}</em></li>`).join('');
  document.querySelectorAll('#nav button, #strip .course').forEach(b => b.onclick = () => go(+b.dataset.i));
  $('exAll').onclick = () => { if (!opened) return; flyTo(VIEWS.entrance).then(() => explore(true)); };
  const frameHTML = (k, i) => {
    if (!k) return '';
    const [src, w, h] = ASSETS.photo[k];
    const im = `<img src="${src}" width="${w}" height="${h}" alt="Alt text placeholder" data-k="${k}">`;
    if (w >= h) return `<div class="frame ticket">${im}<div class="stub"><span>No. ${RN[i] || 'I'} · 18 Oct 2026</span><span class="bars"></span></div>${DETAIL[k] ? `<span class="detail" style="background-image:url(${src});background-position:${DETAIL[k]}"></span><span class="dl">DETAIL</span>` : ''}</div>`;
    return `<div class="frame polaroid"><span class="clip"></span>${im}<span class="lab">${P('label')}</span></div>`;
  };
  const finalPlaceholder = () => `<div class="frame polaroid" style="aspect-ratio:4/5;display:grid;place-items:center"><div style="width:100%;height:calc(100% - 24px);display:grid;place-items:center;background:repeating-linear-gradient(-45deg,#F7EEF1 0 10px,#FFFFFF 10px 20px);font:400 30px var(--script);color:var(--rose)">your final image</div><span class="lab">${P('label')}</span></div>`;
  const keyholeHTML = `<svg viewBox="0 0 320 200" style="width:100%;height:auto;margin:6px 0 2px;border-radius:14px" aria-hidden="true">
    <rect width="320" height="200" fill="#F7EEF1"/><path d="M120 180 V84 a40 40 0 0 1 80 0 V180 Z" fill="#FFFDF9" stroke="#B8945A" stroke-width="3"/>
    <path d="M130 180 V88 a30 30 0 0 1 60 0 V180" fill="none" stroke="#B8945A" stroke-width="1.2"/><circle cx="160" cy="128" r="9" fill="#22305C"/><path d="M154 132 L150 154 H170 L166 132 Z" fill="#22305C"/><circle cx="183" cy="138" r="4" fill="#E3C276"/>
    <path d="M40 180 H280" stroke="#B8945A" stroke-width="2"/><text x="160" y="42" text-anchor="middle" font-family="Pinyon Script" font-size="26" fill="#C4566B">a small door, and something behind it</text></svg>`;
  function renderCard(i) {
    const s = STOPS[i];
    let h = `<div class="kick"><span class="sc">${ico(i)}${SCRIPT[i]}</span><span class="no">COURSE ${RN[i]} / V</span></div><h3>${s.title}</h3>`;
    h += s.finalPh ? finalPlaceholder() : frameHTML(s.photo, i);
    if (s.clock && !clockOpen) h += keyholeHTML;
    h += `<p class="cap">${s.body}</p>`;
    h += `<div class="chips">${(s.photo || s.finalPh) ? '<span>Photograph</span><span>18 Oct 2026</span>' : '<span>Reconstruction</span>'}<span>${s.name}</span></div>`;
    if (s.src) h += `<p class="src">${s.src}</p>`;
    if (s.clock && clockOpen) h += `<div class="reveal"><span class="tag">${CLOCK_REVEAL.tag}</span>${frameHTML(CLOCK_REVEAL.photo, i)}<p class="cap">${CLOCK_REVEAL.body}</p><p class="src">${CLOCK_REVEAL.src}</p></div>`;
    $('cardBody').innerHTML = h; $('cardBody').scrollTop = 0;
    const a = [];
    if (s.clock && !clockOpen) a.push(`<button class="btn gold" data-a="openclock">Open the clock</button>`, `<button class="btn" data-a="next">Skip the door</button>`);
    else a.push(`<button class="btn primary" data-a="next">${i === STOPS.length - 1 ? 'À la carte' : 'Next course'}</button>`);
    (s.extra || []).forEach(x => a.push(`<button class="btn" data-a="${x.act}">${x.label}</button>`));
    a.push(`<button class="btn" data-a="explore">Look around</button>`);
    $('cardActions').innerHTML = a.join(''); wireCard();
  }
  function setLeft(i) {
    $('lTitle').textContent = i < 0 ? 'À la carte' : SCRIPT[i];
    $('lSub').innerHTML = i < 0 ? '<span>Explore freely</span><span>extra notes</span>' : `<span>Course ${RN[i]}</span><span>${STOPS[i].name}</span>`;
    $('iNum').textContent = i < 0 ? '··' : '0' + (i + 1); $('iVert').textContent = i < 0 ? 'à la carte' : STOPS[i].name;
    $('prevTop').disabled = i <= 0;
  }
  function wireCard() {
    $('cardBody').querySelectorAll('img').forEach(im => im.onclick = () => { $('lbImg').src = im.src; $('lbImg').alt = im.alt; $('lb').classList.add('on'); $('lbClose').focus(); });
    $('cardActions').querySelectorAll('button').forEach(b => b.onclick = () => act(b.dataset.a));
  }
  function act(a) {
    if (a === 'next') return cur === STOPS.length - 1 ? explore(true) : go(cur + 1);
    if (a === 'prev') return go(cur - 1);
    if (a === 'explore') return explore(true);
    if (a === 'openclock') return openClock();
    if (a === 'explode') { explodeTo = explodeTo ? 0 : 1; return; }
    if (a === 'drawer') { drawerTo = drawerTo ? 0 : 1; return; }
    if (a === 'back') { $('card').classList.add('hide'); suppAnchor = null; return; }
  }
  async function openClock() { clockOpen = true; renderCard(cur); await flyTo(VIEWS.clockOpen, 1.4); const rv = $('cardBody').querySelector('.reveal'); if (rv) rv.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }); }
  function openSupp(id) {
    const s = SUPP[id]; $('card').classList.remove('hide');
    $('cardBody').innerHTML = `<div class="kick"><span class="sc"><svg class="ico"><use href="#bell"/></svg>À la carte</span><span class="no">EXTRA</span></div><span class="tag sup">extra note, outside the five courses</span><h3>${s.title}</h3>${frameHTML(s.photo, 0)}<p class="cap">${s.body}</p>${s.photo ? `<p class="src">${credit}</p>` : ''}`;
    const a = [`<button class="btn primary" data-a="back">Close note</button>`];
    if (s.act === 'explode') a.push(`<button class="btn" data-a="explode">Lift the stereo apart</button>`);
    if (s.act === 'drawer') a.push(`<button class="btn" data-a="drawer">Open the drawer</button>`);
    $('cardActions').innerHTML = a.join(''); wireCard();
    if (s.act === 'drawer') drawerTo = 1; if (s.act === 'explode') explodeTo = 1;
    suppAnchor = HOT.find(h => h.id === id);
  }
  function explore(on) {
    exploring = on; $('explore').classList.toggle('on', on); hotEls.forEach(b => b.style.display = on ? 'block' : 'none');
    $('here').style.visibility = on ? 'hidden' : 'visible';
    if (on) { $('card').classList.add('hide'); startOrbit(); setLeft(-1); $('resume').focus(); } else { $('card').classList.remove('hide'); suppAnchor = null; }
  }
  $('resume').onclick = () => { explore(false); go(Math.max(0, cur)); };
  async function go(i) {
    if (!opened || i < 0 || i >= STOPS.length) return;
    if (exploring) explore(false);
    if (i !== 3) clockOpen = false;
    cur = i; seen.add(i); renderCard(i); setLeft(i);
    document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('on', +b.dataset.i === i));
    document.querySelectorAll('#strip .course').forEach(b => { const k = +b.dataset.i; b.classList.toggle('on', k === i); b.classList.toggle('seen', seen.has(k)); b.setAttribute('aria-selected', k === i); });
    $('prev').disabled = i === 0;
    await flyTo(VIEWS[STOPS[i].id]);
  }
  $('next').onclick = () => act('next'); $('prev').onclick = () => act('prev'); $('prevTop').onclick = () => act('prev');
  $('lbClose').onclick = () => $('lb').classList.remove('on'); $('lb').onclick = e => { if (e.target.id === 'lb') $('lb').classList.remove('on'); };
  addEventListener('keydown', e => {
    if (e.key === 'Escape') { if ($('lb').classList.contains('on')) $('lb').classList.remove('on'); else if (exploring) { explore(false); go(Math.max(0, cur)); } return; }
    if (!opened || exploring || $('lb').classList.contains('on')) return;
    if (['ArrowRight', 'PageDown', ' '].includes(e.key) && document.activeElement.tagName !== 'BUTTON') { e.preventDefault(); act('next'); }
    if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); act('prev'); }
  });
  let wheelLock = 0;
  addEventListener('wheel', e => {
    if (!opened || e.target.closest('#card') || e.target.closest('#top')) return;
    if (exploring) { orb.r = Math.max(orb.r0 * .5, Math.min(orb.r0 * 1.6, orb.r * (1 + e.deltaY * .001))); applyOrbit(); return; }
    const now = performance.now(); if (now < wheelLock || Math.abs(e.deltaY) < 25) return; wheelLock = now + 1200; act(e.deltaY > 0 ? 'next' : 'prev');
  }, { passive: true });

  // ---------------- the opening ----------------
  const leafC = cnv(1600, 1000, (g, w, h) => {
    g.fillStyle = '#FFFCF6'; g.fillRect(0, 0, w, h); g.strokeStyle = '#C8A866'; g.lineWidth = 4; g.strokeRect(40, 40, w - 80, h - 80); g.lineWidth = 1.5; g.strokeRect(56, 56, w - 112, h - 112);
    const gr = cnv(900, 160, gg => {}); void gr;
    g.drawImage(PT.garland(1200, 160), 200, 120);
    g.textAlign = 'center'; g.fillStyle = '#24315F'; g.font = '600 150px "Cormorant Garamond"'; g.fillText('Repair Café', w / 2, h * .56);
    g.font = 'italic 500 56px "Cormorant Garamond"'; g.fillStyle = '#B9606F'; g.fillText('a pop-up café in five courses', w / 2, h * .56 + 78);
    g.font = '32px Italiana'; g.fillStyle = '#5A6383'; g.fillText('18 · X · 2026     SAN JOSÉ', w / 2, h * .82);
    g.strokeStyle = 'rgba(36,49,95,.12)'; g.lineWidth = 3; g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
    grainOver(g, w, h, 2600);
  });
  const leaf = new T.Mesh(new T.PlaneGeometry(BW * 2 - .3, BD - .3), new T.MeshToonMaterial({ map: tex(leafC), gradientMap: ramp, transparent: true }));
  leaf.rotation.x = -Math.PI / 2; leaf.rotation.z = AC; leaf.position.set(0, .34, 0); world.add(leaf);
  $('card').classList.add('hide'); $('left').style.visibility = 'hidden'; $('issue').style.visibility = 'hidden';
  pot.scale.set(1, .02, 1); pops.forEach(p => p.o.scale.setScalar(.001)); glows.forEach(g => g.visible = false); motes.visible = false; pour.visible = false;
  const lights = [lightA, lightB, lampLight]; const LI = lights.map(l => l.intensity); lights.forEach(l => l.intensity = 0);
  let openStart = null;
  $('open').onclick = () => { $('intro').style.display = 'none'; if (reduce) { finishOpen(); return; } openStart = performance.now(); flyTo(VIEWS.entrance, 3.4); };
  function finishOpen() {
    openStart = null; leaf.visible = false; $('intro').style.display = 'none'; pot.scale.set(1, 1, 1);
    pops.forEach(p => p.o.scale.setScalar(p.s)); glows.forEach(g => g.visible = true); motes.visible = true; pour.visible = true; lights.forEach((l, i) => l.intensity = LI[i]);
    opened = true; $('foot').style.visibility = 'visible'; $('left').style.visibility = 'visible'; $('issue').style.visibility = 'visible'; $('card').classList.remove('hide'); go(0);
  }
  function stepOpen(t) {
    const k = x => Math.max(0, Math.min(1, x));
    const e = ease(k(t / .9)); leaf.position.y = .34 + e * 2.2; leaf.rotation.x = -Math.PI / 2 + e * .9; leaf.material.opacity = 1 - e; leaf.visible = e < 1;
    const u = k((t - .7) / .9); pot.scale.set(1, Math.max(.02, ease(u) + Math.sin(u * Math.PI) * .08), 1);
    pops.forEach(p => { const v = k((t - p.t0) / .5); p.o.scale.setScalar(Math.max(.001, (v <= 0 ? .001 : 1 + Math.sin(v * Math.PI) * .12 * (1 - v) - (1 - ease(v))) * p.s)); });
    const L = k((t - 2.2) / .8); lights.forEach((l, i) => l.intensity = LI[i] * L); glows.forEach(g => g.visible = L > .2); motes.visible = L > .5; pour.visible = L > .6;
    if (t > 3.5) finishOpen();
  }

  // ---------------- frame loop ----------------
  const v = new T.Vector3();
  function project(p) { v.copy(p).project(cam); return [(v.x + 1) / 2 * innerWidth, (1 - v.y) / 2 * innerHeight, v.z < 1]; }
  function resize() {
    R.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight;
    const right = mobile() ? 0 : ($('card').offsetWidth + 34), left = mobile() ? 0 : 300;
    const shift = (right - left) / 2, lift = mobile() ? innerHeight * .2 : -20;
    cam.setViewOffset(innerWidth, innerHeight, shift, lift, innerWidth, innerHeight); cam.updateProjectionMatrix();
  }
  addEventListener('resize', resize); resize();
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (openStart != null) stepOpen((now - openStart) / 1000);
    if (tween) { const k = Math.min(1, (now - tween.s) / tween.dur); tween.f(ease(k)); if (k >= 1) { const r = tween.res; tween = null; r(); } }
    explodeT += (explodeTo - explodeT) * Math.min(1, dt * 3); setExplode(explodeT);
    drawerT += (drawerTo - drawerT) * Math.min(1, dt * 4); drawers[0].position.z = drawerT * .2;
    const door = clock.userData.door; door.rotation.y += ((clockOpen ? -1.9 : 0) - door.rotation.y) * Math.min(1, dt * 3); clockLight.intensity = clockOpen ? 1.4 : 0;
    if (!reduce) {
      if (motes.visible) { const a = motes.geometry.attributes.position; for (let i = 0; i < a.count; i++) { let y = a.getY(i) + dt * (.03 + (i % 7) * .005); if (y > 3.6) y = .4; a.setY(i, y); } a.needsUpdate = true; }
      if (pour.visible) { counterTop.copy(wp(clocheS)).add(new T.Vector3(0, .55, 0)); const a = pour.geometry.attributes.position, ts = pour.userData.t;
        for (let i = 0; i < a.count; i++) { ts[i] = (ts[i] + dt * .25) % 1; const t = ts[i]; const x = spoutTip.x + (counterTop.x - spoutTip.x) * t, z = spoutTip.z + (counterTop.z - spoutTip.z) * t, y = spoutTip.y + (counterTop.y - spoutTip.y) * t + Math.sin(t * Math.PI) * .5; a.setXYZ(i, x + Math.sin(i * 7.1) * .05, y + Math.cos(i * 3.3) * .05, z); } a.needsUpdate = true; }
      glows.forEach((g, i) => g.material.opacity = .82 + Math.sin(now * .003 + i * 1.7) * .12);
    }
    cam.position.copy(camPos); cam.lookAt(camTgt);
    if (exploring) { const placed = []; HOT.forEach((h, i) => { const [x, y, ok] = project(wp(h.obj).add(new T.Vector3(...h.off))); const crowd = placed.some(([a, b]) => Math.hypot(a - x, b - y) < 30); const show = ok && !crowd && x > 10 && x < innerWidth - 10 && y > 60 && y < innerHeight - 90; hotEls[i].style.left = x + 'px'; hotEls[i].style.top = y + 'px'; hotEls[i].style.visibility = show ? 'visible' : 'hidden'; if (show) placed.push([x, y]); }); }
    const path = $('wirePath'), dot = $('wireDot'), cardEl = $('card'); let ap = null;
    if (!mobile() && !cardEl.classList.contains('hide')) { if (exploring && suppAnchor) ap = wp(suppAnchor.obj).add(new T.Vector3(...suppAnchor.off)); else if (!exploring && cur >= 0) ap = anchor(STOPS[cur].anchor); }
    if (ap && !tween) { const [x, y] = project(ap); const r = cardEl.getBoundingClientRect(); const cx = r.left, cy = r.top + 150; path.setAttribute('d', `M${cx} ${cy} C${cx - 140} ${cy} ${x + 140} ${y} ${x} ${y}`); dot.setAttribute('cx', x); dot.setAttribute('cy', y); }
    else { path.setAttribute('d', ''); dot.setAttribute('cx', -20); }
    R.render(scene, cam); requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  window.__dio = { go, explore, openClock, finishOpen, act, VIEWS, camPos, camTgt, setOpen: () => finishOpen(), T, scene, pot, clock, keep };

  function noGL() {
    $('noGL').style.display = 'block'; $('intro').style.display = 'none';
    $('noGL').innerHTML = `<h1 style="font:400 40px var(--serif)">${P('Headline placeholder')}</h1>` + STOPS.map((s, i) => `<section style="max-width:640px;margin:28px 0"><div class="lbl">0${i + 1} · ${s.course}</div><h2>${s.title}</h2>${s.photo ? `<img src="${ASSETS.photo[s.photo][0]}" style="width:100%;height:auto;border-radius:6px" alt="">` : ''}<p>${s.body}</p></section>`).join('');
  }
})();
