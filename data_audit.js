// DipMapper data audit: loads every data file exactly as the app does and checks completeness, formats, sources and duplicates.
const fs=require('fs'),path=require('path'),vm=require('vm');const V=process.argv[2]||path.join(__dirname,'..');
const ctx={window:{}};vm.createContext(ctx);for(const f of ['dir.js','dir_patch.js','dir_explain.js','req.js','ice_data.js','specials.js','emergency.js','dive_data.js'])vm.runInContext(fs.readFileSync(path.join(V,f),'utf8'),ctx,{filename:f});
const W=ctx.window;const out={files:{},issues:[],warnings:[],stats:{}};const I=(s)=>out.issues.push(s),Wn=(s)=>out.warnings.push(s);
const D=(a,b,c,d)=>{const t=Math.PI/180;return Math.hypot((d-b)*t*Math.cos((a+c)/2*t),(c-a)*t)*6371};
const url=u=>/^https?:\/\/[^\s/]+\.[^\s]+$/.test(u),tel=p=>/^\+?[\d\s\-\/().]{6,22}$/.test(p),mail=m=>/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(m);
const ACTS=['sup','kayak','row','pedal','boatrent','motorboat','dive','snorkel','freedive','wreck','sail','windsurf','kite','wing','surf','wake','tour','charter','fishing','raft','canyon','whitewater','skate','swimx','sauna','thermal','glow','fuel'];
const TYPES=['launch','ramp','marina','pier','wreck','spot','rental','rink','icelake','school','club','tours','centre','shop','fuel'];
// directory
const dir=W.DM_ACT_DIR||[],patch=W.DM_ACT_PATCH||{},ex=W.DM_ACT_EXPLAIN||{};out.files.directory=dir.length;const ids=new Set();
dir.forEach(d=>{const id=d.id;if(ids.has(id))I('directory: duplicate id '+id);ids.add(id);
 if(!d.n)I(id+': no name');if(!(d.lat>-90&&d.lat<90&&d.lon>-180&&d.lon<180))I(id+': bad coordinates');
 if(!TYPES.includes(d.type))I(id+': unknown type '+d.type);(d.acts||[]).forEach(a=>{if(!ACTS.includes(a))I(id+': unknown activity '+a)});if(!(d.acts||[]).length)I(id+': no activity');
 const p=patch[id]||{};const web=p.new_web||d.web,ph=p.new_phone||d.phone,em=p.new_email||d.email;
 if(web&&!url(web))I(id+': website not a URL: '+web);if(ph&&!tel(ph))I(id+': phone format: '+ph);if(em&&!mail(em))I(id+': e-mail format: '+em);
 if(!d.src||!d.src[1]||!url(d.src[1]))I(id+': no source URL');if(!d.checked)Wn(id+': no check date');
 (d.prices||[]).forEach(pr=>{if(!Array.isArray(pr)||pr.length<2||!pr[1])I(id+': malformed price '+JSON.stringify(pr));else if(!/(CHF|EUR|€|\$|£|free|gratis|kostenlos|incl)/i.test(pr[1]))Wn(id+': price without currency: '+pr[1])});
 if(!web&&!ph&&!em&&d.type!=='spot')Wn(id+': no contact at all');
 if(!ex[id]&&!d.about)Wn(id+': no hand-written explainer');if(d.status)Wn(id+': status flag — '+d.status.slice(0,80))});
// near-duplicates by name & position
for(let i=0;i<dir.length;i++)for(let j=i+1;j<dir.length;j++){const a=dir[i],b=dir[j];if(a.n&&b.n&&a.n.toLowerCase()===b.n.toLowerCase()&&D(a.lat,a.lon,b.lat,b.lon)<0.3)I('directory: same place twice: '+a.id+' / '+b.id)}
Object.keys(patch).forEach(k=>{if(!ids.has(k))I('patch for unknown id '+k)});Object.keys(ex).forEach(k=>{if(!ids.has(k))I('explainer for unknown id '+k);const e=ex[k];if(!e.xsrc||!e.xsrc.length)I(k+': explainer without sources');(e.xsrc||[]).forEach(u=>{if(!url(u))I(k+': explainer source not a URL '+u)})});
// specials
const sp=W.DM_SPECIALS||[];out.files.specials=sp.length;const cats={};const sids=new Set();
sp.forEach(s=>{if(sids.has(s.id))I('specials: duplicate id '+s.id);sids.add(s.id);cats[s.cat]=(cats[s.cat]||0)+1;
 if(!s.src||!url(s.src[1]))I(s.id+': no source URL');if(!s.about||s.about.length<120)Wn(s.id+': short description');if(!(s.lat>-90&&s.lat<90))I(s.id+': bad coordinates');
 if(s.web&&!url(s.web))I(s.id+': website not a URL');if(s.wiki&&!/wikipedia\.org\/wiki\//.test(s.wiki))I(s.id+': wiki link format');(s.more||[]).forEach(m=>{const u=Array.isArray(m)?m[1]:m;if(!url(u))I(s.id+': extra source not a URL')});
 for(const t of sp)if(t!==s&&t.n.toLowerCase()===s.n.toLowerCase())I('specials: same name twice '+s.n)});
out.stats.specialsByCategory=cats;out.stats.specialsApprox=sp.filter(s=>s.geo==='approx').length;
// emergency
const so=W.DM_SOS||{};const cc=Object.keys(so).filter(k=>k.length===2);out.files.emergencyCountries=cc.length;
cc.forEach(k=>{const e=so[k];if(!e.general)I(k+': no general emergency number');['general','police','fire','ambulance','sea','air','poison'].forEach(f=>{if(e[f]&&!/^(\+?[\d\s\-]{2,20}|regional: .+)$/.test(e[f]))I(k+': '+f+' format '+e[f])});if(!e.src||!e.src.length)I(k+': no source')});
// rules
const rq=W.DM_ACT_REQ||{};let rules=0;Object.entries(rq.countries||{}).forEach(([c,acts])=>Object.entries(acts).forEach(([a,L])=>(L||[]).forEach(r=>{rules++;if(!r.src||!r.src.length)I('rule '+c+'/'+a+' without source');})));out.files.rules=rules;
// ice lakes
const il=W.DM_ICE_LAKES||[];out.files.iceLakes=il.length;il.forEach(l=>{if(!l.auth)I('ice lake '+l.n+': no authority');if(l.url&&!url(l.url))I('ice lake '+l.n+': url')});
// dive data
const dv=W.DM_DIVE||{};out.files.diveSites=Object.keys(dv).length;Object.keys(dv).forEach(k=>{if(!ids.has(k))I('dive data for unknown id '+k);if(!ex[k])I('dive data '+k+' has no researched explainer as its source')});
console.log(JSON.stringify(out,null,1));
