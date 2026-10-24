"""Screenshot the prototype at each stop (and a few states) with software WebGL."""
import asyncio, os, sys, json
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.abspath(__file__)); O = os.path.join(D, 'shots2'); os.makedirs(O, exist_ok=True)
W, H = (int(sys.argv[1]), int(sys.argv[2])) if len(sys.argv) > 2 else (1440, 900)
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'])
        pg = await b.new_page(viewport={'width': W, 'height': H})
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        await pg.goto('file://' + os.path.join(D, 'repair-teapot-local.html')); await pg.wait_for_function('window.__dio', timeout=90000); await pg.wait_for_timeout(1500)
        tag = f'{W}x{H}'
        await pg.screenshot(path=f'{O}/{tag}_0_intro.png')
        await pg.evaluate('window.__dio.setOpen()'); await pg.wait_for_timeout(500)
        for i in range(5):
            await pg.evaluate(f'window.__dio.go({i})'); await pg.wait_for_timeout(2600)
            await pg.screenshot(path=f'{O}/{tag}_{i + 1}.png')
            if i == 3:
                await pg.evaluate('window.__dio.openClock()'); await pg.wait_for_timeout(2600)
                await pg.screenshot(path=f'{O}/{tag}_4b_open.png')
        await pg.evaluate('window.__dio.go(1)'); await pg.wait_for_timeout(2400)
        await pg.evaluate("window.__dio.act('explode')"); await pg.wait_for_timeout(2600)
        await pg.screenshot(path=f'{O}/{tag}_2b_explode.png')
        await pg.evaluate('window.__dio.explore(true)'); await pg.wait_for_timeout(1500)
        await pg.screenshot(path=f'{O}/{tag}_6_explore.png')
        print('errors:', errs[:8]); await b.close()
asyncio.run(main())
