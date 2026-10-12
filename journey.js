// First-time-user journey audit: start screen -> search a town -> swim list & card -> every activity mode
// (filters, sorting, card, every card section, closing) -> map pins -> back to swim.
// Automatic checks on every screen: broken text, sideways overflow, tiny tap targets, page errors. Screenshots in SHOTDIR.
const chromium=require('./lib/chromium.js'),puppeteer=require('puppeteer-core'),fs=require('fs'),path=require('path'),actmock=require('./lib/actmock.js'),world=require('./lib/photoworld.js')();
const PHOTO=fs.readFileSync(path.join(__dirname,'photo.jpg'));const [,,w,h]=process.argv;const SH=process.env.SHOTDIR||'';const phone=+w<800;
const N=(id,lat,lon,tags,type)=>({type:type||'node',id,lat,lon,center:type==='way'?{lat,lon}:undefined,timestamp:'2025-05-14T10:00:00Z',tags});
const ELS=[N(1,47.3555,8.5365,{amenity:'boat_rental',name:'Bootsvermietung Mythenquai',rental:'pedalo;rowing_boat',opening_hours:'Mo-Su 10:00-20:00'}),N(2,47.3530,8.5372,{shop:'water_sports',name:'SUP Zürich',rental:'sup;kayak',charge:'CHF 25 per hour'}),N(3,47.3581,8.5402,{canoe:'put_in'}),N(10,47.3700,8.5300,{shop:'scuba_diving',name:'Tauchsport Käser'}),N(11,47.3520,8.5250,{club:'sport',sport:'scuba_diving',name:'Tauchclub Zürich'}),N(14,47.3540,8.5370,{club:'sailing',name:'Zürcher Yacht Club'}),N(18,47.3667,8.5410,{amenity:'ferry_terminal',name:'Zürich Bürkliplatz (See)'})];
(async()=>{const b=await puppeteer.launch({args:chromium.args,executablePath:await chromium.executablePath(),headless:true});const p=await b.newPage();await p.emulateTimezone('Europe/Zurich');await p.setViewport({width:+w,height:+h,isMobile:phone,hasTouch:phone});
 await p.setRequestInterception(true);p.on('request',r=>{const u=r.url();const J=(o,d)=>setTimeout(()=>r.respond({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(o)}).catch(()=>{}),d||100);
  if(world(u,J,o=>r.respond(o)))return;if(actmock(u,J,{}))return;if(/interpreter|overpass/.test(u))return J({elements:ELS});if(u.startsWith('http://127.0.0.1')||u.startsWith('data:'))return r.continue();if(r.resourceType()==='image')return r.respond({status:200,contentType:'image/jpeg',body:PHOTO}).catch(()=>{});r.abort()});
 // fixed daytime clock, like the activity test
 const z=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Zurich',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date()).split(':').map(Number);const shift=((13-z[0])*3600-z[1]*60-z[2])*1000;process.env.DM_SHIFT_MS=String(shift);
 await p.evaluateOnNewDocument(sh=>{const R=Date,off=+sh;function D(...a){return a.length?new R(...a):new R(R.now()+off)}D.prototype=R.prototype;D.now=()=>R.now()+off;D.UTC=R.UTC;D.parse=R.parse;window.Date=D;try{if(!sessionStorage.getItem('dmJ')){localStorage.clear();sessionStorage.setItem('dmJ','1')}}catch(e){}},String(shift));
 const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,160)));
 const S=ms=>new Promise(r=>setTimeout(r,ms));let n=0;const issues=[];const steps=[];
 const shot=async name=>{n++;if(SH)await p.screenshot({path:path.join(SH,String(n).padStart(2,'0')+'_'+name+'_'+w+'.png')})};
 const audit=async(name,scope)=>{const r=await p.evaluate((scope,phone)=>{const root=scope?document.querySelector(scope):document.body;if(!root)return {missing:scope};const out={bad:[],overflow:[],small:[]};
   const txt=root.innerText||'';(txt.match(/[^\n]{0,40}\b(undefined|NaN|null|\[object Object\])\b[^\n]{0,30}/g)||[]).forEach(x=>out.bad.push(x.trim()));
   (txt.match(/[^\n]{0,30}(\s{2,}·|·\s*·|\(\s*\)|,\s*,)[^\n]{0,20}/g)||[]).slice(0,5).forEach(x=>out.bad.push('punct: '+x.trim()));
   const W=innerWidth;root.querySelectorAll('*').forEach(e=>{if(e.closest('svg'))return;const cs=getComputedStyle(e);if(cs.display==='none'||cs.visibility==='hidden')return;const q=e.getBoundingClientRect();if(!q.width||!q.height)return;if(q.bottom<0||q.top>innerHeight)return;
    let sc=e.parentElement,clipped=false;while(sc&&sc!==document.body){const s2=getComputedStyle(sc);if(/(auto|scroll|hidden|clip)/.test(s2.overflowX)){clipped=true;break}sc=sc.parentElement}
    if(cs.position==='fixed'&&(q.left>=W-1||q.right<=1))return;if(!clipped&&(q.right>W+1||q.left<-1)&&!/dmTiles|tile|marker|mapPanel|dmTempLayer|dmTb|radius/.test(String(e.className)+(e.parentElement&&e.parentElement.className)))out.overflow.push((e.id||String(e.className).slice(0,30)||e.tagName)+'@'+Math.round(q.left)+'-'+Math.round(q.right));
    if(phone&&e.matches('a[href],button')&&!e.closest('#map')&&(q.width<28||q.height<28)&&q.top>0&&q.bottom<innerHeight)out.small.push((e.textContent||e.getAttribute('aria-label')||e.className).trim().slice(0,24)+' '+Math.round(q.width)+'x'+Math.round(q.height))});
   out.overflow=[...new Set(out.overflow)].slice(0,6);out.small=[...new Set(out.small)].slice(0,8);out.hScroll=document.documentElement.scrollWidth>W+1;return out},scope,phone);
  steps.push(name);if(r.missing){issues.push(name+': missing '+r.missing);return}if(r.bad.length)issues.push(name+' TEXT '+JSON.stringify(r.bad.slice(0,4)));if(r.overflow.length)issues.push(name+' OVERFLOW '+JSON.stringify(r.overflow));if(r.small.length)issues.push(name+' SMALL '+JSON.stringify(r.small));if(r.hScroll)issues.push(name+' PAGE SCROLLS SIDEWAYS')};
 const mapOk=async(tag)=>{const m=await p.evaluate(()=>{const mp=document.getElementById('map').getBoundingClientRect();const inView=[...document.querySelectorAll('#map .dmOverlay .marker[data-mid]')].filter(e=>{const r=e.getBoundingClientRect();return r.left>mp.left&&r.right<mp.right&&r.top>mp.top&&r.bottom<mp.bottom}).length;const here=document.getElementById('dmHere');return {inView,searchHere:!!(here&&here.classList.contains('on')),c:state.center,m:state.mapCenter,z:state.zoom,r:(document.getElementById('radius')||{}).value,fit:state.dmFitCenter}});if(m.inView<3||m.searchHere)issues.push(tag+': swim map broken '+JSON.stringify(m))};
 // 1 first visit
 await p.goto('http://127.0.0.1:8765/final.html',{waitUntil:'domcontentloaded'});await S(3500);await shot('start');await audit('start');
 const gate=await p.evaluate(()=>!!document.getElementById('gateDest'));
 const picker=await p.evaluate(()=>[...document.querySelectorAll('#dmGateActs button')].map(b=>b.dataset.a));steps.push('start picker: '+picker.join(','));if(picker.length<6)issues.push('start screen: activity picker missing');
 if(gate&&picker.length){await p.evaluate(()=>document.querySelector('#dmGateActs button[data-a="paddle"]').click());await S(300);await shot('start_paddle')}
 if(gate){await p.click('#gateDest');await p.keyboard.type('Zürich',{delay:30});await S(600);await shot('typing');await p.evaluate(()=>document.getElementById('gateSearch').click());}
 else issues.push('no start screen search');
 await S(6000);const viaGate=await p.evaluate(()=>({mode:document.documentElement.getAttribute('data-act'),cards:document.querySelectorAll('#dmActList .dmAcard').length,panel:!document.getElementById('dmActPanel').hidden}));steps.push('after start search: '+JSON.stringify(viaGate));if(viaGate.mode!=='paddle'||!viaGate.cards)issues.push('start picker Paddle did not lead to the paddle list: '+JSON.stringify(viaGate));await shot('after_start_paddle');
 await p.evaluate(()=>document.querySelector('#dmActBar button[data-a="swim"]').click());
 await p.waitForSelector('#results .result',{timeout:20000}).catch(()=>issues.push('swim results did not appear'));await S(3000);await mapOk('swim after starting in Paddle');await shot('swim');await audit('swim list','#results');
 await p.evaluate(()=>{const m=document.getElementById('resultsPanel')||document.getElementById('results');m&&m.scrollIntoView()});await S(500);await shot('swim_list');
 // swim card
 await p.evaluate(()=>{const r=document.querySelector('#results .result .openPlace')||document.querySelector('#results .result');r&&r.click()});await S(3000);await shot('swim_card');await audit('swim card','#drawer');
 for(let i=1;i<6;i++){await p.evaluate(i=>{const d=document.getElementById('drawer');d.scrollTop=i*(innerHeight-140)},i);await S(350);await shot('swim_card'+i)}
 const sosSwim=await p.evaluate(()=>!!document.querySelector('#cardBody .dmSOS .dmSosT'));if(!sosSwim)issues.push('swim card: no emergency section');
 await p.evaluate(()=>{try{closeCard()}catch(e){document.getElementById('close').click()}});await S(600);
 // every activity
 const modes=await p.evaluate(()=>[...document.querySelectorAll('#dmActBar button[data-a]')].filter(b=>!b.hidden&&b.offsetParent).map(b=>b.dataset.a));steps.push('modes '+modes.join(','));
 for(const k of modes.filter(m=>m!=='swim')){await p.evaluate(k=>document.querySelector('#dmActBar button[data-a="'+k+'"]').click(),k);await S(4500);
  await p.evaluate(()=>{const m=document.getElementById('dmActPanel');m&&m.scrollIntoView()});await S(500);await shot(k+'_list');await audit(k+' list','#dmActPanel');
  const cnt=await p.evaluate(()=>document.querySelectorAll('#dmActList .dmAcard').length);if(!cnt)issues.push(k+': no cards');
  // filter + sort round trip
  const chipOk=await p.evaluate(async()=>{const c=[...document.querySelectorAll('#dmActChips .dmChip')];if(c.length<2)return 'few';c[1].click();await new Promise(r=>setTimeout(r,500));const n1=document.querySelectorAll('#dmActList .dmAcard').length;document.querySelector('#dmActChips .dmChip[data-c="all"]').click();await new Promise(r=>setTimeout(r,400));return n1>0?'ok':'empty'});if(chipOk==='empty')issues.push(k+': first filter empty');
  for(const s of ['best','near','cheap','rec']){await p.evaluate(s=>{const b=document.querySelector('#dmActList [data-sort="'+s+'"]');b&&b.click()},s);await S(250)}
  // open the first card and read every section
  await p.evaluate(()=>{const b=document.querySelector('#dmActList .dmAopen');b&&b.click()});await S(4000);await shot(k+'_card');await audit(k+' card','#dmActSheet');
  const sec=await p.evaluate(()=>[...document.querySelectorAll('#dmActSheet .section h3')].map(h=>h.textContent.trim()));
  const waits=await p.evaluate(()=>[...document.querySelectorAll('#dmActSheet .dmBwait')].map(x=>x.closest('.section')&&x.closest('.section').querySelector('h3').textContent.trim()));if(waits.length)issues.push(k+' card still loading after 4 s: '+waits.join(', '));
  for(let i=1;i<9;i++){const more=await p.evaluate(i=>{const b=document.getElementById('dmActBody'),s=document.getElementById('dmActSheet');const y=i*(innerHeight-160);b.scrollTop=y;s.scrollTop=y;return b.scrollTop+b.clientHeight<b.scrollHeight-4||s.scrollTop+s.clientHeight<s.scrollHeight-4},i);await S(300);if(i<=3)await shot(k+'_card'+i);if(!more)break}
  steps.push(k+' sections: '+sec.join(' | '));
  // close by tapping outside (phone) / clicking outside (PC)
  if(phone)await p.touchscreen.tap(Math.round(+w/2),28);else await p.mouse.click(60,Math.round(+h/2));await S(700);
  const gateUp=await p.evaluate(()=>{const g=document.querySelector('.gate');return !!g&&!g.classList.contains('hidden')&&getComputedStyle(g).display!=='none'});if(gateUp){issues.push(k+': closing tap opened the start screen');await p.evaluate(()=>{const g=document.querySelector('.gate');g.classList.add('hidden');g.style.display='none'})}
  const still=await p.evaluate(()=>document.getElementById('dmActSheet').classList.contains('open'));if(still){issues.push(k+': card did not close on outside tap');await p.evaluate(()=>document.getElementById('dmActClose').click());await S(400)}}
 // map pin
 await p.evaluate(()=>document.querySelector('#dmActBar button[data-a="paddle"]').click());await S(4000);await p.evaluate(()=>{const m=document.getElementById('mapPanel');scrollTo(0,m.getBoundingClientRect().top+scrollY-70)});await S(800);await shot('paddle_map');await audit('paddle map','#mapPanel');
 const pin=await p.evaluate(()=>{const e=document.querySelector('#map .dmActPin');if(!e)return null;const r=e.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]});
 if(pin){if(phone)await p.touchscreen.tap(pin[0],pin[1]);else await p.mouse.click(pin[0],pin[1]);await S(1500);const op=await p.evaluate(()=>document.getElementById('dmActSheet').classList.contains('open'));if(!op)issues.push('pin tap did not open the card');await shot('pin_card');await p.evaluate(()=>document.getElementById('dmActClose').click());await S(500)}
 // back to swim
 await p.evaluate(()=>document.querySelector('#dmActBar button[data-a="swim"]').click());await S(2500);await mapOk('back to swim');const back=await p.evaluate(()=>({swim:document.querySelectorAll('#results .result').length,pins:document.querySelectorAll('#map .dmActPin').length,panelHidden:document.getElementById('dmActPanel').hidden}));if(!back.swim||back.pins||!back.panelHidden)issues.push('back to swim: '+JSON.stringify(back));await shot('swim_again');
 console.log(JSON.stringify({width:+w,steps,issues},null,1),'\npageerrors',errs.length,JSON.stringify(errs));await b.close();process.exit(0)})();
