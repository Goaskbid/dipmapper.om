const chromium=require('./lib/chromium.js'),puppeteer=require('puppeteer-core');
const PH=q=>({features:/^rorsch/i.test(q)?[{geometry:{coordinates:[9.4906,47.4778]},properties:{name:'Rorschach',state:'St. Gallen',country:'Switzerland',countrycode:'CH',osm_key:'place',osm_value:'town'}},{geometry:{coordinates:[9.49,47.47]},properties:{name:'Rorschach Hafen',country:'Switzerland',countrycode:'CH',osm_key:'railway',osm_value:'station'}}]:[]});
(async()=>{const b=await puppeteer.launch({args:chromium.args.concat(['--lang=de-CH']),executablePath:await chromium.executablePath(),headless:true});
 const p=await b.newPage();await p.setViewport({width:390,height:844,hasTouch:true});await p.setRequestInterception(true);
 p.on('request',r=>{const u=r.url();const J=o=>r.respond({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(o)});
  if(u.includes('photon.komoot.io')){const q=decodeURIComponent((u.match(/[?&]q=([^&]*)/)||[])[1]||'');return J(PH(q))}
  if(u.includes('nominatim'))return J([]);if(/interpreter|overpass|open-meteo/.test(u))return J({elements:[]});if(u.startsWith('http://127.0.0.1')||u.startsWith('data:'))return r.continue();r.abort()});
 const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,120)));
 await p.goto((process.env.BASE||'http://127.0.0.1:8765/')+'final.html?lat=47.3582&lon=8.5361&name=Z%C3%BCrich',{waitUntil:'domcontentloaded'});await p.waitForSelector('#results .result');await new Promise(r=>setTimeout(r,2500));
 const S=ms=>new Promise(r=>setTimeout(r,ms));const R={};const list=()=>p.evaluate(()=>{const b=document.querySelector('.dmSug');return b&&!b.hidden?[...b.querySelectorAll('button')].map(x=>x.innerText.replace(/\s+/g,' ').trim()):[]});
 await p.evaluate(()=>document.getElementById('dest').scrollIntoView({block:'center'}));await S(200);const dp=await p.evaluate(()=>{const r=document.getElementById('dest').getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]});await p.touchscreen.tap(dp[0],dp[1]);await S(200);await p.keyboard.type('Gen',{delay:60});R.valueAfterTyping=await p.evaluate(()=>document.getElementById('dest').value);await S(700);R.typingGen=await list();
 await p.evaluate(()=>{document.getElementById('dest').value=''});await p.keyboard.type('Kreta',{delay:40});await S(700);R.typingKreta=await list();
 await p.keyboard.press('ArrowDown');await p.keyboard.press('Enter');await S(2500);R.keyboardPickKreta=await p.evaluate(()=>({center:state.center.map(x=>+x.toFixed(2)),label:state.label,inputNow:document.getElementById('dest').value}));
 await p.evaluate(()=>{const d=document.getElementById('dest');d.value='';d.focus();d.dispatchEvent(new Event('input',{bubbles:true}))});await S(400);R.recentOnEmptyFocus=await list();
 await p.evaluate(()=>{document.getElementById('dest').value=''});await p.keyboard.type('Rorsch',{delay:50});await S(900);R.notInBuiltInList=await list();
 const btn=await p.evaluate(()=>{const b=document.querySelector('.dmSug button');const r=b.getBoundingClientRect();return [r.left+20,r.top+r.height/2]});await p.touchscreen.tap(btn[0],btn[1]);await S(2500);
 R.tapPickRorschach=await p.evaluate(()=>({center:state.center.map(x=>+x.toFixed(2)),label:state.label}));
 R.rankingWithoutBuiltInList=await p.evaluate(()=>{const mk=(o)=>o;const L=[{lat:'42.8689',lon:'-76.9777',display_name:'Geneva, Ontario County, New York, United States',name:'Geneva',class:'place',type:'city',importance:0.55,address:{country_code:'us'},namedetails:{name:'Geneva'}},
   {lat:'46.2017',lon:'6.1466',display_name:'Genf, Genf, Schweiz',name:'Genf',class:'boundary',type:'administrative',importance:0.78,address:{country_code:'ch'},namedetails:{name:'Genève','name:de':'Genf','name:en':'Geneva'}},
   {lat:'41.857',lon:'-80.954',display_name:'Geneva State Park Beach, Ohio',name:'Geneva State Park Beach',class:'leisure',type:'beach_resort',importance:0.3,_aux:1,address:{country_code:'us'}}];
   const g=geocodePick(L,'Geneva');return g.display_name});
 R.sugBoxFitsScreen=await p.evaluate(()=>{const d=document.getElementById('dest');d.value='Zu';d.focus();d.dispatchEvent(new Event('input',{bubbles:true}));return new Promise(r=>setTimeout(()=>{const b=document.querySelector('.dmSug').getBoundingClientRect();r(b.left>=0&&b.right<=innerWidth)},500))});
 console.log(JSON.stringify(R,null,1),'\npageerrors',errs.length,JSON.stringify(errs));process.exit(0)})();
