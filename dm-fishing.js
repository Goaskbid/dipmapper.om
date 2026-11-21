/* DipMapper fishing (23.55): today panel (sun, moon, wind, what bites now), map with rule waters and OpenStreetMap fishing spots. */
(function () {
  'use strict';
  var D = document, DATA = window.DM_FISH || { fish: [], waters: [] };
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var rad = Math.PI / 180;
  // NOAA sunrise equation (good to a minute or two)
  function sunTimes(date, la, lo) {
    var n = Math.round((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 864e5) - 10957.5 + 0.0008);
    var J = n - lo / 360, M = (357.5291 + 0.98560028 * J) % 360, C = 1.9148 * Math.sin(M * rad) + 0.02 * Math.sin(2 * M * rad) + 0.0003 * Math.sin(3 * M * rad);
    var L = (M + C + 180 + 102.9372) % 360, Jt = 2451545 + J + 0.0053 * Math.sin(M * rad) - 0.0069 * Math.sin(2 * L * rad);
    var dec = Math.asin(Math.sin(L * rad) * Math.sin(23.4397 * rad));
    var cw = (Math.sin(-0.833 * rad) - Math.sin(la * rad) * Math.sin(dec)) / (Math.cos(la * rad) * Math.cos(dec));
    if (cw > 1 || cw < -1) return null;
    var w = Math.acos(cw) / rad, toDate = function (j) { return new Date((j - 2440587.5) * 864e5); };
    return { rise: toDate(Jt - w / 360), set: toDate(Jt + w / 360) };
  }
  function moon(date) {
    var syn = 29.530588853, ref = Date.UTC(2000, 0, 6, 18, 14), age = (((date - ref) / 864e5) % syn + syn) % syn;
    var names = [[1.85, 'New moon', '🌑'], [5.54, 'Waxing crescent', '🌒'], [9.23, 'First quarter', '🌓'], [12.92, 'Waxing gibbous', '🌔'], [16.61, 'Full moon', '🌕'], [20.3, 'Waning gibbous', '🌖'], [23.99, 'Last quarter', '🌗'], [27.68, 'Waning crescent', '🌘'], [30, 'New moon', '🌑']];
    for (var i = 0; i < names.length; i++) if (age < names[i][0]) return { age: age, name: names[i][1], icon: names[i][2] };
  }
  function part(now, st) {
    if (!st) return 'day';
    var h = now.getTime(), r = st.rise.getTime(), s = st.set.getTime(), H = 3600e3;
    if (h < r - H || h > s + 1.5 * H) return 'night';
    if (h < r + 3 * H) return 'morning';
    if (h > s - 2.5 * H) return 'evening';
    if (new Date(h).getHours() >= 12) return 'afternoon';
    return 'day';
  }
  function closedNow(water, fishName, now) {
    if (!water) return null;
    var row = (water.rows || []).filter(function (r) { return r[0].toLowerCase().indexOf(fishName) === 0; })[0];
    if (!row) return null;
    var t = row[1].toLowerCase();
    if (/protected all year|closed all year/.test(t)) return row[1];
    var m = t.match(/(\d+)\s+([a-z]{3})\s*[–-]\s*(\d+)\s+([a-z]{3})/);
    if (!m) return null;
    var mi = function (s) { return MON.map(function (x) { return x.toLowerCase(); }).indexOf(s); };
    var a = mi(m[2]) * 100 + +m[1], b = mi(m[4]) * 100 + +m[3], c = now.getMonth() * 100 + now.getDate();
    var inside = a <= b ? (c >= a && c <= b) : (c >= a || c <= b);
    return inside ? row[1] : null;
  }
  var KEY = { perch: 'perch', pike: 'pike', zander: 'zander', whitefish: 'whitefish', 'lake-trout': 'trout', 'brown-trout': 'trout', 'rainbow-trout': 'trout', char: 'lake char', grayling: 'grayling', carp: 'carp', catfish: 'catfish', burbot: 'burbot' };
  var box = D.getElementById('fToday'); if (!box) return;
  var sel = D.getElementById('fWater'), here = null;
  DATA.waters.forEach(function (w, i) { var o = D.createElement('option'); o.value = i; o.textContent = w.name; sel.appendChild(o); });
  function render() {
    var now = new Date(), w = DATA.waters[+sel.value] || DATA.waters[0], la = here ? here[0] : w.la, lo = here ? here[1] : w.lo;
    var st = sunTimes(now, la, lo), mo = moon(now), p = part(now, st), m = now.getMonth() + 1;
    var tf = function (d) { return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); };
    var good = [], closed = [];
    DATA.fish.forEach(function (f) {
      var c = closedNow(here ? null : w, KEY[f.id] || f.id, now);
      if (c) { closed.push(f.en + ' (' + c + ')'); return; }
      var inPart = f.parts.indexOf(p) >= 0 || (p === 'day' && f.parts.indexOf('day') >= 0), inMonth = f.months.indexOf(m) >= 0, peak = f.peak.indexOf(m) >= 0;
      if (inMonth && inPart) good.push('<li><a href="#fish-' + f.id + '"><b>' + esc(f.en) + '</b></a>' + (peak ? ' <span class="fPeak">peak month</span>' : '') + '<small>' + esc(f.bait0) + '</small></li>');
    });
    D.getElementById('fSun').innerHTML = st ? '<b>' + tf(st.rise) + '</b> sunrise · <b>' + tf(st.set) + '</b> sunset' : 'No sunrise or sunset today';
    D.getElementById('fMoon').innerHTML = '<span aria-hidden="true">' + mo.icon + '</span> ' + esc(mo.name) + ' <small>day ' + Math.floor(mo.age) + ' of 29.5</small>';
    D.getElementById('fPart').textContent = { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening', night: 'Night', day: 'Daytime' }[p];
    D.getElementById('fGood').innerHTML = good.length ? good.join('') : '<li>Quiet hours for most fish – evening and morning are usually better.</li>';
    D.getElementById('fClosed').innerHTML = closed.length ? '<b>Closed season now' + (here ? '' : ' on ' + esc(w.name)) + ':</b> ' + esc(closed.join(', ')) : (here ? 'Pick a lake to check its closed seasons.' : '<b>No closed season running</b> on ' + esc(w.name) + ' for the listed fish – check protected zones on the official page.');
    var wb = D.getElementById('fWind'); wb.dataset.la = la; wb.dataset.lo = lo; wb.classList.remove('done'); wb.innerHTML = '';
    if (window.DMLive && DMLive.wind) DMLive.wind(wb);
  }
  sel.addEventListener('change', function () { here = null; render(); if (map) map.flyTo({ center: [DATA.waters[+sel.value].lo, DATA.waters[+sel.value].la], zoom: 10 }); });
  D.getElementById('fHere').addEventListener('click', function () {
    var b = this; if (!navigator.geolocation) return; b.textContent = 'Locating…';
    navigator.geolocation.getCurrentPosition(function (g) { here = [g.coords.latitude, g.coords.longitude]; b.textContent = 'Using your location'; render(); if (map) map.flyTo({ center: [here[1], here[0]], zoom: 11 }); },
      function () { b.textContent = 'Location blocked'; }, { timeout: 10000, maximumAge: 600000 });
  });
  render(); setInterval(render, 10 * 60e3);

  /* map */
  var map = null, mapBox = D.getElementById('fMap');
  function initMap() {
    if (!window.maplibregl || !mapBox) return;
    map = new maplibregl.Map({ container: mapBox, style: 'https://tiles.openfreemap.org/styles/liberty', center: [8.2, 46.9], zoom: 7, attributionControl: { compact: true } });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    DATA.waters.forEach(function (w, i) {
      var el = D.createElement('button'); el.type = 'button'; el.className = 'fMk'; el.innerHTML = '<svg class="ic" aria-hidden="true"><use href="/icons.svg#i-fish"/></svg>'; el.title = w.name;
      el.addEventListener('click', function () { sel.value = i; here = null; render(); var c = D.getElementById('water-' + w.id); if (c) c.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
      new maplibregl.Marker({ element: el }).setLngLat([w.lo, w.la]).addTo(map);
    });
  }
  var osm = [], osmMk = [];
  var EP = ['https://overpass.private.coffee/api/interpreter', 'https://overpass.kumi.systems/api/interpreter'];
  function overpass(q, i) { i = i || 0; return fetch(EP[i], { method: 'POST', body: 'data=' + encodeURIComponent(q) }).then(function (r) { if (!r.ok) throw 0; return r.json(); }).catch(function (e) { if (i + 1 < EP.length) return overpass(q, i + 1); throw e; }); }
  D.getElementById('fOsm').addEventListener('click', function () {
    var b = this, st = D.getElementById('fOsmS');
    if (!map) return; if (map.getZoom() < 9) { st.textContent = 'Zoom in a little closer first (to one lake or town).'; return; }
    var bb = map.getBounds(), q = '[out:json][timeout:20];(node["leisure"="fishing"](' + [bb.getSouth(), bb.getWest(), bb.getNorth(), bb.getEast()].map(function (x) { return x.toFixed(4); }).join(',') + ');way["leisure"="fishing"](' + [bb.getSouth(), bb.getWest(), bb.getNorth(), bb.getEast()].map(function (x) { return x.toFixed(4); }).join(',') + '););out center 150;';
    b.disabled = true; st.textContent = 'Asking OpenStreetMap…';
    overpass(q).then(function (j) {
      osmMk.forEach(function (m) { m.remove(); }); osmMk = [];
      var els = (j.elements || []).filter(function (e) { return (e.lat || (e.center && e.center.lat)); });
      els.forEach(function (e) {
        var la = e.lat || e.center.lat, lo = e.lon || e.center.lon, t = e.tags || {};
        var el = D.createElement('span'); el.className = 'fOsm'; el.title = t.name || 'Fishing spot (OpenStreetMap)';
        var pop = new maplibregl.Popup({ offset: 10 }).setHTML('<b>' + esc(t.name || 'Fishing spot') + '</b><br><small>OpenStreetMap' + (t.access ? ' · access: ' + esc(t.access) : '') + (t.fishing ? ' · fishing: ' + esc(t.fishing) : '') + '</small><br><a href="https://www.openstreetmap.org/' + e.type + '/' + e.id + '" target="_blank" rel="noopener">Details</a> · <a href="https://www.google.com/maps/dir/?api=1&destination=' + la + ',' + lo + '" target="_blank" rel="noopener">Route</a>');
        osmMk.push(new maplibregl.Marker({ element: el }).setLngLat([lo, la]).setPopup(pop).addTo(map));
      });
      st.textContent = els.length ? els.length + ' fishing spots mapped by OpenStreetMap volunteers here. Mapped is not the same as allowed – check the rules below.' : 'No fishing spots mapped in this area yet. Free shore angling may still be allowed – see the rules below.';
    }).catch(function () { st.textContent = 'OpenStreetMap did not answer. Try again in a minute.'; }).then(function () { b.disabled = false; });
  });
  var tries = 0; (function wait() { if (window.maplibregl) initMap(); else if (++tries < 60) setTimeout(wait, 250); })();
})();
