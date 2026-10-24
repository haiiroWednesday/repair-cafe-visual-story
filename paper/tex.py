"""Paper and fabric textures for the paper edition, made the way the collage reference is made:
crumpled cream paper with a fine crease network, lined and grid paper, kraft, gold foil, navy paper,
and café textiles cut into shards (gingham tablecloth, denim, knit, herringbone, open weave, lace).
Everything is drawn from noise and geometry so it can be regenerated at any size."""
import numpy as np, math, random, os
from PIL import Image, ImageDraw, ImageFilter, ImageChops
from scipy import ndimage

D = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(D, 'tex'); os.makedirs(OUT, exist_ok=True)
rng = np.random.default_rng(7)

def hexrgb(h): h = h.lstrip('#'); return np.array([int(h[i:i+2], 16) for i in (0, 2, 4)], float)

def fbm(h, w, scale, octaves=4, seed=0):
    r = np.random.default_rng(seed); out = np.zeros((h, w)); amp = 1; tot = 0
    for o in range(octaves):
        s = max(2, int(scale / 2 ** o)); g = r.random((h // s + 3, w // s + 3))
        up = ndimage.zoom(g, s, order=3)[:h, :w]; out += up * amp; tot += amp; amp *= .5
    return out / tot

def crumple(h, w, folds=110, seed=1, soft=1.0):
    """Height field of crumpled paper: a few long creases plus thousands of short ones, each a ridge |distance to a line|
    fading out with distance, so the sheet breaks into small facets like real crushed paper."""
    r = np.random.default_rng(seed); H = np.zeros((h, w))
    scale = (w * h / 1.6e6) ** .5
    sets = [(int(folds * .25), (.35, .9)), (int(folds * 4), (.05, .14)), (int(folds * 16), (.012, .04))]
    for count, (r0, r1) in sets:
        for i in range(count):
            px, py = r.random() * w, r.random() * h; a = r.random() * math.pi; nx, ny = math.cos(a), math.sin(a)
            reach = (r0 + r.random() * (r1 - r0)) * max(w, h); R = int(reach * 2.6)
            x0, x1, y0, y1 = max(0, int(px - R)), min(w, int(px + R)), max(0, int(py - R)), min(h, int(py + R))
            if x1 <= x0 or y1 <= y0: continue
            yy, xx = np.mgrid[y0:y1, x0:x1].astype(float)
            d = (xx - px) * nx + (yy - py) * ny
            amp = .35 + r.random() * .9
            H[y0:y1, x0:x1] += amp * -np.abs(d) * np.exp(-((xx - px) ** 2 + (yy - py) ** 2) / (2 * reach ** 2))
    return ndimage.gaussian_filter(H, soft)

def shade(H, light=(-.6, -.8, .9), k=1.0):
    gy, gx = np.gradient(H); n = np.dstack([-gx * k, -gy * k, np.ones_like(H)]); n /= np.linalg.norm(n, axis=2, keepdims=True)
    L = np.array(light, float); L /= np.linalg.norm(L); return (n @ L)

def paper(w, h, base, seed=1, folds=110, contrast=.5, k=.9, fiber=.035, vignette=.06):
    folds = max(20, folds // 3)
    H = crumple(h, w, folds, seed); s = shade(H, k=k); s = (s - s.mean()) / (s.std() + 1e-6)
    col = hexrgb(base)[None, None, :] * (1 + contrast * .11 * np.tanh(s[..., None] * 1.3))
    col *= 1 + fiber * (rng.random((h, w, 1)) - .5) * 2
    col *= 1 - .04 * (fbm(h, w, 160, 3, seed + 5)[..., None] - .5)
    yy, xx = np.mgrid[0:h, 0:w]; v = ((xx / w - .5) ** 2 + (yy / h - .5) ** 2); col *= (1 - vignette * v[..., None] * 2)
    return np.clip(col, 0, 255)

def save(arr, name, q=86, alpha=None):
    im = Image.fromarray(arr.astype(np.uint8))
    if alpha is not None:
        im = im.convert('RGBA'); im.putalpha(Image.fromarray((np.clip(alpha, 0, 1) * 255).astype(np.uint8)))
        im.save(os.path.join(OUT, name + '.png'), optimize=True)
    else: im.save(os.path.join(OUT, name + '.jpg'), quality=q)
    return im

def ruled(arr, step, col, alpha=.55, vertical=False, offset=0, width=1.4):
    h, w = arr.shape[:2]; yy, xx = np.mgrid[0:h, 0:w].astype(float); c = hexrgb(col)
    coord = xx if vertical else yy; m = (coord - offset) % step; dist = np.minimum(m, step - m)
    m = np.clip(1 - (dist - width / 2), 0, 1) * (.85 + .3 * (fbm(h, w, 30, 2, 5) - .5))
    return arr * (1 - alpha * m[..., None]) + c * alpha * m[..., None]

def make_all():
    W, Hh = 1600, 1000
    cream = paper(W, Hh, '#EFE8D6', seed=3); save(cream, 'paper_cream')
    grey = paper(W, Hh, '#E7E3DA', seed=11, folds=70, contrast=.8, k=1.4); save(grey, 'paper_grey')
    navy = paper(W, Hh, '#22327A', seed=21, folds=90, contrast=.75, fiber=.025); save(navy, 'paper_navy')
    lined = paper(W, Hh, '#F2EEE4', seed=31, folds=60, contrast=.35); lined = ruled(lined, 34, '#9FB0C8', .5, offset=20)
    save(lined, 'paper_lined')
    grid = paper(1000, 1000, '#F1EEE6', seed=41, folds=50, contrast=.35); grid = ruled(grid, 24, '#8E99A8', .45); grid = ruled(grid, 24, '#8E99A8', .45, vertical=True)
    save(grid, 'paper_grid')
    kraft = paper(900, 900, '#C79C6B', seed=51, folds=70, contrast=.9, fiber=.07, vignette=0); save(kraft, 'kraft')
    # gold foil: same crumple, much harder light, a metal ramp
    Hg = crumple(900, 900, 60, 61, soft=.8); s = shade(Hg, k=2.4); s = (s - s.min()) / (s.max() - s.min())
    ramp = np.array([hexrgb(c) for c in ['#6E4E1E', '#A97F36', '#D2AE5C', '#EED48C', '#C9A24E']])
    t = np.clip(s * (len(ramp) - 1), 0, len(ramp) - 1.001); i0 = t.astype(int); f = (t - i0)[..., None]
    gold = ramp[i0] * (1 - f) + ramp[i0 + 1] * f; gold *= 1 + .05 * (rng.random((900, 900, 1)) - .5); save(gold, 'gold')
    # café textiles
    n = 700; yy, xx = np.mgrid[0:n, 0:n].astype(float)
    # pink gingham tablecloth, slightly crumpled
    def check(c1, c2, step=26):
        a = ((xx // step) % 2).astype(float); b = ((yy // step) % 2).astype(float)
        weave = .5 + .5 * np.sin((xx + yy) * 1.6); m = (a + b) / 2
        col = hexrgb('#FFFDF7') * (1 - m[..., None]) + hexrgb(c1) * m[..., None]
        col = np.where(((a + b) == 2)[..., None], hexrgb(c2), col)
        col *= (1 - .05 * weave[..., None]); return col
    for name, c1, c2 in [('gingham_pink', '#F2B7C4', '#E07F98'), ('gingham_green', '#9CCFA9', '#3F9A63')]:
        g = check(c1, c2); g = ndimage.gaussian_filter(g, (1.1, 1.1, 0)); g *= (1 + .08 * (fbm(n, n, 6, 2, 71)[..., None] - .5)) * (1 + .05 * np.tanh(shade(crumple(n, n, 30, 70), k=.6)[..., None]))
        save(np.clip(g, 0, 255), name)
    # denim: diagonal twill, warp streaks, white flecks
    tw = .5 + .5 * np.sin((xx * .9 + yy * .9) * 1.15); streak = fbm(n, n, 60, 3, 81)
    warp = ndimage.zoom(rng.random((1, n // 3 + 2)), (n, 3), order=1)[:n, :n]
    v = np.clip(.35 * tw + .35 * streak + .3 * warp, 0, 1)
    den = hexrgb('#24427E') * (1 - v[..., None]) + hexrgb('#7FA2D2') * v[..., None]
    fleck = (rng.random((n, n)) > .985).astype(float); fleck = ndimage.gaussian_filter(fleck, .6) * 3
    den = den * (1 - np.clip(fleck, 0, .6)[..., None]) + 255 * np.clip(fleck, 0, .6)[..., None]; save(np.clip(den, 0, 255), 'denim')
    # knit: rows of V stitches
    im = Image.new('RGB', (n, n), '#8DB4D2'); d = ImageDraw.Draw(im)
    for r in range(-30, n + 30, 26):
        for c in range(-24, n + 24, 24):
            d.polygon([(c, r), (c - 11, r - 6), (c - 12, r + 16), (c - 1, r + 24)], fill='#A9CBE3', outline='#6F97BA')
            d.polygon([(c, r), (c + 11, r - 6), (c + 12, r + 16), (c + 1, r + 24)], fill='#98BCD8', outline='#6F97BA')
    knit = np.array(im.filter(ImageFilter.GaussianBlur(.6)), float) * (1 + .05 * (rng.random((n, n, 1)) - .5)); save(knit, 'knit')
    # herringbone tweed
    col = ((xx // 22) % 2); ang = np.where(col == 0, xx + yy, xx - yy); hb = .5 + .5 * np.sin(ang * .9)
    hb = np.clip(hb * .7 + .3 * fbm(n, n, 40, 3, 91), 0, 1)
    tweed = hexrgb('#294A7A') * (1 - hb[..., None]) + hexrgb('#9DB6D3') * hb[..., None]; save(tweed, 'herringbone')
    # open weave (burlap mesh) with holes as alpha
    th = 7; per = 26
    mx = (np.abs(((xx + 2 * np.sin(yy * .05)) % per) - per / 2) < th / 2 + 1).astype(float)
    my = (np.abs(((yy + 2 * np.sin(xx * .05)) % per) - per / 2) < th / 2 + 1).astype(float)
    a = np.clip(mx + my, 0, 1); a = ndimage.gaussian_filter(a, .7)
    meshc = hexrgb('#5E7FA8') * (1 + .25 * (fbm(n, n, 8, 2, 99)[..., None] - .5)); meshc = np.where((mx * my)[..., None] > .5, meshc * .85, meshc)
    save(np.clip(meshc, 0, 255), 'mesh', alpha=a)
    # striped café wallpaper (the teapot's pink stripe)
    st = (((xx + 6 * np.sin(yy * .01)) // 28) % 2)
    wp = np.where(st[..., None] > 0, hexrgb('#F6DCE2'), hexrgb('#FBEFF2')) * (1 + .05 * shade(crumple(n, n, 50, 120), k=.7)[..., None]); save(np.clip(wp, 0, 255), 'wallpaper')

if __name__ == '__main__':
    make_all(); print(sorted(os.listdir(OUT)))
