import asyncio, os, sys
from playwright.async_api import async_playwright
D=os.path.dirname(os.path.abspath(__file__)); O=os.path.join(D,'shots'); os.makedirs(O,exist_ok=True)
W,H=(int(sys.argv[1]),int(sys.argv[2])) if len(sys.argv)>2 else (1440,900)
async def main():
    async with async_playwright() as pw:
        b=await pw.chromium.launch(); pg=await b.new_page(viewport={'width':W,'height':H}); errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
        await pg.goto('file://'+D+'/order-up-local.html'); await pg.wait_for_function('window.__ok',timeout=60000); await pg.wait_for_timeout(800)
        tag=f'{W}x{H}'; await pg.screenshot(path=f'{O}/{tag}_00.png')
        await pg.evaluate("document.querySelectorAll('#heroSheet .tap')[2].click(); document.querySelectorAll('#heroSheet .tap')[5].click()"); await pg.wait_for_timeout(600)
        await pg.screenshot(path=f'{O}/{tag}_01hero.png')
        for bid in ['bOrders','bBench','bClock','bOrder']:
            n=await pg.evaluate(f"document.getElementById('{bid}').closest('.scrolly').querySelectorAll('.step').length")
            for i in range(n):
                await pg.evaluate(f"(()=>{{const s=document.getElementById('{bid}').closest('.scrolly').querySelectorAll('.step')[{i}]; const r=s.getBoundingClientRect(); window.scrollBy(0, r.top + r.height - innerHeight*0.6);}})()"); await pg.wait_for_timeout(1300)
                await pg.screenshot(path=f'{O}/{tag}_{bid}_{i}.png')
        await pg.evaluate("document.querySelector('.book').scrollIntoView()"); await pg.wait_for_timeout(600)
        await pg.screenshot(path=f'{O}/{tag}_book.png')
        await pg.screenshot(path=f'{O}/{tag}_full.png', full_page=True)
        print('errors:',errs[:5]); await b.close()
asyncio.run(main())
