const chromium=require('./lib/chromium.js'),puppeteer=require('puppeteer-core');const mode=process.argv[2];
(async()=>{const b=await puppeteer.launch({args:[...chromium.args,'--no-sandbox','--allow-file-access-from-files'],executablePath:await chromium.executablePath(),headless:true});
 const p=await b.newPage();await p.setViewport({width:1440,height:900});await p.setRequestInterception(true);const errs=[];p.on('pageerror',e=>errs.push(e.message));let adReq=0;
 p.on('request',r=>{const u=r.url();if(u.includes('pagead2')){adReq++;return mode==='slow'?setTimeout(()=>r.abort(),20000):r.respond({status:200,contentType:'application/javascript',body:''})}
  if(u.startsWith('file:')||u.startsWith('http://127.0.0.1')||u.startsWith('data:'))return r.continue();r.abort()});
 const t0=Date.now();await p.goto('file://'+require('path').join(__dirname,'_site','final.html')+'?lat=47.3582&lon=8.5361&name=Z%C3%BCrich',{waitUntil:'domcontentloaded'});const dcl=Date.now()-t0;
 await p.waitForSelector('#results .result',{timeout:15000}).catch(()=>{});await new Promise(r=>setTimeout(r,2000));
 const o=await p.evaluate(()=>({results:document.querySelectorAll('#results .result').length,gateHidden:!dmGateVisible(),adUnits:document.querySelectorAll('ins.adsbygoogle').length}));
 await p.evaluate(()=>document.querySelector('[data-filter="beach"]').click());await new Promise(r=>setTimeout(r,300));const resp=await p.evaluate(()=>document.querySelectorAll('#results .result').length);
 console.log('file://',mode.padEnd(5),'| page usable after',dcl,'ms |',JSON.stringify(o),'| filter responds:',resp,'| ad script requested:',adReq,'| pageerrors',errs.length);process.exit(0)})();
