addEventListener('DOMContentLoaded',()=>{
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const NS='http://www.w3.org/2000/svg';
const sv=(t,a,p)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);p&&p.appendChild(e);return e;};

/* 0. story order (v73): aprons and the people photos join the check-in section, Why Bring It In comes before Jazz.
      Nothing is removed from the page. Hidden parts carry data-v7hidden and can be shown again. */
(()=>{
  const tw=id=>{const e=document.getElementById(id);return e&&e.closest('.tw');};
  const c=document.querySelector('#counter-s > .col'), ap=document.querySelector('.apgame'), vf=document.querySelector('.volfig');
  if(c&&ap&&vf){c.after(ap);ap.after(vf);}
  const hide=e=>{if(e){e.style.display='none';e.dataset.v7hidden=1;}};
  hide(tw('volunteer'));
  document.querySelectorAll('#heart > .rim + .col > p').forEach(hide);
  if(tw('heart')&&tw('odds')&&tw('why')) tw('heart').before(tw('odds'),tw('why'));
  ['history','counter-s','bench','odds','why','heart'].forEach((id,i)=>{const k=document.querySelector('#'+id+' > .col > .kick');if(k)k.textContent=String(i+1).padStart(2,'0');});
})();

/* 1. seams: whip stitches that follow each torn edge */
(()=>{
  const EDGE=__EDGES__;
  const THREAD=['#F27BAE','#F59A62','#EDBE36','#4FCB96','#43B9DD','#9A7BEA'];
  const tws=[...document.querySelectorAll('.clean > .tw')];
  const seams=tws.map((tw,n)=>{
    const k=+((tw.getAttribute('style')||'').match(/tw(\d)_mask/)||[0,0])[1];
    const d=document.createElement('div'); d.className='seam'; d.setAttribute('aria-hidden','true'); tw.before(d);
    const s=sv('svg',{},d);
    const id='thr'+n, g=sv('linearGradient',{id,gradientUnits:'userSpaceOnUse',x1:0,y1:0,x2:1,y2:0},sv('defs',{},s));
    THREAD.forEach((c,i)=>sv('stop',{offset:i/5,'stop-color':c},g));
    return {tw,d,s,g,k,id,gp:sv('g',{},s)};
  });
  function draw(){
    seams.forEach(S=>{
      const th=parseFloat(getComputedStyle(S.tw).getPropertyValue('--th'))||56, W=S.tw.offsetWidth, P=16;
      S.s.style.top=(-th/2-P)+'px'; S.s.style.height=(th+2*P)+'px'; S.s.setAttribute('viewBox',`0 ${-P} ${W} ${th+2*P}`);
      const br=S.tw.getBoundingClientRect(), dr=S.d.getBoundingClientRect(); S.s.style.left=(br.left-dr.left)+'px'; S.s.style.width=W+'px'; S.g.setAttribute('x2',W); S.gp.innerHTML='';
      const E=EDGE[S.k], step=W<700?22:28, L=W<700?7:9;
      let i=0;
      for(let x=step*.7;x<W-6;x+=step,i++){
        const u=x/W*(E.length-1), a=Math.floor(u), y=(E[a]+(E[Math.min(a+1,E.length-1)]-E[a])*(u-a))*th;
        const d=`M${(x-3.2).toFixed(1)} ${(y-L).toFixed(1)}L${(x+3.2).toFixed(1)} ${(y+L).toFixed(1)}`;
        sv('path',{class:'sh',d,pathLength:1,style:`--i:${i}`},S.gp);
        sv('path',{d,pathLength:1,stroke:`url(#${S.id})`,style:`--i:${i}`},S.gp);
      }
    });
  }
  draw(); let rt; addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(draw,150);});
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}}),{rootMargin:'0px 0px -22% 0px'});
  seams.forEach(S=>{ if(RM) S.d.classList.add('in'); else io.observe(S.d); });
})();

/* 2. parts trays: stickers leave the photos and sit in labeled compartments under them */
document.querySelectorAll('.pegboard .stage,.volfig .stage,.heartfig .stage').forEach(st=>{
  const ks=[...st.querySelectorAll(':scope > .stk')].filter(k=>k.querySelector('.stl')); if(!ks.length) return;
  const t=document.createElement('div'); t.className='tray'; t.style.setProperty('--n',ks.length);
  ks.forEach(k=>{k.removeAttribute('tabindex'); t.appendChild(k);}); st.after(t);
});


/* 3. why bring it in: quotes on an order rail, and a glass that pours on arrival */
(()=>{
  const why=document.getElementById('why'), fig=why&&why.querySelector('.whyfig'); if(!fig) return;
  const rows=[...document.querySelectorAll('#wymrows .mrow')];
  const rail=document.createElement('div'); rail.className='slips'+(RM?'':' anim');
  const tilt=[-.9,.6,-.4,.8,-.6,.5];
  rows.forEach((r,i)=>{const im=r.querySelector('img'), q=r.querySelector('q'), a=r.querySelector('.a');
    const d=document.createElement('figure'); d.className='slip'; d.style.cssText=`--i:${i};--r:${tilt[i%6]}deg;margin:0`;
    d.innerHTML=`<div class="slip-in">${im?`<img src="${im.getAttribute('src')}" alt="" loading="lazy">`:''}${q?`<q>${q.innerHTML}</q>`:''}${a?`<span class="a">${a.innerHTML}</span>`:''}</div>`;
    rail.appendChild(d);});
  fig.prepend(rail);
  if(!RM) new IntersectionObserver((es,io)=>es.forEach(e=>{if(e.isIntersecting){rail.classList.add('in');io.disconnect();}}),{rootMargin:'0px 0px -18% 0px'}).observe(rail);
  /* desktop glass: crop the drawing to the glass and its key, and take the fill off the scroll */
  const svg=document.getElementById('wysvg'); if(!svg) return;
  svg.setAttribute('viewBox','10 362 1380 640');
  const t=svg.querySelector('title'); if(t) t.textContent='A tall glass of layered coffee. Each layer is as thick as one reason’s weighted ranking score in the Farnham survey.';
  const old=document.getElementById('wyfillRect'), rg0=document.getElementById('wyrows'); if(!old||!rg0) return;
  const wave=sv('path',{id:'wyfillWave'}); old.replaceWith(wave);
  const rg=rg0.cloneNode(true); rg0.replaceWith(rg);            // detach from the old scroll handler
  const rws=[...rg.querySelectorAll('.row')], TOP=524, BOT=880;
  const set=(lvl,amp,ph)=>{let d=`M300 1000 L300 ${lvl}`;for(let x=300;x<=1100;x+=20)d+=` L${x} ${(lvl+Math.sin(x*.045+ph)*amp).toFixed(1)}`;wave.setAttribute('d',d+' L1100 1000Z');
    rws.forEach(r=>r.classList.toggle('on',lvl<=+r.dataset.y+8));};
  if(RM||!svg.classList.contains('anim')){set(TOP,0,0);return;}
  set(BOT+20,0,0);
  new IntersectionObserver((es,io)=>es.forEach(e=>{if(!e.isIntersecting)return;io.disconnect();
    const t0=performance.now(),D=3400;(function f(n){const t=Math.min(1,(n-t0)/D),e=t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
      set(BOT+20-(BOT+20-TOP)*e,(1-t)*5+ (t<1?1.2:0),n/260); if(t<1)requestAnimationFrame(f); else set(TOP,0,0);})(t0);
  }),{threshold:.55}).observe(svg);
})();


