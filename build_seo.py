#!/usr/bin/env python3
"""DipMapper SEO pack (v23.2).
1. Fixes the existing city swim guides (canonical/og:url pointed to /swim/<city>.html, which does not exist; og:image pointed to /assets/).
2. Generates water-sports guide pages from the verified directory (only published, sourced data; nothing invented).
3. Writes sitemap.xml with every public page.
Same look as the existing swim guides (no redesign). Re-run after adding directory entries to scale to new regions.
Usage: python3 build_seo.py <website_dir> <dir.json> <out_dir> [specials.json]
"""
import json, os, re, sys, html, urllib.parse
SITE = "https://dipmapper.com"
TODAY = "2026-10-10"
web, dirjson, out = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(out, exist_ok=True)
D = json.load(open(dirjson))
DIR = [d for d in D["dir"] if not d.get("closed")]
esc = lambda t: html.escape(str(t if t is not None else ""), quote=True)

# ---------- 1. fix the city guides ----------
CITY = ["meilen", "zurich", "miami", "palma", "rhodes", "rostock"]
fixed = {}
for c in CITY + ["swim"]:
    p = os.path.join(web, c + ".html")
    s = open(p, encoding="utf-8").read()
    o = s
    s = s.replace(SITE + "/swim/" + c + ".html", SITE + "/" + c + ".html")
    s = s.replace(SITE + "/assets/dipmapper-icon.png", SITE + "/dipmapper-icon.png")
    s = re.sub(r'href="/swim/([a-z\-]+)\.html"', r'href="/\1.html"', s)
    s = s.replace('href="/swim/"', 'href="/swim.html"')
    s = s.replace('"item":"' + SITE + '/swim/"', '"item":"' + SITE + '/swim.html"')
    s = re.sub(r'"(?:item|url)":"' + re.escape(SITE) + r'/swim/([a-z\-]+)\.html"', lambda m: m.group(0).replace("/swim/" + m.group(1), "/" + m.group(1)), s)
    if c != "swim" and "water-sports-lake-zurich.html" not in s and c in ("meilen", "zurich"):
        s = s.replace("<h2>Other swim guides</h2>", '<h2>More on the water</h2><p><a href="/water-sports-lake-zurich.html">SUP, boat rental, sailing and diving on Lake Zurich</a> — prices, opening hours and contacts.</p><h2>Other swim guides</h2>')
    if c == "swim" and "/activities.html" not in s:
        k = s.rfind("</footer>") if "</footer>" in s else s.rfind("</body>")
        s = s[:k] + ' <a href="/activities.html">Water-sports guides: SUP, boats, sailing, diving &amp; surfing →</a>' + s[k:]
    if s != o:
        open(os.path.join(out, c + ".html"), "w", encoding="utf-8").write(s)
        fixed[c] = True

# ---------- 2. water-sports guides from the verified directory ----------
tpl = open(os.path.join(web, "meilen.html"), encoding="utf-8").read()
STYLE = tpl[tpl.index("<style>"):tpl.index("</style>") + 8]
STYLE = STYLE.replace("</style>", "table.p{width:100%;border-collapse:collapse;font-size:14px;margin:0 0 12px}table.p td{padding:6px 4px;border-bottom:1px solid var(--line);vertical-align:top}table.p td:last-child{text-align:right;font-weight:700;white-space:nowrap}.src{font-size:12.5px;color:var(--muted)}.badge{display:inline-block;font-size:11px;font-weight:700;color:#0b6b3a;background:#e7f6ef;border:1px solid #bfe3cf;border-radius:999px;padding:2px 8px;margin-left:6px;vertical-align:2px}.faq h3{font-size:17px;margin:18px 0 4px}</style>")
FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&amp;display=swap" media="print" onload="this.media=\'all\'">'
ICON = SITE + "/dipmapper-icon.png"
SCHEMA_TYPE = {"rental": "SportsActivityLocation", "school": "SportsActivityLocation", "centre": "SportsActivityLocation", "tours": "TouristAttraction", "spot": "TouristAttraction", "club": "SportsClub"}
ACTN = {"sup": "SUP", "kayak": "kayak & canoe", "row": "rowing boats", "pedal": "pedal boats", "boatrent": "boat rental", "motorboat": "motorboats", "dive": "scuba diving", "snorkel": "snorkelling", "freedive": "freediving", "sail": "sailing", "windsurf": "windsurfing", "kite": "kitesurfing", "wing": "wingfoiling", "surf": "surfing", "tour": "boat tours", "wake": "wakeboarding & water-ski", "raft": "rafting"}
DAYS = {"Mo": "Monday", "Tu": "Tuesday", "We": "Wednesday", "Th": "Thursday", "Fr": "Friday", "Sa": "Saturday", "Su": "Sunday"}

