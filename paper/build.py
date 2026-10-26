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
    v3 = {'st_world.png': 'entrance', 'st_kitchen.png': 'bench', 'st_stereo.png': 'bench', 'st_tea.png': 'volunteer', 'st_appl.png': 'heart', 'st_keep.png': 'clock', 'st_order.png': 'final'}.get(src)
    if v3: cls += ' c3dOpen'; alt += ' (opens the 3D café here)'
    tag = f'<img class="pc {cls}" src="img/{src}" alt="{alt}"{f' data-view="{v3}"' if v3 else ''} style="{st}" loading="lazy" decoding="async">'
    return tag
def doily(name, l, t, w, r=0, m=None):
    SEAM_IMG.add('lace/' + name + '.webp')
    st = f'--l:{l}%;--t:{t}%;--w:{w}%;--r:{r}deg;--z:0' + (f';--ml:{m[0]}%;--mt:{m[1]}%;--mw:{m[2]}%' if m else '')
    return f'<img class="pc doily" src="img/{name}.webp" alt="" style="{st}" loading="lazy">'
def arrow(l, t, w, d, col, r=0, z=4, m=None, flip=False):
    st = f'--l:{l}%;--t:{t}%;--w:{w}%;--r:{r}deg;--z:{z}' + (f';--ml:{m[0]}%;--mt:{m[1]}%;--mw:{m[2]}%' if m else '')
    return (f'<svg class="pc arrow" viewBox="0 0 200 120" style="{st}{";transform:rotate(var(--r)) scaleX(-1)" if flip else ""}" aria-hidden="true">'
            f'<path d="{d}" fill="none" stroke="{col}" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round" filter="url(#mk)"/></svg>')
LOOP = 'M190 100 C150 110 110 96 98 74 C88 54 112 40 124 58 C136 78 104 96 70 82 C42 70 26 46 18 22 M18 22 L12 44 M18 22 L36 34'
SWOOSH = 'M192 30 C160 18 124 22 104 48 C90 66 74 82 30 86 M30 86 L52 72 M30 86 L50 100'

SEAMS = {
  'entrance': dict(mask='tw0', tissue='#F3C9D2', tm2='tw4', lace='trim_pink', ly=.24, lr=-1.4, lx=(-2, 64)),
  'bench': dict(mask='td0', tissue='#D9CDEB', tm2='td0b', diag=True, orn=('doily_blue', 74, 6, 'clamp(150px,19vw,290px)', 8)),
  'volunteer': dict(mask='tw2', lace='trim_blue', ly=.2, lr=1.1, lx=(38, 64)),
  'heart': dict(mask='td1', tissue='#F3C9D2', tm2='td1b', diag=True, orn=('doily_pink', 3, 4, 'clamp(140px,17vw,260px)', -6)),
  'clock': dict(mask='tw3', tissue='#CFE6DA', tm2='tw5', lace='trim_gold', ly=.24, lr=-.9, lx=(-2, 58)),
  'final': dict(mask='tw1', tissue='#E7D3EE', tm2='tw4', lace='trim_lilac', ly=.2, lr=1.3, lx=(46, 56)),
  'cafe3d-s': dict(mask='td0', diag=True, tissue='#F6E3B8', tm2='td0b', orn=('doily_gold', 80, 2, 'clamp(140px,16vw,250px)', 12)),
  'notebook-s': dict(mask='tw2', lace='trim_pink', ly=.22, lr=-1, lx=(-2, 70), tissue='#D8E4F2', tm2='tw5'),
  'end': dict(mask='tw0', lace='trim_blue', ly=.22, lr=.8, lx=(30, 72)),
}
SEAM_IMG = set()
def seam(id):
    c = SEAMS[id]; m = c['mask']; SEAM_IMG.update([m + '_mask.png', m + '_rim.png'])
    st = f'--tm:url(img/{m}_mask.png);--tr:url(img/{m}_rim.png)'
    inner = ''
    if c.get('tissue'):
        SEAM_IMG.add(c['tm2'] + '_mask.png'); st += f';--tm2:url(img/{c["tm2"]}_mask.png);--tc:{c["tissue"]}'; inner += '<div class="tissue"></div>'
    if c.get('lace'):
        SEAM_IMG.add('lace/' + c['lace'] + '.webp'); lx = c.get('lx', (-1, 102)); inner += f'<div class="lace" style="--lace:url(img/{c["lace"]}.webp);--ly:{c.get("ly", .24)};--lr:{c.get("lr", -.5)}deg;left:{lx[0]}%;width:{lx[1]}%;right:auto"></div>'
    if c.get('orn'):
        o, l, t, w, rot = c['orn']; SEAM_IMG.add('lace/' + o + '.webp'); inner += f'<img class="orn" src="img/{o}.webp" alt="" style="--l:{l}%;--t:{t}%;--w:{w};--r:{rot}deg">'
    cls = 'sw diag' if c.get('diag') else 'sw'
    return cls, st, f'<div class="seam" aria-hidden="true">{inner}</div>'


