const chromium=require('./lib/chromium.js'),puppeteer=require('puppeteer-core'),fs=require('fs');const [,,base,w,h,cpu]=process.argv;
const PHOTO=fs.readFileSync(require('path').join(__dirname,'photo.jpg'));
const cats=[{natural:'beach'},{leisure:'swimming_area'},{leisure:'swimming_pool',access:'yes'},{leisure:'bathing_place'},{amenity:'public_bath'}];
const ELS=[...Array(140)].map((_,i)=>({type:'node',id:1000+i,lat:47.36+Math.sin(i)*0.08,lon:8.54+Math.cos(i*1.3)*0.1,tags:Object.assign({name:'Spot '+i,opening_hours:'Mo-Su 09:00-19:00',toilets:'yes'},cats[i%5])}));
const now=new Date();const hrs=[...Array(168)].map((_,i)=>{const d=new Date(now);d.setMinutes(0,0,0);d.setHours(d.getHours()+i);return d.toISOString().slice(0,16)});
const WX={current:{temperature_2m:21,rain:0,precipitation:0,weather_code:3,wind_speed_10m:12},hourly:{time:hrs,precipitation:hrs.map(()=>0),weather_code:hrs.map(()=>3),wind_speed_10m:hrs.map(()=>10),temperature_2m:hrs.map(()=>20),water_temperature:hrs.map(()=>19)},daily:{time:[...Array(7)].map((_,i)=>hrs[i*24].slice(0,10)),precipitation_probability_max:[10,10,10,10,10,10,10],temperature_2m_max:[23,23,23,23,23,23,23],temperature_2m_min:[14,14,14,14,14,14,14],sunrise:[...Array(7)].map((_,i)=>hrs[i*24].slice(0,10)+'T07:20'),sunset:[...Array(7)].map((_,i)=>hrs[i*24].slice(0,10)+'T18:50'),weather_code:[3,3,3,3,3,3,3],wind_speed_10m_max:[20,20,20,20,20,20,20]}};
(async()=>{const b=await puppeteer.launch({args:chromium.args,executablePath:await chromium.executablePath(),headless:true});
 const p=await b.newPage();await p.setViewport({width:+w,height:+h,deviceScaleFactor:2,isMobile:+w<800,hasTouch:+w<800});
 const cdp=await p.target().createCDPSession();if(+cpu>1)await cdp.send('Emulation.setCPUThrottlingRate',{rate:+cpu});
 await p.setRequestInterception(true);p.on('request',r=>{const u=r.url();const J=(o,d)=>setTimeout(()=>r.respond({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(o)}).catch(()=>{}),d||200);
  if(/interpreter|overpass/.test(u))return J({elements:ELS},900);if(u.includes('open-meteo'))return J(WX,250);if(u.includes('nominatim'))return J([],200);
  if(u.startsWith('http://127.0.0.1')||u.startsWith('data:'))return r.continue();if(r.resourceType()==='image')return setTimeout(()=>r.respond({status:200,contentType:'image/jpeg',body:PHOTO}).catch(()=>{}),150);r.abort()});
 await p.evaluateOnNewDocument(()=>{window.__lt=[];new PerformanceObserver(l=>l.getEntries().forEach(e=>__lt.push([Math.round(e.startTime),Math.round(e.duration)]))).observe({type:'longtask',buffered:true})});
 const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,100)));
 const t0=Date.now();await p.goto(base+'?lat=47.3582&lon=8.5361&name=Z%C3%BCrich',{waitUntil:'domcontentloaded'});
 await p.waitForSelector('#results .result',{timeout:30000});const tFirst=Date.now()-t0;await new Promise(r=>setTimeout(r,12000));
 const lt1=await p.evaluate(()=>{const a=__lt.slice();__lt.length=0;return a});
 // interaction latencies
 const I=await p.evaluate(async()=>{const S=ms=>new Promise(r=>setTimeout(r,ms));const fr=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const o={};
  const m=async(fn)=>{const t=performance.now();fn();await fr();return Math.round(performance.now()-t)};
  const fb=document.querySelector('[data-filter="beach"]');if(fb){o.filterBeach=await m(()=>fb.click());await S(500);o.filterAll=await m(()=>document.querySelector('[data-filter="all"]').click());await S(500)}
  const c=document.querySelector('#results .result');if(c){o.openCard=await m(()=>c.click());await S(1500)}
  // scroll fps
  let n=0,run=true;const cnt=()=>{n++;if(run)requestAnimationFrame(cnt)};requestAnimationFrame(cnt);const t=performance.now();
  for(let i=0;i<30;i++){scrollBy(0,60);await S(33)}for(let i=0;i<30;i++){scrollBy(0,-60);await S(33)}run=false;o.scrollFps=Math.round(n/((performance.now()-t)/1000));
  o.results=document.querySelectorAll('#results .result').length;o.nodes=document.getElementsByTagName('*').length;return o});
 const lt2=await p.evaluate(()=>__lt.slice());
 const sum=a=>a.reduce((s,x)=>s+x[1],0);
 console.log(JSON.stringify({w,cpu,firstResultMs:tFirst,longTasksLoad:{n:lt1.length,total:sum(lt1),max:Math.max(0,...lt1.map(x=>x[1]))},longTasksInteract:{n:lt2.length,total:sum(lt2),max:Math.max(0,...lt2.map(x=>x[1]))},I,errs}));process.exit(0)})();
