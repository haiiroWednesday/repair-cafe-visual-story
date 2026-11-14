# The ceramic cup for "Why They Came": drawn in section so the layers show. Same saucer design as the glass had.
from PIL import Image, ImageDraw, ImageFilter
import numpy as np, math, random
D='/home/claude/mochi/repair/img/'; O='/tmp/claude-0/-home-claude/ee5cc871-c0b1-559a-a1f7-dca096f49e11/scratchpad/rd/'
S=2; W,H=800*S,1169*S
random.seed(4); rng=np.random.default_rng(4)
P=lambda L:[(x*S,y*S) for x,y in L]
def bez(p0,p1,p2,p3,n=40): return [((1-t)**3*p0[0]+3*(1-t)**2*t*p1[0]+3*(1-t)*t*t*p2[0]+t**3*p3[0],(1-t)**3*p0[1]+3*(1-t)**2*t*p1[1]+3*(1-t)*t*t*p2[1]+t**3*p3[1]) for t in [k/n for k in range(n+1)]]
def ell(cx,cy,rx,ry): return [(cx-rx)*S,(cy-ry)*S,(cx+rx)*S,(cy+ry)*S]
LINE=(122,106,94,255); GOLD=(212,176,108,255); WHITE=(254,253,249,255); CER=(251,247,238,255)
def saucer(im):
    d=ImageDraw.Draw(im)
    d.ellipse(ell(400,1043,392,123),fill=LINE); d.ellipse(ell(400,1038,389,121),fill=GOLD); d.ellipse(ell(400,1030,384,116),fill=WHITE)
    d.ellipse(ell(400,1022,250,62),fill=(246,243,236,255)); d.ellipse(ell(400,1026,236,56),fill=(251,249,244,255))   # the well
    for (cx,cy,rot) in ((36,1052,-62),(742,972,38),(292,1144,8),(560,1140,-10)):   # small red marks on the rim
        m=Image.new('RGBA',im.size,(0,0,0,0)); dm=ImageDraw.Draw(m); dm.ellipse(ell(cx,cy,13,5),fill=(222,96,88,235)); dm.ellipse(ell(cx,cy,7,2.4),fill=(250,214,206,255))
        m=m.rotate(rot,center=(cx*S,cy*S),resample=Image.BICUBIC); im.alpha_composite(m)
    d=ImageDraw.Draw(im)
    for _ in range(170):       # faint brush flecks, as on the original plate
        a=random.uniform(0,6.28); r=random.uniform(.3,.95); x=400+math.cos(a)*r*370; y=1030+math.sin(a)*r*108; L=random.uniform(6,16); t=random.uniform(-.5,.5)
        d.line([(x*S,y*S),((x+L*math.cos(t))*S,(y+L*math.sin(t))*S)],fill=(232,230,224,150),width=S)
TOP,BOT=566,1034
def half(side):     # outer profile, one side, top to bottom
    s=side
    return bez((400+s*188,TOP),(400+s*186,760),(400+s*176,960),(400+s*96,BOT),60)
outer=half(-1)+half(1)[::-1]
def inner_poly(t=17):
    L=bez((400-188+t,TOP+26),(400-186+t,752),(400-170+t,940),(400-92,BOT-t),60); R=bez((400+188-t,TOP+26),(400+186-t,752),(400+170-t,940),(400+92,BOT-t),60)
    return L+R[::-1]
