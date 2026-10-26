// a lamp in five parts: a botanical-style plate around the brass candelabra from the lamp table
ASSETS.lamp = () => {
  const W = 1500, H = 1560;
  let s = '', h = '';
  // the plate: aged card with a double engraved rule
  s += card(20, 20, W - 40, H - 40, 'url(#paperP)', 0);
  s += `<rect x="20" y="20" width="${W - 40}" height="${H - 40}" fill="#F6EEDC" opacity=".62"/>`;
  s += `<rect x="54" y="54" width="${W - 108}" height="${H - 108}" fill="none" stroke="${P.walnut}" stroke-width="2.2" opacity=".75"/>`;
  s += `<rect x="64" y="64" width="${W - 128}" height="${H - 128}" fill="none" stroke="${P.walnut}" stroke-width=".8" opacity=".6"/>`;
  // corner fleurons
  const fl = (x, y, r) => `<g transform="translate(${x} ${y}) rotate(${r})" fill="none" stroke="${P.brass2}" stroke-width="1.3"><path d="M0 0 C14 -2 22 6 20 18 C18 8 10 4 0 6Z" fill="${P.brass}" opacity=".7"/><path d="M0 0 C-2 14 6 22 18 20 C8 18 4 10 6 0Z" fill="${P.brass}" opacity=".7"/><circle cx="4" cy="4" r="3" fill="${P.ox}" stroke="none"/></g>`;
  s += fl(64, 64, 0) + fl(W - 64, 64, 90) + fl(W - 64, H - 64, 180) + fl(64, H - 64, 270);

  // lamp image placement: original 900x1395
  const ox = 600, oy = 70, sc = .96, M = (x, y) => [ox + x * sc, oy + y * sc];
  // soft halo behind the bulbs
  const [b1x, b1y] = M(349, 160), [b2x, b2y] = M(584, 160), [b0x, b0y] = M(305, 150);
  s += `<circle cx="${b1x}" cy="${b1y}" r="70" fill="#FFE2A0" opacity=".45" filter="url(#glow)"/><circle cx="${b2x}" cy="${b2y}" r="70" fill="#FFE2A0" opacity=".45" filter="url(#glow)"/>`;
  // shadow under the base
  const [bx, by] = M(450, 1230);
  s += `<ellipse cx="${bx}" cy="${by}" rx="260" ry="22" fill="#2B1A10" opacity=".22" filter="url(#glow)"/>`;
  // the cord: leaves the back of the base, loops down and left, through the inline switch, to the plug
  const [cx0, cy0] = M(470, 1060);
  const cord = `M${cx0} ${cy0} C${cx0 - 60} ${cy0 + 40} ${cx0 - 40} 1290 ${cx0 - 220} 1300 S 640 1300 560 1318`;
  const cord2 = `M500 1322 C 420 1336 360 1300 300 1330 S 220 1360 196 1346`;
  const cordDraw = d => `<path d="${d}" fill="none" stroke="#5A4232" stroke-width="9" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#8C6A50" stroke-width="5" stroke-dasharray="3 4" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#C9A98A" stroke-width="1.4" stroke-dasharray="1 6" opacity=".8"/>`;
  s += cordDraw(cord) + cordDraw(cord2);
  // current path drawn as an amber dotted line along the cord, up the centre column, to the bulb
  const [colx, coly0] = M(349, 1040), [, coly1] = M(349, 230);
  const cur = `M150 1338 L196 1346 ${cord2.replace('M500 1322', '').replace(/^ *C/, 'C')}`;
  s += `<path d="M196 1346 C 220 1360 300 1330 300 1330 C 360 1300 420 1336 500 1322 L 560 1318 C 640 1300 ${cx0 - 220} 1300 ${cx0 - 220} 1300 C ${cx0 - 40} 1290 ${cx0 - 60} ${cy0 + 40} ${cx0} ${cy0}" fill="none" stroke="#F2B640" stroke-width="2.4" stroke-dasharray="2 9" stroke-linecap="round" />`;
  // the lamp itself
  s += `<image href="blend/candelabra_clean.png" x="${ox}" y="${oy}" width="${900 * sc}" height="${1395 * sc}"/>`;

  s += `<path d="M${colx} ${coly0} V${coly1}" stroke="#FFC24A" stroke-width="3.4" stroke-dasharray="2 9" stroke-linecap="round" opacity=".9"/>`;
  for (let i = 0; i < 4; i++) { const y = coly0 - 120 - i * 190; s += `<path d="M${colx - 7} ${y + 8} L${colx} ${y - 4} L${colx + 7} ${y + 8}" fill="none" stroke="#FFD27A" stroke-width="2.4" stroke-linecap="round"/>`; }
  // inline switch on the cord
  s += `<g transform="translate(530 1320) rotate(-4)" filter="url(#shadowS)"><rect x="-38" y="-17" width="76" height="34" rx="9" fill="#EFE3CC" stroke="${P.walnut2}" stroke-width="1.4"/><rect x="-14" y="-24" width="28" height="12" rx="3" fill="${P.ox}" stroke="${P.walnut}" stroke-width="1"/><path d="M-30 0 H30" stroke="${P.ivory3}" stroke-width="1"/></g>`;
  // the plug
  s += `<g transform="translate(150 1338) rotate(-8)" filter="url(#shadowS)"><path d="M0 -26 H38 C48 -26 52 -16 52 0 C52 16 48 26 38 26 H0 Z" fill="#EFE3CC" stroke="${P.walnut2}" stroke-width="1.4"/><path d="M8 -20 V20 M16 -20 V20" stroke="${P.ivory3}" stroke-width="1"/>
    <rect x="-34" y="-15" width="36" height="7" fill="url(#brassG2)" stroke="${P.brass2}" stroke-width=".8"/><rect x="-34" y="8" width="36" height="7" fill="url(#brassG2)" stroke="${P.brass2}" stroke-width=".8"/></g>`;
  s = `<defs><linearGradient id="brassG2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.brass3}"/><stop offset="1" stop-color="${P.brass2}"/></linearGradient></defs>` + s;

  // numbered parts along the current path
  const num = (x, y, n) => `<g filter="url(#shadowS)"><circle cx="${x}" cy="${y}" r="17" fill="${P.ox}" stroke="${P.brass3}" stroke-width="2"/></g>`;
  const NUMS = [];
  const part = (n, nx, ny, tx, ty, name, body, tw = 300, target) => {
    s += num(nx, ny, n); NUMS.push([nx, ny, n]);
    if (target) s += lead(nx + (target[0] > nx ? 18 : -18), ny, target[0], target[1], P.walnut2, 0);
    h += T(tx, ty, 'lbl', name, `font-size:24px;color:${P.ox};letter-spacing:.08em`);
    h += T(tx, ty + 30, '', body, `width:${tw}px;font-family:Fraunces;font-style:italic;font-size:17px;color:${P.walnut};line-height:1.3`);
  };
  // 1 plug
  part(1, 112, 1240, 140, 1222, 'plug', 'Prongs bend, and the screws inside work loose.', 260, [130, 1310]);
  // 2 cord
  part(2, 420, 1150, 448, 1132, 'cord', '<b style="font-weight:600;color:' + P.ox + '">The most common fault.</b> A wire breaks inside, where the cord bends at the plug or at the base.', 300, [432, 1322]);
  // 3 switch
  part(3, 860, 1330, 888, 1312, 'switch', '<b style="font-weight:600;color:' + P.ox + '">The second most common.</b> The contacts inside wear down.', 420, [570, 1318]);
  // 4 socket
  const [skx, sky] = M(584, 262);
  part(4, 1245, 330, 1272, 312, 'socket', 'E12 candelabra base, 12 mm across. The brass tab inside loses its spring.', 170, [skx + 26, sky]);
  // 5 bulb
  part(5, 1245, 120, 1272, 102, 'bulb', '25 watts each. Check it first. It is the cheapest fix of all.', 170, [b2x + 22, b2y - 10]);
  NUMS.forEach(([x, y, n]) => { h += T(x - 17, y - 15, '', n, `width:34px;text-align:center;font-family:Fraunces;font-weight:600;font-size:21px;color:${P.ivory}`); });

  // the cut-away: the 3D render of an E12 socket opened up, under a tall magnifier lens
  const RX = 300, RY = 700, LRX = 170, LRY = 290, KS = .43;
  const sx0 = RX - 300 * KS, sy0 = RY - 650 * KS;
  const SA = {tab: [0.5, 0.757], tip: [0.5, 0.6861], shell: [0.5, 0.5251], threads: [0.6858, 0.614], sleeve: [0.8133, 0.4389], glass: [0.6951, 0.2302], hot: [0.5416, 0.983], neutral: [0.4593, 0.961]};
  const sat = n => [sx0 + SA[n][0] * 600 * KS, sy0 + SA[n][1] * 1300 * KS];
  s += `<defs><clipPath id="lens"><ellipse cx="${RX}" cy="${RY}" rx="${LRX}" ry="${LRY}"/></clipPath></defs>`;
  s += `<ellipse cx="${RX}" cy="${RY}" rx="${LRX + 12}" ry="${LRY + 12}" fill="${P.cream}" filter="url(#shadow)"/>`;
  s += `<g clip-path="url(#lens)"><rect x="${RX - LRX}" y="${RY - LRY}" width="${LRX * 2}" height="${LRY * 2}" fill="#F7F0E2"/>`;
  for (let i = -LRY * 2; i < LRY * 2; i += 9) s += `<path d="M${RX - LRX + i} ${RY - LRY} l${LRY * 2} ${LRY * 2}" stroke="${P.ivory3}" stroke-width=".6" opacity=".5"/>`;
  s += `<image href="t3/socket_cut3.png" x="${sx0}" y="${sy0}" width="${600 * KS}" height="${1300 * KS}"/></g>`;
  s += `<ellipse cx="${RX}" cy="${RY}" rx="${LRX}" ry="${LRY}" fill="none" stroke="${P.brass}" stroke-width="5"/><ellipse cx="${RX}" cy="${RY}" rx="${LRX + 9}" ry="${LRY + 9}" fill="none" stroke="${P.brass2}" stroke-width="1.2"/>`;
  s += `<path d="M${RX - LRX * .62} ${RY - LRY * .78} q30 -30 70 -36" stroke="#fff" stroke-width="5" fill="none" opacity=".55" stroke-linecap="round"/>`;
  // leader from the lens to the socket on the lamp
  s += `<path d="M${RX + LRX * .72} ${RY - LRY * .72} C 650 380 ${skx - 160} ${sky + 60} ${skx - 24} ${sky + 6}" fill="none" stroke="${P.walnut2}" stroke-width="1" stroke-dasharray="4 4"/><circle cx="${skx}" cy="${sky}" r="22" fill="none" stroke="${P.walnut2}" stroke-width="1" stroke-dasharray="4 4"/>`;
  h += T(RX - 210, RY - LRY - 46, 'lbl', 'fig. 4a · inside the socket, cut open', `width:420px;text-align:center;font-size:17px;color:${P.walnut}`);
  // callouts to the right of the lens, each tied to its part of the render
  const rnote = (x, y, t, n, w = 170) => { const [px, py] = sat(n); s += lead(x - 8, y + 10, px, py, P.ox, 0); return T(x, y, '', t, `width:${w}px;font-family:Fraunces;font-style:italic;font-size:15px;line-height:1.24;color:${P.ox}`); };
  h += rnote(500, 640, 'threaded shell: the bulb screws in here', 'threads');
  h += rnote(500, 738, 'the bulb’s tip, at the bottom of its base', 'tip');
  h += rnote(500, 836, 'brass tab: it must spring up and press the tip', 'tab');
  h += rnote(500, 936, 'two wires in from the cord', 'hot');
  // title block, top left
  h += `<div class="t" style="left:100px;top:96px;width:470px">
    <div class="lbl" style="font-size:15px;letter-spacing:.22em;color:${P.walnut2}">the lamp table · bin e3</div>
    <div style="font-family:Gloock;font-size:58px;line-height:1;color:${P.walnut};margin-top:10px">a lamp is five<br>parts in a row</div>
    <div style="font-family:Fraunces;font-style:italic;font-size:19px;line-height:1.35;color:${P.walnut};margin-top:14px">Current runs from the plug, down the cord, through the switch and the socket, into the bulb. The light dies at the weakest one.</div></div>`;
  // the No. 4 medallion
  s += `<g filter="url(#shadowS)"><circle cx="1290" cy="640" r="74" fill="${P.ox}"/><circle cx="1290" cy="640" r="66" fill="none" stroke="${P.brass3}" stroke-width="1.5" stroke-dasharray="2 4"/></g>`;
  h += T(1216, 588, '', '<div style="font-family:Fell;font-size:15px;letter-spacing:.12em">no.</div><div style="font-family:Fraunces;font-weight:600;font-size:52px;line-height:.9">4</div>', `width:148px;text-align:center;color:${P.ivory}`);
  h += T(1196, 730, '', 'Lamps are the fourth most common thing carried into repair cafés.', `width:190px;text-align:center;font-family:Fraunces;font-style:italic;font-size:16px;line-height:1.3;color:${P.walnut}`);
  // test order ribbon, bottom right
  const steps = ['bulb', 'plug', 'switch', 'the whole cord, with the multimeter'];
  let tx = 100; const ty = 1052;
  h += T(100, 1016, 'lbl', 'test in this order', `font-size:17px;letter-spacing:.14em;color:${P.ox}`);
  steps.forEach((st, i) => {
    const w = i === 3 ? 262 : 92;
    s += `<path d="M${tx} ${ty} h${w} l12 ${20} l-12 ${20} h${-w} l12 -20z" fill="${i % 2 ? P.ivory2 : P.cream}" stroke="${P.walnut2}" stroke-width="1"/>`;
    h += T(tx + 14, ty + 8, '', `<b style="font-family:Fraunces;font-weight:600;color:${P.ox}">${i + 1}</b> ${st}`, `width:${w}px;font-family:Fraunces;font-style:italic;font-size:15px;line-height:1.1;${i === 3 ? 'font-size:14px' : ''}`);
    tx += w + 14;
  });
  h += T(100, H - 104, 'src', 'Candelabra modelled from my photo at Repair Café Silicon Valley, Oct 18 2026 (25 W candelabra bulbs, E12 base). Socket rendered in 3D as a typical E12 unit, switch drawn as a typical inline one. Ranking and common faults: RepairMonitor analysis 2019.', `width:${W - 200}px;font-size:13px`);
  mount(W, H, s, h);
};
