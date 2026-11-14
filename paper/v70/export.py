# One self-contained HTML file of the paper edition: every picture the page shows is inside the file.
# Pictures that only hidden parts use become a 1px placeholder (the parts stay in the page, as on the site).
# usage: python3 export.py [out.html]
import re, os, sys, io, json, base64
from PIL import Image
SRC = '/home/claude/mochi/repair/'
OUT = sys.argv[1] if len(sys.argv) > 1 else '/home/claude/out/repair-cafe-who-decides.html'
USED = set(json.load(open('/tmp/claude-0/-home-claude/ee5cc871-c0b1-559a-a1f7-dca096f49e11/scratchpad/used.json')))
KEEP_ANYWAY = {'img/odds_stand.webp'}           # swapped in by script; small enough to keep safe
USED -= {'img/wy_glass_brown_c.webp', 'img/wy_glass_empty_c.webp'}   # v98: the glass is hidden (the teacup replaced it); it stays on the site, not in the one-file copy
s = open(SRC + 'index.html').read()
PAT = r'img/[A-Za-z0-9_\-\.]+\.(?:webp|png|jpg|jpeg|gif)'
refs = set(re.findall(PAT, s))
TPL = {'img/s3_${n}.webp': ('img/s3_', 'n', '.webp'), 'img/wy_o_${m.img}.webp': ('img/wy_o_', 'm.img', '.webp')}
tpl_files = {f'img/s3_{n}.webp' for n in range(10)} | {'img/' + f for f in os.listdir(SRC + 'img') if f.startswith('wy_o_')}
GIF = 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
cache = {}
def enc(path):
    if path in cache: return cache[path]
    if path not in USED and path not in KEEP_ANYWAY:
        cache[path] = 'data:image/gif;name=%s;base64,%s' % (path, GIF); return cache[path]
    raw = open(SRC + path, 'rb').read()
    im = Image.open(io.BytesIO(raw)); im.load()
    if im.mode in ('RGBA', 'LA', 'P'):
        im = im.convert('RGBA')
        if im.getchannel('A').getextrema()[0] == 255: im = im.convert('RGB')
    else: im = im.convert('RGB')
    q = 78 if path.endswith(('.jpg', '.jpeg')) else 80
    b = io.BytesIO(); im.save(b, 'WEBP', quality=q, method=4); new = b.getvalue()
    data, mime = (new, 'image/webp') if len(new) < len(raw) else (raw, 'image/' + ('jpeg' if path.endswith(('jpg', 'jpeg')) else path.rsplit('.', 1)[1]))
    cache[path] = 'data:%s;name=%s;base64,%s' % (mime, path, base64.b64encode(data).decode())
    return cache[path]
var = lambda p: '--i_' + re.sub(r'[^A-Za-z0-9_]', '_', p[4:].rsplit('.', 1)[0])
# 1. url(img/x) anywhere (stylesheets, style attributes, styles built in script) -> one CSS variable per picture
used_vars = {}
def url_sub(m):
    p = m.group(2); used_vars[p] = 1; return 'var(%s)' % var(p)
s = re.sub(r'url\(\s*([\'"]?)(' + PAT + r')\1\s*\)', url_sub, s)
# 2. script templates -> a lookup table
for t, (a, k, z) in TPL.items():
    s = s.replace(t, '${__I[\'%s\'+%s+\'%s\']}' % (a, k, z))
# 2b. pictures named by script at run time
s = s.replace("im.src = 'img/' + im.dataset.photo + '.jpg';", "im.src = __I['img/' + im.dataset.photo + '.jpg'];")
s = s.replace("xpOpen('img/pl_' + b.dataset.pl + '.webp'", "xpOpen(''").replace("xpOpen('img/x_' + b.dataset.x + '.webp'", "xpOpen(''")   # the zoom viewer is switched off on the page
tpl_files |= {'img/' + x + '.jpg' for x in re.findall(r'data-photo="([^"]+)"', s)}
s = s.replace("e.src='img/o_'+ic+'.webp';", "e.src=__I['img/o_'+ic+'.webp'];")
tpl_files |= {'img/o_%s.webp' % k for k in ('laptop','radio','coffeemaker','trousers','coat','bike')}
# 3. every other mention (src attributes, strings in script) -> the data itself
s = re.sub(PAT, lambda m: enc(m.group(0)), s)
root = ':root{' + ';'.join('%s:url("%s")' % (var(p), enc(p)) for p in sorted(used_vars)) + '}'
table = 'window.__I=' + json.dumps({p: enc(p) for p in sorted(tpl_files)}) + ';'
head = '<style id="inline-pictures">' + root + '</style><script>' + table + '</script>'
s = s.replace('<head>', '<head>' + head, 1) if '<head>' in s else re.sub(r'(<head[^>]*>)', r'\1' + head, s, count=1)
chk = re.sub(r'name=img/[^;]+;', '', re.sub(r'[A-Za-z0-9+/=]{120,}', '', s.replace(table, ''))).replace("__I['img/", '')
assert 'img/' not in chk, re.findall(r'.{30}img/.{30}', chk)[:5]
open(OUT, 'w').write(s)
kept = [p for p in cache if not cache[p].startswith('data:image/gif')]
print(OUT, '%.2f MB' % (len(s.encode()) / 1e6), 'pictures inside:', len(kept), 'placeholders:', len(cache) - len(kept))
