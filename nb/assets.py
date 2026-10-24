"""Pieces for the notebook: pop-up standees cut from the café renders, washi tape, watercolour washes,
the planner paper, the cloth cover, and the photos sized for the pages."""
import os, sys, numpy as np
from PIL import Image, ImageEnhance, ImageFilter
from scipy import ndimage
HERE = os.path.dirname(os.path.abspath(__file__)); SP = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(SP, 'paper')); import paperkit as K
OUT = os.path.join(HERE, 'img'); os.makedirs(OUT, exist_ok=True)
AT = '/mnt/user-data/attachments/ee5cc871-c0b1-559a-a1f7-dca096f49e11/'; UP = '/root/.claude/uploads/ee5cc871-c0b1-559a-a1f7-dca096f49e11/'
what = sys.argv[1:] or ['pop', 'tape', 'wash', 'paper', 'photos']

def webp(im, name, q=82): im.save(os.path.join(OUT, name + '.webp'), quality=q, method=6)

if 'pop' in what:
    K.OUT = os.path.join(HERE, 'kit'); os.makedirs(K.OUT, exist_ok=True)
    for n, mw in [('pu_pot', 1300), ('pu_tea', 800), ('pu_kitchen', 800), ('pu_clock', 700), ('pu_order', 700)]:
        K.sticker(os.path.join(SP, 'paper', 'raw', n + '.png'), n, border=9, sat=1.3, con=1.08, maxw=mw)
        webp(Image.open(os.path.join(K.OUT, n + '.png')), n)
    for n in ['st_heart_tray']:
        pass
    print('pop')

if 'tape' in what:
    # washi tape: thin translucent paper, a printed pattern, torn short ends
    specs = [('tape_blue', (176, 196, 222), 'dots'), ('tape_pink', (239, 182, 190), 'stripe'), ('tape_kraft', (222, 200, 160), 'plain'),
             ('tape_mint', (176, 214, 196), 'grid'), ('tape_gold', (226, 198, 128), 'plain')]
    for i, (name, col, pat) in enumerate(specs):
        h, w = 110, 420
        yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
        # torn ends: distance to the left/right edges with a jagged fibre tear
        sdf = np.minimum(np.minimum(xx - 16, w - 16 - xx), np.minimum(yy - 14, h - 14 - yy) * 4)
        a, rim = K.torn(sdf, 70 + i, rough=.8, fringe=2)
        # the long edges are slit, so keep them straight
        a = a * np.clip(np.minimum(yy - 14, h - 14 - yy) + .5, 0, 1)
        rgb = np.ones((h, w, 3), np.float32) * np.array(col, np.float32)
        g = K.fbm(h, w, [(40, 1), (8, .6), (2, .5)], 90 + i)
        rgb *= (1 + g[..., None] * .07)
        if pat == 'dots':
            m = (((xx % 26) - 13) ** 2 + ((yy % 26) - 13) ** 2) < 16; rgb[m] = rgb[m] * .55 + np.array([255, 255, 255]) * .45
        if pat == 'stripe':
            m = ((xx + yy) % 30) < 9; rgb[m] = rgb[m] * .6 + np.array([255, 250, 245]) * .4
        if pat == 'grid':
            m = ((xx % 22) < 2) | ((yy % 22) < 2); rgb[m] = rgb[m] * .78 + np.array([255, 255, 255]) * .22
        alpha = a * (.80 + g * .06)
        img = np.dstack([np.clip(rgb, 0, 255), np.clip(alpha, 0, 1) * 255]).astype(np.uint8)
        Image.fromarray(img, 'RGBA').save(os.path.join(OUT, name + '.png'), optimize=True)
    print('tape')

