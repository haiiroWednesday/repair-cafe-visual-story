"""Cut every collage piece for the paper edition: torn photo frames, the film strip, fabric swatches,
café stickers from the 3D renders, and the torn-edge masks for the spreads."""
import os, sys, numpy as np
from PIL import Image
import paperkit as K
AT = '/mnt/user-data/attachments/ee5cc871-c0b1-559a-a1f7-dca096f49e11'; UP = '/root/.claude/uploads/ee5cc871-c0b1-559a-a1f7-dca096f49e11'
P = {'entrance': AT + '/995a333d-image.jpg', 'hands': AT + '/73d4a8d6-image.jpg', 'volunteer': AT + '/172dfd54-image.jpg', 'clock': AT + '/2611fe6b-image.jpg',
     'stereo': UP + '/e3bac917-image.jpg', 'stereotop': UP + '/ad72e534-image.jpg', 'heart': AT + '/b4921ddc-image.jpg', 'intake': AT + '/ce2548b4-image.jpg',
     'final': AT + '/e062238a-image.jpg', 'feature': AT + '/609e71e1-image.jpg', 'board': AT + '/a8667bec-image.jpg', 'sewing': UP + '/b008bd08-image.jpg',
     'candelabra': UP + '/5a548b91-image.jpg', 'ticket': UP + '/9a689127-image.jpg'}
what = sys.argv[1:] or ['frames', 'film', 'shards', 'stickers', 'tears']
if 'frames' in what:
    K.frame(P['feature'], 'fr_feature', 'kraft', border=120, seed=11, maxw=1500)
    K.frame(P['entrance'], 'fr_entrance', 'kraft', border=92, seed=12, maxw=980)
    K.frame(P['volunteer'], 'fr_volunteer', 'kraft', border=78, seed=13, maxw=900)
    K.frame(P['heart'], 'fr_heart', 'kraft', border=78, shape='heart', seed=14, maxw=900)
    K.frame(P['intake'], 'fr_intake', 'gold', border=84, seed=15, maxw=900)
    K.frame(P['final'], 'fr_final', 'gold', border=96, seed=16, maxw=1100)
    K.frame(P['board'], 'fr_board', 'kraft', border=70, seed=17, maxw=760)
    K.frame(P['sewing'], 'fr_sewing', 'gold', border=64, seed=18, maxw=700)
    print('frames')
if 'film' in what:
    K.film([P['stereo'], P['stereotop'], P['hands']], 'film_stereo', seed=4); print('film')
if 'shards' in what:
    for i, t in enumerate(['gingham_pink', 'gingham_green', 'denim', 'knit', 'herringbone', 'mesh']):
        for j in range(2): K.shard(t, f'sh_{t}_{j}', w=560, h=460, seed=20 + i * 3 + j, sides=5 + (i + j) % 3)
    print('shards')
if 'stickers' in what:
    for n in os.listdir(os.path.join(K.D, 'raw')):
        if n.endswith('.png'): K.sticker(os.path.join(K.D, 'raw', n), 'st_' + n[:-4])
    print('stickers')
if 'tears' in what:
    # masks for the torn top edge of each spread (alpha only) and a rim overlay (white core + fibres)
    for j, seed in enumerate([31, 47, 59]):
        h, w = 120, 2400
        yy = np.arange(h, dtype=np.float32)[:, None] * np.ones((1, w), np.float32)
        a, rim = K.torn(yy - h * .45, seed, rough=1.5, fringe=8)
        Image.fromarray((a * 255).astype(np.uint8)).save(os.path.join(K.OUT, f'tear{j}_mask.png'), optimize=True)
        r = Image.fromarray(np.dstack([np.full((h, w), 251), np.full((h, w), 248), np.full((h, w), 239), rim * 255]).astype(np.uint8), 'RGBA')
        r = K.fibres(r, a, seed, n=180); r.save(os.path.join(K.OUT, f'tear{j}_rim.png'), optimize=True)
    print('tears')
