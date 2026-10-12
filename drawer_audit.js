const chromium=require('./lib/chromium.js'),puppeteer=require('puppeteer-core');const f=process.argv[2]||'final.html';
(async()=>{const b=await puppeteer.launch({args:[...chromium.args,'--no-sandbox'],executablePath:await chromium.executablePath(),headless:true});
 const p=await b.newPage();await p.setViewport({width:1440,height:900});await p.setRequestInterception(true);p.on('request',r=>r.url().startsWith('http://127.0.0.1')||r.url().startsWith('data:')?r.continue():r.abort());
 const all={};for(const [n,la,lo] of [['Zürich',47.3582,8.5361],['Meilen',47.262,8.6466],['Rhodes',36.43,28.22],['Palma',39.57,2.65],['Miami',25.79,-80.13]]){
 await p.goto(`http://127.0.0.1:8765/${f}?lat=${la}&lon=${lo}&name=${encodeURIComponent(n)}`,{waitUntil:'domcontentloaded'});await p.waitForSelector('#results .result',{timeout:20000}).catch(()=>{});await new Promise(r=>setTimeout(r,2000));
 const r=await p.evaluate(async()=>{const S=ms=>new Promise(r=>setTimeout(r,ms)),issues=[];const ids=[...document.querySelectorAll('#results [data-open]')].map(b=>b.getAttribute('data-open'));
  for(const id of ids){try{openPlaceById(id)}catch(e){try{openCard(id)}catch(e2){}}await S(250);const body=document.getElementById('cardBody'),t=body.innerText,name=document.getElementById('cardTitle').textContent;
   const add=(k,x)=>issues.push(k+' | '+name+' | '+x);
   for(const m of t.matchAll(/U000[0-9A-F]{4,5}|\\u[0-9a-fA-F]{4}|undefined|NaN|\[object|null\b/g))add('RAW',m[0]);
   if(/\.\.(\s|$)/.test(t))add('DOUBLEDOT','');if(/CHF 0 |US\$0\)/.test(t))add('ZEROPRICE','');
   const st=t.match(/([★☆]{5})\s*([\d.]+)\/5/);if(st){const full=(st[1].match(/★/g)||[]).length,rt=+st[2];if(Math.abs(full-Math.round(rt))>0)add('STARS',st[1]+' vs '+rt)}
   if(/no lifeguard/i.test(t)&&/Lifeguard/.test([...body.querySelectorAll('.facility')].map(x=>x.textContent).join(' ')))add('CONTRADICT','Lifeguard chip vs "no lifeguard"');}
  return {spots:ids.length,issues}});all[n]=r;}
 let tot=0;const kinds={};for(const [n,r] of Object.entries(all)){tot+=r.spots;r.issues.forEach(x=>{const k=x.split(' | ')[0];kinds[k]=(kinds[k]||0)+1})}
 console.log('spots audited:',tot,'| issue counts:',JSON.stringify(kinds));
 const ex={};Object.values(all).flatMap(r=>r.issues).forEach(x=>{const k=x.split(' | ')[0];(ex[k]=ex[k]||[]).length<3&&ex[k].push(x)});console.log(JSON.stringify(ex,null,1));process.exit(0)})();
