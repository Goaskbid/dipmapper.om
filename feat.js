const chromium=require('./lib/chromium.js'),puppeteer=require('puppeteer-core');const [,,w,h,wqmode]=process.argv;
const WQ={features:[{attributes:{bathingWaterName:'Zürichsee - Seebad Enge',qualityStatus:'Excellent',qualityStatus_minus1:'Excellent',qualityStatus_minus2:'Good',bwProfileLink:'https://example.admin.ch/profile/CH0001',latitude:47.3584,longitude:8.5363}},
 {attributes:{bathingWaterName:'Far site',qualityStatus:'Poor',latitude:47.37,longitude:8.55}}]};
(async()=>{const b=await puppeteer.launch({args:[...chromium.args,'--no-sandbox'],executablePath:await chromium.executablePath(),headless:true});
 const p=await b.newPage();await p.setViewport({width:+w,height:+h});await p.setRequestInterception(true);let wqCalls=[];
 p.on('request',r=>{const u=r.url();if(u.includes('discomap.eea.europa.eu')){wqCalls.push(decodeURIComponent(u).match(/geometry=([^&]*)/)[1]+' d='+(u.match(/distance=(\d+)/)||[])[1]);
   if(wqmode==='fail')return r.abort();return r.respond({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(wqmode==='none'?{features:[]}:WQ)})}
  if(u.startsWith('http://127.0.0.1')||u.startsWith('data:'))return r.continue();r.abort()});
 const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://127.0.0.1:8765/final.html?lat=47.3582&lon=8.5361&name=Z%C3%BCrich',{waitUntil:'domcontentloaded'});await p.waitForSelector('#results .result');await new Promise(r=>setTimeout(r,2500));
 const o=await p.evaluate(async()=>{const S=ms=>new Promise(r=>setTimeout(r,ms)),R={};const cards=[...document.querySelectorAll('#results .result')];
  R.scoreBadges=cards.filter(c=>c.querySelector(':scope>.dmScore')).length+'/'+cards.length;const b0=cards[0].querySelector('.dmScore'),th=cards[0].querySelector('.thumb');
  const br=b0.getBoundingClientRect(),tr=th.getBoundingClientRect();R.badgeOnPhoto=br.left>=tr.left-1&&br.bottom<=tr.bottom+4&&br.top>=tr.top;R.badgeText=b0.textContent;
  R.badgeOverlapsName=(()=>{const n=cards[0].querySelector('.resultName').getBoundingClientRect();return !(br.right<n.left||br.left>n.right||br.bottom<n.top||br.top>n.bottom)})();
  document.querySelector('#results [data-open]').click();await S(1200);const sec=document.querySelector('#cardBody .dmScSec');
  R.scoreSection=!!sec;R.scoreRing=sec&&sec.querySelector('.dmScRing b')?sec.querySelector('.dmScRing b').textContent:null;R.parts=sec?[...sec.querySelectorAll('.dmScPart')].map(x=>x.querySelector('span').textContent+'='+x.querySelector('em').textContent):[];
  R.cardMatchesPanel=R.scoreRing===cards[0].querySelector('.dmScore b').textContent;
  const wq=document.querySelector('#cardBody .dmWqSec');R.wq=wq?wq.innerText.replace(/\s+/g,' ').slice(0,170):null;
  const al=sec.querySelector('.dmAlBtn');al.click();await S(100);R.alertStored=JSON.parse(localStorage.getItem('dmAlerts')||'[]').map(x=>x.name+'@'+x.min);R.alertBtn=al.textContent;
  return R});
 console.log(w+'px wq='+wqmode,JSON.stringify(o),'| EEA queries',JSON.stringify(wqCalls),'| pageerrors',errs.length);process.exit(0)})();
