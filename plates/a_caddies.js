// two tea caddies, filled to scale: the world's electronic waste in 2022 and the forecast for 2030
ASSETS.caddies = () => {
  const W = 1560, H = 1180, BASE = 1000, K = 8;
  let s = '', h = '';
  s += `<defs><linearGradient id="tinG" x1="0" x2="1"><stop offset="0" stop-color="#3C2A22"/><stop offset=".3" stop-color="${P.ox}"/><stop offset=".55" stop-color="#9A4A43"/><stop offset="1" stop-color="#3C2A22"/></linearGradient>
    <linearGradient id="tinG2" x1="0" x2="1"><stop offset="0" stop-color="#1F2E26"/><stop offset=".3" stop-color="${P.bottle}"/><stop offset=".55" stop-color="#4E6E5C"/><stop offset="1" stop-color="#1F2E26"/></linearGradient>
    <linearGradient id="brassH" x1="0" x2="1"><stop offset="0" stop-color="${P.brass2}"/><stop offset=".45" stop-color="${P.brass3}"/><stop offset="1" stop-color="${P.brass2}"/></linearGradient>
    <pattern id="dam" width="38" height="44" patternUnits="userSpaceOnUse"><path d="M19 4 C26 12 30 18 19 22 C8 18 12 12 19 4 Z M19 22 C26 30 30 36 19 40 C8 36 12 30 19 22Z" fill="#fff" opacity=".08"/><circle cx="0" cy="22" r="3" fill="#fff" opacity=".07"/><circle cx="38" cy="22" r="3" fill="#fff" opacity=".07"/></pattern></defs>`;
  function tin(cx, rx, ht, grad, label, sub, fill) {
    const top = BASE - ht, ry = rx * .2; let o = '';
    o += `<ellipse cx="${cx}" cy="${BASE + 8}" rx="${rx * 1.15}" ry="${ry * 1.1}" fill="#2B1A10" opacity=".2" filter="url(#glow)"/>`;
    o += `<path d="M${cx - rx} ${top} V${BASE} A${rx} ${ry} 0 0 0 ${cx + rx} ${BASE} V${top} Z" fill="url(#${grad})"/>`;
    o += `<path d="M${cx - rx} ${top} V${BASE} A${rx} ${ry} 0 0 0 ${cx + rx} ${BASE} V${top} Z" fill="url(#dam)"/>`;
    // the cut-away window, filled to scale
    const wx = cx - rx * .55, ww = rx * 1.1, wt = top + 70, wb = BASE - 20;
    o += `<rect x="${wx}" y="${wt}" width="${ww}" height="${wb - wt}" fill="#F6EFE2" stroke="${P.brass}" stroke-width="3"/>`;
    o += fill(wx + 4, wt + 4, ww - 8, wb - wt - 8);
    o += `<rect x="${wx}" y="${wt}" width="${ww}" height="${wb - wt}" fill="none" stroke="${P.brass2}" stroke-width="1" transform="translate(5 5)" opacity=".5"/>`;
    // shoulder bands and lid
    o += `<path d="M${cx - rx} ${top + 10} A${rx} ${ry} 0 0 0 ${cx + rx} ${top + 10} V${top + 26} A${rx} ${ry} 0 0 1 ${cx - rx} ${top + 26} Z" fill="url(#brassH)"/>`;
    o += `<path d="M${cx - rx} ${BASE - 24} A${rx} ${ry} 0 0 0 ${cx + rx} ${BASE - 24} V${BASE - 8} A${rx} ${ry} 0 0 1 ${cx - rx} ${BASE - 8} Z" fill="url(#brassH)"/>`;
    o += `<path d="M${cx - rx - 6} ${top - 34} V${top} A${rx + 6} ${ry} 0 0 0 ${cx + rx + 6} ${top} V${top - 34} Z" fill="url(#brassH)" stroke="${P.brass2}"/>`;
    o += `<ellipse cx="${cx}" cy="${top - 34}" rx="${rx + 6}" ry="${ry}" fill="${P.brass3}" stroke="${P.brass2}"/><ellipse cx="${cx}" cy="${top - 40}" rx="${rx * .3}" ry="${ry * .35}" fill="${P.brass}" stroke="${P.brass2}"/>`;
    // paper label above the window
    o += `<rect x="${cx - rx * .7}" y="${top + 34}" width="${rx * 1.4}" height="30" fill="${P.cream}" stroke="${P.brass}"/>`;
    h += T(cx - rx * .7, top + 38, 'lbl', label, `width:${rx * 1.4}px;text-align:center;font-size:19px;color:${P.ox};letter-spacing:.14em`);
    h += T(cx - 160, BASE + 40, 'lbl', sub, `width:320px;text-align:center;font-size:17px`);
    return o;
  }
  // scale: 62 million tonnes is 62 units tall
  const H22 = 62 * K, H30 = 82 * K;
  s += tin(470, 150, H22 + 90, 'tinG', '2022', 'worldwide, measured', (x, y, w, hh) => {
    const rec = hh * .223; let o = `<rect x="${x}" y="${y}" width="${w}" height="${hh - rec}" fill="${P.cocoa2}"/><rect x="${x}" y="${y + hh - rec}" width="${w}" height="${rec}" fill="${P.sage}"/>`;
    for (let yy = y + 14; yy < y + hh; yy += 16) for (let xx = x + (((yy - y) / 16) % 2 ? 8 : 0); xx < x + w; xx += 16) o += `<rect x="${xx + 1}" y="${yy - 13}" width="14" height="14" fill="none" stroke="#fff" stroke-width=".6" opacity=".22"/>`;
    o += `<path d="M${x} ${y + hh - rec} H${x + w}" stroke="${P.cream}" stroke-width="2.4"/>`;
    return o;
  });
  s += tin(1010, 170, H30 + 90, 'tinG2', '2030', 'the forecast', (x, y, w, hh) => {
    const at62 = y + hh - hh * 62 / 82; let o = `<rect x="${x}" y="${y}" width="${w}" height="${hh}" fill="${P.cocoa2}"/><rect x="${x}" y="${y}" width="${w}" height="${at62 - y}" fill="${P.cocoa}" opacity=".45"/>`;
    o += `<path d="M${x - 8} ${at62} H${x + w + 8}" stroke="${P.cream}" stroke-width="2.4" stroke-dasharray="7 5"/>`;
    return o;
  });
  // notes
  const t22 = BASE - H22 - 90, t30 = BASE - H30 - 90;
  h += T(40, t22 + 120, 'num', '62 million tonnes', `width:260px;font-size:34px;line-height:1.05;font-style:italic;font-weight:500`);
  h += T(40, t22 + 200, 'note', 'of electronics thrown away in one year. That is 7.8 kg for every person on earth.', 'width:250px;font-size:18px');
  s += lead(300, t22 + 150, 380, t22 + 220, P.walnut, 0);
  h += T(40, BASE - 190, 'num', '22.3%', `width:200px;font-size:34px;font-style:italic;font-weight:500;color:${P.bottle}`);
  h += T(40, BASE - 145, 'note', 'documented as properly collected and recycled. The rest is not on record.', 'width:250px;font-size:18px');
  s += lead(300, BASE - 160, 405, BASE - 70, P.bottle, 0);
  h += T(1220, t30 + 130, 'num', '82 million tonnes', `width:300px;font-size:34px;line-height:1.05;font-style:italic;font-weight:500;color:${P.bottle}`);
  h += T(1220, t30 + 210, 'note', 'expected by 2030 if nothing changes. The dashed line is where 2022 stood.', 'width:290px;font-size:18px');
  s += lead(1210, t30 + 240, 1130, BASE - H30 + 140, P.walnut, 0);
  // a tea tag hanging off the 2030 tin: the counterweight
  s += `<path d="M1150 ${t30 - 30} C1240 ${t30 + 40} 1260 ${BASE - 330} 1270 ${BASE - 250}" stroke="${P.ivory3}" stroke-width="1.6" fill="none"/>`;
  s += `<g transform="rotate(4 1350 ${BASE - 160})" filter="url(#shadowS)"><rect x="1220" y="${BASE - 250}" width="270" height="180" fill="${P.cream}" stroke="${P.ivory3}"/><rect x="1230" y="${BASE - 240}" width="250" height="160" fill="none" stroke="${P.rose2}" stroke-dasharray="2 4"/></g>`;
  h += `<div class="t" style="left:1240px;top:${BASE - 236}px;width:232px;transform:rotate(4deg);transform-origin:116px 80px">
    <div class="lbl" style="font-size:15px;color:${P.ox}">on the other side of the scale</div>
    <div class="note" style="font-size:17px;line-height:1.3;margin-top:6px">One year of Repair Cafés sees 1.6 million broken things carried through the door.</div></div>`;
  // title
  h += `<div class="t script" style="left:40px;top:${BASE + 80}px;font-size:58px;line-height:1">the world’s caddy, filled to scale</div>`;
  h += T(40, BASE + 150, 'src', 'UNITAR Global E-waste Monitor 2024 (62 Mt in 2022, 22.3% documented recycling, 82 Mt by 2030, 7.8 kg per person). Repair Café International Foundation, July 2026. Tins drawn to the same scale.', 'width:1100px');
  mount(W, H, s, h);
};
