import sys
import os
H=os.path.dirname(os.path.abspath(__file__))+'/'
s=open(H+'base_v22_22.html').read()
import base64 as _b64
def aboutHtml():
    # v23.8.1: the photos travel inside index.html, but at the very end of the page (aboutImgScript), so the start screen
    # arrives as early as in 23.6; the section itself only carries data-dmimg placeholders with fixed width/height (no layout jump)
    h=open(V+'about/about_section.html').read().strip()
    for n in ['about-founder','about-pool','about-water']:
        assert h.count('src="'+n+'.webp"')==1,n
        h=h.replace('src="'+n+'.webp"','data-dmimg="'+n+'"')
    return h
def aboutImgScript():
    d={n:'data:image/webp;base64,'+_b64.b64encode(open(V+'about/'+n+'.webp','rb').read()).decode() for n in ['about-founder','about-pool','about-water']}
    import json as _j
    return '<script>/* v23.8.1 About photos (built in, loaded last) */(function(){var D='+_j.dumps(d)+';document.querySelectorAll("img[data-dmimg]").forEach(function(i){var u=D[i.getAttribute("data-dmimg")];if(u)i.src=u})})();</script>\n'
def rep(old,new,name,cnt=1):
    global s
    c=s.count(old)
    if c!=cnt: sys.exit(f'ABORT {name}: found {c}, expected {cnt}')
    s=s.replace(old,new);print('ok',name)
