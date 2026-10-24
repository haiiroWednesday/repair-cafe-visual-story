"""Paint the heart clock's face as it looks in the photos: a night-blue dial, a magenta glow low on the left,
six pink-red roses on long stems with sprays of baby's breath, a white satin bow over a clear sleeve."""
import math, random, sys
from PIL import Image, ImageDraw, ImageFilter, ImageChops

S = 2048
R = random.Random(11)
out = sys.argv[1] if len(sys.argv) > 1 else 'tex/rose_dial2.png'

def lerp(a, b, t): return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(len(a)))

# background: deep navy, a violet middle, the magenta bloom bottom-left
bg = Image.new('RGB', (S, S))
px = bg.load()
for y in range(0, S, 2):
    for x in range(0, S, 2):
        u, v = x / S, y / S
        d = math.hypot(u - .18, v - .86)
        g = max(0, 1 - d / .62) ** 1.7
        top = lerp((14, 12, 40), (40, 26, 84), v ** 1.3)
        c = lerp(top, (214, 62, 150), g)
        for dx in (0, 1):
            for dy in (0, 1): px[x + dx, y + dy] = c
bg = bg.filter(ImageFilter.GaussianBlur(10))

lay = Image.new('RGBA', (S, S), (0, 0, 0, 0))
dr = ImageDraw.Draw(lay)

# stems run from the roses down to the bow
TIE = (S * .40, S * .70)
roses = [(.46, .24, .066), (.63, .27, .062), (.36, .37, .064), (.55, .40, .068), (.72, .44, .058), (.45, .53, .06)]
for (x, y, r) in roses:
    p0 = (x * S, y * S + r * S * .6)
    mid = ((p0[0] + TIE[0]) / 2 + R.uniform(-30, 30), (p0[1] + TIE[1]) / 2)
    pts = [p0, mid, TIE]
    dr.line(pts, fill=(52, 92, 60, 255), width=9, joint='curve')
    for k in range(2):  # a couple of leaves on each stem
        t = R.uniform(.25, .6); lx = p0[0] + (TIE[0] - p0[0]) * t; ly = p0[1] + (TIE[1] - p0[1]) * t
        a = R.uniform(-1, 1) + (.8 if k else -.8)
        L = 70
        leaf = [(lx, ly), (lx + math.cos(a) * L * .6 - 18, ly - math.sin(a) * L * .6), (lx + math.cos(a) * L, ly - math.sin(a) * L), (lx + math.cos(a) * L * .6 + 18, ly - math.sin(a) * L * .6 + 10)]
        dr.polygon(leaf, fill=(46, 104, 66, 255))
# below the tie, the clear sleeve and the stem ends
sleeve = [(S * .33, S * .66), (S * .47, S * .66), (S * .40, S * .93), (S * .27, S * .90)]
sl = Image.new('RGBA', (S, S), (0, 0, 0, 0)); sd = ImageDraw.Draw(sl)
sd.polygon(sleeve, fill=(200, 200, 255, 70), outline=(235, 235, 255, 150))
for k in range(5):
    sd.line([(S * (.37 + k * .012), S * .7), (S * (.33 + k * .014), S * .9)], fill=(70, 110, 80, 160), width=7)
sd.line([(S * .43, S * .67), (S * .36, S * .92)], fill=(255, 255, 255, 70), width=10)
lay = Image.alpha_composite(lay, sl)
dr = ImageDraw.Draw(lay)

# baby's breath: cream sprays around the bouquet
for i in range(2600):
    a = R.uniform(0, 2 * math.pi); rr = abs(R.gauss(0, .2))
    x = .52 + math.cos(a) * rr * 1.05; y = .40 + math.sin(a) * rr * .95
    if not (0 < x < 1 and 0 < y < 1): continue
    s = R.uniform(2.5, 7.5)
    c = R.choice([(255, 246, 228), (250, 236, 210), (255, 255, 255), (238, 214, 196)])
    dr.ellipse([x * S - s, y * S - s, x * S + s, y * S + s], fill=c + (int(R.uniform(150, 255)),))
