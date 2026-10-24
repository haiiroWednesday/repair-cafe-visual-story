  // ---------------- dressing the scene: shadows, garden, lamps, string lights, windows, pictures ----------------
  const shTex = tex(PT.shadowBlob());
  function shadowUnder(parent, w, d, y = .004, op = 1) { const m = new T.Mesh(new T.PlaneGeometry(w, d), new T.MeshBasicMaterial({ map: shTex, transparent: true, depthWrite: false, opacity: op })); m.rotation.x = -Math.PI / 2; m.position.y = y; parent.add(m); return m; }
  [[kitchen, 1.9, 1.0], [intake, 1.3, .7], [appl, 1.3, .8], [pass, 1.0, .5], [tea, 1.3, 1.1], [tools, 1.3, .8], [keep, .8, .6], [sew, 1.3, .8], [cart, .7, .5], [supply, .9, .5], [door, 2.4, 1.4], [order, 1.3, .8]].forEach(([o, w, d]) => shadowUnder(o, w, d));
  { const potSh = new T.Mesh(new T.PlaneGeometry(7.2, 4.2), new T.MeshBasicMaterial({ map: shTex, transparent: true, depthWrite: false, opacity: .8 })); potSh.rotation.x = -Math.PI / 2; potSh.position.set(TC.x, BASE + .003, TC.z); world.add(potSh); }
  // the garden on the open pages: painted trees and flowering bushes, with a stepping-stone path to the door
  const garden = new T.Group(); world.add(garden);
  const atW = (az, r) => pol(az, r, 0).add(TC).setY(BASE);
  const trees = [[AC + Math.PI - .55, 3.45, 3.0, 1, 'round'], [AC + Math.PI + .5, 3.6, 2.6, 2, 'blossom'], [AC + Math.PI + 1.25, 3.5, 2.3, 3, 'cone'], [AC + 2.25, 3.55, 2.2, 4, 'blossom'], [AC - 2.0, 3.6, 2.5, 5, 'round'], [AC - 1.55, 3.9, 1.9, 6, 'cone']];
  trees.forEach(([az, r, h, seed, kind], i) => { const t = painted(PT.tree(seed, kind), h, { border: 0, flat: true }); t.position.copy(atW(az, r)); t.rotation.y = AC; garden.add(t); shadowUnder(t, h * .7, h * .3, .006, .7); pop(t, 1.4 + i * .06); });
  [[AC + .62, 3.0, .5, 1], [AC - .62, 3.0, .45, 2], [AC + 1.35, 3.0, .55, 3], [AC - 1.3, 3.05, .5, 4], [AC + .2, 3.55, .4, 5], [AC + Math.PI, 3.1, .5, 6]].forEach(([az, r, h, seed]) => { const b = painted(PT.bush(seed), h, { border: 0, flat: true }); b.position.copy(atW(az, r)); b.rotation.y = AC; garden.add(b); pop(b, 1.9); });
  { const stoneM = new T.MeshToonMaterial({ color: 0xEDE6DA, gradientMap: ramp }); const p0 = atW(AC + .28, 4.6), p1 = atW(AC + .5, 2.45);
    for (let k = 0; k < 7; k++) { const p = p0.clone().lerp(p1, k / 6); const st = inked(new T.CylinderGeometry(.16 + (k % 2) * .03, .17, .03, 18), stoneM, .004); st.position.set(p.x + Math.sin(k * 1.7) * .08, BASE + .015, p.z); st.scale.z = .75; garden.add(st); } }
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
