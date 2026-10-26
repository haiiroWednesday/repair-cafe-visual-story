"""Lace for the paper edition, drawn as SVG: a beading-lace trim with scallops, eyelets, picots, a threaded ribbon and
little flowers, and round doilies in rings. Holes are cut with masks so the paper underneath shows through."""
import math, os, random
D = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(D, 'kit', 'lace'); os.makedirs(OUT, exist_ok=True)
FILL, LINE, GOLD = '#FFFDF8', '#C4B4A4', '#D2B36A'
f = lambda v: f'{v:.2f}'.rstrip('0').rstrip('.')

def petal(cx, cy, a, l, w):
    """a teardrop pointing from (cx,cy) along angle a, length l, half-width w"""
    ca, sa = math.cos(a), math.sin(a); px, py = -sa, ca
    tx, ty = cx + ca * l, cy + sa * l
    return (f'M{f(cx)} {f(cy)} C{f(cx + ca * l * .35 + px * w)} {f(cy + sa * l * .35 + py * w)} {f(tx - ca * l * .12 + px * w * .9)} {f(ty - sa * l * .12 + py * w * .9)} {f(tx)} {f(ty)} '
            f'C{f(tx - ca * l * .12 - px * w * .9)} {f(ty - sa * l * .12 - py * w * .9)} {f(cx + ca * l * .35 - px * w)} {f(cy + sa * l * .35 - py * w)} {f(cx)} {f(cy)}Z')

def flower(cx, cy, r, n=6, rot=0):
    return ''.join(petal(cx, cy, rot + i * 2 * math.pi / n, r, r * .42) for i in range(n))

