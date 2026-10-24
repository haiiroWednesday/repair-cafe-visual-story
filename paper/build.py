"""The paper edition: one long essay laid out as collage spreads on crumpled, lined, grid and navy paper.
Stills of the 3D café, cut out like paper, sit among torn kraft and gold photo frames, a film strip and cloth swatches.
All story text is placeholder for the author."""
import os, re, json, subprocess, shutil
D = os.path.dirname(os.path.abspath(__file__)); S = os.path.dirname(D); KIT = os.path.join(D, 'kit'); PUB = os.path.join(D, 'pub'); os.makedirs(PUB, exist_ok=True)
PH = lambda t: f'<span class="ph">{t}</span>'
CREDIT = 'Photo: the author, Repair Café Silicon Valley, Billy DeFrank Center, San José, October 18, 2026.'
FJS = os.path.join(S, 'sticker', 'frames.js')
def FR(kind, *args):
    js = open(FJS).read() + f'\nprocess.stdout.write(FR[{json.dumps(kind)}](...{json.dumps(args)}));'
    return subprocess.run(['node', '-e', js], capture_output=True, text=True, check=True).stdout

used = set()
def pc(src, l, t, w, r=0, z=1, m=None, alt='', cls='', link=None):
    """A collage piece. m = (left, top, width) on phones."""
    used.add(src)
    st = f'--l:{l}%;--t:{t}%;--w:{w}%;--r:{r}deg;--z:{z}' + (f';--ml:{m[0]}%;--mt:{m[1]}%;--mw:{m[2]}%' if m else '')
    tag = f'<img class="pc {cls}" src="img/{src}" alt="{alt}" style="{st}" loading="lazy" decoding="async">'
    return tag
def arrow(l, t, w, d, col, r=0, z=4, m=None, flip=False):
    st = f'--l:{l}%;--t:{t}%;--w:{w}%;--r:{r}deg;--z:{z}' + (f';--ml:{m[0]}%;--mt:{m[1]}%;--mw:{m[2]}%' if m else '')
    return (f'<svg class="pc arrow" viewBox="0 0 200 120" style="{st}{";transform:rotate(var(--r)) scaleX(-1)" if flip else ""}" aria-hidden="true">'
            f'<path d="{d}" fill="none" stroke="{col}" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round" filter="url(#mk)"/></svg>')
LOOP = 'M190 100 C150 110 110 96 98 74 C88 54 112 40 124 58 C136 78 104 96 70 82 C42 70 26 46 18 22 M18 22 L12 44 M18 22 L36 34'
SWOOSH = 'M192 30 C160 18 124 22 104 48 C90 66 74 82 30 86 M30 86 L52 72 M30 86 L50 100'

def spread(id, n, label, paper, title, paras, stage, side='right', ar='1/0.92', mar='1/1.1', subs=None, extra='', tear=0, cap=None):
    subs_html = ''
    if subs:
        subs_html = '<div class="subs">' + ''.join(f'<div class="sub"><h3>{PH(h)}</h3><p>{PH(p)}</p></div>' for h, p in subs) + '</div>'
    text = (f'<div class="txt"><div class="kick">{n} · {label}</div><h2>{PH(title)}</h2>'
            + ''.join(f'<p>{PH(p)}</p>' for p in paras) + subs_html + (f'<p class="cap">{cap}</p>' if cap else '') + '</div>')
    st = f'<div class="stage" style="--ar:{ar};--mar:{mar}">{stage}</div>'
    body = (st + text) if side == 'left' else (text + st)
    return (f'<div class="sw t{tear}"><section class="spread {paper} {side}" id="{id}" aria-labelledby="{id}-h">'
            f'<div class="rim"></div><div class="in">{body}</div>{extra}</section></div>').replace('<h2>', f'<h2 id="{id}-h">', 1)

