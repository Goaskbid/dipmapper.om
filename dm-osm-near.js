/*! DipMapper (c) 2026 Torsten Sauter. All rights reserved. dipmapper.com/terms */
/* Live OpenStreetMap lists near a point: beach bars (with today's sunset) and piers, ferry terminals and marinas for boat trips. Data © OpenStreetMap contributors, ODbL. */
(function (W) {
  var D = document, R = Math.PI / 180, MIR = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://overpass.private.coffee/api/interpreter'];
  function E(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function ic(n) { return '<svg class="ic" aria-hidden="true"><use href="/icons.svg#i-' + n + '"/></svg>'; }
  function km(a, b, c, d) { var x = Math.sin((c - a) * R / 2), y = Math.sin((d - b) * R / 2); return 12742 * Math.asin(Math.sqrt(x * x + Math.cos(a * R) * Math.cos(c * R) * y * y)); }
  var Q = {
    bars: function (la, lo) { var a = '(around:15000,' + la + ',' + lo + ')'; return '[out:json][timeout:20];(nwr' + a + '[amenity~"^(bar|cafe|restaurant|pub|biergarten)$"][name~"beach|plage|strand|playa|spiaggia|praia|lido|chiringuito|plaj|paralia|seebad|badi|strandbad|beach club",i];nwr' + a + '[leisure=beach_resort][name];);out center 40;'; },
    piers: function (la, lo) { var a = '(around:8000,' + la + ',' + lo + ')'; return '[out:json][timeout:20];(nwr' + a + '[amenity=ferry_terminal];nwr' + a + '[man_made=pier][name];nwr' + a + '[leisure=marina][name];);out center 40;'; }
  };
  function lbl(t) { if (t.amenity === 'ferry_terminal') return 'Ferry terminal'; if (t.leisure === 'marina') return 'Marina'; if (t.man_made === 'pier') return 'Pier'; if (t.leisure === 'beach_resort') return 'Beach club'; return ({ bar: 'Beach bar', cafe: 'Beach café', restaurant: 'Beach restaurant', pub: 'Pub', biergarten: 'Beer garden' })[t.amenity] || 'Place'; }
  function get(q, i) {
    i = i || 0; var ctl = W.AbortController ? new AbortController() : null, to = setTimeout(function () { ctl && ctl.abort(); }, 22000);
    return fetch(MIR[i], { method: 'POST', body: 'data=' + encodeURIComponent(q), headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, signal: ctl && ctl.signal })
      .then(function (r) { clearTimeout(to); if (!r.ok) throw new Error(r.status); return r.json(); })
      .catch(function (e) { clearTimeout(to); if (i + 1 < MIR.length) return get(q, i + 1); throw e; });
  }
  function render(el) {
    var la = +el.dataset.la, lo = +el.dataset.lo, k = el.dataset.k; if (!isFinite(la) || !isFinite(lo) || !Q[k] || el.dataset.done) return; el.dataset.done = 1;
    var key = 'dm_osm_' + k + '_' + la.toFixed(3) + '_' + lo.toFixed(3), tz = el.dataset.tz || '', body = el.querySelector('.osmB');
    var ttl = k === 'bars' ? ic('sunrise') + ' Sundowner: beach bars nearby' : ic('boat') + ' Piers, ferry terminals and marinas nearby';
    el.innerHTML = '<h3>' + ttl + '</h3><p class="osmS"></p><div class="osmB"><p class="tdS">Looking around on OpenStreetMap…</p></div><p class="osmC">Live from OpenStreetMap (© contributors, ODbL). ' + (k === 'piers' ? 'The operator confirms the exact meeting point with your booking.' : 'Opening hours change with the season – check before you go.') + '</p>';
    el.hidden = false; body = el.querySelector('.osmB');
    if (k === 'bars' && W.DMToday && DMToday.sun) { var ss = DMToday.sun(new Date(), la, lo, -0.833, false); if (typeof ss === 'number') el.querySelector('.osmS').innerHTML = 'Sunset today: <b>' + new Date(ss).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: tz || undefined }) + '</b>' + (tz ? '' : ' (your time)') + ' – be there half an hour early.'; }
    var c = null; try { c = JSON.parse(sessionStorage.getItem(key) || 'null'); } catch (e) {}
    (c ? Promise.resolve(c) : get(Q[k](la.toFixed(4), lo.toFixed(4))).then(function (j) { var o = (j.elements || []).map(function (x) { var p = x.center || x; return { n: (x.tags || {}).name || '', t: lbl(x.tags || {}), la: p.lat, lo: p.lon, id: x.type + '/' + x.id }; }).filter(function (x) { return x.n && isFinite(x.la); }); try { sessionStorage.setItem(key, JSON.stringify(o)); } catch (e) {} return o; }))
      .then(function (o) {
        var seen = {}; o = o.map(function (x) { x.d = km(la, lo, x.la, x.lo); return x; }).sort(function (a, b) { return a.d - b.d; }).filter(function (x) { var s = x.n.toLowerCase(); if (seen[s]) return false; seen[s] = 1; return true; }).slice(0, 8);
        if (!o.length) { body.innerHTML = '<p class="tdS">' + (k === 'bars' ? 'No beach bars are mapped within 15 km.' : 'No piers, ferry terminals or marinas are mapped within 8 km.') + '</p>'; return; }
        body.innerHTML = '<ul class="osmL">' + o.map(function (x) { return '<li><a href="https://www.openstreetmap.org/' + x.id + '" target="_blank" rel="noopener"><b>' + E(x.n) + '</b><small>' + x.t + ' · ' + (x.d < 1 ? Math.round(x.d * 1000) + ' m' : x.d.toFixed(1) + ' km') + '</small></a><a class="osmGo" href="https://www.openstreetmap.org/directions?to=' + x.la.toFixed(5) + '%2C' + x.lo.toFixed(5) + '" target="_blank" rel="noopener" aria-label="Directions to ' + E(x.n) + '">' + ic('locate') + '</a></li>'; }).join('') + '</ul>';
      }).catch(function () { body.innerHTML = '<p class="tdS">OpenStreetMap did not answer right now. <button type="button" class="osmR">Try again</button></p>'; var b = body.querySelector('.osmR'); if (b) b.onclick = function () { delete el.dataset.done; render(el); }; });
  }
  function all() {
    var L = [].slice.call(D.querySelectorAll('.dmOsm'));
    if (!('IntersectionObserver' in W)) { L.forEach(render); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); render(e.target); } }); }, { rootMargin: '300px' });
    L.forEach(function (x) { io.observe(x); });
  }
  W.DMNear = { render: render, all: all };
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', all); else all();
})(window);