def trim(tw=120, h=96, ribbon='#F2B8C6', seed=1):
    """One repeating tile of beading lace, scallops on top, a sheer tulle behind."""
    rnd = random.Random(seed)
    base, holes, lines, sheer = [], [], [], []
    top, n = 34, 3; sw = tw / n
    # tulle: a sheer net behind the whole band
    for row in range(int((h - 6) / 3.3)):
        y = 6 + row * 3.3
        for col in range(int(tw / 3.8) + 1):
            x = (col + (.5 if row % 2 else 0)) * 3.8
            sheer.append(f'<circle cx="{f(x)}" cy="{f(y)}" r=".95"/>')
    path = f'M0 {top}'
    for k in range(n):
        x0, x1 = k * sw, (k + 1) * sw; cx = (x0 + x1) / 2
        path += f' C{f(x0 + 1)} {f(top - 18)} {f(cx - 12)} 12 {f(cx)} 12 C{f(cx + 12)} 12 {f(x1 - 1)} {f(top - 18)} {f(x1)} {top}'
        for i in range(7):
            t = (i + 1) / 8; a = math.pi * (1 - t)
            holes.append(f'<circle cx="{f(cx + math.cos(a) * (sw / 2 - 6.5))}" cy="{f(top - math.sin(a) * (top - 19.5))}" r="1.3"/>')
        for i in range(9):
            t = i / 8; a = math.pi * (1 - t)
            lines.append(f'<circle cx="{f(cx + math.cos(a) * (sw / 2 + .6))}" cy="{f(top - math.sin(a) * (top - 12) - 2.2)}" r="1.5" fill="{FILL}"/>')
        for i, (aa, ll, ww) in enumerate([(-math.pi / 2, 13, 3.1), (-math.pi / 2 - .62, 10, 2.6), (-math.pi / 2 + .62, 10, 2.6)]):
            p = petal(cx, top + 2, aa, ll, ww); holes.append(f'<path d="{p}"/>'); lines.append(f'<path d="{p}" fill="none"/>')
        holes.append(f'<circle cx="{f(cx)}" cy="{top + 2.5}" r="1.7"/>')
        lines.append(f'<path d="M{f(x0 + 4)} {top} C{f(x0 + 4)} {f(top - 14)} {f(cx - 9)} 16.5 {f(cx)} 16.5 C{f(cx + 9)} 16.5 {f(x1 - 4)} {f(top - 14)} {f(x1 - 4)} {top}" fill="none" stroke-dasharray=".9 1.8"/>')
    path += f' L{tw} {h - 4} L0 {h - 4} Z'
    base.append(f'<path d="{path}"/>')
    # draw only the scallop edge and the bottom, never the tile's sides
    lines.append(f'<path d="{path.split(" L")[0]}" fill="none"/>')
    # beading row with the ribbon threaded through
    y0 = top + 7
    for i in range(8):
        x = i * tw / 8 + 4
        holes.append(f'<rect x="{f(x)}" y="{y0}" width="6" height="7.5" rx="1.4"/>')
        lines.append(f'<rect x="{f(x)}" y="{y0}" width="6" height="7.5" rx="1.4" fill="none"/>')
    rib = ''.join(f'<rect x="{f(i * tw / 8 + 8.5)}" y="{y0 + 1.6}" width="{f(tw / 8 - 3)}" height="4.4" rx=".8" fill="{ribbon}"/><path d="M{f(i * tw / 8 + 9.5)} {y0 + 2.8} h{f(tw / 8 - 5)}" stroke="#fff" stroke-width=".7" opacity=".75"/>' for i in range(0, 8, 2))
    # body: net, a scrolling vine, small flowers with leaves
    ny0, ny1 = y0 + 12, h - 12; my = (ny0 + ny1) / 2
    fl = [(tw * .25, my), (tw * .75, my)]
    for row in range(int((ny1 - ny0) / 4.1)):
        y = ny0 + 2.2 + row * 4.1
        for col in range(int(tw / 4.6) + 1):
            x = (col + (.5 if row % 2 else 0)) * 4.6 + 1.2
            if any(math.hypot(x - a, y - b) < 10.5 for a, b in fl) or x < 1.5 or x > tw - 1.5: continue
            holes.append(f'<circle cx="{f(x)}" cy="{f(y)}" r="1.15"/>')
    vine = f'M0 {f(my)} C{f(tw * .12)} {f(my - 9)} {f(tw * .18)} {f(my + 8)} {f(tw * .25)} {f(my)} S{f(tw * .42)} {f(my + 9)} {f(tw * .5)} {f(my)} S{f(tw * .62)} {f(my - 9)} {f(tw * .75)} {f(my)} S{f(tw * .92)} {f(my + 9)} {tw} {f(my)}'
    base.append(f'<path d="{vine}" fill="none" stroke="#fff" stroke-width="2.4"/>')
    lines.append(f'<path d="{vine}" fill="none" stroke-dasharray="2 1.4"/>')
    for (fx, fy) in fl:
        holes.append(f'<circle cx="{f(fx)}" cy="{f(fy)}" r="9.5"/>')
        fp = flower(fx, fy, 8.5, 5, rnd.random()); base.append(f'<path d="{fp}"/>'); lines.append(f'<path d="{fp}" fill="none"/>')
    for lx, s in [(tw * .12, -1), (tw * .38, 1), (tw * .62, -1), (tw * .88, 1)]:
        lp = petal(lx, my + s * 1.5, -math.pi / 2 * s + .5, 7, 2.3); base.append(f'<path d="{lp}"/>'); lines.append(f'<path d="{lp}" fill="none"/>')
    lines.append(f'<path d="M0 {h - 9} H{tw}" fill="none" stroke="{GOLD}" stroke-dasharray="2.4 2.4"/>')
    lines.append(f'<path d="M0 {ny0 - 1.5} H{tw} M0 {ny1 + 1.5} H{tw}" fill="none" stroke-dasharray=".8 1.6"/>')
    for i in range(int(tw / 6)):
        lines.append(f'<circle cx="{f(i * 6 + 3)}" cy="{h - 2.6}" r="1.4" fill="{FILL}"/>')
    lines.append(f'<path d="M0 {h - 4} H{tw}" fill="none"/>')
    for (fx, fy) in fl: lines.append(f'<circle cx="{f(fx)}" cy="{f(fy)}" r="1.8" fill="{GOLD}" stroke="none"/>')
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{tw}" height="{h}" viewBox="0 0 {tw} {h}">'
           f'<defs><mask id="m" maskUnits="userSpaceOnUse" x="0" y="0" width="{tw}" height="{h}"><g fill="#fff">{base[0]}</g><g fill="#000">{"".join(holes)}</g><g fill="#fff">{"".join(base[1:])}</g></mask>'
           f'<mask id="t" maskUnits="userSpaceOnUse" x="0" y="0" width="{tw}" height="{h}"><rect y="8" width="{tw}" height="{h - 8}" fill="#fff"/><g fill="#000">{"".join(sheer)}</g></mask></defs>'
           f'<rect width="{tw}" height="{h}" fill="{FILL}" opacity=".42" mask="url(#t)"/>'
           f'<rect width="{tw}" height="{h}" fill="{FILL}" mask="url(#m)"/>{rib}'
           f'<g fill="none" stroke="{LINE}" stroke-width=".55" stroke-linecap="round" stroke-linejoin="round">{"".join(lines)}</g></svg>')
    return svg

