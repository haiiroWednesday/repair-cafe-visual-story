import json, os, subprocess, base64, io, sys
from PIL import Image
D=os.path.dirname(os.path.abspath(__file__)); C=os.path.join(os.path.dirname(D),'cafe')
need=json.load(open(os.path.join(C,'need3d.json')))
pj=os.path.join(D,'props.json'); have=json.load(open(pj)) if os.path.exists(pj) else {}
force='--all' in sys.argv
mj=os.path.join(D,'meta.json'); meta=json.load(open(mj)) if os.path.exists(mj) else {}
todo={k:v for k,v in need.items() if force or k not in have}
json.dump(todo,open(os.path.join(D,'todo.json'),'w'))
if todo: subprocess.run(['python3',os.path.join(D,'render.py'),os.path.join(D,'todo.json'),os.path.join(D,'out')],check=True)
for k in todo:
    im=Image.open(os.path.join(D,'out',k+'.png')); b=io.BytesIO(); im.save(b,'WEBP',quality=88,method=5)
    have[k]='data:image/webp;base64,'+base64.b64encode(b.getvalue()).decode()
    m=json.load(open(os.path.join(D,'out',k+'.json')))
    if m: meta[k]=m
json.dump(have,open(pj,'w')); json.dump(meta,open(mj,'w')); print(len(have),'props', sum(len(v) for v in have.values())//1024,'KB')
