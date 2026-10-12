// Minimal static server for the test copy of the site (tools/tests/_site) on http://127.0.0.1:8765/
const http=require('http'),fs=require('fs'),path=require('path');
const T={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.webp':'image/webp','.txt':'text/plain','.xml':'application/xml'};
module.exports=function(root,port){return new Promise(res=>{const s=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';
  const f=path.join(root,path.normalize(u).replace(/^(\.\.[\/\\])+/,''));fs.readFile(f,(e,b)=>{if(e){r.writeHead(404);return r.end('not found')}r.writeHead(200,{'Content-Type':T[path.extname(f)]||'application/octet-stream'});r.end(b)})});
  s.listen(port,'127.0.0.1',()=>res(s))})};
if(require.main===module)module.exports(path.join(__dirname,'..','_site'),+(process.argv[2]||8765)).then(()=>console.log('serving tools/tests/_site on http://127.0.0.1:'+(process.argv[2]||8765)));
