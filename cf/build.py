import os, re
D = os.path.dirname(os.path.abspath(__file__))
page = open(os.path.join(D, 'cuckoo.html')).read(); core = open(os.path.join(D, 'core.js')).read()
page = page.replace('<script src="core.js"></script>', '<script>\n' + core + '\n</script>')
page = page.replace('<!--FONTS-->', '<style>' + open(os.path.join(D, 'fonts_min.css')).read() + '</style>')
open(os.path.join(D, 'cuckoo.built.html'), 'w').write(page); print(len(page) // 1024, 'KB')
