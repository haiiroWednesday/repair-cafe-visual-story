// the talking doll: Jazz's repair at an earlier event, built on the 3D renders of a pull-string spring
var JZ = window.JZ || {};
JZ.PULL = { kink: [.3053, .5227], spring: [.6115, .5668], drum: [.5, .4203], wall: [.219, .3199], ring: [.7118, .9325] };
JZ.DOLL_STEPS = [
  ['bent2', 'as it came in', 'the spring bent out of shape', 'kink', 'coils pushed out of line, rubbing the case wall'],
  ['fixed2', 'straightened', 'even coils, each clear of the next', 'wall', 'outer end hooked to the case'],
  ['pulled4', 'pull the cord', 'the coils wind tight round the drum', 'drum', 'the cord winds on this drum'],
];
JZ.dollSteps = (x0, y0, cw, gap, opts = {}) => {
  // three cards in a row, each a 3D still with one note and its caption
  let s = '', h = '';
  const IW = cw - 20, IH = IW * 1120 / 1200, ch = IH + (opts.cap === false ? 20 : 120);
  JZ.DOLL_STEPS.forEach(([f, t1, t2, an, anl], i) => {
    const x = x0 + i * (cw + gap), y = y0, cid = 'dclip' + i + (opts.k || '');
    s += card(x, y, cw, ch, P.cream, [-.5, .4, -.3][i]);
    s += `<clipPath id="${cid}"><rect x="${x + 6}" y="${y + 6}" width="${cw - 12}" height="${IH + 4}"/></clipPath>`;
    s += `<g clip-path="url(#${cid})">${JZ.img(`t3/pull_${f}.png`, x + 10, y + 4, IW, IH)}</g>`;
    const [ax, ay] = [x + 10 + JZ.PULL[an][0] * IW, y + 4 + JZ.PULL[an][1] * IH];
    const lx = an === 'drum' ? x + cw - 20 : x + 16, ly = y + 26;
    s += lead(lx + (an === 'drum' ? -30 : 30), ly + 48, ax, ay, P.ox, 0);
    h += T(an === 'drum' ? lx - 190 : lx + 10, ly - 4, 'hand', anl, `font-size:${opts.small ? 13 : 14.5}px;line-height:1.5;color:${P.ox};width:190px;${an === 'drum' ? 'text-align:right' : ''}`);
    if (opts.cap !== false) {
      const n = JZ.num(x + 34, y + IH + 40, String(i + 1)); s += n.s; h += n.h;
      h += T(x + 64, y + IH + 24, 'lbl', t1, `font-size:${opts.small ? 18 : 21}px;color:${P.walnut}`);
      h += T(x + 64, y + IH + 52, 'note', t2, `font-size:${opts.small ? 15.5 : 17.5}px;width:${cw - 80}px`);
    }
  });
  return { s, h, ch };
};

JZ.load = src => new Promise(r => { const e = document.createElement('script'); e.src = src; e.onload = r; document.body.appendChild(e); });
ASSETS.doll = async () => {
  if (!JZ.stamp) await JZ.load('a_cuckoo.js');
  const W = 1640, H = 1270;
  let s = '', h = '';
  const add = o => { s += o.s; h += o.h; };
  add(JZ.stamp(1300, 40, 3, 'reconstruction<br>told by jazz · an earlier event'));
  // a toy-box label for the title
  h += T(40, 40, '', 'the talking doll', `font-family:Yellowtail;font-size:72px;line-height:1;color:${P.ox}`);
  h += T(44, 128, 'lbl', 'pull the cord and a spring winds tight · in this doll the spring had bent', `font-size:18px;letter-spacing:.1em;color:${P.walnut}`);
  h += T(40, 172, '', 'A dad brought in the talking doll his son grew up with. The son is about 45 now. Pull the cord in the doll’s back and it winds a flat coiled spring, and as the spring unwinds it pulls the cord home and runs the voice. This one’s spring was bent out of shape. Jazz, a volunteer fixer, straightened it and put the doll back together.', `font-family:Fraunces;font-size:18.5px;line-height:1.45;width:1100px;color:${P.ink}`);
  const st = JZ.dollSteps(40, 330, 500, 30); s += st.s; h += st.h;
  const qy = 330 + st.ch + 40;
  // the two quotes on tea-stained cards
  s += card(40, qy, 760, 140, P.cream, -.4) + card(830, qy, 770, 140, P.cream, .4);
  s += lacetrim(40, qy - 12, 760, 'blue', 26, -.4);
  h += JZ.quote(80, qy + 30, 690, 'The spring was all bent out of shape, and I straightened it up, and put it all back together to make it work.', 'Jazz, volunteer fixer', -.4, 22);
  h += JZ.quote(870, qy + 30, 700, 'The guy was really happy, as it brought back memories for him. He said he was going to show it to his son too.', 'Jazz', .4, 22);
  h += T(40, qy + 166, 'note', 'The doll stays in the photo. Inside a pull-string toy, this is roughly what turns a tug into a voice.', `font-size:18px;width:760px;color:${P.walnut}`);
  h += T(830, qy + 162, 'script', 'worth an afternoon', 'font-size:40px;line-height:1');
  h += T(1110, qy + 168, 'note', 'A thing is worth saving for as long as someone still wants it.', `font-size:17px;width:480px;color:${P.walnut}`);
  h += T(40, qy + 222, 'src', 'As told by Jazz, volunteer fixer, Repair Café Silicon Valley. Drawn in 3D as a typical pull-string unit, not taken apart from this doll.', 'width:1200px');
  mount(W, H, s, h);
};
window.JZ = JZ;