/* 4. repairability ruler: every mark gets its own row, so no leader crosses a label */
(()=>{
  const g=document.querySelector('.ctrSvg .s2'); if(!g) return;
  const R=[316,354,392], lay={no:[0,'L'],pl:[1,'L'],all:[2,'L'],ok:[0,'R'],np:[1,'R']};
  for(const k in lay){const e=g.querySelector('.gd.'+k); if(!e) continue; const [r,side]=lay[k], y=R[r];
    const ln=e.querySelector('line'), c=e.querySelector('circle'), x=+c.getAttribute('cx'), gv=e.querySelector('.gv'), nt=e.querySelector('.note');
    ln.setAttribute('y2',y-8); c.setAttribute('cy',y); c.setAttribute('r',6.5);
    if(side==='L'){gv.setAttribute('x',x-13);gv.setAttribute('text-anchor','end');nt.setAttribute('x',x-48);nt.setAttribute('text-anchor','end');}
    else{gv.setAttribute('x',x+13);gv.setAttribute('text-anchor','start');nt.setAttribute('x',x+48);nt.setAttribute('text-anchor','start');}
    gv.setAttribute('y',y+6); nt.setAttribute('y',y+5.5);}
  const m=[...g.querySelectorAll('text.tiny')].find(t=>/most common/i.test(t.textContent)); if(m){m.setAttribute('x',716);m.setAttribute('y',293);m.setAttribute('text-anchor','start');}
  g.querySelectorAll('.hi text').forEach(t=>t.setAttribute('y',446));
})();

/* 5. cake stand: ribbon text as live type, and the full glasses when the picture is opened */
(()=>{
  const img=document.querySelector('.cfig.odds img[src*="odds_"]'); if(!img) return;
  const st=img.parentElement, o=document.createElement('div'); o.className='rlbls';
  [['below 50%',__RB0__],['50–79%',__RB1__],['80% or more',__RB2__]].forEach(([t,p])=>{const s=document.createElement('span');s.textContent=t;s.style.left=p[0]+'%';s.style.top=p[1]+'%';o.appendChild(s);});
  st.appendChild(o);
  const sync=()=>{o.style.left=img.offsetLeft+'px';o.style.top=img.offsetTop+'px';o.style.width=img.offsetWidth+'px';o.style.height=img.offsetHeight+'px';};
  sync(); addEventListener('resize',sync); if(window.ResizeObserver) new ResizeObserver(sync).observe(img); img.addEventListener('load',sync);
  img.addEventListener('click',()=>{const l=document.getElementById('lbImg'); if(l) l.src='img/odds_stand.webp';});
})();


/* 6. arrivals: photos, trays and the three clock steps settle in as they come into view */
(()=>{
  const w=document.querySelector('.clockfig .stk:not(.cuckoostk)'), key=document.querySelector('.clockfig .wkey'); if(w&&key&&!w.querySelector('.stl')) key.prepend(w);
  if(RM) return;
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('rv-in');io.unobserve(e.target);}}),{rootMargin:'0px 0px -12% 0px'});
  const add=(sel,stag)=>document.querySelectorAll(sel).forEach((e,i)=>{e.classList.add('rv'); if(stag) e.style.setProperty('--rd',(i%stag.n)*stag.ms+'ms'); io.observe(e);});
  add('#history .photo img'); add('.pegboard .stage > img.pc',{n:2,ms:160}); add('.volfig .stage > img.pc',{n:2,ms:160});
  add('.heartfig .stage > img.pc',{n:2,ms:240}); add('.tray .stk',{n:5,ms:90}); add('.clockfig .polawrap');
   add('#bench .cfig.plate .plimg');
})();


/* 7. film look, tape, and the corner ticket */
(()=>{
  const g=document.createElement('div'); g.className='grainlay'; g.setAttribute('aria-hidden','true'); document.body.appendChild(g);
  document.querySelectorAll('.slip-in').forEach((e,i)=>{e.style.setProperty('--cx',(i*37%100)+'%');e.style.setProperty('--cy',(i*53%100)+'%');});
  const b=document.querySelector('.heartfig img[src*="hc2_back"]'); if(b){const t=document.createElement('i');t.className='tape';t.style.cssText='--l:46.5%;--t:66%;--w:9.5%;--r:32deg;--ml:55%;--mt:49.8%;--mw:12%';b.after(t);}
  const tix=document.getElementById('tix'), it=document.getElementById('tixItem');
  if(tix&&it){const chk=()=>tix.classList.toggle('v7hide',it.textContent==='White shoes');chk();new MutationObserver(chk).observe(it,{childList:true,characterData:true,subtree:true});}
})();


