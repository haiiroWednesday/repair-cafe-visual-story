import re,sys
css=open('/home/claude/v70/v70.css').read(); js=open('/home/claude/v70/v70.js').read().replace('__EDGES__',open('/home/claude/v70/edges.json').read())
import json as _j
_rb=_j.load(open('/home/claude/v70/rb.json'))
for _i in range(3): js=js.replace('__RB%d__'%_i,_j.dumps(_rb[_i]))
block='<!--v70-->\n<style id="v70">\n'+css+'\n</style>\n<script id="v70js">\n'+js+'\n</script>\n<!--/v70-->\n'
A='<div id="pal" aria-hidden="true">'
targets=sys.argv[1:] or ['/home/claude/mochi/repair/index.html']
for p in targets:
    s=open(p).read()
    s=re.sub(r'<!--v70-->.*?<!--/v70-->\n','',s,flags=re.S)
    assert s.count(A)==1
    s=s.replace(A,block+A)
    s=s.replace("setTimeout(()=>{ tk.classList.add('away'); pin(st); }, 1500);","setTimeout(()=>{ tk.classList.add('away'); pin(st); }, 3400);").replace("else finish(); }, 2100);","else finish(); }, 4000);")
    s0=s
    G=[("setTimeout(()=>{ tk.classList.add('away'); pin(st); }, 3400);","setTimeout(()=>{ tk.classList.add('away'); pin(st); }, 1900);"),("else finish(); }, 4000);","else finish(); }, 2560);"),
       ("note.textContent=''; odds.classList.remove('on'); tools.forEach(b=>b.classList.remove('out'));\n}","tools.forEach(b=>b.classList.remove('out')); delete tk.dataset.st;\n}"),
       ("if(st===0){ q.textContent=","note.textContent=''; odds.classList.remove('on'); if(st===0){ q.textContent="),
       ("q.textContent=t.hint; q.classList.add('no'); return; }","q.textContent=t.hint; q.classList.add('no'); F.dataset.miss=1; return; }"),
       ("tk.querySelector('.tstamp').textContent=t.fixed?'FIXED':'';","tk.dataset.st=st; tk.querySelector('.tstamp').textContent=S[st].toUpperCase()+(t.fixed?' · FIXED':''); if(!F.dataset.miss) F.dataset.clean=(+F.dataset.clean||0)+1; delete F.dataset.miss;"),
       ("q.textContent='Every ticket has a table.';","q.textContent='Every ticket has a table. '+(+F.dataset.clean||0)+' of '+T.length+' on the first try.';"),
       ("again.addEventListener('click',()=>{ if(ed())return; i=0;","again.addEventListener('click',()=>{ if(ed())return; i=0; F.dataset.clean=0;"),
       ("'Which table takes it? Tap an apron.'","'Which table takes it? Drag the ticket to an apron, or tap one.'"),
       ("<p class=\"enc\">Photo and illustration: Cynthia.</p>","<p class=\"enc\">A volunteer and the clock\u2019s owner look it over together. Photo and illustration: Cynthia.</p>")]
    G.append(("let best=ids[0];for(const k of ids){const el=document.getElementById(k);if(el&&el.getBoundingClientRect().top<innerHeight*.45)best=k}","let best=ids[0],bt=-1e9;for(const k of ids){const el=document.getElementById(k);if(!el||(k!=='top'&&!el.offsetParent))continue;const t=el.getBoundingClientRect().top;if(t<innerHeight*.45&&t>bt){bt=t;best=k}}"))
    s=s.replace('img/g_fr_volunteer.webp','img/fr_volunteer.webp')
    G.append(("<p>My stereo dated from August 2003. Its two units were connected by a cable containing twenty separate wires. At bench 2, the cover came off, and every wire was stripped and soldered back onto its pin by hand.</p>","<p>At a Repair Café in San José, I brought in something considerably older: a stereo manufactured in August 2003.<span class=\"pbr\">It had two units connected by a single control cable. Inside that cable were twenty separate wires, all of which needed to be reconnected. A replacement cable wasn’t available, so at bench 2, a volunteer opened the stereo, stripped the wires, and soldered them back onto their pins by hand.</span><span class=\"pbr\">The work demanded twenty small connections in a machine that was already twenty-three years old.</span></p>"))
    # v86: her yes on the stereo, the history and the close
    G.append(("so at bench 2, a volunteer opened the stereo","so at bench 2, a volunteer named Jazz opened the stereo"))
    G.append(("twenty-three years old.</span></p>","twenty-three years old.</span><span class=\"pbr\">When he finished, the blue ring on the lid lit up.</span></p>"))
    G.append(("history. Inspired, she began recruiting volunteer repairers, starting with a friend’s handy husband. A carpenter, a seamstress, and others followed.</p>","history.<span data-v7hidden=\"1\" style=\"display:none\"> Inspired, she began recruiting volunteer repairers, starting with a friend’s handy husband. A carpenter, a seamstress, and others followed.</span></p>"))
    # v87: Jazz is introduced once, at the stereo
    G.append(("Jazz, a volunteer I spoke with, told me about another clock","Jazz told me about another clock"))
    # v88: the game plays three tickets (trousers, fan, her stereo); all seven stay in the page as T_ALL
    G.append(("const T=[{\"t\": \"\", \"item\": \"Trousers\"","const T_ALL=[{\"t\": \"\", \"item\": \"Trousers\""))
    G.append(("opened at the appliance table.\"}], S=[\"check-in\"","opened at the appliance table.\"}], T=[0,2,1].map(k=>T_ALL[k]), S=[\"check-in\""))
    G.append(("<span class=\"apn\">1</span> of 7 tickets","<span class=\"apn\">1</span> of 3 tickets"))
    # v90: plain language in the small print (her request: no "not percentages", nothing stiff)
    G.append(('<text class="lyh" x="985" y="640">WHY VISITORS CAME</text><text class="lyh" x="985" y="664">FARNHAM REPAIR CAFÉ, ENGLAND, 2016</text><text class="lyh lyh2" x="985" y="688">Each layer is as thick as its</text><text class="lyh lyh2" x="985" y="712">weighted ranking score.</text><text class="lyh lyh2" x="985" y="736">The scores are not percentages.</text>',
              '<text class="lyh" x="985" y="640">FARNHAM REPAIR CAFÉ, ENGLAND, 2016</text><text class="lyh" x="985" y="664">37 VISITORS AND VOLUNTEERS</text><text class="lyh lyh2" x="985" y="688">The thicker the layer,</text><text class="lyh lyh2" x="985" y="712">the higher people ranked it.</text><text class="lyh lyh2" x="985" y="736"></text>'))
    G.append(('<p class="enc">Historical quotations: attributed to their original speakers and publications. <a class="src" href="https://cfsd.org.uk/site-pdfs/Farnham%20Repair%20Cafe%20Survey%202016.pdf" target="_blank" rel="noopener">Farnham survey</a> figures are weighted ranking scores, not percentages.</p>',
              '<p class="enc">Quotes: Verde Magazine, Alta Journal and Stanford Magazine, 2012 to 2020. Survey: <a class="src" href="https://cfsd.org.uk/site-pdfs/Farnham%20Repair%20Cafe%20Survey%202016.pdf" target="_blank" rel="noopener">Centre for Sustainable Design</a>, 2016.</p>'))
    G.append(('Illustration: Cynthia. Exterior details and cable arrangement based on photographs of the stereo; internal CD components are representative.',
              'Illustration: Cynthia, from photos of the stereo. The CD parts inside follow a typical player.'))
    G.append(('Photos and illustrations: Cynthia. The aprons represent check-in, sewing, appliance repair, mechanical repair, electronics, and special skills.','Photos and illustrations: Cynthia.'))
    G.append(('</a>, recording 13,609 repairs at 67 participating cafés in eight countries.</figcaption>','</a>, 13,609 repairs logged at 67 Repair Cafés in eight countries.</figcaption>'))
    G.append(('<p class="dq">Which table takes it? Tap an apron.</p>','<p class="dq">Tap an apron.</p>'))
    G.append(("'Which table takes it? Drag the ticket to an apron, or tap one.'","'Drag the ticket to an apron, or tap one.'"))
    G.append(('"fact": "Worldwide, 96 in 100','"fact": "At Repair Cafés, 96 in 100'))
    G.append(('"fact": "Worldwide, 53 in 100','"fact": "At Repair Cafés, 53 in 100'))
    G.append(('"fact": "Worldwide, more than 80 in 100','"fact": "At Repair Cafés, more than 80 in 100'))
    for a,b in G:
        if b in s: continue
        if a not in s: continue   # already superseded by a later patch
        assert s.count(a)==1,a
        s=s.replace(a,b)
    # v90b: plain, true labels on the coffee glass and the hero caption (replace everywhere)
    for a,b in [("reason: 'ranks 2 to 5', rank: 'not broken out · band not to scale'","reason: 'meeting people, learning, helping the café', rank: 'ranks 2 to 5'"),
                ("'not broken out · band not to scale'","''"),
                ("reason: 'ranks 2 to 5', rank: 'meeting people, learning to repair, helping the café'","reason: 'meeting people, learning, helping the café', rank: 'ranks 2 to 5'"),
                ("'meeting people, learning to repair, helping the café'","''"),
                ("reason: 'meeting people, learning, helping the café'","reason: 'meeting people, learning, the café'"),
                ('<text class="lyh lyh2" x="985" y="736"></text>','<text class="lyh lyh2" x="985" y="736">Ranks 2 to 5 share one layer.</text>'),
                ('>The marbled band holds four.</text>','>Ranks 2 to 5 share one layer.</text>'),
                ('A rainbow of light fell across my shoes','A rainbow fell across my shoes'),
                ('Photos and illustrations: Cynthia. The aprons represent check-in, sewing, appliance repair, mechanical repair, electronics, and special skills.','Photos and illustrations: Cynthia.'),
                ('a band of iridescent light falling across them','a rainbow falling across them')]:
        s=s.replace(a,b)
    s=s.replace('--ml:0%;--mt:4%;--mw:100%" loading="lazy"','--ml:0%;--mt:4%;--mw:100%" loading="eager" fetchpriority="high"',1)
    s=s.replace('img/hc_back.webp','img/hc2_back.webp')
    if 'src="img/hc_explode.webp"' not in s:
        m=re.search(r'<img[^>]*hc2_back[^>]*>',s); s=s[:m.start()]+open('/home/claude/v70/hc_tag.txt').read()+s[m.start():]
    s=re.sub(r'img/(fr_(?:feature|group|bench|stitch|heart)\.webp)',r'img/g_\1',s).replace('data-photo="clock"','data-photo="g_clock"')
    if '<html lang' not in s: s=s.replace('<html','<html lang="en"',1)
    # v95 polish: sources note names only the person still in the story; tab title and link preview for the public copies
    s=s.replace('Aaron and Jazz: my conversations at Repair Caf\u00e9 Silicon Valley, Oct. 18, 2026.','Jazz: my conversation at Repair Caf\u00e9 Silicon Valley, Oct. 18, 2026.')
    if '/art/' not in p:
        s=s.replace('<title>The Repair Caf\u00e9, on paper</title>','<title>Who Decides What\u2019s Worth Saving? \u00b7 Cynthia</title><meta property="og:title" content="Who Decides What\u2019s Worth Saving?"><meta property="og:type" content="article"><meta property="og:image" content="https://haiirowednesday.github.io/mochi/repair/img/g_fr_feature.webp"><meta name="twitter:card" content="summary_large_image">',1)
    open(p,'w').write(s)
    print(p,len(s))
