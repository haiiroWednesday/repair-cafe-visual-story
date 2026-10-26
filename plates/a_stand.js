// the stand of odds: the 3D three-tier stand, with a 3D teacup poured to each kind of thing's fix rate
const addScript = src => new Promise(r => { const s = document.createElement('script'); s.src = src; s.onload = r; document.body.appendChild(s); });
ASSETS.stand = async () => {
  await addScript('objs.js'); await loadObjs();
  const W = 1800, H = 2040, CX = 900, K = 1.1, IX = CX - 680 * K, IY = 160;
  let s = '', h = '';
  // the stand itself: a 3D render. Plate centres and radii measured from it.
  s += `<ellipse cx="${CX}" cy="${IY + 1440 * K}" rx="${640 * K}" ry="${60 * K}" fill="#2B1A10" opacity=".14" filter="url(#glow)"/>`;
  s += `<image href="t3/stand_680_760_E8857B.png" x="${IX}" y="${IY}" width="${1360 * K}" height="${1520 * K}"/>`;
  // the render crops the top of the carrying ring: close the loop in brass
  { const rx0 = IX + 679.5 * K, ry0 = IY + 5 * K, r = 81.5 * K;
    s += `<path d="M${rx0 - r} ${ry0} A${r} ${r} 0 0 1 ${rx0 + r} ${ry0}" fill="none" stroke="#D4B36D" stroke-width="${26 * K}"/>`;
    for (const rr of [r - 13 * K, r + 13 * K]) s += `<path d="M${rx0 - rr} ${ry0 + 1} A${rr} ${rr} 0 0 1 ${rx0 + rr} ${ry0 + 1}" fill="none" stroke="#9C7F45" stroke-width="1.3" opacity=".55"/>`; }
  const PL = [[330, 340, 85], [785, 505, 125], [1275, 670, 170]].map(([y, rx, ry]) => [IY + y * K, rx * K, ry * K]);
  const TIERS = [
    ['nearly always', 'E8857B', [['trousers', 'trousers', 96, '96%', 96], ['coat', 'clothing', 80, 'above 80%', 80], ['bike', 'bicycles', 80, 'above 80%', 80]], [-.6, 0, .6], 205],
    ['better than a coin toss', 'B79FD6', [['radio', 'radios', 56, '56%', 56], ['coffeemaker', 'coffee makers', 55, '55%', 55]], [-.5, .5], 240],
    ['a coin toss or worse', '86AEDC', [['laptop', 'laptops', 45, '45%', 45], ['printer', 'printers', 40, 'about 40%', 40]], [-.5, .5], 265],
  ];
  TIERS.forEach(([title, tint, items, xs, cw], ti) => {
    const [cy, rx, ry] = PL[ti];
    items.forEach(([id, name, pct, lab, cup], i) => {
      const x = CX + xs[i] * rx, base = cy + ry * .38, ch = cw * 780 / 955, top = base - ch;
      // the inked object leans on the saucer, the cup is poured to the odds
      const isz = cw * .55;
      s += `<ellipse cx="${x}" cy="${base - 6}" rx="${cw * .5}" ry="${cw * .1}" fill="#2B1A10" opacity=".12" filter="url(#blur2)"/>`;
      s += `<image href="t3/sc_${tint}_${cup}_c.png" x="${x - cw / 2}" y="${top}" width="${cw}" height="${ch}"/>`;
      s += obj(id, x + (xs[i] < 0 ? -cw * .62 : cw * .12) , base - isz * .95, isz, xs[i] < 0 ? -8 : 8);
      // a food flag on a pick: the figure, and ten dots filled to the odds
      const dr = x < CX - 5 ? -1 : 1, fx = x + dr * cw * .2, fy = top - 104, fw = 168, fh = 78, fl = dr > 0 ? fx : fx - fw;
      s += `<path d="M${fx} ${top + ch * .25} V${fy}" stroke="${P.brass2}" stroke-width="2.4"/><circle cx="${fx}" cy="${fy - 3}" r="4.5" fill="${P.brass}"/>`;
      s += `<path d="${dr > 0 ? `M${fx} ${fy + 4} h${fw} l-16 ${fh / 2} l16 ${fh / 2} h-${fw} z` : `M${fx} ${fy + 4} h-${fw} l16 ${fh / 2} l-16 ${fh / 2} h${fw} z`}" fill="${P.cream}" stroke="${P.ox}" stroke-width="1.2" filter="url(#shadowS)"/>`;
      h += T(fl + (dr > 0 ? 10 : 24), fy + 6, 'num', lab, `width:140px;font-size:${lab.length > 4 ? 21 : 30}px;line-height:${lab.length > 4 ? 1.55 : 1.15};font-weight:600;${lab.length > 4 ? 'font-style:italic;' : ''}`);
      const above = lab.startsWith('above');
      for (let k = 0; k < 10; k++) {
        const dx = fl + (dr > 0 ? 18 : 32) + k * 13, dy = fy + 64, f = Math.max(0, Math.min(1, pct / 10 - k)), cid = 'dc' + ti + i + k;
        s += `<clipPath id="${cid}"><rect x="${dx - 5}" y="${dy - 5}" width="${10 * f}" height="10"/></clipPath>`;
        s += `<circle cx="${dx}" cy="${dy}" r="4.6" fill="none" stroke="${P.ox}" stroke-width="1" ${above && k >= 8 ? 'stroke-dasharray="1.5 1.8"' : ''} opacity="${above && k >= 8 ? .9 : .55}"/>`;
        if (f > 0) s += `<circle cx="${dx}" cy="${dy}" r="4.6" fill="${P.ox}" clip-path="url(#${cid})"/>`;
      }
      h += T(x - 90, base + 6, 'lbl', name, `width:180px;text-align:center;font-size:19px;color:${P.walnut}`);
    });
    // tier title on a ribbon just under the rim
    const tw = 300, ry0 = cy + ry + 16;
    s += `<path d="M${CX - tw / 2 - 16} ${ry0} h16 v-4 h${tw} v4 h16 l-10 16 l10 16 h-${tw + 32} l10 -16 z" fill="${P.ox}" opacity=".93"/>`;
    h += T(CX - tw / 2, ry0, 'script', title, `width:${tw}px;text-align:center;font-size:27px;color:${P.cream};line-height:1.1`);
  });
  // a silk bow tied on the stem at the average
  const BY = PL[0][0] + PL[0][2] + 120;
  s += `<g transform="translate(${CX} ${BY})"><path d="M0 0 C-40 -40 -86 -10 -70 14 C-60 30 -20 14 0 0 C20 14 60 30 70 14 C86 -10 40 -40 0 0" fill="${P.rose}" stroke="${P.rose2}" stroke-width="1.2"/><path d="M0 0 l-30 60 l10 -2 l4 10 z M0 0 l26 62 l-10 -2 l-6 10z" fill="${P.rose2}"/><circle r="9" fill="${P.rose2}"/></g>`;
  s += lead(340, BY + 24, CX - 40, BY, P.walnut2, 20);
  h += T(40, BY + 4, 'lbl', 'the bow marks the average', `font-size:17px;color:${P.ox}`);
  h += T(40, BY + 28, 'note', '63 in 100 things went home working. 13 more were half fixed or sent home with advice. 24 were beyond help.', 'width:290px;font-size:17px');
  // side notes
  h += T(40, 310, 'hand', 'the softer the thing,<br>the fuller the cup', `font-size:22px;line-height:1.7;color:${P.ox};transform:rotate(-4deg)`);
  h += T(40, 410, 'note', 'Things with seams come back nearly every time. Anything with a circuit board is close to a coin toss.', 'width:290px;font-size:17.5px');
  const [mcy, mrx, mry] = PL[1];
  s += lead(W - 330, mcy - 40, CX + .5 * mrx + 90, mcy - 10, P.walnut2, 20);
  h += T(W - 320, mcy - 52, 'lbl', 'most brought of the year', `font-size:17px;color:${P.ox}`);
  h += T(W - 320, mcy - 28, 'note', '1,053 coffee makers, 7.9% of everything carried in. Trousers came second.', 'width:290px;font-size:17px');
  // place card
  const PY = 1850;
  s += `<g transform="rotate(-3 290 ${PY + 80})" filter="url(#shadow)"><path d="M60 ${PY} H520 L540 ${PY + 160} H40 Z" fill="${P.cream}" stroke="${P.ivory3}"/><path d="M60 ${PY} H520" stroke="${P.brass}" stroke-width="2"/></g>`;
  s += `<g transform="rotate(-3 290 ${PY + 80})">${lacetrim(40, PY + 148, 500, 'pink', 26)}</g>`;
  h += `<div class="t" style="left:60px;top:${PY + 12}px;width:470px;transform:rotate(-3deg);text-align:center">
     <div class="script" style="font-size:56px;line-height:1">the stand of odds</div>
     <div class="lbl" style="font-size:15px;margin-top:8px;line-height:1.35">each cup is poured to that kind of thing’s fix rate.<br>13,609 repairs logged by 67 repair cafés in 2019.<br><span style="color:${P.ox}">each flag has ten dots, one for every ten things</span></div></div>`;
  h += T(W - 600, 1980, 'src', 'RepairMonitor analysis 2019, Repair Café International Foundation (13,609 repairs). Bicycle and clothing rates reported as “above 80%”, so their cups are poured to 80.', 'width:560px;text-align:right');
  mount(W, H, s, h);
};
