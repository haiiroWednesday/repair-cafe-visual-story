"""Paints china decoration in lathe UV space (u around, v = profile index fraction, 0 bottom).
Writes <name>_col.png (porcelain + roses + tint band) and <name>_gold.png (where it is gilt).
Usage: python3 chinatex.py '<json list of jobs>'  each job: {name, tint, opt}"""
import sys, json, math, random, os
from PIL import Image, ImageDraw, ImageFilter

D = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tex')
W, H = 2048, 1024

def hx(h, a=255):
    h = h.lstrip('#'); return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)) + (a,)

def rose_tile(S, col, seed):
    rnd = random.Random(seed); im = Image.new('RGBA', (S, S), (0, 0, 0, 0)); c = S / 2
    base = hx(col)[:3]
    dark = tuple(int(v * .72) for v in base); light = tuple(min(255, int(v * 1.12 + 30)) for v in base)
    def petal(ang, dist, w, h, fill, edge):
        P = Image.new('RGBA', (S, S), (0, 0, 0, 0)); g = ImageDraw.Draw(P)
        x = c + math.cos(ang) * dist; y = c + math.sin(ang) * dist * .85
        g.ellipse([x - w, y - h, x + w, y + h], fill=fill)
        g.arc([x - w, y - h, x + w, y + h], 200, 340, fill=edge, width=max(2, int(w * .14)))
        P = P.rotate(-math.degrees(ang) + 90, center=(x, y), resample=Image.BICUBIC); im.alpha_composite(P)
    for n, dist, w, h, f in [(8, .34, .3, .26, 1.0), (6, .2, .25, .22, .9), (4, .1, .18, .16, .78)]:
        off = rnd.random() * 6
        for k in range(n):
            fc = tuple(int(min(255, v * f + rnd.randint(-10, 10))) for v in base) + (255,)
            petal(off + k * 2 * math.pi / n, dist * S * .5, w * S * .5, h * S * .5, fc, light + (255,))
    g = ImageDraw.Draw(im)
    for k in range(3):
        r = S * (.09 - k * .025); g.arc([c - r, c - r * .85, c + r, c + r * .85], k * 90, k * 90 + 250, fill=dark + (255,), width=max(2, S // 50))
    return im.filter(ImageFilter.GaussianBlur(S / 260))

def paint(name, tint, opt):
    col = Image.new('RGBA', (W, H), hx('#FFFDF9')); gold = Image.new('L', (W, H), 0)
    gc = ImageDraw.Draw(col); gg = ImageDraw.Draw(gold)
    vy = lambda v: H * (1 - v)
    # faint glaze mottling so the white is not dead flat
    rnd = random.Random(hash(name) & 0xffff)
    for i in range(1800):
        x, y = rnd.random() * W, rnd.random() * H; r = rnd.uniform(4, 22)
        gc.ellipse([x - r, y - r, x + r, y + r], fill=(246 + rnd.randint(-6, 6), 240 + rnd.randint(-6, 6), 236 + rnd.randint(-6, 6), 7))
    if opt.get('band'):
        v0, v1 = opt['band']; gc.rectangle([0, vy(v1), W, vy(v0)], fill=hx(tint, 150))
    for v in opt.get('gold', []):
        gg.rectangle([0, vy(v) - 7, W, vy(v) + 7], fill=255)
    if opt.get('scallop'):
        v, n = opt['scallop']; w = W / n
        for i in range(n): gg.arc([i * w, vy(v) - w / 2, (i + 1) * w, vy(v) + w / 2], 0, 180, fill=255, width=6)
    if opt.get('dots'):
        v, n = opt['dots']
        for i in range(n): x = (i + .5) * W / n; gg.ellipse([x - 6, vy(v) - 6, x + 6, vy(v) + 6], fill=255)
    if opt.get('roses'):
        v, n, r = opt['roses']; r = r * 2.6; sy = opt.get('sy', 1.0); rc = opt.get('roseCol') or tint; S = int(r * 4.2)
        for i in range(n):
            x = (i + .5) * W / n; y = vy(v)
            L = Image.new('RGBA', (W, H), (0, 0, 0, 0)); lg = ImageDraw.Draw(L)
            for sgn in (-1, 1):
                lg.ellipse([x + sgn * r * 1.9 - r, y + r * .2 - r * .45, x + sgn * r * 1.9 + r, y + r * .2 + r * .45], fill=hx('#8DC4A9'))
                lg.line([(x + sgn * r * 1.2, y + r * .2), (x + sgn * r * 2.7, y + r * .2)], fill=hx('#6FA88C'), width=3)
            for sgn in (-1, 1):
                lg.ellipse([x + sgn * r * 2.6 - r * .3, y - r * 1.0 - r * .3, x + sgn * r * 2.6 + r * .3, y - r * 1.0 + r * .3], fill=hx('#86AEDC'))
            L = L.filter(ImageFilter.GaussianBlur(1.2)); L = L.resize((W, H)); col.alpha_composite(L)
            t = rose_tile(S, rc, i + int(v * 100)); t = t.resize((S, max(8, int(S * sy))), Image.LANCZOS)
            col.alpha_composite(t, (int(x - S / 2), int(y - t.height / 2)))
            gg.ellipse([x - 4, y - r * 1.6 - 4, x + 4, y - r * 1.6 + 4], fill=255)
    gold = gold.filter(ImageFilter.GaussianBlur(1.4)); col = Image.alpha_composite(Image.new('RGBA', (W, H), (0, 0, 0, 0)), col)
    col.convert('RGB').save(os.path.join(D, name + '_col.png')); gold.save(os.path.join(D, name + '_gold.png'))

if __name__ == '__main__':
    os.makedirs(D, exist_ok=True)
    for j in json.loads(sys.argv[1]): paint(j['name'], j['tint'], j['opt'])
    print('painted')
