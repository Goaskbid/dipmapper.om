/*! DipMapper (c) 2026 Torsten Sauter. All rights reserved. dipmapper.com/terms */
/* Review patch 23.70.0-audit1. Forecasts, astronomical estimates and annual
   classifications are different products. Never infer missing values as zero. */
(function (W, D) {
  'use strict';
  var R = Math.PI / 180, H = 3600000, DAY = 86400000;
  var SYN = 29.530588853, NM0 = Date.UTC(2000, 0, 6, 18, 14);
  var cache = Object.create(null), pending = Object.create(null), states = new WeakMap();
  function num(v) { return typeof v === 'number' && Number.isFinite(v); }
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function icon(n) { return '<svg class="ic" aria-hidden="true"><use href="/icons.svg#i-' + n + '"></use></svg>'; }
  function point(el) {
    var a = el.dataset.la, b = el.dataset.lo;
    if (a == null || b == null || !a.trim() || !b.trim()) return null;
    var la = Number(a), lo = Number(b);
    return num(la) && num(lo) && Math.abs(la) <= 90 && Math.abs(lo) <= 180 ? {la:la,lo:lo} : null;
  }
  function zone(s) { try { if (s) { new Intl.DateTimeFormat('en', {timeZone:s}).format(); return s; } } catch (e) {} return 'UTC'; }
  function parts(t, tz) {
    var out = {};
    new Intl.DateTimeFormat('en-GB', {timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(new Date(t)).forEach(function (p) { if (p.type !== 'literal') out[p.type] = +p.value; });
    return out;
  }
  function dayKey(t, tz) { var p = parts(t, tz); return p.year + '-' + p.month + '-' + p.day; }
  function noon(t, tz) {
    var p = parts(t, tz), target = Date.UTC(p.year,p.month-1,p.day,12), g = target;
    for (var i=0;i<3;i++) { var a=parts(g,tz); g += target-Date.UTC(a.year,a.month-1,a.day,a.hour,a.minute,a.second); }
    return new Date(g);
  }
  function time(t,tz) { return new Date(t).toLocaleTimeString('en-GB',{timeZone:tz,hour:'2-digit',minute:'2-digit'}); }
  function date(t,tz) { return new Date(t).toLocaleDateString('en-GB',{timeZone:tz,weekday:'short',day:'numeric',month:'short'}); }
  // Same approximate solar algorithm as the supplied release, anchored to civil noon.
  function sunEvent(dt,la,lo,alt,rising) {
    var lw=-lo*R,ph=la*R,J0=.0009,d=dt.getTime()/DAY+2440587.5-2451545;
    var n=Math.round(d-J0-lw/(2*Math.PI)),ds=J0+lw/(2*Math.PI)+n;
    var M=R*(357.5291+.98560028*ds),C=R*(1.9148*Math.sin(M)+.02*Math.sin(2*M)+.0003*Math.sin(3*M));
    var L=M+C+R*102.9372+Math.PI,dec=Math.asin(Math.sin(L)*Math.sin(R*23.4397));
    var Jn=2451545+ds+.0053*Math.sin(M)-.0069*Math.sin(2*L);
    var c=(Math.sin(alt*R)-Math.sin(ph)*Math.sin(dec))/(Math.cos(ph)*Math.cos(dec));
    if(c>1)return 'down'; if(c < -1)return 'up';
    var a=J0+(Math.acos(c)+lw)/(2*Math.PI)+n,Js=2451545+a+.0053*Math.sin(M)-.0069*Math.sin(2*L);
    return ((rising?Jn-(Js-Jn):Js)-2440587.5)*DAY;
  }
  function sunForDay(t,la,lo,tz) {
    var anchor=noon(t,zone(tz));
    return {rise:sunEvent(anchor,la,lo,-.833,true),set:sunEvent(anchor,la,lo,-.833,false),morning0:sunEvent(anchor,la,lo,0,true),morning6:sunEvent(anchor,la,lo,6,true),evening6:sunEvent(anchor,la,lo,6,false),evening0:sunEvent(anchor,la,lo,0,false)};
  }
  function moon(t) {
    var age=((t-NM0)/DAY)%SYN;if(age<0)age+=SYN;
    var p=age/SYN;
    return {p:p,ill:(1-Math.cos(2*Math.PI*p))/2,name:['New moon','Waxing crescent','First quarter','Waxing gibbous','Full moon','Waning gibbous','Last quarter','Waning crescent'][Math.floor(p*8+.5)%8],full:t+((.5-p+(p>.5?1:0))*SYN)*DAY,nw:t+(1-p)*SYN*DAY,age:age};
  }
  function moonSvg(p) {
    var r = 18, cx = 20, cy = 20, k = Math.cos(2 * Math.PI * p), rx = Math.abs(k) * r, s;
    if (p < 0.5) s = 'M' + cx + ' ' + (cy - r) + 'A' + r + ' ' + r + ' 0 0 1 ' + cx + ' ' + (cy + r) + 'A' + rx + ' ' + r + ' 0 0 ' + (k > 0 ? 0 : 1) + ' ' + cx + ' ' + (cy - r);
    else s = 'M' + cx + ' ' + (cy - r) + 'A' + r + ' ' + r + ' 0 0 0 ' + cx + ' ' + (cy + r) + 'A' + rx + ' ' + r + ' 0 0 ' + (k > 0 ? 1 : 0) + ' ' + cx + ' ' + (cy - r);
    return '<svg class="tdMoon" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="#1d3440"/><path d="' + s + '" fill="#f3e6b3"/><circle cx="20" cy="20" r="18" fill="none" stroke="#9fb3bb" stroke-width="1"/></svg>';
  }
  function distance(a,b,c,d) { var x=Math.sin((c-a)*R/2),y=Math.sin((d-b)*R/2),v=x*x+Math.cos(a*R)*Math.cos(c*R)*y*y;return 12742*Math.asin(Math.sqrt(Math.max(0,Math.min(1,v)))); }
  function json(url,ttl) {
    var isForecast=url.indexOf('locationforecast/2.0/compact?')>=0||url.indexOf('/api/forecast?')===0;
    var storageKey='dm_forecast_review2370_'+url;
    if(isForecast&&!cache[url]){try{var saved=JSON.parse(localStorage.getItem(storageKey)||'null');if(saved&&num(saved.until)&&saved.until>Date.now()&&saved.value)cache[url]=saved;else if(saved)localStorage.removeItem(storageKey);}catch(e){}}
    var hit=cache[url];if(hit && Date.now()<hit.until)return Promise.resolve(hit.value);
    if(pending[url])return pending[url];
    var ctl=typeof AbortController!=='undefined'?new AbortController():null;
    var timer=setTimeout(function(){if(ctl)ctl.abort();},12000);
    var until=Date.now()+ttl;
    pending[url]=fetch(url,{credentials:'omit',signal:ctl?ctl.signal:undefined}).then(function(r){
      if(!r.ok)throw new Error('Data unavailable ('+r.status+')');
      if(isForecast){var exp=Date.parse(r.headers.get('Expires')||''),cc=(r.headers.get('Cache-Control')||'').match(/(?:^|,)\s*max-age\s*=\s*(\d+)/i);until=num(exp)&&exp>Date.now()?exp:cc?Date.now()+Math.min(86400,Number(cc[1]))*1000:until;if(/no-store/i.test(r.headers.get('Cache-Control')||''))until=Date.now()}
      return r.json();
    }).then(function(value){
      if(isForecast&&(!value||!value.properties||!Array.isArray(value.properties.timeseries)||!value.properties.meta||!value.properties.meta.units))throw new Error('Invalid forecast schema');
      cache[url]={value:value,until:until};
      if(isForecast){try{var keys=[];for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&k.indexOf('dm_forecast_review2370_')===0)keys.push(k)}
        keys.forEach(function(k){try{var v=JSON.parse(localStorage.getItem(k));if(!v||v.until<=Date.now())localStorage.removeItem(k)}catch(e){localStorage.removeItem(k)}});
        // Keep at most eight cached locations, removing only this module's keys.
        keys=keys.filter(function(k){return localStorage.getItem(k)!==null&&k!==storageKey});while(keys.length>=8)localStorage.removeItem(keys.shift());localStorage.setItem(storageKey,JSON.stringify(cache[url]));}catch(e){}}
      return value;
    }).finally(function(){clearTimeout(timer);delete pending[url];});
    return pending[url];
  }
  function forecast(j,now) {
    var pr=j&&j.properties,meta=pr&&pr.meta,units=meta&&meta.units;
    if(!pr||!Array.isArray(pr.timeseries)||!units)throw new Error('Forecast schema is unavailable');
    var series=pr.timeseries.map(function(p){return {t:Date.parse(p.time),d:p.data};}).filter(function(p){return num(p.t)&&p.d&&p.d.instant&&p.d.instant.details;}).sort(function(a,b){return a.t-b.t;});
    var current=series.filter(function(p){return Math.abs(p.t-now)<=90*60000;}).sort(function(a,b){return Math.abs(a.t-now)-Math.abs(b.t-now);})[0];
    if(!current)throw new Error('No forecast close to the current time');
    var instant=current.d.instant.details;
    var start=Math.ceil(now/H)*H,end=start+24*H;
    var window=series.filter(function(p){return p.t>=start&&p.t<=end;});
    var vals=window.map(function(p){return p.d.instant.details.air_temperature;}).filter(num);
    var covered=window.length===25&&window.every(function(p,i){return p.t===start+i*H;});
    var cursor=start,total=0;
    if(units.precipitation_amount==='mm'){
      while(cursor<end){
        var row=series.find(function(p){return p.t===cursor;});if(!row)break;
        var span=[1,6,12].find(function(h){var d=row.d['next_'+h+'_hours'];return cursor+h*H<=end&&d&&d.details&&num(d.details.precipitation_amount)&&d.details.precipitation_amount>=0;});
        if(!span)break; total+=row.d['next_'+span+'_hours'].details.precipitation_amount;cursor+=span*H;
      }
    }
    return {t:current.t,updated:Date.parse(meta.updated_at),temperature:units.air_temperature==='celsius'&&num(instant.air_temperature)?instant.air_temperature:null,wind:units.wind_speed==='m/s'&&num(instant.wind_speed)&&instant.wind_speed>=0?instant.wind_speed:null,min:units.air_temperature==='celsius'&&covered&&vals.length===window.length?Math.min.apply(null,vals):null,max:units.air_temperature==='celsius'&&covered&&vals.length===window.length?Math.max.apply(null,vals):null,rain:cursor===end?total:null,start:start,end:end};
  }
  function retry(el,label,action) { var b=D.createElement('button');b.type='button';b.className='tdRetry';b.textContent=label;b.addEventListener('click',action);el.appendChild(D.createTextNode(' '));el.appendChild(b); }
  function card(label,cls,text) { return '<section class="tdC '+cls+'"><h3 class="tdL">'+label+'</h3><p>'+text+'</p></section>'; }
    // Preserve the release's lunar calculation, with its degree/radian conversion corrected.
  function mPos(t,la,lo) {
    var d=t/DAY-0.5+2440588-2451545,e=R*23.4397,lw=R*-lo,ph=R*la;
    var L=R*(218.316+13.176396*d),M=R*(134.963+13.064993*d),F=R*(93.272+13.229350*d);
    var l=L+R*6.289*Math.sin(M),b=R*5.128*Math.sin(F);
    var ra=Math.atan2(Math.sin(l)*Math.cos(e)-Math.tan(b)*Math.sin(e),Math.cos(l));
    var dec=Math.asin(Math.sin(b)*Math.cos(e)+Math.cos(b)*Math.sin(e)*Math.sin(l));
    var ha=R*(280.16+360.9856235*d)-lw-ra,h=Math.asin(Math.sin(ph)*Math.sin(dec)+Math.cos(ph)*Math.cos(dec)*Math.cos(ha));
    var ref=Math.max(0,h);
    return h+R*0.017/Math.tan(ref+R*R*10.26/(ref+R*5.10));
  }
  function midnight(t,tz) {
    var p=parts(t,tz),g=Date.UTC(p.year,p.month-1,p.day),target=g;
    for(var i=0;i<4;i++){var a=parts(g,tz);g+=target-Date.UTC(a.year,a.month-1,a.day,a.hour,a.minute,a.second);}
    return g;
  }
  function moonEvents(t,la,lo,tz) {
    var start=midnight(t,tz),end=midnight(start+36*H,tz),step=10*60000;
    var out={rise:null,set:null,start:start,end:end},threshold=.133*R,prev=mPos(start,la,lo)-threshold;
    for(var at=start+step;at<=end;at+=step){var h=mPos(at,la,lo)-threshold;
      if(prev<0&&h>=0&&out.rise===null)out.rise=at-step*h/(h-prev);
      if(prev>=0&&h<0&&out.set===null)out.set=at-step*h/(h-prev);
      prev=h;
    }
    return out;
  }
  function timelineRows(j,now,la,lo,tz) {
    var pr=j&&j.properties||{},u=pr.meta&&pr.meta.units||{},by=Object.create(null),start=Math.ceil(now/H)*H,out=[];
    (pr.timeseries||[]).forEach(function(x){var t=Date.parse(x.time);if(num(t)&&x.data)by[t]=x.data;});
    for(var i=0;i<24;i++){
      var t=start+i*H,d=by[t],v=d&&d.instant&&d.instant.details||{},rain=d&&d.next_1_hours&&d.next_1_hours.details||{};
      var T=u.air_temperature==='celsius'&&num(v.air_temperature)?v.air_temperature:null;
      var w=u.wind_speed==='m/s'&&num(v.wind_speed)&&v.wind_speed>=0?v.wind_speed:null;
      var r=u.precipitation_amount==='mm'&&num(rain.precipitation_amount)&&rain.precipitation_amount>=0?rain.precipitation_amount:null;
      var sun=sunForDay(t+H/2,la,lo,tz),light=sun.rise==='up'||(num(sun.rise)&&num(sun.set)&&t>=sun.rise&&t+H<=sun.set);
      out.push({t:t,T:T,w:w,r:r,light:!!light,match:!!light&&w!==null&&r!==null&&w<=5&&r<=.2});
    }
    return out;
  }
  function timeline(el,j,pt,tz,now,tide) {
    var box=el.querySelector('.tdTl');if(!box)return;box.hidden=false;
    var rows=timelineRows(j,now,pt.la,pt.lo,tz),W=Math.max(300,Math.min(720,(box.clientWidth||720)-24)),cw=W/24,h=140,temps=rows.filter(function(r){return r.T!==null;}).map(function(r){return r.T;});
    var mn=temps.length?Math.min.apply(null,temps)-2:0,mx=temps.length?Math.max.apply(null,temps)+2:1;
    var paths=[],path='',best=[],run=[];
    var svg='<svg viewBox="0 0 '+W+' 162" role="img" aria-label="24 fixed hourly columns. Missing forecast data remain blank. See the accessible table below.">';
    rows.forEach(function(r,i){
      svg+='<rect x="'+(i*cw)+'" y="0" width="'+cw+'" height="'+h+'" fill="'+(r.match?'#dff3e6':r.light?'#fff8e7':'#e5ebf2')+'"/>';
      if(r.r!==null)svg+='<rect x="'+(i*cw+9)+'" y="'+(h-Math.min(50,r.r*8))+'" width="10" height="'+Math.min(50,r.r*8)+'" fill="#467fa0"/>';
      if(r.T!==null){path+=(path?' L':'M')+(i*cw+cw/2)+' '+(110-(r.T-mn)/(mx-mn)*85);}
      else if(path){paths.push(path);path='';}
      if(i%(W<520?6:3)===0)svg+='<text x="'+(i*cw+2)+'" y="157" font-size="12" fill="#244150">'+time(r.t,tz)+'</text>';
      if(r.match){run.push(r);if(run.length>best.length)best=run.slice();}else run=[];
    });
    if(path)paths.push(path);paths.forEach(function(p){svg+='<path d="'+p+'" fill="none" stroke="#bd5a24" stroke-width="2"/>';});
    var tideNote='';
    if(tide&&tide.hc&&typeof tide.datum==='string'&&tide.datum.trim()&&WINDOWNUMHEIGHT()){
      var tv=rows.map(function(r){try{var x=WINDHEIGHT(tide.hc,r.t);return num(x)?x:null;}catch(e){return null;}});
      var valid=tv.filter(num);if(valid.length===24){var lo=Math.min.apply(null,valid),hi=Math.max.apply(null,valid),tp='';
        tv.forEach(function(v,i){tp+=(i?' L':'M')+(i*cw+cw/2)+' '+(125-(v-lo)/Math.max(.01,hi-lo)*40);});
        svg+='<path d="'+tp+'" stroke="#5366ab" stroke-width="2" stroke-dasharray="4 3" fill="none"/>';
        tideNote=' Dashed line: reference tide model on its own relative scale, datum '+esc(tide.datum)+'.';
      }
    }
    svg+='</svg>';
    function WINDOWNUMHEIGHT(){return typeof window.DMTide==='object'&&typeof window.DMTide.height==='function';}
    function WINDHEIGHT(hc,t){return window.DMTide.height(hc,t);}
    var available=rows.filter(function(r){return r.w!==null&&r.r!==null;}).length;
    var txt=best.length?'Longest complete daylight run meeting the displayed thresholds: '+date(best[0].t,tz)+' '+time(best[0].t,tz)+' to '+time(best[best.length-1].t+H,tz)+'.':'No complete daylight run meets these thresholds in the available data.';
    box.hidden=false;
    box.innerHTML='<h3>Next 24 hours: model forecast</h3><p>'+esc(date(rows[0].t,tz))+' '+time(rows[0].t,tz)+' onwards | '+esc(tz)+'. '+available+'/24 hours have both wind and one-hour rain data.</p>'+svg+
      '<p class="tdLegend">Orange: temperature trend. Blue bars: hourly rain, capped at 6.25 mm in the chart; exact amounts below. Green: whole daylight hour, wind at most 5 m/s and forecast rain at most 0.2 mm. Gaps stay blank.'+tideNote+'</p>'+
      '<p>'+txt+' This is a weather filter, not a swimming, boating or wildlife-encounter verdict.</p>'+
      '<details><summary>Hourly values and missing data</summary><div class="tdTable"><table><caption>Forecast at the selected point, '+esc(tz)+'</caption><thead><tr><th>Time</th><th>Air, C</th><th>Wind, m/s</th><th>Next-hour rain, mm</th></tr></thead><tbody>'+
      rows.map(function(r){return '<tr><th>'+esc(date(r.t,tz))+' '+time(r.t,tz)+'</th><td>'+(r.T===null?'Unavailable':r.T.toFixed(1))+'</td><td>'+(r.w===null?'Unavailable':r.w.toFixed(1))+'</td><td>'+(r.r===null?'Unavailable':r.r.toFixed(1))+'</td></tr>';}).join('')+'</tbody></table></div></details>';
  }

  function render(el,force) {
    if(!el||!el.dataset)return;
    var pt=point(el);
    if(!pt){states.delete(el);el.hidden=false;el.textContent='A valid latitude and longitude are needed for this panel.';return;}
    var now=Date.now(),tz=zone(el.dataset.tz),label=el.dataset.name||'this location';
    var key=pt.la+','+pt.lo+'|'+tz+'|'+dayKey(now,tz)+'|'+label,old=states.get(el);
    if(!force&&old&&old.key===key&&now-old.t<30*60000)return;
    var state={key:key,t:now,forecast:null,tide:null};states.set(el,state);
    function active(){return states.get(el)===state;}
    var sun=sunForDay(now,pt.la,pt.lo,tz),m=moon(now),sunTxt;
    if(sun.rise==='down')sunTxt='The sun stays below the horizon on this date.';
    else if(sun.rise==='up')sunTxt='The sun does not set on this date.';
    else sunTxt='<b>'+time(sun.rise,tz)+'</b> sunrise, <b>'+time(sun.set,tz)+'</b> sunset';
    var golden=[];
    if(num(sun.morning0)&&num(sun.morning6))golden.push(time(sun.morning0,tz)+' - '+time(sun.morning6,tz));
    if(num(sun.evening6)&&num(sun.evening0))golden.push(time(sun.evening6,tz)+' - '+time(sun.evening0,tz));
    if(golden.length)sunTxt+='<br><span class="tdS">Low sun: '+golden.join('; ')+'</span>';
    el.innerHTML='<div class="tdHd"><h2>'+icon('sunrise')+' Today at the water <small>'+esc(date(now,tz))+' | '+esc(label)+'</small></h2><p class="tdZone">Times: '+esc(tz)+(el.dataset.tz?'':' (location timezone not supplied)')+'.</p></div><div class="tdG">'+
      (el.dataset.sun==='0'?'':card(icon('sunrise')+' Sun','tdSun',sunTxt))+
      '<section class="tdC tdMo">'+moonSvg(m.p)+'<div><h3 class="tdL">Approximate moon phase</h3><p><b>'+m.name+'</b>, about '+Math.round(m.ill*100)+'% lit<br><span class="tdS">Mean full moon around '+date(m.full,tz)+'; new moon around '+date(m.nw,tz)+'.</span></p></div></section>'+
      card(icon('wave')+' Reference tide model','tdTi','Checking model coverage...')+
      card(icon('wind')+' Weather forecast','tdWx','Loading forecast...')+
      card(icon('drop')+' Annual bathing-water classification','tdWq','Checking published site records...')+'</div><p class="tdNote">Sun and moon are approximate calculations. Forecasts and reference tide times are not observations or swimming-safety assessments. Annual water classifications do not establish current conditions at this point.</p>';
    el.hidden=false;
    var tlBox=D.createElement('section');tlBox.className='tdTl';tlBox.hidden=true;el.appendChild(tlBox);
    var ev=moonEvents(now,pt.la,pt.lo,tz),mo=el.querySelector('.tdMo p');
    mo.innerHTML+='<br><span class="tdS">Estimated lunar horizon crossings on '+esc(date(now,tz))+': '+(num(ev.rise)?'rise '+time(ev.rise,tz):'no rise in this civil day')+'; '+(num(ev.set)?'set '+time(ev.set,tz):'no set in this civil day')+'. Approximate, not an ephemeris service.</span>';
    var gl=D.getElementById('gl');
    if(gl&&Number(gl.dataset.la)===pt.la&&Number(gl.dataset.lo)===pt.lo)gl.innerHTML='<b>'+(golden.length?golden.join('; '):'No complete low-sun window on this date')+'</b><br><small>'+esc(date(now,tz))+' | '+esc(tz)+'. Sun approximately 0 to 6 degrees above the horizon.</small>';
    var ti=el.querySelector('.tdTi p'),done=false;
    var tideTimer=setTimeout(function(){if(active()&&!done){ti.textContent='The tide model did not respond. Check a local tide-table source.';done=true;}},12000);
    if(W.DMTide&&typeof W.DMTide.forPoint==='function'&&typeof W.DMTide.extremes==='function'){
      try{W.DMTide.forPoint(pt.la,pt.lo,function(r){
        if(!active()||done)return;done=true;clearTimeout(tideTimer);
        if(r&&r.hc){state.tide=r;if(state.forecast)timeline(el,state.forecast,pt,tz,Date.now(),r);}
        if(!r||!r.hc){ti.textContent='No tide-model data are available for this point. This does not establish an absence of tides.';return;}
        try{
          var events=W.DMTide.extremes(r.hc,now,now+30*H);
          if(!Array.isArray(events))throw new Error('Invalid model output');
          events=events.filter(function(e){return e&&num(e.t)&&e.t>=now&&e.t<=now+30*H&&typeof e.hi==='boolean';}).sort(function(a,b){return a.t-b.t;}).slice(0,4);
          if(!events.length){ti.textContent='No validated turning points were returned for the next 30 hours.';return;}
          var datum=typeof r.datum==='string'&&r.datum.trim()?r.datum.trim():'';
          ti.innerHTML='<span class="tdTG">'+events.map(function(e){return '<span class="tdT '+(e.hi?'hi':'lo')+'">'+(e.hi?'High':'Low')+' <b>'+time(e.t,tz)+'</b><small>'+esc(date(e.t,tz))+(datum&&num(e.h)?' | '+e.h.toFixed(1)+' m':'')+'</small></span>';}).join('')+'</span><span class="tdS">'+(num(r.km)?'Reference model point '+r.km.toFixed(1)+' km away. ':'Reference-point distance not supplied. ')+(datum?'Height datum: '+esc(datum)+'.':'Heights hidden: datum not supplied.')+'</span>';
        }catch(e){ti.textContent='The tide-model response could not be validated.';}
      });}catch(e){clearTimeout(tideTimer);ti.textContent='The tide model is unavailable.';}
    }else{clearTimeout(tideTimer);ti.textContent='The tide-model module is unavailable. Check a local tide-table source.';}
    var wx=el.querySelector('.tdWx p');
    function loadWeather(){
      wx.textContent='Loading forecast...';
      // Preserve the supplied MET provider for the existing low-volume path.
      // Set window.DM_FORECAST_ENDPOINT='/api/forecast' only after the tested
      // same-origin integration is deployed and the owner accepts its terms.
      var endpoint=W.DM_FORECAST_ENDPOINT==='/api/forecast'?'/api/forecast':'https://api.met.no/weatherapi/locationforecast/2.0/compact';
      var url=endpoint+'?lat='+pt.la.toFixed(3)+'&lon='+pt.lo.toFixed(3);
      return json(url,H/2).then(function(j){
        if(!active())return;var f=forecast(j,Date.now());state.forecast=j;timeline(el,j,pt,tz,Date.now(),state.tide);
        wx.innerHTML=(f.temperature==null?'Temperature unavailable':'<b>'+Math.round(f.temperature)+'\u00b0C</b>')+' | forecast for '+time(f.t,tz)+'<br><span class="tdS">'+(f.wind==null?'Wind unavailable':'Wind '+f.wind.toFixed(1)+' m/s')+(f.min==null?'':'; next 24 h '+Math.round(f.min)+' to '+Math.round(f.max)+'\u00b0C')+'<br>'+(f.rain==null?'24-hour rainfall total unavailable':f.rain.toFixed(1)+' mm forecast rain over 24 h from '+time(f.start,tz))+(num(f.updated)?'<br>Model updated '+date(f.updated,tz)+' '+time(f.updated,tz):'')+'<br><a href="https://docs.api.met.no/doc/locationforecast/datamodel.html" target="_blank" rel="noopener">MET Norway forecast</a> | <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a>. Displayed values rounded; 24-hour totals aggregated.</span>';
      }).catch(function(){if(active()){wx.textContent='Forecast unavailable. No values have been estimated.';retry(wx,'Retry forecast',loadWeather);}});
    }
    loadWeather();
    var wq=el.querySelector('.tdWq p');
    json('/water/index.json',H).then(function(ix){
      if(!ix||!num(ix.tile_deg)||ix.tile_deg<.05||ix.tile_deg>180||!Array.isArray(ix.tiles))throw new Error('No water index');
      var d=ix.tile_deg,dy=9/111.2,dx=9/(111.2*Math.max(.01,Math.cos(pt.la*R))),keys=[];
      if((Math.floor((pt.la+dy)/d)-Math.floor((pt.la-dy)/d)+1)*(Math.floor((pt.lo+dx)/d)-Math.floor((pt.lo-dx)/d)+1)>256)throw new Error('Unsupported tile density');
      for(var a=Math.floor((pt.la-dy)/d);a<=Math.floor((pt.la+dy)/d);a++)for(var b=Math.floor((pt.lo-dx)/d);b<=Math.floor((pt.lo+dx)/d);b++){
        if(keys.length>=16)break;var lo=((b*d+180)%360+360)%360-180;var k=Number((a*d).toFixed(6))+'_'+Number(lo.toFixed(6));if(ix.tiles.indexOf(k)>=0&&keys.indexOf(k)<0)keys.push(k);
      }
      return Promise.all(keys.map(function(k){return json('/water/w_'+encodeURIComponent(k)+'.json',H).catch(function(){return null;});}));
    }).then(function(tiles){
      if(!active())return;var best=null,dist=9;
      tiles.forEach(function(tile){if(!tile||!Array.isArray(tile.p)||!Array.isArray(tile.y))return;var years=tile.y.map(Number),year=Math.max.apply(null,years.filter(function(y){return Number.isInteger(y)&&y>=2000&&y<=new Date(now).getUTCFullYear();})),yi=years.indexOf(year);if(yi<0)return;
        tile.p.forEach(function(p){if(!Array.isArray(p)||!num(p[0])||!num(p[1])||Math.abs(p[0])>90||Math.abs(p[1])>180)return;var dd=distance(pt.la,pt.lo,p[0],p[1]);if(dd<dist){dist=dd;best={name:String(p[2]||'Unnamed monitoring site'),year:year,code:typeof p[5]==='string'?p[5].charAt(yi):''};}});
      });
      if(!best){wq.textContent='No nearby annual classification is available in the supplied dataset. This is not a current water-quality check.';return;}
      var names={E:'Excellent',G:'Good',S:'Sufficient',P:'Poor',N:'Not classified'},code=Object.prototype.hasOwnProperty.call(names,best.code)?best.code:'N';
      wq.innerHTML='<b class="wq'+code+'">'+names[code]+'</b> | '+best.year+' annual classification<br><span class="tdS">'+esc(best.name)+'<br>'+dist.toFixed(1)+' km straight-line distance. A nearby monitoring site, not a reading at your location.<br><a href="https://www.eea.europa.eu/en/topics/in-depth/bathing-water" target="_blank" rel="noopener">EEA annual bathing-water data</a>. Check local notices before swimming.</span>';
    }).catch(function(){if(active())wq.textContent='Annual classification data are unavailable. Current bathing status is unknown.';});
  }
  function all(force){D.querySelectorAll('.dmToday').forEach(function(el){render(el,force);});}
  W.DMToday={render:render,all:all,moon:moon,sun:sunEvent,sunForDay:sunForDay,moonEvents:moonEvents};
  if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',function(){all(false);});else all(false);
  D.addEventListener('visibilitychange',function(){if(!D.hidden)all(false);});
  setInterval(function(){if(!D.hidden)all(false);},60000);
})(window,document);
