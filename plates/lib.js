// shared kit for the information plates: palette, lettering, paper, ink and wash filters, small drawing helpers
const P = {
  ink: '#2B2420', walnut: '#4A3227', walnut2: '#6B4A38', ox: '#6E2A2A', ox2: '#8E3B36', bottle: '#2F4A3C', bottle2: '#4F6B57',
  brass: '#B08D57', brass2: '#8A6B3E', brass3: '#D9C08E', ivory: '#F4ECDD', ivory2: '#E8DAC0', ivory3: '#D8C6A4',
  rose: '#D9A7A0', rose2: '#C08079', rose3: '#EED3CC', sage: '#A9BCA3', sage2: '#7E967B', lilac: '#CBBBD8', mint: '#C3DACB',
  blue: '#B9C8DB', blue2: '#6F86A6', pink: '#EDC9C8', cocoa: '#6E4636', cocoa2: '#9A6A52', cream: '#FBF5EA', chalk: '#ECE7DA'
};
const FONTS = [
  ['Fredericka', 'fredericka-the-great', 400, 'normal'], ['CabinSketch', 'cabin-sketch', 400, 'normal'], ['CabinSketch', 'cabin-sketch', 700, 'normal'],
  ['Schoolbell', 'schoolbell', 400, 'normal'], ['Fell', 'im-fell-english-sc', 400, 'normal'], ['Pinyon', 'pinyon-script', 400, 'normal'],
  ['Courier', 'courier-prime', 400, 'normal'], ['Courier', 'courier-prime', 700, 'normal'], ['Typewriter', 'special-elite', 400, 'normal'],
  ['Kalam', 'kalam', 300, 'normal'], ['Kalam', 'kalam', 400, 'normal'], ['Kalam', 'kalam', 700, 'normal'], ['Apple', 'homemade-apple', 400, 'normal'],
  ['Gloock', 'gloock', 400, 'normal'], ['Reenie', 'reenie-beanie', 400, 'normal'], ['Yellowtail', 'yellowtail', 400, 'normal'],
  ['SueEllen', 'sue-ellen-francisco', 400, 'normal'],
  ...[300, 400, 500, 600, 700, 800].flatMap(w => [['Fraunces', 'fraunces', w, 'normal'], ['Fraunces', 'fraunces', w, 'italic']])
];
(() => {
  let css = '';
  for (const [fam, dir, w, st] of FONTS) {
    const f = `fs/${dir}/files/${dir}-latin-${w}-${st}.woff2`, fx = `fs/${dir}/files/${dir}-latin-ext-${w}-${st}.woff2`;
    css += `@font-face{font-family:'${fam}';font-weight:${w};font-style:${st};src:url(${f}) format('woff2'),url(${fx}) format('woff2');font-display:block}`;
  }
  css += `
  html,body{margin:0;background:transparent}
  #a{position:relative;overflow:visible;font-family:Fraunces,serif;color:${P.ink}}
  #a *{box-sizing:border-box}
  #a svg{position:absolute;left:0;top:0;overflow:visible}
  .t{position:absolute;line-height:1.18}
  .lbl{font-family:Fell;letter-spacing:.06em;color:${P.walnut}}
  .note{font-family:Kalam;font-weight:400;color:${P.walnut}}
  .hand{font-family:Apple;color:${P.walnut}}
  .num{font-family:Fraunces;font-weight:600;font-variation-settings:'SOFT' 100,'WONK' 1;color:${P.ox}}
  .src{font-family:Fraunces;font-style:italic;font-weight:400;color:${P.walnut2};font-size:13px;line-height:1.3}
  .script{font-family:Pinyon;color:${P.ox}}
  .chalk{font-family:Fredericka;color:${P.chalk}}
  .chalkh{font-family:Schoolbell;color:${P.chalk}}
  .mono{font-family:Courier;color:#3A332E}
  .tw{font-family:Typewriter;color:${P.ink}}
  `;
  const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
})();

