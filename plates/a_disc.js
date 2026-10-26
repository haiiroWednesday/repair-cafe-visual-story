// the rainbow in the disc: my 2003 stereo lifted apart, a zoom into the tracks, and the twenty-strand cable
ASSETS.disc = () => {
  const W = 1760, H = 1580;
  let s = '', h = '';
  const OX = 560, OY = 690, A = 300, B = 300;
  const iso = (x, y, z) => [OX + (x - y) * .866, OY + (x + y) * .5 - z];
  const pts = a => a.map(p => p.join(' ')).join(' L');
  function slab(z, t, top, left, right, a = A, b = B, x0 = 0, y0 = 0) {
    const T1 = [iso(x0, y0, z + t), iso(x0 + a, y0, z + t), iso(x0 + a, y0 + b, z + t), iso(x0, y0 + b, z + t)];
    const L = [iso(x0, y0 + b, z + t), iso(x0 + a, y0 + b, z + t), iso(x0 + a, y0 + b, z), iso(x0, y0 + b, z)];
    const Rr = [iso(x0 + a, y0, z + t), iso(x0 + a, y0 + b, z + t), iso(x0 + a, y0 + b, z), iso(x0 + a, y0, z)];
    return `<path d="M${pts(L)}Z" fill="${left}" stroke="${P.ink}" stroke-opacity=".5" stroke-width="1"/><path d="M${pts(Rr)}Z" fill="${right}" stroke="${P.ink}" stroke-opacity=".5" stroke-width="1"/><path d="M${pts(T1)}Z" fill="${top}" stroke="${P.ink}" stroke-opacity=".55" stroke-width="1.1"/>`;
  }
  const isoEll = (cx, cy, z, r, attrs) => { const [X, Y] = iso(cx, cy, z); return `<ellipse cx="${X}" cy="${Y}" rx="${r * 1.2247}" ry="${r * .7071}" ${attrs}/>`; };
  // rainbow sheen wedges for a disc seen at an angle
  const RB = ['#C9574E', '#E3925A', '#E8C66A', '#9CC48A', '#7FB3C9', '#8C86C4', '#B47BB0'];
  function discAt(X, Y, rx, ry, rot = 0, hole = .16) {
    const id = 'dc' + Math.round(X) + Math.round(Y);
    let o = `<defs><clipPath id="${id}"><ellipse cx="${X}" cy="${Y}" rx="${rx}" ry="${ry}"/></clipPath><radialGradient id="${id}g" cx=".42" cy=".38" r=".75"><stop offset="0" stop-color="#F6F4F0"/><stop offset=".7" stop-color="#D6D5DA"/><stop offset="1" stop-color="#A9A8B2"/></radialGradient></defs>`;
    o += `<ellipse cx="${X}" cy="${Y}" rx="${rx}" ry="${ry}" fill="url(#${id}g)" stroke="${P.ink}" stroke-opacity=".5"/>`;
    o += `<g clip-path="url(#${id})" opacity=".55">`;
    for (let k = 0; k < 2; k++) RB.forEach((c, i) => {
      const a0 = rot + k * Math.PI + (i - 3.5) * .085, a1 = a0 + .085;
      o += `<path d="M${X} ${Y} L${X + Math.cos(a0) * rx * 1.3} ${Y + Math.sin(a0) * ry * 1.3} L${X + Math.cos(a1) * rx * 1.3} ${Y + Math.sin(a1) * ry * 1.3} Z" fill="${c}"/>`;
    });
    o += `</g>`;
    for (let r = .3; r < 1; r += .09) o += `<ellipse cx="${X}" cy="${Y}" rx="${rx * r}" ry="${ry * r}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width=".7"/>`;
    o += `<ellipse cx="${X}" cy="${Y}" rx="${rx * .34}" ry="${ry * .34}" fill="#E9E7EA" stroke="#9a98a2" stroke-width=".8" opacity=".9"/>`;
    o += `<ellipse cx="${X}" cy="${Y}" rx="${rx * hole}" ry="${ry * hole}" fill="#2b2420" opacity=".12"/>`;
    o += `<ellipse cx="${X}" cy="${Y}" rx="${rx * hole}" ry="${ry * hole}" fill="none" stroke="#7d7a86" stroke-width="1"/>`;
    return o;
  }
  // ---------- the 3D render, the centrepiece ----------
  const K = .98, RX0 = 290, RY0 = 230, PX0 = 340, PY0 = 150;
  const at = (rx, ry) => [PX0 + (rx - RX0) * K, PY0 + (ry - RY0) * K];
  s += `<image href="../paper/raw/stereo2.png" x="${PX0 - RX0 * K}" y="${PY0 - RY0 * K}" width="${1800 * K}" height="${1500 * K}"/>`;
  const LAB = [
    [1, 'the lid', 'a window, and a blue ring of light. The ring means power reached the board.', 305, 365, 220],
    [2, 'the disc', 'a spiral of tracks 1.6 µm apart. The zoom on the right shows where the colours come from.', 458, 530, 390],
    [3, 'the laser sled', 'slides on two rails and reads the disc from below.', 460, 630, 560],
    [4, 'the main board', 'with the header the control cable plugs into.', 380, 830, 700],
    [5, 'the control cable', 'twenty strands between the two boxes. No spare cable exists for a 2003 stereo, so every strand was stripped and soldered by hand on the bench.', 540, 1240, 990],
  ];
  LAB.forEach(([n, t1, t2, rx, ry, ly]) => {
    const [x, y] = at(rx, ry);
    s += lead(322, ly + 12, x, y, P.walnut, 0);
    s += `<circle cx="${36 + 12}" cy="${ly + 12}" r="13" fill="${P.ox}"/>`;
    h += T(36, ly + 1, 'num', String(n), `width:24px;text-align:center;font-size:17px;color:${P.cream};font-style:italic`);
    h += T(70, ly, 'lbl', t1, `font-size:18px;color:${P.walnut};width:250px`);
    h += T(70, ly + 24, 'note', t2, 'font-size:16.5px;width:250px;line-height:1.28');
  });
  { const [x, y] = at(1380, 900); s += lead(1560, 1062, x, y, P.walnut, 0);
    h += T(1565, 1040, 'lbl', 'the second box', `font-size:18px;color:${P.walnut}`);
    h += T(1565, 1064, 'note', 'the other end of every strand', 'font-size:16.5px;width:180px'); }
  // brass nameplate title
  s += `<g filter="url(#shadowS)"><rect x="30" y="18" width="470" height="76" fill="url(#brassG2)" stroke="${P.brass2}" stroke-width="1.5"/><rect x="38" y="26" width="454" height="60" fill="none" stroke="${P.brass2}" stroke-width=".8" opacity=".7"/></g>`;
  s += `<defs><linearGradient id="brassG2" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="${P.brass3}"/><stop offset=".5" stop-color="${P.brass}"/><stop offset="1" stop-color="${P.brass2}"/></linearGradient></defs>`;
  [[44, 32], [486, 32], [44, 80], [486, 80]].forEach(([x, y]) => s += `<circle cx="${x}" cy="${y}" r="3.2" fill="${P.brass2}"/><path d="M${x - 2} ${y} h4" stroke="${P.brass3}" stroke-width="1"/>`);
  h += T(30, 26, '', 'the rainbow in the disc', `width:470px;text-align:center;font-family:Gloock;font-size:38px;color:#3A2A18;text-shadow:0 1px 0 rgba(255,240,200,.6)`);
  h += T(30, 104, 'lbl', 'my stereo, two boxes, manufactured august 2003', `width:470px;text-align:center;font-size:15px;color:${P.walnut2}`);

  // ---------- the zoom ladder (right) ----------
  const Z1 = [1055, 235, 100], Z2 = [1305, 300, 105], Z3 = [1590, 450, 150];
  // zoom cones
  const cone = (ax, ay, ar, bx, by, br) => {
    const dx = bx - ax, dy = by - ay, d = Math.hypot(dx, dy), ang = Math.atan2(dy, dx), off = Math.asin((br - ar) / d);
    const p = sgn => { const a = ang + sgn * (Math.PI / 2 + off); return [[ax + Math.cos(a) * ar, ay + Math.sin(a) * ar], [bx + Math.cos(a) * br, by + Math.sin(a) * br]]; };
    const [a1, b1] = p(1), [a2, b2] = p(-1);
    return `<path d="M${a1} L${b1} L${b2} L${a2} Z" fill="${P.ivory}" opacity=".5"/><path d="M${a1} L${b1} M${a2} L${b2}" stroke="${P.walnut2}" stroke-width=".9" stroke-dasharray="4 4" fill="none"/>`;
  };
  // small focus circles that the cones leave from
  const f1 = [Z1[0] + 55, Z1[1] + 30, 14], f2 = [Z2[0] + 40, Z2[1] + 50, 13];
  const fd = at(520, 500); s += `<circle cx="${fd[0]}" cy="${fd[1]}" r="16" fill="none" stroke="${P.ox}" stroke-width="2"/>` + cone(fd[0], fd[1], 16, Z1[0], Z1[1], Z1[2]);
  s += cone(f1[0], f1[1], f1[2], Z2[0], Z2[1], Z2[2]) + cone(f2[0], f2[1], f2[2], Z3[0], Z3[1], Z3[2]);
  // circle 1: the whole disc
  s += `<circle cx="${Z1[0]}" cy="${Z1[1]}" r="${Z1[2] + 10}" fill="${P.cream}" stroke="${P.brass}" stroke-width="3" filter="url(#shadowS)"/>`;
  s += discAt(Z1[0], Z1[1], Z1[2] - 6, Z1[2] - 6, -.9, .125);
  s += `<circle cx="${f1[0]}" cy="${f1[1]}" r="${f1[2]}" fill="none" stroke="${P.ox}" stroke-width="2"/>`;
  // scale bar 120 mm
  s += `<path d="M${Z1[0] - 94} ${Z1[1] + 126} H${Z1[0] + 94} M${Z1[0] - 94} ${Z1[1] + 120} v12 M${Z1[0] + 94} ${Z1[1] + 120} v12" stroke="${P.walnut}" stroke-width="1.2"/>`;
  h += T(Z1[0] - 150, Z1[1] + 132, 'lbl', '120 mm across · 1.2 mm thick', `width:300px;text-align:center;font-size:15px`);
  // circle 2: a patch of the spiral
  s += `<defs><clipPath id="z2c"><circle cx="${Z2[0]}" cy="${Z2[1]}" r="${Z2[2]}"/></clipPath><clipPath id="z3c"><circle cx="${Z3[0]}" cy="${Z3[1]}" r="${Z3[2]}"/></clipPath></defs>`;
  s += `<circle cx="${Z2[0]}" cy="${Z2[1]}" r="${Z2[2] + 10}" fill="${P.cream}" stroke="${P.brass}" stroke-width="3" filter="url(#shadowS)"/>`;
  s += `<g clip-path="url(#z2c)"><rect x="${Z2[0] - 160}" y="${Z2[1] - 160}" width="320" height="320" fill="#D9D8DE"/>`;
  for (let i = 0; i < 24; i++) { const r = 300 + i * 10; s += `<circle cx="${Z2[0] - 280}" cy="${Z2[1] + 200}" r="${r}" fill="none" stroke="${i % 2 ? '#B7B5C0' : '#F2F1F4'}" stroke-width="5"/>`; }
  for (let k = 0; k < 7; k++) s += `<path d="M${Z2[0] - 160 + k * 20} ${Z2[1] - 160} l200 320" stroke="${RB[k]}" stroke-width="22" opacity=".18"/>`;
  s += `</g><circle cx="${Z2[0]}" cy="${Z2[1]}" r="${Z2[2]}" fill="none" stroke="${P.walnut2}" stroke-width="1"/>`;
  s += `<circle cx="${f2[0]}" cy="${f2[1]}" r="${f2[2]}" fill="none" stroke="${P.ox}" stroke-width="2"/>`;
  h += T(Z2[0] - 60, Z2[1] - 170, 'lbl', 'one spiral, read from the inside out', `width:330px;font-size:15.5px`);
  h += T(Z2[0] - 60, Z2[1] - 148, 'note', '625 turns to every millimetre', `width:330px;font-size:16px`);
  // circle 3: the tracks as a grating, white light in, colours out
  s += `<circle cx="${Z3[0]}" cy="${Z3[1]}" r="${Z3[2] + 10}" fill="${P.cream}" stroke="${P.brass}" stroke-width="3" filter="url(#shadowS)"/>`;
  s += `<g clip-path="url(#z3c)"><rect x="${Z3[0] - 200}" y="${Z3[1] - 200}" width="400" height="400" fill="#2E2A33"/>`;
  const gy = Z3[1] + 55;
  for (let i = -8; i <= 8; i++) { const x = Z3[0] + i * 26; s += `<rect x="${x - 7}" y="${gy}" width="14" height="140" fill="#C9C8D0"/><rect x="${x - 7}" y="${gy}" width="14" height="4" fill="#fff" opacity=".8"/>`; }
  s += `<rect x="${Z3[0] - 200}" y="${gy}" width="400" height="140" fill="#9998A4" opacity=".35"/>`;
  // incoming white beam, straight down onto the tracks
  const hx = Z3[0], hy = gy;
  s += `<path d="M${hx} ${Z3[1] - 200} L${hx} ${hy}" stroke="#fff" stroke-width="12" opacity=".22" filter="url(#blur2)"/><path d="M${hx} ${Z3[1] - 200} L${hx} ${hy}" stroke="#FFFDF4" stroke-width="3.2"/>`;
  // first order on each side: violet ~14 deg, red ~26 deg from straight up (d sin θ = λ)
  const COLS = [['#8C6CC4', 400], ['#5E7FD0', 450], ['#5CB0C9', 490], ['#79BE7C', 530], ['#E8CF5C', 580], ['#EE9A4E', 620], ['#D9554A', 700]];
  [1, -1].forEach(sg => COLS.forEach(([c, l]) => { const th = Math.asin(l / 1600), x2 = hx + sg * Math.sin(th) * 230, y2 = hy - Math.cos(th) * 230; s += `<path d="M${hx} ${hy} L${x2} ${y2}" stroke="${c}" stroke-width="4.5" opacity=".95"/>`; }));
  s += `</g><circle cx="${Z3[0]}" cy="${Z3[1]}" r="${Z3[2]}" fill="none" stroke="${P.walnut2}" stroke-width="1"/>`;
  // spacing bracket under the grating
  h += T(Z3[0] + 30, gy + 14, 'lbl', '1.6 µm', `font-size:17px;color:#2B2420;background:#F2EEE6;padding:0 5px`);
  s += `<path d="M${Z3[0] - 52} ${gy - 12} H${Z3[0] - 26} M${Z3[0] - 52} ${gy - 18} v12 M${Z3[0] - 26} ${gy - 18} v12" stroke="#F2EEE6" stroke-width="1.6"/><path d="M${Z3[0] - 39} ${gy - 12} Q${Z3[0]} ${gy + 30} ${Z3[0] + 28} ${gy + 24}" stroke="#F2EEE6" stroke-width=".9" fill="none"/>`;
  h += T(Z3[0] - 100, Z3[1] - 112, 'lbl', 'white light ↓', `font-size:13px;color:#F2EEE6;width:96px;text-align:right`);
  // explanation between the zooms
  h += T(1140, 430, 'lbl', 'the tracks are a grating', `font-size:18px;width:280px;color:${P.ox}`);
  h += T(1140, 456, 'note', 'Ridges this close send each colour out at its own angle, violet about 14° and red about 26° from straight up. The disc itself is plain silver.', `font-size:16px;width:270px;line-height:1.28`);
  h += T(1140, 548, 'note', 'my sneakers lit up in the same spectrum.', `font-size:16px;width:280px;color:${P.ox}`);
  // ---------- the cable (bottom band) ----------
  const PAD = 9, N = 20, BY = 1250;
  s += card(240, BY, 1300, 250, P.cream, -.4);
  s += `<g transform="rotate(-.4 890 1375)">${lacetrim(240, BY - 16, 1300, 'gold', 28)}</g>`;
  const WC = ['#C9574E', '#2B2420', '#F4F0E8', '#E8C66A', '#5E8C5A', '#4E6FA8', '#E3925A', '#7A5040', '#9A9AA0', '#8C6CC4', '#E7A6B4', '#2F4A3C', '#B03A3A', '#7FB3C9', '#D8C060', '#6E2A2A', '#C7C2B6', '#A7C78F', '#3A4E7A', '#D98C5F'];
  const L0 = 420, R0 = 1360, top = BY + 60;
  // connector blocks
  const conn = (x) => `<g filter="url(#shadowS)"><rect x="${x - 22}" y="${top - 18}" width="44" height="${N * PAD + 22}" fill="#EDE6D6" stroke="${P.ink}" stroke-opacity=".5"/><rect x="${x - 14}" y="${top - 10}" width="28" height="${N * PAD + 6}" fill="#D8D0C0"/></g>`;
  s += conn(L0) + conn(R0);
  // the box ends, drawn as a sliver of each case
  s += `<rect x="${L0 - 140}" y="${BY + 30}" width="100" height="${N * PAD + 20}" fill="#4A3D44" stroke="${P.ink}" stroke-opacity=".5"/><rect x="${R0 + 40}" y="${BY + 30}" width="100" height="${N * PAD + 20}" fill="#4A3D44" stroke="${P.ink}" stroke-opacity=".5"/>`;
  s += `<circle cx="${L0 - 90}" cy="${BY + 70}" r="16" fill="none" stroke="#9CCBFF" stroke-width="3"/><circle cx="${L0 - 90}" cy="${BY + 70}" r="16" fill="none" stroke="#5FA8FF" stroke-width="10" opacity=".3" filter="url(#glow)"/>`;
  // the sheath in the middle
  const sx0 = 700, sx1 = 1080, sy = top + N * PAD / 2 - 4;
  for (let i = 0; i < N; i++) {
    const py = top + i * PAD, c = WC[i], off = (i - N / 2) * 1.5;
    const dL = `M${L0 + 16} ${py} C${L0 + 170} ${py} ${sx0 - 140} ${sy + off} ${sx0} ${sy + off}`;
    const dR = `M${sx1} ${sy + off} C${sx1 + 140} ${sy + off} ${R0 - 170} ${py} ${R0 - 16} ${py}`;
    [dL, dR].forEach(d => { s += `<path d="${d}" fill="none" stroke="#2B2420" stroke-opacity=".35" stroke-width="5.2"/><path d="${d}" fill="none" stroke="${c}" stroke-width="3.8"/>`; });
    // stripped copper and the solder blob on both pins
    [[L0 + 16, 1], [R0 - 16, -1]].forEach(([x, dir]) => {
      s += `<path d="M${x} ${py} h${dir * 16}" stroke="#C8874A" stroke-width="2.2"/><circle cx="${x}" cy="${py}" r="4.6" fill="#C9CCD2" stroke="#8D8F96" stroke-width=".8"/><circle cx="${x - 1.2}" cy="${py - 1.4}" r="1.4" fill="#fff"/>`;
    });
  }
  s += `<rect x="${sx0}" y="${sy - 20}" width="${sx1 - sx0}" height="40" rx="4" fill="#3A3438" stroke="${P.ink}" stroke-opacity=".6"/><path d="M${sx0 + 6} ${sy - 18} H${sx1 - 6}" stroke="#fff" stroke-opacity=".18" stroke-width="5"/>`;
  h += T(sx0, sy - 11, 'lbl', 'control cable', `width:${sx1 - sx0}px;text-align:center;font-size:18px;color:#EDE6D6;letter-spacing:.2em`);
  h += T(L0 - 140, BY + N * PAD + 22, 'lbl', 'box one', 'width:100px;text-align:center;font-size:13px;color:#EDE6D6');
  h += T(R0 + 40, BY + N * PAD + 4, 'lbl', 'the second<br>box', 'width:100px;text-align:center;font-size:13px;color:#EDE6D6;line-height:1.2');
  
  h += T(560, BY + 8, 'note', '<span class="lbl" style="color:#6E2A2A;font-size:15px">pin to pin </span> each strand stripped, matched by colour and soldered onto both boxes. The same colour lands on the same pin at each end.', `width:640px;text-align:center;font-size:15.5px;line-height:1.3`);
  h += T(1215, BY + 8, 'num', '20', `font-size:36px;width:60px;text-align:right`);
  h += T(1280, BY + 22, 'lbl', 'strands', 'font-size:14px');
  // back label sticker
  s += `<g transform="rotate(-3 200 900)" filter="url(#shadowS)"><rect x="90" y="878" width="230" height="44" fill="#F7F3EA" stroke="#B9B2A4"/></g>`;
  h += T(96, 890, 'mono', 'MANUFACTURED: AUGUST 2003', 'font-size:14px;transform:rotate(-3deg);transform-origin:110px 10px;font-weight:700');
  h += T(40, H - 38, 'src', 'Disc size and track pitch: Red Book standard, IEC 60908. Colour angles worked from d sin θ = λ for 400 to 700 nm. Stereo modelled in 3D from my photos of the repair, Repair Café Silicon Valley, Oct 18 2026. The inner layers are drawn as a typical top-loading CD unit.', `width:${W - 80}px;font-size:13px`);
  mount(W, H, s, h);
};
