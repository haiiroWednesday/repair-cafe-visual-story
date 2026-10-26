// two repairs Jazz remembers: the cuckoo clock and the talking doll side by side, both from the 3D renders
ASSETS.jazz = async () => {
  const load = src => new Promise(r => { const e = document.createElement('script'); e.src = src; e.onload = r; document.body.appendChild(e); });
  if (!window.JZ || !JZ.stamp) await load('a_cuckoo.js');
  if (!JZ.dollSteps) await load('a_doll.js');
  const W = 1800, H = 1440;
  let s = '', h = '';
  const add = o => { s += o.s; h += o.h; };
  // header
  add(JZ.stamp(1460, 36, 3, 'reconstructions<br>told by jazz · an earlier event'));
  h += T(40, 34, '', 'two repairs Jazz remembers', `font-family:Gloock;font-size:62px;line-height:1;color:${P.walnut}`);
  h += T(44, 112, 'lbl', 'both brought in by family · both told by Jazz, volunteer fixer, about an earlier event', `font-size:18px;letter-spacing:.08em;color:${P.ox}`);
  s += `<path d="M40 156 H1760" stroke="${P.brass}" stroke-width="1.4"/><path d="M40 161 H1760" stroke="${P.brass}" stroke-width=".6"/>`;
  s += `<path d="M900 190 V1270" stroke="${P.brass}" stroke-width="1" stroke-dasharray="2 6"/>`;
  // ---- left: the cuckoo clock ----
  h += T(40, 186, '', 'her late father’s cuckoo clock', `font-family:Gloock;font-size:34px;line-height:1.1;color:${P.walnut}`);
  h += T(40, 232, '', 'A woman brought in her father’s cuckoo clock. It had not run in years, and she wanted all of it working again because it reminded her of him.', `font-family:Fraunces;font-size:17px;line-height:1.42;width:820px;color:${P.ink}`);
  const CX = 0, CY = 300, CK = .4, cw = 1000 * CK, chh = 2000 * CK;
  s += `<ellipse cx="${CX + cw * .49}" cy="${CY + chh * .86}" rx="120" ry="18" fill="#2B1A10" opacity=".14" filter="url(#glow)"/>`;
  s += JZ.img('t3/cuckoo_whole.png', CX, CY, cw, chh);
  const wx = CX + .4577 * cw, wy = CY + .7308 * chh;
  s += lead(150, 1020, wx - 6, wy + 10, P.walnut2, 0);
  h += T(40, 1024, 'lbl', 'pine-cone weights', `font-size:15px;color:${P.walnut}`) + T(40, 1044, 'note', 'their pull is the power', 'font-size:15px');
  const IW = 290, IH = IW * 840 / 1200, SH = 236;
  JZ.CUCKOO_STEPS.forEach(([f, t1, t2], i) => {
    const x = 400, y = 320 + i * (SH + 14);
    s += card(x, y, 480, SH, P.cream, i % 2 ? .4 : -.4);
    s += JZ.img(`t3/chainwheels_${f}.png`, x + 4, y + (SH - IH) / 2, IW, IH);
    add(JZ.num(x + IW + 26, y + 36, String(i + 1)));
    h += T(x + IW + 50, y + 24, 'lbl', t1, `font-size:16.5px;color:${P.walnut};width:140px;line-height:1.2`);
    const q = t2.startsWith('“');
    h += T(x + IW + 8, y + (q ? 72 : 82), '', t2, `font-family:${q ? 'Fraunces;font-style:italic' : 'Kalam'};font-size:${q ? 14 : 14.5}px;line-height:1.3;width:178px;color:${P.ink}`);
  });
  // his photo of the clock
  s += `<g transform="rotate(-4 545 1180)" filter="url(#shadow)">${JZ.img('pimg/ph_clockp.webp', 460, 1078, 165, 220)}</g>`;
  s += `<rect x="505" y="1066" width="80" height="26" fill="${P.rose3}" opacity=".75" transform="rotate(-8 545 1078)"/>`;
  h += T(660, 1150, 'hand', 'Jazz, with the clock', `font-size:17px;color:${P.ox};transform:rotate(-3deg)`);
  // ---- right: the talking doll ----
  h += T(930, 186, '', 'the talking doll', `font-family:Gloock;font-size:34px;line-height:1.1;color:${P.walnut}`);
  h += T(930, 232, '', 'A dad brought in the talking doll his son grew up with. The son is about 45 now. This one’s spring was bent out of shape.', `font-family:Fraunces;font-size:17px;line-height:1.42;width:830px;color:${P.ink}`);
  const st = JZ.dollSteps(930, 320, 266, 16, { small: true, k: 'j' }); s += st.s; h += st.h;
  const qy = 320 + st.ch + 30;
  s += card(930, qy, 830, 132, P.cream, -.3) + card(930, qy + 150, 830, 120, P.cream, .3);
  h += JZ.quote(964, qy + 22, 770, 'The spring was all bent out of shape, and I straightened it up, and put it all back together to make it work.', 'Jazz, volunteer fixer', -.3, 20);
  h += JZ.quote(964, qy + 170, 770, 'The guy was really happy, as it brought back memories for him. He said he was going to show it to his son too.', 'Jazz', .3, 20);
  h += T(930, qy + 290, 'note', 'Inside a pull-string toy, this is roughly what turns a tug into a voice. The doll stays in the photo.', `font-size:16.5px;width:830px;color:${P.walnut}`);
  // the hug, from the clock story, closing the pair
  const hy = qy + 340;
  s += card(930, hy, 830, 180, P.cream, .4);
  s += lacetrim(930, hy - 10, 830, 'pink', 26, .4);
  h += JZ.quote(966, hy + 30, 590, 'She asked me if it would be okay if she gave me a hug. She gave me the biggest hug!', 'Jazz, on the cuckoo clock · weeks later she came to another event and hugged him again', .4, 21);
  h += T(1580, hy + 18, 'num', '2', `width:160px;text-align:center;font-size:96px;line-height:1;font-style:italic;font-weight:400`);
  h += T(1580, hy + 124, 'lbl', 'hugs', `width:160px;text-align:center;font-size:17px;letter-spacing:.2em`);
  // ---- theme ----
  s += `<path d="M40 1292 H1760" stroke="${P.brass}" stroke-width=".8"/>`;
  h += T(40, 1306, 'script', 'worth an afternoon', 'font-size:46px;line-height:1');
  h += T(370, 1314, 'note', 'A thing is worth saving for as long as someone still wants it, and the Repair Café gives that wanting an afternoon and a pair of hands.', `font-size:19px;width:1100px;color:${P.walnut}`);
  h += T(40, 1384, 'src', 'As told by Jazz, volunteer fixer, Repair Café Silicon Valley, about an earlier event. Drawn in 3D as a typical weight-driven cuckoo clock and a typical pull-string unit, not taken from these two.', 'width:1500px');
  mount(W, H, s, h);
};
