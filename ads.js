const chromium=require('./lib/chromium.js'),puppeteer=require('puppeteer-core');const mode=process.argv[2];
const CFG=`window.DM_ADS={client:'ca-pub-2870312071451207',header:'1111111111',mid:'2222222222',list:'3333333333',footer:'4444444444'};`;
(async()=>{const b=await puppeteer.launch({args:[...chromium.args,'--no-sandbox'],executablePath:await chromium.executablePath(),headless:true});
 const p=await b.newPage();await p.setViewport({width:1440,height:900});await p.setRequestInterception(true);
 p.on('request',r=>{const u=r.url();
  if(u.endsWith('/ads-config.js'))return r.respond({status:200,contentType:'application/javascript',body:mode==='ids'?CFG:"window.DM_ADS={client:'ca-pub-2870312071451207',header:'',mid:'',list:'',footer:''};"});
  if(u.includes('pagead2.googlesyndication.com'))return r.respond({status:200,contentType:'application/javascript',body:'window.__adsLoaderRan=true;'});
  if(u.startsWith('http://127.0.0.1')||u.startsWith('data:'))return r.continue();r.abort()});
 await p.goto('http://127.0.0.1:8765/final.html',{waitUntil:'domcontentloaded'});await new Promise(r=>setTimeout(r,2500));
 const gateOpen=await p.evaluate(()=>({gateVisible:dmGateVisible(),unitsWhileGateOpen:document.querySelectorAll('ins.adsbygoogle').length}));
 await p.goto('http://127.0.0.1:8765/final.html?lat=47.3582&lon=8.5361&name=Z%C3%BCrich',{waitUntil:'domcontentloaded'});await p.waitForSelector('#results .result');await new Promise(r=>setTimeout(r,3000));
 const o=await p.evaluate(()=>{const ins=[...document.querySelectorAll('ins.adsbygoogle')];
  const pos=id=>{const e=document.getElementById(id);if(!e)return null;return {w:Math.round(e.getBoundingClientRect().width),after:(e.previousElementSibling||{}).id||(e.previousElementSibling||{}).className||''}};
  return {loaderRequested:!!window.__adsLoaderRan,units:ins.map(i=>i.closest('.dmAd').id+':'+i.dataset.adSlot+':'+i.dataset.adClient.slice(-4)),
   labelled:[...document.querySelectorAll('.dmAd')].every(d=>/Advertisement/.test(d.textContent)),pushes:(window.adsbygoogle||[]).length,
   pushedOnceEach:ins.every(i=>i.dataset.dmPushed==='1'),midSlot:pos('dmAdMid'),listSlot:pos('dmAdList'),listInsideResults:!!document.querySelector('#results .dmAd')}});
 console.log(mode.padEnd(6),JSON.stringify(gateOpen),JSON.stringify(o));process.exit(0)})();
