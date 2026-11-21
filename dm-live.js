/* DipMapper live extras (23.54): wind now, recent records (GBIF), animal fact file (Wikidata + Wikipedia), season reminder. */
(function () {
  'use strict';
  var D = document;
  function el(t, c, h) { var e = D.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; return e; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function getJSON(u) { return fetch(u, { mode: 'cors' }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }); }
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var DIRS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

  /* ---------- wind now (MET Norway, CC BY 4.0) ---------- */
  function kn(ms) { return ms * 1.94384; }
  function bft(ms) { var b = [0.3, 1.6, 3.4, 5.5, 8, 10.8, 13.9, 17.2, 20.8, 24.5, 28.5, 32.7], i = 0; while (i < b.length && ms >= b[i]) i++; return i; }
  function verdict(k, g, sport) {
    if (sport === 'kite') { if (k < 10) return ['Too light for most kites', 'lo']; if (k <= 18) return ['Good for learning and light-wind kites', 'ok']; if (k <= 25) return ['Strong – fun for experienced riders', 'ok']; return ['Very strong and gusty – experts only', 'hi']; }
    if (sport === 'surf') { if (k <= 8) return ['Light wind – usually clean waves', 'ok']; if (k <= 15) return ['Moderate – choppy if onshore', 'mid']; return ['Strong wind – blown-out surf likely', 'hi']; }
    if (k <= 8 && g <= 12) return ['Calm – good for paddling and swimming', 'ok'];
    if (k <= 14 && g <= 18) return ['Breezy – stay near shore on a SUP', 'mid'];
    return ['Windy – not a day for SUP or small boats', 'hi'];
  }
  function wind(box) {
    var la = +box.dataset.la, lo = +box.dataset.lo, sport = box.dataset.sport || 'water';
    box.innerHTML = '<h2><svg class="ic" aria-hidden="true"><use href="/icons.svg#i-wind"/></svg> Wind now and next days</h2><p class="dmWindL">Loading the forecast…</p>';
    getJSON('https://api.met.no/weatherapi/locationforecast/2.0/complete?lat=' + la.toFixed(2) + '&lon=' + lo.toFixed(2)).then(function (j) {
      var ts = (j.properties && j.properties.timeseries) || [], rows = [], seen = {};
      ts.forEach(function (t) {
        var d = new Date(t.time), h = d.getUTCHours();
        if (rows.length >= 9 || seen[t.time]) return;
        if (rows.length && h % 6) return; seen[t.time] = 1;
        var x = t.data.instant.details; rows.push({ d: d, s: x.wind_speed, g: x.wind_speed_of_gust, dir: x.wind_from_direction });
      });
      if (!rows.length) throw new Error('empty');
      var now = rows[0], k = kn(now.s), g = now.g != null ? kn(now.g) : k, v = verdict(k, g, sport);
      var arrow = function (dir) { return '<span class="dmArr" style="transform:rotate(' + Math.round(dir + 180) + 'deg)" aria-hidden="true">↑</span>'; };
      var dname = function (dir) { return DIRS[Math.round(dir / 22.5) % 16]; };
      box.innerHTML = '<h2><svg class="ic" aria-hidden="true"><use href="/icons.svg#i-wind"/></svg> Wind now and next days</h2>' +
        '<div class="dmWindNow"><div class="dmWindBig">' + arrow(now.dir) + '<b>' + Math.round(k) + '</b><small>knots</small></div><div><p><b>' + esc(dname(now.dir)) + '</b> wind, force ' + bft(now.s) + (now.g != null ? ', gusts ' + Math.round(g) + ' kn' : '') + '</p><p class="dmV dmV-' + v[1] + '">' + esc(v[0]) + '</p></div></div>' +
        '<ol class="dmWindRow">' + rows.slice(1).map(function (r) { var kk = Math.round(kn(r.s)); return '<li><small>' + esc(r.d.toLocaleDateString([], { weekday: 'short' }) + ' ' + r.d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) + '</small>' + arrow(r.dir) + '<b>' + kk + '</b><small>' + esc(dname(r.dir)) + (r.g != null ? ' · g' + Math.round(kn(r.g)) : '') + '</small></li>'; }).join('') + '</ol>' +
        '<p class="note">Wind from the direction shown (arrow points where it blows). Forecast for the area, not the exact beach – local sea breezes and gusts can differ. Data: <a href="https://api.met.no/" target="_blank" rel="noopener">MET Norway</a>, CC BY 4.0.</p>';
    }).catch(function () { box.innerHTML = '<h2><svg class="ic" aria-hidden="true"><use href="/icons.svg#i-wind"/></svg> Wind now and next days</h2><p class="note">The wind forecast could not be loaded right now. Try again later or check your local weather service.</p>'; });
  }

  /* ---------- recent records (GBIF, CC0 / CC BY only) ---------- */
  function gbif(box) {
    var names = (box.dataset.sci || '').split('|').filter(Boolean), la = box.dataset.la, lo = box.dataset.lo;
    if (!names.length) return;
    var yr = new Date().getFullYear();
    box.innerHTML = '<h2><svg class="ic" aria-hidden="true"><use href="/icons.svg#i-binoculars"/></svg> Recent records' + (la ? ' around here' : '') + '</h2><p class="note">Loading open biodiversity records…</p>';
    Promise.all(names.map(function (n) { return getJSON('https://api.gbif.org/v1/species/match?name=' + encodeURIComponent(n)).then(function (m) { return m && m.usageKey ? { n: n, k: m.usageKey, v: m.vernacularName } : null; }).catch(function () { return null; }); }))
      .then(function (ms) {
        ms = ms.filter(Boolean); if (!ms.length) throw new Error('nomatch');
        var q = '&year=' + (yr - 2) + ',' + yr + '&license=CC0_1_0&license=CC_BY_4_0&limit=6&hasCoordinate=true';
        if (la) q += '&decimalLatitude=' + (+la - 0.5).toFixed(2) + ',' + (+la + 0.5).toFixed(2) + '&decimalLongitude=' + (+lo - 0.8).toFixed(2) + ',' + (+lo + 0.8).toFixed(2);
        return Promise.all(ms.map(function (m) { return getJSON('https://api.gbif.org/v1/occurrence/search?taxonKey=' + m.k + q).then(function (r) { return { m: m, r: r }; }).catch(function () { return { m: m, r: { count: 0, results: [] } }; }); }));
      }).then(function (all) {
        var rows = [], total = 0;
        all.forEach(function (a) { total += a.r.count || 0; (a.r.results || []).forEach(function (o) { rows.push({ o: o, n: a.m.n, v: a.m.v }); }); });
        rows.sort(function (a, b) { return (b.o.eventDate || '').localeCompare(a.o.eventDate || ''); });
        rows = rows.slice(0, 8);
        var head = '<h2><svg class="ic" aria-hidden="true"><use href="/icons.svg#i-binoculars"/></svg> Recent records' + (la ? ' around here' : '') + '</h2>';
        if (!rows.length) { box.innerHTML = head + '<p class="note">No openly licensed records ' + (la ? 'within about 50 km ' : '') + 'from the last three years. That does not mean the animals are absent – many sightings are never uploaded.</p>'; return; }
        box.innerHTML = head + '<p>' + total.toLocaleString() + ' openly licensed record' + (total === 1 ? '' : 's') + ' since ' + (yr - 2) + (la ? ' within about 50 km' : '') + '. Latest:</p><ul class="dmRec">' + rows.map(function (x) {
          var o = x.o, d = (o.eventDate || '').slice(0, 10);
          var vn = o.vernacularName || x.v; return '<li><b>' + esc(vn || x.n) + '</b>' + (vn ? ' <i>' + esc(x.n) + '</i>' : '') + '<span>' + esc(d) + ' · ' + esc([o.locality, o.stateProvince, o.country].filter(Boolean).slice(0, 2).join(', ')) + '</span><a href="https://www.gbif.org/occurrence/' + o.key + '" target="_blank" rel="noopener">record</a></li>';
        }).join('') + '</ul><p class="note">Records from <a href="https://www.gbif.org/" target="_blank" rel="noopener">GBIF</a> (citizen science, museums and surveys), CC0 and CC BY only. A record is a past observation, not a forecast.</p>';
      }).catch(function () { box.innerHTML = '<h2><svg class="ic" aria-hidden="true"><use href="/icons.svg#i-binoculars"/></svg> Recent records</h2><p class="note">Open biodiversity records could not be loaded right now.</p>'; });
  }

  /* ---------- fact file (Wikidata CC0 + Wikipedia CC BY-SA) ---------- */
  function qty(cl) {
    var out = []; (cl || []).forEach(function (c) { var v = c.mainsnak && c.mainsnak.datavalue && c.mainsnak.datavalue.value; if (v && v.amount) out.push({ a: Math.abs(parseFloat(v.amount)), u: (v.unit || '').split('/').pop() }); }); return out;
  }
  function ids(cl) { var o = []; (cl || []).forEach(function (c) { var v = c.mainsnak && c.mainsnak.datavalue && c.mainsnak.datavalue.value; if (v && v.id) o.push(v.id); }); return o; }
  var UNIT = { Q11573: ['m', 1], Q174728: ['cm', 0.01], Q11570: ['kg', 1], Q41803: ['g', 0.001], Q191118: ['t', 1000], Q100995: ['lb', 0.4536], Q3710: ['ft', 0.3048] };
  function fmtRange(list, kind) {
    var base = list.map(function (x) { var u = UNIT[x.u]; return u ? x.a * u[1] : null; }).filter(function (v) { return v != null && v > 0; });
    if (!base.length) return '';
    var lo = Math.min.apply(null, base), hi = Math.max.apply(null, base);
    function f(v) { if (kind === 'len') return v < 1 ? Math.round(v * 100) + ' cm' : (Math.round(v * 10) / 10) + ' m'; return v < 1 ? Math.round(v * 1000) + ' g' : v >= 1000 ? (Math.round(v / 100) / 10) + ' t' : Math.round(v) + ' kg'; }
    return lo === hi ? f(lo) : f(lo) + ' – ' + f(hi);
  }
  function facts(box) {
    var sci = box.dataset.sci; if (!sci) return;
    var dl = box.querySelector('dl'); if (!dl) { box.insertAdjacentHTML('beforeend', '<h2>Fact file</h2><dl></dl>'); dl = box.querySelector('dl'); }
    var add = function (icon, label, val, cls) { if (!val) return; dl.insertAdjacentHTML('beforeend', '<dt><svg class="ic" aria-hidden="true"><use href="/icons.svg#i-' + icon + '"/></svg> ' + esc(label) + '</dt><dd' + (cls ? ' class="' + cls + '"' : '') + '>' + val + '</dd>'); };
    var W = 'https://www.wikidata.org/w/api.php?format=json&origin=*&';
    getJSON(W + 'action=query&list=search&srlimit=1&srsearch=' + encodeURIComponent('haswbstatement:P225=' + sci)).then(function (s) {
      var hit = s.query && s.query.search && s.query.search[0]; if (!hit) throw new Error('none');
      return getJSON(W + 'action=wbgetentities&props=claims|sitelinks&sitefilter=enwiki&ids=' + hit.title).then(function (e) { return e.entities[hit.title]; });
    }).then(function (ent) {
      var c = ent.claims || {}, st = ids(c.P141), food = ids(c.P1034).slice(0, 4), hab = ids(c.P2974).slice(0, 3);
      var len = fmtRange(qty(c.P2043), 'len'), mass = fmtRange(qty(c.P2067), 'mass');
      var need = st.concat(food, hab), wp = ent.sitelinks && ent.sitelinks.enwiki && ent.sitelinks.enwiki.title;
      var labels = need.length ? getJSON(W + 'action=wbgetentities&props=labels&languages=en&ids=' + need.join('|')).then(function (l) { return l.entities || {}; }).catch(function () { return {}; }) : Promise.resolve({});
      return labels.then(function (L) {
        var lab = function (q) { return L[q] && L[q].labels && L[q].labels.en ? L[q].labels.en.value : ''; };
        var have = dl.textContent.toLowerCase();
        if (len && have.indexOf('length') < 0) add('ruler', 'Length', esc(len));
        if (mass && have.indexOf('weight') < 0) add('scale', 'Weight', esc(mass));
        if (st.length) { var sl = lab(st[0]); if (sl) add('shield', 'IUCN Red List', esc(sl.charAt(0).toUpperCase() + sl.slice(1)), 'dmIucn dmIucn-' + st[0]); }
        if (food.length && have.indexOf('food') < 0) add('fish', 'Main food', esc(food.map(lab).filter(Boolean).join(', ')));
        if (hab.length && have.indexOf('habitat') < 0) add('map', 'Habitat', esc(hab.map(lab).filter(Boolean).join(', ')));
        var src = '<p class="note dmFsrc">Live figures from <a href="https://www.wikidata.org/wiki/' + esc(ent.id) + '" target="_blank" rel="noopener">Wikidata</a> (CC0)' + (wp ? ' and <a href="https://en.wikipedia.org/wiki/' + encodeURIComponent(wp.replace(/ /g, '_')) + '" target="_blank" rel="noopener">Wikipedia</a> (CC BY-SA 4.0)' : '') + '. Ranges cover adults of both sexes.</p>';
        if (!wp) { box.insertAdjacentHTML('beforeend', src); return; }
        return getJSON('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(wp.replace(/ /g, '_'))).then(function (p) {
          if (p && p.extract) box.insertAdjacentHTML('beforeend', '<blockquote class="dmWpx"><p>' + esc(p.extract) + '</p><footer>Wikipedia, “' + esc(p.title) + '”</footer></blockquote>');
        }).catch(function () {}).then(function () { box.insertAdjacentHTML('beforeend', src); });
      });
    }).catch(function () {});
  }

  /* ---------- season reminder (.ics, nothing leaves the device) ---------- */
  function ics(btn) {
    btn.addEventListener('click', function () {
      var ms = (btn.dataset.ms || '').split(',').map(Number).filter(Boolean); if (!ms.length) return;
      var now = new Date(), y = now.getFullYear(), m = ms.slice().sort(function (a, b) { return a - b; }), first = m[0];
      for (var i = 1; i < m.length; i++) if (m[i] !== m[i - 1] + 1) { first = m[i]; break; }
      if (m.indexOf(12) >= 0 && m.indexOf(1) >= 0) { first = m.filter(function (x) { return m.indexOf(x === 1 ? 12 : x - 1) < 0; })[0] || first; }
      var start = new Date(y, first - 1, 1); if (start < now) start = new Date(y + 1, first - 1, 1);
      start.setDate(start.getDate() - 14);
      var p = function (n) { return (n < 10 ? '0' : '') + n; }, ds = start.getFullYear() + p(start.getMonth() + 1) + p(start.getDate());
      var name = btn.dataset.name || 'Wildlife season', url = location.href.split('#')[0];
      var body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//DipMapper//Season reminder//EN', 'BEGIN:VEVENT', 'UID:' + Date.now() + '@dipmapper.com', 'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z',
        'DTSTART;VALUE=DATE:' + ds, 'RRULE:FREQ=YEARLY', 'SUMMARY:' + name.replace(/[,;]/g, ' ') + ' – season starts in 2 weeks', 'DESCRIPTION:Best months: ' + m.map(function (x) { return MON[x - 1]; }).join(' ') + '. ' + url, 'URL:' + url, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
      var a = D.createElement('a'); a.href = URL.createObjectURL(new Blob([body], { type: 'text/calendar' })); a.download = 'dipmapper-season.ics'; D.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
      btn.textContent = 'Added – open the downloaded file to save it in your calendar';
    });
  }

  function run() {
    D.querySelectorAll('.dmWind[data-la]:not(.done)').forEach(function (b) { b.classList.add('done'); wind(b); });
    D.querySelectorAll('.dmGbif[data-sci]:not(.done)').forEach(function (b) { b.classList.add('done'); gbif(b); });
    D.querySelectorAll('.dmSpFacts[data-sci]:not(.done)').forEach(function (b) { b.classList.add('done'); facts(b); });
    D.querySelectorAll('button.dmIcs:not(.done)').forEach(function (b) { b.classList.add('done'); ics(b); });
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', run); else run();
})();
