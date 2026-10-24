import os, sys
D = os.path.dirname(os.path.abspath(__file__)); S = os.path.dirname(D); DI = os.path.join(S, 'diorama')
r = lambda p: open(p).read()
PH = lambda t: f'<span class="ph">{t}</span>'
CREDIT = 'Photo: the author, Repair Café Silicon Valley, Billy DeFrank Center, San José, October 18, 2026.'
def prose(*ps, h2=None, extra='', aside=None):
    a = f'<img class="aside-stk" data-stk="{aside[0]}" alt="" style="{aside[1]}">' if aside else ''
    return f'<section class="prose">{a}{f"<h2>{PH(h2)}</h2>" if h2 else ""}' + ''.join(f'<p>{PH(p)}</p>' for p in ps) + extra + '</section>'
def fig(k, cap, poly=False):
    return f'<figure class="{"polaroid" if poly else ""}"><img data-photo="{k}" alt="Alt text placeholder"><figcaption>{PH(cap)}<span class="credit">{CREDIT}</span></figcaption></figure>'
def steps(cards):
    out = ''
    for i, (title, body, note, stamp) in enumerate(cards):
        st = f'<span class="stamp" style="--c:{stamp[1]};--r:{stamp[2]}deg">{stamp[0]}</span>' if stamp else ''
        out += f'<div class="step{" right" if i % 2 else ""}" data-step="{i}"><div class="card">{st}{f"<h3>{title}</h3>" if title else ""}<p>{PH(body)}</p>{f"<p class=note>{note}</p>" if note else ""}</div></div>'
    return out
def scrolly(bid, label, furniture, cards):
    return f'<section class="scrolly" aria-label="{label}"><div class="stage"><div class="board" id="{bid}">{furniture}</div></div><div class="steps">{steps(cards)}</div></section>'
B = []
B.append(f'''<header class="wrap hero"><div><div class="lab">A visual story · Repair Café Silicon Valley · San José</div><h1>{PH("Headline placeholder")}</h1><p class="dek">{PH("Dek placeholder: one sentence on what the reader will learn.")}</p>
<div class="byline lab"><span>{PH("By author")}</span><span>October 18, 2026</span><span>Scroll to follow an order</span></div></div>
<div><div class="sheet" id="heroSheet" aria-label="A sticker sheet of things people bring to the café"><span class="hint">Tap a sticker to place an order.</span><span class="stamp count" id="orderCount" style="--c:var(--ink);--r:3deg">No orders yet</span></div></div></header>''')
B.append(prose('Lede placeholder: open on the room, the line at the door, the first thing you noticed.', 'Paragraph placeholder: what a repair café is, in one or two plain sentences.', 'Paragraph placeholder: why this one, on this Sunday.',
  extra=fig('entrance', 'Caption placeholder for the opening photograph.'), aside=('teapot', 'left:-170px;top:40px;--r:-8deg')))
cols = ''.join(f'<span class="colhead" data-c="{i}" style="left:{x}%">{n}</span>' for i, (x, n) in enumerate(zip([12, 31, 50, 69, 88], ['Appliances', 'Electronics', 'Mechanical', 'Computers', 'Sewing'])))
B.append(scrolly('bOrders', 'Graphic: taking orders', '<div class="rail"></div>' + cols, [
  ('Taking orders', 'Card placeholder: things arrive at the door, in bags and boxes and arms.', None, None),
  (None, 'Card placeholder: each one gets a numbered ticket at check-in.', None, ('Ticket', 'var(--rose)', -4)),
  (None, 'Card placeholder: tickets go up on the rail and each thing goes to its station.', 'Station names: check against the real check-in board.', ('Sorted', 'var(--ink)', 3)),
  (None, 'Card placeholder: follow one order, the stereo, to the bench.', None, ('Your order', 'var(--gold)', -3))]))
B.append(prose('Paragraph placeholder: the stereo and its owner, what it does and what stopped working.', 'Paragraph placeholder: who sat down to fix it.', h2='Section heading placeholder', aside=('spools', 'right:-150px;top:60px;--r:10deg')))
B.append(scrolly('bBench', 'Graphic: the workbench', '<div class="mat"></div>', [
  ('At the workbench', 'Card placeholder: the stereo on the mat.', None, None),
  (None, 'Card placeholder: the tools laid out around it, like a place setting.', None, ('Tools', 'var(--ink)', 2)),
  (None, 'Card placeholder: lifted apart, the stereo is layers and one hand-wired cable.', 'Exploded view drawn from the author’s photos.', ('Open', 'var(--rose)', -5)),
  (None, 'Card placeholder: the photograph from the bench.', CREDIT, None)]))
