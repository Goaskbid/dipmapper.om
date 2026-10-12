const chromium=require('./lib/chromium.js'),puppeteer=require('puppeteer-core');const [,,w,h]=process.argv;
(async()=>{const b=await puppeteer.launch({args:[...chromium.args,'--no-sandbox'],executablePath:await chromium.executablePath(),headless:true});
 const p=await b.newPage();await p.setViewport({width:+w,height:+h,hasTouch:+w<800,isMobile:false});await p.setRequestInterception(true);p.on('request',r=>r.url().startsWith('http://127.0.0.1')||r.url().startsWith('data:')?r.continue():r.abort());
 await p.goto('http://127.0.0.1:8765/final.html?lat=47.3582&lon=8.5361&name=Z%C3%BCrich',{waitUntil:'domcontentloaded'});await p.waitForSelector('#results .result');await p.waitForFunction(()=>window.__dmBootDone||!document.getElementById('dmBoot'),{timeout:15000}).catch(()=>{});await new Promise(r=>setTimeout(r,1200));
 const res=[];
 for(const [label,delay,scroll,refresh] of [['right after open',250,0,0],['after 0.6 s',600,0,0],['scrolled 700',900,700,0],['during refresh',900,0,1],['scrolled + refresh',900,700,1]]){
  await p.evaluate(()=>{document.querySelectorAll('#results .result')[2].click()});await new Promise(r=>setTimeout(r,delay));
  if(scroll)await p.evaluate(s=>{const d=document.getElementById('drawer');d.scrollTop=s},scroll);
  if(refresh)await p.evaluate(()=>{setTimeout(()=>openCard(state.selected,true),5);setTimeout(()=>openCard(state.selected,true),40)});
  /* the card slides in (about 0.4 s); like a person, click the close button once it has stopped moving */
  await p.evaluate(async()=>{const d=document.getElementById('drawer');let last=null;for(let i=0;i<40;i++){await new Promise(r=>requestAnimationFrame(r));const x=Math.round(d.getBoundingClientRect().left);if(x===last)break;last=x}});
  const info=await p.evaluate(()=>{let c=document.getElementById('close').getBoundingClientRect();if(!(c.width>0&&c.top>0&&c.top<innerHeight)){document.getElementById('drawer').dispatchEvent(new Event('scroll'));const f=document.querySelector('.dmFloat.on .dmFx');if(f)c=f.getBoundingClientRect()}const x=c.left+c.width/2,y=c.top+c.height/2;const top=document.elementFromPoint(x,y);
   return {x,y,visible:c.width>0&&y>0&&y<innerHeight,topEl:top?(top.id||String(top.className).slice(0,24)||top.tagName):'none',isClose:!!(top&&top.closest('#close,.dmFx'))}});
  if(info.visible){if(+w<800)await p.touchscreen.tap(info.x,info.y);else await p.mouse.click(info.x,info.y)}
  await new Promise(r=>setTimeout(r,500));const open=await p.evaluate(()=>document.getElementById('drawer').classList.contains('open'));
  res.push(`${label.padEnd(20)} close btn on screen:${info.visible} topmost:${info.topEl}${info.isClose?'':' (NOT close)'} -> ${open?'STILL OPEN':'closed'}`);
  if(open)await p.evaluate(()=>closeCard());await new Promise(r=>setTimeout(r,300))}
 console.log(w+'px\n  '+res.join('\n  '));process.exit(0)})();
