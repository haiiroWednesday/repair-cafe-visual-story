// A temporary editing layer for the paper edition. People who can edit this artifact get an "edit" switch in the bar.
// In edit mode: drag a collage piece to move it, drag its corner dot to resize it, double-click any text to rewrite it,
// select anything and press Delete (or the "remove" tag) to take it out. Every change saves to the artifact's database
// and is applied for every reader when the page loads. Phone and desktop positions are kept separately.
(() => {
  const MOVE = '.stage > .pc, .stage > .polawrap, .seam .orn';
  const TEXT = 'h1, h2, .kick, .dek, .by, .txt > p, .sub h3, .sub p, .cap, .pull, .recon, .fcap, .end p, .trk, .tl figcaption';
  const ALL = MOVE + ', ' + TEXT + ', .tl, .seam .lace, .seam .tissue, .toolroll';
  const phone = () => matchMedia('(max-width: 820px)').matches;
  let db = null, on = false, sel = null, edits = {}, timers = {};
  // stable ids: the section, the kind of piece, and its order within the section
  const count = {};
  document.querySelectorAll('main .sw, main > *').forEach((sw, si) => {
    const sec = (sw.querySelector('section, header, footer') || sw).id || 's' + si;
    sw.querySelectorAll(ALL).forEach(el => {
      if (el.dataset.eid || el.parentElement.closest('[data-eid]') && !el.matches(TEXT)) return;
      const k = el.matches(MOVE) ? 'pc' : el.matches('.tl') ? 'tl' : el.matches('.toolroll') ? 'roll' : el.matches('.seam *') ? 'seam' : el.tagName.toLowerCase() + (el.className ? '.' + el.classList[0] : '');
      const key = sec + '|' + k; count[key] = (count[key] || 0) + 1;
      el.dataset.eid = (sec + '-' + k + '-' + count[key]).replace(/[^A-Za-z0-9_-]/g, '_');
    });
  });
  const byId = id => document.querySelector(`[data-eid="${id}"]`);
  const V = { l: ['--l', '--ml'], t: ['--t', '--mt'], w: ['--w', '--mw'] };
  function apply(id, e) {
    const el = byId(id); if (!el) return;
    el.style.display = e.del ? 'none' : '';
    for (const k of ['l', 't', 'w']) { if (e[k] != null) el.style.setProperty(V[k][0], e[k] + '%'); if (e['m' + k] != null) el.style.setProperty(V[k][1], e['m' + k] + '%'); }
    if (e.html != null && el.innerHTML !== e.html) el.innerHTML = e.html;
  }
  // ----- chrome -----
  const css = document.createElement('style'); css.textContent = `
    #edBar{display:none;align-items:center;gap:8px;margin-left:10px}
    #edBar.show{display:flex}
    #edBar button{border:1px solid rgba(35,51,126,.35);border-radius:0;background:#FBF8EF;padding:6px 10px;font:600 11px var(--body);letter-spacing:.14em;text-transform:uppercase;color:var(--navy);cursor:pointer;white-space:nowrap}
    #edBar button[aria-pressed=true]{background:var(--rust);border-color:var(--rust);color:#FBF8EF}
    #edSt{font:italic 400 13px var(--body);color:var(--soft);white-space:nowrap}
    body.editing [data-eid]{outline:1px dashed rgba(194,74,35,.4);outline-offset:3px}
    body.editing [data-eid]:hover{outline-color:rgba(194,74,35,.9)}
    body.editing .stage > [data-eid],body.editing .seam .orn{cursor:move}
    body.editing [data-eid].ed-sel{outline:2px solid var(--rust)}
    body.editing .seam{pointer-events:auto}body.editing .seam .orn{pointer-events:auto}
    body.editing [contenteditable=true]{cursor:text;outline:2px solid var(--gold);background:rgba(255,250,235,.75)}
    #edGrip{position:absolute;width:16px;height:16px;border-radius:50%;background:var(--rust);border:2px solid #FBF8EF;cursor:nwse-resize;z-index:400;display:none;touch-action:none}
    #edDel{position:absolute;z-index:400;display:none;border:0;background:var(--rust);color:#FBF8EF;font:600 10px var(--body);letter-spacing:.14em;text-transform:uppercase;padding:5px 8px;cursor:pointer}
    #edHelp{display:none;position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:300;background:#FBF8EF;border:1px solid rgba(35,51,126,.3);box-shadow:0 8px 24px rgba(30,20,10,.15);padding:9px 16px;font:italic 400 14px var(--body);color:var(--text);max-width:calc(100% - 24px);text-align:center}
    body.editing #edHelp{display:block}body.editing #pal{display:none}`;
  document.head.appendChild(css);
  const bar = document.createElement('div'); bar.id = 'edBar';
  bar.innerHTML = '<button id="edTog" aria-pressed="false">edit</button><button id="edUndo" hidden>undo</button><span id="edSt"></span>';
  document.querySelector('.bar').appendChild(bar);
  const help = document.createElement('div'); help.id = 'edHelp';
  help.textContent = 'Drag pictures to move them · corner dot resizes · double-click text to rewrite · Delete key or “remove” takes a piece out · saves by itself' + (phone() ? ' · phone layout is saved separately' : '');
  document.body.appendChild(help);
  const grip = document.createElement('div'); grip.id = 'edGrip'; document.body.appendChild(grip);
  const del = document.createElement('button'); del.id = 'edDel'; del.textContent = 'remove'; document.body.appendChild(del);
  const st = t => { document.getElementById('edSt').textContent = t; };
  // ----- saving, with a short undo history -----
  const hist = [];
  function save(id) {
    clearTimeout(timers[id]); st('saving…');
    timers[id] = setTimeout(async () => {
      try { if (Object.keys(edits[id] || {}).length) await db.collection('edits').doc(id).set(edits[id]); else await db.collection('edits').doc(id).delete(); st('saved'); }
      catch (e) { st(e && (e.code === 'not_granted' || e.code === 'forbidden') ? 'you can’t save here' : 'not saved, try again'); }
    }, 500);
  }
  function change(id, patch, el) {
    hist.push({ id, before: JSON.parse(JSON.stringify(edits[id] || {})), html: el ? el.dataset.orig : null }); document.getElementById('edUndo').hidden = false;
    edits[id] = Object.assign({}, edits[id] || {}, patch); apply(id, edits[id]); save(id);
  }
  document.getElementById('edUndo').addEventListener('click', () => {
    const h = hist.pop(); if (!h) return; if (!hist.length) document.getElementById('edUndo').hidden = true;
    const el = byId(h.id); edits[h.id] = h.before;
    if (el) { el.style.display = ''; ['--l', '--t', '--w', '--ml', '--mt', '--mw'].forEach(p => el.style.removeProperty(p)); if (h.before.html == null && el.dataset.orig != null) el.innerHTML = el.dataset.orig; }
    apply(h.id, h.before); save(h.id);
  });
  // ----- select, move, resize -----
  function place() {
    if (!sel || !on || sel.isContentEditable) { grip.style.display = del.style.display = 'none'; return; }
    const r = sel.getBoundingClientRect(), mv = sel.matches(MOVE);
    grip.style.display = mv ? 'block' : 'none'; grip.style.left = scrollX + r.right - 8 + 'px'; grip.style.top = scrollY + r.bottom - 8 + 'px';
    del.style.display = 'block'; del.style.left = scrollX + r.left + 'px'; del.style.top = scrollY + Math.max(r.top - 26, 0) + 'px';
  }
  function select(el) { if (sel) sel.classList.remove('ed-sel'); sel = el; if (sel) sel.classList.add('ed-sel'); place(); }
  const box = el => el.offsetParent || el.parentElement;
  const cur = (el, k) => { const v = parseFloat(getComputedStyle(el).getPropertyValue(phone() ? V[k][1] : V[k][0])); if (!isNaN(v)) return v;
    const p = box(el).getBoundingClientRect(), r = el.getBoundingClientRect(); return k === 'l' ? (r.left - p.left) / p.width * 100 : k === 't' ? (r.top - p.top) / p.height * 100 : r.width / p.width * 100; };
  let drag = null;
  document.addEventListener('pointerdown', e => {
    if (!on) return;
    if (e.target === grip && sel) { e.preventDefault(); drag = { el: sel, x: e.clientX, w: cur(sel, 'w'), mode: 'size' }; grip.setPointerCapture(e.pointerId); return; }
    if (e.target === del || e.target.closest('#edBar')) return;
    const el = e.target.closest('[data-eid]'); if (!el) { if (!e.target.closest('.bar')) select(null); return; }
    if (el.isContentEditable) return;
    select(el); if (!el.matches(MOVE)) return;
    e.preventDefault(); drag = { el, x: e.clientX, y: e.clientY, l: cur(el, 'l'), t: cur(el, 't'), mode: 'move', moved: false };
  }, true);
  document.addEventListener('pointermove', e => {
    if (!drag) return; e.preventDefault();
    const p = box(drag.el).getBoundingClientRect(), dx = (e.clientX - drag.x) / p.width * 100, dy = (e.clientY - (drag.y || 0)) / p.height * 100;
    if (drag.mode === 'move') { drag.moved = true; drag.nl = +(drag.l + dx).toFixed(2); drag.nt = +(drag.t + dy).toFixed(2);
      drag.el.style.setProperty(phone() ? '--ml' : '--l', drag.nl + '%'); drag.el.style.setProperty(phone() ? '--mt' : '--t', drag.nt + '%'); }
    else { drag.nw = Math.max(4, +(drag.w + dx).toFixed(2)); drag.el.style.setProperty(phone() ? '--mw' : '--w', drag.nw + '%'); }
    place();
  }, true);
  document.addEventListener('pointerup', () => {
    if (!drag) return; const d = drag; drag = null; const m = phone() ? 'm' : '';
    if (d.mode === 'move' && d.moved) change(d.el.dataset.eid, { [m + 'l']: d.nl, [m + 't']: d.nt });
    if (d.mode === 'size' && d.nw != null) change(d.el.dataset.eid, { [m + 'w']: d.nw });
  }, true);
  // in edit mode, clicks select instead of opening pictures, the 3D café or links
  document.addEventListener('click', e => { if (on && e.target.closest('[data-eid], main a, main button') && !e.target.closest('#edBar, #edDel') && !(e.target.isContentEditable)) { e.preventDefault(); e.stopImmediatePropagation(); } }, true);
  document.addEventListener('dblclick', e => {
    if (!on) return; const el = e.target.closest('[data-eid]'); if (!el || !el.matches(TEXT)) return;
    e.preventDefault(); if (el.dataset.orig == null) el.dataset.orig = el.innerHTML;
    el.contentEditable = 'true'; el.focus(); place();
    el.addEventListener('blur', () => { el.contentEditable = 'false'; if (el.innerHTML !== (edits[el.dataset.eid] || {}).html && el.innerHTML !== el.dataset.orig) change(el.dataset.eid, { html: el.innerHTML }, el); place(); }, { once: true });
  }, true);
  del.addEventListener('click', e => { e.stopPropagation(); if (sel) { const id = sel.dataset.eid; select(null); change(id, { del: true }); } });
  addEventListener('keydown', e => {
    if (!on || !sel || (document.activeElement && document.activeElement.isContentEditable)) return;
    if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); const id = sel.dataset.eid; select(null); change(id, { del: true }); }
    if (e.key === 'Escape') select(null);
  }, true);
  document.getElementById('edTog').addEventListener('click', e => {
    on = !on; e.currentTarget.setAttribute('aria-pressed', on); e.currentTarget.textContent = on ? 'done' : 'edit';
    document.body.classList.toggle('editing', on); if (!on) select(null); st(on ? 'editing' : '');
  });
  addEventListener('scroll', place, { passive: true }); addEventListener('resize', place);
  // ----- load: everyone sees saved edits; only editors see the switch -----
  (async () => {
    if (!window.claude) return;
    db = await claude.use('db'); if (!db) return;
    try { const snap = await db.collection('edits').get(); snap.docs.forEach(d => { edits[d.id] = d.data(); const el = byId(d.id); if (el && edits[d.id].html != null) el.dataset.orig = el.innerHTML; apply(d.id, edits[d.id]); }); } catch (e) {}
    const user = await claude.use('user'); if (user && await user.canEdit()) bar.classList.add('show');
  })();
})();
