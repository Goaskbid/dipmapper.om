// DipMapper regression suite. Usage (from tools/tests):  npm install   then   node run_all.js [--jobs 3] [--only name1,name2]
// Copies ../../website into _site (index.html also as final.html), serves it on 127.0.0.1:8765 and runs every check below.
// All network calls to map/geo/weather services are mocked inside the tests, so results do not depend on the internet.
const fs=require('fs'),path=require('path'),{spawn}=require('child_process');const serve=require('./lib/serve.js');
const SITE=path.join(__dirname,'_site'),WEB=path.join(__dirname,'..','..','website');
const args=process.argv.slice(2);const JOBS=+(args[args.indexOf('--jobs')+1]||0)||(args.includes('--jobs')?3:2);const ONLY=args.includes('--only')?args[args.indexOf('--only')+1].split(','):null;
const B='http://127.0.0.1:8765/final.html';
const C=[ // [name, script, args, env, required patterns, forbidden patterns]
 ['behave-desktop','behave.js',['final.html','1440','900'],{},[/pageerrors: 0/,/"onlyBeaches":true/,/"overflowX":false/]],
 ['behave-phone','behave.js',['final.html','390','844'],{},[/pageerrors: 0/,/"onlyBeaches":true/,/"overflowX":false/]],
 ['detail-panels','drawer_audit.js',['final.html'],{},[/issue counts: \{\}/]],
 ['phone-suite','mob.js',[],{},[/"mapFirst": true/,/"logoBackToStart": true/,/"rotated": true/,/pageerrors 0/]],
 ['search-phone','srch.js',['390','844'],{},[/"radius": "50"/,/"newPlaceKeeps10": "10"/,/"cancelWorks": true/,/pageerrors 0/]],
 ['search-desktop','srch.js',['1440','900'],{},[/"radius": "50"/,/"newPlaceKeeps10": "10"/,/"cancelWorks": true/,/pageerrors 0/]],
 ['suggestions','sugg.js',[],{},[/Geneva · Genève/,/"sugBoxFitsScreen": true/,/pageerrors 0/]],
 ['crete-texts','crete.js',['final.html'],{},[/"decoysPresent": \[\]/,/pageerrors 0/],[/"germanInEnglishSentences": \[\s*"/]],
 ['overlays-phone','ovl.js',['final.html','390','844'],{},[/"overlaps":"none"/,/"headerButtonsVisible":\[\]/,/pageerrors 0/]],
 ['overlays-desktop','ovl.js',['final.html','1440','900'],{},[/"overlaps":"none"/,/pageerrors 0/]],
 ['geneva-phone','geneva.js',['final.html','390','844'],{},[/"center":\[46\.20\d,6\.14\d\]/,/"overlaps":"none"/,/pageerrors 0/]],
 ['genf-desktop','geneva.js',['final.html','1440','900','Genf'],{},[/"center":\[46\.20\d,6\.14\d\]/,/pageerrors 0/]],
 ['map-drag','drag.js',[],{},[/"dragMovedMap": true/,/"pageDidNotScroll": true/,/pageerrors 0/]],
 ['selectors','chips.js',['final.html'],{},[/390px \{"chips":20,"overlapsOtherContent":0,[^}]*"fullyVisible":20/,/"sidewaysScroll":false/]],
 ['close-phone','closebug.js',['390','844'],{},[/(-> closed[\s\S]*){5}/],[/-> (?!closed)/]],
 ['close-desktop','closebug.js',['1440','900'],{},[/(-> closed[\s\S]*){5}/],[/-> (?!closed)/]],
 ['design-markers','fun.js',[],{},[/"buoyMatchesRank":true/,/"pinRankOk":true/,/pageerrors 0/]],
 ['saved-spots','saved.js',[],{},[/"persistsAfterReload":1/,/pageerrors 0/]],
 ['score-quality-phone','feat.js',['390','844'],{},[/"scoreBadges":"21\/21"/,/"cardMatchesPanel":true/,/pageerrors 0/]],
 ['score-quality-desktop','feat.js',['1440','900'],{},[/"scoreBadges":"21\/21"/,/pageerrors 0/]],
 ['alerts','alert.js',['final.html'],{},[/after remove: 0 alerts/,/pageerrors 0/]],
 ['forecast','fc.js',['final.html'],{},[/"real":4/,/pageerrors 0/]],
 ['ads-gating','ads.js',['final.html'],{},[/"unitsWhileGateOpen":0/]],
 ['open-from-disk','filetest.js',['slow'],{},[/"results":21/,/pageerrors 0/]],
 ['no-blink','blink.js',['final.html'],{},[/"tilesDestroyedBy10Redraws":0/,/"tilesDestroyedByAddressBarResizes":0/,/"tilesDestroyedByScrolling":0/]],
 ['no-churn','churn.js',['final.html'],{},[/cards 0 \| photos 0 \| score badges 0 \| buoys 0/]],
 ['desktop-sticky-map','scroll.js',[],{},[/top[\s\S]*"mapOnScreen":true[\s\S]*scrolled[\s\S]*"mapOnScreen":true/]],
 ['start-screen-phone','gate2.js',['final.html','390','844'],{},[/"gateSkip":"on screen"/,/"overflowX":false/]],
 ['start-screen-desktop','gate2.js',['final.html','1885','1000'],{},[/"gateSkip":"on screen"/,/"overflowX":false/]],
 ['welcome-failsafe','failsafe.js',[],{},[/7 s: \{[^}]*"startCardClickable":true/]],
 ['tap-replaces-text','tapsel.js',[],{},[/phone tap: field had "Zürich" → after typing "Gen": "Gen"/,/desktop click: field had "Zürich" → after typing "Gen": "Gen"/]],
 ['map-pick-servers-busy','pick2.js',[B,'390','844'],{OVERPASS:'fail'},[/"results":[1-9]/,/errors \[\]/]],
 ['map-pick-servers-ok','pick2.js',[B,'390','844'],{},[/"results":[1-9]/,/errors \[\]/]],
 ['phone-map-hold-390','rest.js',[B,'390','844'],{},[/"allInView":true/]],
 ['phone-map-hold-375','rest.js',[B,'375','667'],{},[/"allInView":true/]],
 ['activities-phone','activities.js',['390','844'],{},[/"swimStart": \{[^}]*"swimCards": 21/,/"Bootsvermietung Mythenquai \[Rowing boat & pedal boat rental\]"/,/"SUP Zürich \[SUP & kayak rental\]"/,/"Tauchsport Käser \[Dive centre\]"/,/"Zürcher Yacht Club \[Sailing club\]"/,/"Zürich Bürkliplatz \(See\) \[Ferry & boat landing\]"/,/"Kayakfun – kayak & mini-raft rental with shuttle \[Raft rental\]"/,/"Supkultur – SUP station Strandbad Mythenquai \[SUP rental\]"/,/"Inflatable & softtop SUP – 1 h per hour CHF 35"/,/Verified listing: Zürich Tourism, checked 10 Oct 2026/,/"Ceccotorenas[^"]*\[SUP & wakeboard school\]"/,/Local rules for wind sports · 2 apply here/,/"verified": [1-9]/,/"outsideCloses": true/,/"butler": "Good \w+ — your water butler/,/"zones": [1-9]/,/"tempBubbles": \[\s*"≈\d+°est\./,/"scores": \[\s*"\d+/,/"more": "https:\/\/www\.google\.com\/maps\/search\/SUP%20kayak%20rental\/@47\.35820,8\.53610,12z"/,/"more": "https:\/\/www\.google\.com\/maps\/search\/SUP%20rental\//,/"farMore": "https:\/\/www\.google\.com\/maps\/search\/SUP%20kayak%20rental\/@54\.40000,13\.40000/,/"farEmpty": "No paddle & row found[^"]*neither in our verified directory nor in OpenStreetMap/,/"open": true/,/"pinOpensSheet": "true/,/"allInView": true/,/"newPointQueried": true/,/"swimBack": \{[^}]*"swimCards": [1-9]\d*,\s*"swimListVisible": true/,/pageerrors 0/],[/SUP Bar|Pedal Power|Padel Club|Hallenbad City|Segelflug/]],
 ['activities-desktop','activities.js',['1440','900'],{},[/"swimStart": \{[^}]*"swimCards": 21/,/"outsideCloses": true/,/"panel": true/,/"swimListVisible": false/,/"open": true/,/pageerrors 0/],[/SUP Bar|Pedal Power|Padel Club|Hallenbad City|Segelflug/]],
 ['winter-ice','winter.js',['390','844'],{},[/"mode": "ice"/,/"iceBtnVisible": true/,/Frost sum \d+ °C·days/,/"icePins": [1-9]/,/"iceMap": true/,/❄ ≈\d+ cm/,/Official ice bulletin/,/Check release/,/Inferred/,/pageerrors 0/]],
 ['winter-finland','winter.js',['390','844'],{PLACE:'finland'},[/"iceVisibleInSwimMode": true/,/"mode": "ice"/,/Kallavesi/,/No official ice release known/,/"iceMap": true/,/pageerrors 0/]],
 ['winter-russia','winter.js',['390','844'],{PLACE:'russia'},[/"iceVisibleInSwimMode": true/,/"mode": "ice"/,/Onega Lake/,/No official ice release known/,/"iceMap": true/,/pageerrors 0/]],
 ['pins-desktop','pintest.js',['1440','900'],{},[/"special":\{"pins":\d+/,/pageerrors 0/],[/"opened":0/]],
 ['pins-phone','pintest.js',['390','844'],{},[/"special":\{"pins":\d+/,/pageerrors 0/],[/"opened":0/]],
 ['features-desktop','feat234.js',['1440','900'],{},[/"special": \{/,/pageerrors 0/],[/"sheetOverflow": true/,/"kitVisible": false/,/"overflowX": true/,/"open": false/]],
 ['features-phone','feat234.js',['390','844'],{},[/"special": \{/,/pageerrors 0/],[/"sheetOverflow": true/,/"kitVisible": false/,/"overflowX": true/,/"open": false/]],
 ['pins-hover','hover.js',[],{},[/"paddle":\{"hoverMovesPin":0/,/pageerrors 0/],[/"hoverMovesPin":[1-9]/,/"survivesRepaint":false/,/"flicker":[1-9]/]],
 ['photo-coverage','photo_audit.js',['390','844'],{},[/coverage ([6-9]\d|100)% /,/pageerrors 0/],[],480000],
 ['emergency-help','sos.js',['390','844'],{},[/"tiles":\["EMERGENCY 112/,/"act":\{"tiles":[5-9],"help":[5-9]/,/pageerrors 0/]],
 ['zones-retry','zones_retry.js',[],{},[/"zonesShown":[1-9]/,/"cached":1/,/pageerrors 0/]],
 ['journey-phone','journey.js',['390','844'],{},[/"issues": \[\]/,/pageerrors 0/],[],420000],
 ['journey-desktop','journey.js',['1440','900'],{},[/"issues": \[\]/,/pageerrors 0/],[],420000],
 ['zones-clutter','zones_clutter.js',['1440','900'],{},[/verdict clean/,/pageerrors 0/]],
 ['dive-fuel-phone','dive_fuel.js',['390','844'],{},[/max\. about 52 m/,/Lake Zurich · up to 136 m/,/Planktothrix/,/Perca fluviatilis/,/"diveDepthChips": \[[^\]]*max 52 m/,/"fuelPins": 1/,/"fuelSheet": "[^"]*Fuel for boats/,/Boat fuel station Bootstankstelle/,/"waterEnge": "Lake Zurich"/,/"waterFrauenbadi": "Limmat"/,/pageerrors 0/],[/always accessible/,/"score": true/,/"underWater": null/]],
 ['dive-fuel-desktop','dive_fuel.js',['1440','900'],{},[/max\. about 52 m/,/Lake Zurich · up to 136 m/,/Perca fluviatilis/,/"fuelPins": 1/,/"fuelSheet": "[^"]*Fuel for boats/,/pageerrors 0/],[/always accessible/,/"underWater": null/]],
 ['about-phone','about.js',['390','844'],{},[/"figures": 3/,/"src": "data:image\/webp;base64/,/"questions": 15/,/"visibleQuestions": 15/,/"photosVisible": 3/,/"overflowX": false/,/"badResponses": \[\]/,/pageerrors 0/],[/"ok": false/,/"alt": false/]],
 ['about-standalone','about_solo.js',[],{},[/"photos":3,"loaded":3,"embedded":3/]],
 ['about-desktop','about.js',['1440','900'],{},[/"figures": 3/,/"src": "data:image\/webp;base64/,/"scrolledTo": true/,/"visibleQuestions": 15/,/"photosVisible": 3/,/"overflowX": false/,/"badResponses": \[\]/,/pageerrors 0/],[/"ok": false/,/"alt": false/]],
 ['align-phone-360','align.js',['360','780'],{},[/"swimAgain"/,/pageerrors 0/],[/misaligned/]],
 ['align-phone-430','align.js',['430','932'],{},[/"swimAgain"/,/pageerrors 0/],[/misaligned/]],
 ['opening-scene-phone','slowboot.js',['http://127.0.0.1:8765/final.html','390','844'],{},[/welcome shown \d+ \| welcome gone \d+ \| start screen visible/]],
 ['opening-scene-desktop','slowboot.js',['http://127.0.0.1:8765/final.html','1440','900'],{},[/welcome shown \d+ \| welcome gone \d+ \| start screen visible/]],
 ['journey-phone-small','journey.js',['375','667'],{},[/"issues": \[\]/,/pageerrors 0/],[],420000],
 ['seo-pages','seo.js',[],{},[/"problems": \[\]/,/"notInSitemap": \[\]/,/"sitemapUrls": 2\d/]],
 ['activities-servers-busy','activities.js',['390','844'],{OVERPASS:'fail'},[/Map data could not be loaded right now — showing verified directory entries only/,/"busyZurich": \{[^}]*Supkultur – SUP station Strandbad Mythenquai/,/map servers are busy right now/,/pageerrors 0/]],
];function prep(){fs.rmSync(SITE,{recursive:true,force:true});fs.mkdirSync(SITE,{recursive:true});
 for(const f of fs.readdirSync(WEB)){const p=path.join(WEB,f);if(fs.statSync(p).isFile())fs.copyFileSync(p,path.join(SITE,f))}
 fs.copyFileSync(path.join(WEB,'index.html'),path.join(SITE,'final.html'));
 const s=fs.readFileSync(path.join(WEB,'index.html'),'utf8');const a="(function(){var B=document.getElementById('dmBoot');if(!B)return;";
 if(!s.includes(a))console.warn('! welcome-failsafe: anchor not found, test will fail until updated');
 fs.writeFileSync(path.join(SITE,'broken_boot.html'),s.replace(a,a+"throw new Error('simulated boot failure');"))}
function run(c){return new Promise(res=>{const [name,script,a,env]=c;const t0=Date.now();let out='';
 const p=spawn(process.execPath,[script,...a],{cwd:__dirname,env:Object.assign({},process.env,env)});p.stdout.on('data',d=>out+=d);p.stderr.on('data',d=>out+=d);
 const k=setTimeout(()=>{p.kill('SIGKILL');out+='\nTIMEOUT'},c[6]||240000);p.on('close',code=>{clearTimeout(k);res({c,out,code,ms:Date.now()-t0})})})}
(async()=>{prep();const srv=await serve(SITE,8765);fs.mkdirSync(path.join(__dirname,'results'),{recursive:true});
 const todo=C.filter(c=>!ONLY||ONLY.includes(c[0]));const results=[];let i=0;
 async function worker(){while(i<todo.length){const c=todo[i++];const r=await run(c);results.push(r);
  const miss=(c[4]||[]).filter(re=>!re.test(r.out)),bad=(c[5]||[]).filter(re=>re.test(r.out));r.pass=!miss.length&&!bad.length&&r.code===0;
  fs.writeFileSync(path.join(__dirname,'results',c[0]+'.txt'),r.out);
  console.log((r.pass?'PASS ':'FAIL ')+c[0].padEnd(24)+(r.ms/1000).toFixed(0).padStart(4)+' s'+(r.pass?'':'  missing: '+miss.map(String).join(' ')+(bad.length?'  forbidden: '+bad.map(String).join(' '):'')+(r.code?'  exit '+r.code:'')))}}
 await Promise.all([...Array(JOBS)].map(worker));srv.close();
 const f=results.filter(r=>!r.pass).length;console.log('\n'+(results.length-f)+' passed, '+f+' failed. Full output per check: tools/tests/results/');process.exit(f?1:0)})();
