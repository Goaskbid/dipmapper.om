"""DipMapper data collector v2 (GitHub Actions). Finds (1) real map positions for picks that only have an area/country centre,
(2) candidate piers / harbours / marinas for trips whose operator sets the departure point, (3) phone and e-mail published on the
provider's own website (home page + up to 3 contact/about/booking pages). Results are CANDIDATES with their source; DipMapper
reviews them before anything is published. Respects Nominatim's usage policy (max 1 request/second, identifying User-Agent)."""
import json, re, ssl, time, html, urllib.request, urllib.parse, concurrent.futures
from math import radians, sin, cos, asin, sqrt
UA = 'DipMapper-data-collector/2.0 (+https://dipmapper.com)'
BUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
ctx = ssl.create_default_context()
def get(u, ua=UA, t=25):
    r = urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': ua, 'Accept-Language': 'en'}), timeout=t, context=ctx)
    return r.read(2_000_000).decode('utf8', 'ignore'), r.geturl()
def km(a, b, c, d):
    x = sin(radians(c - a) / 2); y = sin(radians(d - b) / 2); return 12742 * asin(sqrt(x * x + cos(radians(a)) * cos(radians(c)) * y * y))
_last = [0.0]
def nom(q, extra=''):
    w = 1.1 - (time.time() - _last[0])
    if w > 0: time.sleep(w)
    _last[0] = time.time()
    try:
        return json.loads(get('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&addressdetails=0&extratags=0&q=' + urllib.parse.quote(q) + extra)[0])
    except Exception as e:
        return []
GENERIC = r'\b(diving|dive|snorkelling|snorkeling|snorkel|tour|tours|trip|excursion|day|boat|cruise|kayaking|kayak|watching|whale|whales|reef|and|seasonal|scenic|experience|expedition|swim|swimming|discovery|outing|feeding|season|shore-based|safari|crossing|journey)\b'
P = json.load(open('picks.json', encoding='utf8'))
out = {'collected_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), 'positions': {}, 'piers': {}, 'contacts': {}, 'attribution': 'Positions and piers: © OpenStreetMap contributors (ODbL) via Nominatim; Wikipedia (CC BY-SA). Contacts: the providers\' own websites.'}
# 1) positions
for p in P:
    if p.get('x') not in (1, 2) or p.get('la') is None: continue
    core = re.sub(r'\s+', ' ', re.sub(GENERIC, ' ', p['n'], flags=re.I)).strip(' ,-')
    hits = []
    for q in [core + ', ' + p['c'], p['n'] + ', ' + p['c'], (p.get('ar') or '') + ', ' + p['c']]:
        if not q.strip(', '): continue
        for r in nom(q):
            try: la, lo = float(r['lat']), float(r['lon'])
            except Exception: continue
            hits.append({'q': q, 'name': r.get('name') or r.get('display_name', '')[:80], 'display': r.get('display_name', '')[:200], 'cls': r.get('category') or r.get('class'), 'type': r.get('type'), 'la': round(la, 5), 'lo': round(lo, 5), 'km_from_old': round(km(p['la'], p['lo'], la, lo)), 'osm': '%s/%s' % (r.get('osm_type'), r.get('osm_id'))})
        if hits: break
    out['positions'][p['id']] = hits[:5]
# 2) piers for trips with an operator-set departure (place text in picks.json "g")
seen = {}
for p in P:
    g = p.get('g') or ''
    if not g or p.get('gl') not in ('Starts from', 'Area'): continue
    if g not in seen:
        cand = []
        for kind in ['pier', 'harbour', 'marina', 'port']:
            for r in nom(g.split(',')[0] + ' ' + kind + ', ' + p['c']):
                c = r.get('category') or r.get('class'); t = r.get('type')
                if (c, t) in (('man_made', 'pier'), ('amenity', 'ferry_terminal'), ('leisure', 'marina'), ('landuse', 'harbour'), ('harbour', 'yes'), ('waterway', 'dock'), ('man_made', 'breakwater'), ('place', 'locality')) or c in ('harbour',) or 'pier' in (r.get('name') or '').lower() or 'port' in (r.get('name') or '').lower():
                    cand.append({'kind': kind, 'name': r.get('name') or '', 'display': r.get('display_name', '')[:200], 'cls': c, 'type': t, 'la': round(float(r['lat']), 5), 'lo': round(float(r['lon']), 5), 'osm': '%s/%s' % (r.get('osm_type'), r.get('osm_id'))})
            if len(cand) >= 3: break
        seen[g] = cand
    out['piers'][p['id']] = {'place': g, 'candidates': [dict(c, km_from_pick=round(km(p['la'], p['lo'], c['la'], c['lo']))) for c in seen[g]][:4]}
# 3) contacts, deeper crawl
TEL = re.compile(r'href=["\']tel:([^"\']+)["\']', re.I); MAIL = re.compile(r'href=["\']mailto:([^"\'?]+)', re.I)
LD = re.compile(r'"(telephone|email)"\s*:\s*"([^"]{5,80})"', re.I)
LINK = re.compile(r'<a[^>]+href=["\']([^"\'#]+)["\'][^>]*>(.*?)</a>', re.I | re.S)
KEY = re.compile(r'contact|kontakt|contatti|contacto|impressum|imprint|about|booking|book|reserv|info', re.I)
def contacts(p):
    res = {'tel': [], 'mail': [], 'src': []}
    try: h, final = get(p['u'], BUA)
    except Exception as e: return p['id'], {'error': type(e).__name__}
    host = urllib.parse.urlsplit(final).netloc; pages = [(final, h)]; urls = []
    for href, txt in LINK.findall(h):
        u = urllib.parse.urljoin(final, html.unescape(href))
        if urllib.parse.urlsplit(u).netloc == host and (KEY.search(href) or KEY.search(re.sub('<[^>]+>', '', txt))) and u not in urls and u != final: urls.append(u)
    for u in urls[:3]:
        try: pages.append((u, get(u, BUA)[0]))
        except Exception: pass
    for u, h in pages:
        f = False
        for t in TEL.findall(h):
            t = urllib.parse.unquote(html.unescape(t)).strip()
            if 7 <= len(re.sub(r'\D', '', t)) <= 15 and t not in res['tel']: res['tel'].append(t); f = True
        for e in MAIL.findall(h):
            e = urllib.parse.unquote(html.unescape(e)).strip()
            if re.fullmatch(r'[^@\s]+@[^@\s]+\.[a-z]{2,}', e, re.I) and e.lower() not in [x.lower() for x in res['mail']]: res['mail'].append(e); f = True
        for k, v in LD.findall(h):
            v = html.unescape(v).strip()
            if k.lower() == 'telephone' and 7 <= len(re.sub(r'\D', '', v)) <= 15 and v not in res['tel']: res['tel'].append(v); f = True
            if k.lower() == 'email' and '@' in v and v not in res['mail']: res['mail'].append(v); f = True
        if f: res['src'].append(u)
    res['tel'] = res['tel'][:3]; res['mail'] = res['mail'][:3]
    return p['id'], res
need = [p for p in P if p.get('u') and not (p.get('p') and p.get('e'))]
with concurrent.futures.ThreadPoolExecutor(10) as ex:
    for pid, r in ex.map(contacts, need): out['contacts'][pid] = r
json.dump(out, open('data-collect2.json', 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print('positions', sum(1 for v in out['positions'].values() if v), '/', len(out['positions']), '| piers', sum(1 for v in out['piers'].values() if v['candidates']), '/', len(out['piers']), '| contacts', sum(1 for v in out['contacts'].values() if v.get('tel') or v.get('mail')), '/', len(need))
