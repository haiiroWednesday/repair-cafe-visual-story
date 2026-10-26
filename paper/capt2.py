import asyncio, os, sys, json, base64
from playwright.async_api import async_playwright
D = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.join(os.path.dirname(D), 'diorama', 'repair-teapot-local.html')
async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--allow-file-access-from-files'])
        pg = await b.new_page(viewport={'width': 1400, 'height': 900}); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto('file://' + SRC, wait_until='commit', timeout=120000); await pg.wait_for_function('window.__dio', timeout=120000)
        await pg.evaluate('window.__dio.setOpen()'); await pg.wait_for_timeout(5000)
        for name, js in [('t_menu', "PT.menuBoard('Today’s menu', ['Lamps', 'Toasters', 'Zippers', 'Radios', 'Clocks', 'Anything else?'])"), ('t_menu2', "PT.menuBoard('Menu', ['Appliances', 'Electronics', 'Mechanical', 'PC / Phone', 'Woodwork', 'Sewing'])"), ('t_ticket', "PT.ticket('12', '#F2C4CC')")]:
            url = await pg.evaluate(f"{js}.toDataURL()"); open(os.path.join(D, 'kit', name + '.png'), 'wb').write(base64.b64decode(url.split(',')[1]))
        print('errors', errs[:3]); await b.close()
asyncio.run(main())
