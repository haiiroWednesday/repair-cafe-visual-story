// Sunday's menu: what came to the tables on Oct 18, in the owners' words, with the endings as dessert
ASSETS.menu = () => {
  const W = 1140, H = 2240;
  const CX = 60, CY = 60, CW = 1020, CHh = 2120; // card
  let s = '', h = '';
  s += `<defs><radialGradient id="mnG" cx=".5" cy=".4" r=".8"><stop offset="0" stop-color="#FCF7EC"/><stop offset="1" stop-color="#EEE2CA"/></radialGradient>
    <linearGradient id="giltG" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="${P.brass2}"/><stop offset=".3" stop-color="${P.brass3}"/><stop offset=".55" stop-color="${P.brass}"/><stop offset=".8" stop-color="#E6D3A3"/><stop offset="1" stop-color="${P.brass2}"/></linearGradient></defs>`;
  // the card: paper, a stain of age at the edges, gilt rules
  s += `<rect x="${CX}" y="${CY}" width="${CW}" height="${CHh}" fill="url(#paperP)" filter="url(#shadow)"/>`;
  s += `<rect x="${CX}" y="${CY}" width="${CW}" height="${CHh}" fill="url(#mnG)" opacity=".7"/>`;
  s += `<rect x="${CX + 26}" y="${CY + 26}" width="${CW - 52}" height="${CHh - 52}" fill="none" stroke="url(#giltG)" stroke-width="5"/>`;
  s += `<rect x="${CX + 38}" y="${CY + 38}" width="${CW - 76}" height="${CHh - 76}" fill="none" stroke="url(#giltG)" stroke-width="1.4"/>`;
  // corner flourishes
  const corner = (x, y, sx, sy) => `<g transform="translate(${x} ${y}) scale(${sx} ${sy})" fill="none" stroke="url(#giltG)" stroke-width="2.2" stroke-linecap="round">
    <path d="M0 60 C0 20 20 0 60 0"/><path d="M14 74 C10 34 34 12 74 14"/><path d="M60 0 C78 0 86 14 76 24 C68 32 56 24 62 16"/><path d="M0 60 C0 78 14 86 24 76 C32 68 24 56 16 62"/>
    <circle cx="30" cy="30" r="5" fill="${P.brass}"/><path d="M30 30 L52 52" stroke-width="1.2"/></g>`;
  s += corner(CX + 30, CY + 30, 1, 1) + corner(CX + CW - 30, CY + 30, -1, 1) + corner(CX + 30, CY + CHh - 30, 1, -1) + corner(CX + CW - 30, CY + CHh - 30, -1, -1);
  // lace along top and bottom
  s += lacetrim(CX - 10, CY - 22, CW + 20, 'gold', 50);
  s += `<g transform="rotate(180 ${CX + CW / 2} ${CY + CHh})">${lacetrim(CX - 10, CY + CHh - 28, CW + 20, 'gold', 50)}</g>`;
  // a faded rose wash in one corner, as if a flower was pressed here

  const mid = CX + CW / 2;
  // masthead
  h += T(CX, CY + 82, 'lbl', 'REPAIR CAFÉ · SILICON VALLEY', `width:${CW}px;text-align:center;font-size:20px;letter-spacing:.28em;color:${P.walnut2}`);
  h += T(CX, CY + 104, 'script', 'Menu', `width:${CW}px;text-align:center;font-size:150px;line-height:1.1`);
  h += T(CX, CY + 278, 'src', 'Sunday, 18 October 2026 · served 11 to 3 · 938 The Alameda, San José', `width:${CW}px;text-align:center;font-size:18px`);
  const flourish = (y, w = 300) => `<path d="M${mid - w / 2} ${y} C${mid - w / 4} ${y - 10} ${mid - 30} ${y + 8} ${mid} ${y} C${mid + 30} ${y - 8} ${mid + w / 4} ${y + 10} ${mid + w / 2} ${y}" fill="none" stroke="${P.brass}" stroke-width="1.6"/><path d="M${mid - 8} ${y} l8 -8 l8 8 l-8 8 z" fill="${P.ox}"/>`;
  s += flourish(CY + 328, 380);

  // when the orders came in: the three printed slips on a ruler from doors to close
  const RX = CX + 110, RW = CW - 220, RY = CY + 470, tx = m => RX + RW * m / 240;
  h += T(CX, RY - 106, 'lbl', 'when the orders came in', `width:${CW}px;text-align:center;font-size:17px;letter-spacing:.2em;color:${P.walnut2}`);
  s += `<rect x="${RX}" y="${RY}" width="${tx(210) - RX}" height="14" fill="${P.rose}" opacity=".5"/><rect x="${tx(210)}" y="${RY}" width="${tx(240) - tx(210)}" height="14" fill="${P.ivory3}" opacity=".8"/>`;
  s += `<rect x="${RX}" y="${RY}" width="${RW}" height="14" fill="none" stroke="${P.walnut}" stroke-width="1.2"/>`;
  for (let m = 0; m <= 240; m += 15) { const big = m % 60 === 0; s += `<path d="M${tx(m)} ${RY + 14} v${big ? 14 : 7}" stroke="${P.walnut}" stroke-width="${big ? 1.4 : .8}"/>`; if (big) h += T(tx(m) - 30, RY + 30, 'lbl', ['11:00', '12:00', '1:00', '2:00', '3:00'][m / 60], 'width:60px;text-align:center;font-size:16px'); }
  [[47, '11:47', 'sewing machine'], [117, '12:57', 'pants'], [167, '1:47', 'table fan']].forEach(([m, t, n]) => {
    s += `<path d="M${tx(m)} ${RY - 4} V${RY - 30}" stroke="${P.ox}" stroke-width="1.4"/><circle cx="${tx(m)}" cy="${RY + 7}" r="5.5" fill="${P.ox}"/>`;
    h += T(tx(m) - 80, RY - 58, 'note', `<b style="font-weight:700">${t}</b> ${n}`, `width:160px;text-align:center;font-size:17px;color:${P.ox}`);
  });
  s += `<path d="M${tx(210)} ${RY + 14} v26" stroke="${P.walnut2}" stroke-width="1.2" stroke-dasharray="2 3"/>`;
  h += T(tx(210) - 70, RY + 52, 'src', 'check-in closes 2:30', 'width:140px;text-align:center;font-size:14px');

  // the courses: what came to each table, in the owner's words
  const fl = `<svg width="220" height="20" viewBox="0 0 220 20" style="position:static;display:block;margin:2px auto 12px"><path d="M10 10 C60 0 90 18 110 10 C130 2 160 20 210 10" fill="none" stroke="${P.brass}" stroke-width="1.6"/><path d="M102 10 l8 -8 l8 8 l-8 8 z" fill="${P.ox}"/></svg>`;
  const course = (n, sub) => `<div class="script" style="text-align:center;font-size:50px;line-height:1;margin-top:34px">${n}</div><div class="lbl" style="text-align:center;font-size:14px;letter-spacing:.18em;color:${P.walnut2};margin-top:2px">${sub}</div>${fl}`;
  const dish = (name, price, said, desc) => `<div style="margin:0 0 16px"><div style="display:flex;align-items:baseline;gap:10px">
      <span class="lbl" style="font-size:24px;color:${P.ink};white-space:nowrap">${name}</span>
      <span style="flex:1;border-bottom:2px dotted ${P.brass};transform:translateY(-5px)"></span>
      <span style="font-family:Fraunces;font-style:italic;font-weight:500;font-size:22px;color:${P.ox};white-space:nowrap">${price}</span></div>
      ${said ? `<div style="font-family:Courier;font-size:16px;color:#3A332E;margin:5px 0 0 18px">“${said}”</div>` : ''}
      <div style="font-family:Fraunces;font-style:italic;font-weight:400;font-size:17.5px;line-height:1.35;color:${P.walnut2};margin:4px 130px 0 18px">${desc}</div></div>`;
  let m = '';
  m += course('from the textile table', 'sewing · textiles');
  m += dish('Sewing machine', 'free', 'Needle hits the foot. Misaligned', 'ticket #1. the usual suspects, in order: a needle in backwards, a bent one, the wrong foot.');
  m += dish('Pants', 'free', 'Tear in the inner thigh', 'ticket #2, for the Innov-is PS500 on the counter, one of three donated machines');
  m += course('from the appliance tables', 'basic appliances · lamp · clocks');
  m += dish('Portable fan, table top', 'free', 'Stopped working', 'ticket #1 of the household, routed to basic appliances / lamp');
  m += dish('Heart clock with roses', 'free', '', 'a gold heart, moulded roses, a bouquet on its face. served in pieces: the glass on the table, the numeral ring in the toolbox, read under a magnifier by two women.');
  m += dish('Brass candelabra', 'free', '', 'two candle bulbs, 25 watts each, on E12 bases. lit and working on the lamp table.');
  m += course('from the electronics bench', 'bench 2');
  m += dish('Stereo, two boxes, August 2003', 'one afternoon', '', 'they talk through one control cable, and no spare exists. so all twenty strands were stripped, matched by colour and soldered pin to pin. then the blue ring lit and the disc spun. mine.');
  m += course('for dessert', 'how each order ends');
  m += dish('Fixed', 'about half', '', 'home the same afternoon. the café’s own count says 50 to 70%.');
  m += dish('Needs a part', '15 to 20%', '', 'a diagnosis and a part number to take home and order');
  m += dish('Beyond saving', 'the rest', '', 'recycled with Zero Waste Silicon Valley, a few tables over');
  h += `<div class="t" style="left:${CX + 110}px;top:${CY + 560}px;width:${CW - 220}px">${m}</div>`;
  // the chef's note, by hand
  h += T(CX + 90, CY + CHh - 236, 'hand', 'chef’s note: every price is free, parts at cost. what you pay in is an afternoon.', `width:${CW - 180}px;text-align:center;font-size:21px;line-height:1.75;color:${P.ox};transform:rotate(-1.5deg)`);
  h += T(CX + 70, CY + CHh - 112, 'src', 'Orders and owners’ words from the printed tickets, Repair Café Silicon Valley, Oct 18 2026. Heart clock, candelabra and stereo from my photos. Endings: café FAQ and Los Altos Town Crier, 2026.', `width:${CW - 140}px;text-align:center`);
  mount(W, H, s, h);
};
