// every piece on the table: the heart-shaped clock, drawn apart from my photos, with a watchmaker's repair envelope
ASSETS.heart = () => {
  const W = 1640, H = 1160, IX = 300, IY = 60, K = .88;
  let s = '', h = '';
  const at = (x, y) => [IX + x * K, IY + y * K];
  // soft cream card behind the render
  s += card(250, 70, 1360, 940, P.cream, -.6);
  s += `<rect x="300" y="120" width="1260" height="840" fill="${P.rose3}" opacity=".22" filter="url(#wc)"/>`;
  s += lacetrim(250, 60, 1360, 'gold', 34, -.6);
  s += `<image href="blend/heart2_tray.png" x="${IX}" y="${IY}" width="${1500 * K}" height="${990 * K}"/>`;
  const PARTS = [
    [1, 90, 250, 'the gold frame', 'moulded roses climbing the right lobe', 330, 100],
    [2, 330, 380, 'the dial', 'roses, baby’s breath and a white bow on a round face', 360, 850],
    [3, 470, 470, 'the black rim', 'it holds the dial in the frame', 680, 850],
    [4, 870, 430, 'the gold ring', 'the hour numbers, 1 to 12, waiting in the toolbox', 1010, 480],
    [5, 1085, 760, 'the glass', 'off, and lying on the table', 1300, 780],
    [6, 1265, 268, 'the movement', 'a small black box from the table', 1250, 100],
    [7, 1240, 520, 'the hands', 'hour, minute and second', 1300, 650],
  ];
  PARTS.forEach(([n, px, py, t1, t2, lx, ly]) => {
    const [x, y] = at(px, py);
    s += lead(lx + 10, ly < y ? ly + 50 : ly - 8, x, y, P.walnut, 0);
    s += `<circle cx="${lx - 18}" cy="${ly + 12}" r="15" fill="${P.ox}"/>`;
    h += T(lx - 33, ly, 'num', String(n), `width:30px;text-align:center;font-size:19px;color:${P.cream};font-style:italic`);
    h += T(lx + 4, ly - 2, 'lbl', t1, `font-size:19px;color:${P.walnut};width:260px`);
    h += T(lx + 4, ly + 22, 'note', t2, 'font-size:17px;width:260px');
  });
  // the repair envelope, kraft, tucked at the left
  s += `<g transform="rotate(-5 160 640)" filter="url(#shadow)"><path d="M20 330 H300 V960 H20 Z" fill="#C9A77C"/><path d="M20 330 L160 420 L300 330" fill="#B8956A" stroke="#9B7A52" stroke-width="1"/>
     <rect x="20" y="330" width="280" height="630" fill="url(#paperP)" opacity=".25"/>`;
  for (let i = 0; i < 9; i++) s += `<path d="M40 ${560 + i * 40} H280" stroke="#6B4A38" stroke-width=".9" opacity=".55"/>`;
  s += `</g>`;
  h += `<div class="t" style="left:30px;top:440px;width:260px;transform:rotate(-5deg);transform-origin:130px 200px">
    <div class="lbl" style="font-size:20px;text-align:center;color:#3E2E26;letter-spacing:.12em">repair envelope</div>
    <div class="lbl" style="font-size:12.5px;text-align:center;color:#4A3227;margin-top:2px">clocks · watches · jewellery</div>
    <div class="tw" style="font-size:15px;line-height:40px;margin-top:20px;color:#2B2420">
      <div>Article: heart clock</div><div>gold, roses on the face</div><div>Date: Sun 18 Oct 2026</div><div>Pieces out: 7</div>
      <div>Held by one, read by</div><div>the other under a</div><div>magnifier</div></div></div>`;
  h += `<div class="t script" style="left:330px;top:1028px;font-size:62px;line-height:1">every piece on the table</div>`;
  h += T(340, 1108, 'src', 'Modelled in Blender from my photos at Repair Café Silicon Valley, Oct 18 2026, with the numbered ring as it sat in the toolbox. The movement and hands are drawn as typical parts.', 'width:900px');
  mount(W, H, s, h);
};
