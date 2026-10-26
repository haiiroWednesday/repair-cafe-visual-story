// the bill: why repairs fail, printed as a thermal receipt (RepairMonitor 2019)
ASSETS.bill = () => {
  const W = 1240, H = 1350;
  const X0 = 350, Y0 = 40, RW = 560, RH = 1236, ROT = -1.6, OX = X0 + RW / 2, OY = Y0 + RH / 2;
  let s = '', h = '';
  // torn top edge
  let top = `M${X0} ${Y0 + 14}`;
  for (let x = X0, i = 0; x < X0 + RW; i++) { const nx = Math.min(X0 + RW, x + 7 + (i * 37 % 9)); top += ` L${(x + nx) / 2} ${Y0 + (i % 2 ? 2 : 10) + (i * 13 % 7)} L${nx} ${Y0 + 12 + (i * 7 % 6)}`; x = nx; }
  const BOT = Y0 + RH - 46;
  const body = `${top} L${X0 + RW} ${BOT} Q${OX} ${BOT + 18} ${X0} ${BOT} Z`;
  s += `<defs><linearGradient id="rcG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FCFAF4"/><stop offset=".85" stop-color="#F8F4EA"/><stop offset="1" stop-color="#E9E1D0"/></linearGradient>
    <linearGradient id="rcSide" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".07"/><stop offset=".12" stop-color="#000" stop-opacity="0"/><stop offset=".88" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".06"/></linearGradient>
    <linearGradient id="curlG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CFC6B3"/><stop offset=".45" stop-color="#F3EEE3"/><stop offset="1" stop-color="#DCD3C1"/></linearGradient></defs>`;
  s += `<g transform="rotate(${ROT} ${OX} ${OY})">`;
  s += `<path d="${body}" fill="url(#rcG)" filter="url(#shadow)"/>`;
  s += `<path d="${body}" fill="url(#rcSide)"/>`;
  // the curl at the foot: the roll lifts up and shows its back
  s += `<path d="M${X0} ${BOT} Q${OX} ${BOT + 18} ${X0 + RW} ${BOT} C${X0 + RW + 6} ${BOT + 26} ${X0 + RW - 4} ${BOT + 52} ${X0 + RW - 20} ${BOT + 50} Q${OX} ${BOT + 64} ${X0 + 20} ${BOT + 50} C${X0 + 4} ${BOT + 52} ${X0 - 6} ${BOT + 26} ${X0} ${BOT} Z" fill="url(#curlG)" filter="url(#shadowS)"/>`;
  s += `<path d="M${X0 + 20} ${BOT + 50} Q${OX} ${BOT + 64} ${X0 + RW - 20} ${BOT + 50}" fill="none" stroke="#B9AE98" stroke-width="1"/>`;
  // faint thermal wear: a pale grey drift down one side
  s += `<circle cx="${X0 + RW - 120}" cy="${Y0 + 1110}" r="74" fill="none" stroke="#9A6A42" stroke-width="5" opacity=".22" filter="url(#wc)"/><circle cx="${X0 + RW - 116}" cy="${Y0 + 1106}" r="70" fill="#B58A5E" opacity=".05" filter="url(#wc)"/>`;
  s += `</g>`;

  // ---- the printed lines ----
  const L = (t, st = '') => `<div style="${st}">${t}</div>`;
  const dash = L('-'.repeat(40), 'letter-spacing:0;opacity:.75');
  const row = (a, b, st = '') => `<div style="display:flex;justify-content:space-between;${st}"><span>${a}</span><span>${b}</span></div>`;
  const BW = 470;
  const bar = (n, pct, note) => `<div style="display:flex;align-items:center;gap:10px;margin:2px 0 10px">
      <div style="height:13px;width:${Math.round(BW * n / 2177)}px;background:repeating-linear-gradient(90deg,#2E2925 0 4px,#5A524B 4px 5px);opacity:.85"></div>
      <span style="font-weight:700">${pct}%</span>${note ? `<span style="font-size:13px;opacity:.8">${note}</span>` : ''}</div>`;
  const R5 = [
    ['WORN OUT, TOO OLD', '~1,000', 1000, 46, ''],
    ['NO SPARE PART, NO BATTERY', '693', 693, 32, ''],
    ['WOULD NOT OPEN', '211', 211, 10, 'glued, fused, rusted screws'],
    ['RAN OUT OF TIME', '160', 160, 7, ''],
    ['NO TOOL, NO KNOWLEDGE', '113', 113, 5, ''],
  ];
  let r = '';
  r += L('REPAIR CAFÉ', 'text-align:center;font-weight:700;font-size:27px;letter-spacing:.12em;margin-top:6px');
  r += L('67 CAFÉS · WORLDWIDE', 'text-align:center;font-weight:700;letter-spacing:.1em');
  r += L('RepairMonitor · year 2019', 'text-align:center');
  r += L('13,609 repairs logged', 'text-align:center');
  r += dash;
  r += row('STATUS', 'NOT FIXED');
  r += row('ITEMS', '2,177');
  r += dash;
  r += L('* * * FAILED, BY REASON * * *', 'text-align:center;font-weight:700;margin:4px 0 10px');
  R5.forEach(([a, b, n, p, note]) => { r += row(a, b, 'font-weight:700'); r += bar(n, p, note); });
  r += dash;
  r += row('CLASSIFIED', '2,177', 'font-weight:700;font-size:19px');
  r += row('SHARE', '100%');
  r += dash;
  r += L('USUAL SUSPECTS:', 'font-weight:700');
  r += L('broken wire · switch · button<br>dead battery in clocks<br>tired battery in laptops', 'padding-left:16px;margin-bottom:6px');
  r += dash;
  r += L('RIGHT TO REPAIR · CALIFORNIA', 'font-weight:700');
  r += L('SB 244 · in force 1 JUL 2024');
  r += L('maker keeps parts + manuals for:', 'margin-top:4px');
  r += row('&nbsp; product $50 and up', '3 YRS');
  r += row('&nbsp; product $100 and up', '7 YRS');
  r += row('&nbsp; made after', 'JUL 2021');
  r += row('&nbsp; stereo, made AUG 2003', 'NOT COVERED', 'font-weight:700');
  r += dash;
  r += L('REPAIRS FREE. PARTS AT COST.', 'text-align:center;font-weight:700;margin-top:4px');
  r += L('GRATUITY NOT INCLUDED', 'text-align:center');
  r += L('THANK YOU · COME AGAIN', 'text-align:center;margin-bottom:10px');
  // barcode
  let bc = ''; for (let i = 0; i < 64; i++) { const w = [1, 2, 1, 3, 1, 2, 2, 1][(i * 7 + (i >> 2)) % 8]; bc += `<span style="display:inline-block;width:${w}px;height:46px;background:#2E2925;margin-right:${[2, 1, 3, 1, 2][i % 5]}px"></span>`; }
  r += `<div style="text-align:center;opacity:.85">${bc}</div>`;
  r += L('2177 · 693 · 211 · 160 · 113', 'text-align:center;font-size:12.5px;letter-spacing:.14em;margin-top:2px');
  h += `<div class="t mono" style="left:${X0 + 44}px;top:${Y0 + 40}px;width:${RW - 88}px;font-size:16px;line-height:24px;transform:rotate(${ROT}deg);transform-origin:${RW / 2 - 44}px ${RH / 2 - 40}px">${r}</div>`;

  // ---- pen notes in the margins ----
  const pen = P.ox;
  const note = (x, y, w, t, rot = 0, sz = 19) => T(x, y, 'note', t, `width:${w}px;font-size:${sz}px;line-height:1.25;color:${pen};transform:rotate(${rot}deg)`);
  h += note(40, 290, 280, 'the biggest line is the one nobody can fix: things worn out past saving', -3);
  s += `<path d="M300 345 C325 350 345 352 372 356" fill="none" stroke="${pen}" stroke-width="1.6" stroke-linecap="round" filter="url(#rough)"/><path d="M362 348 l10 8 l-12 4" fill="none" stroke="${pen}" stroke-width="1.6"/>`;
  // a ring round 693 and its note
  s += `<ellipse cx="${X0 + RW - 66}" cy="${Y0 + 343}" rx="40" ry="19" fill="none" stroke="${pen}" stroke-width="2" transform="rotate(-6 ${X0 + RW - 66} ${Y0 + 343})" filter="url(#rough)"/>`;
  h += note(950, 360, 270, 'the second line is about parts. The log cannot tell a part the café lacked from one nobody sells.', 2.5);
  s += `<path d="M946 392 C930 392 915 388 ${X0 + RW - 24} ${Y0 + 345}" fill="none" stroke="${pen}" stroke-width="1.6" stroke-linecap="round" filter="url(#rough)"/>`;
  // the stereo line
  h += note(950, 960, 260, 'mine: a control cable with twenty dead strands, re-soldered one by one', -2);
  s += `<path d="M946 990 C925 994 910 996 ${X0 + RW - 34} 998" fill="none" stroke="${pen}" stroke-width="1.6" stroke-linecap="round" filter="url(#rough)"/><path d="M${X0 + RW - 24} 992 l-12 6 l11 6" fill="none" stroke="${pen}" stroke-width="1.6"/>`;
  // underline under parts at cost
  h += note(40, 1010, 270, 'a part bought at the café is sold at what it cost, nothing on top', -2, 18);
  s += `<path d="M290 1040 C330 1046 360 1050 ${X0 + 140} 1052" fill="none" stroke="${pen}" stroke-width="1.6" stroke-linecap="round" filter="url(#rough)"/><path d="M${X0 + 130} 1045 l12 7 l-12 6" fill="none" stroke="${pen}" stroke-width="1.6"/>`;
  // a lace scrap and a brass paperclip pinning the receipt
  s += `<g transform="rotate(-8 ${X0 + 110} ${Y0 + 30})">${lacetrim(X0 - 30, Y0 - 6, 230, 'pink', 40)}</g>`;
  s += `<g transform="rotate(14 ${X0 + RW - 60} ${Y0 + 40})" filter="url(#shadowS)"><path d="M${X0 + RW - 72} ${Y0 + 96} V${Y0 + 8} a14 14 0 0 1 28 0 V${Y0 + 104} a10 10 0 0 1 -20 0 V${Y0 + 26}" fill="none" stroke="${P.brass}" stroke-width="4.5" stroke-linecap="round"/><path d="M${X0 + RW - 72} ${Y0 + 96} V${Y0 + 8} a14 14 0 0 1 28 0 V${Y0 + 104} a10 10 0 0 1 -20 0 V${Y0 + 26}" fill="none" stroke="${P.brass3}" stroke-width="1.4" stroke-linecap="round" transform="translate(-1 -1)"/></g>`;
  h += T(40, H - 64, 'src', 'Failure reasons and usual faults: RepairMonitor analysis 2019, Repair Café International Foundation (13,609 repairs, 67 cafés). Right to repair: California SB 244 industry advisory, Bureau of Household Goods and Services. Shares are of the 2,177 classified repairs, rounded.', `width:${W - 80}px;text-align:center`);
  mount(W, H, s, h);
};
