#!/usr/bin/env python3
"""
DipMapper — global swim guide generator.
Builds one static page per city that genuinely has named swim spots,
using the same OpenStreetMap data the app searches. Runs on GitHub Actions.
Only real, named places are published; thin cities are skipped.
Requires: geonamescache  (pip install geonamescache)
"""
import json, os, re, sys, time, unicodedata, urllib.parse, urllib.request
from datetime import date, datetime, timezone
from math import radians, sin, cos, asin, sqrt

SITE="https://dipmapper.com"
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT=os.path.join(ROOT,"swim")
CURSOR=os.path.join(os.path.dirname(os.path.abspath(__file__)),"_cursor.json")
MIN_POP=int(os.environ.get("MIN_POP",150000))
MIN_SPOTS=int(os.environ.get("MIN_SPOTS",8))
MAX_SPOTS=int(os.environ.get("MAX_SPOTS",60))
BATCH=int(os.environ.get("BATCH",250))
RADIUS_M=int(os.environ.get("RADIUS_M",15000))
PAUSE_S=float(os.environ.get("PAUSE_S",1.6))
REFRESH_D=int(os.environ.get("REFRESH_DAYS",30))
AD_CLIENT=os.environ.get("AD_CLIENT","").strip()
AD_TOP=os.environ.get("AD_TOP","").strip()
AD_MID=os.environ.get("AD_MID","").strip()
ENDPOINTS=["https://overpass.private.coffee/api/interpreter","https://overpass.kumi.systems/api/interpreter",
           "https://z.overpass-api.de/api/interpreter","https://lz4.overpass-api.de/api/interpreter"]
CAT1={"bath":"lake bath","beach":"beach","pool":"swimming pool","thermal":"thermal bath","wild":"wild swimming spot"}
CATN={"bath":"lake baths","beach":"beaches","pool":"swimming pools","thermal":"thermal baths","wild":"wild swimming spots"}
BAD=re.compile(r"(kinderpool|plansch|paddel|paddling|wading|splash ?pad|spray ?park|\bfountain\b|\bbrunnen\b|decorative|hotel pool|private pool|whirlpool|jacuzzi|footbath|fussbad)",re.I)

def esc(t): return (str(t if t is not None else "").replace("&","&amp;").replace("<","&lt;").replace(">","&gt;").replace('"',"&quot;"))
def slug(t):
    t=unicodedata.normalize("NFKD",str(t)); t="".join(c for c in t if not unicodedata.combining(c))
    t=re.sub(r"[^a-zA-Z0-9]+","-",t).strip("-").lower(); return re.sub(r"-{2,}","-",t) or "x"
def norm(t):
    t=unicodedata.normalize("NFKD",str(t or "").lower()); return "".join(c for c in t if not unicodedata.combining(c))
def hav(a,b,c,d):
    p=radians; x,y=p(c-a),p(d-b); h=sin(x/2)**2+cos(p(a))*cos(p(c))*sin(y/2)**2; return 2*6371000*asin(sqrt(h))
def query(lat,lon,r):
    a="(around:%d,%s,%s)"%(r,lat,lon)
    parts=['[out:json][timeout:60];(',
        'nwr["natural"~"beach|hot_spring"]'+a+';',
        'nwr["leisure"~"swimming_area|swimming_pool|beach_resort|water_park|bathing_place"]'+a+';',
        'nwr["amenity"="public_bath"]'+a+';',
        'nwr["sport"="swimming"]'+a+';',
        'nwr["swimming"~"yes|designated"]'+a+';',
        'nwr["bathing"~"yes|designated"]'+a+';',
        ');out center 400;']
    return "".join(parts)
def fetch_overpass(q,tries=3):
    last=None
    for i in range(tries):
        url=ENDPOINTS[i%len(ENDPOINTS)]+"?data="+urllib.parse.quote(q)
        try:
            req=urllib.request.Request(url,headers={"User-Agent":"DipMapper-guides/1.0 (+https://dipmapper.com)"})
            with urllib.request.urlopen(req,timeout=90) as r: return json.loads(r.read().decode("utf-8")).get("elements",[])
        except Exception as e: last=e; time.sleep(3+i*4)
    print(f"    overpass failed: {last}",file=sys.stderr); return []
