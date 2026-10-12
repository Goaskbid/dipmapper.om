const chromium=require('./lib/chromium.js'),puppeteer=require('puppeteer-core'),fs=require('fs');const PHOTO=fs.readFileSync(require('path').join(__dirname,'photo.jpg'));const f=process.argv[2];
(async()=>{const b=await puppeteer.launch({args:[...chromium.args,'--no-sandbox'],executablePath:await chromium.executablePath(),headless:true});
 const p=await b.newPage();await p.setViewport({width:390,height:844,hasTouch:true});await p.setRequestInterception(true);
 p.on('request',r=>{const u=r.url();if(u.startsWith('http://127.0.0.1')||u.startsWith('data:'))return r.continue();if(/arcgisonline|openstreetmap\.org\/\d|tile/.test(u)&&r.resourceType()==='image')return r.respond({status:200,contentType:'image/jpeg',body:PHOTO});r.abort()});
 await p.evaluateOnNewDocument(()=>{window.__rm=0;new MutationObserver(ms=>{for(const m of ms)for(const n of m.removedNodes)if(n.nodeType===1&&n.tagName==='IMG'&&m.target.classList&&m.target.classList.contains('dmTiles'))window.__rm++}).observe(document,{childList:true,subtree:true})});
 await p.goto('http://127.0.0.1:8765/'+f+'?lat=47.3582&lon=8.5361&name=Z%C3%BCrich',{waitUntil:'domcontentloaded'});await p.waitForSelector('#results .result');await new Promise(r=>setTimeout(r,4000));
 /* wait until the swim search has finished: its final map fit moves the map once, which is not a blink */
 await p.waitForFunction(()=>!document.documentElement.classList.contains('dmLoading'),{timeout:30000}).catch(()=>{});await new Promise(r=>setTimeout(r,800));
 const R={};const rm=()=>p.evaluate(()=>window.__rm);
 let a=await rm();await p.evaluate(()=>{for(let i=0;i<10;i++){state._tileSig=null;drawMap()}});await new Promise(r=>setTimeout(r,600));R.tilesDestroyedBy10Redraws=(await rm())-a;
 a=await rm();for(const h of [760,844,700,844]){await p.setViewport({width:390,height:h,hasTouch:true});await new Promise(r=>setTimeout(r,450))}R.tilesDestroyedByAddressBarResizes=(await rm())-a;
 a=await rm();await p.evaluate(async()=>{document.documentElement.style.scrollBehavior='auto';for(let y=0;y<=1600;y+=200){scrollTo(0,y);await new Promise(r=>setTimeout(r,60))}scrollTo(0,0)});await new Promise(r=>setTimeout(r,500));R.tilesDestroyedByScrolling=(await rm())-a;
 R.blankAfterZoom=await p.evaluate(async()=>{const t=document.querySelector('#map .dmTiles');const zin=[...document.querySelectorAll('#mapPanel button')].find(x=>x.textContent.trim()==='+');zin.click();let minVis=99;
  for(let i=0;i<20;i++){await new Promise(r=>setTimeout(r,60));const n=[...t.querySelectorAll('img')].filter(im=>im.complete&&im.naturalWidth>0).length;minVis=Math.min(minVis,n)}return minVis===0?'BLANK at some moment':'never blank (min '+minVis+' tiles showing)'});
 console.log(f.padEnd(17),JSON.stringify(R));process.exit(0)})();
