// No-go zones: when the map server fails, the zone query is retried (it used to be given up for good) and the result is cached.
const chromium=require('./lib/chromium.js'),puppeteer=require('puppeteer-core'),fs=require('fs'),actmock=require('./lib/actmock.js');const PHOTO=fs.readFileSync(require('path').join(__dirname,'photo.jpg'));
const T0=Date.now();(async()=>{const b=await puppeteer.launch({args:chromium.args,executablePath:await chromium.executablePath(),headless:true});const p=await b.newPage();await p.setViewport({width:1440,height:900});
 let zoneCalls=0;await p.setRequestInterception(true);p.on('request',r=>{const u=r.url();const J=(o,d)=>setTimeout(()=>r.respond({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(o)}).catch(()=>{}),d||100);
  if(/interpreter|overpass/.test(u)){const q=decodeURIComponent((u.split('data=')[1]||r.postData()||'').replace(/\+/g,' '));if(/restricted_area/.test(q)){zoneCalls++;console.log('zone call',zoneCalls,((Date.now()-T0)/1000).toFixed(1)+'s',r.method());if(zoneCalls<=2*5)return r.respond({status:504,contentType:'text/plain',body:'Gateway timeout'}).catch(()=>{})}}
  if(actmock(u,J,{}))return;if(/interpreter|overpass/.test(u))return J({elements:[]});if(u.startsWith('http://127.0.0.1')||u.startsWith('data:'))return r.continue();if(r.resourceType()==='image')return r.respond({status:200,contentType:'image/jpeg',body:PHOTO}).catch(()=>{});r.abort()});
 await p.evaluateOnNewDocument(()=>{try{Object.keys(localStorage).filter(k=>/^dm_zones2?_/.test(k)).forEach(k=>localStorage.removeItem(k))}catch(e){}});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://127.0.0.1:8765/final.html?lat=47.3582&lon=8.5361&name=Z%C3%BCrich',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.__dmBootDone,{timeout:15000});await new Promise(r=>setTimeout(r,2000));
 await p.evaluate(()=>document.querySelector('#dmActBar button[data-a="paddle"]').click());
 let zones=0,t0=Date.now();while(Date.now()-t0<40000){await new Promise(r=>setTimeout(r,1000));zones=await p.evaluate(()=>document.querySelectorAll('#map .dmZoneSvg polygon,#map .dmZoneSvg circle').length);if(zones)break}
 const cached=await p.evaluate(()=>Object.keys(localStorage).filter(k=>/^dm_zones2?_/.test(k)).length);
 console.log(JSON.stringify({failedCallsBeforeSuccess:Math.min(zoneCalls,10),zonesShown:zones,secondsUntilShown:Math.round((Date.now()-t0)/1000),cached}),'\npageerrors',errs.length);await b.close();process.exit(0)})();
