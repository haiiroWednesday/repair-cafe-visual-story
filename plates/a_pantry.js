// every spare part has a letter and a shelf: the café's bins drawn as an apothecary cabinet, drawer E3 pulled open
ASSETS.pantry = () => {
  const W = 1640, H = 1860;
  let s = '', h = '';
  const rr = (a => () => (a = (a * 48271) % 2147483647) / 2147483647)(777);
  s += `<defs>
    <linearGradient id="wal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6A4632"/><stop offset=".5" stop-color="#5A3A29"/><stop offset="1" stop-color="#4A2F21"/></linearGradient>
    <linearGradient id="walL" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7C5540"/><stop offset="1" stop-color="#5B3B2A"/></linearGradient>
    <linearGradient id="walD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A1A12"/><stop offset="1" stop-color="#3B2519"/></linearGradient>
    <linearGradient id="br" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.brass3}"/><stop offset=".5" stop-color="${P.brass}"/><stop offset="1" stop-color="${P.brass2}"/></linearGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3B2519"/><stop offset="1" stop-color="#8A6248"/></linearGradient>
    <linearGradient id="bag" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".2" stop-color="#fff" stop-opacity=".2"/><stop offset=".8" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#fff" stop-opacity=".45"/></linearGradient>
    <linearGradient id="kraft" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C9A57C"/><stop offset="1" stop-color="#A9835C"/></linearGradient>
  </defs>`;
  const grain = (x, y, w, hh, n = 7, op = .22) => { let o = ''; for (let i = 0; i < n; i++) { const yy = y + (i + .5) * hh / n + rr() * 6 - 3; o += `<path d="M${x + 6} ${yy} C${x + w * .3} ${yy - 4 + rr() * 8} ${x + w * .6} ${yy - 4 + rr() * 8} ${x + w - 6} ${yy + rr() * 4 - 2}" stroke="#2A1A12" stroke-width="${.6 + rr()}" fill="none" opacity="${op}"/>`; } return o; };
  // brass card-holder plate on a drawer: code big, contents beneath
  const PLATES = [];
  function drawer(x, y, w, hh, code, items, opts = {}) {
    let o = `<rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="url(#walL)" stroke="#2A1A12" stroke-width="1.5"/>`;
    o += grain(x, y, w, hh, 9);
    o += `<rect x="${x + 10}" y="${y + 10}" width="${w - 20}" height="${hh - 20}" fill="none" stroke="#8E6A52" stroke-width="2" opacity=".7"/><rect x="${x + 13}" y="${y + 13}" width="${w - 26}" height="${hh - 26}" fill="none" stroke="#2A1A12" stroke-width="1.2" opacity=".6"/>`;
    const pw = opts.pw || Math.min(w - 50, 230), ph = opts.ph || 92, px = x + (w - pw) / 2, py = y + 22;
    o += `<g filter="url(#shadowS)"><rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="3" fill="url(#br)" stroke="${P.brass2}"/></g><rect x="${px + 7}" y="${py + 7}" width="${pw - 14}" height="${ph - 14}" fill="#F6EEDC" stroke="${P.brass2}" stroke-width=".8"/>`;
    o += `<circle cx="${px + 3.5}" cy="${py + ph / 2}" r="2.4" fill="${P.brass2}"/><circle cx="${px + pw - 3.5}" cy="${py + ph / 2}" r="2.4" fill="${P.brass2}"/>`;
    PLATES.push([px + 7, py + 7, pw - 14, ph - 14, code, items]);
    // cup pull
    const cx = x + w / 2, cy = py + ph + (hh - ph - 22) / 2 + 2;
    o += `<g filter="url(#shadowS)"><path d="M${cx - 34} ${cy - 8} H${cx + 34} Q${cx + 34} ${cy + 18} ${cx} ${cy + 18} Q${cx - 34} ${cy + 18} ${cx - 34} ${cy - 8} Z" fill="url(#br)" stroke="${P.brass2}"/></g><path d="M${cx - 26} ${cy - 4} Q${cx} ${cy + 12} ${cx + 26} ${cy - 4}" stroke="#5E4526" stroke-width="2" fill="none" opacity=".6"/>`;
    o += `<circle cx="${cx - 40}" cy="${cy - 6}" r="3" fill="${P.brass2}"/><circle cx="${cx + 40}" cy="${cy - 6}" r="3" fill="${P.brass2}"/>`;
    return o;
  }
  // ---- cabinet carcass ----
  const X0 = 250, X1 = 1390, Y0 = 290, Y1 = 1700, IX0 = X0 + 40, IX1 = X1 - 40, IW = IX1 - IX0;
  s += `<ellipse cx="${(X0 + X1) / 2}" cy="${Y1 + 50}" rx="${(X1 - X0) / 2 + 40}" ry="26" fill="#2B1A10" opacity=".3" filter="url(#glow)"/>`;
  s += `<g filter="url(#shadow)"><rect x="${X0}" y="${Y0}" width="${X1 - X0}" height="${Y1 - Y0}" fill="url(#wal)" stroke="#2A1A12" stroke-width="2"/></g>`;
  s += grain(X0, Y0, X1 - X0, Y1 - Y0, 40, .14);
  // crown and cornice
  s += `<path d="M${X0 - 40} ${Y0 - 10} H${X1 + 40} L${X1 + 22} ${Y0 + 18} H${X0 - 22} Z" fill="url(#walL)" stroke="#2A1A12" stroke-width="1.5"/>`;
  s += `<rect x="${X0 - 50}" y="${Y0 - 40}" width="${X1 - X0 + 100}" height="32" fill="url(#wal)" stroke="#2A1A12" stroke-width="1.5"/>`;
  for (let x = X0 - 40; x < X1 + 44; x += 22) s += `<rect x="${x}" y="${Y0 - 6}" width="12" height="12" fill="#3B2519" opacity=".7"/>`;
  s += `<path d="M${(X0 + X1) / 2 - 170} ${Y0 - 40} Q${(X0 + X1) / 2} ${Y0 - 120} ${(X0 + X1) / 2 + 170} ${Y0 - 40} Z" fill="url(#wal)" stroke="#2A1A12" stroke-width="1.5"/>`;
  // brass name plaque on the crest
  s += `<g filter="url(#shadowS)"><rect x="${(X0 + X1) / 2 - 120}" y="${Y0 - 92}" width="240" height="50" rx="4" fill="url(#br)" stroke="${P.brass2}"/></g>`;
  h += T((X0 + X1) / 2 - 120, Y0 - 88, '', 'the pantry', `width:240px;text-align:center;font-family:Gloock;font-size:32px;color:#3B2519`);
  // feet
  for (const fx of [X0 + 30, X1 - 90]) s += `<path d="M${fx} ${Y1} h60 l-8 40 q-22 10 -44 0 z" fill="url(#wal)" stroke="#2A1A12"/>`;
  // rail between sections
  const rail = y => `<rect x="${X0 + 10}" y="${y}" width="${X1 - X0 - 20}" height="14" fill="url(#walL)" stroke="#2A1A12"/>`;

  // ---- row 1: D3 E1 E2 ----
  const G = 16, R1 = Y0 + 40, RH1 = 190;
  const w3 = (IW - 2 * G) / 3;
  s += drawer(IX0, R1, w3, RH1, 'D3', ['batteries']);
  s += drawer(IX0 + w3 + G, R1, w3, RH1, 'E1', ['tape · zip ties · string', 'steel wire · sandpaper · dowels']);
  s += drawer(IX0 + 2 * (w3 + G), R1, w3, RH1, 'E2', ['fuses · connectors', 'copper wire']);
  // ---- row 2: E4 F4 F5 F6 ----
  const R2 = R1 + RH1 + G, w4 = (IW - 3 * G) / 4;
  s += drawer(IX0, R2, w4, RH1, 'E4', ['multimeters · power', 'supplies · Kill-A-Watt']);
  s += drawer(IX0 + (w4 + G), R2, w4, RH1, 'F4', ['lubricants']);
  s += drawer(IX0 + 2 * (w4 + G), R2, w4, RH1, 'F5', ['glues']);
  s += drawer(IX0 + 3 * (w4 + G), R2, w4, RH1, 'F6', ['cleaning supplies']);
  // ---- row 3: E3, pulled open ----
  const R3 = R2 + RH1 + G, RH3 = 190;
  s += `<rect x="${IX0}" y="${R3}" width="${IW}" height="${RH3}" fill="url(#walD)" stroke="#1C110B" stroke-width="2"/>`;
  // the drawer box coming toward us: floor from back (inside the slot) to front (lower, wider)
  const FB = R3 + 34, FF = R3 + 360, ex = 26;
  s += `<path d="M${IX0 + 14} ${FB} H${IX1 - 14} L${IX1 + ex} ${FF} H${IX0 - ex} Z" fill="url(#floor)"/>`;
  s += grain(IX0, FB + 60, IW, FF - FB - 60, 10, .18);
  // side walls
  s += `<path d="M${IX0 + 14} ${FB} L${IX0 - ex} ${FF} V${FF - 54} L${IX0 + 14} ${FB - 26} Z" fill="url(#walL)" stroke="#2A1A12"/>`;
  s += `<path d="M${IX1 - 14} ${FB} L${IX1 + ex} ${FF} V${FF - 54} L${IX1 - 14} ${FB - 26} Z" fill="url(#walL)" stroke="#2A1A12"/>`;
  s += `<path d="M${IX0 + 14} ${FB - 26} H${IX1 - 14} V${FB} H${IX0 + 14} Z" fill="#6A4632" stroke="#2A1A12"/>`;
  // four boxes on the floor, each with green tape labels
  const BOX = [['PLUGS'], ['SWITCHES'], ['VCR BELTS', 'CLOCK PARTS'], ['EYEGLASS', 'KITCHENAID MIXER', '& BLENDER']];
  const bw = (IW - 70) / 4, by = FB + 70, bh = 200;
  BOX.forEach((labs, i) => {
    const bx = IX0 + 14 + i * (bw + 14);
    // box: open top seen from the front-above
    s += `<path d="M${bx + 10} ${by} H${bx + bw - 10} L${bx + bw} ${by + 34} H${bx} Z" fill="#7A5A3E" stroke="#5E432C"/>`;
    // contents peeking out
    const it = i === 0 ? 'plug' : i === 1 ? 'sw' : i === 2 ? 'belt' : 'mix';
    for (let k = 0; k < 5; k++) {
      const cx = bx + 24 + k * (bw - 48) / 4, cy = by + 20 + (k % 2) * 6;
      if (it === 'plug') s += `<g transform="translate(${cx} ${cy}) rotate(${-20 + k * 12})"><rect x="-10" y="-8" width="20" height="16" rx="4" fill="${k % 2 ? '#EFE6D3' : '#2E2925'}"/><path d="M-4 -8 v-8 M4 -8 v-8" stroke="${P.brass}" stroke-width="2.4"/></g>`;
      if (it === 'sw') s += `<g transform="translate(${cx} ${cy}) rotate(${-15 + k * 9})"><rect x="-13" y="-7" width="26" height="14" rx="5" fill="${k % 2 ? '#EFE6D3' : '#3A332E'}"/><rect x="-4" y="-11" width="8" height="6" fill="${P.ox}"/></g>`;
      if (it === 'belt') s += `<ellipse cx="${cx}" cy="${cy}" rx="16" ry="8" fill="none" stroke="#2E2925" stroke-width="3.4" transform="rotate(${k * 25} ${cx} ${cy})"/>`;
      if (it === 'mix') s += k % 2 ? `<circle cx="${cx}" cy="${cy}" r="9" fill="#C9CDD1" stroke="#7D8389"/>` : `<path d="M${cx - 12} ${cy} q12 -14 24 0" stroke="#B9BEC3" stroke-width="3" fill="none"/>`;
    }
    s += `<rect x="${bx}" y="${by + 34}" width="${bw}" height="${bh - 34}" fill="url(#kraft)" stroke="#7A5A3E" stroke-width="1.2" filter="url(#shadowS)"/>`;
    s += `<path d="M${bx + 6} ${by + 34} V${by + bh - 6}" stroke="#8C6A48" stroke-width="1" opacity=".6"/>`;
    // green tape strips
    labs.forEach((L, j) => {
      const ty = by + 54 + j * 40, tw = Math.min(bw - 26, 18 + L.length * 13.5), tx = bx + (bw - tw) / 2 + (j % 2 ? 6 : -4), rot = (j % 2 ? 1.6 : -1.4) + i * .3;
      s += `<rect x="${tx}" y="${ty}" width="${tw}" height="32" fill="#5E9B6A" opacity=".93" transform="rotate(${rot} ${tx + tw / 2} ${ty + 16})"/>`;
      s += `<path d="M${tx} ${ty} l3 4 l-3 4 l3 4 l-3 4 l3 4 l-3 4 l3 4 M${tx + tw} ${ty} l-3 4 l3 4 l-3 4 l3 4 l-3 4 l3 4 l-3 4" stroke="#F4ECDD" stroke-width="1.2" fill="none" opacity=".5" transform="rotate(${rot} ${tx + tw / 2} ${ty + 16})"/>`;
      h += T(tx, ty + 2, '', L, `width:${tw}px;text-align:center;font-family:Kalam;font-weight:700;font-size:${L.length > 12 ? 15 : 17}px;color:#14261A;transform:rotate(${rot}deg);white-space:nowrap`);
    });
  });
  // the drawer front, pulled out toward us
  const DF = FF - 40;
  s += drawer(IX0 - ex - 8, DF, IW + 2 * ex + 16, 200, 'E3', ['lamp parts · light bulbs · appliance parts', 'plugs · switches'], { ph: 92, pw: 440 });
  // ---- textile shelf ----
  const R4 = DF + 200 + 20, R4H = Y1 - 30 - R4;
  s += rail(R4 - 16);
  s += `<rect x="${IX0}" y="${R4}" width="${IW}" height="${R4H}" fill="url(#walD)" stroke="#1C110B" stroke-width="2"/>`;
  s += `<rect x="${IX0 + 6}" y="${R4 + 6}" width="${IW - 12}" height="${R4H - 12}" fill="url(#paperP)" opacity=".18"/>`;
  // eight ziploc bags
  const BAGS = [['A', 'bobbins,', 'safety pins'], ['A', 'needles,', 'thimbles'], ['A', 'sewing', 'tools'], ['B', 'tapes &', 'ribbons'], ['B', 'glue,', 'Fray Check'], ['B', 'cords,', 'webbing'], ['', 'velcro', ''], ['', 'fusibles', '']];
  const gw = 92, gg = 10, gy = R4 + 46, gh = R4H - 64;
  BAGS.forEach(([L, a, b], i) => {
    const gx = IX0 + 18 + i * (gw + gg), rot = (i % 3 - 1) * 1.4;
    let o = `<g transform="rotate(${rot} ${gx + gw / 2} ${gy + gh})">`;
    // contents silhouettes
    const tint = [P.rose, P.brass3, P.blue, P.lilac, P.mint, P.rose3, P.ivory3, P.sage][i];
    for (let k = 0; k < 16; k++) { const cy = gy + gh - 16 - Math.pow(rr(), 1.6) * gh * .5, r = 5 + rr() * 8; o += `<circle cx="${gx + 14 + rr() * (gw - 28)}" cy="${cy}" r="${r}" fill="${tint}" stroke="${P.walnut2}" stroke-width=".6" stroke-opacity=".4" opacity=".9"/>`; }
    o += `<rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" rx="4" fill="url(#bag)" stroke="#E9EEF0" stroke-width="1.6" opacity=".95"/>`;
    o += `<path d="M${gx + 4} ${gy + 14} H${gx + gw - 4}" stroke="${P.blue2}" stroke-width="2.4" opacity=".8"/><path d="M${gx + 4} ${gy + 19} H${gx + gw - 4}" stroke="#fff" stroke-width="1.4" opacity=".7"/>`;
    o += `<rect x="${gx + 6}" y="${gy + 30}" width="${gw - 12}" height="${L ? 76 : 44}" fill="#5E9B6A" opacity=".93"/>`;
    o += `</g>`;
    s += o;
    h += T(gx + 6, gy + 32, '', (L ? `<div style="font-size:24px;line-height:1">${L}</div>` : '') + `<div style="font-size:14.5px;line-height:1.05">${a}<br>${b}</div>`, `width:${gw - 12}px;text-align:center;font-family:Kalam;font-weight:700;color:#14261A;transform:rotate(${rot}deg);transform-origin:${gw / 2 - 6}px ${gh - 32}px`);
  });
  // zipper box and jewelry bin
  const zx = IX0 + 18 + 8 * (gw + gg) + 6, zw = IX1 - zx - 18, zy = R4 + 90;
  s += `<g filter="url(#shadowS)"><rect x="${zx}" y="${zy}" width="${zw}" height="96" fill="#E8DCC6" stroke="#9C8A70"/></g>`;
  for (let k = 0; k < 9; k++) s += `<path d="M${zx + 14 + k * 9} ${zy + 74} l4 -6 l4 6" stroke="${[P.ox, P.bottle, P.blue2][k % 3]}" stroke-width="2.2" fill="none"/>`;
  s += `<rect x="${zx + 14}" y="${zy + 12}" width="${zw - 28}" height="40" fill="#5E9B6A" opacity=".93"/>`;
  h += T(zx + 14, zy + 14, '', 'zipper<br>repair A', `width:${zw - 28}px;text-align:center;font-family:Kalam;font-weight:700;font-size:14.5px;line-height:1.1;color:#14261A`);
  const jy = zy + 116;
  s += `<g filter="url(#shadowS)"><rect x="${zx}" y="${jy}" width="${zw}" height="${R4 + R4H - 18 - jy}" fill="${P.rose3}" stroke="${P.rose2}"/></g>`;
  for (let k = 0; k < 6; k++) s += `<circle cx="${zx + 20 + (k % 3) * (zw - 40) / 2}" cy="${jy + 82 + Math.floor(k / 3) * 26}" r="9" fill="#F7F1E6" stroke="${P.brass}" stroke-width="1.6"/>`;
  s += `<rect x="${zx + 10}" y="${jy + 12}" width="${zw - 20}" height="52" fill="#F6EEDC" stroke="${P.rose2}"/>`;
  h += T(zx + 10, jy + 14, '', '<b>bin C</b><br>jewelry repair', `width:${zw - 20}px;text-align:center;font-family:Kalam;font-size:14px;line-height:1.1;color:${P.ox}`);
  // plate lettering
  PLATES.forEach(([x, y, w, hh, code, items]) => {
    h += T(x, y + 4, '', `<div style="font-family:Fraunces;font-weight:600;font-size:30px;line-height:1;color:${P.ox}">${code}</div><div style="font-family:Fell;font-size:${items.join('').length > 40 ? 14 : 15.5}px;line-height:1.2;letter-spacing:.03em;color:${P.walnut};margin-top:3px">${items.join('<br>')}</div>`, `width:${w}px;text-align:center;height:${hh}px`);
  });

  // ---- header ----
  h += `<div class="t" style="left:60px;top:30px;width:760px">
    <div style="font-family:Gloock;font-size:52px;line-height:1.02;color:${P.walnut}">every spare part has a letter and a shelf</div></div>`;
  h += T(890, 40, '', 'D is batteries. E is everything electrical, from fuses to candelabra bulbs. F is the wet shelf: oils, glues and cleaners. Sewing packs itself into bags A, B and C, and zippers earn a box of their own.', `width:680px;font-family:Fraunces;font-style:italic;font-size:18px;line-height:1.38;color:${P.walnut}`);
  // ---- side notes on pinned slips ----
  const slip = (x, y, w, hh, rot, txt, col = P.walnut) => {
    s += `<g transform="rotate(${rot} ${x + w / 2} ${y + hh / 2})" filter="url(#shadowS)"><rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="#FBF6EC"/><circle cx="${x + w / 2}" cy="${y + 10}" r="6" fill="${P.ox}"/><circle cx="${x + w / 2 - 2}" cy="${y + 8}" r="2" fill="#fff" opacity=".7"/></g>`;
    h += T(x + 14, y + 24, 'note', txt, `width:${w - 28}px;font-size:18px;line-height:1.28;color:${col};transform:rotate(${rot}deg);transform-origin:${w / 2 - 14}px ${hh / 2 - 24}px`);
  };
  slip(40, 900, 200, 176, -4, 'When a fixer calls for a plug, someone walks to <b style="color:' + P.ox + '">E3</b>.');
  s += `<path d="M232 1010 C 300 1030 300 ${DF + 60} ${IX0 - 34} ${DF + 96}" fill="none" stroke="${P.ox}" stroke-width="1.6" filter="url(#rough)"/><path d="M${IX0 - 50} ${DF + 84} l16 12 l-18 6" fill="none" stroke="${P.ox}" stroke-width="1.6"/>`;
  slip(1404, 1380, 210, 210, 3, 'Eight ziploc bags, green tape, one marker. The whole textile kit fits in a tote bag.');
  slip(36, 360, 200, 150, 3, 'The battery tester lives in <b style="color:' + P.ox + '">D3</b>, first out for any clock.');
  s += `<path d="M236 400 C 262 380 272 370 ${IX0 + 12} 372" fill="none" stroke="${P.walnut2}" stroke-width="1.3" filter="url(#rough)"/>`;
  slip(1410, 530, 200, 196, -3, 'The glue tub is <b style="color:' + P.ox + '">F5</b>, with the MIT D-Lab glue chart taped up above it.');
  // the honest caption
  h += T(1410, 900, '', 'Drawn as one cabinet. The real pantry is lettered bins and totes, carried in each morning and packed away by three.', `width:200px;font-family:Fraunces;font-style:italic;font-size:15.5px;line-height:1.35;color:${P.walnut2}`);
  h += T(60, H - 52, 'src', 'Bin codes and contents copied from the café’s sign cards and tape labels, Repair Café Silicon Valley, Oct 18 2026. Which tape label sits on which box inside E3 is drawn approximately.', `width:${W - 120}px`);
  mount(W, H, s, h);
};
