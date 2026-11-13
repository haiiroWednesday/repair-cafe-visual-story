addEventListener('DOMContentLoaded',()=>{
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const NS='http://www.w3.org/2000/svg';
const sv=(t,a,p)=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);p&&p.appendChild(e);return e;};

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
  add('.heartfig .stage > img.pc',{n:3,ms:200}); add('.tray .stk',{n:5,ms:90}); add('.clockfig .polawrap');
  add('.clockfig .stepimg',{n:3,ms:260}); add('.clockfig .stepl',{n:3,ms:260}); add('#bench .cfig.plate .plimg');
})();

});
