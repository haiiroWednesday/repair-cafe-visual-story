import asyncio, os
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        for W,H in [(1440,900),(390,844)]:
            pg = await b.new_page(viewport={'width': W, 'height': H})
            await pg.goto('file://' + D + '/order-up2-local.html', wait_until='commit'); await pg.wait_for_function('window.__ok', timeout=90000)
            await pg.add_style_tag(content='html{scroll-behavior:auto!important}'); await pg.wait_for_timeout(2500)
            await pg.evaluate("document.querySelector('.cfwrap').scrollIntoView()"); await pg.wait_for_timeout(800)
            await pg.screenshot(path=f'{D}/shots2/cf_{W}.png')
            await pg.evaluate("document.querySelector('.matf').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(500)
            await pg.screenshot(path=f'{D}/shots2/mat_{W}.png')
        await b.close()
asyncio.run(main())
