import asyncio, os, sys
from playwright.async_api import async_playwright
D=os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as pw:
        b=await pw.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--allow-file-access-from-files'])
        for s in sys.argv[1:]:
            pg=await b.new_page(viewport={'width':900,'height':700}); errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
            await pg.goto('file://'+D+'/b.html#'+s); await pg.wait_for_timeout(5000)
            print(s, await pg.title(), errs[:3]); await pg.screenshot(path=D+f'/{s}.png'); await pg.close()
        await b.close()
asyncio.run(main())
