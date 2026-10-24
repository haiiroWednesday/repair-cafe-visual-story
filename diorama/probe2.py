import asyncio, os, sys
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files'])
        pg = await b.new_page(viewport={'width':1440,'height':900})
        await pg.goto('file://'+D+'/repair-teapot-local.html'); await pg.wait_for_function('window.__dio', timeout=60000)
        await pg.evaluate('window.__dio.setOpen()'); await pg.wait_for_timeout(300)
        print(await pg.evaluate(sys.argv[1]))
        await b.close()
asyncio.run(main())
