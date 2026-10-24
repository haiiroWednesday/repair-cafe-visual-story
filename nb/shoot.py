import asyncio, sys, json
from playwright.async_api import async_playwright
URL = 'http://localhost:8790/test.html'
async def main():
    W, H = int(sys.argv[1]), int(sys.argv[2]); pages = json.loads(sys.argv[3]); pre = sys.argv[4] if len(sys.argv) > 4 else 'd'
    act = sys.argv[5] if len(sys.argv) > 5 else ''
    async with async_playwright() as pw:
        b = await pw.chromium.launch(); pg = await b.new_page(viewport={'width': W, 'height': H}, device_scale_factor=1)
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        await pg.goto(URL); await pg.wait_for_timeout(500)
        await pg.evaluate('window.__nb.open()'); await pg.wait_for_timeout(1500)
        for p in pages:
            await pg.evaluate(f'window.__nb.go({p})'); await pg.wait_for_timeout(2200)
            if act: await pg.evaluate(act); await pg.wait_for_timeout(1400 if act else 0)
            await pg.screenshot(path=f'shots/{pre}_{p}.png')
        print('errors', errs[:5]); await b.close()
asyncio.run(main())
