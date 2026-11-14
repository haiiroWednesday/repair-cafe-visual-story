/* The timeline cake as a turntable. Everything on it repeats every 30 degrees, so a short run of frames loops for a full turn.
   Candles, year plaques and the match are drawn on the page, over these frames. */
(function () {
  const T = THREE, N = 12;                       // 12 wedges of 30 degrees
  const wedgeTile = (make, w = 256, h = 256) => { const t = make(w, h), c = document.createElement('canvas'); c.width = w * N; c.height = h; const g = c.getContext('2d'); for (let i = 0; i < N; i++) g.drawImage(t, i * w, 0); return c; };
  function side(base, icing, long, short) {      // one wedge of a tier's side: body colour, icing band and two drips
    return wedgeTile((w, h) => { const c = crayonCanvas(base, w, h, 190), g = c.getContext('2d');
      g.fillStyle = icing; g.fillRect(0, 0, w, 30);
      [[0, long], [w / 2, short]].forEach(([x, L]) => { g.beginPath(); g.moveTo(x + 6, 0); g.lineTo(x + w / 2 - 6, 0); g.lineTo(x + w / 2 - 6, L); g.arc(x + w / 4, L, w / 4 - 6, 0, Math.PI); g.closePath(); g.fill(); });
      g.fillStyle = 'rgba(255,255,255,.35)'; [[0, long], [w / 2, short]].forEach(([x, L]) => { g.beginPath(); g.ellipse(x + w / 4 - 14, L - 6, 7, 16, 0, 0, 7); g.fill(); });
      for (let i = 0; i < 26; i++) { g.strokeStyle = `rgba(120,90,60,${.05 + rnd() * .05})`; g.lineWidth = 1 + rnd() * 1.6; const x = rnd() * w, y = 40 + rnd() * (h - 44), L = 8 + rnd() * 14; g.beginPath(); g.moveTo(x, y); g.lineTo(x + L, y - L * .35); g.stroke(); }
      return c; });
  }
  function lidCanvas(icing, sprinkles) {         // top of a tier, the same in every wedge
    const S = 1024, c = crayonCanvas(icing, S, S, 1500), g = c.getContext('2d');
    if (sprinkles) { const cols = ['#C8553D', '#5F7FC0', '#E0B04A', '#7FB79A', '#D9A9A0'], sp = []; for (let i = 0; i < 5; i++) sp.push([.3 + rnd() * .6, rnd() * (Math.PI * 2 / N), rnd() * 3.1, cols[i % 5]]);
      for (let k = 0; k < N; k++) sp.forEach(([r, a, rot, col]) => { const A = a + k * Math.PI * 2 / N, x = S / 2 + Math.cos(A) * r * S / 2, y = S / 2 + Math.sin(A) * r * S / 2; g.save(); g.translate(x, y); g.rotate(rot + A); g.fillStyle = col; g.beginPath(); g.roundRect(-24, -8.5, 48, 17, 8); g.fill(); g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(-15, -6, 20, 4); g.restore(); }); }
    return c;
  }
  function doilyCanvas() {
    const S = 1024, c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d'), M = 24;
    g.translate(S / 2, S / 2); g.fillStyle = '#FBF8F0';
    g.beginPath(); for (let i = 0; i < M; i++) { const a = i / M * Math.PI * 2; g.moveTo(0, 0); g.arc(Math.cos(a) * 440, Math.sin(a) * 440, 66, 0, 7); } g.fill(); g.beginPath(); g.arc(0, 0, 446, 0, 7); g.fill();
    g.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < M; i++) { const a = i / M * Math.PI * 2; [[440, 22], [392, 9], [470, 8]].forEach(([r, s], j) => { const b = a + (j ? Math.PI / M : 0); g.beginPath(); g.arc(Math.cos(b) * r, Math.sin(b) * r, s, 0, 7); g.fill(); });
      g.save(); g.rotate(a + Math.PI / M); g.beginPath(); g.ellipse(352, 0, 30, 9, 0, 0, 7); g.fill(); g.restore(); }
    g.globalCompositeOperation = 'source-over'; g.strokeStyle = 'rgba(150,120,90,.28)'; g.lineWidth = 2; for (let i = 0; i < M; i++) { const a = i / M * Math.PI * 2; g.beginPath(); g.arc(Math.cos(a) * 440, Math.sin(a) * 440, 66, a - 1.5, a + 1.5); g.stroke(); }
    return c;
  }
  function cake3(o) {
    const root = new T.Group(), spin = new T.Group(); root.add(spin); spin.rotation.y = (o.turn || 0) * Math.PI / 180;
    const D = o.dims, d = new T.Mesh(new T.CircleGeometry(.66, 96), new T.MeshBasicMaterial({ map: tex(doilyCanvas()), transparent: true })); d.rotation.x = -Math.PI / 2; d.position.y = -.034; spin.add(d);
    const board = inked(lathe([[0, -.03], [.5, -.03], [.52, -.016], [.5, 0], [0, 0]]), toon(crayonCanvas('#FFFBF0', 512, 128, 300)), .006); spin.add(board);
    const rim = goldRing(.512, -.014, .009); spin.add(rim);
    const tier = (r, y0, h, cv, lid, lidcol) => {
      const m = inked(new T.CylinderGeometry(r, r, h, 144, 1, true), toon(cv), .006); m.position.y = y0 + h / 2; spin.add(m);
      const l = new T.Mesh(new T.CircleGeometry(r, 144), toon(lid)); l.rotation.x = -Math.PI / 2; l.position.y = y0 + h; spin.add(l);
      [y0 + h, y0 + .012].forEach((y, i) => { const b = new T.Mesh(new T.TorusGeometry(r, i ? .016 : .02, 10, 144), toon(crayonCanvas(lidcol, 128, 128, 80))); b.rotation.x = Math.PI / 2; b.position.y = y; spin.add(b); });
    };
    tier(D.r1, 0, D.y1, side('#F4E4AC', '#B5D6BE', 104, 62), lidCanvas('#B5D6BE', false), '#FFFDF7');
    tier(D.r2, D.y1, D.y2 - D.y1, side('#A9CFB4', '#FFFDF7', 96, 58), lidCanvas('#FFFDF7', true), '#FFFDF7');
    for (let i = 0; i < N; i++) { const a = (i + .5) / N * Math.PI * 2, ch = inked(new T.SphereGeometry(.026, 18, 14), toon(crayonCanvas('#9E2F2C', 64, 64, 30)), .004); ch.position.set(Math.sin(a) * D.rc, D.y1 + .028, Math.cos(a) * D.rc); spin.add(ch);
      const hl = new T.Mesh(new T.SphereGeometry(.007, 8, 6), new T.MeshBasicMaterial({ color: 0xF3C9C2 })); hl.position.set(Math.sin(a) * D.rc - .009, D.y1 + .044, Math.cos(a) * D.rc + .012); spin.add(hl); }
    const marks = {}; (o.probe || []).forEach(([k, x, y, z]) => marks[k] = [x, y, z]); window.__marks = marks;
    return root;
  }
  window.EXTRA = Object.assign(window.EXTRA || {}, { cake3 });
})();
