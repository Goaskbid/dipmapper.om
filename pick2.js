const chromium=require('./lib/chromium.js'),puppeteer=require('puppeteer-core'),fs=require('fs');const [,,base,w,h]=process.argv;const FAIL=process.env.OVERPASS==='fail';const PHOTO=fs.readFileSync(require('path').join(__dirname,'photo.jpg'));
// real Rügen bathing places (approx coords)
const RUG=[['Strand Binz',54.401,13.611,{natural:'beach'}],['Strand Sellin',54.381,13.700,{natural:'beach'}],['Strand Göhren',54.344,13.741,{natural:'beach'}],['Strand Prora',54.443,13.573,{natural:'beach'}],['Strand Baabe',54.362,13.716,{natural:'beach'}],['Strandbad Sassnitz',54.517,13.646,{leisure:'swimming_area'}],['Badestelle Lietzow',54.478,13.505,{leisure:'bathing_place'}],['Strand Juliusruh',54.586,13.374,{natural:'beach'}],['Schwimmhalle Bergen',54.418,13.433,{leisure:'swimming_pool',access:'yes'}],['Strand Thiessow',54.281,13.709,{natural:'beach'}]];
const ZRH=[['Seebad Enge',47.362,8.536,{leisure:'swimming_area'}],['Strandbad Mythenquai',47.352,8.536,{natural:'beach'}]];
const ALL=RUG.concat(ZRH).map((x,i)=>({type:'node',id:9000+i,lat:x[1],lon:x[2],tags:Object.assign({name:x[0]},x[3])}));
function km(a,b,c,d){const R=6371,t=Math.PI/180;const x=(d-b)*t*Math.cos((a+c)/2*t),y=(c-a)*t;return Math.hypot(x,y)*R}
(async()=>{const b=await puppeteer.launch({args:chromium.args,executablePath:await chromium.executablePath(),headless:true});
 const p=await b.newPage();await p.setViewport({width:+w,height:+h,isMobile:+w<800,hasTouch:+w<800});
 const log=[];await p.setRequestInterception(true);p.on('request',r=>{const u=r.url();const J=o=>r.respond({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(o)}).catch(()=>{});
  if(/interpreter|overpass/.test(u)){if(FAIL){log.push('overpass 504');return setTimeout(()=>r.respond({status:504,body:'busy',headers:{'access-control-allow-origin':'*'}}).catch(()=>{}),400)}const q=decodeURIComponent((r.postData()||u).replace(/\+/g,' ')).replace(/^data=/,'');const ms=[...q.matchAll(/around:(\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g)];const bb=q.match(/\((-?\d+\.?\d*),(-?\d+\.?\d*),(-?\d+\.?\d*),(-?\d+\.?\d*)\)/);
   let els=[];if(ms.length){const [_,R,la,lo]=ms[0];els=ALL.filter(e=>km(+la,+lo,e.lat,e.lon)*1000<=+R);log.push('overpass around '+(+R/1000)+'km @'+(+la).toFixed(3)+','+(+lo).toFixed(3)+' -> '+els.length)}else if(bb){els=ALL.filter(e=>e.lat>=+bb[1]&&e.lat<=+bb[3]&&e.lon>=+bb[2]&&e.lon<=+bb[4]);log.push('overpass bbox -> '+els.length)}else log.push('overpass ?? '+q.slice(0,120));
   return setTimeout(()=>J({elements:els}),300)}
  if(u.includes('nominatim')){if(/reverse/.test(u)){log.push('nominatim reverse');return J({address:{town:'Binz',county:'Vorpommern-Rügen',country:'Germany',country_code:'de'}})}
   const q=decodeURIComponent((u.match(/[?&]q=([^&]*)/)||[])[1]||'').replace(/\+/g,' ').trim();const vb=(u.match(/viewbox=([^&]*)/)||[])[1];log.push('nominatim "'+q.slice(0,40)+'"');
   if(!vb)return J([]);const [x1,y1,x2,y2]=decodeURIComponent(vb).split(',').map(Number);const lo1=Math.min(x1,x2),lo2=Math.max(x1,x2),la1=Math.min(y1,y2),la2=Math.max(y1,y2);
   const words=q.toLowerCase().split(/\s+/);const kind=/beach|strand|badestrand|plage|playa/.test(q.toLowerCase())?'beach':/pool|bad|hall|schwimm/.test(q.toLowerCase())?'pool':'';
   const known=['beach','swimming','pool','public','bath','lido','thermal','water','park','lake','river','bathing','place','outdoor','indoor','strandbad','badestrand','badestelle','freibad','hallenbad','schwimmbad','schwimmhalle','therme','seebad','flussbad','piscina','piscine','plage','playa','praia','spiaggia','cala','paralia'];
   if(words.some(w=>!known.includes(w)))return J([]);
   const hits=RUG.filter(x=>x[2]>=lo1&&x[2]<=lo2&&x[1]>=la1&&x[1]<=la2&&(kind==='beach'?x[3].natural==='beach':kind==='pool'?!!x[3].leisure:true)).slice(0,8).map((x,i)=>({lat:String(x[1]),lon:String(x[2]),name:x[0],display_name:x[0]+', Rügen, Germany',class:x[3].natural?'natural':'leisure',type:x[3].natural||x[3].leisure,osm_type:'node',osm_id:70000+RUG.indexOf(x)}));
   return J(hits)}
  if(u.includes('photon')){log.push('photon');return J({features:[]})}
  if(u.includes('open-meteo'))return J({});
  if(u.startsWith('http://127.0.0.1')||u.startsWith('data:'))return r.continue();if(r.resourceType()==='image')return r.respond({status:200,contentType:'image/jpeg',body:PHOTO}).catch(()=>{});r.abort()});
 const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,140)));
 await p.goto(base+'?lat=47.3582&lon=8.5361&name=Z%C3%BCrich',{waitUntil:'domcontentloaded'});await p.waitForSelector('#results .result',{timeout:20000});await new Promise(r=>setTimeout(r,4000));
 const before=await p.evaluate(()=>{const q=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return [Math.round(r.top+scrollY),Math.round(r.height)]};return {status:q('#status')||q('.status'),statusBar:q('#statusBar'),search:q('#dest'),radius:q('#dmRadius'),map:q('#map'),mapPanel:q('#mapPanel'),resultTitle:(document.getElementById('resultTitle')||{}).textContent,statusText:(document.getElementById('statusText')||{}).textContent}});
 log.length=0;
 await p.evaluate(()=>document.getElementById('movePoint').click());await new Promise(r=>setTimeout(r,900));
 await p.evaluate(()=>{state.mapCenter=[54.40,13.62];state.zoom=11;drawMap()});await new Promise(r=>setTimeout(r,900));
 const box=await p.evaluate(()=>{const r=document.getElementById('map').getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}});
 if(+w<800)await p.touchscreen.tap(box.x,box.y);else await p.mouse.click(box.x,box.y);
 await new Promise(r=>setTimeout(r,12000));
 const after=await p.evaluate(()=>{const q=s=>{const e=document.querySelector(s);if(!e)return null;const r=e.getBoundingClientRect();return [Math.round(r.top+scrollY),Math.round(r.height)]};return {center:state.center&&state.center.map(x=>+x.toFixed(3)),label:state.label,results:(state.results||[]).length,names:(state.results||[]).slice(0,6).map(v=>v.name),cards:document.querySelectorAll('#results .result').length,status:q('#status')||q('.status'),statusBar:q('#statusBar'),search:q('#dest'),radius:q('#dmRadius'),map:q('#map'),mapPanel:q('#mapPanel'),resultTitle:(document.getElementById('resultTitle')||{}).textContent,statusText:(document.getElementById('statusText')||{}).textContent,radiusVal:document.getElementById('radius').value}});
 await p.screenshot({path:'/tmp/claude-0/pick_'+w+'.png'});
 console.log(w,'BEFORE',JSON.stringify(before),'\nAFTER',JSON.stringify(after),'\nREQ',JSON.stringify(log.slice(0,10).concat(['... total '+log.length])),'\nerrors',errs);process.exit(0)})();
