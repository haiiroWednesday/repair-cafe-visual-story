// her late father's cuckoo clock: Jazz's repair at an earlier event, built on the 3D renders of the clock and its chain wheels
var JZ = window.JZ || {};
JZ.img = (src, x, y, w, h, extra = '') => `<image href="${src}" x="${x}" y="${y}" width="${w}" height="${h}" ${extra}/>`;
JZ.stamp = (x, y, rot, lines, col = P.ox) => {
  // a rubber stamp: double ruled box, slightly uneven ink
  const w = 300, h = 74;
  return {
    s: `<g transform="rotate(${rot} ${x + w / 2} ${y + h / 2})" opacity=".86" filter="url(#rough)"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${col}" stroke-width="3"/><rect x="${x + 6}" y="${y + 6}" width="${w - 12}" height="${h - 12}" fill="none" stroke="${col}" stroke-width="1.2"/></g>`,
    h: `<div class="t lbl" style="left:${x}px;top:${y + 13}px;width:${w}px;text-align:center;font-size:16px;line-height:1.35;color:${col};letter-spacing:.12em;transform:rotate(${rot}deg);opacity:.9">${lines}</div>`
  };
};
JZ.num = (x, y, n, col = P.ox) => ({ s: `<circle cx="${x}" cy="${y}" r="19" fill="${col}"/><circle cx="${x}" cy="${y}" r="15" fill="none" stroke="${P.cream}" stroke-width=".8" opacity=".7"/>`, h: T(x - 20, y - 15, 'num', n, `width:40px;text-align:center;font-size:22px;color:${P.cream};font-style:italic;font-weight:500`) });
JZ.quote = (x, y, w, q, who, rot = 0, fs = 22) => {
  return `<div class="t" style="left:${x}px;top:${y}px;width:${w}px;transform:rotate(${rot}deg)"><div style="font-family:Fraunces;font-style:italic;font-weight:400;font-size:${fs}px;line-height:1.3;color:${P.ink}">“${q}”</div><div class="lbl" style="font-size:14.5px;margin-top:8px;color:${P.ox}">${who}</div></div>`;
};
// the three chain-wheel stills: off, fed, tied. Anchors are fractions of the 1200 x 840 render.
JZ.CW = { wheel: [.4959, .3356], loose: [.3812, .4867], wire: [.5436, .8844], tie: [.7776, .6874], hole: [.5515, .5251] };
JZ.CUCKOO_STEPS = [
  ['off', 'off the wheels', 'Inside, each chain should ride on a toothed wheel. Here one had dropped off and lay in a heap.', 'loose', 'the chain, in a heap'],
  ['fed', 'fed back with a wire', '“They are very difficult to put back on, so I had to use a stiff wire to feed them back into the correct position.”', 'wire', 'stiff wire'],
  ['tied', 'tied for the drive home', 'Tied below the case, with orders: do not cut them loose until the clock is back on the wall.', 'tie', 'ties'],
];