rep("f=document.getElementById('filters'),hd=document.querySelector('.topbar')","f=(document.documentElement.classList.contains('dmActOn')&&document.getElementById('dmActChips'))||document.getElementById('filters'),hd=document.querySelector('.topbar')",'fit uses activity chips')
rep("var others=(bottom-mr.top)-cur;var t=Math.round(Math.max(230,Math.min(600,vh()-hh-others-6)));","var others=(bottom-mr.top)-cur;var t=Math.round(Math.max(230,Math.min(600,vh()-hh-others-6)));var actOn=document.documentElement.classList.contains('dmActOn');if(!actOn)window.__dmSwimMapH=t;else if(window.__dmSwimMapH)t=Math.min(t,window.__dmSwimMapH);",'activity map never grows past swim size')
rep("addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.topbar .brand');if(!b)return;","addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('.topbar .brand');if(!b)return;if(window.__dmSwallowUntil&&Date.now()<window.__dmSwallowUntil){e.preventDefault();e.stopPropagation();return}",'a tap that closes a card never also opens the start screen')
rep("function displayName(v){return esc(v.name)+(v.westernName&&norm(v.westernName)!==norm(v.name)?` <span class=\"western\">· ${esc(v.westernName)}</span>`:'')}function plainName(v){return v.name+(v.westernName&&norm(v.westernName)!==norm(v.name)?` · ${v.westernName}`:'')}","function dmWestern(v){var w=String(v.westernName||'').replace(/\\s*\\(\\s*\\)/g,'').replace(/\\s{2,}/g,' ').trim();return w&&norm(w)!==norm(v.name)&&norm(w)!==norm(String(v.name).replace(/\\s*\\([^)]*\\)/g,''))?w:''}function displayName(v){var w=dmWestern(v);return esc(v.name)+(w?` <span class=\"western\">· ${esc(w)}</span>`:'')}function plainName(v){var w=dmWestern(v);return v.name+(w?` · ${w}`:'')}",'no empty brackets in alternative place names')
rep("var off=km(c,m)>Math.max(0.6,r*0.25);","var off=km(c,m)>Math.max(0.6,r*0.25)&&!(state.dmFitCenter&&km(state.dmFitCenter,m)<0.05);",'a map moved by the app (fit to results) does not ask to Search this area')
rep("function dmWaterTemp(v){if(typeof isIndoor==='function'&&isIndoor(v))return null;","function dmWaterTemp(v){if(typeof isIndoor==='function'&&isIndoor(v))return null;try{var _m=window.dmModelWaterTemp&&window.dmModelWaterTemp(v);if(_m)return _m}catch(e){}",'swim cards use the same water-temperature model as the activities')
rep(" hydrateMedia(v,false);return null\n}"," if(!document.documentElement.classList.contains('dmActOn'))hydrateMedia(v,false);return null\n}",'swim card photos do not refetch while an activity is shown')
rep("if(!v||state.mediaBusy.has(v.id))return;const mediaScan=state.scanId;","if(!v||state.mediaBusy.has(v.id))return;if(!force){v._mTry=(v._mTry||0)+1;if(v._mTry>4)return}const mediaScan=state.scanId;",'swim photo lookups stop after 4 rounds per spot instead of looping')
rep("function prefetchMedia(){filtered().slice(0,24).forEach(v=>hydrateMedia(v,false))}","function prefetchMedia(){if(document.documentElement.classList.contains('dmActOn'))return;filtered().slice(0,24).forEach(v=>hydrateMedia(v,false))}",'swim photo prefetch pauses while an activity is shown')
rep("function q(){if(!raf)raf=requestAnimationFrame(fit)}\n","function q(){if(!raf)raf=requestAnimationFrame(fit)}window.dmRefit=function(){setAt=0;q()};\n",'expose refit')
rep('<p class="wSub"><span>Lakes</span><span>Beaches</span><span>Pools</span><span>Baths</span></p>','<p class="wSub"><span>\U0001F3CA Swim</span><span>\U0001F6F6 Paddle</span><span>\U0001F93F Dive</span><span>⛵ Sail</span></p>','welcome pills')
rep('<title>DipMapper — Find swim spots near you: beaches, lake baths, pools &amp; wild swimming</title>','<title>DipMapper — Find swim spots near you, plus paddling, diving, sailing &amp; boat tours</title>','title')
rep('DipMapper — Find swim spots near you: beaches, lake baths, pools &amp; wild swimming','DipMapper — Swim spots, SUP, boat rental, sailing, diving &amp; surfing near you','og/twitter titles',2)
rep('"featureList":["Global swim spot search"','"featureList":["Global swim spot search","SUP, kayak and boat rentals with prices and opening hours","Dive centres, dive sites and fish recorded nearby","Sailing, kite and surf spots with live wind","Is it good right now? verdict per activity","Water temperature and ice model on the map","No-boating, no-swimming and no-diving zones","Specials: city surf waves, floating pools, rooftop pools, sauna boats and thermal waters"','ld featureList')
rep('"description":"Find swim spots near you: beaches, lake baths, pools and wild swimming."','"description":"Find swim spots and water sports near you: beaches, lake baths, pools, SUP, boat rental, sailing, diving and surfing."','ld website description')
rep('<a href="/swim.html#zurich">Zürich</a>, <a href="/swim.html#meilen">Meilen</a>, <a href="/swim.html#rhodes">Rhodes</a>, <a href="/swim.html#miami">Miami</a>, <a href="/swim.html#rostock">Rostock &amp; Warnemünde</a>, <a href="/swim.html#palma">Palma de Mallorca</a>','<a href="/zurich.html">Zürich</a>, <a href="/meilen.html">Meilen</a>, <a href="/rhodes.html">Rhodes</a>, <a href="/miami.html">Miami</a>, <a href="/rostock.html">Rostock &amp; Warnemünde</a>, <a href="/palma.html">Palma de Mallorca</a>','guide links to real pages')
rep('<a href="/swim.html"><b>Open all swim guides →</b></a></p></section>','<a href="/swim.html"><b>Open all swim guides →</b></a></p><p>Water-sports guides with prices and opening hours: <a href="/sup-lake-zurich.html">SUP on Lake Zurich</a>, <a href="/boat-rental-lake-zurich.html">boat rental</a>, <a href="/sailing-lake-zurich.html">sailing schools</a>, <a href="/diving-lake-zurich.html">diving</a>, <a href="/surfing-switzerland.html">surfing in Switzerland</a>, <a href="/kitesurfing-switzerland.html">kitesurfing</a>, and <a href="/unique-water-experiences.html">unique water experiences</a> — city surf waves, floating pools, rooftop swims and sauna boats. <a href="/activities.html"><b>All water-sports guides →</b></a></p></section>','activity guide links')
rep('pools, thermal baths and wild swimming spots worldwide.">','pools, thermal baths and wild swimming spots worldwide — plus SUP, kayak and pedal-boat rentals, dive centres, sailing and kite schools, marinas and boat tours.">','meta description',3)
V=H;css=open(V+'act.css').read()+open(V+'act2.css').read()+open(V+'act3.css').read()+open(V+'act4.css').read()+open(V+'act5.css').read()+open(V+'act6.css').read()
core=open(V+'act_core.js').read();mods=''.join(open(V+f).read()+'\n' for f in ['m_icons.js','m_core.js','m_photo.js','m_sos.js','m_dive.js','m_ui.js','m_ui2.js','m_ui3.js','m_fame.js','m_journey.js'])
assert core.count(' /*@@MODULES@@*/')==1
js=''.join(open(V+f).read()+'\n' for f in ['dir.js','dir_patch.js','dir_explain.js','req.js','ice_data.js','specials.js','emergency.js','dive_data.js'])+core.replace(' /*@@MODULES@@*/',mods)
rep("label:'Zürich swim culture',center:[47.369,8.541]","label:'Zürich',center:[47.369,8.541]",'Zürich pack label: plain place name in every heading')
rep("state.mapCenter=[(mnLat+mxLat)/2,(mnLon+mxLon)/2];var r=els.map.getBoundingClientRect();","state.mapCenter=[(mnLat+mxLat)/2,(mnLon+mxLon)/2];state.dmFitCenter=state.mapCenter.slice();var r=els.map.getBoundingClientRect();",'an automatic swim fit is not a map move: no Search this area')
rep(" if(h<10||h>=19)q+=18; else if(h>=12&&h<=16)q-=18;\n"," if(h<10||h>=19)q+=18; else if(h>=12&&h<=16)q-=18;\n /* v23.7: outside the bathing season outdoor spots are quiet (northern and southern summers; not in the tropics) */ try{var _la=Number(v.lat||(state.center&&state.center[0])||0),_mo=now.getMonth();if(_la<0)_mo=(_mo+6)%12;if(Math.abs(_la)>=23&&isOutdoor(v)&&(_mo<4||_mo>8))q+=34}catch(e){}\n",'crowd model: off-season outdoor spots are quiet')
rep('</section><section class="legal"><h2>Legal and data protection</h2>','</section>'+aboutHtml()+'<section class="legal"><h2>Legal and data protection</h2>','About DipMapper: founder interview')
rep('<button data-scroll="how">How it works</button>','<button data-scroll="how">How it works</button><button data-scroll="about">About</button>','About in the header')
rep('"logo":{"@type":"ImageObject","url":"https://dipmapper.com/dipmapper-icon.png"}},{"@type":"WebApplication"','"logo":{"@type":"ImageObject","url":"https://dipmapper.com/dipmapper-icon.png"},"founder":{"@type":"Person","name":"Torsten Sauter","jobTitle":"Founder","url":"https://dipmapper.com/#about"}},{"@type":"WebApplication"','structured data: founder (SEO for the About section)')
rep('\n</body></html>','\n<style id="dmV23">\n'+css+'</style>\n<script>\n'+js+'</script>\n'+aboutImgScript()+'</body></html>','activity layer')
s=s.replace('22.22.0','23.8.1');print('versions',s.count('23.8.1'))
open(H+'index.html','w').write(s);print('size',len(s))
