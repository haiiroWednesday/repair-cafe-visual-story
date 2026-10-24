  // ---------------- the essay drives the camera ----------------
  let cur = 'entrance', opened = false, clockOpen = false, drawerT = 0, drawerTo = 0;
  const host = $('scene');
  const NOW = { entrance: 'at the entrance', bench: 'at the workbench', volunteer: 'beside the volunteer', clock: 'inside the clock', final: 'the final object', extras: 'the whole café' };
  // fill photos into the essay from the embedded assets
  document.querySelectorAll('img[data-photo]').forEach(im => { const a = ASSETS.photo[im.dataset.photo]; if (!a) return; im.src = a[0]; im.width = a[1]; im.height = a[2]; if (a[2] > a[1]) im.closest('figure').classList.add('tall'); im.onclick = () => { $('lbImg').src = im.src; $('lb').classList.add('on'); $('lbClose').focus(); }; });
  $('xcards').innerHTML = Object.entries(SUPP).map(([id, s]) => `<button class="xcard" data-x="${id}">${s.photo ? `<img src="${ASSETS.photo[s.photo][0]}" alt="">` : ''}<b>${s.title}</b><span>${s.body}</span></button>`).join('');
  $('xcards').querySelectorAll('.xcard').forEach(b => b.onclick = () => { explore(true); openNote(b.dataset.x); });
  function showView(id) {
    if (id === cur && opened) return; cur = id; $('sceneNow').innerHTML = `<b>Illustrated reconstruction</b> · ${NOW[id] || ''}`;
    if (!opened || exploring) return;
    explodeTo = id === 'bench' && explodeWanted ? 1 : 0;
    flyTo(VIEWS[id === 'extras' ? 'entrance' : id] || VIEWS.entrance);
  }
  let explodeWanted = false;
  const io = new IntersectionObserver(es => { es.forEach(e => { if (e.isIntersecting) showView(e.target.dataset.view); }); }, { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('[data-view]').forEach(el => io.observe(el));
  addEventListener('scroll', () => { const h = document.documentElement; $('progress').style.width = (h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight) * 100) + '%'; }, { passive: true });
  document.querySelectorAll('[data-act]').forEach(b => b.onclick = () => {
    const a = b.dataset.act;
    if (a === 'explode') { explodeWanted = !explodeWanted; explodeTo = explodeWanted ? 1 : 0; b.textContent = explodeWanted ? 'Put the stereo back together' : 'Lift the stereo apart in the café'; if (cur !== 'bench') { cur = ''; showView('bench'); } }
    if (a === 'openclock' || a === 'skipclock') { const d = b.closest('.door'); if (a === 'skipclock' || reduce) d.classList.add('instant'); d.classList.add('open'); d.querySelector('.inside').removeAttribute('aria-hidden'); d.querySelector('.inside').inert = false;
      clockOpen = true; if (a === 'openclock' && !reduce) flyTo(VIEWS.clockOpen, 1.4); d.querySelector('.inside h3, .inside p')?.focus?.(); }
  });
  // ---------------- explore: the café fills the screen; one clear way out ----------------
  let exploring = false, orb = null, drag = null;
  function startOrbit() { const d = camPos.clone().sub(camTgt); orb = { r: d.length(), th: Math.atan2(d.x, d.z), ph: Math.acos(d.y / d.length()) }; orb.th0 = orb.th; orb.r0 = orb.r; }
  canvas.addEventListener('pointerdown', e => { if (!exploring) return; drag = { x: e.clientX, y: e.clientY, th: orb.th, ph: orb.ph }; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', e => { if (!drag) return; orb.th = Math.max(orb.th0 - 1.2, Math.min(orb.th0 + 1.2, drag.th - (e.clientX - drag.x) * .006)); orb.ph = Math.max(.3, Math.min(1.45, drag.ph - (e.clientY - drag.y) * .005)); applyOrbit(); });
  canvas.addEventListener('pointerup', () => drag = null);
  canvas.addEventListener('wheel', e => { if (!exploring) return; e.preventDefault(); orb.r = Math.max(orb.r0 * .45, Math.min(orb.r0 * 1.5, orb.r * (1 + e.deltaY * .001))); applyOrbit(); }, { passive: false });
  function applyOrbit() { camPos.set(camTgt.x + orb.r * Math.sin(orb.ph) * Math.sin(orb.th), camTgt.y + orb.r * Math.cos(orb.ph), camTgt.z + orb.r * Math.sin(orb.ph) * Math.cos(orb.th)); }
  const hotEls = HOT.map(h => { const b = document.createElement('button'); b.className = 'hot'; b.innerHTML = `<i></i><span>${SUPP[h.id].label}</span>`; b.setAttribute('aria-label', 'Note: ' + SUPP[h.id].label); b.onclick = () => openNote(h.id); host.appendChild(b); return b; });
  let lastScroll = 0;
  async function explore(on) {
    if (on === exploring) return;
    exploring = on; host.classList.toggle('full', on); document.body.classList.toggle('lock', on); resize();
    if (on) { lastScroll = scrollY; tween = null; await flyTo(VIEWS.entrance, 1.0); startOrbit(); $('closeExplore').focus(); }
    else { $('note').hidden = true; const v = cur; cur = ''; showView(v || 'entrance'); $('exploreBtn').focus(); }
  }
  function openNote(id) {
    const s = SUPP[id], n = $('note'); n.hidden = false;
    n.innerHTML = `<div class="tag">Extra note</div><h4>${s.title}</h4>${s.photo ? `<img src="${ASSETS.photo[s.photo][0]}" alt="">` : ''}<p>${s.body}</p>${s.photo ? `<p style="font-size:13px;color:var(--soft);font-style:italic">${credit}</p>` : ''}<div class="row">${s.act === 'explode' ? '<button class="btn" data-n="explode">Lift the stereo apart</button>' : ''}${s.act === 'drawer' ? '<button class="btn" data-n="drawer">Open the drawer</button>' : ''}<button class="btn primary" data-n="close">Close note</button></div>`;
    n.querySelectorAll('[data-n]').forEach(b => b.onclick = () => { const a = b.dataset.n; if (a === 'close') n.hidden = true; if (a === 'explode') explodeTo = explodeTo ? 0 : 1; if (a === 'drawer') drawerTo = drawerTo ? 0 : 1; });
    if (s.act === 'drawer') drawerTo = 1; if (s.act === 'explode') explodeTo = 1;
  }
  $('exploreBtn').onclick = () => { if (opened) explore(true); };
  $('closeExplore').onclick = () => explore(false);
  $('lbClose').onclick = () => $('lb').classList.remove('on'); $('lb').onclick = e => { if (e.target.id === 'lb') $('lb').classList.remove('on'); };
  addEventListener('keydown', e => { if (e.key !== 'Escape') return; if ($('lb').classList.contains('on')) $('lb').classList.remove('on'); else if (exploring) explore(false); });

  // ---------------- the opening: the title leaf lifts and the teapot unfolds, on its own ----------------
  const leafC = cnv(1600, 1000, (g, w, h) => {
    g.fillStyle = '#FFFDFA'; g.fillRect(0, 0, w, h); g.strokeStyle = '#B08D57'; g.lineWidth = 4; g.strokeRect(40, 40, w - 80, h - 80); g.lineWidth = 1.5; g.strokeRect(56, 56, w - 112, h - 112);
    g.drawImage(PT.garland(1200, 160), 200, 120);
    g.textAlign = 'center'; g.fillStyle = '#1F2B50'; g.font = 'italic 400 150px "Playfair Display"'; g.fillText('Repair Café', w / 2, h * .56);
    g.font = '400 44px "Playfair Display"'; g.fillStyle = '#B8566A'; g.fillText('Silicon Valley · San José', w / 2, h * .56 + 80);
    g.strokeStyle = 'rgba(31,43,80,.12)'; g.lineWidth = 3; g.beginPath(); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
    grainOver(g, w, h, 2600);
  });
  const leaf = new T.Mesh(new T.PlaneGeometry(BW * 2 - .3, BD - .3), new T.MeshToonMaterial({ map: tex(leafC), gradientMap: ramp, transparent: true }));
  leaf.rotation.x = -Math.PI / 2; leaf.rotation.z = AC; leaf.position.set(0, .34, 0); world.add(leaf);
  pot.scale.set(1, .02, 1); deco.visible = false; pops.forEach(p => p.o.scale.setScalar(.001)); glows.forEach(g => g.visible = false); motes.visible = false; pour.visible = false;
  const lights = [lightA, lightB, lampLight]; const LI = lights.map(l => l.intensity); lights.forEach(l => l.intensity = 0);
  let openStart = null;
  function finishOpen() {
    openStart = null; leaf.visible = false; deco.visible = true; pot.scale.set(1, 1, 1);
    pops.forEach(p => p.o.scale.setScalar(p.s)); glows.forEach(g => g.visible = true); motes.visible = true; pour.visible = true; lights.forEach((l, i) => l.intensity = LI[i]);
    opened = true; const v = cur; cur = ''; showView(v);
  }
  function stepOpen(t) {
    const k = x => Math.max(0, Math.min(1, x));
    const e = ease(k(t / .9)); leaf.position.y = .34 + e * 2.2; leaf.rotation.x = -Math.PI / 2 + e * .9; leaf.material.opacity = 1 - e; leaf.visible = e < 1;
    const u = k((t - .7) / .9); pot.scale.set(1, Math.max(.02, ease(u) + Math.sin(u * Math.PI) * .08), 1);
    pops.forEach(p => { const v = k((t - p.t0) / .5); p.o.scale.setScalar(Math.max(.001, (v <= 0 ? .001 : 1 + Math.sin(v * Math.PI) * .12 * (1 - v) - (1 - ease(v))) * p.s)); });
    const L = k((t - 2.2) / .8); lights.forEach((l, i) => l.intensity = LI[i] * L); glows.forEach(g => g.visible = L > .2); motes.visible = L > .5; pour.visible = L > .6; deco.visible = L > .3;
    if (t > 3.5) finishOpen();
  }
  $('loading').remove();
  camPos.set(...VIEWS.closed.p); camTgt.set(...VIEWS.closed.t);
  if (reduce) finishOpen(); else { openStart = performance.now() + 400; setTimeout(() => flyTo(VIEWS.entrance, 3.4), 400); }

  // ---------------- frame loop ----------------
  const v = new T.Vector3();
  function project(p) { v.copy(p).project(cam); return [(v.x + 1) / 2 * host.clientWidth, (1 - v.y) / 2 * host.clientHeight, v.z < 1]; }
  function resize() { const w = host.clientWidth, h = host.clientHeight; R.setSize(w, h, false); cam.aspect = w / h; cam.clearViewOffset(); cam.updateProjectionMatrix(); }
  addEventListener('resize', resize); new ResizeObserver(resize).observe(host); resize();
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (openStart != null && now >= openStart) stepOpen((now - openStart) / 1000);
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
    if (exploring) { const placed = []; HOT.forEach((h, i) => { const [x, y, ok] = project(wp(h.obj).add(new T.Vector3(...h.off))); const crowd = placed.some(([a, b]) => Math.hypot(a - x, b - y) < 34); const show = ok && !crowd && x > 10 && x < host.clientWidth - 10 && y > 60 && y < host.clientHeight - 20; hotEls[i].style.left = x + 'px'; hotEls[i].style.top = y + 'px'; hotEls[i].style.visibility = show ? 'visible' : 'hidden'; if (show) placed.push([x, y]); }); }
    R.render(scene, cam); requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  window.__dio = { showView, explore, finishOpen, VIEWS, camPos, camTgt, setOpen: () => finishOpen(), T, scene, pot, clock, keep };

  function noGL() { $('noGL').style.display = 'block'; const l = $('loading'); if (l) l.textContent = 'This browser cannot draw the 3D café. The essay reads in full on its own.'; }
})();
