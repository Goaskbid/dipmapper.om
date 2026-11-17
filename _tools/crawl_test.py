#!/usr/bin/env python3
"""DipMapper post-deploy crawl test (SEO brief 0.9). Usage: crawl_test.py SITE_DIR [out.csv]
Reads sitemap index/sub-sitemaps, checks every listed URL's file plus all indexable pages, writes CSV (url, issue, severity, detail).
P0 = blocks indexing / duplicate / broken; P1 = visible quality; P2 = polish. Exit code 1 if any P0."""
import os, re, sys, csv, html, json, collections, xml.etree.ElementTree as ET
ROOT = sys.argv[1]; OUTCSV = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, '..', 'crawl-test.csv')
BASE = 'https://dipmapper.com'; NS = '{http://www.sitemaps.org/schemas/sitemap/0.9}'
issues = []
def N(u): return u if u == BASE + '/' else re.sub(r'\.html$', '', u.rstrip('/'))
def add(u, i, sev, d=''): issues.append((u, i, sev, str(d)[:300]))
def path_of(url):
    p = url[len(BASE):] or '/'
    if p == '/': return os.path.join(ROOT, 'index.html')
    p = p.strip('/')
    for c in (p, p + '.html', os.path.join(p, 'index.html')):
        f = os.path.join(ROOT, c)
        if os.path.isfile(f): return f
    return None
# sitemaps
sm_urls = []
def read_sm(f):
    if not os.path.exists(f): add(f, 'sitemap-missing', 'P0'); return
    r = ET.parse(f).getroot()
    if r.tag == NS + 'sitemapindex':
        for s in r.iter(NS + 'loc'): read_sm(os.path.join(ROOT, s.text.strip()[len(BASE) + 1:]))
    else:
        locs = [u.text.strip() for u in r.iter(NS + 'loc')]
        if len(locs) > 50000 or os.path.getsize(f) > 50e6: add(f, 'sitemap-too-big', 'P0', len(locs))
        sm_urls.extend(locs)
