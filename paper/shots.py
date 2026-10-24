import asyncio, os, sys
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.abspath(__file__)); O = os.path.join(D, 'shots'); os.makedirs(O, exist_ok=True)
W, H = int(sys.argv[1]), int(sys.argv[2])
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(); pg = await b.new_page(viewport={'width': W, 'height': H}); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        await pg.goto('http://localhost:8765/index.html'); await pg.wait_for_function('window.__ok'); await pg.add_style_tag(content='html{scroll-behavior:auto!important}')
        await pg.evaluate("document.querySelectorAll('img[loading=lazy]').forEach(i=>i.loading='eager')"); await pg.wait_for_timeout(1500)
        for i, sel in enumerate(['#top', '#entrance', '#bench', '#volunteer', '#heart', '#clock', '#final']):
            await pg.evaluate(f"(()=>{{const e=document.querySelector('{sel}'); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - (e.id==='top'?60:0) )}})()"); await pg.wait_for_timeout(500)
            await pg.screenshot(path=f'{O}/{W}_{i}.png')
        await pg.screenshot(path=f'{O}/{W}_full.png', full_page=True)
        print('errors', errs[:5]); await b.close()
asyncio.run(main())
