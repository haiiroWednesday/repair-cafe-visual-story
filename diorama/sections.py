PH = lambda t: f'<span class="ph">{t}</span>'
ORN = '<svg class="orn" viewBox="0 0 560 14" aria-hidden="true"><path d="M0 7 H250 M310 7 H560" stroke="#B08D57" stroke-width="1"/><path d="M268 4 h20 v4 a10 6 0 0 1 -20 0z M288 5 h3 a2 2 0 0 1 0 4 h-3" fill="none" stroke="#B08D57" stroke-width="1.2"/></svg>'
CREDIT = 'Photo: the author, Repair Café Silicon Valley, Billy DeFrank Center, San José, October 18, 2026.'
import os, json, subprocess
_D = os.path.dirname(os.path.abspath(__file__)); _FJS = os.path.join(os.path.dirname(_D), 'sticker', 'frames.js')
FLOWERS = open(os.path.join(_D, 'flowers.txt')).read()
def FR(kind, *args):
    # the same frame builders the web version uses, run once at build time
    js = open(_FJS).read() + f'\nprocess.stdout.write(FR[{json.dumps(kind)}](...{json.dumps(args)}));'
    return subprocess.run(['node', '-e', js], capture_output=True, text=True, check=True).stdout
def fig(k, cap='Caption placeholder: who, what, where.'):
    return f'<figure><img data-photo="{k}" alt="Alt text placeholder"><figcaption><span>{PH(cap)}</span><span class="credit">{CREDIT}</span></figcaption></figure>'
def sec(view, n, label, paras, mid='', end=''):
    ps = ''.join(f'<p>{PH(t)}</p>' for t in paras)
    return f'{ORN}<section data-view="{view}" id="{view}"><div class="kicker">{n} · {label}</div><h2>{PH("Section heading placeholder")}</h2>{ps[:ps.find("</p>")+4]}{mid}{ps[ps.find("</p>")+4:]}{end}</section>'
S = []
S.append(FR('feature', 'feature', PH('Caption placeholder for the feature photograph.'), CREDIT))
S.append(sec('entrance', 1, 'At the entrance', ['Paragraph placeholder: arriving at the door, what you see first, the check-in table.', 'Paragraph placeholder: who comes to a repair café and what they carry in.'], FR('gilt', 'entrance', PH('Caption placeholder: who, what, where.'), CREDIT, 'Billy DeFrank Center', 640)))
S.append(sec('bench', 2, 'At the workbench', ['Paragraph placeholder: the repair underway, the tools on the table, what the fixer is looking for.', 'Paragraph placeholder: what was wrong, and what the fixer tried.'],
  FR('stamp', 'hands', PH('Caption placeholder: who, what, where.'), CREDIT, '№ 1'), '<p><button class="btn" data-act="explode">Lift the stereo apart in the café</button></p>'))
S.append(sec('volunteer', 3, 'Beside the volunteer', ['Paragraph placeholder: the volunteer, in their own words from the interview.', 'Paragraph placeholder: why they keep coming back.'], FR('arch', 'volunteer', PH('Caption placeholder: who, what, where.'), CREDIT, FLOWERS)))
door = ('<div class="door"><div class="panel"><svg viewBox="0 0 140 150" aria-hidden="true"><path d="M20 146 V64 a50 50 0 0 1 100 0 V146 Z" fill="#FFFDFA" stroke="#B08D57" stroke-width="2.5"/><circle cx="70" cy="92" r="7" fill="#1F2B50"/><path d="M65 95 L62 114 H78 L75 95 Z" fill="#1F2B50"/><circle cx="96" cy="100" r="4" fill="#D9BC7A"/></svg>'
        '<div class="row"><button class="btn rose" data-act="openclock">Open the clock</button><button class="linkbtn" data-act="skipclock">Read it without the animation</button></div></div>'
        f'<div class="inside" aria-hidden="true" inert><span class="recon">Told by Jazz · an earlier event</span>{FR("polaroid", "clock", PH("Caption placeholder for the cuckoo clock photograph."), "Photo: [credit].")}<p>{PH("Passage placeholder: the cuckoo clock story, as Jazz told it.")}</p></div></div>')
S.append(sec('clock', 4, 'Inside the clock', ['Paragraph placeholder: a line that leads to the clock on the wall.', 'Paragraph placeholder: what the clock story says about why people repair things.'], door))
S.append(sec('final', 5, 'The final object', ['Paragraph placeholder: the closing scene.', 'Closing paragraph placeholder: the last line of the essay.'],
  FR('ticket', 'final', PH('Caption placeholder for the closing photograph.'), CREDIT, 'Order up · picked up')))
HTML = '\n'.join(S)