if 'wash' in what:
    # watercolour washes: a few overlapping pools of pigment with dark dried edges, blooms and granulation
    cols = {'w_blue': (98, 120, 170), 'w_pink': (226, 132, 150), 'w_sage': (122, 158, 120), 'w_gold': (214, 172, 86),
            'w_peach': (232, 150, 112), 'w_lilac': (150, 132, 186)}
    for i, (name, col) in enumerate(cols.items()):
        h, w = 640, 900; r = np.random.default_rng(200 + i)
        yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
        dens = np.zeros((h, w), np.float32)
        for k in range(5):
            cx, cy = w * r.uniform(.28, .72), h * r.uniform(.3, .7); rx, ry = w * r.uniform(.14, .3), h * r.uniform(.14, .3)
            d = 1 - np.sqrt(((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2)
            d += K.fbm(h, w, [(160, .55), (50, .3), (14, .12)], 210 + i * 7 + k)
            pool = np.clip(d * 1.6, 0, 1) ** 1.3
            edge = np.exp(-((d - .02) / .05) ** 2) * (d > -.1)  # pigment drying at the rim
            dens = np.maximum(dens, pool * r.uniform(.2, .34)) + edge * r.uniform(.05, .1)
        gran = K.fbm(h, w, [(3, 1), (1, .7)], 230 + i)
        dens = dens * (1 + gran * .35)
        bloom = K.fbm(h, w, [(70, 1), (20, .5)], 240 + i); dens *= (1 - np.clip(bloom, 0, .5) * .5)
        dens = ndimage.gaussian_filter(dens, 2.2)
        spk = (r.random((h, w)) > .9993) & (dens > .06); spk = ndimage.binary_dilation(spk, iterations=1)
        dens = dens + spk * .35 + ndimage.gaussian_filter(dens, 26) * .5
        a = np.clip(dens, 0, .5)
        rgb = np.ones((h, w, 3), np.float32) * np.array(col, np.float32)
        rgb = rgb * (1 - np.clip(dens - .4, 0, .5)[..., None] * .35)
        img = np.dstack([rgb, a * 255]).astype(np.uint8)
        im = Image.fromarray(img, 'RGBA'); im.save(os.path.join(OUT, name + '.png'), optimize=True)
    print('wash')

if 'paper' in what:
    # planner paper: thin, smooth, warm white with Paper Shaders grain and fibres only (planner pages are never creased)
    g = np.array(Image.open(os.path.join(SP, 'ps', 'out', 'g_cream.png')).convert('L').resize((1200, 1200)), np.float32)
    ratio = g / g.mean(); base = np.array([248, 244, 233], np.float32)
    out = base[None, None] * (1 + (ratio - 1) * .22)[..., None]
    Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save(os.path.join(OUT, 'pg_paper.jpg'), quality=86)
    # cover: the herringbone graded to a deep navy bookcloth
    c = np.array(Image.open(os.path.join(SP, 'paper', 'kit', 'tx_herringbone.jpg')).convert('RGB'), np.float32)
    L = c.mean(2); z = (L - L.mean()) / (L.std() + 1e-6)
    navy = np.array([36, 44, 88], np.float32)
    out = navy[None, None] * (1 + .24 * np.tanh(z / 1.4))[..., None]
    Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save(os.path.join(OUT, 'cover_cloth.jpg'), quality=86)
    # endpaper: pink gingham
    ep = np.array(Image.open(os.path.join(SP, 'paper', 'kit', 'tx_gingham_pink.jpg')).convert('RGB'), np.float32)
    Image.fromarray((ep * .45 + np.array([246, 239, 226], np.float32) * .55).astype(np.uint8)).save(os.path.join(OUT, 'endpaper.jpg'), quality=84)
    print('paper')

if 'photos' in what:
    P = {'entrance': AT + '995a333d', 'hands': AT + '73d4a8d6', 'volunteer': AT + '172dfd54', 'stereo': UP + 'e3bac917', 'stereotop': UP + 'ad72e534',
         'heart': AT + 'b4921ddc', 'intake': AT + 'ce2548b4', 'final': AT + 'e062238a', 'feature': AT + '609e71e1', 'board': AT + 'a8667bec',
         'sewing': UP + 'b008bd08', 'candelabra': UP + '5a548b91', 'ticket': UP + '9a689127', 'clockp': AT + '2611fe6b'}
    for n, p in P.items():
        im = Image.open(p + '-image.jpg').convert('RGB'); im.thumbnail((1100, 1100), Image.LANCZOS); webp(im, 'ph_' + n, 80)
    t = Image.open(os.path.join(SP, 'blend', 'heart2_tray.png')).convert('RGBA'); t.thumbnail((1300, 1300)); webp(t, 'heart_tray', 85)
    hw = Image.open(os.path.join(SP, 'blend', 'heart2_whole.png')).convert('RGBA'); hw = hw.crop(hw.getbbox()); webp(hw, 'heart_whole', 85)
    print('photos')
