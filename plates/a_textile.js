// the textile table: the needle and the zipper slider side by side, both from the 3D renders
ASSETS.textile = () => {
  const W = 1640, H = 1250;
  let s = '', h = '';
  // ---------- header, a woven label ----------
  s += `<g filter="url(#shadowS)"><rect x="30" y="22" width="700" height="86" fill="${P.bottle}"/><path d="M38 30 h684 v70 h-684 z" fill="none" stroke="${P.ivory3}" stroke-width="1.2" stroke-dasharray="4 3"/></g>`;
  h += T(30, 30, '', 'the textile table', `width:700px;text-align:center;font-family:Gloock;font-size:38px;color:${P.ivory}`);
  h += T(30, 76, 'lbl', 'two small parts that save most of the mending', `width:700px;text-align:center;font-size:15px;color:${P.ivory3}`);
  // a running stitch down the middle, dividing the two halves
  s += `<path d="M820 150 V1150" stroke="${P.rose2}" stroke-width="2.2" stroke-dasharray="14 9" stroke-linecap="round"/>`;

  // ================= left: the needle =================
  h += T(40, 136, 'lbl', 'the needle is the cheap part', `font-size:22px;color:${P.ox}`);
  const KN = .44, TOP = 200;
  const NA = {
    front: {shank: [0.5, 0.2083], shoulder: [0.5, 0.4244], groove: [0.5, 0.6139], scarf: [0.5, 0.7724], eye: [0.5, 0.8376], point: [0.5, 0.9645]},
    back: {flat: [0.5622, 0.2091], scarf: [0.5249, 0.7731], eye: [0.5, 0.8376], point: [0.5, 0.9645]}
  };
  const NX = {front: 120, back: 236};
  const nat = (v, n) => [NX[v] + (NA[v][n][0] * 400 - 200) * KN, TOP + (NA[v][n][1] * 2000 - 70) * KN];
  ['front', 'back'].forEach(v => {
    s += `<ellipse cx="${NX[v] + 12}" cy="${TOP + 1870 * KN}" rx="30" ry="6" fill="#2B1A10" opacity=".12" filter="url(#glow)"/>`;
    s += `<image href="t3/needle_${v}.png" x="${NX[v] - 200 * KN}" y="${TOP - 70 * KN}" width="${400 * KN}" height="${2000 * KN}"/>`;
    h += T(NX[v] - 50, TOP - 34, 'lbl', v, 'width:100px;text-align:center;font-size:16px');
  });
  // stamp and thread on the front view
  const [, gy] = nat('front', 'shoulder'), [, ey] = nat('front', 'eye');
  s += `<text transform="translate(${NX.front + 7} ${TOP + 60}) rotate(90)" font-family="Courier" font-weight="700" font-size="17" fill="#55565E" letter-spacing="2" opacity=".85">70/10</text>`;
  s += `<path d="M${NX.front} ${gy + 30} V${ey - 6} Q${NX.front + 1} ${ey + 2} ${NX.front - 4} ${ey + 4} Q${NX.front - 40} ${ey + 12} ${NX.front - 66} ${ey + 70}" fill="none" stroke="${P.ox2}" stroke-width="2.2" stroke-linecap="round"/>`;
  s += `<path d="M${NX.front} ${gy + 30} Q${NX.front - 30} ${gy + 10} ${NX.front - 60} ${gy + 50}" fill="none" stroke="${P.ox2}" stroke-width="2.2" stroke-linecap="round"/>`;
  // anatomy notes, right of the needles, each tied to its part
  const AN = [
    [310, 'shank', 'the thick end the machine clamps', 'front', 'shank'],
    [400, 'flat side', 'faces the back, so it sits only one way', 'back', 'flat'],
    [500, 'shoulder', 'where it narrows. The size is stamped near here', 'front', 'shoulder'],
    [640, 'long groove', 'the thread lies in it on the way down', 'front', 'groove'],
    [760, 'scarf', 'a scoop on the back, so the hook can pass close', 'back', 'scarf'],
    [870, 'eye', 'thread goes through front to back', 'front', 'eye'],
    [980, 'point', 'a bent one wanders and strikes the foot', 'back', 'point'],
  ];
  AN.forEach(([y, t, n, v, k]) => {
    const [px, py] = nat(v, k);
    h += T(330, y, 'lbl', t, `font-size:17px;color:${P.ox};width:230px`);
    h += T(330, y + 22, 'note', n, 'font-size:15px;width:230px;line-height:1.2');
    s += lead(324, y + 12, px + (v === 'back' ? 14 : 10), py, P.walnut2, 0);
  });
  // one needle, two numbers
  s += `<g transform="rotate(1.5 690 260)" filter="url(#shadowS)"><rect x="580" y="160" width="220" height="156" fill="#FBF7EE"/><rect x="588" y="168" width="204" height="140" fill="none" stroke="${P.brass}" stroke-width="1"/></g>`;
  h += `<div class="t" style="left:598px;top:176px;width:190px;transform:rotate(1.5deg)">
    <div class="lbl" style="font-size:15px;color:${P.ox}">one needle, two numbers</div>
    <div style="display:flex;gap:10px;align-items:flex-start;margin-top:8px"><div class="mono" style="font-size:36px;font-weight:700;line-height:1">70</div><div class="note" style="font-size:14px;line-height:1.2">the blade is 0.70 mm across</div></div>
    <div style="display:flex;gap:10px;align-items:flex-start;margin-top:8px"><div class="mono" style="font-size:36px;font-weight:700;line-height:1">10</div><div class="note" style="font-size:14px;line-height:1.2">the American count for the same needle</div></div></div>`;
  // ticket #1 and the check order
  s += `<g transform="rotate(-2 690 520)" filter="url(#shadowS)"><rect x="590" y="410" width="200" height="220" fill="#FDFCF8"/></g>`;
  h += `<div class="t mono" style="left:604px;top:424px;width:176px;transform:rotate(-2deg);transform-origin:90px 100px;font-size:12.5px;line-height:1.45">
    <div style="font-weight:700;font-size:14px">11:47 AM</div><div>SEWING / TEXTILES</div><div style="font-size:26px;font-weight:700;margin:2px 0">#1</div>
    <div>ITEM: Sewing machine</div><div>ISSUE: Needle hits the foot. Misaligned</div><div>CLIENT: S. F.</div></div>`;
  h += `<div class="t" style="left:590px;top:664px;width:214px">
    <div class="lbl" style="font-size:16px;color:${P.ox}">check, in order</div>
    <div class="note" style="font-size:14.5px;line-height:1.24;margin-top:4px">1. needle in backwards? flat side to the back<br>2. needle bent? roll it on the table<br>3. right foot for the stitch? a zigzag stitch on a straight-stitch foot hits every time<br>4. only then, the timing inside the machine</div></div>`;

  // ================= right: the zipper slider =================
  h += T(850, 136, 'lbl', 'most broken zippers are fine', `font-size:22px;color:${P.ox}`);
  const OK = {jaw: [0.3713, 0.4909], wedge: [0.5897, 0.5619], out: [0.2345, 0.5784], inA: [0.7632, 0.3825]};
  const SP = {jaw: [0.3717, 0.4532], wedge: [0.5904, 0.5534], out: [0.2345, 0.5784], inA: [0.7632, 0.3825]};
  function slider(file, A, x0, y0, wbox, title, col, notes) {
    const k = wbox / 914, iw = 1240 * k, ih = 680 * k, ix = x0 - 177 * k, iy = y0 - 132 * k;
    const at = n => [ix + A[n][0] * iw, iy + A[n][1] * ih];
    s += `<ellipse cx="${x0 + wbox / 2}" cy="${y0 + 548 * k - 4}" rx="${wbox * .42}" ry="12" fill="#2B1A10" opacity=".12" filter="url(#glow)"/>`;
    s += `<image href="t3/${file}.png" x="${ix}" y="${iy}" width="${iw}" height="${ih}"/>`;
    h += T(x0, y0 - 30, 'lbl', title, `font-size:18px;color:${col}`);
    notes.forEach(([x, y, t, n, w]) => { const [px, py] = at(n); h += T(x, y, 'note', t, `font-size:15px;width:${w}px;line-height:1.22`); s += x < 1400 ? lead(x + 8, y + 24, px, py, P.walnut2, 0) : lead(x - 6, y + 12, px, py, P.walnut2, 0); });
  }
  slider('slider_ok2', OK, 850, 210, 540, 'a healthy slider', P.bottle, [
    [1420, 230, 'two rows come in at the wide end', 'inA', 190],
    [1420, 330, 'a wedge splits the rows when you open it', 'wedge', 190],
    [1010, 178, 'the narrow end squeezes the rows shut', 'jaw', 330],
  ]);
  slider('slider_spread2', SP, 850, 610, 540, 'jaws spread', P.ox, [
    [1000, 578, 'a fraction of a millimetre wider, and it is too wide to press', 'jaw', 400],
    [1420, 720, 'teeth pass through unlocked, and the zipper splits behind', 'out', 190],
  ]);
  h += T(850, 950, 'note', 'the top plate of each slider is drawn as glass so the teeth show', 'font-size:13.5px;width:540px;color:' + P.walnut2);
  // the three fixes
  const FX = [['one · squeeze it back', 'pliers on both sides of the narrow end, a little at a time. Test, squeeze again.'],
    ['two · swap the slider', 'Zipper Repair A holds #3, #5 and #8.'],
    ['three · teeth gone', 'a whole new zipper sewn in. A longer job, still done at the table.']];
  s += card(845, 990, 770, 124, P.cream, .2);
  FX.forEach(([t, n], i) => {
    const x = 866 + i * 252;
    h += T(x, 1006, 'lbl', t, `font-size:16px;color:${P.ox};width:236px`);
    h += T(x, 1032, 'note', n, 'font-size:14.5px;width:232px;line-height:1.22');
  });
  // the odds, as a woven care label at the foot of the needle side
  s += `<g transform="rotate(-3 300 1140)" filter="url(#shadowS)"><rect x="40" y="1090" width="520" height="96" fill="${P.ivory}"/><path d="M46 1096 h508 v84 h-508 z" fill="none" stroke="${P.rose2}" stroke-width="1" stroke-dasharray="3 3"/></g>`;
  h += `<div class="t" style="left:52px;top:1100px;width:500px;transform:rotate(-3deg);display:flex;gap:22px;align-items:center">
    <div style="text-align:center"><div class="num" style="font-size:40px;line-height:1">96%</div><div class="lbl" style="font-size:13px">of trousers</div></div>
    <div style="text-align:center"><div class="num" style="font-size:40px;line-height:1">80%+</div><div class="lbl" style="font-size:13px">of clothing</div></div>
    <div class="note" style="font-size:15px;line-height:1.25;width:200px">go home fixed. Soft things come back nearly every time.</div></div>`;
  h += T(30, H - 40, 'src', 'Needles and sliders rendered in 3D. Ticket #1 and the Zipper Repair A box from the textile table, Repair Café Silicon Valley, Oct 18 2026. Needle anatomy and sizing: Schmetz needle guide. Fix rates: RepairMonitor analysis 2019.', `width:${W - 60}px`);
  mount(W, H, s, h);
};
