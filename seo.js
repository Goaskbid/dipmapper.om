// Static SEO check of the website folder: canonical URLs exist, internal links resolve, JSON-LD parses, sitemap lists real pages, titles/descriptions present.
const fs=require('fs'),path=require('path');const W=path.join(__dirname,'..','..','website');const files=fs.readdirSync(W).filter(f=>f.endsWith('.html'));const have=new Set(fs.readdirSync(W));const bad=[];let pages=0;
for(const f of files){const s=fs.readFileSync(path.join(W,f),'utf8');if(/^(advertising|cookies|disclaimer|imprint|privacy|terms|safety|sources)\.html$/.test(f))continue;pages++;
 const c=(s.match(/rel="canonical" href="https:\/\/dipmapper\.com\/([^"]*)"/)||[])[1];if(c===undefined)bad.push(f+': no canonical');else if(c&&!have.has(c))bad.push(f+': canonical to missing '+c);
 if(!/<title>[^<]{20,}<\/title>/.test(s))bad.push(f+': short/missing title');if(!/name="description" content="[^"]{60,}"/.test(s))bad.push(f+': short/missing description');
 for(const m of s.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)){try{JSON.parse(m[1])}catch(e){bad.push(f+': bad JSON-LD')}}
 for(const m of s.matchAll(/href="\/([^"#?]*)/g)){const p=m[1]||'index.html';if(!have.has(p)&&!/\/$/.test(p))bad.push(f+': broken link /'+p)}
 const og=(s.match(/og:image" content="https:\/\/dipmapper\.com\/([^"]+)"/)||[])[1];if(og&&!have.has(og))bad.push(f+': og:image missing '+og)}
const sm=fs.readFileSync(path.join(W,'sitemap.xml'),'utf8');const locs=[...sm.matchAll(/<loc>https:\/\/dipmapper\.com\/([^<]*)<\/loc>/g)].map(m=>m[1]);for(const l of locs)if(l&&!have.has(l))bad.push('sitemap: missing '+l);
const notInSm=files.filter(f=>f!=='index.html'&&!locs.includes(f));
console.log(JSON.stringify({pages,sitemapUrls:locs.length,notInSitemap:notInSm,problems:bad},null,1));
