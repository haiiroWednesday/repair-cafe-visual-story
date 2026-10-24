import asyncio, os
from playwright.async_api import async_playwright
D=os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as pw:
        b=await pw.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files'])
        pg=await b.new_page(viewport={'width':1440,'height':900})
        await pg.goto('file://'+D+'/repair-teapot-local.html', wait_until='commit', timeout=120000)
        await pg.wait_for_function('window.__dio', timeout=120000); await pg.evaluate('window.__dio.setOpen()'); await pg.wait_for_timeout(1500)
        await pg.evaluate("document.getElementById('exploreBtn').click()"); await pg.wait_for_timeout(3000)
        print(await pg.evaluate("[...document.querySelectorAll('.hot')].map(h=>h.style.left+','+h.style.top+','+h.style.visibility).join(' | ')"))
        await b.close()
asyncio.run(main())
