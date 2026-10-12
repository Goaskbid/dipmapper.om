const chromium=require('./lib/chromium.js'),puppeteer=require('puppeteer-core');const [,,f,w,h,typed]=process.argv;const Q=typed||'Geneva';
const now=new Date();const hrs=[...Array(48)].map((_,i)=>{const d=new Date(now);d.setMinutes(0,0,0);d.setHours(d.getHours()+i);return d.toISOString().slice(0,16)});
const set=new Date(now.getTime()+2*3600e3).toISOString().slice(0,16),rise=new Date(now.getTime()-9*3600e3).toISOString().slice(0,16);
const WX={current:{temperature_2m:21,rain:0,precipitation:0,weather_code:3,wind_speed_10m:12},hourly:{time:hrs,precipitation:hrs.map((_,i)=>i===2?9:0),weather_code:hrs.map((_,i)=>i===2?65:3),wind_speed_10m:hrs.map(()=>10),temperature_2m:hrs.map(()=>20)},
 daily:{time:[hrs[0].slice(0,10)],precipitation_probability_max:[80],temperature_2m_max:[23],temperature_2m_min:[14],sunrise:[rise],sunset:[set],weather_code:[65],wind_speed_10m_max:[20]}};
const NOM={ 'Geneva':[{lat:'42.8689',lon:'-76.9777',display_name:'Geneva, Ontario County, New York, Vereinigte Staaten',name:'Geneva',class:'place',type:'city',addresstype:'city',importance:0.55,address:{country:'Vereinigte Staaten',country_code:'us'},namedetails:{name:'Geneva'}},
   {lat:'46.2017559',lon:'6.1466014',display_name:'Genf, Genf, Schweiz',name:'Genf',class:'boundary',type:'administrative',addresstype:'city',importance:0.78,address:{city:'Genf',state:'Genf',country:'Schweiz',country_code:'ch'},namedetails:{name:'Genève','name:de':'Genf','name:en':'Geneva','name:it':'Ginevra','name:fr':'Genève'}},
   {lat:'41.8875',lon:'-88.3054',display_name:'Geneva, Kane County, Illinois, Vereinigte Staaten',name:'Geneva',class:'place',type:'city',addresstype:'city',importance:0.45,address:{country:'Vereinigte Staaten',country_code:'us'},namedetails:{name:'Geneva'}}],
 'Geneva beach swimming':[{lat:'41.857',lon:'-80.954',display_name:'Geneva State Park Beach, Geneva-on-the-Lake, Ohio, Vereinigte Staaten',name:'Geneva State Park Beach',class:'leisure',type:'beach_resort',importance:0.3,address:{country_code:'us'}}]};
const PH={features:[{geometry:{coordinates:[-76.9777,42.8689]},properties:{name:'Geneva',state:'New York',country:'United States',countrycode:'US',osm_key:'place',osm_value:'city',type:'city'}},{geometry:{coordinates:[6.1466,46.2018]},properties:{name:'Genève',state:'Genève',country:'Schweiz',countrycode:'CH',osm_key:'place',osm_value:'city',type:'city'}}]};
(async()=>{const b=await puppeteer.launch({args:chromium.args.concat(['--lang=de-CH']),executablePath:await chromium.executablePath(),headless:true});
 const p=await b.newPage();await p.setExtraHTTPHeaders({'Accept-Language':'de-CH,de;q=0.9'});await p.setViewport({width:+w,height:+h});await p.setRequestInterception(true);const calls=[];
 p.on('request',r=>{const u=r.url();const J=o=>r.respond({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(o)});
  if(u.includes('nominatim.openstreetmap.org/search')){const q=decodeURIComponent((u.match(/[?&]q=([^&]*)/)||[])[1]||'').replace(/\+/g,' ');calls.push('nominatim:'+q);
   const key=Object.keys(NOM).find(k=>k.toLowerCase()===q.toLowerCase())||(/beach/i.test(q)?'Geneva beach swimming':'Geneva');if(/^(genf|genève|geneve|ginevra|gen|gene|genev)$/i.test(q)||/^geneva$/i.test(q))return J(NOM['Geneva']);return J(NOM[key]||[])}
  if(u.includes('photon.komoot.io')){calls.push('photon');return J(PH)}
  if(u.includes('api.open-meteo.com'))return J(WX);if(/interpreter|overpass/.test(u))return J({elements:[]});
  if(u.startsWith('http://127.0.0.1')||u.startsWith('data:'))return r.continue();r.abort()});
 const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,120)));
 await p.goto((process.env.BASE||'http://127.0.0.1:8765/')+f,{waitUntil:'domcontentloaded'});await new Promise(r=>setTimeout(r,3200));
 await p.evaluate(q=>{const g=document.getElementById('gateDest');g.value=q;g.dispatchEvent(new Event('input',{bubbles:true}))},Q);await new Promise(r=>setTimeout(r,1200));
 const sugg=await p.evaluate(()=>[...document.querySelectorAll('.dmSug li,.dmSug button')].map(x=>x.innerText.replace(/\s+/g,' ').trim()).slice(0,6));
 await p.evaluate(()=>document.getElementById('gateSearch').click());await new Promise(r=>setTimeout(r,6000));
 const R=await p.evaluate(()=>{const mp=document.getElementById('map');const vis=e=>e&&getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().width>0&&+getComputedStyle(e).opacity>0.5;
  try{if(state.sun&&typeof renderGoldenHour==='function')renderGoldenHour()}catch(e){}
  const items={weather:mp.querySelector('.dmWeatherWarn'),golden:mp.querySelector('.dmGolden'),attribution:mp.querySelector('.dmAttr')};const k=Object.keys(items).filter(x=>vis(items[x]));const ov=[];
  for(let i=0;i<k.length;i++)for(let j=i+1;j<k.length;j++){const a=items[k[i]].getBoundingClientRect(),c=items[k[j]].getBoundingClientRect();if(!(a.right<=c.left||a.left>=c.right||a.bottom<=c.top||a.top>=c.bottom))ov.push(k[i]+'×'+k[j])}
  const btns=[...document.querySelectorAll('header button, header a, .topbar button, .topbar a')].filter(vis).map(x=>x.textContent.trim()).filter(Boolean);
  return {center:state.center&&state.center.map(x=>+x.toFixed(3)),label:state.label,overlaysShown:k,overlaps:ov.length?ov:'none',dockExists:!!mp.querySelector('.dmMapInfo'),searchPillExists:!!document.getElementById('dmHere')&&mp.contains(document.getElementById('dmHere')),headerControls:btns}});
 await p.evaluate(()=>document.getElementById('mapPanel').scrollIntoView({block:'start'}));await new Promise(r=>setTimeout(r,400));await p.screenshot({path:'gen_'+f.replace('.html','')+'_'+w+'.png'});
 console.log(f,w+'px | typed "'+Q+'" | suggestions:',JSON.stringify(sugg),'\n ',JSON.stringify(R),'\n  geocoder calls:',JSON.stringify(calls.slice(0,6)),'| pageerrors',errs.length,JSON.stringify(errs));process.exit(0)})();
