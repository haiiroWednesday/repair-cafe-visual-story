"""The notebook: a daily-planner flip book of October 18, opened over the paper edition.
Outputs part.html (style + markup + script, injected into the paper edition) and test.html (standalone)."""
import os, json, base64
HERE = os.path.dirname(os.path.abspath(__file__)); SP = os.path.dirname(HERE)
def PH(s): return f'<span class="ph">{s}</span>'

# ---------- printed planner furniture ----------
CAL = ''.join(f'<i>{d}</i>' for d in 'SMTWTFS') + '<i></i>' * 4 + ''.join(
    f'<i class="{"o" if d == 18 else ""}">{d}</i>' for d in range(1, 32))  # Oct 1 2026 is a Thursday
def header(sec):
    return (f'<div class="hd"><span class="mo">10</span><span class="dy">18</span><span class="wd">日<small>SUN</small></span>'
            f'<span class="sc">{sec}</span></div><div class="hd2">Repair Café Silicon Valley · Billy DeFrank Center, San José</div>'
            f'<div class="ghost" aria-hidden="true">18</div><div class="boxes" aria-hidden="true"><b></b><b></b><b></b><b></b></div>')
HOURS = '<div class="hrs" aria-hidden="true">' + ''.join(f'<span>{h}</span><span>·</span><span>·</span>' for h in (6, 9, 12, 15, 18, 21, 0, 3)) + '</div>'
def foot(side, quote=True):
    q = (f'<div class="ft"><p>{PH("A line from the day, placeholder.")}</p><cite>—— {PH("Name, role")}</cite></div>' if quote else '')
    cal = f'<div class="cal" aria-hidden="true"><b>2026 · 10</b>{CAL}</div>' if side == 'R' else ''
    return q + cal

# ---------- pieces ----------
def pos(l, t, w, r=0, z=2): return f'--l:{l}%;--t:{t}%;--w:{w}%;--r:{r}deg;--z:{z}'
def wash(c, l, t, w, r=0, o=1): return f'<img class="wash" data-src="img/w_{c}.png" alt="" style="{pos(l, t, w, r, 1)};--o:{o}">'
def stick(src, l, t, w, r=0, z=3, alt=''): return f'<img class="stk" data-src="img/{src}.webp" alt="{alt}" style="{pos(l, t, w, r, z)}">'
def photo(src, l, t, w, r, alt, back, tape='blue', tr=-4, tl=30, z=3, ar=None):
    """A photo taped to the page. Tap it to lift it and turn it over; the back holds the caption."""
    st = pos(l, t, w, r, z) + (f';aspect-ratio:{ar}' if ar else '')
    return (f'<button class="photo" style="{st}" aria-label="Turn over: {alt}"><span class="flip">'
            f'<span class="front"><img data-src="img/ph_{src}.webp" alt="{alt}"></span>'
            f'<span class="back"><span class="bk">{back}</span><span class="turn">turn back</span></span></span>'
            f'<img class="tape" data-src="img/tape_{tape}.png" alt="" style="--tl:{tl}%;--tr:{tr}deg"></button>')
def note(html, l, t, w, r=0, z=4, cls=''): return f'<div class="note {cls}" style="{pos(l, t, w, r, z)}"><span>{html}</span></div>'
def hand(html, l, t, w, z=4, cls=''): return f'<div class="hand {cls}" style="{pos(l, t, w, 0, z)}">{html}</div>'
def title(txt, l=9, t=17, sub=''): return f'<h3 class="ttl" style="--l:{l}%;--t:{t}%">{txt}</h3>' + (f'<div class="tsub" style="--l:{l + 1}%;--t:{t + 9.5}%">{sub}</div>' if sub else '')
def stamp(ch, l, t): return f'<span class="stamp" style="--l:{l}%;--t:{t}%" aria-hidden="true">{ch}</span>'
def arrow(d, l, t, w, h, r=0): return (f'<svg class="arr" viewBox="0 0 100 100" preserveAspectRatio="none" style="{pos(l, t, w, r, 5)};height:{h}%" aria-hidden="true">'
                                       f'<path d="{d}" /></svg>')
