const chromium=require('./lib/chromium.js'),puppeteer=require('puppeteer-core');const mode=process.argv[2];
const now=new Date();const days=[...Array(8)].map((_,i)=>{const d=new Date(now);d.setDate(d.getDate()+i);return d.toISOString().slice(0,10)});
const FCJ={daily:{time:days,weather_code:[0,2,61,3,95,1,0,0],temperature_2m_max:[27.4,25.1,19.8,22,23,26,28,29],temperature_2m_min:[16.2,15,13.4,14,15,16,17,18],precipitation_probability_max:[5,20,80,30,60,10,0,0],wind_speed_10m_max:[9.6,12,18,8,22,7,6,5]}};
(async()=>{const b=await puppeteer.launch({args:[...chromium.args,'--no-sandbox'],executablePath:await chromium.executablePath(),headless:true});
 const p=await b.newPage();await p.setViewport({width:1440,height:900});await p.setRequestInterception(true);let calls=[];
 p.on('request',r=>{const u=r.url();if(u.includes('api.open-meteo.com/v1/forecast')&&u.includes('daily=')){calls.push(u.split('?')[1].slice(0,60));return mode==='fail'?r.abort():r.respond({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(FCJ)})}
  if(u.startsWith('http://127.0.0.1')||u.startsWith('data:'))return r.continue();r.abort()});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://127.0.0.1:8765/final.html?lat=47.3582&lon=8.5361&name=Z%C3%BCrich',{waitUntil:'domcontentloaded'});await p.waitForSelector('#results .result');await new Promise(r=>setTimeout(r,2000));
 await p.evaluate(()=>document.querySelector('#results [data-open]').click());await new Promise(r=>setTimeout(r,1500));
 const o=await p.evaluate(()=>({cards:[...document.querySelectorAll('#cardBody .weather .day')].map(d=>d.innerText.replace(/\s+/g,' ').trim()),real:document.querySelectorAll('#cardBody .weather .day.dmFcReal').length,note:(document.querySelector('.dmFcNote')||{}).textContent,waterLineKept:[...document.querySelectorAll('#cardBody .weather .day')].every(d=>/°C/.test(d.lastElementChild.textContent))}));
 console.log(mode,JSON.stringify(o),'| calls',calls.length,'| pageerrors',errs.length);process.exit(0)})();
