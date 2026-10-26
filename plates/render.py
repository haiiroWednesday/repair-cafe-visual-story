import sys, os, asyncio
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.abspath(__file__))
async def main(names, scale):
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        for n in names:
            pg = await b.new_page(viewport={'width': 2000, 'height': 2000}, device_scale_factor=scale)
            errs = []
            pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
            pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.goto(f'file://{D}/shell.html?a={n}')
            await pg.wait_for_function('window.__ready === true', timeout=20000)
            await pg.evaluate('document.fonts.ready')
            await pg.evaluate("Promise.all([...document.images].map(i=>i.decode&&i.decode().catch(()=>0)))")
            await pg.wait_for_timeout(500)
            e = await pg.query_selector('#a')
            out = f'{D}/out/{n}.png'
            await e.screenshot(path=out, omit_background=True)
            print('shot', n, errs[:3])
            await pg.close()
        await b.close()
names = [a for a in sys.argv[1:] if not a.startswith('--')]
asyncio.run(main(names, 2 if '--hi' in sys.argv else 1))
