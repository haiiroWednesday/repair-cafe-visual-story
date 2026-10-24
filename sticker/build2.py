import os, sys, re, json
D = os.path.dirname(os.path.abspath(__file__)); S = os.path.dirname(D); DI = os.path.join(S, 'diorama')
r = lambda p: open(p).read()
local = '--local' in sys.argv
marks = r(os.path.join(S, 'blend', 'heart2_tray.json'))
t = r(os.path.join(D, 'page2.html'))
for k, v in [('{{FONTS}}', r(os.path.join(DI, 'fonts.css'))), ('{{FRAMES}}', r(os.path.join(D, 'frames.css'))), ('{{PAINT}}', r(os.path.join(DI, 'paint.js'))), ('{{FRAMESJS}}', r(os.path.join(D, 'frames.js'))),
             ('{{ASSETS}}', r(os.path.join(DI, 'assets.json')) + ';\nconst HEART_MARKS = ' + marks + ';\nconst CUCKOO_B64 = "' + __import__('base64').b64encode(open(os.path.join(S, 'cf', 'cuckoo.built.html'), 'rb').read()).decode() + '"'), ('{{APP}}', r(os.path.join(D, 'app2.js')))]:
    t = t.replace(k, v)
if not local:
    t = re.sub(r'<!doctype html>\s*<html[^>]*>\s*<head>\s*<meta charset="utf-8">\s*<meta name="viewport"[^>]*>\s*', '', t, count=1)
    t = t.replace('</head>\n<body>', '', 1).replace('</body>\n</html>', '')
out = os.path.join(D, ('order-up2-local' if local else 'order-up') + '.html'); open(out, 'w').write(t); print(out, os.path.getsize(out) // 1024, 'KB')
