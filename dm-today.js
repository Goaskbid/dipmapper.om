/*! DipMapper (c) 2026 Torsten Sauter. All rights reserved. dipmapper.com/terms */
/* "Today at the water": sun, golden hour, moon, tides, weather and official water quality for one point. */
(function (W) {
  var R = Math.PI / 180, D = document;
  function ic(n) { return '<svg class="ic" aria-hidden="true"><use href="/icons.svg#i-' + n + '"/></svg>'; }
  function E(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  // ---- sun (NOAA algorithm) ----
  function jd(t) { return t / 864e5 + 2440587.5; }
  function sunEvent(date, la, lo, alt, rising) {
    var lw = -lo * R, ph = la * R, J0 = 0.0009, d = jd(date.getTime()) - 2451545;
    var n = Math.round(d - J0 - lw / (2 * Math.PI)), ds = J0 + lw / (2 * Math.PI) + n;
    var M = R * (357.5291 + 0.98560028 * ds), C = R * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
    var L = M + C + R * 102.9372 + Math.PI, dec = Math.asin(Math.sin(L) * Math.sin(R * 23.4397));
    var Jn = 2451545 + ds + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);
    var c = (Math.sin(alt * R) - Math.sin(ph) * Math.sin(dec)) / (Math.cos(ph) * Math.cos(dec));
    if (c > 1) return 'down'; if (c < -1) return 'up';
    var w = Math.acos(c), a = J0 + (w + lw) / (2 * Math.PI) + n, Js = 2451545 + a + 0.0053 * Math.sin(M) - 0.0069 * Math.sin(2 * L);
    var j = rising ? Jn - (Js - Jn) : Js;
    return (j - 2440587.5) * 864e5;
  }
  // ---- moon (mean synodic month from the new moon of 6 Jan 2000, 18:14 UTC) ----
  var SYN = 29.530588853, NM0 = Date.UTC(2000, 0, 6, 18, 14);
  function moon(t) {
    var a = ((t - NM0) / 864e5) % SYN; if (a < 0) a += SYN;
    var p = a / SYN, ill = (1 - Math.cos(2 * Math.PI * p)) / 2;
    var nm = ['New moon', 'Waxing crescent', 'First quarter', 'Waxing gibbous', 'Full moon', 'Waning gibbous', 'Last quarter', 'Waning crescent'][Math.floor((p * 8) + 0.5) % 8];
    var full = t + ((0.5 - p + (p > 0.5 ? 1 : 0)) * SYN) * 864e5, nw = t + ((1 - p) * SYN) * 864e5;
    return { p: p, ill: ill, name: nm, full: full, nw: nw, age: a };
  }
  function moonSvg(p) {
    var r = 18, cx = 20, cy = 20, k = Math.cos(2 * Math.PI * p), rx = Math.abs(k) * r, s;
    if (p < 0.5) s = 'M' + cx + ' ' + (cy - r) + 'A' + r + ' ' + r + ' 0 0 1 ' + cx + ' ' + (cy + r) + 'A' + rx + ' ' + r + ' 0 0 ' + (k > 0 ? 0 : 1) + ' ' + cx + ' ' + (cy - r);
    else s = 'M' + cx + ' ' + (cy - r) + 'A' + r + ' ' + r + ' 0 0 0 ' + cx + ' ' + (cy + r) + 'A' + rx + ' ' + r + ' 0 0 ' + (k > 0 ? 1 : 0) + ' ' + cx + ' ' + (cy - r);
    return '<svg class="tdMoon" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="#1d3440"/><path d="' + s + '" fill="#f3e6b3"/><circle cx="20" cy="20" r="18" fill="none" stroke="#9fb3bb" stroke-width="1"/></svg>';
  }
  function fmt(t, tz, o) { try { return new Date(t).toLocaleTimeString('en-GB', Object.assign({ hour: '2-digit', minute: '2-digit', timeZone: tz || undefined }, o || {})); } catch (e) { return new Date(t).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); } }
  function fday(t, tz) { try { return new Date(t).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: tz || undefined }); } catch (e) { return new Date(t).toDateString(); } }
  function km(a, b, c, d) { var x = Math.sin((c - a) * R / 2), y = Math.sin((d - b) * R / 2); return 12742 * Math.asin(Math.sqrt(x * x + Math.cos(a * R) * Math.cos(c * R) * y * y)); }
  var SYM = { clearsky: 'Clear', fair: 'Fair', partlycloudy: 'Partly cloudy', cloudy: 'Cloudy', fog: 'Fog', lightrain: 'Light rain', rain: 'Rain', heavyrain: 'Heavy rain', lightrainshowers: 'Light showers', rainshowers: 'Showers', heavyrainshowers: 'Heavy showers', lightsnow: 'Light snow', snow: 'Snow', sleet: 'Sleet', lightsleet: 'Light sleet', snowshowers: 'Snow showers', rainandthunder: 'Rain and thunder', lightrainandthunder: 'Rain and thunder', heavyrainandthunder: 'Heavy rain and thunder', rainshowersandthunder: 'Showers and thunder' };
  var WQ = { E: 'Excellent', G: 'Good', S: 'Sufficient', P: 'Poor', N: 'Not classified' };
  function render(el) {
    var la = +el.dataset.la, lo = +el.dataset.lo, tz = el.dataset.tz || '', nm = el.dataset.name || 'here';
    if (!isFinite(la) || !isFinite(lo) || el.dataset.la === '') return;
    var key = la.toFixed(3) + ',' + lo.toFixed(3); if (el.dataset.done === key) return; el.dataset.done = key;
    var now = Date.now(), d0 = new Date(now), tzl = tz ? '' : ' <small>(your time)</small>';
    var sr = sunEvent(d0, la, lo, -0.833, true), ss = sunEvent(d0, la, lo, -0.833, false), gh = sunEvent(d0, la, lo, 6, false), gm = sunEvent(d0, la, lo, 6, true);
    var sunTxt = (sr === 'down' || ss === 'down') ? 'The sun stays below the horizon today (polar night).' : (sr === 'up' || ss === 'up') ? 'The sun does not set today (midnight sun).' :
      '<b>' + fmt(sr, tz) + '</b> sunrise · <b>' + fmt(ss, tz) + '</b> sunset' + (typeof gh === 'number' ? '<br><span class="tdS">Golden light ' + (typeof gm === 'number' ? fmt(sr, tz) + '–' + fmt(gm, tz) + ' and ' : '') + fmt(gh, tz) + '–' + fmt(ss, tz) + '</span>' : '');
    var M = moon(now), spring = Math.min(Math.abs(M.age - SYN / 2), M.age, SYN - M.age) <= 2.5;
    var h = '<div class="tdHd"><h2>' + ic('sunrise') + ' Today at the water <small>' + E(fday(now, tz)) + ' · ' + E(nm) + '</small></h2></div><div class="tdG">' +
      (el.dataset.sun === '0' ? '' : '<div class="tdC"><span class="tdL">' + ic('sunrise') + ' Sun' + tzl + '</span><p>' + sunTxt + '</p></div>') +
      '<div class="tdC tdMo">' + moonSvg(M.p) + '<div><span class="tdL">' + ic('moon') + ' Moon</span><p><b>' + M.name + '</b> · ' + Math.round(M.ill * 100) + '% lit<br><span class="tdS">Full moon ' + fday(M.full, tz) + ' · new moon ' + fday(M.nw, tz) + '</span></p></div></div>' +
      '<div class="tdC tdTi"><span class="tdL">' + ic('wave') + ' Tides</span><p class="tdS">Looking for the nearest tide station…</p></div>' +
      '<div class="tdC tdWx"><span class="tdL">' + ic('wind') + ' Weather now</span><p class="tdS">Loading the forecast…</p></div>' +
      '<div class="tdC tdWq" hidden><span class="tdL">' + ic('drop') + ' Official water quality</span><p></p></div></div>' +
      '<p class="tdNote">Sun and moon are calculated for this spot (moon phases are mean dates, accurate to about half a day). ' + (spring ? '<b>Spring tides</b> around this new or full moon: higher highs and lower lows than usual. ' : '') + 'Weather: MET Norway (CC BY 4.0). Tides: EOT20 model, DGFI-TUM (CC BY 4.0).</p>';
    el.innerHTML = h; el.hidden = false;
    var ti = el.querySelector('.tdTi p');
    if (W.DMTide && DMTide.forPoint) {
      DMTide.forPoint(la, lo, function (r) {
        if (!r || !r.hc) { ti.textContent = 'No tide station near this point – lakes and rivers have no tides, and some coasts are not covered yet.'; return; }
        var x = DMTide.extremes(r.hc, now, now + 30 * 36e5).slice(0, 4);
        if (!x.length) { ti.textContent = 'No tide turning point in the next 30 hours.'; return; }
        ti.className = ''; ti.innerHTML = '<span class="tdTG">' + x.map(function (e) { return '<span class="tdT ' + (e.hi ? 'hi' : 'lo') + '">' + (e.hi ? '▲ High' : '▼ Low') + ' <b>' + fmt(e.t, tz) + '</b> <small>' + (e.h >= 0 ? '+' : '') + e.h.toFixed(1) + ' m</small></span>'; }).join('') + '</span>' + (r.km ? '<br><span class="tdS">Model point ' + Math.round(r.km) + ' km away</span>' : '');
      });
    } else ti.textContent = 'Tide data could not be loaded.';
    var wx = el.querySelector('.tdWx p');
    fetch('https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=' + la.toFixed(3) + '&lon=' + lo.toFixed(3)).then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (j) {
      var ts = j.properties.timeseries, c = ts[0].data, i = c.instant.details, sym = ((c.next_1_hours || c.next_6_hours || {}).summary || {}).symbol_code || '';
      var hi = -99, lo2 = 99, rn = 0, end = now + 24 * 36e5; ts.forEach(function (t) { var tt = Date.parse(t.time); if (tt < end) { var v = t.data.instant.details.air_temperature; if (v > hi) hi = v; if (v < lo2) lo2 = v; var n1 = t.data.next_1_hours; if (n1) rn += n1.details.precipitation_amount || 0; } });
      wx.className = ''; wx.innerHTML = '<b>' + Math.round(i.air_temperature) + '°C</b> · ' + E(SYM[sym.replace(/_(day|night|polartwilight)$/, '')] || '') + '<br><span class="tdS">Wind ' + Math.round(i.wind_speed) + ' m/s · next 24 h ' + Math.round(lo2) + '–' + Math.round(hi) + '°C' + (rn >= 0.5 ? ', ' + Math.round(rn) + ' mm rain' : ', dry') + '</span>';
    }).catch(function () { wx.textContent = 'The forecast is not available right now.'; });
    var wq = el.querySelector('.tdWq');
    fetch('/water/index.json').then(function (r) { return r.ok ? r.json() : null; }).then(function (ix) {
      if (!ix) return; var k = (Math.floor(la / ix.tile_deg) * ix.tile_deg) + '_' + (Math.floor(lo / ix.tile_deg) * ix.tile_deg); if (ix.tiles.indexOf(k) < 0) return;
      return fetch('/water/w_' + k + '.json').then(function (r) { return r.json(); }).then(function (t) {
        var b = null, bd = 9; t.p.forEach(function (p) { var dd = km(la, lo, p[0], p[1]); if (dd < bd) { bd = dd; b = p; } }); if (!b) return;
        var q = WQ[b[5].charAt(0)] || 'Not classified';
        wq.querySelector('p').innerHTML = '<b class="wq' + b[5].charAt(0) + '">' + q + '</b> (' + t.y[0] + ')<br><span class="tdS">' + E(b[2]) + ', ' + (bd < 1 ? 'right here' : bd.toFixed(1) + ' km') + ' · EEA (CC BY 4.0)</span>'; wq.hidden = false;
      });
    }).catch(function () {});
  }
  function all() { [].forEach.call(D.querySelectorAll('.dmToday'), render); }
  W.DMToday = { render: render, all: all, moon: moon, sun: sunEvent };
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', all); else all();
})(window);
