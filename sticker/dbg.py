import asyncio, os, sys
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(); pg = await b.new_page(viewport={'width': 1440, 'height': 900})
        await pg.goto('file://' + D + '/order-up2-local.html', wait_until='commit'); await pg.wait_for_function('window.__ok', timeout=90000)
        print(await pg.evaluate(sys.argv[1]))
        await b.close()
asyncio.run(main())
