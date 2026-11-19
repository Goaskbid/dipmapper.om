
/* DipMapper v22 - UI behaviour layer + app-launch boot. Additive only. */
(function(){
 var SW_MARK='DIPMAPPER_SW_V23';
 /* App boot: register the offline worker + manifest ONLY when the deployed files verify.
    If /sw.js is not our verified worker, fall back to the old cleanup (unregister all, clear caches). */
 window.dmAppBoot=function(){
  if(window.__dmBooted)return;window.__dmBooted=true;
  if(location.protocol==='file:'||!('serviceWorker' in navigator))return;
  fetch('/sw.js',{cache:'no-store'}).then(function(r){return r.ok?r.text():''}).then(function(t){
   if(t.indexOf(SW_MARK)>=0){
    navigator.serviceWorker.register('/sw.js',{scope:'/'}).catch(function(){});
    try{caches.keys().then(function(ks){ks.forEach(function(k){if(k.indexOf('dipmapper-')!==0)caches.delete(k)})})}catch(e){}
   }else{
    navigator.serviceWorker.getRegistrations().then(function(rs){rs.forEach(function(r){r.unregister()})}).catch(function(){});
    try{caches.keys().then(function(ks){ks.forEach(function(k){caches.delete(k)})})}catch(e){}
   }
  }).catch(function(){});
  fetch('/manifest.webmanifest',{cache:'no-store'}).then(function(r){return r.ok?r.json():null}).then(function(j){
   if(j&&/DipMapper/.test(j.name||'')&&!document.querySelector('link[rel="manifest"]')){
    var l=document.createElement('link');l.rel='manifest';l.href='/manifest.webmanifest';document.head.appendChild(l);
   }
  }).catch(function(){});
 };
 /* Install button: appears only when the browser says the app is installable */
 var deferred=null;
 addEventListener('beforeinstallprompt',function(e){e.preventDefault();deferred=e;
  var nav=document.querySelector('.topbar .nav');if(!nav||document.getElementById('dmInstall'))return;
  var b=document.createElement('button');b.id='dmInstall';b.type='button';b.textContent='Install app';
  b.onclick=function(){if(!deferred)return;deferred.prompt();deferred.userChoice.finally(function(){deferred=null;b.remove()})};
  nav.insertBefore(b,nav.firstChild);
 });
 addEventListener('appinstalled',function(){var b=document.getElementById('dmInstall');if(b)b.remove()});
 /* Images that fail: tiles go invisible (no broken icons), photos get an illustrated fallback */
 document.addEventListener('error',function(e){var im=e.target;if(!im||im.tagName!=='IMG')return;
  if(im.closest('.dmTiles')){im.style.visibility='hidden';return}
  var box=im.closest('.thumb,.photo,.gallery button');if(box)box.classList.add('dmImgFail');
 },true);
 /* Card <-> map: hovering a spot lights up its buoy on the map */
 var hot=null;
 function paint(){var ov=document.querySelector('#map .dmOverlay');if(!ov)return;
  var sel=(typeof state!=='undefined'&&state&&state.selected)?String(state.selected):null;
  ov.querySelectorAll('.marker.dmHot,.marker.dmSel').forEach(function(m){m.classList.remove('dmHot','dmSel')});
  if(hot){var m=ov.querySelector('.marker[data-mid="'+CSS.escape(hot)+'"]');if(m)m.classList.add('dmHot')}
  if(sel){var m2=ov.querySelector('.marker[data-mid="'+CSS.escape(sel)+'"]');if(m2)m2.classList.add('dmSel')}}
 document.addEventListener('mouseover',function(e){var c=e.target.closest&&e.target.closest('#results .result');var id=c?c.getAttribute('data-card-id'):null;if(id!==hot){hot=id;paint()}});
 function watch(){var mp=document.getElementById('map');if(!mp)return;new MutationObserver(paint).observe(mp,{childList:true,subtree:true})}
 if(document.readyState!=='loading')watch();else document.addEventListener('DOMContentLoaded',watch);
 setInterval(paint,1500);
 if(document.readyState==='complete')window.dmAppBoot();else addEventListener('load',function(){window.dmAppBoot()});
 /* Desktop: filters collapse to two rows; every filter stays one click away */
 function setupFilters(){var f=document.getElementById('filters');if(!f||document.getElementById('dmMoreFilters'))return;
  var b=document.createElement('button');b.type='button';b.id='dmMoreFilters';
  function label(){var n=f.querySelectorAll('.filter').length;b.textContent=f.classList.contains('dmCollapsed')?('Show all '+n+' filters'):'Show fewer filters';b.setAttribute('aria-expanded',f.classList.contains('dmCollapsed')?'false':'true')}
  f.classList.add('dmCollapsed');f.parentNode.insertBefore(b,f.nextSibling);label();
  b.onclick=function(){f.classList.toggle('dmCollapsed');label()};
  new MutationObserver(function(){var a=f.querySelector('.filter.active');if(a&&f.classList.contains('dmCollapsed')&&(a.getBoundingClientRect().top-f.getBoundingClientRect().top)>60){f.classList.remove('dmCollapsed')}label()}).observe(f,{childList:true});}
 if(document.readyState!=='loading')setupFilters();else document.addEventListener('DOMContentLoaded',setupFilters);
 /* Wide screens: spot list beside a pinned map (same section, moved; moved back below 1100px) */
 function dmSplit(){var below=document.getElementById('dmBelow'),aside=document.getElementById('resultsPanel'),shell=document.querySelector('.shell');
  if(!below||!aside||!shell)return false;var w=innerWidth,mode=w>=980?'split':'phone',root=document.documentElement;
  if(mode!=='tab'&&below.parentNode!==aside)aside.appendChild(below);
  else if(mode==='tab'&&below.parentNode===aside)shell.parentNode.insertBefore(below,shell.nextSibling);
  root.classList.toggle('dmSplit',mode==='split');root.classList.toggle('dmPhone',mode==='phone');
  try{var fl=document.getElementById('filters'),fb=document.getElementById('dmFiltersBtn'),more=document.getElementById('dmMoreFilters');
   if(fl){if(!fl.__home){fl.__home=fl.parentNode;fl.__next=more||fl.nextSibling}
    var lh=document.querySelector('.listHead');if(lh&&!lh.__home){lh.__home=lh.parentNode;lh.__next=lh.nextSibling}
    if(mode==='phone'){var bh=below.querySelector('.dmBelowHead');var anchor=bh||below.firstChild;if(lh&&(lh.parentNode!==below||lh.nextSibling!==anchor))below.insertBefore(lh,anchor);var a2=lh&&lh.parentNode===below?lh:anchor;if(fl.parentNode!==below||fl.nextSibling!==a2){below.insertBefore(fl,a2)}if(fb&&fb.nextSibling!==fl)below.insertBefore(fb,fl)}
    else if(fl.parentNode===below){if(lh&&lh.parentNode===below)lh.__home.insertBefore(lh,lh.__next&&lh.__next.parentNode===lh.__home?lh.__next:null);fl.__home.insertBefore(fl,fl.__next&&fl.__next.parentNode===fl.__home?fl.__next:null);if(fb)fl.__home.insertBefore(fb,fl)}}}catch(e){}
  try{var tb=document.querySelector('.topbar'),cs=tb&&getComputedStyle(tb);root.style.setProperty('--dmHead',(tb&&/sticky|fixed/.test(cs.position)?Math.ceil(tb.getBoundingClientRect().height):0)+'px')}catch(e){}
  try{state._tileSig=null;drawMap()}catch(e){}return true}
 (function waitBelow(n){if(!dmSplit()&&n<80)setTimeout(function(){waitBelow(n+1)},150)})(0);
 var _rs,_lw=innerWidth;addEventListener('resize',function(){clearTimeout(_rs);_rs=setTimeout(function(){if(Math.abs(innerWidth-_lw)<2)return;_lw=innerWidth;dmSplit()},180)});
 /* ---------- v22.3 "fun" layer ---------- */
 var RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
 /* rank buoy on every card + water-temperature colour */
 function dmDecorate(){var cards=document.querySelectorAll('#results .result');
  cards.forEach(function(c){var th=c.querySelector('.thumb');var m=c.querySelector('.resultMeta span');
   if(m){var r=(m.textContent.trim().match(/^\d+/)||[''])[0];var b=c.querySelector(':scope>.dmRank');
    if(r){if(!b){b=document.createElement('span');b.className='dmRank';b.setAttribute('aria-hidden','true');c.appendChild(b)}if(b.textContent!==r)b.textContent=r}}
   c.querySelectorAll('.chip.temp').forEach(function(ch){var t=parseFloat((ch.textContent.match(/(-?\d+(?:\.\d+)?)\s*\u00b0C/)||[])[1]);
    if(isNaN(t))return;var k=t<17?'cold':t<20?'cool':t<23?'mild':'warm';if(ch.dataset.dmT!==k){ch.classList.remove('dmT-cold','dmT-cool','dmT-mild','dmT-warm');ch.classList.add('dmT-'+k);ch.dataset.dmT=k}})})}
 setInterval(function(){try{dmDecorate()}catch(e){}},1200);
 function dmDecWatch(){var r=document.getElementById('results');if(!r)return;new MutationObserver(window.dmRafOnce?dmRafOnce(dmDecorate):function(){dmDecorate()}).observe(r,{childList:true,subtree:true});dmDecorate()}
 if(document.readyState!=='loading')dmDecWatch();else document.addEventListener('DOMContentLoaded',dmDecWatch);
 /* splash ripple when you open a spot */
 addEventListener('pointerdown',function(e){if(RM)return;var t=e.target.closest&&e.target.closest('.openPlace,#results .result[data-open],#map .marker:not(.parking)');if(!t)return;
  var sp=document.createElement('span');sp.className='dmSplash';sp.style.left=e.clientX+'px';sp.style.top=e.clientY+'px';
  sp.innerHTML='<i></i><i></i><i></i>';document.body.appendChild(sp);setTimeout(function(){sp.remove()},900)},true);
 /* phone: floating Map / List switch */
 function dmFab(){if(document.getElementById('dmFab'))return;var f=document.createElement('button');f.id='dmFab';f.type='button';
  f.innerHTML='<span class="ic" aria-hidden="true">\uD83D\uDDFA\uFE0F</span><span class="tx">Map</span>';document.body.appendChild(f);
  var onMap=false;function set(v){onMap=v;f.querySelector('.tx').textContent=v?'List':'Map';f.querySelector('.ic').textContent=v?'\u2630':'\uD83D\uDDFA\uFE0F';f.setAttribute('aria-label',v?'Show the list of spots':'Show the map')}
  f.onclick=function(){var t=document.getElementById(onMap?'resultsPanel':'mapPanel');if(t)t.scrollIntoView({behavior:RM?'instant':'smooth',block:'start'})};
  var mp=document.getElementById('map');if(mp&&'IntersectionObserver' in window)new IntersectionObserver(function(es){set(es[0].intersectionRatio>0.45)},{threshold:[0,0.45,1]}).observe(mp);set(false)}
 if(document.readyState!=='loading')dmFab();else document.addEventListener('DOMContentLoaded',dmFab);
 /* start screen: bubbles rising from the water */
 (function(){var w=document.querySelector('.gate .dmWater');if(!w||RM)return;var b=document.createElement('div');b.className='dmBubbles';b.setAttribute('aria-hidden','true');
  for(var i=0;i<9;i++){var x=document.createElement('i');x.style.left=(6+i*11)+'%';x.style.animationDelay=(i*.7%4.2)+'s';x.style.width=x.style.height=(5+(i*7%9))+'px';b.appendChild(x)}w.parentNode.insertBefore(b,w)})();
 /* iPhone/iPad: Safari has no install button, so show the two taps once */
 setTimeout(function(){try{var ios=/iPhone|iPad|iPod/.test(navigator.userAgent),standalone=navigator.standalone||matchMedia('(display-mode: standalone)').matches;
  if(!ios||standalone||localStorage.getItem('dmIosHint'))return;
  var g=document.querySelector('.gate');if(g&&!g.classList.contains('hidden')&&g.style.display!=='none')return;
  var t=document.createElement('div');t.id='dmIosHint';t.setAttribute('role','status');
  t.innerHTML='<b>Use DipMapper like an app</b><span>Tap <span class="sh" aria-label="Share">\u2B06\uFE0E</span> Share, then \u201cAdd to Home Screen\u201d.</span><button type="button" aria-label="Close">\u00D7</button>';
  t.querySelector('button').onclick=function(){t.remove();try{localStorage.setItem('dmIosHint','1')}catch(e){}};document.body.appendChild(t)}catch(e){}},6000);
 /* ---------- v22.4 motion: animate what is NEW, never what re-renders ---------- */
 var seenCards=new Map(),seenPins=new Map();
 function dmContinue(el,id,map,stagger,dur,cls){var now=performance.now(),rec=map.get(id);
  if(!rec){rec={t:now,d:stagger};map.set(id,rec)}
  var elapsed=now-rec.t;if(elapsed<rec.d+dur){el.style.animationDelay=(rec.d-elapsed)+'ms';el.classList.add(cls)}}
 function dmMotion(){if(RM)return;
  document.querySelectorAll('#results .result').forEach(function(c,i){var id=c.getAttribute('data-card-id');if(!id||c.dataset.dmIn)return;c.dataset.dmIn='1';
   dmContinue(c,id,seenCards,Math.min(i,8)*55,550,'dmEnter')});
  document.querySelectorAll('#map .dmOverlay .marker:not(.parking)').forEach(function(m,i){var id=m.getAttribute('data-mid');if(!id||m.dataset.dmIn)return;m.dataset.dmIn='1';
   dmContinue(m,id,seenPins,Math.min(i,12)*45,600,'dmDrop')});
  var sb=document.getElementById('statusPct');if(sb)document.documentElement.classList.toggle('dmLoading',!/^100/.test(sb.textContent.trim()));
  document.querySelectorAll('#dmBelow button').forEach(function(b){if(!b.dataset.dmS&&/Surprise/i.test(b.textContent)){b.dataset.dmS='1';b.classList.add('dmSurprise')}})}
 function dmMotionWatch(){var mo=new MutationObserver(window.dmRafOnce?dmRafOnce(dmMotion):function(){dmMotion()});['results','map','statusPct'].forEach(function(i){var e=document.getElementById(i);if(e)mo.observe(e,{childList:true,subtree:true,characterData:true})});dmMotion()}
 if(document.readyState!=='loading')dmMotionWatch();else document.addEventListener('DOMContentLoaded',dmMotionWatch);
 /* ---------- v22.5 detail panel action bar: Directions / Share / Website ---------- */
 function dmVenue(){try{var id=state.selected;return (state.results||[]).find(function(x){return String(x.id)===String(id)})||null}catch(e){return null}}
 function dmActionBar(){var body=document.getElementById('cardBody');if(!body||body.querySelector('.dmBar'))return;var v=dmVenue();if(!v)return;
  var bar=document.createElement('div');bar.className='dmBar';
  var dir=document.createElement('a');dir.className='dmBarBtn dmBarGo';dir.target='_blank';dir.rel='noopener';dir.textContent='\u27A4 Directions';
  try{dir.href=route(v.lat,v.lon)}catch(e){dir.href='https://www.openstreetmap.org/?mlat='+v.lat+'&mlon='+v.lon}
  var sh=document.createElement('button');sh.type='button';sh.className='dmBarBtn';sh.textContent='\u2197 Share';
  sh.onclick=function(){var nm=(typeof plainName==='function'?plainName(v):v.name)||'Swim spot';var url=location.origin+location.pathname+'?lat='+v.lat+'&lon='+v.lon+'&name='+encodeURIComponent(nm);
   if(navigator.share){navigator.share({title:nm+' \u2014 DipMapper',text:'Swim spot: '+nm,url:url}).catch(function(){})}
   else if(navigator.clipboard){navigator.clipboard.writeText(url).then(function(){sh.textContent='\u2713 Link copied';setTimeout(function(){sh.textContent='\u2197 Share'},1800)}).catch(function(){})}};
  bar.appendChild(dir);bar.appendChild(sh);
  if(v.website){var w=document.createElement('a');w.className='dmBarBtn';w.href=v.website;w.target='_blank';w.rel='noopener';w.textContent='\u2302 Website';bar.appendChild(w)}
  var sv=document.createElement('button');sv.type='button';sv.className='dmBarBtn dmBarSave';sv.onclick=function(){var vv=dmVenue();if(vv)dmToggleSave(vv)};bar.appendChild(sv);
  body.appendChild(bar);try{dmSavedPaint()}catch(e){}}
 (function(){var b=document.getElementById('cardBody');if(b)new MutationObserver(function(){dmActionBar()}).observe(b,{childList:true})})();
 /* ---------- Feature: Saved spots (stored on this device only) ---------- */
 var SK='dmSaved';
 function dmSavedList(){try{return JSON.parse(localStorage.getItem(SK)||'[]')}catch(e){return []}}
 function dmSavedSet(a){try{localStorage.setItem(SK,JSON.stringify(a.slice(0,200)))}catch(e){}dmSavedPaint()}
 function dmIsSaved(id){return dmSavedList().some(function(x){return String(x.id)===String(id)})}
 function dmToggleSave(v){var a=dmSavedList(),i=a.findIndex(function(x){return String(x.id)===String(v.id)});
  if(i>=0)a.splice(i,1);else a.unshift({id:v.id,name:(typeof plainName==='function'?plainName(v):v.name),lat:v.lat,lon:v.lon,cat:v.cat||'',ts:Date.now()});dmSavedSet(a)}
 function dmFindVenue(id){try{return (state.results||[]).find(function(x){return String(x.id)===String(id)})||null}catch(e){return null}}
 function dmSavedPaint(){var n=dmSavedList().length;
  document.querySelectorAll('#results .result').forEach(function(c){var id=c.getAttribute('data-card-id');if(!id)return;var h=c.querySelector(':scope>.dmHeart');
   if(!h){h=document.createElement('button');h.type='button';h.className='dmHeart';c.appendChild(h)}
   var on=dmIsSaved(id);if(h.dataset.on!==String(on)){h.dataset.on=String(on);h.textContent=on?'\u2665':'\u2661';h.setAttribute('aria-pressed',String(on));h.setAttribute('aria-label',on?'Remove from saved':'Save this spot')}});
  var sb=document.getElementById('dmSavedBtn');if(sb)sb.querySelector('b').textContent=n?String(n):'';
  var bh=document.querySelector('#cardBody .dmBarSave');if(bh){var v=dmVenue();if(v){var on=dmIsSaved(v.id);bh.textContent=on?'\u2665 Saved':'\u2661 Save';bh.setAttribute('aria-pressed',String(on))}}}
 addEventListener('keydown',function(e){if(e.target.closest&&e.target.closest('.dmHeart')&&(e.key==='Enter'||e.key===' '))e.stopPropagation()},true);
 addEventListener('click',function(e){var h=e.target.closest&&e.target.closest('.dmHeart');if(!h)return;e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
  var c=h.closest('.result'),v=c&&dmFindVenue(c.getAttribute('data-card-id'));if(v){dmToggleSave(v);if(!RM){h.classList.remove('dmPopH');void h.offsetWidth;h.classList.add('dmPopH')}}},true);
 function dmSavedButton(){var tools=document.querySelector('#dmBelow .dmBelowTools')||document.querySelector('#dmBelow .dmBelowHead');if(!tools||document.getElementById('dmSavedBtn'))return;
  var b=document.createElement('button');b.type='button';b.id='dmSavedBtn';b.innerHTML='\u2665 Saved <b></b>';b.onclick=dmSavedOpen;tools.insertBefore(b,tools.firstChild);dmSavedPaint()}
 function dmSavedOpen(){var a=dmSavedList();var o=document.createElement('div');o.className='dmSheet';o.setAttribute('role','dialog');o.setAttribute('aria-label','Saved spots');
  var rows=a.length?a.map(function(x){return '<li><button type="button" class="dmSvOpen" data-id="'+String(x.id).replace(/"/g,'')+'" data-lat="'+x.lat+'" data-lon="'+x.lon+'" data-name="'+encodeURIComponent(x.name)+'"><b>'+String(x.name).replace(/</g,'&lt;')+'</b><span>'+(x.cat||'')+'</span></button><button type="button" class="dmSvDel" data-id="'+String(x.id).replace(/"/g,'')+'" aria-label="Remove">\u00D7</button></li>'}).join(''):'<p class="dmSvEmpty">No saved spots yet. Tap the \u2661 on any spot to keep it here.</p>';
  o.innerHTML='<div class="dmSheetBox"><div class="dmSheetHead"><h2>Saved spots</h2><button type="button" class="dmSheetX" aria-label="Close">\u00D7</button></div><ul class="dmSvList">'+rows+'</ul></div>';
  var al=dmAlerts();if(al.length){var bx=o.querySelector('.dmSheetBox');var h=document.createElement('div');h.innerHTML='<h3 class="dmAlHead">\uD83D\uDD14 Alerts ('+al.length+')</h3><ul class="dmSvList dmAlList">'+al.map(function(x){return '<li><span class="dmAlName">'+String(x.name).replace(/</g,'&lt;')+' \u2014 score '+x.min+'+</span><button type="button" class="dmAlDel" data-id="'+String(x.id).replace(/"/g,'')+'" aria-label="Remove alert">\u00D7</button></li>'}).join('')+'</ul>';bx.appendChild(h);
   h.querySelectorAll('.dmAlDel').forEach(function(d){d.onclick=function(){dmAlertsSet(dmAlerts().filter(function(x){return String(x.id)!==d.dataset.id}));d.closest('li').remove()}})}
  document.body.appendChild(o);o.querySelector('.dmSheetX').onclick=function(){o.remove()};o.onclick=function(e){if(e.target===o)o.remove()};
  o.querySelectorAll('.dmSvDel').forEach(function(d){d.onclick=function(){dmSavedSet(dmSavedList().filter(function(x){return String(x.id)!==d.dataset.id}));d.closest('li').remove();if(!o.querySelector('li'))o.querySelector('.dmSvList').innerHTML='<p class="dmSvEmpty">No saved spots yet.</p>'}});
  o.querySelectorAll('.dmSvOpen').forEach(function(d){d.onclick=function(ev){if(ev){ev.stopPropagation()}o.remove();if(dmFindVenue(d.dataset.id)){setTimeout(function(){try{openPlaceById(d.dataset.id,'saved')}catch(e){openCard(d.dataset.id)}},30)}
   else location.href=location.pathname+'?lat='+d.dataset.lat+'&lon='+d.dataset.lon+'&name='+d.dataset.name}})}
 (function(){var r=document.getElementById('results');if(r)new MutationObserver(function(){dmSavedPaint();dmSavedButton()}).observe(r,{childList:true});
  setTimeout(function(){dmSavedButton();dmSavedPaint()},800)})();
 /* ---------- Feature 2: Planning fit estimate (only real inputs; current weather, never the synthetic day cards) ---------- */
 function dmClamp(x){return Math.max(0,Math.min(100,x))}
 function dmSwimScore(v){var parts=[],c=(typeof cat==='function'?cat(v):v.cat),indoor=/indoor/i.test((v.setting||'')+' '+(v.facilities||[]).join(' '))||c==='thermal';
  try{var w=dmDisplayWaterTemp(v);if(w)parts.push({k:'water',label:'Water',val:(w.est?'~':'')+w.c+'\u00b0C',s:dmClamp(w.c<=12?10:(w.c>=24?100:10+(w.c-12)*7.5)),w:.35})}catch(e){}
  try{var cw=state.currentWeather;if(cw&&cw.temp!=null&&!indoor){var ws=dmClamp((cw.temp-14)/14*100);var rp=+cw.rainProb||0;if(rp>=60)ws-=40;else if(rp>=30)ws-=20;
   parts.push({k:'weather',label:'Weather now',val:Math.round(cw.temp)+'\u00b0C'+(rp?', rain '+rp+'%':''),s:dmClamp(ws),w:.25})}}catch(e){}
  try{var os=dmOpenStatus(v);var oo=os?os.open:null;if(oo!==null)parts.push({k:'open',label:'Published hours',val:os.text,s:oo===true?100:15,w:.15})}catch(e){}
  try{var cr=dmCrowd(v);parts.push({k:'crowd',label:'Crowd',val:cr.level,s:dmClamp(cr.q),w:.10})}catch(e){}
  try{var tr=dmTravel(v);parts.push({k:'access',label:'Getting there',val:tr.drive+' min',s:dmClamp(tr.drive<=8?100:(tr.drive>=45?20:100-(tr.drive-8)*80/37)),w:.15})}catch(e){}
  if(!parts.length)return null;var tw=parts.reduce(function(a,p){return a+p.w},0);var sc=Math.round(parts.reduce(function(a,p){return a+p.s*p.w},0)/tw);
  return {score:sc,label:sc>=80?'Higher fit':sc>=65?'Moderate fit':sc>=50?'Mixed fit':'Lower fit',parts:parts}}
 function dmScorePaint(){document.querySelectorAll('#results .result').forEach(function(c){var id=c.getAttribute('data-card-id'),v=id&&dmFindVenue(id);if(!v)return;var r=dmSwimScore(v);if(!r)return;
   var b=c.querySelector(':scope>.dmScore');if(!b){b=document.createElement('span');b.className='dmScore';c.appendChild(b)}
   if(!b.dataset.pos){var th=c.querySelector('.thumb');if(th&&th.offsetWidth){b.style.left=(th.offsetLeft+3)+'px';b.style.top=(th.offsetTop+th.offsetHeight-26)+'px';b.style.right='auto';b.dataset.pos='1'}}
   var t=String(r.score);if(b.dataset.s!==t){b.dataset.s=t;b.style.setProperty('--p',r.score);b.className='dmScore '+(r.score>=80?'dmScGreat':r.score>=65?'dmScGood':r.score>=50?'dmScOk':'dmScLow');
    b.innerHTML='<b>'+r.score+'</b><i>'+r.label.replace(' today','')+'</i>';b.setAttribute('title','Planning fit estimate (not swim safety): '+r.score+'/100 \u2014 '+r.label)}})}
 /* ---------- Feature 3: official water quality (EEA, EU Bathing Water Directive, 2025 season) ---------- */
 var WQ=new Map(),WQ_URL='https://water.discomap.eea.europa.eu/arcgis/rest/services/BathingWater/BathingWater_Dyna_WM_2025/MapServer/3/query';
 var WQ_MAP='https://portal.discomap.eea.europa.eu/arcgis/apps/mapviewer/index.html?url=https://water.discomap.eea.europa.eu/arcgis/rest/services/BathingWater/BathingWater_Dyna_WM_2025/MapServer&source=sd';
 function dmInEurope(v){return v.lat>34&&v.lat<72&&v.lon>-25&&v.lon<45}
 function dmWqFetch(v){if(WQ.has(v.id))return WQ.get(v.id);var q='?geometry='+encodeURIComponent(JSON.stringify({x:v.lon,y:v.lat}))+'&geometryType=esriGeometryPoint&inSR=4326&distance=1500&units=esriSRUnit_Meter&spatialRel=esriSpatialRelIntersects&outFields=bathingWaterName,qualityStatus,qualityStatus_minus1,qualityStatus_minus2,bwProfileLink,latitude,longitude&returnGeometry=false&f=json';
  var pr=fetch(WQ_URL+q,{mode:'cors'}).then(function(r){if(!r.ok)throw new Error('http '+r.status);return r.json()}).then(function(j){if(j.error)throw new Error('svc');
   var best=null;(j.features||[]).forEach(function(f){var a=f.attributes||{};if(a.latitude==null)return;var d=dist(v.lat,v.lon,a.latitude,a.longitude)*1000;if(!best||d<best.d)best={d:d,a:a}});return {ok:true,best:best}})
   .catch(function(){return {ok:false}});WQ.set(v.id,pr);return pr}
 function dmWqHtml(v,res){var head='<h3>Official water quality</h3>';
  if(!dmInEurope(v))return head+'<p class="dmWqNote">Official bathing-water ratings in DipMapper cover Europe (EU, Switzerland, Albania). For this area, check the local health or environment authority.</p>';
  if(!res)return head+'<p class="dmWqNote">Checking the official EU register\u2026</p>';
  if(!res.ok)return head+'<p class="dmWqNote">The official register could not be reached right now.</p><a class="dmWqLink" href="'+WQ_MAP+'" target="_blank" rel="noopener">Open the official EEA bathing-water map \u2197</a>';
  if(!res.best)return head+'<p class="dmWqNote">No officially monitored bathing water within 1.5 km of this spot.</p><a class="dmWqLink" href="'+WQ_MAP+'" target="_blank" rel="noopener">Open the official EEA bathing-water map \u2197</a>';
  var a=res.best.a,q=a.qualityStatus||'Not classified',k=q.toLowerCase().replace(/[^a-z]/g,'');var hist=[a.qualityStatus_minus2,a.qualityStatus_minus1,a.qualityStatus].map(function(x,i){return '<span class="dmWqH dmWq-'+String(x||'').toLowerCase().replace(/[^a-z]/g,'')+'">'+(2023+i)+': '+(x||'\u2014')+'</span>'}).join('');
  return head+'<div class="dmWqBadge dmWq-'+k+'"><b>'+q+'</b><span>2025 season \u00b7 EU Bathing Water Directive</span></div>'
   +'<p class="dmWqNote">Nearest monitored site: <b>'+String(a.bathingWaterName||'').replace(/</g,'&lt;')+'</b> ('+Math.round(res.best.d)+' m away).</p><div class="dmWqHist">'+hist+'</div>'
   +(a.bwProfileLink?'<a class="dmWqLink" href="'+String(a.bwProfileLink).replace(/"/g,'')+'" target="_blank" rel="noopener">National bathing-water profile \u2197</a>':'')+'<p class="dmWqSrc">Source: European Environment Agency, data by national authorities.</p>'}
 /* ---------- Feature 4: alerts (checked whenever DipMapper is open; no server, nothing leaves the device) ---------- */
 var AK='dmAlerts';function dmAlerts(){try{return JSON.parse(localStorage.getItem(AK)||'[]')}catch(e){return []}}function dmAlertsSet(a){try{localStorage.setItem(AK,JSON.stringify(a.slice(0,50)))}catch(e){}}
 function dmHasAlert(id){return dmAlerts().some(function(x){return String(x.id)===String(id)})}
 function dmToggleAlert(v){var a=dmAlerts(),i=a.findIndex(function(x){return String(x.id)===String(v.id)});
  if(i>=0)a.splice(i,1);else{a.unshift({id:v.id,name:(typeof plainName==='function'?plainName(v):v.name),lat:v.lat,lon:v.lon,min:75,last:''});try{if('Notification' in window&&Notification.permission==='default')Notification.requestPermission()}catch(e){}}
  dmAlertsSet(a)}
 function dmToday(){var d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
 var _alT=0;function dmAlertCheck(){clearTimeout(_alT);_alT=setTimeout(function(){var a=dmAlerts(),hit=null,ch=false,t=dmToday();
   a.forEach(function(x){if(x.last===t)return;var v=dmFindVenue(x.id);if(!v)return;var r=dmSwimScore(v);if(r&&r.score>=x.min){x.last=t;ch=true;if(!hit)hit={x:x,r:r}}});
   if(ch)dmAlertsSet(a);if(hit)dmAlertToast(hit.x,hit.r)},700)}
 function dmAlertToast(x,r){var old=document.getElementById('dmAlertToast');if(old)old.remove();var t=document.createElement('div');t.id='dmAlertToast';t.setAttribute('role','status');
  t.innerHTML='<span class="ic">\uD83D\uDD14</span><span><b>'+String(x.name).replace(/</g,'&lt;')+'</b> scores <b>'+r.score+'</b> today \u2014 '+r.label.replace(' today','').toLowerCase()+' for a swim.</span><button type="button" class="go">Open</button><button type="button" class="x" aria-label="Close">\u00D7</button>';
  document.body.appendChild(t);t.querySelector('.x').onclick=function(){t.remove()};t.querySelector('.go').onclick=function(e){e.stopPropagation();t.remove();setTimeout(function(){try{openPlaceById(x.id,'alert')}catch(err){}},30)};
  try{if('Notification' in window&&Notification.permission==='granted'&&document.visibilityState!=='visible')new Notification('DipMapper: '+x.name,{body:'Planning fit '+r.score+' today',icon:'/icon-192.png'})}catch(e){}}
 /* detail panel: score + alert + water quality sections */
 function dmDrawerExtras(){var body=document.getElementById('cardBody');if(!body)return;var v=dmVenue();if(!v||body.querySelector('.dmScSec'))return;
  var r=dmSwimScore(v),first=body.querySelector('.section');
  var sec=document.createElement('div');sec.className='section dmScSec';
  if(r){sec.innerHTML='<h3>Planning fit estimate</h3><div class="dmScTop"><div class="dmScRing" style="--p:'+r.score+'"><b>'+r.score+'</b><span>/100</span></div><div><div class="dmScLabel">'+r.label+'</div><p class="dmScWhy">From the inputs DipMapper has for this spot right now. Missing inputs are left out, not guessed.</p></div></div>'
   +'<div class="dmScParts">'+r.parts.map(function(p){return '<div class="dmScPart"><span>'+p.label+'</span><i style="--p:'+Math.round(p.s)+'"></i><em>'+String(p.val).replace(/</g,'&lt;')+'</em></div>'}).join('')+'</div>'}
  else sec.innerHTML='<h3>Planning fit estimate</h3><p class="dmScWhy">Not enough live data for a score yet.</p>';
  var al=document.createElement('button');al.type='button';al.className='dmAlBtn';var paint=function(){var on=dmHasAlert(v.id);al.textContent=on?'\uD83D\uDD14 Alert on \u2014 tell me when this spot scores 75+':'\uD83D\uDD15 Alert me when this spot scores 75+';al.setAttribute('aria-pressed',String(on))};
  paint();al.onclick=function(){dmToggleAlert(v);paint()};sec.appendChild(al);
  var wq=document.createElement('div');wq.className='section dmWqSec';wq.innerHTML=dmWqHtml(v,null);
  if(first){body.insertBefore(sec,first);body.insertBefore(wq,first)}else{body.appendChild(sec);body.appendChild(wq)}
  if(dmInEurope(v))dmWqFetch(v).then(function(res){if(wq.isConnected&&String((dmVenue()||{}).id)===String(v.id))wq.innerHTML=dmWqHtml(v,res)})}
 (function(){var r=document.getElementById('results');if(r)new MutationObserver(function(){dmScorePaint();dmAlertCheck()}).observe(r,{childList:true});
  var cb=document.getElementById('cardBody');if(cb)new MutationObserver(function(){dmDrawerExtras()}).observe(cb,{childList:true});setTimeout(function(){dmScorePaint();dmAlertCheck()},900)})();
 /* ---------- Real 7-day forecast for the four weather cards (Open-Meteo); figures stay marked as estimates until it arrives ---------- */
 var FC=new Map();
 function dmWxIcon(c){c=+c;return c===0?'\u2600\uFE0F':c<=2?'\uD83C\uDF24\uFE0F':c===3?'\u2601\uFE0F':(c===45||c===48)?'\uD83C\uDF2B\uFE0F':(c>=51&&c<=67)?'\uD83C\uDF27\uFE0F':(c>=71&&c<=77)?'\u2744\uFE0F':(c>=80&&c<=82)?'\uD83C\uDF26\uFE0F':c>=95?'\u26C8\uFE0F':'\uD83C\uDF24\uFE0F'}
 function dmFcFetch(v){var k=(+v.lat).toFixed(2)+','+(+v.lon).toFixed(2);if(FC.has(k))return FC.get(k);
  var u='https://api.open-meteo.com/v1/forecast?latitude='+(+v.lat).toFixed(4)+'&longitude='+(+v.lon).toFixed(4)+'&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&timezone=auto&forecast_days=8';
  var pr=fetch(u).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(j){if(!j.daily||!j.daily.time)throw 0;return j.daily}).catch(function(){return null});FC.set(k,pr);return pr}
 function dmForecast(){var body=document.getElementById('cardBody');if(!body)return;var wx=body.querySelector('.weather');if(!wx||wx.dataset.dmFc)return;var v=dmVenue();if(!v)return;wx.dataset.dmFc='1';
  var note=document.createElement('p');note.className='dmFcNote';note.textContent='Loading the real forecast\u2026 (figures below are estimates until then)';wx.parentNode.insertBefore(note,wx.nextSibling);
  dmFcFetch(v).then(function(d){if(!wx.isConnected)return;if(!d){note.textContent='Forecast unavailable right now \u2014 figures are estimates from today\u2019s weather.';return}
   var days=[...wx.querySelectorAll('.day')];var dowSat=d.time.findIndex(function(t){return new Date(t+'T12:00').getDay()===6});var idx=[0,1,2,dowSat>2?dowSat:Math.min(3,d.time.length-1)];
   days.forEach(function(el,i){var j=idx[i];if(j==null||j<0||j>=d.time.length)return;var kids=el.children;
    if(kids[0])kids[0].textContent=dmWxIcon(d.weather_code[j]);if(i===3&&kids[1])kids[1].textContent=dowSat>2?'Saturday':'Weekend';
    if(kids[2])kids[2].textContent=Math.round(d.temperature_2m_min[j])+'\u2013'+Math.round(d.temperature_2m_max[j])+'\u00b0C';
    var m=el.querySelector('.muted');if(m)m.textContent='rain '+(d.precipitation_probability_max[j]==null?'\u2014':d.precipitation_probability_max[j]+'%')+' \u00b7 wind '+Math.round(d.wind_speed_10m_max[j])+' km/h';el.classList.add('dmFcReal')});
   note.textContent='Forecast: Open-Meteo, for this spot\u2019s location.'})}
 (function(){var cb=document.getElementById('cardBody');if(cb)new MutationObserver(function(){dmForecast()}).observe(cb,{childList:true})})();
 /* ================= v22.9 smooth UI: no blinking, stable open card ================= */
 var NAT=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');
 /* List: keep every card whose content did not change; swap only changed cards; reorder in place */
 function dmMark(n,d){n.__dmRaw=n.outerHTML;if(d>0)for(var c=n.firstElementChild;c;c=c.nextElementSibling)dmMark(c,d-1)}
 function dmIsDeco(n){var c=n.className;return typeof c==='string'&&/(^|\s)dm(Rank|Heart|Score)(\s|$)/.test(c)}
 function dmPatch(o,n,d){var keep=[].filter.call(o.classList,function(c){return c.indexOf('dm')===0});
  for(var i=o.attributes.length-1;i>=0;i--){var a=o.attributes[i].name;if(a!=='style'&&a.indexOf('data-dm')!==0&&!n.hasAttribute(a))o.removeAttribute(a)}
  for(var j=0;j<n.attributes.length;j++){var at=n.attributes[j];if(at.name==='style')continue;if(o.getAttribute(at.name)!==at.value)o.setAttribute(at.name,at.value)}
  keep.forEach(function(c){o.classList.add(c)});
  var oc=[].filter.call(o.children,function(x){return !dmIsDeco(x)}),nc=[].slice.call(n.children);
  if(oc.length!==nc.length||d<=0||(!nc.length&&o.textContent!==n.textContent)){var deco=[].filter.call(o.children,dmIsDeco);NAT.set.call(o,NAT.get.call(n));deco.forEach(function(x){o.appendChild(x)});dmMark(o,d);return}
  nc.forEach(function(c,k){var oo=oc[k],r=c.outerHTML;if(oo.__dmRaw===r)return;if(oo.tagName===c.tagName&&oo.tagName!=='IMG')dmPatch(oo,c,d-1);else{dmMark(c,d-1);o.replaceChild(c,oo)}});o.__dmRaw=n.outerHTML}
 function dmMorphList(el,html){var tpl=document.createElement('template');NAT.set.call(tpl,html);var nk=[].slice.call(tpl.content.children);
  var keyed=nk.length&&nk.every(function(n){return n.hasAttribute&&n.hasAttribute('data-card-id')});
  var old=[].slice.call(el.children);var oldKeyed=old.length&&old.every(function(n){return n.hasAttribute&&n.hasAttribute('data-card-id')});
  if(!keyed||!oldKeyed){NAT.set.call(el,html);[].forEach.call(el.children,function(n){dmMark(n,4)});return}
  var map=new Map();old.forEach(function(n){map.set(n.getAttribute('data-card-id'),n)});var want=[];
  nk.forEach(function(n){var id=n.getAttribute('data-card-id'),raw=n.outerHTML,o=map.get(id);
   if(o){map.delete(id);if(o.__dmRaw!==raw)dmPatch(o,n,4);want.push(o)}else{dmMark(n,4);want.push(n)}});
  map.forEach(function(n){n.remove()});
  want.forEach(function(n,i){if(el.children[i]!==n)el.insertBefore(n,el.children[i]||null)});
  while(el.children.length>want.length)el.lastElementChild.remove()}
 /* Detail panel: a new card starts at the top; a refresh of the same card keeps scroll and swaps only changed sections */
 function dmScroller(){var d=document.getElementById('drawer');if(!d)return null;var c=[d,d.querySelector('.drawerBody')];
  for(var i=0;i<c.length;i++){var e=c[i];if(!e)continue;var o=getComputedStyle(e).overflowY;if((o==='auto'||o==='scroll')&&e.scrollHeight>e.clientHeight)return e}return d}
 function dmMorphCard(el,html){var id=(typeof state!=='undefined'&&state)?String(state.selected):'';var sc=dmScroller();
  if(el.__dmId!==id){NAT.set.call(el,html);el.__dmId=id;[].forEach.call(el.children,function(n){n.__dmRaw=n.outerHTML});
   var d=document.getElementById('drawer');if(d)d.scrollTop=0;var b=d&&d.querySelector('.drawerBody');if(b)b.scrollTop=0;return}
  var top=sc?sc.scrollTop:0;var tpl=document.createElement('template');NAT.set.call(tpl,html);var nk=[].slice.call(tpl.content.children);
  var raw=[].filter.call(el.children,function(n){return n.__dmRaw!==undefined});
  nk.forEach(function(n,i){var r=n.outerHTML,o=raw[i];if(o&&o.__dmRaw===r)return;n.__dmRaw=r;
   if(o){el.replaceChild(n,o)}else{var last=raw.length?raw[raw.length-1]:null;var anchor=last?last.nextSibling:null;el.insertBefore(n,anchor)}});
  for(var j=nk.length;j<raw.length;j++)raw[j].remove();
  if(sc)sc.scrollTop=top}
 (function(){var r=document.getElementById('results'),cb=document.getElementById('cardBody');
  if(r)Object.defineProperty(r,'innerHTML',{configurable:true,get:function(){return NAT.get.call(this)},set:function(h){dmMorphList(this,h)}});
  if(cb)Object.defineProperty(cb,'innerHTML',{configurable:true,get:function(){return NAT.get.call(this)},set:function(h){dmMorphCard(this,h)}});
  var d=document.getElementById('drawer');if(d&&cb)new MutationObserver(function(){if(!d.classList.contains('open'))cb.__dmId=null}).observe(d,{attributes:true,attributeFilter:['class']})})();
 /* Floating controls: close + back to top inside an open card; back to top for the page */
 (function(){var d=document.getElementById('drawer');if(d&&!d.querySelector('.dmFloat')){var f=document.createElement('div');f.className='dmFloat';
   f.innerHTML='<button type="button" class="dmFtop" aria-label="Back to top of this spot">\u2191</button><button type="button" class="dmFx" aria-label="Close this spot">\u00D7</button>';
   d.insertBefore(f,d.firstChild);f.querySelector('.dmFx').onclick=function(e){e.stopPropagation();var c=document.getElementById('close');if(c)c.click()};
   f.querySelector('.dmFtop').onclick=function(e){e.stopPropagation();var sc=dmScroller();if(sc)sc.scrollTo({top:0,behavior:RM?'instant':'smooth'})};
   var onS=function(){var sc=dmScroller();f.classList.toggle('on',!!sc&&sc.scrollTop>220)};d.addEventListener('scroll',onS,{passive:true,capture:true});}
  var t=document.createElement('button');t.type='button';t.id='dmToTop';t.setAttribute('aria-label','Back to top');t.textContent='\u2191';document.body.appendChild(t);
  t.onclick=function(){scrollTo({top:0,behavior:RM?'instant':'smooth'})};var tgOn=null,tgQ=false,tg=function(){if(tgQ)return;tgQ=true;requestAnimationFrame(function(){tgQ=false;var on=scrollY>900;if(on!==tgOn){tgOn=on;t.classList.toggle('on',on)}})};addEventListener('scroll',tg,{passive:true});setInterval(tg,500)})();
 /* Minimap in every detail card (uses the same tiles as the main map) */
 function dmMinimap(){var body=document.getElementById('cardBody');if(!body||body.querySelector('.dmMiniSec'))return;var v=dmVenue();if(!v)return;
  var z=15,W=256*Math.pow(2,z),px=(+v.lon+180)/360*W,lr=(+v.lat)*Math.PI/180,py=(1-Math.log(Math.tan(lr)+1/Math.cos(lr))/Math.PI)/2*W;
  var ch=190,tx=Math.floor(px/256),ty=Math.floor(py/256),h='';var sec=document.createElement('div');sec.className='section dmMiniSec';
  sec.innerHTML='<h3>Where it is</h3><div class="dmMini" style="height:'+ch+'px"><div class="dmMiniTiles"></div><span class="dmMiniPin" aria-hidden="true"></span></div>';
  var after=body.querySelector('.dmWqSec')||body.querySelector('.dmScSec');if(after&&after.nextSibling)body.insertBefore(sec,after.nextSibling);else{var f0=body.querySelector('.section');if(f0)body.insertBefore(sec,f0);else body.appendChild(sec)}
  var cw=Math.max(240,sec.querySelector('.dmMini').clientWidth||body.clientWidth-40,(document.getElementById('drawer')||{}).clientWidth-40||0);
  for(var dx=-4;dx<=4;dx++)for(var dy=-1;dy<=1;dy++){var x=tx+dx,y=ty+dy;var l=Math.round(cw/2-(px-x*256)),t=Math.round(ch/2-(py-y*256));if(l>cw||t>ch||l<-256||t<-256)continue;
   var u;try{u=dmTileUrl(z,x,y)}catch(e){u='https://tile.openstreetmap.org/'+z+'/'+x+'/'+y+'.png'}h+='<img src="'+u+'" alt="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" style="left:'+l+'px;top:'+t+'px">'}
  sec.querySelector('.dmMiniTiles').innerHTML=h}
 (function(){var cb=document.getElementById('cardBody');if(cb)new MutationObserver(function(){dmMinimap()}).observe(cb,{childList:true})})();
 /* ================= v22.10 mobile release ================= */
 /* (6) soft refreshes may never reopen a closed card; bursts merge into one */
 (function(){var _o=window.openCard,_t=0,_id=null;if(typeof _o!=='function')return;
  window.openCard=function(id,soft){if(soft){var d=document.getElementById('drawer');if(!d||!d.classList.contains('open')||String(state.selected)!==String(id))return;
    _id=id;clearTimeout(_t);_t=setTimeout(function(){var dd=document.getElementById('drawer');if(dd&&dd.classList.contains('open')&&String(state.selected)===String(_id))_o.call(window,_id,true)},250);return}
   clearTimeout(_t);return _o.apply(this,arguments)}})();
 /* (4) human writer: only facts the app holds, varied phrasing per spot */
 function dmH(s){var h=2166136261;s=String(s);for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
 function dmPick(v,k,arr){return arr[dmH(v.id+'|'+k)%arr.length]}
 function dmEsc(t){return String(t==null?'':t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
 function dmTown(v){var a=String(v.address||'');var m=a.match(/\b\d{4,5}\s+([^,]+)\s*$/);if(m)return m[1].trim();var p=a.split(',').map(function(x){return x.trim()}).filter(Boolean);
  if(p.length>1)return p[p.length-1].replace(/^\d+\s*/,'');var l=String((state&&state.label)||'');return /current location|your location/i.test(l)?'':l}
 function dmList(a){return a.length<2?(a[0]||''):a.slice(0,-1).join(', ')+' and '+a[a.length-1]}
 function dmWrite(v){var nm=dmEsc(typeof plainName==='function'?plainName(v):v.name),c=(typeof cat==='function'?cat(v):v.cat),town=dmEsc(dmTown(v)),P=[];
  var wtr=String([v.name,v.westernName,v.setting].join(' '));var kind={bath:(/see\b|seebad|lake|lago|lac\b|weiher|limni/i.test(wtr)?'lake bath':/fluss|river|rhein|aare|limmat|reuss|rh(o|ô)ne/i.test(wtr)?'river bath':'bathing spot'),beach:'beach',pool:(/indoor/i.test((v.setting||'')+(v.facilities||[]).join(' '))?'indoor pool':'pool'),thermal:'thermal bath',wild:'wild swimming spot'}[c]||'swim spot';
  var s1=dmPick(v,'open',[nm+' is a '+kind+(town?' in '+town:'')+'.',(town?town+'\u2019s ':'A ')+kind+', '+nm+'.',nm+(town?', '+town:'')+' \u2014 a '+kind+'.']);
  var stg=String(v.setting||'').trim();if(stg&&!/^(outdoor|indoor|outside|inside)$/i.test(stg))s1+=' '+dmPick(v,'set',['The setting: '+dmEsc(stg.toLowerCase())+'.','Look forward to '+dmEsc(stg.toLowerCase())+'.']);
  else if(/^(indoor|inside)$/i.test(stg)&&c!=='pool')s1+=' It\u2019s indoors, so the weather doesn\u2019t matter.';
  if(v.operator)s1+=' '+dmPick(v,'op',['Run by '+dmEsc(v.operator)+'.',dmEsc(v.operator)+' looks after it.','It\u2019s managed by '+dmEsc(v.operator)+'.']);
  var fac=(v.facilities||[]).map(function(f){return typeof facilityLabel==='function'?facilityLabel(f):f}).filter(function(f){return f&&!/^parking$/i.test(f)&&!(/lifeguard/i.test(f)&&typeof dmNoLifeguard==='function'&&dmNoLifeguard(v))});
  if(fac.length){var top=fac.slice(0,5).map(function(f){return dmEsc(f.toLowerCase())});var more=fac.length>5?' \u2014 plus '+(fac.length-5)+' more listed below':'';
   s1+=' '+dmPick(v,'fac',['On site: '+dmList(top)+more+'.','You\u2019ll find '+dmList(top)+more+'.','Facilities include '+dmList(top)+more+'.','Amenities: '+dmList(top)+more+'.'])}
  var hl=v.highlights||[];if(hl.indexOf('family')>=0)s1+=' '+dmPick(v,'fam',['It works well with children.','Families tend to like it here.']);
  if(hl.indexOf('quiet')>=0)s1+=' '+dmPick(v,'q',['Usually one of the calmer spots around.','A quieter choice than most.']);
  P.push(s1);
  var d=[];try{var w=dmDisplayWaterTemp(v);if(w){var t=w.c,feel=t<14?'properly cold':t<17?'bracing':t<20?'fresh but pleasant':t<23?'comfortable':'warm';
   d.push(dmPick(v,'wt',['The water is '+(w.est?'around ':'')+t+'\u00b0C \u2014 '+feel+'.','Water: '+(w.est?'about ':'')+t+'\u00b0C, '+feel+'.','Expect '+(w.est?'roughly ':'')+t+'\u00b0C in the water \u2014 '+feel+'.']))}}catch(e){}
  try{var cw=state.currentWeather;if(cw&&cw.temp!=null){var rp=+cw.rainProb||0;d.push(dmPick(v,'air',['It\u2019s '+Math.round(cw.temp)+'\u00b0C in the air'+(rp>=40?' with a fair chance of rain':rp>=15?' with a little rain possible':' and dry')+'.','Air temperature is '+Math.round(cw.temp)+'\u00b0C'+(rp>=40?', rain likely':rp>=15?', a shower possible':', no rain expected')+'.']))}}catch(e){}
  try{var cr=dmCrowd(v);d.push(dmPick(v,'cr'+cr.level,{'Quietness estimate':['Right now it should be quiet.','It\u2019s likely calm at the moment.','You may well have space to yourself right now.'],'Some people':['A few people will probably be around.','It\u2019s moderately busy right now.','You won\u2019t be alone, but it shouldn\u2019t be crowded.'],'Busy now':['It\u2019s likely busy at the moment.','Plenty of people are probably there right now.','Expect a lively crowd at this hour.']}[cr.level]||['']))}catch(e){}
  try{var os=dmOpenStatus(v);if(os){if(os.open===true)d.push('It\u2019s open right now.');else if(os.open===false)d.push('It\u2019s closed right now'+(os.text&&!/^closed$/i.test(os.text)?' ('+dmEsc(os.text.toLowerCase())+')':'')+'.');else if(/season/i.test(os.text||''))d.push(dmPick(v,'ssn',['Opening depends on the season.','It runs on a seasonal schedule.']))}}catch(e){}
  if(v.hours)d.push(dmPick(v,'hr',['Opening times: '+dmEsc(dmHours(v.hours).replace(/[.\s]+$/,''))+'.','Hours: '+dmEsc(dmHours(v.hours).replace(/[.\s]+$/,''))+'.']));
  if(v.season&&!/according to map data/i.test(v.season))d.push('Season: '+dmEsc(String(v.season).replace(/[.\s]+$/,''))+'.');
  var pr=v.price||{};if(v.free||pr.adult===0)d.push(dmPick(v,'fr',['Entry is free.','It costs nothing to get in.']));
  else if(pr.adult!=null)d.push('Entry is '+dmEsc(pr.currency||'')+' '+pr.adult+(pr.child!=null?(pr.child===0?', children free':', '+dmEsc(pr.currency||'')+' '+pr.child+' for children'):'')+'.');
  var ac=String(v.access||'').toLowerCase();if(ac==='customers')d.push('Only open to customers of the venue.');else if(ac==='members')d.push('Members only.');
  if(d.length)P.push(d.filter(Boolean).join(' '));
  if(v.descr)P.push('In the operator\u2019s words: \u201c'+dmEsc(String(v.descr).replace(/[.\s]+$/,''))+'.\u201d');
  if(v.descrLocal&&v.descrLocal.text)P.push('<span class="dmLocalNote">Local note (in '+dmEsc(v.descrLocal.lang)+'): \u201c'+dmEsc(String(v.descrLocal.text).replace(/[.\s]+$/,''))+'.\u201d</span>');
  return P}
 function dmMin(n){return n+' minute'+(n===1?'':'s')}
 function dmArrival(v){var a=[];try{var tr=dmTravel(v);var km=tr.km;if(km<0.15)a.push(dmPick(v,'here',['You\u2019re practically there already.','It\u2019s right at your search point.']));else a.push(dmPick(v,'tr',[(km<1.2?'It\u2019s about a '+tr.walk+'-minute walk':'It\u2019s about '+dmMin(tr.drive)+' by car')+' from your search point'+(km>=1.2&&km<6?', or '+dmMin(tr.bike)+' by bike':'')+'.','From your search point: '+(km<1.2?dmMin(tr.walk)+' on foot':dmMin(tr.drive)+' by car'+(km<6?' or '+dmMin(tr.bike)+' by bike':''))+'.']))}catch(e){}
  try{var ps=(typeof parkingFor==='function'?parkingFor(v):[])||[];if(ps.length){var p=ps[0],wm=Math.max(1,Math.round((p.d||0)*1000/80));var fee=(p.fee==='no'||p.free===true)?'free':(p.fee==='yes'||p.free===false)?'paid':'';
   a.push(dmPick(v,'pk',['If you drive, '+dmEsc(p.name||'the nearest car park')+' is the best bet \u2014 '+(wm<=1?'right there':'a '+wm+'-minute walk')+(fee?', '+fee:'')+'.','Parking: '+dmEsc(p.name||'nearest car park')+', '+(wm<=1?'right next to it':dmMin(wm)+' on foot')+(fee?' ('+fee+')':'')+'.'])+(ps.length>1?' '+(ps.length-1)+' more option'+(ps.length>2?'s':'')+' below.':''))}
   else a.push('No public car park is mapped close by \u2014 public transport or a bike is the easier way.')}catch(e){}
  if(v.transit&&v.transit.length)a.push(dmPick(v,'pt',['By public transport: '+dmEsc(v.transit.join(' \u00b7 '))+'.','Public transport: '+dmEsc(v.transit.join(' \u00b7 '))+'.']));
  var town=dmTown(v);if(town)a.push(dmPick(v,'tw',['After the swim, '+dmEsc(town)+' is right there for food and a stroll.','Make time for '+dmEsc(town)+' too \u2014 it\u2019s on the doorstep.','Round it off in '+dmEsc(town)+': a caf\u00e9, an ice cream, a walk by the water.',dmEsc(town)+' is close enough to turn the swim into a whole afternoon.']));
  return a.join(' ')}
 window.areaStory=function(v){try{return dmArrival(v)}catch(e){return ''}};
 function dmStory(){var body=document.getElementById('cardBody');if(!body)return;var st=body.querySelector('.story');if(!st||st.dataset.dmw)return;var v=dmVenue();if(!v)return;
  try{st.innerHTML=dmWrite(v).map(function(p){return '<p>'+p+'</p>'}).join('');st.dataset.dmw='1'}catch(e){}}
 (function(){var cb=document.getElementById('cardBody');if(cb)new MutationObserver(function(){dmStory()}).observe(cb,{childList:true})})();
 /* (3) phones: the gallery becomes one photo that cross-fades every 3 s (no DOM rebuilds) */
 setInterval(function(){if(innerWidth>760||RM)return;var d=document.getElementById('drawer');if(!d||!d.classList.contains('open'))return;var g=d.querySelector('#cardBody .gallery');if(!g)return;
  var ph=[].filter.call(g.children,function(x){return x.classList.contains('photo')&&!x.classList.contains('loadingPhoto')&&!x.classList.contains('dmImgFail')});if(ph.length<2){ph.forEach(function(x){x.classList.add('dmOn')});return}
  var i=ph.findIndex(function(x){return x.classList.contains('dmOn')});ph.forEach(function(x){x.classList.remove('dmOn')});ph[(i+1)%ph.length].classList.add('dmOn')},3000);
 (function(){var cb=document.getElementById('cardBody');if(cb)new MutationObserver(function(){var g=cb.querySelector('.gallery');if(!g)return;var on=g.querySelector('.photo.dmOn');if(!on){var f=[].find.call(g.children,function(x){return x.classList.contains('photo')});if(f)f.classList.add('dmOn')}}).observe(cb,{childList:true,subtree:true})})();
 /* (2) sticky mobile header; logo returns to the start screen */
 var GATE_SRC='';setTimeout(function(){var im=document.querySelector('.gate .dmGateFull');if(im)GATE_SRC=im.currentSrc||im.src},1500);
 function dmToStart(){try{closeCard()}catch(e){}var g=document.querySelector('.gate');if(!g)return;g.classList.remove('hidden');g.style.display='';
  if(!g.querySelector('.dmGateFull')&&GATE_SRC){var im=document.createElement('img');im.className='dmGateFull dmLoaded';im.alt='';im.src=GATE_SRC;g.insertBefore(im,g.firstChild)}
  scrollTo({top:0,behavior:'instant'});try{var gb=document.getElementById('gateLoc');if(gb){gb.disabled=false;gb.classList.remove('dmBusy');gb.textContent='Use my location'}}catch(e){}}
 addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.topbar .brand');if(!b)return;if(window.__dmSwallowUntil&&Date.now()<window.__dmSwallowUntil){e.preventDefault();e.stopPropagation();return}e.preventDefault();e.stopPropagation();dmToStart()},true);
 /* (1) phones: a 2-second welcome screen on every start */
 (function(){if(innerWidth>760||document.getElementById('dmBoot'))return;var lg=document.querySelector('.topbar .brandLogo');var sp=document.createElement('div');sp.id='dmSplash';sp.setAttribute('role','img');sp.setAttribute('aria-label','DipMapper');
  sp.innerHTML='<div class="dmSpSky"></div><div class="dmSpSun"></div><div class="dmSpIn">'+(lg?'<img class="dmSpLogo" alt="" src="'+lg.getAttribute('src')+'">':'<b>DipMapper</b>')+'<p class="dmSpTag">Find your next swim</p><p class="dmSpSub">Lakes \u00b7 beaches \u00b7 pools \u00b7 baths</p><div class="dmSpBar"><i></i></div></div>'
   +'<svg class="dmSpWave" viewBox="0 0 1200 140" preserveAspectRatio="none" aria-hidden="true"><path class="a" d="M0 70 C200 40 400 100 600 70 S1000 40 1200 70 V140 H0Z"/><path class="b" d="M0 92 C250 64 450 118 700 92 S1050 66 1200 92 V140 H0Z"/></svg>';
  document.body.appendChild(sp);var done=false;var end=function(){if(done)return;done=true;sp.classList.add('out');setTimeout(function(){sp.remove();try{mountAds()}catch(e){}},420)};
  sp.addEventListener('click',end);setTimeout(end,2000)})();
 /* (6) Close reacts on finger-up and swallows the follow-up click; the panel animates only when it opens */
 (function(){var d=document.getElementById('drawer');if(!d)return;var was=d.classList.contains('open');
  new MutationObserver(function(){var now=d.classList.contains('open');if(now&&!was){d.classList.add('dmEnterPanel');setTimeout(function(){d.classList.remove('dmEnterPanel')},520)}was=now}).observe(d,{attributes:true,attributeFilter:['class']});
  var swallowUntil=0;
  addEventListener('pointerup',function(e){var t=e.target.closest&&e.target.closest('#close,.dmFloat .dmFx');if(!t||!d.classList.contains('open'))return;
   if(t.classList.contains('dmFx')&&!t.closest('.dmFloat.on'))return;e.preventDefault();swallowUntil=Date.now()+700;try{closeCard()}catch(err){}},true);
  addEventListener('click',function(e){if(Date.now()<swallowUntil){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();swallowUntil=0}},true)})();
 /* ================= v22.11 filters sheet, emblems, overlays ================= */
 var FL={all:['\uD83C\uDF0A','Everything'],beach:['\uD83C\uDFD6\uFE0F','Beaches'],pool:['\uD83C\uDFCA','Pools'],bath:['\uD83C\uDF0A','Lake & river baths'],thermal:['\u2668\uFE0F','Thermal baths'],wild:['\uD83C\uDFDE\uFE0F','Wild swimming'],
  indoor:['\uD83C\uDFE0','Indoor'],outdoor:['\u2600\uFE0F','Outdoor'],free:['\uD83C\uDD93','Free entry'],hours:['\uD83D\uDD58','Hours listed'],opennow:['\uD83D\uDFE2','Hours listed'],parking:['\uD83C\uDD7F\uFE0F','Parking nearby'],
  food:['\uD83C\uDF74','Food'],wc:['\uD83D\uDEBB','Toilets'],accessible:['\u267F','Step-free access'],sauna:['\uD83E\uDDD6','Sauna'],family:['\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67','Good with kids'],
  supervised:['\uD83D\uDEDF','Lifeguard'],women:['\u2640\uFE0F','Women-friendly'],quiet:['\uD83E\uDD2B','Quietness estimate'],waterok:['\uD83D\uDCA7','Water 18C+ estimate']};
 var FG=[['Type',['all','beach','pool','bath','thermal','wild']],['Setting',['outdoor','indoor']],['Practical',['free','opennow','hours','parking','food','wc','accessible','sauna']],['Who & how',['family','supervised','women','quiet','waterok']]];
 function dmFilterLabels(){var f=document.getElementById('filters');if(!f)return;f.querySelectorAll('.filter').forEach(function(b){var k=b.getAttribute('data-filter'),L=FL[k];if(!L)return;var want=L[0]+' '+L[1];if(b.textContent!==want)b.textContent=want})}
 function dmFilterBtn(){var f=document.getElementById('filters');if(!f)return;var b=document.getElementById('dmFiltersBtn');if(!b){b=document.createElement('button');b.type='button';b.id='dmFiltersBtn';b.onclick=dmFilterSheet;f.parentNode.insertBefore(b,f)}
  if(b.nextSibling!==f)f.parentNode.insertBefore(b,f);
  var k=(typeof state!=='undefined'&&state.filter)||'all',L=FL[k]||FL.all;b.innerHTML='<span class="ic">\u2630</span> Filters <b>'+(k==='all'?'All':L[1])+'</b>'}
 function dmFilterSheet(){var k=(state&&state.filter)||'all';var o=document.createElement('div');o.className='dmSheet dmFSheet';o.setAttribute('role','dialog');o.setAttribute('aria-label','Filters');
  o.innerHTML='<div class="dmSheetBox"><div class="dmSheetHead"><h2>Filters</h2><button type="button" class="dmSheetX" aria-label="Close">\u00D7</button></div>'+FG.map(function(g){return '<h3 class="dmFgH">'+g[0]+'</h3><div class="dmFgGrid">'+g[1].filter(function(x){return document.querySelector('#filters [data-filter="'+x+'"]')}).map(function(x,i){var L=FL[x];return '<button type="button" class="dmFt'+(x===k?' on':'')+'" data-f="'+x+'" style="--i:'+i+'"><span class="e">'+L[0]+'</span><span>'+L[1]+'</span></button>'}).join('')+'</div>'}).join('')+'</div>';
  document.body.appendChild(o);o.querySelector('.dmSheetX').onclick=function(){o.remove()};o.onclick=function(e){if(e.target===o)o.remove()};
  o.querySelectorAll('.dmFt').forEach(function(t){t.onclick=function(e){e.stopPropagation();var b=document.querySelector('#filters [data-filter="'+t.dataset.f+'"]');o.remove();if(b)b.click();dmFilterBtn()}})}
 (function(){var f=document.getElementById('filters');if(f)new MutationObserver(function(){dmFilterLabels();dmFilterBtn()}).observe(f,{childList:true});setTimeout(function(){dmFilterLabels();dmFilterBtn()},300)})();
 /* emblems for any place: OpenStreetMap -> Wikidata coat of arms / flag; country flags as images */
 var CC={zurich:'ch',meilen:'ch',herrliberg:'ch',rostock:'de',rhodes:'gr',palma:'es',miami:'us'};var EMB=new Map();
 function dmFlag(cc){return cc?'/flags/'+String(cc).toLowerCase()+'.png':''}
 function dmRev(v,z){return fetch('https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat='+(+v.lat).toFixed(5)+'&lon='+(+v.lon).toFixed(5)+'&zoom='+z+'&addressdetails=1&extratags=1&accept-language=en').then(function(r){if(!r.ok)throw 0;return r.json()})}
 function dmEmblems(v){var key=(+v.lat).toFixed(2)+','+(+v.lon).toFixed(2);if(EMB.has(key))return EMB.get(key);
  var pr=dmRev(v,10).then(function(m){return new Promise(function(res){setTimeout(function(){res(m)},1100)})}).then(function(m){return dmRev(v,5).catch(function(){return null}).then(function(r){return [m,r]})}).then(function(x){var m=x[0]||{},r=x[1]||{},ad=m.address||{};
    var out={muni:{name:ad.city||ad.town||ad.village||ad.municipality||m.name||'',q:(m.extratags||{}).wikidata},region:{name:ad.state||ad.region||ad.county||(r.address||{}).state||'',q:(r.extratags||{}).wikidata},country:{name:ad.country||'',img:dmFlag(ad.country_code)}};
    var ids=[out.muni.q,out.region.q].filter(Boolean);if(!ids.length)return out;
    return fetch('https://www.wikidata.org/w/api.php?action=wbgetentities&ids='+ids.join('|')+'&props=claims&format=json&origin=*').then(function(r){return r.json()}).then(function(j){
     function img(q){var e=q&&j.entities&&j.entities[q];if(!e||!e.claims)return '';var c=(e.claims.P94||e.claims.P41||[])[0];var f=c&&c.mainsnak&&c.mainsnak.datavalue&&c.mainsnak.datavalue.value;return f?'https://commons.wikimedia.org/wiki/Special:FilePath/'+encodeURIComponent(String(f).replace(/ /g,'_'))+'?width=96':''}
     out.muni.img=img(out.muni.q);out.region.img=img(out.region.q);return out}).catch(function(){return out})}).catch(function(){return null});
  EMB.set(key,pr);return pr}
 function dmSetIcon(badge,src){if(!badge||!src)return;var ic=badge.querySelector('.badgeIcon');if(!ic)return;var cur=ic.querySelector('img');if(cur&&cur.dataset.emb===src)return;
  var im=new Image();im.alt='';im.referrerPolicy='strict-origin-when-cross-origin';im.onload=function(){ic.innerHTML='';im.className='dmEmb';im.dataset.emb=src;ic.appendChild(im)};im.src=src}
 function dmBadges(){var body=document.getElementById('cardBody');if(!body)return;var bs=body.querySelectorAll('.badges .badge');if(bs.length<3||body.dataset.dmEmb===String(state.selected))return;var v=dmVenue();if(!v)return;body.dataset.dmEmb=String(state.selected);
  var k=typeof adminKey==='function'?adminKey(v):'';if(CC[k])dmSetIcon(bs[2],dmFlag(CC[k]));
  dmEmblems(v).then(function(e){if(!e||String(state.selected)!==body.dataset.dmEmb)return;var cur=body.querySelectorAll('.badges .badge');
   [[0,e.muni],[1,e.region],[2,e.country]].forEach(function(p){var b=cur[p[0]],d=p[1];if(!b||!d)return;var nm=b.querySelector('div>div:last-child');if(d.name&&nm&&(k==='generic'||!k||/^(—|-|unknown)?$/i.test(nm.textContent.trim())))nm.textContent=d.name;dmSetIcon(b,d.img)})})}
 (function(){var cb=document.getElementById('cardBody');if(cb)new MutationObserver(function(){dmBadges()}).observe(cb,{childList:true})})();
 /* ---------- v22.13: tile layer keeps reusable tiles; new tiles cover old ones before old ones leave (no blank flash) ---------- */
 function dmMorphTiles(el,html){var tpl=document.createElement('template');NAT.set.call(tpl,html);var nk=[].slice.call(tpl.content.querySelectorAll('img'));
  var have=new Map();[].forEach.call(el.querySelectorAll('img'),function(i){if(!i.classList.contains('dmOld'))have.set(i.getAttribute('src'),i)});var keep=new Set(),fresh=[];
  nk.forEach(function(n){var src=n.getAttribute('src'),o=have.get(src);if(o){if(o.style.cssText!==n.style.cssText)o.style.cssText=n.style.cssText;keep.add(o)}else{fresh.push(n)}});
  var old=[];[].forEach.call(el.querySelectorAll('img'),function(i){if(!keep.has(i)){if(i.classList.contains('dmOld'))return;i.classList.add('dmOld');old.push(i)}});
  if(!fresh.length){old.forEach(function(i){i.remove()});return}
  var left=fresh.length,done=false;var finish=function(){if(done)return;done=true;el.querySelectorAll('img.dmOld').forEach(function(i){i.remove()})};
  fresh.forEach(function(n){n.addEventListener('load',function(){if(--left<=0)finish()},{once:true});n.addEventListener('error',function(){if(--left<=0)finish()},{once:true});el.appendChild(n)});setTimeout(finish,1500)}
 (function hookTiles(n){var t=document.querySelector('#map .dmTiles');if(!t){if(n<200)setTimeout(function(){hookTiles(n+1)},100);return}
  if(t.__dmHooked)return;t.__dmHooked=true;Object.defineProperty(t,'innerHTML',{configurable:true,get:function(){return NAT.get.call(this)},set:function(h){dmMorphTiles(this,h)}})})(0);
 /* v22.13: the floating Map/List button steps aside while the one-click selectors are on screen */
 (function(){var f=document.getElementById('filters');if(!f||!('IntersectionObserver' in window))return;new IntersectionObserver(function(es){var fab=document.getElementById('dmFab');if(fab)fab.classList.toggle('dmFabAway',es[0].isIntersecting)},{threshold:0}).observe(f)})();
 /* ---------- v22.14: drag to move the map (finger or mouse), pinch / wheel to zoom ---------- */
 (function(){var mp=document.getElementById('map');if(!mp)return;var pts=new Map(),start=null,moved=false,pinch=null,raf=0,lastWheel=0,swallow=0;
  function center(){return state.mapCenter||state.center||[39,12]}
  function redraw(){if(raf)return;raf=requestAnimationFrame(function(){raf=0;try{drawMap()}catch(e){}})}
  function zoomBy(d){var z=Math.max(3,Math.min(18,(state.zoom||12)+d));if(z===state.zoom)return;state.zoom=z;redraw()}
  mp.addEventListener('pointerdown',function(e){if(e.button&&e.button!==0)return;if(e.target.closest('button,a,.dmGolden,.dmAttr'))return;pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
   if(pts.size===1){var c=center(),z=state.zoom||12;start={x:e.clientX,y:e.clientY,px:project(c[0],c[1],z),z:z};moved=false}
   else if(pts.size===2){var a=[...pts.values()];pinch={d:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)};start=null}},true);
  mp.addEventListener('pointermove',function(e){if(!pts.has(e.pointerId))return;pts.set(e.pointerId,{x:e.clientX,y:e.clientY});
   if(pinch&&pts.size>=2){var a=[...pts.values()],d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);if(d>pinch.d*1.45){zoomBy(1);pinch.d=d}else if(d<pinch.d/1.45){zoomBy(-1);pinch.d=d}moved=true;return}
   if(!start)return;var dx=e.clientX-start.x,dy=e.clientY-start.y;if(!moved&&Math.hypot(dx,dy)<6)return;
   if(!moved){moved=true;try{mp.setPointerCapture(e.pointerId)}catch(err){}mp.classList.add('dmDragging')}
   if(start.z!==state.zoom){var c=center();start={x:e.clientX,y:e.clientY,px:project(c[0],c[1],state.zoom),z:state.zoom};return}
   var ll=unproject(start.px[0]-dx,start.px[1]-dy,start.z);state.mapCenter=[Math.max(-84,Math.min(84,ll[0])),((ll[1]+540)%360)-180];redraw();e.preventDefault()},true);
  function end(e){pts.delete(e.pointerId);if(pts.size<2)pinch=null;if(!pts.size){if(moved){swallow=Date.now()+350;try{tapState.armed=false}catch(err){}}start=null;mp.classList.remove('dmDragging')}}
  mp.addEventListener('pointerup',end,true);mp.addEventListener('pointercancel',end,true);
  mp.addEventListener('click',function(e){if(Date.now()<swallow){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation()}},true);
  mp.addEventListener('wheel',function(e){e.preventDefault();var t=Date.now();if(t-lastWheel<220)return;lastWheel=t;zoomBy(e.deltaY<0?1:-1)},{passive:false})})();
 /* ================= v22.15 elegant search: radius stays, search this area, pick on map ================= */
 (function(){var sel=document.getElementById('radius');if(!sel)return;
  var seg=document.createElement('div');seg.id='dmRadius';seg.setAttribute('role','radiogroup');seg.setAttribute('aria-label','Search radius');
  seg.innerHTML='<span class="lbl">Radius</span>'+[].map.call(sel.options,function(o){return '<button type="button" role="radio" data-r="'+o.value+'">'+o.value+'<small> km</small></button>'}).join('');
  var ctr=sel.closest('.controls')||sel.parentNode;ctr.parentNode.insertBefore(seg,ctr);
  function paint(){seg.querySelectorAll('button').forEach(function(b){var on=b.dataset.r===sel.value;b.classList.toggle('on',on);b.setAttribute('aria-checked',String(on))})}
  seg.addEventListener('click',function(e){var b=e.target.closest('button[data-r]');if(!b||b.dataset.r===sel.value)return;sel.value=b.dataset.r;paint();sel.dispatchEvent(new Event('change',{bubbles:true}))});
  sel.addEventListener('change',function(){paint();try{localStorage.setItem('dm_radius',sel.value)}catch(e){}});paint();setInterval(paint,1000);
  var mp=document.getElementById('map');if(!mp)return;
  var pill=document.createElement('button');pill.type='button';pill.id='dmHere';pill.innerHTML='🔍 Search this area';mp.appendChild(pill);
  var cross=document.createElement('div');cross.id='dmCross';cross.setAttribute('aria-hidden','true');mp.appendChild(cross);
  var hint=document.createElement('div');hint.id='dmPickHint';hint.innerHTML='<span>📍 Tap the map where you want to swim — or drag it and tap <b>Search this area</b>.</span><button type="button">Cancel</button>';mp.appendChild(hint);
  function km(a,b){try{return dist(a[0],a[1],b[0],b[1])}catch(e){return 0}}
  function check(){var c=state.center,m=state.mapCenter;if(!c||!m){pill.classList.remove('on');cross.classList.remove('on');return}var r=Number(sel.value||5);
   var off=km(c,m)>Math.max(0.6,r*0.25)&&!(state.dmFitCenter&&km(state.dmFitCenter,m)<0.05);pill.classList.toggle('on',off);cross.classList.toggle('on',off||mp.classList.contains('dmPicking'))}
  setInterval(check,300);
  function stopPick(){state.move=false;mp.classList.remove('dmPicking');check()}
  function searchHere(at){var c=at||state.mapCenter;if(!c)return;window.__dmExample=false;stopPick();state.center=[+c[0],+c[1]];state.mapCenter=state.center.slice();state.label='the map point';
   try{$('#dest').value=''}catch(e){}pill.classList.remove('on');try{rerunCurrentSearch('Searching around your map point')}catch(e){}try{window.dmNamePoint&&dmNamePoint(state.center.slice())}catch(e){}}
  pill.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();searchHere()});
  hint.querySelector('button').addEventListener('click',function(e){e.preventDefault();e.stopPropagation();stopPick()});
  var mv=document.getElementById('movePoint');if(mv)mv.onclick=function(){state.move=true;mp.classList.add('dmPicking');check();var p=document.getElementById('mapPanel');if(p)p.scrollIntoView({behavior:RM?'instant':'smooth',block:'start'})};
  mp.addEventListener('click',function(e){if(!mp.classList.contains('dmPicking')||e.target.closest('[data-mid],button,a,#dmPickHint'))return;
   e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();
   var r=mp.getBoundingClientRect(),z=state.zoom,cp=project(state.mapCenter[0],state.mapCenter[1],z);var ll=unproject(cp[0]-r.width/2+e.clientX-r.left,cp[1]-r.height/2+e.clientY-r.top,z);searchHere(ll)},true);
  addEventListener('keydown',function(e){if(e.key==='Escape'&&mp.classList.contains('dmPicking'))stopPick()})})();
 /* ================= v22.17: clean header, one overlay dock on the map ================= */
 (function(){var rs=document.getElementById('rescan'),acts=document.querySelector('#mapPanel .mapActions');
  if(rs&&acts&&rs.parentNode!==acts){rs.classList.remove('primary');rs.classList.add('dmRescan');rs.textContent='↻';rs.setAttribute('aria-label','Search again here');rs.title='Search again here';acts.insertBefore(rs,acts.firstChild)}
  document.querySelectorAll('.topbar .nav [data-scroll="resultsPanel"],.topbar .nav [data-scroll="mapPanel"]').forEach(function(b){b.hidden=true;b.classList.add('dmGone')});
  var mp=document.getElementById('map');if(!mp)return;var dock=document.createElement('div');dock.className='dmMapInfo';mp.appendChild(dock);
  function tidy(){var w=mp.querySelector(':scope>.dmWeatherWarn'),g=mp.querySelector(':scope>.dmGolden');if(w)dock.insertBefore(w,dock.firstChild);if(g)dock.appendChild(g);
   var dw=dock.querySelector('.dmWeatherWarn');if(dw&&dw!==dock.firstChild)dock.insertBefore(dw,dock.firstChild)}
  new MutationObserver(tidy).observe(mp,{childList:true});tidy()})();
 /* ================= v22.18: place suggestions, robust map dock, clean header ================= */
 var DM_PLACES=[
 ['Zürich','Zürich','ch','Canton of Zürich',47.3769,8.5417,'zurich zuerich zurigo zurique'],['Geneva','Genève','ch','Canton of Geneva',46.2044,6.1432,'genf geneve geneva ginevra ginebra genebra'],
 ['Basel','Basel','ch','Basel-City',47.5596,7.5886,'bale basilea basle'],['Bern','Bern','ch','Canton of Bern',46.948,7.4474,'berne berna'],['Lausanne','Lausanne','ch','Vaud',46.5197,6.6323,'losanna'],
 ['Lucerne','Luzern','ch','Canton of Lucerne',47.0502,8.3093,'luzern lucerna'],['Lugano','Lugano','ch','Ticino',46.0037,8.9511,''],['Locarno','Locarno','ch','Ticino',46.1709,8.7995,''],['Ascona','Ascona','ch','Ticino',46.1573,8.7726,''],
 ['Bellinzona','Bellinzona','ch','Ticino',46.1946,9.0175,'bellenz'],['Neuchâtel','Neuchâtel','ch','Canton of Neuchâtel',46.99,6.9293,'neuenburg neuchatel'],['Biel/Bienne','Biel/Bienne','ch','Canton of Bern',47.1368,7.2468,'biel bienne'],
 ['Montreux','Montreux','ch','Vaud',46.4312,6.9107,''],['Vevey','Vevey','ch','Vaud',46.4628,6.8432,''],['St. Gallen','St. Gallen','ch','Canton of St. Gallen',47.4245,9.3767,'st gallen sankt gallen saint-gall san gallo'],
 ['Winterthur','Winterthur','ch','Canton of Zürich',47.4988,8.7237,''],['Fribourg','Fribourg','ch','Canton of Fribourg',46.8065,7.162,'freiburg im uechtland friburgo'],['Sion','Sion','ch','Valais',46.2331,7.3606,'sitten'],
 ['Chur','Chur','ch','Graubünden',46.8508,9.532,'coira cuira'],['Thun','Thun','ch','Canton of Bern',46.758,7.628,'thoune'],['Interlaken','Interlaken','ch','Canton of Bern',46.6863,7.8632,''],['Zug','Zug','ch','Canton of Zug',47.1662,8.5155,'zoug zugo'],
 ['Schaffhausen','Schaffhausen','ch','Canton of Schaffhausen',47.697,8.634,'schaffhouse sciaffusa'],['Solothurn','Solothurn','ch','Canton of Solothurn',47.2088,7.5323,'soleure soletta'],['Aarau','Aarau','ch','Aargau',47.3925,8.0442,''],
 ['Rapperswil','Rapperswil-Jona','ch','Canton of St. Gallen',47.2267,8.8184,'rapperswil jona'],['Meilen','Meilen','ch','Canton of Zürich',47.27,8.6436,''],['Männedorf','Männedorf','ch','Canton of Zürich',47.2558,8.693,'mannedorf maennedorf'],
 ['Stäfa','Stäfa','ch','Canton of Zürich',47.24,8.724,'stafa staefa'],['Herrliberg','Herrliberg','ch','Canton of Zürich',47.29,8.6143,''],['Küsnacht','Küsnacht','ch','Canton of Zürich',47.318,8.583,'kusnacht kuesnacht'],
 ['Lake Geneva','Lac Léman','ch','Switzerland / France',46.45,6.55,'genfersee lac leman leman lake geneva lago lemano'],['Lake Zürich','Zürichsee','ch','Switzerland',47.24,8.7,'zurichsee zuerichsee lake zurich lago di zurigo'],
 ['Lake Constance','Bodensee','de','Germany / Switzerland / Austria',47.6,9.4,'bodensee lac de constance lago di costanza'],['Lake Lucerne','Vierwaldstättersee','ch','Central Switzerland',47.0,8.45,'vierwaldstattersee vierwaldstaettersee lac des quatre-cantons lago dei quattro cantoni'],
 ['Lake Maggiore','Lago Maggiore','it','Italy / Switzerland',46.0,8.65,'langensee lac majeur lago maggiore'],['Lake Lugano','Lago di Lugano','ch','Ticino',45.98,9.0,'luganersee ceresio lago di lugano'],
 ['Munich','München','de','Bavaria',48.1351,11.582,'munchen muenchen monaco di baviera munique'],['Cologne','Köln','de','North Rhine-Westphalia',50.9375,6.9603,'koln koeln colonia'],['Berlin','Berlin','de','Berlin',52.52,13.405,'berlino'],
 ['Hamburg','Hamburg','de','Hamburg',53.5511,9.9937,'hambourg amburgo'],['Konstanz','Konstanz','de','Baden-Württemberg',47.6603,9.1758,'constance costanza'],['Lindau','Lindau','de','Bavaria',47.546,9.684,''],
 ['Freiburg im Breisgau','Freiburg im Breisgau','de','Baden-Württemberg',47.999,7.8421,'freiburg fribourg-en-brisgau'],['Rostock','Rostock','de','Mecklenburg-Vorpommern',54.0924,12.0991,''],
 ['Vienna','Wien','at','Austria',48.2082,16.3738,'wien vienne viena vienna'],['Salzburg','Salzburg','at','Austria',47.8095,13.055,'salisburgo'],['Lake Balaton','Balaton','hu','Hungary',46.83,17.73,'plattensee balaton'],
 ['Milan','Milano','it','Lombardy',45.4642,9.19,'mailand milano milao'],['Venice','Venezia','it','Veneto',45.4408,12.3155,'venedig venise venezia'],['Rome','Roma','it','Lazio',41.9028,12.4964,'rom roma'],
 ['Florence','Firenze','it','Tuscany',43.7696,11.2558,'florenz firenze'],['Naples','Napoli','it','Campania',40.8518,14.2681,'neapel napoli'],['Turin','Torino','it','Piedmont',45.0703,7.6869,'torino'],
 ['Genoa','Genova','it','Liguria',44.4056,8.9463,'genua genes genova'],['Lake Como','Lago di Como','it','Lombardy',45.98,9.25,'comer see comersee lago di como lac de come'],['Lake Garda','Lago di Garda','it','Italy',45.65,10.65,'gardasee lago di garda lac de garde'],
 ['Sicily','Sicilia','it','Italy',37.6,14.02,'sizilien sicile sicilia'],['Sardinia','Sardegna','it','Italy',40.12,9.01,'sardinien sardaigne sardegna'],
 ['Nice','Nice','fr','Provence-Alpes-Côte d’Azur',43.7102,7.262,'nizza niza'],['Corsica','Corse','fr','France',42.04,9.01,'korsika corse corsica'],['Marseille','Marseille','fr','Provence-Alpes-Côte d’Azur',43.2965,5.3698,'marseilles marsiglia'],
 ['Annecy','Annecy','fr','Haute-Savoie',45.8992,6.1294,''],['Paris','Paris','fr','Île-de-France',48.8566,2.3522,'parigi'],
 ['Mallorca','Mallorca','es','Balearic Islands',39.6953,3.0176,'majorca maiorca'],['Palma','Palma','es','Mallorca',39.5696,2.6502,'palma de mallorca'],['Ibiza','Eivissa','es','Balearic Islands',38.9067,1.4206,'eivissa'],
 ['Barcelona','Barcelona','es','Catalonia',41.3874,2.1686,'barcellona'],['Tenerife','Tenerife','es','Canary Islands',28.2916,-16.6291,'teneriffa'],['Gran Canaria','Gran Canaria','es','Canary Islands',27.92,-15.55,''],
 ['Lisbon','Lisboa','pt','Portugal',38.7223,-9.1393,'lissabon lisboa lisbonne lisbona'],['Algarve','Algarve','pt','Portugal',37.08,-8.25,''],
 ['Crete','Κρήτη','gr','Greece',35.24,24.81,'kreta crete creta kriti κρητη'],['Heraklion','Ηράκλειο','gr','Crete',35.3387,25.1442,'iraklio iraklion heraklion ηρακλειο'],['Chania','Χανιά','gr','Crete',35.5138,24.018,'hania χανια'],
 ['Hersonissos','Χερσόνησος','gr','Crete',35.3167,25.3833,'chersonissos chersonisos'],['Rhodes','Ρόδος','gr','Dodecanese',36.4341,28.2176,'rhodos rodos rodi ροδος'],['Athens','Αθήνα','gr','Attica',37.9838,23.7275,'athen athenes atene αθηνα'],
 ['Corfu','Κέρκυρα','gr','Ionian Islands',39.6243,19.9217,'korfu kerkyra'],['Mykonos','Μύκονος','gr','Cyclades',37.4467,25.3289,''],['Santorini','Σαντορίνη','gr','Cyclades',36.3932,25.4615,'thira'],['Kos','Κως','gr','Dodecanese',36.8933,27.2877,''],
 ['Split','Split','hr','Croatia',43.5081,16.4402,'spalato'],['Dubrovnik','Dubrovnik','hr','Croatia',42.6507,18.0944,'ragusa'],['Istria','Istra','hr','Croatia',45.25,13.9,'istrien istra istria'],['Zadar','Zadar','hr','Croatia',44.1194,15.2314,'zara'],
 ['Malta','Malta','mt','Malta',35.9375,14.3754,''],['Cyprus','Κύπρος','cy','Cyprus',35.1264,33.4299,'zypern chypre cipro'],['Antalya','Antalya','tr','Türkiye',36.8969,30.7133,''],
 ['Copenhagen','København','dk','Denmark',55.6761,12.5683,'kopenhagen kobenhavn copenaghen'],['Brussels','Bruxelles','be','Belgium',50.8503,4.3517,'brussel brussels bruxelles bruselas'],['Prague','Praha','cz','Czechia',50.0755,14.4378,'prag praha praga'],
 ['Amsterdam','Amsterdam','nl','Netherlands',52.3676,4.9041,''],['Miami','Miami','us','Florida',25.7617,-80.1918,'miami beach']];
 var CTRY={ch:'Switzerland',de:'Germany',at:'Austria',it:'Italy',fr:'France',es:'Spain',pt:'Portugal',gr:'Greece',hr:'Croatia',hu:'Hungary',mt:'Malta',cy:'Cyprus',tr:'Türkiye',dk:'Denmark',be:'Belgium',cz:'Czechia',nl:'Netherlands',us:'United States'};
 function dmN(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/ß/g,'ss').replace(/[^a-z0-9Ͱ-Ͽ ]+/g,' ').replace(/\s+/g,' ').trim()}
 var DM_IDX=DM_PLACES.map(function(p){var names=[p[0],p[1]].concat(p[6]?p[6].split(' '):[]);var multi=(p[6]||'').match(/[a-zͰ-Ͽ]+(?: [a-zͰ-Ͽ]+)+/g)||[];
  return {en:p[0],local:p[1],cc:p[2],region:p[3],lat:p[4],lon:p[5],keys:[dmN(p[0]),dmN(p[1])].concat(String(p[6]||'').split(' ').map(dmN)).filter(Boolean),full:[dmN(p[0]),dmN(p[1])]}});
 function dmUserCC(){try{var tz=(Intl.DateTimeFormat().resolvedOptions().timeZone)||'';var T={Zurich:'ch',Berlin:'de',Vienna:'at',Rome:'it',Paris:'fr',Madrid:'es',Athens:'gr',Lisbon:'pt',Amsterdam:'nl',Brussels:'be',Copenhagen:'dk',Prague:'cz',London:'gb',Zagreb:'hr',Budapest:'hu',Malta:'mt',Nicosia:'cy',Istanbul:'tr',New_York:'us',Chicago:'us',Denver:'us',Los_Angeles:'us'};
  var city=tz.split('/').pop();if(T[city])return T[city];var l=(navigator.language||'');var m=l.match(/-([a-z]{2})$/i);return m?m[1].toLowerCase():''}catch(e){return ''}}
 function dmLocalMatch(q){var n=dmN(q);if(n.length<2)return [];var out=[];DM_IDX.forEach(function(p){var best=0;var all=p.keys.concat(p.full);var phrase=dmN([p.en,p.local].join(' '));
   all.forEach(function(k){if(!k)return;if(k===n)best=Math.max(best,100);else if(k.indexOf(n)===0)best=Math.max(best,70-Math.min(20,k.length-n.length))});
   if(!best&&n.length>=4&&phrase.indexOf(n)>=0)best=40;if(best)out.push({src:'dm',score:best+(p.cc===dmUserCC()?6:0),name:p.en,local:p.local!==p.en?p.local:'',sub:(p.region&&p.region!==CTRY[p.cc]?(p.region.indexOf(CTRY[p.cc]||'@@')>=0||/\//.test(p.region)?p.region:p.region+', '+(CTRY[p.cc]||'')):(CTRY[p.cc]||'')),cc:p.cc,lat:p.lat,lon:p.lon})});
  return out.sort(function(a,b){return b.score-a.score}).slice(0,6)}
 function dmExact(q){var m=dmLocalMatch(q);return m.length&&m[0].score>=100?m[0]:null}
 var PH_OK=/^(city|town|village|hamlet|suburb|quarter|neighbourhood|island|islet|archipelago|lake|reservoir|bay|beach|state|region|province|county|district|municipality|country|peninsula|coastline|cape|locality|bathing_place|swimming_area|water|administrative)$/;
 function dmPhoton(q){var c=state&&(state.mapCenter||state.center);var bias=c?'&lat='+(+c[0]).toFixed(3)+'&lon='+(+c[1]).toFixed(3):(dmUserCC()==='ch'?'&lat=46.8&lon=8.2':'');
  return fetch('https://photon.komoot.io/api/?q='+encodeURIComponent(q)+'&limit=10&lang=en'+bias).then(function(r){if(!r.ok)throw 0;return r.json()}).then(function(j){var n=dmN(q);
   return (j.features||[]).map(function(f){var pr=f.properties||{},g=f.geometry&&f.geometry.coordinates;if(!g||!pr.name)return null;var typ=pr.osm_value||pr.type||'';
    if(/^(shop|amenity|highway|building|office|craft|tourism|railway)$/.test(pr.osm_key||'')&&!/beach|bathing|swimming/.test(typ))return null;var nm=dmN(pr.name);
    var sc=(nm===n?60:nm.indexOf(n)===0?45:30)+(PH_OK.test(typ)||PH_OK.test(pr.type||'')?10:0)+(/^(city|town|island|lake)$/.test(typ)?6:0)+(String(pr.countrycode||'').toLowerCase()===dmUserCC()?6:0);
    var cc=String(pr.countrycode||'').toLowerCase();return {src:'ph',score:sc,name:pr.name,local:'',sub:[pr.state&&pr.state!==pr.name?pr.state:'',pr.country].filter(Boolean).join(', '),cc:cc,lat:g[1],lon:g[0]}}).filter(Boolean)}).catch(function(){return []})}
 function dmMerge(a,b){var out=a.slice();b.forEach(function(x){if(out.some(function(y){return Math.abs(y.lat-x.lat)<0.12&&Math.abs(y.lon-x.lon)<0.12}))return;out.push(x)});return out.sort(function(p,q){return q.score-p.score}).slice(0,7)}
 var DM_PICK=null;var RK='dmRecentPlaces';
 function dmRecent(){try{return JSON.parse(localStorage.getItem(RK)||'[]')}catch(e){return []}}
 function dmRemember(p){try{var a=dmRecent().filter(function(x){return !(Math.abs(x.lat-p.lat)<0.02&&Math.abs(x.lon-p.lon)<0.02)});a.unshift({name:p.name,local:p.local||'',sub:p.sub||'',cc:p.cc||'',lat:p.lat,lon:p.lon});localStorage.setItem(RK,JSON.stringify(a.slice(0,6)))}catch(e){}}
 /* the destination resolver: a picked suggestion or an exact known name wins; otherwise the improved geocoder */
 var _resolve=window.resolveDestination;
 window.dmResolve=function(q){if(DM_PICK&&dmN(q)===dmN(DM_PICK.text)){var p=DM_PICK;dmRemember(p);return Promise.resolve({lat:p.lat,lon:p.lon,display_name:p.label})}
  var e=dmExact(q);if(e){dmRemember(e);return Promise.resolve({lat:e.lat,lon:e.lon,display_name:e.name+(e.local?' ('+e.local+')':'')+', '+(CTRY[e.cc]||e.sub)})}return null};
 /* dropdown */
 var box=document.createElement('div');box.className='dmSug';box.setAttribute('role','listbox');box.hidden=true;document.body.appendChild(box);var cur=null,items=[],hi=-1,seq=0,tmr=0;
 function flag(cc){return cc?'<img class="fl" alt="" src="/flags/'+cc+'.png" onerror="this.remove()">':'<span class="fl"></span>'}
 function place(){if(!cur||box.hidden)return;var r=cur.getBoundingClientRect();box.style.left=Math.max(8,r.left)+'px';box.style.top=(r.bottom+6)+'px';box.style.width=Math.max(260,r.width)+'px'}
 function show(list,head){items=list;hi=-1;if(!list.length){box.hidden=true;return}
  box.innerHTML=(head?'<div class="hd">'+head+'</div>':'')+list.map(function(x,i){return '<button type="button" role="option" data-i="'+i+'">'+flag(x.cc)+'<span class="tx"><span class="ln"><b>'+dmEsc(x.name)+'</b>'+(x.local?' <span class="lo">· '+dmEsc(x.local)+'</span>':'')+'</span><small>'+dmEsc(x.sub||'')+'</small></span></button>'}).join('');
  box.hidden=false;place()}
 function hide(){box.hidden=true;items=[];hi=-1}
 function pick(x){if(!cur||!x)return;var label=x.name+(x.local?' ('+x.local+')':'')+(x.sub?', '+x.sub.split(', ').slice(-1)[0]:'');DM_PICK={text:x.name,label:label,lat:+x.lat,lon:+x.lon,name:x.name,local:x.local,sub:x.sub,cc:x.cc};
  ['dest','gateDest'].forEach(function(id){var e=document.getElementById(id);if(e)e.value=x.name});hide();var wasGate=cur.id==='gateDest';cur.blur();
  if(wasGate){var gs=document.getElementById('gateSearch');if(gs){gs.click();return}}try{search()}catch(e){}}
 function suggest(inp){cur=inp;var q=inp.value.trim();clearTimeout(tmr);var my=++seq;
  if(q.length<2){var rc=dmRecent();if(rc.length)show(rc,'Recent places');else hide();return}
  var loc=dmLocalMatch(q);show(loc);tmr=setTimeout(function(){dmPhoton(q).then(function(r){if(my!==seq||!cur||cur.value.trim()!==q)return;show(dmMerge(loc,r))})},260)}
 ['dest','gateDest'].forEach(function(id){var inp=document.getElementById(id);if(!inp)return;inp.setAttribute('autocomplete','off');inp.setAttribute('role','combobox');inp.setAttribute('aria-autocomplete','list');
  inp.addEventListener('input',function(){DM_PICK=null;suggest(inp)});inp.addEventListener('focus',function(){suggest(inp)});inp.addEventListener('pointerdown',function(){if(document.activeElement!==inp&&inp.value)inp.__sel=1});inp.addEventListener('pointerup',function(e){if(inp.__sel){inp.__sel=0;e.preventDefault();try{inp.select()}catch(err){}}});inp.addEventListener('blur',function(){setTimeout(function(){if(document.activeElement!==inp)hide()},180)})});
 document.addEventListener('keydown',function(e){if(box.hidden||!cur||e.target!==cur)return;var n=items.length;
  if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();hi=(hi+(e.key==='ArrowDown'?1:-1)+n)%n;box.querySelectorAll('button').forEach(function(b,i){b.classList.toggle('on',i===hi)});return}
  if(e.key==='Escape'){hide();return}
  if(e.key==='Enter'&&hi>=0){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();pick(items[hi]);return}
  if(e.key==='Enter'){hide()}},true);
 box.addEventListener('pointerdown',function(e){var b=e.target.closest('button[data-i]');if(!b)return;e.preventDefault();pick(items[+b.dataset.i])});
 addEventListener('resize',place);addEventListener('scroll',place,true);
 /* header: the three buttons are removed from the page; re-scan lives on as the map toolbar icon */
 (function(){document.querySelectorAll('.topbar .nav [data-scroll="resultsPanel"],.topbar .nav [data-scroll="mapPanel"]').forEach(function(b){b.remove()});
  var rs=document.getElementById('rescan'),acts=document.querySelector('#mapPanel .mapActions');if(rs&&acts&&!acts.contains(rs)){rs.classList.remove('primary');rs.classList.add('dmRescan');rs.textContent='↻';rs.setAttribute('aria-label','Search again here');rs.title='Search again here';acts.insertBefore(rs,acts.firstChild)}})();
 /* map overlay dock that rebuilds itself if anything ever clears the map */
 (function(){var mp=document.getElementById('map');if(!mp)return;
  function tidy(){var dock=mp.querySelector(':scope>.dmMapInfo');if(!dock){dock=document.createElement('div');dock.className='dmMapInfo';mp.appendChild(dock)}
   mp.querySelectorAll(':scope>.dmWeatherWarn,:scope>.dmGolden').forEach(function(el){dock.appendChild(el)});var w=dock.querySelector('.dmWeatherWarn');if(w&&dock.firstChild!==w)dock.insertBefore(w,dock.firstChild);
   ['dmHere','dmCross','dmPickHint'].forEach(function(id){var el=document.getElementById(id);if(el&&!mp.contains(el))mp.appendChild(el)})}
  new MutationObserver(tidy).observe(mp,{childList:true});tidy()})();
 window.dmUserCC=dmUserCC;
 /* Sticky header gets a shadow once you scroll */
 (function(){var q=false,on=null;addEventListener('scroll',function(){if(q)return;q=true;requestAnimationFrame(function(){q=false;var v=scrollY>8;if(v!==on){on=v;document.documentElement.classList.toggle('dmScrolled',v)}})},{passive:true})})();
})();

;(function(){try{if(window.__dmSwReload||!('serviceWorker' in navigator)||!navigator.serviceWorker.controller)return;window.__dmSwReload=1;var d=0;navigator.serviceWorker.addEventListener('controllerchange',function(){if(d)return;d=1;location.reload()})}catch(e){}})();