TOOLS_USED = set()
def toolroll(title, items, paper='cream', lace='trim_pink'):
    """The tools laid out on a lace-edged placemat, each drawn in the first graphics' hand, each with a tag."""
    SEAM_IMG.add('lace/' + lace + '.webp')
    out = ''
    for k, it in enumerate(items):
        ids, name, note, w = it
        TOOLS_USED.update(ids)
        imgs = ''.join(f'<img src="img/t_{i}.webp" alt="" style="--i:{j}">' for j, i in enumerate(ids))
        rot = [-4, 3, -2, 5, -3, 2, -5, 4][k % 8]
        out += (f'<figure class="tl" style="--h:{w}px;--r:{rot}deg"><div class="tlimg">{imgs}</div>'
                f'<figcaption>{name}{f"<small>{note}</small>" if note else ""}</figcaption></figure>')
    return (f'<div class="toolroll {paper}" style="--lace:url(img/{lace}.webp)"><div class="trk">{title}</div>'
            f'<div class="tritems" role="list">{out}</div></div>')

def tool(name, l, t, w, r=0, m=None):
    TOOLS_USED.add(name)
    st = f'--l:{l}%;--t:{t}%;--w:{w}%;--r:{r}deg;--z:5' + (f';--ml:{m[0]}%;--mt:{m[1]}%;--mw:{m[2]}%' if m else '')
    return f'<img class="pc deco" src="img/t_{name}.webp" alt="" style="{st}" loading="lazy" decoding="async">'
DECO = {
  'entrance': [('tester', -4, 84, 11, -14), ('plug', 92, 62, 8, 18)],
  'bench': [('pliers', 86, 76, 12, 24), ('iron', 52, 88, 15, -8), ('meter', -5, 44, 9, -10)],
  'volunteer': [('tomato', 86, -4, 11, 8), ('spools', -6, 84, 13, -6), ('scissors', 68, 90, 12, 20)],
  'heart': [('magnifier', -2, 72, 12, -12), ('tweezers', 40, 90, 10, 30), ('drivers', 88, 6, 11, 10)],
  'clock': [('lube', 92, 70, 7, 10), ('wool', -4, 86, 10, -6)],
  'final': [('buttons', 86, 82, 10, 8), ('tin', -2, 86, 11, -4), ('needles', 40, -6, 8, -20)],
}
def deco(id): return ''.join(tool(n, l, t, w, r, (l, t, w * 1.3)) for n, l, t, w, r in DECO.get(id, [])) + xtags(id)
# free explore mode: optional tags on the things in the pictures. Each opens a plate that is not part of the essay text.
XP_PLATES = {
  'menu': ('today\'s menu', 'what came to the tables on Sunday'),
  'battery': ('the needle gets a vote', 'the battery tester from bin D3'),
  'pantry': ('the pantry', 'where every spare part lives'),
  'glue': ('glue steeps like tea', 'ten glues, set and cure'),
  'needle': ('the needle is the cheap part', 'sewing needles, size by size'),
  'zipper': ('most broken zippers are fine', 'the slider, and three fixes'),
  'textile': ('the textile table', 'the needle and the zipper'),
  'jazz': ('two repairs Jazz remembers', 'the cuckoo clock and the doll'),
  'heart': ('every piece on the table', 'the heart clock, part by part'),
  'lamp': ('a lamp is five parts in a row', 'the brass candelabra'),
}
XP = {
  'entrance': [('menu', 70, 40, 3), ('battery', -2, 76, -4)],
  'bench': [('pantry', 62, 4, -3), ('glue', 50, 80, 4)],
  'volunteer': [('textile', 78, 6, 3)],
  'clock': [('jazz', 6, 70, -3)],
  'heart': [('heart', 34, 8, -3), ('lamp', 70, 30, 4)],
}
XP_USED = set()
def xtags(id):
    out = ''
    for k, l, t, r in XP.get(id, []):
        XP_USED.add(k); name, sub = XP_PLATES[k]
        out += (f'<button class="xtag" data-x="{k}" data-name="{name}" style="--l:{l}%;--t:{t}%;--r:{r}deg" aria-label="Explore: {name}, {sub}">'
                f'<span class="xk">explore</span><span class="xn">{sub}</span></button>')
    return out
