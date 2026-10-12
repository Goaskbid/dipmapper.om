// v23.8: About DipMapper — founder interview with three photos. Checks the section is visible, the photos load,
// the header "About" button scrolls to it, the whole interview and all three photos are visible without any tap, nothing sticks out sideways, no page errors.
const chromium=require('./lib/chromium.js'),puppeteer=require('puppeteer-core'),fs=require('fs'),path=require('path'),actmock=require('./lib/actmock.js');const PHOTO=fs.readFileSync(path.join(__dirname,'photo.jpg'));const [,,w,h]=process.argv;
(async()=>{const b=await puppeteer.launch({args:chromium.args,executablePath:await chromium.executablePath(),headless:true});const p=await b.newPage();await p.setViewport({width:+w,height:+h,isMobile:+w<800,hasTouch:+w<800});
 await p.setRequestInterception(true);p.on('request',r=>{const u=r.url();const J=(o,d)=>setTimeout(()=>r.respond({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(o)}).catch(()=>{}),d||100);
  if(actmock(u,J,{}))return;if(/interpreter|overpass/.test(u))return J({elements:[]});if(u.startsWith('http://127.0.0.1')||u.startsWith('data:'))return r.continue();if(r.resourceType()==='image')return r.respond({status:200,contentType:'image/jpeg',body:PHOTO}).catch(()=>{});r.abort()});
 const errs=[],bad=[];p.on('pageerror',e=>errs.push(e.message));p.on('response',r=>{if(r.url().startsWith('http://127.0.0.1')&&r.status()>=400)bad.push(r.status()+' '+r.url())});
 const S=ms=>new Promise(r=>setTimeout(r,ms));const SH=process.env.SHOTDIR||'';
 await p.goto('http://127.0.0.1:8765/final.html?lat=47.3582&lon=8.5361&name=Z%C3%BCrich',{waitUntil:'domcontentloaded'});await p.waitForFunction(()=>window.__dmBootDone,{timeout:15000}).catch(()=>{});await S(4000);
 const R={};
 R.section=await p.evaluate(()=>{const s=document.getElementById('about');if(!s)return null;const cs=getComputedStyle(s);return {display:cs.display,title:s.querySelector('h2').textContent,figures:s.querySelectorAll('figure').length,questions:s.querySelectorAll('h3').length,visibleQuestions:[...s.querySelectorAll('h3')].filter(x=>x.checkVisibility()).length}});
 R.headerButton=await p.evaluate(()=>{const b=document.querySelector('.topbar .nav [data-scroll="about"]');return b?getComputedStyle(b).display:'missing'});
 if(R.headerButton!=='none'&&R.headerButton!=='missing'){await p.click('.topbar .nav [data-scroll="about"]');await S(1500);R.scrolledTo=await p.evaluate(()=>{const r=document.getElementById('about').getBoundingClientRect();return r.top>-5&&r.top<innerHeight*0.6})}
 else{await p.evaluate(()=>document.getElementById('about').scrollIntoView());await S(800)}
 const img=async()=>p.evaluate(async()=>{const L=[...document.querySelectorAll('#about img')];for(const i of L){i.loading='eager';if(!i.complete)await new Promise(r=>{i.onload=i.onerror=r;setTimeout(r,4000)})}return L.map(i=>({src:i.getAttribute('src').slice(0,40),ok:i.naturalWidth>0,w:i.naturalWidth,shown:Math.round(i.getBoundingClientRect().width),alt:!!i.alt}))});
 R.imagesBefore=await img();
 if(SH){await S(600);await p.screenshot({path:SH+'/about_top_'+w+'.png'});await p.evaluate(()=>window.scrollBy(0,innerHeight-120));await S(500);await p.screenshot({path:SH+'/about_mid_'+w+'.png'})}
 R.photosVisible=await p.evaluate(()=>[...document.querySelectorAll('#about img')].filter(i=>i.checkVisibility()&&i.getBoundingClientRect().width>100).length);
 R.images=await img();
 if(SH){await p.evaluate(()=>{document.documentElement.style.scrollBehavior='auto';const r=document.querySelector('#about .dmAbWide').getBoundingClientRect();window.scrollTo(0,r.top+scrollY-innerHeight/2+r.height/2)});await S(600);await p.screenshot({path:SH+'/about_more_'+w+'.png'})}
 R.overflowX=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
 R.wideElements=await p.evaluate(()=>[...document.querySelectorAll('#about *')].filter(e=>e.getBoundingClientRect().right>innerWidth+1).map(e=>e.tagName+'.'+e.className).slice(0,5));
 R.badResponses=bad;
 console.log(JSON.stringify(R,null,1),'\npageerrors',errs.length,JSON.stringify(errs));await b.close()})();
