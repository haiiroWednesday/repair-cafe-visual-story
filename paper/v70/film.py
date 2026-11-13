from PIL import Image, ImageDraw
import numpy as np, cv2
SRC='/home/claude/repair-cafe-visual-story/paper/pub/img/'; OUT='/home/claude/mochi/repair/img/'
def develop(rgb,seed):
    x=rgb.astype(np.float32)/255.
    # 1 white balance: take half of the room's colour cast out
    m=x.reshape(-1,3).mean(0); x=x*(1+.5*(m.mean()/m-1))
    # 2 tone curve: deep but open shadows, soft shoulder
    x=np.clip(x,0,1); x=x**1.06; x=x*x*(3-2*x)*.32+x*.68; x=.035+x*.94
    # 3 clarity on luminance
    l=(x*[.299,.587,.114]).sum(-1); x=x+(.08*(l-cv2.GaussianBlur(l,(0,0),30)))[...,None]
    # 4 colour mixer
    hsv=cv2.cvtColor(np.clip(x,0,1).astype(np.float32),cv2.COLOR_RGB2HSV); h,s,v=hsv[...,0],hsv[...,1],hsv[...,2]
    band=lambda c,w:np.clip(1-np.minimum(np.abs(h-c),360-np.abs(h-c))/w,0,1)
    blue,cyan,green,yel,ora,red=band(228,42),band(190,30),band(120,45),band(60,28),band(28,24),band(355,22)
    h=h+(226-h)*.55*cyan*(s>.12)+(228-h)*.25*blue                 # cyans lean to blue, blues settle on one hue
    s=s*(1+.30*blue+.22*cyan-.38*green-.2*yel+.04*ora-.2*red)
    v=v*(1-.10*blue*(1-v)+.04*ora)                                  # blues a touch deeper, skin a touch brighter
    s=np.clip(s,0,1)**.96*.94                                       # overall slightly restrained
    x=cv2.cvtColor(np.dstack([h%360,np.clip(s,0,1),np.clip(v,0,1)]).astype(np.float32),cv2.COLOR_HSV2RGB)
    # 5 split tone: dusty blue in the shadows, marigold cream in the highlights
    l=(x*[.299,.587,.114]).sum(-1,keepdims=True); sh=(1-l)**2.2; hi=l**2.4
    x=x+sh*(np.array([.18,.29,.47],np.float32)-.31)*.22+hi*(np.array([1.,.86,.60],np.float32)-.83)*.16
    # 6 halation around the blue light, vignette, grain
    hsv2=cv2.cvtColor(np.clip(x,0,1).astype(np.float32),cv2.COLOR_RGB2HSV)
    bl=np.clip(1-np.abs(hsv2[...,0]-228)/40,0,1)*np.clip((hsv2[...,2]-.5)/.5,0,1)*hsv2[...,1]
    x+=cv2.GaussianBlur(bl.astype(np.float32),(0,0),16)[...,None]*np.array([.02,.07,.18],np.float32)
    H,W=l.shape[:2]; Y,X=np.mgrid[:H,:W]; r=np.sqrt(((X-W/2)/(W/2))**2+((Y-H/2)/(H/2))**2); x*=(1-.16*np.clip(r-.55,0,1)**1.6)[...,None]
    rng=np.random.default_rng(seed); n=cv2.GaussianBlur(rng.normal(0,1,(H,W)).astype(np.float32),(0,0),.75)*1.7
    x+=n[...,None]*.03*(1-.55*l)
    return (np.clip(x,0,1)*255).astype(np.uint8)
def strip(items,out,col=(224,166,58)):
    fw,fh,gap,mx,my=440,330,22,62,30
    W=mx*2+fw; H=my*2+fh*len(items)+gap*(len(items)-1)
    im=Image.new('RGBA',(W,H),(0,0,0,0)); ImageDraw.Draw(im).rounded_rectangle((0,0,W-1,H-1),radius=14,fill=col+(255,))
    a=np.asarray(im).astype(np.float32); rng=np.random.default_rng(3)
    n=cv2.GaussianBlur(rng.normal(0,1,(H,W)).astype(np.float32),(0,0),1.2)*6+cv2.GaussianBlur(rng.normal(0,1,(H,W)).astype(np.float32),(0,0),18)*20
    a[...,:3]=np.clip(a[...,:3]+n[...,None]*(a[...,3:]>0),0,255); im=Image.fromarray(a.astype(np.uint8)); d=ImageDraw.Draw(im)
    y=18
    while y<H-44:
        for x in (15,W-15-30): d.rounded_rectangle((x,y,x+30,y+26),radius=6,fill=(0,0,0,0))
        y+=46
    for i,(f,box) in enumerate(items):
        ph=Image.open(SRC+f).convert('RGB')
        if box: ph=ph.crop(box)
        r=fw/fh; w,h=ph.size
        if w/h>r: nw=int(h*r); ph=ph.crop(((w-nw)//2,0,(w-nw)//2+nw,h))
        else: nh=int(w/r); ph=ph.crop((0,(h-nh)//2,w,(h-nh)//2+nh))
        ph=Image.fromarray(develop(np.asarray(ph.resize((fw,fh),Image.LANCZOS)),i+1))
        m=Image.new('L',(fw,fh),0); ImageDraw.Draw(m).rounded_rectangle((0,0,fw-1,fh-1),radius=7,fill=255)
        im.paste(ph,(mx,my+i*(fh+gap)),m)
    im.save(OUT+out,'WEBP',quality=90,method=6); return im
im=strip([('ph_stereo.webp',None),('ph_hands.webp',(330,60,1100,640)),('ph_stereotop.webp',(60,0,1040,735))],'film_stereo3.webp')
bg=Image.new('RGB',(im.width*2+60,im.height),(70,99,143)); bg.paste(im,(0,0),im)
# before/after of one frame for checking
b=Image.open(SRC+'ph_stereotop.webp').convert('RGB').crop((60,0,1040,735)).resize((440,330)); bg.paste(b,(im.width+60,30)); bg.paste(Image.open(SRC+'ph_hands.webp').convert('RGB').crop((330,60,1100,640)).resize((440,330)),(im.width+60,390))
bg.save('/tmp/claude-0/-home-claude/ee5cc871-c0b1-559a-a1f7-dca096f49e11/scratchpad/rd/film3.jpg',quality=90); print(im.size)
