import asyncio, os
from playwright.async_api import async_playwright
D=os.path.dirname(os.path.abspath(__file__))
async def main():
    async with async_playwright() as pw:
        b=await pw.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files'])
        pg=await b.new_page(viewport={'width':1440,'height':900}); errs=[]
        pg.on('pageerror',lambda e: errs.append(str(e))); pg.on('console',lambda m: errs.append(m.type+': '+m.text) if m.type in('error','warning') else None)
        await pg.goto('file://'+D+'/repair-teapot-local.html', wait_until='commit', timeout=120000); await pg.wait_for_timeout(70000)
        print('\n'.join(errs[:20])); print(await pg.evaluate('!!window.__dio'))
        await pg.screenshot(path=D+'/_dbg.png'); await b.close()
asyncio.run(main())