def heart(cx, cy, s, rot):
    pts = [(0, .35), (-.5, -.15), (-.25, -.5), (0, -.25), (.25, -.5), (.5, -.15)]
    ca, sa = math.cos(rot), math.sin(rot)
    P = lambda x, y: (cx + (x * ca - y * sa) * s, cy + (x * sa + y * ca) * s)
    p = [P(*q) for q in [(0, .45), (-.62, -.05), (-.55, -.52), (-.18, -.6), (0, -.32), (.18, -.6), (.55, -.52), (.62, -.05)]]
    return (f'M{f(p[0][0])} {f(p[0][1])} C{f(p[1][0])} {f(p[1][1])} {f(p[2][0])} {f(p[2][1])} {f(p[3][0])} {f(p[3][1])} '
            f'Q{f(p[4][0])} {f(p[4][1])} {f(p[5][0])} {f(p[5][1])} C{f(p[6][0])} {f(p[6][1])} {f(p[7][0])} {f(p[7][1])} {f(p[0][0])} {f(p[0][1])}Z')

def doily(d=600, tint='#F2B8C6', seed=3):
    rnd = random.Random(seed); c = d / 2
    base, holes, lines, cols = [], [], [], []
    R = c - 8; n = 44; path = ''
    for i in range(n):
        a0, a1 = i / n * 2 * math.pi, (i + 1) / n * 2 * math.pi; am = (a0 + a1) / 2; r0 = R - 16
        p0 = (c + math.cos(a0) * r0, c + math.sin(a0) * r0); p1 = (c + math.cos(a1) * r0, c + math.sin(a1) * r0)
        q0 = (c + math.cos(a0 + .015) * (R + 3), c + math.sin(a0 + .015) * (R + 3)); q1 = (c + math.cos(a1 - .015) * (R + 3), c + math.sin(a1 - .015) * (R + 3))
        path += (f'M{f(p0[0])} {f(p0[1])} ' if i == 0 else '') + f'C{f(q0[0])} {f(q0[1])} {f(q1[0])} {f(q1[1])} {f(p1[0])} {f(p1[1])} '
        for j in range(2):
            aa = a0 + (j + 1) / 3 * (a1 - a0)
            holes.append(f'<circle cx="{f(c + math.cos(aa) * (R - 8))}" cy="{f(c + math.sin(aa) * (R - 8))}" r="1.5"/>')
        for j in range(3):
            aa = a0 + (j + 1) / 4 * (a1 - a0); rr = R + (1.6 if j == 1 else -.6)
            lines.append(f'<circle cx="{f(c + math.cos(aa) * (rr + 1.6))}" cy="{f(c + math.sin(aa) * (rr + 1.6))}" r="1.5" fill="{FILL}"/>')
    path += 'Z'
    base.append(f'<path d="{path}"/>'); lines.append(f'<path d="{path}" fill="none"/>')
    lines.append(f'<circle cx="{c}" cy="{c}" r="{f(R - 18)}" fill="none" stroke-dasharray="1 1.8"/>')
    # fans of three petals
    rf, rl = R - 84, R - 22
    for i in range(24):
        a = (i + .5) / 24 * 2 * math.pi; ox, oy = c + math.cos(a) * rf, c + math.sin(a) * rf
        for da, k, w in [(0, 1, 7), (-.2, .78, 5), (.2, .78, 5)]:
            p = petal(ox, oy, a + da, (rl - rf) * k, w); holes.append(f'<path d="{p}"/>'); lines.append(f'<path d="{p}" fill="none"/>')
        sp = petal(ox + math.cos(a) * 9, oy + math.sin(a) * 9, a, (rl - rf) * .6, 2.6); base.append(f'<path d="{sp}"/>'); lines.append(f'<path d="{sp}" fill="none"/>')
        holes.append(f'<circle cx="{f(c + math.cos(a + math.pi / 24) * (rl - 4))}" cy="{f(c + math.sin(a + math.pi / 24) * (rl - 4))}" r="2"/>')
    lines.append(f'<circle cx="{c}" cy="{c}" r="{f(rf - 6)}" fill="none" stroke="{GOLD}" stroke-dasharray="2.6 2.6"/>')
    # tulle between the fans and the heart ring
    r3 = 84; rr = r3 + 16
    while rr < rf - 11:
        k = int(2 * math.pi * rr / 4.8); off = rnd.random()
        for i in range(k):
            aa = (i + off) / k * 2 * math.pi
            holes.append(f'<circle cx="{f(c + math.cos(aa) * rr)}" cy="{f(c + math.sin(aa) * rr)}" r="1.2"/>')
        rr += 4.2
    lines.append(f'<circle cx="{c}" cy="{c}" r="{f(rf - 10)}" fill="none"/><circle cx="{c}" cy="{c}" r="{r3 + 12}" fill="none"/>')
    # a ring of little hearts
    for i in range(14):
        aa = i / 14 * 2 * math.pi
        hp = heart(c + math.cos(aa) * r3, c + math.sin(aa) * r3, 15, aa - math.pi / 2)
        holes.append(f'<path d="{hp}"/>'); lines.append(f'<path d="{hp}" fill="none"/>')
    lines.append(f'<circle cx="{c}" cy="{c}" r="{r3 - 12}" fill="none" stroke-dasharray=".9 1.8"/>')
    # the rose in the middle
    rose = []
    for ring, (rad, m, off) in enumerate([(54, 7, 0), (40, 6, .4), (27, 5, .1), (15, 4, .7)]):
        for i in range(m):
            aa = (i + off) / m * 2 * math.pi
            x0, y0 = c + math.cos(aa) * rad * .25, c + math.sin(aa) * rad * .25
            rose.append(petal(x0, y0, aa + .35, rad * .85, rad * .42))
    holes.append(f'<circle cx="{c}" cy="{c}" r="62"/>')
    for p in rose: base.append(f'<path d="{p}"/>'); lines.append(f'<path d="{p}" fill="none"/>')
    cols.append(f'<circle cx="{c}" cy="{c}" r="6" fill="{tint}" stroke="{LINE}" stroke-width=".6"/>')
    for i in range(14):
        aa = (i + .5) / 14 * 2 * math.pi
        cols.append(f'<circle cx="{f(c + math.cos(aa) * r3)}" cy="{f(c + math.sin(aa) * r3)}" r="1.7" fill="{GOLD}"/>')
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{d}" height="{d}" viewBox="0 0 {d} {d}">'
           f'<defs><mask id="m" maskUnits="userSpaceOnUse" x="0" y="0" width="{d}" height="{d}"><g fill="#fff">{base[0]}</g><g fill="#000">{"".join(holes)}</g><g fill="#fff">{"".join(base[1:])}</g></mask></defs>'
           f'<rect width="{d}" height="{d}" fill="{FILL}" mask="url(#m)"/>'
           f'<g fill="none" stroke="{LINE}" stroke-width=".6" stroke-linecap="round">{"".join(lines)}</g>{"".join(cols)}</svg>')
    return svg

if __name__ == '__main__':
    for name, rib in [('trim_pink', '#F2B8C6'), ('trim_blue', '#A9C4E6'), ('trim_lilac', '#CDB8E6'), ('trim_gold', '#E6CF95')]:
        open(os.path.join(OUT, name + '.svg'), 'w').write(trim(ribbon=rib))
    for name, t in [('doily_pink', '#F2B8C6'), ('doily_blue', '#A9C4E6'), ('doily_gold', '#E6CF95')]:
        open(os.path.join(OUT, name + '.svg'), 'w').write(doily(tint=t))
    print('lace', sorted(os.listdir(OUT)))
