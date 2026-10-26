// the needle: anatomy, what 70/10 means, the size ladder, and ticket #1's check order
ASSETS.needle = () => {
  const W = 1520, H = 1290;
  let s = '', h = '';
  s += `<defs><linearGradient id="steelV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8E8F98"/><stop offset=".3" stop-color="#F4F4F7"/><stop offset=".55" stop-color="#C9CAD2"/><stop offset="1" stop-color="#6E6F78"/></linearGradient>
    <linearGradient id="steelF" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D9DAE0"/><stop offset=".5" stop-color="#E9EAEE"/><stop offset="1" stop-color="#7A7B84"/></linearGradient>
    <linearGradient id="steelH" x1="0" x2="1"><stop offset="0" stop-color="#7A7B84"/><stop offset=".35" stop-color="#F2F2F5"/><stop offset=".6" stop-color="#C4C5CD"/><stop offset="1" stop-color="#6E6F78"/></linearGradient></defs>`;
  // the 3D needle renders (400x2000, point down, content v 70..1931) laid on their side, point to the right
  const X0 = 160, LEN = 1140, KN = LEN / 1861;
  const NA = {
    front: {shank: [0.5, 0.2083], shoulder: [0.5, 0.4244], groove: [0.5, 0.6139], scarf: [0.5, 0.7724], eye: [0.5, 0.8376], point: [0.5, 0.9645]},
    back: {shank: [0.5, 0.2083], flat: [0.5622, 0.2091], shoulder: [0.5, 0.4244], groove: [0.4702, 0.6131], scarf: [0.5249, 0.7731], eye: [0.5, 0.8376], point: [0.5, 0.9645]}
  };
  const nat = (view, yc, n) => { const [u, v] = [NA[view][n][0] * 400, NA[view][n][1] * 2000]; return [X0 + (v - 70) * KN, yc - (u - 200) * KN]; };
  function needle(y, back) {
    let o = `<ellipse cx="${X0 + LEN / 2}" cy="${y + 62}" rx="${LEN * .48}" ry="10" fill="#2B1A10" opacity=".12" filter="url(#glow)"/>`;
    o += `<g transform="translate(${X0 - 70 * KN} ${y + 200 * KN}) rotate(-90) scale(${KN})"><image href="t3/needle_${back ? 'back' : 'front'}.png" width="400" height="2000"/></g>`;
    if (!back) {
      const [gx] = nat('front', y, 'shoulder'), [ex] = nat('front', y, 'eye');
      // the stamp on the shank, and thread lying in the groove and out through the eye
      o += `<text x="${X0 + 50}" y="${y + 8}" font-family="Courier" font-weight="700" font-size="22" fill="#55565E" letter-spacing="2" opacity=".85">70/10</text>`;
      o += `<path d="M${gx + 40} ${y} H${ex - 10} Q${ex + 2} ${y + 1} ${ex + 4} ${y + 5} Q${ex + 12} ${y + 44} ${ex + 80} ${y + 76}" fill="none" stroke="${P.ox2}" stroke-width="2.4" stroke-linecap="round"/>`;
      o += `<path d="M${gx + 40} ${y} Q${gx + 10} ${y - 40} ${gx + 60} ${y - 74}" fill="none" stroke="${P.ox2}" stroke-width="2.4" stroke-linecap="round"/>`;
    }
    return o;
  }
  // header, like the face of a needle paper
  s += `<g filter="url(#shadowS)"><rect x="30" y="22" width="640" height="92" fill="${P.ox}"/><rect x="38" y="30" width="624" height="76" fill="none" stroke="${P.brass3}" stroke-width="1"/></g>`;
  h += T(30, 32, '', 'the needle is the cheap part', `width:640px;text-align:center;font-family:Gloock;font-size:36px;color:${P.cream}`);
  h += T(30, 76, 'lbl', 'anatomy of a sewing machine needle', `width:640px;text-align:center;font-size:16px;color:${P.brass3}`);
  // two views
  const YF = 296, YB = 506;
  s += needle(YF, false) + needle(YB, true);
  h += T(1330, YF - 12, 'lbl', 'front', 'font-size:18px');
  h += T(1330, YB - 12, 'lbl', 'back', 'font-size:18px');
  // cross-section of the shank: a D, flat side to the back
  const cx = 740, cy = 401;
  s += `<path d="M${cx - 30} ${cy - 34} A40 40 0 1 1 ${cx - 30} ${cy + 34} Z" fill="url(#steelH)" stroke="#5E5F68"/>`;
  h += T(cx + 34, cy - 34, 'lbl', 'the shank, cut across', `font-size:17px;color:${P.ox};width:300px`);
  h += T(cx + 34, cy - 10, 'note', 'flat to the back, so the needle can only sit one way', 'width:300px;font-size:15.5px;line-height:1.25');
  // anatomy notes
  const N = [
    [180, YF - 122, 'shank', 'the thick end the machine clamps', 'front', 'shank'],
    [470, YF - 150, 'shoulder', 'where it narrows. The size is stamped near here', 'front', 'shoulder'],
    [800, YF - 122, 'long groove', 'the thread lies in it on the way down', 'front', 'groove'],
    [1100, YF - 122, 'eye', 'thread goes through front to back', 'front', 'eye'],
    [180, YB + 66, 'flat side', 'faces the back of the machine', 'back', 'flat'],
    [900, YB + 66, 'scarf', 'a scoop on the back, so the hook can pass close to the eye', 'back', 'scarf'],
    [1180, YB + 66, 'point', 'a bent one wanders and strikes the foot', 'back', 'point'],
  ].map(([x, y, t, n, v, k]) => { const [px, py] = nat(v, v === 'front' ? YF : YB, k); return [x, y, t, n, px, py]; });
  N.forEach(([x, y, t, n, px, py]) => {
    h += T(x, y, 'lbl', t, `font-size:19px;color:${P.ox};width:240px`);
    h += T(x, y + 25, 'note', n, 'font-size:15.5px;width:230px;line-height:1.22');
    const above = y < py;
    s += lead(x + 8, above ? y + 70 : y - 4, px, py, P.walnut2, 0);
  });
  h += T(500, YB + 72, 'src', 'rendered in 3D, about twice as thick as life relative to its length', 'font-size:13px;width:300px');

  // ---------- the size ladder ----------
  const LY = 676;
  s += card(30, LY, 930, 470, 'url(#paperP)', -.3, `<rect x="30" y="${LY}" width="930" height="470" fill="${P.cream}" opacity=".6" filter="url(#deckle)"/>`);
  h += T(60, LY + 22, 'lbl', 'the size ladder', `font-size:22px;color:${P.ox}`);
  h += T(60, LY + 52, 'note', 'Each needle drawn at the same scale across its blade. The first number is the blade in hundredths of a millimetre.', 'font-size:16px;width:860px');
  const SZ = [[60, 8], [65, 9], [70, 10], [75, 11], [80, 12], [90, 14], [100, 16], [110, 18]];
  const k = .42, bx0 = 110, top = LY + 150, ht = 200;
  SZ.forEach(([m, a], i) => {
    const x = bx0 + i * 102, w = m * k, us = m === 70;
    s += `<path d="M${x - w / 2} ${top} V${top + ht - 30} Q${x - w / 2} ${top + ht - 6} ${x} ${top + ht + 18} Q${x + w / 2} ${top + ht - 6} ${x + w / 2} ${top + ht - 30} V${top} Z" fill="url(#steelH)" stroke="#5E5F68" stroke-width=".9" filter="url(#shadowS)"/>`;
    s += `<ellipse cx="${x}" cy="${top + ht - 48}" rx="${w * .2}" ry="9" fill="#3A3438"/>`;
    if (us) s += `<rect x="${x - 46}" y="${top - 66}" width="92" height="${ht + 104}" fill="none" stroke="${P.ox}" stroke-width="1.6" stroke-dasharray="5 4"/>`;
    h += T(x - 50, top - 54, 'mono', `${m}/${a}`, `width:100px;text-align:center;font-weight:700;font-size:19px;color:${us ? P.ox : '#3A332E'}`);
    h += T(x - 50, top - 30, 'lbl', `${(m / 100).toFixed(2)} mm`, 'width:100px;text-align:center;font-size:14px');
  });
  h += T(bx0 + 2 * 102 - 60, top + ht + 40, 'note', 'ticket #1', `width:120px;text-align:center;font-size:16px;color:${P.ox}`);
  // fabric bands under the ladder
  const BANDS = [[0, 1, 'fine', 'sheer silk, chiffon, organza'], [2, 3, 'light', 'lawn, voile, light knits'], [4, 5, 'medium', 'quilting cotton, shirting, twill'], [6, 7, 'heavy', 'denim, canvas, upholstery']];
  BANDS.forEach(([a, b, t, n]) => {
    const x1 = bx0 + a * 102 - 40, x2 = bx0 + b * 102 + 40, y = top + ht + 72;
    s += `<path d="M${x1} ${y} v-8 M${x1} ${y} H${x2} v-8" stroke="${P.walnut2}" stroke-width="1.2" fill="none"/>`;
    h += T(x1, y + 8, 'lbl', t, `width:${x2 - x1}px;text-align:center;font-size:16px;color:${P.ox}`);
    h += T(x1, y + 30, 'note', n, `width:${x2 - x1}px;text-align:center;font-size:14.5px;line-height:1.2`);
  });

  // ---------- 70/10 read twice ----------
  const RX = 1000, RY = 686;
  s += `<g transform="rotate(1.5 1250 800)" filter="url(#shadow)"><rect x="${RX}" y="${RY}" width="490" height="210" fill="#FBF7EE"/><rect x="${RX + 10}" y="${RY + 10}" width="470" height="190" fill="none" stroke="${P.brass}" stroke-width="1"/></g>`;
  h += `<div class="t" style="left:${RX + 30}px;top:${RY + 20}px;width:440px;transform:rotate(1.5deg)">
    <div class="lbl" style="font-size:20px;color:${P.ox}">one needle, two numbers</div>
    <div style="display:flex;gap:18px;align-items:flex-start;margin-top:12px">
      <div class="mono" style="font-size:52px;font-weight:700;line-height:1;color:${P.ink}">70</div>
      <div class="note" style="font-size:16px;line-height:1.25">the European count: the blade is 0.70 mm across</div></div>
    <div style="display:flex;gap:18px;align-items:flex-start;margin-top:14px">
      <div class="mono" style="font-size:52px;font-weight:700;line-height:1;color:${P.ink}">10</div>
      <div class="note" style="font-size:16px;line-height:1.25">the American count for the same needle. Bigger numbers mean thicker needles in both.</div></div></div>`;
  // ---------- ticket #1 and the check order ----------
  const TX = 1000, TY = 936;
  s += `<g transform="rotate(-2 1120 1100)" filter="url(#shadow)"><rect x="${TX}" y="${TY}" width="230" height="250" fill="#FDFCF8"/></g>`;
  h += `<div class="t mono" style="left:${TX + 16}px;top:${TY + 14}px;width:200px;transform:rotate(-2deg);transform-origin:100px 110px;font-size:13px;line-height:1.45">
    <div style="font-weight:700;font-size:15px">11:47 AM</div><div>SEWING / TEXTILES</div><div style="font-size:30px;font-weight:700;margin:4px 0">#1</div>
    <div>ITEM: Sewing machine</div><div>ISSUE: Needle hits the foot. Misaligned</div><div>CLIENT: S. F.</div><div style="margin-top:6px;letter-spacing:.2em">U4A</div></div>`;
  h += `<div class="t" style="left:1255px;top:${TY - 8}px;width:240px">
    <div class="lbl" style="font-size:19px;color:${P.ox}">check, in order</div>
    <div class="note" style="font-size:15.5px;line-height:1.26;margin-top:6px">
    1. needle in backwards? flat side to the back<br>2. needle bent? roll it on the table<br>3. right foot for the stitch? a zigzag stitch on a straight-stitch foot hits every time<br>4. only then, the timing inside the machine</div></div>`;
  h += T(30, H - 40, 'src', 'Needles rendered in 3D, ticket from Repair Café Silicon Valley, Oct 18 2026 (Schmetz 70/10). Needle anatomy, sizing and fabric ranges: Schmetz needle guide.', `width:${W - 60}px`);
  mount(W, H, s, h);
};
