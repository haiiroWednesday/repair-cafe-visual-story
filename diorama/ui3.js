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

