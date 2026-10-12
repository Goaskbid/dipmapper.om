 /* ================= v23.5 emergency & help nearby: numbers per country (sourced), nearest police, hospital, fire station,
    lifeguard, defibrillator, life ring, pharmacy (OpenStreetMap). Used in the activity card and in the swim card. ================= */
 ICONS.fuel='<path d="M4 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16M3 21h13M7 7h5v4H7z"/><path d="M15 9h2a2 2 0 0 1 2 2v6a1.5 1.5 0 0 0 3 0V9l-3-3"/>';if(typeof ACTI!=='undefined')ACTI.fuel='fuel';if(typeof TYPEI!=='undefined')TYPEI.fuel='fuel';
 ICONS.siren='<path d="M6 18v-5a6 6 0 0 1 12 0v5"/><path d="M4 18h16v3H4zM12 3v2M4.2 6.2l1.4 1.4M19.8 6.2l-1.4 1.4"/>';
 ICONS.police='<path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6z"/><path d="m12 8 1.2 2.4 2.6.4-1.9 1.8.5 2.6L12 14l-2.4 1.2.5-2.6-1.9-1.8 2.6-.4z"/>';
 ICONS.cross='<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 7.5v9M7.5 12h9"/>';
 ICONS.fire='<path d="M12 21c-3.9 0-6.5-2.6-6.5-6.1 0-3.3 2.6-5.3 3.8-8.4.4 1.8 1.4 3 2.6 3.6C12 7 13.3 4.8 15.2 3c.2 3.4 3.3 5.9 3.3 10.4 0 4.6-2.8 7.6-6.5 7.6z"/>';
 ICONS.heli='<path d="M3 6h14M10 6v3"/><path d="M5 12a5 3 0 0 1 10 0v2a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"/><path d="M15 12h6l-1-3M7 19h8"/>';
 ICONS.ring='<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.5"/><path d="M6 6l3.5 3.5M18 6l-3.5 3.5M6 18l3.5-3.5M18 18l-3.5-3.5"/>';
 ICONS.aed='<path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10C19.5 15.4 12 20 12 20z"/><path d="m12.8 9.5-2 3h2.6l-2 3"/>';
 ICONS.pill='<rect x="3.5" y="8.5" width="17" height="7" rx="3.5" transform="rotate(-35 12 12)"/><path d="m9.5 8.5 5 7"/>';
 ICONS.poison='<path d="M9 3h6M10 3v5.5L5.5 17A2.5 2.5 0 0 0 7.7 21h8.6a2.5 2.5 0 0 0 2.2-4L14 8.5V3"/><path d="M8 15h8"/>';
 ICONS.anchor2='<circle cx="12" cy="5" r="2"/><path d="M12 7v14M7 11h10M4 15a8 6 0 0 0 16 0"/>';
 function sosOf(cc){var S=window.DM_SOS||{};return S[String(cc||'').toUpperCase()]||null}
 function telHref(n){var m=String(n||'').match(/[+\d][\d\s\-\/]{1,18}\d|\d{3,}/);return m?'tel:'+m[0].replace(/[^+\d]/g,''):''}
 var HELP={};
 function getHelp(lat,lon){var k=lat.toFixed(3)+','+lon.toFixed(3);if(HELP[k])return HELP[k];var la=lat.toFixed(5),lo=lon.toFixed(5),ar=function(r){return '(around:'+r+','+la+','+lo+')'};
  var q='[out:json][timeout:20];(nwr["amenity"="police"]'+ar(9000)+';nwr["amenity"="hospital"]["emergency"!="no"]'+ar(20000)+';nwr["amenity"="fire_station"]'+ar(9000)+';nwr["emergency"~"^(lifeguard|lifeguard_base|lifeguard_tower|water_rescue|water_rescue_station)$"]'+ar(4000)+';nwr["amenity"="lifeguard"]'+ar(4000)+';node["emergency"="defibrillator"]'+ar(1500)+';node["emergency"="life_ring"]'+ar(700)+';node["emergency"="phone"]'+ar(1500)+';nwr["amenity"="pharmacy"]'+ar(4000)+';nwr["emergency"="ambulance_station"]'+ar(9000)+';nwr["waterway"="fuel"]'+ar(15000)+';nwr["amenity"="fuel"]["boat"="yes"]'+ar(15000)+';);out center 200;';
  var p=(typeof overpassFast==='function'?overpassFast(q,20000):Promise.reject()).then(function(d){if(!d||!d.elements||(d._tried&&d._fails>=d._tried))throw new Error('no data');var B={};(d.elements||[]).forEach(function(e){var t=e.tags||{},a=e.lat!=null?e.lat:e.center&&e.center.lat,o=e.lon!=null?e.lon:e.center&&e.center.lon;if(a==null)return;
    var c=(t.waterway==='fuel'||t.boat==='yes')?'bfuel':t.amenity==='police'?'police':t.amenity==='hospital'?'hospital':t.amenity==='fire_station'?'fire':t.amenity==='pharmacy'?'pharmacy':t.emergency==='defibrillator'?'aed':t.emergency==='life_ring'?'ring':t.emergency==='phone'?'ephone':t.emergency==='ambulance_station'?'amb':'lifeguard';
    if(c==='hospital'&&/^(clinic|rehab|psychiatr)/i.test(t.healthcare||''))return;
    var dd=D(lat,lon,a,o),it={c:c,d:dd,lat:a,lon:o,n:t.name||t.operator||'',ph:t.phone||t['contact:phone']||t['emergency:phone']||'',web:t.website||t['contact:website']||'',hrs:t.opening_hours||'',acc:t.access||'',em:t.emergency||'',loc:t['defibrillator:location']||t.description||''};
    (B[c]=B[c]||[]).push(it)});Object.keys(B).forEach(function(c){B[c].sort(function(a,b){return a.d-b.d});B[c]=B[c].slice(0,2)});return B}).catch(function(){delete HELP[k];return null});HELP[k]=p;return p}
 var HL={police:['police','Police station'],hospital:['cross','Hospital'],fire:['fire','Fire station'],lifeguard:['ring','Lifeguard / water rescue'],aed:['aed','Defibrillator (AED)'],ring:['ring','Life ring'],ephone:['phone','Emergency phone'],pharmacy:['pill','Pharmacy'],amb:['siren','Ambulance station'],bfuel:['fuel','Boat fuel station']};
 function sosNumbersHtml(cc){var s=sosOf(cc),G=s?s.general:'112';var tiles=[];var tile=function(cls,ic,lbl,num,sub){if(!num)return;var h=telHref(num);tiles.push('<a class="dmSosT '+cls+'"'+(h?' href="'+E(h)+'"':'')+'><span class="ic">'+I(ic)+'</span><span><small>'+E(lbl)+'</small><b>'+E(num)+'</b>'+(sub?'<em>'+E(sub)+'</em>':'')+'</span></a>')};
  tile('gen','siren','Emergency',G,s&&s.general==='112'?'all services · works from any phone':'all services');
  if(s){if(s.police&&s.police!==G)tile('pol','police','Police',s.police,cc==='CH'?'also lake police':'');if(s.fire&&s.fire!==G)tile('fir','fire','Fire',s.fire);if(s.ambulance&&s.ambulance!==G)tile('amb','cross','Ambulance',s.ambulance);
   if(s.sea)tile('sea','anchor2','Water / sea rescue',s.sea);if(s.air)tile('air','heli','Air rescue',s.air,cc==='CH'?'Rega':'');if(s.poison)tile('poi','poison','Poison centre',/^\d|^\+/.test(s.poison)?s.poison:'',/^regional/.test(s.poison)?'':'');}
  var note=s&&s.notes?'<p class="dmSosNote">'+I('info')+E(s.notes)+'</p>':(!s?'<p class="dmSosNote">'+I('info')+'112 is the emergency number in Europe and works from any mobile phone in most countries. Ask locally for the lake or coast rescue number.</p>':'');
  var src=s&&s.src?'<p class="dmSosSrc">Numbers checked '+E((window.DM_SOS||{}).checked||'')+' · '+s.src.map(function(u){return '<a href="'+E(u)+'" target="_blank" rel="noopener">'+E(host(u))+'</a>'}).join(', ')+'</p>':'';
  return '<div class="dmSosGrid">'+tiles.join('')+'</div>'+note+src}
 function sosNearHtml(v,B){if(!B)return '<p class="dmSosNote">'+I('info')+'Nearby police, hospital and lifeguard could not be loaded right now — call the emergency number above.</p>';
  var order=['lifeguard','ring','aed','ephone','police','hospital','fire','amb','pharmacy'].concat(/^(boat|sail)$/.test(A.mode)?['bfuel']:[]),rows=[];
  order.forEach(function(c){var L=B[c];if(!L||!L.length)return;var x=L[0],h=HL[c];var walk=x.d<1.6?walkMin(x.d)+' min walk':km(x.d);var dir='https://www.google.com/maps/dir/?api=1&destination='+x.lat+','+x.lon;
   rows.push('<div class="dmHelpR '+c+'"><span class="ic">'+I(h[0])+'</span><span class="tx"><b>'+E(h[1])+'</b>'+(x.n?'<small>'+E(x.n)+'</small>':'')+(c==='aed'&&x.loc?'<small>'+E(x.loc)+'</small>':'')+(c==='pharmacy'&&x.hrs?'<small>'+E(x.hrs)+'</small>':'')+'</span><span class="d">'+E(walk)+'</span>'+(x.ph&&c!=='aed'&&c!=='ring'?'<a class="cl" href="'+E(telHref(x.ph))+'" aria-label="Call">'+I('phone')+'</a>':'')+'<a class="cl" href="'+E(dir)+'" target="_blank" rel="noopener" aria-label="Route">'+I('route')+'</a></div>')});
  if(!rows.length)return '<p class="dmSosNote">'+I('info')+'No police, hospital or lifeguard is mapped within a few kilometres — in an emergency call the number above.</p>';
  return '<div class="dmHelp">'+rows.join('')+'</div><p class="dmSosSrc">Nearest help from OpenStreetMap (as mapped by local volunteers). In an emergency always call — do not drive yourself.</p>'}
 function sosBlock(lat,lon,cc,box){if(!box)return;var go=function(c){c=String(c||'').toUpperCase();box.innerHTML=sosNumbersHtml(c)+'<div class="dmHelpWrap"><p class="dmBwait"><i></i>Finding the nearest police, hospital and lifeguard…</p></div>';
   getHelp(lat,lon).then(function(B){var w=box.querySelector('.dmHelpWrap');if(w)w.innerHTML=sosNearHtml({lat:lat,lon:lon},B)})};
  if(cc)go(cc);else getCC(lat,lon).then(function(c){go(c)}).catch(function(){go('')})}
 function sosSection(){return '<div class="section dmSOS"><h3>'+I('siren')+'Emergency &amp; help nearby</h3><div id="dmSos" class="dmSosBox"></div></div>'}
 /* swim card: add the same section when a swim card opens (the swim card is rebuilt often, so re-attach when needed) */
 (function(){var cb=document.getElementById('cardBody');if(!cb||typeof MutationObserver!=='function')return;var busy=false;
  new MutationObserver(function(){if(busy)return;var dr=document.getElementById('drawer');if(!dr||!dr.classList.contains('open'))return;var id=typeof state!=='undefined'&&state.selected;if(!id)return;var v=(state.results||[]).find(function(x){return x.id===id});if(!v)return;
   var ex=cb.querySelector('.dmSOS');if(ex&&ex.getAttribute('data-id')===String(id))return;busy=true;try{if(ex)ex.remove();var wrap=document.createElement('div');wrap.innerHTML=sosSection().replace('id="dmSos"','');var el=wrap.firstChild;el.setAttribute('data-id',String(id));
    var anchor=null;cb.querySelectorAll('.section').forEach(function(s){anchor=s});if(anchor&&anchor.nextSibling)cb.insertBefore(el,anchor.nextSibling);else cb.appendChild(el);
    sosBlock(v.lat,v.lon,'',el.querySelector('.dmSosBox'))}finally{setTimeout(function(){busy=false},0)}}).observe(cb,{childList:true})})();
