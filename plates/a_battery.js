// before anyone opens a clock, the needle gets a vote: the battery tester from bin D3, with its instruction card
ASSETS.battery = () => {
  const W = 1340, H = 1290;
  let s = '', h = '';
  const rad = d => (d - 90) * Math.PI / 180;
  const pt = (cx, cy, r, d) => [cx + r * Math.cos(rad(d)), cy + r * Math.sin(rad(d))];
  const arc = (cx, cy, r, a0, a1) => { const [x0, y0] = pt(cx, cy, r, a0), [x1, y1] = pt(cx, cy, r, a1); return `M${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1}`; };
  s += `<defs>
    <linearGradient id="bodyG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3A322D"/><stop offset=".5" stop-color="#211B18"/><stop offset="1" stop-color="#14100E"/></linearGradient>
    <linearGradient id="bezG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${P.brass3}"/><stop offset=".35" stop-color="${P.brass}"/><stop offset=".7" stop-color="${P.brass2}"/><stop offset="1" stop-color="${P.brass3}"/></linearGradient>
    <radialGradient id="dialG" cx=".5" cy=".7" r=".8"><stop offset="0" stop-color="#FFFBF1"/><stop offset="1" stop-color="#EADFC8"/></radialGradient>
    <linearGradient id="glare" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".0"/><stop offset=".42" stop-color="#fff" stop-opacity=".0"/><stop offset=".5" stop-color="#fff" stop-opacity=".5"/><stop offset=".62" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
    <linearGradient id="cellG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8A8F94"/><stop offset=".3" stop-color="#E6E8EA"/><stop offset=".55" stop-color="#B9BEC3"/><stop offset="1" stop-color="#6D7277"/></linearGradient>
    <linearGradient id="wrapG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.ox}"/><stop offset=".3" stop-color="#A2524A"/><stop offset=".6" stop-color="${P.ox}"/><stop offset="1" stop-color="#4A1B1B"/></linearGradient>
  </defs>`;

  // ---------------- instruction card, left ----------------
  s += `<g transform="rotate(-2.2 310 600)">${card(46, 70, 540, 1110, 'url(#paperP)', 0)}<rect x="46" y="70" width="540" height="1110" fill="#F8F1E2" opacity=".55"/>
    <rect x="70" y="94" width="492" height="1062" fill="none" stroke="${P.walnut}" stroke-width="1.2" opacity=".55"/></g>`;
  let ch = '';
  ch += `<div style="font-family:Typewriter;font-size:14px;letter-spacing:.12em;color:${P.ox}">INSTRUCTIONS · KEEP WITH TESTER</div>`;
  ch += `<div style="font-family:Gloock;font-size:44px;line-height:1.02;margin-top:14px;color:${P.walnut}">before anyone opens a clock, the needle gets a vote</div>`;
  ch += `<div style="font-family:Typewriter;font-size:16.5px;line-height:1.5;margin-top:18px;color:${P.ink}">In the RepairMonitor logs, the most common fault in a clock is a dead battery. So the first tool out of bin D3 is this one.</div>`;
  ch += `<div style="font-family:Typewriter;font-size:15px;letter-spacing:.1em;margin-top:26px;color:${P.ox}">1 · HOW TO READ IT</div>`;
  ch += `<div style="font-family:Typewriter;font-size:16px;line-height:1.5;margin-top:6px">Red probe on the + end. Black probe on the flat − end. The needle swings into one of three zones.</div>`;
  ch += `<div style="font-family:Typewriter;font-size:15px;letter-spacing:.1em;margin-top:24px;color:${P.ox}">2 · WHY NOT A PLAIN METER</div>`;
  ch += `<div style="font-family:Typewriter;font-size:16px;line-height:1.5;margin-top:6px">A battery can read fine on a meter with nothing attached and still fail under load. The tester puts a small load across it, so a tired cell shows itself.</div>`;
  ch += `<div style="font-family:Typewriter;font-size:15px;letter-spacing:.1em;margin-top:24px;color:${P.ox}">3 · THE THREE ZONES</div>`;
  [[P.ox2, 'REPLACE', 'spent. Swap it before anyone opens the case.'], ['#C9A23E', 'LOW', 'tired. Swap it soon.'], [P.bottle2, 'GOOD', 'fresh. Look for the fault elsewhere.']].forEach(([c, k, t]) => {
    ch += `<div style="display:flex;gap:10px;align-items:baseline;margin-top:7px;font-family:Typewriter;font-size:15.5px;line-height:1.35"><span style="flex:none;width:16px;height:12px;background:${c};display:inline-block"></span><span style="flex:none;width:78px;color:${c};letter-spacing:.06em">${k}</span><span>${t}</span></div>`;
  });
  h += `<div class="t" style="left:96px;top:118px;width:450px;transform:rotate(-2.2deg);transform-origin:214px 480px">${ch}</div>`;
  // the two little circuit sketches on the card
  const sk = (x, y, load, lab, ok) => {
    let o = `<g transform="translate(${x} ${y}) rotate(-2.2)" fill="none" stroke="${P.walnut}" stroke-width="1.6" stroke-linecap="round" filter="url(#rough)">`;
    o += `<rect x="0" y="40" width="34" height="70" rx="5" fill="${P.ivory2}"/><rect x="11" y="32" width="12" height="8" fill="${P.ivory3}"/>`;
    o += `<path d="M17 32 V10 H170 V60 M17 110 V140 H170 V96"/>`;
    // meter
    o += `<circle cx="170" cy="78" r="18" fill="#FFFBF1"/><path d="M160 84 L176 68"/>`;
    if (load) {
      o += `<path d="M70 10 V24 l8 4 l-16 6 l16 6 l-16 6 l16 6 l-16 6 l8 4 V140"/>`;
      for (let i = 0; i < 3; i++) o += `<path d="M${98 + i * 22} 4 l6 6 l-6 6" stroke="${P.ox}"/>`;
    }
    o += `</g>`;
    s += o;
    h += T(x + 216, y + 50, '', lab, `width:150px;font-family:Kalam;font-size:16px;line-height:1.25;color:${ok ? P.bottle : P.ox};transform:rotate(-2.2deg)`);
  };
  sk(118, 860, false, 'nothing attached: a tired cell can still read about right', 0);
  sk(110, 1022, true, 'a small load across it: a tired cell sags, and the needle drops', 1);
  h += T(120, 836, '', 'meter alone', `font-family:Typewriter;font-size:13px;letter-spacing:.1em;color:${P.walnut2};transform:rotate(-2.2deg)`);
  h += T(112, 1000, '', 'tester, with a load', `font-family:Typewriter;font-size:13px;letter-spacing:.1em;color:${P.walnut2};transform:rotate(-2.2deg)`);

  // ---------------- the tester, right ----------------
  const BX = 640, BY = 100, BW = 560, BH = 780, CX = BX + BW / 2, CY = BY + 470, RD = 226;
  const rot3 = (x, y) => { const a = 3 * Math.PI / 180, ox = CX, oy = BY + BH / 2, dx = x - ox, dy = y - oy; return [ox + dx * Math.cos(a) - dy * Math.sin(a), oy + dx * Math.sin(a) + dy * Math.cos(a)]; };
  let d = `<g transform="rotate(3 ${CX} ${BY + BH / 2})">`;
  d += `<rect x="${BX}" y="${BY}" width="${BW}" height="${BH}" rx="38" fill="url(#bodyG)" filter="url(#shadow)"/>`;
  d += `<rect x="${BX + 8}" y="${BY + 8}" width="${BW - 16}" height="${BH - 16}" rx="32" fill="none" stroke="#5A4E46" stroke-width="2" opacity=".7"/>`;
  // brass bezel and dial window
  const WX = BX + 46, WY = BY + 50, WW = BW - 92, WH = 470;
  d += `<rect x="${WX - 14}" y="${WY - 14}" width="${WW + 28}" height="${WH + 28}" rx="22" fill="url(#bezG)" stroke="${P.brass2}" stroke-width="1.5"/>`;
  for (let i = 0; i < 4; i++) { const sx = i % 2 ? WX + WW + 2 : WX - 2, sy = i < 2 ? WY - 2 : WY + WH + 2; d += `<circle cx="${sx}" cy="${sy}" r="6" fill="${P.brass3}" stroke="${P.brass2}"/><path d="M${sx - 4} ${sy} h8" stroke="${P.brass2}" stroke-width="1.4"/>`; }
  d += `<rect x="${WX}" y="${WY}" width="${WW}" height="${WH}" rx="12" fill="url(#dialG)"/>`;
  // zones
  const Z = [[-52, -16, P.ox2, 'REPLACE'], [-16, 12, '#C9A23E', 'LOW'], [12, 52, P.bottle2, 'GOOD']];
  Z.forEach(([a0, a1, c]) => { d += `<path d="${arc(CX, CY, RD, a0, a1)}" fill="none" stroke="${c}" stroke-width="34" opacity=".9"/>`; });
  d += `<path d="${arc(CX, CY, RD + 17, -52, 52)}" fill="none" stroke="${P.ink}" stroke-width="1.6"/><path d="${arc(CX, CY, RD - 17, -52, 52)}" fill="none" stroke="${P.ink}" stroke-width="1"/>`;
  for (let a = -52; a <= 52; a += 4) { const L = (a + 52) % 13 === 0 ? 26 : 13, [x0, y0] = pt(CX, CY, RD - 22, a), [x1, y1] = pt(CX, CY, RD - 22 - L, a); d += `<path d="M${x0} ${y0} L${x1} ${y1}" stroke="${P.ink}" stroke-width="${L > 20 ? 2 : 1}"/>`; }
  // mirror strip
  d += `<path d="${arc(CX, CY, RD - 70, -48, 48)}" fill="none" stroke="#C8CDD2" stroke-width="7" opacity=".9"/>`;
  // ghost needles for a tired cell and a fresh cell, solid needle for a spent one
  const needle = (a, op, col, w) => { const [x, y] = pt(CX, CY, RD + 6, a); return `<path d="M${CX} ${CY} L${x} ${y}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" opacity="${op}"/>`; };
  d += needle(30, .28, P.ink, 2) + needle(-2, .28, P.ink, 2);
  d += needle(-36, 1, P.ink, 3);
  d += `<circle cx="${CX}" cy="${CY}" r="20" fill="url(#bezG)" stroke="${P.brass2}"/><circle cx="${CX}" cy="${CY}" r="6" fill="${P.ink}"/>`;
  // glass glare across the window
  d += `<rect x="${WX}" y="${WY}" width="${WW}" height="${WH}" rx="12" fill="url(#glare)"/>`;
  d += `<path d="M${WX + 20} ${WY + 14} Q${WX + WW * .5} ${WY + 4} ${WX + WW - 20} ${WY + 14}" stroke="#fff" stroke-width="3" opacity=".5" fill="none"/>`;
  // lower panel: model plate and terminals
  d += `<rect x="${BX + 150}" y="${BY + 572}" width="${BW - 300}" height="52" rx="4" fill="#3A322D" stroke="#57493F"/>`;
  d += `<circle cx="${BX + 150}" cy="${BY + 700}" r="22" fill="${P.ox}" stroke="#2B1A10" stroke-width="2"/><circle cx="${BX + BW - 150}" cy="${BY + 700}" r="22" fill="#151110" stroke="#57493F" stroke-width="2"/>`;
  d += `<circle cx="${BX + 150}" cy="${BY + 700}" r="8" fill="${P.brass3}"/><circle cx="${BX + BW - 150}" cy="${BY + 700}" r="8" fill="${P.brass3}"/>`;
  d += `</g>`;
  // probe leads: from the terminals, looping down to the battery
  const [rx, ry] = [BX + 150 + 4, BY + 700 + 4], [kx, ky] = [BX + BW - 150 - 8, BY + 700 + 30];
  const AX = 760, AY = 1080, AL = 330, AR = 46; // AA cell lying flat: + at the left, − at the right
  s += d;
  s += `<path d="M${rx} ${ry} C${rx - 60} ${ry + 160} ${AX - 170} ${AY - 120} ${AX - 86} ${AY - 59}" fill="none" stroke="${P.ox}" stroke-width="7" stroke-linecap="round"/>`;
  s += `<path d="M${kx} ${ky} C${kx + 120} ${ky + 170} ${AX + AL + 170} ${AY - 140} ${AX + AL + 78} ${AY - 58}" fill="none" stroke="#1C1716" stroke-width="7" stroke-linecap="round"/>`;
  // probe tips
  const probe = (x, y, r, col) => `<g transform="translate(${x} ${y}) rotate(${r})"><rect x="-9" y="-70" width="18" height="62" rx="6" fill="${col}"/><rect x="-6" y="-12" width="12" height="10" fill="${col}" opacity=".8"/><path d="M0 -2 V22" stroke="#C9CDD1" stroke-width="3.4" stroke-linecap="round"/></g>`;
  // the AA cell
  s += `<g filter="url(#shadow)"><rect x="${AX}" y="${AY - AR}" width="${AL}" height="${AR * 2}" rx="8" fill="url(#wrapG)"/></g>`;
  s += `<rect x="${AX + AL * .62}" y="${AY - AR}" width="${AL * .38}" height="${AR * 2}" rx="8" fill="url(#cellG)"/>`;
  s += `<rect x="${AX - 12}" y="${AY - 16}" width="14" height="32" rx="3" fill="url(#cellG)"/><rect x="${AX + AL - 4}" y="${AY - AR + 10}" width="8" height="${AR * 2 - 20}" rx="2" fill="url(#cellG)"/>`;
  s += probe(AX - 31, AY - 15.5, -52, P.ox) + probe(AX + AL + 23, AY - 15.5, 52, '#1C1716');
  h += T(AX + 30, AY - 22, '', '1.5 V · AA', `font-family:Fraunces;font-weight:600;font-size:26px;color:${P.ivory};letter-spacing:.04em`);
  h += T(AX - 4, AY - 13, '', '+', `font-family:Fraunces;font-weight:700;font-size:20px;color:${P.ox}`);

  // dial lettering (rotated with the device): place via an overlay div rotated 3deg about the same centre
  const dl = [];
  Z.forEach(([a0, a1, c, t]) => { const [x, y] = pt(CX, CY, RD + 44, (a0 + a1) / 2); dl.push(`<div style="position:absolute;left:${x - 80}px;top:${y - 14}px;width:160px;text-align:center;font-family:Fell;font-size:24px;letter-spacing:.12em;color:${c};transform:rotate(${(a0 + a1) / 2}deg)">${t}</div>`); });
  dl.push(`<div style="position:absolute;left:${CX - 140}px;top:${CY - 120}px;width:280px;text-align:center;font-family:Fell;font-size:15px;letter-spacing:.2em;color:${P.walnut2}">battery tester</div>`);
  dl.push(`<div style="position:absolute;left:${BX + 150}px;top:${BY + 580}px;width:${BW - 300}px;text-align:center;font-family:Fraunces;font-weight:700;font-size:26px;letter-spacing:.14em;color:#EDE3D0">BT-168</div>`);
  dl.push(`<div style="position:absolute;left:${BX + 100}px;top:${BY + 636}px;width:${BW - 200}px;text-align:center;font-family:Fraunces;font-size:15px;letter-spacing:.16em;color:#B7AA98">1.5 V CELLS · 9 V</div>`);
  dl.push(`<div style="position:absolute;left:${BX + 112}px;top:${BY + 732}px;width:80px;text-align:center;font-family:Fraunces;font-weight:700;font-size:22px;color:#E9B8B0">+</div>`);
  dl.push(`<div style="position:absolute;left:${BX + BW - 190}px;top:${BY + 732}px;width:80px;text-align:center;font-family:Fraunces;font-weight:700;font-size:22px;color:#B7AA98">−</div>`);
  h += `<div style="position:absolute;left:0;top:0;width:${W}px;height:${H}px;transform:rotate(3deg);transform-origin:${CX}px ${BY + BH / 2}px">${dl.join('')}</div>`;

  // annotations around the device
  const note = (x, y, t, w, col = P.walnut) => T(x, y, 'note', t, `width:${w}px;font-size:17.5px;line-height:1.28;color:${col}`);
  // needle readings
  h += note(1214, 270, '<b style="color:' + P.ox + '">dark needle:</b> a spent cell. Replace it before anyone opens the case.', 120);
  { const q = rot3(...pt(CX, CY, 214, -36)); s += `<path d="M1210 296 C1150 210 ${q[0] + 60} ${q[1] - 160} ${q[0]} ${q[1]}" fill="none" stroke="${P.walnut2}" stroke-width="1.1" filter="url(#rough)"/><circle cx="${q[0]}" cy="${q[1]}" r="2.6" fill="${P.walnut2}"/>`; }
  h += note(1214, 470, 'faint needles: where a tired cell and a fresh one would land', 120);
  { const q = rot3(...pt(CX, CY, 175, 30)); s += lead(1212, 492, q[0], q[1], P.walnut2, 10); }
  h += note(1000, 1150, 'black on the flat − end', 200);
  h += note(630, 1150, 'red probe on the + end', 190, P.ox);
  // the D3 brass label plate, hanging from a string
  s += `<path d="M1238 40 C1250 70 1260 90 1262 120" stroke="${P.walnut2}" stroke-width="1.4" fill="none"/>`;
  s += `<g transform="rotate(8 1262 160)" filter="url(#shadowS)"><rect x="1196" y="120" width="128" height="78" rx="4" fill="url(#bezG)" stroke="${P.brass2}"/><rect x="1203" y="127" width="114" height="64" rx="3" fill="none" stroke="${P.brass2}" stroke-width=".8"/><circle cx="1262" cy="134" r="4" fill="#2B1A10"/></g>`;
  h += T(1198, 140, '', '<div style="font-family:Fraunces;font-weight:700;font-size:28px;line-height:1">D3</div><div style="font-family:Fell;font-size:14px;letter-spacing:.12em">batteries</div>', `width:128px;text-align:center;color:${P.walnut};transform:rotate(8deg)`);
  h += T(70, H - 62, 'src', 'Battery tester drawn from bin D3, Repair Café Silicon Valley, Oct 18 2026. Clock faults: RepairMonitor analysis 2019. Needle positions are illustrative.', `width:${W - 140}px`);
  mount(W, H, s, h);
};
