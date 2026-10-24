import asyncio, os, sys
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        for name, q, wait in [a.split('|') for a in sys.argv[1:]]:
            pg = await b.new_page(viewport={'width': 800, 'height': 900}, device_scale_factor=1.5)
            await pg.goto(f'file://{D}/cuckoo.built.html?{q}'); await pg.wait_for_timeout(int(wait))
            err = await pg.evaluate("document.documentElement.dataset.errors || ''")
            html = await pg.content(); nan = 'NaN' in html
            await pg.screenshot(path=f'{D}/s_{name}.png'); print(name, 'errors:', err, 'NaN' if nan else ''); await pg.close()
        await b.close()
asyncio.run(main())
