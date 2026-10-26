// a hundred slices: every hundred things carried into a repair café, cut by how they went home
ASSETS.slices = () => {
  const W = 1560, H = 1360, CX = 640, CY = 660, RC = 430;
  let s = '', h = '';
  const SEC = [[63, P.rose, P.rose2, 'fixed'], [13, P.sage, P.sage2, 'half'], [24, P.cocoa2, P.cocoa, 'beyond']];
  const ang = i => -Math.PI / 2 + i / 100 * Math.PI * 2;
  const pt = (a, r) => [CX + Math.cos(a) * r, CY + Math.sin(a) * r];
  s += `<defs><radialGradient id="plate2" cx=".5" cy=".45" r=".6"><stop offset="0" stop-color="#FFFDF8"/><stop offset=".85" stop-color="#F3EAD9"/><stop offset="1" stop-color="#DCCBAA"/></radialGradient>
    <radialGradient id="frostSh" cx=".5" cy=".5" r=".5"><stop offset=".75" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#3A2418" stop-opacity=".22"/></radialGradient>
    <linearGradient id="knife" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#F2F0EC"/><stop offset=".5" stop-color="#B9B6B0"/><stop offset="1" stop-color="#8F8C86"/></linearGradient></defs>`;
  // doily, plate
  s += doilyImg(CX, CY, 1240, 'gold', .95);
  s += `<circle cx="${CX}" cy="${CY + 10}" r="${RC + 78}" fill="#2B1A10" opacity=".16" filter="url(#glow)"/>`;
  s += `<circle cx="${CX}" cy="${CY}" r="${RC + 72}" fill="url(#plate2)" stroke="${P.brass}" stroke-width="4"/>`;
  s += `<circle cx="${CX}" cy="${CY}" r="${RC + 56}" fill="none" stroke="${P.brass}" stroke-width="1" stroke-dasharray="2 5"/>`;
  for (let i = 0; i < 24; i++) { const [x, y] = pt(i / 24 * Math.PI * 2, RC + 40); s += `<g transform="translate(${x} ${y}) rotate(${i * 15})"><circle r="5" fill="${P.rose}"/><path d="M5 0 q7 -5 13 0 M-5 0 q-7 5 -13 0" stroke="${P.sage2}" stroke-width="2" fill="none"/></g>`; }
  // the cake, sector by sector, with a soft wash
  let i0 = 0;
  SEC.forEach(([n, c1, c2]) => {
    const a0 = ang(i0), a1 = ang(i0 + n), [x0, y0] = pt(a0, RC), [x1, y1] = pt(a1, RC);
    s += `<path d="M${CX} ${CY} L${x0} ${y0} A${RC} ${RC} 0 ${n > 50 ? 1 : 0} 1 ${x1} ${y1} Z" fill="${c1}"/>`;
    s += `<path d="M${CX} ${CY} L${x0} ${y0} A${RC} ${RC} 0 ${n > 50 ? 1 : 0} 1 ${x1} ${y1} Z" fill="${c2}" opacity=".28" filter="url(#wc)"/>`;
    i0 += n;
  });
  s += `<circle cx="${CX}" cy="${CY}" r="${RC}" fill="url(#frostSh)"/>`;
  // the missing slice: one in a hundred, lifted out (index 30, inside the fixed run)
  const MI = 30, [mx0, my0] = pt(ang(MI), RC), [mx1, my1] = pt(ang(MI + 1), RC);
  s += `<path d="M${CX} ${CY} L${mx0} ${my0} A${RC} ${RC} 0 0 1 ${mx1} ${my1} Z" fill="#F3E3C8"/><path d="M${CX} ${CY} L${mx0} ${my0} A${RC} ${RC} 0 0 1 ${mx1} ${my1} Z" fill="${P.ox2}" opacity=".18" filter="url(#wcs)"/>`;
  // piped cut lines: thin every slice, heavier at the edges of each outcome
  for (let i = 0; i < 100; i++) {
    const [x, y] = pt(ang(i), RC - 2), major = i === 0 || i === 63 || i === 76;
    s += `<path d="M${CX} ${CY} L${x} ${y}" stroke="${major ? P.cream : '#FFF8EE'}" stroke-width="${major ? 4.5 : 1}" opacity="${major ? 1 : .65}"/>`;
  }
  // a rosette on the rim for every slice
  for (let i = 0; i < 100; i++) {
    if (i === MI) continue;
    const c = i < 63 ? P.rose2 : i < 76 ? P.sage2 : P.cocoa, [x, y] = pt(ang(i + .5), RC - 14);
    s += `<circle cx="${x}" cy="${y}" r="8.5" fill="${c}"/><path d="M${x - 4} ${y} a4 4 0 1 1 4 4 a2.4 2.4 0 1 1 -2 -2.6" fill="none" stroke="#fff" stroke-width="1.2" opacity=".6"/>`;
  }
  for (let i = 0; i < 120; i++) { const a = i / 120 * Math.PI * 2, [x, y] = pt(a, RC + 3); s += `<ellipse cx="${x}" cy="${y}" rx="9" ry="6" transform="rotate(${a * 180 / Math.PI + 90} ${x} ${y})" fill="${P.cream}" stroke="${P.ivory3}" stroke-width=".8"/>`; }
  // plaque in the middle
  s += `<g filter="url(#shadowS)"><ellipse cx="${CX}" cy="${CY}" rx="150" ry="104" fill="${P.cream}" stroke="${P.brass}" stroke-width="2.4"/></g><ellipse cx="${CX}" cy="${CY}" rx="138" ry="92" fill="none" stroke="${P.brass}" stroke-width="1" stroke-dasharray="2 4"/>`;
  s += pearlRow(CX - 90, CY - 116, CX + 90, CY - 116, 14, 3);
  h += T(CX - 140, CY - 82, 'num', '63', `width:280px;text-align:center;font-size:84px;line-height:1;font-weight:500;font-style:italic`);
  h += T(CX - 140, CY + 10, 'lbl', 'in a hundred<br>went home working', `width:280px;text-align:center;font-size:19px;line-height:1.3`);
  // knife
  s += `<g transform="translate(860 1236) rotate(-7)" filter="url(#shadowS)"><path d="M0 0 H300 Q340 0 350 12 H0 Z" fill="url(#knife)" stroke="#8F8C86"/><rect x="-170" y="-4" width="170" height="20" rx="9" fill="${P.ivory2}" stroke="${P.brass}" stroke-width="2"/><circle cx="-150" cy="6" r="3" fill="${P.brass}"/><circle cx="-30" cy="6" r="3" fill="${P.brass}"/></g>`;
  // callouts for the three runs
  const CAL = [
    [ang(20), 1150, 120, '63 fixed', 'and went home working', P.rose2],
    [ang(69.5), 10, 1040, '13 half fixed', 'or sent home with advice', P.sage2],
    [ang(88), 40, 210, '24 beyond help', 'the reasons are on the bill', P.cocoa],
  ];
  CAL.forEach(([a, x, y, t1, t2, c]) => {
    const [px, py] = pt(a, RC - 60), L = x < CX;
    s += lead(L ? x + 280 : x - 10, y + 16, px, py, P.walnut, L ? 30 : -30);
    s += `<rect x="${L ? x + 248 : x}" y="${y + 6}" width="0" height="0"/>`;
    h += T(x, y, 'num', t1, `width:280px;font-size:30px;font-style:italic;font-weight:500;color:${c === P.cocoa ? P.walnut : c === P.sage2 ? P.bottle : P.ox};${L ? 'text-align:right' : ''}`);
    h += T(x, y + 40, 'note', t2, `width:280px;font-size:18px;${L ? 'text-align:right' : ''}`);
  });
  // the lifted slice, on its own small plate, shown from the side so its layers show
  const SX = 1290, SY = 470;
  s += `<ellipse cx="${SX}" cy="${SY + 70}" rx="190" ry="54" fill="url(#plate2)" stroke="${P.brass}" stroke-width="3"/><ellipse cx="${SX}" cy="${SY + 70}" rx="120" ry="32" fill="none" stroke="${P.ivory3}"/>`;
  s += `<ellipse cx="${SX}" cy="${SY + 80}" rx="150" ry="20" fill="#2B1A10" opacity=".12" filter="url(#glow)"/>`;
  const sl = (y, hgt, col) => `<path d="M${SX - 120} ${y} L${SX + 130} ${y - 26} L${SX + 130} ${y - 26 + hgt} L${SX - 120} ${y + hgt} Z" fill="${col}"/>`;
  s += sl(SY - 10, 26, P.rose) + sl(SY + 16, 22, '#F3E3C8') + sl(SY + 38, 8, P.rose2) + sl(SY + 46, 22, '#F3E3C8') + sl(SY + 68, 6, '#E9D6B4');
  s += `<path d="M${SX - 120} ${SY - 10} L${SX + 130} ${SY - 36} L${SX + 136} ${SY - 46} L${SX - 116} ${SY - 18} Z" fill="${P.rose2}"/>`;
  s += `<circle cx="${SX + 116}" cy="${SY - 48}" r="9" fill="${P.rose2}"/>`;
  s += `<path d="M${SX - 120} ${SY - 10} V${SY + 74} L${SX + 130} ${SY + 48} V${SY - 36}" fill="none" stroke="${P.walnut2}" stroke-opacity=".35" filter="url(#rough)"/>`;
  s += lead(SX - 150, SY + 10, pt(ang(MI + .5), RC - 40)[0], pt(ang(MI + .5), RC - 40)[1], P.ox, -40);
  h += T(SX - 190, SY - 130, 'hand', 'one slice,<br>one thing carried in', `font-size:21px;line-height:1.7;color:${P.ox};width:400px;text-align:center`);
  // a card with what the San José café counts on its own
  s += `<g transform="rotate(2.5 1310 1050)" filter="url(#shadow)"><rect x="1120" y="930" width="400" height="230" fill="#FBF7EE"/><rect x="1132" y="942" width="376" height="206" fill="none" stroke="${P.brass}" stroke-width="1"/></g>`;
  h += `<div class="t" style="left:1146px;top:952px;width:350px;transform:rotate(2.5deg);transform-origin:180px 100px">
    <div class="lbl" style="font-size:16px;color:${P.ox}">and at repair café silicon valley</div>
    <div class="note" style="font-size:17.5px;margin-top:6px;line-height:1.35">About half go home working the same afternoon. The café’s own count says 50 to 70%. Another 15 to 20% leave with a diagnosis and a part number to order.</div></div>`;
  // title card
  s += `<g transform="rotate(-2 230 1260)" filter="url(#shadow)"><path d="M40 1180 H470 L486 1330 H24 Z" fill="${P.cream}" stroke="${P.ivory3}"/><path d="M40 1180 H470" stroke="${P.brass}" stroke-width="2"/></g>`;
  s += `<g transform="rotate(-2 230 1260)">${lacetrim(24, 1318, 462, 'gold', 24)}</g>`;
  h += `<div class="t" style="left:40px;top:1190px;width:440px;transform:rotate(-2deg);text-align:center">
    <div class="script" style="font-size:54px;line-height:1">a hundred slices</div>
    <div class="lbl" style="font-size:15px;margin-top:8px;line-height:1.35">every hundred things carried in, cut by how they went home.<br>13,609 repairs logged by 67 repair cafés, 2019</div></div>`;
  h += T(560, 1322, 'src', 'Worldwide shares: RepairMonitor analysis 2019, Repair Café International Foundation. Silicon Valley figures: Los Altos Town Crier, 2026, and the café’s FAQ.', 'width:560px');
  mount(W, H, s, h);
};
