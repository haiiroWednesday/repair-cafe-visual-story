(async function(){
const shape = location.hash.slice(1) || 'cake';
const R = new T.WebGLRenderer({ canvas: document.getElementById('c'), antialias: true, preserveDrawingBuffer: true }); R.setPixelRatio(1); R.setSize(900, 700); R.outputColorSpace = T.SRGBColorSpace; R.setClearColor(0xF6EEE2);
const scene = new T.Scene(), cam = new T.PerspectiveCamera(28, 900/700, .1, 200);
scene.add(new T.HemisphereLight(0xFFF6EA, 0xD9C7B4, 1.6)); const sun = new T.DirectionalLight(0xFFF1DE, 1.5); sun.position.set(-4, 8, 6); scene.add(sun);
const ink = (geo, hex, w=.02) => inked(geo, flat(hex), w);
const box = (w,h,d,hex,p,par=scene)=>{const o=ink(new T.BoxGeometry(w,h,d),hex,.012); o.position.set(...p); par.add(o); return o;};
const cyl = (r,h,hex,p,par=scene,seg=48)=>{const o=ink(new T.CylinderGeometry(r,r,h,seg),hex,.015); o.position.set(...p); par.add(o); return o;};
const table = (p, par=scene, col='#D6D3CC', w=.7) => { box(w,.03,.35,col,[p[0],p[1]+.32,p[2]],par); box(.03,.32,.03,'#4E4A4A',[p[0]-w/2+.05,p[1]+.16,p[2]],par); box(.03,.32,.03,'#4E4A4A',[p[0]+w/2-.05,p[1]+.16,p[2]],par); };
const person = (p,par=scene,c='#86AEDC') => { cyl(.06,.28,c,[p[0],p[1]+.14,p[2]],par,12); const h=new T.Mesh(new T.SphereGeometry(.06,12,10),flat('#E8C4A8')); h.position.set(p[0],p[1]+.34,p[2]); par.add(h); };
const CURT=['#E8857B','#F0A05A','#EFC15E','#8FCBB2','#86AEDC','#B79FD6'];
if (shape==='cake') {
  // three cake tiers as floors, scalloped frosting rims, central pole, cuckoo topper
  const tiers=[[3.0,0,.5,'#F3D9A4','#F7D3CC'],[2.1,1.7,.42,'#F2C9C2','#FFFDF9'],[1.25,3.2,.36,'#CFE3DC','#F8E6B4']];
  tiers.forEach(([r,y,h,sp,fr],i)=>{ cyl(r,h,sp,[0,y+h/2,0]); const top=cyl(r+.04,.06,fr,[0,y+h,0]);
    for(let k=0;k<36;k++){const a=k/36*Math.PI*2; const d=new T.Mesh(new T.SphereGeometry(.09,10,8),flat(fr)); d.scale.set(1,1.6,1); d.position.set(Math.cos(a)*(r+.02),y+h-.06,Math.sin(a)*(r+.02)); scene.add(d);} 
    // curved back wall (half), rainbow curtains on the bottom tier
    if(i<2){ const wg=new T.CylinderGeometry(r-.05,r-.05,i?1.05:1.15,48,1,true,Math.PI*.55,Math.PI*.9); const wm=toon(crayonCanvas(i?'#CFE3DC':'#F4EBDD',256,256,200)); wm.side=T.DoubleSide; const w=new T.Mesh(wg,wm); w.position.y=y+h+(i?.52:.57); scene.add(w);
      if(!i) CURT.forEach((c,j)=>{const a=Math.PI*.6+j*.14; const cu=box(.4,1.0,.03,c,[Math.sin(a)*(r-.12),y+h+.5,Math.cos(a)*(r-.12)]); cu.rotation.y=a;}); }
  });
  cyl(.08,5.2,'#C8A866',[0,2.6,0],scene,16);
  // stations
  const y1=.56; table([1.2,y1,.9],scene); table([-.6,y1,1.6],scene,'#D6D3CC',.9); table([1.6,y1,-.6],scene); table([-1.6,y1,.3],scene,'#A0673F',.5); box(.9,.6,.3,'#B07A52',[-.9,y1+.3,-1.9]); person([1.2,y1,1.2]); person([-.6,y1,1.95],scene,'#E8857B');
  const y2=2.15; table([.8,y2,.7],scene); table([-.8,y2,.6],scene); box(.5,.7,.25,'#9A6440',[0,y2+.35,-1.5]);
  const y3=3.58; box(.4,.7,.25,'#B07A52',[0,y3+.6,-.4]); cyl(.18,.12,'#B79FD6',[.5,y3+.06,.5]);
  box(.5,.6,.04,'#2E2E30',[1.9,.06+.3,2.6]); // sidewalk sign
  cam.position.set(7.5,6.2,9.5); cam.lookAt(0,1.6,0);
} else if (shape==='teapot') {
  // a teapot-shaped café, cut open on the camera side, two floors inside, spout as awning, lid as roof
  const prof=[[0,0],[2.2,0],[2.8,.4],[3.1,1.2],[3.1,2.0],[2.8,2.8],[2.2,3.3],[1.4,3.55],[0,3.6]].map(([x,y])=>new T.Vector2(x,y));
  const g=new T.LatheGeometry(prof,64,Math.PI*.15,Math.PI*1.45); const m=toon(chinaCanvas('#86AEDC',{gold:[.1,.92],dots:[.5,40]})); m.side=T.DoubleSide; const body=new T.Mesh(g,m); body.rotation.y=Math.PI*.15; scene.add(body);
  // floors
  cyl(3.0,.12,'#B07A52',[0,.06,0]); const f2=new T.Mesh(new T.CylinderGeometry(2.95,2.95,.1,64,1,false,0,Math.PI*1.55),flat('#C08A5C')); f2.position.y=1.8; f2.rotation.y=Math.PI*.55; scene.add(f2);
  // lid roof + knob clock
  const lid=new T.Mesh(new T.LatheGeometry([[0,0],[1.6,0],[1.5,.3],[.9,.6],[.3,.75],[0,.8]].map(([x,y])=>new T.Vector2(x,y)),48),flat('#F7D3CC')); lid.position.y=3.55; scene.add(lid); box(.5,.6,.3,'#B07A52',[0,4.6,0]);
  // spout (tube) as entrance awning, handle as stairs loop
  const sp=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([[2.6,1.2,.8],[3.6,1.6,1.4],[4.2,2.6,1.6],[4.5,3.0,1.6]].map(v=>new T.Vector3(...v))),30,.35,16),flat('#86AEDC')); scene.add(sp);
  const hd=new T.Mesh(new T.TorusGeometry(1.3,.22,12,40,Math.PI*1.2),flat('#86AEDC')); hd.position.set(-3.0,2.0,-.6); hd.rotation.set(0,.4,-Math.PI*.6); scene.add(hd);
  table([.8,.12,1.2],scene); table([-.9,.12,1.0],scene); table([1.5,.12,-.3],scene); table([.5,1.85,.8],scene); table([-1.0,1.85,.4],scene); person([.8,.12,1.5]); box(.6,.04,.4,'#D6D3CC',[4.0,0,3.0]);
  cam.position.set(8.0,6.0,10.0); cam.lookAt(0,1.7,0);
} else if (shape==='house') {
  // a pop-up patisserie townhouse opening at a 90 degree corner like a Jablow book: two floors, mansard roof, side wings on the book flaps
  const BL='#CFE3EA', WAIN='#F4EBDD', GOLDC='#C8A866';
  box(7,.06,7,'#F8F1E6',[0,0,0]); // the open book base (corner spread)
  // two walls meeting in a corner (back-left, back-right) two storeys high
  const wallH=3.2;
  const wl=box(.08,wallH,3.4,BL,[-1.7,wallH/2,-.0]); const wr=box(3.4,wallH,.08,BL,[0,wallH/2,-1.7]);
  // floors: ground and a quarter-round upper floor cut at the front edge
  const f2s=new T.Shape(); f2s.moveTo(-1.7,-1.7); f2s.lineTo(1.7,-1.7); f2s.lineTo(1.7,-.3); f2s.quadraticCurveTo(.4,1.2,-1.7,1.7); f2s.closePath();
  const f2g=new T.ExtrudeGeometry(f2s,{depth:.1,bevelEnabled:false}); f2g.rotateX(Math.PI/2); const f2=inked(f2g,flat('#C08A5C'),.01); f2.position.y=1.7; scene.add(f2);
  box(3.4,.08,3.4,'#B07A52',[0,.04,0]);
  // mansard roof sitting on top of the corner
  const roof=new T.Mesh(new T.ConeGeometry(2.6,1.4,4,1,true),flat('#E8B9C4')); roof.rotation.y=Math.PI/4; roof.position.set(0,wallH+.7,0); scene.add(roof);
  for(let k=0;k<5;k++) box(.3,.5,.3,'#F4EBDD',[-1.2+k*.6,wallH+.25,-1.55]);
  // cornice frosting along the wall tops
  for(let k=0;k<20;k++){const d=new T.Mesh(new T.SphereGeometry(.08,8,6),flat('#FFFDF9')); d.position.set(-1.7+k*.17,wallH,-1.65); scene.add(d); const e=d.clone(); e.position.set(-1.65,wallH,-1.7+k*.17); scene.add(e);}
  // side wings on the book flaps: outdoor sidewalk café (left) and an awning shopfront (right)
  box(2.2,.04,3.2,'#E9DCC8',[-3.0,.02,.6]); table([-2.8,.04,.8],scene,'#A0673F',.5); box(.5,.6,.04,'#2E2E30',[-3.0,.3,2.0]);
  box(.08,1.6,2.2,'#F7D3CC',[2.4,.8,.2]); const aw=box(.6,.04,2.2,'#E8857B',[2.75,1.55,.2]); aw.rotation.z=-.4;
  // ground floor: order counter, kitchen benches; upper floor: patisserie sewing room and the memory cabinet
  box(1.4,.6,.4,'#9A6440',[.6,.34,-1.2]); table([-.8,.08,.2]); table([.6,.08,.6]); person([.6,.08,.9]); person([-.8,.08,.5],scene,'#E8857B');
  table([.4,1.75,-.8]); table([-.9,1.75,-.2]); box(.5,.8,.25,'#B07A52',[-1.4,2.15,-1.4]);
  cam.position.set(8.5,6.5,9.5); cam.lookAt(0,1.6,0);
} else {
  // open pastry box: lid propped up behind, compartments on doilies, front flap as sidewalk
  const W=6,D=4,H=.9, pink='#F2B8C6';
  box(W,.06,D,'#FFF6F0',[0,.03,0]); [[0,H/2,-D/2,W,H,.05],[0,H/2,D/2,W,H*.5,.05]].forEach(([x,y,z,w,h,d])=>box(w,h,d,pink,[x,z>0?h/2:y,z]));
  [-1,1].forEach(s=>box(.05,H,D,pink,[s*W/2,H/2,0]));
  const lid=new T.Group(); lid.position.set(0,H,-D/2); lid.rotation.x=-1.9; scene.add(lid); box(W,.05,D,pink,[0,0,D/2],lid);
  const flap=new T.Group(); flap.position.set(0,0,D/2); flap.rotation.x=.0; scene.add(flap); box(W,.04,1.4,'#E9DCC8',[0,0,.7],flap);
  // compartments 3x2 with dividers
  for(let i=1;i<3;i++) box(.04,.5,D-.1,'#FFFDF9',[-W/2+i*W/3,.25,0]); box(W-.1,.5,.04,'#FFFDF9',[0,.25,0]);
  for(let i=0;i<3;i++) for(let j=0;j<2;j++){ const cx=-W/2+W/6+i*W/3, cz=-D/4+j*D/2; const d=new T.Mesh(new T.CircleGeometry(.85,24),flat('#FFFFFF')); d.rotation.x=-Math.PI/2; d.position.set(cx,.07,cz); scene.add(d); table([cx,.06,cz],scene,['#D6D3CC','#A0673F'][(i+j)%2],.8); person([cx+.3,.06,cz+.3]); }
  box(.5,.6,.04,'#2E2E30',[-2,.35,D/2+.9]);
  cam.position.set(7.0,7.0,10.0); cam.lookAt(0,.8,0);
}
R.render(scene,cam); document.title='done';
})();
