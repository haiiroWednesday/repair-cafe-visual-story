// the specials board: how a repair gets ordered, with a real ticket pinned and read in chalk
ASSETS.board = () => {
  const W = 1920, H = 1290;
  const FX = 30, FY = 120, FW = 1480, FH = 1080, FR = 38; // frame
  const SX = FX + FR, SY = FY + FR, SW = FW - 2 * FR, SH = FH - 2 * FR; // slate
  let s = '', h = '';
  const CH = 'filter:url(#chalkf)';
  const chalk = (x, y, cls, t, st = '') => T(x, y, cls, t, `${CH};${st}`);
  const cline = (d, w = 2.2, op = .85) => `<path d="${d}" fill="none" stroke="${P.chalk}" stroke-width="${w}" stroke-linecap="round" opacity="${op}" filter="url(#chalkf)"/>`;
  s += `<defs>
    <linearGradient id="woodH" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7A5038"/><stop offset=".45" stop-color="${P.walnut2}"/><stop offset="1" stop-color="${P.walnut}"/></linearGradient>
    <linearGradient id="woodV" x1="0" x2="1"><stop offset="0" stop-color="#7A5038"/><stop offset=".5" stop-color="${P.walnut2}"/><stop offset="1" stop-color="${P.walnut}"/></linearGradient>
    <radialGradient id="slateG" cx=".45" cy=".4" r=".8"><stop offset="0" stop-color="#2E3B33"/><stop offset="1" stop-color="#1D2620"/></radialGradient>
  </defs>`;
  // frame and slate
  s += `<rect x="${FX}" y="${FY}" width="${FW}" height="${FH}" fill="url(#woodH)" filter="url(#shadow)"/>`;
  for (let i = 0; i < 26; i++) { const y = FY + 4 + i * (FR - 8) / 26 * 1; }
  const grain = (x, y, w, hh, vert) => { let g = ''; for (let i = 0; i < 9; i++) { const o = 4 + i * (vert ? w : hh) / 9; g += vert ? `<path d="M${x + o} ${y} C${x + o + 3} ${y + hh * .3} ${x + o - 3} ${y + hh * .7} ${x + o + 1} ${y + hh}" stroke="#3A2419" stroke-width="${.6 + (i % 3) * .3}" opacity=".35" fill="none"/>` : `<path d="M${x} ${y + o} C${x + w * .3} ${y + o + 2} ${x + w * .7} ${y + o - 2} ${x + w} ${y + o + 1}" stroke="#3A2419" stroke-width="${.6 + (i % 3) * .3}" opacity=".35" fill="none"/>`; } return g; };
  s += `<rect x="${FX}" y="${FY}" width="${FR}" height="${FH}" fill="url(#woodV)"/><rect x="${FX + FW - FR}" y="${FY}" width="${FR}" height="${FH}" fill="url(#woodV)"/>`;
  s += grain(FX, FY, FW, FR, false) + grain(FX, FY + FH - FR, FW, FR, false) + grain(FX, FY + FR, FR, FH - 2 * FR, true) + grain(FX + FW - FR, FY + FR, FR, FH - 2 * FR, true);
  // mitred corners
  [[FX, FY, 1, 1], [FX + FW, FY, -1, 1], [FX, FY + FH, 1, -1], [FX + FW, FY + FH, -1, -1]].forEach(([x, y, a, b]) => { s += `<path d="M${x} ${y} L${x + a * FR} ${y + b * FR}" stroke="#2A1A12" stroke-width="1.4" opacity=".6"/>`; });
  s += `<rect x="${FX + 3}" y="${FY + 3}" width="${FW - 6}" height="${FH - 6}" fill="none" stroke="${P.brass3}" stroke-width="1" opacity=".35"/>`;
  s += `<rect x="${SX}" y="${SY}" width="${SW}" height="${SH}" fill="url(#slateG)"/>`;
  s += `<rect x="${SX}" y="${SY}" width="${SW}" height="${SH}" fill="none" stroke="#120B07" stroke-width="5" opacity=".6"/>`;
  // old chalk dust and wiped smears
  for (let i = 0; i < 9; i++) s += `<ellipse cx="${SX + 120 + i * 150 + (i % 2) * 40}" cy="${SY + 200 + (i * 173 % 640)}" rx="${120 + (i % 3) * 50}" ry="${40 + (i % 4) * 14}" fill="${P.chalk}" opacity=".045" filter="url(#wc)" transform="rotate(${-8 + i * 3} ${SX + 120 + i * 150} ${SY + 300})"/>`;

  s += `<defs><filter id="fk1soft" x="-20%" y="-40%" width="140%" height="180%"><feGaussianBlur stdDeviation="14"/></filter></defs>`;
  // heading
  h += chalk(SX + 40, SY + 18, 'chalk', 'is it worth an afternoon?', 'font-size:60px;letter-spacing:.01em');
  h += chalk(SX + 44, SY + 104, 'chalkh', 'order it and find out. a slip goes up under its station and comes down when a fixer with that skill is free.', 'font-size:21px;width:1320px;opacity:.88');
  h += chalk(SX + SW - 330, SY + 30, 'chalkh', 'sun 18 oct<br>11 to 3 · the alameda', 'font-size:24px;width:300px;text-align:right;line-height:1.3;opacity:.9');
  s += cline(`M${SX + 40} ${SY + 98} C${SX + 300} ${SY + 92} ${SX + 560} ${SY + 100} ${SX + 840} ${SY + 94}`, 2.4, .7);

  // the station columns
  const COLS = ['appliances', 'electronics', 'mechanical', 'pc / phone', 'woodwork', 'special skills'];
  const CX0 = SX + 30, CY0 = SY + 160, CW = (SW - 60) / 6, CHt = 360;
  s += cline(`M${CX0} ${CY0 + 48} H${CX0 + CW * 6}`, 2, .75);
  COLS.forEach((c, i) => {
    const x = CX0 + i * CW;
    if (i) s += cline(`M${x} ${CY0 - 4} C${x + 2} ${CY0 + 120} ${x - 2} ${CY0 + 240} ${x + 1} ${CY0 + CHt}`, 1.8, .55);
    h += chalk(x + 12, CY0 + 4, 'chalk', c, `font-size:${i === 5 ? 25 : 27}px;width:${CW - 20}px;text-align:center`);
  });
  h += chalk(CX0 + 5 * CW + 12, CY0 + 54, 'chalkh', 'sewing · jewelry · oddballs', `font-size:16px;width:${CW - 20}px;text-align:center;opacity:.85`);
  // little tickets under their stations, held by magnets
  const MAG = ['#B8483F', '#3E6E8E', '#D9A93F', '#4F7B57', '#8C5A9E', '#D97A54', '#2F5C5A', '#C9577A', '#6E8B3D', '#E0C9A0'];
  const magnet = (x, y, c) => `<g filter="url(#shadowS)"><circle cx="${x}" cy="${y}" r="13" fill="${c}"/><circle cx="${x}" cy="${y}" r="13" fill="url(#magHi)"/><ellipse cx="${x - 4}" cy="${y - 5}" rx="5" ry="3" fill="#fff" opacity=".45"/></g>`;
  s += `<defs><radialGradient id="magHi" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></radialGradient></defs>`;
  const mini = (x, y, rot, time, st, item, mc) => {
    s += `<g transform="rotate(${rot} ${x + 85} ${y + 62})"><rect x="${x}" y="${y}" width="170" height="124" fill="#FBF8F1" filter="url(#shadowS)"/><path d="M${x} ${y + 124} l8 -3 l9 3 l8 -3 l9 3 l8 -3 l9 3 l8 -3 l9 3 l8 -3 l9 3 l8 -3 l9 3 l8 -3 l9 3 l8 -3 l9 3 l8 -3 l9 3 l8 -3" fill="none" stroke="#E2DACA" stroke-width="1"/></g>`;
    s += magnet(x + 85, y + 6, mc);
    h += T(x + 12, y + 24, 'mono', `<b>${time}</b><br>${st}<br><span style="opacity:.8">${item}</span>`, `width:150px;font-size:12.5px;line-height:1.35;transform:rotate(${rot}deg);transform-origin:73px 38px`);
  };
  mini(CX0 + 22, CY0 + 92, -3, '1:47 PM', 'BASIC APPLIANCES / LAMP', 'Portable fan table top', MAG[0]);
  mini(CX0 + 5 * CW + 24, CY0 + 100, 2.5, '11:47 AM', 'SEWING / TEXTILES', 'Sewing machine', MAG[2]);
  mini(CX0 + 5 * CW + 30, CY0 + 230, -2, '12:57 PM', 'SEWING / TEXTILES', 'Pants', MAG[4]);
  // spare magnets parked along the top of the columns
  [[1, 0], [2, 3], [3, 5], [4, 6], [1, 7], [3, 8], [4, 9], [2, 1]].forEach(([c, m], k) => { s += magnet(CX0 + c * CW + 40 + (k % 2) * 34 + (k > 3 ? 60 : 0), CY0 + 100 + (k % 3) * 8, MAG[m]); });
  s += `<rect x="${CX0 + CW + 6}" y="${CY0 + 132}" width="${CW * 3 - 10}" height="150" fill="#27322C" opacity=".9" filter="url(#fk1soft)" rx="60"/>`;
  h += chalk(CX0 + CW + 24, CY0 + 140, 'chalkh', 'ten colours of magnet along the edge. a slip goes under its station, a magnet holds it.', `font-size:19px;width:${CW * 3 - 50}px;opacity:.8;line-height:1.3`);
  h += chalk(CX0 + CW + 24, CY0 + 238, 'chalkh', 'sewing and jewelry go under special skills.', `font-size:19px;width:${CW * 3 - 50}px;opacity:.8`);
  s += cline(`M${CX0 + 4 * CW - 70} ${CY0 + 252} C${CX0 + 4 * CW + 60} ${CY0 + 262} ${CX0 + 5 * CW - 40} ${CY0 + 250} ${CX0 + 5 * CW + 20} ${CY0 + 236}`, 2, .7);
  s += cline(`M${CX0 + 5 * CW + 8} ${CY0 + 226} l14 10 l-17 6`, 2, .7);

  // the pinned ticket, large, with its parts read off in chalk
  const TX = SX + 520, TY = SY + 560, TW = 420, THt = 400, TROT = 1.8;
  s += `<g transform="rotate(${TROT} ${TX + TW / 2} ${TY + THt / 2})"><rect x="${TX}" y="${TY}" width="${TW}" height="${THt}" fill="#FCFAF5" filter="url(#shadow)"/>
    <rect x="${TX + 18}" y="${TY + 300}" width="80" height="80" fill="#fff"/>`;
  // a QR made of modules, with its three finder squares
  const qx = TX + 22, qy = TY + 290, m = 3.9, N = 21;
  let q = ''; const fnd = (a, b) => `<rect x="${qx + a * m}" y="${qy + b * m}" width="${7 * m}" height="${7 * m}" fill="#1F1B18"/><rect x="${qx + (a + 1) * m}" y="${qy + (b + 1) * m}" width="${5 * m}" height="${5 * m}" fill="#fff"/><rect x="${qx + (a + 2) * m}" y="${qy + (b + 2) * m}" width="${3 * m}" height="${3 * m}" fill="#1F1B18"/>`;
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { if ((i < 8 && j < 8) || (i > 12 && j < 8) || (i < 8 && j > 12)) continue; if (((i * 31 + j * 17 + i * j * 7) % 11) < 5) q += `<rect x="${qx + i * m}" y="${qy + j * m}" width="${m}" height="${m}" fill="#1F1B18"/>`; }
  s += q + fnd(0, 0) + fnd(14, 0) + fnd(0, 14);
  s += `<rect x="${TX + 260}" y="${TY + 330}" width="140" height="44" fill="none" stroke="#3A332E" stroke-width="1.4"/>`;
  s += `</g>`;
  s += magnet(TX + TW / 2, TY + 2, MAG[0]);
  h += `<div class="t mono" style="left:${TX + 22}px;top:${TY + 26}px;width:${TW - 44}px;transform:rotate(${TROT}deg);transform-origin:${TW / 2 - 22}px ${THt / 2 - 26}px;font-size:17px;line-height:1.5">
    <div style="font-size:26px;font-weight:700">1:47 PM</div>
    <div style="display:flex;justify-content:space-between;font-weight:700;margin-top:6px"><span>BASIC APPLIANCES / LAMP</span><span style="font-size:24px">#1</span></div>
    <div style="border-top:1.4px solid #3A332E;margin:8px 0"></div>
    <div><b>ITEM:</b> Portable fan table top</div><div><b>ISSUE:</b> Stopped working</div><div><b>CLIENT:</b> D. S.</div>
    <div style="position:absolute;left:96px;top:300px;font-size:15px;font-weight:700">N7F</div>
    <div style="position:absolute;left:250px;top:312px;width:120px;text-align:center;font-size:14px;line-height:1.35">SUBMIT<br>RESOLUTION</div></div>`;
  // chalk readings around the ticket
  const ann = (x, y, w, t, ax, ay, bx, by, align = 'left') => {
    h += chalk(x, y, 'chalkh', t, `font-size:21px;width:${w}px;line-height:1.28;text-align:${align}`);
    s += cline(`M${ax} ${ay} Q${(ax + bx) / 2} ${(ay + by) / 2 - 18} ${bx} ${by}`, 2, .8);
    const a = Math.atan2(by - ay, bx - ax), l = 13;
    s += cline(`M${bx - l * Math.cos(a - .45)} ${by - l * Math.sin(a - .45)} L${bx} ${by} L${bx - l * Math.cos(a + .45)} ${by - l * Math.sin(a + .45)}`, 2, .8);
  };
  ann(SX + 60, TY + 6, 380, 'when you checked in', SX + 300, TY + 22, TX + 6, TY + 40);
  ann(SX + 60, TY + 66, 380, 'the station the coordinator routes it to', SX + 430, TY + 84, TX + 8, TY + 84);
  ann(SX + 60, TY + 150, 400, 'the owner’s own words. the diagnosis comes later, at the bench.', SX + 452, TY + 166, TX + 8, TY + 162);
  ann(SX + 60, TY + 250, 400, 'client cut to initials', SX + 300, TY + 266, TX + 8, TY + 188);
  ann(TX + TW + 70, TY - 34, 330, '#1 of the household. two items a visit, usually.', TX + TW + 66, TY + 20, TX + TW - 30, TY + 86);
  ann(TX + TW + 70, TY + 210, 420, 'the fixer scans this to log the ending:', TX + TW + 66, TY + 230, TX + 110, TY + 320);
  // the three endings, boxed like specials
  const ends = [['fixed', 'home the same afternoon'], ['needs a part', 'leaves with a part number'], ['beyond saving', 'recycled, a few tables over']];
  ends.forEach(([a, b], i) => {
    const x = TX + TW + 80, y = TY + 262 + i * 60;
    s += cline(`M${x} ${y + 8} h22 v22 h-22 z`, 1.8, .85);
    h += chalk(x + 36, y - 2, 'chalk', a, 'font-size:25px');
    h += chalk(x + 36, y + 30, 'chalkh', b, 'font-size:17px;opacity:.75');
  });
  // a tick in the first box
  s += cline(`M${TX + TW + 84} ${TY + 280} l8 9 l16 -20`, 2.6, .95);


  // the bill, clipped to the right-hand stile of the frame: what stopped the rest
  {
    const X0 = 1440, Y0 = 214, RW = 430, RH = 900, ROT = 2.2, OX = X0 + RW / 2, OY = Y0 + RH / 2;
    let top = `M${X0} ${Y0 + 14}`;
    for (let x = X0, i = 0; x < X0 + RW; i++) { const nx = Math.min(X0 + RW, x + 7 + (i * 37 % 9)); top += ` L${(x + nx) / 2} ${Y0 + (i % 2 ? 2 : 10) + (i * 13 % 7)} L${nx} ${Y0 + 12 + (i * 7 % 6)}`; x = nx; }
    const BOT = Y0 + RH - 40, body = `${top} L${X0 + RW} ${BOT} Q${OX} ${BOT + 16} ${X0} ${BOT} Z`;
    s += `<defs><linearGradient id="rcG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FCFAF4"/><stop offset=".85" stop-color="#F8F4EA"/><stop offset="1" stop-color="#E9E1D0"/></linearGradient>
      <linearGradient id="curlG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CFC6B3"/><stop offset=".45" stop-color="#F3EEE3"/><stop offset="1" stop-color="#DCD3C1"/></linearGradient></defs>`;
    s += `<g transform="rotate(${ROT} ${OX} ${OY})"><path d="${body}" fill="url(#rcG)" filter="url(#shadow)"/>`;
    s += `<path d="M${X0} ${BOT} Q${OX} ${BOT + 16} ${X0 + RW} ${BOT} C${X0 + RW + 6} ${BOT + 24} ${X0 + RW - 4} ${BOT + 46} ${X0 + RW - 20} ${BOT + 44} Q${OX} ${BOT + 58} ${X0 + 20} ${BOT + 44} C${X0 + 4} ${BOT + 46} ${X0 - 6} ${BOT + 24} ${X0} ${BOT} Z" fill="url(#curlG)" filter="url(#shadowS)"/>`;
    s += `<circle cx="${X0 + RW - 100}" cy="${Y0 + 770}" r="62" fill="none" stroke="#9A6A42" stroke-width="5" opacity=".2" filter="url(#wc)"/></g>`;
    const L = (t, st = '') => `<div style="${st}">${t}</div>`, dash = L('-'.repeat(34), 'letter-spacing:0;opacity:.7');
    const row = (a, b, st = '') => `<div style="display:flex;justify-content:space-between;${st}"><span>${a}</span><span>${b}</span></div>`;
    const BW = 300, bar = (n, pct) => `<div style="display:flex;align-items:center;gap:10px;margin:2px 0 9px"><div style="height:12px;width:${Math.round(BW * n / 2177)}px;background:repeating-linear-gradient(90deg,#2E2925 0 4px,#5A524B 4px 5px);opacity:.85"></div><span style="font-weight:700">${pct}%</span></div>`;
    let r = '';
    r += L('REPAIR CAFÉ', 'text-align:center;font-weight:700;font-size:24px;letter-spacing:.12em');
    r += L('67 CAFÉS · RepairMonitor 2019', 'text-align:center');
    r += dash + L('* WHAT STOPPED THE REST *', 'text-align:center;font-weight:700;margin:2px 0 8px');
    [['WORN OUT, TOO OLD', '~1,000', 1000, 46], ['NO SPARE PART, NO BATTERY', '693', 693, 32], ['WOULD NOT OPEN', '211', 211, 10], ['RAN OUT OF TIME', '160', 160, 7], ['NO TOOL, NO KNOWLEDGE', '113', 113, 5]]
      .forEach(([a, b, n, p]) => { r += row(a, b, 'font-weight:700'); r += bar(n, p); });
    r += dash + row('NOT FULLY FIXED', '2,177', 'font-weight:700;font-size:17px');
    r += dash + L('ON BENCH 2 TODAY:', 'font-weight:700');
    r += row('&nbsp;stereo, made AUG 2003', '1');
    r += row('&nbsp;spare control cable', 'NONE');
    r += row('&nbsp;strands re-soldered by hand', '20');
    r += dash + L('REPAIRS FREE. PARTS AT COST.', 'text-align:center;font-weight:700;margin-top:4px');
    r += L('THANK YOU · COME AGAIN', 'text-align:center;margin-bottom:8px');
    let bc = ''; for (let i = 0; i < 52; i++) { const w = [1, 2, 1, 3, 1, 2, 2, 1][(i * 7 + (i >> 2)) % 8]; bc += `<span style="display:inline-block;width:${w}px;height:40px;background:#2E2925;margin-right:${[2, 1, 3, 1, 2][i % 5]}px"></span>`; }
    r += `<div style="text-align:center;opacity:.85">${bc}</div>`;
    h += `<div class="t mono" style="left:${X0 + 30}px;top:${Y0 + 34}px;width:${RW - 60}px;font-size:14.5px;line-height:22px;transform:rotate(${ROT}deg);transform-origin:${RW / 2 - 30}px ${RH / 2 - 34}px">${r}</div>`;
    // a brass bulldog clip biting the frame and the slip together
    const cx = 1466, cy = 196;
    s += `<g filter="url(#shadowS)" transform="rotate(4 ${cx + 40} ${cy + 40})"><path d="M${cx} ${cy + 30} h96 v40 q-48 14 -96 0 z" fill="url(#rodGc)" stroke="${P.brass2}"/>
      <path d="M${cx + 14} ${cy + 30} q-4 -30 18 -34 h32 q22 4 18 34" fill="none" stroke="${P.brass2}" stroke-width="5"/><path d="M${cx + 14} ${cy + 30} q-4 -30 18 -34 h32 q22 4 18 34" fill="none" stroke="${P.brass3}" stroke-width="1.6"/>
      <circle cx="${cx + 10}" cy="${cy + 48}" r="3" fill="${P.brass2}"/><circle cx="${cx + 86}" cy="${cy + 48}" r="3" fill="${P.brass2}"/></g>`;
    s += `<defs><linearGradient id="rodGc" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${P.brass3}"/><stop offset=".5" stop-color="${P.brass}"/><stop offset="1" stop-color="${P.brass2}"/></linearGradient></defs>`;
  }
  // chalk arrow from the endings to the slip on the frame

  // the BIKES sign, hung upside down off the frame
  const bx = FX + FW - 230, by = FY - 50;
  s += `<path d="M${bx + 30} ${FY + 4} L${bx + 40} ${by + 6} M${bx + 150} ${FY + 4} L${bx + 140} ${by + 6}" stroke="#8C7A62" stroke-width="1.4"/>`;
  s += `<g transform="rotate(178 ${bx + 90} ${by - 6})"><rect x="${bx + 20}" y="${by - 34}" width="140" height="54" fill="#E4D6BA" stroke="${P.walnut2}" stroke-width="2" filter="url(#shadowS)"/></g>`;
  h += T(bx + 20, by - 30, 'lbl', 'BIKES', `width:140px;text-align:center;font-size:30px;letter-spacing:.12em;color:${P.bottle};transform:rotate(178deg)`);
  h += T(bx - 240, FY - 58, 'note', 'hung upside down: this venue took no bikes', `width:230px;font-size:18px;text-align:right;color:${P.walnut}`);

  // ledge with chalk and a felt eraser
  s += `<rect x="${FX - 10}" y="${FY + FH - 6}" width="${FW + 20}" height="26" fill="url(#woodH)" filter="url(#shadowS)"/>`;
  s += `<rect x="${FX + 200}" y="${FY + FH - 22}" width="140" height="22" fill="#5A4636"/><rect x="${FX + 200}" y="${FY + FH - 30}" width="140" height="10" fill="#C9BBA6"/>`;
  s += `<rect x="${FX + 380}" y="${FY + FH - 13}" width="70" height="10" rx="4" fill="#F2EEE4"/><rect x="${FX + 470}" y="${FY + FH - 12}" width="46" height="9" rx="4" fill="#E9C4C0"/>`;
  h += T(FX + 40, FY + FH + 36, 'src', 'Whiteboard, magnets and tickets as they looked at Repair Café Silicon Valley, Billy DeFrank Center, San José, Oct 18 2026, redrawn as a specials board. Client names cut to initials. Endings from the café FAQ. The slip on the frame: RepairMonitor analysis 2019, Repair Café International Foundation (67 cafés), shares of the 2,177 repairs not fully fixed, rounded.', `width:${FW - 80}px;text-align:center`);
  mount(W, H, s, h);
};
