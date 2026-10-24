import asyncio, os
from playwright.async_api import async_playwright
D=os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as pw:
        b=await pw.chromium.launch(); pg=await b.new_page(viewport={'width':1400,'height':900}, device_scale_factor=1)
        errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
        await pg.goto('file://'+D+'/paint_test.html'); await pg.wait_for_timeout(2500); print(await pg.title(), errs)
        await pg.screenshot(path=D+'/_paint.png', full_page=True); await b.close()
asyncio.run(main())
