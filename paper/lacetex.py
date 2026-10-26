"""Turn the drawn lace into lace that looks made of thread: the pattern is rasterised, its threads warped a little,
given a woven cotton texture, a raised outline cord, light from the top left, and soft shadow in the holes."""
import os, sys, asyncio, numpy as np
from PIL import Image
from scipy import ndimage
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, D)
import lace, paperkit as K
TMP = os.path.join(D, 'kit', 'lace', 'r'); os.makedirs(TMP, exist_ok=True)
OUT = os.path.join(D, 'kit', 'lace')

async def raster(jobs):
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(device_scale_factor=1)
        for svg, w, h, out in jobs:
            await pg.set_viewport_size({'width': w, 'height': h})
            await pg.set_content(f'<html><body style="margin:0;background:transparent">{svg.replace("<svg ", f"<svg style=\"display:block;width:{w}px;height:{h}px\" ", 1)}</body></html>')
            await pg.screenshot(path=out, omit_background=True)
        await b.close()

def periodic_noise(h, w, scales, seed, pad=200):
    n = K.fbm(h, w + pad, scales, seed)
    t = np.linspace(0, 1, pad)[None, :]
    out = n[:, :w].copy(); out[:, :pad] = n[:, :pad] * t + n[:, w:w + pad] * (1 - t)
    return out

def threadify(rgba, seed, periodic=False):
    a = rgba[..., 3].astype(np.float32) / 255; rgb = rgba[..., :3].astype(np.float32)
    h, w = a.shape
    N = (lambda sc, s: periodic_noise(h, w, sc, s)) if periodic else (lambda sc, s: K.fbm(h, w, sc, s))
    # warp: threads are never ruler-straight
    dx = N([(14, 1), (5, .5)], seed) * 3.2; dy = N([(14, 1), (5, .5)], seed + 1) * 3.2
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    co = [yy + dy, (xx + dx) % w if periodic else xx + dx]
    a = ndimage.map_coordinates(a, co, order=1, mode='nearest')
    rgb = np.dstack([ndimage.map_coordinates(rgb[..., i], co, order=1, mode='nearest') for i in range(3)])
    lum = rgb.mean(2); sat = rgb.max(2) - rgb.min(2)
    ribbon = (sat > 28) & (a > .5)
    cord = np.clip((236 - lum) / 50, 0, 1) * (a > .3) * (~ribbon)
    # woven cotton: a fine over-under weave with fibre noise
    weave = np.sin(xx * 2 * np.pi / 2.6 + N([(6, 1)], seed + 3) * 3) * np.sin(yy * 2 * np.pi / 2.6 + N([(6, 1)], seed + 4) * 3)
    fib = N([(2, 1), (1, .8)], seed + 5)
    H = ndimage.gaussian_filter(a, 2.0) + ndimage.gaussian_filter(cord, 1.0) * .9 + weave * .06 * a + fib * .08 * a
    gy, gx = np.gradient(H)
    nx, ny, nz = -gx * 9, -gy * 9, np.ones_like(H); L = np.sqrt(nx ** 2 + ny ** 2 + nz ** 2)
    lx, ly, lz = -.45, -.6, .66
    shade = np.clip((nx * lx + ny * ly + nz * lz) / L, 0, 1)
    ao = np.clip(1 - ndimage.gaussian_filter(a, 3.5), 0, 1) * a
    base = np.array([250, 246, 236], np.float32)
    col = base[None, None] * (1 - cord[..., None] * .07) + np.array([-2, -4, -10], np.float32) * N([(40, 1), (10, .5)], seed + 6)[..., None] * 2.5
    col = np.where(ribbon[..., None], rgb, col)
    col = col * (.8 + .3 * shade)[..., None] * (1 - .22 * ao)[..., None] * (1 + .035 * weave * a)[..., None]
    alpha = np.clip(a * (.94 + .1 * fib), 0, 1)
    alpha = np.maximum(alpha, ndimage.gaussian_filter(alpha, .7) * .9)
    return Image.fromarray(np.dstack([np.clip(col, 0, 255), alpha * 255]).astype(np.uint8), 'RGBA')

if __name__ == '__main__':
    S = 2.5; jobs = []
    # trims: sixteen tiles, each drawn with its own small differences, joined into one long strip
    TR = {'trim_pink': '#F2B8C6', 'trim_blue': '#A9C4E6', 'trim_lilac': '#CDB8E6', 'trim_gold': '#E6CF95'}
    for name, rib in TR.items():
        for k in range(16): jobs.append((lace.trim(ribbon=rib, seed=k + 3), int(120 * S), int(96 * S), os.path.join(TMP, f'{name}_{k}.png')))
    DO = {'doily_pink': '#F2B8C6', 'doily_blue': '#A9C4E6', 'doily_gold': '#E6CF95'}
    for name, t in DO.items(): jobs.append((lace.doily(tint=t), 900, 900, os.path.join(TMP, f'{name}.png')))
    jobs = [j for j in jobs if not os.path.exists(j[3])]
    if jobs: asyncio.run(raster(jobs))
    for i, name in enumerate(TR):
        strip = np.concatenate([np.array(Image.open(os.path.join(TMP, f'{name}_{k}.png')).convert('RGBA')) for k in range(16)], axis=1)
        im = threadify(strip, 300 + i, periodic=True); im.save(os.path.join(OUT, name + '.webp'), quality=88, method=6); print(name, im.size)
    for i, name in enumerate(DO):
        im = threadify(np.array(Image.open(os.path.join(TMP, f'{name}.png')).convert('RGBA')), 400 + i)
        im.save(os.path.join(OUT, name + '.webp'), quality=88, method=6); print(name, im.size)