inner=inner_poly()
IN_TOP,IN_BOT=TOP+26,BOT-17
def cup(im,full):
    d=ImageDraw.Draw(im)
    # foot
    d.rounded_rectangle([318*S,(BOT-6)*S,482*S,(BOT+20)*S],radius=9*S,fill=CER,outline=LINE,width=3*S)
    # handle (an ear on the right)
    ho=bez((572,650),(700,612),(726,820),(548,880),50); hi=bez((566,700),(650,676),(664,800),(552,838),50)
    d.polygon(P(ho+hi[::-1]),fill=CER); d.line(P(ho),fill=LINE,width=3*S); d.line(P(hi),fill=LINE,width=3*S)
    # body
    d.polygon(P(outer),fill=CER)
    if full:
        lay=Image.new('RGBA',im.size,(0,0,0,0)); dl=ImageDraw.Draw(lay)
        tot=58+66+71+340+129; k=(IN_BOT-IN_TOP)/tot; y=IN_BOT; bounds=[]
        for sc,col in ((58,(62,38,25)),(66,(106,63,39)),(71,(155,104,66)),(340,None),(129,(221,190,152))):
            y1=y-sc*k
            if col: dl.rectangle([0,y1*S,W,y*S],fill=col+(255,))
            else:
                dl.rectangle([0,y1*S,W,y*S],fill=(201,162,122,255))
                for j in range(46):          # marbled swirls
                    yy=random.uniform(y1+4,y-4); amp=random.uniform(3,9); ph=random.uniform(0,6.28); fr=random.uniform(.012,.03)
                    c=random.choice([(241,226,200,235),(241,226,200,200),(140,94,60,220),(228,200,160,220),(120,80,52,200)]); wd=random.choice([2,3,4,6])
                    dl.line([(x*S,(yy+amp*math.sin(x*fr+ph)+ .35*amp*math.sin(x*fr*2.7+ph))*S) for x in range(190,612,4)],fill=c,width=wd*S)
            bounds.append((sc,y1)); y=y1
        for sc,yb in bounds[:-1]: dl.line([(0,yb*S),(W,yb*S)],fill=(255,255,255,46),width=S)
        for _ in range(520):             # fine flecks like the old drawing
            x=random.uniform(205,595); yy=random.uniform(IN_TOP,IN_BOT); L=random.uniform(5,13); t=random.uniform(-.4,.4)
            dl.line([(x*S,yy*S),((x+L*math.cos(t))*S,(yy+L*math.sin(t))*S)],fill=(255,255,255,26),width=S)
        m=Image.new('L',im.size,0); ImageDraw.Draw(m).polygon(P(inner),fill=255); lay.putalpha(Image.composite(lay.getchannel('A'),Image.new('L',im.size,0),m)); im.alpha_composite(lay)
        cup.bounds=bounds
    else:
        d.polygon(P(inner),fill=(244,239,228,255))
        sh=Image.new('RGBA',im.size,(0,0,0,0)); ds=ImageDraw.Draw(sh); ds.polygon(P(inner),fill=(120,96,70,0))
        g=Image.new('L',im.size,0); dg=ImageDraw.Draw(g)
        for i in range(60): dg.rectangle([0,(IN_TOP+i*1.6)*S,W,(IN_TOP+(i+1)*1.6)*S],fill=int(46*(1-i/60)))
        m=Image.new('L',im.size,0); ImageDraw.Draw(m).polygon(P(inner),fill=255); g=Image.composite(g,Image.new('L',im.size,0),m)
        im.alpha_composite(Image.merge('RGBA',[Image.new('L',im.size,v) for v in (120,96,70)]+[g]))
    d=ImageDraw.Draw(im)
    d.line(P(inner)+[P(inner)[0]],fill=(122,106,94,150),width=2*S)
    d.line(P(half(-1)),fill=LINE,width=3*S); d.line(P(half(1)),fill=LINE,width=3*S)
    # rim: a gold lip, and a thin red line under it like the saucer's marks
    d.rounded_rectangle([(400-193)*S,(TOP-9)*S,(400+193)*S,(TOP+13)*S],radius=10*S,fill=GOLD,outline=LINE,width=2*S)
    for s in (-1,1):
        a=half(s)[3:8]; b=[(x+s*-17,y) for x,y in a]
        d.line(P([(a[0][0],TOP+34),(a[0][0]-s*17,TOP+34)]),fill=(222,96,88,255),width=3*S)
    # a soft highlight on the left wall and the handle
    d.line(P(bez((400-178,TOP+60),(400-177,740),(400-168,900),(400-128,990),30)),fill=(255,255,255,200),width=4*S)
    d.line(P(bez((604,664),(680,650),(694,790),(590,850),30)),fill=(255,255,255,170),width=3*S)
def spoon(im):
    d=ImageDraw.Draw(im); m=Image.new('RGBA',im.size,(0,0,0,0)); dm=ImageDraw.Draw(m)
    dm.line(P([(600,1088),(742,1056)]),fill=LINE,width=13*S); dm.line(P([(600,1088),(742,1056)]),fill=GOLD,width=9*S)
    dm.ellipse(ell(578,1092,34,17),fill=LINE); dm.ellipse(ell(578,1091,31,14.5),fill=GOLD); dm.ellipse(ell(574,1089,20,8),fill=(232,204,150,255))
    dm.ellipse(ell(745,1055,9,7),fill=LINE); dm.ellipse(ell(745,1055,6.5,4.8),fill=GOLD)
    im.alpha_composite(m)
out={}
for full in (False,True):
    im=Image.new('RGBA',(W,H),(0,0,0,0)); saucer(im)
    sh=Image.new('RGBA',(W,H),(0,0,0,0)); ImageDraw.Draw(sh).ellipse(ell(400,BOT+18,120,20),fill=(90,70,50,70)); im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(8*S)))
    spoon(im); cup(im,full)
    im=im.resize((800,1169),Image.LANCZOS); im.save(D+('wy_cup_full.webp' if full else 'wy_cup_empty.webp'),'WEBP',quality=92,method=6); out[full]=im
print('levels % from top: empty',round(IN_BOT/1169*100,2),[(s,round(y/1169*100,2)) for s,y in cup.bounds])
sh=Image.new('RGB',(1640,1169),(224,166,58)); sh.paste(out[False],(0,0),out[False]); sh.paste(out[True],(840,0),out[True]); sh.thumbnail((1200,900)); sh.save(O+'cup_pair.png')
