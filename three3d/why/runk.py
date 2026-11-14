import asyncio, json, sys, base64, os
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
async def main(stages, outdir, job):
    os.makedirs(outdir, exist_ok=True)
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        pg = await b.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        await pg.goto('file://' + D + '/props_kin.html'); await pg.wait_for_timeout(300)
        for st in stages:
            j = dict(job); j['stage'] = st
            res = await pg.evaluate('j=>render(j)', j)
            open(os.path.join(outdir, 'k%d.png' % st), 'wb').write(base64.b64decode(res['url'].split(',')[1]))
            if res['meta']: json.dump(res['meta'], open(os.path.join(outdir, 'k.json'), 'w'))
            sw = await pg.evaluate('window.__sw||null')
            if sw:
                for i, u in enumerate(sw): open(os.path.join(outdir, 'sw%d.png' % i), 'wb').write(base64.b64decode(u.split(',')[1]))
            print('ok', st)
        print('errors', errs); await b.close()
job = {"kind": "kintsugi", "w": 900, "h": 760, "dist": 3.9, "ty": .33, "el": .3, "az": -.3, "fov": 26}
job.update(json.loads(sys.argv[3]) if len(sys.argv) > 3 else {})
asyncio.run(main([int(a) for a in sys.argv[1].split(',')], sys.argv[2], job))
