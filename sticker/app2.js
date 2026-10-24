/* Order Up, second edition. A scrolling visual story set in a patisserie: a cartouche title over a flat-lay,
   prose with each photograph in its own café frame, and five sticky sets (pastry case, place setting, papered wall,
   velvet tray, counter) whose stickers move as the menu cards scroll by. All story text is placeholder. */
(async function () {
  const $ = id => document.getElementById(id);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  try { await document.fonts.ready; await document.fonts.load('40px Roffelia'); await document.fonts.load('20px Newsreader'); } catch (e) {}

  // ---------- stickers ----------
  const cnv = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); return c; };
  function diecut(src, b = 9) {
    const w = src.width + b * 4, h = src.height + b * 4;
    const sil = cnv(w, h, g => { g.drawImage(src, b * 2, b * 2); g.globalCompositeOperation = 'source-in'; g.fillStyle = '#FFFDF8'; g.fillRect(0, 0, w, h); });
    return [cnv(w, h, g => { for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; g.drawImage(sil, Math.cos(a) * b, Math.sin(a) * b); } g.drawImage(src, b * 2, b * 2); }).toDataURL('image/webp', .9), w, h];
  }
  const PAINT = { pudding: diecut(PT.pudding()), parfait: diecut(PT.parfait()), cloche: diecut(PT.cloche()),
    menu: diecut(PT.menuBoard('Today’s menu', ['Lamps', 'Toasters', 'Zippers', 'Radios', 'Clocks', 'Anything else?']), 7) };
  const ALIAS = { heart: 'heartclock', lampP: 'candelabra' };
  const rec = k => PAINT[k] || ASSETS.standee[ALIAS[k] || k] || ASSETS.tex[k];
  const src = k => { const r = rec(k); return r ? (Array.isArray(r) ? r[0] : r) : ''; };
  const ar = k => { const r = rec(k); return r && Array.isArray(r) && r[1] ? r[2] / r[1] : 1; };
  const ticketURL = n => diecut(PT.ticket(String(n).padStart(3, '0'), ['#F2C4CC', '#CFE6DA', '#F6E6A8', '#D9E8F2', '#E2D6F3'][n % 5]), 5)[0];
  let seed = 5; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  // ---------- text helpers ----------
  const PH = t => `<span class="ph">${t}</span>`;
  const CREDIT = 'Photo: the author, Repair Café Silicon Valley, Billy DeFrank Center, San José, October 18, 2026.';
  const prose = (ps, o = {}) => `<section class="prose">${o.aside ? `<div class="aside" style="${o.aside[1]}"><img data-stk="${o.aside[0]}" alt=""><span>${o.aside[2] || ''}</span></div>` : ''}`
    + (o.kicker ? `<div class="lab c">${o.kicker}</div>` : '') + (o.h2 ? `<h2>${PH(o.h2)}</h2>` : '')
    + ps.map((p, i) => `<p${o.lede && !i ? ' class="lede"' : ''}>${PH(p)}</p>`).join('') + (o.extra || '') + '</section>';
  const FLO1 = FR.corners();
  const card = (i, c) => `<div class="step${i % 2 ? ' right' : ''}" data-step="${i}"><div class="card">${FLO1}${c.lab ? `<div class="lab">${c.lab}</div>` : ''}${c.h ? `<h3>${c.h}</h3>` : ''}<p>${PH(c.p)}</p>${c.note ? `<p class="note">${c.note}</p>` : ''}</div></div>`;
  const scrolly = (id, label, furniture, cards) => `<section class="scrolly" aria-label="${label}"><div class="stage"><div class="board" id="${id}">${furniture}</div></div><div class="steps">${cards.map((c, i) => card(i, c)).join('')}</div></section>`;
  const orn = `<svg class="orn" viewBox="0 0 420 24" aria-hidden="true"><path d="M10 12 H180 M240 12 H410" stroke="currentColor" stroke-width="1"/><path d="M210 3 q8 9 0 18 q-8 -9 0 -18z M190 12 q-6 -6 -12 0 q6 6 12 0z M230 12 q6 -6 12 0 q-6 6 -12 0z" fill="currentColor"/></svg>`;

  // a strip of painted flowers for the window box under the arched frame
  const FLOWERS = cnv(600, 120, g => { for (let i = 0; i < 80; i++) { const x = rnd() * 600, y = 62 + rnd() * 50; g.fillStyle = ['#7FB08A', '#94C29C', '#6A9E78'][i % 3]; g.beginPath(); g.ellipse(x, y, 15, 6, rnd() * 3, 0, 7); g.fill(); }
    for (let i = 0; i < 48; i++) { const x = 12 + rnd() * 576, y = 26 + rnd() * 52, r = 7 + rnd() * 8, c = ['#F2C4CC', '#FFFDFA', '#F6D6A8', '#E9A3B1', '#CFE0F2'][i % 5];
      for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; g.fillStyle = c; g.beginPath(); g.arc(x + Math.cos(a) * r * .6, y + Math.sin(a) * r * .6, r * .55, 0, 7); g.fill(); g.strokeStyle = 'rgba(94,84,80,.45)'; g.lineWidth = 1; g.stroke(); }
      g.fillStyle = '#E6B54A'; g.beginPath(); g.arc(x, y, r * .28, 0, 7); g.fill(); } }).toDataURL('image/webp', .9);

  // ---------- the page ----------
  const B = [];
  // hero: a centred cartouche, then a flat-lay of the day in the manner of a magazine spread
  const FL = [['heartclock', 'heart clock', 'big', -3], ['candelabra', 'brass lamp', 'tall', 4], ['pot3', 'teapot', '', -6], ['spools', 'thread', '', 8], ['stereo', 'stereo', '', -2], ['tomato', 'pincushion', '', 10],
    ['cakewhole', 'cake', '', 3], ['magnifier', 'magnifier', '', -12], ['scissors', 'scissors', '', 14], ['macaron', 'macaron', '', -4], ['ribbons', 'ribbons', '', 6], ['cup', 'teacup', '', 5], ['cuckoo', 'cuckoo clock', 'tall', -3]];
  B.push(`<header class="hero wrap">${FR.feature('feature', PH('Caption placeholder for the feature photograph.'), CREDIT)}<div class="cart">${FLO1}<div class="lab">A visual story · Repair Café Silicon Valley</div><h1>${PH('Headline placeholder')}</h1>${orn}
    <p class="dek">${PH('Dek placeholder: one sentence on what the reader will learn.')}</p><div class="byline lab"><span>${PH('By author')}</span><span>October 18, 2026</span><span>San José</span></div></div>
    <div class="flatlay"><div class="grid">${FL.map(([k, n, cls, r]) => `<figure class="${cls}" style="--r:${r}deg"><img data-stk="${k}" alt="${n}"><figcaption>${n}</figcaption></figure>`).join('')}</div><span class="sig">${PH('Flat-lay caption placeholder')}</span></div>
    <a class="scrollcue lab" href="#start">Begin reading ↓</a></header>`);
  B.push('<div id="start"></div>' + prose(['Lede placeholder: open on the room, the line at the door, the first thing you noticed.', 'Paragraph placeholder: what a repair café is, in one or two plain sentences.', 'Paragraph placeholder: why this one, on this Sunday.'],
    { lede: true, aside: ['pot3', 'left:-190px;top:70px;--r:-8deg', 'the teapot'], extra: FR.gilt('entrance', PH('Caption placeholder for the opening photograph.'), CREDIT, 'Billy DeFrank Center', 760) }));

  // graphic 1: the pastry case. Things arrive, get tickets, go onto shelves by station
  const STN = ['Appliances', 'Electronics', 'Clocks', 'Computers', 'Sewing'], COLX = [17, 33.5, 50, 66.5, 83];
  B.push(scrolly('bOrders', 'Graphic: taking orders', `<div class="case"><div class="crown"><span>Today’s orders</span></div><div class="val"></div><div class="glare"></div></div>
    <div class="rail" style="top:21%"></div><div class="shelf" style="top:48%"></div><div class="shelf" style="top:86%"></div>`
    + STN.map((n, i) => `<span class="plaque" style="left:${COLX[i]}%;top:50%">${n}</span>`).join(''), [
    { lab: 'At the door', h: 'Taking orders', p: 'Card placeholder: things arrive at the door, in bags and boxes and arms.' },
    { lab: 'Check-in', p: 'Card placeholder: each one gets a numbered ticket.' },
    { lab: 'The case', p: 'Card placeholder: tickets go up and each thing goes to its station.', note: 'Station names are illustrative. Check them against the real check-in board.' },
    { lab: 'Your order', p: 'Card placeholder: follow two orders, the stereo and the heart clock.' }]));
  B.push(prose(['Paragraph placeholder: the stereo and its owner, what it does and what stopped working.', 'Paragraph placeholder: who sat down to fix it.'],
    { kicker: 'Order No. 1', h2: 'Section heading placeholder', aside: ['spools', 'right:-170px;top:90px;--r:10deg', 'thread'] }));

  // graphic 2: the workbench as a place setting
  B.push(scrolly('bBench', 'Graphic: the workbench', `<div class="cloth"></div><div class="lace" style="top:3%"></div><div class="lace" style="bottom:3%;transform:scaleY(-1)"></div><div class="charger"></div>
    <div class="placecard"><b>Table for one</b><span>ELECTRONICS</span></div>`, [
    { lab: 'Served', h: 'At the workbench', p: 'Card placeholder: the stereo on the plate.' },
    { lab: 'The setting', p: 'Card placeholder: the tools laid out around it, like cutlery.' },
    { lab: 'Opened', p: 'Card placeholder: lifted apart, the stereo is layers and one hand-wired cable.', note: 'Exploded view drawn from the author’s photos.' },
    { lab: 'From the bench', p: 'Card placeholder: the photograph from the bench.', note: CREDIT }]));
  B.push(prose(['Paragraph placeholder: the volunteer, in their own words.', 'Paragraph placeholder: why they keep coming back.'],
    { kicker: 'The fixers', h2: 'Section heading placeholder', extra: FR.mat('volunteer', PH('Caption placeholder for the volunteer photograph.'), CREDIT, 560)
      + `<div class="pull">${FLO1}<p>${PH('Pull quote placeholder from the interview.')}</p><span class="lab">${PH('Name, role')}</span></div>` }));

  // graphic 3: the cuckoo clock, a reconstruction, on a papered wall
  B.push(scrolly('bClock', 'Graphic: the cuckoo clock, a reconstruction', `<div class="wallp"></div><img class="garland" data-paint="garland" alt=""><div class="panel">${FLO1}</div>
    <span class="stamp reconTag" style="--c:var(--ink);--r:-3deg">Reconstruction · told by Jazz</span>
    <div class="medal" style="left:55%;top:20%;width:31%;aspect-ratio:1;opacity:0"><div class="in"><img alt=""></div></div><span class="ribbon" style="left:70.5%;top:84%;opacity:0"></span>`, [
    { lab: 'A story from Jazz', h: 'Inside the clock', p: 'Card placeholder: the clock and whose it was.', note: 'Told by Jazz, about a repair at an earlier event.' },
    { lab: 'What was wrong', p: 'Card placeholder: what was wrong.' },
    { lab: 'The fix', p: 'Card placeholder: how it was put right.' },
    { lab: 'Going home', p: 'Card placeholder: getting it home safely.' },
    { lab: 'Afterward', p: 'Card placeholder: the photograph, and what happened next.', note: 'Photo: [credit].' }]));
  B.push(`<section class="cfwrap wrap"><div class="lab c">Try the repair</div><h2>${PH('Heading placeholder for the interactive clock')}</h2><p class="note">Press the buttons in order. Educational reconstruction.</p><div class="cfcard"><iframe class="cf" title="Interactive cuckoo clock: feed the chains, wind it, set it going, tie it for the trip"></iframe></div></section>`);
  const pair = `<div class="pair">${FLO1}<img data-stk="dollBent" alt="The pull-string spring, bent"><span class="arrow">→</span><img data-stk="doll3" alt="The spring, straightened"><div class="cap lab"><span>Bent</span><span>Straightened</span></div></div>`;
  B.push(prose(['Paragraph placeholder: the second story Jazz told, the pull-string toy.', 'Paragraph placeholder: what it meant to the person who brought it.'], { kicker: 'Also told by Jazz', h2: 'Section heading placeholder', extra: pair }));
  B.push(prose(['Paragraph placeholder: the heart clock, who brought it, and what stopped working.', 'Paragraph placeholder: the fixer who took it apart.'],
    { kicker: 'Order No. 2', h2: 'Section heading placeholder', aside: ['candelabra', 'left:-190px;top:40px;--r:-5deg', 'brass lamp'],
      extra: FR.stamp('heart', PH('Caption placeholder for the heart clock photograph.'), CREDIT, '№ 2') }));

  // graphic 4: the heart clock on a velvet tray, whole and then in parts, at true scale
  B.push(scrolly('bHeart', 'Graphic: the heart clock and its parts', `<div class="velvet"></div><div class="trayBox"><img class="tray" data-tex="heartTray" alt="The heart clock's parts laid out flat: heart frame, chapter ring, glass lens, hands, second hand, quartz movement with its battery" style="opacity:0">
    <div class="labels"></div><div class="loupe" style="opacity:0"><div class="lz"></div></div></div><span class="plaque scaleNote" style="left:50%;top:93%">Drawn to scale from the author’s photos</span>`, [
    { lab: 'On the tray', h: 'The heart clock', p: 'Card placeholder: the clock as it arrived.' },
    { lab: 'In parts', p: 'Card placeholder: what came off and in what order.', note: 'Laid out from the author’s two photographs of the table.' },
    { lab: 'Up close', p: 'Card placeholder: the small parts, the hands and the movement.' },
    { lab: 'In her hands', p: 'Card placeholder: the photograph of the owner holding the hands.', note: CREDIT }]));
  B.push(prose(['Paragraph placeholder: what happened with the heart clock.', 'Paragraph placeholder: the rest of the afternoon.'], { h2: 'Section heading placeholder', aside: ['tomato', 'right:-160px;top:60px;--r:8deg', 'pincushion'] }));

  // graphic 5: the counter. Orders go back out, the tally prints, the board goes up
  B.push(scrolly('bOrder', 'Graphic: order up', `<div class="backwall"></div><img class="garland" data-paint="garland" alt="" style="top:3%"><div class="counterTop"></div>
    <div class="receipt" style="opacity:0"><h4>Today</h4><div class="ln"><span>Fixed</span><span></span><span>[n]</span></div><div class="ln"><span>Partly fixed</span><span></span><span>[n]</span></div><div class="ln"><span>Not fixed</span><span></span><span>[n]</span></div><div class="ln tot"><span>Orders</span><span></span><span>[n]</span></div></div>`, [
    { lab: 'Pickup', h: 'Order up', p: 'Card placeholder: things go back to their owners.' },
    { lab: 'The tally', p: 'Card placeholder: how the day went, in numbers.', note: 'Counts are placeholders until you add the real tally.' },
    { lab: 'By the door', p: 'Card placeholder: the board by the door.' }]));
  B.push(prose(['Closing paragraph placeholder.', 'Last line placeholder.'], { h2: 'Section heading placeholder', extra: FR.ticket('final', PH('Caption placeholder for the closing photograph.'), CREDIT, 'Order up · picked up') }));

  // sticker album
  const NAMES = { killawatt: 'plug-in meter', psu: 'power supply', led: 'LED board', caps: 'capacitors', strain: 'strain reliefs', crimps: 'crimp terminals', fluxpen: 'flux pen', braid: 'solder braid', wool: 'tip cleaner',
    worklight: 'work light', tester: 'outlet tester', mat: 'repair mat', socket3: 'lamp socket', stereoX: 'stereo, apart', ultrasonic: 'ultrasonic cleaner', mixerparts: 'mixer parts', coffeemaker: 'coffee maker',
    chain3: 'chains, tied', chainOff: 'chains, off', chainFed: 'chains, fed', cuckoo: 'cuckoo clock', doll3: 'toy spring, fixed', dollBent: 'toy spring, bent', innovis: 'Brother Innov-is', bernina: 'Bernina',
    sewingmachine: 'sewing machine', needle3: 'needle', needleBack: 'needle eye', feltbook: 'needle book', tomato: 'pincushion', tapemeasure: 'tape measure', zipkit: 'zipper kit', zippliers: 'zipper pliers',
    slider3: 'zipper slider', sliderSpread: 'slider, spread', ripper: 'seam ripper', biastape: 'bias tape', fraycheck: 'Fray Check', jumprings: 'jump rings', pot3: 'teapot', cakewhole: 'cake', cakeslice: 'slice',
    cakemissing: 'cake, cut', sugarbowl: 'sugar bowl', spike: 'ticket spike', vase2: 'vase', stand: 'tiered stand', heartclock: 'heart clock', heartX: 'heart clock, apart', candelabra: 'brass lamp', cloche: 'cloche', menu: 'menu board' };
  const PAGES = [['The workbench', 'iron wool braid flux fluxpen meter cutters pliers drivers mat worklight tester killawatt strain caps crimps fuses zipties psu led wire tweezers screws magnifier loupe ultrasonic toolbox socket3 stereo stereoX'],
    ['Appliances and keepsakes', 'lamp fan blender clock laptop coffeemaker vacuum printer radio bike plug switch bulbs belts mixerparts sandpaper lube glue vinegar wipes dowels tape string knife brush awl glasses caution cuckoo chainOff chainFed chain3 dollBent doll3 heartclock heartX candelabra'],
    ['The sewing table', 'machine bernina innovis sewingmachine needles needle3 needleBack feltbook tomato tapemeasure spools bobbins zipkit zippliers slider3 sliderSpread ripper scissors biastape bag velcro ribbons webbing buttons hooks fraycheck pins thimble jumprings clasps earrings beads trousers coat tin'],
    ['The café', 'cup teapot pot3 plate fork spoon napkin bow cherry cakeslice cakewhole cakemissing crumbs macaron sugarbowl spike creamer croissant coffee cake stand vase vase2 pudding parfait cloche menu']];
  B.push(`<section class="album"><div class="wrap"><div class="lab c">Sticker album</div><h2>Everything on the tables</h2><p>Every tool, part and plate drawn for this story, grouped by where it sat.</p><div class="pages">`
    + PAGES.map(([t, ks]) => `<div class="pg"><h3>${t}</h3><div class="grid">${ks.split(' ').filter(k => rec(k)).map(k => `<figure><img data-stk="${k}" alt="" style="--r:${((rnd() - .5) * 14).toFixed(1)}deg"><figcaption>${NAMES[k] || k}</figcaption></figure>`).join('')}</div></div>`).join('')
    + `</div></div></section><footer class="end wrap">${orn}${PH('Sources and credits placeholder: interviews, photographs, data.')}<br>Drawings, renders and stickers: ${PH('credit')}. Reconstructions are marked.</footer>`);
  $('root').innerHTML = B.join('\n');

  // fill images
  document.querySelectorAll('img[data-stk]').forEach(im => { im.src = src(im.dataset.stk); });
  document.querySelectorAll('img[data-tex]').forEach(im => { const t = ASSETS.tex[im.dataset.tex]; im.src = Array.isArray(t) ? t[0] : t; });
  document.querySelectorAll('img[data-paint]').forEach(im => { im.src = PT[im.dataset.paint]().toDataURL('image/webp', .9); });
  document.querySelectorAll('img[data-photo]').forEach(im => { const a = ASSETS.photo[im.dataset.photo]; im.src = a[0]; im.width = a[1]; im.height = a[2]; });

  // ---------- the board engine: a state is [x%, y%, width%, tilt°, opacity, sit?]; null keeps the previous ----------
  function sticker(parent, k, cls) { const im = document.createElement('img'); im.className = 'stk' + (cls ? ' ' + cls : ''); if (k) im.src = src(k); im.alt = ''; im.draggable = false; parent.appendChild(im); return im; }
  function frameStk(parent, html, cls) { const d = document.createElement('div'); d.className = 'stk fstk ' + (cls || ''); d.innerHTML = html; parent.appendChild(d); d.querySelectorAll('img[data-photo]').forEach(im => { const a = ASSETS.photo[im.dataset.photo]; im.src = a[0]; }); return d; }
  function board(id, items, extra) {
    const b = $(id); let cur = 0;
    const els = items.map(it => { const im = it.el || sticker(b, it.k, it.cls); if (it.z) im.style.zIndex = it.z; return { it, im }; });
    const place = (it, im, s) => { if (!s) return; let [x, y, w, r, o, sit] = s;
      if (sit) { const ratio = b.clientHeight / b.clientWidth || .66; y = y - w * ar(it.k) / ratio / 2; }
      im.style.left = x + '%'; im.style.top = y + '%'; im.style.width = w + '%'; im.style.setProperty('--r', (r || 0) + 'deg'); im.style.opacity = o ?? 1; };
    const show = n => { cur = n; els.forEach(({ it, im }) => { let s = null; for (let i = Math.min(n, it.s.length - 1); i >= 0; i--) if (it.s[i]) { s = it.s[i]; break; } place(it, im, s); }); if (extra) extra(n); };
    show(0);
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) show(+e.target.dataset.step); }), { rootMargin: innerWidth < 760 ? '-60% 0px -24% 0px' : '-40% 0px -45% 0px' });
    b.closest('.scrolly').querySelectorAll('.step').forEach(s => io.observe(s));
    addEventListener('resize', () => show(cur));
    return { show };
  }

  // graphic 1
  { const b = $('bOrders'), ratio = () => (b.clientHeight / b.clientWidth) || .66;
    const LAY = [['lamp', 0, 0, -1], ['fan', 0, 0, 1], ['radio', 1, 0, 0], ['clock', 2, 0, 0], ['laptop', 3, 0, 0], ['trousers', 4, 0, 0],
      ['blender', 0, 1, -1], ['coffeemaker', 0, 1, 1], ['stereo', 1, 1, 0], ['heartclock', 2, 1, 0], ['printer', 3, 1, 0], ['bag', 4, 1, 0]];
    const SH = [48, 86], order = [5, 0, 8, 2, 10, 3, 6, 9, 1, 11, 4, 7], items = [];
    LAY.forEach(([k, c, sh, slot], j) => { const i = order.indexOf(j); const w = k === 'heartclock' ? 15 : k === 'stereo' ? 13 : slot ? 7.8 : 10.5;
      const h = w * ar(k) / ratio();
      const door = [9 + i * 7.4, 96, w * .82, (rnd() - .5) * 14, 1, 1];
      const sx = COLX[c] + slot * 4.6, sorted = [sx, SH[sh], w, (rnd() - .5) * 5, 1, 1];
      const hot = k === 'stereo' || k === 'heartclock';
      const focus = hot ? [k === 'stereo' ? 36 : 62, 80, k === 'stereo' ? 22 : 27, k === 'stereo' ? -2 : 2, 1, 1] : [sx, SH[sh], w, sorted[3], .16, 1];
      items.push({ k, z: 3, s: [door, null, sorted, focus] });
      const fh = (hot ? (k === 'stereo' ? 22 : 27) : w) * ar(k) / ratio();
      const t = { k: null, z: 4, s: [[door[0] + w * .3, 96 - h * .82 - 3, 3.2, 0, 0], [12 + i * 6.7, 25, 3.4, (rnd() - .5) * 8, 1], [sx + w * .34, SH[sh] - h * .92, 3.1, (rnd() - .5) * 14, 1],
        hot ? [(k === 'stereo' ? 36 : 62) + (k === 'stereo' ? 22 : 27) * .36, 80 - fh * .9, 4.4, 8, 1] : [sx + w * .34, SH[sh] - h * .92, 3.1, 0, 0]] };
      t.el = (() => { const im = document.createElement('img'); im.className = 'stk'; im.src = ticketURL(11 + i * 3); b.appendChild(im); return im; })();
      items.push(t); });
    const pl = [...b.querySelectorAll('.plaque')], rail = b.querySelector('.rail');
    board('bOrders', items, n => { pl.forEach(p => p.style.opacity = n === 2 ? 1 : n === 3 ? .35 : 0); rail.style.opacity = n === 1 ? 1 : .25; }); }

  // graphic 2
  { const tools = [['iron', 14, 34, 13, -22], ['meter', 14, 70, 9, 6], ['drivers', 27, 86, 11, -4], ['pliers', 86, 32, 10, 18], ['cutters', 86, 64, 9, -12], ['tweezers', 73, 86, 9, 30],
      ['fluxpen', 34, 15, 8, 70], ['braid', 50, 13, 7, 0], ['magnifier', 66, 15, 9, -14], ['wire', 40, 88, 6, 0], ['screws', 60, 88, 6, 0]];
    const items = tools.map(([k, x, y, w, r]) => ({ k, s: [[x + (x < 50 ? -6 : 6), y, w, r, 0], [x, y, w, r, 1], [x, y, w, r, .25], [x, y, w, r, .25]] }));
    items.push({ k: 'stereo', z: 3, s: [[50, 50, 26, -1, 1], [50, 50, 24, -1, 1], [50, 50, 24, -1, 0], [30, 50, 22, -2, 1]] });
    items.push({ k: 'stereoX', z: 3, s: [[50, 50, 30, 0, 0], null, [50, 50, 50, 0, 1], [50, 50, 30, 0, 0]] });
    const ph = frameStk($('bBench'), `<div class="mini stampm"><div class="in"><img data-photo="hands" alt="Alt text placeholder"></div></div>`);
    items.push({ el: ph, z: 5, s: [[72, 50, 34, 4, 0], null, null, [70, 50, 36, 3, 1]] });
    board('bBench', items); }

  // graphic 3
  { const b = $('bClock'), med = b.querySelector('.medal'), rib = b.querySelector('.ribbon'), mimg = med.querySelector('img');
    const views = [null, ['chainOff', 'Chains off the cogwheels'], ['chainFed', 'Fed back on'], ['chain3', 'Tied for the trip'], null];
    const pol = frameStk(b, FR.polaroid('clock', '', '')); pol.querySelector('figcaption')?.remove(); pol.firstElementChild.style.margin = '0';
    const pw = innerWidth < 760 ? 46 : 37;
    board('bClock', [{ k: 'cuckoo', z: 3, s: [[34, 53, 24, -2, 1], [29, 53, 22, -2, 1], null, null, [24, 53, 20, -3, 1]] }, { el: pol, z: 6, s: [[68, 56, pw, 6, 0], null, null, null, [64, 52, pw, 3, 1]] }], n => {
      const v = views[n]; med.style.opacity = v ? 1 : 0; rib.style.opacity = v ? 1 : 0; med.style.transform = v ? 'scale(1)' : 'scale(.86)';
      if (v) { mimg.style.opacity = 0; setTimeout(() => { const isP = v[0][0] === '@'; mimg.className = isP ? 'photo' : ''; mimg.src = isP ? ASSETS.photo[v[0].slice(1)][0] : src(v[0]); mimg.style.opacity = 1; }, reduce ? 0 : 220); rib.textContent = v[1]; } }); }

  // graphic 4: the heart clock, whole, then in parts with labels, then a loupe on the small parts, then her photo
  { const b = $('bHeart'), TB = b.querySelector('.trayBox'), tray = b.querySelector('.tray'), lp = b.querySelector('.loupe'), lz = lp.querySelector('.lz'), L = b.querySelector('.labels');
    const M = typeof HEART_MARKS !== 'undefined' ? HEART_MARKS : {};
    const NAMES2 = { frame: ['Heart frame, gold', 'under'], roses: ['Relief roses', ''], face: ['Rose face', 'under'], bezel: ['Black bezel', ''], ring: ['Chapter ring', ''], lens: ['Glass lens', 'under'],
      hands: ['Hour and minute hands', 'under'], second: ['Second hand', ''], movement: ['Quartz movement', ''], battery: ['AA battery', 'under'] };
    const SMALL = ['hands', 'second', 'movement', 'battery'];
    if (M.frame) M.frame = [Math.max(M.frame[0], .1), M.frame[1]];
    const lbls = Object.entries(NAMES2).filter(([k]) => M[k]).map(([k, [t, cls]]) => { const s = document.createElement('span'); s.className = 'lbl ' + cls; s.textContent = t; s.dataset.k = k;
      const [x, y] = M[k]; const h = 26 + (k.length % 3) * 10; s.style.setProperty('--h', h + 'px');
      s.style.left = (Math.min(Math.max(x, innerWidth < 760 ? .13 : .07), innerWidth < 760 ? .87 : .93) * 100) + '%'; s.style.top = `calc(${y * 100}% ${cls ? '+' : '-'} ${h + (cls ? 0 : 14)}px)`; s.style.opacity = 0; L.appendChild(s); return s; });
    lz.style.backgroundImage = `url(${tray.src})`;
    const ph = frameStk(b, `<div class="mini platem"><div class="well"><img data-photo="intake" alt="Alt text placeholder"></div></div>`);
    const items = [{ k: 'heartclock', z: 3, s: [[50, 49, 37, -1, 1], [26, 46, 30, 0, 0]] }, { el: ph, z: 6, s: [[78, 50, 40, 3, 0], null, null, [72, 50, 44, 2, 1]] }];
    board('bHeart', items, n => {
      tray.style.opacity = n === 0 ? 0 : 1;
      lbls.forEach(s => s.style.opacity = n === 1 ? 1 : n === 2 && SMALL.includes(s.dataset.k) ? 1 : 0);
      lp.style.opacity = n === 2 ? 1 : 0; lp.style.transform = `translate(-50%,-50%) scale(${n === 2 ? 1 : .7})`;
      b.querySelector('.scaleNote').style.opacity = n <= 1 ? 1 : 0;
    });
    // aim the loupe at the hands and movement
    const aim = () => { if (!M.hands) return; const cx = M.hands[0] - .015, cy = M.hands[1] - .035;
      lp.style.left = '70%'; lp.style.top = '50%'; const Z = 2.3; lz.style.backgroundSize = `${TB.clientWidth * Z}px auto`;
      const bx = cx * TB.clientWidth * Z - lp.clientWidth / 2, by = cy * TB.clientHeight * Z - lp.clientHeight / 2; lz.style.backgroundPosition = `${-bx}px ${-by}px`; };
    aim(); addEventListener('resize', aim); }

  // graphic 5
  { const back = [['lamp', 9], ['clock', 20], ['blender', 31], ['heartclock', 44], ['stereo', 58], ['radio', 71], ['fan', 81], ['trousers', 91]];
    const items = back.map(([k, x], i) => { const w = k === 'heartclock' ? 15 : k === 'stereo' ? 11 : 8; return { k, z: 3, s: [[x, 76, w, (i % 2 ? 3 : -3), 1, 1], null, [x, 76, w, (i % 2 ? 3 : -3), .5, 1]] }; });
    items.push({ k: 'fixboard', z: 4, s: [[80, -40, 22, 0, 0], null, [74, 36, 22, 3, 1]] });
    items.push({ k: 'menu', z: 2, s: [[50, 30, 17, -2, 1], [52, 30, 16, -2, 1], [44, 30, 15, -2, .8]] });
    items.push({ k: 'stand', z: 2, s: [[11, 44, 9, 0, 1]] }); items.push({ k: 'vase2', z: 2, s: [[90, 46, 6.5, 0, 1]] });
    const rc = $('bOrder').querySelector('.receipt');
    board('bOrder', items, n => { rc.style.opacity = n >= 1 ? 1 : 0; rc.style.transform = `rotate(-2deg) translateY(${n >= 1 ? 0 : -20}px)`; }); }

  // the interactive cuckoo clock (a Colorfigure) lives in its own frame
  { const f = document.querySelector('iframe.cf'); if (f && typeof CUCKOO_B64 !== 'undefined'){ f.srcdoc = new TextDecoder().decode(Uint8Array.from(atob(CUCKOO_B64), c => c.charCodeAt(0)));
      addEventListener('message', e => { if (e.source === f.contentWindow && e.data && e.data.cfH) f.style.height = (e.data.cfH + 4) + 'px'; }); } }
  // lightbox for every photograph
  document.querySelectorAll('img.ph-img, .fstk img').forEach(im => { im.style.cursor = 'zoom-in'; im.onclick = () => { document.querySelectorAll('.lbPola').forEach(e => e.remove()); const pz = im.closest('.pola'); $('lbImg').style.display = pz ? 'none' : ''; if (pz) { const c = pz.cloneNode(true); c.className = 'lbPola'; $('lb').insertBefore(c, $('lbClose')); } $('lbImg').src = im.src; $('lbImg').alt = im.alt; $('lb').classList.add('on'); $('lbClose').focus(); }; });
  $('lbClose').onclick = () => $('lb').classList.remove('on'); $('lb').onclick = e => { if (e.target.id === 'lb') $('lb').classList.remove('on'); };
  addEventListener('keydown', e => { if (e.key === 'Escape') $('lb').classList.remove('on'); });
  window.__ok = true;
})();