def classify(t,name):
    text=norm(" ".join(filter(None,[name,t.get("leisure"),t.get("amenity"),t.get("natural"),t.get("waterway"),t.get("sport")])))
    if t.get("natural")=="beach" or re.search(r"beach|strand|plage|playa|praia|spiaggia|paralia|platja",text): return "beach"
    if t.get("natural")=="hot_spring" or re.search(r"thermal|therme|terme|hot.spring|spa|sauna",text): return "thermal"
    if t.get("waterway")=="waterfall" or re.search(r"waterfall|wild",text): return "wild"
    if t.get("leisure")=="swimming_area" or t.get("amenity")=="public_bath" or re.search(r"seebad|badi|naturbad|badeplatz|bathing",text): return "bath"
    if t.get("leisure")=="swimming_pool" or re.search(r"\bpool\b|piscina|hallenbad|freibad|piscine",text): return "pool"
    return "bath"
def to_spot(el):
    t=el.get("tags") or {}
    lat=el.get("lat") or (el.get("center") or {}).get("lat"); lon=el.get("lon") or (el.get("center") or {}).get("lon")
    if lat is None or lon is None: return None
    if t.get("access") in ("private","no","permit"): return None
    name=(t.get("name") or t.get("name:en") or t.get("int_name") or t.get("official_name") or t.get("alt_name") or "").strip()
    if not name or BAD.search(norm(name)): return None
    return {"id":f'{el.get("type")}-{el.get("id")}',"osm_type":el.get("type"),"osm_id":el.get("id"),
        "name":name,"cat":classify(t,name),"lat":round(float(lat),6),"lon":round(float(lon),6),
        "address":", ".join(filter(None,[" ".join(filter(None,[t.get("addr:street"),t.get("addr:housenumber")])),t.get("addr:city")])) or "",
        "website":t.get("website") or t.get("contact:website") or t.get("url") or "","hours":t.get("opening_hours") or "",
        "operator":t.get("operator") or "","fee":t.get("fee") or "","access":t.get("access") or "",
        "wheelchair":t.get("wheelchair") or "","indoor":t.get("indoor") or "",
        "id_required":bool(t.get("id_required")=="yes" or re.search(r"ausweis|photo id|identification required|registration required",norm((t.get("description") or "")+" "+(t.get("description:en") or ""))))}
def rich(s): return (3 if s["website"] else 0)+(2 if s["hours"] else 0)+(1 if s["address"] else 0)+(1 if s["operator"] else 0)
def dedupe(spots):
    out=[]
    for s in spots:
        dup=None
        for o in out:
            m=hav(s["lat"],s["lon"],o["lat"],o["lon"])
            if m>150: continue
            a,b=norm(s["name"]),norm(o["name"])
            if a==b or a in b or b in a or (m<=30 and s["cat"]==o["cat"]): dup=o; break
        if dup:
            if rich(s)>rich(dup): dup.update(s)
            continue
        out.append(s)
    return out

