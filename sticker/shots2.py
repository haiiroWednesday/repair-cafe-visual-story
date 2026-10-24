import asyncio, os, sys
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.abspath(__file__)); O = os.path.join(D, 'shots2'); os.makedirs(O, exist_ok=True)
W, H = (int(sys.argv[1]), int(sys.argv[2])) if len(sys.argv) > 2 else (1440, 900)
only = sys.argv[3].split(',') if len(sys.argv) > 3 else None
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(); pg = await b.new_page(viewport={'width': W, 'height': H}, device_scale_factor=1); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        await pg.goto('file://' + D + '/order-up2-local.html', wait_until='commit'); await pg.wait_for_function('window.__ok', timeout=90000); await pg.wait_for_timeout(900); await pg.add_style_tag(content='html{scroll-behavior:auto!important}')
        tag = f'{W}'
        if not only or 'hero' in only:
            await pg.screenshot(path=f'{O}/{tag}_00.png')
            await pg.evaluate("window.scrollTo(0, innerHeight*.85)"); await pg.wait_for_timeout(400); await pg.screenshot(path=f'{O}/{tag}_01.png')
        if not only or 'prose' in only:
            for i, sel in enumerate(['.fr.gilt', '.fr.arch', '.fr.stampf', '.pair', '.fr.ticketf', '.flatlay']):
                await pg.evaluate(f"document.querySelector('{sel}').scrollIntoView({{block:'center'}})"); await pg.wait_for_timeout(500)
                await pg.screenshot(path=f'{O}/{tag}_p{i}.png')
        for bid in ['bOrders', 'bBench', 'bClock', 'bHeart', 'bOrder']:
            if only and bid not in only: continue
            n = await pg.evaluate(f"document.getElementById('{bid}').closest('.scrolly').querySelectorAll('.step').length")
            for i in range(n):
                await pg.evaluate(f"(()=>{{const s=document.getElementById('{bid}').closest('.scrolly').querySelectorAll('.step')[{i}]; const r=s.getBoundingClientRect(); window.scrollBy(0, r.top + r.height - innerHeight*0.6);}})()"); await pg.wait_for_timeout(1400)
                await pg.screenshot(path=f'{O}/{tag}_{bid}_{i}.png')
        if not only or 'album' in only:
            await pg.evaluate("document.querySelector('.album').scrollIntoView()"); await pg.wait_for_timeout(600)
            await pg.screenshot(path=f'{O}/{tag}_album.png')
        print('errors:', errs[:6]); await b.close()
asyncio.run(main())
