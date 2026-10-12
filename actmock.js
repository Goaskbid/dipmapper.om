// Realistic mocks for the v23.2 activity layer (forecast, climate, marine, river, water quality, fish, Wikipedia, Commons, reverse geocoding, no-go zones).
// opts.winter=true simulates a cold winter (frost sum, ice model). All times are produced in Europe/Zurich like the browser in the tests.
const TZ='Europe/Zurich';
// DM_SHIFT_MS (set by a test) moves the mocked clock, so time-of-day checks do not depend on when the suite runs.
const NOWD=()=>new Date(Date.now()+(+process.env.DM_SHIFT_MS||0));
function local(d){const f=new Intl.DateTimeFormat('sv-SE',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(d).replace(' ','T');return f}
function forecast(winter){const now=NOWD();const h0=new Date(Math.floor(now.getTime()/3600000)*3600000-48*3600000);const T=[],ws=[],gs=[],wd=[],tp=[],pr=[],pp=[],wc=[],uv=[],vis=[],day=[];
 for(let i=0;i<120;i++){const t=new Date(h0.getTime()+i*3600000);const lt=local(t);const hr=+lt.slice(11,13);T.push(lt.slice(0,13)+':00');const w=8+6*Math.sin(i/5);ws.push(+w.toFixed(1));gs.push(+(w*1.7+3).toFixed(1));wd.push(225);tp.push(winter?-4+3*Math.sin((hr-9)/24*6.28):12+5*Math.sin((hr-9)/24*6.28));pr.push(0);pp.push(i%17===0?40:10);wc.push(2);uv.push(hr>=10&&hr<=15?3:0);vis.push(30000);day.push(hr>=7&&hr<19?1:0)}
 const cur=local(now);const ci=T.indexOf(cur.slice(0,13)+':00');const D=[0,1,2,3,4].map(k=>local(new Date(now.getTime()+(k-2)*864e5)).slice(0,10));
 return {current:{time:cur,temperature_2m:winter?-3:17,apparent_temperature:winter?-7:16,weather_code:2,wind_speed_10m:ws[ci]||10,wind_gusts_10m:gs[ci]||18,wind_direction_10m:225,precipitation:0,is_day:day[ci],cloud_cover:30},
  hourly:{time:T,temperature_2m:tp,wind_speed_10m:ws,wind_gusts_10m:gs,wind_direction_10m:wd,precipitation:pr,precipitation_probability:pp,weather_code:wc,uv_index:uv,visibility:vis,is_day:day},
  daily:{time:D,sunrise:D.map(d=>d+'T07:31'),sunset:D.map(d=>d+'T18:47'),uv_index_max:D.map(()=>3.5)}}}
function climate(winter){const now=NOWD();const t=[],m=[],p=[],s=[];for(let k=-92;k<=0;k++){const d=new Date(now.getTime()+k*864e5);t.push(local(d).slice(0,10));m.push(winter?(k>-40?-6:2):14+(k/92)*-3);p.push(k>-3?6:1);s.push(winter&&k>-5?2:0)}
 if(winter){/* make the dates look like January so the winter season logic applies */for(let i=0;i<t.length;i++){const d=new Date(Date.UTC(2027,0,15)+(i-t.length+1)*864e5);t[i]=d.toISOString().slice(0,10)}}
 return {daily:{time:t,temperature_2m_mean:m,precipitation_sum:p,snowfall_sum:s}}}
const WIKI={query:{pages:{'1':{pageid:1,title:'Lake Zurich',description:'lake in Switzerland',coordinates:[{lat:47.2869,lon:8.6383}],fullurl:'https://en.wikipedia.org/wiki/Lake_Zurich',extract:'Lake Zurich is a lake in Switzerland, extending southeast of the city of Zürich.',thumbnail:{source:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Lake_Zurich_view.jpg/1000px-Lake_Zurich_view.jpg',width:1000,height:667}},
 '2':{pageid:2,title:'Zürich Hauptbahnhof',description:'railway station in Switzerland',coordinates:[{lat:47.378,lon:8.54}],fullurl:'https://en.wikipedia.org/wiki/Zurich_HB',extract:'Station'}}}};
function commons(q){const n=(q.match(/ggscoord=([\d.]+)/)||[])[1]||'x';return {query:{pages:{'5':{title:'File:SUP on Lake Zurich '+n+'.jpg',imageinfo:[{url:'https://upload.wikimedia.org/wikipedia/commons/a/ab/SUP_on_Lake_Zurich_'+n+'.jpg',thumburl:'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/SUP_on_Lake_Zurich_'+n+'.jpg/640px-SUP_on_Lake_Zurich_'+n+'.jpg',mime:'image/jpeg',width:1600,height:1000,extmetadata:{DateTimeOriginal:{value:'2021-07-01'}}}]}}}}}
const ZONES={elements:[{type:'way',id:901,tags:{'natural':'water','boat':'no',name:'Schutzgebiet Test'},geometry:[{lat:47.3500,lon:8.5440},{lat:47.3520,lon:8.5500},{lat:47.3480,lon:8.5520},{lat:47.3465,lon:8.5455}]},
 {type:'way',id:902,tags:{'seamark:type':'restricted_area','seamark:restricted_area:restriction':'no_anchoring'},geometry:[{lat:47.3600,lon:8.5390},{lat:47.3612,lon:8.5420},{lat:47.3598,lon:8.5432}]},
 {type:'node',id:903,lat:47.3667,lon:8.5410,tags:{amenity:'ferry_terminal',name:'Zürich Bürkliplatz (See)'}}]};
const HELPM={elements:[{type:'node',id:801,lat:47.3612,lon:8.5395,tags:{amenity:'police',name:'Seepolizei Zürich (Stadtpolizei)',phone:'+41 44 411 71 17'}},{type:'way',id:802,center:{lat:47.3770,lon:8.5520},tags:{amenity:'hospital',name:'Universitätsspital Zürich',emergency:'yes',phone:'+41 44 255 11 11'}},{type:'node',id:803,lat:47.3600,lon:8.5300,tags:{amenity:'fire_station',name:'Feuerwache Süd'}},{type:'node',id:804,lat:47.3560,lon:8.5370,tags:{emergency:'lifeguard',name:'SLRG Rettungsposten Mythenquai'}},{type:'node',id:805,lat:47.3557,lon:8.5366,tags:{emergency:'defibrillator','defibrillator:location':'At the bath entrance'}},{type:'node',id:806,lat:47.3554,lon:8.5364,tags:{emergency:'life_ring'}},{type:'node',id:807,lat:47.3570,lon:8.5320,tags:{amenity:'pharmacy',name:'Apotheke Enge',opening_hours:'Mo-Fr 08:00-19:00'}}]};
module.exports=function handle(u,J,opts){opts=opts||{};
 if(/interpreter|overpass/.test(u)){const q=decodeURIComponent((u.split('data=')[1]||'').replace(/\+/g,' '));if(/restricted_area/.test(q)){J(ZONES);return true}if(/fire_station/.test(q)){J(HELPM);return true}if(/bus_stop/.test(q)){const m=q.match(/around:650,(-?[\d.]+),(-?[\d.]+)/);const la=+m[1],lo=+m[2];J({elements:[{type:'node',id:1,lat:la+0.0022,lon:lo+0.001,tags:{railway:'tram_stop',name:'Brunau/Mythenquai'}},{type:'node',id:2,lat:la+0.0011,lon:lo-0.0008,tags:{amenity:'parking',fee:'yes'}},{type:'node',id:3,lat:la+0.0004,lon:lo+0.0003,tags:{amenity:'toilets'}},{type:'node',id:4,lat:la+0.0009,lon:lo+0.0012,tags:{amenity:'cafe',name:'Café am See',cuisine:'coffee_shop'}},{type:'node',id:5,lat:la+0.0003,lon:lo-0.0002,tags:{amenity:'drinking_water'}}]});return true}return false}
 if(u.includes('api.open-meteo.com')&&u.includes('past_days=92')){J(climate(opts.winter));return true}
 if(u.includes('api.open-meteo.com')&&u.includes('wind_gusts')){J(forecast(opts.winter));return true}
 if(u.includes('marine-api')){J({current:{wave_height:null}});return true}
 if(u.includes('flood-api')){J({daily:{time:[],river_discharge:[]}});return true}
 if(u.includes('discomap.eea')){J({features:[{attributes:{bathingWaterName:'Strandbad Mythenquai',qualityStatus:'Excellent',latitude:47.3478,longitude:8.5355,bwProfileLink:'https://example.org/profile'}}]});return true}
 if(u.includes('api.gbif.org/v1/occurrence')){J({count:5200,facets:[{field:'SPECIES_KEY',counts:[{name:'2382763',count:812},{name:'2346633',count:640}]}]});return true}
 if(u.includes('api.gbif.org/v1/species/2382763/vernacular')){J({results:[{vernacularName:'European perch',language:'eng'}]});return true}
 if(u.includes('api.gbif.org/v1/species/2346633/vernacular')){J({results:[{vernacularName:'Northern pike',language:'eng'}]});return true}
 if(u.includes('api.gbif.org/v1/species/2382763')){J({canonicalName:'Perca fluviatilis'});return true}
 if(u.includes('api.gbif.org/v1/species/2346633')){J({canonicalName:'Esox lucius'});return true}
 if(u.includes('wikipedia.org/w/api.php')){J(WIKI);return true}
 if(u.includes('commons.wikimedia.org/w/api.php')){if(u.includes('geosearch'))J(commons(u));else J({query:{pages:{}}});return true}
 if(u.includes('nominatim.openstreetmap.org/reverse')){J(u.includes('zoom=10')?{name:'Zürich',address:{city:'Zürich',state:'Canton of Zurich',country:'Switzerland',country_code:'ch'},extratags:{wikidata:'Q72'}}:{address:{country_code:'ch'}});return true}
 if(u.includes('wikidata.org/w/api.php')){J({claims:{P94:[{mainsnak:{datavalue:{value:'Wappen Zürich matt.svg'}}}]}});return true}
 return false}
