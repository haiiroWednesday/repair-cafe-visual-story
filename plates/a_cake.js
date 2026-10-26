// seventeen candles: the timeline on the 3D cake. Cameo medallions on the tiers are the years that moved the story.
ASSETS.cake = () => {
  const W = 1720, H = 1420, K = .84, IX = 860 - 640 * K, IY = 190;
  const at = (x, y) => [IX + x * K, IY + y * K];
  let s = '', h = '';
  // a soft shadow and a doily under the cake board
  s += `<ellipse cx="860" cy="${IY + 905 * K}" rx="${560 * K}" ry="${70 * K}" fill="#2B1A10" opacity=".16" filter="url(#glow)"/>`;
  s += `<g transform="translate(860 ${IY + 860 * K}) scale(1 .2) translate(-860 ${-(IY + 860 * K)})">${doilyImg(860, IY + 860 * K, 1260, 'gold', .9)}</g>`;
  s += `<image href="t3/cake_640_17_v4.png" x="${IX}" y="${IY}" width="${1280 * K}" height="${998 * K}"/>`;
  // a cameo medallion piped onto the side of a tier
  function medal(x, y, col) {
    return `<g filter="url(#shadowS)"><ellipse cx="${x}" cy="${y}" rx="50" ry="38" fill="${P.cream}" stroke="${col}" stroke-width="2.4"/>
      <ellipse cx="${x}" cy="${y}" rx="42" ry="30" fill="none" stroke="${col}" stroke-width="1" stroke-dasharray="1.5 3.5"/></g>` + pearlRow(x - 28, y - 45, x + 28, y - 45, 6, 2.5);
  }
  // bottom tier carries 2009 to 2017, the top tier 2023 to 2026
  const bot = [255, 448, 640, 832, 1025].map(x => [x, 752 + 38 * (1 - ((x - 640) / 520) ** 2)]);
  const top = [398, 560, 724, 886].map(x => [x, 492 + 16 * (1 - ((x - 642) / 360) ** 2)]);
  const YRS = ['2009', '2010', '2012', '2013', '2017', '2023', '2024', '2025', '2026'];
  const MED = [...bot, ...top].map(([x, y], i) => [...at(x, y), YRS[i]]);
  MED.forEach(([x, y, yr], i) => {
    const col = i < 5 ? P.ox : P.bottle;
    s += medal(x, y, col);
    h += T(x - 50, y - 17, 'num', yr, `width:100px;text-align:center;font-size:26px;font-style:italic;font-weight:500;color:${col}`);
  });
  // a year over every candle: 2010 to 2026. Oxblood years moved the story.
  const flagged = new Set([2010, 2012, 2013, 2017, 2023, 2024, 2025, 2026]);
  const tops = [101, 109, 90, 102, 84, 97, 81, 95, 80, 95, 81, 97, 84, 102, 90, 109, 100];
  for (let i = 0; i < 17; i++) {
    const yr = 2010 + i, [x, fy] = at(370 + i * 33.6, tops[i]), ly = i % 2 ? 98 : 128, dark = flagged.has(yr);
    s += `<path d="M${x} ${ly + 24} V${fy - 6}" stroke="${P.walnut2}" stroke-width=".8" stroke-dasharray="1.5 3" opacity=".75"/>`;
    if (dark) s += `<circle cx="${x}" cy="${ly + 30}" r="3" fill="${P.ox}"/>`;
    h += T(x - 22, ly, 'lbl', '’' + String(yr).slice(2), `width:44px;text-align:center;font-size:19px;color:${dark ? P.ox : P.walnut2}`);
  }
  // the events, left and right, each tied to its medallion
  const EV = [
    ['L', '18 Oct 2009 · Amsterdam', 'Martine Postma, a journalist, opens the first Repair Café in the Fijnhout Theater.', 0],
    ['L', '2 Mar 2010', 'A foundation forms so other towns can start their own.', 1],
    ['L', '14 Oct 2012 · Palo Alto', 'Peter Skinner reads about Amsterdam in May. By October the first one in the U.S. is running behind the Museum of American Heritage.', 2],
    ['R', '2013 · Mountain View', 'Maia and Greg Coladonato start one down the road.', 3],
    ['R', '2017', 'Cafés begin logging every repair in RepairMonitor. 305,649 by late 2025.', 4],
    ['L', '2023', 'Palo Alto and Mountain View join as Repair Café Silicon Valley.', 5],
    ['L', '1 Jul 2024', 'California’s right-to-repair law takes effect.', 6],
    ['R', 'Oct 2025', '3,818 Repair Cafés worldwide.', 7],
    ['R', '18 Oct 2026 · San José', 'Seventeen years to the day, the café sets up at 938 The Alameda for the first time. My stereo is on the bench.', 8],
  ];
  // callouts spread down each margin in time order. Leaders to inner medallions swing round from below
  // (bottom tier) or above (top tier) so they never cross another cameo.
  const START = { L: 330, R: 520 };
  function leadTo(ax, ay, mx, my, inner, tierTop, dir) {
    if (!inner) return lead(ax, ay, mx - dir * 50, my, P.walnut2, 0);
    const ey = tierTop ? my - 38 : my + 38, cy = tierTop ? my - 120 : my + 125;
    return `<path d="M${ax} ${ay} C${ax + dir * 160} ${ay} ${mx - dir * 40} ${cy} ${mx} ${ey}" fill="none" stroke="${P.walnut2}" stroke-width="1.1" stroke-linecap="round" filter="url(#rough)"/><circle cx="${mx}" cy="${ey}" r="2.6" fill="${P.walnut2}"/>`;
  }
  // callout slot (y) per cameo, ordered so leaders nest: arcs over the top tier sit highest,
  // straight leaders sit level with their cameo, arcs under the bottom tier sit lowest and deepest
  const SLOT = { 6: 360, 5: 540, 0: 730, 1: 870, 2: 990, 7: 400, 8: 540, 4: 770, 3: 890 };
  const OUTER = new Set([5, 0, 8, 4]);
  for (const [sd, d, t, mi] of EV) {
    const L = sd === 'L', dir = L ? 1 : -1, x = L ? 30 : W - 330, w = 300, y = SLOT[mi], [mx, my] = MED[mi];
    h += T(x, y, 'lbl', d, `width:${w}px;font-size:17px;color:${P.ox}`);
    h += T(x, y + 24, 'note', t, `width:${w}px;font-size:17.5px;line-height:1.28`);
    const ax = L ? x + w + 10 : x - 10, ay = y + 13;
    if (OUTER.has(mi)) s += lead(ax, ay, mx - dir * 50, my, P.walnut2, 0);
    else {
      const top = mi >= 5, ey = top ? my - 40 : my + 40, depth = { 1: 70, 2: 120, 3: 80, 6: 70, 7: 70 }[mi], cy = top ? my - depth - 40 : my + depth + 40;
      s += `<path d="M${ax} ${ay} C${ax + dir * 200} ${ay} ${mx} ${cy} ${mx} ${ey}" fill="none" stroke="${P.walnut2}" stroke-width="1.1" stroke-linecap="round" filter="url(#rough)"/><circle cx="${mx}" cy="${ey}" r="2.6" fill="${P.walnut2}"/>`;
    }
  }
  // place card, front left
  const PY = 1170;
  s += `<g transform="rotate(-3 290 ${PY + 80})" filter="url(#shadow)"><path d="M90 ${PY} H490 L512 ${PY + 170} H68 Z" fill="${P.cream}" stroke="${P.ivory3}"/><path d="M90 ${PY} H490" stroke="${P.brass}" stroke-width="2"/></g>`;
  s += `<g transform="rotate(-3 290 ${PY + 80})">${lacetrim(72, PY + 156, 440, 'gold', 28)}</g>`;
  h += `<div class="t" style="left:80px;top:${PY + 10}px;width:420px;transform:rotate(-3deg);transform-origin:210px 80px;text-align:center">
     <div class="script" style="font-size:58px;line-height:1">seventeen candles</div>
     <div class="lbl" style="font-size:15px;margin-top:8px;line-height:1.35">seventeen years of people deciding<br>a broken thing was worth an afternoon.<br><span style="color:${P.ox}">one candle a year · the oxblood years moved the story</span></div></div>`;
  // the day itself, typed on a ruled index card
  const CX0 = 1200, CY0 = 1060;
  s += `<g transform="rotate(2.5 ${CX0 + 235} ${CY0 + 146})" filter="url(#shadow)"><rect x="${CX0}" y="${CY0}" width="470" height="292" fill="#FBF7EE"/>`;
  for (let i = 0; i < 8; i++) s += `<path d="M${CX0} ${CY0 + 66 + i * 28} H${CX0 + 470}" stroke="#9FB4C8" stroke-width=".8" opacity=".7"/>`;
  s += `<path d="M${CX0} ${CY0 + 42} H${CX0 + 470}" stroke="${P.rose2}" stroke-width="1.2" opacity=".8"/><path d="M${CX0 + 40} ${CY0} V${CY0 + 292}" stroke="${P.rose2}" stroke-width=".8" opacity=".5"/></g>`;
  h += `<div class="t tw" style="left:${CX0 + 52}px;top:${CY0 + 12}px;width:410px;transform:rotate(2.5deg);transform-origin:183px 134px;font-size:15px;line-height:28px">
    <div style="color:${P.ox};font-size:14.5px;letter-spacing:.05em">THE SEVENTEENTH CANDLE · SUN 18 OCT</div>
    <div>11 am to 3 pm, Billy DeFrank Center</div><div>first time at this venue</div><div>30+ volunteers, one badge between them</div>
    <div>check-in, electronics, appliances, sewing</div><div>repairs free, parts at cost</div><div>bench 2: my stereo, made August 2003</div>
    <div>20 strands stripped and re-soldered</div><div style="color:${P.ox}">the blue ring lit. the disc spun.</div></div>`;
  h += T(560, 1368, 'src', 'Wikipedia, Repair Café · KQED 2017 · Verde Magazine 2012 · Stanford FILAM · Repair Café International Foundation, July 2026 · Los Altos Town Crier 2026 · my notes and photos from Oct 18 2026', `width:600px;text-align:center;font-size:12.5px`);
  mount(W, H, s, h);
};
