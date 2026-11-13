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
    for a,b in G:
        if b in s: continue
        assert s.count(a)==1,a
        s=s.replace(a,b)
    s=s.replace('--ml:0%;--mt:4%;--mw:100%" loading="lazy"','--ml:0%;--mt:4%;--mw:100%" loading="eager" fetchpriority="high"',1)
    s=s.replace('img/hc_back.webp','img/hc2_back.webp')
    if 'src="img/hc_explode.webp"' not in s:
        m=re.search(r'<img[^>]*hc2_back[^>]*>',s); s=s[:m.start()]+open('/home/claude/v70/hc_tag.txt').read()+s[m.start():]
    s=re.sub(r'img/(fr_(?:feature|group|bench|stitch|volunteer|heart)\.webp)',r'img/g_\1',s).replace('data-photo="clock"','data-photo="g_clock"')
    if '<html lang' not in s: s=s.replace('<html','<html lang="en"',1)
    open(p,'w').write(s)
    print(p,len(s))