B = []
# cover: the shoes as the feature image, the teapot café beside the title
B.append('<div class="sw t0"><header class="spread cover cream" id="top"><div class="in">'
  + f'<div class="txt"><div class="kick">A visual story · Repair Café Silicon Valley</div><h1>{PH("Headline placeholder")}</h1>'
  + f'<p class="dek">{PH("Dek placeholder: one sentence on what the reader will learn.")}</p><p class="by">{PH("By author")} · October 18, 2026 · San José</p><p><button class="nbOpen nbLink" data-page="3">Or flip through the notebook →</button></p></div>'
  + '<div class="stage" style="--ar:1/0.74;--mar:1/0.9">'
  + pc('sh_denim_0.png', 70, -10, 36, 12, 0, (66, -8, 40)) + pc('sh_gingham_pink_0.png', -8, 64, 34, -8, 0, (-8, 66, 36)) + pc('sh_knit_1.png', 84, 58, 26, -14, 0, (80, 66, 30))
  + pc('fr_feature.png', 0, 0, 100, -1.5, 2, (0, 4, 100), 'Feature photograph: a pair of white sneakers on a dark rug with a rainbow of light across them')
  + pc('st_world.png', 66, 62, 40, 3, 3, (58, 66, 44), 'The teapot café, a paper model')
  + arrow(-14, 78, 18, LOOP, '#C8461F', -8, 4, (0, 92, 20))
  + '</div></div>'
  + f'<p class="fcap">{PH("Caption placeholder for the feature photograph.")} <span>{CREDIT}</span></p></header></div>')

B.append(spread('entrance', '01', 'At the entrance', 'lined', 'Section heading placeholder',
  ['Paragraph placeholder: arriving at the door, what you see first, the check-in table.', 'Paragraph placeholder: who comes to a repair café and what they carry in.'],
  pc('sh_gingham_green_0.png', 64, -8, 34, -10, 0, (64, -6, 38)) + pc('fr_entrance.png', 0, 6, 74, -3, 2, (0, 4, 86), 'Alt text placeholder')
  + pc('st_intake.png', 60, 40, 40, 4, 3, (58, 46, 44), 'The check-in counter with its menu board and ticket rail, a paper model')
  + arrow(46, 74, 22, SWOOSH, '#23337E', 0, 4, (40, 82, 26)), side='right', tear=1,
  cap=f'{PH("Caption placeholder for the entrance photograph.")} {CREDIT}'))

B.append(spread('bench', '02', 'At the workbench', 'navy', 'Section heading placeholder',
  ['Paragraph placeholder: the repair underway, the tools on the table, what the fixer is looking for.', 'Paragraph placeholder: what was wrong, and what the fixer tried.'],
  pc('sh_mesh_0.png', 46, 52, 40, 8, 0, (44, 56, 46)) + pc('film_stereo.png', 2, -4, 40, -6, 2, (2, -2, 46), 'Three photographs from the stereo repair on a strip of film')
  + pc('st_kitchen.png', 40, 8, 58, 3, 3, (44, 18, 56), 'The electronics workbench with its pegboard of tools, a paper model'),
  side='left', ar='1/1.05', mar='1/1.2', tear=2,
  subs=[('Subhead placeholder', 'Short note placeholder about one tool or step.'), ('Subhead placeholder', 'Short note placeholder about one tool or step.')],
  cap=f'{PH("Caption placeholder for the film strip.")} {CREDIT}'))

B.append(spread('volunteer', '03', 'Beside the volunteer', 'cream', 'Section heading placeholder',
  ['Paragraph placeholder: the volunteer, in their own words from the interview.', 'Paragraph placeholder: why they keep coming back.'],
  pc('sh_knit_0.png', -4, 58, 32, -12, 0, (-6, 62, 36)) + pc('fr_volunteer.png', 6, 0, 60, 2, 2, (4, 0, 70), 'Alt text placeholder')
  + pc('st_tea.png', 54, 44, 46, -3, 3, (52, 52, 50), 'The tea table where volunteers take a break, a paper model'),
  side='right', ar='1/1.0', mar='1/1.15', tear=0,
  extra=f'<blockquote class="pull">{PH("Pull quote placeholder from the interview.")}<cite>{PH("Name, role")}</cite></blockquote>',
  cap=f'{PH("Caption placeholder for the volunteer photograph.")} {CREDIT}'))

