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
    for a,b in G:
        if b in s: continue
        if a not in s: continue   # already superseded by a later patch
        assert s.count(a)==1,a
        s=s.replace(a,b)
    s=s.replace('--ml:0%;--mt:4%;--mw:100%" loading="lazy"','--ml:0%;--mt:4%;--mw:100%" loading="eager" fetchpriority="high"',1)
    s=s.replace('img/hc_back.webp','img/hc2_back.webp')
    if 'src="img/hc_explode.webp"' not in s:
        m=re.search(r'<img[^>]*hc2_back[^>]*>',s); s=s[:m.start()]+open('/home/claude/v70/hc_tag.txt').read()+s[m.start():]
    s=re.sub(r'img/(fr_(?:feature|group|bench|stitch|heart)\.webp)',r'img/g_\1',s).replace('data-photo="clock"','data-photo="g_clock"')
    if '<html lang' not in s: s=s.replace('<html','<html lang="en"',1)
    open(p,'w').write(s)
    print(p,len(s))