# plates: information graphics laid between the spreads
PL_USED = []
PL_SEAMS = ['tw1', 'tw2', 'tw3', 'tw0', 'tw5', 'tw4']
def plate_band(pid, name, paper='cream', lace='trim_gold'):
    PL_USED.append(pid); k = len(PL_USED)
    SEAMS['pl-' + pid] = dict(mask=PL_SEAMS[k % len(PL_SEAMS)], lace=lace, ly=.22, lr=(-1) ** k * .9, lx=(-2, 104))
    cls, sst, sh = seam('pl-' + pid)
    return (f'<div class="{cls}" style="{sst}">{sh}<section class="spread {paper} plband" id="pl-{pid}" aria-label="Plate: {name}"><div class="rim"></div>'
            f'<figure class="plfig"><div class="kick">plate · {name}</div>'
            f'<button class="plbtn" data-pl="{pid}" data-name="{name}" aria-label="Open the plate {name} full size"><img class="plimg" src="img/pl_{pid}.webp" alt="Information plate: {name}" loading="lazy" decoding="async"></button>'
            f'<figcaption class="cap">{PH("Caption placeholder for this plate.")}</figcaption></figure></section></div>')
def spread(id, n, label, paper, title, paras, stage, side='right', ar='1/0.92', mar='1/1.1', subs=None, extra='', tear=0, cap=None):
    subs_html = ''
    if subs:
        subs_html = '<div class="subs">' + ''.join(f'<div class="sub"><h3>{PH(h)}</h3><p>{PH(p)}</p></div>' for h, p in subs) + '</div>'
    V3 = {'entrance': 'entrance', 'bench': 'bench', 'volunteer': 'volunteer', 'heart': 'heart', 'clock': 'clock', 'final': 'final'}
    chip = f'<button class="c3dOpen chip3d" data-view="{V3[id]}" aria-label="See {label.lower()} in the 3D café">See it in 3D</button>' if id in V3 else ''
    text = (f'<div class="txt"><div class="kick">{n} · {label.lower()}{chip}</div><h2>{PH(title)}</h2>'
            + ''.join(f'<p>{PH(p)}</p>' for p in paras) + subs_html + (f'<p class="cap">{cap}</p>' if cap else '') + '</div>')
    st = f'<div class="stage" style="--ar:{ar};--mar:{mar}">{stage}{deco(id)}</div>'
    body = (st + text) if side == 'left' else (text + st)
    cls, sst, sh = seam(id)
    return (f'<div class="{cls}" style="{sst}">{sh}<section class="spread {paper} {side}" id="{id}" aria-labelledby="{id}-h">'
            f'<div class="rim"></div><div class="in">{body}</div>{extra}</section></div>').replace('<h2>', f'<h2 id="{id}-h">', 1)