B.append(spread('heart', '04', 'The heart clock', 'grey', 'Section heading placeholder',
  ['Paragraph placeholder: the heart clock, who brought it, and what stopped working.'],
  pc('sh_herringbone_0.png', 30, 50, 40, 14, 0, (28, 54, 46)) + pc('fr_intake.png', -2, 50, 52, -4, 2, (-2, 56, 58), 'Alt text placeholder')
  + pc('fr_heart.png', 26, -2, 50, 3, 3, (22, -2, 56), 'Alt text placeholder')
  + pc('st_appl.png', 66, 30, 36, 2, 4, (64, 36, 38), 'The appliance table with the heart clock and the brass lamp, a paper model'),
  side='left', ar='1/0.95', mar='1/1.1', tear=1,
  subs=[('Subhead placeholder', 'Paragraph placeholder: what came apart: the frame, the face, the ring, the glass, the hands.'), ('Subhead placeholder', 'Paragraph placeholder: what happened next.')],
  cap=f'{PH("Caption placeholder for the heart clock photographs.")} {CREDIT}'))

POLA = FR('polaroid', 'clock', PH('Caption placeholder for the cuckoo clock photograph.'), 'Photo: [credit].')
B.append(spread('clock', '05', 'Inside the clock', 'grid', 'Section heading placeholder',
  ['Paragraph placeholder: a line that leads to the clock on the wall.', 'Passage placeholder: the cuckoo clock story, as Jazz told it.', 'Paragraph placeholder: what the clock story says about why people repair things.'],
  pc('sh_gingham_pink_1.png', 58, -6, 38, 9, 0, (56, -4, 42)) + pc('st_keep.png', 4, 4, 40, -3, 2, (2, 6, 44), 'The cuckoo clock on its chest of drawers, a paper model')
  + f'<div class="pc polawrap" style="--l:44%;--t:8%;--w:52%;--r:4deg;--z:3;--ml:46%;--mt:10%;--mw:52%">{POLA}</div>'
  + arrow(30, 70, 24, LOOP, '#C8461F', 10, 4, (24, 76, 28), flip=True),
  side='right', ar='1/0.95', mar='1/1.05', tear=2,
  extra='<p class="recon">Reconstruction · told by Jazz about a repair at an earlier event</p>'))

B.append(spread('final', '06', 'The final object', 'navy', 'Section heading placeholder',
  ['Paragraph placeholder: the closing scene.', 'Closing paragraph placeholder: the last line of the essay.'],
  pc('sh_denim_1.png', 52, 56, 40, -10, 0, (50, 60, 44)) + pc('fr_final.png', 0, 4, 70, -2, 2, (0, 4, 80), 'Alt text placeholder')
  + pc('st_order.png', 58, 30, 40, 3, 3, (58, 40, 42), 'The pickup table with its glass cloche, a paper model'),
  side='left', ar='1/0.9', mar='1/1.05', tear=0,
  cap=f'{PH("Caption placeholder for the closing photograph.")} {CREDIT}'))

B.append('<div class="sw t1"><section class="spread grid left" id="notebook-s" aria-labelledby="nb-h"><div class="rim"></div><div class="in">'
  '<div class="stage" style="--ar:1/0.7;--mar:1/0.7"><button class="pc nbOpen nbPv" data-page="3" style="--l:0%;--t:4%;--w:100%;--r:-1.5deg;--z:2" aria-label="Open the notebook at the pop-up café">'
  '<img src="img/nb_preview.webp" alt="The notebook open on its pop-up of the café" loading="lazy"></button></div>'
  '<div class="txt"><div class="kick">Also · The notebook</div><h2 id="nb-h">Flip through the notebook</h2>'
  '<p>The same Sunday kept as a planner: photographs taped in, a pop-up of the café, a clock you can take apart, a flap to lift.</p>'
  '<p><button class="nbOpen nbBtn">Open the notebook</button></p></div></div></section></div>')
