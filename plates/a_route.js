// amsterdam to the alameda: the route of the idea as five stamps, each cancelled on its date
ASSETS.route = () => {
  const W = 1580, H = 1120;
  let s = '', h = '';
  const CW = 1500, CH = 1000, X0 = 40, Y0 = 40;
  // the card, with a chevron border in oxblood and bottle green
  s += card(X0, Y0, CW, CH, 'url(#paperP)', 0, `<rect x="${X0}" y="${Y0}" width="${CW}" height="${CH}" fill="${P.cream}" opacity=".55" filter="url(#deckle)"/>`);
  s += `<defs><pattern id="chev" width="56" height="20" patternUnits="userSpaceOnUse"><path d="M0 0 H14 L28 20 H14 Z" fill="${P.ox}"/><path d="M28 0 H42 L56 20 H42 Z" fill="${P.bottle}"/></pattern>
    <mask id="frameM"><rect x="${X0}" y="${Y0}" width="${CW}" height="${CH}" fill="#fff"/><rect x="${X0 + 20}" y="${Y0 + 20}" width="${CW - 40}" height="${CH - 40}" fill="#000"/></mask></defs>`;
  s += `<rect x="${X0 + 6}" y="${Y0 + 6}" width="${CW - 12}" height="${CH - 12}" fill="url(#chev)" mask="url(#frameM)" opacity=".85" filter="url(#rough)"/>`;
  // stamp: perforated paper with an inner frame, a motif, its year and place
  let mid = 0;
  function stamp(x, y, w, hh, rot, bg, ink, motif, yr, place) {
    const id = 'st' + (mid++), r = 5, step = 15;
    let holes = '';
    for (let i = step / 2; i < w; i += step) holes += `<circle cx="${i}" cy="0" r="${r}"/><circle cx="${i}" cy="${hh}" r="${r}"/>`;
    for (let i = step / 2; i < hh; i += step) holes += `<circle cx="0" cy="${i}" r="${r}"/><circle cx="${w}" cy="${i}" r="${r}"/>`;
    let o = `<defs><mask id="${id}"><rect width="${w}" height="${hh}" fill="#fff"/><g fill="#000">${holes}</g></mask></defs>`;
    o += `<g transform="translate(${x} ${y}) rotate(${rot} ${w / 2} ${hh / 2})"><g filter="url(#shadowS)"><rect width="${w}" height="${hh}" fill="#FBF7EE" mask="url(#${id})"/></g>`;
    o += `<rect x="14" y="14" width="${w - 28}" height="${hh - 28}" fill="${bg}"/><rect x="20" y="20" width="${w - 40}" height="${hh - 40}" fill="none" stroke="${ink}" stroke-width="1.2"/>`;
    o += `<g transform="translate(${w / 2} ${hh / 2 - 6})">${motif(ink)}</g>`;
    o += `<text x="28" y="44" font-family="Fraunces" font-weight="700" font-size="22" fill="${ink}">${yr}</text>`;
    o += `<text x="${w / 2}" y="${hh - 30}" text-anchor="middle" font-family="Fell" font-size="${place.length > 11 ? 14.5 : 17}" letter-spacing="1.5" fill="${ink}">${place}</text></g>`;
    return o;
  }
  // a round postmark with the place on its rim and the date in the middle, and wavy cancel lines
  function postmark(cx, cy, top, date, rot = 0, waves = true) {
    const id = 'pm' + (mid++), R = 64;
    let o = `<g transform="rotate(${rot} ${cx} ${cy})" opacity=".78" filter="url(#chalkf)"><defs><path id="${id}" d="M${cx - R + 14} ${cy} A${R - 14} ${R - 14} 0 0 1 ${cx + R - 14} ${cy}"/></defs>`;
    o += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#2E2A3A" stroke-width="2.6"/><circle cx="${cx}" cy="${cy}" r="${R - 26}" fill="none" stroke="#2E2A3A" stroke-width="1.4"/>`;
    o += `<text font-family="Fell" font-size="14.5" letter-spacing="2" fill="#2E2A3A"><textPath href="#${id}" startOffset="50%" text-anchor="middle">${top}</textPath></text>`;
    o += `<text x="${cx}" y="${cy + 6}" text-anchor="middle" font-family="Courier" font-weight="700" font-size="13" fill="#2E2A3A">${date}</text>`;
    if (waves) for (let k = 0; k < 4; k++) o += `<path d="M${cx + R + 8} ${cy - 24 + k * 16} q14 -8 28 0 t28 0 t28 0 t28 0" fill="none" stroke="#2E2A3A" stroke-width="2"/>`;
    return o + `</g>`;
  }
  // motifs
  const M = {
    gables: c => { let o = ''; [[-56, 'step'], [-8, 'neck'], [40, 'step']].forEach(([x, k]) => { o += k === 'step' ? `<path d="M${x - 20} 40 V-10 h6 v-10 h6 v-10 h16 v10 h6 v10 h6 V40 Z" fill="none" stroke="${c}" stroke-width="2"/>` : `<path d="M${x - 20} 40 V-6 h8 v-24 q12 -12 24 0 v24 h8 V40 Z" fill="none" stroke="${c}" stroke-width="2"/>`; for (let r = 0; r < 3; r++) o += `<rect x="${x - 8}" y="${-4 + r * 14}" width="5" height="8" fill="${c}"/><rect x="${x + 3}" y="${-4 + r * 14}" width="5" height="8" fill="${c}"/>`; }); for (let k = 0; k < 3; k++) o += `<path d="M-80 ${52 + k * 8} q10 -5 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" fill="none" stroke="${c}" stroke-width="1.4"/>`; return o; },
    redwood: c => { let o = `<path d="M0 54 V-60" stroke="${c}" stroke-width="5"/>`; for (let i = 0; i < 7; i++) { const y = -58 + i * 15, w = 10 + i * 7; o += `<path d="M${-w} ${y + 14} L0 ${y} L${w} ${y + 14}" fill="none" stroke="${c}" stroke-width="2.2"/>`; } return o + `<path d="M-70 54 H70" stroke="${c}" stroke-width="1.6"/>`; },
    ridge: c => `<circle cx="34" cy="-30" r="16" fill="none" stroke="${c}" stroke-width="2"/><path d="M-76 46 L-40 -6 L-20 14 L10 -34 L44 20 L60 4 L80 46 Z" fill="none" stroke="${c}" stroke-width="2.2"/><path d="M10 -34 l-8 14 l8 -4 l8 6 z" fill="${c}"/><path d="M-80 52 H80" stroke="${c}" stroke-width="1.4"/>`,
    merge: c => `<circle cx="-20" cy="0" r="42" fill="none" stroke="${c}" stroke-width="2.2"/><circle cx="20" cy="0" r="42" fill="none" stroke="${c}" stroke-width="2.2"/><path d="M0 -35 A42 42 0 0 1 0 35 A42 42 0 0 1 0 -35" fill="${c}" opacity=".3"/><text x="-36" y="5" text-anchor="middle" font-family="Fell" font-size="15" fill="${c}">PA</text><text x="36" y="5" text-anchor="middle" font-family="Fell" font-size="15" fill="${c}">MV</text>`,
    rainbow: c => { const RBc = ['#B5463F', '#D98A4A', '#D9B54A', '#5E8C5A', '#4E6FA8', '#7A5A9A']; let o = ''; RBc.forEach((k, i) => o += `<path d="M${-70 + i * 8} 40 A${70 - i * 8} ${70 - i * 8} 0 0 1 ${70 - i * 8} 40" fill="none" stroke="${k}" stroke-width="7"/>`); return o + `<path d="M-18 40 V4 h36 V40" fill="none" stroke="${c}" stroke-width="2"/><path d="M-84 46 H84" stroke="${c}" stroke-width="1.6"/>`; },
  };
  const SW = 196, SH = 236;
  const ST = [
    [110, 170, -4, '#EAD9C8', P.ox, M.gables, '2009', 'AMSTERDAM', 'AMSTERDAM', '18 OCT 2009'],
    [430, 560, 3, '#DCE4D6', P.bottle, M.redwood, '2012', 'PALO ALTO', 'PALO ALTO CA', '14 OCT 2012'],
    [720, 250, -2, '#E2DDE9', '#4A3D64', M.ridge, '2013', 'MOUNTAIN VIEW', 'MOUNTAIN VIEW', '2013'],
    [990, 600, 2.5, '#EFE3CB', P.walnut, M.merge, '2023', 'SILICON VALLEY', 'MERGED', '2023'],
    [1250, 220, -3, '#F1DCD8', P.ox, M.rainbow, '2026', 'SAN JOSÉ', 'SAN JOSE CA', '18 OCT 2026'],
  ];
  // the dotted route between stamp centres
  const C = ST.map(([x, y]) => [x + SW / 2, y + SH / 2]);
  let rd = `M${C[0][0]} ${C[0][1]}`;
  for (let i = 1; i < C.length; i++) { const [ax, ay] = C[i - 1], [bx, by] = C[i]; rd += ` C${ax + 120} ${ay + (by > ay ? 40 : -40)} ${bx - 120} ${by + (by > ay ? -40 : 40)} ${bx} ${by}`; }
  s += `<path d="${rd}" fill="none" stroke="${P.ox}" stroke-width="2.4" stroke-dasharray="2 9" stroke-linecap="round"/>`;
  ST.forEach(([x, y, r, bg, ink, mo, yr, pl]) => s += stamp(x, y, SW, SH, r, bg, ink, mo, yr, pl));
  ST.forEach(([x, y, r, , , , , , top, date], i) => s += postmark(x + SW - 4, y + 58, top, date, [-8, 6, -4, 5, -6][i], i < 4));
  // what happened at each stop
  const NOTE = [
    [330, 300, 'Martine Postma, a journalist, holds the first Repair Café at the Fijnhout Theater.', 300],
    [70, 640, 'Behind the Museum of American Heritage: the first in the U.S. Peter Skinner read about Amsterdam in May and had it running by October.', 330],
    [720, 520, 'A second café opens, founded by Maia and Greg Coladonato.', 240],
    [1220, 740, 'Palo Alto and Mountain View merge into Repair Café Silicon Valley.', 270],
    [1226, 112, 'Billy DeFrank LGBTQ+ Community Center, 938 The Alameda.', 280],
  ];
  NOTE.forEach(([x, y, t, w]) => h += T(x, y, 'note', t, `font-size:16.5px;width:${w}px;line-height:1.28`));
  // distances along the route
  h += T(80, 470, 'lbl', 'about 8,800 km<br>as the crow flies', `font-size:18px;color:${P.ox};width:220px;line-height:1.3`);
  h += T(600, 430, 'lbl', 'about 5 miles', `font-size:16px;color:${P.ox};width:160px`);
  h += T(1110, 470, 'lbl', 'about 15 miles from palo alto', `font-size:16px;color:${P.ox};width:150px;line-height:1.25`);
  // title, written like the address side
  h += T(70, 70, '', 'amsterdam to the alameda', `font-family:Gloock;font-size:40px;color:${P.ink};width:640px`);
  h += T(72, 118, 'lbl', 'the route of an idea, cancelled at every stop', `font-size:16px;width:640px;color:${P.walnut2}`);
  // the tally along the bottom, typed
  const TY = 900;
  s += `<path d="M90 ${TY - 14} H1490" stroke="${P.walnut2}" stroke-width="1" opacity=".5"/>`;
  [['8,790 km', 'Amsterdam to San José, great circle'], ['17 years', 'to the day, 18 Oct to 18 Oct'], ['6,209 days', 'from the first café to this one'], ['3,818', 'Repair Cafés worldwide, Oct 2025']].forEach(([n, t], i) => {
    h += T(90 + i * 352, TY, 'num', n, 'font-size:34px;line-height:1;width:330px');
    h += T(90 + i * 352, TY + 44, 'tw', t, `font-size:14.5px;width:320px;color:${P.walnut}`);
  });
  h += T(40, H - 44, 'src', 'Dates: Wikipedia, Repair Café · Verde Magazine 2012 · KQED 2017 · Repair Café International Foundation. Distances worked from city coordinates on a sphere of radius 6,371 km, rounded. About 5,460 miles. Stamps drawn for this page.', `width:${W - 80}px`);
  mount(W, H, s, h);
};
