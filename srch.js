const chromium=require('./lib/chromium.js'),puppeteer=require('puppeteer-core');const [,,w,h]=process.argv;
(async()=>{const b=await puppeteer.launch({args:chromium.args,executablePath:await chromium.executablePath(),headless:true});
 const p=await b.newPage();await p.setViewport({width:+w,height:+h,hasTouch:+w<800});await p.setRequestInterception(true);p.on('request',r=>r.url().startsWith('http://127.0.0.1')||r.url().startsWith('data:')?r.continue():r.abort());
 const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,100)));
 await p.goto((process.env.BASE||'http://127.0.0.1:8765/')+'final.html?lat=47.3582&lon=8.5361&name=Z%C3%BCrich',{waitUntil:'domcontentloaded'});await p.waitForSelector('#results .result');await new Promise(r=>setTimeout(r,2500));
 const R=await p.evaluate(async()=>{const S=ms=>new Promise(r=>setTimeout(r,ms)),R={};const ring=()=>(document.querySelector('#map .radiusLabel')||{}).textContent;
  R.segments=[...document.querySelectorAll('#dmRadius button')].map(b=>b.textContent).join('|');R.dropdownHidden=getComputedStyle(document.getElementById('radius')).display==='none';
  document.getElementById('dest').value='Rostock';document.querySelector('#dmRadius button[data-r="50"]').click();await S(400);document.getElementById('search').click();
  await S(3000);R.rostock={radius:document.getElementById('radius').value,segmentOn:(document.querySelector('#dmRadius button.on')||{}).dataset.r,ring:ring(),label:state.label,spots:document.querySelectorAll('#results .result').length};
  document.querySelector('#dmRadius button[data-r="10"]').click();await S(2500);R.changeTo10={radius:document.getElementById('radius').value,ring:ring()};
  document.getElementById('dest').value='Zürich';document.getElementById('search').click();await S(3000);R.newPlaceKeeps10=document.getElementById('radius').value;R.remembered=localStorage.getItem('dm_radius');
  return R});
 // drag the map, then Search this area
 const box=await p.evaluate(()=>{document.getElementById('mapPanel').scrollIntoView({block:'start'});const r=document.getElementById('map').getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]});await new Promise(r=>setTimeout(r,400));
 const c0=await p.evaluate(()=>state.center.slice());
 await p.evaluate(async([x,y])=>{const m=document.getElementById('map');const ev=(t,X,Y)=>m.dispatchEvent(new PointerEvent(t,{bubbles:true,cancelable:true,pointerId:1,clientX:X,clientY:Y,pointerType:'touch',isPrimary:true}));
  ev('pointerdown',x,y);for(let i=1;i<=12;i++){ev('pointermove',x-i*18,y-i*10);await new Promise(r=>setTimeout(r,20))}ev('pointerup',x-216,y-120)},box);await new Promise(r=>setTimeout(r,700));
 R.afterDrag=await p.evaluate(()=>({pill:document.getElementById('dmHere').classList.contains('on'),cross:document.getElementById('dmCross').classList.contains('on')}));await p.screenshot({path:'srch_'+w+'_pill.png'});
 await p.evaluate(()=>document.getElementById('dmHere').click());await new Promise(r=>setTimeout(r,2500));
 R.searchThisArea=await p.evaluate(c0=>({centerMoved:Math.abs(state.center[1]-c0[1])>0.005,radiusKept:document.getElementById('radius').value,pillGone:!document.getElementById('dmHere').classList.contains('on'),label:state.label,spots:document.querySelectorAll('#results .result').length}),c0);
 // pick on map
 const c1=await p.evaluate(()=>state.center.slice());await p.evaluate(()=>document.getElementById('movePoint').click());await new Promise(r=>setTimeout(r,800));
 R.pickMode=await p.evaluate(()=>({hintShown:getComputedStyle(document.getElementById('dmPickHint')).display!=='none',mapOnScreen:document.getElementById('map').getBoundingClientRect().top<innerHeight}));await p.screenshot({path:'srch_'+w+'_pick.png'});
 const pt=await p.evaluate(()=>{const r=document.getElementById('map').getBoundingClientRect();return [r.left+r.width*0.25,r.top+r.height*0.35]});
 if(+w<800)await p.touchscreen.tap(pt[0],pt[1]);else await p.mouse.click(pt[0],pt[1]);await new Promise(r=>setTimeout(r,2000));
 R.pickTap=await p.evaluate(c1=>({centerMoved:Math.abs(state.center[1]-c1[1])>0.002,modeEnded:!document.getElementById('map').classList.contains('dmPicking'),radiusKept:document.getElementById('radius').value}),c1);
 await p.evaluate(()=>document.getElementById('movePoint').click());await new Promise(r=>setTimeout(r,500));await p.evaluate(()=>document.querySelector('#dmPickHint button').click());await new Promise(r=>setTimeout(r,300));
 R.cancelWorks=await p.evaluate(()=>!document.getElementById('map').classList.contains('dmPicking'));
 console.log(w+'px',JSON.stringify(R,null,1),'\npageerrors',errs.length,JSON.stringify(errs));process.exit(0)})();