/* 8. ink and the check-in desk: uneven type, a station stamp, a ticket you can hand to an apron */
(()=>{
  const d=document.createElement('div'); d.style.cssText='position:absolute;width:0;height:0;overflow:hidden'; d.setAttribute('aria-hidden','true');
  d.innerHTML=`<svg width="0" height="0"><defs>
  <filter id="v7ink" x="-3%" y="-15%" width="106%" height="130%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".8" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="1" xChannelSelector="R" yChannelSelector="G" result="d"/><feTurbulence type="fractalNoise" baseFrequency=".02 .55" numOctaves="2" seed="3" result="m"/><feColorMatrix in="m" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -1.5 0 0 0 1.72" result="a"/><feComposite in="d" in2="a" operator="in" result="w"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -5 0 0 4.4" result="p"/><feComposite in="w" in2="p" operator="in"/></filter>
  <filter id="v7stamp" x="-8%" y="-25%" width="116%" height="150%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency=".5" numOctaves="2" seed="12" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2" xChannelSelector="R" yChannelSelector="G" result="d"/><feTurbulence type="fractalNoise" baseFrequency=".09" numOctaves="3" seed="5" result="m"/><feColorMatrix in="m" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -2.3 0 0 0 2.05" result="a"/><feComposite in="d" in2="a" operator="in" result="w"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -5 0 0 4.3" result="p"/><feComposite in="w" in2="p" operator="in"/></filter>
  </defs></svg>`; document.body.appendChild(d);
  const F=document.querySelector('.apgame'), tk=F&&F.querySelector('#tkt'); if(!tk) return;
  const hits=[...F.querySelectorAll('.aphit')];
  /* when a ticket is sent, aim it at that apron's pocket */
  new MutationObserver(()=>{ const st=tk.dataset.st, a=hits.find(h=>h.dataset.st===st);
    if(tk.classList.contains('done')&&a&&!tk.dataset.aimed){ tk.dataset.aimed=1; const r=tk.getBoundingClientRect(), b=a.getBoundingClientRect();
      tk.style.setProperty('--fx',(b.left+b.width/2-(r.left+r.width/2))+'px'); tk.style.setProperty('--fy',(b.top+b.height*.55-(r.top+r.height/2))+'px'); }
    if(tk.classList.contains('away')&&a&&tk.dataset.aimed==='1'){ tk.dataset.aimed=2; tk.style.translate=''; tk.style.transition='translate .6s cubic-bezier(.5,0,.75,.35)'; setTimeout(()=>{a.classList.add('got');setTimeout(()=>a.classList.remove('got'),720);},420); }
    if(!tk.classList.contains('done')&&tk.dataset.aimed){ delete tk.dataset.aimed; tk.style.transition=''; tk.style.translate=''; }
  }).observe(tk,{attributes:true,attributeFilter:['class']});
  /* drag the ticket onto an apron */
  let drag=null;
  const under=(x,y)=>document.elementsFromPoint(x,y).find(e=>e.classList&&e.classList.contains('aphit'));
  tk.addEventListener('pointerdown',e=>{ if(tk.classList.contains('done')||document.body.classList.contains('editing')) return; drag={x:e.clientX,y:e.clientY,moved:false}; tk.setPointerCapture(e.pointerId); });
  tk.addEventListener('pointermove',e=>{ if(!drag) return; const dx=e.clientX-drag.x, dy=e.clientY-drag.y; if(!drag.moved&&Math.hypot(dx,dy)<6) return; drag.moved=true; tk.classList.add('lift');
    tk.style.transition='none'; tk.style.translate=dx+'px '+dy+'px'; const h=under(e.clientX,e.clientY); hits.forEach(b=>b.classList.toggle('hov',b===h)); });
  const end=e=>{ if(!drag) return; const was=drag; drag=null; tk.classList.remove('lift'); hits.forEach(b=>b.classList.remove('hov')); if(!was.moved) return;
    const h=under(e.clientX,e.clientY); tk.style.transition=''; if(h) h.click(); if(!tk.classList.contains('done')) tk.style.translate=''; };
  tk.addEventListener('pointerup',end); tk.addEventListener('pointercancel',end);
})();


