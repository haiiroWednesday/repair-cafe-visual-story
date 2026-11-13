import asyncio, json, base64, io, os
from playwright.async_api import async_playwright
from PIL import Image
import numpy as np
D='/home/claude/st3d'
job={"kind":"stereo","w":1200,"h":980,"pr":1.5,"dist":6.6,"el":0.42,"az":-2.55,"ty":0.62,"tx":-0.65,"tz":0.1,"fov":30,"closed":[0,.07,.15,.24,.30],"nf":12}
async def main():
    async with async_playwright() as pw:
        b=await pw.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        pg=await b.new_page(); errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
        await pg.goto('file://'+D+'/props.html'); await pg.wait_for_timeout(400)
        res=await pg.evaluate('j=>renderLayers(j)',job); print('errs',errs); await b.close(); return res
res=asyncio.run(main())
dec=lambda u: Image.open(io.BytesIO(base64.b64decode(u.split(',')[1]))).convert('RGBA')
L={int(k):dec(v) for k,v in res['layers'].items()}
W,H=L[0].size; print(W,H)
comp=Image.new('RGBA',(W,H),(35,51,126,255))
for n in [7,0,8,1,2,9,3,4,5,6]: comp.alpha_composite(L[n])
comp.convert('RGB').resize((W//2,H//2)).save(D+'/comp.jpg',quality=85)
json.dump({'marks':res['marks'],'lift':res['lift'],'piv':res['piv'],'head':res['head']},open(D+'/meta.json','w'))
import pickle; pickle.dump({'L':{k:np.asarray(v) for k,v in L.items()},'F':[np.asarray(dec(f)) for f in res['frames']],'S':[np.asarray(dec(f)) for f in res['strands']]},open(D+'/layers.pkl','wb'))
for n,im in L.items(): print(n, im.getbbox())