B = []
# cover: the shoes as the feature image, the teapot café beside the title
B.append('<div class="sw t0"><header class="spread cover cream" id="top"><div class="in">'
  + f'<div class="txt"><div class="kick">a visual story · Repair Café Silicon Valley</div><h1>{PH("Headline placeholder")}</h1>'
  + f'<p class="dek">{PH("Dek placeholder: one sentence on what the reader will learn.")}</p><p class="by">{PH("By author")} · October 18, 2026 · San José</p><p><button class="c3dOpen nbLink" data-view="entrance">Walk around the café in 3D →</button><br><button class="nbOpen nbLink" data-page="3">Or flip through the notebook →</button></p></div>'
  + '<div class="stage" style="--ar:1/0.74;--mar:1/0.9">'
  + pc('sh_denim_0.png', 70, -10, 36, 12, 0, (66, -8, 40)) + pc('sh_gingham_pink_0.png', -8, 64, 34, -8, 0, (-8, 66, 36)) + pc('sh_knit_1.png', 84, 58, 26, -14, 0, (80, 66, 30))
  + pc('fr_feature.png', 0, 0, 100, -1.5, 2, (0, 4, 100), 'Feature photograph: a pair of white sneakers on a dark rug with a rainbow of light across them')
  + pc('st_world.png', 66, 62, 40, 3, 3, (58, 66, 44), 'The teapot café, a paper model')
  + arrow(-14, 78, 18, LOOP, '#C8461F', -8, 4, (0, 92, 20))
  + '</div></div>'
  + f'<p class="fcap">{PH("Caption placeholder for the feature photograph.")} <span>{CREDIT}</span></p></header></div>')

B.append(plate_band('cake', 'seventeen candles', 'cream', 'trim_pink'))

B.append(spread('entrance', '01', 'At the entrance', 'lined', 'section heading placeholder',
  ['Paragraph placeholder: arriving at the door, what you see first, the check-in table.', 'Paragraph placeholder: who comes to a repair café and what they carry in.'],
  pc('sh_gingham_green_0.png', 64, -8, 34, -10, 0, (64, -6, 38)) + pc('fr_entrance.png', 0, 6, 74, -3, 2, (0, 4, 86), 'Alt text placeholder')
  + pc('st_intake.png', 60, 40, 40, 4, 3, (58, 46, 44), 'The check-in counter with its menu board and ticket rail, a paper model')
  + arrow(46, 74, 22, SWOOSH, '#23337E', 0, 4, (40, 82, 26)), side='right', tear=1,
  cap=f'{PH("Caption placeholder for the entrance photograph.")} {CREDIT}'))

B.append(plate_band('board', 'how a repair gets ordered', 'grey', 'trim_gold'))

B.append(spread('bench', '02', 'At the workbench', 'navy', 'section heading placeholder',
  ['Paragraph placeholder: the repair underway, the tools on the table, what the fixer is looking for.', 'Paragraph placeholder: what was wrong, and what the fixer tried.'],
  pc('sh_mesh_0.png', 6, 62, 34, 8, 0, (4, 66, 36)) + pc('film_stereo.png', 2, -4, 40, -6, 2, (2, -2, 46), 'Three photographs from the stereo repair on a strip of film')
  + pc('st_kitchen.png', 56, -2, 42, 3, 2, (58, 0, 42), 'The electronics workbench with its pegboard of tools, a paper model')
  + pc('st_stereo.png', 28, 34, 74, -2, 4, (26, 38, 76), 'The stereo taken apart in layers, its cable of coloured wires fanning out to the second box, a paper model'),
  side='left', ar='1/1.05', mar='1/1.2', tear=2,
  subs=[('Subhead placeholder', 'Short note placeholder about one tool or step.'), ('Subhead placeholder', 'Short note placeholder about one tool or step.')],
  cap=f'{PH("Caption placeholder for the film strip.")} {CREDIT}'))