def head(title, desc, url, ld):
    return ('<!doctype html><html lang="en"><head><meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n'
            f'<title>{esc(title)}</title>\n<meta name="description" content="{esc(desc)}">\n<link rel="canonical" href="{url}">\n'
            '<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1">\n'
            f'<meta property="og:type" content="article"><meta property="og:site_name" content="DipMapper">\n<meta property="og:title" content="{esc(title)}"><meta property="og:description" content="{esc(desc)}">\n'
            f'<meta property="og:url" content="{url}">\n<meta property="og:image" content="{ICON}">\n<meta name="twitter:card" content="summary_large_image">\n'
            f'<meta name="twitter:title" content="{esc(title)}"><meta name="twitter:description" content="{esc(desc)}">\n<link rel="icon" href="/favicon.svg" type="image/svg+xml">\n'
            + FONTS + "\n" + STYLE + '\n<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False) + "</script>\n</head>")

def hours_text(d):
    oh = d.get("oh") or ""
    if not oh:
        return d.get("hours") or ""
    t = oh
    for k, v in DAYS.items():
        t = re.sub(r"\b" + k + r"\b", v[:3], t)
    return t.replace(";", ";").replace(" off", " closed")

def place_ld(d):
    t = {"@type": SCHEMA_TYPE.get(d["type"], "LocalBusiness"), "name": d["n"], "geo": {"@type": "GeoCoordinates", "latitude": round(d["lat"], 5), "longitude": round(d["lon"], 5)}}
    if d.get("addr"): t["address"] = d["addr"]
    if d.get("phone"): t["telephone"] = d["phone"]
    if d.get("email"): t["email"] = d["email"]
    if d.get("web"): t["url"] = d["web"]
    same = [x for x in [d.get("ig"), d.get("fb")] if x]
    if same: t["sameAs"] = same
    oh = d.get("oh") or ""
    if oh and not re.search(r"(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{4})", oh):
        t["openingHours"] = [x.strip() for x in oh.split(";") if x.strip() and "off" not in x]
    ps = [p for p in d.get("prices") or [] if re.search(r"CHF\s*\d", p[1])]
    if ps:
        nums = [float(re.search(r"CHF\s*(\d+(?:\.\d+)?)", p[1]).group(1)) for p in ps]
        t["priceRange"] = "CHF %d–%d" % (min(nums), max(nums)) if min(nums) != max(nums) else "CHF %d" % min(nums)
    return t

def card(d, i):
    acts = ", ".join(ACTN.get(a, a) for a in d.get("acts", []))
    live = SITE + "/?" + urllib.parse.urlencode({"lat": round(d["lat"], 5), "lon": round(d["lon"], 5), "name": d["n"], "act": MODEACT.get(d["acts"][0], "paddle") if d.get("acts") else "paddle"})
    rows = "".join(f"<tr><td>{esc(p[0])}</td><td>{esc(p[1])}</td></tr>" for p in (d.get("prices") or []))
    dl = []
    if d.get("addr"): dl.append(("Address", d["addr"]))
    ht = hours_text(d)
    if ht: dl.append(("Opening", ht))
    if d.get("season"): dl.append(("Season", d["season"]))
    if d.get("phone"): dl.append(("Phone", d["phone"]))
    if d.get("email"): dl.append(("E-mail", d["email"]))
    if d.get("near"): dl.append(("Getting there", d["near"]))
    if d.get("req"): dl.append(("Requirements", d["req"]))
    links = [f'<a href="{esc(live)}">Live conditions in DipMapper</a>']
    if d.get("web"): links.append(f'<a href="{esc(d["web"])}" rel="noopener nofollow" target="_blank">Official website</a>')
    if d.get("ig"): links.append(f'<a href="{esc(d["ig"])}" rel="noopener nofollow" target="_blank">Instagram</a>')
    if d.get("fb"): links.append(f'<a href="{esc(d["fb"])}" rel="noopener nofollow" target="_blank">Facebook</a>')
    src = d.get("src") or ["", ""]
    psrc = (d.get("srcs") or {}).get("prices") or d.get("psrc")
    note = f'<p class="src">Source: <a href="{esc(src[1])}" rel="noopener nofollow" target="_blank">{esc(src[0])}</a>' + (f' · prices: <a href="{esc(psrc)}" rel="noopener nofollow" target="_blank">operator website</a>' if psrc else "") + f' · checked {esc(d.get("checked") or TODAY)}</p>'
    status = f'<p><b>Please check before you go:</b> {esc(d["status"])}</p>' if d.get("status") else ""
    return (f'<article class="spot" id="{esc(d["id"])}">\n<h2>{esc(d["n"])}<span class="badge">✔ Verified</span></h2>\n<div class="kind">{esc(TYPEN.get(d["type"], d["type"]))} · {esc(acts)}</div>\n'
            + (f'<p>{esc(d["about"])}</p>' if d.get("about") else (f'<p>{esc(d["offers"])}</p>' if d.get("offers") else "")) + (f'<p><b>Good to know:</b> {esc(d["tip"])}</p>' if d.get("tip") else "") + status
            + ("<dl>" + "".join(f"<dt>{esc(k)}</dt><dd>{esc(v)}</dd>" for k, v in dl) + "</dl>" if dl else "")
            + (f'<table class="p"><tbody>{rows}</tbody></table>' if rows else '<p class="src">Prices are not published by the operator — ask when booking.</p>')
            + f'<div class="links">{"".join(links)}</div>\n{note}</article>\n')

MODEACT = {"sup": "paddle", "kayak": "paddle", "row": "paddle", "pedal": "paddle", "boatrent": "boat", "motorboat": "boat", "dive": "dive", "snorkel": "dive", "freedive": "dive", "sail": "sail", "windsurf": "sail", "kite": "sail", "wing": "sail", "surf": "sail", "tour": "boat", "wake": "boat", "raft": "raft"}
TYPEN = {"rental": "rental", "school": "school", "centre": "centre", "tours": "tours & cruises", "spot": "spot", "club": "club"}
LZ = lambda d: 47.15 <= d["lat"] <= 47.45 and 8.45 <= d["lon"] <= 8.95
PAGES = [
    ("water-sports-lake-zurich", "Water Sports on Lake Zurich — SUP, Boat Rental, Sailing & Diving (2026)", "Lake Zurich water sports",
     "Every verified SUP station, boat rental, sailing school, dive centre and dive site around Lake Zurich, with published prices, opening hours, contacts and live conditions.",
     lambda d: LZ(d)),
    ("sup-lake-zurich", "SUP on Lake Zurich — Rental Prices, Stations & Schools (2026)", "SUP on Lake Zurich",
     "Where to rent a stand-up paddleboard on Lake Zurich: stations, hourly prices, opening hours and life-jacket rules, checked October 2026.",
     lambda d: LZ(d) and "sup" in d.get("acts", [])),
    ("boat-rental-lake-zurich", "Boat Rental on Lake Zurich — Pedal Boats, Motorboats & Lake Cruises (2026)", "Boat rental on Lake Zurich",
     "Pedal boats, rowing boats, e-boats, motorboats with and without licence, and lake cruises on Lake Zurich — prices per hour, hours and licence rules.",
     lambda d: LZ(d) and any(a in d.get("acts", []) for a in ("pedal", "row", "boatrent", "motorboat", "tour"))),
    ("diving-lake-zurich", "Diving in Lake Zurich — Dive Sites & Dive Centres (2026)", "Diving in Lake Zurich",
     "Dive sites and PADI dive centres around Lake Zurich, course prices, shop hours and the local no-dive zones.",
     lambda d: LZ(d) and any(a in d.get("acts", []) for a in ("dive", "snorkel", "freedive"))),
    ("sailing-lake-zurich", "Sailing Schools on Lake Zurich — Courses for Kids & Adults (2026)", "Sailing on Lake Zurich",
     "Sailing and motorboat schools on Lake Zurich, with published course prices and licence rules (Category A and D).",
     lambda d: LZ(d) and any(a in d.get("acts", []) for a in ("sail",))),
    ("surfing-switzerland", "Surfing in Switzerland — River Waves, City Waves & Wave Pools (2026)", "Surfing in Switzerland",
     "Swiss surf spots: Urbansurf Zürich, Alaïa Bay wave pool, OANA Citywave and the river waves of Thun, Bremgarten and Lucerne — prices, hours and rules.",
     lambda d: "surf" in d.get("acts", [])),
    ("kitesurfing-switzerland", "Kitesurfing in Switzerland — Spots, Schools & Rules (2026)", "Kitesurfing in Switzerland",
     "Kite spots and schools in Switzerland (Silvaplana, Urnersee), prices, required licence and insurance, and the cantonal kite zones.",
     lambda d: any(a in d.get("acts", []) for a in ("kite", "wing", "windsurf"))),
]
FAQ = {
    "sup-lake-zurich": [("Do I need a life jacket for SUP in Switzerland?", "On lakes you must carry a life jacket or 50 N buoyancy aid once you are more than 300 m from the shore; on rivers at all times (vks leaflet No. 6, in force since 1 May 2022)."),
                        ("What does SUP rental cost in Zürich?", "At the Supkultur city stations a board costs CHF 35 for the first hour and CHF 45 for 1.5 hours (operator price list, checked October 2026).")],
    "boat-rental-lake-zurich": [("Can I rent a motorboat without a licence?", "Yes, motorboats up to 6 kW can be driven without a licence from age 14; above 6 kW you need a Category A licence (minimum age 18). Rental companies may set higher ages."),
                                ("Do I need an ID to rent a boat?", "Most rental companies ask for an official ID and a cash deposit at check-in — for example Bootsvermietung Enge.")],
    "kitesurfing-switzerland": [("Is kitesurfing allowed in Switzerland?", "Yes, since 15 February 2016, unless a canton restricts it. Kiting is only allowed by day and in clear visibility, and liability insurance of at least CHF 750,000 is mandatory."),
                                ("Can I kite on Lake Zurich?", "On parts of Lake Zurich, yes — not in the city basin and not within 150 m of piers, bathing areas or harbour entrances; it is banned on Greifensee, Pfäffikersee and Türlersee.")],
    "diving-lake-zurich": [("Where is diving not allowed on Lake Zurich?", "Not in shipping lanes, narrow channels, harbour entrances, near official moorings or within 100 m of passenger-ship piers (Kanton Zürich)."),
                           ("Are Swiss lakes altitude dives?", "Most Swiss lakes lie above 300 m, so plan them as altitude dives and set your dive computer accordingly.")],
}
made = []
for slug, title, h1, desc, f in PAGES:
    items = [d for d in DIR if f(d)]
    if len(items) < 2:
        continue
    url = f"{SITE}/{slug}.html"
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "WebPage", "name": title, "url": url, "description": desc, "dateModified": TODAY, "isPartOf": {"@id": SITE + "/#website"}},
        {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "DipMapper", "item": SITE + "/"}, {"@type": "ListItem", "position": 2, "name": "Water-sports guides", "item": SITE + "/activities.html"}, {"@type": "ListItem", "position": 3, "name": h1, "item": url}]},
        {"@type": "ItemList", "name": h1, "numberOfItems": len(items), "itemListElement": [{"@type": "ListItem", "position": i + 1, "item": place_ld(d)} for i, d in enumerate(items)]}]}
    faq = FAQ.get(slug, [])
    lede = f"{len(items)} verified places for {h1.lower().replace(' on lake zurich','').replace(' in switzerland','')} — every price, opening time and contact below comes from the operator’s or an authority’s published page and was checked on 10 October 2026."
    body = (f'<body><div class="wrap"><header><nav><a href="/">DipMapper</a> › <a href="/activities.html">Water-sports guides</a> › {esc(h1)}</nav></header>\n<h1>{esc(h1)}</h1>\n<p class="lede">{esc(lede)}</p>\n'
            f'<p><a class="cta" href="{SITE}/?act={MODEACT.get(items[0]["acts"][0], "paddle")}">Live wind, water &amp; opening hours →</a></p>\n<section>'
            + "".join(card(d, i) for i, d in enumerate(items)) + "</section>\n"
            + (('<section class="faq"><h2>Good to know</h2>' + "".join(f"<h3>{esc(q)}</h3><p>{esc(a)}</p>" for q, a in faq) + "</section>") if faq else "")
            + '<h2>More water-sports guides</h2><p>' + " · ".join(f'<a href="/{s}.html">{esc(h)}</a>' for s, t, h, ds, ff in PAGES if s != slug) + ' · <a href="/swim.html">Swim guides</a></p>'
            + '<footer>Prices, hours and rules come from the operators’ and authorities’ own pages and can change — always confirm when booking. Live conditions, water temperature and opening status are in the <a href="/">DipMapper app</a>.<br>Last checked ' + TODAY + '. &copy; DipMapper.com · <a href="/imprint.html">Imprint</a> · <a href="/privacy.html">Privacy</a></footer></div></body></html>')
    open(os.path.join(out, slug + ".html"), "w", encoding="utf-8").write(head(title, desc, url, ld) + "\n" + body)
    made.append((slug, h1, len(items), desc))
