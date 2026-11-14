import json, re, ssl, time, urllib.request, urllib.parse, concurrent.futures, html
UA = 'DipMapperDataCollector/1.0 (+https://dipmapper.com; contact via site imprint)'
BUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
ctx = ssl.create_default_context()
def get(u, ua=UA, t=25):
    r = urllib.request.urlopen(urllib.request.Request(u, headers={'User-Agent': ua, 'Accept-Language': 'en'}), timeout=t, context=ctx)
    return r.read(2_000_000).decode('utf8', 'ignore'), r.geturl()
from math import radians, sin, cos, asin, sqrt
def km(a, b, c, d):
    x = sin(radians(c - a) / 2); y = sin(radians(d - b) / 2)
    return 12742 * asin(sqrt(x * x + cos(radians(a)) * cos(radians(c)) * y * y))
P = json.load(open('picks.json', encoding='utf8'))
out = {'collected_at': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()), 'positions': {}, 'contacts': {}}
# 1) positions for picks that only have a country-level or shared area centre
def pos(p):
    hits = []
    for q in [p['n'], re.sub(r'\b(diving|snorkelling|snorkeling|tour|trip|excursion|day|boat|cruise|kayaking|watching|whale|reef|and|seasonal|scenic|experience|expedition|swim|swimming)\b', ' ', p['n'], flags=re.I).strip()]:
        q = re.sub(r'\s+', ' ', q).strip()
        if not q: continue
        try:
            j = json.loads(get('https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrlimit=5&prop=coordinates|info&inprop=url&format=json&gsrsearch=' + urllib.parse.quote(q + ' ' + p['c']))[0])
        except Exception as e:
            continue
        pages = sorted((j.get('query') or {}).get('pages', {}).values(), key=lambda x: x.get('index', 99))
        for pg in pages:
            co = (pg.get('coordinates') or [None])[0]
            if not co: continue
            d = km(p['la'], p['lo'], co['lat'], co['lon'])
            hits.append({'q': q, 'title': pg['title'], 'url': pg.get('fullurl'), 'la': round(co['lat'], 5), 'lo': round(co['lon'], 5), 'km_from_old': round(d)})
        if hits: break
        time.sleep(0.3)
    return p['id'], hits[:3]
coarse = [p for p in P if p.get('x') in (1, 2) and p.get('la') is not None]
with concurrent.futures.ThreadPoolExecutor(4) as ex:
    for pid, h in ex.map(pos, coarse): out['positions'][pid] = h
# 2) phone and e-mail published on the official page (and its contact page)
TEL = re.compile(r'href=["\']tel:([^"\']+)["\']', re.I)
MAIL = re.compile(r'href=["\']mailto:([^"\'?]+)', re.I)
LD = re.compile(r'"(telephone|email)"\s*:\s*"([^"]{5,80})"', re.I)
CONTACT = re.compile(r'href=["\']([^"\']*(?:contact|kontakt|contatti|contacto|impressum|about)[^"\']*)["\']', re.I)
def contacts(p):
    res = {'tel': [], 'mail': [], 'src': []}
    urls = [p['u']]
    try:
        h, final = get(p['u'], BUA)
    except Exception as e:
        return p['id'], {'error': type(e).__name__}
    pages = [(final, h)]
    m = CONTACT.search(h)
    if m:
        cu = urllib.parse.urljoin(final, html.unescape(m.group(1)))
        if urllib.parse.urlsplit(cu).netloc == urllib.parse.urlsplit(final).netloc:
            try: pages.append((cu, get(cu, BUA)[0]))
            except Exception: pass
    for u, h in pages:
        found = False
        for t in TEL.findall(h):
            t = urllib.parse.unquote(html.unescape(t)).strip()
            if len(re.sub(r'\D', '', t)) >= 7 and t not in res['tel']: res['tel'].append(t); found = True
        for e in MAIL.findall(h):
            e = urllib.parse.unquote(html.unescape(e)).strip()
            if re.fullmatch(r'[^@\s]+@[^@\s]+\.[a-z]{2,}', e, re.I) and e.lower() not in [x.lower() for x in res['mail']]: res['mail'].append(e); found = True
        for k, v in LD.findall(h):
            v = html.unescape(v).strip()
            if k.lower() == 'telephone' and len(re.sub(r'\D', '', v)) >= 7 and v not in res['tel']: res['tel'].append(v); found = True
            if k.lower() == 'email' and '@' in v and v not in res['mail']: res['mail'].append(v); found = True
        if found: res['src'].append(u)
    res['tel'] = res['tel'][:3]; res['mail'] = res['mail'][:3]
    return p['id'], res
need = [p for p in P if p.get('u') and not (p.get('p') and p.get('e'))]
with concurrent.futures.ThreadPoolExecutor(12) as ex:
    for pid, r in ex.map(contacts, need): out['contacts'][pid] = r
json.dump(out, open('data-collect.json', 'w', encoding='utf8'), ensure_ascii=False, indent=1)
print('positions', sum(1 for v in out['positions'].values() if v), '/', len(coarse), 'contacts', sum(1 for v in out['contacts'].values() if v.get('tel') or v.get('mail')), '/', len(need))