def tab(n, sec): return f'<span class="tab" style="--n:{n}" aria-hidden="true">{sec}</span>'

PAGES = []
def page(side, sec, inner, n, label='', hard=False, cls='', quote=True):
    tabs = tab(n, sec) if side == 'R' and sec else ''
    PAGES.append((label, f'<div class="page" data-density="{"hard" if hard else "soft"}"><div class="pg {side} {cls}">'
                  + ('' if hard else header(sec) + '<div class="grid"></div>' + HOURS) + inner + ('' if hard else foot(side, quote)) + tabs
                  + (f'<span class="pno">{n}</span>' if not hard else '') + '</div></div>'))

# 0 cover
PAGES.append(('Cover', '<div class="page" data-density="hard"><div class="pg cover"><div class="band"></div>'
              '<div class="ctitle">Repair Café</div><div class="csub">a notebook from Sunday · 10.18.2026</div>'
              + stick('pu_pot', 21, 46, 58, -3, 3, 'Sticker of the teapot café')
              + '<div class="cfoot">Repair Café Silicon Valley</div></div></div>'))
# 1 endpaper
PAGES.append(('Inside cover', '<div class="page" data-density="hard"><div class="pg endp">'
              + note(f'this notebook belongs to<br><b>{PH("Anonymous")}</b>', 18, 14, 64, -2, 4, 'kraft')
              + note('how to read it: turn the page corner, or use the arrows.<br>anything taped down can be lifted. tap it.', 14, 62, 72, 1.5, 4)
              + '</div></div>'))
# 2 title + contents
CONTENTS = [('at the entrance', 5), ('at the workbench', 7), ('beside the volunteer', 9), ('the heart clock', 11), ('inside the clock', 13), ('the final object', 15)]
page('R', '', title('what came in', 9, 17, 'Repair Café Silicon Valley, one Sunday')
     + hand(f'<p>{PH("Intro placeholder: two or three lines on why people came, and what this notebook keeps.")}</p>', 9, 34, 78)
     + '<ol class="toc" style="--l:9%;--t:47%;--w:80%">' + ''.join(f'<li><button data-go="{p}"><span>{t}</span><i></i><b>p. {p}</b></button></li>' for t, p in CONTENTS) + '</ol>'
     + stamp('修', 74, 15), 2, 'Contents', quote=False)
# 3-4 pop-up spread
page('L', '', title('the café', 9, 17, 'as I drew it')
     + hand(f'<p>{PH("Pop-up note placeholder: one line on how the room was set up.")}</p>', 9, 32, 60)
     + wash('pink', 18, 58, 90, 0, .7) + wash('sage', -6, 66, 60, 0, .55), 3, 'The café')
page('R', '', note('a drawing, made after the day. the event borrows a community room. the teapot is invented.', 50, 16, 42, 2, 6)
     + hand('tap a piece of the pop-up to go to its page', 12, 20, 34, 4, 'pencil')
     + wash('blue', -40, 60, 90, 0, .6) + wash('gold', 40, 64, 60, 0, .5), 4, 'The café')
# 5-6 entrance
page('L', '01', title('at the entrance', 9, 17) + stamp('入', 78, 15)
     + wash('blue', 6, 44, 90, 0, .9)
     + photo('entrance', 12, 34, 74, -2.5, 'The entrance of the Repair Café, October 18', PH('Caption placeholder for the entrance photo.'), 'blue', -3, 34, 3, '2576/1932')
     + note(PH('Note placeholder: who was waiting.'), 14, 70, 46, -1.5)
     + note(PH('Note placeholder: what they carried.'), 50, 77, 42, 2), 5, 'At the entrance')
