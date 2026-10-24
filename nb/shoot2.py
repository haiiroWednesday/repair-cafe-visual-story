import asyncio, sys
from playwright.async_api import async_playwright
async def main():
    W, H, pre = int(sys.argv[1]), int(sys.argv[2]), sys.argv[3]
    async with async_playwright() as pw:
        b = await pw.chromium.launch(); pg = await b.new_page(viewport={'width': W, 'height': H})
        errs = []; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        await pg.goto('http://localhost:8765/index.html'); await pg.wait_for_timeout(1500)
        await pg.screenshot(path=f'shots/{pre}_top.png')
        await pg.evaluate("document.documentElement.style.scrollBehavior='auto';document.getElementById('notebook-s').scrollIntoView()"); await pg.wait_for_timeout(1200)
        await pg.screenshot(path=f'shots/{pre}_teaser.png')
        await pg.click('.nbBtn'); await pg.wait_for_timeout(1800); await pg.screenshot(path=f'shots/{pre}_open.png')
        for k in range(3): await pg.click('#nbNext'); await pg.wait_for_timeout(1300)
        await pg.wait_for_timeout(800); await pg.screenshot(path=f'shots/{pre}_n3.png')
        await pg.click('#nbX'); await pg.wait_for_timeout(500); await pg.screenshot(path=f'shots/{pre}_closed.png')
        print('errors', errs[:5]); await b.close()
asyncio.run(main())
