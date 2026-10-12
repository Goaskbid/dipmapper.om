const chromium=require('./lib/chromium.js'),puppeteer=require('puppeteer-core'),fs=require('fs');const [,,w,h]=process.argv;const FAIL=process.env.OVERPASS==='fail';const WINTER=process.env.WINTER==='1';const actmock=require('./lib/actmock.js');const PHOTO=fs.readFileSync(require('path').join(__dirname,'photo.jpg'));
const N=(id,lat,lon,tags,type)=>({type:type||'node',id,lat,lon,center:type==='way'?{lat,lon}:undefined,timestamp:'2025-05-14T10:00:00Z',tags});
const ELS=[
 N(1,47.3555,8.5365,{amenity:'boat_rental',name:'Bootsvermietung Mythenquai',rental:'pedalo;rowing_boat;motorboat',opening_hours:'Apr-Sep Mo-Su 10:00-20:00',website:'https://example.org/boats'}),
 N(1001,47.3556,8.5366,{amenity:'boat_rental',name:'Bootsvermietung Mythenquai'},'way'),
 N(2,47.3530,8.5372,{shop:'water_sports',name:'SUP Zürich',rental:'sup;kayak',website:'https://example.org/sup',phone:'+41 44 000 00 00',charge:'CHF 25 per hour'}),
 N(3,47.3581,8.5402,{canoe:'put_in'}),
 N(4,47.3602,8.5450,{leisure:'sports_centre',sport:'rowing',name:'Seeclub Zürich'},'way'),
 N(5,47.3448,8.5380,{club:'sport',sport:'canoe',name:'Kanu-Club Zürich'}),
 N(6,47.3640,8.5480,{name:'Tretbootvermietung Utoquai'}),
 N(7,47.3570,8.5350,{amenity:'bar',name:'SUP Bar'}),
 N(8,47.3500,8.5300,{leisure:'sports_centre',sport:'padel',name:'Padel Club Wollishofen'}),
 N(9,47.3620,8.5320,{shop:'bicycle',name:'Pedal Power'}),
 N(10,47.3700,8.5300,{shop:'scuba_diving',name:'Tauchsport Käser',website:'https://example.org/dive'}),
 N(11,47.3520,8.5250,{club:'sport',sport:'scuba_diving',name:'Tauchclub Zürich'}),
 N(12,47.3710,8.5370,{leisure:'swimming_pool',sport:'diving;swimming',name:'Hallenbad City'}),
 N(13,47.3605,8.5355,{leisure:'marina',name:'Hafen Enge'},'way'),
 N(14,47.3540,8.5370,{club:'sailing',name:'Zürcher Yacht Club'}),
 N(15,47.3480,8.5390,{sport:'sailing',name:'Segelschule Zürichsee',website:'https://example.org/sail'}),
 N(16,47.3590,8.5370,{leisure:'slipway'}),
 N(17,47.3550,8.5200,{name:'Segelfluggruppe Zürich',club:'sport',sport:'free_flying'}),
 N(18,47.3667,8.5410,{amenity:'ferry_terminal',name:'Zürich Bürkliplatz (See)'}),
 N(19,47.3660,8.5420,{office:'company',name:'Zürichsee-Schifffahrtsgesellschaft',website:'https://example.org/zsg'}),
 N(20,47.3400,8.5500,{sport:'water_ski',name:'Wakeboard Lift Zürich'})];