page('R', '01', hand(f'<p>{PH("Two lines placeholder about the intake slip.")}</p>', 10, 16, 52)
     + photo('ticket', 52, 13, 38, 4, 'An intake ticket: 1:47 PM, basic appliances, a portable fan that stopped working', PH('Caption placeholder for the intake ticket.'), 'kraft', 2, 40, 3, '1512/2016')
     + wash('peach', 0, 52, 80, 0, .8) + stick('pu_kitchen', 10, 46, 46, -2, 3, 'Paper model of the pastry case of broken things')
     + note(PH('Note placeholder: the shelf of things waiting.'), 56, 70, 36, 1.5)
     + arrow('M8,10 C30,0 70,10 90,60 M90,60 L76,52 M90,60 L92,44', 44, 62, 14, 9, 0), 6, 'At the entrance')
# 7-8 workbench: comic panels
PAN = [('stereo', 'the stereo', 'A stereo with its cover off on the workbench'), ('stereotop', 'from above', 'The stereo seen from above'), ('hands', 'hands', 'Hands at work on a repair')]
panels = '<div class="panels" style="--l:8%;--t:28%;--w:84%">' + ''.join(
    f'<button class="panel p{i}" aria-label="Open larger: {a}"><img data-src="img/ph_{s}.webp" alt="{a}"><span class="ptag">{lab}</span></button>' for i, (s, lab, a) in enumerate(PAN)) + '</div>'
page('L', '02', title('at the workbench', 9, 17) + stamp('工', 78, 15) + panels
     + note(PH('Speech placeholder.'), 12, 73, 34, -2, 6, 'bubble') + note(PH('Reply placeholder.'), 52, 76, 34, 1.5, 6, 'bubble'), 7, 'At the workbench')
page('R', '02', hand(f'<p>{PH("Paragraph placeholder: one step at the bench, in your words.")}</p>', 10, 16, 80)
     + wash('blue', 2, 36, 96, 0, .75) + stick('st_tools', 12, 34, 62, -2, 3, 'Paper model of the toolboxes')
     + note(PH('Note placeholder about one tool.'), 54, 66, 38, 2) + note(PH('Note placeholder about another tool.'), 10, 74, 40, -1.5), 8, 'At the workbench')
# 9-10 volunteer
page('L', '03', title('beside the volunteer', 9, 17) + stamp('人', 80, 27)
     + photo('volunteer', 16, 30, 62, 1.8, 'A volunteer at the repair table', PH('Caption placeholder for the volunteer photo.'), 'pink', 3, 36, 3, '1536/2048')
     + wash('pink', -10, 58, 70, 0, .7), 9, 'Beside the volunteer')
page('R', '03', note(f'“{PH("Pull quote placeholder from the interview.")}”', 12, 18, 74, -1, 6, 'bubble big')
     + hand(f'—— {PH("Name, role")}', 54, 36, 38)
     + wash('gold', 10, 50, 90, 0, .7) + stick('pu_tea', 20, 48, 56, 2, 3, 'Paper model of the tea table')
     + note(PH('Note placeholder: where you sat.'), 12, 82, 40, -2), 10, 'Beside the volunteer')
# 11-12 heart clock: take it apart
HM = json.load(open(os.path.join(SP, 'blend', 'heart2_tray.json')))
HL = {'frame': 'the heart frame', 'roses': 'roses', 'face': 'the rose face', 'bezel': 'black bezel', 'ring': 'numeral ring', 'lens': 'glass', 'hands': 'hands', 'second': 'second hand', 'movement': 'movement', 'battery': 'AA battery'}
SIDE = {'second': 'lf', 'battery': 'lf up', 'movement': 'dn', 'hands': 'lf dn', 'ring': 'up'}
marks = ''.join(f'<span class="mk {SIDE.get(k, "")}" style="--x:{HM[k][0] * 100}%;--y:{HM[k][1] * 100}%"><i></i><em>{v}</em></span>' for k, v in HL.items() if k in HM)
page('L', '04', title('the heart clock', 9, 17) + stamp('心', 80, 15)
     + photo('heart', 10, 30, 56, -2, 'The heart clock on the repair table', PH('Caption placeholder for the heart clock photo.'), 'pink', -2, 30, 3, '2576/1932')
     + photo('intake', 48, 56, 44, 3, 'The heart clock as it came in', PH('Caption placeholder for the intake photo.'), 'mint', 4, 44, 4, '2576/1932')
     + note(PH('Note placeholder: what was wrong.'), 10, 66, 34, -1.5), 11, 'The heart clock')
