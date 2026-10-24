"""Pack Blender renders for the page build.
 - café props in blend/bout/ replace the same keys in three3d/props.json (+ meta)
 - hero renders listed below go to blend/assets.json with their label points"""
import json, os, io, base64, shutil, subprocess
from PIL import Image
B = os.path.dirname(os.path.abspath(__file__)); T = os.path.join(os.path.dirname(B), 'three3d')
def uri(p, q=88, maxw=None):
    im = Image.open(p).convert('RGBA')
    if maxw and im.width > maxw: im = im.resize((maxw, int(im.height * maxw / im.width)), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, 'WEBP', quality=q, method=5); return 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode(), im.size
pj, mj = os.path.join(T, 'props.json'), os.path.join(T, 'meta.json')
if not os.path.exists(pj + '.three'): shutil.copy(pj, pj + '.three'); shutil.copy(mj, mj + '.three')
P = json.load(open(pj + '.three')); M = json.load(open(mj + '.three'))
n = 0
for f in sorted(os.listdir(os.path.join(B, 'bout'))):
    if not f.endswith('.png'): continue
    k = f[:-4]; P[k], _ = uri(os.path.join(B, 'bout', f)); n += 1
    jm = os.path.join(B, 'bout', k + '.json')
    if os.path.exists(jm):
        m = json.load(open(jm))
        if m and 'teaY' in m: M[k] = {'teaY': m['teaY']}
json.dump(P, open(pj, 'w')); json.dump(M, open(mj, 'w'))
A = {}
for key, f, shadow, maxw in [('candelabra', 'candelabra_front.png', True, 900), ('candelabra3', 'candelabra_three.png', True, 800), ('heart', 'heart_whole.png', False, 900),
                              ('heartx', 'heart_exploded.png', False, 1100), ('board_white', '../board/we-fixed-it-board-white.png', False, 829), ('board_rainbow', '../board/we-fixed-it-board-rainbow.png', False, 829)]:
    p = os.path.join(B, f)
    if not os.path.exists(p): continue
    if shadow:
        subprocess.run(['python3', os.path.join(B, 'shadow.py'), p, p + '.sh.png'], check=True); p = p + '.sh.png'
    src, size = uri(p, 90, maxw)
    jm = os.path.splitext(os.path.join(B, f))[0] + '.json'
    A[key] = {'src': src, 'w': size[0], 'h': size[1], 'm': json.load(open(jm)) if os.path.exists(jm) else {}}
json.dump(A, open(os.path.join(B, 'assets.json'), 'w'))
print('café props replaced:', n, '| heroes:', list(A))
