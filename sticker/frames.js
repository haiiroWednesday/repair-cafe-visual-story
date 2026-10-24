/* Frame builders shared by both versions. Each returns HTML for a <figure class="fr ..."> holding one photo.
   Photos are filled in at runtime from ASSETS.photo by key (img[data-photo]). */
const FR = (() => {
  const FLO = '<svg class="flo {c}" viewBox="0 0 60 60" aria-hidden="true"><path d="M4 56 V22 Q4 4 22 4 H56" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10 50 V24 Q10 10 24 10 H50" fill="none" stroke="currentColor" stroke-width=".9"/><path d="M16 30 q2 -14 16 -14 q-6 4 -6 10 q-6 -2 -10 4z M30 16 q8 0 10 6 q-6 -1 -10 -6z M16 30 q0 8 6 10 q-1 -6 -6 -10z" fill="currentColor" opacity=".85"/><circle cx="34" cy="26" r="2.2" fill="currentColor"/></svg>';
  const corners = () => ['tl', 'tr', 'bl', 'br'].map(c => FLO.replace('{c}', c)).join('');
  const img = k => `<img class="ph-img" data-photo="${k}" alt="Alt text placeholder">`;
  const cap = (c, credit) => `<figcaption>${c}${credit ? `<span class="credit">${credit}</span>` : ''}</figcaption>`;
  const postmark = (city, date) => `<svg class="pm" viewBox="0 0 150 150" aria-hidden="true"><defs><path id="pmc" d="M75 75 m-50 0 a50 50 0 1 1 100 0 a50 50 0 1 1 -100 0"/></defs><g fill="none" stroke="#5F87AA" stroke-width="2"><circle cx="75" cy="75" r="62"/><circle cx="75" cy="75" r="38"/></g><text font-family="Newsreader" font-weight="600" font-size="12" letter-spacing="3" fill="#5F87AA"><textPath href="#pmc">${city}</textPath></text><text x="75" y="80" text-anchor="middle" font-family="Newsreader" font-weight="600" font-size="13" fill="#5F87AA">${date}</text><path d="M-10 128 q12 -8 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 M-10 140 q12 -8 24 0 t24 0 t24 0 t24 0 t24 0 t24 0" fill="none" stroke="#5F87AA" stroke-width="2"/></svg>`;
  const bow = '<svg class="bow" viewBox="0 0 120 70" aria-hidden="true"><path d="M60 30 C40 8 12 6 10 22 C8 38 40 40 60 30 Z" fill="#F2C4CC" stroke="#B8566A" stroke-width="1.2"/><path d="M60 30 C80 8 108 6 110 22 C112 38 80 40 60 30 Z" fill="#F2C4CC" stroke="#B8566A" stroke-width="1.2"/><path d="M56 32 L44 66 L52 60 L58 68 Z M64 32 L76 66 L68 60 L62 68 Z" fill="#EAB0BB" stroke="#B8566A" stroke-width="1"/><ellipse cx="60" cy="30" rx="8" ry="7" fill="#E9A3B1" stroke="#B8566A" stroke-width="1.2"/><path d="M22 18 q14 -2 26 8 M98 18 q-14 -2 -26 8" fill="none" stroke="#FFFFFF" stroke-width="2" opacity=".7"/></svg>';

  // the cuckoo clock polaroid, written on by hand: black marker in the margins, white paint pen on the photo
  const MK = '<defs><filter id="mkInk" x="-5%" y="-20%" width="110%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" result="d"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.1 1.45" result="a"/><feComposite in="d" in2="a" operator="in"/></filter>'
    + '<filter id="mkPaint" x="-5%" y="-20%" width="110%" height="140%"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="9" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4" xChannelSelector="R" yChannelSelector="G" result="d"/><feDropShadow in="d" dx="0" dy="2" stdDeviation="1.5" flood-color="#1a1410" flood-opacity=".55"/></filter>'
    + '<pattern id="tapeDots" width="34" height="34" patternUnits="userSpaceOnUse"><rect width="34" height="34" fill="#F4B9C6"/><circle cx="9" cy="9" r="5" fill="#FFF6F8"/><circle cx="26" cy="26" r="5" fill="#FFF6F8"/></pattern>'
    + '<pattern id="tapeStripe" width="30" height="30" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="30" height="30" fill="#BFE3D2"/><rect width="12" height="30" fill="#E9F7F0"/></pattern></defs>';
  const tape = (x, y, r, fill) => `<g transform="translate(${x} ${y}) rotate(${r})" opacity=".86"><path d="M-190 -46 L-178 -34 L-192 -20 L-178 -6 L-192 8 L-178 22 L-190 46 H190 L178 34 L192 20 L178 6 L192 -8 L178 -22 L190 -46 Z" fill="url(#${fill})"/><path d="M-190 -46 H190" stroke="#fff" stroke-opacity=".5" stroke-width="3"/></g>`;
  const ink = (txt, x, y, size, col, r, f = 'mkInk', anchor = 'middle') => `<text x="${x}" y="${y}" transform="rotate(${r} ${x} ${y})" text-anchor="${anchor}" font-family="Marker" font-size="${size}" fill="${col}" stroke="${col}" stroke-width="${size / 34}" stroke-linejoin="round" paint-order="stroke" filter="url(#${f})">${txt}</text>`;
  const pen = (d, col, w, f = 'mkInk') => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" filter="url(#${f})"/>`;
  const POLA = MK
    + tape(150, 150, -38, 'tapeDots') + tape(1365, 165, 36, 'tapeStripe')
    // on the photo, white paint pen
    + pen('M600 560 C700 548 735 640 728 700 C720 790 620 830 548 808 C470 784 450 690 488 620 C512 576 556 560 612 566', '#FFFFFF', 9, 'mkPaint')
    + ink('tick tock', 330, 470, 96, '#FFFFFF', -8, 'mkPaint') + pen('M300 500 C360 540 420 580 470 640 M470 640 L440 600 M470 640 L428 636', '#FFFFFF', 8, 'mkPaint')
    + ink('the chains!', 360, 1530, 92, '#FFFFFF', -6, 'mkPaint') + pen('M330 1450 C360 1380 380 1330 410 1260 M410 1260 L376 1290 M410 1260 L420 1302', '#FFFFFF', 8, 'mkPaint')
    + ink('cuckoo!', 1060, 262, 92, '#FF9CC0', 4, 'mkPaint') + pen('M960 286 C900 330 830 360 760 400 M760 400 L800 396 M760 400 L782 366', '#FF9CC0', 8, 'mkPaint')
    + pen('M770 820 l0 -40 M750 800 h40 M757 787 l26 26 M783 787 l-26 26', '#FFFFFF', 6, 'mkPaint') + pen('M520 760 l0 -28 M506 746 h28', '#FFFFFF', 6, 'mkPaint')
    // in the margin, black marker
    + ink('Jazz &amp; the cuckoo clock', 740, 1815, 128, '#1C1A20', -2) + pen('M300 1868 C560 1850 900 1858 1210 1838', '#1C1A20', 7)
    + pen('M1330 1880 c-14 -24 -50 -13 -40 14 c8 21 40 37 40 37 c0 0 34 -16 40 -37 c10 -27 -26 -38 -40 -14 z', '#E05A7A', 7)
    + pen('M180 1930 l0 -46 M157 1907 h46 M164 1890 l32 32 M196 1890 l-32 32', '#E3B341', 7);
  const polaroid = (k, c, credit) => `<figure class="fr polaf"><div class="pola"><img class="ph-img" data-photo="${k}" alt="Alt text placeholder"><svg class="ink" viewBox="0 0 1500 2000" preserveAspectRatio="none" aria-hidden="true">${POLA}</svg></div>${cap(c, credit)}</figure>`;
  // the two shoe photos playing on a pair of little retro televisions
  const tv = (k, cls, ch) => `<div class="tv ${cls}"><span class="ant"><i></i><i></i></span><div class="cab"><div class="scr"><img class="ph-img" data-photo="${k}" alt="Alt text placeholder"><span class="crt"></span></div><div class="side"><span class="knob"></span><span class="knob s"></span><span class="grille"></span><span class="ch">${ch}</span></div></div><span class="feet"><i></i><i></i></span></div>`;
  const tvs = (k1, k2, c, credit, label) => `<figure class="fr tvset"><div class="shelf2">${tv(k1, 'a', 'CH 1')}${tv(k2, 'b', 'CH 2')}</div><div class="ledge"></div><span class="tag">${label}</span>${cap(c, credit)}</figure>`;
  return {
    polaroid, tvs,
    mat: (k, c, credit, maxw = 640) => `<figure class="fr matf" style="max-width:${maxw}px"><div class="body">${img(k)}</div>${cap(c, credit)}</figure>`,
    feature: (k, c, credit) => `<figure class="fr feature"><div class="fimg">${img(k)}</div>${cap(c, credit)}</figure>`,
    gilt: (k, c, credit, label, maxw = 760) => `<figure class="fr gilt" style="max-width:${maxw}px"><div class="body">${corners()}<div class="mat">${img(k)}</div><span class="plaque">${label}</span></div>${cap(c, credit)}</figure>`,
    stamp: (k, c, credit, no) => `<figure class="fr stampf"><div class="body"><div class="in">${img(k)}<div class="row"><span>Repair Café · San José</span><b>${no}</b></div></div>${postmark('SAN JOSÉ · CALIFORNIA · ', '18 OCT 2026')}</div>${cap(c, credit)}</figure>`,
    arch: (k, c, credit, flowers) => `<figure class="fr arch"><div class="awn"></div><div class="win"><div class="glass">${img(k)}</div></div><div class="box">${flowers ? `<img src="${flowers}" alt="">` : ''}</div>${cap(c, credit)}</figure>`,
    cameo: (k, c, credit) => `<figure class="fr cameo">${bow}<div class="ring"><div class="oval">${img(k)}</div></div>${cap(c, credit)}</figure>`,
    plate: (k, c, credit, fork, spoon) => `<figure class="fr platef"><div class="table">${fork ? `<img class="cut" src="${fork}" alt="">` : '<span></span>'}<div class="plate"><div class="well">${img(k)}</div></div>${spoon ? `<img class="cut" src="${spoon}" alt="">` : '<span></span>'}</div>${cap(c, credit)}</figure>`,
    ticket: (k, c, credit, no) => `<figure class="fr ticketf"><div class="body">${img(k)}<div class="stub"><span>${no}</span><span class="bars"></span></div></div>${cap(c, credit)}</figure>`,
    cloche: (k, c, credit, label) => `<figure class="fr clochef"><div style="position:relative"><span class="knob"></span><div class="dome">${img(k)}</div></div><div class="plate"></div><div class="foot"></div><span class="tag">${label}</span>${cap(c, credit)}</figure>`,
    menu: (c, head) => `<figure class="fr menuf"><div class="body"><div class="head">${head}</div><div class="slot">your final image</div></div>${cap(c)}</figure>`,
    corners
  };
})();
