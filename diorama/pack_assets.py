"""Standees (white die-cut border) + photos + textures -> assets.json of data URIs."""
import os, io, json, base64
from PIL import Image, ImageFilter, ImageChops
D = os.path.dirname(os.path.abspath(__file__)); S = os.path.dirname(D)
UP = '/root/.claude/uploads/ee5cc871-c0b1-559a-a1f7-dca096f49e11'; AT = '/mnt/user-data/attachments/ee5cc871-c0b1-559a-a1f7-dca096f49e11'
def uri(im, q=80, fmt='WEBP'):
    b = io.BytesIO(); im.save(b, fmt, quality=q, method=5); return f'data:image/{fmt.lower()};base64,' + base64.b64encode(b.getvalue()).decode()
def standee(path, maxw=420, border=9):
    im = Image.open(path).convert('RGBA'); bb = im.getchannel('A').point(lambda a: 255 if a > 20 else 0).getbbox(); im = im.crop(bb)
    if im.width > maxw: im = im.resize((maxw, int(im.height * maxw / im.width)), Image.LANCZOS)
    pad = border * 3; c = Image.new('RGBA', (im.width + pad * 2, im.height + pad * 2), (0, 0, 0, 0)); c.alpha_composite(im, (pad, pad))
    a = c.getchannel('A').point(lambda v: 255 if v > 30 else 0)
    cut = a.filter(ImageFilter.MaxFilter(border * 2 + 1)).filter(ImageFilter.GaussianBlur(1.2)).point(lambda v: 255 if v > 110 else 0)
    edge = cut.filter(ImageFilter.MaxFilter(3))
    out = Image.new('RGBA', c.size, (0, 0, 0, 0))
    out.paste(Image.new('RGBA', c.size, (176, 164, 150, 255)), (0, 0), edge)       # card edge
    out.paste(Image.new('RGBA', c.size, (255, 253, 248, 255)), (0, 0), cut)        # white die-cut card
    out.alpha_composite(c)
    return out
A = {'standee': {}, 'photo': {}, 'tex': {}}
for f in sorted(os.listdir(os.path.join(D, 'assets'))):
    if f.startswith('obj_'): im = standee(os.path.join(D, 'assets', f), 240); A['standee'][f[4:-4]] = [uri(im), im.width, im.height]
for k, p, mw in [('candelabra', S + '/blend/candelabra_front.png.sh.png', 560), ('heartclock', S + '/blend/heart2_whole.png', 700), ('heartX', S + '/blend/heart2_tray.png', 1000),
                 ('cake', S + '/blend/bout/cake_640_17_v4.png', 420), ('stand', S + '/blend/bout/stand_680_760_E8857B.png', 420), ('vase', S + '/blend/bout/vase_86AEDCE8857BB79FD6.png', 300), ('vase2', S + '/blend/bout/vase_E8857BEFC15EF7D3CC.png', 300), ('pot3', S + '/blend/bout/pot_b.png', 300),
                 ('needle3', S + '/three3d/out/needle_front.png', 260), ('slider3', S + '/three3d/out/slider_ok2.png', 260), ('socket3', S + '/three3d/out/socket_cut3.png', 300),
                 ('doll3', S + '/three3d/out/pull_fixed2.png', 300), ('chain3', S + '/three3d/out/chainwheels_tied.png', 300),
                 ('stereoX', S + '/three3d/out/stereo_exploded2.png', 700), ('cuckoo', S + '/three3d/out/cuckoo_whole.png', 520), ('chainOff', S + '/three3d/out/chainwheels_off.png', 360), ('chainFed', S + '/three3d/out/chainwheels_fed.png', 360), ('dollBent', S + '/three3d/out/pull_bent2.png', 320), ('sliderSpread', S + '/three3d/out/slider_spread2.png', 260), ('needleBack', S + '/three3d/out/needle_back.png', 260)]:
    im = standee(p, mw); A['standee'][k] = [uri(im), im.width, im.height]
PH = {'entrance': AT + '/995a333d-image.jpg', 'hands': AT + '/73d4a8d6-image.jpg', 'volunteer': AT + '/172dfd54-image.jpg', 'clock': AT + '/2611fe6b-image.jpg',
      'ticket': UP + '/9a689127-image.jpg', 'stereo': UP + '/e3bac917-image.jpg', 'stereotop': UP + '/ad72e534-image.jpg',
      'candelabra': UP + '/5a548b91-image.jpg', 'heart': AT + '/b4921ddc-image.jpg', 'board': AT + '/a8667bec-image.jpg', 'sewing': UP + '/b008bd08-image.jpg', 'intake': AT + '/ce2548b4-image.jpg', 'final': AT + '/e062238a-image.jpg', 'feature': AT + '/609e71e1-image.jpg', 'motor': AT + '/172dfd54-image.jpg'}
for k, p in PH.items():
    im = Image.open(p).convert('RGB'); im.thumbnail((2000, 2000) if k == 'feature' else (1100, 1100)); A['photo'][k] = [uri(im, 72), im.width, im.height]
fb = Image.open(S + '/board/we-fixed-it-board-rainbow.png').convert('RGBA'); fb.thumbnail((700, 900)); A['tex']['fixboard'] = [uri(fb, 82), fb.width, fb.height]
ht = Image.open(S + '/blend/heart2_tray.png').convert('RGBA'); ht.thumbnail((1500, 1500)); A['tex']['heartTray'] = [uri(ht, 84), ht.width, ht.height]
sl = Image.open(S + '/board/slate_white.png').convert('RGB').resize((1024, 809)); A['tex']['slate'] = uri(sl, 78)
json.dump(A, open(os.path.join(D, 'assets.json'), 'w'))
print({k: len(v) for k, v in A.items()}, os.path.getsize(os.path.join(D, 'assets.json')) // 1024, 'KB')