B.append(plate_band('disc', 'the rainbow in the disc', 'cream', 'trim_lilac'))

B.append(spread('volunteer', '03', 'Beside the volunteer', 'cream', 'section heading placeholder',
  ['Paragraph placeholder: the volunteer, in their own words from the interview.', 'Paragraph placeholder: why they keep coming back.'],
  pc('sh_knit_0.png', -4, 58, 32, -12, 0, (-6, 62, 36)) + pc('fr_volunteer.png', 6, 0, 60, 2, 2, (4, 0, 70), 'Alt text placeholder')
  + doily('doily_pink', 50, 34, 54, 8, (48, 42, 58)) + pc('st_tea.png', 54, 44, 46, -3, 3, (52, 52, 50), 'The tea table where volunteers take a break, a paper model'),
  side='right', ar='1/1.0', mar='1/1.15', tear=0,
  extra=f'<blockquote class="pull">{PH("Pull quote placeholder from the interview.")}<cite>{PH("Name, role")}</cite></blockquote>',
  cap=f'{PH("Caption placeholder for the volunteer photograph.")} {CREDIT}'))

B.append(plate_band('aprons', 'six aprons on the hooks', 'lined', 'trim_blue'))

B.append(spread('heart', '04', 'The heart clock', 'grey', 'section heading placeholder',
  ['Paragraph placeholder: the heart clock, who brought it, and what stopped working.'],
  pc('sh_herringbone_0.png', 30, 50, 40, 14, 0, (28, 54, 46)) + pc('fr_intake.png', -2, 50, 52, -4, 2, (-2, 56, 58), 'Alt text placeholder')
  + pc('fr_heart.png', 26, -2, 50, 3, 3, (22, -2, 56), 'Alt text placeholder')
  + doily('doily_gold', 60, 20, 48, -10, (58, 26, 50)) + pc('st_appl.png', 66, 30, 36, 2, 4, (64, 36, 38), 'The appliance table with the heart clock and the brass lamp, a paper model'),
  side='left', ar='1/0.95', mar='1/1.1', tear=1,
  subs=[('Subhead placeholder', 'Paragraph placeholder: what came apart: the frame, the face, the ring, the glass, the hands.'), ('Subhead placeholder', 'Paragraph placeholder: what happened next.')],
  cap=f'{PH("Caption placeholder for the heart clock photographs.")} {CREDIT}'))

POLA = FR('polaroid', 'clock', PH('Caption placeholder for the cuckoo clock photograph.'), 'Photo: [credit].')
B.append(spread('clock', '05', 'Inside the clock', 'grid', 'section heading placeholder',
  ['Paragraph placeholder: a line that leads to the clock on the wall.', 'Passage placeholder: the cuckoo clock story, as Jazz told it.', 'Paragraph placeholder: what the clock story says about why people repair things.'],
  pc('sh_gingham_pink_1.png', 58, -6, 38, 9, 0, (56, -4, 42)) + pc('st_keep.png', 4, 4, 40, -3, 2, (2, 6, 44), 'The cuckoo clock on its chest of drawers, a paper model')
  + f'<div class="pc polawrap" style="--l:44%;--t:8%;--w:52%;--r:4deg;--z:3;--ml:46%;--mt:10%;--mw:52%">{POLA}</div>'
  + arrow(30, 70, 24, LOOP, '#C8461F', 10, 4, (24, 76, 28), flip=True),
  side='right', ar='1/0.95', mar='1/1.05', tear=2,
  extra='<p class="recon">Reconstruction · told by Jazz about a repair at an earlier event</p>'))

B.append(plate_band('why', 'why people come', 'cream', 'trim_pink'))
B.append(plate_band('stand', 'the stand of odds', 'grey', 'trim_gold'))

