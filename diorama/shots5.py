import asyncio, os, sys
from playwright.async_api import async_playwright
D=os.path.dirname(os.path.abspath(__file__)); O=os.path.join(D,'shots5'); os.makedirs(O,exist_ok=True)
W,H=(int(sys.argv[1]),int(sys.argv[2])) if len(sys.argv)>2 else (1440,900)
async def main():
    async with async_playwright() as pw:
        b=await pw.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files'])
        pg=await b.new_page(viewport={'width':W,'height':H}); errs=[]; pg.on('pageerror',lambda e: errs.append(str(e)))
        await pg.goto('file://'+D+'/repair-teapot-local.html', wait_until='commit', timeout=120000)
        await pg.wait_for_function('window.__dio', timeout=120000); await pg.wait_for_timeout(1000)
        await pg.add_style_tag(content='html{scroll-behavior:auto!important}')
        tag=f'{W}'
        await pg.evaluate('window.__dio.setOpen()'); await pg.wait_for_timeout(2500)
        for i,v in enumerate(['entrance','bench','volunteer','clock','final']):
            await pg.evaluate(f"document.getElementById('{v}').scrollIntoView({{block:'start'}})"); await pg.wait_for_timeout(2600)
            await pg.screenshot(path=f'{O}/{tag}_{i}_{v}.png')
            for j,sel in enumerate(['.fr']):
                ok=await pg.evaluate(f"(()=>{{const e=document.getElementById('{v}').querySelector('{sel}'); if(!e) return false; e.scrollIntoView({{block:'center'}}); return true}})()")
                if ok: await pg.wait_for_timeout(1800); await pg.screenshot(path=f'{O}/{tag}_{i}_{v}_fig.png')
            if v=='clock':
                await pg.evaluate("document.getElementById('clock').querySelector('[data-act=openclock]').click()"); await pg.wait_for_timeout(2600)
                await pg.evaluate("document.querySelector('.door .polaf').scrollIntoView({block:'center'})"); await pg.wait_for_timeout(1500)
                await pg.screenshot(path=f'{O}/{tag}_3b_clockopen.png')
        await pg.evaluate("""(()=>{const d=window.__dio, T=d.T; const v=new T.Vector3(); d.heart.getWorldPosition(v); const q=new T.Vector3(); d.heart.getWorldQuaternion(q.constructor===T.Vector3? new T.Quaternion(): q);
          const n=new T.Vector3(0,0,1).applyQuaternion(d.heart.getWorldQuaternion(new T.Quaternion())); d.flyTo({p:[v.x+n.x*1.6, v.y+.75, v.z+n.z*1.6], t:[v.x, v.y+.25, v.z]}, .1); })()""")
        await pg.wait_for_timeout(2500); await pg.screenshot(path=f'{O}/{tag}_9_heart.png')
        print('errors:',errs[:5]); await b.close()
asyncio.run(main())
