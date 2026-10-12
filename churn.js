const chromium=require('./lib/chromium.js'),puppeteer=require('puppeteer-core');const f=process.argv[2];
(async()=>{const b=await puppeteer.launch({args:[...chromium.args,'--no-sandbox'],executablePath:await chromium.executablePath(),headless:true});
 const p=await b.newPage();await p.setViewport({width:1440,height:900});await p.setRequestInterception(true);p.on('request',r=>r.url().startsWith('http://127.0.0.1')||r.url().startsWith('data:')?r.continue():r.abort());
 await p.evaluateOnNewDocument(()=>{window.__c={cards:0,imgs:0,badges:0,buoys:0,first:0};new MutationObserver(ms=>{for(const m of ms)for(const n of m.removedNodes){if(n.nodeType!==1)continue;
   if(!n.isConnected&&n.matches){if(n.matches('.result')){window.__c.cards++;window.__c.imgs+=n.querySelectorAll('img').length}if(n.matches('.dmScore'))window.__c.badges++;if(n.matches('.dmRank'))window.__c.buoys++}}}).observe(document,{childList:true,subtree:true})});
 await p.goto('http://127.0.0.1:8765/'+f+'?lat=47.3582&lon=8.5361&name=Z%C3%BCrich',{waitUntil:'domcontentloaded'});await p.waitForSelector('#results .result');
 await p.evaluate(()=>{window.__base=Object.assign({},window.__c)});await new Promise(r=>setTimeout(r,10000));
 const c=await p.evaluate(()=>{const o={};for(const k in window.__c)o[k]=window.__c[k]-window.__base[k];return o});const m=await p.metrics();
 console.log(f.padEnd(17),'destroyed in 10 s after first render -> cards',c.cards,'| photos',c.imgs,'| score badges',c.badges,'| buoys',c.buoys,'| script',Math.round(m.ScriptDuration*1000),'ms | layout',Math.round(m.LayoutDuration*1000),'ms');process.exit(0)})();
