#!/usr/bin/env python3
"""Extract EOT20 ocean-tide constituents (amplitude m, Greenwich phase lag deg) at DipMapper points.
EOT20: Hart-Davis et al. 2021, DGFI-TUM, CC BY 4.0 – https://www.seanoe.org/data/00683/79489/
Usage: tides_extract.py <eot20_dir> <tide-points.json> <tide-hc.json> [tiles_dir]
Also writes 10x10-degree tiles of coastal cells (0.25 deg) so any beach worldwide gets a tide."""
import sys, os, json, hashlib, numpy as np
from netCDF4 import Dataset
src, pts_f, out_f = sys.argv[1], sys.argv[2], sys.argv[3]
tiles_dir = sys.argv[4] if len(sys.argv) > 4 else None
ZALL = {}
pts = json.load(open(pts_f))['points']  # {id: [lat, lon]}
files = []
for r, _, fs in os.walk(src):
    for f in fs:
        if f.endswith('.nc'): files.append(os.path.join(r, f))
oc = [f for f in files if 'ocean' in f.lower() and 'load' not in os.path.basename(f).lower()]
files = sorted(oc or [f for f in files if 'load' not in f.lower()])
if not files: sys.exit('no EOT20 NetCDF files found under ' + src)
def var(ds, keys, exclude=()):
    for n, v in ds.variables.items():
        ln = n.lower()
        if any(k in ln for k in keys) and not any(x in ln for x in exclude): return v
    return None
res = {k: {} for k in pts}
cons = []
for f in files:
    con = os.path.basename(f).split('_')[0].upper()
    ds = Dataset(f); ds.set_auto_mask(True)
    la = var(ds, ('lat',)); lo = var(ds, ('lon',))
    amp = var(ds, ('amp',)); ph = var(ds, ('pha',))
    re_ = var(ds, ('real', 're'), ('lat', 'lon', 'ref')) if amp is None else None; im = var(ds, ('imag', 'im'), ('lat', 'lon')) if amp is None else None
    lat = np.asarray(la[:], float); lon = np.asarray(lo[:], float)
    if amp is not None:
        A = np.ma.filled(np.ma.masked_invalid(np.ma.asarray(amp[:], float)), np.nan); P = np.ma.filled(np.ma.asarray(ph[:], float), np.nan)
        u = (getattr(amp, 'units', '') or '').lower()
    else:
        R = np.ma.filled(np.ma.asarray(re_[:], float), np.nan); I = np.ma.filled(np.ma.asarray(im[:], float), np.nan)
        A = np.hypot(R, I); P = np.degrees(np.arctan2(-I, R)) % 360; u = (getattr(re_, 'units', '') or '').lower()
    A = np.squeeze(A); P = np.squeeze(P)
    if A.shape == (lon.size, lat.size): A = A.T; P = P.T
    scale = 0.01 if 'cm' in u or (not u and np.nanmax(A) > 20) else (0.001 if 'mm' in u else 1.0)
    Z = A * scale * np.exp(-1j * np.radians(P))  # complex harmonic
    Z[~np.isfinite(Z)] = np.nan
    lon360 = lon % 360; order = np.argsort(lon360); lon360 = lon360[order]; Z = Z[:, order]
    dlat = abs(lat[1] - lat[0]); dlon = lon360[1] - lon360[0]
    if tiles_dir: ZALL[con] = Z.astype(np.complex64); GRID = (lat, lon360)
    for k, (pla, plo) in pts.items():
        i0 = int(round((pla - lat[0]) / (lat[1] - lat[0]))); j0 = int(round(((plo % 360) - lon360[0]) / dlon))
        for rad in (1, 2):
            ii = np.arange(i0 - rad, i0 + rad + 1); jj = np.arange(j0 - rad, j0 + rad + 1) % lon360.size
            ii = ii[(ii >= 0) & (ii < lat.size)]
            if not ii.size: break
            sub = Z[np.ix_(ii, jj)]; ok = np.isfinite(sub.real)
            if ok.any():
                gy, gx = np.meshgrid(lat[ii], lon360[jj], indexing='ij')
                dy = gy - pla; dx = ((gx - (plo % 360) + 180) % 360 - 180) * np.cos(np.radians(pla))
                w = 1.0 / (np.hypot(dx, dy) + 1e-3) ** 2; w = w * ok
                z = np.nansum(np.where(ok, sub, 0) * w) / w.sum()
                res[k][con] = [round(float(abs(z)), 4), round(float(np.degrees(-np.angle(z)) % 360), 2)]
                break
    cons.append(con); ds.close()
out = {'model': 'EOT20 – Hart-Davis et al. (2021), DGFI-TUM, CC BY 4.0', 'constituents': cons,
       'points_hash': hashlib.sha1(json.dumps(pts, sort_keys=True).encode()).hexdigest(),
       'points': {k: [pts[k][0], pts[k][1], v] for k, v in res.items() if 'M2' in v or len(v) >= 4}}
json.dump(out, open(out_f, 'w'), separators=(',', ':'))
print('constituents', len(cons), cons, 'points with tides', len(out['points']), 'of', len(pts))

if tiles_dir and ZALL:
    lat, lon360 = GRID; os.makedirs(tiles_dir, exist_ok=True)
    ref = ZALL.get('M2', next(iter(ZALL.values())))
    ocean = np.isfinite(ref.real)
    # coastal = ocean cell with land within 2 cells (~28 km)
    land = ~ocean; near = np.zeros_like(land)
    for di in range(-2, 3):
        for dj in range(-2, 3):
            near |= np.roll(np.roll(land, di, 0), dj, 1)
    coast = ocean & near
    step = max(1, int(round(0.25 / abs(lat[1] - lat[0]))))
    sel = np.zeros_like(coast); sel[::step, ::step] = True; coast &= sel
    ii, jj = np.nonzero(coast)
    cons_sorted = sorted(ZALL)
    tiles = {}
    for i, j in zip(ii, jj):
        la_, lo_ = float(lat[i]), float(((lon360[j] + 180) % 360) - 180)
        key = '%d_%d' % (int(np.floor(la_ / 10)) * 10, int(np.floor(lo_ / 10)) * 10)
        row = [round(la_, 3), round(lo_, 3)]
        for c_ in cons_sorted:
            z = ZALL[c_][i, j]
            row += [int(round(abs(z) * 1000)), int(round(np.degrees(-np.angle(z)) % 360))] if np.isfinite(z.real) else [0, 0]
        tiles.setdefault(key, []).append(row)
    for key, rows in tiles.items():
        json.dump({'c': cons_sorted, 'u': 'amp mm, phase deg', 'p': rows}, open(os.path.join(tiles_dir, 't_' + key + '.json'), 'w'), separators=(',', ':'))
    json.dump({'model': out['model'], 'tiles': sorted(tiles), 'cells': int(len(ii))}, open(os.path.join(tiles_dir, 'index.json'), 'w'), separators=(',', ':'))
    print('coastal tide tiles', len(tiles), 'cells', len(ii))
