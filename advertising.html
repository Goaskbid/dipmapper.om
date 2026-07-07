import fs from 'node:fs';import path from 'node:path';
const files=fs.readdirSync('.').filter(f=>f.endsWith('.html'));let ok=true;
for(const f of files){const h=fs.readFileSync(f,'utf8');for(const m of h.matchAll(/(?:href|src)=['"]([^'"]+)['"]/g)){const u=m[1];if(!u||u==='#'||u.startsWith('javascript:')){console.error('Bad link',f,u);ok=false;continue}if(u.includes('${')||u.includes('`'))continue;if(/^(https?:|mailto:|tel:|data:|blob:)/.test(u))continue;if(u.includes('#')){const [local]=u.split('#');if(!local)continue}const target=u.split('#')[0];if(target&&!fs.existsSync(path.join('.',target))){console.error('Missing local link',f,u);ok=false}}}
if(!ok)process.exit(1);console.log('Link check passed across '+files.length+' HTML files.');