/* 9. the Polaroid caption, rewritten as marker on glossy paper */
(()=>{
  const ink=document.querySelector('.pola svg.ink'); if(!ink) return;
  ink.querySelectorAll(':scope > text, :scope > path').forEach(e=>e.remove());
  const g=sv('g',{class:'hand',transform:'rotate(-1.6 750 1800)'},ink); const gl=sv('g',{transform:'translate(-26 0)'},g);
  sv('path',{d:"M211.2 1862.2Q210.3 1862 209.6 1861.4Q208.8 1860.9 208.5 1860.1Q208.2 1859.4 208.4 1858.6Q208.5 1857.9 209.7 1857.4Q215.1 1855.4 220.1 1853.3Q225.1 1851.1 229.4 1848.1Q233.6 1845.1 237.2 1841Q240.7 1836.8 243.3 1831.1L287.8 1733.6L286.2 1733.6Q285.9 1733.6 283.4 1734.7Q281 1735.9 277.7 1737.4Q274.4 1739 270.9 1740.6Q267.4 1742.3 265.3 1743.4Q262.3 1744.9 258.4 1747.7Q254.5 1750.4 250.3 1753.9Q246.2 1757.5 242.2 1761.6Q238.3 1765.7 235.1 1769.9Q232 1774.1 230.1 1778.2Q228.2 1782.4 228.2 1785.9Q228.2 1787.2 228.8 1788.2Q229.4 1789.2 230.1 1790.2Q230.9 1791.1 231.5 1792.1Q232 1793.2 232 1794.4Q229.4 1794.5 227.5 1793.5Q225.7 1792.6 224.5 1791.1Q223.3 1789.5 222.7 1787.5Q222.1 1785.5 222.1 1783.4Q222 1780.2 223.1 1777.2Q224.2 1774.3 226 1771.6Q227.8 1768.9 230 1766.4Q232.3 1764 234.6 1761.6Q236.6 1759.5 239.9 1756.3Q243.3 1753.1 246.6 1750Q250 1746.8 252.6 1744.5Q255.2 1742.1 255.5 1741.9L294.2 1720.5Q296.9 1718.9 298.9 1715.9Q301 1712.8 303 1709.9Q305 1706.9 307.6 1704.7Q310.3 1702.5 314.2 1702.5Q315.4 1702.5 316.3 1702.9Q317.1 1703.3 318.3 1704.1Q318.4 1704.6 318.5 1706.1Q318.5 1707.7 318.5 1708.2Q318.6 1709.8 318.6 1710.7Q318.6 1711.7 318.3 1712.4Q318 1713.1 317.3 1713.7Q316.6 1714.3 315.1 1715.5Q314 1716.3 311.2 1718.5Q308.4 1720.6 305.2 1723.5Q302 1726.3 299.1 1729.4Q296.2 1732.5 295.1 1735.1L267.2 1792Q267.1 1792.6 266.6 1794.4Q266 1796.2 265.8 1796.9Q264.8 1798.9 263.3 1802.2Q261.8 1805.5 260 1809.4Q258.2 1813.2 256.3 1817.3Q254.4 1821.3 252.8 1824.9Q251.1 1828.4 249.9 1830.9Q248.7 1833.5 248.2 1834.3Q246.1 1838.4 242.2 1843.6Q238.3 1848.7 233.3 1853.1Q228.4 1857.6 222.7 1860.2Q216.9 1862.9 211.2 1862.2ZM294.1 1812.6Q294.9 1805.3 297.9 1799.2Q300.8 1793 304.8 1788.4Q308.7 1783.8 313.4 1780.7Q318.1 1777.6 322.7 1776.7Q327.2 1775.7 331.1 1776.8Q335 1777.9 337.5 1781.6Q337.6 1784.5 336.3 1787.2Q335.1 1789.9 333.6 1792.6Q332.1 1795.3 330.9 1798.2Q329.7 1801 329.8 1804.1Q329.9 1807.4 331.4 1809.3Q332.9 1811.2 336.6 1811.1Q339.6 1811 342.4 1810Q345.2 1809.1 348.1 1809Q348.7 1808.9 349.9 1809Q351.1 1809 351.4 1809Q350 1811.2 347.6 1812.8Q345.3 1814.4 342.7 1815.5Q340.1 1816.7 337.2 1817.3Q334.4 1817.9 332 1818Q329.8 1818.1 327.9 1817.1Q326.1 1816.2 324.8 1814.6Q323.5 1813 322.7 1810.9Q322 1808.8 321.9 1806.8Q320.1 1809 318 1811.4Q315.8 1813.8 313.4 1815.8Q311 1817.8 308.2 1819.2Q305.4 1820.5 302.4 1820.6Q299.1 1820.7 296.7 1818.4Q294.2 1816 294.1 1812.6ZM302.3 1808.4Q302.3 1809.4 302.4 1810.6Q302.5 1811.9 304 1812.2Q307.2 1811.4 311.1 1808.6Q315.1 1805.9 318.5 1802.3Q321.9 1798.7 324.2 1794.7Q326.4 1790.6 326.3 1787Q326.3 1786.7 326.2 1786.1Q326.1 1785.6 326.1 1785.3Q321.8 1785.5 317.5 1787.4Q313.1 1789.3 309.7 1792.5Q306.2 1795.7 304.2 1799.8Q302.1 1804 302.3 1808.4ZM347.7 1811.4Q347.7 1811.2 347.8 1810.9Q347.8 1810.7 347.9 1810.5Q351.7 1806.6 356 1803.1Q360.2 1799.5 364.9 1796.4L393.9 1764.6L392.1 1764.5Q389.4 1764.4 386.9 1764.9Q384.4 1765.4 381.8 1765.9Q379.2 1766.5 376.7 1767Q374.1 1767.4 371.5 1767.3Q367.8 1766.7 366.7 1765.6Q365.5 1764.6 366.1 1763.4Q366.6 1762.2 368.4 1761Q370.2 1759.8 372.7 1759Q375.1 1758.1 377.8 1757.8Q380.5 1757.4 382.6 1757.7Q387.6 1756.7 391.2 1756.5Q394.8 1756.3 399.4 1756.4Q403 1756.6 405.1 1758Q407.2 1759.4 407.1 1763.6Q407 1764.5 404.7 1767.2Q402.4 1770 398.9 1773.8Q395.3 1777.7 391 1782.1Q386.8 1786.5 382.7 1790.7Q378.7 1794.8 375.6 1798.2Q372.4 1801.6 371.1 1803.2Q371.2 1803.4 371.8 1804.1Q372.4 1804.7 372.7 1805Q376 1806.3 380.3 1806.8Q384.5 1807.4 388.8 1807.7Q393.1 1807.9 397 1807.8Q400.9 1807.8 403.7 1807.6Q404.7 1808.2 405.1 1808.8Q405.4 1809.3 405.4 1810.1Q405.3 1812.8 402.9 1813.9Q400.4 1815.1 397.4 1815.4Q394.3 1815.8 391.4 1815.6Q388.5 1815.4 387.5 1815.4Q384.4 1815.3 381.7 1814.7Q378.9 1814.1 376.2 1813.3Q373.4 1812.5 370.7 1811.9Q368 1811.3 365.1 1811.2Q363.1 1811.1 361.6 1812.1Q360.1 1813.1 358.7 1814.3Q357.3 1815.4 356.1 1816.5Q354.9 1817.5 353.3 1817.5Q351.2 1817.4 349.4 1815.4Q347.7 1813.5 347.7 1811.4ZM408.5 1814.9Q408.5 1814.7 408.5 1814.5Q408.5 1814.2 408.6 1814.1Q412 1810.3 415.8 1806.8Q419.6 1803.3 423.7 1800.2L449.2 1769.5L447.6 1769.5Q445.1 1769.5 442.8 1770.1Q440.4 1770.6 438.1 1771.2Q435.8 1771.9 433.4 1772.4Q431.1 1773 428.6 1773Q425.2 1772.6 424.1 1771.6Q422.9 1770.7 423.4 1769.6Q423.9 1768.5 425.5 1767.3Q427.1 1766.1 429.3 1765.2Q431.6 1764.3 434 1763.8Q436.5 1763.4 438.5 1763.6Q443.1 1762.4 446.4 1762Q449.7 1761.7 454 1761.7Q457.4 1761.6 459.4 1762.8Q461.4 1764 461.4 1767.9Q461.5 1768.7 459.4 1771.4Q457.4 1774.1 454.3 1777.8Q451.1 1781.6 447.4 1785.8Q443.6 1790.1 440.1 1794.1Q436.5 1798.2 433.7 1801.4Q431 1804.7 429.8 1806.2Q429.9 1806.5 430.5 1807.1Q431.1 1807.6 431.4 1807.9Q434.5 1808.9 438.5 1809.3Q442.4 1809.6 446.4 1809.6Q450.4 1809.6 454 1809.4Q457.7 1809.2 460.3 1808.9Q461.2 1809.4 461.6 1809.9Q461.9 1810.5 461.9 1811.2Q462 1813.6 459.7 1814.8Q457.5 1816 454.7 1816.5Q451.9 1816.9 449.2 1816.9Q446.5 1816.9 445.6 1816.9Q442.7 1816.9 440.1 1816.5Q437.6 1816 435 1815.4Q432.4 1814.8 429.8 1814.3Q427.3 1813.9 424.6 1813.9Q422.7 1814 421.4 1815Q420 1816 418.8 1817.1Q417.6 1818.2 416.5 1819.3Q415.4 1820.3 414 1820.3Q412 1820.3 410.3 1818.6Q408.5 1816.8 408.5 1814.9ZM540.4 1795.7Q537.4 1795.6 533.6 1794.7Q529.8 1793.8 526.3 1792.1Q522.8 1790.3 520.4 1787.5Q518 1784.6 518.1 1780.6Q518.1 1778.4 519.2 1777.3Q520.3 1776.1 521.9 1775.6Q523.6 1775.1 525.5 1775.1Q527.4 1775 528.8 1775Q533 1775 535.4 1775.6Q537.7 1776.1 539 1777.1Q540.2 1778.1 540.7 1779.3Q541.2 1780.5 541.8 1782Q542.4 1783.5 543.4 1784.9Q544.4 1786.4 546.8 1787.8Q548.5 1786.7 550.1 1783.6Q551.8 1780.6 553.3 1776.7Q554.9 1772.9 556.3 1768.7Q557.8 1764.5 559.3 1761Q560.8 1757.5 562.1 1755.2Q563.5 1753 564.9 1753Q566.1 1753 566.7 1753.7Q567.4 1754.3 567.5 1755.3Q567.7 1756.3 567.7 1757.3Q567.6 1758.4 567.6 1759.1Q567.6 1759.7 567.5 1761.1Q567.5 1762.4 567.3 1762.6L556.3 1784.7L556.3 1786.1Q560.4 1786.1 564.6 1783.8Q568.8 1781.6 572.4 1778.8Q576.1 1776.1 579.1 1773.8Q582.1 1771.5 583.9 1771.5Q583.9 1775.4 581.7 1778.4Q579.5 1781.5 576.1 1783.9Q572.8 1786.2 568.9 1788.1Q565 1789.9 561.5 1791.3Q558 1792.7 555.6 1793.7Q553.2 1794.7 553 1795.7L548.3 1811.6Q548.3 1811.7 547.7 1811.7Q547.2 1811.7 546.9 1811.7Q546.3 1811.7 545.2 1811.5Q544.1 1811.2 543 1810.8Q541.9 1810.4 541.1 1809.7Q540.3 1809.1 540.4 1808.4ZM525.5 1780.9Q525.5 1782.9 527.2 1784.2Q528.8 1785.5 531 1786.3Q533.2 1787 535.5 1787.4Q537.7 1787.7 538.8 1787.7Q538.8 1787.6 538.9 1787.4Q538.9 1787.1 538.9 1787Q538.9 1784.9 537.2 1783.7Q535.5 1782.5 533.3 1781.9Q531 1781.3 528.8 1781.1Q526.6 1780.9 525.5 1780.9ZM637.2 1799.3Q638.3 1792.5 641.2 1786.8Q644.1 1781.1 648 1776.8Q651.8 1772.6 656.3 1769.9Q660.8 1767.1 665 1766.3Q669.3 1765.5 672.9 1766.7Q676.6 1767.8 678.8 1771.4Q678.8 1774.1 677.6 1776.6Q676.4 1779.1 674.9 1781.6Q673.4 1784.1 672.2 1786.7Q671 1789.3 671 1792.3Q671 1795.4 672.4 1797.2Q673.8 1799.1 677.2 1799Q680.1 1799 682.7 1798.2Q685.4 1797.3 688.1 1797.3Q688.6 1797.3 689.7 1797.4Q690.8 1797.4 691.2 1797.4Q689.8 1799.4 687.5 1800.9Q685.3 1802.3 682.8 1803.3Q680.3 1804.4 677.7 1804.8Q675 1805.3 672.7 1805.3Q670.6 1805.4 668.9 1804.4Q667.3 1803.5 666.1 1801.9Q664.9 1800.4 664.2 1798.5Q663.6 1796.5 663.5 1794.6Q661.8 1796.6 659.7 1798.8Q657.6 1801 655.3 1802.8Q653 1804.6 650.4 1805.8Q647.7 1807 644.9 1807Q641.8 1807.1 639.5 1804.8Q637.3 1802.5 637.2 1799.3ZM645 1795.5Q645 1796.5 645.1 1797.7Q645.2 1798.9 646.6 1799.2Q649.6 1798.5 653.3 1796Q657.1 1793.6 660.4 1790.3Q663.7 1787 666 1783.3Q668.2 1779.5 668.2 1776.1Q668.2 1775.8 668.1 1775.3Q668.1 1774.8 668.1 1774.5Q664 1774.6 659.9 1776.2Q655.7 1777.9 652.4 1780.8Q649.1 1783.8 647.1 1787.6Q645 1791.4 645 1795.5ZM769.3 1769.3Q766.5 1769.6 762.7 1772.7Q758.9 1775.8 755.4 1780.3Q751.9 1784.8 749.4 1790Q747 1795.3 746.9 1799.8Q746.8 1803.4 748.7 1804.9Q750.5 1806.3 754 1806.4Q757.7 1806.4 761.3 1805.6Q764.9 1804.7 768.4 1803.7Q772 1802.7 775.6 1801.8Q779.1 1800.9 782.9 1801Q782.9 1802.8 782.3 1803.9Q781.8 1805.1 780.8 1806.5Q774.3 1809.5 767.4 1811.9Q760.5 1814.3 753 1814.2Q750.8 1814.2 748.3 1813.3Q745.8 1812.5 743.7 1810.9Q741.6 1809.4 740.2 1807.3Q738.8 1805.1 738.9 1802.5Q739 1796.9 740.7 1791.6Q742.4 1786.4 745.3 1781.7Q748.3 1777 752.4 1773.1Q756.5 1769.2 761.3 1766.2L761.3 1766.1Q763.2 1765 765.6 1764Q768.1 1763 770.2 1762.8Q772.3 1762.7 773.7 1763.9Q775.1 1765.1 775.1 1768.4Q775.1 1769.8 774.8 1772.3Q774.5 1774.7 773.3 1775.7Q772.3 1776.3 770.7 1776.8Q770 1777 769.2 1777.1ZM781.5 1805.7Q781.5 1803.9 782.7 1800.7Q783.8 1797.5 785.6 1793.8Q787.4 1790.1 789.7 1786.2Q792 1782.4 794.3 1779.3Q796.6 1776.2 798.7 1774.2Q800.7 1772.3 802.3 1772.3Q805.5 1772.4 805.5 1775.6Q805.4 1777 804.9 1777.9Q804.3 1778.8 803.6 1779.6Q802.9 1780.5 802 1781.2Q801.2 1781.9 800.6 1783Q799.5 1784.7 797.8 1787.7Q796.2 1790.8 794.7 1793.6Q793.1 1796.5 792 1798.7Q790.9 1800.9 790.9 1801.1L790.9 1802.6Q795.5 1801.9 799.8 1798.9Q804.1 1795.9 808 1791.8Q812 1787.6 815.6 1783.1Q819.2 1778.5 822.3 1774.7Q825.5 1770.8 828.3 1768.3Q831 1765.8 833.4 1765.8Q833.3 1770.2 831.4 1773.7Q829.6 1777.1 827.4 1780.5Q825.3 1783.9 823.4 1787.4Q821.6 1791 821.4 1795.4Q821.4 1797.3 823.6 1798.8Q825.9 1800.4 828.9 1801.5Q831.9 1802.5 834.7 1803.2Q837.5 1803.9 838.5 1804L838.4 1807.1Q835.7 1807.1 831.7 1806.9Q827.7 1806.8 823.8 1805.9Q819.8 1804.9 816.6 1802.9Q813.4 1800.9 812.4 1797.1Q809.3 1799 806.4 1801.6Q803.5 1804.3 800.5 1806.5Q797.4 1808.8 794.1 1810.4Q790.7 1811.9 786.8 1811.8Q784.5 1811.8 783 1809.7Q781.4 1807.7 781.5 1805.7ZM867.1 1761.4Q864.4 1761.7 861 1764.7Q857.5 1767.7 854.3 1772Q851.2 1776.3 849 1781.2Q846.8 1786.2 846.9 1790.4Q846.9 1793.8 848.7 1795.1Q850.4 1796.4 853.7 1796.4Q857.2 1796.3 860.5 1795.4Q863.8 1794.5 867.1 1793.5Q870.4 1792.5 873.7 1791.6Q877 1790.7 880.5 1790.7Q880.5 1792.3 880 1793.4Q879.6 1794.5 878.7 1795.8Q872.7 1798.8 866.3 1801.2Q859.9 1803.6 852.9 1803.7Q850.8 1803.7 848.5 1803Q846.2 1802.2 844.2 1800.9Q842.2 1799.5 840.8 1797.5Q839.5 1795.6 839.5 1793.1Q839.4 1787.9 840.9 1782.9Q842.3 1778 845 1773.5Q847.6 1769.1 851.4 1765.3Q855.1 1761.6 859.5 1758.8L859.5 1758.6Q861.2 1757.6 863.5 1756.6Q865.8 1755.6 867.7 1755.4Q869.7 1755.2 871 1756.3Q872.4 1757.4 872.4 1760.4Q872.4 1761.8 872.2 1764Q872 1766.3 871 1767.3Q870 1767.8 868.5 1768.3Q867.8 1768.6 867.1 1768.7ZM897.5 1786.1Q896.1 1788 895.2 1790.4Q894.4 1792.8 893.2 1795Q892.1 1797.2 890.5 1798.6Q888.9 1800.1 886.1 1800.2Q883.9 1800.3 883 1799.5Q882.2 1798.8 882.1 1796.4Q882 1793.5 883.5 1790.1Q885 1786.6 887.2 1783.3Q889.4 1779.9 891.7 1777Q893.9 1774.1 895.4 1772.3L916 1724.2Q916.8 1722.2 918.9 1720.4Q921.1 1718.5 923.4 1718.4L923.6 1722.4L911.8 1751.8L911.9 1754.6Q913.9 1754.5 915.7 1753.8Q917.4 1753.1 919.2 1752.3Q920.9 1751.4 922.9 1750.7Q924.8 1750 927.2 1749.9Q929.4 1751.3 929.5 1753.3Q929.7 1755.4 928.6 1757.9Q927.5 1760.3 925.5 1762.9Q923.5 1765.4 921.3 1767.8Q919.1 1770.2 917.1 1772Q915.1 1773.9 914 1774.8Q912.3 1776.3 910.8 1776.9Q909.3 1777.5 908.3 1778Q907.2 1778.5 906.7 1779.4Q906.2 1780.4 906.3 1782.6Q906.4 1786 908.2 1788Q910.1 1790 913 1791.1Q915.9 1792.2 919.6 1792.5Q923.2 1792.8 926.9 1792.7Q930.5 1792.6 933.9 1792.2Q937.2 1791.9 939.5 1791.4L941 1792.8Q939.7 1794.6 937.1 1796.3Q934.5 1798 931.4 1799.3Q928.3 1800.6 925.2 1801.5Q922.2 1802.4 920.1 1802.4Q916.3 1802.5 912.8 1801.4Q909.2 1800.2 906.1 1798.1Q903.1 1795.9 900.8 1792.8Q898.5 1789.8 897.5 1786.1ZM920.1 1758.8Q919 1758.8 916.9 1759.7Q914.8 1760.6 912.7 1761.9Q910.6 1763.3 909.1 1764.9Q907.6 1766.5 907.7 1768L907.7 1768.8Q908.5 1768.5 910.5 1767.6Q912.6 1766.7 914.8 1765.4Q916.9 1764.1 918.5 1762.4Q920.1 1760.7 920.1 1758.8ZM940 1798.9Q940 1798.4 940 1796.9Q940 1795.4 939.9 1794.9Q943.4 1786.1 949.1 1778.5Q954.8 1770.8 962.1 1764.8Q962.4 1764.8 962.9 1764.6Q963.4 1764.4 963.7 1764.4Q966.9 1764.3 969 1765.6Q971.2 1766.9 972.5 1769Q973.8 1771.2 974.4 1773.9Q975 1776.5 975.1 1779Q975.3 1783.7 973.3 1788.9Q971.3 1794 967.8 1798.4Q964.4 1802.7 959.8 1805.6Q955.3 1808.5 950.2 1808.6Q945.2 1808.8 942.7 1806.2Q940.1 1803.6 940 1798.9ZM949.2 1797.1Q949.3 1798.4 950.4 1798.8Q951.5 1799.3 952.5 1799.2Q955.5 1799.1 958.3 1797.4Q961 1795.7 963.1 1793.2Q965.2 1790.6 966.4 1787.6Q967.6 1784.6 967.5 1781.8Q967.5 1780.5 967.2 1778.9Q967 1777.3 966.4 1776.1Q965.7 1774.9 964.4 1774.2Q963.2 1773.5 960.9 1774.1Q959.3 1774.5 957.2 1777.3Q955.2 1780.1 953.3 1783.9Q951.5 1787.6 950.3 1791.3Q949.1 1794.9 949.2 1797.1ZM981.6 1794.1Q981.6 1793.6 981.6 1792Q981.6 1790.5 981.6 1790Q985.2 1780.8 991.1 1773Q997 1765.1 1004.6 1758.9Q1004.8 1758.9 1005.4 1758.7Q1005.9 1758.5 1006.2 1758.4Q1009.5 1758.3 1011.7 1759.7Q1013.9 1761 1015.3 1763.3Q1016.7 1765.5 1017.3 1768.3Q1017.9 1771 1018 1773.6Q1018.1 1778.4 1016.1 1783.8Q1014.1 1789.1 1010.5 1793.6Q1006.8 1798.1 1002.1 1801.1Q997.4 1804 992.2 1804.2Q987 1804.4 984.4 1801.7Q981.8 1799 981.6 1794.1ZM991.2 1792.3Q991.2 1793.6 992.3 1794.1Q993.5 1794.5 994.6 1794.5Q997.7 1794.4 1000.5 1792.6Q1003.4 1790.8 1005.6 1788.2Q1007.8 1785.6 1009 1782.5Q1010.3 1779.3 1010.2 1776.5Q1010.1 1775.1 1009.9 1773.5Q1009.6 1771.8 1009 1770.5Q1008.3 1769.3 1007 1768.6Q1005.6 1767.9 1003.3 1768.4Q1001.6 1768.9 999.5 1771.8Q997.4 1774.7 995.4 1778.6Q993.5 1782.4 992.3 1786.2Q991.1 1790 991.2 1792.3ZM1103.2 1762.3Q1100.3 1762.6 1096.5 1765.7Q1092.8 1768.7 1089.3 1773.2Q1085.8 1777.6 1083.3 1782.8Q1080.8 1788 1080.7 1792.5Q1080.6 1796.1 1082.5 1797.5Q1084.3 1799 1087.7 1799.1Q1091.5 1799.2 1095 1798.3Q1098.5 1797.5 1102.1 1796.5Q1105.7 1795.5 1109.2 1794.7Q1112.7 1793.8 1116.5 1793.9Q1116.4 1795.6 1115.9 1796.8Q1115.4 1798 1114.4 1799.3Q1107.9 1802.2 1101 1804.6Q1094.1 1807 1086.7 1806.8Q1084.5 1806.8 1082 1805.9Q1079.6 1805.1 1077.5 1803.5Q1075.4 1802 1074 1799.9Q1072.7 1797.7 1072.7 1795.1Q1072.9 1789.6 1074.6 1784.3Q1076.3 1779.1 1079.3 1774.5Q1082.2 1769.8 1086.3 1766Q1090.4 1762.1 1095.2 1759.2L1095.2 1759.1Q1097.1 1758.1 1099.5 1757.1Q1102 1756.1 1104.1 1755.9Q1106.2 1755.8 1107.6 1757Q1109 1758.2 1108.9 1761.4Q1108.9 1762.9 1108.6 1765.3Q1108.3 1767.7 1107.1 1768.7Q1106.1 1769.3 1104.5 1769.7Q1103.8 1770 1103 1770.1ZM1113.3 1793.9Q1113.3 1793.1 1113.4 1791.3Q1113.5 1789.6 1113.7 1787.9Q1113.9 1786.2 1114.1 1784.8Q1114.3 1783.5 1114.5 1783.1L1134.7 1738.8Q1135.1 1737.9 1136.4 1736.1Q1137.7 1734.3 1139.3 1732.4Q1140.8 1730.5 1142.4 1728.8Q1143.9 1727.1 1145 1726.2Q1145.8 1726.4 1146.2 1726.9Q1146.6 1727.5 1146.7 1728.3Q1146.9 1729.1 1146.8 1729.8Q1146.8 1730.5 1146.8 1731Q1146.9 1731.6 1146.9 1732.7Q1146.9 1733.7 1146.8 1733.7Q1145.7 1737 1143.4 1741.5Q1141 1746 1138.1 1751.2Q1135.2 1756.3 1132.1 1761.8Q1129 1767.4 1126.5 1772.8Q1124 1778.2 1122.5 1783.2Q1120.9 1788.1 1121 1792.2Q1121.1 1794.3 1122.4 1795.5Q1123.7 1796.8 1125.2 1797.7Q1126.7 1798.6 1127.9 1799.5Q1129.2 1800.4 1129.3 1802.1Q1129.3 1803.1 1128.4 1803.7Q1127.5 1804.3 1126.1 1804.3Q1121.1 1804.5 1117.3 1801.8Q1113.5 1799.1 1113.3 1793.9ZM1146.1 1786.5Q1146.1 1786.1 1146.2 1784.6Q1146.3 1783.1 1146.3 1782.6Q1150.1 1774.1 1156.1 1766.8Q1162.1 1759.6 1169.6 1754Q1169.8 1754 1170.3 1753.9Q1170.9 1753.7 1171.1 1753.7Q1174.3 1753.7 1176.3 1755.1Q1178.4 1756.5 1179.6 1758.7Q1180.8 1760.9 1181.2 1763.5Q1181.7 1766.2 1181.7 1768.6Q1181.6 1773.2 1179.4 1778.2Q1177.3 1783.2 1173.6 1787.4Q1170 1791.5 1165.4 1794.1Q1160.7 1796.7 1155.8 1796.7Q1150.8 1796.6 1148.4 1793.9Q1146.1 1791.2 1146.1 1786.5ZM1155.3 1785.2Q1155.3 1786.5 1156.4 1787Q1157.4 1787.5 1158.5 1787.5Q1161.4 1787.5 1164.2 1786Q1167 1784.4 1169.2 1782Q1171.4 1779.6 1172.7 1776.7Q1174.1 1773.8 1174.1 1771Q1174.1 1769.7 1173.9 1768.2Q1173.8 1766.6 1173.2 1765.3Q1172.6 1764.1 1171.4 1763.4Q1170.2 1762.6 1167.9 1763.1Q1166.3 1763.4 1164.1 1766.1Q1162 1768.8 1160 1772.4Q1158 1775.9 1156.7 1779.5Q1155.3 1783.1 1155.3 1785.2ZM1218 1753.3Q1215.1 1753.5 1211.3 1756.5Q1207.5 1759.6 1204 1763.9Q1200.5 1768.3 1198 1773.4Q1195.5 1778.6 1195.3 1783Q1195.2 1786.5 1197 1788Q1198.8 1789.5 1202.2 1789.6Q1205.9 1789.7 1209.5 1788.9Q1213 1788.1 1216.5 1787.2Q1220.1 1786.3 1223.6 1785.5Q1227.1 1784.7 1230.8 1784.8Q1230.7 1786.5 1230.2 1787.7Q1229.7 1788.8 1228.6 1790.1Q1222.2 1793 1215.3 1795.3Q1208.5 1797.6 1201.1 1797.3Q1198.9 1797.2 1196.5 1796.4Q1194.1 1795.5 1192 1793.9Q1190 1792.4 1188.6 1790.3Q1187.3 1788.1 1187.4 1785.5Q1187.6 1780 1189.3 1774.9Q1191.1 1769.7 1194.1 1765.1Q1197.1 1760.6 1201.2 1756.8Q1205.3 1753 1210.1 1750.2L1210.1 1750.1Q1212 1749 1214.4 1748Q1216.8 1747.1 1218.9 1747Q1221 1746.9 1222.4 1748.1Q1223.7 1749.3 1223.6 1752.5Q1223.6 1753.9 1223.3 1756.3Q1222.9 1758.7 1221.8 1759.7Q1220.8 1760.2 1219.2 1760.7Q1218.4 1760.9 1217.7 1761ZM1246.2 1783Q1244.7 1784.9 1243.6 1787.2Q1242.6 1789.6 1241.3 1791.7Q1240 1793.8 1238.3 1795.2Q1236.5 1796.6 1233.8 1796.4Q1231.5 1796.4 1230.7 1795.5Q1229.9 1794.7 1230 1792.3Q1230.1 1789.5 1231.8 1786.1Q1233.6 1782.6 1236 1779.4Q1238.4 1776.2 1240.9 1773.4Q1243.4 1770.6 1245 1768.9L1269 1721.8Q1270 1719.8 1272.2 1718.1Q1274.5 1716.4 1276.9 1716.5L1276.8 1720.4L1263 1749.3L1262.8 1752.2Q1264.9 1752.3 1266.7 1751.7Q1268.5 1751.1 1270.4 1750.3Q1272.2 1749.5 1274.2 1749Q1276.2 1748.4 1278.6 1748.5Q1280.7 1750 1280.7 1752.1Q1280.8 1754.2 1279.5 1756.6Q1278.2 1759 1276 1761.5Q1273.8 1763.9 1271.4 1766.1Q1269.1 1768.4 1266.9 1770.1Q1264.7 1771.8 1263.6 1772.7Q1261.8 1774.1 1260.2 1774.6Q1258.7 1775.1 1257.6 1775.5Q1256.5 1776 1256 1776.9Q1255.4 1777.8 1255.3 1780.1Q1255.2 1783.5 1256.9 1785.6Q1258.6 1787.8 1261.5 1789.1Q1264.4 1790.4 1268 1791Q1271.7 1791.5 1275.4 1791.7Q1279.1 1791.8 1282.5 1791.6Q1285.8 1791.5 1288.2 1791.2L1289.6 1792.7Q1288.2 1794.4 1285.5 1796Q1282.7 1797.5 1279.5 1798.6Q1276.3 1799.7 1273.1 1800.4Q1270 1801.1 1267.9 1801Q1264.1 1800.8 1260.6 1799.4Q1257 1798.1 1254.1 1795.7Q1251.2 1793.3 1249.1 1790Q1247 1786.7 1246.2 1783ZM1270.8 1756.9Q1269.7 1756.9 1267.6 1757.6Q1265.4 1758.4 1263.2 1759.6Q1260.9 1760.9 1259.3 1762.4Q1257.7 1763.9 1257.7 1765.4L1257.6 1766.3Q1258.5 1765.9 1260.6 1765.2Q1262.7 1764.4 1265 1763.3Q1267.3 1762.1 1269 1760.5Q1270.7 1758.9 1270.8 1756.9Z",fill:'#1B1920',stroke:'#1B1920','stroke-width':3.4,'stroke-linejoin':'round',filter:'url(#pFelt)'},gl);
  sv('path',{d:"M218.4 1870.6 L243.0 1870.1 L267.5 1870.0 L292.0 1870.0 L316.6 1870.1 L341.1 1870.0 L365.6 1869.9 L390.1 1869.8 L414.7 1869.5 L439.2 1869.2 L463.7 1868.7 L488.2 1868.2 L512.8 1867.7 L537.3 1867.0 L561.8 1866.3 L586.4 1865.6 L610.9 1864.9 L635.4 1864.2 L659.9 1863.5 L684.5 1862.8 L709.0 1862.1 L733.5 1861.5 L758.1 1861.0 L782.6 1860.4 L807.1 1859.9 L831.6 1859.5 L856.2 1859.1 L880.7 1858.6 L905.2 1858.2 L929.8 1857.8 L954.3 1857.4 L978.8 1857.0 L1003.3 1857.0 L1027.9 1855.9 L1052.4 1854.6 L1076.9 1853.4 L1101.4 1852.2 L1126.0 1850.9 L1150.5 1849.5 L1175.0 1848.0 L1199.6 1846.5 L1199.6 1846.8 L1175.0 1848.8 L1150.5 1850.7 L1126.0 1852.5 L1101.4 1854.3 L1076.9 1855.9 L1052.4 1857.4 L1027.9 1858.6 L1003.3 1859.7 L978.8 1861.8 L954.3 1863.2 L929.8 1864.5 L905.2 1865.6 L880.7 1866.6 L856.2 1867.6 L831.6 1868.5 L807.1 1869.4 L782.6 1870.3 L758.1 1871.1 L733.5 1871.9 L709.0 1872.7 L684.5 1873.6 L659.9 1874.4 L635.4 1875.2 L610.9 1875.9 L586.4 1876.6 L561.8 1877.2 L537.3 1877.8 L512.8 1878.3 L488.2 1878.6 L463.7 1878.9 L439.2 1879.0 L414.7 1879.0 L390.1 1878.8 L365.6 1878.5 L341.1 1878.0 L316.6 1877.4 L292.0 1876.7 L267.5 1875.9 L243.0 1874.9 L218.4 1873.4Z",fill:'#1B1920',filter:'url(#pFelt)',opacity:.94},g);
  sv('path',{d:"M118.4 1676.8 L145.1 1760.6 L75.3 1710.4 L158.3 1709.7 L94.0 1763.5 L122.4 1683.8",fill:'none',stroke:'#D9A02E','stroke-width':6.5,'stroke-linecap':'round','stroke-linejoin':'round',filter:'url(#pFelt)'},g);
  sv('path',{d:"M1359.6 1834 C1301.6 1794 1307.6 1740 1339.6 1744 C1355.6 1746 1361.6 1762 1361.6 1774 C1363.6 1754 1381.6 1736 1401.6 1750 C1429.6 1772 1389.6 1812 1353.6 1842",fill:'none',stroke:'#DE4F78','stroke-width':7,'stroke-linecap':'round','stroke-linejoin':'round',filter:'url(#pFelt)'},g);
})();

});
