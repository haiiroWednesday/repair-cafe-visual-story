# one film look for every photograph: faded blacks, warm split tone, soft halation, fine grain
from PIL import Image
import numpy as np, cv2, sys
def grade(rgb, seed=1, sat=.84):
    x=rgb.astype(np.float32)/255.
    lum=(x*[.299,.587,.114]).sum(-1,keepdims=True)
    x=lum+(x-lum)*sat
    x=.05+x*.9                                   # fade: lifted blacks, eased whites
    x=x+.06*(x-.5)*(1-np.abs(2*x-1))             # a little mid contrast back
    l=(x*[.299,.587,.114]).sum(-1,keepdims=True); sh=(1-l)**2; hi=l**2
    x[...,0:1]+= .046*sh+.030*hi; x[...,1:2]+= .012*sh+.014*hi; x[...,2:3]-= .026*sh+.062*hi   # warm shadows, cream highlights
    hl=np.clip((l-.72)/.28,0,1); glow=cv2.GaussianBlur(hl,(0,0),max(6,rgb.shape[1]/90))[...,None] if hl.ndim==2 else cv2.GaussianBlur(hl[...,0],(0,0),max(6,rgb.shape[1]/90))[...,None]
    x+=glow*np.array([.07,.035,.0],np.float32)   # halation
    rng=np.random.default_rng(seed); n=rng.normal(0,1,rgb.shape[:2]).astype(np.float32); n=cv2.GaussianBlur(n,(0,0),.7)*1.6
    x+=n[...,None]*.028*(1-.5*l)                 # grain, stronger in the shadows
    return (np.clip(x,0,1)*255).astype(np.uint8)
if __name__=='__main__':
    tiles=[]
    for k,f in enumerate(['fr_feature','fr_group','fr_bench','fr_stitch','fr_volunteer','fr_heart']):
        im=Image.open(f'img/{f}.webp').convert('RGBA'); a=np.asarray(im).copy()
        a[...,:3]=grade(a[...,:3],k+1,sat=.92 if f=='fr_feature' else .84)
        Image.fromarray(a).save(f'img/g_{f}.webp','WEBP',quality=88,method=6)
        bg=Image.new('RGB',im.size,(243,236,221)); bg.paste(Image.fromarray(a),(0,0),Image.fromarray(a)); bg.thumbnail((640,470)); tiles.append(bg)
    im=Image.open('img/clock.jpg').convert('RGB'); a=grade(np.asarray(im),9); Image.fromarray(a).save('img/g_clock.jpg',quality=88); t=Image.fromarray(a); t.thumbnail((640,470)); tiles.append(t)
    sh=Image.new('RGB',(1960,960),(243,236,221)); x=y=0
    for t in tiles:
        if x+t.width>1960: x=0;y+=480
        sh.paste(t,(x,y)); x+=t.width+8
    sh.save(sys.argv[1],quality=88)
