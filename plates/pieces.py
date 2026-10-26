# every 3D and 2.5D piece made for the story, grouped by subject, as tiles for the plates page
import json, os, glob
from PIL import Image, ImageDraw
S = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
T = lambda *p: os.path.join(S, *p)
K, O, B = 'paper/kit/', 'three3d/out/', 'blend/'
G = [
 ('the café in 3D', 'three.js diorama', [
   (K+'st_world.png', 'the café, outside'), (K+'st_intake.png', 'check-in counter, menu board, ticket rail'), (K+'st_kitchen.png', 'electronics bench and pegboard'),
   (K+'st_tools.png', 'the tool wall'), (K+'st_sew.png', 'the sewing table'), (K+'st_appl.png', 'appliance table: heart clock and lamp'),
   (K+'st_tea.png', 'the tea table'), (K+'st_keep.png', 'the cuckoo clock on its chest'), (K+'st_order.png', 'the pickup table and cloche'), (K+'st_pass.png', 'the pass'),
   ('diorama/shots/st_combo.png', 'the building: trunk, orangerie, stepped glass'), ('diorama/shots/studies.jpg', 'building studies')]),
 ('pop-ups', 'three.js, for the notebook', [
   (K+'st_pu_world.png', 'pop-up: the café'), (K+'st_pu_kitchen.png', 'pop-up: the bench'), (K+'st_pu_stereo.png', 'pop-up: the stereo'), (K+'st_pu_clock.png', 'pop-up: the cuckoo clock'),
   (K+'st_pu_tea.png', 'pop-up: the tea table'), (K+'st_pu_pot.png', 'pop-up: the teapot'), (K+'st_pu_order.png', 'pop-up: the pickup')]),
 ('the sign', 'Blender', [('board/we-fixed-it-board-rainbow.png', 'We Fixed It, rainbow chalk'), ('board/we-fixed-it-board-white.png', 'We Fixed It, white chalk')]),
 ('my stereo', 'three.js', [(K+'st_stereo.png', 'stereo, layers lifted'), (K+'st_stereo2.png', 'stereo, second angle'), (O+'stereo_exploded2.png', 'stereo exploded, clean'), ('paper/raw/stereo2.png', 'stereo exploded, cable fanned'), (K+'film_stereo.png', 'film strip of the repair')]),
 ('the heart clock', 'Blender', [(B+'heart_whole.png', 'heart clock, whole'), (B+'heart2_whole.png', 'heart clock, face on'), (B+'heart_exploded.png', 'heart clock, exploded'), (B+'heart2_tray.png', 'heart clock, every piece on the table')]),
 ('the lamp', 'Blender and three.js', [(B+'candelabra_clean.png', 'brass candelabra'), (B+'candelabra_three.png', 'candelabra, three-quarter'), (O+'socket_cut3.png', 'E12 socket, cut open'), (O+'socket_cut.png', 'socket, second cut')]),
 ("jazz's cuckoo clock", 'three.js and isometric', [(O+'cuckoo_whole.png', 'the cuckoo clock'), (O+'chainwheels_off.png', 'chains off the wheels'), (O+'chainwheels_fed.png', 'fed back with a wire'), (O+'chainwheels_tied.png', 'tied for the drive home'),
   ('cf/s_idle.png', 'isometric clock, at rest'), ('cf/s_see.png', 'isometric clock, opened'), ('cf/s_tied.png', 'isometric clock, tied'), ('cf/s_run.png', 'isometric clock, running')]),
 ("jazz's talking doll", 'three.js', [(O+'pull_bent2.png', 'spring bent out of shape'), (O+'pull_fixed2.png', 'spring straightened'), (O+'pull_pulled4.png', 'cord pulled, coils tight')]),
 ('the textile table', 'three.js', [(O+'needle_front.png', 'needle, front'), (O+'needle_back.png', 'needle, back'), (O+'slider_ok2.png', 'zipper slider, healthy'), (O+'slider_spread2.png', 'zipper slider, jaws spread')]),
 ('tea things', 'three.js', [(O+'cake_640_17_v4.png', 'the cake, 17 candles'), (O+'stand_680_760_E8857B.png', 'the three-tier stand'), (O+'pot_b.png', 'the teapot'),
   (O+'cup_E8857B_96.png', 'teacup filled to 96%'), (O+'cup_8FCBB2_63.png', 'teacup filled to 63%'), (O+'cupx2_E8857B_96.png', 'tall glass, 96%'), (O+'cupx2_EFC15E_40.png', 'tall glass, 40%'),
   (O+'vase_86AEDCE8857BB79FD6.png', 'vase of flowers'), (O+'vase_E8857BEFC15EF7D3CC.png', 'vase, warm'), (O+'candle_F7D3CC.png', 'candle, rose'), (O+'candle_D2EADF.png', 'candle, mint')]),
 ('photos in frames', '2.5D collage', [(K+'fr_feature.png', 'the shoes, framed'), (K+'fr_entrance.png', 'entrance, framed'), (K+'fr_intake.png', 'intake, framed'), (K+'fr_heart.png', 'heart clock, heart frame'),
   (K+'fr_volunteer.png', 'volunteer, framed'), (K+'fr_sewing.png', 'sewing, framed'), (K+'fr_board.png', 'the board, framed'), (K+'fr_final.png', 'final, framed')]),
]
OUT = T('assets2', 'gal', 'pc'); os.makedirs(OUT, exist_ok=True)
pieces, files = [], {}
for g, kind, items in G:
    for src, name in items:
        p = T(src)
        if not os.path.exists(p): print('missing', src); continue
        im = Image.open(p)
        if im.mode in ('RGBA', 'LA', 'P'):
            im = im.convert('RGBA'); bb = im.getbbox()
            if bb: im = im.crop(bb)
        im.thumbnail((1100, 1100))
        pid = 'p_' + os.path.splitext(os.path.basename(src))[0].replace('.', '_')
        f = os.path.join(OUT, pid + '.webp'); im.save(f, 'WEBP', quality=84, method=6)
        pieces.append({'id': pid, 'group': g, 'kind': kind, 'name': name, 'w': im.width, 'h': im.height})
        files['pc/' + pid + '.webp'] = f
# the two inked libraries as sheets
for gid, pat, name in [('p_inked', 'diorama/assets/obj_*.png', '105 inked objects, one sheet'), ('p_tools', 'paper/kit/tools/*.png', 'the tools, cut out for the margins')]:
    fs = sorted(glob.glob(T(pat))); n = 12; cell = 150
    sh = Image.new('RGBA', (n * cell, ((len(fs) + n - 1) // n) * cell), (0, 0, 0, 0))
    for i, fp in enumerate(fs):
        im = Image.open(fp).convert('RGBA'); bb = im.getbbox(); im = im.crop(bb) if bb else im; im.thumbnail((cell - 14, cell - 14))
        sh.paste(im, ((i % n) * cell + (cell - im.width) // 2, (i // n) * cell + (cell - im.height) // 2), im)
    f = os.path.join(OUT, gid + '.webp'); sh.save(f, 'WEBP', quality=84, method=6)
    pieces.append({'id': gid, 'group': 'the 2D library', 'kind': 'hand-inked', 'name': f'{name} ({len(fs)})', 'w': sh.width, 'h': sh.height}); files['pc/' + gid + '.webp'] = f
json.dump(pieces, open(T('assets2', 'pieces.json'), 'w'), ensure_ascii=False, indent=0)
json.dump(files, open(T('assets2', 'gal', 'pc_files.json'), 'w'))
print(len(pieces), 'pieces', sum(os.path.getsize(v) for v in files.values()) // 1024, 'KB')
