// A realistic Wikimedia "photo world" for audits: real-world latency, sparse results, irrelevant files,
// and Wikimedia-style rate limiting (HTTP 429 when too many requests are in flight).
// It answers Commons geosearch / search, Wikipedia geosearch / pageimages, and Wikidata P18.
const PAGES=[ // real Wikipedia articles near the Zürich lake basin, real coordinates
 ['Lake Zurich','lake in Switzerland',47.2869,8.6383],['Seebad Enge','lake bath in Zürich',47.3592,8.5367],['Mythenquai','street in Zürich',47.3547,8.5364],
 ['Zürichhorn','park in Zürich',47.3536,8.5528],['Quaibrücke','bridge in Zürich',47.3665,8.5416],['Bürkliplatz','square in Zürich',47.3664,8.5404],
 ['Utoquai','promenade in Zürich',47.3622,8.5468],['Strandbad Mythenquai','lido in Zürich',47.3478,8.5355],['Rote Fabrik','cultural centre in Zürich',47.3430,8.5351],
 ['Zürich-Wollishofen','quarter of Zürich',47.3434,8.5302],['Limmat','river in Switzerland',47.3780,8.5390],['Arboretum Zürich','park in Zürich',47.3606,8.5378],
 ['Zürich Opera House','opera house',47.3650,8.5470],['Zürich Hauptbahnhof','railway station in Switzerland',47.378,8.540]];
const near=(a,b,c,d)=>Math.hypot((d-b)*Math.cos(a*Math.PI/180),c-a)*111;
const H=s=>{let h=7;for(const ch of String(s))h=(h*31+ch.charCodeAt(0))>>>0;return h};
module.exports=function(opts){opts=opts||{};let inflight=0;const stats={req:0,r429:0};const LIMIT=opts.limit||8;
 function img(title,lat,lon,w){const f=title.replace(/ /g,'_');return {title:'File:'+title,coordinates:lat!=null?[{lat,lon}]:undefined,imageinfo:[{url:'https://upload.wikimedia.org/wikipedia/commons/a/ab/'+f,thumburl:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/'+f+'/640px-'+f,mime:'image/jpeg',width:w||3000,height:2000,extmetadata:{DateTimeOriginal:{value:'2019-07-02'},Artist:{value:'Photographer'},LicenseShortName:{value:'CC BY-SA 4.0'}}}]}}
 function commons(u){const q=decodeURIComponent(u);if(q.includes('geosearch')){const m=q.match(/ggscoord=([-\d.]+)\|([-\d.]+)/);const lat=+m[1],lon=+m[2];const h=H(lat.toFixed(3)+lon.toFixed(3));
   // ~40% of points have useful photos within 700 m; others only irrelevant ones (trams, buildings, maps)
   const P={};if(h%10<4){P[1]=img('Lakeshore view near '+lat.toFixed(3)+' Zürichsee.jpg',lat+0.001,lon);P[2]=img('Boats at the pier '+lon.toFixed(3)+'.jpg',lat-0.0012,lon+0.001)}
   P[3]=img('Tram 7 Zürich '+h%97+'.jpg',lat+0.002,lon);P[4]=img('Map of district '+h%13+'.png',lat,lon);return {query:{pages:P}}}
  if(q.includes('generator=search')){const h=H(q);if(h%10<2)return {query:{pages:{1:img('Search result photo '+h%1000+'.jpg',null,null)}}};return {query:{pages:{}}}}
  return {query:{pages:{}}}}
 function wiki(u){const q=decodeURIComponent(u);if(q.includes('geosearch')){const m=q.match(/ggscoord=([-\d.]+)\|([-\d.]+)/);const lat=+m[1],lon=+m[2];const P={};
   PAGES.forEach((p,i)=>{if(near(lat,lon,p[2],p[3])<=5)P[i+1]={pageid:i+1,title:p[0],description:p[1],coordinates:[{lat:p[2],lon:p[3]}],fullurl:'https://en.wikipedia.org/wiki/'+p[0].replace(/ /g,'_'),extract:p[0]+' is a place in Zürich.',thumbnail:{source:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/'+p[0].replace(/ /g,'_')+'.jpg/1000px-'+p[0].replace(/ /g,'_')+'.jpg',width:1000,height:667}}});return {query:{pages:P}}}
  if(q.includes('generator=search')){const t=((q.match(/gsrsearch=([^&]+)/)||[])[1]||'').toLowerCase();const P={};PAGES.forEach((p,i)=>{const n=p[0].toLowerCase();if(t.includes(n)||n.includes(t.split(' ')[0])&&t.split(' ')[0].length>4)P[i+1]={title:p[0],description:p[1],coordinates:[{lat:p[2],lon:p[3]}],thumbnail:{source:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/'+p[0].replace(/ /g,'_')+'_lead.jpg/1200px-x.jpg',width:1200,height:800}}});return {query:{pages:P}}}
  if(q.includes('prop=pageimages')){const t=(q.match(/titles=([^&]+)/)||[])[1]||'X';return {query:{pages:{9:{title:t,thumbnail:{source:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/'+t.replace(/ /g,'_')+'_lead.jpg/1200px-lead.jpg',width:1200,height:800}}}}}}
  if(q.includes('prop=extracts')||q.includes('extracts')){return {query:{pages:{1:{title:'Lake Zurich',extract:'Lake Zurich is a lake in Switzerland.'}}}}}
  return {query:{pages:{}}}}
 function handle(u,J,R){const c=u.includes('commons.wikimedia.org/w/api.php'),w=u.includes('wikipedia.org/w/api.php'),d=u.includes('wikidata.org/w/api.php')&&u.includes('P18');if(!c&&!w&&!d)return false;
  stats.req++;const kk=(c?(u.includes('iiurlwidth=960')?'act-commons:':'swim-commons:'):d?'wikidata:':'wiki:')+((u.match(/generator=(\w+)/)||u.match(/prop=(\w+)/)||[])[1]||'x');stats.by=stats.by||{};stats.by[kk]=(stats.by[kk]||0)+1;inflight++;const lat=c?(u.includes('generator=search')?1500+H(u)%2000:900+H(u)%1700):(500+H(u)%700);
  if(inflight>LIMIT){stats.r429++;setTimeout(()=>{inflight--;R({status:429,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'{"error":"too many requests"}'}).catch(()=>{})},300);return true}
  setTimeout(()=>{inflight--;J(c?commons(u):d?{claims:{P18:[{mainsnak:{datavalue:{value:'Wikidata photo.jpg'}}}]}}:wiki(u),1)},lat);return true}
 handle.stats=stats;return handle};
