import asyncio, os, sys, json, base64
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.join(os.path.dirname(D), 'diorama', 'repair-teapot-local.html')
SHOTS = json.loads(sys.argv[1])
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files'])
        pg = await b.new_page(viewport={'width': 1400, 'height': 900}); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file://' + SRC, wait_until='commit', timeout=120000); await pg.wait_for_function('window.__dio', timeout=120000)
        await pg.evaluate('window.__dio.setOpen()'); await pg.wait_for_timeout(6000)
        for name, tgt, opt in SHOTS:
            url = await pg.evaluate(f"window.__dio.snap({json.dumps(tgt)}, {json.dumps(opt)})")
            open(os.path.join(D, 'raw', name + '.png'), 'wb').write(base64.b64decode(url.split(',')[1])); print('ok', name)
        print('errors', errs[:3]); await b.close()
asyncio.run(main())
