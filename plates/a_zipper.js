// the zipper: the slider is a wedge, and when its jaws spread the teeth stop catching
ASSETS.zipper = () => {
  const W = 1640, H = 1260;
  let s = '', h = '';
  s += `<defs><linearGradient id="brassT" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.brass3}"/><stop offset=".5" stop-color="${P.brass}"/><stop offset="1" stop-color="${P.brass2}"/></linearGradient>
    <linearGradient id="slid" x1="0" x2="1"><stop offset="0" stop-color="#8E8F98"/><stop offset=".4" stop-color="#E8E8EC"/><stop offset=".7" stop-color="#B9BAC2"/><stop offset="1" stop-color="#7A7B84"/></linearGradient>
    <pattern id="tape" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="${P.bottle}"/><path d="M0 3 H6" stroke="#3B5A49" stroke-width="1.2"/><path d="M3 0 V6" stroke="#26402F" stroke-width=".6"/></pattern></defs>`;
  // one brass tooth, centred at x,y, pointing along angle a (degrees), length l
  const tooth = (x, y, a, l = 22, w = 11) => `<g transform="translate(${x} ${y}) rotate(${a})"><rect x="${-l / 2}" y="${-w / 2}" width="${l}" height="${w}" rx="${w / 2.4}" fill="url(#brassT)" stroke="${P.brass2}" stroke-width=".8"/><path d="M${-l / 2 + 4} ${-w / 2 + 2.5} H${l / 2 - 5}" stroke="#F4E3B8" stroke-width="1.3" opacity=".8"/></g>`;
  // ---------- the whole zipper, left ----------
  const ZX = 190, ZT = 170, SY = 560, ZB = 1130, pitch = 15;
  s += `<path d="M${ZX - 96} ${ZT} L${ZX - 40} ${SY - 60} L${ZX - 14} ${ZB} H${ZX - 80} L${ZX - 104} ${SY} L${ZX - 160} ${ZT} Z" fill="url(#tape)" filter="url(#shadowS)"/>`;
  s += `<path d="M${ZX + 96} ${ZT} L${ZX + 40} ${SY - 60} L${ZX + 14} ${ZB} H${ZX + 80} L${ZX + 104} ${SY} L${ZX + 160} ${ZT} Z" fill="url(#tape)" filter="url(#shadowS)"/>`;
  s += `<path d="M${ZX - 140} ${ZT} L${ZX - 90} ${SY} L${ZX - 66} ${ZB}" stroke="${P.ivory3}" stroke-width="1.4" stroke-dasharray="6 5" fill="none"/><path d="M${ZX + 140} ${ZT} L${ZX + 90} ${SY} L${ZX + 66} ${ZB}" stroke="${P.ivory3}" stroke-width="1.4" stroke-dasharray="6 5" fill="none"/>`;
  for (let y = ZT + 10; y < SY - 50; y += pitch) {
    const t = (y - ZT) / (SY - 60 - ZT), off = 88 * (1 - t) + 34 * t;
    s += tooth(ZX - off, y, -14 * (1 - t)) + tooth(ZX + off, y + pitch / 2, 14 * (1 - t));
  }
  for (let y = SY + 70; y < ZB - 6; y += pitch) { s += tooth(ZX - 8, y, 0) + tooth(ZX + 8, y + pitch / 2, 0); }
  // the slider and its pull
  const slider = (x, y, sc = 1) => `<g transform="translate(${x} ${y}) scale(${sc})" filter="url(#shadowS)"><path d="M-62 -70 H62 L40 70 H-40 Z" fill="url(#slid)" stroke="#5E5F68" stroke-width="1.2"/><path d="M-10 -40 h20 l6 120 h-32 z" fill="#C9CAD2" stroke="#6E6F78"/><rect x="-16" y="60" width="32" height="96" rx="4" fill="url(#slid)" stroke="#5E5F68"/><rect x="-8" y="120" width="16" height="26" rx="3" fill="#6E6F78" opacity=".6"/></g>`;
  s += slider(ZX, SY, 1);
  h += T(30, 120, 'lbl', 'two rows of teeth, one slider', `font-size:20px;color:${P.ox};width:320px;text-align:center`);
  h += T(ZX + 110, SY + 200, 'note', 'pulled up, the narrow end presses the rows together', 'font-size:16px;width:150px;line-height:1.25');
  s += lead(ZX + 106, SY + 214, ZX + 34, SY + 74, P.walnut2, 0);
  h += T(ZX + 170, ZT + 20, 'note', 'open above', 'font-size:16px;width:120px');
  h += T(ZX + 100, ZB - 240, 'note', 'locked below', 'font-size:16px;width:130px');

  // ---------- two cut-away sliders: the 3D renders, top plate shown as glass ----------
  // each render is 1240x680, content box x 177..1091, y 132..680; anchors from its json, as fractions of the full image
  function cut(file, A, x0, y0, wbox, spread, title, notes) {
    const k = wbox / 914, iw = 1240 * k, ih = 680 * k, ix = x0 - 177 * k, iy = y0 - 132 * k;
    const at = n => [ix + A[n][0] * iw, iy + A[n][1] * ih];
    s += `<ellipse cx="${x0 + wbox / 2}" cy="${y0 + 548 * k - 6}" rx="${wbox * .42}" ry="16" fill="#2B1A10" opacity=".12" filter="url(#glow)"/>`;
    s += `<image href="t3/${file}.png" x="${ix}" y="${iy}" width="${iw}" height="${ih}"/>`;
    h += T(x0, y0 - 44, 'lbl', title, `font-size:21px;color:${spread ? P.ox : P.bottle};width:${wbox}px;text-align:center`);
    notes.forEach(([x, y, t, n, w]) => { const [px, py] = at(n); h += T(x, y, 'note', t, `font-size:15.5px;width:${w || 200}px;line-height:1.24`); s += lead(x + 10, y < py ? y + 44 : y - 6, px, py, P.walnut2, 0); });
    return at;
  }
  const OK = {narrow: [0.3651, 0.5591], wide: [0.6349, 0.5591], wedge: [0.5897, 0.5619], jaw: [0.3713, 0.4909], out: [0.2345, 0.5784], inA: [0.7632, 0.3825], inB: [0.7999, 0.802]};
  const SP = {narrow: [0.3642, 0.5505], wide: [0.6358, 0.5506], wedge: [0.5904, 0.5534], jaw: [0.3717, 0.4532], out: [0.2345, 0.5784], inA: [0.7632, 0.3825], inB: [0.7999, 0.802]};
  const C1 = 440, C2 = 1040, CY = 250, CW = 570;
  cut('slider_ok2', OK, C1, CY, CW, false, 'a healthy slider', [
    [C1 + 330, 615, 'a wedge splits the rows as the slider moves toward the open end', 'wedge', 220],
    [C1 + 10, 615, 'the narrow end squeezes the two rows shut', 'jaw', 200],
    [C1 + 420, 196, 'two rows come in', 'inA', 150],
  ]);
  cut('slider_spread2', SP, C2, CY, CW, true, 'jaws spread', [
    [C2 + 10, 615, 'a fraction of a millimetre wider, and it is too wide to press', 'jaw', 220],
    [C2 + 300, 615, 'teeth pass through unlocked, and the zipper splits behind', 'out', 240],
  ]);
  h += T(C1 + 10, 700, 'note', 'the top plate of each slider is drawn as glass so the teeth show', 'font-size:14px;width:600px;color:' + P.walnut2);
  // ---------- the fixes, along the bottom ----------
  const FY = 900;
  s += card(400, FY, 1210, 300, 'url(#paperP)', .3, `<rect x="400" y="${FY}" width="1210" height="300" fill="${P.cream}" opacity=".6" filter="url(#deckle)"/>`);
  // 1. pliers
  const px = 540, py = FY + 110;
  s += `<g transform="translate(${px} ${py}) scale(.62)" filter="url(#shadowS)">
    <path d="M-26 -36 H26 L14 30 H-14 Z" fill="url(#slid)" stroke="#5E5F68"/>
    <path d="M-50 4 L-16 14 L-18 30 L-46 40 L-34 70 L-150 160 L-166 146 L-58 52 Z" fill="#4A4A52" stroke="#2B2420"/>
    <path d="M50 4 L16 14 L18 30 L46 40 L34 70 L150 160 L166 146 L58 52 Z" fill="#5A5A62" stroke="#2B2420"/>
    <circle cx="0" cy="62" r="1" fill="none"/>
    <path d="M-120 128 L-180 190 L-160 206 L-100 146 Z M120 128 L180 190 L160 206 L100 146 Z" fill="${P.ox}" stroke="#4A1A1A"/>
    <path d="M-80 26 l40 4 M80 26 l-40 4" stroke="${P.ox}" stroke-width="2.4" marker-end="url(#ar)"/></g>
    <defs><marker id="ar" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 Z" fill="${P.ox}"/></marker></defs>`;
  h += T(430, FY + 22, 'lbl', 'one · squeeze it back', `font-size:18px;color:${P.ox};width:300px`);
  h += T(640, FY + 90, 'note', 'pliers on both sides of the narrow end, a little at a time. Test, squeeze again.', 'font-size:15px;width:190px;line-height:1.24');
  // 2. swap sizes
  const sx = 940;
  [[3, .36], [5, .48], [8, .62]].forEach(([n, sc], i) => {
    const x = sx + i * 92, y = FY + 118;
    s += slider(x, y, sc);
    h += T(x - 30, y - 70 * sc - 30, 'mono', '#' + n, 'font-size:20px;font-weight:700;width:60px;text-align:center');
  });
  h += T(880, FY + 22, 'lbl', 'two · or swap the slider', `font-size:18px;color:${P.ox};width:300px`);
  h += T(880, FY + 222, 'note', 'Zipper Repair A holds #3, #5 and #8. The number is roughly how many millimetres wide the closed teeth are.', 'font-size:15px;width:300px;line-height:1.24');
  // 3. teeth gone
  const tx = 1250;
  for (let i = 0; i < 7; i++) { const gone = i === 3 || i === 4; const y = FY + 76 + i * 22;
    if (gone) s += `<rect x="${tx + 15}" y="${y - 7}" width="30" height="14" rx="6" fill="none" stroke="${P.ox}" stroke-dasharray="3 3"/>`; else s += tooth(tx + 30, y, 0, 30, 14);
    s += tooth(tx + 52, y + 11, 0, 30, 14); }
  h += T(1240, FY + 22, 'lbl', 'three · teeth gone', `font-size:18px;color:${P.ox};width:300px`);
  h += T(1340, FY + 74, 'note', 'Missing or broken teeth need a whole new zipper sewn in. A longer job, still done at the table.', 'font-size:15px;width:200px;line-height:1.24');
  // the odds, as a woven care label sewn on the corner
  s += `<g transform="rotate(-4 1500 1150)" filter="url(#shadowS)"><rect x="1420" y="1110" width="190" height="96" fill="${P.ivory}"/><path d="M1426 1116 h178 v84 h-178 z" fill="none" stroke="${P.rose2}" stroke-width="1" stroke-dasharray="3 3"/></g>`;
  h += `<div class="t" style="left:1420px;top:1118px;width:190px;text-align:center;transform:rotate(-4deg)"><div class="num" style="font-size:38px;line-height:1">80%+</div><div class="lbl" style="font-size:13.5px;line-height:1.3">of clothing goes home fixed</div></div>`;
  // woven label title, top left
  s += `<g filter="url(#shadowS)"><rect x="30" y="22" width="640" height="78" fill="${P.bottle}"/><path d="M38 30 h624 v62 h-624 z" fill="none" stroke="${P.ivory3}" stroke-width="1.2" stroke-dasharray="4 3"/></g>`;
  h += T(30, 32, '', 'most broken zippers are fine', `width:640px;text-align:center;font-family:Gloock;font-size:34px;color:${P.ivory}`);
  h += T(30, 72, 'lbl', 'it is the slider that let go', `width:640px;text-align:center;font-size:15px;color:${P.ivory3}`);
  h += T(30, H - 36, 'src', 'Sliders rendered in 3D from the Zipper Repair A box, pliers drawn from the textile table, Repair Café Silicon Valley, Oct 18 2026. Clothing fixed above 80% of the time: RepairMonitor analysis 2019. Slider sizes: YKK size guide.', `width:${W - 60}px`);
  mount(W, H, s, h);
};
