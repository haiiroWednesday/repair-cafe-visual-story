import json, os, sys
from PIL import Image
D = os.path.dirname(os.path.abspath(__file__))
G = os.path.join(D, 'gal'); os.makedirs(os.path.join(G, 'img'), exist_ok=True)
# [id, name, what it tells, built from, sources]
PLATES = json.load(open(os.path.join(D, 'plates.json')))
files = {}
for p in PLATES:
    src = os.path.join(D, 'out', p['id'] + '.png')
    im = Image.open(src)
    full = os.path.join(G, 'img', p['id'] + '.webp')
    im.save(full, 'WEBP', quality=86, method=6)
    p['w'], p['h'] = im.size
    files['img/' + p['id'] + '.webp'] = full
tpl = open(os.path.join(D, 'gallery.html')).read()
out = tpl.replace('/*PLATES*/[]', json.dumps(PLATES, ensure_ascii=False)).replace('/*PIECES*/[]', json.dumps(json.load(open(os.path.join(D, 'pieces.json'))), ensure_ascii=False))
open(os.path.join(G, 'page.html'), 'w').write(out)
json.dump(files, open(os.path.join(G, 'files.json'), 'w'), indent=0)
print(len(PLATES), 'plates', sum(os.path.getsize(f) for f in files.values()) // 1024, 'KB')