B.append(prose('Paragraph placeholder: the volunteer, in their own words.', 'Paragraph placeholder: why they keep coming back.', h2='Section heading placeholder',
  extra=fig('volunteer', 'Caption placeholder for the volunteer photograph.', poly=True) + f'<div class="pull"><p>{PH("Pull quote placeholder from the interview.")}</p><span class="lab">{PH("Name, role")}</span></div>'))
B.append(scrolly('bClock', 'Graphic: the cuckoo clock, a reconstruction', '<div class="wall"></div><span class="stamp recon" style="--c:var(--ink);--r:-3deg">Reconstruction · told by Jazz</span><div class="circle" style="left:58%;top:16%;width:34%;aspect-ratio:1;opacity:0"><img alt=""></div><span class="ctag" style="left:75%;top:86%;opacity:0"></span>', [
  ('Inside the clock', 'Card placeholder: the clock and whose it was.', 'Told by Jazz, about a repair at an earlier event.', None),
  (None, 'Card placeholder: what was wrong.', None, None),
  (None, 'Card placeholder: how it was put right.', None, None),
  (None, 'Card placeholder: getting it home safely.', None, None),
  (None, 'Card placeholder: the photograph, and what happened next.', 'Photo: [credit].', None)]))
pair = '<div class="pair"><img data-stk="dollBent" alt="The pull-string spring, bent"><span class="arrow">→</span><img data-stk="doll3" alt="The spring, straightened"><div class="cap lab"><span>Bent</span><span>Straightened</span></div></div>'
B.append(prose('Paragraph placeholder: the second story Jazz told, the pull-string toy.', 'Paragraph placeholder: what it meant to the person who brought it.', h2='Section heading placeholder', extra=pair, aside=('heart', 'left:-180px;top:20px;--r:-6deg')))
B.append(scrolly('bOrder', 'Graphic: order up', '<div class="counter"></div><div class="slotglass" style="left:43%;top:36%;width:14%;aspect-ratio:1;font-size:18px">your final object</div>'
  '<div style="position:absolute;left:4%;top:6%;display:grid;gap:4px"><span class="stamp stampOn" style="--c:#3E8A5E;--r:-3deg;opacity:0">Fixed · [n]</span><span class="stamp stampOn" style="--c:var(--gold);--r:2deg;opacity:0">Partly fixed · [n]</span><span class="stamp stampOn" style="--c:var(--rose);--r:-2deg;opacity:0">Not fixed · [n]</span></div>', [
  ('Order up', 'Card placeholder: the final object, served under the glass.', None, None),
  (None, 'Card placeholder: how the day went, in numbers.', 'Counts are placeholders until you add the real tally.', ('Tally', 'var(--ink)', 3)),
  (None, 'Card placeholder: the board by the door.', None, ('We fixed it', 'var(--rose)', -4))]))
B.append(prose('Closing paragraph placeholder.', 'Last line placeholder.', h2='Section heading placeholder',
  extra='<figure><div style="aspect-ratio:4/3;border-radius:6px;display:grid;place-items:center;background:repeating-linear-gradient(-45deg,#F4DCE0 0 12px,#FFFDFA 12px 24px);font:400 30px var(--title);color:var(--rose)">your final image</div><figcaption>' + PH('Caption placeholder for the final image.') + '</figcaption></figure>'))
