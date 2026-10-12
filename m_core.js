 /* ================= v23.2 core: opening hours, live conditions, water, ice, verdicts, prices, photos, art ================= */
 function pad(n){return ('0'+n).slice(-2)}
 function hhmm(d){d=d||new Date();return pad(d.getHours())+':'+pad(d.getMinutes())}
 function fmtD(x){var d=new Date(x);return isNaN(d)?x:d.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
 function compass(deg){return ['N','NE','E','SE','S','SW','W','NW'][Math.round(((deg%360)+360)%360/45)%8]}
 function beaufort(k){var b=[1,6,12,20,29,39,50,62,75,89,103,118];for(var i=0;i<b.length;i++)if(k<b[i])return i;return 12}
 function R0(x){return Math.round(+x)}
 var MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],WDL=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],WDS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
 function lsGet(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}}
 function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}

 /* ---------- opening hours: OpenStreetMap opening_hours syntax (the common subset) ---------- */
 var MI={jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11},DI={su:0,mo:1,tu:2,we:3,th:4,fr:5,sa:6};
 var MRX='(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)';
 var DATE_RX=new RegExp('^((?:\\d{4}\\s+)?'+MRX+'(?:\\s+\\d{1,2})?(?:\\s*-\\s*(?:(?:\\d{4}\\s+)?'+MRX+'(?:\\s+\\d{1,2})?|\\d{1,2}))?)(\\s*,\\s*|\\s+|$)');
 var WD_RX=/^((?:Mo|Tu|We|Th|Fr|Sa|Su|PH|SH)(?:\s*-\s*(?:Mo|Tu|We|Th|Fr|Sa|Su))?(?:\s*,\s*(?:Mo|Tu|We|Th|Fr|Sa|Su|PH|SH)(?:\s*-\s*(?:Mo|Tu|We|Th|Fr|Sa|Su))?)*)(\s+|$)/;
 var OHC={};
 function parseDateItem(t){var m=t.match(new RegExp('^(?:(\\d{4})\\s+)?('+MRX+')(?:\\s+(\\d{1,2}))?(?:\\s*-\\s*(?:(?:(\\d{4})\\s+)?('+MRX+')(?:\\s+(\\d{1,2}))?|(\\d{1,2})))?$'));if(!m)return null;
  var y1=m[1]?+m[1]:0,m1=MI[m[2].toLowerCase()],d1=m[3]?+m[3]:0,y2=m[4]?+m[4]:0,m2=m[5]!=null?MI[m[5].toLowerCase()]:null,d2=m[6]?+m[6]:0;
  if(m[7]){m2=m1;d2=+m[7];y2=y1}
  if(m2==null){m2=m1;d2=d1?d1:31;if(!d1)d1=1}else{if(!d1)d1=1;if(!d2)d2=31}
  return {y1:y1,y2:y2||y1,a:m1*100+d1,b:m2*100+d2}}
 function ohParse(s){s=String(s||'').trim();if(!s)return null;if(OHC[s]!==undefined)return OHC[s];var out=null;
  try{if(/^24\/7$/.test(s))out={always:true,rules:[]};else{var rules=[];var parts=s.split(/\s*;\s*|\s*\|\|\s*/);
   for(var i=0;i<parts.length;i++){var p=parts[i].replace(/"[^"]*"/g,'').trim();if(!p)continue;var r={dates:null,days:null,times:null,off:false,ph:false};var m;
    while((m=p.match(DATE_RX))){var it=parseDateItem(m[1].trim());if(!it)break;(r.dates=r.dates||[]).push(it);p=p.slice(m[0].length);if(!/,/.test(m[2]))break}
    if((m=p.match(WD_RX))){var ds=[];m[1].split(/\s*,\s*/).forEach(function(g){if(/^(PH|SH)$/.test(g)){r.ph=true;return}var a=g.split(/\s*-\s*/);var x=DI[a[0].toLowerCase()],y=a[1]!=null?DI[a[1].toLowerCase()]:x;for(var k=0;k<7;k++){var d=(x+k)%7;ds.push(d);if(d===y)break}});if(ds.length)r.days=ds;else if(r.ph)continue;p=p.slice(m[0].length)}
    p=p.trim();
    if(/^(off|closed)$/i.test(p))r.off=true;
    else if(!p||/^open$/i.test(p))r.times=[[0,1440]];
    else{var tm=[],rx=/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})\+?/g,mm,used='';while((mm=rx.exec(p))){var a0=+mm[1]*60+ +mm[2],b0=+mm[3]*60+ +mm[4];if(b0<=a0)b0+=1440;tm.push([a0,b0]);used+=mm[0]}
     if(!tm.length||p.replace(/[\d:\-+,\s]/g,'').length)throw 0;r.times=tm}
    rules.push(r)}
   out=rules.length?{always:false,rules:rules}:null}}catch(e){out=null}
  OHC[s]=out;return out}
 function dateIn(r,d){if(!r.dates)return true;var key=d.getMonth()*100+d.getDate(),y=d.getFullYear();
  return r.dates.some(function(it){if(it.y1&&(y<it.y1||y>it.y2))return false;if(it.y1&&it.y1!==it.y2){if(y===it.y1)return key>=it.a;if(y===it.y2)return key<=it.b;return true}return it.a<=it.b?(key>=it.a&&key<=it.b):(key>=it.a||key<=it.b)})}
 var SEAS_RX=/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*(?:[–-]|to|until|through|bis)\s*(?:end of\s+)?(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i;
 function seasonOk(season,d){var ss=String(season||'').replace(/\b(?:mid|early|late|end of|beginning of)[\s-]+(?=[a-z])/gi,'');var m=ss.match(SEAS_RX);
  /* v23.7: plain words — "summer" means May–Sep (the bathing season), "autumn" extends to Nov; "year-round" or any winter mention keeps it open */
  if(!m){if(/year|winter|all season/i.test(ss))return true;var su=/summer/i.test(ss),au=/autumn|fall\b/i.test(ss);if(!su&&!au)return true;var x0=d.getMonth();return x0>=(su?4:8)&&x0<=(au?10:8)}var a=MI[m[1].toLowerCase()],b=MI[m[2].toLowerCase()],x=d.getMonth();return a<=b?(x>=a&&x<=b):(x>=a||x<=b)}
 function rangesFor(o,d,season){if(!seasonOk(season,d))return [];if(o.always)return [[0,1440]];var res=null;o.rules.forEach(function(r){if(r.ph&&!r.days&&!r.dates)return;if(dateIn(r,d)&&(!r.days||r.days.indexOf(d.getDay())>=0))res=r.off?[]:r.times});return res||[]}
 function fm(mn){mn=mn%1440;return pad(Math.floor(mn/60))+':'+pad(mn%60)}
 /* status of an item now: {open:true|false|null, text, cls} */
 function ohStatus(oh,season,now){var o=ohParse(oh);if(!o)return null;now=now||new Date();var mins=now.getHours()*60+now.getMinutes();
  var t=rangesFor(o,now,season);for(var i=0;i<t.length;i++)if(mins>=t[i][0]&&mins<t[i][1])return {open:true,until:t[i][1],text:t[i][1]>=1440&&t[i][0]===0?'Open 24 hours':'Open · until '+fm(t[i][1]),soon:t[i][1]-mins<=45};
  for(var k=0;k<400;k++){var d=new Date(now.getFullYear(),now.getMonth(),now.getDate()+k);var rs=rangesFor(o,d,season).slice().sort(function(a,b){return a[0]-b[0]});
   for(var j=0;j<rs.length;j++){if(k===0&&rs[j][0]<=mins)continue;var tx=k===0?'Closed · opens '+fm(rs[j][0]):k===1?'Closed · opens tomorrow '+fm(rs[j][0]):k<7?'Closed · opens '+WDL[d.getDay()]+' '+fm(rs[j][0]):'Out of season · reopens '+d.getDate()+' '+MON[d.getMonth()];return {open:false,next:d,nextMin:rs[j][0],days:k,text:tx}}}
  return {open:false,text:'Closed'}}
 function ohWeek(oh,season){var o=ohParse(oh);if(!o)return null;var now=new Date(),out=[];for(var k=0;k<7;k++){var d=new Date(now.getFullYear(),now.getMonth(),now.getDate()+k);var rs=rangesFor(o,d,season);
  out.push({day:k===0?'Today':k===1?'Tomorrow':WDL[d.getDay()],hrs:rs.length?rs.map(function(r){return r[0]===0&&r[1]>=1440?'24 hours':fm(r[0])+'–'+fm(r[1])}).join(', '):'Closed',today:k===0})}return out}
 function openInfo(v){if(v.ev==='sp'){if(v.season&&!seasonOk(v.season,new Date()))return {open:false,text:'Out of season · '+v.season,cls:'closed',days:30};return {open:null,text:cap(v.access||'Public place')+(v.season?' · '+v.season:''),cls:'na',place:true}}if(v.type==='icelake')return {open:null,text:'Ice access only where released',cls:'na',place:true};if(v.closedPerm)return {open:false,perm:true,text:'Permanently closed',cls:'off'};
  var st=v.oh?ohStatus(v.oh,v.season):null;if(st){st.cls=st.open?(st.soon?'soon':'open'):'closed';if(st.soon)st.text='Closes soon · '+fm(st.until);return st}
  if(v.season&&!seasonOk(v.season,new Date()))return {open:false,text:'Out of season ('+v.season+')',cls:'closed'};
  if(v.kind==='place'&&!v.svc)return {open:null,text:'Public place · always accessible',cls:'na',place:true};
  return {open:null,text:v.hours?'Hours: see details':'Hours not published',cls:'na'}}

 /* ---------- live conditions (Open-Meteo forecast + 92-day daily history) ---------- */
 var COND={},CLIM={};
 function condKey(lat,lon){return lat.toFixed(2)+','+lon.toFixed(2)}
 function getCond(lat,lon){var k=condKey(lat,lon),c=COND[k];if(c&&Date.now()-c.t<900000)return c.p;
  var u='https://api.open-meteo.com/v1/forecast?latitude='+lat.toFixed(4)+'&longitude='+lon.toFixed(4)+'&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,wind_gusts_10m,wind_direction_10m,precipitation,is_day,cloud_cover'+
   '&hourly=temperature_2m,wind_speed_10m,wind_gusts_10m,wind_direction_10m,precipitation,precipitation_probability,weather_code,uv_index,visibility,is_day&daily=sunrise,sunset,uv_index_max&past_days=2&forecast_days=3&wind_speed_unit=kmh&timezone=auto';
  var p=fetchJsonTimeout(u,{},8000).then(function(j){if(!j||!j.current)throw 0;return condParse(j)}).catch(function(){return null});COND[k]={t:Date.now(),p:p};
  p.then(function(x){if(!x)delete COND[k]});return p}
 function getClim(lat,lon){var k=condKey(lat,lon),c=CLIM[k];if(c&&Date.now()-c.t<3*3600000)return c.p;
  var u='https://api.open-meteo.com/v1/forecast?latitude='+lat.toFixed(4)+'&longitude='+lon.toFixed(4)+'&daily=temperature_2m_mean,precipitation_sum,snowfall_sum&past_days=92&forecast_days=1&timezone=auto';
  var p=fetchJsonTimeout(u,{},8000).then(function(j){var d=j&&j.daily;if(!d||!d.time)throw 0;return climParse(d)}).catch(function(){return null});CLIM[k]={t:Date.now(),p:p};p.then(function(x){if(!x)delete CLIM[k]});return p}
 function condParse(j){var c=j.current,H=j.hourly||{},T=H.time||[],cur=String(c.time||'');var i0=T.indexOf(cur.slice(0,13)+':00');if(i0<0){i0=0;for(var i=0;i<T.length;i++)if(T[i]<=cur)i0=i}
  var g=function(n,i){var a=H[n];return a&&a[i]!=null?a[i]:null};var sum=function(n,a,b){var s=0,h=0;for(var i=Math.max(0,a);i<Math.min(T.length,b);i++){var x=g(n,i);if(x!=null){s+=x;h++}}return h?s:null};
  var today=cur.slice(0,10),D=j.daily||{},di=(D.time||[]).indexOf(today);
  var thunder=false;for(var i=i0;i<Math.min(T.length,i0+4);i++){var wc=g('weather_code',i);if(wc!=null&&wc>=95)thunder=true}if(c.weather_code>=95)thunder=true;
  var maxProb=0;for(i=i0;i<Math.min(T.length,i0+4);i++){var pp=g('precipitation_probability',i);if(pp!=null&&pp>maxProb)maxProb=pp}
  return {at:hhmm(),now:cur,today:today,c:c,H:H,T:T,i0:i0,g:g,wind:c.wind_speed_10m,gust:c.wind_gusts_10m,dir:c.wind_direction_10m,air:c.temperature_2m,feels:c.apparent_temperature,code:c.weather_code,rain:c.precipitation,
   isDay:c.is_day,uv:g('uv_index',i0),vis:g('visibility',i0),rain48:sum('precipitation',i0-48,i0),rain6:sum('precipitation',i0,i0+6),prob3:maxProb,thunder:thunder,
   sunrise:di>=0&&D.sunrise?String(D.sunrise[di]||'').slice(11,16):'',sunset:di>=0&&D.sunset?String(D.sunset[di]||'').slice(11,16):'',uvMax:di>=0&&D.uv_index_max?D.uv_index_max[di]:null}}
 function climParse(d){var t=d.time,m=d.temperature_2m_mean||[],n=t.length;var past=[];for(var i=0;i<n-1;i++)if(m[i]!=null)past.push(m[i]);
  var last30=past.slice(-30),mean30=last30.length>=10?last30.reduce(function(a,b){return a+b},0)/last30.length:null;
  /* winter: frost sum (Kältesumme) since 1 November = sum of negative daily means; thaw days melt ice back (degree-day balance) */
  var ks=0,bal=0,snow7=0,warm=0;for(i=0;i<n-1;i++){var x=m[i];if(x==null)continue;if(x>3)warm++;else warm=0;if(warm>=10){ks=0;bal=0}if(x<0){ks+=-x;bal+=-x}else bal=Math.max(0,bal-x*1.5)}
  var sn=d.snowfall_sum||[];for(i=Math.max(0,n-8);i<n-1;i++)snow7+=sn[i]||0;
  return {month:+String(t[n-1]).slice(5,7)-1,mean30:mean30,frost:Math.round(ks),frostBal:Math.round(bal),snow7:snow7,last7:past.slice(-7)}}
 function getSea(lat,lon){var k='s'+condKey(lat,lon);if(COND[k]&&Date.now()-COND[k].t<1800000)return COND[k].p;
  var u='https://marine-api.open-meteo.com/v1/marine?latitude='+lat.toFixed(4)+'&longitude='+lon.toFixed(4)+'&current=wave_height,wave_period,wave_direction,swell_wave_height,swell_wave_period,sea_surface_temperature&timezone=auto';
  var p=fetchJsonTimeout(u,{},7000).then(function(j){var c=j&&j.current;if(!c||c.wave_height==null)return null;return {at:hhmm(),wave:c.wave_height,period:c.wave_period,dir:c.wave_direction,swell:c.swell_wave_height,swellP:c.swell_wave_period,sst:c.sea_surface_temperature}}).catch(function(){return null});COND[k]={t:Date.now(),p:p};return p}
 function getRiver(lat,lon){var k='r'+condKey(lat,lon);if(COND[k])return COND[k].p;var d=new Date(),s=new Date(d.getTime()-365*864e5),e=new Date(d.getTime()+3*864e5),f=function(x){return x.toISOString().slice(0,10)};
  var u='https://flood-api.open-meteo.com/v1/flood?latitude='+lat.toFixed(4)+'&longitude='+lon.toFixed(4)+'&daily=river_discharge&start_date='+f(s)+'&end_date='+f(e);
  var p=fetchJsonTimeout(u,{},8000).then(function(j){var D=j&&j.daily;if(!D||!D.river_discharge)return null;var t=D.time,q=D.river_discharge,today=f(d),i=t.indexOf(today);if(i<0)return null;var now=q[i];if(now==null)return null;
   var hist=q.slice(0,i).filter(function(x){return x!=null});if(hist.length<60)return null;var below=hist.filter(function(x){return x<now}).length/hist.length;var wk=q[Math.max(0,i-7)];var nxt=q[Math.min(q.length-1,i+3)];
   return {q:now,pct:below,trend:wk!=null?(now>wk*1.15?'rising':now<wk*0.85?'falling':'steady'):'',next:nxt,med:hist.slice().sort(function(a,b){return a-b})[Math.floor(hist.length/2)]}}).catch(function(){return null});COND[k]={t:Date.now(),p:p};return p}
 /* official bathing-water quality (EEA, EU Bathing Water Directive, 2025 season) — same register as the swim cards */
 var WQ_URL='https://water.discomap.eea.europa.eu/arcgis/rest/services/BathingWater/BathingWater_Dyna_WM_2025/MapServer/3/query';
 function inEurope(lat,lon){return lat>34&&lat<72&&lon>-25&&lon<45}
 function getWQ(lat,lon){if(!inEurope(lat,lon))return Promise.resolve({ok:false,outside:true});var k='q'+condKey(lat,lon);if(COND[k])return COND[k].p;
  var q='?geometry='+encodeURIComponent(JSON.stringify({x:lon,y:lat}))+'&geometryType=esriGeometryPoint&inSR=4326&distance=1500&units=esriSRUnit_Meter&spatialRel=esriSpatialRelIntersects&outFields=bathingWaterName,qualityStatus,latitude,longitude,bwProfileLink&returnGeometry=false&f=json';
  var p=fetchJsonTimeout(WQ_URL+q,{},8000).then(function(j){if(!j||j.error)throw 0;var best=null;(j.features||[]).forEach(function(f){var a=f.attributes||{};if(a.latitude==null)return;var d=D(lat,lon,a.latitude,a.longitude)*1000;if(!best||d<best.d)best={d:d,a:a}});return {ok:true,best:best}}).catch(function(){return {ok:false}});COND[k]={t:Date.now(),p:p};return p}
 /* fish recorded nearby (GBIF occurrence records: ray-finned fishes + sharks & rays) */
 function getFish(lat,lon){var k='dm_fish_'+lat.toFixed(2)+'_'+lon.toFixed(2);var c=lsGet(k);if(c&&Date.now()-c.t<30*864e5)return Promise.resolve(c.v);if(COND[k])return COND[k].p;
  var dl=0.045,dn=0.045/Math.max(0.2,Math.cos(lat*Math.PI/180));
  var u='https://api.gbif.org/v1/occurrence/search?decimalLatitude='+(lat-dl).toFixed(4)+','+(lat+dl).toFixed(4)+'&decimalLongitude='+(lon-dn).toFixed(4)+','+(lon+dn).toFixed(4)+'&taxonKey=204&taxonKey=121&occurrenceStatus=PRESENT&facet=speciesKey&facetLimit=8&limit=0';
  var p=fetchJsonTimeout(u,{},9000).then(function(j){var f=j&&j.facets&&j.facets[0];var cs=(f&&f.counts)||[];if(!cs.length)return {list:[],total:(j&&j.count)||0};
   return Promise.all(cs.slice(0,8).map(function(x){return fetchJsonTimeout('https://api.gbif.org/v1/species/'+x.name+'/vernacularNames?limit=60',{},7000).then(function(v){var en=(v.results||[]).filter(function(r){return r.language==='eng'})[0];return en?en.vernacularName:''}).catch(function(){return ''}).then(function(vn){
     return fetchJsonTimeout('https://api.gbif.org/v1/species/'+x.name,{},7000).then(function(s){return {sci:s.canonicalName||s.scientificName||'',en:vn||'',n:x.count,key:x.name}}).catch(function(){return vn?{sci:'',en:vn,n:x.count,key:x.name}:null})})}))
    .then(function(L){var v={list:L.filter(Boolean),total:j.count||0};lsSet(k,{t:Date.now(),v:v});return v})}).catch(function(){return null});COND[k]={t:Date.now(),p:p};return p}
 /* country of the search point (for licence rules) */
 var CC={};function getCC(lat,lon){var k=lat.toFixed(1)+','+lon.toFixed(1);if(CC[k])return CC[k];var c=lsGet('dm_cc_'+k);if(c)return (CC[k]=Promise.resolve(c));
  var p=fetchJsonTimeout('https://nominatim.openstreetmap.org/reverse?format=json&zoom=3&lat='+lat.toFixed(4)+'&lon='+lon.toFixed(4),{},7000).then(function(j){var cc=String((j&&j.address&&j.address.country_code)||'').toUpperCase();if(cc)lsSet('dm_cc_'+k,cc);return cc||''}).catch(function(){return ''});CC[k]=p;return p}

 /* ---------- water temperature ---------- */
 function waterTemp(v,clim,sea){if(v.water==='pool')return {pool:true,txt:v.waterTxt||'Managed wave pool — water temperature set by the operator',c:null};
  if(sea&&sea.sst!=null)return {c:R0(sea.sst),how:'Sea surface temperature from the Open-Meteo marine model for this coast',src:'model'};
  if(clim&&clim.mean30!=null){var river=v.river||A.mode==='raft';var c=river?Math.max(3,R0(clim.mean30-0.5)):Math.max(4,Math.min(27,R0(clim.mean30+2)));
   return {c:c,est:true,how:(river?'Estimate for rivers':'Estimate for lakes')+' from the last 30 days of air temperature at this place (Open-Meteo). Shallow bays are warmer, deep or glacier-fed water colder.',src:'est'}}
  return null}
 function suitAdvice(t,act){if(t==null)return '';var dive=/^(dive|wreck|freedive)$/.test(act);
  if(dive)return t>=26?'3 mm wetsuit':t>=20?'5 mm wetsuit':t>=15?'7 mm wetsuit with hood':'Drysuit recommended';
  if(/^(sup|kayak|row|pedal|boatrent|tour|motorboat|charter|fishing)$/.test(act))return t>=20?'No wetsuit needed':t>=16?'Fine for a short fall-in; wear a buoyancy aid':t>=12?'Cold-water shock possible: wetsuit or stay near the shore':'Very cold: wetsuit or drysuit, stay close to shore';
  return t>=24?'Boardshorts or rash vest':t>=21?'Shorty or 2 mm':t>=17?'3/2 mm full suit':t>=13?'4/3 mm full suit, boots':t>=10?'5/4 mm with hood, boots, gloves':'6 mm or drysuit, hood, boots, gloves'}
 function tempCls(t){return t==null?'na':t<8?'t0':t<13?'t1':t<17?'t2':t<21?'t3':t<25?'t4':'t5'}

 /* ---------- winter: ice model + official status (no lake-by-lake approval needed) ---------- */
 var ICE_LAKES=window.DM_ICE_LAKES||[];
 function iceModel(clim){if(!clim||!clim.frost||clim.frost<5)return null;
  var b=clim.frostBal,snowy=clim.snow7>3;var alpha=snowy?1.4:1.6;
  var pond=b>40?Math.round(alpha*Math.sqrt(b-40)):0,small=b>120?Math.round(alpha*Math.sqrt(b-120)):0;
  return {frost:clim.frost,bal:b,pond:pond,small:small,large:b>=300,snowy:snowy,last7:clim.last7}}
 function iceRelevant(clim,lat){if(clim&&(clim.frost>=10||(clim.mean30!=null&&clim.mean30<2)))return true;var m=new Date().getMonth(),nw=m>=10||m<=2,sw=m>=4&&m<=8;return !!(clim&&clim.mean30!=null&&clim.mean30<8&&((lat>=0&&nw)||(lat<0&&sw)))}
 function iceLevel(im){if(!im)return '';return im.small>=5?'ice':im.pond>=3?'thin':im.bal>15?'frost':''}
 function nearIceLake(lat,lon){var best=null;ICE_LAKES.forEach(function(l){var d=D(lat,lon,l.lat,l.lon);if(d<=(l.r||3)&&(!best||d<best.d))best={d:d,l:l}});return best&&best.l}

 /* ---------- verdict: is it recommended right now, and why ---------- */
 var PROF={sup:{calm:[12,20,26],gust:[30,40],wave:[0.4,0.8,1.2],wet:1,name:'SUP'},kayak:{calm:[15,24,30],gust:[35,45],wave:[0.5,1,1.5],wet:1,name:'kayaking'},row:{calm:[15,24,30],gust:[35,45],wave:[0.5,1,1.5],name:'rowing'},
  pedal:{calm:[15,22,28],gust:[35,45],wave:[0.3,0.6,1],name:'pedal boats'},boatrent:{calm:[20,28,35],gust:[40,50],wave:[0.5,1,1.5],name:'a rental boat'},motorboat:{calm:[25,35,45],gust:[45,60],wave:[0.8,1.5,2.5],name:'motorboating'},
  tour:{calm:[30,40,55],gust:[50,70],wave:[1.5,2.5,4],name:'a boat tour',night:1},charter:{calm:[25,35,45],gust:[45,60],wave:[1,2,3],name:'a charter'},fishing:{calm:[20,30,40],gust:[40,55],wave:[1,1.5,2.5],name:'a fishing trip'},
  wake:{calm:[10,18,25],gust:[25,35],wave:[0.3,0.6,1],name:'wakeboarding',wet:1},sail:{need:[6,10,28,38],gust:[45,55],wave:[1,2,3],name:'sailing'},
  windsurf:{need:[15,18,40,50],gust:[50,60],spread:20,wet:1,name:'windsurfing'},kite:{need:[15,18,40,50],gust:[50,60],spread:20,wet:1,name:'kitesurfing'},wing:{need:[12,15,35,45],gust:[45,55],spread:20,wet:1,name:'wingfoiling'},
  surf:{surf:1,wet:1,name:'surfing'},dive:{calm:[20,30,40],gust:[40,55],wave:[0.5,1,1.5],dive:1,wet:1,name:'diving'},wreck:{calm:[20,30,40],gust:[40,55],wave:[0.5,1,1.5],dive:1,wet:1,name:'wreck diving'},
  snorkel:{calm:[15,25,35],gust:[35,50],wave:[0.3,0.6,1],dive:1,wet:1,name:'snorkelling'},freedive:{calm:[15,25,35],gust:[35,50],wave:[0.3,0.6,1],dive:1,wet:1,name:'freediving'},
  raft:{river:1,wet:1,name:'rafting'},swimx:{calm:[15,25,35],gust:[40,55],wave:[0.4,0.8,1.2],wet:1,name:'a swim'},sauna:{calm:[30,40,55],gust:[50,70],wave:[0.8,1.2,2],name:'a sauna session'},thermal:{calm:[40,55,70],gust:[60,80],wave:[3,4,5],name:'a thermal bath'},glow:{calm:[12,20,26],gust:[30,40],wave:[0.4,0.8,1.2],wet:1,name:'an evening paddle'},skate:{ice:1,name:'ice skating'},canyon:{river:1,canyon:1,wet:1,name:'canyoning'},whitewater:{river:1,wet:1,name:'white water'}};
 function primaryAct(v){var ma=modeActs(v).filter(function(k){return PROF[k]});return ma[0]||({paddle:'sup',dive:'dive',sail:'sail',boat:'tour',raft:'raft'})[A.mode]||'sup'}
 function weatherJudge(P,w,g,code,isDay,vis,prob,rain,sea,out){var add=function(s,t){out.push({s:s,t:t})};
  if(code>=95)add('bad','Thunderstorm risk — stay off the water');
  if(isDay===0&&!P.night)add('bad','After dark');
  if(P.ice)return;
  if(P.calm){if(w<=P.calm[0])add('ok','Light wind '+R0(w)+' km/h');else if(w<=P.calm[1])add('warn','Moderate wind '+R0(w)+' km/h — stay near the shore');else if(w<=P.calm[2])add('warn','Fresh wind '+R0(w)+' km/h — tiring and choppy');else add('bad','Strong wind '+R0(w)+' km/h — too much for '+P.name)}
  if(P.need){var n=P.need;if(w<n[0])add('bad','Too little wind ('+R0(w)+' km/h) — '+P.name+' needs about '+n[1]+'+ km/h');else if(w<n[1])add('warn','Light wind '+R0(w)+' km/h — big kite or sail, light riders');else if(w<=n[2])add('ok','Good wind '+R0(w)+' km/h · '+beaufort(w)+' Bft');else if(w<=n[3])add('warn','Strong wind '+R0(w)+' km/h — experienced riders only');else add('bad','Too strong: '+R0(w)+' km/h')}
  if(P.gust&&g!=null){if(g>P.gust[1])add('bad','Gusts up to '+R0(g)+' km/h');else if(g>P.gust[0])add('warn','Gusty: up to '+R0(g)+' km/h')}
  if(P.spread&&g!=null&&g-w>P.spread)add('warn','Very gusty — '+R0(g-w)+' km/h between wind and gusts');
  if(P.wave&&sea&&sea.wave!=null){var h=sea.wave;if(h>P.wave[2])add('bad','Waves '+h.toFixed(1)+' m');else if(h>P.wave[1])add('warn','Waves '+h.toFixed(1)+' m');else if(h<=P.wave[0])add('ok','Calm water (waves '+h.toFixed(1)+' m)')}
  if(vis!=null&&vis<1000)add('warn','Poor visibility ('+(vis<100?'thick fog':R0(vis)+' m')+')');
  if(rain!=null&&rain>=2)add('warn','Rain now ('+(+rain).toFixed(1)+' mm/h)');else if(prob>=70&&code<95)add('warn','Rain likely in the next hours ('+prob+'%)')}
 function assess(v,cd,clim,sea,riv){var act=primaryAct(v),P=PROF[act]||PROF.sup,out=[];var add=function(s,t){out.push({s:s,t:t})};var st=openInfo(v);
  if(!cd)return {act:act,score:null,st:st,why:out};
  if(P.ice)return assessIce(v,cd,clim,st,act);
  weatherJudge(P,cd.wind,cd.gust,cd.code,cd.isDay,cd.vis,cd.prob3,cd.rain,P.surf?null:sea,out);
  if(P.surf){if(v.water==='pool'||v.type==='centre')add('ok','Man-made wave — runs whatever the swell');else if(v.river){if(riv)add(riv.pct>0.6?'ok':'warn','River '+(riv.pct>0.6?'carrying good water':'lower than usual')+' (model) — surfable levels vary by wave');else add('info','River wave: depends on the water level — check the local gauge')}
   else if(sea&&sea.swell!=null){var s=sea.swell;if(s<0.4)add('bad','Flat: swell '+s.toFixed(1)+' m');else if(s<0.8)add('warn','Small swell '+s.toFixed(1)+' m — longboard');else if(s<=2.5)add('ok','Swell '+s.toFixed(1)+' m'+(sea.swellP?' every '+R0(sea.swellP)+' s':''));else add('bad','Big swell '+s.toFixed(1)+' m — experts only')}
   else add('info','No swell data for this spot')}
  if(P.river&&riv){if(riv.pct>0.92)add('warn','River high (above 92% of the last year, model) — trips may be cancelled');else if(riv.pct<0.08)add('warn','River very low (model) — some sections may not run');else add('ok','River level in the usual range (model)')}
  if(P.canyon&&(cd.thunder||(cd.rain6||0)>3))add('bad','Rain or storms forecast — flash-flood risk in canyons');
  if(P.dive&&cd.rain48!=null){if(cd.rain48>25)add('warn','Heavy rain in the last 48 h ('+R0(cd.rain48)+' mm) — runoff can cloud the water');else if(cd.rain48<5)add('ok','Little rain lately — no extra runoff')}
  var wt=waterTemp(v,clim,sea);if(P.wet&&wt&&wt.c!=null){if(wt.c<12)add('warn','Cold water ≈'+wt.c+' °C — '+suitAdvice(wt.c,act));else add('ok','Water ≈'+wt.c+' °C — '+suitAdvice(wt.c,act))}
  var im=iceModel(clim);if(im&&iceLevel(im)==='ice'&&!P.river)add('bad','Small lakes may be frozen — check the official ice status');
  if(cd.air!=null){if(cd.air<6&&!P.dive)add('warn','Cold air '+R0(cd.air)+' °C'+(cd.feels!=null&&cd.feels<cd.air-2?' (feels '+R0(cd.feels)+' °C)':''));else if(cd.air>32)add('warn','Hot: '+R0(cd.air)+' °C — drink and find shade')}
  if(cd.uv!=null&&cd.uv>=6&&cd.isDay)add('info','UV '+R0(cd.uv)+' — sun protection');
  if(st.open===true)add('ok',st.text);else if(st.open===false)add('bad',st.text);else if(!st.place)add('info',st.text+' — call ahead');
  var bad=out.filter(function(x){return x.s==='bad'&&!/^(Closed|Out of season|Permanently)/.test(x.t)}).length,warn=out.filter(function(x){return x.s==='warn'}).length;
  /* same method as the swim score: weighted parts from real inputs only, missing inputs left out */
  var parts=[],cl=function(x){return Math.max(0,Math.min(100,Math.round(x)))};
  var wl=[];weatherJudge(P,cd.wind,cd.gust,0,1,null,0,0,P.surf?null:sea,wl);var wb=wl.filter(function(x){return x.s==='bad'}).length,ww=wl.filter(function(x){return x.s==='warn'}).length;
  if(!P.surf&&!P.river)parts.push({k:'wind',label:P.need?'Wind for '+P.name:'Wind & waves',val:R0(cd.wind)+' km/h'+(cd.gust!=null?', gusts '+R0(cd.gust):''),s:wb?10:cl(100-ww*35),w:.30});
  else{var sw=out.filter(function(x){return /swell|wave|River/i.test(x.t)});parts.push({k:'wind',label:P.surf?'Waves':'River level',val:sw[0]?sw[0].t.split(' — ')[0]:'no data',s:sw.some(function(x){return x.s==='bad'})?10:sw.some(function(x){return x.s==='warn'})?55:sw.length?100:70,w:.30})}
  if(P.wet&&wt&&wt.c!=null){var lo=P.dive?6:/^(sup|kayak|row|pedal|boatrent)$/.test(act)?12:8,hi=P.dive?24:/^(sup|kayak|row|pedal|boatrent)$/.test(act)?22:18;parts.push({k:'water',label:'Water',val:(wt.est?'≈':'')+wt.c+' °C',s:cl(10+(wt.c-lo)*90/(hi-lo)),w:.20})}
  var wsx=cd.air!=null?cl((cd.air-6)/16*100):60;if(cd.prob3>=60)wsx-=40;else if(cd.prob3>=30)wsx-=20;if(cd.thunder)wsx=0;if(cd.isDay===0&&!P.night)wsx=Math.min(wsx,10);
  parts.push({k:'weather',label:'Weather now',val:(cd.air!=null?R0(cd.air)+' °C':'')+(cd.prob3?', rain '+cd.prob3+'%':'')+(cd.isDay===0?', dark':''),s:cl(wsx),w:.20});
  parts.push({k:'open',label:'Open',val:st.text,s:st.open===true?100:st.open===false?15:70,w:.15});
  var dk=v.dist!=null?v.dist:0;parts.push({k:'access',label:'Getting there',val:km(dk)+' away',s:cl(dk<=3?100:dk>=30?20:100-(dk-3)*80/27),w:.15});
  var tw=parts.reduce(function(a,p){return a+p.w},0);var score=Math.round(parts.reduce(function(a,p){return a+p.s*p.w},0)/tw);
  if(bad)score=Math.min(score,38-10*(bad-1));score=Math.max(5,Math.min(100,score));
  var closed=st.open===false,night=cd.isDay===0&&!P.night;
  var label=closed?(st.perm?'Closed':(st.days>=7?'Out of season':'Closed now')):night?'After dark':score>=82?'Great now':score>=66?'Good now':score>=50?'OK with care':'Not now';
  var cls=closed||night?'dmScOff':score>=82?'dmScGreat':score>=66?'dmScGood':score>=50?'dmScOk':'dmScLow';
  return {act:act,score:score,label:label,cls:cls,st:st,why:out,wt:wt,closed:closed,night:night,parts:parts}}
 function assessIce(v,cd,clim,st,act){var out=[],add=function(s,t){out.push({s:s,t:t})},im=iceModel(clim),lvl=iceLevel(im),L=v.ice||nearIceLake(v.lat,v.lon);
  if(cd.code>=95)add('bad','Thunderstorm risk');if(cd.isDay===0)add('warn','After dark — only lit, released areas');
  if(v.type==='rink'){if(!v.indoor&&cd.air>8)add('warn','Mild '+R0(cd.air)+' °C — outdoor ice may be soft or closed');else add('ok',v.indoor?'Indoor rink — weather does not matter':'Cold enough for outdoor ice ('+R0(cd.air)+' °C)');
   if(st.open===true)add('ok',st.text);else if(st.open===false)add('bad',st.text);else add('info',st.text+' — call ahead');
   var bad=out.filter(function(x){return x.s==='bad'&&!/^(Closed|Out of season)/.test(x.t)}).length,warn=out.filter(function(x){return x.s==='warn'}).length,score=Math.max(5,bad?35:100-14*warn);
   var closed=st.open===false;return {act:act,score:score,label:closed?'Closed now':score>=82?'Great now':score>=66?'Good now':'OK with care',cls:closed?'dmScOff':score>=82?'dmScGreat':score>=66?'dmScGood':'dmScOk',st:st,why:out,closed:closed,night:false}}
  if(!im||!lvl||lvl==='frost'){add('bad',im?'Ice model: no load-bearing ice expected yet (frost sum '+im.frost+' °C·days)':'No frost this season — open water');return {act:act,score:10,label:'No ice',cls:'dmScOff',st:st,why:out,closed:true,night:false,noIce:true}}
  if(L&&L.frost){if(im.frost<L.frost){add('bad','This lake usually freezes over only at about '+L.frost+' °C·days of frost — now '+im.frost+': open water');return {act:act,score:10,label:'No ice',cls:'dmScOff',st:st,why:out,closed:true,night:false,noIce:true}}add('warn','Frost sum '+im.frost+' °C·days is above this lake’s freeze-over point (~'+L.frost+')')}
  add(lvl==='ice'?'ok':'warn','Ice model: ≈'+(im.small||im.pond)+' cm on small lakes and ponds (not a measurement)');
  if(L){add('info',(ICEK_T[L.k]||'Ask locally')+' — '+String(L.auth).split(/[;(]/)[0].trim());if(/bulletin|order|release|operator/.test(L.k))add('warn','Only go on the ice once it is officially released — check the status link')}else add('warn','No official release known here — entering is at your own risk, and may be forbidden');
  if(cd.air>3)add('warn','Thaw: '+R0(cd.air)+' °C — ice weakens quickly');
  return {act:act,score:L&&/bulletin|order|release|operator|marked/.test(L.k)?60:40,label:'Check release',cls:'dmScOk',st:st,why:out,closed:false,night:false}}
 var ICEK_T={release:'Official release process',bulletin:'Official ice bulletin',trails:'Only marked paths are checked',operator:'Operated ice area',order:'Opened by municipal order',marked:'Marked when safe',contact:'Ask locally',ownrisk:'No release — own risk'};
 /* DipMapper rating (same 3–5 star scale as the swim cards): how complete, verified and well-documented a place is */
 function rating(v){var s=62;if(v.ev==='dir')s+=12;if(v.ev==='name')s-=10;if(v.prices&&v.prices.length)s+=7;if(v.oh||v.hours)s+=6;if(v.phone||v.email)s+=4;if(v.web)s+=4;if(v.ig||v.fb)s+=3;if(PH[v.id]&&PH[v.id].l&&PH[v.id].l.length)s+=4;if(v.famous)s+=10;if(v.status)s-=8;if(v.kind==='place'&&!v.famous)s+=4;return Math.round(Math.max(3,Math.min(5,s/20))*10)/10}
 function stars(r){var f=Math.round(r*2)/2,h='';for(var i=1;i<=5;i++)h+=i<=f?'★':(i-0.5===f?'⯪':'☆');return h}
 /* best time window in the next 36 hours (weather + daylight + opening hours) */
 function bestWindow(v,cd){if(!cd||!cd.T||!cd.T.length)return null;if(v.closedPerm||(v.season&&!seasonOk(v.season,new Date())))return null;/* v23.7: no 'best window' while out of season */var P=PROF[primaryAct(v)]||PROF.sup;if(P.ice&&v.type!=='rink')return null;var o=v.oh?ohParse(v.oh):null,run=null,best=null;
  for(var i=cd.i0+1;i<Math.min(cd.T.length,cd.i0+37);i++){var w=cd.g('wind_speed_10m',i),g=cd.g('wind_gusts_10m',i),code=cd.g('weather_code',i),day=cd.g('is_day',i),vis=cd.g('visibility',i),pp=cd.g('precipitation_probability',i)||0,pr=cd.g('precipitation',i);if(w==null)continue;
   var out=[];weatherJudge(P,w,g,code||0,day,vis,pp,pr,null,out);var ok=!out.some(function(x){return x.s==='bad'})&&out.filter(function(x){return x.s==='warn'}).length===0;
   if(ok&&!o&&day===0)ok=false;/* v23.7: without published hours, only suggest daylight */
   if(ok&&o){var ts=cd.T[i],dd=new Date(+ts.slice(0,4),+ts.slice(5,7)-1,+ts.slice(8,10)),mins=+ts.slice(11,13)*60;ok=rangesFor(o,dd,v.season).some(function(r){return mins>=r[0]&&mins+60<=r[1]})}
   if(ok){if(!run)run={a:i,b:i};else run.b=i}else if(run){if(run.b-run.a>=1){best=run;break}run=null}}
  if(!best&&run&&run.b-run.a>=1)best=run;if(!best)return null;var ta=cd.T[best.a],tb=cd.T[best.b];var day=ta.slice(0,10)===cd.today?'today':'tomorrow';if(ta.slice(0,10)>cd.today&&day==='tomorrow'){var d0=new Date(cd.today),d1=new Date(ta.slice(0,10));if((d1-d0)/864e5>1.5)day=WDL[new Date(+ta.slice(0,4),+ta.slice(5,7)-1,+ta.slice(8,10)).getDay()]}
  return {day:day,from:ta.slice(11,16),to:pad(+tb.slice(11,13)+1)+':00',text:day+' '+ta.slice(11,16)+'–'+pad(+tb.slice(11,13)+1)+':00'}}

 /* ---------- prices: per hour / per day / per session ---------- */
 function priceUnit(lbl,val){var s=(lbl+' '+val).toLowerCase(),l=String(lbl).toLowerCase();
  if(/subscription|abo\b|membership|season|annual|monthly|weekly|visit|pass\b|card/.test(l))return /week/.test(l)?'week':'pass';
  if(/(further|additional|each more|extra|weitere)\s*(half )?hour|\+\s*chf|per quarter/.test(s)||/^\s*\+/.test(String(val)))return 'extra';
  if(/per hour|\/ ?h\b|first hour|\b1 ?h\b|– 1 h|hourly|pro stunde|\(1 h|1-hour|one hour|60 min/.test(s))return 'h';
  if(/half ?an hour|1\/2 hour|30 min|half hour/.test(s))return '30min';
  if(/per day|\/ ?day|full day|all day|1 day|one day|daily|tageskarte|pro tag|\bday\b/.test(s))return 'day';
  if(/half[- ]day|4 ?h\b|\b3 ?h\b/.test(s))return 'half';
  if(/week/.test(s))return 'week';if(/season|annual|year|month|subscription|abo|membership|visit/.test(s))return 'pass';
  if(/session|slot|45 min|ride|run|round|lap/.test(s))return 'session';if(/course|lesson|class|intro|private|camp|licen|training/.test(s))return 'course';if(/cruise|trip|tour|ticket|crossing/.test(s))return 'ticket';
  return ''}
 var UNIT={h:'per hour','30min':'per 30 min',day:'per day',half:'half day',week:'per week',pass:'pass',session:'per session',course:'course',ticket:'ticket',extra:'extra time'};
 function chfOf(val){var m=String(val).replace(/’|'/g,'').match(/CHF\s*(\d+(?:[.,]\d+)?)/i)||String(val).match(/(\d+(?:[.,]\d+)?)\s*(?:CHF|Fr\.?|€|EUR|USD|\$)/i);return m?+m[1].replace(',','.'):null}
 function priceSummary(v){var P=(v.prices||[]).map(function(p){return {l:p[0],v:p[1],u:priceUnit(p[0],p[1]),c:chfOf(p[1])}}).filter(function(p){return p.c!=null&&p.c>0&&!/children|kids|child|kinder|registration|deposit|fee\b|not included/i.test(p.l)});
  var pick=function(u){var xs=P.filter(function(p){return p.u===u});if(!xs.length)return null;return xs.reduce(function(a,b){return b.c<a.c?b:a})};
  var h=pick('h'),d=pick('day'),s=pick('session')||pick('ticket'),c=pick('course'),hd=pick('half');
  var main=h?{t:'CHF '+fmtCHF(h.c),u:'/h'}:d?{t:'CHF '+fmtCHF(d.c),u:'/day'}:s?{t:'CHF '+fmtCHF(s.c),u:s.u==='ticket'?' ticket':'/session'}:hd?{t:'CHF '+fmtCHF(hd.c),u:'/half day'}:c?{t:'from CHF '+fmtCHF(c.c),u:' course'}:null;
  if(!main&&v.charge)main={t:v.charge,u:''};return {main:main,h:h,d:d,s:s,c:c}}
 function fmtCHF(x){return x%1?x.toFixed(2):String(x)}

 /* ---------- photos: OpenStreetMap image tags, then Wikimedia Commons by name, then nearby; illustration as fallback ---------- */
 var KW=/sup|paddle|paddel|kayak|kajak|kanu|canoe|boot|boat|bateau|barca|segel|sail|voile|kite|surf|wind|hafen|harbou?r|port|marina|see|lake|lac|lago|strand|beach|plage|bad|tauch|dive|plong|ufer|quai|quay|steg|pier|river|fluss|reuss|aare|welle|wave|ship|schiff|ferry|rafting|canyon|wasser|water/i;
 function fileOf(u){var m=String(u).match(/\/(?:thumb\/[0-9a-f]\/[0-9a-f]{2}\/)?([^\/?#]+\.(?:jpe?g|png|webp|tiff?))(?:\/|$|\?)/i);if(m)return decodeURIComponent(m[1]);m=String(u).match(/FilePath\/([^?]+)/);return m?decodeURIComponent(m[1]):''}
 function photoPage(u){var f=fileOf(u);return f?'https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(f.replace(/ /g,'_')):''}
 /* ---------- illustrations (used when no real photo is available) ---------- */
 function art(kind,ac){ac=ac||'#0fb3a6';var id='g'+Math.random().toString(36).slice(2,7);var under=/^(dive|snorkel|freedive|wreck)$/.test(kind);
  var sky=under?'':'<defs><linearGradient id="s'+id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dff6f2"/><stop offset="1" stop-color="#fff4dc"/></linearGradient><linearGradient id="w'+id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2cc3b5"/><stop offset="1" stop-color="#0a6f6a"/></linearGradient></defs><rect width="120" height="120" fill="url(#s'+id+')"/><circle cx="92" cy="30" r="11" fill="#ffd27a"/><circle cx="92" cy="30" r="17" fill="#ffd27a" opacity=".22"/><path d="M0 70 L22 46 L36 58 L56 34 L78 60 L92 50 L120 70 Z" fill="#bfe3dc"/><path d="M0 70 L30 56 L50 66 L74 52 L120 70 Z" fill="#a7d8cf"/><rect y="68" width="120" height="52" fill="url(#w'+id+')"/><path d="M8 84 q6 -4 12 0 t12 0 M64 96 q6 -4 12 0 t12 0 M30 108 q6 -4 12 0 t12 0" stroke="#fff" stroke-opacity=".45" stroke-width="2" fill="none" stroke-linecap="round"/>';
  var f='';var P='stroke="'+ac+'" stroke-width="3" stroke-linecap="round" fill="none"';
  if(kind==='sup')f='<rect x="30" y="73" width="60" height="5" rx="2.5" fill="#fff"/><circle cx="60" cy="44" r="4" fill="'+ac+'"/><path d="M60 49 L60 62 M60 62 L55 73 M60 62 L65 73 M60 53 L70 50" '+P+'/><path d="M70 40 L72 80" stroke="#06343c" stroke-width="2"/>';
  else if(kind==='kayak'||kind==='row')f='<path d="M28 74 Q60 84 92 74 Q60 70 28 74 Z" fill="'+ac+'"/><circle cx="60" cy="60" r="4" fill="#06343c"/><path d="M60 64 L60 72" stroke="#06343c" stroke-width="3"/><path d="M40 58 L80 74" stroke="#06343c" stroke-width="2"/><rect x="36" y="55" width="6" height="4" rx="1" fill="#06343c" transform="rotate(20 39 57)"/>';
  else if(kind==='pedal'||kind==='boatrent')f='<path d="M34 72 Q60 86 86 72 L82 66 L38 66 Z" fill="#fff"/><path d="M76 66 Q74 48 84 44 Q90 42 88 48 Q82 50 82 66" fill="#fff" stroke="#e7f0ee"/><circle cx="86" cy="45" r="1.4" fill="#06343c"/><path d="M89 46 l4 1" stroke="#f0a020" stroke-width="2"/><rect x="44" y="58" width="22" height="8" rx="3" fill="'+ac+'"/>';
  else if(kind==='sail'||kind==='marina'||kind==='ramp'||kind==='charter')f='<path d="M34 76 L86 76 L80 84 L40 84 Z" fill="#06343c"/><path d="M60 30 L60 74 L36 74 Z" fill="#fff"/><path d="M62 34 L62 74 L84 74 Z" fill="'+ac+'"/>'+(kind==='marina'?'<path d="M18 50 L18 78 M100 46 L100 78" stroke="#06343c" stroke-width="2"/>':'');
  else if(kind==='windsurf'||kind==='wing')f='<rect x="40" y="76" width="44" height="4" rx="2" fill="#fff"/><path d="M58 76 L58 36 Q78 50 74 74 Z" fill="'+ac+'"/><circle cx="52" cy="54" r="3.5" fill="#06343c"/><path d="M52 58 L52 68 L48 76 M52 68 L56 76 M52 61 L58 58" stroke="#06343c" stroke-width="2.5" stroke-linecap="round" fill="none"/>';
  else if(kind==='kite')f='<path d="M18 28 Q46 8 74 26 Q60 30 46 30 Q30 30 18 28 Z" fill="'+ac+'"/><path d="M22 29 L60 66 M70 27 L62 66" stroke="#06343c" stroke-width=".8"/><rect x="50" y="76" width="26" height="3.5" rx="1.7" fill="#fff"/><circle cx="62" cy="60" r="3.5" fill="#06343c"/><path d="M62 64 L62 70 L58 76 M62 70 L66 76" stroke="#06343c" stroke-width="2.5" stroke-linecap="round" fill="none"/>';
  else if(kind==='surf')f='<path d="M0 86 Q30 40 70 58 Q50 60 46 76 Q60 70 120 76 L120 120 L0 120 Z" fill="#0a8f88"/><path d="M8 82 Q32 46 66 58" stroke="#fff" stroke-width="3" fill="none" stroke-opacity=".8"/><rect x="44" y="62" width="26" height="4" rx="2" fill="#fff" transform="rotate(-12 57 64)"/><circle cx="58" cy="44" r="3.5" fill="'+ac+'"/><path d="M58 48 L57 56 L52 62 M57 56 L63 61 M58 50 L66 47 M58 50 L50 52" stroke="'+ac+'" stroke-width="2.5" stroke-linecap="round" fill="none"/>';
  else if(under)f='<defs><linearGradient id="u'+id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#36c9bd"/><stop offset="1" stop-color="#063d4a"/></linearGradient></defs><rect width="120" height="120" fill="url(#u'+id+')"/><path d="M0 18 q15 -6 30 0 t30 0 t30 0 t30 0" stroke="#bff3ee" stroke-opacity=".6" stroke-width="2" fill="none"/><path d="M10 110 Q20 92 26 110 M90 110 Q96 88 104 110" stroke="#0a7d78" stroke-width="5" fill="none" stroke-linecap="round"/>'+
   (kind==='wreck'?'<path d="M30 104 L86 96 L80 108 L36 112 Z" fill="#33545b"/><path d="M52 98 L54 80" stroke="#33545b" stroke-width="3"/>':'')+
   '<g transform="translate(56 54) rotate(-12)"><ellipse cx="0" cy="0" rx="18" ry="5" fill="#06343c"/><circle cx="-20" cy="-2" r="5" fill="#06343c"/><rect x="-14" y="-10" width="16" height="6" rx="3" fill="'+ac+'"/><path d="M18 0 L30 -6 L30 6 Z" fill="#06343c"/></g><circle cx="38" cy="38" r="2.5" fill="none" stroke="#fff" stroke-opacity=".7"/><circle cx="34" cy="28" r="1.8" fill="none" stroke="#fff" stroke-opacity=".7"/><circle cx="37" cy="18" r="1.2" fill="none" stroke="#fff" stroke-opacity=".7"/>'+
   '<path d="M84 80 q8 -6 16 0 q-8 6 -16 0 Z M100 80 l5 -4 l0 8 Z" fill="#ffb347"/><path d="M70 94 q6 -4 12 0 q-6 4 -12 0 Z M82 94 l4 -3 l0 6 Z" fill="#ffd27a"/>';
  else if(kind==='raft'||kind==='canyon'||kind==='whitewater')f='<path d="M0 64 L20 40 L28 66 Z M120 60 L100 34 L92 66 Z" fill="#7d8f8c"/><path d="M14 86 q8 -6 16 0 t16 0 t16 0 t16 0 t16 0 t16 0" stroke="#fff" stroke-width="3" fill="none"/><path d="M36 76 Q60 86 84 76 L82 70 L38 70 Z" fill="'+ac+'"/><circle cx="50" cy="64" r="3" fill="#06343c"/><circle cx="70" cy="64" r="3" fill="#06343c"/><path d="M46 60 L42 76 M74 60 L80 76" stroke="#06343c" stroke-width="2"/>';
  else f='<path d="M28 70 L88 70 L82 82 L36 82 Z" fill="#fff"/><rect x="40" y="58" width="34" height="12" rx="2" fill="'+ac+'"/><rect x="44" y="61" width="5" height="4" fill="#fff"/><rect x="52" y="61" width="5" height="4" fill="#fff"/><rect x="60" y="61" width="5" height="4" fill="#fff"/><path d="M66 58 L66 48" stroke="#06343c" stroke-width="3"/><path d="M88 76 q10 2 20 -2" stroke="#fff" stroke-width="2" fill="none" stroke-opacity=".7"/>';
  return '<svg class="dmArt" viewBox="0 0 120 120" preserveAspectRatio="xMidYMid slice" aria-hidden="true">'+sky+f+'</svg>'}
 function artKind(v){var ma=modeActs(v);var k=ma[0]||Object.keys(v.acts)[0]||'';if(v.type==='marina')return 'marina';if(v.type==='ramp')return 'ramp';if(v.type==='launch')return 'kayak';if(v.type==='pier')return 'tour';return k}
