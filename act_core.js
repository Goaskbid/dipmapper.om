/* ================= v23.2 (based on v23.1): water activities beside swimming (paddle, dive, sail & wind, boats & tours, rafting) =================
   Swimming keeps its own engine untouched. Activity modes run a separate OpenStreetMap search around the same search point,
   keep places (launch points, ramps, marinas, landings, wrecks) apart from providers (rentals, schools, clubs, tours, centres),
   and show only what the data says: no invented prices, hours or bookings. */
(function(){
 if(!document.getElementById('map'))return;
 var MODES=[
  {k:'swim',ic:'🏊',t:'Swim',long:'Swimming'},
  {k:'paddle',ic:'🛶',t:'Paddle',long:'Paddle & row',col:'#e07a24'},
  {k:'dive',ic:'🤿',t:'Dive',long:'Dive & snorkel',col:'#5b4bd1'},
  {k:'sail',ic:'⛵',t:'Sail',long:'Sail, surf & wind',col:'#1c6fd3'},
  {k:'boat',ic:'🚤',t:'Boats',long:'Boats & tours',col:'#0a8a72'},
  {k:'raft',ic:'🌊',t:'Rafting',long:'Rafting & canyoning',col:'#c6443b'},
  {k:'special',ic:'✨',t:'Specials',long:'Specials & one-offs',col:'#c8961e'},
  {k:'ice',ic:'⛸️',t:'Ice',long:'Ice & winter',col:'#3b82c4'}];
 var MODE={};MODES.forEach(function(m){MODE[m.k]=m});
 /* activity key: [label, icon, modes] */
 var ACT={sup:['SUP','🏄','paddle'],kayak:['Kayak & canoe','🛶','paddle'],row:['Rowing','🚣','paddle'],pedal:['Pedal boats','🦢','paddle boat'],
  boatrent:['Boat rental','🔑','paddle boat'],motorboat:['Motorboats','🚤','boat'],
  dive:['Scuba diving','🤿','dive'],snorkel:['Snorkelling','🐠','dive'],freedive:['Freediving','🐬','dive'],wreck:['Wrecks','⚓','dive'],
  sail:['Sailing','⛵','sail'],windsurf:['Windsurfing','🏄','sail'],kite:['Kitesurfing','🪁','sail'],wing:['Wingfoiling','🌬️','sail'],surf:['Surfing','🌊','sail'],
  tour:['Boat tours & ferries','🛳️','boat'],fuel:['Boat fuel','⛽','boat'],charter:['Charters','🛥️','boat'],fishing:['Fishing trips','🎣','boat'],wake:['Water-ski & wake','🎿','boat'],
  raft:['Rafting','🌊','raft'],canyon:['Canyoning','🧗','raft'],whitewater:['White water','💦','raft'],skate:['Ice skating','⛸️','ice'],swimx:['Swimming','🏊','special'],sauna:['Sauna','🧖','special'],thermal:['Thermal waters','♨️','special'],glow:['Night & glow','🌙','special']};
 var TYPE={launch:['Launch point','place','📍'],ramp:['Boat ramp','place','📍'],marina:['Marina / harbour','place','⚓'],pier:['Ferry & boat landing','place','🛳️'],fuel:['Boat fuel station','place','⛽'],wreck:['Wreck','place','⚓'],spot:['Spot','place','📍'],
  rental:['Rental','provider','🔑'],rink:['Ice rink','place','⛸️'],icelake:['Natural ice (lake)','place','❄️'],school:['School','provider','🎓'],club:['Club','provider','🤝'],tours:['Tours & cruises','provider','🛳️'],centre:['Centre','provider','🏢'],shop:['Shop','provider','🛍️']};
 var TYPEMODES={fuel:'boat',launch:'paddle',ramp:'sail boat',marina:'sail boat',pier:'boat',wreck:'dive',rink:'ice',icelake:'ice'};
 var CHIPS={paddle:['sup','kayak','row','pedal','boatrent','t:launch','p:rental','p:school','p:club'],
  dive:['dive','snorkel','freedive','wreck','p:centre','p:school','p:club'],
  sail:['sail','windsurf','kite','wing','surf','t:marina','t:ramp','p:rental','p:school','p:club'],
  boat:['tour','boatrent','motorboat','charter','fishing','wake','fuel','t:pier','t:marina','t:ramp'],
  raft:['raft','canyon','whitewater','p:tours','p:school'],
  ice:['t:icelake','t:rink'],
  special:['sp:wave','sp:floating','sp:river','sp:rooftop','sp:sauna','sp:thermal','sp:nature','sp:deep','sp:boat','sp:night']};
 var CHIPLBL={'t:launch':['📍','Launch points'],'t:marina':['⚓','Marinas'],'t:ramp':['📍','Boat ramps'],'t:pier':['🛳️','Ferry landings'],
  'p:rental':['🔑','Rentals'],'p:school':['🎓','Schools'],'p:club':['🤝','Clubs'],'p:centre':['🏢','Dive centres'],'p:tours':['🛳️','Tour operators'],'t:rink':['⛸️','Ice rinks'],'t:icelake':['❄️','Natural ice'],'sp:sauna':['🧖','Saunas on the water'],'sp:floating':['🛟','Floating & harbour baths'],'sp:river':['🌊','River swimming'],'sp:rooftop':['🏙️','Rooftop pools'],'sp:thermal':['♨️','Thermal waters'],'sp:nature':['🏞️','Iconic natural swims'],'sp:boat':['⛴️','Iconic boat trips'],'sp:wave':['🌊','Surf waves'],'sp:wake':['🎿','Wake & cable'],'sp:night':['🌅','Sunset & night'],'sp:yoga':['🧘','SUP yoga'],'sp:kids':['🧒','Kids'],'sp:eboat':['⚡','E- & classic boats'],'sp:deep':['🤿','Deep & wreck dives'],'sp:famous':['⭐','Famous']};
 var NAMES={paddle:'SUP |SUP-|SUP$|^SUP|Stand.?Up|Paddle ?board|Paddel|Kayak|Kajak|Canoe|Kanu|Pedalo|Pédalo|Tretboot|Ruderboot|Ruderclub|Ruderverein|Seeclub|Wassersport|Bootsvermietung|Bootsverleih|Bootsvermiet|Boat ?hire|Boat ?rental|Location de bateaux|Noleggio barche|Alquiler de barcos',
  dive:'Dive|Diving|Tauch|Plongée|Plongee|Buceo|Subacque|Immersion|Snorkel|Schnorchel|Freediv|Apnoe|Apnea',
  sail:'Segel|Yacht|Sailing|Voile|Vela |Windsurf|Kite|Wing ?foil|Surf',
  boat:'Schifffahrt|Schiffahrt|Rundfahrt|Schiffstation|Schiffsstation|Boat ?tour|Boat ?trip|Cruise|Kreuzfahrt|Charter|Wassertaxi|Water ?taxi|Ausflugsschiff|Motorboot|Wakeboard|Wasserski|Wakesurf|Bootsvermietung|Bootsverleih|Bootsvermiet|Pedalo|Tretboot|Boat ?hire|Boat ?rental|Gite in barca|Paseo en barco',
  raft:'Rafting|Canyoning|Wildwasser|White ?water|Hydrospeed',
  ice:'Eisbahn|Eisfeld|Natureis|Kunsteis|Ice ?rink|Patinoire|Pattinaggio|Skating',
  special:'Sauna ?boot|Saunaboot|Sauna ?boat|Saunafloss|Floating sauna|Badesauna|Seesauna|Wake ?park|Cable ?park|Wasserskilift|Citywave|City ?wave|Surfwelle|Flusswelle|River ?wave|Wave ?pool|Wellenbad|Wavegarden|Dampfschiff|Raddampfer|Paddle steamer|Bungee ?surf'};
 var A={mode:'swim',items:[],chip:'all',busy:false,key:'',err:'',widened:0,when:0,label:'',sel:null,cache:{},wx:{},wxCenter:null};
 window.dmAct=A;
 function N(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'')}
 function E(s){return String(s==null?'':s).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]})}
 function km(d){return d<1?Math.round(d*1000)+' m':d.toFixed(d<10?1:0)+' km'}
 function D(a,b,c,d){try{return dist(a,b,c,d)}catch(e){return 0}}
 function radiusKm(){try{return Number(document.getElementById('radius').value||5)}catch(e){return 5}}
 /* ---------- query: one Overpass request per mode, sized by the chosen radius ---------- */
 function query(mode,R,lat,lon){var a='(around:'+R+','+lat+','+lon+');',an='(around:'+Math.min(R,25000)+','+lat+','+lon+');',q=[];
  if(mode==='paddle')q=['nwr["amenity"="boat_rental"]'+a,'node["canoe"~"put_in|egress|portage"]'+a,'nwr["sport"~"canoe|kayak|rowing|paddle|stand_up"]'+a,'nwr["rental"~"kayak|canoe|sup|paddle|pedal|rowing|boat"]'+a,'nwr["shop"="water_sports"]'+a,'nwr["sport"~"(^|;)sup(;|$)"]'+a,'nwr[~"^rental:"~"yes"]'+a];
  if(mode==='dive')q=['nwr["shop"="scuba_diving"]'+a,'nwr["amenity"="dive_centre"]'+a,'nwr["sport"~"scuba|snorkel|free_?diving|apnea"]'+a,'nwr["historic"="wreck"]["name"]'+a,'node["seamark:type"="wreck"]["name"]'+a];
  if(mode==='sail')q=['nwr["sport"~"sailing|windsurf|kitesurf|kiteboard|wing|surfing"]'+a,'nwr["leisure"~"^(marina|slipway)$"]'+a,'nwr["club"="sailing"]'+a,'nwr["rental"~"sail|surf|kite|wing"]'+a,'nwr["kitesurfing"~"yes|designated"]'+a,'nwr["windsurfing"~"yes|designated"]'+a,'nwr["surfing"~"yes|designated|wave"]'+a];
  if(mode==='boat')q=['nwr["amenity"~"^(ferry_terminal|boat_rental)$"]'+a,'nwr["leisure"~"^(marina|slipway)$"]'+a,'nwr["sport"~"water_ski|wakeboard|waterski"]'+a,'nwr["waterway"="fuel"]'+a,'nwr["amenity"="fuel"]["boat"="yes"]'+a,'nwr["seamark:small_craft_facility:category"~"fuel_station"]'+a];
  if(mode==='raft')q=['nwr["sport"~"rafting|canyoning|whitewater|white_water|hydrospeed"]'+a];
  if(mode==='special')q=['nwr["sport"~"surfing|wakeboard|water_ski"]["leisure"~"sports_centre|water_park|pitch"]'+a,'nwr["leisure"="sauna"]["name"]'+a,'nwr["amenity"="sauna"]["name"]'+a];
  if(mode==='ice')q=['nwr["leisure"="ice_rink"]'+a,'nwr["sport"~"ice_skating"]'+a,'nwr["natural"="water"]["water"~"^(lake|pond|reservoir|lagoon|oxbow)$"]["name"]'+a];
  if(NAMES[mode])q.push('nwr["name"~"('+NAMES[mode]+')",i]'+an);
  var to=Math.max(15,Math.min(30,Math.round(R/1500)));
  return '[out:json][timeout:'+to+'];('+q.join('')+');out meta center qt 300;'}
 /* ---------- classification ---------- */
 var RX={sup:/(^|[^a-z])sup([^a-z]|$)|stand.?up|paddle ?board|stand_up_paddle/,kayak:/kayak|kajak|canoe|kanu|canoe|pirag/,row:/rowing|ruder|aviron|canottag|(^|[^a-z])remo([^a-z]|$)/,
  pedal:/pedalo|pedal ?boat|pedalboat|tretboot|pattino|patin/,boatrent:/boat ?(hire|rental|rent)|bootsvermiet|bootsverleih|location de bateau|noleggio (barche|barca)|alquiler de barcos|boot.?verleih/,
  motorboat:/motor ?boat|motorboot|bateau a moteur|barca a motore|jet ?ski|jetski/,dive:/scuba|diving|(^|[^a-z])dive([^a-z]|$)|tauch|plong|buceo|subacque|immersion/,snorkel:/snorkel|schnorchel/,
  freedive:/free_?div|apnoe|apnea|apnee/,wreck:/wreck|wrack|epave|relitto|pecio/,sail:/sail|segel|voile|(^|[^a-z])vela([^a-z]|$)|yacht/,windsurf:/windsurf/,kite:/kite ?surf|kiteboard|kitesurf|kiteschule|kite ?school|kite ?station/,
  wing:/wing ?foil|wingfoil|wing_foil/,surf:/(^|[^a-z])surf/,wake:/wake ?board|wakeboard|wake ?park|water.?ski|wasserski|ski nautique|sci nautico/,
  tour:/schiff|rundfahrt|boat ?(tour|trip)|cruise|kreuzfahrt|ausflugsschiff|paseo en barco|gite in barca|ferry|faehre|fahre|traghetto|water ?taxi|wassertaxi/,charter:/(^|[^a-z])charter/,
  fishing:/(fishing|angel|pesca|peche).{0,24}(charter|trip|tour|boot|boat)|(charter|boot|boat).{0,24}(fishing|angel|pesca)/,raft:/raft/,canyon:/canyon/,whitewater:/whitewater|white water|wildwasser|hydrospeed/,skate:/ice.?skating|ice rink|eisbahn|eisfeld|natureis|kunsteis|patinoire|pattinaggio|skating/};
 var NOPE=/^(bar|pub|restaurant|cafe|fast_food|nightclub|ice_cream|fuel|parking|bicycle_rental|car_rental|biergarten|casino)$/;
 function classify(e,mode){var t=e.tags||{};var lat=+(e.lat!=null?e.lat:(e.center&&e.center.lat)),lon=+(e.lon!=null?e.lon:(e.center&&e.center.lon));if(!lat||!lon)return null;
  if(/^(private|no|permit|customers)$/.test(t.access||''))return null;
  var name=(t.name||t['name:en']||t.official_name||t.alt_name||'').trim();
  if(mode==='ice'&&t.natural==='water'){if(!name)return null;var IL=nearIceLake(lat,lon);return {id:'act-'+e.type+'-'+e.id,osm:e.type+'/'+e.id,name:name,generic:false,lat:lat,lon:lon,acts:{skate:'map'},type:'icelake',kind:'place',ev:'map',ice:IL||{k:'contact',auth:'No official ice release known here — ask the municipality or local police',n:name,url:''},auth:IL?IL.auth:'',web:IL&&IL.url||'',book:'',phone:'',email:'',hours:'',season:'',operator:'',charge:'',fee:'',rent:[],wheel:'',descr:'',addr:'',edited:e.timestamp||'',checked:'',ntags:5,oh:'',img:(typeof osmPhotoUrl==='function'?osmPhotoUrl(t):'')}}
  /* v23.7: boat fuel stations (OpenStreetMap waterway=fuel, or a fuel station marked for boats) */
  if(t.waterway==='fuel'||(t.amenity==='fuel'&&t.boat==='yes')||/fuel_station/.test(t['seamark:small_craft_facility:category']||'')){return {id:'act-'+e.type+'-'+e.id,osm:e.type+'/'+e.id,name:name||'Boat fuel station',generic:!name,lat:lat,lon:lon,acts:{fuel:'map'},type:'fuel',kind:'place',svc:true,ev:'map',web:t.website||t['contact:website']||'',book:'',phone:t.phone||t['contact:phone']||'',email:t.email||'',hours:t.opening_hours||'',oh:t.opening_hours||'',season:'',operator:t.operator||t.brand||'',charge:'',fee:'',rent:[],wheel:'',descr:[t['fuel:diesel']==='yes'?'Diesel':'',t['fuel:octane_95']==='yes'||t['fuel:octane_98']==='yes'?'Petrol':'',t.payment_cards==='yes'||t['payment:credit_cards']==='yes'?'cards accepted':''].filter(Boolean).join(' · '),addr:[t['addr:street'],t['addr:housenumber'],t['addr:city']].filter(Boolean).join(' '),edited:e.timestamp||'',checked:'',prices:[],offers:'',notes:'',ntags:Object.keys(t).length,img:'',cc:''}}
  var sportT=String(t.sport||'');if(/(^|;)diving(;|$)/.test(sportT)&&!/scuba|free_?div|snorkel/.test(sportT)){if(!t.shop&&t.amenity!=='dive_centre')return null}
  var tagText=N([t.sport,t.rental,t.amenity,t.shop,t.leisure,t.club,t.canoe,t.historic,t['seamark:type'],t.boat,(t.kitesurfing&&t.kitesurfing!=='no'?'kitesurf':''),(t.windsurfing&&t.windsurfing!=='no'?'windsurf':''),(t.surfing&&t.surfing!=='no'?'surfing':''),Object.keys(t).filter(function(k){return /^(rental|boat_rental|service)[:_]/.test(k)&&/yes|only/.test(t[k])}).join(' ')].join(' ')).replace(/_/g,' ');
  var nameText=N([name,t['name:en'],t.operator,t.brand,t['description:en']].join(' '));
  if(NOPE.test(t.amenity||'')&&!/boat|kayak|canoe|sup|dive|sail|surf/.test(tagText.replace(/amenity/g,'')))return null;
  if(/^(hotel|guest_house|hostel|apartment|motel|chalet)$/.test(t.tourism||'')&&!t.rental&&t.amenity!=='boat_rental')return null;
  if(/segelflug|segelflieger|gliding/.test(nameText+' '+tagText))return null;
  if(/(^|;)(padel|paddle_tennis|pickleball)(;|$)/.test(t.sport||'')&&!/canoe|kayak|rowing|sailing|scuba/.test(t.sport||''))return null;
  if(t.sport==='diving'&&/swimming_pool|sports_centre|water_park/.test(t.leisure||''))return null; /* springboard diving, not scuba */
  if(t.shop&&!/^(scuba_diving|water_sports|boat|sports|outdoor|surf)$/.test(t.shop))return null;
  var acts={};Object.keys(RX).forEach(function(k){if(RX[k].test(tagText))acts[k]='map';else if(RX[k].test(nameText))acts[k]='name'});
  if(t.amenity==='boat_rental'){acts.boatrent='map'}
  if(t.amenity==='dive_centre'||t.shop==='scuba_diving'){acts.dive='map'}
  if(t.club==='sailing'){acts.sail='map'}
  if(t.amenity==='ferry_terminal'){acts.tour=acts.tour||'map'}
  if((t.historic==='wreck'||t['seamark:type']==='wreck')){acts.wreck='map'}
  if(acts.fishing&&!acts.charter&&!acts.tour&&!acts.boatrent)delete acts.fishing;
  if(acts.charter==='name'&&!/boat|yacht|boot|segel|sail|cruise|fishing|angel|catamaran|katamaran/.test(nameText+' '+tagText)&&!acts.sail&&!acts.motorboat)delete acts.charter;
  if(acts.surf&&(acts.windsurf||acts.kite)&&!/(^|[^a-z])surf(ing|board|school|schule|camp|club|shop)?([^a-z]|$)/.test(nameText.replace(/windsurf|kitesurf/g,'')+' '+tagText.replace(/windsurf|kitesurf/g,'')))delete acts.surf;
  var type;var nt=nameText;
  if(t.leisure==='ice_rink'){type='rink';acts.skate='map'}
  else if(/put.?in|egress|portage/.test(N(t.canoe||'')))type='launch';
  else if(t.leisure==='slipway')type='ramp';
  else if(t.leisure==='marina')type='marina';
  else if(t.amenity==='ferry_terminal')type='pier';
  else if(t.historic==='wreck'||t['seamark:type']==='wreck')type='wreck';
  else if(t.amenity==='boat_rental'||t.rental||/verleih|vermiet|rental|(^|[^a-z])hire|location|noleggio|alquiler|(^|[^a-z])rent([^a-z]|$)/.test(nt))type='rental';
  else if(/school|schule|ecole|escuela|scuola|academy|akademie|(^|[^a-z])kurs|lesson|instructor|lezion|cours/.test(nt))type='school';
  else if(t.club||/club|klub|verein|societ|association|cercle/.test(nt))type='club';
  else if(t.amenity==='dive_centre'||t.shop==='scuba_diving'||/center|centre|base|station|basis/.test(nt)&&(acts.dive||acts.kite||acts.windsurf||acts.wake))type='centre';
  else if(acts.tour||acts.charter||/tour|cruise|schifffahrt|schiffahrt|kreuzfahrt|charter/.test(nt))type='tours';
  else if(t.shop)type='shop';
  else if(t.leisure==='sports_centre')type='centre';
  else type='spot';
  if(type==='launch'){acts.kayak=acts.kayak||'map';acts.sup=acts.sup||'map'}
  var modeActs=Object.keys(acts).filter(function(k){return ACT[k][2].split(' ').indexOf(mode)>=0});
  var typeFits=(TYPEMODES[type]||'').split(' ').indexOf(mode)>=0;
  if(!modeActs.length&&!typeFits&&mode!=='special')return null;
  if(mode==='special'&&!Object.keys(acts).length&&!/sauna/i.test(nameText+' '+tagText))return null;
  var generic=false;if(!name){if(TYPE[type][1]!=='place')return null;generic=true;name=type==='launch'?'Paddle launch point':type==='ramp'?'Boat ramp':type==='pier'?'Boat landing':type==='marina'?'Marina':'';if(!name)return null}
  var all=Object.keys(acts);var ev=all.some(function(k){return acts[k]==='map'})||!!TYPEMODES[type]?'map':'name';
  var rent=[];(t.rental||'').split(';').forEach(function(x){x=x.trim();if(x)rent.push(x.replace(/_/g,' '))});Object.keys(t).forEach(function(k){var m=k.match(/^(?:rental|boat_rental)[:_]([a-z_]+)$/);if(m&&/yes|only/.test(t[k]))rent.push(m[1].replace(/_/g,' '))});
  var web=[t.website,t['contact:website'],t.url,t['contact:url']].filter(function(u){return /^https?:\/\//i.test(u||'')})[0]||'';
  var book=[t.booking,t['booking:url'],t['reservation:website'],t['reservation:url'],t['url:booking']].filter(function(u){return /^https?:\/\//i.test(u||'')})[0]||'';
  return {id:'act-'+e.type+'-'+e.id,osm:e.type+'/'+e.id,name:name,generic:generic,lat:lat,lon:lon,acts:acts,type:type,kind:TYPE[type][1],ev:ev,
   web:web,book:book,phone:t.phone||t['contact:phone']||'',email:t.email||t['contact:email']||'',hours:(typeof dmHours==='function'?dmHours(t.opening_hours||''):t.opening_hours||''),
   season:t.seasonal&&t.seasonal!=='no'?(t.seasonal==='yes'?'Seasonal':String(t.seasonal)):'',operator:t.operator||'',charge:t.charge||'',fee:t.fee||'',rent:rent,wheel:t.wheelchair||'',
   descr:t['description:en']||(typeof dmLang==='function'&&t.description&&dmLang(t.description)==='English'?t.description:''),
   addr:[[t['addr:street'],t['addr:housenumber']].filter(Boolean).join(' '),t['addr:city']||t['addr:place']||''].filter(Boolean).join(', '),
   edited:e.timestamp||'',checked:t.check_date||t['survey:date']||'',ntags:Object.keys(t).length,
   oh:t.opening_hours||'',ig:t['contact:instagram']||t.instagram||'',fb:t['contact:facebook']||t.facebook||'',wa:t['contact:whatsapp']||t.whatsapp||'',yt:t['contact:youtube']||'',mobile:t.mobile||t['contact:mobile']||'',
   img:(typeof osmPhotoUrl==='function'?osmPhotoUrl(t):''),wikidata:t.wikidata||'',cc:String(t['addr:country']||'').toUpperCase(),indoor:t.indoor==='yes'||!!t.building}}
 function dedupe(list){var out=[];list.forEach(function(v){var hit=null;for(var i=0;i<out.length;i++){var o=out[i];var same=(!v.generic&&!o.generic&&N(o.name)===N(v.name)&&D(o.lat,o.lon,v.lat,v.lon)<0.25)||(v.generic&&o.generic&&o.type===v.type&&D(o.lat,o.lon,v.lat,v.lon)<0.08);if(same){hit=o;break}}
   if(!hit){out.push(v);return}var keep=v.ntags>hit.ntags?v:hit,drop=keep===v?hit:v;Object.keys(drop.acts).forEach(function(k){if(!keep.acts[k]||keep.acts[k]==='name')keep.acts[k]=drop.acts[k]});['web','book','phone','email','hours','addr','operator','charge','oh','ig','fb','wa','img','mobile'].forEach(function(f){if(!keep[f]&&drop[f])keep[f]=drop[f]});if(drop.ev==='map')keep.ev='map';
   if(keep!==hit){out[out.indexOf(hit)]=keep}});return out}
 /* ---------- verified directory (DM_ACT_DIR) ---------- */
 var GEO={};try{GEO=JSON.parse(localStorage.getItem('dm_geo_v1')||'{}')||{}}catch(e){GEO={}}
 function dirModes(d){var ms={};(d.acts||[]).forEach(function(k){if(ACT[k])ACT[k][2].split(' ').forEach(function(m){ms[m]=1})});(TYPEMODES[d.type]||'').split(' ').forEach(function(m){if(m)ms[m]=1});return ms}
 function dirItems(mode,c,limKm){var out=[];if(mode==='ice')(window.DM_ICE_LAKES||[]).forEach(function(L){var dd=D(c[0],c[1],L.lat,L.lon);if(dd>limKm)return;out.push({id:'ice-'+N(L.n).replace(/[^a-z0-9]+/g,'-'),osm:'',name:L.n,generic:false,lat:L.lat,lon:L.lon,geo:'est',acts:{skate:'dir'},type:'icelake',kind:'place',ev:'ice',ice:L,auth:L.auth,web:L.url||'',src:L.src||L.url||'',book:'',phone:'',email:'',hours:'',season:'',operator:'',charge:'',fee:'',rent:[],wheel:'',descr:L.note||'',addr:'',edited:'',checked:'',prices:[],offers:'',notes:'',cc:L.cc,thin:false,ntags:50,dist:dd})});
 var SPN=null;if(mode==='special'){var all=(window.DM_SPECIALS||[]).map(function(s){var g=GEO[s.id];return D(c[0],c[1],g?g[0]:s.lat,g?g[1]:s.lon)}).sort(function(a,b){return a-b});var cut=150;if(all.filter(function(d){return d<=cut}).length<6)cut=Math.min(2000,all[Math.min(all.length-1,7)]||150);if(all.filter(function(d){return d<=cut}).length>12)cut=all[11];SPN=cut}
 if(mode==='special')(window.DM_SPECIALS||[]).forEach(function(s){var g=GEO[s.id];var la=g?g[0]:s.lat,lo=g?g[1]:s.lon;var dd=D(c[0],c[1],la,lo);if(dd>SPN)return;var acts={};(SPACT[s.cat]||['swimx']).forEach(function(k){acts[k]='dir'});
   out.push({id:s.id,dirId:s.id,osm:'',name:s.n,generic:false,lat:la,lon:lo,geo:g?'refined':s.geo,acts:acts,type:'spot',kind:'place',ev:'sp',spcat:s.cat,web:s.web||'',wiki:s.wiki||'',book:'',phone:'',email:'',hours:'',season:s.season||'',operator:'',charge:'',fee:'',rent:[],wheel:'',descr:s.what||'',addr:s.n+(s.city?', '+s.city:''),edited:'',checked:'2026-10-10',prices:[],offers:s.what||'',notes:'',src:s.src,about:s.about||'',tip:s.tip||'',warn:s.warn||'',access:s.access||'',cc:s.cc||'',xsrc:[s.src&&s.src[1]].concat((s.more||[]).map(function(m){return Array.isArray(m)?m[1]:m})).filter(Boolean),ntags:60,dist:dd,best:[],water:spPool(s)?'pool':'',waterTxt:spPool(s)?(s.cat==='wave'?'Managed wave pool — water temperature set by the operator':s.cat==='rooftop'?'Pool water — heated or set by the operator, not the lake':'Thermal or spa water — temperature set by the source and the operator'):''})});
 function spPool(s){var t=(s.n+' '+(s.what||'')+' '+(s.about||''));return s.cat==='thermal'||s.cat==='rooftop'||(s.cat==='wave'&&/pool|citywave|urbansurf|wavegarden|surf ?park|alaia|indoor|hall/i.test(t)&&!/river|flusswelle|eisbach|leine|reuss|aare|danube|donau/i.test(s.n))}
 (window.DM_ACT_DIR||[]).forEach(function(d){if(!dirModes(d)[mode]||d.closed)return;/* v23.7: a listing nobody can reach (no website, phone or e-mail and only a directory mention) is not shown */var pa0=(window.DM_ACT_PATCH||{})[d.id]||{};if(d.thin&&!d.web&&!d.phone&&!d.email&&!pa0.new_web&&!pa0.new_phone&&!pa0.new_email)return;var g=GEO[d.id];var lat=g?g[0]:d.lat,lon=g?g[1]:d.lon;var dd=D(c[0],c[1],lat,lon);if(dd>limKm)return;
   var acts={};(d.acts||[]).forEach(function(k){if(ACT[k])acts[k]='dir'});
   out.push({id:'dir-'+d.id,dirId:d.id,osm:'',name:d.n,generic:false,lat:lat,lon:lon,geo:g?'refined':d.geo,acts:acts,type:d.type,kind:TYPE[d.type][1],ev:'dir',web:d.web||'',book:d.book||'',phone:d.phone||'',email:d.email||'',
    hours:d.hours||'',season:d.season||'',operator:'',charge:'',fee:'',rent:[],wheel:'',descr:'',addr:d.addr||'',edited:'',checked:d.checked||'',prices:d.prices||[],offers:d.offers||'',notes:d.notes||'',src:d.src||null,thin:!!d.thin,ntags:99,dist:dd,
    oh:d.oh||'',ohNote:d.ohNote||'',shopOh:d.shopOh||'',ig:d.ig||'',fb:d.fb||'',wa:d.wa||'',req:d.req||'',srcs:d.srcs||{},psrc:d.psrc||'',status:d.status||'',river:!!d.river,water:d.water||'',cc:'CH',img:d.img||'',about:d.about||'',tip:d.tip||'',best:d.best||[],near:d.near||'',xsrc:d.xsrc||[],tt:d.tt||''})});return out}
 var STOPW=/^(bootsvermietung|bootsverleih|station|strandbad|seebad|zurich|zuerich|hafen|harbour|school|schule|club|rental|boats|boat|verleih|dive|site|stand|paddle|wakeboard|wakeboardschule|und|the|and|lake|see|zurichsee|zuerichsee|sport|sports|centre|center|schifffahrt|tauchschule|segelschule|kite|surf|spot|river|wave)$/;
 var PLACEW=/^(enge|seefeld|mythenquai|tiefenbrunnen|utoquai|wollishofen|burkliplatz|buerkliplatz|stafa|staefa|rapperswil|jona|schmerikon|greifensee|maur|mellingen|silvaplana|isleten|urnersee|thun|luzern|lucerne|bremgarten|herrliberg|richterswil|ruschlikon|rueschlikon|horn|meilen|kusnacht|kuesnacht|uetikon|zollikon|thalwil|wadenswil|horgen|kilchberg|erlenbach|mannedorf|sion|ebikon|reuss|aare)$/;
 function toks(n){return N(n).split(/[^a-z0-9]+/).filter(function(w){return w.length>=4&&!STOPW.test(w)&&!PLACEW.test(w)})}
 function sameBiz(d,o){var dd=D(d.lat,d.lon,o.lat,o.lon);if(dd>1.2)return false;var ta=toks(String(d.name).split(' – ')[0]),tb=toks(o.name);if(!ta.length)return dd<=0.15&&o.type===d.type&&!o.generic;return ta.some(function(w){return tb.indexOf(w)>=0})}
 function mergeDir(osm,dir){var keep=osm.filter(function(o){var hit=null;dir.forEach(function(d){if(!hit&&sameBiz(d,o))hit=d});if(hit){if(!hit.osm)hit.osm=o.osm;Object.keys(o.acts).forEach(function(k){if(!hit.acts[k])hit.acts[k]=o.acts[k]});['web','phone','email','hours'].forEach(function(f){if(!hit[f]&&o[f])hit[f]=o[f]});return false}return true});return dir.concat(keep)}
 function minPrice(v){var m=null;(v.prices||[]).forEach(function(p){if(/further|additional|extra|each more|surcharge|weitere|zuschlag/i.test(p[0])||/^\s*\+/.test(String(p[1])))return;var x=String(p[1]).match(/CHF\s*(\d+(?:\.\d+)?)/);if(x){var n=+x[1];if(m===null||n<m)m=n}});return m}
 function rank(v){return (A.mode==='special'?(v.ev==='sp'?-8:v.famous?-3:4):0)+v.dist-(v.famous?1:0)+(v.ev==='name'?2.5:0)-(v.ev==='dir'?(v.thin?0.4:1.5):0)-((v.prices&&v.prices.length)?0.5:0)-(v.web?0.3:0)-(v.phone?0.2:0)-(v.hours?0.2:0)}
 function matchesChip(v,c){if(c==='all')return true;if(c.indexOf('sp:')===0)return v.ev==='sp'?v.spcat===c.slice(3):specialsOf(v).indexOf(c.slice(3))>=0;if(c.indexOf('t:')===0)return v.type===c.slice(2);if(c.indexOf('p:')===0){var p=c.slice(2);return v.kind==='provider'&&(v.type===p||(p==='school'&&v.type==='school'))}return !!v.acts[c]}
 /* ---------- UI: activity switcher under the radius control ---------- */
 var bar=document.createElement('div');bar.id='dmActBar';bar.setAttribute('role','radiogroup');bar.setAttribute('aria-label','Activity');
 bar.innerHTML='<span class="lbl">Activity</span>'+MODES.map(function(m){return '<button type="button" role="radio" data-a="'+m.k+'" aria-label="'+E(m.long)+'"><span class="i">'+m.ic+'</span><span class="t">'+m.t+'</span></button>'}).join('');
 var rad=document.getElementById('dmRadius');if(rad&&rad.parentNode)rad.parentNode.insertBefore(bar,rad.nextSibling);else{var dest=document.getElementById('dest');var box=dest&&dest.closest('.searchBox,.controls,section,div');if(box)box.appendChild(bar)}
 bar.addEventListener('click',function(e){var b=e.target.closest('button[data-a]');if(!b)return;setMode(b.dataset.a,true)});
 var WINTER=(function(){var m=new Date().getMonth();return m>=10||m<=2})();var iceBtn=bar.querySelector('button[data-a="ice"]');if(iceBtn&&!WINTER)iceBtn.hidden=true;
 /* panel below the map (same place as the swim selectors and list) */
 var panel=document.createElement('section');panel.id='dmActPanel';panel.hidden=true;
 panel.innerHTML='<div id="dmActChips" role="toolbar" aria-label="Narrow down"></div><div class="dmActHead"><div><div class="eyebrow" id="dmActEyebrow">Activities</div><h2 id="dmActTitle">Activities</h2><div class="muted" id="dmActSub"></div></div><div id="dmActWind" hidden></div></div><div id="dmActList" aria-live="polite"></div><p class="dmActFoot">Results marked ✔ Verified come from our directory, built from operators’ and authorities’ published pages (source and check date on each card). Everything else comes from OpenStreetMap, edited by local volunteers. Coverage differs a lot between regions; missing details stay empty instead of being guessed. Always check access rules, conditions and opening times with the operator. Missing a provider or a price? <a href="mailto:torsten.sauter@icloud.com?subject=DipMapper%20activity%20suggestion">Tell us</a>.</p>';
 var res=document.getElementById('results');if(res&&res.parentNode)res.parentNode.insertBefore(panel,res);
 var legend=document.createElement('div');legend.className='dmActLegend';legend.innerHTML='<span><i class="d pl"></i>Places to go</span><span><i class="d pr"></i>Rentals, schools, clubs &amp; tours</span>';
 var mpPanel=document.getElementById('mapPanel');if(mpPanel)mpPanel.appendChild(legend);
 /* detail sheet: same look as the swim card drawer, separate element */
 var back=document.createElement('div');back.className='drawerBack';back.id='dmActBack';
 var sheet=document.createElement('aside');sheet.className='drawer dmActSheet';sheet.id='dmActSheet';sheet.setAttribute('aria-hidden','true');
 sheet.innerHTML='<div class="drawerHead"><div><div class="eyebrow" id="dmActMeta"></div><h2 id="dmActName"></h2></div><div><button type="button" id="dmActShare">Share</button><button type="button" class="primary" id="dmActClose">Close</button></div></div><div class="drawerBody" id="dmActBody"></div>';
 document.body.appendChild(back);document.body.appendChild(sheet);
 function closeSheet(){sheet.classList.remove('open');back.classList.remove('open');sheet.setAttribute('aria-hidden','true');A.sel=null;paint(true)}
 document.getElementById('dmActClose').addEventListener('click',function(e){e.preventDefault();closeSheet()});back.addEventListener('click',function(){if(Date.now()-(A.pinOpened||0)<900)return;closeSheet()});
 /* the click that follows the tap which opened a card (can arrive late on a busy phone) must not close it again */
 document.addEventListener('pointerdown',function(e){if(!(e.target.closest&&e.target.closest('.dmActPin')))A.eatClick=false},true);
 document.addEventListener('click',function(e){var eat=A.eatClick&&Date.now()-(A.pinOpened||0)<3000;if(A.eatClick)A.eatClick=false;if((eat||Date.now()-(A.pinOpened||0)<900)&&!sheet.contains(e.target)){e.preventDefault();e.stopPropagation()}},true);
 addEventListener('keydown',function(e){if(e.key==='Escape'&&sheet.classList.contains('open'))closeSheet()});
 document.getElementById('dmActShare').addEventListener('click',function(){var v=find(A.sel);if(!v)return;var u=location.origin+location.pathname+'?lat='+v.lat.toFixed(5)+'&lon='+v.lon.toFixed(5)+'&name='+encodeURIComponent(v.name)+'&act='+A.mode;
  try{if(navigator.share){navigator.share({title:v.name+' · DipMapper',url:u}).catch(function(){});return}}catch(e){}
  try{navigator.clipboard.writeText(u).then(function(){var b=document.getElementById('dmActShare');b.textContent='Link copied';setTimeout(function(){b.textContent='Share'},1600)})}catch(e){window.prompt('Copy link:',u)}});
 function find(id){for(var i=0;i<A.items.length;i++)if(A.items[i].id===id)return A.items[i];return null}
 /* ---------- mode switching ---------- */
 function setMode(k,user){if(!MODE[k])k='swim';var was=A.mode;A.mode=k;try{localStorage.setItem('dm_act',k)}catch(e){}
  var h=document.documentElement;h.classList.toggle('dmActOn',k!=='swim');h.setAttribute('data-act',k);
  if(k==='ice'&&iceBtn)iceBtn.hidden=false;bar.querySelectorAll('button').forEach(function(b){var on=b.dataset.a===k;b.classList.toggle('on',on);b.setAttribute('aria-checked',String(on))});
  panel.hidden=k==='swim';legend.innerHTML=k==='ice'?'<span><i class="d ib"></i>Official ice process</span><span><i class="d io"></i>Own risk / ask locally</span><span><i class="d pl"></i>Ice rinks</span>':'<span><i class="d pl"></i>Places to go</span><span><i class="d pr"></i>Rentals, schools, clubs &amp; tours</span><span><i class="d fm"></i>Famous</span>';if(k!=='swim'){panel.style.setProperty('--ac',MODE[k].col);legend.style.setProperty('--ac',MODE[k].col)}
  place();if(was!==k){if(was==='swim'&&state.mapCenter&&state.center)A.swimView={c:state.mapCenter.slice(),z:state.zoom,at:state.center.join(','),f:!!(state.dmFitCenter&&Math.abs(state.dmFitCenter[0]-state.mapCenter[0])<1e-4&&Math.abs(state.dmFitCenter[1]-state.mapCenter[1])<1e-4)};if(A.swimView&&(!state.center||A.swimView.at!==state.center.join(',')))A.swimView=null;var swF=null;if(k==='swim'&&A.swimView){state.mapCenter=A.swimView.c;state.zoom=A.swimView.z;if(A.swimView.f)swF=A.swimView.c.slice();A.swimView=null}else if(k==='swim'&&state.center){/* v23.7: no saved swim view (the visit started in an activity) — show the swim search area again */state.mapCenter=state.center.slice();try{state.zoom=zoomForRadius(Number((document.getElementById('radius')||{}).value||5),state.center[0])}catch(e){}}if(k==='swim')state.dmFitCenter=swF;/* a restored automatic fit is still not a move by the user */A.chip='all';A.items=[];A.as={};A.key='';A.fitKey='';A.sel=null;A.cd=null;A.condKey='';if(sheet.classList.contains('open'))closeSheet()}
  try{swimTempTags()}catch(e){}
  if(k==='swim'){try{state._ovSig=null;state._renderSig=null;render()}catch(e){try{drawMap()}catch(e2){}}}else{chips();list();check(true)}
  try{if(window.dmRefit)window.dmRefit()}catch(e){}
  if(user&&k!=='swim'&&innerWidth<=760){var p=document.getElementById('mapPanel');if(p&&p.getBoundingClientRect().top>innerHeight*0.9){/* keep the user where they are; the map head shows the mode */}}}
 /* ---------- search ---------- */
 function place(){var r=document.getElementById('results');if(r&&r.parentNode&&(panel.parentNode!==r.parentNode||panel.nextSibling!==r))r.parentNode.insertBefore(panel,r);var lg=document.getElementById('mapPanel');if(lg&&legend.parentNode!==lg)lg.appendChild(legend)}
 function check(force){place();if(A.mode==='swim')return;var c=state.center;var k=A.mode+'|'+(c?c[0].toFixed(4)+','+c[1].toFixed(4):'-')+'|'+radiusKm();if(!force&&k===A.key)return;A.key=k;run(k)}
 setInterval(function(){try{check(false)}catch(e){}},700);
 var _bs=window.backgroundScan;if(typeof _bs==='function'){window.backgroundScan=function(){try{check(false)}catch(e){}return _bs.apply(this,arguments)}}
 /* the curated swim packs label a city e.g. "Zürich swim culture" — activity texts use the plain place name */
 function placeLabel(){return String((typeof state!=='undefined'&&state.label)||'').replace(/\s+swim culture$/i,'')}
 function run(key){var c=state.center;A.err='';A.widened=0;A.label=placeLabel()||'';
  if(!c){A.items=[];chips();list();paint(true);return}
  var R=Math.max(15000,radiusKm()*1000);var ck=A.mode+'|'+c[0].toFixed(3)+','+c[1].toFixed(3)+'|'+R;
  if(A.cache[ck]&&Date.now()-A.cache[ck].t<1800000){A.searched=A.cache[ck].s||R/1000;apply(A.cache[ck].v,c,R,A.cache[ck].w||0);return}
  A.busy=true;A.searched=R/1000;A.items=dirItems(A.mode,c,R/1000+0.5).sort(function(a,b){return rank(a)-rank(b)});rescore();chips();list();paint(true);conditionsHead();
  fetchMode(A.mode,R,c).then(function(v){if(A.key!==key)return;
   if(v===null){A.busy=false;var dl=dirItems(A.mode,c,R/1000+0.5);if(dl.length){A.err='partial';apply([],c,R,0);return}A.err='busy';A.items=[];chips();list();paint(true);return}
   if(v.length+dirItems(A.mode,c,R/1000+0.5).length<3&&R<25000){var R2=25000;A.searched=25;return fetchMode(A.mode,R2,c).then(function(v2){if(A.key!==key)return;var better=v2&&(v2.length+dirItems(A.mode,c,25.5).length)>(v.length+dirItems(A.mode,c,R/1000+0.5).length);A.cache[ck]={t:Date.now(),v:better?v2:v,w:better?R2:0,s:25};apply(better?v2:v,c,R,better?R2:0)})}
   A.cache[ck]={t:Date.now(),v:v,w:0,s:R/1000};apply(v,c,R,0)})}
 function fetchMode(mode,R,c){/* v23.7: Specials are only the researched one-offs — no keyword matches from the open map */if(mode==='special')return Promise.resolve([]);var q=query(mode,R,c[0],c[1]);return overpassFast(q,26000).then(function(d){var els=(d&&d.elements)||[];if(!els.length&&(d&&d._tried)&&(d._fails||0)>=(d._tried||0))return null;
   var v=dedupe(els.map(function(e){return classify(e,mode)}).filter(Boolean));if(mode==='special')v=v.filter(function(x){return specialsOf(x).length});v.forEach(function(x){x.dist=D(c[0],c[1],x.lat,x.lon)});return v}).catch(function(){return null})}
 function apply(v,c,R,widened){A.busy=false;A.when=Date.now();A.widened=widened;var lim=(widened||R)/1000+0.5;
  var osm=v.filter(function(x){x.dist=D(c[0],c[1],x.lat,x.lon);return x.dist<=lim});A.items=mergeDir(osm,dirItems(A.mode,c,lim)).sort(function(a,b){return rank(a)-rank(b)}).slice(0,150);if(A.mode==='special')geoQueue(A.items.filter(function(x){return x.ev==='sp'&&x.geo==='approx'}));
  if(A.chip!=='all'&&!A.items.some(function(x){return matchesChip(x,A.chip)}))A.chip='all';
  rescore();chips();list();paint(true);try{if(window.dmRefit)window.dmRefit()}catch(e){}
  if(A.items.length&&A.fitKey!==A.key){A.fitKey=A.key;setTimeout(function(){if(A.mode!=='swim'){fitAct(12);paint(true)}},90)}
  addFamous(c,A.key)}
 /* ---------- chips, list ---------- */
 function chips(){var box=document.getElementById('dmActChips');if(!box)return;if(A.mode==='swim'){box.innerHTML='';return}
  if(A.busy&&!A.items.length){box.innerHTML='<span class="dmChip sk"></span><span class="dmChip sk"></span><span class="dmChip sk"></span><span class="dmChip sk"></span><span class="dmChip sk"></span>';return}
  var keys=CHIPS[A.mode]||[];var n=function(c){return A.items.filter(function(v){return matchesChip(v,c)}).length};
  var html='<button type="button" class="dmChip'+(A.chip==='all'?' on':'')+'" data-c="all"><span>'+MODE[A.mode].ic+'</span>All <b>'+A.items.length+'</b></button>';
  keys.forEach(function(c){var cnt=n(c);if(!cnt&&A.chip!==c)return;var lb=ACT[c]?[ACT[c][1],ACT[c][0]]:CHIPLBL[c];html+='<button type="button" class="dmChip'+(A.chip===c?' on':'')+'" data-c="'+c+'"><span>'+lb[0]+'</span>'+E(lb[1])+' <b>'+cnt+'</b></button>'});
  box.innerHTML=html;
  /* v23.5: same pattern as the swim filters — two rows, then "Show all N filters" (the active filter always stays visible) */
  var mo=document.getElementById('dmActChipsMore');if(!mo){mo=document.createElement('button');mo.type='button';mo.id='dmActChipsMore';box.parentNode.insertBefore(mo,box.nextSibling);mo.onclick=function(){A.chipsOpen=!A.chipsOpen;chips()}}
  box.classList.toggle('dmCollapsed',!A.chipsOpen);var all=box.querySelectorAll('.dmChip').length;
  requestAnimationFrame(function(){var over=box.scrollHeight>box.clientHeight+4;var on=box.querySelector('.dmChip.on');if(!A.chipsOpen&&on&&on.getBoundingClientRect().bottom-box.getBoundingClientRect().top>box.clientHeight+2){A.chipsOpen=true;box.classList.remove('dmCollapsed');over=false}
   mo.hidden=!(over||A.chipsOpen)||all<5;mo.textContent=A.chipsOpen?'Show fewer filters':'Show all '+all+' filters';mo.setAttribute('aria-expanded',A.chipsOpen?'true':'false')})}
 document.getElementById('dmActChips').addEventListener('click',function(e){var b=e.target.closest('button[data-c]');if(!b)return;A.chip=b.dataset.c;chips();list();paint(true)});
 function actLine(v){var ks=Object.keys(v.acts).filter(function(k){return ACT[k][2].split(' ').indexOf(A.mode)>=0});if(!ks.length)ks=Object.keys(v.acts);return ks.slice(0,3).map(function(k){return ACT[k][0]}).join(', ')}
 var NOUN={sup:'SUP',kayak:'kayak',row:'rowing boat',pedal:'pedal boat',motorboat:'motorboat',sail:'sailboat',windsurf:'windsurf',kite:'kite',wing:'wingfoil',surf:'surfboard',dive:'dive gear',snorkel:'snorkel gear',wake:'wakeboard',raft:'raft'};
 function cap(x){return x.charAt(0).toUpperCase()+x.slice(1)}
 function modeActs(v){if(A.mode==='special')return Object.keys(v.acts).filter(function(k){return ACT[k]});return Object.keys(v.acts).filter(function(k){return ACT[k][2].split(' ').indexOf(A.mode)>=0})}
 function spIc(v){for(var si=0;si<SPX.length;si++)if(SPX[si][0]===v.spcat)return SPX[si][2];return 'star'}
 function typeLabel(v){if(v.ev==='sp'&&typeof SPX!=='undefined'){for(var si=0;si<SPX.length;si++)if(SPX[si][0]===v.spcat)return SPX[si][1]}var t=TYPE[v.type][0];var ma=modeActs(v);
  if(v.famous)return v.wpdesc?cap(String(v.wpdesc)).slice(0,42):'Well-known place';if(v.type==='icelake')return 'Natural ice · lake';if(v.type==='rink')return v.indoor?'Indoor ice rink':'Ice rink';
  if(v.type==='centre'){if(v.acts.dive)return 'Dive centre';var c0=ma.filter(function(k){return k!=='boatrent'})[0];return c0?cap(ACT[c0][0].replace(/ & .*/,'').replace(/s$/,''))+' centre':'Water sports centre'}
  if(v.type==='spot'){if(v.acts.dive&&A.mode==='dive')return 'Dive site';var s0=ma[0];return s0?cap(ACT[s0][0].replace(/ & .*/,''))+' spot':'Spot'}if(v.type==='centre'&&v.acts.dive)return 'Dive centre';if(v.type==='school'){var SCH={dive:'dive',sail:'sailing',kite:'kite',windsurf:'windsurf',wing:'wingfoil',surf:'surf',sup:'SUP',kayak:'canoe',row:'rowing',wake:'wakeboard',motorboat:'motorboat'};var sk=[];ma.concat(Object.keys(v.acts)).forEach(function(k){if(SCH[k]&&sk.indexOf(SCH[k])<0)sk.push(SCH[k])});if(sk.length)return cap(sk.slice(0,2).join(' & '))+' school'}
  if(v.type==='club'){if(v.acts.sail)return 'Sailing club';if(v.acts.row)return 'Rowing club';if(v.acts.kayak)return 'Canoe club';if(v.acts.dive)return 'Dive club';if(v.acts.windsurf||v.acts.kite)return 'Wind sports club'}
  if(v.type==='rental'){var ns=ma.filter(function(k){return NOUN[k]}).slice(0,2).map(function(k){return NOUN[k]});return ns.length?cap(ns.join(' & '))+' rental':'Boat rental'}return t}
 var GQ={paddle:'SUP kayak rental',sup:'SUP rental',kayak:'kayak rental',row:'rowing boat rental',pedal:'pedal boat rental',boatrent:'boat rental','t:launch':'kayak launch','p:rental':'SUP kayak rental','p:school':'SUP school','p:club':'canoe club',
  dive:'dive center',snorkel:'snorkeling tour',freedive:'freediving school',wreck:'wreck diving','p:centre':'dive center',
  sail:'sailing school',windsurf:'windsurf school',kite:'kitesurf school',wing:'wingfoil school',surf:'surf school','t:marina':'marina','t:ramp':'boat ramp',
  boat:'boat tour',tour:'boat tour',motorboat:'motorboat rental',charter:'boat charter',fishing:'fishing trip',wake:'wakeboard','t:pier':'ferry',
  raft:'rafting',canyon:'canyoning',whitewater:'white water rafting','p:tours':'boat tour'};
 function gq(){var c=A.chip!=='all'&&GQ[A.chip]?A.chip:A.mode;if(A.chip==='p:school'||A.chip==='p:club'||A.chip==='p:rental'){var mq={paddle:{'p:school':'SUP school','p:club':'canoe club','p:rental':'SUP kayak rental'},dive:{'p:school':'dive school','p:club':'dive club','p:rental':'dive center'},sail:{'p:school':'sailing school','p:club':'sailing club','p:rental':'sailboat rental'},boat:{'p:rental':'boat rental','p:school':'boat license school','p:club':'yacht club'},raft:{'p:school':'rafting','p:club':'canoe club','p:rental':'rafting'}}[A.mode];if(mq&&mq[A.chip])return mq[A.chip]}return GQ[c]||GQ[A.mode]||'water sports'}
 function moreHtml(){var c=state.center;if(!c)return '';var q=gq();var u='https://www.google.com/maps/search/'+encodeURIComponent(q)+'/@'+c[0].toFixed(5)+','+c[1].toFixed(5)+',12z';
  return '<div class="dmActMore"><div><b>Looking for more?</b> Many businesses never add themselves to open map data. Google Maps lists them with reviews, opening hours, phone numbers and often prices.</div><a class="dmAq" href="'+E(u)+'" target="_blank" rel="noopener">Search “'+E(q)+'” near '+E(placeLabel()||'here')+' on Google Maps ↗</a></div>'}
 function rulesHtml(){var c=state.center;if(!c)return '';var rs=(window.DM_ACT_RULES||[]).filter(function(r){return r.modes.split(' ').indexOf(A.mode)>=0&&D(c[0],c[1],r.lat,r.lon)<=r.r});if(!rs.length)return '';return '<details class="dmActRule"'+(innerWidth>760?' open':'')+'><summary><b>Local rules for wind sports</b> · '+rs.length+' apply here</summary>'+rs.map(function(r){return '<p>'+E(r.t)+' <a href="'+E(r.src[1])+'" target="_blank" rel="noopener">Source: '+E(r.src[0])+'</a></p>'}).join('')+'</details>'}
 document.getElementById('dmActList').addEventListener('click',function(e){if(e.target.closest('a'))return;var b=e.target.closest('[data-aid]');if(!b)return;e.preventDefault();openSheet(b.getAttribute('data-aid'))});
 /* ---------- map pins: own layer on the shared map ---------- */
 var pinSig='';
 function paint(force){var mp=document.getElementById('map');if(!mp)return;var layer=mp.querySelector('.dmActPins');
  if(A.mode==='swim'){if(layer)layer.remove();pinSig='';try{paintLayers(true)}catch(e){}return}
  if(!layer){layer=document.createElement('div');layer.className='dmActPins';mp.appendChild(layer);force=true}
  var r=mp.getBoundingClientRect();if(!r.width)return;var c=state.mapCenter||state.center;if(!c)return;var z=state.zoom,cp=project(c[0],c[1],z),left=cp[0]-r.width/2,top=cp[1]-r.height/2;
  var vis=visible();try{var ms=document.getElementById('mapSub');if(ms&&state.center){var tx=(placeLabel()||'')+' · '+(A.busy?'searching '+MODE[A.mode].long.toLowerCase()+'…':vis.length+' '+MODE[A.mode].long.toLowerCase()+' result'+(vis.length===1?'':'s'));if(ms.textContent!==tx)ms.textContent=tx}}catch(e){}
  var sig=[c[0],c[1],z,Math.round(r.width),Math.round(r.height),A.sel,A.mode,A.chip,vis.length,vis.map(function(v){return v.id}).join(',')].join('|');if(!force&&sig===pinSig&&layer.isConnected)return;pinSig=sig;
  var h='';vis.forEach(function(v,i){var p=project(v.lat,v.lon,z),x=p[0]-left,y=p[1]-top;if(x<-40||x>r.width+40||y<-40||y>r.height+40)return;
   var pk=pinKey(v);h+='<button type="button" class="marker dmActPin '+v.kind+(v.famous?' fame':'')+(v.ice?' icep ice-'+v.ice.k:'')+(A.sel===v.id?' dmSel':'')+'" data-aid="'+E(v.id)+'" data-rank="'+(i+1)+'" style="left:'+x+'px;top:'+y+'px;--pc:'+PINC[pk]+'" title="'+E(v.name)+'" aria-label="'+E(v.name)+'"><span class="dmPinIc">'+I(pk==='special'?spIc(v):(ACTI[pk]||TYPEI[pk]||'pin'))+'</span></button>'});
  /* keyed update: if the same pins are shown, only move them — never replace a pin under the user's finger or mouse */
  /* v23.5: whenever the same pins are on screen (forced or not), update them in place — position, rank, colour, selection —
     so a pin under the mouse is never destroyed and re-created (that re-creation made hovered pins blink) */
  var key=vis.map(function(v){return v.id}).join(',');if(layer._key===key){var tmp=document.createElement('div');tmp.innerHTML=h;var nw={};tmp.querySelectorAll('.dmActPin').forEach(function(b){nw[b.dataset.aid]=b});var same=true,olds=layer.querySelectorAll('.dmActPin');olds.forEach(function(b){var n=nw[b.dataset.aid];if(!n){same=false;return}if(b.style.left!==n.style.left)b.style.left=n.style.left;if(b.style.top!==n.style.top)b.style.top=n.style.top;if(b.className!==n.className)b.className=n.className;if(b.getAttribute('data-rank')!==n.getAttribute('data-rank'))b.setAttribute('data-rank',n.getAttribute('data-rank'));var pc=n.style.getPropertyValue('--pc');if(b.style.getPropertyValue('--pc')!==pc)b.style.setProperty('--pc',pc);delete nw[b.dataset.aid]});if(same&&!Object.keys(nw).length){ringAct();paintLayers(!!force);legendAct();return}}
  if(A.pinDown&&Date.now()-A.pinDown.t<700){setTimeout(function(){paint(true)},720);return}
  layer._key=key;layer.innerHTML=h;ringAct();paintLayers(force);legendAct()}
 function ringAct(){if(A.mode==='swim')return;var mp=document.getElementById('map');var ring=mp&&mp.querySelector('.radiusRing'),lab=mp&&mp.querySelector('.radiusLabel');if(!ring)return;var sk=radiusKm(),ak=A.widened?A.widened/1000:(A.searched||Math.max(15,sk));if(ring.dataset.dmAct===String(ak))return;var f=ak/sk;var w=parseFloat(ring.style.width)||0,y=parseFloat(ring.style.top)||0;if(!w)return;ring.style.width=ring.style.height=(w*f)+'px';ring.dataset.dmAct=String(ak);if(lab){lab.style.top=Math.max(12,y-w*f/2)+'px';lab.textContent=ak+' km '+MODE[A.mode].t.toLowerCase()+' search'}}
 (function(){var mp=document.getElementById('map');
  mp.addEventListener('pointerdown',function(e){var b=e.target.closest&&e.target.closest('.dmActPin');A.pinDown=b?{aid:b.getAttribute('data-aid'),x:e.clientX,y:e.clientY,t:Date.now()}:null},true);
  document.addEventListener('pointerup',function(e){var d=A.pinDown;if(!d)return;A.pinDown=null;if(Date.now()-d.t>1200||Math.abs(e.clientX-d.x)>9||Math.abs(e.clientY-d.y)>9)return;A.pinOpened=Date.now();A.eatClick=true;openSheet(d.aid)},true)})();
 document.getElementById('map').addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.dmActPin');if(!b)return;if(Date.now()-(A.pinOpened||0)<800){e.preventDefault();e.stopPropagation();return}e.preventDefault();e.stopPropagation();openSheet(b.getAttribute('data-aid'))});
 var _draw=window.drawMap;if(typeof _draw==='function'){window.drawMap=function(){var r=_draw.apply(this,arguments);try{paint(false)}catch(e){}try{swimTempTags();if(A.mode==='swim')paintLayers(false);loadZones()}catch(e){}return r}}
 var fitBtn=document.getElementById('fit');if(fitBtn)fitBtn.addEventListener('click',function(){A.fitClick=Date.now()},true);
 function fitAct(n){try{var L=visible().slice().sort(function(a,b){return a.dist-b.dist}).slice(0,n||40);if(!L.length)return false;
   /* v23.6: one far-away place must not shrink everything else into a corner — leave out outliers beyond 2.5× the median distance */
   if(L.length>=4){var med=L[Math.floor(L.length/2)].dist,lim=Math.max(2,med*2.5);var L2=L.filter(function(v){return v.dist<=lim});if(L2.length>=Math.ceil(L.length*0.6))L=L2}var a=90,b=-90,c=180,d=-180;L.concat(state.center?[{lat:state.center[0],lon:state.center[1]}]:[]).forEach(function(v){a=Math.min(a,v.lat);b=Math.max(b,v.lat);c=Math.min(c,v.lon);d=Math.max(d,v.lon)});
   state.mapCenter=[(a+b)/2,(c+d)/2];var r=document.getElementById('map').getBoundingClientRect();var zW=Math.log2((Math.max(320,r.width)*0.82)*360/(Math.max(0.004,d-c)*256)),zH=Math.log2((Math.max(320,r.height)*0.82)*360/(Math.max(0.004,b-a)*256*1.3));state.zoom=Math.max(3,Math.min(14,Math.floor(Math.min(zW,zH))));state.dmFitCenter=state.mapCenter.slice();drawMap();return true}catch(e){return false}}
 var _fit=window.fitToSpots;if(typeof _fit==='function'){window.fitToSpots=function(){if(A.mode==='swim')return _fit.apply(this,arguments);if(Date.now()-(A.fitClick||0)<800){if(!fitAct())return _fit.apply(this,arguments)}/* automatic fits from the swim search must not move the map in activity mode */}}
 /*@@MODULES@@*/
 /* v23.7: specials with an approximate position are placed exactly in the background, one lookup every 1.2 s (Nominatim policy), and remembered */
 var GEOQ=[],GEOT=null;function geoQueue(L){L.forEach(function(v){if(GEOQ.indexOf(v)<0)GEOQ.push(v)});if(GEOT)return;var step=function(){var v=GEOQ.shift();if(!v){GEOT=null;return}if(v.geo==='approx')refineGeo(v);GEOT=setTimeout(step,1200)};GEOT=setTimeout(step,800)}
 function refineGeo(v){if(!v.addr||typeof fetchJsonTimeout!=='function')return;var q='https://nominatim.openstreetmap.org/search?format=json&limit=1&q='+encodeURIComponent(v.addr);
  fetchJsonTimeout(q,{},8000).then(function(r){var h=r&&r[0];if(!h)return;var la=+h.lat,lo=+h.lon;if(!isFinite(la)||D(la,lo,v.lat,v.lon)>(v.ev==='sp'?25:5))return;GEO[v.dirId]=[la,lo];try{localStorage.setItem('dm_geo_v1',JSON.stringify(GEO))}catch(e){}
   v.lat=la;v.lon=lo;v.geo='refined';if(state.center)v.dist=D(state.center[0],state.center[1],la,lo);paint(true)}).catch(function(){})}
 /* ---------- start: URL ?act=… or the last chosen mode ---------- */
 var start='swim';try{var u=new URLSearchParams(location.search).get('act');start=u&&MODE[u]?u:(localStorage.getItem('dm_act')||'swim')}catch(e){}
 setMode(MODE[start]?start:'swim',false);
 window.dmSetActivity=function(k){setMode(k,true)};
})();
