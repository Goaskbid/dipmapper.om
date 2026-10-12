// No-go zones must not clutter the map: real lakes carry dozens of OpenStreetMap "restricted areas" (bathing zones,
// no-anchoring areas, speed limits). Only real prohibitions are drawn, only for the activity they concern, with at most 3 labels.
const chromium=require('./lib/chromium.js'),puppeteer=require('puppeteer-core'),fs=require('fs'),actmock=require('./lib/actmock.js');const PHOTO=fs.readFileSync(require('path').join(__dirname,'photo.jpg'));const [,,w,h]=process.argv;
const box=(id,lat,lon,dl,tags)=>({type:'way',id,tags:Object.assign({'seamark:type':'restricted_area'},tags),geometry:[{lat,lon},{lat:lat+dl,lon},{lat:lat+dl,lon:lon+dl*1.4},{lat,lon:lon+dl*1.4},{lat,lon}]});
const Z=[];let id=7000;
for(let i=0;i<15;i++)Z.push(box(id++,47.30+i*0.006,8.55+(i%3)*0.004,0.0015,{'seamark:restricted_area:category':'swimming','seamark:restricted_area:restriction':'no_motor_craft'}));
for(let i=0;i<10;i++)Z.push(box(id++,47.31+i*0.005,8.58,0.003,{'seamark:restricted_area:restriction':'no_anchoring'}));
for(let i=0;i<3;i++)Z.push(box(id++,47.33+i*0.01,8.60,0.006,{'seamark:restricted_area:restriction':'entry_prohibited'}));
for(let i=0;i<2;i++)Z.push(box(id++,47.34+i*0.01,8.52,0.008,{'seamark:restricted_area:category':'nature_reserve'}));
(async()=>{const b=await puppeteer.launch({args:chromium.args,executablePath:await chromium.executablePath(),headless:true});const p=await b.newPage();await p.setViewport({width:+w,height:+h,isMobile:+w<800,hasTouch:+w<800});
 await p.setRequestInterception(true);p.on('request',r=>{const u=r.url();const J=(o,d)=>setTimeout(()=>r.respond({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(o)}).catch(()=>{}),d||100);
  if(/interpreter|overpass/.test(u)){const q=decodeURIComponent((u.split('data=')[1]||'').replace(/\+/g,' '));if(/restricted_area/.test(q))return J({elements:Z})}
  if(actmock(u,J,{}))return;if(/interpreter|overpass/.test(u))return J({elements:[]});if(u.startsWith('http://127.0.0.1')||u.startsWith('data:'))return r.continue();if(r.resourceType()==='image')return r.respond({status:200,contentType:'image/jpeg',body:PHOTO}).catch(()=>{});r.abort()});
 await p.evaluateOnNewDocument(()=>{try{Object.keys(localStorage).filter(k=>/^dm_zones/.test(k)).forEach(k=>localStorage.removeItem(k))}catch(e){}});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://127.0.0.1:8765/final.html?lat=47.33&lon=8.56&name=Lake%20test',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.__dmBootDone,{timeout:15000});await new Promise(r=>setTimeout(r,7000));
 const S=ms=>new Promise(r=>setTimeout(r,ms));const res={};
 const read=()=>p.evaluate(()=>({polygons:document.querySelectorAll('#map .dmZoneSvg polygon').length,labels:[...document.querySelectorAll('#map .dmZoneLbl')].map(x=>x.textContent.trim()),overlapping:(()=>{const L=[...document.querySelectorAll('#map .dmZoneLbl')].map(x=>x.getBoundingClientRect());let n=0;for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){const a=L[i],c=L[j];if(a.left<c.right&&c.left<a.right&&a.top<c.bottom&&c.top<a.bottom)n++}return n})()}));
 res.swim=await read();
 for(const k of ['paddle','dive','boat']){await p.evaluate(k=>document.querySelector('#dmActBar button[data-a="'+k+'"]').click(),k);await S(3500);res[k]=await read()}
 if(process.env.SHOT){await p.evaluate(()=>{const m=document.getElementById('mapPanel');scrollTo(0,m.getBoundingClientRect().top+scrollY-70)});await S(600);await p.screenshot({path:process.env.SHOT})}
 const bad=Object.entries(res).filter(([k,v])=>v.labels.length>3||v.overlapping>0||v.labels.some(t=>/Restricted area/.test(t)));
 console.log(JSON.stringify(res),'\nverdict',bad.length?'CLUTTER '+bad.map(x=>x[0]).join(','):'clean','\npageerrors',errs.length);await b.close();process.exit(0)})();
