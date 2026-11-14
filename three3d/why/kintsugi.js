/* A china teacup broken into five pieces and mended with gold. Each piece is one reason; the bigger the piece,
   the higher people ranked it. Stage n shows the first n pieces in place. Same house style as the other props. */
(function () {
  const T = THREE, TW = 2048, TH = 1024;
  const UNITS = [58, 66, 71, 100, 129];           // bottom piece first. The fourth stands for ranks 2 to 5.
  const COLS = ['#3E2619', '#6A3F27', '#9B6842', '#C9A27A', '#F1E4CC'];
  function jag(seedv, n, amp) {                    // a closed jagged line around the cup: offsets at n corners
    const pts = []; for (let i = 0; i < n; i++) pts.push([(i + .1 + rnd() * .8) / n, (i % 2 ? 1 : -1) * amp * (.35 + rnd() * .65)]);
    return u => { u = ((u % 1) + 1) % 1; let a = pts[pts.length - 1], b = pts[0], ua = a[0] - 1, ub = b[0];
      for (let i = 0; i < pts.length; i++) { if (u < pts[i][0]) { b = pts[i]; ub = b[0]; a = pts[(i + pts.length - 1) % pts.length]; ua = i ? a[0] : a[0] - 1; break; } if (i == pts.length - 1) { a = pts[i]; ua = a[0]; b = pts[0]; ub = b[0] + 1; } }
      return a[1] + (b[1] - a[1]) * (u - ua) / (ub - ua); };
  }
  function build(o) {
    const tot = UNITS.reduce((a, b) => a + b, 0); let c = 0; const cum = [0]; UNITS.forEach(u => { c += u / tot; cum.push(c); });
    const jags = [null, jag(1, 7, .04), jag(2, 8, .045), jag(3, 7, .055), jag(4, 8, .07)];
    const seam = (k, u) => k <= 0 ? -0.02 : k >= 5 ? 1.02 : cum[k] + jags[k](u);
    const Y = v => TH * (1 - v), X = u => u * TW;
    const trace = (g, k, rev) => { const N = 400; for (let i = 0; i <= N; i++) { const u = rev ? 1 - i / N : i / N; g.lineTo(X(u), Y(seam(k, u))); } };
    /* glazes, one canvas each */
    const glaze = [];
    { const cv = crayonCanvas(COLS[0], TW, TH, 3000), g = cv.getContext('2d');              // espresso, oil-spot speckle
      for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(236,196,142,${.18 + rnd() * .4})`; g.beginPath(); g.arc(rnd() * TW, rnd() * TH, .8 + rnd() * rnd() * 4.2, 0, 7); g.fill(); } glaze.push(cv); }
    { const cv = crayonCanvas(COLS[1], TW, TH, 3000), g = cv.getContext('2d');              // brown, crackled
      const P = []; for (let i = 0; i < 520; i++) P.push([rnd() * TW, rnd() * TH]);
      g.strokeStyle = 'rgba(246,222,186,.62)'; g.lineWidth = 2.2; g.lineCap = 'round';
      P.forEach((p, i) => { const d = P.map((q, j) => [(q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2, j]).sort((a, b) => a[0] - b[0]); for (let k = 1; k <= 3; k++) { const q = P[d[k][1]]; if (d[k][1] < i) continue; g.beginPath(); g.moveTo(p[0], p[1]); g.quadraticCurveTo((p[0] + q[0]) / 2 + (rnd() - .5) * 14, (p[1] + q[1]) / 2 + (rnd() - .5) * 14, q[0], q[1]); g.stroke(); } }); glaze.push(cv); }
    { const cv = crayonCanvas(COLS[2], TW, TH, 3000), g = cv.getContext('2d');              // caramel, cream slip dots
      const s = 46; for (let r = 0; r * s * .8 < TH + s; r++) for (let q = 0; q * s < TW + s; q++) { const x = q * s + (r % 2 ? s / 2 : 0) + (rnd() - .5) * 5, y = r * s * .8 + (rnd() - .5) * 5; g.fillStyle = 'rgba(250,234,206,.9)'; g.beginPath(); g.ellipse(x, y, 7.5 + rnd() * 2, 7 + rnd() * 2, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(120,76,44,.25)'; g.beginPath(); g.arc(x + 2, y + 3, 3, 0, 7); g.fill(); } glaze.push(cv); }
    { const cv = crayonCanvas(COLS[3], TW, TH, 2400), g = cv.getContext('2d');              // marbled clay
      const cs = ['rgba(244,230,206,.9)', 'rgba(244,230,206,.75)', 'rgba(132,86,54,.85)', 'rgba(228,198,156,.9)', 'rgba(104,66,42,.8)', 'rgba(250,240,222,.85)'];
      for (let i = 0; i < 150; i++) { const y0 = rnd() * TH, a1 = 10 + rnd() * 34, a2 = 6 + rnd() * 16, f1 = (1 + Math.floor(rnd() * 3)) * 2 * Math.PI / TW, f2 = (3 + Math.floor(rnd() * 5)) * 2 * Math.PI / TW, p1 = rnd() * 7, p2 = rnd() * 7;
        g.strokeStyle = cs[Math.floor(rnd() * cs.length)]; g.lineWidth = 3 + rnd() * rnd() * 22; g.beginPath(); for (let x = -10; x <= TW + 10; x += 8) g.lineTo(x, y0 + a1 * Math.sin(x * f1 + p1) + a2 * Math.sin(x * f2 + p2) + 26 * Math.sin(x * 2 * Math.PI / TW * 2 + y0 * .012)); g.stroke(); } glaze.push(cv); }
    { const cv = crayonCanvas(COLS[4], TW, TH, 2600), g = cv.getContext('2d');              // cream china with gold scallops and roses
      const vS = .915, n = 22; g.strokeStyle = GOLD; g.lineWidth = 5; for (let i = 0; i < n; i++) { g.beginPath(); g.arc((i + .5) * TW / n, Y(vS + .045), TW / n / 2, 0, Math.PI); g.stroke(); }
      g.fillStyle = GOLD; g.fillRect(0, Y(1) - 2, TW, Y(.978) - Y(1) + 2);
      for (let i = 0; i < 8; i++) rose(g, (i + .5) * TW / 8, Y(.8), 17, '#E8857B');
      g.fillStyle = GOLD; for (let i = 0; i < 64; i++) { g.beginPath(); g.arc((i + .5) * TW / 64, Y(.735), 3.4, 0, 7); g.fill(); } glaze.push(cv); }
    /* the cracks across the marbled piece: it is four reasons, so four shards */
    const vcr = [.045, .29, .545, .79].map(u0 => { const n = 5, p = []; for (let i = 0; i <= n; i++) p.push([u0 + (i == 0 || i == n ? 0 : (rnd() - .5) * .05), i / n]); return p; });
    const gold = (g, path, w) => { [['#9C7B43', w + 5], ['#D6B56E', w], ['rgba(255,244,204,.75)', w * .22]].forEach(([c2, lw], i) => { g.strokeStyle = c2; g.lineWidth = lw; g.lineJoin = 'round'; g.lineCap = 'round'; g.beginPath(); path(g, i == 2 ? -w * .22 : 0); g.stroke(); }); };
    const paint = (stage, inside) => {
      const cv = document.createElement('canvas'); cv.width = TW; cv.height = TH; const g = cv.getContext('2d');
      for (let b = 0; b < Math.min(stage, 5); b++) {
        g.save(); g.beginPath(); g.moveTo(X(0), Y(seam(b, 0))); trace(g, b, false); trace(g, b + 1, true); g.closePath(); g.clip();
        if (inside) { g.drawImage(INNER, 0, 0); g.fillStyle = COLS[b] + (b == 4 ? '00' : '2E'); g.fillRect(0, 0, TW, TH); } else g.drawImage(glaze[b], 0, 0);
        g.restore();
      }
      const top = Math.min(stage, 5);
      if (top >= 4) vcr.forEach(p => gold(g, (gg, dy) => p.forEach(([u, t], i) => { const y = Y(seam(3, u) + (seam(4, u) - seam(3, u)) * t); i ? gg.lineTo(X(u) + dy, y) : gg.moveTo(X(u) + dy, y); }), inside ? 11 : 17));
      for (let k = 1; k < top; k++) gold(g, (gg, dy) => { for (let i = 0; i <= 400; i++) { const u = i / 400, y = Y(seam(k, u)) + dy; i ? gg.lineTo(X(u), y) : gg.moveTo(X(u), y); } }, inside ? 12 : 19);
      if (top < 5) { g.strokeStyle = '#7E6E64'; g.lineWidth = 7; g.lineJoin = 'round'; g.beginPath(); for (let i = 0; i <= 400; i++) { const u = i / 400, y = Y(seam(top, u)) + 3; i ? g.lineTo(X(u), y) : g.moveTo(X(u), y); } g.stroke(); }
      return cv;
    };
    const INNER = crayonCanvas('#FBF5EA', TW, TH, 2600);
    return { cum, seam, paint, glaze };
  }
  const cutMat = (cv, side) => { const m = new T.MeshToonMaterial({ color: 0xffffff, map: tex(cv), gradientMap: ramp, alphaTest: .5, side: side || T.FrontSide }); return m; };
  const hullMat = (cv, w) => new T.ShaderMaterial({ side: T.BackSide, uniforms: { w: { value: w }, map: { value: tex(cv) } },
    vertexShader: 'uniform float w; varying vec2 vUv; void main(){ vUv = uv; vec3 p = position + normal * w; gl_Position = projectionMatrix * modelViewMatrix * vec4(p,1.0); }',
    fragmentShader: 'uniform sampler2D map; varying vec2 vUv; void main(){ if (texture2D(map, vUv).a < .5) discard; gl_FragColor = vec4(0.494,0.431,0.392,1.0); }' });
  function kintsugi(o) {
    const root = new T.Group(), stage = o.stage == null ? 5 : o.stage, K = build(o);
    // saucer, as on the old cups
    const sp = [[0, 0], [.4, .0], [.45, .02], [.62, .055], [.64, .07], [.6, .075], [.44, .048], [.2, .04], [0, .04]];
    root.add(inked(lathe(sp), toon(chinaCanvas('#E8857B', { gold: [.86], roses: [.55, 7, 15], roseCol: '#E8857B', dots: [.95, 70] }))));
    root.add(goldRing(.635, .068, .008));
    // a brass spoon resting on the saucer
    { const a = [-.5, .085, .26], b = [-.02, .075, .545]; const sc = new T.CatmullRomCurve3([new T.Vector3(...a), new T.Vector3(-.26, .082, .43), new T.Vector3(...b)]);
      root.add(inked(new T.TubeGeometry(sc, 40, .012, 8), flat('#D6B56E'), .005));
      const bowl = inked(new T.SphereGeometry(.06, 24, 14), flat('#D6B56E'), .005); bowl.scale.set(1.25, .3, .8); bowl.position.set(.07, .078, .575); bowl.rotation.y = -.52; root.add(bowl);
      const dip = new T.Mesh(new T.SphereGeometry(.045, 20, 10), flat('#E9D09A')); dip.scale.set(1.2, .12, .75); dip.position.set(.07, .094, .575); dip.rotation.y = -.52; root.add(dip);
      const end = inked(new T.SphereGeometry(.02, 12, 8), flat('#D6B56E'), .005); end.scale.set(1.3, .6, 1); end.position.set(...a); root.add(end); }
    { const d = new T.Mesh(new T.CircleGeometry(.1, 48), toon(crayonCanvas('#FFFDF9', 128, 128, 60))); d.rotation.x = -Math.PI / 2; d.position.y = .0415; root.add(d); }
    if (stage < 1) return root;
    // the cup wall: outer profile sampled evenly along its length, so v on the texture is distance up the wall
    const Y0 = .15, cps = [[.165, Y0], [.255, .215], [.3, .32], [.325, .45], [.345, .59], [.372, .74]];
    const cur = new T.CatmullRomCurve3(cps.map(([r, y]) => new T.Vector3(r, y, 0))), N = 90, pts = cur.getSpacedPoints(N), TK = .02;
    const rot = Math.PI + (o.az || 0);
    const og = new T.LatheGeometry(pts.map(p => new T.Vector2(p.x, p.y)), 160); og.computeVertexNormals();
    const cv = K.paint(stage, false), cvi = K.paint(stage, true);
    const outer = new T.Group(); outer.add(new T.Mesh(og, cutMat(cv))); outer.add(new T.Mesh(og, hullMat(cv, .011))); outer.rotation.y = rot; root.add(outer);
    const j0 = 9, ip = pts.slice(j0).map(p => new T.Vector2(p.x - TK, p.y)); ip[0].x += .004;
    const ig = new T.LatheGeometry(ip, 160); ig.computeVertexNormals(); const uv = ig.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setY(i, j0 / N + uv.getY(i) * (1 - j0 / N));
    const inner = new T.Mesh(ig, cutMat(cvi, T.DoubleSide)); inner.rotation.y = rot; root.add(inner);
    const floor = new T.Mesh(new T.CircleGeometry(ip[0].x + .002, 64), toon(crayonCanvas('#F4EADB', 256, 256, 200))); floor.rotation.x = -Math.PI / 2; floor.position.y = ip[0].y; root.add(floor);
    // foot, in the bottom piece's glaze
    root.add(inked(lathe([[0, .05], [.165, .05], [.176, .066], [.13, .11], [.165, Y0 + .004]]), toon(crayonCanvas('#FBF5EA', 256, 256, 300)), .009)); root.add(goldRing(.168, .064, .009)); root.add(goldRing(.158, Y0 - .002, .007));
    if (stage >= 4) {   // the handle sits on the marbled piece
      const curve = new T.CatmullRomCurve3([new T.Vector3(.335, .56, 0), new T.Vector3(.52, .6, 0), new T.Vector3(.59, .49, 0), new T.Vector3(.5, .36, 0), new T.Vector3(.305, .375, 0)]);
      root.add(inked(new T.TubeGeometry(curve, 60, .027, 12), flat(GOLD), .008));
      const curl = new T.CatmullRomCurve3([new T.Vector3(.51, .61, 0), new T.Vector3(.6, .65, 0), new T.Vector3(.625, .595, 0), new T.Vector3(.575, .58, 0)]);
      root.add(inked(new T.TubeGeometry(curl, 30, .014, 8), flat(GOLD), .006));
    }
    if (stage >= 5) {   // the lip
      const top = pts[N]; root.add(inked(lathe([[top.x, top.y - .002], [top.x + .004, top.y + .008], [top.x - TK - .004, top.y + .008], [top.x - TK, top.y - .002]]), flat(GOLD), .006));
    }
    if (stage >= 6) {   // tea
      const yT = .705, rT = cur.getPointAt(.95).x - TK - .004;
      const tea = new T.Mesh(new T.CircleGeometry(rT, 72), toon(crayonCanvas('#B87F4E', 256, 256, 300))); tea.rotation.x = -Math.PI / 2; tea.position.y = yT; root.add(tea);
      const ring = new T.Mesh(new T.TorusGeometry(rT * .8, .005, 6, 80), new T.MeshBasicMaterial({ color: 0xE2B98C })); ring.rotation.x = Math.PI / 2; ring.position.y = yT + .002; root.add(ring);
      const ring2 = new T.Mesh(new T.TorusGeometry(rT * .995, .006, 6, 96), new T.MeshBasicMaterial({ color: 0x8A5A36 })); ring2.rotation.x = Math.PI / 2; ring2.position.y = yT + .001; root.add(ring2);
    }
    const marks = {}; for (let b = 0; b < 5; b++) { const v = (K.cum[b] + K.cum[b + 1]) / 2, p = cur.getPointAt(Math.min(1, v)); marks['P' + b] = [p.x * Math.sin(o.az || 0) * 1, p.y, p.x * Math.cos(o.az || 0)]; marks['R' + b] = [p.x, p.y, 0]; marks['L' + b] = [-p.x, p.y, 0]; }
    marks.top = [0, .75, 0]; marks.base = [0, 0, 0]; window.__marks = marks;
    window.__sw = K.glaze.map(c => { const s = document.createElement('canvas'); s.width = 520; s.height = 44; s.getContext('2d').drawImage(c, 300, 400, 780, 66, 0, 0, 520, 44); return s.toDataURL('image/png'); });
    return root;
  }
  window.EXTRA = Object.assign(window.EXTRA || {}, { kintsugi });
})();
