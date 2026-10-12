 /* ================= v23.5 photos: a polite Wikimedia queue, per-place candidates, no empty caching ================= */
 /* Root causes fixed (see report): 1) up to 70 parallel Wikimedia calls per list -> rate limits (HTTP 429) and timeouts;
    2) empty results were cached for 7 days; 3) only the first 14 cards ever asked for photos; 4) the 5 shared area photos
    could be used by one card each, so most cards had none; 5) the swim photo prefetch kept running in the background. */
 var WMQ=[],WMIN=0,WMMAX=6,WMSTAT={req:0,r429:0,fail:0};
 function wmSort(){WMQ.sort(function(a,b){return a.prio-b.prio||a.seq-b.seq})}
 var WMSEQ=0;
 function wmFetch(url,ms,prio){return new Promise(function(res,rej){WMQ.push({url:url,ms:ms||9000,prio:prio==null?50:prio,res:res,rej:rej,tries:0,seq:WMSEQ++});wmSort();wmPump()})}
 function wmPump(){while(WMIN<WMMAX&&WMQ.length){var j=WMQ.shift();WMIN++;wmRun(j)}}
 function wmRun(j){var ac=typeof AbortController!=='undefined'?new AbortController():null,t=setTimeout(function(){try{ac&&ac.abort()}catch(e){}},j.ms);WMSTAT.req++;
  fetch(j.url,ac?{signal:ac.signal}:{}).then(function(r){if(r.status===429||r.status===503){WMSTAT.r429++;var e=new Error('busy');e.retry=1;throw e}if(!r.ok)throw new Error('http '+r.status);return r.json()})
   .then(function(x){clearTimeout(t);WMIN--;j.res(x);wmPump()},function(e){clearTimeout(t);WMIN--;if(e&&e.retry&&j.tries<3){j.tries++;setTimeout(function(){WMQ.push(j);wmSort();wmPump()},600*j.tries+Math.random()*700)}else{WMSTAT.fail++;j.rej(e)}wmPump()})}
 /* the swim list keeps fetching photos in the background; pause that while an activity is shown */
 /* (the swim engine's own prefetch is wrapped in the build, see build.py "swim prefetch pauses in activity mode") */
 var ACT_PH_BLOCK=/\b(map|karte|plan|logo|wappen|coat[ _]of[ _]arms|flag|diagram|schema|sketch|drawing|scan|document|poster|sign|schild|tram|bus|station|bahnhof|portrait|interior|svg|aerial[ _]view[ _]of[ _]the[ _]city|traffic|car[ _]park|parking)\b/i;
 var ACT_KW={paddle:/sup|paddle|paddel|kayak|kajak|kanu|canoe|ruder|row|pedalo|tretboot|boat|boot|lake|see|shore|ufer|quai|steg|pier|beach|strand|bad/i,
  dive:/dive|diver|tauch|underwater|unterwasser|plong|snorkel|reef|wreck|wrack|lake|see|shore|ufer|steg|pier/i,
  sail:/sail|segel|yacht|regatta|kite|wind|surf|marina|hafen|harbou?r|boat|boot|lake|see/i,
  boat:/boat|boot|ship|schiff|ferry|steamer|dampf|cruise|marina|hafen|harbou?r|pier|steg|landing|lake|see/i,
  raft:/raft|canyon|river|fluss|rapid|gorge|schlucht|kayak|canoe|whitewater|wildwasser/i,
  special:/wave|welle|surf|bath|bad|pool|river|fluss|sauna|thermal|spa|lake|see|harbou?r|hafen|sea|beach/i,
  ice:/ice|eis|frozen|gefroren|skat|winter|lake|see|pond|weiher/i};
 function kwFor(){return ACT_KW[A.mode]||KW}
 function wmFile(u){return fileOf(u)||String(u).split('/').pop()}
 function parseCommons(j,vlat,vlon,vr){var out=[];Object.values((j&&j.query&&j.query.pages)||{}).forEach(function(p){var ii=p.imageinfo&&p.imageinfo[0];if(!ii)return;var u=ii.thumburl||ii.url;if(!u||!/^image\/(jpeg|png|webp)$/i.test(ii.mime||''))return;if(ii.width&&ii.width<600)return;
   var em=ii.extmetadata||{},dt=String((em.DateTimeOriginal&&em.DateTimeOriginal.value)||(em.DateTime&&em.DateTime.value)||''),ym=dt.match(/(1[6-9]\d\d|20\d\d)/);if(ym&&+ym[1]<2004)return;
   var title=String(p.title||'').replace(/^File:/,'');if(ACT_PH_BLOCK.test(title.replace(/_/g,' ')))return;if(typeof PHOTO_HIST!=='undefined'&&PHOTO_HIST.test(title))return;
   var cats=String((em.Categories&&em.Categories.value)||'');if(typeof PHOTO_CAT_BLOCK!=='undefined'&&cats&&PHOTO_CAT_BLOCK.test(cats))return;
   var co=p.coordinates&&p.coordinates[0],d=co&&vlat!=null?D(vlat,vlon,co.lat,co.lon):null;if(d!=null&&d>vr)return;out.push({u:u,t:title,d:d})});return out}
 var CB='https://commons.wikimedia.org/w/api.php?origin=*&format=json&prop=imageinfo|coordinates&iiprop=url|mime|size|extmetadata&iiurlwidth=960';
 function cGeo(lat,lon,r,prio){return wmFetch(CB+'&action=query&generator=geosearch&ggsnamespace=6&ggslimit=24&ggsradius='+r+'&ggscoord='+lat.toFixed(5)+'|'+lon.toFixed(5),9000,prio).then(function(j){return parseCommons(j,lat,lon,r/1000+0.15)})}
 function cSearch(q,lat,lon,prio){return wmFetch(CB+'&action=query&generator=search&gsrnamespace=6&gsrlimit=10&gsrsearch='+encodeURIComponent(q+' filetype:bitmap'),9000,prio).then(function(j){return parseCommons(j,lat,lon,2.5)})}
 /* area articles: one Wikipedia geosearch per search area, with coordinates -> nearest article photo per place */
 var AREA={},AREAP={};
 function areaKey(lat,lon){return (Math.round(lat*20)/20).toFixed(2)+','+(Math.round(lon*20)/20).toFixed(2)}
 function areaLoad(lat,lon,prio){var k=areaKey(lat,lon);if(AREA[k])return AREA[k];
  var qa=Math.round(lat*20)/20,qo=Math.round(lon*20)/20;var p=wmFetch('https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=geosearch&ggscoord='+qa.toFixed(4)+'|'+qo.toFixed(4)+'&ggsradius=7000&ggslimit=40&prop=pageimages|description|coordinates&piprop=thumbnail&pithumbsize=1000',9000,prio==null?3:prio)
   .then(function(j){AREAP[k]=Object.values((j&&j.query&&j.query.pages)||{});return AREAP[k]}).catch(function(){delete AREA[k];return []});AREA[k]=p;return p}
 function areaUsable(x){return x.thumbnail&&x.thumbnail.source&&x.thumbnail.width>=600&&!/\.svg|logo|map|wappen|coat|flag|karte/i.test(x.thumbnail.source)&&!/\b(person|politician|footballer|singer|actor|company|railway station|school|church|museum|hotel|bank|band|airport|hospital|prison|cemetery|stadium)\b/i.test(x.description||'')}
 function areaWater(x){return /lake|see|lac|lago|sea|bay|beach|strand|harbou?r|hafen|river|fluss|island|peninsula|park|promenade|quai|marina|bath|bad|lido|pool|shore|pier|canal|waterfront|gorge|falls/i.test(x.title+' '+(x.description||''))}
 function areaPhotos(lat,lon){return areaLoad(lat,lon).then(function(P){return P.filter(areaUsable).sort(function(a,b){return (areaWater(b)?1:0)-(areaWater(a)?1:0)}).slice(0,6).map(function(x){return {u:x.thumbnail.source,t:x.title}})})}
 function areaPages(lat,lon){return areaLoad(lat,lon)}
 function nearArticles(v,P){return P.filter(areaUsable).map(function(x){var co=x.coordinates&&x.coordinates[0];return {x:x,d:co?D(v.lat,v.lon,co.lat,co.lon):99}}).filter(function(o){return o.d<=2.5}).sort(function(a,b){return a.d-b.d})}
 /* persistent cache only for real results; misses are retried after 10 minutes */
 var PH=lsGet('dm_actph_v3')||{},PHQ={},PHMISS={},PHUSED={},PHSHARE={};
 function phSave(){try{var keys=Object.keys(PH);if(keys.length>260)keys.sort(function(a,b){return PH[a].t-PH[b].t}).slice(0,80).forEach(function(k){delete PH[k]});lsSet('dm_actph_v3',PH)}catch(e){}}
 function photosFor(v,prio){var c=PH[v.id];if(c&&c.l&&c.l.length&&Date.now()-c.t<14*864e5)return Promise.resolve(c.l);if(PHQ[v.id]){if(prio!=null&&prio<PHQ[v.id].prio)PHQ[v.id].bump(prio);return PHQ[v.id]}
  if(PHMISS[v.id]&&Date.now()-PHMISS[v.id]<6e5)return Promise.resolve([]);
  var pr=prio==null?20:prio,kw=kwFor(),B={own:[],wiki:[],nearArt:[],near:[],name:[],area:[]};
  if(v.img)B.own.push({u:v.img,how:'own'});
  var jobs=[];
  if(v.wiki){var tt=decodeURIComponent(String(v.wiki).split('/wiki/')[1]||'');if(tt)jobs.push(wmFetch('https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageimages&piprop=thumbnail&pithumbsize=1200&titles='+encodeURIComponent(tt),9000,pr).then(function(j){var pg=Object.values((j&&j.query&&j.query.pages)||{})[0];if(pg&&pg.thumbnail)B.wiki.push({u:pg.thumbnail.source,how:'wiki',t:pg.title})}).catch(function(){}))}
  if(v.wikidata&&/^Q\d+$/.test(v.wikidata))jobs.push(wmFetch('https://www.wikidata.org/w/api.php?action=wbgetclaims&format=json&origin=*&property=P18&entity='+v.wikidata,9000,pr).then(function(j){var c=j&&j.claims&&j.claims.P18&&j.claims.P18[0];var f=c&&c.mainsnak&&c.mainsnak.datavalue&&c.mainsnak.datavalue.value;if(f)B.own.push({u:'https://commons.wikimedia.org/wiki/Special:FilePath/'+encodeURIComponent(String(f).replace(/ /g,'_'))+'?width=960',how:'own',t:String(f)})}).catch(function(){}));
  jobs.push(areaLoad(v.lat,v.lon).then(function(P){nearArticles(v,P).forEach(function(o){var it={u:o.x.thumbnail.source,how:o.d<=0.5?'nearArt':'area',t:o.x.title,d:o.d};(o.d<=0.5?B.nearArt:B.area).push(it)})}).catch(function(){}));
  var r=/^(dive|snorkel|wreck)$/.test(primaryAct(v))?500:/spot|launch|beach/.test(v.type)?700:600;
  jobs.push(cGeo(v.lat,v.lon,r,pr).then(function(L){L.sort(function(a,b){return ((kw.test(b.t)?1:0)-(kw.test(a.t)?1:0))||((a.d||0)-(b.d||0))});L.forEach(function(x){B.near.push({u:x.u,how:'near',kw:kw.test(x.t),t:x.t})})}).catch(function(){}));
  var nm=String(v.name).split(' – ')[0];
  var p=Promise.all(jobs).then(function(){
   var need=B.own.length+B.wiki.length+B.nearArt.length+B.near.filter(function(x){return x.kw}).length;
   if(need>=2||v.generic||!toks(nm).length)return;var town=String(v.addr||placeLabel()||'').split(',').slice(-1)[0].replace(/\d{4,5}/,'').trim();
   /* a Wikipedia article about the place itself (baths, waves, famous spots): accepted only if it lies within 3 km */
   var wq=B.wiki.length?Promise.resolve():wmFetch('https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrlimit=3&gsrsearch='+encodeURIComponent(nm)+'&prop=pageimages|coordinates&piprop=thumbnail&pithumbsize=1200',9000,pr).then(function(j){Object.values((j&&j.query&&j.query.pages)||{}).forEach(function(pg){var co=pg.coordinates&&pg.coordinates[0];if(!pg.thumbnail||!co||D(v.lat,v.lon,co.lat,co.lon)>3||!areaUsable(pg))return;if(!B.wiki.some(function(x){return x.t===pg.title}))B.wiki.push({u:pg.thumbnail.source,how:'wiki',t:pg.title})})}).catch(function(){});
   return wq.then(function(){if(B.own.length+B.wiki.length+B.nearArt.length>=2)return;return cSearch(nm+(town?' '+town:''),v.lat,v.lon,pr+1).then(function(L){var t=toks(nm);L.forEach(function(x){var n=String(x.t).toLowerCase();if(t.some(function(k){return k.length>3&&n.indexOf(k)>=0}))B.name.push({u:x.u,how:'name',t:x.t})})}).catch(function(){})})})
   .then(function(){var near=B.near.filter(function(x){return x.kw}).concat(B.near.filter(function(x){return !x.kw}));
    var all=B.wiki.concat(B.own,B.name,B.nearArt,near.slice(0,5),B.area.slice(0,3)),seen={},l=[];
    all.forEach(function(x){var f=wmFile(x.u);if(!x.u||seen[x.u]||seen[f]||ACT_PH_BLOCK.test(String(f).replace(/_/g,' ')))return;seen[x.u]=1;seen[f]=1;l.push(x)});l=l.slice(0,9);
    delete PHQ[v.id];if(l.length){PH[v.id]={t:Date.now(),l:l};phSave()}else PHMISS[v.id]=Date.now();return l});
  p.prio=pr;p.bump=function(n){p.prio=n;WMQ.forEach(function(j){if(j.prio>n&&j.url.indexOf(v.lat.toFixed(4))>=0)j.prio=n});wmSort()};PHQ[v.id]=p;return p}
 /* one photo per card: the place's own first; a shared area photo may appear on at most two cards */
 function thumbPhoto(v){var c=PH[v.id];if(!c||!c.l||!c.l.length)return null;var cur=PHUSED['#'+v.id];if(cur){for(var i=0;i<c.l.length;i++)if(c.l[i].u===cur)return c.l[i]}
  for(var i2=0;i2<c.l.length;i2++){var u=c.l[i2].u;if(c.l[i2].how==='area')continue;if(!PHUSED[u]||PHUSED[u]===v.id){PHUSED[u]=v.id;PHUSED['#'+v.id]=u;return c.l[i2]}}
  for(var i3=0;i3<c.l.length;i3++){var u3=c.l[i3].u;var n=PHSHARE[u3]||[];if(n.indexOf(v.id)>=0||n.length<2){if(n.indexOf(v.id)<0)n.push(v.id);PHSHARE[u3]=n;PHUSED['#'+v.id]=u3;return c.l[i3]}}
  return null}
 function setThumb(el,v){var c=PH[v.id];if(!el||!c||!c.l)return;var tried=0;var go=function(){var p=thumbPhoto(v);if(!p)return;var old=el.querySelector('img');if(old&&old.getAttribute('src')===p.u)return;var im=new Image();im.alt='';im.decoding='async';
   im.onload=function(){var o=el.querySelector('img');if(o)o.remove();el.classList.add('hasPh');el.appendChild(im)};
   im.onerror=function(){/* broken file: drop it and try the next candidate */c.l=c.l.filter(function(x){return x.u!==p.u});delete PHUSED[p.u];delete PHUSED['#'+v.id];if(++tried<4)go()};im.src=p.u};go()}
 /* cards ask for photos when they come near the screen; the top of the list goes first */
 var PHIO=null;
 function loadPhotos(L){var byId={};L.forEach(function(v,i){byId[v.id]={v:v,i:i}});
  var ask=function(el){var o=byId[el.getAttribute('data-ph')];if(!o)return;var v=o.v;if(PH[v.id]&&PH[v.id].l&&PH[v.id].l.length){setThumb(el,v);return}photosFor(v,10+o.i).then(function(){var el2=document.querySelector('.dmAth[data-ph="'+(window.CSS&&CSS.escape?CSS.escape(v.id):v.id)+'"]');setThumb(el2,v);var bp=document.querySelector('.dmBpick[data-aid="'+(window.CSS&&CSS.escape?CSS.escape(v.id):v.id)+'"] .dmBimg');if(bp&&!bp.querySelector('img')){var p=thumbPhoto(v);if(p)bp.insertAdjacentHTML('afterbegin','<img src="'+E(p.u)+'" alt="" loading="lazy" onerror="this.remove()">')}})};
  if(PHIO)PHIO.disconnect();
  var els=[].slice.call(document.querySelectorAll('#dmActList .dmAth[data-ph]'));
  if(typeof IntersectionObserver==='function'){PHIO=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){PHIO.unobserve(e.target);ask(e.target)}})},{rootMargin:'900px 0px'});els.forEach(function(el){PHIO.observe(el)})}
  else els.forEach(ask);
  /* the first eight always load, even before they scroll into view */
  els.slice(0,8).forEach(function(el){ask(el)})}
