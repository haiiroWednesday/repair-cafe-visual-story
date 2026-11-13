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
    s=s.replace('--ml:0%;--mt:4%;--mw:100%" loading="lazy"','--ml:0%;--mt:4%;--mw:100%" loading="eager" fetchpriority="high"',1)
    s=s.replace('img/hc_explode.webp','img/hc2_layers.webp').replace('img/hc_back.webp','img/hc2_back.webp')
    s=re.sub(r'<img[^>]*hc2_layers[^>]*>','',s)
    if '<html lang' not in s: s=s.replace('<html','<html lang="en"',1)
    open(p,'w').write(s)
    print(p,len(s))