# ---------- 2b. unique water experiences (v23.4), from the researched specials list ----------
SPF = sys.argv[4] if len(sys.argv) > 4 else None
if SPF and os.path.exists(SPF):
    SP = json.load(open(SPF))
    CATS = [("wave", "Surf waves in the city and on rivers"), ("floating", "Floating pools and harbour baths"), ("river", "River swimming in the city"), ("rooftop", "Rooftop pools"), ("sauna", "Saunas on the water"), ("thermal", "Thermal waters"), ("nature", "Iconic natural swims"), ("deep", "Deep and wreck dives"), ("boat", "Iconic boat trips"), ("night", "Sunset and night outings")]
    slug = "unique-water-experiences"
    title = "Unique Water Experiences — City Surf Waves, Floating Pools, Sauna Boats & More (2026)"
    h1 = "Unique water experiences"
    desc = "Standing city surf waves, floating harbour baths, river swims, rooftop pools, sauna boats and thermal waters in Europe and beyond — what makes each special, how to get there and what to know."
    url = f"{SITE}/{slug}.html"
    def spcard(x):
        live = SITE + "/?" + urllib.parse.urlencode({"lat": round(x["lat"], 5), "lon": round(x["lon"], 5), "name": x["n"], "act": "special"})
        dl = [(k, x[f]) for k, f in (("Where", "city"), ("Season", "season"), ("Access", "access"), ("Getting there", "tip")) if x.get(f)]
        src = x.get("src") or ["", ""]
        more = [m for m in (x.get("more") or []) if isinstance(m, list) and len(m) == 2]
        links = [f'<a href="{esc(live)}">Live conditions in DipMapper</a>'] + ([f'<a href="{esc(x["web"])}" rel="noopener nofollow" target="_blank">Official website</a>'] if x.get("web") else []) + ([f'<a href="{esc(x["wiki"])}" rel="noopener" target="_blank">Wikipedia</a>'] if x.get("wiki") else [])
        return (f'<article class="spot" id="{esc(x.get("id") or re.sub("[^a-z0-9]+", "-", x["n"].lower()))}">\n<h2>{esc(x["n"])}</h2>\n<div class="kind">{esc(x.get("city", ""))}{(" · " + esc(x["cc"])) if x.get("cc") else ""}</div>\n'
                + (f'<p>{esc(x["about"])}</p>' if x.get("about") else f'<p>{esc(x.get("what", ""))}</p>')
                + (f'<p><b>Good to know:</b> {esc(x["warn"])}</p>' if x.get("warn") else "")
                + "<dl>" + "".join(f"<dt>{esc(k)}</dt><dd>{esc(v)}</dd>" for k, v in dl) + "</dl>"
                + f'<div class="links">{"".join(links)}</div>\n<p class="src">Sources: <a href="{esc(src[1])}" rel="noopener nofollow" target="_blank">{esc(src[0])}</a>' + "".join(f' · <a href="{esc(m[1])}" rel="noopener nofollow" target="_blank">{esc(m[0])}</a>' for m in more[:3]) + f' · checked {TODAY}</p></article>\n')
    secs = ""
    n = 0
    for k, lbl in CATS:
        L = [x for x in SP if x.get("cat") == k and x.get("src")]
        if not L:
            continue
        n += len(L)
        secs += f'<section><h2 class="cat">{esc(lbl)}</h2>' + "".join(spcard(x) for x in L) + "</section>\n"
    ld = {"@context": "https://schema.org", "@graph": [{"@type": "WebPage", "name": title, "url": url, "description": desc, "dateModified": TODAY, "isPartOf": {"@id": SITE + "/#website"}},
          {"@type": "ItemList", "name": h1, "numberOfItems": n, "itemListElement": [{"@type": "ListItem", "position": i + 1, "item": {"@type": "TouristAttraction", "name": x["n"], "description": x.get("what", ""), "geo": {"@type": "GeoCoordinates", "latitude": x["lat"], "longitude": x["lon"]}, **({"url": x["web"]} if x.get("web") else {})}} for i, x in enumerate([x for x in SP if x.get("src")])]}]}
    body = ('<body><style>h2.cat{margin:38px 0 10px;font-size:25px;padding-bottom:6px;border-bottom:2px solid var(--line)}</style>' f'<div class="wrap"><header><nav><a href="/">DipMapper</a> › <a href="/activities.html">Water-sports guides</a> › {esc(h1)}</nav></header>\n<h1>{esc(h1)}</h1>\n'
            f'<p class="lede">{n} places where water does something you will remember: surf waves in the middle of cities, pools floating on rivers and harbours, rooftop swims, sauna boats and hot springs. Every entry was researched from the operator, the city or an encyclopedia and carries its sources; statuses were checked on 10 October 2026.</p>\n'
            f'<p><a class="cta" href="{SITE}/?act=special">Open the Specials map →</a></p>\n' + secs
            + '<h2>More water-sports guides</h2><p>' + " · ".join(f'<a href="/{s2}.html">{esc(h2)}</a>' for s2, h2, n2, d2 in made) + ' · <a href="/swim.html">Swim guides</a></p>'
            + '<footer>Rules, seasons and opening can change — always check the operator or the city before you go. Live conditions are in the <a href="/">DipMapper app</a>.<br>&copy; DipMapper.com · <a href="/imprint.html">Imprint</a> · <a href="/privacy.html">Privacy</a></footer></div></body></html>')
    open(os.path.join(out, slug + ".html"), "w", encoding="utf-8").write(head(title, desc, url, ld) + "\n" + body)
    made.append((slug, h1, n, desc))
