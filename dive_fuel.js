// v23.7: divers' "Under water" section (depth, lake depth, visibility, fish) and boat fuel stations (Bootstankstellen) in Boats mode.
const chromium=require('./lib/chromium.js'),puppeteer=require('puppeteer-core'),fs=require('fs'),actmock=require('./lib/actmock.js');const PHOTO=fs.readFileSync(require('path').join(__dirname,'photo.jpg'));const [,,w,h]=process.argv;
const FUEL={type:'node',id:7701,lat:47.3549,lon:8.5402,tags:{waterway:'fuel',name:'Bootstankstelle Enge (test)',opening_hours:'Mo-Su 08:00-20:00','fuel:diesel':'yes','fuel:octane_95':'yes'}};
(async()=>{const b=await puppeteer.launch({args:chromium.args,executablePath:await chromium.executablePath(),headless:true});const p=await b.newPage();await p.setViewport({width:+w,height:+h,isMobile:+w<800,hasTouch:+w<800});
 await p.setRequestInterception(true);p.on('request',r=>{const u=r.url();const J=(o,d)=>setTimeout(()=>r.respond({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(o)}).catch(()=>{}),d||100);
  const q=/interpreter|overpass/.test(u)?decodeURIComponent((u.split('data=')[1]||'').replace(/\+/g,' ')):'';
  if(q&&/fire_station/.test(q)){const H=JSON.parse(JSON.stringify(require('./lib/actmock.js').HELPM||{elements:[]}));return actmock(u,(o,d)=>{o=JSON.parse(JSON.stringify(o));o.elements.push(FUEL);J(o,d)},{})}
  if(q&&/"waterway"="fuel"/.test(q))return J({elements:[FUEL]});
  if(q&&/"natural"="water"/.test(q))return J({elements:[{type:'relation',id:11,tags:{natural:'water',water:'lake',name:'Zürichsee','name:en':'Lake Zurich',wikidata:'Q14407',wikipedia:'de:Zürichsee'}},{type:'way',id:12,tags:{waterway:'river',name:'Limmat',wikidata:'Q14403',wikipedia:'de:Limmat'}}]});
  if(u.includes('wbgetentities')&&u.includes('sitelinks')){const id=(u.match(/ids=(Q\d+)/)||[])[1];return J({entities:{[id]:{sitelinks:{enwiki:{title:id==='Q14407'?'Lake Zurich':'Limmat'}}}}})}
  if(u.includes('prop=pageprops'))return J({query:{pages:{'1':{title:'Lake Zurich',pageprops:{wikibase_item:'Q14407'}}}}});
  if(u.includes('wbgetclaims')&&u.includes('P4511'))return J({claims:{P4511:[{mainsnak:{datavalue:{value:{amount:'+136',unit:'http://www.wikidata.org/entity/Q11573'}}}}]}});
  if(actmock(u,J,{}))return;if(q)return J({elements:[]});if(u.startsWith('http://127.0.0.1')||u.startsWith('data:'))return r.continue();if(r.resourceType()==='image')return r.respond({status:200,contentType:'image/jpeg',body:PHOTO}).catch(()=>{});r.abort()});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));const S=ms=>new Promise(r=>setTimeout(r,ms));
 await p.goto('http://127.0.0.1:8765/final.html?lat=47.3582&lon=8.5361&name=Z%C3%BCrich',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.__dmBootDone,{timeout:15000});await S(3000);
 const R={};
 /* Dive */
 await p.evaluate(()=>document.querySelector('#dmActBar button[data-a="dive"]').click());await S(4000);
 R.diveDepthChips=await p.evaluate(()=>[...document.querySelectorAll('#dmActList .dmAcard')].map(c=>{const d=c.querySelector('.dp');return d?d.innerText.trim():null}).filter(Boolean));
 R.diveOpened=await p.evaluate(()=>{const cs=[...document.querySelectorAll('#dmActList .dmAcard')];const c=cs.find(x=>/Au/.test(x.innerText)&&x.querySelector('.dp'))||cs.find(x=>x.querySelector('.dp'));if(!c)return null;c.querySelector('.dmAopen').click();return c.querySelector('h3,b,strong')?c.querySelector('h3,b,strong').innerText.trim():'?'});
 await S(5000);
 R.underWater=await p.evaluate(()=>{const s=document.querySelector('#dmActSheet .dmDive');if(!s)return null;s.scrollIntoView({block:'start'});return {tiles:[...s.querySelectorAll('.dmDvT')].map(t=>t.innerText.replace(/\s*\n\s*/g,' | ').slice(0,240)),waiting:!!s.querySelector('.dmBwait'),sources:[...s.querySelectorAll('a')].map(a=>a.hostname)}});
 R.notVerifiedWording=await p.evaluate(()=>/not verified/i.test((document.getElementById('dmActSheet')||{}).innerText||''));
 if(process.env.SHOTDIR){await S(500);await p.screenshot({path:process.env.SHOTDIR+'/dive_'+w+'.png'})}
 await p.evaluate(()=>{try{document.querySelector('#dmActSheet .dmClose,#dmActSheet [aria-label="Close"]').click()}catch(e){}});await S(800);
 /* Boats: fuel stations */
 await p.evaluate(()=>document.querySelector('#dmActBar button[data-a="boat"]').click());await S(4500);
 R.fuelChip=await p.evaluate(()=>[...document.querySelectorAll('#dmActPanel button')].map(x=>x.innerText.trim()).filter(t=>/fuel/i.test(t)));
 R.fuelCard=await p.evaluate(()=>{const c=[...document.querySelectorAll('#dmActList .dmAcard')].find(x=>/Bootstankstelle/.test(x.innerText));return c?{text:c.innerText.replace(/\s*\n\s*/g,' | ').slice(0,200),score:!!c.querySelector('.dmScore,.score,.sc')}:null});
 if(process.env.SHOTDIR){await p.evaluate(()=>{const c=[...document.querySelectorAll('#dmActList .dmAcard')].find(x=>/Bootstankstelle/.test(x.innerText));c&&c.scrollIntoView({block:'center'})});await S(600);await p.screenshot({path:process.env.SHOTDIR+'/fuel_'+w+'.png'})}
 R.fuelPins=await p.evaluate(()=>[...document.querySelectorAll('#map [data-type="fuel"],#map .dmPin.fuel,#map [title*="Boat fuel"],#map [aria-label*="Bootstankstelle"]')].length);
 await p.evaluate(()=>{const c=[...document.querySelectorAll('#dmActList .dmAcard')].find(x=>/Bootstankstelle/.test(x.innerText));c&&c.querySelector('.dmAopen').click()});await S(4000);
 R.fuelSheet=await p.evaluate(()=>{const s=document.getElementById('dmActSheet');const f=s&&s.querySelector('.dmFuelNow');return f?f.innerText.slice(0,220):null});
 await p.evaluate(()=>{try{document.querySelector('#dmActSheet .dmClose,#dmActSheet [aria-label="Close"]').click()}catch(e){}});await S(800);
 await p.evaluate(()=>{const c=[...document.querySelectorAll('#dmActList .dmAcard')].find(x=>!/Bootstankstelle/.test(x.innerText));c&&c.querySelector('.dmAopen').click()});await S(5000);
 R.boatCardHelpFuel=await p.evaluate(()=>{const s=document.querySelector('#dmActSheet .dmSOS');return s?[...s.querySelectorAll('.dmHelpR')].map(t=>t.innerText.replace(/\s*\n\s*/g,' ')).filter(t=>/fuel/i.test(t)).slice(0,2):null});
 /* the water each card is on: a lakeside rental is on Lake Zurich, the Frauenbadi on the Limmat (OpenStreetMap water within 250 m + the place's own description) */
 const waterOfCard=async(mode,re)=>{await p.evaluate(()=>{try{document.querySelector('#dmActSheet .dmClose,#dmActSheet [aria-label="Close"]').click()}catch(e){}});await S(600);await p.evaluate(m=>document.querySelector('#dmActBar button[data-a="'+m+'"]').click(),mode);await S(4000);
  const ok=await p.evaluate(src=>{const c=[...document.querySelectorAll('#dmActList .dmAcard')].find(x=>new RegExp(src).test(x.innerText));if(!c)return false;c.querySelector('.dmAopen').click();return true},re);if(!ok)return 'card not found';await S(4500);
  return p.evaluate(()=>{const b=document.querySelector('#dmActSheet .dmBw');return b?b.innerText.trim():null})};
 R.waterEnge=await waterOfCard('paddle','Bootsvermietung Enge');
 R.waterFrauenbadi=await waterOfCard('special','Frauenbad');
 console.log(JSON.stringify(R,null,1),'\npageerrors',errs.length,JSON.stringify(errs));await b.close()})();
