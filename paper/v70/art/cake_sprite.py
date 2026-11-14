# The turntable cake: 15 frames (2 degrees apart, looping every 30) in one sprite, with a little paper grain.
from PIL import Image
import numpy as np, os, json
S='/tmp/claude-0/-home-claude/ee5cc871-c0b1-559a-a1f7-dca096f49e11/scratchpad/cake/'; D='/home/claude/mochi/repair/img/'
BOX=(120,40,700,580); W,H=BOX[2]-BOX[0],BOX[3]-BOX[1]
rng=np.random.default_rng(3); grain=rng.normal(0,1,(H,W)).astype(np.float32)
sp=Image.new('RGBA',(W*5,H*3),(0,0,0,0))
for i in range(15):
    a=np.asarray(Image.open(S+'f%02d.png'%i).convert('RGBA').crop(BOX)).astype(np.float32)
    a[...,:3]=np.clip(a[...,:3]*.985+grain[...,None]*4.2-2,0,255)
    sp.paste(Image.fromarray(a.astype(np.uint8)),((i%5)*W,(i//5)*H))
sp.save(D+'ck_turn.webp','WEBP',quality=84,method=6); print(sp.size, os.path.getsize(D+'ck_turn.webp')//1024,'KB')
Image.open(S+'f00.png').crop(BOX).save(S+'frame0.png')
json.dump({'box':BOX,'job':json.load(open(S+'meta.json'))['job']},open(S+'sprite.json','w'))
