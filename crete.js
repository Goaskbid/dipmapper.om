const chromium=require('./lib/chromium.js'),puppeteer=require('puppeteer-core');const f=process.argv[2]||'final.html';
const E=(id,lat,lon,tags)=>({type:'node',id,lat,lon,tags});
const ELS=[E(1,35.3352,25.3905,{natural:'beach',name:'Παραλία Χερσονήσου',description:'Schöner Sandstrand mit Liegen und Schirmen, im Sommer sehr voll.',opening_hours:'sunrise-sunset'}),
 E(2,35.3301,25.4102,{natural:'beach',name:'Strand von Stalis',opening_hours:'Mo-Su 09:00-19:00',toilets:'yes',shower:'yes'}),
 E(3,35.3290,25.3801,{leisure:'swimming_pool',name:'Kolymvitirio Chersonisou',access:'yes',opening_hours:'Mo-Fr 08:00-20:00; Sa,Su 10:00-18:00; PH off',description:'Olympic-size outdoor pool open to the public.'}),
 E(4,35.3320,25.3950,{amenity:'cafe',name:'Pool Billard Café Hersonissos'}),
 E(5,35.3330,25.3960,{amenity:'bar',name:'Pool Bar Malia Road'}),
 E(6,35.3340,25.3970,{leisure:'sports_centre',sport:'billiards',name:'Snooker & Pool Club'}),
 E(7,35.3345,25.3980,{amenity:'pub',name:'Darts & Pool Pub'}),
 E(8,35.3360,25.4010,{leisure:'swimming_area',name:'Badestelle am Hafen',description:'Kleine Badestelle mit Leiter ins Meer.'}),
 E(9,35.3250,25.3700,{natural:'beach',name:'Παραλία Αναλήψεως','name:en':'Analipsi Beach',seasonal:'yes'})];
(async()=>{const b=await puppeteer.launch({args:chromium.args,executablePath:await chromium.executablePath(),headless:true});
 const p=await b.newPage();await p.setViewport({width:390,height:844});await p.setRequestInterception(true);
 p.on('request',r=>{const u=r.url();if(/interpreter|overpass/.test(u))return r.respond({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({elements:ELS})});
  if(u.startsWith('http://127.0.0.1')||u.startsWith('data:'))return r.continue();r.abort()});
 const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,120)));
 await p.goto('http://127.0.0.1:8765/'+f+'?lat=35.333&lon=25.392&name=Hersonissos',{waitUntil:'domcontentloaded'});await new Promise(r=>setTimeout(r,9000));
 const R=await p.evaluate(async()=>{const S=ms=>new Promise(r=>setTimeout(r,ms));const all=state.results||[];
  const names=all.map(v=>v.name+' ['+v.cat+']');const dec=['Pool Billard Café Hersonissos','Pool Bar Malia Road','Snooker & Pool Club','Darts & Pool Pub'];
  const out={resultsInList:all.length,decoysPresent:all.filter(v=>dec.includes(v.name)).map(v=>v.name),poolsFound:all.filter(v=>v.cat==='pool').map(v=>v.name),
   cards:[...document.querySelectorAll('#results .resultName')].map(x=>x.textContent).slice(0,8),panels:[]};
  for(const v of all.filter(v=>/^osm-/.test(v.id))){openCard(v.id);await S(700);const t=document.getElementById('cardBody').innerText;const title=document.getElementById('cardTitle').textContent;
   const story=document.querySelector('#cardBody .story').innerText;out.panels.push({title,story:story.slice(0,600),hoursRaw:/\bMo-|\bPH off|\bSa,Su\b/.test(t),germanInEnglishSentences:(story.split('\n').filter(l=>!/^Local note/.test(l)).join(' ').match(/\b(und|mit|im|sehr|Liegen|Schirmen|Sommer|voll|Kleine|Leiter|ins|Meer)\b/g)||[])});closeCard();await S(200)}
  return out});
 console.log(JSON.stringify(R,null,1),'\npageerrors',errs.length,JSON.stringify(errs));process.exit(0)})();
