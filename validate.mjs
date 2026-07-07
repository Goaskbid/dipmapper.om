import fs from 'node:fs';
const html=fs.readFileSync('index.html','utf8');
const manifest=fs.readFileSync('manifest.webmanifest','utf8');
const ver='v20.9.4';
const required=[ver,'data-version="'+ver+'"','dipmapper-logo-transparent','data-open','openPlace','serviceWorker','dm_seen','photoDeck','lightbox','SEARCH_VISIBLE_MS=10000','ca-pub-2870312071451207','google-adsense-account','apple-touch-icon','renderGoldenHour','dmWaterTemp','dmOpenStatus'];
for(const x of required){ if(!html.includes(x)){ console.error('Missing required marker:',x); process.exit(1); } }
for(const bad of ['OpenWaterAtlas','OPENWATERATLAS','static build','configured for launch']){ if(html.includes(bad)){ console.error('Banned text present in index.html:',bad); process.exit(1); } }
if(!manifest.includes('"version": "20.9.4"')){ console.error('manifest.webmanifest version is not 20.8.1'); process.exit(1); }
if(html.length>2200000){ console.error('index.html too large ('+html.length+' bytes)'); process.exit(1); }
console.log('DipMapper.com '+ver+' validation passed. index.html '+(html.length/1024).toFixed(1)+' KB.');