function km(a,b,c,d){const R=6371,t=Math.PI/180;const x=(d-b)*t*Math.cos((a+c)/2*t),y=(c-a)*t;return Math.hypot(x,y)*R}
(async()=>{const b=await puppeteer.launch({args:chromium.args,executablePath:await chromium.executablePath(),headless:true});
 const p=await b.newPage();await p.emulateTimezone('Europe/Zurich');await p.setViewport({width:+w,height:+h,isMobile:+w<800,hasTouch:+w<800,deviceScaleFactor:1});const log=[];
 await p.setRequestInterception(true);p.on('request',r=>{const u=r.url();const J=(o,d)=>setTimeout(()=>r.respond({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(o)}).catch(()=>{}),d||150);
  if(!(FAIL&&/interpreter|overpass/.test(u))&&actmock(u,J,{winter:WINTER}))return;
  if(/interpreter|overpass/.test(u)){const q=decodeURIComponent((u.split('data=')[1]||'').replace(/\+/g,' '));const isAct=/boat_rental|scuba|sailing|ferry_terminal|rafting/.test(q);if(!isAct)return J({elements:[]});if(FAIL){log.push('act-query failed');return setTimeout(()=>r.respond({status:504,body:'busy',headers:{'access-control-allow-origin':'*'}}).catch(()=>{}),200)}
   const m=q.match(/around:(\d+),(-?[\d.]+),(-?[\d.]+)/);log.push('act-query '+q.length+' chars r='+(m&&m[1]));const els=ELS.filter(e=>!m||km(+m[2],+m[3],e.lat,e.lon)*1000<=+m[1]);return J({elements:els},300)}
  if(u.includes('marine-api'))return J({current:{wave_height:null}});
  if(u.includes('api.open-meteo.com')&&u.includes('wind_gusts')){const hrs=[...Array(9)].map((_,i)=>'2026-10-10T'+String(10+i).padStart(2,'0')+':00');return J({current:{temperature_2m:17,weather_code:2,wind_speed_10m:14,wind_gusts_10m:26,wind_direction_10m:225},hourly:{time:hrs,wind_speed_10m:[14,15,17,19,18,16,12,10,8],wind_gusts_10m:[26,27,30,33,31,28,22,18,15]}})}
  if(u.startsWith('http://127.0.0.1')||u.startsWith('data:'))return r.continue();if(r.resourceType()==='image')return r.respond({status:200,contentType:'image/jpeg',body:PHOTO}).catch(()=>{});r.abort()});
 const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,160)));
 await p.evaluateOnNewDocument(()=>{try{localStorage.removeItem('dm_act')}catch(e){}});
 // fixed daytime clock (13:00 Zurich today) for page and mocks, so the run gives the same result at any hour
 if(!process.env.DM_SHIFT_MS){const z=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Zurich',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date()).split(':').map(Number);process.env.DM_SHIFT_MS=String(((13-z[0])*3600-z[1]*60-z[2])*1000)}
 await p.evaluateOnNewDocument(sh=>{const R=Date,off=+sh;function D(...a){return a.length?new R(...a):new R(R.now()+off)}D.prototype=R.prototype;D.now=()=>R.now()+off;D.UTC=R.UTC;D.parse=R.parse;window.Date=D},process.env.DM_SHIFT_MS);
 await p.goto('http://127.0.0.1:8765/final.html?lat=47.3582&lon=8.5361&name=Z%C3%BCrich',{waitUntil:'domcontentloaded'});await p.waitForSelector('#results .result');await p.waitForFunction(()=>window.__dmBootDone,{timeout:15000});await new Promise(r=>setTimeout(r,2500));
 const S=ms=>new Promise(r=>setTimeout(r,ms));const out={};
 const snap=()=>p.evaluate(()=>{const vis=e=>!!e&&e.getClientRects().length>0&&getComputedStyle(e).visibility!=='hidden';return {mode:document.documentElement.getAttribute('data-act'),barOn:(document.querySelector('#dmActBar button.on')||{}).textContent,swimCards:document.querySelectorAll('#results .result').length,swimListVisible:vis(document.getElementById('results')),swimPinsVisible:[...document.querySelectorAll('#map .dmOverlay .marker')].filter(vis).length,actPins:document.querySelectorAll('#map .dmActPin').length,panel:vis(document.getElementById('dmActPanel')),cards:[...document.querySelectorAll('#dmActList .dmAcard:not(.dmSk)')].map(c=>c.querySelector('.dmAname').textContent+' ['+c.querySelector('.dmAmeta span').textContent.replace(/^\d+ · /,'')+']'),chips:[...document.querySelectorAll('#dmActChips .dmChip')].map(c=>c.textContent.replace(/\s+/g,' ').trim()),title:(document.getElementById('dmActTitle')||{}).textContent,sub:(document.getElementById('dmActSub')||{}).textContent,wind:(document.getElementById('dmActWind')||{}).textContent,empty:(document.querySelector('.dmActEmpty')||{}).textContent,verified:document.querySelectorAll('#dmActList .dmVer').length,priceChips:[...document.querySelectorAll('#dmActList .dmAstat .pr')].map(c=>c.textContent),openStates:[...document.querySelectorAll('#dmActList .dmAstat .st')].map(c=>c.textContent).slice(0,6),scores:[...document.querySelectorAll('#dmActList .dmAscore')].map(c=>c.textContent).slice(0,6),butler:(document.querySelector('#dmActList .dmButler')||{}).innerText,zones:document.querySelectorAll('#map .dmZoneSvg polygon,#map .dmZoneSvg circle').length,tempBubbles:[...document.querySelectorAll('#map .dmTb')].map(x=>x.textContent),quick:document.querySelectorAll('#dmActList .dmAq').length,rules:[...document.querySelectorAll('#dmActList .dmActRule')].map(r=>r.textContent.slice(0,60)),note:(document.querySelector('#dmActList .dmActNote')||{}).textContent,more:(document.querySelector('#dmActList .dmActMore a')||{}).href,mapSub:document.getElementById('mapSub').textContent}});
 out.swimStart=await snap();
 const pick=async k=>{await p.evaluate(k=>document.querySelector('#dmActBar button[data-a="'+k+'"]').click(),k);await S(1600);return snap()};
 out.paddle=await pick('paddle');
 if(FAIL){await S(2500);out.busyZurich=await snap();await p.evaluate(()=>{state.center=[54.40,13.40];state.mapCenter=state.center.slice();state.label='Rügen';try{rerunCurrentSearch('Searching this area')}catch(e){}});await p.waitForFunction(()=>window.dmAct&&/54\.4000,13\.4000/.test(dmAct.key),{timeout:8000}).catch(()=>{});await S(3500);out.busyText=await p.evaluate(()=>(document.querySelector('.dmActEmpty')||{}).textContent||'');out.swimBack=await pick('swim');console.log(w+'x'+h,JSON.stringify(out,null,1),'\npageerrors',errs.length,JSON.stringify(errs));process.exit(0)}
 await p.evaluate(()=>document.querySelector('#dmActChips .dmChip[data-c="sup"]').click());await S(400);out.paddleSUP=await snap();
 await p.evaluate(()=>document.querySelector('#dmActChips .dmChip[data-c="all"]').click());await S(300);
 await p.evaluate(()=>document.querySelector('#dmActList .dmAopen').click());await S(1200);
 out.sheet=await p.evaluate(()=>{const s=document.getElementById('dmActSheet');const b=document.getElementById('dmActBody');return {open:s.classList.contains('open'),meta:document.getElementById('dmActMeta').textContent,name:document.getElementById('dmActName').textContent,h3:[...b.querySelectorAll('h3')].map(x=>x.textContent),tags:[...b.querySelectorAll('.dmActTag')].map(x=>x.textContent),facts:[...b.querySelectorAll('.fact')].map(x=>x.innerText.replace(/\n/g,': ')),btns:[...b.querySelectorAll('.dmAbtn')].map(x=>x.textContent),wx:(b.querySelector('#dmActWx')||{}).innerText,src:(b.querySelector('a[href*="openstreetmap.org/node"],a[href*="openstreetmap.org/way"]')||{}).href,near:[...b.querySelectorAll('.dmNear b')].map(x=>x.textContent)}});
 await p.screenshot({path:'/tmp/claude-0/act_sheet_'+w+'.png'});
 /* tap/click outside the open card closes it */
 const outPt=await p.evaluate(()=>{const s=document.getElementById('dmActSheet').getBoundingClientRect();return s.left>40?{x:Math.round(s.left/2),y:Math.round(innerHeight/2)}:{x:Math.round(innerWidth/2),y:Math.max(6,Math.round(s.top/2))}});if(+w<800)await p.touchscreen.tap(outPt.x,outPt.y);else await p.mouse.click(outPt.x,outPt.y);await S(600);out.outsideCloses=await p.evaluate(()=>!document.getElementById('dmActSheet').classList.contains('open'));out.outsidePoint=outPt;
 await p.evaluate(()=>{if(document.getElementById('dmActSheet').classList.contains('open'))document.getElementById('dmActClose').click()});await S(500);
 out.dirSheet=await p.evaluate(async()=>{const c=[...document.querySelectorAll('#dmActList .dmAcard')].find(x=>/Supkultur – SUP station Strandbad Mythenquai/.test(x.textContent));if(!c)return 'no card';c.querySelector('.dmAopen').click();await new Promise(r=>setTimeout(r,900));const b=document.getElementById('dmActBody');const o={name:document.getElementById('dmActName').textContent,prices:[...b.querySelectorAll('.dmAprices tr')].map(r=>r.innerText.replace(/\s+/g,' ')),src:(b.innerText.match(/Verified listing:[^\n]*/)||[''])[0],call:[...b.querySelectorAll('.dmAbtn')].map(x=>x.textContent)};document.getElementById('dmActClose').click();return o});await S(400);
 out.sheetClosed=!(await p.evaluate(()=>document.getElementById('dmActSheet').classList.contains('open')));
 // pin tap opens sheet
 const pin=await p.evaluate(()=>{const m=document.querySelector('#map .dmActPin');if(!m)return null;m.scrollIntoView({block:'center'});const r=m.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}});
 if(pin){await S(300);for(let k=0;k<3;k++){const pin2=await p.evaluate(()=>{const r=document.querySelector('#map .dmActPin').getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2}});if(+w<800)await p.touchscreen.tap(pin2.x,pin2.y);else await p.mouse.click(pin2.x,pin2.y);await S(800);if(await p.evaluate(()=>document.getElementById('dmActSheet').classList.contains('open')))break}out.pinOpensSheet=await p.evaluate(()=>document.getElementById('dmActSheet').classList.contains('open')+' '+document.getElementById('dmActName').textContent);await p.evaluate(()=>document.getElementById('dmActClose').click());await S(400)}
 await p.evaluate(()=>{const m=document.getElementById('mapPanel');scrollTo(0,m.getBoundingClientRect().top+scrollY-document.querySelector('.topbar').offsetHeight)});await S(700);await p.screenshot({path:'/tmp/claude-0/act_map_'+w+'.png'});
 out.fit=await p.evaluate(()=>{const hh=document.querySelector('.topbar').offsetHeight;const m=document.getElementById('map').getBoundingClientRect(),f=document.getElementById('dmActChips').getBoundingClientRect();return {mapH:Math.round(m.height),mapTop:Math.round(m.top),chipsEnd:Math.round(f.bottom),screen:innerHeight,allInView:m.top>=hh-1&&f.bottom<=innerHeight+1}});
 await p.evaluate(()=>scrollTo(0,0));
 out.dive=await pick('dive');out.sail=await pick('sail');out.boat=await pick('boat');out.raft=await pick('raft');
 await pick('paddle');const before=log.length;await p.evaluate(()=>{state.center=[47.2700,8.6450];state.mapCenter=state.center.slice();state.label='Meilen';try{rerunCurrentSearch('Searching this area')}catch(e){}});const t0n=Date.now();await p.waitForFunction(()=>window.dmAct&&/47\.2700,8\.6450/.test(dmAct.key),{timeout:8000}).catch(()=>{});out.newPointMs=Date.now()-t0n;await S(1500);
 out.newPointQueried=log.slice(before).some(x=>/r=15000/.test(x));out.meilenPaddle=await snap();out.meilenBoat=await pick('boat');out.meilenSail=await pick('sail');out.newPointTitle=await p.evaluate(()=>document.getElementById('dmActTitle').textContent);
 out.busyText=await p.evaluate(()=>(document.querySelector('.dmActEmpty')||{}).textContent||'');
 out.swimBack=await pick('swim');
 await pick('paddle');
 await p.evaluate(()=>{state.center=[54.40,13.40];state.mapCenter=state.center.slice();state.label='Rügen';try{rerunCurrentSearch('Searching this area')}catch(e){}});await p.waitForFunction(()=>window.dmAct&&/54\.4000,13\.4000/.test(dmAct.key),{timeout:8000}).catch(()=>{});await S(3000);out.farEmpty=await p.evaluate(()=>(document.querySelector('.dmActEmpty')||{}).textContent||'');out.farMore=await p.evaluate(()=>(document.querySelector('#dmActList .dmActMore a')||{}).href||'');
 console.log(w+'x'+h,JSON.stringify(out,null,1),'\nqueries',JSON.stringify(log),'\npageerrors',errs.length,JSON.stringify(errs));process.exit(0)})();
