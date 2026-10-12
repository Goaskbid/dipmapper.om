 /* ================= v23.7 under water: what divers need — depth, visibility, fish and life ================= */
 /* Site facts come from the researched dive-site descriptions (dive_data.js, sources in each explainer);
    lake depth from Wikidata (P4511 "vertical depth"), fish from GBIF occurrence records, rain from Open-Meteo. */
 ICONS.depth='<path d="M12 3v15M7 13l5 5 5-5"/><path d="M4 21h16"/>';
 ICONS.eye2='<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>';
 function isDiveCard(v){if(!v||v.svc)return false;/* v23.7: dive centres, schools and shops get no site section unless the site facts are known */if(v.kind&&v.kind!=='place'&&!diveOf(v))return false;return A.mode==='dive'||!!(v.acts&&(v.acts.dive||v.acts.snorkel||v.acts.freedive||v.acts.wreck))}
 function diveOf(v){var D0=window.DM_DIVE||{};return D0[v.dirId]||D0[v.id]||null}
 var LAKED={};
 function lakeDepth(title,qid){if(!title&&!qid)return Promise.resolve(null);var lk=qid||title;if(LAKED[lk])return LAKED[lk];
  var p=(qid?Promise.resolve({query:{pages:{x:{pageprops:{wikibase_item:qid}}}}}):fetchJsonTimeout('https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=pageprops&ppprop=wikibase_item&titles='+encodeURIComponent(title),{},7000)).then(function(j){var pg=Object.values((j&&j.query&&j.query.pages)||{})[0];var q=pg&&pg.pageprops&&pg.pageprops.wikibase_item;if(!q)return null;
   return fetchJsonTimeout('https://www.wikidata.org/w/api.php?action=wbgetclaims&format=json&origin=*&property=P4511&entity='+q,{},7000).then(function(w){var c=(w&&w.claims&&w.claims.P4511)||[];var best=null;c.forEach(function(x){var dv=x.mainsnak&&x.mainsnak.datavalue&&x.mainsnak.datavalue.value;if(!dv)return;var amt=Math.abs(parseFloat(dv.amount));if(!isFinite(amt))return;if(dv.unit&&!/Q11573$/.test(dv.unit))return;if(!best||amt>best)best=amt});return best?{max:Math.round(best),q:q}:null})}).catch(function(){return null});LAKED[lk]=p;return p}
 /* lake-specific, sourced visibility notes */
 var VISNOTE=[[/zurich|zürich|zuerich/i,/ober/i,'Zürich-Obersee: Secchi visibility is about 4 m all year (measured at Lachen).','https://www.sz.ch/public/upload/assets/20466/Gewaesserzustand_von_Zuerichsee_Zuerichobersee_und_Walensee.pdf'],
  [/zurich|zürich|zuerich/i,null,'Lake Zurich is usually clearest in the short "clear-water phase" in May–June. Winter visibility has dropped since the 1990s because of the reddish blue-green alga Planktothrix.','https://www.sz.ch/public/upload/assets/20466/Gewaesserzustand_von_Zuerichsee_Zuerichobersee_und_Walensee.pdf']];
 function visNote(lake){if(!lake||!/zurich|zürich|zuerich/i.test(lake))return null;return /ober/i.test(lake)?VISNOTE[0]:VISNOTE[1]}
 function diveSection(v){if(!isDiveCard(v))return '';return '<div class="section dmDive"><h3>'+I('dive')+'Under water</h3><div id="dmDiveBox" class="dmDiveBox"><p class="dmBwait"><i></i>Looking up depth, visibility and fish…</p></div></div>'}
 function fillDive(v,cd){var box=document.getElementById('dmDiveBox');if(!box)return;var d=diveOf(v);
  waterOf(v).then(function(wb){var lake=wb?wb.title:'';return Promise.all([lake,lakeDepth(lake,wb&&wb.q),getFish(v.lat,v.lon)])}).catch(function(){return ['',null,null]}).then(function(r){if(!alive(v))return;var lake=r[0],ld=r[1],fish=r[2];var b=document.getElementById('dmDiveBox');if(!b)return;
   var t=[];var tile=function(cls,ic,k,val,sub,src){t.push('<div class="dmDvT '+cls+'"><span class="ic">'+I(ic)+'</span><span class="tx"><small>'+E(k)+'</small><b>'+val+'</b>'+(sub?'<em>'+sub+'</em>':'')+(src?'<span class="src">'+src+'</span>':'')+'</span></div>')};
   var srcSite=v.xsrc&&v.xsrc[0]?'Source: <a href="'+E(v.xsrc[0])+'" target="_blank" rel="noopener">'+E(host(v.xsrc[0]))+'</a>':'';
   if(d&&(d.max||d.maxTxt))tile('dep','depth','Depth here',d.max?'max. about '+d.max+' m':E(d.maxTxt),E(d.profile||''),srcSite);
   else tile('dep','depth','Depth here','Not published','Ask the dive centre for the profile before you go.','');
   if(ld&&ld.max)tile('lake','wave','The lake',E(lake)+' · up to '+ld.max+' m','Deep water stays cold all year — below the summer thermocline it is much colder than at the surface.','Source: <a href="https://www.wikidata.org/wiki/'+E(ld.q)+'" target="_blank" rel="noopener">Wikidata</a>');
   var r48=null;try{if(cd&&cd.rain48!=null)r48=cd.rain48;else if(A.cd&&A.cd.rain48!=null)r48=A.cd.rain48}catch(e){}
   var vn=visNote(lake);var visV=d&&d.vis?E(d.vis):'No live measurement';var visS=(r48!=null?'Rain in the last 48 h: '+R0(r48)+' mm'+(r48>=10?' — expect murkier water near river mouths. ':'. '):'')+(vn?E(vn[2])+' ':'')+'Ask the dive centre for today\'s visibility.';
   tile('vis','eye2','Visibility',visV,visS,vn?'Source: <a href="'+E(vn[3])+'" target="_blank" rel="noopener">Kanton Schwyz lake report</a>':(d&&d.vis?srcSite:''));
   var fl=(fish&&fish.list)||[];var fh=fl.slice(0,6).map(function(f){return '<span class="dmFishC"><b>'+E(f.en||f.sci)+'</b>'+(f.en&&f.sci?'<i>'+E(f.sci)+'</i>':'')+'<small>'+f.n+' records</small></span>'}).join('');
   tile('fish','fish','Fish & life',d&&d.life?E(d.life):(fl.length?fl.length+' species recorded within ~5 km':'No records nearby'),fh?'<span class="dmFishRow">'+fh+'</span>':'',fl.length?'Source: <a href="https://www.gbif.org/occurrence/map?lat='+v.lat.toFixed(3)+'&lng='+v.lon.toFixed(3)+'&zoom=12" target="_blank" rel="noopener">GBIF occurrence records</a> — what has been seen here over the years, not what you will see today':'');
   if(d&&(d.level||d.note))t.push('<p class="dmDvNote">'+I('info')+(d.level?'<b>'+E(d.level)+'.</b> ':'')+E(d.note||'')+'</p>');
   b.innerHTML='<div class="dmDvGrid">'+t.join('')+'</div>'})}
 /* ================= v23.7: one water-temperature model for the whole site =================
    Swim cards used a month table (≈14 °C in October on Lake Zurich) while the activity cards used the last 30 days of
    air temperature at the place (≈17 °C). The swim cards now use the same measured-weather model where it is available. */
 var SWCL={k:'',cl:null,sea:null,busy:false};
 window.dmModelWaterTemp=function(v){if(!SWCL.cl&&!SWCL.sea)return null;var c=state.center;if(!c||!v||v.lat==null)return null;if(D(c[0],c[1],v.lat,v.lon)>40)return null;
  var river=/fluss|river|rhein|rhine|limmat|aare|reuss|rh[oô]ne|inn\b|isar|donau|danube/i.test(String(v.name||'')+' '+String(v.address||''));
  var w=waterTemp({river:river},SWCL.cl,river?null:SWCL.sea);if(!w||w.c==null)return null;return {c:w.c,est:!!w.est||w.src!=='model'}};
 setInterval(function(){try{var c=state.center;if(!c||SWCL.busy)return;var k=c[0].toFixed(2)+','+c[1].toFixed(2);if(SWCL.k===k)return;SWCL.busy=true;
  Promise.all([getClim(c[0],c[1]),getSea(c[0],c[1])]).then(function(r){SWCL.k=k;SWCL.cl=r[0]||null;SWCL.sea=r[1]&&r[1].sst!=null?r[1]:null;SWCL.busy=false;if(A.mode==='swim'&&typeof render==='function'){try{state._renderSig=null;state._ovSig=null;render()}catch(e){}}}).catch(function(){SWCL.busy=false;SWCL.k=k})}catch(e){}},1500);
