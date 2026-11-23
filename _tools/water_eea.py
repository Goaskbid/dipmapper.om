#!/usr/bin/env python3
"""DipMapper official bathing-water quality (EU Bathing Water Directive).

Source: European Environment Agency, bathing water data and coordinates from
Member States authorities. Licence CC BY 4.0. Fetched from the EEA ArcGIS REST
service that backs the EEA bathing-water viewer, then cut into small static
tiles so visitors' browsers never contact a third party.

Usage: python3 water_eea.py OUT_DIR [BASE_URL ...]
"""
import json, os, re, sys, time, urllib.parse, urllib.request

BASES = sys.argv[2:] or ['https://marine.discomap.eea.europa.eu/arcgis/rest/services',
                         'https://water.discomap.eea.europa.eu/arcgis/rest/services']
OUT = sys.argv[1] if len(sys.argv) > 1 else 'water'
UA = {'User-Agent': 'dipmapper.com water-quality sync (contact via dipmapper.com/imprint.html)'}
TILE = 2  # degrees


def get(url, params=None, tries=5):
    if params:
        url += ('&' if '?' in url else '?') + urllib.parse.urlencode(params)
    last = None
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90) as r:
                j = json.loads(r.read().decode('utf8'))
            if isinstance(j, dict) and 'error' in j:
                raise RuntimeError('service error: %s' % j['error'])
            return j
        except Exception as e:  # network hiccups: back off politely
            last = e
            time.sleep(5 * (i + 1))
    raise RuntimeError('failed %s: %s' % (url[:160], last))


def find_service():
    for base in BASES:
        try:
            j = get(base + '/BathingWater', {'f': 'json'})
        except Exception as e:
            print('folder unavailable on', base, e)
            continue
        cands = []
        for s in j.get('services', []):
            m = re.search(r'BathingWater_Dyna_WM_(\d{4})$', s.get('name', ''))
            if m and s.get('type') == 'MapServer':
                cands.append((int(m.group(1)), base + '/' + s['name'] + '/MapServer'))
        for yr, url in sorted(cands, reverse=True):
            try:
                ms = get(url, {'f': 'json'})
            except Exception as e:
                print('skip', url, e)
                continue
            lid = None
            for L in ms.get('layers', []):
                if 'point' in L.get('name', '').lower() and 'quality' in L.get('name', '').lower():
                    lid = L['id']
                    break
            if lid is None:
                continue
            return yr, url, lid
    raise RuntimeError('no BathingWater_Dyna_WM_YYYY service found')


LET = {'excellent': 'E', 'good': 'G', 'sufficient': 'S', 'poor': 'P', 'not classified': 'N'}


def letter(v, seen):
    v = (v or '').strip()
    seen[v] = seen.get(v, 0) + 1
    return LET.get(v.lower(), '-' if not v else 'N')


def main():
    try:
        yr, url, lid = find_service()
    except RuntimeError as e:
        old = os.path.join(OUT, 'index.json')
        if os.path.exists(old):
            when = time.strftime('%Y-%m-%d', time.gmtime(os.path.getmtime(old)))
            try:
                when = json.load(open(old, encoding='utf8')).get('updated') or when
            except Exception:
                pass
            print('EEA bathing-water service unreachable (%s) - the published data stays online unchanged; the next scheduled run tries again.' % e)
            return
        raise
    print('service', url, 'layer', lid, 'season', yr)
    lay = get('%s/%d' % (url, lid), {'f': 'json'})
    years = {}
    for f in lay.get('fields', []):
        if f['name'].startswith('qualityStatus') and re.fullmatch(r'\d{4}', str(f.get('alias', ''))):
            years[f['name']] = int(f['alias'])
    cols = sorted(years, key=lambda k: -years[k])[:4]
    if not cols:
        raise RuntimeError('no quality fields with year aliases')
    ids = get('%s/%d/query' % (url, lid), {'where': '1=1', 'returnIdsOnly': 'true', 'f': 'json'}).get('objectIds') or []
    print('sites listed', len(ids))
    if len(ids) < 5000:
        raise RuntimeError('implausibly few sites: %d' % len(ids))
    out = ['bathingWaterName', 'countryCode', 'bwWaterCategory', 'latitude', 'longitude', 'bwProfileLink', 'bathingWaterIdentifier'] + cols
    rows, seen = [], {}
    ids.sort()
    for i in range(0, len(ids), 400):
        j = get('%s/%d/query' % (url, lid), {'objectIds': ','.join(map(str, ids[i:i + 400])), 'outFields': ','.join(out),
                                             'returnGeometry': 'false', 'f': 'json'})
        for ft in j.get('features', []):
            a = ft.get('attributes', {})
            la, lo = a.get('latitude'), a.get('longitude')
            if la is None or lo is None or not (-90 <= la <= 90 and -180 <= lo <= 180):
                continue
            cat = (a.get('bwWaterCategory') or '').lower()
            link = a.get('bwProfileLink') or ''
            if not link.startswith('https://'):
                link = ''
            rows.append([round(la, 5), round(lo, 5), (a.get('bathingWaterName') or '').strip()[:90], (a.get('countryCode') or '')[:2],
                         'c' if 'coast' in cat or 'transit' in cat else 'r' if 'river' in cat else 'l' if 'lake' in cat else '',
                         ''.join(letter(a.get(c), seen) for c in cols), link[:300]])
        time.sleep(float(os.environ.get("WQ_SLEEP","0.4")))
    print('sites fetched', len(rows), 'values', seen)
    if len(rows) < 0.9 * len(ids):
        raise RuntimeError('only %d of %d sites fetched' % (len(rows), len(ids)))
    tiles = {}
    for r in rows:
        k = '%d_%d' % (int(r[0] // TILE * TILE), int(r[1] // TILE * TILE))
        tiles.setdefault(k, []).append(r)
    os.makedirs(OUT, exist_ok=True)
    for f in os.listdir(OUT):
        if f.startswith('w_') and f.endswith('.json'):
            os.remove(os.path.join(OUT, f))
    yl = [years[c] for c in cols]
    for k, ps in tiles.items():
        ps.sort()
        json.dump({'y': yl, 'p': ps}, open(os.path.join(OUT, 'w_%s.json' % k), 'w'), separators=(',', ':'), ensure_ascii=False)
    cnt = {}
    for r in rows:
        cnt[r[5][:1]] = cnt.get(r[5][:1], 0) + 1
    json.dump({'source': 'European Environment Agency (EEA); bathing water data and coordinates: Member States authorities',
               'licence': 'CC BY 4.0', 'service': url, 'season': yl[0], 'years': yl, 'tile_deg': TILE, 'sites': len(rows),
               'by_class': cnt, 'tiles': sorted(tiles), 'updated': time.strftime('%Y-%m-%d')},
              open(os.path.join(OUT, 'index.json'), 'w'), indent=0)
    print('tiles', len(tiles), 'by class', cnt)


if __name__ == '__main__':
    main()
