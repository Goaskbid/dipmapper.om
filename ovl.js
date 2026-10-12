const chromium=require('./lib/chromium.js'),puppeteer=require('puppeteer-core');const [,,f,w,h]=process.argv;
(async()=>{const b=await puppeteer.launch({args:chromium.args,executablePath:await chromium.executablePath(),headless:true});
 const p=await b.newPage();await p.setViewport({width:+w,height:+h});await p.setRequestInterception(true);p.on('request',r=>r.url().startsWith('http://127.0.0.1')||r.url().startsWith('data:')?r.continue():r.abort());
 const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,100)));
 await p.goto((process.env.BASE||'http://127.0.0.1:8765/')+f+'?lat=47.3582&lon=8.5361&name=Z%C3%BCrich',{waitUntil:'domcontentloaded'});await p.waitForSelector('#results .result');await new Promise(r=>setTimeout(r,3000));
 const R=await p.evaluate(async()=>{const S=ms=>new Promise(r=>setTimeout(r,ms)),R={};const mp=document.getElementById('map');document.getElementById('mapPanel').scrollIntoView({block:'start'});await S(200);
  if(typeof renderWeatherWarn==='function')renderWeatherWarn({icon:'🌧️',label:'Heavy rain',time:'16:00'});else{const e=document.createElement('div');e.className='dmWeatherWarn';e.innerHTML='<span class="dmwIcon">🌧️</span><span class="dmwTxt"><b>Heavy rain</b>from 16:00</span>';mp.appendChild(e)}
  let g=mp.querySelector('.dmGolden');if(!g){g=document.createElement('div');g.className='dmGolden';g.innerHTML='<span class="gi">🌅</span><span class="gt"><b>Golden-hour swim</b>17:40–18:55 · sunset 18:55</span>';mp.appendChild(g)}
  state.mapCenter=[state.center[0]+0.03,state.center[1]+0.05];drawMap();await S(800);
  const vis=e=>e&&getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().width>0&&+getComputedStyle(e).opacity>0.5;
  const items={weather:mp.querySelector('.dmWeatherWarn'),golden:mp.querySelector('.dmGolden'),searchPill:document.getElementById('dmHere'),attribution:mp.querySelector('.dmAttr'),radiusLabel:mp.querySelector('.radiusLabel')};
  R.shown=Object.keys(items).filter(k=>vis(items[k]));const k=R.shown;const ov=[];
  for(let i=0;i<k.length;i++)for(let j=i+1;j<k.length;j++){if(k[i]==='radiusLabel'||k[j]==='radiusLabel')continue;const a=items[k[i]].getBoundingClientRect(),c=items[k[j]].getBoundingClientRect();if(!(a.right<=c.left||a.left>=c.right||a.bottom<=c.top||a.top>=c.bottom))ov.push(k[i]+'×'+k[j])}
  R.overlaps=ov.length?ov:'none';const mr=mp.getBoundingClientRect();R.allInsideMap=k.every(x=>{const r=items[x].getBoundingClientRect();return r.left>=mr.left-1&&r.right<=mr.right+1&&r.top>=mr.top-1&&r.bottom<=mr.bottom+1});
  const navBtns=[...document.querySelectorAll('.topbar .nav button,.topbar .nav a')].filter(vis).map(x=>x.textContent.trim());R.headerButtonsVisible=navBtns;
  R.headerHeight=Math.round(document.querySelector('.topbar').getBoundingClientRect().height);
  const rs=document.getElementById('rescan');R.rescanInMapToolbar=!!rs.closest('.mapActions')&&vis(rs)?rs.textContent:'no';const sid=state.scanId;rs.click();await S(300);R.rescanStillWorks=state.scanId>sid;
  return R});
 await p.evaluate(()=>document.getElementById('mapPanel').scrollIntoView({block:'start'}));await new Promise(r=>setTimeout(r,300));await p.screenshot({path:'ovl_'+w+'.png'});
 console.log(w+'px',JSON.stringify(R),'| pageerrors',errs.length);process.exit(0)})();
