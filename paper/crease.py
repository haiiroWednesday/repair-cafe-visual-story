"""Crumpled-paper height maps. Real crumpled paper is a network of straight crease segments that die out at their ends,
with flat facets between them. Each crease here is a tent (ridge or valley) |distance to the line|, capped at a reach,
faded along its length. Long, medium and short creases are summed, then saved as 16-bit height for Blender."""
import numpy as np, math, os, sys
from PIL import Image
from scipy import ndimage
D = os.path.dirname(os.path.abspath(__file__)); O = os.path.join(D, 'maps'); os.makedirs(O, exist_ok=True)

def creases(w, h, seed, counts=(10, 260, 2600, 6500), density=1.0):
    r = np.random.default_rng(seed); H = np.zeros((h, w), np.float32)
    S = max(w, h)
    sets = [(int(counts[0] * density), (.4, .9), (.08, .14), .5),
            (int(counts[1] * density), (.08, .22), (.02, .045), .45),
            (int(counts[2] * density), (.03, .09), (.005, .011), .5),
            (int(counts[3] * density), (.015, .05), (.002, .0045), .4)]
    for n, (l0, l1), (r0, r1), amp0 in sets:
        for _ in range(n):
            L = (l0 + r.random() * (l1 - l0)) * S; R = (r0 + r.random() * (r1 - r0)) * S
            px, py = r.random() * w, r.random() * h; a = r.random() * math.pi; tx, ty = math.cos(a), math.sin(a); nx, ny = -ty, tx
            ext = int(L / 2 + R) + 2
            x0, x1, y0, y1 = max(0, int(px - ext)), min(w, int(px + ext)), max(0, int(py - ext)), min(h, int(py + ext))
            if x1 <= x0 or y1 <= y0: continue
            yy, xx = np.mgrid[y0:y1, x0:x1].astype(np.float32)
            t = (xx - px) * tx + (yy - py) * ty; d = (xx - px) * nx + (yy - py) * ny
            env = np.clip(1 - (np.abs(t) / (L / 2)) ** 2, 0, 1) ** 1.5
            tent = (R - np.minimum(np.abs(d), R)) / R            # 1 on the crease, 0 at the reach
            sign = 1 if r.random() < .5 else -1
            H[y0:y1, x0:x1] += sign * amp0 * (.6 + .8 * r.random()) * R * tent * env
    return ndimage.gaussian_filter(H, .6)

if __name__ == '__main__':
    for name, seed, dens in [('crease_a', 11, 1.0), ('crease_b', 23, 1.2), ('crease_c', 37, .8), ('crease_d', 51, 1.6)]:
        H = creases(1800, 1125, seed, density=dens)
        H = (H - H.min()) / (H.max() - H.min())
        Image.fromarray((H * 65535).astype(np.uint16)).save(f'{O}/{name}.png'); print(name)
