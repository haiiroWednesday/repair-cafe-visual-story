/* Order Up: sticker graphics for a scrolling visual story. Each board holds die-cut stickers whose position, size,
   tilt and opacity change with the step card in view. All story text is placeholder for the author to replace. */
(async function () {
  const $ = id => document.getElementById(id);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  try { await document.fonts.ready; await document.fonts.load('40px Roffelia'); await document.fonts.load('20px Newsreader'); } catch (e) {}

  // die-cut a painted canvas with a white paper margin, return a data URL
  const cnv = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); return c; };
  function diecut(src, b = 9) {
    const w = src.width + b * 4, h = src.height + b * 4;
    const sil = cnv(w, h, g => { g.drawImage(src, b * 2, b * 2); g.globalCompositeOperation = 'source-in'; g.fillStyle = '#FFFDF8'; g.fillRect(0, 0, w, h); });
    return cnv(w, h, g => { for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; g.drawImage(sil, Math.cos(a) * b, Math.sin(a) * b); } g.drawImage(src, b * 2, b * 2); }).toDataURL('image/webp', .9);
  }
  const PAINT = {
    heart: diecut(PT.heartClock()), lampP: diecut(PT.candelabra()), drink: diecut(PT.drink()), pudding: diecut(PT.pudding()), parfait: diecut(PT.parfait()), cloche: diecut(PT.cloche()),
    menu: diecut(PT.menuBoard('Today’s menu', ['Lamps', 'Toasters', 'Zippers', 'Radios', 'Clocks', 'Anything else?']), 7)
  };
  const ticketURL = n => diecut(PT.ticket(String(n).padStart(3, '0'), ['#F2C4CC', '#CFE6DA', '#F6E6A8', '#D9E8F2', '#E2D6F3'][n % 5]), 5);
  const src = k => PAINT[k] || (ASSETS.standee[k] && ASSETS.standee[k][0]) || (ASSETS.tex[k] && ASSETS.tex[k][0]);
  let seed = 3; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  function sticker(parent, k, cls) { const im = document.createElement('img'); im.className = 'stk' + (cls ? ' ' + cls : ''); if (k) im.src = src(k); im.alt = ''; im.draggable = false; parent.appendChild(im); return im; }
  // a state is [x%, y%, width%, tilt°, opacity]; a missing entry keeps the last one
  function place(im, s) { if (!s) return; const [x, y, w, r, o] = s; im.style.left = x + '%'; im.style.top = y + '%'; im.style.width = w + '%'; im.style.setProperty('--r', (r || 0) + 'deg'); im.style.opacity = o ?? 1; }
  function board(id, items, extra) {
    const b = $(id), els = items.map(it => { const im = it.el || sticker(b, it.k, it.cls); if (it.z) im.style.zIndex = it.z; return { it, im }; });
    const show = n => { els.forEach(({ it, im }) => { let s = null; for (let i = Math.min(n, it.s.length - 1); i >= 0; i--) if (it.s[i]) { s = it.s[i]; break; } place(im, s); }); if (extra) extra(n); };
    show(0);
    const steps = b.closest('.scrolly').querySelectorAll('.step');
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) show(+e.target.dataset.step); }), { rootMargin: '-40% 0px -45% 0px' });
    steps.forEach(s => io.observe(s));
    return { show };
  }

  // ---------------- hero: a sticker sheet around the pavement menu; tapping a sticker places an order ----------------
  { const sh = $('heroSheet'); let n = 0;
    const H = [['menu', 50, 46, 30, -3], ['pot3', 17, 24, 18, -8], ['cakewhole', 82, 20, 15, 7], ['drink', 86, 58, 10, 9], ['pudding', 70, 82, 12, -5], ['heart', 18, 66, 20, 6],
      ['lampP', 33, 80, 11, -4], ['radio', 72, 36, 13, 5], ['clock', 30, 50, 10, -10], ['spools', 60, 12, 11, 4], ['tomato', 12, 88, 9, 10], ['stereo', 52, 86, 15, -2]];
    H.forEach(([k, x, y, w, r]) => { const im = sticker(sh, k, k === 'menu' ? '' : 'tap'); place(im, [x, y, w, r, 1]);
      if (k !== 'menu') { im.setAttribute('role', 'button'); im.tabIndex = 0; im.alt = 'Place an order: ' + k; const order = () => { n++; const t = sticker(sh, null); t.src = ticketURL(n); t.style.zIndex = 5; place(t, [x + w * .32, y - w * .25, 4.6, (rnd() - .5) * 30, 1]); if (!reduce) t.animate([{ transform: 'translate(-50%,-90%) rotate(0deg) scale(.6)', opacity: 0 }, { transform: `translate(-50%,-50%) rotate(${(rnd() - .5) * 30}deg) scale(1)`, opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.3,1.4,.6,1)' }); $('orderCount').textContent = `Order No. ${String(n).padStart(3, '0')}`; };
        im.onclick = order; im.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); order(); } }; } }); }

  // ---------------- graphic 1: taking orders. Things arrive, get tickets, and are sorted onto stations ----------------
  { const things = ['lamp', 'fan', 'blender', 'radio', 'clock', 'laptop', 'coffeemaker', 'trousers', 'vacuum', 'printer', 'stereo'];
    const station = { blender: 0, coffeemaker: 0, vacuum: 0, fan: 0, radio: 1, stereo: 1, lamp: 1, clock: 2, laptop: 3, printer: 3, trousers: 4 };
    const colX = [12, 31, 50, 69, 88], used = [0, 0, 0, 0, 0];
    const items = [];
    things.forEach((k, i) => { const c = station[k], row = used[c]++; const pile = [16 + rnd() * 68, 62 + rnd() * 26, 11, (rnd() - .5) * 40, 1];
      const line = [6 + i * 8.8, 62, 8.4, (rnd() - .5) * 8, 1]; const sorted = [colX[c] + (row % 2 ? 4.5 : -4.5), 46 + row * 13.5, 8.6, (rnd() - .5) * 10, 1];
      const focus = k === 'stereo' ? [50, 60, 26, -2, 1] : [sorted[0], sorted[1], 7.2, sorted[3], .2];
      items.push({ k, s: [pile, line, sorted, focus] });
      const t = { k: null, z: 4, s: [[pile[0], pile[1] - 4, 3.6, 0, 0], [line[0] + 1.5, 40, 3.6, (rnd() - .5) * 14, 1], [8 + i * 7.8, 17, 3.4, (rnd() - .5) * 10, 1], null] };
      t.el = (() => { const im = document.createElement('img'); im.className = 'stk'; im.src = ticketURL(11 + i * 3); $('bOrders').appendChild(im); return im; })();
      items.push(t); });
    const heads = [...document.querySelectorAll('#bOrders .colhead')];
    board('bOrders', items, n => { heads.forEach(h => h.style.opacity = n >= 2 ? (n === 3 && h.dataset.c !== '1' ? .3 : 1) : 0); $('bOrders').querySelector('.rail').style.opacity = n >= 2 ? 1 : .35; }); }

  // ---------------- graphic 2: the workbench, laid like a place setting ----------------
  { const tools = [['iron', 13, 28, 12, -28], ['meter', 13, 63, 9, 6], ['drivers', 26, 86, 11, -4], ['pliers', 87, 28, 10, 18], ['cutters', 87, 60, 9, -12], ['tweezers', 76, 86, 9, 30],
      ['fluxpen', 36, 13, 8, 70], ['braid', 50, 12, 7, 0], ['magnifier', 64, 13, 9, -14], ['wire', 40, 88, 7, 0], ['screws', 60, 88, 6, 0]];
    const items = tools.map(([k, x, y, w, r]) => ({ k, s: [[x + (x < 50 ? -6 : 6), y, w, r, 0], [x, y, w, r, 1], [x, y, w, r, .3], [x, y, w, r, .3]] }));
    items.push({ k: 'stereo', z: 3, s: [[50, 50, 26, -1, 1], [50, 50, 24, -1, 1], [50, 50, 24, -1, 0], [34, 50, 22, -2, 1]] });
    items.push({ k: 'stereoX', z: 3, s: [[50, 50, 30, 0, 0], null, [50, 50, 44, 0, 1], [50, 50, 30, 0, 0]] });
    const ph = document.createElement('div'); ph.className = 'stk polaroid'; ph.style.width = '30%'; ph.innerHTML = `<img src="${ASSETS.photo.hands[0]}" alt="Alt text placeholder" style="width:100%;height:auto;display:block">`; $('bBench').appendChild(ph);
    items.push({ el: ph, z: 4, s: [[74, 48, 30, 4, 0], null, null, [72, 48, 34, 3, 1]] });
    board('bBench', items); }

  // ---------------- graphic 3: the clock, as Jazz told it (a reconstruction) ----------------
  { const circ = $('bClock').querySelector('.circle'), tag = $('bClock').querySelector('.ctag'), cimg = circ.querySelector('img');
    const views = [null, ['chainOff', 'Chains off the cogwheels'], ['chainFed', 'Fed back on'], ['chain3', 'Tied for the trip'], null];
    const ph = document.createElement('div'); ph.className = 'stk polaroid'; ph.style.width = '26%'; ph.innerHTML = `<img src="${ASSETS.photo.clock[0]}" alt="Alt text placeholder" style="width:100%;height:auto;display:block">`; $('bClock').appendChild(ph);
    board('bClock', [{ k: 'cuckoo', s: [[36, 54, 34, -2, 1], [30, 54, 30, -2, 1], null, null, [30, 54, 30, -2, 1]] }, { el: ph, z: 5, s: [[74, 52, 26, 3, 0], null, null, null, [74, 52, 27, 3, 1]] }], n => {
      const v = views[n]; circ.style.opacity = v ? 1 : 0; tag.style.opacity = v ? 1 : 0; circ.style.transform = v ? 'scale(1)' : 'scale(.85)';
      if (v) { cimg.style.opacity = 0; setTimeout(() => { cimg.src = src(v[0]); cimg.style.opacity = 1; }, reduce ? 0 : 200); tag.textContent = v[1]; } }); }

  // ---------------- graphic 4: order up ----------------
  { const back = [['lamp', 10, 70], ['clock', 22, 70], ['radio', 78, 70], ['trousers', 90, 70], ['fan', 66, 70], ['blender', 34, 70]];
    const items = back.map(([k, x, y], i) => ({ k, s: [[x, 120, 8, 0, 0], [x, y, 8, (i % 2 ? 4 : -4), 1], [x, y, 8, (i % 2 ? 4 : -4), .5]] }));
    items.push({ k: 'cloche', z: 2, s: [[50, 54, 26, 0, 1], [50, 54, 22, 0, 1], [50, 56, 22, 0, 1]] });
    items.push({ k: 'fixboard', z: 3, s: [[84, -40, 16, 0, 0], null, [84, 30, 15, 3, 1]] });
    const stamps = [...$('bOrder').querySelectorAll('.stampOn')];
    board('bOrder', items, n => { stamps.forEach(s => s.style.opacity = n >= 1 ? 1 : 0); $('bOrder').querySelector('.slotglass').style.opacity = n === 0 ? 1 : .7; }); }

  // ---------------- the sticker book ----------------
  document.querySelectorAll('.pg .grid').forEach(g => { g.querySelectorAll('figure').forEach(f => { const k = f.dataset.k; const im = f.querySelector('img'); im.src = src(k); im.style.setProperty('--r', ((rnd() - .5) * 14) + 'deg'); }); });
  // photos in prose open larger
  document.querySelectorAll('img[data-photo]').forEach(im => { const a = ASSETS.photo[im.dataset.photo]; im.src = a[0]; im.width = a[1]; im.height = a[2]; im.style.cursor = 'zoom-in'; im.onclick = () => { $('lbImg').src = im.src; $('lb').classList.add('on'); $('lbClose').focus(); }; });
  document.querySelectorAll('img[data-stk]').forEach(im => { im.src = src(im.dataset.stk); });
  $('lbClose').onclick = () => $('lb').classList.remove('on'); $('lb').onclick = e => { if (e.target.id === 'lb') $('lb').classList.remove('on'); };
  addEventListener('keydown', e => { if (e.key === 'Escape') $('lb').classList.remove('on'); });
  window.__ok = true;
})();