page('R', '04', hand(f'<p>{PH("Two lines placeholder: what came apart.")}</p>', 10, 16, 80)
     + wash('lilac', 0, 36, 100, 0, .6)
     + f'<div class="apart" style="--l:4%;--t:28%;--w:92%"><img class="whole" data-src="img/heart_whole.webp" alt="The heart clock, whole (a 3D model drawn from the photos)">'
       f'<div class="tray"><img data-src="img/heart_tray.webp" alt="The heart clock taken apart into its parts (a 3D model)">{marks}</div></div>'
     + '<button class="apartBtn" style="--l:10%;--t:76%">take it apart</button>'
     + hand('drawn from the photos. a model, not a photograph.', 46, 77, 46, 4, 'pencil small'), 12, 'The heart clock')
# 13-14 inside the clock: lift the flap
page('L', '05', title('inside the clock', 9, 17) + stamp('鳩', 80, 15)
     + photo('clockp', 14, 28, 52, -3, 'Jazz holds up the cuckoo clock', PH('Caption placeholder for the cuckoo clock photo.'), 'gold', 2, 34, 3, '1536/2048')
     + hand('the chains!', 66, 50, 26, 5, 'ink') + arrow('M90,10 C60,0 30,30 12,80 M12,80 L10,62 M12,80 L28,72', 56, 54, 14, 10)
     + note(PH('Note placeholder about the clock’s owner.'), 52, 74, 40, 2)
     + hand('reconstruction · told by Jazz about a repair at an earlier event', 10, 86.4, 80, 6, 'pencil small recon'), 13, 'Inside the clock', quote=False)
page('R', '05', hand(f'<p>{PH("Two lines placeholder: what the repair took.")}</p>', 10, 16, 80) + hand('the repair, in three steps. lift the flap →', 10, 44, 36, 2, 'pencil')
     + wash('peach', 6, 34, 92, 0, .6)
     + '<div class="flapbox" style="--l:50%;--t:27%;--w:40%">'
       '<ol class="steps"><li><b>1</b>the chains had come off their wheels</li><li><b>2</b>fed back on, one train at a time</li><li><b>3</b>tied down for the trip home</li></ol>'
       f'<button class="flap" aria-expanded="false"><span class="ff"><img data-src="img/pu_clock.webp" alt="Paper model of the cuckoo clock"><span class="lbl">lift the flap</span></span><span class="fb">the repair, in three steps →<br><br>steps from the reporting.<br>the drawing is a model.<br><br>tap to close the flap.</span></button></div>'
     + hand('steps from the reporting. the drawing is a model.', 10, 62, 36, 2, 'pencil small'), 14, 'Inside the clock')
# 15-16 final object
page('L', '06', title('the final object', 9, 17) + stamp('完', 80, 15)
     + wash('lilac', 2, 30, 96, 0, .7)
     + photo('feature', 8, 30, 80, -1.5, 'The pair of shoes, rainbow light across them', PH('Caption placeholder for the shoes.'), 'blue', -2, 40, 3, '2576/1430')
     + photo('final', 30, 56, 56, 3, 'One shoe in the rainbow light', PH('Caption placeholder for the single shoe.'), 'pink', 3, 46, 4, '2576/1644'), 15, 'The final object')
page('R', '06', hand(f'<p>{PH("Closing placeholder: the last thing you saw before you left.")}</p>', 10, 16, 80)
     + photo('board', 14, 32, 64, 2, 'Three volunteers with a chalkboard sign: We fixed it! Repair Café', PH('Caption placeholder for the chalkboard photo.'), 'kraft', -2, 36, 3, '2576/1932')
     + stick('pu_order', 64, 52, 28, 3, 4, 'Paper model of the pickup table')
     + hand('order up.', 12, 76, 40, 4, 'big'), 16, 'The final object')
