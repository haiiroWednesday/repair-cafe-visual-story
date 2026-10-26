import asyncio, json, sys, base64, os
from playwright.async_api import async_playwright
D=os.path.dirname(os.path.abspath(__file__))
async def main(jobs, outdir):
    os.makedirs(outdir, exist_ok=True)
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        pg = await b.new_page()
        errs=[]; pg.on('pageerror', lambda e: errs.append(str(e))); pg.on('console', lambda m: errs.append(m.text) if m.type=='error' else None)
        await pg.goto('file://'+D+'/props.html'); await pg.wait_for_timeout(300)
        for name, job in jobs.items():
            res = await pg.evaluate('j=>render(j)', job)
            open(os.path.join(outdir, name+'.png'),'wb').write(base64.b64decode(res['url'].split(',')[1]))
            json.dump(res['meta'], open(os.path.join(outdir, name+'.json'),'w'))
            print('ok', name)
        print('errors', errs); await b.close()
jobs=json.load(open(sys.argv[1])); asyncio.run(main(jobs, sys.argv[2]))