CSS=""":root{--ink:#07343b;--brand:#0a7d78;--line:#dceae7;--muted:#5f8189}*{box-sizing:border-box}body{margin:0;font-family:'Manrope',system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:var(--ink);line-height:1.62;background:linear-gradient(150deg,#eafffb,#fffdf4 55%,#fff3d9)}.wrap{max-width:840px;margin:0 auto;padding:36px 20px 72px}a{color:var(--brand)}nav{font-size:13.5px;color:var(--muted);margin-bottom:20px}h1{font-size:clamp(26px,4.3vw,37px);letter-spacing:-.025em;line-height:1.14;margin:0 0 12px}.lede{font-size:17px;color:#2c5a60;margin:0 0 24px}.cta{display:inline-block;background:linear-gradient(180deg,#0fb3a6,#0a7d78);color:#fff;text-decoration:none;font-weight:700;padding:13px 22px;border-radius:13px}.spot{background:#fffefa;border:1px solid var(--line);border-radius:15px;padding:17px 19px;margin:13px 0}.spot h2{font-size:19px;margin:0 0 3px}.kind{font-size:11.5px;text-transform:uppercase;letter-spacing:.09em;color:var(--muted);font-weight:700;margin-bottom:9px}dl{display:grid;grid-template-columns:auto 1fr;gap:4px 14px;margin:0 0 11px;font-size:14.5px}dt{color:var(--muted);font-weight:600}dd{margin:0}.links a{font-size:14px;margin-right:15px;font-weight:600}ul.grid{list-style:none;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px}ul.grid a{display:block;background:#fffefa;border:1px solid var(--line);border-radius:13px;padding:13px 15px;text-decoration:none;font-weight:700}ul.grid span{display:block;font-weight:500;font-size:12.5px;color:var(--muted);margin-top:2px}footer{margin-top:42px;padding-top:18px;border-top:1px solid var(--line);font-size:12.5px;color:var(--muted)}@media(max-width:600px){dl{grid-template-columns:1fr}dt{margin-top:6px}}.ad{margin:18px auto;text-align:center;min-height:110px}.adlabel{display:block;font-size:9.5px;letter-spacing:.14em;text-transform:uppercase;color:#93aeb4;margin-bottom:6px;font-weight:700}"""
FONT=('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
      '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&amp;display=swap" media="print" onload="this.media=\'all\'">')
def ads_head(): return "" if not AD_CLIENT else (f'<meta name="google-adsense-account" content="{AD_CLIENT}">'f'<script async crossorigin="anonymous" src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client={AD_CLIENT}"></script>')
def ad_unit(slot,fmt="auto"): return "" if not (AD_CLIENT and slot) else (f'<div class="ad"><span class="adlabel">Advertisement</span><ins class="adsbygoogle" style="display:block" data-ad-client="{AD_CLIENT}" data-ad-slot="{slot}" data-ad-format="{fmt}" data-full-width-responsive="true"></ins><script>(adsbygoogle=window.adsbygoogle||[]).push({{}});</script></div>')
def head(title,desc,canonical,ld):
    return (f'<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
        f'<title>{esc(title)}</title><meta name="description" content="{esc(desc)}"><link rel="canonical" href="{canonical}">'
        f'<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">'
        f'<meta property="og:type" content="article"><meta property="og:site_name" content="DipMapper"><meta property="og:title" content="{esc(title)}"><meta property="og:description" content="{esc(desc)}"><meta property="og:url" content="{canonical}"><meta property="og:image" content="{SITE}/assets/dipmapper-icon.png">'
        f'<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="{esc(title)}"><meta name="twitter:description" content="{esc(desc)}">'
        f'{ads_head()}{FONT}<style>{CSS}</style><script type="application/ld+json">{json.dumps(ld,ensure_ascii=False)}</script></head><body><div class="wrap">')
