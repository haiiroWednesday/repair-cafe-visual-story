import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(); pg = await b.new_page(viewport={'width': 390, 'height': 844})
        await pg.goto('http://localhost:8790/test.html'); await pg.evaluate('window.__nb.open()'); await pg.wait_for_timeout(1200)
        await pg.evaluate('window.__nb.go(3)'); await pg.wait_for_timeout(1500)
        print(await pg.evaluate('''(()=>{const pf=__nb.pf();const r=pf.getBoundsRect();const w=document.getElementById('nbWrap').getBoundingClientRect();const bk=document.getElementById('nbBook');const bl=bk.querySelector('.stf__block').getBoundingClientRect();
        const pgs=[...bk.querySelectorAll('.page')].map(p=>{const q=p.getBoundingClientRect();return [q.left|0,q.width|0,getComputedStyle(p).display]}).filter(x=>x[2]!='none');
        return JSON.stringify({r,wrap:[w.left,w.width,w.height],book:[bk.offsetLeft,bk.offsetTop,bk.offsetWidth,bk.offsetHeight],block:[bl.left,bl.width,bl.height],pgs,cur:pf.getCurrentPageIndex(),or:pf.getOrientation(),pop:document.getElementById('nbPop').style.cssText})})()'''))
        await b.close()
asyncio.run(main())