ASSETS.cuckoo = () => {
  const W = 1640, H = 1660;
  let s = '', h = '';
  const add = o => { s += o.s; h += o.h; };
  // the clock, whole, on the left. Render is 1000 x 2000, its anchors are fractions of that.
  const CX = 10, CY = 90, CK = .6, cw = 1000 * CK, chh = 2000 * CK;
  s += `<ellipse cx="${CX + cw * .49}" cy="${CY + chh * .86}" rx="170" ry="26" fill="#2B1A10" opacity=".14" filter="url(#glow)"/>`;
  s += JZ.img('t3/cuckoo_whole.png', CX, CY, cw, chh);
  const ca = (k, a) => [CX + a[0] * cw, CY + a[1] * chh];
  const CA = { dial: [.4498, .3208], wheels: [.5, .4066], weight: [.4577, .7308], ring: [.6518, .6357], chain: [.4574, .5343] };
  const notes = [
    ['weight', 'pine-cone weights', 'their pull is the power', 500, 1000],
    ['ring', 'pull a ring', 'to wind it up', 500, 870],
    ['wheels', 'inside the case', 'each chain rides a toothed wheel', 500, 520],
  ];
  notes.forEach(([k, t1, t2, lx, ly]) => {
    const [x, y] = ca(k, CA[k]);
    s += lead(lx - 6, ly + 14, x + 8, y, P.walnut2, 0);
    h += T(lx, ly, 'lbl', t1, `font-size:17px;color:${P.walnut}`) + T(lx, ly + 22, 'note', t2, 'font-size:16.5px;width:180px');
  });
  // title block
  add(JZ.stamp(1300, 40, 4, 'reconstruction<br>told by jazz · an earlier event'));
  h += T(700, 46, 'gloock', 'her late father’s<br>cuckoo clock', `font-family:Gloock;font-size:58px;line-height:1.02;color:${P.walnut}`);
  h += T(700, 186, '', 'A woman brought in her father’s cuckoo clock. It had not run in years, and she wanted all of it working again because it reminded her of him. Weights on chains power the clock, and each chain should sit on a toothed wheel inside. They had fallen off. Jazz fed them back on with a stiff wire, then tied them so they could not slip out on the drive home.', `font-family:Fraunces;font-size:18.5px;line-height:1.45;width:880px;color:${P.ink}`);
  s += `<path d="M700 172 H1580" stroke="${P.brass}" stroke-width="1.4"/><path d="M700 177 H1580" stroke="${P.brass}" stroke-width=".6"/>`;
  // three step cards
  const SY = 370, SH = 268, IW = 390, IH = IW * 840 / 1200;
  JZ.CUCKOO_STEPS.forEach(([f, t1, t2, an, anl], i) => {
    const y = SY + i * (SH + 22), x = 700;
    s += card(x, y, 880, SH, P.cream, i % 2 ? .4 : -.4);
    s += JZ.img(`t3/chainwheels_${f}.png`, x + 14, y + (SH - IH) / 2 - 6, IW, IH);
    const [ax, ay] = [x + 14 + JZ.CW[an][0] * IW, y + (SH - IH) / 2 - 6 + JZ.CW[an][1] * IH];
    s += lead(x + IW + 10, y + SH - 40, ax, ay, P.ox, 0);
    h += T(x + IW + 18, y + SH - 52, 'hand', anl, `font-size:15px;color:${P.ox}`);
    add(JZ.num(x + IW + 44, y + 48, String(i + 1)));
    h += T(x + IW + 76, y + 34, 'lbl', t1, `font-size:22px;color:${P.walnut};width:400px`);
    h += T(x + IW + 76, y + 72, '', t2, `font-family:${t2.startsWith('“') ? 'Fraunces;font-style:italic' : 'Kalam'};font-size:${t2.startsWith('“') ? 19 : 18.5}px;line-height:1.35;width:390px;color:${P.ink}`);
  });
  // his photo of the clock, as a print taped down
  const PX = 80, PY = 1210, PW = 300, PH = 400;
  s += `<g transform="rotate(-4 ${PX + PW / 2} ${PY + PH / 2})" filter="url(#shadow)">${JZ.img('pimg/ph_clockp.webp', PX, PY, PW, PH)}</g>`;
  s += `<rect x="${PX + 100}" y="${PY - 16}" width="110" height="34" fill="${P.rose3}" opacity=".75" transform="rotate(-8 ${PX + 155} ${PY})"/>`;
  h += T(PX + 330, PY + 300, 'hand', 'Jazz, with the clock', `font-size:17px;color:${P.ox};transform:rotate(-3deg)`);
  // the hug
  s += card(700, 1250, 880, 236, P.cream, .5);
  s += lacetrim(700, 1240, 880, 'pink', 30, .5);
  h += JZ.quote(740, 1290, 560, 'She asked me if it would be okay if she gave me a hug. She gave me the biggest hug!', 'Jazz, volunteer fixer', .5, 25);
  h += T(740, 1418, 'note', 'Weeks later she came to another event and hugged him again.', 'font-size:18px;width:560px');
  h += T(1340, 1278, 'num', '2', `width:200px;text-align:center;font-size:120px;line-height:1;font-style:italic;font-weight:400`);
  h += T(1340, 1412, 'lbl', 'hugs', `width:200px;text-align:center;font-size:20px;letter-spacing:.2em`);
  // theme line and source
  h += T(700, 1520, 'script', 'worth an afternoon', 'font-size:44px;line-height:1');
  h += T(1010, 1524, 'note', 'A thing is worth saving for as long as someone still wants it.', `font-size:19px;width:560px;color:${P.walnut}`);
  h += T(700, 1590, 'src', 'As told by Jazz, volunteer fixer, Repair Café Silicon Valley, with his photo of the clock. Drawn in 3D as a typical weight-driven cuckoo clock, not from this one.', 'width:880px');
  mount(W, H, s, h);
};
window.JZ = JZ;
