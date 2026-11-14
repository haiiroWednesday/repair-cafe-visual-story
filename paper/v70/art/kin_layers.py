# Cut the staged teacup renders into page layers: the saucer (with a faint outline of the cup to come), one layer per piece, the tea.
from PIL import Image, ImageChops, ImageFilter
import numpy as np, json
S='/tmp/claude-0/-home-claude/ee5cc871-c0b1-559a-a1f7-dca096f49e11/scratchpad/kin/'; D='/home/claude/mochi/repair/img/'
ims=[Image.open(S+'k%d.png'%i).convert('RGBA') for i in range(7)]
bb=ims[6].getbbox(); m=24; box=(max(0,bb[0]-m),max(0,bb[1]-m),min(ims[0].width,bb[2]+m),min(ims[0].height,bb[3]+m))
ims=[im.crop(box) for im in ims]; W,H=ims[0].size; OW=1000; OH=round(H*OW/W)
A=[np.asarray(im).astype(int) for im in ims]
for n in range(1,7): print('stage',n,'pixels that would need erasing:',int(((A[n-1][...,3]-A[n][...,3])>60).sum()))
# base: saucer + ghost of the whole cup
cup=np.clip(A[5][...,3]-A[0][...,3],0,255).astype(np.uint8); mask=Image.fromarray(cup).filter(ImageFilter.GaussianBlur(1.2)).point(lambda v:255 if v>128 else 0)
edge=ImageChops.difference(mask,mask.filter(ImageFilter.MinFilter(9)))
yy,xx=np.mgrid[0:H,0:W]; dash=(((xx+yy)//22)%2==0)
g=np.zeros((H,W,4),np.uint8); g[...,:3]=(255,250,238); g[...,3]=(np.asarray(mask)>0)*30
e=(np.asarray(edge)>0)&dash; g[e]=(110,84,56,150)
from PIL import ImageDraw
mk0=json.load(open(S+'k.json')); fw0,fh0=Image.open(S+'k6.png').size; cx=mk0['base'][0]*fw0-box[0]; cy=mk0['base'][1]*fh0-box[1]-10
ImageDraw.Draw(ims[0]).ellipse([cx-52,cy-30,cx+52,cy+22],fill=(254,253,249,255))
base=Image.alpha_composite(Image.fromarray(g),ims[0])
out={'w':OW,'h':OH}
def save(im,name): im.resize((OW,OH),Image.LANCZOS).save(D+name,'WEBP',quality=88,method=6); import os; print(name,os.path.getsize(D+name)//1024,'KB')
save(base,'wy_k0.webp')
for n in range(1,7):
    d=np.abs(A[n]-A[n-1]).max(axis=2)>10
    dm=Image.fromarray((d*255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5))
    L=np.asarray(ims[n]).copy(); L[...,3]=np.minimum(L[...,3],np.asarray(dm)); save(Image.fromarray(L),'wy_k%d.webp'%n)
mk=json.load(open(S+'k.json')); sx=900*1.0; 
# marks are fractions of the full render; convert to fractions of the crop
fw,fh=Image.open(S+'k6.png').size
out['marks']={k:[round((v[0]*fw-box[0])/W,4),round((v[1]*fh-box[1])/H,4)] for k,v in mk.items()}
json.dump(out,open(S+'layers.json','w')); print(out)
for i in range(5): Image.open(S+'sw%d.png'%i).convert('RGB').resize((390,33),Image.LANCZOS).save(D+'wy_sw%d.webp'%i,'WEBP',quality=86)
# check: stack the layers
chk=Image.new('RGBA',(OW*4,OH*2),(224,166,58,255))
for n in range(7):
    c=Image.open(D+'wy_k0.webp').convert('RGBA')
    for j in range(1,n+1): c=Image.alpha_composite(c,Image.open(D+'wy_k%d.webp'%j).convert('RGBA'))
    chk.paste(c,((n%4)*OW,(n//4)*OH),c)
chk=chk.convert('RGB'); chk.thumbnail((2000,1200)); chk.save(S+'stack.png')
