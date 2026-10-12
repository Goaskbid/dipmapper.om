const chromium=require('./lib/chromium.js'),puppeteer=require('puppeteer-core');const [,,base,w,h]=process.argv;
(async()=>{const b=await puppeteer.launch({args:chromium.args,executablePath:await chromium.executablePath(),headless:true});
 const p=await b.newPage();await p.setViewport({width:+w,height:+h,isMobile:true,hasTouch:true});
 await p.setRequestInterception(true);p.on('request',r=>r.url().startsWith('http://127.0.0.1')||r.url().startsWith('data:')?r.continue():r.abort());
 await p.goto(base+'?lat=47.3582&lon=8.5361&name=Z%C3%BCrich',{waitUntil:'domcontentloaded'});await p.waitForSelector('#results .result');await new Promise(r=>setTimeout(r,5000));
 const snapY=await p.evaluate(()=>Math.round(document.getElementById('mapPanel').getBoundingClientRect().top+scrollY-document.querySelector('.topbar').offsetHeight));
 const rows=[];for(const y of [0,80,160,240,snapY-60,snapY,snapY+60,snapY+150,snapY+250,snapY+400,snapY+600,snapY+900,2000]){
  const r=await p.evaluate(async(y)=>{scrollTo({top:y,behavior:'instant'});await new Promise(r=>setTimeout(r,900));return Math.round(scrollY)},y);rows.push(y+'→'+r)}
 const v=await p.evaluate(()=>{scrollTo({top:document.getElementById('mapPanel').getBoundingClientRect().top+scrollY-document.querySelector('.topbar').offsetHeight,behavior:'instant'});const hh=document.querySelector('.topbar').offsetHeight;const m=document.getElementById('map').getBoundingClientRect(),f=document.getElementById('filters').getBoundingClientRect();return {mapTop:Math.round(m.top),mapH:Math.round(m.height),pillsEnd:Math.round(f.bottom),screen:innerHeight,allInView:m.top>=hh-1&&f.bottom<=innerHeight+1}});
 console.log(w+'x'+h,'hold point',snapY,'| scroll ends at → page rests at:',rows.join('  '),'\n at hold point:',JSON.stringify(v));process.exit(0)})();