# 17 back cover
PAGES.append(('Back cover', '<div class="page" data-density="hard"><div class="pg cover back"><div class="band"></div>'
              '<div class="cfoot">Photographs: the author. Paper models: stills of the author’s 3D café.</div></div></div>'))

# ---------- the pop-up: standees that rise out of the gutter on pages 3–4 ----------
POP = [('pu_kitchen', 'the pastry case', 5, 'back', 5, 26, 21), ('pu_clock', 'the cuckoo clock', 13, 'back', 70, 24, 14),
       ('pu_pot', '', 0, 'mid', 27, 6, 46), ('st_tools', 'the toolboxes', 7, 'front', -2, 0, 20),
       ('pu_tea', 'the tea table', 9, 'front', 17, -6, 19), ('st_appl', 'the heart clock', 11, 'front', 63, -6, 19), ('pu_order', 'the pass', 15, 'front', 86, 0, 14)]
pop = '<div id="nbPop" aria-label="Pop-up of the café, a drawing">' + ''.join(
    (f'<button class="sp {row}" data-go="{go}" style="--l:{l}%;--b:{b}%;--w:{w}%;--d:{i * 90}ms" aria-label="Go to {tag}, page {go}">' if go else
     f'<div class="sp {row}" style="--l:{l}%;--b:{b}%;--w:{w}%;--d:{i * 90}ms">')
    + f'<img data-src="img/{src}.webp" alt="">' + (f'<span class="stag">{tag} · p.{go}</span>' if tag else '') + ('</button>' if go else '</div>')
    for i, (src, tag, go, row, l, b, w) in enumerate(POP)) + '</div>'

LABELS = [p[0] for p in PAGES]
PF = open(os.path.join(HERE, 'node_modules', 'page-flip', 'dist', 'js', 'page-flip.browser.js')).read()
FONT = base64.b64encode(open(os.path.join(HERE, 'node_modules', '@fontsource', 'patrick-hand', 'files', 'patrick-hand-latin-400-normal.woff2'), 'rb').read()).decode()

CSS = open(os.path.join(HERE, 'nb.css')).read().replace('{{HANDFONT}}', FONT)
JS = open(os.path.join(HERE, 'nb.js')).read().replace('{{LABELS}}', json.dumps(LABELS))
part = (f'<style>{CSS}</style>\n'
        '<div id="nb" role="dialog" aria-modal="true" aria-label="The notebook" hidden>'
        '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><filter id="nbTorn" x="-4%" y="-8%" width="108%" height="116%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="5" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G"/></filter><filter id="nbInk" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2" xChannelSelector="R" yChannelSelector="G"/></filter></defs></svg>'
        '<div class="nbbar"><span class="nbname">The notebook</span><span id="nbWhere" aria-live="polite"></span>'
        '<button id="nbPrev" aria-label="Previous page">‹</button><button id="nbNext" aria-label="Next page">›</button>'
        '<button id="nbX"><span class="lg">Back to the story</span><span class="sm">Close</span></button></div>'
        '<div id="nbStage"><div id="nbWrap"><div id="nbBook">' + ''.join(p[1] for p in PAGES) + '</div>' + pop + '</div></div>'
        '<div id="nbLb" hidden><img alt=""><button>Close</button></div></div>\n'
        f'<script>{PF}</script>\n<script>{JS}</script>')
open(os.path.join(HERE, 'part.html'), 'w').write(part)
fonts = open(os.path.join(SP, 'diorama', 'fonts.css')).read()
test = ('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
        f'<title>Notebook test</title><style>{fonts} body{{margin:0;background:#DCD5C4;font:18px Newsreader,serif}} .ph{{background:rgba(194,74,35,.07);outline:1px dashed rgba(194,74,35,.4)}}</style></head><body>'
        '<button class="nbOpen" style="margin:40px;font:20px Newsreader">Open the notebook</button>'
        + part + '</body></html>')
open(os.path.join(HERE, 'img', '..', 'test.html'), 'w').write(test)
print('ok', len(part) // 1024, 'KB', len(PAGES), 'pages')
