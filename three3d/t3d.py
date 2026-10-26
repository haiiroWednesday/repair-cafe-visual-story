import json, sys, subprocess, os
from PIL import Image
D = os.path.dirname(os.path.abspath(__file__)); O = os.path.join(D, 't3d')
jobs = json.loads(sys.argv[1])
json.dump(jobs, open(os.path.join(D, 'tjobs.json'), 'w'))
subprocess.run(['python3', os.path.join(D, 'render.py'), os.path.join(D, 'tjobs.json'), O], check=True)
# composite on porcelain for viewing
for k in jobs:
    im = Image.open(os.path.join(O, k + '.png')).convert('RGBA')
    bg = Image.new('RGBA', im.size, (250, 244, 236, 255)); bg.alpha_composite(im)
    bg.convert('RGB').save(os.path.join(O, k + '_v.jpg'), quality=85)
    print(k, open(os.path.join(O, k + '.json')).read()[:400])