B.append(spread('final', '06', 'The final object', 'navy', 'section heading placeholder',
  ['Paragraph placeholder: the closing scene.', 'Closing paragraph placeholder: the last line of the essay.'],
  pc('sh_denim_1.png', 52, 56, 40, -10, 0, (50, 60, 44)) + pc('fr_final.png', 0, 4, 70, -2, 2, (0, 4, 80), 'Alt text placeholder')
  + doily('doily_blue', 52, 20, 54, 14, (50, 30, 56)) + pc('st_order.png', 58, 30, 40, 3, 3, (58, 40, 42), 'The pickup table with its glass cloche, a paper model'),
  side='left', ar='1/0.9', mar='1/1.05', tear=0,
  cap=f'{PH("Caption placeholder for the closing photograph.")} {CREDIT}'))

_c, _s, _h = seam('cafe3d-s')
B.append(f'<div class="{_c}" style="{_s}">{_h}<section class="spread grey right" id="cafe3d-s" aria-labelledby="c3-h"><div class="rim"></div><div class="in">'
  '<div class="txt"><div class="kick">also · the café in 3D</div><h2 id="c3-h">walk around the café</h2>'
  '<p>Every paper model in this story is a still of one 3D café. Open it to turn the whole scene, stop at each place in the essay, and tap a pink dot for a note. It is an illustrated reconstruction: the event borrows a community room, and the teapot is invented.</p>'
  '<p><button class="c3dOpen nbBtn" data-view="entrance">Open the café in 3D</button></p></div>'
  '<div class="stage" style="--ar:1/0.71;--mar:1/0.71"><button class="pc c3dOpen nbPv" data-view="entrance" style="--l:0%;--t:2%;--w:100%;--r:1.2deg;--z:2" aria-label="Open the café in 3D">'
  '<img src="img/cafe3d_preview.webp" alt="The teapot café in 3D, cut open, standing on an open book" loading="lazy"></button></div></div></section></div>')
_c, _s, _h = seam('notebook-s')
B.append(f'<div class="{_c}" style="{_s}">{_h}<section class="spread grid left" id="notebook-s" aria-labelledby="nb-h"><div class="rim"></div><div class="in">'
  '<div class="stage" style="--ar:1/0.7;--mar:1/0.7"><button class="pc nbOpen nbPv" data-page="3" style="--l:0%;--t:4%;--w:100%;--r:-1.5deg;--z:2" aria-label="Open the notebook at the pop-up café">'
  '<img src="img/nb_preview.webp" alt="The notebook open on its pop-up of the café" loading="lazy"></button></div>'
  '<div class="txt"><div class="kick">also · the notebook</div><h2 id="nb-h">flip through the notebook</h2>'
  '<p>The same Sunday kept as a planner: photographs taped in, a pop-up of the café, a clock you can take apart, a flap to lift.</p>'
  '<p><button class="nbOpen nbBtn">Open the notebook</button></p></div></div></section></div>')
_c, _s, _h = seam('end')
B.append(f'<div class="{_c}" style="{_s}">{_h}<footer class="end spread navy"><div class="rim"></div><p>{PH("Sources and credits placeholder: interviews, photographs, data.")}</p><p>Paper models are stills of the author’s 3D café, cut out and laid on paper. Reconstructions are marked.</p></footer></div>')

