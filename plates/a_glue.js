// glue steeps like tea: the MIT D-Lab glue chart from the F5 tub, set as an antique tea-tin label
ASSETS.glue = () => {
  const W = 1500, H = 1370;
  let s = '', h = '';
  const M = 60, Hr = 3600, Dy = 86400;
  const G = [
    ['super glue', 'cyanoacrylate', 5, 30, 2 * Hr, P.rose2, 'Tiny cracks in hard, smooth things. Brittle, so not for anything that bends.', 0],
    ['hot glue', 'melts, then cools', 15, 60, Dy, '#C9A23E', 'Fills gaps fast. Lets go when it gets warm again.', 0],
    ['contact adhesive', 'coat both sides, wait, press', 5 * M, 30 * M, Dy, P.cocoa2, 'Grabs the instant the two sides touch, so line it up first.', 0],
    ['acrylic', 'two-part', 3 * M, 20 * M, 8 * Hr, P.blue2, 'Strong even on dirty or oily plastic.', 0],
    ['PVA', 'wood glue, white glue', 5 * M, 10 * M, Dy, P.ivory3, 'Wood, paper, cloth. Clamp it.', 1],
    ['construction adhesive', 'Liquid Nails', 10 * M, 30 * M, 12 * Hr, P.walnut2, 'Heavy and gap-filling, for big flat jobs.', 0],
    ['polyurethane', 'Gorilla Glue', 20 * M, 30 * M, 6 * Hr, P.sage2, 'Swells as it cures, so clamp it and use a thin layer.', 1],
    ['silicone', 'cures from the air', 20 * M, 40 * M, 72 * Hr, '#8FB3A4', 'A sealant more than a glue. Stretches and stays waterproof.', 0],
    ['epoxy', 'two-part', 2 * M, 60 * M, Dy, '#9A84B5', 'The strongest bond and the most heat resistant. Do not clamp.', 0],
    ['urethane', 'two-part, elastic', 2 * M, 120 * M, 7 * Dy, P.ox2, 'Flexes with impact, for joining things that move differently.', 0],
  ];
  // the tin label: bottle-green frame, brass rules, ivory field
  const X0 = 30, Y0 = 30, X1 = W - 30, Y1 = H - 30;
  s += `<g filter="url(#shadow)"><rect x="${X0}" y="${Y0}" width="${X1 - X0}" height="${Y1 - Y0}" rx="6" fill="${P.bottle}"/></g>`;
  // damask-ish dots on the green
  for (let y = Y0 + 14; y < Y1 - 6; y += 18) for (let x = X0 + 14 + ((y / 18) % 2) * 9; x < X1 - 6; x += 18) s += `<circle cx="${x}" cy="${y}" r="1.3" fill="${P.brass3}" opacity=".22"/>`;
  s += `<rect x="${X0 + 14}" y="${Y0 + 14}" width="${X1 - X0 - 28}" height="${Y1 - Y0 - 28}" rx="4" fill="none" stroke="${P.brass}" stroke-width="2.4"/>`;
  s += `<rect x="${X0 + 22}" y="${Y0 + 22}" width="${X1 - X0 - 44}" height="${Y1 - Y0 - 44}" rx="3" fill="none" stroke="${P.brass3}" stroke-width=".8"/>`;
  // field
  const FX = X0 + 44, FY = Y0 + 44, FW = X1 - X0 - 88, FH = Y1 - Y0 - 88;
  s += `<rect x="${FX}" y="${FY}" width="${FW}" height="${FH}" fill="url(#paperP)"/><rect x="${FX}" y="${FY}" width="${FW}" height="${FH}" fill="#F7EFDF" opacity=".7"/>`;
  s += `<rect x="${FX + 8}" y="${FY + 8}" width="${FW - 16}" height="${FH - 16}" fill="none" stroke="${P.bottle}" stroke-width="1" opacity=".6"/>`;
  // corner rosettes on the frame
  const ros = (x, y) => { let o = `<circle cx="${x}" cy="${y}" r="15" fill="${P.brass}" stroke="${P.brass2}"/>`; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; o += `<ellipse cx="${x + 8 * Math.cos(a)}" cy="${y + 8 * Math.sin(a)}" rx="4" ry="2.2" transform="rotate(${i * 45} ${x + 8 * Math.cos(a)} ${y + 8 * Math.sin(a)})" fill="${P.brass3}"/>`; } return o + `<circle cx="${x}" cy="${y}" r="3.5" fill="${P.ox}"/>`; };
  s += ros(X0 + 22, Y0 + 22) + ros(X1 - 22, Y0 + 22) + ros(X1 - 22, Y1 - 22) + ros(X0 + 22, Y1 - 22);

  // header: an oval cartouche with the title, flanked by the bin plate and a sand timer
  const HC = W / 2;
  s += `<ellipse cx="${HC}" cy="${FY + 112}" rx="330" ry="82" fill="${P.cream}" stroke="${P.bottle}" stroke-width="2.4"/><ellipse cx="${HC}" cy="${FY + 112}" rx="318" ry="72" fill="none" stroke="${P.brass}" stroke-width="1" stroke-dasharray="2 4"/>`;
  h += T(HC - 340, FY + 46, '', 'the glue tub · bin f5', `width:680px;text-align:center;font-family:Fell;font-size:16px;letter-spacing:.26em;color:${P.bottle}`);
  h += T(HC - 340, FY + 70, '', 'glue steeps like tea', `width:680px;text-align:center;font-family:Gloock;font-size:66px;line-height:1.1;color:${P.ox}`);
  h += T(FX + 40, FY + 46, '', 'Every glue has two times: when it holds on its own, and when it reaches full strength. The quick ones are rarely the strong ones.', `width:262px;font-family:Fraunces;font-style:italic;font-size:16.5px;line-height:1.35;color:${P.walnut}`);
  // sand timer, right
  const tx = X1 - 200, ty = FY + 50;
  s += `<g transform="translate(${tx} ${ty})" filter="url(#shadowS)"><rect x="0" y="0" width="90" height="12" rx="2" fill="${P.walnut}"/><rect x="0" y="138" width="90" height="12" rx="2" fill="${P.walnut}"/>
    <path d="M8 12 V138 M82 12 V138" stroke="${P.walnut2}" stroke-width="5"/>
    <path d="M20 14 C20 52 42 64 45 75 C48 64 70 52 70 14 Z" fill="#F4EEE2" stroke="${P.walnut2}" stroke-width="1.2" opacity=".95"/><path d="M20 136 C20 98 42 86 45 75 C48 86 70 98 70 136 Z" fill="#F4EEE2" stroke="${P.walnut2}" stroke-width="1.2" opacity=".95"/>
    <path d="M30 34 C34 50 42 60 45 70 C48 60 56 50 60 34 Z" fill="${P.brass}"/><path d="M45 72 V122" stroke="${P.brass}" stroke-width="1.6"/><path d="M26 134 Q45 104 64 134 Z" fill="${P.brass}"/></g>`;
  h += T(tx - 70, ty + 158, '', 'set, then cure', `width:230px;text-align:center;font-family:Fell;font-size:15px;letter-spacing:.14em;color:${P.walnut2}`);

  // chart geometry: log axis 5 s to 7 days
  const CX0 = 520, CX1 = FX + FW - 60, L0 = Math.log10(5), L1 = Math.log10(7 * Dy);
  const tX = sec => CX0 + (Math.log10(sec) - L0) / (L1 - L0) * (CX1 - CX0);
  const RY0 = FY + 300, RH = 76;
  const TICKS = [[5, '5 s'], [30, '30 s'], [M, '1 min'], [10 * M, '10 min'], [Hr, '1 hour'], [6 * Hr, '6 h'], [Dy, '1 day'], [7 * Dy, '1 week']];
  const yTop = RY0 - 30, yBot = RY0 + G.length * RH;
  // alternate row bands
  G.forEach((g, i) => { if (i % 2 === 0) s += `<rect x="${FX + 20}" y="${RY0 + i * RH}" width="${FW - 40}" height="${RH}" fill="${P.ivory2}" opacity=".45"/>`; });
  TICKS.forEach(([sec, lab]) => {
    const x = tX(sec);
    s += `<path d="M${x} ${yTop} V${yBot}" stroke="${P.walnut2}" stroke-width=".8" stroke-dasharray="2 5" opacity=".7"/>`;
    h += T(x - 50, yTop - 30, '', lab, `width:100px;text-align:center;font-family:Fell;font-size:17px;letter-spacing:.06em;color:${P.walnut}`);
    h += T(x - 50, yBot + 8, '', lab, `width:100px;text-align:center;font-family:Fell;font-size:17px;letter-spacing:.06em;color:${P.walnut}`);
  });
  // a C-clamp icon
  const clamp = (x, y) => `<g transform="translate(${x} ${y}) scale(.9)" fill="none" stroke="${P.walnut}" stroke-linecap="round" stroke-linejoin="round"><path d="M16 -16 H2 Q-8 -16 -8 -6 V6 Q-8 16 2 16 H16" stroke-width="4"/><path d="M16 -16 V-8" stroke-width="4"/><path d="M12 -6 H20" stroke-width="2.4"/><path d="M16 26 V-2" stroke-width="2.2"/><path d="M9 26 H23" stroke-width="3"/></g>`;
  G.forEach(([name, kind, a, b, full, col, use, cl], i) => {
    const y = RY0 + i * RH, cy = y + RH / 2;
    h += T(FX + 40, y + 9, '', name, `width:420px;font-family:Fell;font-size:24px;letter-spacing:.03em;color:${P.ox};line-height:1.05`);
    h += T(FX + 40, y + 36, '', `<i style="color:${P.bottle}">${kind}.</i> ${use}`, `width:400px;font-family:Fraunces;font-size:14.5px;line-height:1.25;color:${P.walnut}`);
    const xa = tX(a), xb = tX(b), xf = tX(full);
    // steep line to full strength
    s += `<path d="M${xb + 4} ${cy} H${xf - 14}" stroke="${col}" stroke-width="2.4" stroke-dasharray="1 7" stroke-linecap="round"/>`;
    // the set window, drawn as a tea-stained bar
    s += `<rect x="${xa}" y="${cy - 13}" width="${Math.max(10, xb - xa)}" height="26" rx="3" fill="${col}" opacity=".9" filter="url(#wcs)"/>`;
    s += `<rect x="${xa}" y="${cy - 13}" width="${Math.max(10, xb - xa)}" height="26" rx="3" fill="none" stroke="${P.walnut}" stroke-width=".8" opacity=".5"/>`;
    // full strength: a check in a brass ring
    s += `<circle cx="${xf}" cy="${cy}" r="12" fill="${P.cream}" stroke="${P.brass2}" stroke-width="1.6"/><path d="M${xf - 6} ${cy} l4 5 l8 -10" fill="none" stroke="${P.bottle}" stroke-width="2.4" stroke-linecap="round"/>`;
    if (cl) s += clamp(xa - 44, cy);
  });
  // legend
  const LY = yBot + 52;
  s += `<rect x="${FX + 40}" y="${LY + 4}" width="56" height="20" rx="3" fill="${P.rose2}" filter="url(#wcs)"/>`;
  h += T(FX + 108, LY + 2, '', 'holds on its own somewhere in this window', `width:300px;white-space:nowrap;font-family:Kalam;font-size:17px;line-height:1.2;color:${P.walnut}`);
  s += `<path d="M${FX + 452} ${LY + 14} H${FX + 500}" stroke="${P.rose2}" stroke-width="2.4" stroke-dasharray="1 7" stroke-linecap="round"/><circle cx="${FX + 514}" cy="${LY + 14}" r="12" fill="${P.cream}" stroke="${P.brass2}" stroke-width="1.6"/><path d="M${FX + 508} ${LY + 14} l4 5 l8 -10" fill="none" stroke="${P.bottle}" stroke-width="2.4" stroke-linecap="round"/>`;
  h += T(FX + 538, LY + 2, '', 'full strength', `width:160px;font-family:Kalam;font-size:17px;color:${P.walnut}`);
  s += clamp(FX + 730, LY + 14);
  h += T(FX + 762, LY + 2, '', 'clamp it while it sets', `width:220px;font-family:Kalam;font-size:17px;color:${P.walnut}`);
  h += T(FX + 40, FY + FH - 40, 'src', 'MIT D-Lab, Learn-It: Adhesives (CC BY-NC 3.0), the chart taped up over the glue tub at Repair Café Silicon Valley, Oct 18 2026. Times as printed on the chart. Log scale.', `width:${FW - 80}px`);
  mount(W, H, s, h);
};
