/* DipMapper conditions pack (23.77): sea temperature and waves, UV and "good for" verdicts, solunar fishing times,
   and a personal water log. No account, nothing leaves the device except the public data requests below.
   Sea: MET Norway Oceanforecast 2.0 (CC BY 4.0, north-west Europe), NOAA WaveWatch III global waves and
   NASA JPL MUR sea-surface temperature via NOAA CoastWatch ERDDAP (free to use and redistribute). Moon: calculated here. */
(function (W) {
  var D = document, H = 36e5, DAY = 864e5, RAD = Math.PI / 180;
  function E(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function ic(n) { return '<svg class="ic" aria-hidden="true"><use href="/icons.svg#i-' + n + '"/></svg>'; }
  function tm(t, tz) { try { return new Date(t).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: tz || undefined }); } catch (e) { return new Date(t).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); } }
  function num(v) { return typeof v === 'number' && isFinite(v) ? v : null; }
  function ss(k, v) { try { if (v === undefined) { var c = JSON.parse(sessionStorage.getItem(k) || 'null'); return c && Date.now() - c.t < 3 * H ? c : null; } sessionStorage.setItem(k, JSON.stringify({ t: Date.now(), v: v })); } catch (e) { return null; } }
  function compass(d) { return d == null ? '' : ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west'][Math.round(((d % 360) + 360) % 360 / 45) % 8]; }

  /* ---------- moon: position (low-precision ephemeris), phase and solunar periods ---------- */
  function jd(t) { return t / DAY - 0.5 + 2440588 - 2451545; }
  function moonAlt(t, la, lo) {
    var d = jd(t), L = RAD * (218.316 + 13.176396 * d), M = RAD * (134.963 + 13.064993 * d), F = RAD * (93.272 + 13.22935 * d);
    var l = L + RAD * 6.289 * Math.sin(M), b = RAD * 5.128 * Math.sin(F), e = RAD * 23.4397;
    var ra = Math.atan2(Math.sin(l) * Math.cos(e) - Math.tan(b) * Math.sin(e), Math.cos(l)), dec = Math.asin(Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l));
    var th = RAD * (280.16 + 360.9856235 * d) + RAD * lo, ha = th - ra, phi = RAD * la;
    return Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(ha)) / RAD;
  }
  var SYN = 29.530588853, NEW0 = Date.UTC(2000, 0, 6, 18, 14);
  function phase(t) {
    var age = (((t - NEW0) / DAY) % SYN + SYN) % SYN, lit = (1 - Math.cos(2 * Math.PI * age / SYN)) / 2;
    var nm = age < 1.85 ? 'New moon' : age < 5.54 ? 'Waxing crescent' : age < 9.23 ? 'First quarter' : age < 12.92 ? 'Waxing gibbous' : age < 16.61 ? 'Full moon' : age < 20.3 ? 'Waning gibbous' : age < 23.99 ? 'Last quarter' : age < 27.68 ? 'Waning crescent' : 'New moon';
    var dn = Math.min(age, SYN - age), df = Math.abs(age - SYN / 2);
    return { age: age, lit: lit, name: nm, strong: Math.min(dn, df) <= 2, good: Math.min(dn, df) <= 4 };
  }
  function solunar(la, lo, now) {
    now = now || Date.now();
    var st = 5 * 6e4, t0 = now - 3 * H, n = Math.round(30 * H / st), a = [], out = [];
    for (var i = 0; i <= n; i++) a.push(moonAlt(t0 + i * st, la, lo));
    for (i = 1; i < n; i++) {
      var t = t0 + i * st;
      if (a[i] > a[i - 1] && a[i] >= a[i + 1]) out.push({ k: 'major', c: t, w: H, why: a[i] > 0 ? 'moon overhead' : 'moon at its highest, below the horizon' });
      else if (a[i] < a[i - 1] && a[i] <= a[i + 1]) out.push({ k: 'major', c: t, w: H, why: 'moon underfoot' });
      if ((a[i - 1] < 0.125) !== (a[i] < 0.125)) out.push({ k: 'minor', c: t, w: H / 2, why: a[i] >= 0.125 ? 'moonrise' : 'moonset' });
    }
    return out.map(function (p) { return { k: p.k, s: p.c - p.w, e: p.c + p.w, why: p.why }; })
      .filter(function (p) { return p.e > now && p.s < now + 24 * H; }).sort(function (x, y) { return x.s - y.s; });
  }
  function solCard(la, lo, tz, where) {
    var now = Date.now(), ps = solunar(la, lo, now), ph = phase(now);
    var nx = ps.filter(function (p) { return p.k === 'major'; })[0], on = ps.filter(function (p) { return p.s <= now; })[0];
    var rng = function (p) { return tm(p.s, tz) + '–' + tm(p.e, tz); };
    return '<h3>' + ic('fish') + ' Fishing times' + (where ? ' at ' + E(where) : '') + '</h3>' +
      (on ? '<p class="btW">Right now: <b>' + (on.k === 'major' ? 'major' : 'minor') + ' period</b> until ' + tm(on.e, tz) + '</p>' : nx ? '<p class="btW">Next major period <b>' + rng(nx) + '</b></p>' : '') +
      '<ul class="btL">' + ps.slice(0, 4).map(function (p) { return '<li><b>' + (p.k === 'major' ? 'Major' : 'Minor') + '</b> ' + rng(p) + ' <small>(' + p.why + ')</small></li>'; }).join('') + '</ul>' +
      '<p class="btDet">' + ic('moon') + ' ' + ph.name + ', ' + Math.round(ph.lit * 100) + '% lit – ' + (ph.strong ? 'one of the strongest days of the month in the solunar tables' : ph.good ? 'a better-than-average solunar day' : 'an ordinary solunar day') + '.</p>' +
      '<p class="btSrc">Solunar periods follow the moon\'s position, calculated on your device' + (tz ? '' : ' in your time') + '. Anglers have used them for a century; fish also follow light, tide and weather, so treat them as a guide, not a promise.</p>';
  }

  /* ---------- sea: temperature and waves ---------- */
  function j(u) { return fetch(u).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }); }
  function metSea(la, lo) {
    if (la < 48 || la > 82 || lo < -25 || lo > 45) return Promise.resolve(null);
    var off = [[0, 0], [0.06, 0], [-0.06, 0], [0, 0.1], [0, -0.1]], i = 0;
    function next() {
      if (i >= off.length) return Promise.resolve(null);
      var o = off[i++];
      return j('https://api.met.no/weatherapi/oceanforecast/2.0/complete?lat=' + (la + o[0]).toFixed(3) + '&lon=' + (lo + o[1]).toFixed(3)).then(function (r) {
        var ts = r && r.properties && r.properties.timeseries; if (!Array.isArray(ts)) return next();
        var now = Date.now(), p = ts.filter(function (x) { return x && Date.parse(x.time) >= now - H; })[0], d = p && p.data && p.data.instant && p.data.instant.details;
        if (!d) return next();
        var v = { T: num(d.sea_water_temperature), wh: num(d.sea_surface_wave_height), wd: num(d.sea_surface_wave_from_direction), cs: num(d.sea_water_speed), src: 'met' };
        return v.T === null && v.wh === null ? next() : v;
      }, function () { return next(); });
    }
    return next();
  }
  var ERD = 'https://coastwatch.pfeg.noaa.gov/erddap/griddap/', WW3 = 'https://pae-paha.pacioos.hawaii.edu/erddap/griddap/', jn = 0;
  /* ERDDAP servers answer browsers through JSONP (no CORS headers), the same way the live map already reads WaveWatch III */
  function jp(u) { return new Promise(function (ok, no) { var cb = '__dmc' + (++jn), s = D.createElement('script'), to = setTimeout(function () { end(); no(0); }, 9000);
    function end() { clearTimeout(to); try { delete W[cb]; } catch (e) { W[cb] = undefined; } s.remove(); }
    W[cb] = function (r) { end(); ok(r); }; s.onerror = function () { end(); no(0); }; s.src = u + '&.jsonp=' + cb; D.head.appendChild(s); }); }
  function nearest(rows, la, lo, iv, wrap) {
    var b = null, bd = 1e9; (rows || []).forEach(function (r) { var v = num(r[iv]); if (v === null) return; var dl = r[iv - 2] - la, dx = r[iv - 1] - lo; if (wrap) dx = ((dx + 540) % 360) - 180; var d = dl * dl + dx * dx; if (d < bd) { bd = d; b = r; } }); return b;
  }
  function noaaSst(la, lo) {
    var q = '[(last)][(' + (la - 0.06).toFixed(2) + '):(' + (la + 0.06).toFixed(2) + ')][(' + (lo - 0.06).toFixed(2) + '):(' + (lo + 0.06).toFixed(2) + ')]';
    return jp(ERD + 'jplMURSST41.json?analysed_sst' + encodeURIComponent(q)).then(function (r) {
      var b = nearest(r && r.table && r.table.rows, la, lo, 3); return b ? { T: b[3], day: String(b[0]).slice(0, 10) } : null;
    }, function () { return null; });
  }
  function noaaWave(la, lo) {
    var x = (lo + 360) % 360, a = Math.max(-77.5, la - 0.5), z = Math.min(77.5, la + 0.5), x0 = Math.max(0, x - 0.5), x1 = Math.min(359.5, x + 0.5);
    var hr = new Date(); hr.setUTCMinutes(0, 0, 0);
    var c = '[(' + hr.toISOString().replace('.000', '') + ')][(0.0)][(' + a.toFixed(2) + '):(' + z.toFixed(2) + ')][(' + x0.toFixed(2) + '):(' + x1.toFixed(2) + ')]';
    return jp(WW3 + 'ww3_global.json?' + encodeURIComponent('Thgt' + c + ',Tper' + c + ',Tdir' + c)).then(function (r) {
      var b = nearest(r && r.table && r.table.rows, la, x, 4, true); return b ? { wh: b[4], wp: num(b[5]), wd: num(b[6]) } : null;
    }, function () { return null; });
  }
  function sea(la, lo) {
    var k = 'dm_sea_' + la.toFixed(2) + '_' + lo.toFixed(2), c = ss(k);
    if (c) return Promise.resolve(c.v);
    return metSea(la, lo).then(function (m) {
      var need = !m || m.T === null || m.wh === null;
      return (need ? Promise.all([m && m.T !== null ? null : noaaSst(la, lo), m && m.wh !== null ? null : noaaWave(la, lo)]) : Promise.resolve([null, null])).then(function (r) {
        var v = { T: m && m.T !== null ? m.T : r[0] ? r[0].T : null, Tsrc: m && m.T !== null ? 'met' : r[0] ? 'mur' : '', Tday: r[0] ? r[0].day : '',
          wh: m && m.wh !== null ? m.wh : r[1] ? r[1].wh : null, wd: m && m.wh !== null ? m.wd : r[1] ? r[1].wd : null, wp: r[1] && !(m && m.wh !== null) ? r[1].wp : null, Wsrc: m && m.wh !== null ? 'met' : r[1] ? 'ww3' : '', cs: m ? m.cs : null };
        if (v.T !== null && (v.T < -3 || v.T > 40)) v.T = null; if (v.wh !== null && (v.wh < 0 || v.wh > 25)) v.wh = null;
        ss(k, v); return v;
      });
    });
  }
  function seaHtml(v) {
    var L = [], T = v.T, wh = v.wh;
    var head = T !== null ? 'Water about <b>' + Math.round(T) + '°C</b>' : 'Waves about <b>' + wh.toFixed(1) + ' m</b>';
    if (T !== null) L.push(T < 12 ? 'Cold water – a short dip only, or a full wetsuit; cold shock is real below 15°C.' : T < 16 ? 'Fresh – most swimmers want a full wetsuit for anything longer than a dip.' : T < 20 ? 'Cool but swimmable – a shorty or wetsuit helps on long swims.' : T < 24 ? 'Comfortable for swimming without a wetsuit.' : 'Warm water – bath-like for most people.');
    if (wh !== null) L.push((T !== null ? 'Waves about ' + wh.toFixed(1) + ' m' : 'Waves') + (v.wd !== null ? ' from the ' + compass(v.wd) : '') + (v.wp ? ', ' + Math.round(v.wp) + ' s apart' : '') + ' – ' + (wh < 0.5 ? 'calm, good for swimming and snorkelling.' : wh < 1 ? 'small waves, fine for most swimmers.' : wh < 2 ? 'surf – watch for rip currents and swim between the flags.' : 'rough sea – stay out unless lifeguards say otherwise.'));
    if (v.cs !== null && v.cs >= 0.5) L.push('Current about ' + v.cs.toFixed(1) + ' m/s offshore – noticeable for swimmers and paddlers.');
    var src = [v.Tsrc === 'met' || v.Wsrc === 'met' ? '<a href="https://api.met.no/" target="_blank" rel="noopener">MET Norway</a> ocean model (CC BY 4.0)' : '', v.Tsrc === 'mur' ? 'NASA JPL MUR satellite analysis' + (v.Tday ? ' of ' + E(v.Tday) : '') + ' via <a href="https://coastwatch.pfeg.noaa.gov/erddap/" target="_blank" rel="noopener">NOAA CoastWatch</a>' : '', v.Wsrc === 'ww3' ? 'NOAA WaveWatch III' : ''].filter(Boolean).join(' · ');
    return '<h3>' + ic('wave') + ' The water today</h3><p class="btW">' + head + '</p><ul class="btL">' + L.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul><p class="btSrc">Offshore values from ' + src + ' – the water at the beach can differ.</p>';
  }

  /* ---------- UV and "good for" ---------- */
  function uvOf(jf, tz) {
    var ts = jf && jf.properties && jf.properties.timeseries; if (!Array.isArray(ts)) return null;
    var now = Date.now(), day = new Date(now).toLocaleDateString('en-CA', { timeZone: tz || undefined }), b = null;
    ts.forEach(function (p) { var t = Date.parse(p.time); if (!(t >= now - H && t <= now + 30 * H)) return; var d = p.data && p.data.instant && p.data.instant.details, u = d && num(d.ultraviolet_index_clear_sky); if (u === null) return; var dd = new Date(t).toLocaleDateString('en-CA', { timeZone: tz || undefined }); if (!b || (dd === b.day && u > b.u) || (b.u < 0.5 && dd !== b.day && u > b.u)) b = { u: u, t: t, day: dd }; });
    return b;
  }
  function chip(ok, txt) { return '<span class="btV ' + (ok === 2 ? 'btG' : ok === 1 ? 'btF' : 'btP') + '">' + txt + '</span>'; }
  function goodHtml(p, uv, s, tz, dry) {
    var b = p && p.best && p.best.a, ws = b ? b.ws : null, wmax = p ? p.wsMax : null, wh = s && s.wh !== null ? s.wh : null, L = [];
    if (ws !== null && !dry) {
      var calm = Math.max(ws, wmax || 0);
      L.push(['Stand-up paddling', ws <= 4 && (wh === null || wh < 0.6) ? 2 : ws <= 6 && (wh === null || wh < 1) ? 1 : 0, ws > 6 ? 'too windy' : wh !== null && wh >= 1 ? 'waves too big for a board' : ws <= 4 ? (wh !== null && wh >= 0.6 ? 'light wind, some swell – stay close to shore' : 'calm') : 'breezy – stay close to shore']);
      L.push(['Snorkelling', wh !== null ? (wh < 0.5 && ws <= 5 ? 2 : wh < 0.9 ? 1 : 0) : ws <= 4 ? 1 : 0, wh !== null ? (wh < 0.5 ? 'flat water, clearer view' : wh < 0.9 ? 'some chop' : 'too rough') : ws <= 4 ? 'light wind – check the water' : 'wind stirs the water']);
      L.push(['Kitesurfing', calm >= 7 && calm <= 14 ? 2 : calm >= 5.5 && calm <= 16 ? 1 : 0, calm < 5.5 ? 'not enough wind' : calm > 16 ? 'too strong for most riders' : 'about ' + Math.round(calm) + ' m/s at its windiest']);
      L.push(['Sailing', ws >= 3 && ws <= 9 ? 2 : ws <= 12 ? 1 : 0, ws < 3 ? 'light airs' : ws <= 9 ? 'a good breeze' : ws <= 12 ? 'fresh – for experienced crews' : 'strong wind']);
      if (wh !== null) L.push(['Surfing', wh >= 0.8 && wh <= 2.5 && ws <= 8 ? 2 : wh >= 0.5 && wh <= 3.5 ? 1 : 0, wh < 0.5 ? 'flat' : wh > 3.5 ? 'big and heavy' : 'about ' + wh.toFixed(1) + ' m waves' + (ws > 8 ? ', blown out' : '')]);
    }
    var u = uv ? uv.u : null, ul = u === null ? '' : u < 3 ? 'low' : u < 6 ? 'moderate' : u < 8 ? 'high' : u < 11 ? 'very high' : 'extreme';
    if (u === null && !L.length) return '';
    return '<h3>' + ic(dry ? 'sunrise' : 'wind') + (dry ? ' Sun and UV, ' : ' Good for, ') + (p && p.dayLbl ? E(p.dayLbl.toLowerCase()) : 'today') + '</h3>' +
      (u !== null ? '<p class="btW">UV up to <b>' + Math.round(u) + '</b> <span class="btV ' + (u < 3 ? 'btG' : u < 6 ? 'btF' : 'btP') + '">' + ul + '</span>' + (u >= 3 ? ' <small>around ' + tm(uv.t, tz) + '</small>' : '') + '</p><p class="btDet">' + (u < 3 ? 'Little sun protection needed.' : u < 6 ? 'Sunscreen and a hat around midday.' : u < 8 ? 'Sunscreen SPF 30+, hat and shade between 11:00 and 15:00 – reapply after every swim.' : 'Burns come fast: SPF 50, a UV shirt and shade at midday; reapply after every swim.') + ' <small>(clear-sky value)</small></p>' : '') +
      (L.length ? '<ul class="btL btGood">' + L.map(function (x) { return '<li>' + chip(x[1], x[1] === 2 ? 'good' : x[1] === 1 ? 'maybe' : 'no') + ' <b>' + x[0] + '</b> – ' + x[2] + '</li>'; }).join('') + '</ul>' : '') +
      '<p class="btSrc">' + (L.length ? 'From the forecast wind at your best hours' + (wh !== null ? ' and the wave forecast' : '') + '. Local gusts, offshore wind and currents matter – ask the rental or school on the spot.' : 'UV: MET Norway clear-sky forecast – clouds lower it, water and sand reflect it.') + '</p>';
  }

  /* ---------- attach to the water butler ---------- */
  function slot(el, cls) { var g = el.querySelector('.btG2'); if (!g) return null; var c = g.querySelector('.' + cls); if (!c) { c = D.createElement('div'); c.className = 'btC ' + cls; c.hidden = true; g.appendChild(c); } return c; }
  function attach(el, pt, tz, mode, tok) {
    var la = pt.la, lo = pt.lo, st = el._cond = { tok: tok, sea: null, p: null, j: null };
    var sc = slot(el, 'btSea'), sl = slot(el, 'btSol');
    if (sl && (!el.classList.contains('btPick') || el.dataset.fish === '1')) { sl.innerHTML = solCard(la, lo, tz, ''); sl.hidden = false; } else if (sl) sl.remove();
    if (sc && mode !== 'out' && el.dataset.sea !== '0') sea(la, lo).then(function (v) { if (el._tok !== tok) return; st.sea = v || { T: null, wh: null }; if (v && (v.T !== null || v.wh !== null)) { sc.innerHTML = seaHtml(v); sc.hidden = false; } else sc.remove(); good(el); }, function () { sc.remove(); });
    else if (sc) sc.remove();
  }
  function wx(el, p, jf, tz) { var st = el._cond; if (!st) return; st.p = p; st.j = jf; st.tz = tz; good(el); }
  function good(el) {
    var st = el._cond; if (!st || !st.p) return;
    var c = slot(el, 'btGd'); if (!c) return;
    var h = goodHtml(st.p, uvOf(st.j, st.tz), st.sea, st.tz, el.dataset.sea === '0'); if (h) { c.innerHTML = h; c.hidden = false; } else c.remove();
  }

  /* ---------- my water log ---------- */
  var LK = 'dm_log', ACT = ['Swim', 'Snorkel', 'Dive', 'Fishing', 'Boat trip', 'Wildlife', 'Surf or paddle', 'Spa or pool'];
  function logs() { try { var a = JSON.parse(localStorage.getItem(LK) || '[]'); return Array.isArray(a) ? a.filter(function (x) { return x && typeof x.u === 'string' && /^\/[A-Za-z0-9._#\/-]*$/.test(x.u) && typeof x.t === 'string'; }) : []; } catch (e) { return []; } }
  function putLogs(a) { try { localStorage.setItem(LK, JSON.stringify(a.slice(-500))); return true; } catch (e) { return false; } }
  function today() { return new Date().toLocaleDateString('en-CA'); }
  function logForm(b) {
    var nx = b.nextElementSibling; if (nx && nx.classList.contains('lgF')) { nx.remove(); return; }
    var f = D.createElement('form'); f.className = 'lgF';
    f.innerHTML = '<label>Date <input type="date" name="d" value="' + today() + '" max="' + today() + '" required></label><label>What <select name="a">' + ACT.map(function (a) { return '<option>' + a + '</option>'; }).join('') + '</select></label><label class="lgN">Note <input type="text" name="n" maxlength="140" placeholder="Water temperature, what you saw or caught…"></label><button type="submit" class="btB">' + ic('star') + '<span>Save to my log</span></button>';
    b.parentNode.insertBefore(f, b.nextSibling);
    f.onsubmit = function (e) {
      e.preventDefault();
      var d = f.d.value || today(); if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) d = today();
      var a = logs(); a.push({ id: 'l' + Date.now().toString(36), u: b.dataset.u, t: b.dataset.n.slice(0, 200), d: d, a: ACT.indexOf(f.a.value) >= 0 ? f.a.value : 'Swim', n: String(f.n.value || '').slice(0, 140) });
      var ok = putLogs(a); f.innerHTML = ok ? '<p class="tdS">' + ic('star') + ' Saved. <a href="/saved#log">See your log</a> · ' + a.length + (a.length === 1 ? ' entry' : ' entries') + '</p>' : '<p class="tdS">Your browser did not allow saving here (private mode?).</p>';
      setTimeout(function () { f.remove(); }, ok ? 6000 : 4000);
    };
  }
  function csv(a) { var q = function (s) { return '"' + String(s == null ? '' : s).replace(/"/g, '""') + '"'; }; return 'Date,Activity,Place,Note,Link\r\n' + a.map(function (x) { return [x.d, x.a, x.t, x.n, 'https://dipmapper.com' + x.u].map(q).join(','); }).join('\r\n'); }
  function logPage() {
    var m = D.querySelector('.dmSavedPg'); if (!m || D.getElementById('log')) return;
    var s = D.createElement('section'); s.id = 'log'; s.className = 'lgBox'; m.appendChild(s);
    function draw() {
      var a = logs().sort(function (x, y) { return x.d < y.d ? 1 : x.d > y.d ? -1 : 0; });
      var by = {}; a.forEach(function (x) { by[x.a] = (by[x.a] || 0) + 1; });
      s.innerHTML = '<h2><span class="dmI">' + ic('book') + '</span>My water log</h2>' + (a.length ? '<p class="lgSum">' + a.length + (a.length === 1 ? ' entry' : ' entries') + ' · ' + Object.keys(by).map(function (k) { return by[k] + ' × ' + E(k.toLowerCase()); }).join(' · ') + '</p><ul class="lgL">' + a.slice(0, 200).map(function (x) { return '<li><time>' + E(x.d) + '</time> <b>' + E(x.a) + '</b> <a href="' + E(x.u) + '">' + E(x.t) + '</a>' + (x.n ? '<br><small>' + E(x.n) + '</small>' : '') + ' <button type="button" class="lgX" data-id="' + E(x.id) + '" aria-label="Delete this entry">×</button></li>'; }).join('') + '</ul><p><button type="button" class="btB lgCsv">' + ic('arrow') + '<span>Download as a spreadsheet (CSV)</span></button></p>' : '<p>Log your swims, dives, catches and boat trips with “Log a visit” on any place page. The log stays on this device.</p>');
      var c = s.querySelector('.lgCsv'); if (c) c.onclick = function () { var u = URL.createObjectURL(new Blob(['﻿' + csv(a)], { type: 'text/csv;charset=utf-8' })), l = D.createElement('a'); l.href = u; l.download = 'dipmapper-water-log.csv'; D.body.appendChild(l); l.click(); setTimeout(function () { URL.revokeObjectURL(u); l.remove(); }, 1000); };
      [].forEach.call(s.querySelectorAll('.lgX'), function (x) { x.onclick = function () { putLogs(logs().filter(function (y) { return y.id !== x.dataset.id; })); draw(); }; });
    }
    draw(); W.addEventListener('storage', function (e) { if (e.key === LK) draw(); });
  }
  function init() {
    [].forEach.call(D.querySelectorAll('.lgB'), function (b) { b.onclick = function () { logForm(b); }; });
    [].forEach.call(D.querySelectorAll('.fgSolW[data-la]'), function (el) { var la = +el.dataset.la, lo = +el.dataset.lo; if (isFinite(la) && isFinite(lo)) { el.innerHTML = solCard(la, lo, el.dataset.tz || '', el.dataset.n || ''); el.hidden = false; } });
    logPage();
  }
  W.DMCond = { attach: attach, wx: wx, solunar: solunar, phase: phase, moonAlt: moonAlt, sea: sea, logs: logs };
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', init); else init();
})(window);
