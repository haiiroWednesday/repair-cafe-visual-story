/* One tall latte glass on a china saucer, filled in layers: each layer a different coffee or tea,
   each as thick as its share of the score. Same house style: crayon textures, toon ramp, ink lines. */
(function () {
  const T = THREE;
  function layerCanvas(base, swirl) {
    const c = crayonCanvas(base, 1024, 256, 900), g = c.getContext('2d');
    if (swirl) { // a chai swirl: milky ribbons through spiced tea
      for (let i = 0; i < 26; i++) { g.strokeStyle = `rgba(240,222,196,${.35 + rnd() * .35})`; g.lineWidth = 6 + rnd() * 12; g.beginPath(); const y = rnd() * 256; g.moveTo(-20, y);
        for (let x = 0; x <= 1060; x += 60) g.quadraticCurveTo(x + 30, y + (rnd() - .5) * 120, x + 60, y + (rnd() - .5) * 60); g.stroke(); }
    }
    // a pale line where this layer meets the one above
    g.fillStyle = 'rgba(255,240,215,.35)'; g.fillRect(0, 0, 1024, 6);
    return c;
  }
  function layerglass(o) {
    const root = new T.Group();
    // china saucer
    const sp = [[0, 0], [.34, .0], [.38, .02], [.52, .05], [.54, .065], [.5, .07], [.37, .045], [.17, .04], [0, .04]];
    root.add(inked(lathe(sp), toon(chinaCanvas('#E8857B', { gold: [.86], roses: [.55, 6, 16], roseCol: '#E8857B', dots: [.95, 60] }))));
    root.add(goldRing(.535, .063, .008));
    // glass: a thick base, then straight slightly flared walls
    const Y0 = .05, YB = .13, YT = 1.02, RB = .19, RT = .245;
    const rAt = y => RB + (RT - RB) * (y - YB) / (YT - YB);
    const cp = [[0, Y0], [RB + .01, Y0], [RB + .015, Y0 + .01], [RB + .012, YB], [RT + .012, YT], [RT, YT + .004], [RT - .01, YT], [rAt(YB) - .01, YB], [0, YB]];
    // the drink, bottom up. o.layers: [{u: units, col, swirl}] listed bottom first; o.foam units on top
    const tot = o.layers.reduce((a, l) => a + l.u, 0) + o.foam, Yfill = YT - .05, k = (Yfill - YB) / tot;
    let y = YB; const marks = {};
    o.layers.forEach((l, i) => {
      const h = l.u * k, r0 = rAt(y) - .004, r1 = rAt(y + h) - .004;
      const m = new T.Mesh(new T.CylinderGeometry(r1, r0, h, 96, 1, true), toon(layerCanvas(l.col, l.swirl)));
      m.position.y = y + h / 2; root.add(m);
      marks['L' + i] = [r0 * .98 * Math.cos(-.15), y + h / 2, r0 * Math.sin(.15)];
      marks['B' + i] = [0, y, 0];
      y += h;
    });
    // foam: a soft white cap with a domed top and cinnamon on it
    const fh = o.foam * k, fr = rAt(y + fh) - .004;
    const fm = new T.Mesh(new T.CylinderGeometry(fr, rAt(y) - .004, fh, 96, 1, true), toon(crayonCanvas('#F6EBDA', 512, 128, 300))); fm.position.y = y + fh / 2; root.add(fm);
    const dc = crayonCanvas('#FBF3E6', 256, 256, 200), dg = dc.getContext('2d'); for (let i = 0; i < 160; i++) { dg.fillStyle = `rgba(150,96,60,${.25 + rnd() * .4})`; dg.beginPath(); dg.arc(128 + (rnd() - .5) * 200, 128 + (rnd() - .5) * 200, 1 + rnd() * 2.2, 0, 7); dg.fill(); }
    const lid = new T.Mesh(new T.CircleGeometry(fr, 64), toon(dc)); lid.rotation.x = -Math.PI / 2; lid.position.y = y + fh + .001; root.add(lid);
    marks.foam = [fr * .9, y + fh * .5, 0]; marks.top = [0, YT, 0]; marks.rimR = [RT, YT, 0];
    // the glass itself: faint, with ink only on the silhouette and the rim
    const gm = new T.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: .2, depthWrite: false });
    const cup = new T.Mesh(lathe(cp), gm); cup.renderOrder = 2; root.add(cup);
    [-1, 1].forEach(sd => { const pts = [[RB + .015, Y0], [RB + .012, YB], [RT + .012, YT]].map(([r, yy]) => new T.Vector3(sd * r, yy, 0)); const L = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 40, .004, 6), new T.MeshBasicMaterial({ color: 0x7E6E64 })); L.userData.billboard = 1; root.add(L); });
    const rim = new T.Mesh(new T.TorusGeometry(RT + .006, .004, 6, 120), new T.MeshBasicMaterial({ color: 0x7E6E64 })); rim.rotation.x = Math.PI / 2; rim.position.y = YT; root.add(rim);
    const base = new T.Mesh(new T.CylinderGeometry(RB + .012, RB + .015, YB - Y0, 64), new T.MeshBasicMaterial({ color: 0xF4EFE7, transparent: true, opacity: .92 })); base.position.y = (Y0 + YB) / 2; root.add(base);
    root.add(goldRing(RT + .008, YT - .03, .007));
    // shine strokes
    [[-.185, .5, .3, .3], [-.16, .86, .3, .08]].forEach(([x, yy, z, h]) => { const sh = new T.Mesh(new T.PlaneGeometry(.012, h), new T.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .45 })); sh.position.set(x, yy, z); sh.rotation.z = .05; root.add(sh); });
    // a long brass spoon leaning in
    const sc = new T.CatmullRomCurve3([new T.Vector3(.05, .5, -.05), new T.Vector3(.2, 1.05, 0), new T.Vector3(.36, 1.42, .02)]);
    root.add(inked(new T.TubeGeometry(sc, 40, .011, 8), flat('#D6B56E'), .004));
    const bowl = new T.Mesh(new T.SphereGeometry(.035, 16, 10), flat('#D6B56E')); bowl.scale.set(1, .4, .7); bowl.position.set(.37, 1.44, .02); root.add(bowl);
    window.__marks = marks;
    return root;
  }
  window.EXTRA = Object.assign(window.EXTRA || {}, { layerglass });
})();
