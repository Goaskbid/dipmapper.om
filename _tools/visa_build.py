#!/usr/bin/env python3
"""Build /visa/ entry-requirement files from the Passport Index Data (MIT, github.com/imorte/passport-index-data)
plus DipMapper's checked official rules (_tools/visa-steps.json), which take precedence.
Usage: visa_build.py CSV STEPS_JSON OUT_DIR"""
import csv, json, os, sys, time
CSV, STEPS, OUT = sys.argv[1], sys.argv[2], sys.argv[3]
S = json.load(open(STEPS, encoding='utf8'))
CODE = {'visa free': 'vf', 'visa on arrival': 'voa', 'eta': 'eta', 'e-visa': 'ev', 'visa required': 'vr', 'no admission': 'na', '-1': 'own'}
def enc(v):
    v = (v or '').strip().lower()
    if v.isdigit(): return ['vf', int(v)]
    return [CODE.get(v, 'unk'), None]
M = {}
rows = list(csv.DictReader(open(CSV, encoding='utf8')))
if len(rows) < 30000: sys.exit('dataset too small: %d rows' % len(rows))
for r in rows:
    p, d = r['Passport'].upper(), r['Destination'].upper()
    M.setdefault(d, {})[p] = enc(r['Requirement'])
for d, ov in S.get('overrides', {}).items():
    if d not in M: continue
    for p, v in M[d].items():
        if ov.get('map60to') and v == ['vf', 60]: M[d][p] = ['vf', ov['map60to']]
    for p, v in ov.get('set', {}).items():
        if p in M[d]: M[d][p] = enc(v)
os.makedirs(OUT, exist_ok=True)
for f in os.listdir(OUT):
    if f.startswith(('d-', 'p-')) and f.endswith('.json'): os.remove(os.path.join(OUT, f))
sch = set(S['schengen'])
for d, ps in M.items():
    info = S['dest'].get(d) or {}
    if d in sch:
        base = S['dest']['_SCHENGEN']; info = {'official': (info.get('official') or []) + base['official'], 'steps': (info.get('steps') or []) + base['steps'], 'facts': ' '.join(x for x in (info.get('facts'), base.get('facts')) if x)}
    json.dump({'d': d, 'r': ps, 'info': info, 'note': S.get('overrides', {}).get(d, {}).get('note')}, open(os.path.join(OUT, 'd-%s.json' % d.lower()), 'w', encoding='utf8'), ensure_ascii=False, separators=(',', ':'))
P = {}
for d, ps in M.items():
    for p, v in ps.items(): P.setdefault(p, {})[d] = v
for p, ds in P.items():
    json.dump(ds, open(os.path.join(OUT, 'p-%s.json' % p.lower()), 'w', encoding='utf8'), separators=(',', ':'))
json.dump({'updated': time.strftime('%Y-%m-%d'), 'checked': S.get('checked'), 'passports': sorted(P), 'destinations': sorted(M), 'eu': S['eu_eea_ch'], 'schengen': S['schengen'],
           'source': 'Passport Index Data (MIT licence, github.com/imorte/passport-index-data) plus official government sources checked by DipMapper'},
          open(os.path.join(OUT, 'index.json'), 'w'), indent=0)
print('visa files', len(M), 'destinations', len(P), 'passports')
