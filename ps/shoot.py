import asyncio, os, sys, json, base64
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.abspath(__file__)); O = os.path.join(D, 'out'); os.makedirs(O, exist_ok=True)
JOBS = json.loads(open(sys.argv[1]).read())
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width': 2000, 'height': 1400}); errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text))
        await pg.goto('file://' + D + '/ps.html'); await pg.wait_for_function('window.__ready')
        for name, p, w, h in JOBS:
            url = await pg.evaluate(f'window.renderPaper({json.dumps(p)}, {w}, {h})')
            open(os.path.join(O, name + '.png'), 'wb').write(base64.b64decode(url.split(',')[1])); print('ok', name)
        print('log', errs[:4]); await b.close()
asyncio.run(main())
