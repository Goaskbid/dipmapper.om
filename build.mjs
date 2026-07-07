import fs from 'node:fs';import path from 'node:path';
const include=new Set(['index.html','manifest.webmanifest','robots.txt','ads.txt','sw.js','privacy.html','cookies.html','terms.html','disclaimer.html','safety.html','advertising.html','imprint.html','sources.html','CNAME','sitemap.xml','README.md','DEPLOYMENT_NOTES.md','EXPORT_STATUS.txt','VERSION.json','GITHUB_DUMMY_DEPLOYMENT_GUIDE.md','GITHUB_DEPLOYMENT_FOR_DUMMIES.md','package.json']);
fs.rmSync('dist',{recursive:true,force:true});fs.mkdirSync('dist',{recursive:true});
for(const f of fs.readdirSync('.')){if(include.has(f)&&fs.statSync(f).isFile())fs.copyFileSync(f,path.join('dist',f));}
if(fs.existsSync('assets'))fs.cpSync('assets','dist/assets',{recursive:true});
console.log('Built dist/ for GitHub Pages.');
