/*! DipMapper (c) 2026 Torsten Sauter. All rights reserved. dipmapper.com/terms */
/* Live OpenStreetMap samples near a point or in a map view (beach bars, fish and waterside dining, piers). Bounded samples, not complete inventories;
   a mapped feature is not a verified entrance or boarding point. Review fixes from the 23.72 audit included. Data (c) OpenStreetMap contributors, ODbL. */
(function (W) {
  'use strict';
  var D=document,R=Math.PI/180,TTL=15*60*1000,MAX_CACHE=32;
  var MIR=['https://overpass.kumi.systems/api/interpreter','https://overpass.private.coffee/api/interpreter','https://overpass-api.de/api/interpreter'];
  var cache=new Map(),pending=new Map(),states=new WeakMap(),observed=new WeakSet();
  function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function ic(n){return '<svg class="ic" aria-hidden="true"><use href="/icons.svg#i-'+n+'"/></svg>'}
  function number(n){return typeof n==='number'&&Number.isFinite(n)}
  function point(la,lo){return number(la)&&number(lo)&&Math.abs(la)<=90&&Math.abs(lo)<=180}
  function km(a,b,c,d){var x=Math.sin((c-a)*R/2),y=Math.sin((d-b)*R/2);return 12742*Math.asin(Math.sqrt(Math.min(1,Math.max(0,x*x+Math.cos(a*R)*Math.cos(c*R)*y*y))))}
  var F = {
    bars: function (A) { return 'nwr' + A + '[amenity~"^(bar|cafe|restaurant|pub|biergarten)$"][name~"beach|plage|strand|playa|spiaggia|praia|lido|chiringuito|plaj|paralia|seebad|badi|strandbad|beach club",i];nwr' + A + '[leisure=beach_resort][name];'; },
    piers: function (A) { return 'nwr' + A + '[amenity=ferry_terminal];nwr' + A + '[man_made=pier][name];nwr' + A + '[leisure=marina][name];'; },
    fish: function (A) { return 'nwr' + A + '[amenity~"^(restaurant|fast_food)$"][cuisine~"seafood|fish|oyster",i][name];'; },
    water: function (A) { return '(way' + A + '[natural=coastline];way' + A + '[natural=beach];way' + A + '[natural=water];rel' + A + '[natural=water];)->.w;(way.w;way(r.w)' + A + ';)->.w;nwr(around.w:60)' + A + '[amenity~"^(restaurant|bar|cafe)$"][name];'; }
  };
  var RAD = { bars: 15000, piers: 8000, fish: 8000, water: 3000 };
  function around(k, la, lo) { return '(around:' + RAD[k] + ',' + la + ',' + lo + ')'; }
  var Q = {
    bars: function (la, lo) { return '[out:json][timeout:20];(' + F.bars(around('bars', la, lo)) + ');out center 40;'; },
    fish: function (la, lo) { return '[out:json][timeout:15];(' + F.fish(around('fish', la, lo)) + ');out center 40;'; },
    piers: function (la, lo) { return '[out:json][timeout:20];(' + F.piers(around('piers', la, lo)) + ');out center 40;'; },
    food: function (la, lo) { return '[out:json][timeout:25];(' + F.fish(around('fish', la, lo)) + ')->.f;' + F.water(around('water', la, lo)).replace(/;$/, '->.v;') + '(.f;.v;);out center 60;'; }
  };

  function label(t,k){
    if(t.amenity==='ferry_terminal')return 'Ferry terminal';
    if(t.leisure==='marina')return 'Marina';
    if(t.man_made==='pier')return 'Pier';
    if(t.leisure==='beach_resort')return 'Beach club';
    if(k==='fish'||(k==='food'&&/seafood|fish|oyster/i.test(t.cuisine||'')))return /oyster/i.test(t.cuisine)?'Oyster bar':/fish_and_chips/i.test(t.cuisine)?'Fish & chips':'Seafood restaurant';
    if(k==='water'||k==='food')return ({bar:'Bar',cafe:'Café',restaurant:'Restaurant'})[t.amenity]?({bar:'Bar',cafe:'Café',restaurant:'Restaurant'})[t.amenity]+' by the water':'By the water';
    return ({bar:'Beach bar',cafe:'Beach café',restaurant:'Beach restaurant',pub:'Pub',biergarten:'Beer garden'})[t.amenity]||'Beach bar';
  }
  function items(j,k){
    if(!j||!Array.isArray(j.elements)||j.remark)throw Error('OSM query incomplete or invalid');
    var seen=new Set(),out=[];
    j.elements.forEach(function(x){
      if(!x||!['node','way','relation'].includes(x.type)||!Number.isSafeInteger(x.id)||x.id<=0)return;
      var p=x.center||x,t=x.tags||{},id=x.type+'/'+x.id;
      if(!point(p.lat,p.lon)||typeof t.name!=='string'||!t.name.trim()||seen.has(id))return;
      seen.add(id);out.push({n:t.name.trim().slice(0,300),t:label(t,k),la:p.lat,lo:p.lon,id:id,o:typeof t.opening_hours==='string'?t.opening_hours.slice(0,200):''});
    });return out;
  }
  function budget(){try{var k='dm_osm_budget',n=Date.now(),b=JSON.parse(localStorage.getItem(k)||'[]').filter(function(t){return typeof t==='number'&&n-t<36e5&&t<=n});if(b.length>=40)return false;b.push(n);localStorage.setItem(k,JSON.stringify(b));return true}catch(e){return true}}
  async function request(q,i){
    i=i||0;if(!i&&!budget())throw Error('Hourly lookup limit reached');var ctl=W.AbortController?new AbortController():null;
    var timer=setTimeout(function(){if(ctl)ctl.abort()},30000);
    try{
      var r=await fetch(MIR[i],{method:'POST',body:'data='+encodeURIComponent(q),headers:{'Content-Type':'application/x-www-form-urlencoded'},credentials:'omit',signal:ctl?ctl.signal:undefined});
      if(!r.ok){var e=Error('OSM service unavailable ('+r.status+')');e.retryable=r.status>=500;throw e}
      var j=await r.json();if(!j||!Array.isArray(j.elements)||j.remark)throw Error('Incomplete OSM response');return j;
    }catch(e){
      // Never rotate providers to circumvent a 429 or a query/runtime rejection.
      if(i+1<MIR.length&&(e.name==='AbortError'||e instanceof TypeError||e.retryable))return request(q,i+1);
      throw e;
    }finally{clearTimeout(timer)}
  }
  function get(q){
    var c=cache.get(q),now=Date.now();if(c&&c.at<=now&&now-c.at<TTL)return Promise.resolve(c.value);
    if(pending.has(q))return pending.get(q);
    var p=request(q).then(function(j){cache.delete(q);cache.set(q,{at:Date.now(),value:j});while(cache.size>MAX_CACHE)cache.delete(cache.keys().next().value);return j}).finally(function(){pending.delete(q)});
    pending.set(q,p);return p;
  }
  /* opening_hours: the common simple forms only ("Mo-Su 10:00-23:00", "Mo-Fr 11:00-22:00; Sa,Su 10:00-01:00", "24/7"); anything else → no claim */
  var DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  function nowIn(tz) { try { var p = new Intl.DateTimeFormat('en-GB', { timeZone: tz || undefined, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date()), o = {}; p.forEach(function (x) { o[x.type] = x.value; }); return { d: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(o.weekday), m: (+o.hour) * 60 + (+o.minute) }; } catch (e) { var n = new Date(); return { d: (n.getDay() + 6) % 7, m: n.getHours() * 60 + n.getMinutes() }; } }
  function parseOH(s) {
    s = String(s || '').trim(); if (!s) return null; if (s === '24/7') return { all: 1 };
    var wk = [null, null, null, null, null, null, null], ok = true;
    s.split(';').forEach(function (r) {
      r = r.trim(); if (!r || !ok) return; if (/^PH\b/.test(r)) return;
      var m = r.match(/^((?:(?:Mo|Tu|We|Th|Fr|Sa|Su)(?:-(?:Mo|Tu|We|Th|Fr|Sa|Su))?)(?:,(?:Mo|Tu|We|Th|Fr|Sa|Su)(?:-(?:Mo|Tu|We|Th|Fr|Sa|Su))?)*)?\s*(.*)$/);
      if (!m) { ok = false; return; }
      var ds = [], spec = m[1] || 'Mo-Su', tt = m[2].trim();
      spec.split(',').forEach(function (p) { var a = p.split('-'), i = DAYS.indexOf(a[0]), j = DAYS.indexOf(a[1] || a[0]); for (var k = i; ; k = (k + 1) % 7) { ds.push(k); if (k === j) break; } });
      var iv = [];
      if (tt === 'off' || tt === 'closed') iv = [];
      else { tt.split(',').forEach(function (x) { var q = x.trim().match(/^(\d{1,2}):(\d\d)-(\d{1,2}):(\d\d)\+?$/); if (!q) { ok = false; return; } var a = q[1] * 60 + +q[2], b = q[3] * 60 + +q[4]; if (b <= a) b += 1440; iv.push([a, b]); }); }
      ds.forEach(function (d) { wk[d] = iv; });
    });
    return ok && wk.some(function (x) { return x !== null; }) ? { wk: wk.map(function (x) { return x || []; }) } : null;
  }
  function hm(m) { m = m % 1440; return ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + m % 60).slice(-2); }
  function openNow(s, tz) {
    var o = parseOH(s); if (!o) return null; if (o.all) return { open: true, txt: '<b class="oOpen">open 24/7</b>' };
    var n = nowIn(tz), prev = (n.d + 6) % 7, iv = o.wk[n.d], pv = o.wk[prev];
    if (iv === null && pv === null) return null;
    var k, x;
    if (pv) for (k = 0; k < pv.length; k++) { x = pv[k]; if (x[1] > 1440 && n.m < x[1] - 1440) return { open: true, txt: '<b class="oOpen">open now</b> until ' + hm(x[1]) }; }
    if (iv) for (k = 0; k < iv.length; k++) { x = iv[k]; if (n.m >= x[0] && n.m < x[1]) return { open: true, txt: '<b class="oOpen">open now</b> until ' + hm(x[1]) }; }
    if (iv) for (k = 0; k < iv.length; k++) { x = iv[k]; if (n.m < x[0]) return { open: false, txt: '<b class="oShut">closed</b> · opens ' + hm(x[0]) }; }
    return iv ? { open: false, txt: '<b class="oShut">closed now</b>' } : null;
  }
  function list(k,la,lo){
    la=Number(la);lo=Number(lo);if(!Q[k]||!point(la,lo))return Promise.reject(Error('Invalid point'));
    return get(Q[k](la.toFixed(4),lo.toFixed(4))).then(function(j){return items(j,k).map(function(x){return Object.assign({},x,{d:km(la,lo,x.la,x.lo)})}).sort(function(a,b){return a.d-b.d})});
  }
  function bbox(k,s,w,n,e){
    if(!F[k]||k==='food'||![s,w,n,e].every(number)||s< -90||n>90||s>=n)return Promise.reject(Error('Invalid map bounds'));
    var span=e-w;if(span<0)span+=360;
    if(span<=0||span>60||n-s>30)return Promise.reject(Error('Zoom in for a bounded OSM search'));
    var west=((w+180)%360+360)%360-180,east=west+span;
    var bounds=east>180?[[s,west,n,180],[s,-180,n,east-360]]:[[s,west,n,east]];
    var q='[out:json][timeout:25];('+bounds.map(function(b){return F[k]('('+b.map(function(v){return v.toFixed(3)}).join(',')+')')}).join('')+');out center 150;';
    return get(q).then(function(j){var a=items(j,k);a.limited=j.elements.length>=150;return a});
  }
  function validStored(c){return c&&c.version===3&&number(c.at)&&c.at<=Date.now()&&Date.now()-c.at<TTL&&Array.isArray(c.rows)&&c.rows.every(function(x){return x&&point(x.la,x.lo)&&typeof x.n==='string'&&typeof x.t==='string'&&/^(node|way|relation)\/[1-9]\d*$/.test(x.id)})}
  function render(el,force){
    if(!el||!Q[el.dataset.k])return;
    var a=el.dataset.la,b=el.dataset.lo,la=Number(a),lo=Number(b),k=el.dataset.k;
    if(a==null||b==null||!a.trim()||!b.trim()||!point(la,lo)){states.delete(el);el.hidden=false;el.textContent='Nearby listings need valid coordinates.';return}
    var key=k+'_'+la.toFixed(3)+'_'+lo.toFixed(3),old=states.get(el);
    if(!force&&old&&old.key===key&&Date.now()-old.at<TTL)return;
    var state={key:key,at:Date.now()};states.set(el,state);
    function active(){return states.get(el)===state}
    var title=k==='bars'?'Sundowner: beach bars nearby':k==='food'?'Fish restaurants and dining by the water':'Piers, ferry terminals and marinas nearby';
    el.hidden=false;el.innerHTML='<h3>'+ic(k==='bars'?'sunrise':k==='food'?'fish':'boat')+' '+title+'</h3><p class="osmS"></p><div class="osmB" role="status" aria-live="polite">Looking around on OpenStreetMap…</div><p class="osmC">Live from OpenStreetMap (© contributors, ODbL): a map sample, not a complete list or a rating. '+(k==='bars'?'Beach bars are found by their names and mapped beach clubs. ':'')+(k==='food'?'Restaurants tagged for fish or seafood within 8 km, and places right at the shore within 3 km. ':'')+(k==='piers'?'Your operator confirms the boarding point. ':'')+'Distances are straight lines; access may be private. Opening times come from OpenStreetMap where mapped – check before you go.</p>';
    var body=el.querySelector('.osmB'),storageKey='dm_osm_'+key;
    if(k==='bars'&&W.DMToday&&W.DMToday.sunForDay){try{var tz=el.dataset.tz||'UTC';new Intl.DateTimeFormat('en',{timeZone:tz}).format();var ss=W.DMToday.sunForDay(Date.now(),la,lo,tz).set;if(number(ss))el.querySelector('.osmS').textContent='Sunset today: '+new Date(ss).toLocaleString('en-GB',{timeZone:tz,day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})+' local time – be there half an hour early.'}catch(e){}}
    var stored=null;try{var v=JSON.parse(sessionStorage.getItem(storageKey)||'null');if(!force&&validStored(v))stored=v;else if(v)sessionStorage.removeItem(storageKey)}catch(e){}
    var job=stored?Promise.resolve(stored):get(Q[k](la.toFixed(4),lo.toFixed(4))).then(function(j){var v={version:3,at:Date.now(),rows:items(j,k),limited:j.elements.length>=(k==='food'?60:40),base:j.osm3s&&j.osm3s.timestamp_osm_base||null};try{sessionStorage.setItem(storageKey,JSON.stringify(v))}catch(e){}return v});
    job.then(function(v){if(!active())return;var seen=new Set();var o=v.rows.filter(function(x){if(seen.has(x.id))return false;seen.add(x.id);return true}).map(function(x){return Object.assign({},x,{d:km(la,lo,x.la,x.lo)})}).sort(function(a,b){return a.d-b.d}).slice(0,k==='food'?10:8);
      var fetched=' Retrieved '+new Date(v.at).toISOString().replace('T',' ').slice(0,16)+' UTC.';
      el.querySelector('.osmC').appendChild(D.createTextNode(fetched+(v.limited?' The query limit was reached; closer unreturned places may exist.':' Results depend on tags and mapped coverage.')));
      if(!o.length){body.textContent=(k==='bars'?'No beach bars':k==='food'?'No fish or waterside restaurants':'No piers, ferry terminals or marinas')+' are mapped nearby on OpenStreetMap. That does not mean there are none.';return}
      body.innerHTML='<ul class="osmL">'+o.map(function(x){return '<li><a href="https://www.openstreetmap.org/'+x.id+'" target="_blank" rel="noopener"><b>'+E(x.n)+'</b><small>'+E(x.t)+' | '+(x.d<1?Math.round(x.d*1000)+' m':x.d.toFixed(1)+' km')+' straight line'+(function(){var q=openNow(x.o,el.dataset.tz);return q?' | '+q.txt:''})()+'</small></a><a class="osmGo" href="https://www.openstreetmap.org/?mlat='+x.la.toFixed(5)+'&amp;mlon='+x.lo.toFixed(5)+'#map=16/'+x.la.toFixed(5)+'/'+x.lo.toFixed(5)+'" target="_blank" rel="noopener" aria-label="View mapped location of '+E(x.n)+'">'+ic('locate')+'</a></li>'}).join('')+'</ul>';
    }).catch(function(){if(!active())return;body.innerHTML='OpenStreetMap did not answer right now. <button type="button" class="osmR">Try again</button>';body.querySelector('.osmR').onclick=function(){render(el,true)}});
  }
  var io='IntersectionObserver'in W?new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){io.unobserve(e.target);render(e.target)}})},{rootMargin:'300px'}):null;
  function all(){D.querySelectorAll('.dmOsm').forEach(function(el){if(!io){render(el);return}if(!observed.has(el)){observed.add(el);io.observe(el)}})}
  W.DMNear={render:render,all:all,bbox:bbox,list:list,open:openNow,parseOH:parseOH};
  if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',all);else all();
})(window);