read_sm(os.path.join(ROOT, 'sitemap.xml'))
rb = open(os.path.join(ROOT, 'robots.txt')).read() if os.path.exists(os.path.join(ROOT, 'robots.txt')) else ''
if 'Sitemap: ' + BASE + '/sitemap.xml' not in rb: add('/robots.txt', 'robots-no-sitemap', 'P1')
dup = [u for u, c in collections.Counter(sm_urls).items() if c > 1]
for u in dup: add(u, 'sitemap-duplicate', 'P0')
def text_of(h):
    b = re.search(r'<body[^>]*>(.*)</body>', h, re.S | re.I); b = b.group(1) if b else h
    b = re.sub(r'<(script|style|noscript|svg|template)\b.*?</\1>', ' ', b, flags=re.S | re.I)
    b = re.sub(r'<(header|footer|nav)\b.*?</\1>', ' ', b, flags=re.S | re.I)
    return html.unescape(re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', b))).strip()
def meta(h, k, attr='name'):
    m = re.search(r'<meta[^>]+%s=["\']%s["\'][^>]*content=["\']([^"\']*)' % (attr, re.escape(k)), h, re.I)
    return html.unescape(m.group(1)) if m else None
pages = {}  # url -> (file, html)
for f in sorted(os.listdir(ROOT)):
    if f.endswith('.html'):
        pages[BASE + '/' + (f[:-5] if f != 'index.html' else '')] = os.path.join(ROOT, f)
for r, ds, fs in os.walk(ROOT):
    if r == ROOT or '/.' in r or '/_tools' in r or '/vendor' in r: continue
    for f in fs:
        if f == 'index.html': pages[BASE + '/' + os.path.relpath(r, ROOT).replace(os.sep, '/') + '/'] = os.path.join(r, f)
inbound = collections.Counter(); titles = collections.defaultdict(list); descs = collections.defaultdict(list); bodies = {}
indexable = {}
for u, f in pages.items():
    h = open(f, encoding='utf8', errors='ignore').read()
    rob = (meta(h, 'robots') or '').lower()
    canon = re.findall(r'<link[^>]+rel=["\']canonical["\'][^>]*href=["\']([^"\']+)', h, re.I)
    if 'noindex' in rob or re.search(r'http-equiv=["\']refresh', h, re.I) or os.path.basename(f) == '404.html' or re.match(r'google[0-9a-f]+\.html', os.path.basename(f)):
        continue
    indexable[u] = h
    if len(canon) != 1: add(u, 'canonical-count', 'P0', len(canon)); continue
    c = canon[0]
    if c.rstrip('/') != u.rstrip('/'): add(u, 'canonical-not-extensionless', 'P1', c)
    if c not in sm_urls and u not in sm_urls: add(u, 'indexable-not-in-sitemap', 'P1')
for u in sm_urls:
    f = path_of(u)
    if not f: add(u, 'sitemap-url-missing-file', 'P0'); continue
    h = open(f, encoding='utf8', errors='ignore').read()
    if 'noindex' in (meta(h, 'robots') or '').lower(): add(u, 'sitemap-url-noindex', 'P0')
JUNK = re.compile(r'SOURCE_|\bTODO\b|SEO build|internal:|\bundefined\b(?! wild)|\bNaN\b|Enable JavaScript|Loading details', re.I)
for u, h in indexable.items():
    t = re.search(r'<title>([^<]*)</title>', h, re.I); t = html.unescape(t.group(1)).strip() if t else ''
    d = meta(h, 'description') or ''
    if not t: add(u, 'title-missing', 'P0')
    elif len(t) > 60: add(u, 'title-over-60', 'P1', '%d: %s' % (len(t), t))
    if re.search(r'\b20\d\d\b', t): add(u, 'title-has-year', 'P2', t)
    if not d: add(u, 'description-missing', 'P0')
    else:
        if not 70 <= len(d) <= 155: add(u, 'description-length', 'P1', '%d: %s' % (len(d), d))
        if not d.rstrip().endswith(('.', '!', '?')): add(u, 'description-no-full-stop', 'P1', d[-60:])
    titles[t].append(u); descs[d].append(u)
    ogt = meta(h, 'og:title', 'property')
    if ogt is not None and ogt.strip() != t.strip(): add(u, 'og-title-differs', 'P2', ogt)
    if (meta(h, 'og:locale', 'property') or 'en_US') not in ('en_US', 'en_GB'): add(u, 'og-locale', 'P2', meta(h, 'og:locale', 'property'))
    if len(re.findall(r'<h1\b', h, re.I)) != 1: add(u, 'h1-count', 'P1', len(re.findall(r'<h1\b', h, re.I)))
    body = text_of(h); bodies[u] = body
    m = JUNK.search(body)
    if m: add(u, 'junk-visible-text', 'P1', body[max(0, m.start() - 60):m.end() + 60])
    for href in re.findall(r'<a\b[^>]*href=["\']([^"\']+)', h, re.I):
        if re.search(r'#/|#read|#lesson|\?life=', href): add(u, 'hash-route-link', 'P1', href)
        if href.startswith('/') and not href.startswith('//'):
            tgt = BASE + re.sub(r'\.html$', '', href.split('#')[0].split('?')[0]).rstrip('/') if href.split('#')[0] not in ('/', '') else BASE + '/'
            inbound[tgt] += 1
        elif href.startswith('http'):
            hp = html.unescape(href).split('?')[0]
            if ' ' in href or '%20' in hp or ';' in hp or 'copy:' in href: add(u, 'bad-external-url', 'P1', href)
for t, us in titles.items():
    if t and len(us) > 1: add(us[0], 'duplicate-title', 'P0', '%d pages: %s' % (len(us), t))
for d, us in descs.items():
    if d and len(us) > 1: add(us[0], 'duplicate-description', 'P1', '%d pages: %s' % (len(us), d[:80]))
for u in sm_urls:
    k = N(u)
    if u != BASE + '/' and inbound[k] < 3: add(u, 'orphan-under-3-inbound', 'P1', inbound[k])
# thin + near-duplicate (word 5-shingles, Jaccard) among sitemap pages
def sh(t):
    w = re.findall(r'[a-z0-9äöüéèàç]+', t.lower()); return set(' '.join(w[i:i + 5]) for i in range(max(0, len(w) - 4)))
S = {u: sh(bodies.get(N(u), '')) for u in sm_urls}
for u in sm_urls:
    b = bodies.get(N(u), '')
    if len(set(re.findall(r'[A-Za-z]{3,}', b))) < 150: add(u, 'thin-under-150-unique-words', 'P1', len(set(re.findall(r'[A-Za-z]{3,}', b))))
groups = collections.defaultdict(list)
for u in sm_urls: groups[re.sub(r'[-/][^-/]*$', '', u[len(BASE):])].append(u)
for g, us in groups.items():
    for i in range(len(us)):
        for j in range(i + 1, len(us)):
            a, b = S[us[i]], S[us[j]]
            if a and b and len(a & b) / len(a | b) > 0.85: add(us[j], 'near-duplicate', 'P1', us[i])
with open(OUTCSV, 'w', newline='') as fh:
    w = csv.writer(fh); w.writerow(['url', 'issue', 'severity', 'detail']); w.writerows(issues)
c = collections.Counter((s, i) for _, i, s, _ in issues)
print('sitemap urls', len(sm_urls), '| indexable pages', len(indexable), '| issues', len(issues))
for (s, i), n in sorted(c.items()): print(' ', s, i, n)
sys.exit(1 if any(s == 'P0' for _, _, s, _ in issues) else 0)
