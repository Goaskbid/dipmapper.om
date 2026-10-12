// v23.8: the About photos travel inside index.html. Opens website/index.html straight from disk with no network at all
// (as when the HTML file is previewed on its own or uploaded without anything else) and checks that all three photos show.
const chromium=require('./lib/chromium.js'),puppeteer=require('puppeteer-core'),path=require('path');
(async()=>{const b=await puppeteer.launch({args:chromium.args,executablePath:await chromium.executablePath(),headless:true});const p=await b.newPage();await p.setViewport({width:1440,height:900});
 await p.setRequestInterception(true);p.on('request',r=>{const u=r.url();if(u.startsWith('file:')||u.startsWith('data:'))return r.continue();r.abort()});
 await p.goto('file://'+path.resolve(__dirname,'../../website/index.html'),{waitUntil:'domcontentloaded'});await new Promise(r=>setTimeout(r,2500));
 const R=await p.evaluate(async()=>{const L=[...document.querySelectorAll('#about img')];for(const i of L){i.loading='eager';if(!i.complete)await new Promise(r=>{i.onload=i.onerror=r;setTimeout(r,3000)})}return {photos:L.length,loaded:L.filter(i=>i.naturalWidth>0).length,embedded:L.filter(i=>/^data:image\/webp;base64,/.test(i.getAttribute('src'))).length}});
 console.log(JSON.stringify(R));await b.close()})();
