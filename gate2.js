const chromium=require('./lib/chromium.js'),puppeteer=require('puppeteer-core'),fs=require('fs');const [,,f,w,h]=process.argv;const PHOTO=fs.readFileSync(require('path').join(__dirname,'photo.jpg'));
(async()=>{const b=await puppeteer.launch({args:[...chromium.args,'--no-sandbox','--allow-file-access-from-files'],executablePath:await chromium.executablePath(),headless:true});
 const p=await b.newPage();await p.setViewport({width:+w,height:+h});await p.setRequestInterception(true);
 p.on('request',r=>{const u=r.url();if(u.startsWith('file:')||u.startsWith('data:'))return r.continue();if(u.includes('pagead2'))return r.respond({status:200,contentType:'application/javascript',body:''});if(r.resourceType()==='image')return r.respond({status:200,contentType:'image/jpeg',body:PHOTO});r.abort()});
 await p.goto('file://'+require('path').join(__dirname,'_site')+'/'+f,{waitUntil:'domcontentloaded'});await new Promise(r=>setTimeout(r,300));
 const early=await p.evaluate(()=>getComputedStyle(document.querySelector('.gate .gateBox')).opacity);await new Promise(r=>setTimeout(r,3500));
 const o=await p.evaluate(()=>{const g=document.querySelector('.gate');const ids=['gateDest','gateSearch','gateLoc','gateSkip'];const vis={};
  ids.forEach(id=>{const e=document.getElementById(id);if(!e)return;const r=e.getBoundingClientRect();vis[id]=r.bottom<=innerHeight&&r.top>=0?'on screen':'off screen'});
  const canScroll=g.scrollHeight>g.clientHeight;let reach=true;if(canScroll){g.scrollTop=g.scrollHeight;const r=document.getElementById('gateSkip').getBoundingClientRect();reach=r.bottom<=innerHeight}
  return {buttons:vis,gateScrollable:canScroll,skipReachableByScroll:reach,overflowX:document.documentElement.scrollWidth>innerWidth}});
 await p.screenshot({path:`g2_${w}x${h}.png`});console.log(`${w}x${h}`.padEnd(10),'card opacity at 0.3s:',early,'|',JSON.stringify(o));process.exit(0)})();
