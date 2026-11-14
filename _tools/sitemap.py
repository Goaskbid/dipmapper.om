"""DipMapper sitemap generator + validator. Runs after every production deployment (GitHub Actions) and in the local build.
Rules: only canonical, public, indexable pages; new pages added, deleted/redirected/noindex removed; lastmod changes only when the
page's visible content or structure changes (scripts, styles, version stamps and 'updated' dates are ignored); robots.txt must reference it."""
import os, re, sys, json, hashlib, datetime, xml.etree.ElementTree as ET
ROOT = sys.argv[1] if len(sys.argv) > 1 else '.'
BASE = 'https://dipmapper.com'
SM = os.path.join(ROOT, 'sitemap.xml'); RB = os.path.join(ROOT, 'robots.txt'); ST = os.path.join(ROOT, '_tools', 'sitemap-state.json')
TODAY = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d')
NS = '{http://www.sitemaps.org/schemas/sitemap/0.9}'
old = {}
if os.path.exists(SM):
    try:
        for u in ET.parse(SM).getroot().iter(NS + 'url'):
            old[u.findtext(NS + 'loc').strip()] = {k: (u.findtext(NS + k) or '').strip() for k in ('lastmod', 'changefreq', 'priority')}
    except ET.ParseError:
        pass
state = json.load(open(ST)) if os.path.exists(ST) else {}
def sig(h):
    b = re.search(r'<body[^>]*>(.*)</body>', h, re.S | re.I); h = b.group(1) if b else h
    h = re.sub(r'<(script|style|noscript|svg)\b.*?</\1>', ' ', h, flags=re.S | re.I)
    struct = ' '.join(re.findall(r'<(h[1-4]|li|a|img|section|article|table)\b', h, re.I))
    t = re.sub(r'<[^>]+>', ' ', h); t = re.sub(r'&[a-z#0-9]+;', ' ', t)
    t = re.sub(r'\b(v|version )?\d+\.\d+\.\d+\b', ' ', t, flags=re.I)
    t = re.sub(r'\bUpdated\s+\d{1,2}\s+\w+\s+\d{4}\b', ' ', t)
    t = re.sub(r'\s+', ' ', t).strip()
    return hashlib.sha256((t + '|' + struct).encode('utf8')).hexdigest()[:20]
def meta(h, name):
    m = re.search(r'<meta[^>]+name=["\']%s["\'][^>]*content=["\']([^"\']*)' % name, h, re.I) or re.search(r'<meta[^>]+content=["\']([^"\']*)["\'][^>]*name=["\']%s["\']' % name, h, re.I)
    return (m.group(1) if m else '').lower()
pages, skipped = {}, []
for f in sorted(os.listdir(ROOT)):
    if not f.endswith('.html'): continue
    p = os.path.join(ROOT, f); h = open(p, encoding='utf8', errors='ignore').read()
    why = None
    if f == '404.html' or re.fullmatch(r'google[0-9a-f]+\.html', f): why = 'system page'
    elif 'noindex' in meta(h, 'robots') or 'noindex' in meta(h, 'googlebot'): why = 'noindex'
    elif re.search(r'<meta[^>]+http-equiv=["\']refresh', h, re.I): why = 'redirect'
    else:
        m = re.search(r'<link[^>]+rel=["\']canonical["\'][^>]*href=["\']([^"\']+)', h, re.I) or re.search(r'<link[^>]+href=["\']([^"\']+)["\'][^>]*rel=["\']canonical', h, re.I)
        if not m: why = 'no canonical'
        else:
            c = m.group(1).strip(); stem = f[:-5]
            own = {BASE + '/' + f, BASE + '/' + stem} | ({BASE + '/', BASE} if f == 'index.html' else set())
            if c not in own: why = 'canonical points elsewhere: ' + c
            elif c in pages: why = 'duplicate of ' + c
            else: pages[c if c != BASE else BASE + '/'] = (f, sig(h))
    if why: skipped.append((f, why))
newstate, urls = {}, []
for loc in sorted(pages, key=lambda u: (u != BASE + '/', u)):
    f, s = pages[loc]; prev = state.get(loc); o = old.get(loc, {})
    if prev and prev.get('sig') == s: lm = prev['lastmod']
    elif not prev and o.get('lastmod'): lm = o['lastmod']   # first run: keep the published lastmod
    else: lm = TODAY
    newstate[loc] = {'file': f, 'sig': s, 'lastmod': lm}
    urls.append((loc, lm, o.get('changefreq') or ('daily' if loc == BASE + '/' else 'weekly'), o.get('priority') or ('1.0' if loc == BASE + '/' else '0.7')))
xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for loc, lm, cf, pr in urls:
    xml.append('  <url><loc>%s</loc><lastmod>%s</lastmod><changefreq>%s</changefreq><priority>%s</priority></url>' % (loc.replace('&', '&amp;'), lm, cf, pr))
xml.append('</urlset>'); body = '\n'.join(xml) + '\n'
# ---- validation (fails the job, nothing is written) ----
err = []
try:
    r = ET.fromstring(body.encode('utf8'))
    locs = [u.findtext(NS + 'loc') for u in r.iter(NS + 'url')]
except ET.ParseError as e:
    err.append('XML not well-formed: %s' % e); locs = []
if not locs: err.append('sitemap would be empty')
if len(locs) != len(set(locs)): err.append('duplicate URLs')
if len(locs) > 50000 or len(body.encode('utf8')) > 50 * 1024 * 1024: err.append('sitemap too large')
for l in locs:
    if not l.startswith(BASE + '/'): err.append('foreign URL ' + l)
for loc, lm, cf, pr in urls:
    if not re.fullmatch(r'\d{4}-\d{2}-\d{2}', lm) or lm > TODAY: err.append('bad lastmod %s %s' % (loc, lm))
if BASE + '/' not in locs: err.append('home page missing')
if err:
    print('SITEMAP INVALID:\n  ' + '\n  '.join(err)); sys.exit(1)
os.makedirs(os.path.dirname(ST), exist_ok=True)
changed = (open(SM, encoding='utf8').read() if os.path.exists(SM) else '') != body
open(SM, 'w', encoding='utf8').write(body)
json.dump(newstate, open(ST, 'w', encoding='utf8'), indent=1, sort_keys=True)
rb = open(RB, encoding='utf8').read() if os.path.exists(RB) else 'User-agent: *\nAllow: /\n'
line = 'Sitemap: ' + BASE + '/sitemap.xml'
if line not in rb:
    rb = re.sub(r'(?im)^Sitemap:.*\n?', '', rb).rstrip('\n') + '\n\n' + line + '\n'; open(RB, 'w', encoding='utf8').write(rb)
added = sorted(set(locs) - set(old)); removed = sorted(set(old) - set(locs))
print('sitemap ok: %d URLs, %d added, %d removed, %d lastmod updated today%s' % (len(locs), len(added), len(removed), sum(1 for u in urls if u[1] == TODAY), '' if changed else ' (no change)'))
for a in added: print('  + ' + a)
for a in removed: print('  - ' + a)
for f, w in skipped: print('  skipped %s: %s' % (f, w))