NAV = [('entrance', 'Entrance'), ('bench', 'Workbench'), ('volunteer', 'Volunteer'), ('heart', 'Heart clock'), ('clock', 'Cuckoo clock'), ('final', 'Order up'), ('notebook-s', 'Notebook')]
page = open(os.path.join(D, 'page.html')).read()
page = page.replace('{{FONTS}}', ''.join(l + '\n' for l in open(os.path.join(S, 'diorama', 'fonts.css')).read().split('\n') if 'Roffelia' not in l) + open(os.path.join(S, 'fonts2', 'androgy.css')).read() + open(os.path.join(S, 'fonts2', 'page.css')).read()).replace('{{FRAMES}}', open(os.path.join(S, 'sticker', 'frames.css')).read())
page = page.replace('{{NAV}}', ''.join(f'<a href="#{i}">{t}</a>' for i, t in NAV) + '<button class="c3dOpen" data-view="entrance">Open 3D</button><button id="xpTog" aria-pressed="false" title="Show optional tags on the pictures">Explore</button>').replace('{{BODY}}', '\n'.join(B))
page = page.replace('/*EDIT*/', open(os.path.join(D, 'edit.js')).read())
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
for f in ['pal/pal_cup.webp', 'pal/pal_steam.webp']: shutil.copy(os.path.join(KIT, f), os.path.join(PUB, 'img', os.path.basename(f)))
for t in TOOLS_USED: shutil.copy(os.path.join(KIT, 'tools', t + '.webp'), os.path.join(PUB, 'img', 't_' + t + '.webp'))
for f in SEAM_IMG: shutil.copy(os.path.join(KIT, f), os.path.join(PUB, 'img', os.path.basename(f)))
for f in set(used):
    im = Image.open(os.path.join(KIT, f)); im.thumbnail((1500, 1500)); im.save(os.path.join(PUB, 'img', f.replace('.png', '.webp')), quality=82, method=5)
    html = html.replace(f'img/{f}', 'img/' + f.replace('.png', '.webp'))
for t in ['tx_paper_cream', 'tx_paper_lined', 'tx_paper_navy', 'tx_paper_grey', 'tx_paper_grid']:
    im = Image.open(os.path.join(KIT, t + '.jpg')); im.save(os.path.join(PUB, 'img', t + '.jpg'), quality=80, optimize=True)
A2 = os.path.join(S, 'assets2', 'out')
for pid in PL_USED + sorted(XP_USED):
    im = Image.open(os.path.join(A2, pid + '.png')); im.thumbnail((1600, 2200))
    im.save(os.path.join(PUB, 'img', ('pl_' if pid in PL_USED else 'x_') + pid + '.webp'), quality=86, method=6)
    if pid in XP_USED and pid in PL_USED: shutil.copy(os.path.join(PUB, 'img', 'pl_' + pid + '.webp'), os.path.join(PUB, 'img', 'x_' + pid + '.webp'))
NBD = os.path.join(S, 'nb'); html = html.replace('</body>', open(os.path.join(NBD, 'part.html')).read() + '\n</body>')
for f in os.listdir(os.path.join(NBD, 'img')): shutil.copy(os.path.join(NBD, 'img', f), os.path.join(PUB, 'img', f))
for f in sorted(SEAM_IMG):
    if f.endswith('.png'):
        n = os.path.basename(f); im = Image.open(os.path.join(KIT, f)); im = im.resize((1800, im.height * 1800 // im.width))
        im.save(os.path.join(PUB, 'img', n.replace('.png', '.webp')), quality=82, method=6); os.remove(os.path.join(PUB, 'img', n))
        html = html.replace(f'img/{n}', 'img/' + n.replace('.png', '.webp'))
open(os.path.join(PUB, 'index.html'), 'w').write(html)
strip = re.sub(r'^<!doctype html>\s*<html[^>]*>\s*<head>\s*(<meta[^>]*>\s*)*', '', html, flags=re.I)
strip = strip.replace('</head>', '', 1).replace('<body>', '', 1); strip = re.sub(r'</body>\s*</html>\s*$', '', strip)
open(os.path.join(PUB, 'page.html'), 'w').write(strip)
json.dump({'img/' + f: os.path.join(PUB, 'img', f) for f in sorted(os.listdir(os.path.join(PUB, 'img')))}, open(os.path.join(D, 'files.json'), 'w'), indent=0)
im = Image.open('/mnt/user-data/attachments/ee5cc871-c0b1-559a-a1f7-dca096f49e11/2611fe6b-image.jpg').convert('RGB'); im.thumbnail((1100, 1100)); im.save(os.path.join(PUB, 'img', 'clock.jpg'), quality=84)
print('built', os.path.getsize(os.path.join(PUB, 'index.html')) // 1024, 'KB')
