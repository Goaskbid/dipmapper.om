const chromium=require('./lib/chromium.js'),puppeteer=require('puppeteer-core');
(async()=>{const b=await puppeteer.launch({args:chromium.args,executablePath:await chromium.executablePath(),headless:true});const out=[];
 for(const [w,h,touch] of [[390,844,true],[1440,900,false]]){const p=await b.newPage();await p.setViewport({width:w,height:h,hasTouch:touch,isMobile:touch});await p.setRequestInterception(true);
  p.on('request',r=>{const u=r.url();if(u.includes('photon'))return r.respond({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'{"features":[]}'});if(u.startsWith('http://127.0.0.1')||u.startsWith('data:'))return r.continue();r.abort()});
  await p.goto('http://127.0.0.1:8765/final.html?lat=47.3582&lon=8.5361&name=Z%C3%BCrich',{waitUntil:'domcontentloaded'});await p.waitForSelector('#results .result');await new Promise(r=>setTimeout(r,3000));
  const pos=await p.evaluate(()=>{const d=document.getElementById('dest');d.scrollIntoView({block:'center'});const r=d.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2,d.value]});await new Promise(r=>setTimeout(r,300));
  if(touch)await p.touchscreen.tap(pos[0],pos[1]);else await p.mouse.click(pos[0],pos[1]);await new Promise(r=>setTimeout(r,250));
  await p.keyboard.type('Gen',{delay:60});await new Promise(r=>setTimeout(r,800));
  const o=await p.evaluate(()=>({value:document.getElementById('dest').value,suggestions:[...document.querySelectorAll('.dmSug:not([hidden]) button')].map(x=>x.innerText.replace(/\s+/g,' ').trim())}));
  out.push((touch?'phone tap':'desktop click')+': field had "'+pos[2]+'" → after typing "Gen": "'+o.value+'" | suggestions '+JSON.stringify(o.suggestions));await p.close()}
 console.log(out.join('\n'));process.exit(0)})();
