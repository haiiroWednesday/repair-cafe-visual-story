"""Render drawn café objects (objSVG) to transparent PNGs using the built page's own filters."""
import asyncio, os, sys
from playwright.async_api import async_playwright
C = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'cafe')
IDS = ['stereo']
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(); pg = await b.new_page(device_scale_factor=2)
        await pg.goto('file://' + os.path.join(C, 'index.html')); await pg.wait_for_timeout(1500)
        await pg.add_style_tag(content='html,body{background:transparent!important;background-image:none!important} body>*:not(.cap){visibility:hidden!important} body>*:not(.cap) *{visibility:hidden!important} .cap,.cap *{visibility:visible!important}')
        for i in IDS:
            await pg.evaluate("""id => { document.body.querySelectorAll('.cap').forEach(e => e.remove());
              const d = document.createElement('div'); d.className = 'cap'; d.style.cssText = 'position:fixed;left:0;top:0;width:260px;height:260px;z-index:99999;background:transparent;padding:10px';
              d.innerHTML = objSVG(id, 240); document.body.appendChild(d); }""", i)
            await pg.wait_for_timeout(120)
            await pg.locator('.cap').screenshot(path=os.path.join(os.path.dirname(os.path.abspath(__file__)), f'assets/obj_{i}.png'), omit_background=True)
        await b.close()
asyncio.run(main()); print('ok')
