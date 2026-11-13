# records which pictures the page really fetches (laptop, phone, tablet), for export.py
import asyncio,re,json
from playwright.async_api import async_playwright
OUT='/tmp/claude-0/-home-claude/ee5cc871-c0b1-559a-a1f7-dca096f49e11/scratchpad/used.json'
async def main():
    used=set()
    async with async_playwright() as pw:
        b=await pw.chromium.launch()
        for W,H in ((1400,900),(390,800),(820,1000)):
            pg=await b.new_page(viewport={'width':W,'height':H}); reqs=set(); pg.on('request',lambda r: reqs.add(r.url))
            await pg.goto('http://localhost:8777/repair/index.html'); await pg.wait_for_timeout(1500)
            await pg.evaluate("document.documentElement.style.scrollBehavior='auto'")
            Ht=await pg.evaluate('document.documentElement.scrollHeight'); y=0
            while y<Ht:
                await pg.evaluate(f'scrollTo(0,{y})'); await pg.wait_for_timeout(110); y+=300; Ht=await pg.evaluate('document.documentElement.scrollHeight')
            await pg.wait_for_timeout(1500)
            for u in reqs:
                m=re.search(r'/repair/(img/[^?#]+)',u)
                if m: used.add(m.group(1))
            await pg.close()
        await b.close()
    json.dump(sorted(used),open(OUT,'w')); print(len(used),'pictures fetched')
asyncio.run(main())
