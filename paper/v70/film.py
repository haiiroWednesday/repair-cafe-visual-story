from PIL import Image, ImageDraw
import numpy as np, cv2
SRC='/home/claude/repair-cafe-visual-story/paper/pub/img/'; OUT='/home/claude/mochi/repair/img/'
def grade_blue(rgb,seed):
    x=rgb.astype(np.float32)/255.
    # gentle film curve: lifted blacks, a little mid contrast
    x=.035+x*.93; x=x+.09*(x-.5)*(1-np.abs(2*x-1))
    hsv=cv2.cvtColor(np.clip(x,0,1).astype(np.float32),cv2.COLOR_RGB2HSV)   # h 0..360
    h,s,v=hsv[...,0],hsv[...,1],hsv[...,2]
    blue=np.clip(1-np.abs(h-225)/45,0,1)**.8            # how blue a pixel is
    warm=np.clip(1-np.minimum(np.abs(h-30),360-np.abs(h-30))/50,0,1)
    s=np.clip(s*(1+.55*blue-.14*(1-blue)*(1-warm)),0,1)  # blues richer, greys and greens calmer
    v=np.clip(v*(1+.10*blue*s),0,1)
    h=np.where(blue>0,h+(228-h)*.25*blue,h)             # pull cyan-ish blues toward a deeper blue
    x=cv2.cvtColor(np.dstack([h,s,v]).astype(np.float32),cv2.COLOR_HSV2RGB)
    l=(x*[.299,.587,.114]).sum(-1,keepdims=True); nb=(1-blue)[...,None]
    x[...,0:1]+=nb*(.022*(1-l)**2+.02*l**2); x[...,2:3]-=nb*(.012*(1-l)**2+.035*l**2)   # warmth everywhere except the blues
    glow=cv2.GaussianBlur((blue*np.clip((v-.55)/.45,0,1)).astype(np.float32),(0,0),14)[...,None]
    x+=glow*np.array([.02,.06,.16],np.float32)           # the ring's light blooms a little
    rng=np.random.default_rng(seed); n=cv2.GaussianBlur(rng.normal(0,1,rgb.shape[:2]).astype(np.float32),(0,0),.7)*1.6
    x+=n[...,None]*.024*(1-.5*l)
    return (np.clip(x,0,1)*255).astype(np.uint8)
def strip(files,out,col=(224,166,58),hole=(70,97,143,0)):
    fw,fh,gap,mx,my=560,420,26,34,74
    W=mx*2+fw*len(files)+gap*(len(files)-1); H=my*2+fh
    im=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(im)
    d.rounded_rectangle((0,0,W-1,H-1),radius=16,fill=col+(255,))
    # paper-ish mottling on the strip
    a=np.asarray(im).astype(np.float32); rng=np.random.default_rng(3)
    n=cv2.GaussianBlur(rng.normal(0,1,(H,W)).astype(np.float32),(0,0),1.2)*7+cv2.GaussianBlur(rng.normal(0,1,(H,W)).astype(np.float32),(0,0),18)*22
    a[...,:3]=np.clip(a[...,:3]+n[...,None],0,255); im=Image.fromarray(a.astype(np.uint8)); d=ImageDraw.Draw(im)
    x=22
    while x<W-50:
        for y in (20,H-20-34): d.rounded_rectangle((x,y,x+30,y+34),radius=6,fill=(0,0,0,0))
        x+=58
    for i,f in enumerate(files):
        ph=Image.open(SRC+f).convert('RGB'); r=fw/fh; w,h=ph.size
        if w/h>r: nw=int(h*r); ph=ph.crop(((w-nw)//2,0,(w-nw)//2+nw,h))
        else: nh=int(w/r); ph=ph.crop((0,(h-nh)//2,w,(h-nh)//2+nh))
        ph=Image.fromarray(grade_blue(np.asarray(ph.resize((fw,fh),Image.LANCZOS)),i+1))
        m=Image.new('L',(fw,fh),0); ImageDraw.Draw(m).rounded_rectangle((0,0,fw-1,fh-1),radius=8,fill=255)
        im.paste(ph,(mx+i*(fw+gap),my),m)
    im.save(OUT+out,'WEBP',quality=88,method=6); return im
im=strip(['ph_stereo.webp','ph_hands.webp','ph_stereotop.webp'],'film_stereo3.webp')
bg=Image.new('RGB',im.size,(70,99,143)); bg.paste(im,(0,0),im); bg.thumbnail((1800,600)); bg.save('/tmp/claude-0/-home-claude/ee5cc871-c0b1-559a-a1f7-dca096f49e11/scratchpad/rd/film3.jpg',quality=88); print(im.size)