FOOT='<footer>Place data &copy; <a href="https://www.openstreetmap.org/copyright" rel="noopener">OpenStreetMap</a> contributors (Open Database License). Details are supplied by mappers and operators and can change &mdash; check the official site before you travel.<br>Updated {d}. <a href="/">DipMapper.com</a></footer></div></body></html>'
def deep(s): return f'{SITE}/?lat={s["lat"]}&lon={s["lon"]}&name={urllib.parse.quote(s["name"])}'
def spot_html(s):
    facts=[]
    if s["address"]: facts.append(("Address",esc(s["address"])))
    if s["hours"]: facts.append(("Opening hours",esc(s["hours"])))
    if s["fee"]=="no": facts.append(("Entry","Free"))
    elif s["fee"]=="yes": facts.append(("Entry","Paid"))
    if s["id_required"]: facts.append(("Entry requirement","Photo ID required \u2014 bring a valid ID or passport"))
    if s["access"] in ("customers","members"): facts.append(("Access",esc(s["access"].capitalize()+" only")))
    if s["operator"]: facts.append(("Operator",esc(s["operator"])))
    if s["indoor"]=="yes": facts.append(("Setting","Indoor"))
    if s["wheelchair"]=="yes": facts.append(("Accessibility","Step-free access"))
    links=[f'<a href="{esc(deep(s))}">Open in DipMapper</a>']
    if s["website"]: links.append(f'<a href="{esc(s["website"])}" rel="noopener nofollow" target="_blank">Official website</a>')
    links.append(f'<a href="https://www.openstreetmap.org/{s["osm_type"]}/{s["osm_id"]}" rel="noopener nofollow" target="_blank">Map data</a>')
    dl="".join(f"<dt>{k}</dt><dd>{v}</dd>" for k,v in facts)
    return (f'<article class="spot"><h2>{esc(s["name"])}</h2><div class="kind">{esc(CAT1[s["cat"]])}</div>{f"<dl>{dl}</dl>" if dl else ""}<div class="links">{"".join(links)}</div></article>')
