(() => {
  const LABELS = {{LABELS}};
  const $ = id => document.getElementById(id);
  const nb = $('nb'), book = $('nbBook'), wrap = $('nbWrap'), pop = $('nbPop');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let pf = null, state = 'read', back = null;
  const POP_PAGES = [3, 4];

  function load(root) { root.querySelectorAll('img[data-src]').forEach(i => { i.src = i.dataset.src; i.removeAttribute('data-src'); }); }
  function open(at) {
    back = document.activeElement; nb.hidden = false; document.documentElement.style.overflow = 'hidden'; load(nb);
    requestAnimationFrame(() => {
      if (!pf) init();
      if (at != null) pf.turnToPage(at);
      settle(); $('nbNext').focus();
    });
    if (location.hash !== '#notebook') history.replaceState(null, '', '#notebook');
  }
  function close() {
    nb.hidden = true; document.documentElement.style.overflow = ''; pop.classList.remove('up', 'show');
    if (location.hash === '#notebook') history.replaceState(null, '', location.pathname + location.search);
    if (back && back.focus) back.focus({ preventScroll: true }); dispatchEvent(new Event('scroll'));
  }
  function init() {
    pf = new St.PageFlip(book, {
      width: 560, height: 780, size: 'stretch', minWidth: 240, maxWidth: 760, minHeight: 334, maxHeight: 1058,
      showCover: true, usePortrait: true, mobileScrollSupport: false, maxShadowOpacity: .45, flippingTime: reduce ? 250 : 900,
      disableFlipByClick: true, clickEventForward: true, showPageCorners: true, autoSize: true
    });
    pf.loadFromHTML(book.querySelectorAll('.page'));
    pf.on('flip', () => settle());
    pf.on('changeState', e => { state = e.data; if (state === 'read') popCheck(); else pop.classList.remove('up'); });
    pf.on('changeOrientation', () => settle());
    addEventListener('resize', () => { if (!nb.hidden) place(); });
  }
  const cur = () => pf.getCurrentPageIndex();
  const portrait = () => pf.getOrientation() === 'portrait';
  function visible() {
    const i = cur(); if (portrait() || i === 0 || i === pf.getPageCount() - 1) return [i];
    const l = i % 2 ? i : i - 1; return [l, l + 1];
  }
  function settle() {
    const v = visible();
    const pp = v.length > 1 ? `pp. ${v[0]}–${v[1]}` : (v[0] === 0 || v[0] === pf.getPageCount() - 1 ? '' : `p. ${v[0]}`), lab = LABELS[v[v.length - 1]] || '';
    $('nbWhere').textContent = [pp, lab].filter(Boolean).join(' · ');
    $('nbPrev').disabled = cur() === 0; $('nbNext').disabled = cur() >= pf.getPageCount() - 1;
    // the paint blooms in on pages that have just come into view
    v.forEach(n => { const pg = book.querySelectorAll('.page')[n]?.querySelector('.pg'); if (pg && !pg.dataset.seen) { pg.dataset.seen = 1; pg.classList.add('fresh'); requestAnimationFrame(() => requestAnimationFrame(() => pg.classList.remove('fresh'))); } });
    const lone = !portrait() && v.length === 1; wrap.classList.toggle('atCover', lone && v[0] === 0); wrap.classList.toggle('atBack', lone && v[0] > 0);
    place(); setTimeout(popCheck, 60);
  }
  function place() {
    if (!pf) return;
    const r = pf.getBoundsRect(), bx = book.offsetLeft, by = book.offsetTop, i = cur();
    let x0 = r.left, w = r.width;
    if (portrait()) { w = r.pageWidth; x0 = r.left + r.pageWidth; }
    const pw = w * (portrait() ? 1.0 : .74), h = pw * (portrait() ? .6 : .58);
    pop.style.left = bx + x0 + (w - pw) / 2 + 'px'; pop.style.width = pw + 'px'; pop.style.height = h + 'px';
    pop.style.top = by + r.top + r.height * (portrait() ? .82 : .83) - h + 'px';
    pop.classList.toggle('small', pw < 420);
  }
  function popCheck() {
    if (!pf) return;
    const on = visible().some(n => POP_PAGES.includes(n)) && state === 'read';
    if (on) { pop.classList.add('show'); requestAnimationFrame(() => requestAnimationFrame(() => pop.classList.add('up'))); }
    else { pop.classList.remove('up'); setTimeout(() => { if (!pop.classList.contains('up')) pop.classList.remove('show'); }, 320); }
  }
  // gentle look-around: the pop-up tilts toward the pointer
  wrap.addEventListener('pointermove', e => {
    if (!pop.classList.contains('up') || reduce) return;
    const b = wrap.getBoundingClientRect(), dx = (e.clientX - b.left) / b.width - .5, dy = (e.clientY - b.top) / b.height - .5;
    pop.style.transform = `rotateY(${dx * 8}deg) rotateX(${-dy * 4}deg)`;
  });
  wrap.addEventListener('pointerleave', () => { pop.style.transform = ''; });

  function go(n) { if (!pf) return; const v = visible(); if (v.includes(n)) return; pf.flip(n); }
  nb.addEventListener('click', e => {
    const t = e.target.closest('button'); if (!t || !nb.contains(t)) return;
    if (t.dataset.go) { go(+t.dataset.go); return; }
    if (t.classList.contains('photo')) { const on = !t.classList.contains('on'); nb.querySelectorAll('.photo.on').forEach(p => p.classList.remove('on')); t.classList.toggle('on', on); return; }
    if (t.classList.contains('panel')) { const im = t.querySelector('img'); $('nbLb').querySelector('img').src = im.src; $('nbLb').querySelector('img').alt = im.alt; $('nbLb').hidden = false; $('nbLb').querySelector('button').focus(); return; }
    if (t.classList.contains('apartBtn')) { const a = t.closest('.pg').querySelector('.apart'); const o = a.classList.toggle('open'); t.textContent = o ? 'put it back together' : 'take it apart'; return; }
    if (t.classList.contains('flap')) { const o = t.getAttribute('aria-expanded') !== 'true'; t.setAttribute('aria-expanded', o); t.querySelector('.lbl').textContent = o ? 'close the flap' : 'lift the flap'; return; }
    if (t.closest('#nbLb')) { $('nbLb').hidden = true; return; }
  });
  $('nbLb').addEventListener('click', e => { if (e.target.id === 'nbLb') $('nbLb').hidden = true; });
  $('nbPrev').onclick = () => pf && pf.flipPrev(); $('nbNext').onclick = () => pf && pf.flipNext(); $('nbX').onclick = close;
  addEventListener('keydown', e => {
    if (nb.hidden) return;
    if (e.key === 'Escape') { if (!$('nbLb').hidden) $('nbLb').hidden = true; else close(); }
    if (e.key === 'ArrowRight' && pf) pf.flipNext(); if (e.key === 'ArrowLeft' && pf) pf.flipPrev();
  });
  document.querySelectorAll('.nbOpen').forEach(b => b.addEventListener('click', e => { e.preventDefault(); open(b.dataset.page ? +b.dataset.page : null); }));
  if (location.hash === '#notebook') open();
  window.__nb = { open, close, go: n => pf && pf.turnToPage(n), pf: () => pf };
})();
