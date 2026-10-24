import os, sys
D = os.path.dirname(os.path.abspath(__file__)); S = os.path.dirname(D)
local = '--local' in sys.argv
t = open(os.path.join(D, 'template.html')).read()
three = 'file://' + os.path.join(S, 'three3d/package/build/three.min.js') if local else 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js'
t = t.replace('{{THREE}}', three).replace('{{LIB}}', open(os.path.join(D, 'lib3d.js')).read())
t = t.replace('{{ASSETS}}', open(os.path.join(D, 'assets.json')).read()).replace('{{APP}}', open(os.path.join(D, 'app.js')).read())
out = os.path.join(D, 'repair-cafe-popup' + ('-local' if local else '') + '.html')
open(out, 'w').write(t); print(out, os.path.getsize(out) // 1024, 'KB')
