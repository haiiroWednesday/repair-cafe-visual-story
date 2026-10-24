"""Grade the studio renders into web textures: each paper keeps its lit crease relief but sits on its exact colour;
lined and grid paper get their printed rules after the light, so the rules follow the creases' shading."""
import numpy as np, os, sys
from PIL import Image
from scipy import ndimage
D = os.path.dirname(os.path.abspath(__file__)); ST = os.path.join(D, 'studio'); OUT = os.path.join(D, 'kit'); os.makedirs(OUT, exist_ok=True)
def hx(h): return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], np.float32)
GRADE = {'paper_cream': ('#EEE8D8', .05), 'paper_grey': ('#E8E4DA', .06), 'paper_navy': ('#22327A', .09), 'paper_lined': ('#F3EFE4', .04),
         'paper_grid': ('#F2EFE6', .04), 'kraft': ('#C39668', .07), 'gold': ('#C9A75A', .2)}
def grade(name):
    a = np.array(Image.open(os.path.join(ST, name + '.png')).convert('RGB'), np.float32)
    if name not in GRADE: return Image.fromarray(a.astype(np.uint8))
    col, k = GRADE[name]; L = a.mean(2); z = (L - L.mean()) / (L.std() + 1e-6)
    if name == 'gold':  # keep the metal's own hue swings, set its centre
        out = a * (hx(col) / a.reshape(-1, 3).mean(0))[None, None]
        lum = out.mean(2, keepdims=True); out = lum + (out - lum) * .72
    else:
        out = hx(col)[None, None] * (1 + k * np.tanh(z / 1.6))[..., None]
    h, w = L.shape; yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    def rules(coord, step, off, colr, alpha):
        m = (coord - off) % step; dist = np.minimum(m, step - m); line = np.clip(1.2 - dist, 0, 1)
        wob = ndimage.gaussian_filter(np.random.default_rng(5).random((h, w)).astype(np.float32), 3) * 1.6 + .2
        line *= np.clip(wob, .4, 1.1)
        return line[..., None] * alpha, hx(colr)
    shade = (1 + k * np.tanh(z / 1.6))[..., None]
    # paper grain and fibres from Paper Shaders' paperTexture, laid over the lit crumple
    PS = os.path.join(os.path.dirname(D), 'ps', 'out')
    gname = {'kraft': 'g_kraft', 'paper_grey': 'g_cream2', 'paper_grid': 'g_cream2'}.get(name, 'g_cream')
    if name == 'paper_navy':
        nv = np.array(Image.open(os.path.join(PS, 'navy.png')).convert('RGB').resize((w, h)), np.float32)
        out = nv * (1 + .35 * k * np.tanh(z / 1.6))[..., None]
    elif name != 'gold':
        g = np.array(Image.open(os.path.join(PS, gname + '.png')).convert('RGB').resize((w, h)), np.float32)
        gl = g.mean(2); ratio = gl / gl.mean()
        out = out * (1 + (ratio - 1) * (.6 if name == 'kraft' else .15))[..., None]
    if name == 'paper_lined':
        m, c = rules(yy, 40, 28, '#A8B7CC', .75); out = out * (1 - m) + c * shade * m
    if name == 'paper_grid':
        for coord in (yy, xx):
            m, c = rules(coord, 28, 6, '#9DA7B5', .55); out = out * (1 - m) + c * shade * m
    return Image.fromarray(np.clip(out, 0, 255).astype(np.uint8))
if __name__ == '__main__':
    for f in sorted(os.listdir(ST)):
        if not f.endswith('.png') or f.startswith('_'): continue
        n = f[:-4]; im = grade(n)
        if n == 'mesh': Image.open(os.path.join(ST, f)).save(os.path.join(OUT, 'tx_mesh.png'), optimize=True)
        else: im.save(os.path.join(OUT, 'tx_' + n + '.jpg'), quality=84)
        print(n)
