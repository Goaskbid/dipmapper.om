import fs from 'node:fs';
const html=fs.readFileSync('index.html','utf8');
const checks=['photoDeck','photoConfidence','PHOTO_BLOCK','data-photo','lightbox','data-open','SEARCH_VISIBLE_MS=10000'];
for(const c of checks){ if(!html.includes(c)){ console.error('Missing media/source check',c); process.exit(1); } }
console.log('Media/source audit passed for v20.9.4.');
