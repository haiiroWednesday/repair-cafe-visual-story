/* Repair Café pop-up book: a marked five-stop reading route through a paper diorama,
   with optional discoveries. All story text here is placeholder for the author to replace. */
(async function () {
  const $ = id => document.getElementById(id);
  const canvas = $('stage');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = () => innerWidth <= 820;

  // ---------------- story content (placeholders only) ----------------
  const P = t => `<span class="ph">${t}</span>`;
  const credit = 'Photo: the author, Repair Café Silicon Valley, Billy DeFrank Center, San Jose, Oct 18 2026.';
  const STOPS = [
    { id: 'entrance', name: 'At the entrance', photo: 'entrance', anchor: 'sign',
      title: P('Section title'), body: P('Caption for the feature photograph: who is here, what is happening, where. One or two sentences.'), src: credit },
    { id: 'bench', name: 'At the workbench', photo: 'hands', anchor: 'stereo',
      title: P('Section title'), body: P('Caption for the hands-and-tools photograph. What is being opened, and what the fixer is looking for.'), src: credit,
      extra: [{ label: 'Lift the stereo apart', act: 'explode' }] },
    { id: 'volunteer', name: 'Beside the volunteer', photo: 'volunteer', anchor: 'chair',
      title: P('Section title'), body: P('Caption for the photograph of the volunteer at work, with one documented detail from the interview.'), src: credit },
    { id: 'clock', name: 'Inside the clock', photo: null, anchor: 'clockdoor', clock: true,
      title: P('Section title'), body: P('A line that leads the reader to the clock on the wall.'), src: '' },
    { id: 'final', name: 'The final object', photo: 'shoes', anchor: 'shoe',
      title: P('Section title'), body: P('The closing image and passage: what is kept, what is repaired, what is lost.'), src: credit }
  ];
  const CLOCK_REVEAL = { photo: 'clock', tag: 'told by Jazz · an earlier event', body: P('The clock passage goes here, in the main reading route.'),
    src: 'Repair recounted by Jazz, volunteer fixer, Repair Café Silicon Valley, at an earlier event. Photo: [credit].' };
  const SUPP = {
    ticket: { label: 'a repair ticket', photo: 'ticket', title: 'The ticket', body: P('Supplementary note about intake tickets.') },
    stereo: { label: 'my stereo', photo: 'stereo', title: 'The stereo', body: P('Supplementary note about the stereo and its cable.'), act: 'explode' },
    drawer: { label: 'a drawer', photo: null, title: 'In the drawer', body: P('Longer interview excerpt goes here, marked as supplementary.'), act: 'drawer' },
    lamp: { label: 'the brass lamp', photo: 'candelabra', title: 'The lamp', body: P('Supplementary note on the lamp’s connector detail.') },
    heart: { label: 'a heart clock', photo: 'heart', title: 'The heart clock', body: P('Supplementary note about the heart-shaped clock.') },
    board: { label: 'the chalkboard', photo: 'board', title: '“We fixed it!”', body: P('Supplementary note about the chalkboard.') },
    sewing: { label: 'the sewing table', photo: 'sewing', title: 'The sewing table', body: P('Supplementary note about the textile table.') },
    shelf: { label: 'the waiting shelf', photo: null, title: 'Waiting to be fixed', body: P('Supplementary note: what kinds of things people bring in.') },
    toolbox: { label: 'the toolboxes', photo: 'volunteer', title: 'What the fixers bring', body: P('Supplementary note about the volunteers’ own toolboxes and kits.') }
  };

  // ---------------- renderer ----------------
  let R;
  try { R = new T.WebGLRenderer({ canvas, antialias: true, alpha: true }); }
  catch (e) { return noGL(); }
  R.setPixelRatio(Math.min(2, devicePixelRatio)); R.outputColorSpace = T.SRGBColorSpace;
  const scene = new T.Scene();
  const cam = new T.PerspectiveCamera(30, innerWidth / innerHeight, .05, 120);
  scene.add(new T.HemisphereLight(0xFFF6EA, 0xD9C7B4, 1.5));
  const sun = new T.DirectionalLight(0xFFF1DE, 1.6); sun.position.set(-3, 7, 5); scene.add(sun);
  const fill = new T.DirectionalLight(0xDDE8FF, .55); fill.position.set(5, 3, 2); scene.add(fill);
  try { await document.fonts.ready; await document.fonts.load('40px Caveat'); await document.fonts.load('20px "Patrick Hand"'); } catch (e) {}

  // ---------------- textures ----------------
  const cnv = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); return c; };
  const img = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = src; });
  const imgTex = async src => { const t = new T.Texture(await img(src)); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4; t.needsUpdate = true; return t; };
  const grainOver = (g, w, h, n = 1400) => { for (let i = 0; i < n; i++) { const x = Math.random() * w, y = Math.random() * h, L = 6 + Math.random() * 14, a = -.5; g.strokeStyle = Math.random() < .55 ? `rgba(90,60,70,${.03 + Math.random() * .04})` : `rgba(255,255,255,${.08 + Math.random() * .1})`; g.lineWidth = 1 + Math.random() * 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); g.stroke(); } };
  const toonC = c => toon(c);
  const wallC = (w, h, opt = {}) => cnv(w, h, (g) => {
    const wain = h * (opt.wain || .3);
    g.fillStyle = '#CFE3DC'; g.fillRect(0, 0, w, h - wain);
    // damask: a lozenge of curls repeated in a half-drop
    g.strokeStyle = '#9FC5BA'; g.fillStyle = '#A9CBC1'; g.lineWidth = 3;
    for (let y = -40, row = 0; y < h - wain + 40; y += 92, row++) for (let x = (row % 2) * 46 - 40; x < w + 40; x += 92) {
      g.beginPath(); g.ellipse(x, y, 9, 20, 0, 0, 7); g.fill();
      [-1, 1].forEach(s => { g.beginPath(); g.moveTo(x, y - 24); g.quadraticCurveTo(x + s * 30, y - 30, x + s * 26, y - 6); g.quadraticCurveTo(x + s * 22, y + 12, x + s * 8, y + 8); g.stroke();
        g.beginPath(); g.moveTo(x, y + 24); g.quadraticCurveTo(x + s * 24, y + 34, x + s * 30, y + 16); g.stroke(); g.beginPath(); g.arc(x + s * 30, y + 14, 4, 0, 7); g.fill(); });
    }
    g.fillStyle = '#F4EBDD'; g.fillRect(0, h - wain, w, wain);
    g.strokeStyle = '#D9C9AE'; g.lineWidth = 3;
    for (let x = 18; x < w - 60; x += 150) g.strokeRect(x, h - wain + 24, 120, wain - 48);
    g.fillStyle = '#C8A866'; g.fillRect(0, h - wain - 6, w, 8); g.fillStyle = '#FFFDF9'; g.fillRect(0, h - wain - 12, w, 6);
    if (opt.crease) { g.strokeStyle = 'rgba(80,60,50,.16)'; g.lineWidth = 2; g.beginPath(); g.moveTo(w * opt.crease, 0); g.lineTo(w * opt.crease, h); g.stroke(); }
    grainOver(g, w, h, 2200);
  });
  const plankC = cnv(1024, 640, (g, w, h) => {
    const c = P2.woodCanvas('#B07A52', 1024, 640); g.drawImage(c, 0, 0);
    g.strokeStyle = 'rgba(60,30,15,.45)'; g.lineWidth = 3;
    for (let y = 0; y < h; y += 64) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); const off = (y / 64 % 2) * 180; for (let x = off; x < w; x += 360) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 64); g.stroke(); } }
  });
  const clothC = cnv(1024, 1280, (g, w, h) => {
    g.fillStyle = '#C96A62'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < h; i += 4) { g.fillStyle = `rgba(255,255,255,${.03 + Math.random() * .03})`; g.fillRect(0, i, w, 1); }
    for (let i = 0; i < w; i += 5) { g.fillStyle = 'rgba(80,30,30,.04)'; g.fillRect(i, 0, 1, h); }
    g.strokeStyle = '#E7C77F'; g.lineWidth = 6; g.strokeRect(40, 40, w - 80, h - 80); g.lineWidth = 2; g.strokeRect(58, 58, w - 116, h - 116);
    [[58, 58], [w - 58, 58], [58, h - 58], [w - 58, h - 58]].forEach(([x, y]) => { g.beginPath(); g.arc(x, y, 18, 0, 7); g.stroke(); g.beginPath(); g.arc(x, y, 7, 0, 7); g.fillStyle = '#E7C77F'; g.fill(); });
  });
  const pagesC = cnv(512, 512, (g, w, h) => { g.fillStyle = '#FBF5EA'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(150,130,110,.35)'; for (let y = 0; y < h; y += 5) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } });
  const textC = (w, h, bg, lines, frame) => cnv(w, h, (g) => {
    g.fillStyle = bg; g.fillRect(0, 0, w, h); if (frame) { g.strokeStyle = frame; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10); }
    lines.forEach(([t, font, col, y]) => { g.font = font; g.fillStyle = col; g.textAlign = 'center'; g.fillText(t, w / 2, y); }); grainOver(g, w, h, 600);
  });

  // ---------------- small builders ----------------
  const add = (o, p, parent = scene) => { if (p) o.position.set(...p); parent.add(o); return o; };
  const paper = new T.MeshToonMaterial({ color: 0xFFFDF8, gradientMap: ramp });
  function card(w, h, d, frontCanvas, sideHex) {
    const side = sideHex ? flat(sideHex) : paper;
    const front = toonC(frontCanvas);
    return inked(new T.BoxGeometry(w, h, d), [side, side, side, side, front, side], .006);
  }
  async function standee(key, h, opt = {}) {
    const a = ASSETS.standee[key]; const t = await imgTex(a[0]); const w = h * a[1] / a[2];
    const m = new T.MeshToonMaterial({ map: t, gradientMap: ramp, transparent: true, alphaTest: .5, side: T.DoubleSide });
    const g = new T.Group(); const pl = new T.Mesh(new T.PlaneGeometry(w, h), m); pl.position.y = h / 2; g.add(pl);
    // a folded paper tab behind, the way a pop-up piece stands
    if (!opt.flat) { const tab = new T.Mesh(new T.PlaneGeometry(w * .5, h * .35), paper); tab.position.set(0, h * .16, -h * .12); tab.rotation.x = -.6; g.add(tab); }
    g.userData.w = w; g.userData.h = h; return g;
  }
  function foldingTable(w, d, h) {
    const g = new T.Group(); const top = flat('#D6D3CC'), metal = flat('#4E4A4A');
    const t = inked(new T.BoxGeometry(w, .04, d), top, .006); t.position.y = h; g.add(t);
    const lip = inked(new T.BoxGeometry(w, .06, .02), flat('#BDB9B1'), .004); lip.position.set(0, h - .04, d / 2 - .01); g.add(lip);
    [-1, 1].forEach(s => { [[-1, 1], [1, -1]].forEach(([a, b]) => { const leg = new T.Mesh(new T.CylinderGeometry(.012, .012, h * 1.05, 8), metal);
      leg.position.set(s * (w / 2 - .12), h / 2, 0); leg.rotation.x = a * .32; g.add(leg); }); });
    return g;
  }
  function chair() {
    const g = new T.Group(), m = flat('#3E3A3F');
    const seat = inked(new T.BoxGeometry(.32, .03, .3), m, .005); seat.position.y = .34; g.add(seat);
    const back = inked(new T.BoxGeometry(.32, .2, .03), m, .005); back.position.set(0, .62, -.15); back.rotation.x = -.1; g.add(back);
    [[-.15, -.14], [.15, -.14], [-.15, .14], [.15, .14]].forEach(([x, z]) => { const l = new T.Mesh(new T.CylinderGeometry(.01, .01, z < 0 ? .78 : .36, 6), m); l.position.set(x, z < 0 ? .39 : .17, z); g.add(l); });
    return g;
  }
  function curtain(w, h, col) {
    const geo = new T.PlaneGeometry(w, h, 48, 2); const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i); p.setZ(i, Math.sin(x / w * Math.PI * 7) * .035 + .04); }
    geo.computeVertexNormals(); const m = toon(crayonCanvas(col, 256, 256, 260)); m.side = T.DoubleSide;
    return new T.Mesh(geo, m);
  }
  const glowTex = tex(cnv(128, 128, (g) => { const r = g.createRadialGradient(64, 64, 0, 64, 64, 64); r.addColorStop(0, 'rgba(255,240,200,1)'); r.addColorStop(.3, 'rgba(255,214,150,.55)'); r.addColorStop(1, 'rgba(255,200,140,0)'); g.fillStyle = r; g.fillRect(0, 0, 128, 128); }));
  const glows = [];
  function glow(p, s = .3, parent = scene) { const sp = new T.Sprite(new T.SpriteMaterial({ map: glowTex, blending: T.AdditiveBlending, depthWrite: false, transparent: true })); sp.scale.set(s, s, s); sp.position.set(...p); parent.add(sp); glows.push(sp); return sp; }

  // ---------------- the book ----------------
  const book = new T.Group(); scene.add(book);
  const BW = 2.45, BD = 3.1;
  const leftHalf = new T.Group(), rightHalf = new T.Group(); book.add(leftHalf, rightHalf);
  const coverMat = toonC(clothC), pageMat = toonC(pagesC);
  const coverL = inked(new T.BoxGeometry(BW, .07, BD), [coverMat, coverMat, coverMat, coverMat, coverMat, coverMat], .008); coverL.position.set(-BW / 2, .035, 0); leftHalf.add(coverL);
  const pagesL = inked(new T.BoxGeometry(BW - .1, .06, BD - .12), [pageMat, pageMat, paper, paper, pageMat, pageMat], .006); pagesL.position.set(-BW / 2 + .02, .1, 0); leftHalf.add(pagesL);
  const coverR = coverL.clone(); coverR.position.x = BW / 2; rightHalf.add(coverR);
  const pagesR = pagesL.clone(); pagesR.position.x = BW / 2 - .02; rightHalf.add(pagesR);
  // satin ribbon bookmark and ties
  const ribbonM = flat('#86AEDC');
  add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([[0, .14, -1.2], [.05, .15, .4], [.15, .08, 1.5], [.1, .02, 1.75]].map(v => new T.Vector3(...v))), 30, .02, 6), ribbonM), null, book);
  // (no ties: they read as loose string at this scale)
  const shadow = new T.Mesh(new T.PlaneGeometry(6.4, 4.6), new T.MeshBasicMaterial({ map: tex(cnv(256, 256, (g) => { const r = g.createRadialGradient(128, 128, 20, 128, 128, 128); r.addColorStop(0, 'rgba(70,50,30,.32)'); r.addColorStop(1, 'rgba(70,50,30,0)'); g.fillStyle = r; g.fillRect(0, 0, 256, 256); })), transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = -.005; book.add(shadow);

  // ---------------- the pop-up room ----------------
  const room = new T.Group(); scene.add(room);
  const FY = .25, RX = 1.9, RZ0 = -1.3, RZ1 = 1.0, WH = 2.2;
  const plinth = inked(new T.BoxGeometry(RX * 2, .12, RZ1 - RZ0), [flat('#5A3826'), flat('#5A3826'), toonC(plankC), flat('#5A3826'), flat('#5A3826'), flat('#5A3826')], .008);
  plinth.position.set(0, FY - .06, (RZ0 + RZ1) / 2); room.add(plinth);
  const pops = []; // things that pop up when the book opens
  function wall(w, h, canvasC, pivotPos, rotAxis, flatAngle) {
    const piv = new T.Group(); piv.position.set(...pivotPos); room.add(piv);
    const c = card(w, h, .04, canvasC); c.position.y = h / 2; piv.add(c);
    pops.push({ o: piv, kind: 'rot', axis: rotAxis, from: flatAngle, t0: .9, dur: .9 });
    return piv;
  }
  const back = wall(RX * 2, WH, wallC(1400, 820, { crease: .5 }), [0, FY, RZ0 - .02], 'x', Math.PI / 2 - .02);
  const left = wall(RZ1 - RZ0, WH, wallC(1100, 820, { crease: .5 }), [-RX - .02, FY, (RZ0 + RZ1) / 2], 'z', -Math.PI / 2 + .02); left.children[0].rotation.y = Math.PI / 2;
  const wing = wall(1.0, 1.25, wallC(520, 650, { wain: .45 }), [RX + .02, FY, RZ0 + .5], 'z', Math.PI / 2 - .02); wing.children[0].rotation.y = -Math.PI / 2;
  // a little window in the wing
  const win = card(.42, .48, .02, cnv(256, 300, (g, w, h) => { const sky = g.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, '#BFDDF2'); sky.addColorStop(1, '#F6E4C6'); g.fillStyle = sky; g.fillRect(0, 0, w, h); g.strokeStyle = '#FFFDF9'; g.lineWidth = 14; g.strokeRect(7, 7, w - 14, h - 14); g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.stroke(); }));
  win.position.set(-.04, .78, 0); win.rotation.y = -Math.PI / 2; wing.add(win);

  // rainbow curtains on the back wall, like the hall's
  const CURT = ['#E8857B', '#F0A05A', '#EFC15E', '#8FCBB2', '#86AEDC', '#B79FD6'];
  CURT.forEach((c, i) => { const cu = curtain(.36, 1.55, c); cu.position.set(-1.72 + i * .34 + .17, .78, 0); back.add(cu); });
  const rod = new T.Mesh(new T.CylinderGeometry(.015, .015, 2.15, 10), flat(GOLD)); rod.rotation.z = Math.PI / 2; rod.position.set(-.8, 1.57, .07); back.add(rod);
  // the banner and the check-in board
  const banner = card(1.0, .3, .01, textC(600, 180, '#FFFDF9', [['REPAIR', '700 64px Newsreader', '#3E4A72', 82], ['CAFÉ', '700 64px Newsreader', '#C9574E', 150]], null)); banner.position.set(.95, 1.7, .04); back.add(banner);
  const wb = card(.95, .6, .03, cnv(600, 380, (g, w, h) => { g.fillStyle = '#FBFBF7'; g.fillRect(0, 0, w, h); g.strokeStyle = '#9EA3AE'; g.lineWidth = 12; g.strokeRect(6, 6, w - 12, h - 12);
    g.font = '18px "Patrick Hand"'; g.fillStyle = '#5E6E9A'; ['APPLIANCES', 'ELECTRONICS', 'MECHANICAL', 'PC/PHONE', 'WOODWORK'].forEach((t, i) => { g.fillText(t, 20 + i * 116, 40); g.strokeStyle = '#C9CDD6'; g.lineWidth = 2; g.beginPath(); g.moveTo(14 + i * 116, 50); g.lineTo(110 + i * 116, 50); g.stroke(); });
    ['#E8857B', '#EFC15E', '#8FCBB2', '#86AEDC', '#B79FD6', '#E88AA6', '#3E3A3F'].forEach((c, i) => { g.fillStyle = c; g.beginPath(); g.arc(30, 80 + i * 36, 10, 0, 7); g.fill(); });
    [[150, 80], [262, 100], [400, 76]].forEach(([x, y]) => { g.fillStyle = '#FFFFFF'; g.strokeStyle = '#B9B4AA'; g.lineWidth = 2; g.fillRect(x, y, 70, 92); g.strokeRect(x, y, 70, 92); g.fillStyle = '#5E5450'; for (let k = 0; k < 5; k++) g.fillRect(x + 8, y + 12 + k * 14, 50 - k * 6, 3); g.fillStyle = '#E8857B'; g.beginPath(); g.arc(x + 35, y - 2, 7, 0, 7); g.fill(); }); }), '#9EA3AE');
  wb.position.set(1.02, 1.12, .05); back.add(wb);
  // bunting across the back wall
  { const pts = []; for (let i = 0; i <= 14; i++) { const t = i / 14; pts.push(new T.Vector3(-1.85 + t * 3.7, 2.05 - Math.sin(t * Math.PI) * .22, .1)); }
    back.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 60, .006, 4), flat('#8C7B74')));
    for (let i = 0; i < 14; i++) { const t = (i + .5) / 14; const sh = new T.Shape(); sh.moveTo(-.07, 0); sh.lineTo(.07, 0); sh.lineTo(0, -.14);
      const f = new T.Mesh(new T.ShapeGeometry(sh), flat(CURT[i % 6])); f.material.side = T.DoubleSide; f.position.set(-1.85 + t * 3.7, 2.05 - Math.sin(t * Math.PI) * .22, .11); back.add(f); } }
  // the chalkboard and the cuckoo clock on the left wall
  const slateT = await imgTex(ASSETS.tex.slate);
  const board = new T.Group();
  const frameM = flat('#4A2A1C'); const bwid = .78, bhei = .62;
  board.add(new T.Mesh(new T.PlaneGeometry(bwid, bhei), new T.MeshToonMaterial({ map: slateT, gradientMap: ramp })));
  [[0, bhei / 2, bwid + .06, .04], [0, -bhei / 2, bwid + .06, .04], [-bwid / 2, 0, .04, bhei], [bwid / 2, 0, .04, bhei]].forEach(([x, y, w, h]) => { const f = inked(new T.BoxGeometry(w, h, .03), frameM, .005); f.position.set(x, y, .01); board.add(f); });
  board.position.set(.03 + .02, 1.18, .52); board.rotation.y = Math.PI / 2; left.add(board);
  const clock = EXTRA.cuckoo({ drop: 1.3 }); clock.scale.setScalar(.5); clock.position.set(.07, 1.06, -.42); clock.rotation.y = Math.PI / 2; left.add(clock);
  const clockLight = new T.PointLight(0xFFC98A, 0, 1.2); clockLight.position.set(.35, 1.06 + .5 * (.82 + .1), -.42); left.add(clockLight);

  // ---------------- furniture and objects ----------------
  const stuff = new T.Group(); stuff.position.y = FY; room.add(stuff);
  const pop = (o, t0) => { pops.push({ o, kind: 'scale', t0, dur: .5, s: o.scale.x }); return o; };
  // workbench with the stereo
  const bench = pop(add(foldingTable(1.5, .6, .62), [.12, 0, -.32], stuff), 1.7);
  const mat = new T.Mesh(new T.BoxGeometry(.7, .006, .42), flat('#4C8FD0')); mat.position.set(.15, .645, -.32); stuff.add(mat); pops.push({ o: mat, kind: 'scale', t0: 1.8, dur: .4, s: 1 });
  const stereo = EXTRA.stereo({ gap: .42 }); stereo.scale.setScalar(.3); stereo.position.set(.45, .645, -.42); stuff.add(stereo); pop(stereo, 1.9);
  const LAYER_GAP = stereo.userData.gap;
  let explodeT = 0, explodeTo = 0;
  function setExplode(t) { stereo.children.forEach(ch => { const k = ch.userData.layer; if (k == null) return; if (k < 0) { ch.visible = t > .55; return; } ch.position.y = ch.userData.y0 + k * (.07 + (LAYER_GAP - .07) * t - LAYER_GAP); }); }
  setExplode(0);
  // (bench tools are laid out with the other stations below)
  // the volunteer's empty chair, apron over the back
  const ch = pop(add(chair(), [.05, 0, .12], stuff), 2.1); ch.rotation.y = Math.PI + .25;
  const apron = new T.Mesh(new T.PlaneGeometry(.26, .36, 8, 8), toon(cnv(256, 340, (g, w, h) => { g.fillStyle = '#F2B8C6'; g.fillRect(0, 0, w, h); g.fillStyle = '#FFFFFF'; g.fillRect(40, 120, w - 80, 60); g.font = '22px "Patrick Hand"'; g.fillStyle = '#C9574E'; g.textAlign = 'center'; g.fillText('VOLUNTEER', w / 2, 160); grainOver(g, w, h, 300); })));
  apron.material.side = T.DoubleSide; apron.position.set(0, .54, -.175); apron.rotation.set(.1, Math.PI, 0); ch.add(apron);
  // lamp table: the brass candelabra and the heart clock
  pop(add(foldingTable(1.0, .55, .62), [-1.25, 0, -.8], stuff), 1.75);
  const cand = await standee('candelabra', .62); cand.position.set(-1.42, .64, -.85); stuff.add(cand); pop(cand, 2.05);
  [[-.09, .58], [-.04, .6], [.08, .58]].forEach(([dx, y]) => glow([-1.42 + dx, FY + .64 + y, -.84], .18));
  const lampLight = new T.PointLight(0xFFCF8E, 1.6, 2.4); lampLight.position.set(-1.42, FY + 1.25, -.7); scene.add(lampLight);
  const heart = await standee('heartclock', .3); heart.position.set(-1.0, .64, -.82); heart.rotation.y = .25; stuff.add(heart); pop(heart, 2.1);
  // sewing table
  pop(add(foldingTable(1.0, .55, .62), [1.33, 0, .24], stuff), 1.8);
  // (sewing things are laid out below)
  // drawer cabinet against the back wall, with the tiered stand on top
  const cab = new T.Group(); cab.position.set(1.4, 0, -1.08); stuff.add(cab); pop(cab, 1.85);
  const wood = toon(P2.woodCanvas('#9A6440', 256, 256));
  const body = inked(new T.BoxGeometry(.5, .62, .34), wood, .006); body.position.y = .31; cab.add(body);
  const drawers = [];
  [.5, .32, .14].forEach((y, i) => { const d = new T.Group(); const f = inked(new T.BoxGeometry(.44, .15, .3), toon(P2.woodCanvas('#B07A52', 128, 128)), .005); f.position.z = .03; d.add(f);
    const k = new T.Mesh(new T.SphereGeometry(.016, 10, 8), flat(GOLD)); k.position.set(0, 0, .19); d.add(k); d.position.set(0, y, 0); cab.add(d); drawers.push(d); });
  const drawerGlow = glow([1.4, FY + .5, -.85], .0);
  const stand = await standee('stand', .5); stand.position.set(1.38, .62, -1.08); stuff.add(stand); pop(stand, 2.2);
  // café table: teapot, cups and the cake
  const ct = new T.Group(); ct.position.set(-1.05, 0, .42); stuff.add(ct); pop(ct, 1.9);
  const ctop = inked(new T.CylinderGeometry(.42, .42, .035, 40), toon(P2.woodCanvas('#A0673F', 256, 256)), .006); ctop.position.y = .5; ct.add(ctop);
  const cleg = new T.Mesh(new T.CylinderGeometry(.03, .05, .5, 12), flat('#5A3826')); cleg.position.y = .25; ct.add(cleg);
  const cfoot = new T.Mesh(new T.CylinderGeometry(.16, .18, .03, 24), flat('#5A3826')); cfoot.position.y = .015; ct.add(cfoot);
  const tp = teapot({ tint: '#86AEDC' }); tp.scale.setScalar(.24); tp.position.set(-.1, .52, -.05); ct.add(tp);
  [['#E8857B', .15, .1], ['#8FCBB2', -.08, .2]].forEach(([c, x, z]) => { const cu = teacup({ tint: c, pct: 70 }); cu.scale.setScalar(.17); cu.position.set(x, .52, z); ct.add(cu); });
  const cakeS = await standee('cake', .26); cakeS.position.set(.16, .52, -.04); ct.add(cakeS);

  // ---------------- every tool and object gets a place ----------------
  // lay a row of standees evenly between a0 and a1 along one axis, shrinking the row if it is crowded
  async function lay(items, o) {
    const S = []; for (const [k, h] of items) { if (!ASSETS.standee[k]) { console.warn('missing', k); continue; } S.push(await standee(k, h, o)); }
    const tot = S.reduce((t, g) => t + g.userData.w, 0), span = o.a1 - o.a0, sc = tot > span * .96 ? span * .96 / tot : 1, gap = (span - tot * sc) / (S.length + 1);
    let a = o.a0 + gap;
    S.forEach((g, i) => { g.scale.setScalar(sc); const w = g.userData.w * sc, c = a + w / 2; a += w + gap; const jit = o.flat ? 0 : (rnd() - .5) * (o.jit ?? .03);
      if (o.axis === 'z') g.position.set(o.c + jit, o.y, c); else g.position.set(c, o.y, o.c + jit);
      g.rotation.y = (o.ry || 0) + (o.flat ? (rnd() - .5) * .0 : (rnd() - .5) * .25); if (o.flat) g.rotation.z = (rnd() - .5) * .18;
      (o.parent || stuff).add(g); pop(g, (o.t0 || 2.1) + i * .02); });
    return S;
  }
  const bx = (w, h, d, m, p, parent, ink = .004) => { const o = inked(new T.BoxGeometry(w, h, d), m, ink); o.position.set(...p); parent.add(o); return o; };
  function shelfUnit(w, d, h, levels, hex) {
    const g = new T.Group(), m = toon(P2.woodCanvas(hex, 256, 256)), back = toon(P2.woodCanvas('#8A5A3A', 256, 256));
    [-1, 1].forEach(sd => bx(.025, h, d, m, [sd * (w / 2 - .0125), h / 2, 0], g));
    bx(w, h, .012, back, [0, h / 2, -d / 2 + .006], g);
    levels.forEach(y => bx(w - .05, .02, d, m, [0, y, 0], g)); bx(w, .025, d + .01, m, [0, h, 0], g);
    return g;
  }
  // the bench hutch: a pegboard on the back edge of the electronics table
  const pegC = cnv(900, 280, (g, w, h) => { g.fillStyle = '#D9B98C'; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(90,60,40,.55)'; for (let y = 14; y < h; y += 22) for (let x = 14; x < w; x += 22) { g.beginPath(); g.arc(x, y, 3.2, 0, 7); g.fill(); } grainOver(g, w, h, 500); });
  const peg = card(1.42, .44, .025, pegC, '#B8956A'); peg.position.set(.12, .645 + .22, -.605); stuff.add(peg); pop(peg, 1.85);
  [-.58, .82].forEach(x => { const post = bx(.03, .46, .03, flat('#B8956A'), [.12 + x, .645 + .23, -.6], stuff); pop(post, 1.85); });
  await lay([['pliers', .17], ['cutters', .15], ['drivers', .13], ['tweezers', .15], ['zippliers', .14], ['brush', .15], ['awl', .14], ['knife', .12]], { a0: -.56, a1: .8, c: -.585, y: .79, flat: true, t0: 2.0 });
  await lay([['wire', .1], ['braid', .1], ['zipties', .14], ['fluxpen', .13], ['mat', .12], ['tape', .1], ['strain', .09], ['wool', .1]], { a0: -.56, a1: .8, c: -.585, y: .66, flat: true, t0: 2.05 });
  // electronics bench, left end and right end of the stereo, and a low strip in front of it
  await lay([['iron', .2], ['worklight', .19], ['killawatt', .16], ['meter', .19]], { a0: -.62, a1: -.2, c: -.5, y: .645, ry: .2 });
  await lay([['psu', .11], ['tester', .12], ['magnifier', .15], ['loupe', .1]], { a0: -.62, a1: -.2, c: -.2, y: .645, ry: .2 });
  await lay([['caps', .09], ['led', .08], ['screws', .08]], { a0: .64, a1: .86, c: -.5, y: .645, ry: -.1 });
  await lay([['crimps', .08], ['fuses', .07], ['flux', .09]], { a0: .64, a1: .86, c: -.22, y: .645, ry: -.1 });
  // a clear compartment organiser at the bench's front right corner
  { const og = new T.Group(); og.position.set(.72, .645, -.08); stuff.add(og); pop(og, 2.2);
    const clear = new T.MeshBasicMaterial({ color: 0xE6F0F2, transparent: true, opacity: .45, depthWrite: false });
    const shell = new T.Mesh(new T.BoxGeometry(.2, .045, .1), clear); shell.position.y = .0225; shell.renderOrder = 3; og.add(shell);
    { const ed = new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(.2, .045, .1)), new T.LineBasicMaterial({ color: 0x9FB3B8 })); ed.position.y = .0225; og.add(ed); }
    for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) { const c = ['#E8857B', '#EFC15E', '#86AEDC', '#8FCBB2', '#B79FD6', '#3E3A3F', '#F0A05A', '#C8A866'][i * 2 + j];
      const bit = new T.Mesh(new T.BoxGeometry(.03, .015, .03), flat(c)); bit.position.set(-.075 + i * .05, .01, -.024 + j * .048); og.add(bit); } }

  // appliance and mechanical table: an aluminium case left open, and the fixing bits along the front edge
  { const ac = new T.Group(); ac.position.set(-1.62, .645, -.66); ac.rotation.y = .3; stuff.add(ac); pop(ac, 2.15);
    const alu = toon(cnv(128, 128, (g, w, h) => { g.fillStyle = '#C9CDD3'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 6) { g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(x, 0, 2, h); } }));
    bx(.3, .08, .2, alu, [0, .04, 0], ac);
    const hinge = new T.Group(); hinge.position.set(0, .08, -.1); hinge.rotation.x = -1.95; ac.add(hinge); bx(.3, .025, .2, alu, [0, .0125, .1], hinge);
    [['#4C8FD0', -.08, .02], ['#3E6FB0', .0, -.04], ['#E8857B', .08, .03]].forEach(([c, x, z]) => bx(.07, .03, .06, flat(c), [x, .07, z], ac));
    const ring = new T.Mesh(new T.TorusGeometry(.06, .009, 8, 40), flat(GOLD)); ring.rotation.x = Math.PI / 2; ring.position.set(.06, .09, -.02); ac.add(ring);
    [-.1, .1].forEach(x => bx(.03, .015, .012, flat('#8C8F96'), [x, .06, .105], ac)); }
  await lay([['socket3', .13], ['chain3', .13], ['bulbs', .1], ['plug', .08], ['switch', .08], ['mixerparts', .09], ['belts', .07], ['glasses', .06]], { a0: -1.44, a1: -.78, c: -.6, y: .645, ry: .25 });

  // the electronics tools that live in boxes: a black rolling toolbox on the floor, the drawn toolbox beside it
  { const rb = new T.Group(); rb.position.set(-.5, 0, -1.02); rb.rotation.y = .35; stuff.add(rb); pop(rb, 2.0);
    const blk = flat('#2F2D31'), yel = flat('#E9B949');
    bx(.32, .22, .2, blk, [0, .13, 0], rb); bx(.32, .14, .2, blk, [0, .32, 0], rb); bx(.3, .02, .19, flat('#45424A'), [0, .4, 0], rb);
    [-.11, .11].forEach(x => { bx(.04, .03, .012, yel, [x, .22, .105], rb); bx(.04, .03, .012, yel, [x, .37, .105], rb); });
    [-.13, .13].forEach(x => { const wh = new T.Mesh(new T.CylinderGeometry(.04, .04, .03, 18), flat('#1E1C1F')); wh.rotation.z = Math.PI / 2; wh.position.set(x, .04, -.08); rb.add(wh);
      const rod = new T.Mesh(new T.CylinderGeometry(.007, .007, .3, 8), flat('#8C8F96')); rod.position.set(x * .8, .55, -.1); rb.add(rod); });
    bx(.24, .025, .025, blk, [0, .7, -.1], rb); }
  await lay([['toolbox', .18]], { a0: -.32, a1: -.08, c: -1.0, y: 0, ry: .2 });

  // the waiting shelf against the back wall: things that came in to be fixed
  const intake = shelfUnit(.78, .24, .82, [.02, .29, .56], '#B07A52'); intake.position.set(.72, 0, -1.16); stuff.add(intake); pop(intake, 1.9);
  await lay([['vacuum', .2], ['bike', .17], ['fan', .2], ['trousers', .2], ['coat', .2]], { a0: -.37, a1: .37, c: .02, y: .03, parent: intake, t0: 2.2 });
  await lay([['lamp', .2], ['blender', .21], ['coffeemaker', .2], ['ultrasonic', .13], ['printer', .13]], { a0: -.37, a1: .37, c: .02, y: .3, parent: intake, t0: 2.25 });
  await lay([['radio', .14], ['laptop', .13], ['clock', .16], ['spike', .17], ['doll3', .17]], { a0: -.37, a1: .37, c: .02, y: .57, parent: intake, t0: 2.3 });
  await lay([['vase', .2]], { a0: -.37, a1: .1, c: 0, y: .83, parent: intake, t0: 2.35 });

  // supplies along the left wall, below the chalkboard
  const supply = shelfUnit(.7, .22, .78, [.02, .27, .52], '#C08A5C'); supply.position.set(-1.78, 0, -.12); supply.rotation.y = Math.PI / 2; stuff.add(supply); pop(supply, 1.9);
  await lay([['vinegar', .17], ['lube', .15], ['glue', .13], ['wipes', .15]], { a0: -.33, a1: .33, c: .02, y: .03, parent: supply, t0: 2.2 });
  await lay([['sandpaper', .1], ['dowels', .09], ['string', .11], ['fraycheck', .12], ['bag', .12]], { a0: -.33, a1: .33, c: .02, y: .28, parent: supply, t0: 2.25 });
  await lay([['velcro', .08], ['webbing', .08], ['ribbons', .12], ['biastape', .12], ['hooks', .11]], { a0: -.33, a1: .33, c: .02, y: .53, parent: supply, t0: 2.3 });

  // sewing table: a wooden tote at the back, two machines, the notions in front, a little jewellery corner
  { const tt = new T.Group(); tt.position.set(.98, .645, .04); tt.rotation.y = .2; stuff.add(tt); pop(tt, 2.15);
    const pine = toon(P2.woodCanvas('#E3C28E', 256, 256)), pine2 = toon(P2.woodCanvas('#D8B47E', 256, 256));
    bx(.3, .06, .16, pine2, [0, .03, 0], tt); const pull = new T.Mesh(new T.CircleGeometry(.018, 16), flat('#5A3826')); pull.scale.set(1.8, 1, 1); pull.position.set(0, .03, .081); tt.add(pull);
    bx(.3, .008, .16, pine, [0, .064, 0], tt); [-1, 1].forEach(sd => bx(.3, .07, .008, pine, [0, .1, sd * .076], tt));
    const end = new T.Shape(); end.moveTo(-.08, 0); end.lineTo(.08, 0); end.lineTo(.08, .07); end.quadraticCurveTo(.04, .17, 0, .17); end.quadraticCurveTo(-.04, .17, -.08, .07); end.closePath();
    [-1, 1].forEach(sd => { const eg = new T.ExtrudeGeometry(end, { depth: .012, bevelEnabled: false }); eg.rotateY(Math.PI / 2); const e = inked(eg, pine, .004); e.position.set(sd * .15 - .006, .064, 0); tt.add(e); });
    const hd = new T.Mesh(new T.CylinderGeometry(.01, .01, .3, 10), pine); hd.rotation.z = Math.PI / 2; hd.position.y = .21; tt.add(hd);
    [['#E8857B', -.08], ['#86AEDC', .02], ['#EFC15E', .09]].forEach(([c, x]) => bx(.06, .05, .05, flat(c), [x, .1, -.03], tt)); }
  await lay([['machine', .32], ['bernina', .3]], { a0: 1.1, a1: 1.8, c: .06, y: .645, ry: -.2, t0: 2.15 });
  await lay([['tomato', .1], ['spools', .1], ['bobbins', .08], ['needles', .09], ['needle3', .1], ['pins', .08], ['thimble', .06], ['tin', .08]], { a0: .85, a1: 1.8, c: .26, y: .645, ry: -.15 });
  await lay([['ripper', .1], ['scissors', .1], ['tapemeasure', .09], ['feltbook', .09], ['zipkit', .09], ['slider3', .08], ['buttons', .08], ['beads', .06], ['jumprings', .06], ['clasps', .06], ['earrings', .07]], { a0: .85, a1: 1.8, c: .44, y: .645, ry: -.15 });
  // a two-tier notions cart with the other two machines
  { const nc = new T.Group(); nc.position.set(1.62, 0, .8); nc.rotation.y = -.35; stuff.add(nc); pop(nc, 1.95);
    const cm = flat('#E8E4DC'), leg = flat('#8C8F96');
    bx(.44, .02, .28, cm, [0, .52, 0], nc); bx(.44, .02, .28, cm, [0, .24, 0], nc);
    [[-.2, -.12], [.2, -.12], [-.2, .12], [.2, .12]].forEach(([x, z]) => { const l = new T.Mesh(new T.CylinderGeometry(.008, .008, .52, 8), leg); l.position.set(x, .27, z); nc.add(l); const w = new T.Mesh(new T.SphereGeometry(.02, 10, 8), flat('#3E3A3F')); w.position.set(x, .02, z); nc.add(w); });
    window.__nc = nc; }
  await lay([['innovis', .24], ['sewingmachine', .24]], { a0: -.21, a1: .21, c: 0, y: .53, parent: window.__nc, t0: 2.25 });
  // café things: on the round table, and on the cabinet beside the tiered stand
  await lay([['plate', .06], ['croissant', .06], ['macaron', .05], ['cakeslice', .07], ['cherry', .07]], { a0: -.32, a1: .32, c: .24, y: .52, parent: ct, ry: .4, t0: 2.25 });
  await lay([['sugarbowl', .08], ['creamer', .08], ['coffee', .09], ['cup', .08]], { a0: -.3, a1: .3, c: -.22, y: .52, parent: ct, ry: .4, t0: 2.25 });
  await lay([['fork', .07], ['spoon', .07], ['napkin', .06], ['bow', .05], ['crumbs', .05]], { a0: -.18, a1: .22, c: .06, y: .52, parent: ct, ry: .4, t0: 2.3 });
  await lay([['vase2', .2]], { a0: -.42, a1: -.22, c: .02, y: .52, parent: ct, t0: 2.3 });
  await lay([['cakewhole', .1], ['pot3', .14], ['cakemissing', .1]], { a0: -.25, a1: .25, c: .1, y: .62, parent: cab, ry: -.1, t0: 2.3 });
  await lay([['caution', .12]], { a0: -.1, a1: .1, c: .2, y: .27, parent: cab, flat: true, t0: 2.3 });

  // entrance: an A-frame chalk sign
  const sign = new T.Group(); sign.position.set(-1.45, 0, .78); stuff.add(sign); pop(sign, 2.25);
  const signC = textC(300, 420, '#2E2E30', [['Repair', '62px Caveat', '#F4EEDF', 90], ['Café', '62px Caveat', '#F4EEDF', 150], ['Sunday 18 Oct', '36px Caveat', '#F2B8C6', 230], ['11 to 3', '36px Caveat', '#BFDDF2', 280], ['come in!', '44px Caveat', '#EFC15E', 360]], '#8A6440');
  [-1, 1].forEach(s => { const p = card(.32, .46, .015, signC, '#8A6440'); p.position.set(0, .22, s * .07); p.rotation.x = s * .16; if (s < 0) p.rotation.y = Math.PI; sign.add(p); });
  sign.rotation.y = .5;
  // the final object: a rainbow-soled sneaker on a little pedestal, throwing a rainbow
  const shoeG = new T.Group(); shoeG.position.set(.62, 0, .74); stuff.add(shoeG); pop(shoeG, 2.3);
  const ped = inked(lathe([[0, 0], [.2, 0], [.2, .03], [.16, .05], [.16, .12], [.2, .14], [.2, .16], [0, .16]], 48), toon(chinaCanvas('#B79FD6', { gold: [.9], dots: [.5, 30] })), .005); shoeG.add(ped);
  const shoe = new T.Group(); shoe.position.y = .165; shoe.rotation.y = .55; shoeG.add(shoe);
  { // a sneaker lofted from a side profile and a footprint: white upper, holographic rainbow wash, rainbow sole
    const L = .36, sm1 = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
    const wid = u => (.074 + .034 * sm1(0, .7, u) - .012 * sm1(.75, 1, u)) * Math.pow(Math.sin(Math.PI * Math.min(.999, Math.max(.001, u))), .42);
    const hgt = u => .03 + .085 * (1 - sm1(.32, .98, u)) * (1 - .1 * Math.exp(-Math.pow((u - .2) / .06, 2))) + .012 * Math.exp(-Math.pow((u - .36) / .07, 2));
    const SY = .035, N = 72, M = 28, pos = [], uvs = [], idxs = [];
    for (let i = 0; i <= N; i++) { const u = i / N; for (let j = 0; j <= M; j++) { const th = j / M * Math.PI; const s = Math.pow(Math.sin(th), .6);
      pos.push(-L / 2 + L * u, SY + hgt(u) * s, wid(u) / 2 * Math.cos(th)); uvs.push(u, j / M); } }
    for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) { const a = i * (M + 1) + j, b = a + M + 1; idxs.push(a, b, a + 1, b, b + 1, a + 1); }
    const ug = new T.BufferGeometry(); ug.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); ug.setAttribute('uv', new T.Float32BufferAttribute(uvs, 2)); ug.setIndex(idxs); ug.computeVertexNormals();
    const upC = cnv(1024, 512, (g, w, h) => {
      g.fillStyle = '#FBF8F2'; g.fillRect(0, 0, w, h);
      // holographic wash low on both sides, strongest toward the heel, the way the photo catches it
      [[0, .3], [1, .7]].forEach(([edge]) => { const gr = g.createLinearGradient(0, 0, w, 0); ['#F2A7B5', '#F6C58F', '#F3E39A', '#A8DCC4', '#9CC2EC', '#C6AEE6'].forEach((c, i) => gr.addColorStop(i / 5, c));
        g.globalAlpha = .75; g.fillStyle = gr; const y0 = edge ? h * .72 : 0; g.fillRect(0, y0, w, h * .28);
        const fade = g.createLinearGradient(0, edge ? h * .72 : h * .28, 0, edge ? h : 0); fade.addColorStop(0, 'rgba(251,248,242,1)'); fade.addColorStop(1, 'rgba(251,248,242,0)'); g.globalAlpha = 1; g.fillStyle = fade; g.fillRect(0, y0, w, h * .28); });
      // a diagonal glint across the quarter panel
      g.save(); g.globalAlpha = .45; g.translate(w * .28, h * .2); g.rotate(-.5); const gl = g.createLinearGradient(0, 0, 0, 40); ['#C6AEE6', '#9CC2EC', '#A8DCC4', '#F3E39A'].forEach((c, i) => gl.addColorStop(i / 3, c)); g.fillStyle = gl; g.fillRect(-60, 0, 260, 40); g.restore();
      // stitched panels
      g.strokeStyle = 'rgba(150,135,120,.55)'; g.lineWidth = 3; g.setLineDash([8, 7]);
      [[.18, .32], [.66, .9]].forEach(([u0, u1]) => { g.beginPath(); g.moveTo(w * u0, h * .12); g.quadraticCurveTo(w * (u0 + u1) / 2, h * .32, w * u1, h * .14); g.stroke(); g.beginPath(); g.moveTo(w * u0, h * .88); g.quadraticCurveTo(w * (u0 + u1) / 2, h * .68, w * u1, h * .86); g.stroke(); });
      g.setLineDash([]);
      // the collar opening, with a soft lining
      g.fillStyle = '#E3D6C6'; g.beginPath(); g.ellipse(w * .15, h * .5, w * .12, h * .16, 0, 0, 7); g.fill();
      g.fillStyle = '#8C7B74'; g.beginPath(); g.ellipse(w * .15, h * .5, w * .095, h * .11, 0, 0, 7); g.fill();
      // tongue and laces
      g.fillStyle = '#F1EBE2'; g.fillRect(w * .28, h * .4, w * .36, h * .2);
      g.strokeStyle = '#FFFFFF'; g.lineWidth = 9; for (let k = 0; k < 6; k++) { const x = w * (.31 + k * .055); g.beginPath(); g.moveTo(x, h * .38); g.lineTo(x + w * .05, h * .62); g.moveTo(x, h * .62); g.lineTo(x + w * .05, h * .38); g.stroke(); }
      g.fillStyle = '#B8ADA3'; for (let k = 0; k < 7; k++) { [.37, .63].forEach(v => { g.beginPath(); g.arc(w * (.31 + k * .055), h * v, 6, 0, 7); g.fill(); }); }
      grainOver(g, w, h, 900);
    });
    const um = new T.MeshToonMaterial({ map: tex(upC), gradientMap: ramp, side: T.DoubleSide });
    shoe.add(inked(ug, um, .004));
    // the sole: the same footprint, a little proud, rainbow from heel to toe
    const outline = new T.Shape(); const K = 60;
    for (let i = 0; i <= K; i++) { const u = i / K; const x = -L / 2 + L * u, z = wid(u) / 2 + .009; i ? outline.lineTo(x, z) : outline.moveTo(x, z); }
    for (let i = K; i >= 0; i--) { const u = i / K; outline.lineTo(-L / 2 + L * u, -(wid(u) / 2 + .009)); }
    const sg = new T.ExtrudeGeometry(outline, { depth: SY, bevelEnabled: true, bevelSize: .004, bevelThickness: .004, bevelSegments: 2, curveSegments: 4 }); sg.rotateX(Math.PI / 2); sg.translate(0, SY, 0);
    const suv = sg.attributes.uv, sp = sg.attributes.position; for (let i = 0; i < suv.count; i++) suv.setXY(i, (sp.getX(i) + L / 2 + .01) / (L + .02), sp.getY(i) / SY);
    const solC = cnv(512, 64, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); ['#E8857B', '#F0A05A', '#EFC15E', '#8FCBB2', '#86AEDC', '#B79FD6'].forEach((c, i) => gr.addColorStop(i / 5, c)); g.fillStyle = gr; g.fillRect(0, 0, w, h); g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(0, h * .4, w, 4); g.fillStyle = 'rgba(255,255,255,.25)'; for (let x = 0; x < w; x += 9) g.fillRect(x, h * .7, 3, h * .3); });
    const solM = new T.MeshToonMaterial({ map: tex(solC), gradientMap: ramp, emissive: 0x2A1F3A, emissiveIntensity: .35 });
    shoe.add(inked(sg, solM, .004));
    // a few raised lace loops on the throat
    for (let k = 0; k < 4; k++) { const u = .36 + k * .06; const l = new T.Mesh(new T.TorusGeometry(.012, .0032, 6, 14, Math.PI), flat('#FFFFFF')); l.position.set(-L / 2 + L * u, SY + hgt(u) + .001, 0); l.rotation.set(0, Math.PI / 2, 0); shoe.add(l); }
    const lace = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([[-.01, SY + hgt(.38), .02], [.03, SY + hgt(.4) + .03, .07], [.05, SY + .03, .09]].map(v => new T.Vector3(...v))), 16, .003, 5), flat('#FFFFFF')); shoe.add(lace);
  }
  const prism = new T.Mesh(new T.PlaneGeometry(1.1, .32), new T.MeshBasicMaterial({ map: tex(cnv(512, 128, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); CURT.forEach((c, i) => gr.addColorStop(i / 5, c)); g.fillStyle = gr; g.fillRect(0, 0, w, h); const f = g.createLinearGradient(0, 0, w, 0); f.addColorStop(0, 'rgba(0,0,0,0)'); f.addColorStop(.3, 'rgba(0,0,0,0)'); g.globalCompositeOperation = 'destination-in'; const m = g.createLinearGradient(0, 0, w, 0); m.addColorStop(0, 'rgba(0,0,0,0)'); m.addColorStop(.25, 'rgba(0,0,0,.9)'); m.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = m; g.fillRect(0, 0, w, h); })), transparent: true, blending: T.AdditiveBlending, depthWrite: false, opacity: .55 }));
  prism.rotation.x = -Math.PI / 2; prism.rotation.z = .5; prism.position.set(.3, .005, .6); stuff.add(prism);
  // chandelier on a beam
  const beam = inked(new T.BoxGeometry(.12, .1, RZ1 - RZ0 + .2), toon(P2.woodCanvas('#7A4A2E', 256, 256)), .006); beam.position.set(.1, WH + .05, (RZ0 + RZ1) / 2 - .1); stuff.add(beam); pop(beam, 1.6);
  const chand = new T.Group(); chand.position.set(.1, WH - .38, -.3); stuff.add(chand); pop(chand, 2.0);
  { const rodC = new T.Mesh(new T.CylinderGeometry(.005, .005, .4, 6), flat(GOLD)); rodC.position.y = .2; chand.add(rodC); }
  { const ringC = inked(new T.TorusGeometry(.2, .012, 8, 48), flat(GOLD), .004); ringC.rotation.x = Math.PI / 2; chand.add(ringC); }
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; const b = new T.Mesh(new T.SphereGeometry(.035, 16, 12), new T.MeshBasicMaterial({ color: 0xFFF1D2 })); b.position.set(Math.cos(a) * .2, .05, Math.sin(a) * .2); chand.add(b); glow([Math.cos(a) * .2, .05, Math.sin(a) * .2], .28, chand);
    const cup = new T.Mesh(new T.CylinderGeometry(.02, .03, .03, 12), flat(GOLD)); cup.position.set(Math.cos(a) * .2, .015, Math.sin(a) * .2); chand.add(cup); }
  const chandLight = new T.PointLight(0xFFD8A0, 2.2, 4.5); chandLight.position.set(.1, WH - .4, -.3); room.add(chandLight);
  // drifting motes
  const motes = new T.Points(new T.BufferGeometry(), new T.PointsMaterial({ map: glowTex, size: .05, transparent: true, depthWrite: false, blending: T.AdditiveBlending, color: 0xFFE7C2 }));
  { const n = 90, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { a[i * 3] = (Math.random() - .5) * 3.6; a[i * 3 + 1] = FY + .3 + Math.random() * 1.9; a[i * 3 + 2] = RZ0 + Math.random() * 2.2; } motes.geometry.setAttribute('position', new T.BufferAttribute(a, 3)); }
  room.add(motes);

  // ---------------- anchors, stops, hotspots ----------------
  const wp = o => o.getWorldPosition(new T.Vector3());
  const anchorObj = { sign, stereo, chair: ch, clockdoor: clock.userData.door, shoe: shoeG };
  const anchorOff = { sign: [0, .5, 0], stereo: [0, .1, 0], chair: [0, .55, 0], clockdoor: [0, 0, 0], shoe: [0, .3, 0] };
  const anchor = k => wp(anchorObj[k]).add(new T.Vector3(...anchorOff[k]));
  const VIEWS = {
    entrance: { p: [4.4, 4.6, 7.2], t: [-.1, .85, 0] },
    bench: { p: [1.7, 1.75, 2.2], t: [.2, .9, -.35] },
    volunteer: { p: [-.55, 1.35, 2.25], t: [.05, .7, .05] },
    clock: { p: [.95, 1.75, .25], t: [-1.86, 1.55, -.42] },
    clockOpen: { p: [-.35, 1.75, -.15], t: [-1.86, 1.58, -.42] },
    final: { p: [1.95, 1.15, 2.35], t: [.62, .42, .74] },
    closed: { p: [1.4, 5.6, 6.0], t: [0, 0, .2] }
  };
  const HOT = [
    { id: 'ticket', obj: wb, off: [0, .2, .05] }, { id: 'stereo', obj: stereo, off: [0, .25, 0] }, { id: 'drawer', obj: drawers[0], off: [0, 0, .2] },
    { id: 'lamp', obj: cand, off: [0, .5, 0] }, { id: 'heart', obj: heart, off: [0, .3, 0] }, { id: 'board', obj: board, off: [0, .25, 0] }, { id: 'sewing', obj: window.__nc, off: [0, .8, 0] }, { id: 'shelf', obj: intake, off: [0, .95, .1] }, { id: 'toolbox', obj: peg, off: [-.3, .3, .05] }
  ];
  const hotEls = HOT.map(h => { const b = document.createElement('button'); b.className = 'hot'; b.innerHTML = `<i></i><span>${SUPP[h.id].label}</span>`; b.setAttribute('aria-label', 'Discover: ' + SUPP[h.id].label); b.style.display = 'none'; b.onclick = () => openSupp(h.id); document.body.appendChild(b); return b; });

  // ---------------- camera motion ----------------
  const camPos = new T.Vector3(...VIEWS.closed.p), camTgt = new T.Vector3(...VIEWS.closed.t);
  let tween = null;
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  function flyTo(v, dur = 1.6) { const p0 = camPos.clone(), t0 = camTgt.clone(), p1 = new T.Vector3(...v.p), t1 = new T.Vector3(...v.t);
    if (reduce) { camPos.copy(p1); camTgt.copy(t1); return Promise.resolve(); }
    return new Promise(res => { tween = { s: performance.now(), dur: dur * 1000, f: k => { camPos.lerpVectors(p0, p1, k); camTgt.lerpVectors(t0, t1, k); }, res }; }); }
  // orbit while exploring
  let exploring = false, orb = null;
  function startOrbit() { const d = camPos.clone().sub(camTgt); orb = { r: d.length(), th: Math.atan2(d.x, d.z), ph: Math.acos(d.y / d.length()), th0: 0, r0: 0 }; orb.th0 = orb.th; orb.r0 = orb.r; }
  let drag = null;
  canvas.addEventListener('pointerdown', e => { if (!exploring) return; drag = { x: e.clientX, y: e.clientY, th: orb.th, ph: orb.ph }; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', e => { if (!drag) return; orb.th = Math.max(orb.th0 - .9, Math.min(orb.th0 + .9, drag.th - (e.clientX - drag.x) * .006)); orb.ph = Math.max(.35, Math.min(1.45, drag.ph - (e.clientY - drag.y) * .005)); applyOrbit(); });
  canvas.addEventListener('pointerup', () => drag = null);
  function applyOrbit() { camPos.set(camTgt.x + orb.r * Math.sin(orb.ph) * Math.sin(orb.th), camTgt.y + orb.r * Math.cos(orb.ph), camTgt.z + orb.r * Math.sin(orb.ph) * Math.cos(orb.th)); }

  // ---------------- UI ----------------
  let cur = -1, clockOpen = false, opened = false;
  const idx = $('index');
  idx.innerHTML = STOPS.map((s, i) => `<button data-i="${i}"><span class="n">${i + 1}</span>${s.name}</button>`).join('') + `<div class="sep"></div><button class="ex" id="exAll">Explore the café freely</button>`;
  idx.querySelectorAll('button[data-i]').forEach(b => b.onclick = () => { idx.classList.remove('open'); go(+b.dataset.i); });
  $('exAll').onclick = () => { idx.classList.remove('open'); if (!opened) return; flyTo(VIEWS.entrance).then(() => explore(true)); };
  $('dots').innerHTML = STOPS.map(() => '<b></b>').join('');
  const photoHTML = k => k ? `<img class="photo" src="${ASSETS.photo[k][0]}" width="${ASSETS.photo[k][1]}" height="${ASSETS.photo[k][2]}" alt="${P('Alt text placeholder').replace(/<[^>]+>/g, '')}" data-k="${k}">` : '';
  function renderCard(i) {
    const s = STOPS[i]; let h = `<div class="kicker">Stop ${i + 1} of ${STOPS.length} · ${s.name}</div><h2>${s.title}</h2>${photoHTML(s.photo)}<p class="cap">${s.body}</p>${s.src ? `<p class="src">${s.src}</p>` : ''}`;
    if (s.clock && clockOpen) h += clockRevealHTML();
    $('cardBody').innerHTML = h; $('cardBody').scrollTop = 0;
    const a = [];
    if (i > 0) a.push(`<button class="btn ghost" data-a="prev">‹ Back</button>`);
    if (s.clock && !clockOpen) a.push(`<button class="btn primary" data-a="openclock">Open the clock</button>`, `<button class="btn" data-a="next">Continue without opening</button>`);
    else a.push(`<button class="btn primary" data-a="next">${i === STOPS.length - 1 ? 'Explore the café ▸' : 'Continue ▸'}</button>`);
    (s.extra || []).forEach(x => a.push(`<button class="btn" data-a="${x.act}">${x.label}</button>`));
    a.push(`<button class="btn ghost" data-a="explore">Explore here</button>`);
    $('cardActions').innerHTML = a.join('');
    wireCard();
  }
  const clockRevealHTML = () => `<div class="reveal"><span class="tag">${CLOCK_REVEAL.tag}</span>${photoHTML(CLOCK_REVEAL.photo)}<p class="cap">${CLOCK_REVEAL.body}</p><p class="src">${CLOCK_REVEAL.src}</p></div>`;
  function wireCard() {
    $('cardBody').querySelectorAll('img.photo').forEach(im => im.onclick = () => { $('lbImg').src = im.src; $('lbImg').alt = im.alt; $('lb').classList.add('on'); $('lbClose').focus(); });
    $('cardActions').querySelectorAll('button').forEach(b => b.onclick = () => act(b.dataset.a));
  }
  function act(a) {
    if (a === 'next') return cur === STOPS.length - 1 ? explore(true) : go(cur + 1);
    if (a === 'prev') return go(cur - 1);
    if (a === 'explore') return explore(true);
    if (a === 'openclock') return openClock();
    if (a === 'explode') { explodeTo = explodeTo ? 0 : 1; return; }
    if (a === 'drawer') { drawerTo = drawerTo ? 0 : 1; return; }
  }
  let drawerT = 0, drawerTo = 0;
  async function openClock() {
    clockOpen = true; renderCard(cur);
    await flyTo(VIEWS.clockOpen, 1.4);
    const rev = $('cardBody').querySelector('.reveal'); if (rev) rev.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }
  function openSupp(id) {
    const s = SUPP[id];
    $('card').classList.remove('hide');
    $('cardBody').innerHTML = `<span class="tag sup">supplementary · outside the main essay</span><h2>${s.title}</h2>${photoHTML(s.photo)}<p class="cap">${s.body}</p>${s.photo ? `<p class="src">${credit}</p>` : ''}`;
    const a = [`<button class="btn primary" data-a="back">Back to exploring</button>`];
    if (s.act === 'explode') a.push(`<button class="btn" data-a="explode">Lift the stereo apart</button>`);
    if (s.act === 'drawer') a.push(`<button class="btn" data-a="drawer">Open / close the drawer</button>`);
    $('cardActions').innerHTML = a.join(''); wireCard();
    $('cardActions').querySelector('[data-a=back]').onclick = () => { $('card').classList.add('hide'); };
    if (s.act === 'drawer') drawerTo = 1; if (s.act === 'explode') explodeTo = 1;
    suppAnchor = HOT.find(h => h.id === id);
  }
  let suppAnchor = null;
  function explore(on) {
    exploring = on; $('explore').classList.toggle('on', on);
    hotEls.forEach(b => b.style.display = on ? 'flex' : 'none');
    if (on) { $('card').classList.add('hide'); startOrbit(); $('exploreText').textContent = 'Exploring · drag to look around · tap a glowing dot'; $('resume').focus(); }
    else { $('card').classList.remove('hide'); suppAnchor = null; }
  }
  $('resume').onclick = () => { explore(false); go(Math.max(0, cur)); };
  async function go(i) {
    if (!opened || i < 0 || i >= STOPS.length) return;
    if (exploring) explore(false);
    if (i !== 3) { clockOpen = false; }
    cur = i; renderCard(i);
    idx.querySelectorAll('button[data-i]').forEach(b => b.classList.toggle('on', +b.dataset.i === i));
    $('dots').querySelectorAll('b').forEach((b, k) => b.classList.toggle('on', k === i));
    $('next').textContent = i === STOPS.length - 1 ? 'Explore ▸' : 'Continue ▸';
    $('prev').disabled = i === 0;
    await flyTo(VIEWS[STOPS[i].id]);
  }
  $('next').onclick = () => act('next'); $('prev').onclick = () => act('prev');
  $('idxBtn').onclick = () => idx.classList.toggle('open');
  $('lbClose').onclick = () => $('lb').classList.remove('on');
  $('lb').onclick = e => { if (e.target.id === 'lb') $('lb').classList.remove('on'); };
  addEventListener('keydown', e => {
    if (e.key === 'Escape') { if ($('lb').classList.contains('on')) $('lb').classList.remove('on'); else if (exploring) { explore(false); go(Math.max(0, cur)); } return; }
    if (!opened || exploring || $('lb').classList.contains('on')) return;
    if (['ArrowRight', 'PageDown', ' '].includes(e.key) && document.activeElement.tagName !== 'BUTTON') { e.preventDefault(); act('next'); }
    if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); act('prev'); }
  });
  let wheelLock = 0;
  addEventListener('wheel', e => {
    if (!opened || e.target.closest('#card') || e.target.closest('#index')) return;
    if (exploring) { orb.r = Math.max(orb.r0 * .55, Math.min(orb.r0 * 1.6, orb.r * (1 + e.deltaY * .001))); applyOrbit(); return; }
    const now = performance.now(); if (now < wheelLock || Math.abs(e.deltaY) < 25) return; wheelLock = now + 1100; act(e.deltaY > 0 ? 'next' : 'prev');
  }, { passive: true });

  // ---------------- the opening ----------------
  $('card').classList.add('hide'); $('bar').style.visibility = 'hidden'; idx.style.visibility = 'hidden';
  // a title leaf lies over the folded spread; opening the book lifts it away
  const leafC = cnv(1600, 1000, (g, w, h) => {
    g.fillStyle = '#FFFCF5'; g.fillRect(0, 0, w, h);
    const arcCols = ['#E8857B', '#F0A05A', '#EFC15E', '#8FCBB2', '#86AEDC', '#B79FD6'];
    arcCols.forEach((c, i) => { g.strokeStyle = c; g.lineWidth = 30; g.lineCap = 'round'; g.beginPath(); g.arc(w / 2, h * .74, 330 - i * 34, Math.PI * 1.08, Math.PI * 1.92); g.stroke(); });
    g.textAlign = 'center'; g.fillStyle = '#3E3531'; g.font = '700 150px Caveat'; g.fillText('Repair Café', w / 2, h * .74);
    g.font = 'italic 300 46px Newsreader'; g.fillStyle = '#8C7B74'; g.fillText('a pop-up book', w / 2, h * .74 + 70);
    // little doodles: a wrench, a needle and thread, a heart, stars
    g.strokeStyle = '#8C7B74'; g.lineWidth = 5; g.lineCap = 'round';
    g.save(); g.translate(w * .2, h * .3); g.rotate(-.6); g.beginPath(); g.moveTo(-60, 0); g.lineTo(50, 0); g.stroke(); g.beginPath(); g.arc(70, 0, 22, .9, 5.4); g.stroke(); g.restore();
    g.save(); g.translate(w * .8, h * .3); g.rotate(.5); g.beginPath(); g.moveTo(-60, 0); g.lineTo(60, 0); g.stroke(); g.beginPath(); g.ellipse(48, 0, 8, 3, 0, 0, 7); g.stroke(); g.beginPath(); g.moveTo(48, 0); g.bezierCurveTo(90, 60, 10, 90, 40, 140); g.stroke(); g.restore();
    [[.12, .7], [.88, .68], [.3, .14], [.7, .12], [.5, .92]].forEach(([x, y], i) => { g.fillStyle = arcCols[i]; g.save(); g.translate(w * x, h * y); g.beginPath(); for (let k = 0; k < 10; k++) { const r = k % 2 ? 9 : 22, a = k / 10 * Math.PI * 2; g.lineTo(Math.sin(a) * r, -Math.cos(a) * r); } g.fill(); g.restore(); });
    g.strokeStyle = 'rgba(80,60,50,.12)'; g.lineWidth = 3; g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
    grainOver(g, w, h, 2600);
  });
  const leaf = new T.Mesh(new T.PlaneGeometry(4.72, 2.95), new T.MeshToonMaterial({ map: tex(leafC), gradientMap: ramp, transparent: true }));
  leaf.rotation.x = -Math.PI / 2; leaf.position.set(0, .34, 0); book.add(leaf);
  pops.forEach(p => { if (p.kind === 'rot') p.o.rotation[p.axis] = p.from; else p.o.scale.setScalar(.001); });
  plinth.scale.y = .001; chandLight.intensity = 0; lampLight.intensity = 0; motes.visible = false; glows.forEach(g => g.visible = false); prism.visible = false;
  let openStart = null;
  $('open').onclick = () => { $('intro').style.display = 'none'; if (reduce) { finishOpen(); return; } openStart = performance.now(); flyTo(VIEWS.entrance, 3.2); };
  function finishOpen() {
    openStart = null; leaf.visible = false; $('intro').style.display = 'none'; plinth.scale.y = 1;
    pops.forEach(p => { if (p.kind === 'rot') p.o.rotation[p.axis] = 0; else p.o.scale.setScalar(p.s); });
    chandLight.intensity = 2.2; lampLight.intensity = 1.6; motes.visible = true; glows.forEach(g => g.visible = true); prism.visible = true;
    opened = true; $('bar').style.visibility = 'visible'; idx.style.visibility = 'visible'; $('card').classList.remove('hide'); go(0);
  }
  function stepOpen(t) {
    const k = x => Math.max(0, Math.min(1, x));
    const e = ease(k(t / .9)); leaf.position.y = .34 + e * 1.4; leaf.position.z = -e * .6; leaf.rotation.x = -Math.PI / 2 + e * .7; leaf.material.opacity = 1 - e; leaf.visible = e < 1;
    plinth.scale.y = Math.max(.001, ease(k((t - .7) / .4)));
    pops.forEach(p => { const u = k((t - p.t0) / p.dur);
      if (p.kind === 'rot') p.o.rotation[p.axis] = p.from * (1 - ease(u));
      else { const s = u <= 0 ? .001 : 1 + Math.sin(u * Math.PI) * .12 * (1 - u) - (1 - ease(u)); p.o.scale.setScalar(Math.max(.001, s * p.s)); } });
    const L = k((t - 2.0) / .8); chandLight.intensity = 2.2 * L; lampLight.intensity = 1.6 * L; glows.forEach(g => g.visible = L > .2); motes.visible = L > .5; prism.visible = L > .6;
    if (t > 3.3) finishOpen();
  }

  // ---------------- frame loop ----------------
  const v = new T.Vector3();
  function project(p) { v.copy(p).project(cam); return [(v.x + 1) / 2 * innerWidth, (1 - v.y) / 2 * innerHeight, v.z < 1]; }
  function resize() {
    R.setSize(innerWidth, innerHeight, false); cam.aspect = innerWidth / innerHeight;
    // keep the stop's object clear of the reading card
    const shift = mobile() ? 0 : Math.max(0, ($('card').offsetWidth + 24 - 252) / 2);
    const lift = mobile() ? innerHeight * .2 : 0;
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
    const door = clock.userData.door; const dgt = clockOpen ? -1.9 : 0; door.rotation.y += (dgt - door.rotation.y) * Math.min(1, dt * 3); clockLight.intensity = clockOpen ? 1.4 : 0;
    // motes drift, glows breathe
    if (motes.visible && !reduce) { const a = motes.geometry.attributes.position; for (let i = 0; i < a.count; i++) { let y = a.getY(i) + dt * (.03 + (i % 7) * .006); if (y > FY + 2.3) y = FY + .3; a.setY(i, y); a.setX(i, a.getX(i) + Math.sin(now * .0004 + i) * dt * .02); } a.needsUpdate = true; }
    glows.forEach((g, i) => { if (g !== drawerGlow) g.material.opacity = .82 + Math.sin(now * .003 + i * 1.7) * .12; });
    cam.position.copy(camPos); cam.lookAt(camTgt);
    // hotspots and the card's connector
    if (exploring) HOT.forEach((h, i) => { const [x, y, ok] = project(wp(h.obj).add(new T.Vector3(...h.off))); hotEls[i].style.left = x + 'px'; hotEls[i].style.top = y + 'px'; hotEls[i].style.visibility = ok ? 'visible' : 'hidden'; });
    const path = $('wirePath'), dot = $('wireDot'); const cardEl = $('card');
    let ap = null;
    if (!mobile() && !cardEl.classList.contains('hide')) { if (exploring && suppAnchor) ap = wp(suppAnchor.obj).add(new T.Vector3(...suppAnchor.off)); else if (!exploring && cur >= 0) ap = anchor(STOPS[cur].anchor); }
    if (ap) { const [x, y] = project(ap); const r = cardEl.getBoundingClientRect(); const cx = r.left, cy = r.top + 110;
      path.setAttribute('d', `M${cx} ${cy} C${cx - 120} ${cy} ${x + 120} ${y} ${x} ${y}`); dot.setAttribute('cx', x); dot.setAttribute('cy', y); }
    else { path.setAttribute('d', ''); dot.setAttribute('cx', -10); }
    R.render(scene, cam);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  window.__dio = { stereo, ch, shoeG, bench, T, go, explore, openClock, finishOpen, act, VIEWS, camPos, camTgt, setOpen: () => finishOpen() };

  function noGL() {
    $('noGL').style.display = 'block'; $('intro').style.display = 'none';
    $('noGL').innerHTML = `<h1 style="font:400 40px 'Instrument Serif'">${P('Headline placeholder')}</h1>` + STOPS.map((s, i) => `<section style="max-width:640px;margin:28px 0"><div class="kicker">Stop ${i + 1} · ${s.name}</div><h2>${s.title}</h2>${s.photo ? `<img src="${ASSETS.photo[s.photo][0]}" style="width:100%;border-radius:10px" alt="">` : ''}<p>${s.body}</p></section>`).join('');
  }
})();
