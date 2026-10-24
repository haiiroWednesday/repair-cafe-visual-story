import asyncio, os, sys
from playwright.async_api import async_playwright
D=os.path.dirname(os.path.abspath(__file__)); O=os.path.join(D,'shots4'); os.makedirs(O,exist_ok=True)
W,H=(int(sys.argv[1]),int(sys.argv[2])) if len(sys.argv)>2 else (1440,900)
async def main():
    async with async_playwright() as pw:
        b=await pw.chromium.launch(timeout=60000,args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files'])
        pg=await b.new_page(viewport={'width':W,'height':H}); errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
        await pg.goto('file://'+D+'/repair-teapot-local.html', wait_until='commit', timeout=120000)
        await pg.wait_for_function('window.__dio', timeout=120000); await pg.wait_for_timeout(1000)
        tag=f'{W}x{H}'
        
        await pg.evaluate('window.__dio.setOpen()'); await pg.wait_for_timeout(2500)
        await pg.screenshot(timeout=120000,path=f'{O}/{tag}_1hero.png')
        for i,v in enumerate(['bench','clock']):
            await pg.evaluate(f"document.getElementById('{v}').scrollIntoView({{block:'start'}})"); await pg.wait_for_timeout(2800)
            await pg.screenshot(timeout=120000,path=f'{O}/{tag}_{i+2}_{v}.png')
            if v=='clock':
                await pg.evaluate("document.querySelector('[data-act=openclock]').click()"); await pg.wait_for_timeout(2600)
                await pg.screenshot(timeout=120000,path=f'{O}/{tag}_5b_clockopen.png')
        await pg.evaluate("document.getElementById('exploreBtn').click()"); await pg.wait_for_timeout(2500)
        await pg.screenshot(timeout=120000,path=f'{O}/{tag}_8_explore.png')
        print('errors:',errs[:5]); await b.close()
asyncio.run(main())
