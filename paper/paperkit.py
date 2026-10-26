"""Torn paper, the way the collage reference does it: a ragged edge (big waves + jagged teeth), a white fibrous rim
where the paper's core shows, a few loose fibres, and a soft shadow. Used for torn kraft and gold photo frames,
a torn heart frame, a film strip, torn section edges and die-cut stickers of the café renders."""
import numpy as np, math, os
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance, ImageOps
from scipy import ndimage

D = os.path.dirname(os.path.abspath(__file__)); ST = os.path.join(D, 'studio'); OUT = os.path.join(D, 'kit'); os.makedirs(OUT, exist_ok=True)

def fbm(h, w, scales, seed):
    r = np.random.default_rng(seed); out = np.zeros((h, w), np.float32); tot = 0
    for s, a in scales:
        s = max(1, int(s)); g = r.random((h // s + 3, w // s + 3)).astype(np.float32)
        out += a * (ndimage.zoom(g, s, order=1 if s < 4 else 3)[:h, :w] - .5); tot += a
    return out / tot

def tex(name, w, h, seed=0):
    """A crop of a studio texture, tiled if it is too small."""
    kp = os.path.join(OUT, 'tx_' + name + '.jpg')
    im = Image.open(kp if os.path.exists(kp) else os.path.join(ST, name + '.png')).convert('RGB')
    if im.width < w or im.height < h:
        k = max(w / im.width, h / im.height) * 1.02; im = im.resize((int(im.width * k) + 1, int(im.height * k) + 1), Image.LANCZOS)
    r = np.random.default_rng(seed); x = int(r.random() * (im.width - w)); y = int(r.random() * (im.height - h))
    return im.crop((x, y, x + w, y + h))

def rect_sdf(h, w, x0, y0, x1, y1):
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    dx = np.maximum(x0 - xx, xx - x1); dy = np.maximum(y0 - yy, yy - y1)
    out = np.hypot(np.maximum(dx, 0), np.maximum(dy, 0)); ins = np.minimum(np.maximum(dx, dy), 0)
    return -(out + ins)          # positive inside

def heart_sdf(h, w, cx, cy, s):
    """Approximate signed distance (positive inside) to a heart of half-width s, by rasterising and a distance transform."""
    im = Image.new('L', (w, h), 0); d = ImageDraw.Draw(im); pts = []
    for i in range(240):
        t = 2 * math.pi * i / 240; x = 16 * math.sin(t) ** 3; y = 13 * math.cos(t) - 5 * math.cos(2 * t) - 2 * math.cos(3 * t) - math.cos(4 * t)
        pts.append((cx + x * s / 16, cy - y * s / 16 - s * .1))
    d.polygon(pts, fill=255); m = np.array(im) > 127
    return ndimage.distance_transform_edt(m) - ndimage.distance_transform_edt(~m)

def torn(sdf, seed, rough=1.0, fringe=5.0):
    """From a signed distance field: the piece's alpha, and a white rim along its torn edge."""
    h, w = sdf.shape
    n = fbm(h, w, [(260, 1.3), (90, .9), (28, .55), (9, .4), (3, .28), (1, .16)], seed) * 34 * rough
    f = sdf + n
    alpha = np.clip(f + .5, 0, 1)
    # rim: the paper's white core, wider in places, with ragged inner edge
    wv = fringe * (.45 + 1.3 * np.clip(fbm(h, w, [(60, 1), (14, .6), (3, .4)], seed + 7) + .5, 0, 1))
    rim = np.clip(1 - (f - .5) / np.maximum(wv, .5), 0, 1) * alpha
    rim = np.clip(rim * 1.6 - .15 + fbm(h, w, [(2, 1), (1, .8)], seed + 9) * .9, 0, 1) * alpha
    return alpha, rim

def compose(base_rgb, alpha, rim, rim_col=(250, 247, 238)):
    a = np.array(base_rgb, np.float32); rc = np.array(rim_col, np.float32)
    a = a * (1 - rim[..., None]) + rc * rim[..., None]
    # a faint darker line just inside the rim (the torn fibres catch shadow)
    return Image.fromarray(np.dstack([np.clip(a, 0, 255), alpha * 255]).astype(np.uint8), 'RGBA')

def fibres(img, alpha, seed, n=60, col=(250, 247, 238)):
    """A few loose fibres poking out of the torn edge."""
    r = np.random.default_rng(seed); edge = (alpha > .5) & ~ndimage.binary_erosion(alpha > .5, iterations=1)
    ys, xs = np.nonzero(edge); d = ImageDraw.Draw(img)
    if not len(xs): return img
    gy, gx = np.gradient(ndimage.gaussian_filter(alpha, 3))
    for i in r.choice(len(xs), min(n, len(xs)), replace=False):
        x, y = xs[i], ys[i]; ox, oy = -gx[y, x], -gy[y, x]; L = math.hypot(ox, oy) or 1; ox, oy = ox / L, oy / L
        ln = 3 + r.random() * 9; bend = (r.random() - .5) * .8
        pts = [(x, y), (x + ox * ln * .5 + oy * bend * ln * .3, y + oy * ln * .5 - ox * bend * ln * .3), (x + ox * ln, y + oy * ln)]
        d.line(pts, fill=col + (200,), width=1)
    return img

def shadowed(img, blur=6, off=(3, 5), op=.32):
    """Pad and add a soft drop shadow under a cut-out."""
    p = blur * 3 + max(map(abs, off)); W, H = img.width + 2 * p, img.height + 2 * p
    a = img.getchannel('A'); sh = Image.new('RGBA', (W, H), (0, 0, 0, 0)); blk = Image.new('RGBA', img.size, (40, 32, 24, 255))
    sh.paste(blk, (p + off[0], p + off[1]), a); sh = sh.filter(ImageFilter.GaussianBlur(blur))
    sh.putalpha(sh.getchannel('A').point(lambda v: int(v * op)))
    sh.alpha_composite(img, (p, p)); return sh

def frame(photo_path, out, kind='kraft', border=46, shape='rect', seed=1, maxw=900, crop=None, rot=0):
    ph = Image.open(photo_path).convert('RGB'); ph = ImageOps.exif_transpose(ph)
    if crop: ph = ph.crop(crop)
    ph.thumbnail((maxw, maxw))
    pw, phh = ph.size; W, H = pw + 2 * border, phh + 2 * border
    if shape == 'heart':
        W = H = max(pw, phh) + 2 * border
        outer = heart_sdf(H, W, W / 2, H / 2 + H * .04, W * .47); inner = heart_sdf(H, W, W / 2, H / 2 + H * .04, W * .47 - border)
        photo = ph.resize((int(W * .86), int(W * .86 * phh / pw))) if pw > phh else ph.resize((int(H * .86 * pw / phh), int(H * .86)))
    else:
        rr = np.random.default_rng(seed + 40); bs = [border * (.75 + .6 * rr.random()) for _ in range(4)]
        outer = rect_sdf(H, W, 6, 6, W - 6, H - 6); inner = rect_sdf(H, W, bs[0], bs[1], W - bs[2], H - bs[3]); photo = ph
    canvas = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    # the photo, with its own slightly torn white edge, sits under the window
    px, py = (W - photo.width) // 2, (H - photo.height) // 2
    psdf = rect_sdf(H, W, px + 2, py + 2, px + photo.width - 2, py + photo.height - 2)
    pa, prim = torn(psdf, seed + 3, rough=.35, fringe=3)
    full = Image.new('RGB', (W, H), (250, 247, 238)); full.paste(photo, (px, py))
    if shape == 'heart':   # the photo only exists inside the heart
        ha, _ = torn(outer, seed, rough=1.0, fringe=5); pa = pa * ha; prim = prim * ha
    canvas.alpha_composite(compose(full, pa, prim * .9))
    # the frame: outer tear minus the window tear, each edge with its white rim
    oa, orim = torn(outer, seed, rough=1.0 if kind == 'kraft' else .8, fringe=9)
    ia, irim = torn(-inner, seed + 5, rough=1.1, fringe=10)
    fa = oa * ia; frim = np.clip(orim * ia + irim * oa, 0, 1)
    t = tex({'kraft': 'kraft', 'gold': 'gold'}[kind], W, H, seed)
    if kind == 'gold':
        t = ImageEnhance.Contrast(t).enhance(1.15)
    fr = compose(t, fa, frim * (.9 if kind == 'kraft' else .7), rim_col=(244, 236, 220) if kind == 'kraft' else (250, 244, 225))
    fr = fibres(fr, fa, seed)
    canvas.alpha_composite(fr)
    if rot: canvas = canvas.rotate(rot, resample=Image.BICUBIC, expand=True)
    shadowed(canvas).save(os.path.join(OUT, out + '.png'), optimize=True); return out

def film(photo_paths, out, seed=4, cell=(520, 380), crops=None):
    """A strip of orange 35mm film holding photos one above another, sprocket holes down both sides."""
    cw, ch = cell; side = 92; gap = 26; n = len(photo_paths); W = cw + 2 * side; H = n * ch + (n + 1) * gap
    base = np.array(tex('film', W, H, seed) if os.path.exists(os.path.join(ST, 'film.png')) else Image.new('RGB', (W, H), (197, 74, 34)), np.float32)
    r = np.random.default_rng(seed)
    speck = (r.random((H, W)) > .9).astype(np.float32); speck = ndimage.gaussian_filter(speck, .7)
    base = base * (1 - .35 * speck[..., None]) + np.array([255, 190, 140]) * .35 * speck[..., None] * .4
    img = Image.fromarray(np.clip(base, 0, 255).astype(np.uint8)).convert('RGBA'); d = ImageDraw.Draw(img)
    for i, p in enumerate(photo_paths):
        ph = ImageOps.exif_transpose(Image.open(p)).convert('RGB')
        if crops and crops[i]: ph = ph.crop(crops[i])
        ph = ImageOps.fit(ph, (cw, ch), Image.LANCZOS); y = gap + i * (ch + gap); img.paste(ph, (side, y))
    for y in range(18, H - 20, 46):
        for x in (26, W - 26 - 34):
            d.rounded_rectangle([x, y, x + 34, y + 26], 7, fill=(250, 246, 236, 255))
    for i in range(n):
        y = gap + i * (ch + gap)
        d.text((W - 40, y + ch * .35), f'{6 - i}A', fill=(255, 226, 190, 255)); d.polygon([(W - 46, y + ch * .7), (W - 36, y + ch * .7 - 14), (W - 26, y + ch * .7)], outline=(255, 226, 190, 255))
    a = np.ones((H, W), np.float32)
    shadowed(img).save(os.path.join(OUT, out + '.png'), optimize=True)

def edge(name, tex_name, out, w=2400, h=360, seed=8, side='top', rough=1.4, fringe=7, tint=None):
    """A wide torn sheet edge for the top (or bottom) of a section."""
    yy = np.arange(h, dtype=np.float32)[:, None] * np.ones((1, w), np.float32)
    sdf = (yy - h * .35) if side == 'top' else (h * .65 - yy)
    a, rim = torn(sdf, seed, rough=rough, fringe=fringe)
    t = tex(tex_name, w, h, seed)
    img = compose(t, a, rim * .95, rim_col=(252, 249, 240) if tex_name != 'paper_navy' else (236, 232, 245))
    img = fibres(img, a, seed, n=140)
    shadowed(img, blur=8, off=(0, 4 if side == 'top' else -4), op=.28).save(os.path.join(OUT, out + '.png'), optimize=True)

def shard(tex_name, out, w=520, h=420, seed=2, sides=6, alpha_src=None):
    """A scissor-cut swatch of fabric: a straight-edged polygon (cloth is cut, not torn)."""
    r = np.random.default_rng(seed); pts = []
    for i in range(sides):
        a = 2 * math.pi * (i + r.random() * .6) / sides; rr = .38 + r.random() * .12
        pts.append((w / 2 + math.cos(a) * w * rr * (1.25 if i % 2 else .9), h / 2 + math.sin(a) * h * rr * (.8 if i % 2 else 1.1)))
    m = Image.new('L', (w, h), 0); ImageDraw.Draw(m).polygon(pts, fill=255)
    kp = os.path.join(OUT, 'tx_' + tex_name + '.jpg')
    im = Image.open(kp if os.path.exists(kp) else os.path.join(ST, tex_name + '.png')).convert('RGBA')
    k = {'denim': 1.7, 'knit': 1.8, 'herringbone': 1.5, 'mesh': 1.3}.get(tex_name, 1.15)
    im = im.resize((int(im.width * k), int(im.height * k)), Image.LANCZOS); x0 = int(r.random() * (im.width - w)); y0 = int(r.random() * (im.height - h)); im = im.crop((x0, y0, x0 + w, y0 + h))
    a = np.array(m, np.float32) / 255 * (np.array(im.getchannel('A'), np.float32) / 255)
    # frayed: a few threads poke past the cut
    im.putalpha(Image.fromarray((a * 255).astype(np.uint8)))
    shadowed(im, blur=5, off=(2, 4), op=.3).save(os.path.join(OUT, out + '.png'), optimize=True)

def sticker(raw, out, border=10, sat=1.1, con=1.04, maxw=1100):
    """A café render cut out of paper: punchier colour, a white die-cut margin, a fine paper grain, a shadow."""
    im = Image.open(raw).convert('RGBA'); im = im.crop(im.getchannel('A').getbbox())
    im.thumbnail((maxw, maxw), Image.LANCZOS)
    rgb = ImageEnhance.Contrast(ImageEnhance.Color(im.convert('RGB')).enhance(sat)).enhance(con); a = im.getchannel('A')
    p = border * 3; W, H = im.width + 2 * p, im.height + 2 * p
    A = Image.new('L', (W, H), 0); A.paste(a, (p, p)); m = np.array(A) > 40
    cut = ndimage.distance_transform_edt(~m) <= border * 1.6; cut = ndimage.distance_transform_edt(cut) > border * .6; cut = ndimage.binary_fill_holes(cut); cut = ndimage.gaussian_filter(cut.astype(np.float32), 1.4) > .5
    base = np.zeros((H, W, 4), np.float32); base[cut] = (253, 251, 244, 255)
    g = np.random.default_rng(1).random((H, W)) * 10 - 5; base[..., :3] += g[..., None] * cut[..., None]
    img = Image.fromarray(np.clip(base, 0, 255).astype(np.uint8), 'RGBA')
    art = Image.new('RGBA', (W, H), (0, 0, 0, 0)); art.paste(rgb, (p, p), a); img.alpha_composite(art)
    edge = cut & ~ndimage.binary_erosion(cut, iterations=1); e = np.array(img); e[edge] = (205, 196, 182, 255); img = Image.fromarray(e)
    shadowed(img, blur=7, off=(3, 6), op=.3).save(os.path.join(OUT, out + '.png'), optimize=True)
