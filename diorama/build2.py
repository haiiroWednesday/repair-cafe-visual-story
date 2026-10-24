import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
D = os.path.dirname(os.path.abspath(__file__)); S = os.path.dirname(D)
local = '--local' in sys.argv
r = lambda f: open(os.path.join(D, f)).read()
t = r('template4.html')
import sections
t = t.replace('{{SECTIONS}}', sections.HTML)
FRCSS = open(os.path.join(S, 'sticker', 'frames.css')).read() + '''
.fr img.ph-img{border-radius:0;background:none}
.fr.tall img.ph-img{width:100%;max-height:none;margin:0}
.stampf .body{background:radial-gradient(circle at 7px 7px,var(--ground) 4.6px,#FFFFFF 5.2px) -7px -7px/14px 14px}
.fr figcaption{display:block}
.door .polaf{margin-top:30px}
'''
t = t.replace('</style>', FRCSS + '</style>', 1)
three = 'file://' + os.path.join(S, 'three3d/package/build/three.min.js') if local else 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js'
for k, v in [('{{FONTS}}', r('fonts.css')), ('{{THREE}}', three), ('{{LIB}}', r('lib3d.js')), ('{{PAINT}}', r('paint.js')), ('{{ASSETS}}', r('assets.json')), ('{{APP}}', r(os.environ.get('APPJS','app2.js')))]:
    t = t.replace(k, v)
if not local:
    import re
    t = re.sub(r'<!doctype html>\s*<html[^>]*>\s*<head>\s*<meta charset="utf-8">\s*<meta name="viewport"[^>]*>\s*', '', t, count=1)
    t = t.replace('</head>\n<body>', '', 1).replace('</body>\n</html>', '')
out = os.path.join(D, 'repair-teapot' + ('-local' if local else '') + '.html'); open(out, 'w').write(t); print(out, os.path.getsize(out) // 1024, 'KB')