B.append(f'<footer class="end"><p>{PH("Sources and credits placeholder: interviews, photographs, data.")}</p><p>Paper models are stills of the author’s 3D café, cut out and laid on paper. Reconstructions are marked.</p></footer>')

NAV = [('entrance', 'Entrance'), ('bench', 'Workbench'), ('volunteer', 'Volunteer'), ('heart', 'Heart clock'), ('clock', 'Cuckoo clock'), ('final', 'Order up'), ('notebook-s', 'Notebook')]
page = open(os.path.join(D, 'page.html')).read()
page = page.replace('{{FONTS}}', open(os.path.join(S, 'diorama', 'fonts.css')).read()).replace('{{FRAMES}}', open(os.path.join(S, 'sticker', 'frames.css')).read())
page = page.replace('{{NAV}}', ''.join(f'<a href="#{i}">{t}</a>' for i, t in NAV)).replace('{{BODY}}', '\n'.join(B))
open(os.path.join(PUB, 'index.html'), 'w').write(page)
# copy what the page uses, as WebP; tear masks go inline so CSS masks work from any origin
from PIL import Image
import base64
os.makedirs(os.path.join(PUB, 'img'), exist_ok=True)
html = open(os.path.join(PUB, 'index.html')).read()
for j in range(3):
    for kind in ('mask', 'rim'):
        f = f'tear{j}_{kind}.png'; im = Image.open(os.path.join(KIT, f)); im = im.resize((1600, im.height * 1600 // im.width))
        import io; b = io.BytesIO(); im.save(b, 'WEBP', quality=80, lossless=kind == 'mask'); uri = 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()
        html = html.replace(f'url(img/{f})', f'url({uri})')
for f in set(used):
    im = Image.open(os.path.join(KIT, f)); im.thumbnail((1500, 1500)); im.save(os.path.join(PUB, 'img', f.replace('.png', '.webp')), quality=82, method=5)
    html = html.replace(f'img/{f}', 'img/' + f.replace('.png', '.webp'))
for t in ['tx_paper_cream', 'tx_paper_lined', 'tx_paper_navy', 'tx_paper_grey', 'tx_paper_grid']:
    im = Image.open(os.path.join(KIT, t + '.jpg')); im.save(os.path.join(PUB, 'img', t + '.jpg'), quality=80, optimize=True)
NBD = os.path.join(S, 'nb'); html = html.replace('</body>', open(os.path.join(NBD, 'part.html')).read() + '\n</body>')
for f in os.listdir(os.path.join(NBD, 'img')): shutil.copy(os.path.join(NBD, 'img', f), os.path.join(PUB, 'img', f))
open(os.path.join(PUB, 'index.html'), 'w').write(html)
strip = re.sub(r'^<!doctype html>\s*<html[^>]*>\s*<head>\s*(<meta[^>]*>\s*)*', '', html, flags=re.I)
strip = strip.replace('</head>', '', 1).replace('<body>', '', 1); strip = re.sub(r'</body>\s*</html>\s*$', '', strip)
open(os.path.join(PUB, 'page.html'), 'w').write(strip)
json.dump({'img/' + f: os.path.join(PUB, 'img', f) for f in sorted(os.listdir(os.path.join(PUB, 'img')))}, open(os.path.join(D, 'files.json'), 'w'), indent=0)
im = Image.open('/mnt/user-data/attachments/ee5cc871-c0b1-559a-a1f7-dca096f49e11/2611fe6b-image.jpg').convert('RGB'); im.thumbnail((1100, 1100)); im.save(os.path.join(PUB, 'img', 'clock.jpg'), quality=84)
print('built', os.path.getsize(os.path.join(PUB, 'index.html')) // 1024, 'KB')
