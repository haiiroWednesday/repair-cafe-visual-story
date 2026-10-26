"""Render the hand-inked object library from the first graphics, one object per transparent PNG,
through the same fill and wobbly-ink passes those pages used."""
import asyncio, os, sys
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.join(os.path.dirname(D), 'cafe', 'index.html'); OUT = os.path.join(D, 'kit', 'tools')
IDS = sys.argv[1].split(',')
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(); pg = await b.new_page(viewport={'width': 1400, 'height': 1000}, device_scale_factor=2)
        await pg.goto('file://' + SRC); await pg.wait_for_timeout(1500)
        await pg.evaluate('''() => { const p = document.querySelector('.page'); const q = p.cloneNode(false); q.id = 'toolshot';
          q.style.cssText = 'position:fixed;left:0;top:0;width:600px;height:600px;background:none !important;box-shadow:none;border-radius:0;z-index:99999;overflow:visible';
          [...document.body.children].forEach(c => { if (c.tagName !== 'svg' && c.tagName !== 'SCRIPT' && c.id !== 'defs') c.style.visibility = 'hidden'; }); q.style.visibility = 'visible'; document.body.prepend(q); document.body.style.background = 'none'; document.documentElement.style.background = 'none'; }''')
        for i in IDS:
            await pg.evaluate(f'''() => {{ const q = document.getElementById('toolshot'); q.innerHTML = '<div class="ob" style="position:absolute;left:60px;top:60px">' + objSVG({i!r}, 400) + '</div>'; }}''')
            await pg.wait_for_timeout(120)
            await pg.screenshot(path=os.path.join(OUT, i + '.png'), clip={'x': 20, 'y': 20, 'width': 480, 'height': 480}, omit_background=True)
        await b.close()
asyncio.run(main())
