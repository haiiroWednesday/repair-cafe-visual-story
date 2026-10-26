// six aprons on the rail: one per table in our story, and every badge says the same word
ASSETS.aprons = () => {
  const W = 1720, H = 1340;
  let s = '', h = '';
  s += `<defs>
    <linearGradient id="apWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7A5038"/><stop offset=".5" stop-color="${P.walnut2}"/><stop offset="1" stop-color="${P.walnut}"/></linearGradient>
    <radialGradient id="apBrass" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#F0DDB0"/><stop offset=".5" stop-color="${P.brass}"/><stop offset="1" stop-color="${P.brass2}"/></radialGradient>
    <linearGradient id="apShade" x1="0" x2="1"><stop offset="0" stop-color="#2B1A10" stop-opacity=".28"/><stop offset=".22" stop-color="#2B1A10" stop-opacity="0"/><stop offset=".6" stop-color="#fff" stop-opacity=".08"/><stop offset=".85" stop-color="#2B1A10" stop-opacity="0"/><stop offset="1" stop-color="#2B1A10" stop-opacity=".3"/></linearGradient>
    ${['gingham_green', 'gingham_pink', 'denim', 'herringbone', 'knit'].map(t => `<pattern id="ap_${t}" patternUnits="userSpaceOnUse" width="260" height="260"><image href="tex/${t}.jpg" width="260" height="260" preserveAspectRatio="xMidYMid slice"/></pattern>`).join('')}
  </defs>`;
  // the peg rail
  const RY = 70;
  s += `<rect x="30" y="${RY}" width="${W - 60}" height="56" fill="url(#apWood)" filter="url(#shadow)"/>`;
  for (let i = 0; i < 7; i++) s += `<path d="M30 ${RY + 8 + i * 7} C400 ${RY + 10 + i * 7} 900 ${RY + 4 + i * 7} ${W - 30} ${RY + 9 + i * 7}" stroke="#3A2419" stroke-width="${.5 + (i % 3) * .3}" opacity=".35" fill="none"/>`;
  s += `<path d="M30 ${RY + 2} H${W - 30}" stroke="${P.brass3}" stroke-width="1" opacity=".4"/>`;
  [60, W - 60].forEach(x => { s += `<circle cx="${x}" cy="${RY + 28}" r="8" fill="url(#apBrass)"/><path d="M${x - 5} ${RY + 28} h10" stroke="${P.brass2}" stroke-width="1.4"/>`; });

  // one apron per table in our story, in the order a visit runs
  const A = [
    { role: 'check-in', fill: '#C9AE7C', tint: '#C9AE7C', tools: [], slip: true, duties: 'greets you, hands out the waiver, prints the slip, pins it to the board. three of the day’s slips: 11:47 sewing machine, 12:57 pants, 1:47 table fan.' },
    { role: 'the textile table', fill: 'url(#ap_gingham_pink)', tint: P.rose, tools: [['scissors', -64, -70, 112, -10], ['tapemeasure', 14, -66, 90, 6]], duties: 'ticket #1, a sewing machine whose needle hit the foot. ticket #2, pants torn in the inner thigh. three donated machines behind.' },
    { role: 'the appliance table', fill: P.lilac, tint: P.lilac, tools: [['magnifier', -60, -86, 100, -6], ['tweezers', 20, -88, 86, 14]], duties: 'a gold heart clock with roses. one woman held the frame while the other read its parts under a magnifier.' },
    { role: 'the lamp table', fill: P.cream, tint: P.ivory2, lace: true, tools: [['bulbs', -58, -76, 108, -8]], duties: 'a brass candelabra with two candle bulbs, 25 watts each on E12 bases. lit, and working.' },
    { role: 'the electronics bench', fill: 'url(#ap_gingham_green)', tint: P.sage, tools: [['iron', -50, -78, 110, -18], ['meter', 18, -84, 92, 10]], duties: 'bench 2. my stereo from August 2003. no spare cable exists, so twenty strands were soldered pin to pin.' },
    { role: 'jazz', earlier: true, fill: 'url(#ap_denim)', tint: P.blue2, tools: [['wire', -54, -84, 100, -10], ['pliers', 10, -90, 96, 12]], duties: 'a cuckoo clock that reminded a woman of her late father. its chains had slipped. he fed them back with a stiff wire, and got the biggest hug.' },
  ];
  const step = (W - 340) / 5;
  A.forEach((a, i) => {
    const cx = 170 + i * step, hy = RY + 40, sw = 1 + (i % 3 - 1) * .01;
    const rot = [-1.5, 1, -0.6, 1.4, -1, 0.8][i];
    let g = '';
    // neck strap looped over the hook
    g += `<path d="M${cx - 58} 236 C${cx - 46} 170 ${cx - 14} ${hy + 30} ${cx} ${hy + 22} C${cx + 14} ${hy + 30} ${cx + 46} 170 ${cx + 58} 236" fill="none" stroke="${P.ivory3}" stroke-width="7" stroke-linecap="round"/>`;
    g += `<path d="M${cx - 58} 236 C${cx - 46} 170 ${cx - 14} ${hy + 30} ${cx} ${hy + 22} C${cx + 14} ${hy + 30} ${cx + 46} 170 ${cx + 58} 236" fill="none" stroke="#fff" stroke-width="1.4" stroke-dasharray="3 4" opacity=".5"/>`;
    // apron body: bib, waist, skirt
    const body = `M${cx - 62} 230 L${cx + 62} 230 L${cx + 74} 396 L${cx + 120} 404 C${cx + 128} 520 ${cx + 130} 620 ${cx + 124} 730 C${cx + 60} 744 ${cx - 60} 744 ${cx - 124} 730 C${cx - 130} 620 ${cx - 128} 520 ${cx - 120} 404 L${cx - 74} 396 Z`;
    g += `<path d="${body}" fill="${a.fill}" filter="url(#shadow)"/>`;
    if (a.fill.startsWith('#')) g += `<path d="${body}" fill="url(#paperP)" opacity=".55" style="mix-blend-mode:multiply"/><path d="${body}" fill="${a.tint}" opacity=".3" filter="url(#wc)"/>`;
    g += `<path d="${body}" fill="url(#apShade)"/>`;
    // folds in the skirt
    for (let k = -2; k <= 2; k++) g += `<path d="M${cx + k * 42} 430 C${cx + k * 44 + 4} 560 ${cx + k * 46 - 4} 650 ${cx + k * 48} 736" stroke="#2B1A10" stroke-width="${k % 2 ? 6 : 3}" opacity=".07" fill="none"/>`;
    g += `<path d="${body}" fill="none" stroke="#2B1A10" stroke-opacity=".25" stroke-width="1.2" stroke-dasharray="4 3" transform="translate(0 0)"/>`;
    // waist band and ties
    g += `<path d="M${cx - 124} 396 L${cx + 124} 396 L${cx + 122} 420 L${cx - 122} 420 Z" fill="${a.tint}" stroke="#2B1A10" stroke-opacity=".25"/>`;
    g += `<path d="M${cx + 122} 408 C${cx + 150} 430 ${cx + 136} 520 ${cx + 150} 600" stroke="${a.tint}" stroke-width="12" fill="none" stroke-linecap="round" opacity=".95"/>`;
    g += `<path d="M${cx - 122} 408 C${cx - 146} 440 ${cx - 132} 540 ${cx - 146} 620" stroke="${a.tint}" stroke-width="12" fill="none" stroke-linecap="round" opacity=".95"/>`;
    if (a.lace) g += lacetrim(cx - 128, 716, 256, 'gold', 40);
    // tools tucked in the pocket (drawn before the pocket so it covers them)
    a.tools.forEach(([n, dx, dy, sz, r]) => { sz *= 1.25; dy -= 18; g += `<g transform="rotate(${r} ${cx + dx + sz / 2} ${560 + dy + sz / 2})"><image href="tools/${n}.webp" x="${cx + dx}" y="${560 + dy}" width="${sz}" height="${sz}"/></g>`; });
    if (a.slip) {
      g += `<g transform="rotate(-8 ${cx - 20} 500)"><rect x="${cx - 70}" y="${470}" width="96" height="110" fill="#FBF8F1" stroke="#D9CFBC"/>${[0, 1, 2, 3, 4].map(k => `<path d="M${cx - 60} ${490 + k * 12} h${[60, 74, 50, 70, 40][k]}" stroke="#3A332E" stroke-width="2" opacity=".55"/>`).join('')}</g>`;
      g += `<g transform="rotate(14 ${cx + 40} 520)"><rect x="${cx + 34}" y="${440}" width="10" height="120" fill="#D9A93F"/><path d="M${cx + 34} 440 l5 -16 l5 16 z" fill="#E8C9A0"/><rect x="${cx + 34}" y="${552}" width="10" height="12" fill="${P.rose2}"/></g>`;
    }
    const pk = `M${cx - 78} 540 H${cx + 78} L${cx + 74} 630 C${cx + 40} 642 ${cx - 40} 642 ${cx - 74} 630 Z`;
    g += `<path d="${pk}" fill="${a.fill}"/>`;
    if (a.fill.startsWith('#')) g += `<path d="${pk}" fill="${a.tint}" opacity=".45"/>`;
    g += `<path d="${pk}" fill="#2B1A10" opacity=".1"/><path d="M${cx - 78} 540 H${cx + 78}" stroke="#2B1A10" stroke-opacity=".3" stroke-width="2"/>`;
    g += `<path d="M${cx - 70} 548 H${cx + 70} L${cx + 67} 622 C${cx + 36} 632 ${cx - 36} 632 ${cx - 67} 622 Z" fill="none" stroke="${P.cream}" stroke-width="1.3" stroke-dasharray="4 3" opacity=".8"/>`;
    // the same badge on every bib
    g += `<g filter="url(#shadowS)"><rect x="${cx - 46}" y="${282}" width="92" height="44" fill="#FBF8F1" stroke="url(#apBrass)" stroke-width="3"/></g>`;
    g += `<rect x="${cx - 6}" y="${274}" width="12" height="10" fill="url(#apBrass)"/>`;
    // the brass hook itself, on top of the strap
    g += `<path d="M${cx} ${RY + 20} V${hy + 6} C${cx} ${hy + 30} ${cx + 22} ${hy + 30} ${cx + 22} ${hy + 12}" fill="none" stroke="url(#apBrass)" stroke-width="7" stroke-linecap="round"/><circle cx="${cx}" cy="${RY + 20}" r="10" fill="url(#apBrass)" stroke="${P.brass2}"/>`;
    s += `<g transform="rotate(${rot} ${cx} ${RY + 30})">${g}</g>`;
    h += T(cx - 46, 285, 'lbl', 'VOLUNTEER<br><span style="font-size:8.5px;letter-spacing:.08em">REPAIR CAFÉ · S.V.</span>', `width:92px;text-align:center;font-size:11.5px;letter-spacing:.02em;line-height:1.35;color:${P.ink};transform:rotate(${rot}deg);transform-origin:46px ${RY + 30 - 285}px`);
    // a hang tag on a thread from the right tie: the job itself
    const tx = cx - 108, ty = 790, tr = [-3, 2, -2, 3, -1.5, 2.5][i];
    s += `<path d="M${cx + 148} 600 C${cx + 140} 680 ${cx + 40} 720 ${tx + 30} ${ty + 22}" fill="none" stroke="#8C7A62" stroke-width="1.2"/>`;
    s += `<g transform="rotate(${tr} ${tx + 115} ${ty + 120})" filter="url(#shadowS)"><path d="M${tx + 18} ${ty} H${tx + 226} V${ty + 205} H${tx} V${ty + 18} Z" fill="${P.ivory}" stroke="${P.ivory3}"/><circle cx="${tx + 30}" cy="${ty + 22}" r="7" fill="none" stroke="${P.brass}" stroke-width="3"/><path d="M${tx + 12} ${ty + 58} H${tx + 214}" stroke="${a.tint}" stroke-width="5"/></g>`;
    if (a.earlier) { s += `<g transform="rotate(-12 ${tx + 170} ${ty + 30})"><rect x="${tx + 118}" y="${ty + 14}" width="106" height="30" fill="none" stroke="${P.ox}" stroke-width="2" opacity=".75"/></g>`; h += T(tx + 118, ty + 19, 'lbl', 'earlier event', `width:106px;text-align:center;font-size:13px;color:${P.ox};opacity:.8;transform:rotate(-12deg)`); }
    h += `<div class="t" style="left:${tx + 14}px;top:${ty + 64}px;width:200px;transform:rotate(${tr}deg);transform-origin:101px 56px">
      <div class="lbl" style="font-size:18px;color:${P.ox};line-height:1.1;white-space:nowrap">${a.role}</div>
      <div style="font-family:Fraunces;font-style:italic;font-size:15px;line-height:1.32;color:${P.walnut};margin-top:7px">${a.duties}</div></div>`;
  });

  // the strip of numbers along the bottom
  const BY = 1046;
  s += `<g filter="url(#shadow)"><rect x="70" y="${BY}" width="${W - 140}" height="214" fill="${P.ivory}" filter="url(#deckle)"/></g><rect x="74" y="${BY + 4}" width="${W - 148}" height="206" fill="url(#paperP)" opacity=".35" style="mix-blend-mode:multiply"/>`;
  s += lacetrim(60, BY - 20, W - 120, 'pink', 38);
  h += T(110, BY + 40, 'script', 'worth an afternoon', `font-size:52px;width:380px;line-height:1.05`);
  h += T(112, BY + 126, 'lbl', 'six tables, one badge. the job is on the sign-up sheet. the badge just says volunteer.', `font-size:15px;width:340px;line-height:1.4`);
  s += `<path d="M500 ${BY + 36} V${BY + 186}" stroke="${P.brass}" stroke-width="1.2"/>`;
  h += T(540, BY + 44, 'num', 'A thing is worth saving for as long as someone still wants it, and the Repair Café gives that wanting an afternoon and a pair of hands.', `width:${W - 680}px;font-size:33px;line-height:1.28;font-style:italic;font-weight:400;color:${P.ox}`);
  h += T(540, BY + 160, '', 'Sunday 18 October 2026, 11 to 3, Billy DeFrank Center, 938 The Alameda', `width:${W - 680}px;font-family:Fell;font-size:16px;letter-spacing:.06em;color:${P.walnut2}`);
  h += T(70, H - 40, 'src', 'What came to each table: the printed tickets and my photos, Repair Café Silicon Valley, Oct 18 2026. The cuckoo clock as told by Jazz, volunteer fixer, from an earlier event. Tools in the pockets are decoration.', `width:${W - 140}px;text-align:center`);
  mount(W, H, s, h);
};
