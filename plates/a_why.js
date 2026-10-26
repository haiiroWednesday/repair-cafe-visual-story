// why people come: one tall glass, each reason a layer as thick as its weighted score, the regulars' own words hung from the rim on tea tags
ASSETS.why = () => {
  const W = 1560, H = 1230;
  let s = '', h = '';
  // the glass is a 3D render (three3d/why/layerglass.js): each layer's height is its score, the chai band is a fixed width
  const S = 1.25, IW = 700 * S, IH = 1000 * S, IMX = 470 - IW / 2, IMY = -60;
  const MK = {"L0": [0.6287, 0.7125], "B0": [0.5, 0.7454], "L1": [0.6342, 0.6526], "B1": [0.5, 0.6893], "L2": [0.6405, 0.5858], "B2": [0.5, 0.6248], "L3": [0.6473, 0.5192], "B3": [0.5, 0.5546], "L4": [0.654, 0.4228], "B4": [0.5, 0.4906], "foam": [0.648, 0.336], "top": [0.5, 0.2916], "rimR": [0.6695, 0.2895]};
  const at = k => [IMX + MK[k][0] * IW, IMY + MK[k][1] * IH];
  const k = (MK.B0[1] - MK.B1[1]) * IH / 58;           // px per point of score, measured off the render
  const GX = 470, GT = at('top')[1], GB = at('B0')[1], TW = at('rimR')[0] - GX;
  const FOAM = 0;
  const L = [
    { rk: '#1', sc: 129, t: 'such a waste to throw it away', fl: 'milk tea', c: '#C99863' },
    { rk: '#2 to #5', sc: null, t: 'four more reasons, each scored between 71 and 129. Not broken out here, so this band is not to scale', fl: 'chai swirl', c: '#B98A5E' },
    { rk: '#6', sc: 71, t: 'a professional repair costs too much', fl: 'caramel latte', c: '#A0663A' },
    { rk: '#7', sc: 66, t: 'I am attached to it', fl: 'hojicha', c: '#7E4B2A' },
    { rk: 'last', sc: 58, t: 'I could not find a repairer', fl: 'espresso', c: '#4A2A1A' },
  ];
  L.forEach((l, i) => { const [x, y] = at('L' + (4 - i)); l.mx = x; l.my = y; });
  const [foX, fT] = at('foam');
  s += `<ellipse cx="${GX}" cy="${IMY + .87 * IH}" rx="330" ry="40" fill="#2B1A10" opacity=".13" filter="url(#glow)"/>`;
  s += `<image href="t3/why_glass.png" x="${IMX}" y="${IMY}" width="${IW}" height="${IH}"/>`;
  // etched scale beside the glass: 50 points of score
  const sx = 272, sy = GB - 70;
  s += `<path d="M${sx} ${sy} V${sy - 50 * k} M${sx - 6} ${sy} h12 M${sx - 6} ${sy - 50 * k} h12" stroke="${P.walnut}" stroke-width="1.2"/>`;
  h += T(sx - 120, sy - 25 * k - 20, 'lbl', '50 points<br>of score', `width:108px;text-align:right;font-size:14px;line-height:1.2;color:${P.walnut2}`);
  // labels on the right, one per layer
  let lastY = -1e9;
  L.forEach((l, i) => {
    const my = l.my, x0 = l.mx;
    let ty = Math.max(my - 32, lastY + 22); const hh = l.sc === null ? 92 : 70; lastY = ty + hh;
    const lx = 760;
    s += `<path d="M${x0} ${my} C${x0 + 40} ${my} ${lx - 40} ${ty + 22} ${lx - 8} ${ty + 22}" fill="none" stroke="${P.walnut2}" stroke-width="1" filter="url(#rough)"/><circle cx="${x0}" cy="${my}" r="2.6" fill="${P.walnut2}"/>`;
    s += `<rect x="${lx - 2}" y="${ty + 8}" width="26" height="26" fill="${l.c}" stroke="${P.walnut}" stroke-width=".8"/>`;
    h += T(lx + 34, ty, 'script', l.fl, `font-size:32px;line-height:1.1;color:${P.walnut};width:300px`);
    h += T(lx + 34 + (l.fl.length * 13.5), ty + 6, 'num', l.sc === null ? `<span style="font-size:15px;color:${P.walnut2};font-weight:500">${l.rk}</span>` : `<span style="font-size:15px;color:${P.walnut2};font-weight:500">${l.rk}</span>&nbsp;${l.sc}`, 'font-size:27px;line-height:1.1;white-space:nowrap');
    h += T(lx + 34, ty + 40, l.sc === null ? 'note' : 'lbl', l.t, `font-size:${l.sc === null ? 15 : 17}px;line-height:1.25;width:${l.sc === null ? 330 : 360}px;color:${P.ink}`);
  });
  // the foam label and the turn of the caption
  s += lead(760, fT - 34, foX - 10, fT, P.ox, 0);
  h += T(770, fT - 66, 'hand', 'and on top, the foam:<br>what they say over a cup', `font-size:19px;line-height:1.6;color:${P.ox};width:380px`);
  // title
  h += T(40, 34, 'script', 'why people come', 'font-size:70px;line-height:1');
  h += T(44, 116, 'lbl', 'one glass, poured to how visitors to one english repair café ranked their reasons', 'font-size:16.5px;width:640px;line-height:1.35');
  // caption under the saucer
  h += T(40, 1075, 'note', 'Attachment sat near the bottom of the list, and near the top of every conversation. A thing is worth saving for as long as someone still wants it.', `font-size:18px;width:820px;line-height:1.35;color:${P.ox}`);
  // tea tags hung from the rim on strings
  const Q = [
    ['I hate throwing anything out.', 'Tim Showalter, owner of a KitchenAid mixer, Palo Alto 2017', P.rose3],
    ['He was really heartbroken when it stopped working.', 'Ann Lemmenes, on her husband’s pencil sharpener, 2017', P.mint],
    ['It’s got to be really dead before it goes out the door.', 'Ann Lemmenes', P.ivory],
    ['I didn’t know where to take it, and I don’t have any friends that are handy.', 'Jo Ann Arneson, who brought a lamp to the first Palo Alto café, 2012', P.blue],
    ['A lot of things you can’t even take apart. It’s a little sad.', 'Antariksh Bothale, software engineer and fixer, 2017', P.lilac],
  ];
  const TGW = 300, TGH = 150, TX = 1220;
  Q.forEach(([q, who, col], i) => {
    const tx = TX + (i % 2 ? -10 : 10), ty = 60 + i * 178, rot = [-2.5, 2, -1.5, 2.5, -2][i];
    const ax = GX + TW - 30 + i * 6, ay = GT - 4;
    s += `<path d="M${ax} ${ay} C${ax + 200} ${ay - 60 + i * 20} ${tx - 60} ${ty + 20} ${tx + TGW / 2} ${ty + 6}" fill="none" stroke="#E8DCC4" stroke-width="2.4"/><path d="M${ax} ${ay} C${ax + 200} ${ay - 60 + i * 20} ${tx - 60} ${ty + 20} ${tx + TGW / 2} ${ty + 6}" fill="none" stroke="#A89878" stroke-width=".8" stroke-dasharray="2 2"/>`;
    s += `<g transform="rotate(${rot} ${tx + TGW / 2} ${ty + TGH / 2})" filter="url(#shadowS)"><path d="M${tx} ${ty + 18} L${tx + 18} ${ty} H${tx + TGW - 18} L${tx + TGW} ${ty + 18} V${ty + TGH} H${tx} Z" fill="${col}"/>
      <path d="M${tx + 8} ${ty + 22} L${tx + 22} ${ty + 8} H${tx + TGW - 22} L${tx + TGW - 8} ${ty + 22} V${ty + TGH - 8} H${tx + 8} Z" fill="none" stroke="${P.walnut2}" stroke-opacity=".45" stroke-width="1"/>
      <path d="M${tx + TGW / 2 - 6} ${ty + 2} h12 v8 h-12 z" fill="${P.brass}"/></g>`;
    h += `<div class="t" style="left:${tx + 20}px;top:${ty + 24}px;width:${TGW - 40}px;transform:rotate(${rot}deg);transform-origin:${TGW / 2 - 20}px ${TGH / 2 - 24}px">
      <div style="font-family:Fraunces;font-style:italic;font-size:${q.length > 60 ? 16.5 : 18.5}px;line-height:1.26;color:${P.ink}">“${q}”</div>
      <div class="lbl" style="font-size:12.5px;margin-top:8px;line-height:1.3;color:${P.walnut2}">${who}</div></div>`;
  });
  // the drink mixer, a note pinned under the tags
  s += `<g transform="rotate(1.5 1360 1000)" filter="url(#shadowS)"><rect x="1190" y="960" width="340" height="122" fill="#FBF7EE"/><circle cx="1360" cy="972" r="5" fill="${P.ox}"/></g>`;
  h += `<div class="t note" style="left:1206px;top:982px;width:310px;transform:rotate(1.5deg);font-size:15px;line-height:1.25">An hour of two engineers’ time went into a 60-year-old drink mixer that sells for $16 online. The volunteers make no judgment about what a thing is worth. The owner already did.</div>`;
  h += T(40, H - 44, 'src', 'Ranking: Farnham Repair Café survey 2016, Centre for Sustainable Design (weighted scores, small sample). Layers drawn to score except the band for ranks 2 to 5. Flavours are decoration. Quotes: KQED 2017, Alta 2017, Verde Magazine 2012.', 'width:1100px');
  mount(W, H, s, h);
};