// filters shared by every drawing (one hidden svg in the document)
const DEFS = `<svg width="0" height="0" style="position:absolute"><defs>
<filter id="rough" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="2.4" xChannelSelector="R" yChannelSelector="G"/></filter>
<filter id="rough2" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="9"/><feDisplacementMap in="SourceGraphic" scale="5" xChannelSelector="R" yChannelSelector="G"/></filter>
<filter id="wc" x="-15%" y="-15%" width="130%" height="130%" color-interpolation-filters="sRGB">
  <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="3" seed="7" result="n"/>
  <feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G" result="d"/>
  <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="2" seed="2" result="g"/>
  <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.1 1.35" result="ga"/>
  <feComposite in="d" in2="ga" operator="in" result="gr"/>
  <feMorphology in="d" operator="erode" radius="2.2" result="er"/>
  <feComposite in="d" in2="er" operator="out" result="edge"/>
  <feColorMatrix in="edge" type="matrix" values="0.8 0 0 0 0  0 0.78 0 0 0  0 0 0.78 0 0  0 0 0 0.55 0" result="edge2"/>
  <feMerge><feMergeNode in="gr"/><feMergeNode in="edge2"/></feMerge>
</filter>
<filter id="wcs" x="-15%" y="-15%" width="130%" height="130%" color-interpolation-filters="sRGB">
  <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="3" result="n"/>
  <feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G" result="d"/>
  <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="5" result="g"/>
  <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.9 1.3" result="ga"/>
  <feComposite in="d" in2="ga" operator="in"/>
</filter>
<filter id="deckle" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="4" seed="11"/><feDisplacementMap in="SourceGraphic" scale="9" xChannelSelector="R" yChannelSelector="G"/></filter>
<filter id="shadow" x="-10%" y="-10%" width="120%" height="125%"><feDropShadow dx="0" dy="6" stdDeviation="7" flood-color="#2B1A10" flood-opacity=".28"/></filter>
<filter id="shadowS" x="-10%" y="-10%" width="120%" height="125%"><feDropShadow dx="0" dy="2" stdDeviation="2.4" flood-color="#2B1A10" flood-opacity=".3"/></filter>
<filter id="glow" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="6"/></filter>
<filter id="blur2"><feGaussianBlur stdDeviation="2"/></filter>
<filter id="chalkf" x="-5%" y="-5%" width="110%" height="110%">
  <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="8" result="g"/>
  <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 1.4" result="ga"/>
  <feComposite in="SourceGraphic" in2="ga" operator="in"/>
</filter>
<pattern id="paperP" patternUnits="userSpaceOnUse" width="1600" height="1000"><image href="tex/paper_cream.jpg" width="1600" height="1000"/></pattern>
</defs></svg>`;

// ---------- helpers ----------
const R = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(12345);
const rnd = (a, b) => a + (b - a) * R();
const T = (x, y, cls, html, st = '') => `<div class="t ${cls}" style="left:${x}px;top:${y}px;${st}">${html}</div>`;
// a leader line from a note to its object, inked, with a dot at the object end
function lead(x1, y1, x2, y2, col = P.walnut, bend = 0) {
  const mx = (x1 + x2) / 2 + bend, my = (y1 + y2) / 2 - Math.abs(bend) * .3;
  return `<path d="M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}" fill="none" stroke="${col}" stroke-width="1.1" stroke-linecap="round" filter="url(#rough)"/><circle cx="${x2}" cy="${y2}" r="2.6" fill="${col}"/>`;
}
// a paper card with deckled edge and a soft shadow
function card(x, y, w, h, fill = 'url(#paperP)', rot = 0, extra = '') {
  return `<g transform="rotate(${rot} ${x + w / 2} ${y + h / 2})" filter="url(#shadow)"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" filter="url(#deckle)"/>${extra}</g>`;
}
// a paper tag on a thread
function tagShape(x, y, w, h, fill = P.ivory, rot = 0, thread = [0, 0]) {
  const c = 16;
  const d = `M${x + c} ${y} H${x + w} V${y + h} H${x + c} L${x} ${y + h / 2 + 10} V${y + h / 2 - 10} Z`;
  return `<g transform="rotate(${rot} ${x + w / 2} ${y + h / 2})"><path d="${d}" fill="${fill}" stroke="${P.ivory3}" stroke-width="1" filter="url(#shadowS)"/><circle cx="${x + 14}" cy="${y + h / 2}" r="4.2" fill="none" stroke="${P.brass}" stroke-width="2.2"/></g>`;
}
function lacetrim(x, y, w, col = 'gold', h = 46, rot = 0) {
  return `<g transform="rotate(${rot} ${x + w / 2} ${y + h / 2})"><image href="lace/trim_${col}.webp" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="none" opacity=".95"/></g>`;
}
function doilyImg(cx, cy, d, col = 'gold', op = 1) { return `<image href="lace/doily_${col}.webp" x="${cx - d / 2}" y="${cy - d / 2}" width="${d}" height="${d}" opacity="${op}"/>`; }
function mount(w, h, svg, html) {
  document.getElementById('a').innerHTML = DEFS + `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${svg}</svg>` + html;
  const a = document.getElementById('a'); a.style.width = w + 'px'; a.style.height = h + 'px';
}
// tiny pearl string
function pearlRow(x1, y1, x2, y2, n, r = 3.2, col = '#FBF6EC') {
  let s = ''; for (let i = 0; i <= n; i++) { const t = i / n, x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t; s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${col}" stroke="${P.ivory3}" stroke-width=".6"/><circle cx="${x - r * .35}" cy="${y - r * .35}" r="${r * .35}" fill="#fff" opacity=".9"/>`; }
  return s;
}
const ASSETS = {};
