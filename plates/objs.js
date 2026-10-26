// the old inked object library, re-coloured to the tearoom palette. load with await loadObjs()
function loadObjs() { return new Promise(r => { if (typeof OBJ !== 'undefined') return r(); const s = document.createElement('script'); s.src = '../cafe/objects.js'; s.onload = r; document.body.appendChild(s); }); }
const OBJ_PAL = { blush: '#EED3CC', rose: '#D9A7A0', mint: '#C3DACB', sage: '#A9BCA3', butter: '#EFDDB0', lav: '#CBBBD8', sky: '#C9D5E3', peach: '#EBCDB5', cream: '#F4ECDD', cocoa: '#9A6A52', cocoa2: '#C4A68A', slate: '#BDB8B0', steel: '#8F8A84', dark: '#5A4F48', black: '#3A302B', white: '#FBF6EC', lime: '#CFD3A0', yellow: '#D9B76A', orange: '#C98A5A', cherry: '#A9473F', blue: '#8EA2BE', navy: '#4E6585', green: '#6F8C70', teal: '#7FA49B', pink: '#DDA3A8', purple: '#9C86AE', paper: '#FBF6EC', ink: '#2B2420', ink2: '#3B4A6E', grey: '#C9C2B6', gold: '#C2A15E', irid: '#D9C8DE', porcelain: '#FBF6EC', c1: '#C08079', c1l: '#EED3CC', c2: '#B08D57', c2l: '#EBDDB8', c3: '#7E967B', c3l: '#CFE0D2', c4: '#6F86A6', c4l: '#C9D5E3', c5: '#9C86AE', c5l: '#DCD0E6' };
let _oc = 0;
function obj(id, x, y, size, rot = 0) {
  const uid = 'ob' + (_oc++);
  const inner = OBJ[id].replace(/data-ns="1" style="/g, 'style="visibility:var(--vis,visible);');
  const fillVars = Object.entries(OBJ_PAL).map(([k, v]) => `--${k}:${v}`).join(';');
  const noneVars = Object.keys(OBJ_PAL).map(k => `--${k}:none`).join(';');
  const k = size / 120;
  return `<g transform="translate(${x} ${y}) rotate(${rot} ${size / 2} ${size / 2}) scale(${k})"><symbol id="${uid}" overflow="visible"><g stroke="var(--ln)" stroke-width="${1.6 / Math.max(k, .5)}" stroke-linecap="round" stroke-linejoin="round">${inner}</g></symbol>
   <use href="#${uid}" x="1.6" y="1.4" style="${fillVars};--ln:none;--lnC:none;--lnD:none;--vis:visible" filter="url(#wcs)"/>
   <use href="#${uid}" style="${noneVars};--ln:#3E2E26;--lnC:#8A6B3E;--lnD:#6E2A2A;--vis:hidden;fill:none" filter="url(#rough)"/></g>`;
}
