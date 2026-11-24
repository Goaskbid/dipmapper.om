/*! DipMapper review 23.70.0: shared validated climatology, no invented months. */
(function(W,D){'use strict';
var M=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'],names=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],days=[31,28.25,31,30,31,30,31,31,30,31,30,31],states=new WeakMap(),pending={};
function number(v){return typeof v==='number'&&Number.isFinite(v)}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function parse(j){
 var p=j&&j.properties&&j.properties.parameter,u=j&&j.parameters||{},head=j&&j.header||{},fill=head.fill_value;
 if(!p||!p.T2M_MAX||!p.PRECTOTCORR)throw Error('Missing monthly series');
 if(!/^(C|degC|celsius)$/i.test((u.T2M_MAX||{}).units||'')||!/^mm\/day$/i.test((u.PRECTOTCORR||{}).units||''))throw Error('Units not established');
 var t=[],r=[];M.forEach(function(m,i){var a=p.T2M_MAX[m],b=p.PRECTOTCORR[m];t.push(number(a)&&a!==fill&&a>=-90&&a<=65?a:null);r.push(number(b)&&b!==fill&&b>=0&&b<=200?b*days[i]:null)});
 if(!t.some(number)&&!r.some(number))throw Error('No valid climatology values');
 return{temperature:t,rain:r,start:head.start==null?null:String(head.start),end:head.end==null?null:String(head.end)};
}
function draw(el,x){
 var temps=x.temperature.filter(number),rain=x.rain.filter(number),lo=temps.length?Math.min.apply(null,temps)-3:0,hi=temps.length?Math.max.apply(null,temps)+3:10,maxR=Math.max.apply(null,rain.concat([60])),paths=[],path='';
 var s='<svg viewBox="0 0 480 172" role="img" aria-label="Monthly gridded climatology. Blank months mean missing data; exact values are in the table.">';
 for(var i=0;i<12;i++){var cx=20+40*i,t=x.temperature[i],r=x.rain[i];if(r!==null){var h=r/maxR*55;s+='<rect x="'+(cx-10)+'" y="'+(147-h)+'" width="20" height="'+h+'" fill="#427fa4"/><text x="'+cx+'" y="'+(141-h)+'" text-anchor="middle" font-size="11">'+Math.round(r)+'</text>'}
 if(t!==null){var y=67-(t-lo)/(hi-lo)*45;path+=(path?' L':'M')+cx+' '+y;s+='<text x="'+cx+'" y="'+(y-7)+'" text-anchor="middle" font-size="11" fill="#a04d20">'+Math.round(t)+' C</text>'}else if(path){paths.push(path);path=''}
 s+='<text x="'+cx+'" y="166" font-size="11" text-anchor="middle">'+names[i]+'</text>';
 }
 if(path)paths.push(path);paths.forEach(function(p){s+='<path d="'+p+'" stroke="#ae592b" fill="none" stroke-width="2"/>'});s+='</svg>';
 el.innerHTML='<h3>Climate by month</h3>'+s+'<p>Orange: average daily high, Celsius. Blue: estimated monthly rain, mm. Missing values stay blank. '+(x.start&&x.end?'Reference period: '+esc(x.start)+' to '+esc(x.end)+'.':'Reference period unavailable.')+' Gridded climatology, not a forecast or a beach measurement. Monthly rain is daily climatology multiplied by average days per month.</p><details><summary>Monthly values</summary><div class="tdTable"><table><thead><tr><th>Month</th><th>Average high, C</th><th>Estimated rain, mm</th></tr></thead><tbody>'+names.map(function(m,i){return '<tr><th>'+m+'</th><td>'+(x.temperature[i]===null?'Unavailable':x.temperature[i].toFixed(1))+'</td><td>'+(x.rain[i]===null?'Unavailable':x.rain[i].toFixed(1))+'</td></tr>'}).join('')+'</tbody></table></div></details><p><a href="https://power.larc.nasa.gov/docs/services/api/temporal/climatology/">NASA POWER climatology documentation</a></p>';
 el.hidden=false;
}
function render(el,force){if(!el)return;var a=el.dataset.la,b=el.dataset.lo,la=Number(a),lo=Number(b);if(a==null||b==null||!a.trim()||!b.trim()||!number(la)||!number(lo)||Math.abs(la)>90||Math.abs(lo)>180){var invalid='invalid:'+a+','+b;if(states.get(el)===invalid)return;states.set(el,invalid);el.textContent='Climatology needs a valid coordinate.';el.hidden=false;return}
 var key=la.toFixed(3)+','+lo.toFixed(3);if(!force&&states.get(el)===key)return;states.set(el,key);el.hidden=false;el.textContent='Loading gridded climatology...';
 if(!pending[key]){var ctl=new AbortController(),timer=setTimeout(function(){ctl.abort()},12000);
 pending[key]=fetch('https://power.larc.nasa.gov/api/temporal/climatology/point?parameters=T2M_MAX,PRECTOTCORR&community=RE&longitude='+lo.toFixed(3)+'&latitude='+la.toFixed(3)+'&format=JSON',{signal:ctl.signal}).then(function(r){if(!r.ok)throw Error('Climatology unavailable');return r.json()}).then(parse).catch(function(e){delete pending[key];throw e}).finally(function(){clearTimeout(timer)});}
 pending[key].then(function(x){if(states.get(el)===key)draw(el,x)}).catch(function(){if(states.get(el)!==key)return;el.textContent='Climatology unavailable. No values have been estimated. ';var b=D.createElement('button');b.type='button';b.textContent='Retry climate';b.onclick=function(){render(el,true)};el.appendChild(b)});
}
function all(){D.querySelectorAll('.t63Clim').forEach(function(e){render(e)})}
W.DMClimate={render:render,all:all,parse:parse};
if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',all);else all();
var queued=false;new MutationObserver(function(){if(!queued){queued=true;Promise.resolve().then(function(){queued=false;all()})}}).observe(D.documentElement,{childList:true,subtree:true});
})(window,document);