# fine twigs under the sprays
for i in range(160):
    a = R.uniform(0, 2 * math.pi); rr = R.uniform(.05, .3)
    x0, y0 = .52 * S, .42 * S
    dr.line([(x0 + math.cos(a) * rr * S * .4, y0 + math.sin(a) * rr * S * .4), (x0 + math.cos(a) * rr * S, y0 + math.sin(a) * rr * S)], fill=(150, 140, 120, 90), width=2)

# roses: spiral petals, dark heart, lit upper edge
def rose(cx, cy, r):
    g = Image.new('RGBA', (S, S), (0, 0, 0, 0)); d = ImageDraw.Draw(g)
    d.ellipse([cx - r * 1.25, cy - r * 1.15, cx + r * 1.25, cy + r * 1.25], fill=(255, 80, 130, 70))
    g = g.filter(ImageFilter.GaussianBlur(r * .35)); d = ImageDraw.Draw(g)
    rings = [(1.0, 7, (204, 40, 96)), (.8, 6, (226, 62, 118)), (.6, 5, (240, 90, 140)), (.42, 4, (210, 46, 100)), (.26, 3, (150, 18, 52))]
    off = R.uniform(0, 6)
    for k, (s, n, col) in enumerate(rings):
        for j in range(n):
            a = off + k * .7 + 2 * math.pi * j / n
            pr = r * s * .55
            px_, py_ = cx + math.cos(a) * r * s * .45, cy + math.sin(a) * r * s * .4
            d.ellipse([px_ - pr, py_ - pr * .8, px_ + pr, py_ + pr * .8], fill=col + (255,), outline=(120, 10, 40, 255), width=3)
            d.arc([px_ - pr, py_ - pr * .8, px_ + pr, py_ + pr * .8], 200, 320, fill=(255, 170, 190, 255), width=5)
    d.ellipse([cx - r * .12, cy - r * .1, cx + r * .12, cy + r * .1], fill=(110, 8, 34, 255))
    return g
for (x, y, r) in sorted(roses, key=lambda t: t[1]):
    lay = Image.alpha_composite(lay, rose(x * S, y * S, r * S))

# the bow: white satin with pink shadow, blue ribbon tails
d = ImageDraw.Draw(lay)
bx, by = TIE
def loop(sx):
    pts = [(bx, by)] + [(bx + sx * (math.sin(t) * 150), by - 110 * math.sin(t) * math.cos(t) * 1.6 - 10) for t in [i / 20 * math.pi for i in range(21)]]
    d.polygon(pts, fill=(248, 244, 250, 255), outline=(214, 150, 190, 255))
    d.line([(bx + sx * 30, by - 20), (bx + sx * 120, by - 40)], fill=(226, 196, 222, 255), width=6)
loop(1); loop(-1)
d.polygon([(bx - 10, by), (bx - 70, by + 170), (bx - 40, by + 150), (bx - 20, by + 180)], fill=(242, 236, 248, 255), outline=(214, 150, 190, 255))
d.polygon([(bx + 10, by), (bx + 60, by + 160), (bx + 30, by + 150), (bx + 18, by + 175)], fill=(242, 236, 248, 255), outline=(214, 150, 190, 255))
d.line([(bx - 6, by + 4), (bx - 90, by + 120), (bx - 120, by + 230)], fill=(110, 160, 230, 255), width=10)
d.line([(bx + 6, by + 4), (bx + 70, by + 110), (bx + 66, by + 220)], fill=(110, 160, 230, 255), width=10)
d.ellipse([bx - 24, by - 22, bx + 24, by + 22], fill=(236, 228, 244, 255), outline=(200, 140, 180, 255), width=3)

img = Image.alpha_composite(bg.convert('RGBA'), lay).convert('RGB')
img = img.resize((1024, 1024), Image.LANCZOS)
img.save(out)
print('ok', out)
