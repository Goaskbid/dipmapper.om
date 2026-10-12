// Emergency & help section: country numbers and the nearest lifeguard, police, hospital etc. in the swim card and in the activity card.
const chromium=require('./lib/chromium.js'),puppeteer=require('puppeteer-core'),fs=require('fs'),actmock=require('./lib/actmock.js');const PHOTO=fs.readFileSync(require('path').join(__dirname,'photo.jpg'));const [,,w,h]=process.argv;
(async()=>{const b=await puppeteer.launch({args:chromium.args,executablePath:await chromium.executablePath(),headless:true});const p=await b.newPage();await p.setViewport({width:+w,height:+h,isMobile:+w<800,hasTouch:+w<800});
 await p.setRequestInterception(true);p.on('request',r=>{const u=r.url();const J=(o,d)=>setTimeout(()=>r.respond({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(o)}).catch(()=>{}),d||100);
  if(actmock(u,J,{}))return;if(/interpreter|overpass/.test(u))return J({elements:[]});if(u.startsWith('http://127.0.0.1')||u.startsWith('data:'))return r.continue();if(r.resourceType()==='image')return r.respond({status:200,contentType:'image/jpeg',body:PHOTO}).catch(()=>{});r.abort()});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://127.0.0.1:8765/final.html?lat=47.3582&lon=8.5361&name=Z%C3%BCrich',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.__dmBootDone,{timeout:15000});await new Promise(r=>setTimeout(r,3000));
 const S=ms=>new Promise(r=>setTimeout(r,ms));
 await p.evaluate(()=>{const r=document.querySelectorAll('#results .result');r[0]&&r[0].click()});await S(3000);
 const sw=await p.evaluate(()=>{const s=document.querySelector('#cardBody .dmSOS');if(s)s.scrollIntoView();return s?{tiles:[...s.querySelectorAll('.dmSosT')].map(t=>t.innerText.replace(/\n/g,' ')),help:[...s.querySelectorAll('.dmHelpR')].map(t=>t.innerText.replace(/\n/g,' ').slice(0,60))}:null});
 await S(500);
 await p.evaluate(()=>{try{closeCard()}catch(e){}});await S(500);
 await p.evaluate(()=>document.querySelector('#dmActBar button[data-a="paddle"]').click());await S(3500);await p.evaluate(()=>document.querySelector('#dmActList .dmAopen').click());await S(3000);
 const ac=await p.evaluate(()=>{const s=document.querySelector('#dmActSheet .dmSOS');if(s)s.scrollIntoView({block:'start'});return s?{tiles:s.querySelectorAll('.dmSosT').length,help:s.querySelectorAll('.dmHelpR').length}:null});
 if(process.env.SHOT){await S(600);await p.screenshot({path:process.env.SHOT})}
 console.log(JSON.stringify({swim:sw,act:ac}),'\npageerrors',errs.length,JSON.stringify(errs));await b.close()})();