# hub
url = SITE + "/activities.html"
title = "Water-Sports Guides — SUP, Boats, Sailing, Diving & Surfing | DipMapper"
desc = "Verified water-sports guides with prices, opening hours and contacts: SUP, boat rental, sailing, diving, surfing and kitesurfing."
ld = {"@context": "https://schema.org", "@type": "CollectionPage", "name": title, "url": url, "hasPart": [{"@type": "WebPage", "name": h, "url": f"{SITE}/{s}.html"} for s, h, n, d in made]}
items = "".join(f'<li><a href="/{s}.html">{esc(h)}<span>{n} verified places</span></a></li>' for s, h, n, d in made)
body = (f'<body><div class="wrap"><header><nav><a href="/">DipMapper</a> › Water-sports guides</nav></header><h1>Water-sports guides</h1><p class="lede">Hand-checked places to paddle, sail, dive and surf — with prices, opening hours, contacts and the local rules. The live map adds wind, water temperature and a “good right now?” verdict.</p>'
        f'<p><a class="cta" href="/?act=paddle">Open the live map →</a></p><ul class="cities">{items}</ul><h2>Swimming</h2><p><a href="/swim.html">Swim guides</a> for Zürich, Meilen, Rhodes, Miami, Rostock and Palma.</p>'
        '<footer>&copy; DipMapper.com · <a href="/imprint.html">Imprint</a> · <a href="/privacy.html">Privacy</a></footer></div></body></html>')
open(os.path.join(out, "activities.html"), "w", encoding="utf-8").write(head(title, desc, url, ld) + "\n" + body)
# ---------- 3. sitemap ----------
pages = [("", "daily", "1.0"), ("activities.html", "weekly", "0.9"), ("swim.html", "weekly", "0.9")]
pages += [(s + ".html", "weekly", "0.8") for s, h, n, d in made]
pages += [(c + ".html", "weekly", "0.8") for c in CITY]
pages += [(p, "yearly", "0.3") for p in ["safety.html", "sources.html", "advertising.html", "privacy.html", "imprint.html", "terms.html", "cookies.html", "disclaimer.html"] if os.path.exists(os.path.join(web, p))]
sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "".join(f"  <url><loc>{SITE}/{p}</loc><lastmod>{TODAY}</lastmod><changefreq>{f}</changefreq><priority>{pr}</priority></url>\n" for p, f, pr in pages) + "</urlset>\n"
open(os.path.join(out, "sitemap.xml"), "w").write(sm)
print("fixed", sorted(fixed), "pages", [m[0] for m in made], "sitemap urls", len(pages))
