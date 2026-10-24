"""Colour + height maps at thread scale for the café textiles. Blender lights them (texstudio.py);
these only say where the threads are and what colour they are."""
import numpy as np, os
from PIL import Image
from scipy import ndimage
D = os.path.dirname(os.path.abspath(__file__)); O = os.path.join(D, 'maps'); os.makedirs(O, exist_ok=True)
N = 1400; yy, xx = np.mgrid[0:N, 0:N].astype(float); rng = np.random.default_rng(3)
def hx(h): return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], float)
def noise(scale, seed):
    r = np.random.default_rng(seed); g = r.random((N // scale + 3, N // scale + 3)); return ndimage.zoom(g, scale, order=3)[:N, :N]
def save(col, h, name, alpha=None):
    Image.fromarray(np.clip(col, 0, 255).astype(np.uint8)).save(f'{O}/{name}_col.png')
    h = (h - h.min()) / (h.max() - h.min() + 1e-9); Image.fromarray((h * 65535).astype(np.uint16)).save(f'{O}/{name}_h.png')
    if alpha is not None: Image.fromarray((np.clip(alpha, 0, 1) * 255).astype(np.uint8)).save(f'{O}/{name}_a.png')

T = 7.0  # thread pitch in px
# plain weave height: over/under alternation along each thread
wx = np.sin(np.pi * xx / T) ** 2; wy = np.sin(np.pi * yy / T) ** 2
cellx = (xx // T).astype(int); celly = (yy // T).astype(int); over = ((cellx + celly) % 2 == 0)
plain = np.where(over, wx * .6 + .4 * np.sin(np.pi * ((yy % T) / T)), wy * .6 + .4 * np.sin(np.pi * ((xx % T) / T)))
slub = noise(40, 1) * .25 + noise(6, 2) * .15

# gingham: dyed warp and weft bands; where both are dyed the square is darkest
def gingham(c_mid, c_dark, name, band=34):
    bx = ((xx // band) % 2 == 1).astype(float); by = ((yy // band) % 2 == 1).astype(float)
    m = bx + by; white = hx('#FBF8F1')
    col = np.where((m == 0)[..., None], white, np.where((m == 1)[..., None], hx(c_mid), hx(c_dark)))
    # threads of the other colour show through the weave
    col = col * (1 - .08 * (1 - plain)[..., None]) * (1 + .05 * (noise(3, 9)[..., None] - .5))
    save(col, plain + slub, name)
gingham('#F1B3C1', '#D9758F', 'gingham_pink'); gingham('#A7D3B2', '#3E9562', 'gingham_green')

# denim: 3/1 twill, indigo warp over white weft, diagonal wale
tw = ((xx + yy) / (T * .9)) % 4; twill = np.clip(np.sin(np.pi * tw / 4) ** 2, 0, 1)
warp = ndimage.zoom(rng.random((1, N // 4 + 2)), (N, 4), order=1)[:N, :N]
indigo = .55 + .35 * warp + .25 * (noise(90, 4) - .5)
den = hx('#22406F')[None, None] * (1.4 - indigo[..., None] * .6) * (.82 + .3 * twill[..., None])
weft = (twill < .18) & (rng.random((N, N)) > .55)
den = np.where(weft[..., None], hx('#C9D6E6'), den)
save(den, twill * .7 + slub + .3 * warp, 'denim')

# knit: rows of V-shaped stitches (two leaning loops each)
P, R = 22.0, 26.0
u = (xx % P) / P; v = (yy % R) / R
leg = np.where(u < .5, np.exp(-((u - .25 - (v - .5) * .2) / .17) ** 2), np.exp(-((u - .75 + (v - .5) * .2) / .17) ** 2))
leg *= np.sin(np.pi * v) ** .6
knitc = hx('#9FC3DF')[None, None] * (.78 + .3 * leg[..., None]) * (1 + .06 * (noise(4, 12)[..., None] - .5))
save(knitc, leg + .15 * noise(3, 13), 'knit')

# herringbone tweed: columns of twill that flip direction
colm = ((xx // 30) % 2 == 0)
ang = np.where(colm, xx + yy, xx - yy); hb = np.sin(np.pi * (ang / (T * 1.1)) % np.pi) ** 2
mott = noise(30, 21)
hbc = np.where((hb > .5)[..., None], hx('#A9BFD9'), hx('#2C4C7C')) * (1 + .12 * (mott[..., None] - .5)) * (1 + .06 * (noise(2, 22)[..., None] - .5))
save(hbc, hb + .2 * slub, 'herringbone')

# open weave (scrim): fat loose threads with holes between
per, th = 30.0, 8.5
dx = np.abs(((xx + 3 * np.sin(yy * .02)) % per) - per / 2); dy = np.abs(((yy + 3 * np.sin(xx * .021)) % per) - per / 2)
tx = np.clip(1 - (dx - th / 2) / 1.5, 0, 1); ty = np.clip(1 - (dy - th / 2) / 1.5, 0, 1)
a = np.clip(tx + ty, 0, 1)
meshc = hx('#6F90B8')[None, None] * (1 + .25 * (noise(5, 31)[..., None] - .5))
save(meshc, np.maximum(tx * np.cos(np.pi * (yy % 6) / 6) ** 2, ty * np.cos(np.pi * (xx % 6) / 6) ** 2) + .2 * a, 'mesh', alpha=a)
print(sorted(os.listdir(O)))