def join_list(p): return "" if not p else (p[0] if len(p)==1 else ", ".join(p[:-1])+" and "+p[-1])
def plural(n,one,many=None): return f"{n} {one if n==1 else (many or one+'s')}"
def phrase(counts): return join_list([f'{n} {(CAT1 if n==1 else CATN)[c]}' for c,n in sorted(counts.items(),key=lambda x:-x[1])])
def city_page(city,country,spots,today):
    cslug,kslug=slug(city["name"]),slug(country); url=f"{SITE}/swim/{kslug}/{cslug}.html"
    counts={}
    for s in spots: counts[s["cat"]]=counts.get(s["cat"],0)+1
    free=sum(1 for s in spots if s["fee"]=="no"); hrs=sum(1 for s in spots if s["hours"]); sites=sum(1 for s in spots if s["website"])
    title=f'Where to Swim in {city["name"]} — {plural(len(spots),"Swim Spot")} ({today.year})'
    desc=f'{len(spots)} places to swim in {city["name"]}, {country}: {phrase(counts)}. Locations, opening hours and official links.'
    extra=[]
    if free: extra.append(f"{free} are free to enter")
    if hrs: extra.append(f"{hrs} list opening hours")
    if sites: extra.append(f"{sites} have an official website")
    lede=f'{city["name"]} has {plural(len(spots),"mapped swim spot")}: {phrase(counts)}.'+(f' Of these, {join_list(extra)}.' if extra else "")
    ld={"@context":"https://schema.org","@graph":[
        {"@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"DipMapper","item":f"{SITE}/"},{"@type":"ListItem","position":2,"name":"Swim guides","item":f"{SITE}/swim/"},{"@type":"ListItem","position":3,"name":country,"item":f"{SITE}/swim/{kslug}/"},{"@type":"ListItem","position":4,"name":city["name"],"item":url}]},
        {"@type":"ItemList","name":f'Swim spots in {city["name"]}',"numberOfItems":len(spots),"itemListElement":[{"@type":"ListItem","position":i+1,"item":{"@type":"SportsActivityLocation","name":s["name"],"url":deep(s),**({"sameAs":s["website"]} if s["website"] else {}),"geo":{"@type":"GeoCoordinates","latitude":s["lat"],"longitude":s["lon"]},**({"openingHours":s["hours"]} if s["hours"] else {}),**({"isAccessibleForFree":True} if s["fee"]=="no" else {})}} for i,s in enumerate(spots)]}]}
    body=(f'<nav><a href="/">DipMapper</a> &rsaquo; <a href="/swim/">Swim guides</a> &rsaquo; <a href="/swim/{kslug}/">{esc(country)}</a> &rsaquo; {esc(city["name"])}</nav>'
        f'<h1>Where to swim in {esc(city["name"])}</h1><p class="lede">{esc(lede)}</p>'
        f'<p><a class="cta" href="{SITE}/?lat={city["lat"]}&amp;lon={city["lon"]}&amp;name={urllib.parse.quote(city["name"])}">Open {esc(city["name"])} in DipMapper &rarr;</a></p>'
        f'{ad_unit(AD_TOP,"horizontal")}<section>{"".join(spot_html(s)+(ad_unit(AD_MID) if i==len(spots)//2 else "") for i,s in enumerate(spots))}</section>')
    return url,head(title,desc,url,ld)+body+FOOT.format(d=today.isoformat())
def country_hub(country,cities,today):
    kslug=slug(country); url=f"{SITE}/swim/{kslug}/"; total=sum(c["n"] for c in cities)
    title=f"Where to Swim in {country} — {plural(len(cities),'City','Cities')}, {plural(total,'Swim Spot')}"
    desc=f"Swim guides for {plural(len(cities),'city','cities')} in {country}: beaches, lake baths, pools and thermal baths."
    ld={"@context":"https://schema.org","@type":"CollectionPage","name":title,"url":url,"hasPart":[{"@type":"WebPage","name":f'Where to swim in {c["name"]}',"url":f'{SITE}/swim/{kslug}/{slug(c["name"])}.html'} for c in cities]}
    items="".join(f'<li><a href="/swim/{kslug}/{slug(c["name"])}.html">{esc(c["name"])}<span>{plural(c["n"],"swim spot")}</span></a></li>' for c in cities)
    body=f'<nav><a href="/">DipMapper</a> &rsaquo; <a href="/swim/">Swim guides</a> &rsaquo; {esc(country)}</nav><h1>Where to swim in {esc(country)}</h1><p class="lede">{plural(len(cities),"city","cities")} with {plural(total,"mapped swim spot")}.</p><ul class="grid">{items}</ul>'
    return url,head(title,desc,url,ld)+body+FOOT.format(d=today.isoformat())
def global_hub(by_country,today):
    url=f"{SITE}/swim/"; ncity=sum(len(v) for v in by_country.values()); nspot=sum(c["n"] for v in by_country.values() for c in v)
    title="Swim Guides — Where to Swim in Any City | DipMapper"
    desc=f"Swim guides for {plural(ncity,'city','cities')} in {plural(len(by_country),'country','countries')}: {nspot} beaches, lake baths, pools and thermal baths."
    ld={"@context":"https://schema.org","@type":"CollectionPage","name":title,"url":url,"hasPart":[{"@type":"WebPage","name":f"Where to swim in {k}","url":f"{SITE}/swim/{slug(k)}/"} for k in sorted(by_country)]}
    items="".join(f'<li><a href="/swim/{slug(k)}/">{esc(k)}<span>{len(v)} cities · {sum(c["n"] for c in v)} spots</span></a></li>' for k,v in sorted(by_country.items()))
    body=f'<nav><a href="/">DipMapper</a> &rsaquo; Swim guides</nav><h1>Swim guides</h1><p class="lede">Every city we can map with enough real, named swim spots &mdash; {plural(ncity,"city","cities")} across {plural(len(by_country),"country","countries")}, {plural(nspot,"place")} in total.</p><p><a class="cta" href="/">Search any location &rarr;</a></p><ul class="grid">{items}</ul>'
    return url,head(title,desc,url,ld)+body+FOOT.format(d=today.isoformat())
def write(path,text):
    os.makedirs(os.path.dirname(path),exist_ok=True); open(path,"w",encoding="utf-8").write(text)
def load_cursor():
    try: return json.load(open(CURSOR,encoding="utf-8"))
    except Exception: return {"index":0}
def recently_built(path):
    if not os.path.exists(path): return False
    return (datetime.now(timezone.utc)-datetime.fromtimestamp(os.path.getmtime(path),timezone.utc)).days<REFRESH_D
def rebuild_hubs(today):
    by_country,urls={},[f"{SITE}/",f"{SITE}/swim/",f"{SITE}/privacy.html"]
    if os.path.isdir(OUT):
        for kslug in sorted(os.listdir(OUT)):
            d=os.path.join(OUT,kslug)
            if not os.path.isdir(d): continue
            mp=os.path.join(d,"_meta.json"); meta=json.load(open(mp,encoding="utf-8")) if os.path.exists(mp) else {}
            cities=sorted(meta.get("cities",[]),key=lambda c:-c["n"])
            if not cities: continue
            by_country[meta["country"]]=cities
            u,html=country_hub(meta["country"],cities,today); write(os.path.join(d,"index.html"),html); urls.append(u)
            urls+=[f'{SITE}/swim/{kslug}/{slug(c["name"])}.html' for c in cities]
    if by_country:
        u,html=global_hub(by_country,today); write(os.path.join(OUT,"index.html"),html)
    sm=('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        +"\n".join(f'  <url><loc>{u}</loc><lastmod>{today.isoformat()}</lastmod><changefreq>{"daily" if u==SITE+"/" else "weekly"}</changefreq><priority>{"1.0" if u==SITE+"/" else "0.6"}</priority></url>' for u in urls)+"\n</urlset>\n")
    write(os.path.join(ROOT,"sitemap.xml"),sm)
    return len(by_country),sum(len(v) for v in by_country.values()),len(urls)
def main(fetch=fetch_overpass):
    from geonamescache import GeonamesCache
    gc=GeonamesCache(); countries=gc.get_countries()
    cities=[c for c in gc.get_cities().values() if c.get("population",0)>=MIN_POP and c.get("latitude") is not None]
    cities.sort(key=lambda c:(-c["population"],c["name"])); today=date.today()
    cur=load_cursor(); start=cur.get("index",0)%max(1,len(cities))
    todo=[cities[(start+i)%len(cities)] for i in range(min(BATCH,len(cities)))]
    print(f"cities >= {MIN_POP:,} pop: {len(cities)} | this run: {len(todo)} starting at #{start}")
    built=skipped=failed=0
    for n,c in enumerate(todo,1):
        country=countries.get(c["countrycode"],{}).get("name",c["countrycode"]); kslug,cslug=slug(country),slug(c["name"])
        page=os.path.join(OUT,kslug,f"{cslug}.html")
        if recently_built(page): skipped+=1; continue
        lat,lon=float(c["latitude"]),float(c["longitude"])
        els=fetch(query(lat,lon,RADIUS_M))
        if not els: failed+=1; time.sleep(PAUSE_S); continue
        spots=dedupe([s for s in (to_spot(e) for e in els) if s])
        spots.sort(key=lambda s:(-rich(s),hav(lat,lon,s["lat"],s["lon"]))); spots=spots[:MAX_SPOTS]
        if len(spots)<MIN_SPOTS:
            print(f"  [{n}/{len(todo)}] {c['name']}, {country}: {len(spots)} named spots — skipped (thin)"); time.sleep(PAUSE_S); continue
        _,html=city_page({"name":c["name"],"lat":lat,"lon":lon},country,spots,today); write(page,html)
        mp=os.path.join(OUT,kslug,"_meta.json"); meta=json.load(open(mp,encoding="utf-8")) if os.path.exists(mp) else {"country":country,"cities":[]}
        meta["cities"]=[x for x in meta["cities"] if x["name"]!=c["name"]]+[{"name":c["name"],"n":len(spots)}]; write(mp,json.dumps(meta,ensure_ascii=False,indent=1))
        built+=1; print(f"  [{n}/{len(todo)}] {c['name']}, {country}: {len(spots)} spots -> /swim/{kslug}/{cslug}.html"); time.sleep(PAUSE_S)
    cur["index"]=(start+len(todo))%len(cities); write(CURSOR,json.dumps(cur))
    nk,nc,nu=rebuild_hubs(today)
    print(f"\nbuilt {built} | skipped(fresh) {skipped} | thin/failed {failed}\nsite: {nc} city pages / {nk} countries, sitemap {nu} urls")
if __name__=="__main__": main()
