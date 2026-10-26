"""Torn edges for the seams between sheets: long, slow waves instead of a ruled line, a narrower and softer white core."""
import os, numpy as np, math
from PIL import Image
import paperkit as K
def line_wave(r, w):
    x = np.arange(w, dtype=np.float32); wave = np.zeros(w, np.float32)
    for per, amp in [(r.uniform(1300, 2200), 30), (r.uniform(600, 900), 16), (r.uniform(260, 380), 7)]:
        wave += amp * np.sin(2 * math.pi * x / per + r.uniform(0, 6.3))
    return wave
def line_diag(r, w, h, rise):
    x = np.arange(w, dtype=np.float32) / w; s = x * x * (3 - 2 * x)
    s = s if rise else 1 - s
    return (h * .8 - h * .6 * s) - h * .52 + line_wave(r, w) * .5
JOBS = [(f'tw{j}', seed, 220, None) for j, seed in enumerate([71, 83, 97, 113, 127, 139])] + [('td0', 131, 380, True), ('td1', 149, 380, False), ('td0b', 157, 380, True), ('td1b', 163, 380, False)]
for name, seed, h, rise in JOBS:
    w = 2400
    r = np.random.default_rng(seed)
    wave = line_wave(r, w) if rise is None else line_diag(r, w, h, rise)
    yy = np.arange(h, dtype=np.float32)[:, None] * np.ones((1, w), np.float32)
    sdf = yy - (h * .52 + wave[None, :])
    f = sdf + K.fbm(h, w, [(260, 1.3), (90, .9), (28, .55), (9, .4), (3, .28), (1, .16)], seed) * 34 * .85
    a = np.clip(f + .5, 0, 1)
    wv = 4.2 * (.45 + 1.5 * np.clip(K.fbm(h, w, [(80, 1), (20, .6), (4, .4)], seed + 7) + .5, 0, 1))
    rim = np.clip(1 - (f - .5) / wv, 0, 1) * a
    rim = rim * np.clip(.75 + K.fbm(h, w, [(3, 1), (1, .8)], seed + 9) * 1.2, 0, 1)
    Image.fromarray(np.dstack([np.zeros((h, w, 3)), a * 255]).astype(np.uint8), 'RGBA').save(os.path.join(K.OUT, f'{name}_mask.png'), optimize=True)
    rim = rim * .9
    img = Image.fromarray(np.dstack([np.full((h, w), 247), np.full((h, w), 243), np.full((h, w), 232), rim * 255]).astype(np.uint8), 'RGBA')
    img = K.fibres(img, a, seed, n=70, col=(247, 243, 232)); q = np.array(img); q[h - 10:, :, 3] = 0; q[:, :6, 3] = 0; q[:, w - 6:, 3] = 0; q[:, :, 3] = (q[:, :, 3] * (yy < h * .52 + wave[None, :] + 40)).astype(np.uint8); img = Image.fromarray(q); img.save(os.path.join(K.OUT, f'{name}_rim.png'), optimize=True)
print('seams')