NAMES = {'killawatt': 'plug-in meter', 'psu': 'power supply', 'led': 'LED board', 'caps': 'capacitors', 'strain': 'strain reliefs', 'crimps': 'crimp terminals', 'fluxpen': 'flux pen', 'braid': 'solder braid', 'wool': 'tip cleaner',
  'worklight': 'work light', 'tester': 'outlet tester', 'mat': 'repair mat', 'socket3': 'lamp socket', 'stereoX': 'stereo, apart', 'ultrasonic': 'ultrasonic cleaner', 'mixerparts': 'mixer parts', 'coffeemaker': 'coffee maker',
  'chain3': 'chains, tied', 'chainOff': 'chains, off', 'chainFed': 'chains, fed', 'cuckoo': 'cuckoo clock', 'doll3': 'toy spring, fixed', 'dollBent': 'toy spring, bent', 'innovis': 'Brother Innov-is', 'bernina': 'Bernina',
  'sewingmachine': 'sewing machine', 'needle3': 'needle', 'needleBack': 'needle eye', 'feltbook': 'needle book', 'tomato': 'pincushion', 'tapemeasure': 'tape measure', 'zipkit': 'zipper kit', 'zippliers': 'zipper pliers',
  'slider3': 'zipper slider', 'sliderSpread': 'slider, spread', 'ripper': 'seam ripper', 'biastape': 'bias tape', 'fraycheck': 'Fray Check', 'jumprings': 'jump rings', 'pot3': 'teapot', 'cakewhole': 'cake', 'cakeslice': 'slice',
  'cakemissing': 'cake, cut', 'sugarbowl': 'sugar bowl', 'spike': 'ticket spike', 'vase2': 'vase', 'stand': 'tiered stand', 'heart': 'heart clock', 'lampP': 'brass lamp', 'drink': 'iced drink', 'cloche': 'cloche', 'menu': 'menu board'}
PAGES = [('The workbench', 'iron wool braid flux fluxpen meter cutters pliers drivers mat worklight tester killawatt strain caps crimps fuses zipties psu led wire tweezers screws magnifier loupe ultrasonic toolbox socket3 stereo stereoX'),
  ('Appliances and keepsakes', 'lamp fan blender clock laptop coffeemaker vacuum printer radio bike plug switch bulbs belts mixerparts sandpaper lube glue vinegar wipes dowels tape string knife brush awl glasses caution cuckoo chainOff chainFed chain3 dollBent doll3 heart lampP'),
  ('The sewing table', 'machine bernina innovis sewingmachine needles needle3 needleBack feltbook tomato tapemeasure spools bobbins zipkit zippliers slider3 sliderSpread ripper scissors biastape bag velcro ribbons webbing buttons hooks fraycheck pins thimble jumprings clasps earrings beads trousers coat tin'),
  ('The café', 'cup teapot pot3 plate fork spoon napkin bow cherry cakeslice cakewhole cakemissing crumbs macaron sugarbowl spike creamer croissant coffee cake stand vase vase2 drink pudding parfait cloche menu')]
pg = ''.join(f'<div class="pg"><h3>{t}</h3><div class="grid">' + ''.join(f'<figure data-k="{k}"><img alt=""><figcaption>{NAMES.get(k, k)}</figcaption></figure>' for k in ks.split()) + '</div></div>' for t, ks in PAGES)
B.append(f'<section class="book"><div class="wrap"><div class="lab">Sticker book</div><h2>Everything on the tables</h2><p>Every tool, part and plate drawn for this story, grouped by where it sat.</p><div class="pages">{pg}</div></div></section>')
B.append(f'<footer class="end wrap">{PH("Sources and credits placeholder: interviews, photographs, data.")}<br>Drawings and stickers: {PH("credit")}. Reconstructions are marked.</footer>')
local = '--local' in sys.argv
t = r(os.path.join(D, 'page.html'))
for k, v in [('{{FONTS}}', r(os.path.join(DI, 'fonts.css'))), ('{{BODY}}', '\n'.join(B)), ('{{PAINT}}', r(os.path.join(DI, 'paint.js'))), ('{{ASSETS}}', r(os.path.join(DI, 'assets.json'))), ('{{APP}}', r(os.path.join(D, 'app.js')))]:
    t = t.replace(k, v)
if not local:
    import re
    t = re.sub(r'<!doctype html>\s*<html[^>]*>\s*<head>\s*<meta charset="utf-8">\s*<meta name="viewport"[^>]*>\s*', '', t, count=1)
    t = t.replace('</head>\n<body>', '', 1).replace('</body>\n</html>', '')
out = os.path.join(D, 'order-up' + ('-local' if local else '') + '.html'); open(out, 'w').write(t); print(out, os.path.getsize(out) // 1024, 'KB')
