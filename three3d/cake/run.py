import asyncio, json, sys, base64, os
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
JOB = {"kind": "cake3", "w": 820, "h": 640, "pr": 1, "dist": 3.5, "ty": .27, "el": .36, "az": 0.0001, "fov": 26,
       "dims": {"r1": .4, "r2": .27, "y1": .3, "y2": .56, "rc": .336},
       "probe": [["a", 0, 0, .4], ["b", .4, .3, 0], ["c", -.2, .56, .1], ["d", 0, .72, .15]]}
async def main(turns, outdir):
    os.makedirs(outdir, exist_ok=True)
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        pg = await b.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        await pg.goto('file://' + D + '/props_cake.html'); await pg.wait_for_timeout(300)
        for i, t in enumerate(turns):
            j = dict(JOB); j['turn'] = t
            res = await pg.evaluate('j=>render(j)', j)
            open(os.path.join(outdir, 'f%02d.png' % i), 'wb').write(base64.b64decode(res['url'].split(',')[1]))
            if i == 0: json.dump({'job': JOB, 'marks': res['meta']}, open(os.path.join(outdir, 'meta.json'), 'w'))
        print('frames', len(turns), 'errors', errs); await b.close()
n = int(sys.argv[1]); asyncio.run(main([30 * k / n for k in range(n)], sys.argv[2]))
