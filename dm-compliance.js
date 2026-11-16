/* DipMapper compliance layer 23.36
   1) Weather: Open-Meteo's free API is non-commercial only, so every Open-Meteo request is answered from MET Norway (CC BY 4.0, free for commercial use) instead.
   2) Nominatim (OpenStreetMap geocoder) usage policy: max 1 request per second, cache results – enforced here for every call on the page.
   3) Ads: Google AdSense only loads after the visitor agrees (dm_ad_consent = yes). */
(function () {
  'use strict';
  var F = window.fetch.bind(window);
  // ---------- MET Norway adapter answering Open-Meteo-shaped requests ----------
  function wmo(sym) {
    sym = String(sym || '').replace(/_(day|night|polartwilight)$/, '');
    if (/thunder/.test(sym)) return 95;
    if (/heavysnow/.test(sym)) return 75; if (/lightsnow/.test(sym)) return 71; if (/snow/.test(sym)) return 73;
    if (/sleet/.test(sym)) return 66;
    if (/heavyrainshowers/.test(sym)) return 82; if (/lightrainshowers/.test(sym)) return 80; if (/rainshowers/.test(sym)) return 81;
    if (/heavyrain/.test(sym)) return 65; if (/lightrain/.test(sym)) return 61; if (/rain/.test(sym)) return 63;
    if (/fog/.test(sym)) return 45; if (sym === 'cloudy') return 3; if (sym === 'partlycloudy') return 2; if (sym === 'fair') return 1; return 0;
  }
  function sun(lat, lon, d) { // NOAA sunrise equation, returns [riseMs, setMs] UTC for date d (UTC midnight)
    var r = Math.PI / 180, n = Math.floor(d / 864e5) - 10957 + 0.0008, J = n - lon / 360, M = (357.5291 + 0.98560028 * J) % 360,
      C = 1.9148 * Math.sin(M * r) + 0.02 * Math.sin(2 * M * r) + 0.0003 * Math.sin(3 * M * r), L = (M + C + 180 + 102.9372) % 360,
      Jt = 2451545 + J + 0.0053 * Math.sin(M * r) - 0.0069 * Math.sin(2 * L * r), dec = Math.asin(Math.sin(L * r) * Math.sin(23.44 * r)),
      cw = (Math.sin(-0.833 * r) - Math.sin(lat * r) * Math.sin(dec)) / (Math.cos(lat * r) * Math.cos(dec));
    if (cw < -1 || cw > 1) return [null, null];
    var w = Math.acos(cw) / r / 360, toMs = function (j) { return (j - 2440587.5) * 864e5; };
    return [toMs(Jt - w), toMs(Jt + w)];
  }
  function iso(ms) { return new Date(ms).toISOString().slice(0, 16) + 'Z'; }
  function metAsOpenMeteo(url) {
    var u = new URL(url), lat = +u.searchParams.get('latitude'), lon = +u.searchParams.get('longitude');
    var off = Math.round(lon / 15) * 3600e3; // approximate local day for daily aggregation
    return F('https://api.met.no/weatherapi/locationforecast/2.0/complete?lat=' + lat.toFixed(4) + '&lon=' + lon.toFixed(4))
      .then(function (r) { if (!r.ok) throw new Error('met ' + r.status); return r.json(); })
      .then(function (j) {
        var ts = (j.properties && j.properties.timeseries) || [], H = { time: [], temperature_2m: [], apparent_temperature: [], precipitation: [], precipitation_probability: [], weather_code: [], wind_speed_10m: [], wind_gusts_10m: [], wind_direction_10m: [], cloud_cover: [], uv_index: [] }, days = {};
        ts.forEach(function (t) {
          var ms = Date.parse(t.time), ins = (t.data.instant || {}).details || {}, n1 = t.data.next_1_hours, n6 = t.data.next_6_hours, nx = n1 || n6 || {};
          var pr = n1 && n1.details ? n1.details.precipitation_amount : (n6 && n6.details ? n6.details.precipitation_amount / 6 : 0), code = wmo(nx.summary && nx.summary.symbol_code);
          var pp = (n1 && n1.details && n1.details.probability_of_precipitation) != null ? n1.details.probability_of_precipitation : (n6 && n6.details ? n6.details.probability_of_precipitation : null);
          H.time.push(iso(ms)); H.temperature_2m.push(ins.air_temperature); H.apparent_temperature.push(ins.air_temperature); H.precipitation.push(pr || 0); H.precipitation_probability.push(pp); H.weather_code.push(code); H.wind_speed_10m.push((ins.wind_speed || 0) * 3.6); H.wind_gusts_10m.push(ins.wind_speed_of_gust != null ? ins.wind_speed_of_gust * 3.6 : (ins.wind_speed || 0) * 5); H.wind_direction_10m.push(ins.wind_from_direction); H.cloud_cover.push(ins.cloud_area_fraction); H.uv_index.push(ins.ultraviolet_index_clear_sky);
          var dk = new Date(ms + off).toISOString().slice(0, 10), D = days[dk] || (days[dk] = { tmax: -99, tmin: 99, pp: null, w: 0, codes: [] });
          if (ins.air_temperature != null) { D.tmax = Math.max(D.tmax, ins.air_temperature); D.tmin = Math.min(D.tmin, ins.air_temperature); }
          if (pp != null) D.pp = Math.max(D.pp || 0, pp); D.w = Math.max(D.w, (ins.wind_speed || 0) * 3.6); D.codes.push(code);
        });
        var keys = Object.keys(days).sort(), want = +(u.searchParams.get('forecast_days') || 7);
        keys = keys.slice(0, want);
        var daily = { time: keys, weather_code: [], temperature_2m_max: [], temperature_2m_min: [], precipitation_probability_max: [], wind_speed_10m_max: [], sunrise: [], sunset: [] };
        keys.forEach(function (k) {
          var D = days[k], c = D.codes.slice().sort(function (a, b) { return b - a; });
          daily.weather_code.push(c[Math.floor(c.length / 3)] || 0); daily.temperature_2m_max.push(D.tmax); daily.temperature_2m_min.push(D.tmin);
          daily.precipitation_probability_max.push(D.pp != null ? Math.round(D.pp) : null); daily.wind_speed_10m_max.push(Math.round(D.w));
          var s = sun(lat, lon, Date.parse(k + 'T00:00Z')); daily.sunrise.push(s[0] ? iso(s[0]) : null); daily.sunset.push(s[1] ? iso(s[1]) : null);
        });
        var now = Date.now(), i0 = 0; for (var i = 0; i < H.time.length; i++) { if (Date.parse(H.time[i]) <= now) i0 = i; else break; }
        var sr = sun(lat, lon, Date.parse(new Date(now).toISOString().slice(0, 10) + 'T00:00Z')), isDay = sr[0] ? (now > sr[0] && now < sr[1] ? 1 : 0) : 1;
        var cur = { time: H.time[i0], is_day: isDay };
        Object.keys(H).forEach(function (k) { if (k !== 'time') cur[k] = H[k][i0]; }); cur.rain = cur.precipitation;
        var out = { latitude: lat, longitude: lon, timezone: 'GMT', utc_offset_seconds: 0, current: cur, hourly: H, daily: daily, attribution: 'MET Norway (CC BY 4.0)' };
        return new Response(JSON.stringify(out), { status: 200, headers: { 'Content-Type': 'application/json' } });
      });
  }
  function pastViaNasa(url) {
    var u = new URL(url), lat = +u.searchParams.get('latitude'), lon = +u.searchParams.get('longitude'), pd = +u.searchParams.get('past_days') || 30;
    var f = function (d) { return d.toISOString().slice(0, 10).replace(/-/g, ''); }, end = new Date(), start = new Date(end.getTime() - pd * 864e5);
    var q = 'https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M,PRECTOTCORR,PRECSNOLAND&community=RE&format=JSON&latitude=' + lat.toFixed(3) + '&longitude=' + lon.toFixed(3) + '&start=' + f(start) + '&end=' + f(end);
    return Promise.all([F(q).then(function (r) { if (!r.ok) throw 0; return r.json(); }), metAsOpenMeteo('https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lon + '&forecast_days=2').then(function (r) { return r.json(); }).catch(function () { return null; })])
      .then(function (x) {
        var P = x[0].properties.parameter, keys = Object.keys(P.T2M).sort(), d = { time: [], temperature_2m_mean: [], precipitation_sum: [], snowfall_sum: [] }, last = null;
        keys.forEach(function (k) { var t = P.T2M[k]; if (t == null || t <= -998) return; d.time.push(k.slice(0, 4) + '-' + k.slice(4, 6) + '-' + k.slice(6, 8)); d.temperature_2m_mean.push(t); var pr = P.PRECTOTCORR[k], sn = P.PRECSNOLAND ? P.PRECSNOLAND[k] : 0; d.precipitation_sum.push(pr > -998 ? pr : 0); d.snowfall_sum.push(sn > -998 ? sn / 10 : 0); last = d.time[d.time.length - 1]; });
        var today = new Date().toISOString().slice(0, 10), M = x[1] && x[1].daily;
        if (M) { var mi = M.time.indexOf(today); if (mi >= 0 && last !== today) { d.time.push(today); d.temperature_2m_mean.push((M.temperature_2m_max[mi] + M.temperature_2m_min[mi]) / 2); d.precipitation_sum.push(0); d.snowfall_sum.push(0); } }
        return new Response(JSON.stringify({ latitude: lat, longitude: lon, daily: d, attribution: 'NASA POWER (public domain) and MET Norway (CC BY 4.0)' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
      });
  }
  // ---------- Waves: NOAA WAVEWATCH III via PacIOOS ERDDAP (public domain), JSONP ----------
  var jn = 0;
  function jsonp(url) { return new Promise(function (res, rej) { var cb = '__dmw' + (++jn), s = document.createElement('script'), t = setTimeout(function () { clean(); rej(0); }, 9000); function clean() { clearTimeout(t); try { delete window[cb]; } catch (e) { window[cb] = undefined; } s.remove(); } window[cb] = function (j) { clean(); res(j); }; s.src = url + '&.jsonp=' + cb; s.onerror = function () { clean(); rej(0); }; document.head.appendChild(s); }); }
  function marineViaWW3(url) {
    var u = new URL(url), lat = +u.searchParams.get('latitude'), lon = +u.searchParams.get('longitude'), x = (lon + 360) % 360;
    var q = function (v) { return v + '[(last)][(0.0)][(' + Math.max(-77.5, lat - 0.5).toFixed(2) + '):(' + Math.min(77.5, lat + 0.5).toFixed(2) + ')][(' + Math.max(0, x - 0.5).toFixed(2) + '):(' + Math.min(359.5, x + 0.5).toFixed(2) + ')]'; };
    return jsonp('https://pae-paha.pacioos.hawaii.edu/erddap/griddap/ww3_global.json?' + ['Thgt', 'Tper', 'Tdir'].map(q).join(',')).then(function (j) {
      var t = j.table, c = t.columnNames, R = t.rows, best = null, bd = 1e9, iy = c.indexOf('latitude'), ix = c.indexOf('longitude'), ih = c.indexOf('Thgt'), ip = c.indexOf('Tper'), idr = c.indexOf('Tdir');
      R.forEach(function (r) { if (r[ih] == null || isNaN(r[ih])) return; var d = Math.pow(r[iy] - lat, 2) + Math.pow(r[ix] - x, 2); if (d < bd) { bd = d; best = r; } });
      if (!best) return new Response('{}', { status: 200, headers: { 'Content-Type': 'application/json' } });
      return new Response(JSON.stringify({ current: { wave_height: best[ih], wave_period: best[ip], wave_direction: best[idr], swell_wave_height: null, swell_wave_period: null, sea_surface_temperature: null }, attribution: 'NOAA WAVEWATCH III via PacIOOS (public domain)' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    });
  }
  // ---------- Nominatim: 1 request/second queue + cache ----------
  var NQ = Promise.resolve(), last = 0, NC = {};
  try { NC = JSON.parse(sessionStorage.getItem('dm_nom') || '{}'); } catch (e) {}
  function nominatim(url, init) {
    if (NC[url]) return Promise.resolve(new Response(NC[url], { status: 200, headers: { 'Content-Type': 'application/json' } }));
    var p = NQ.then(function () {
      var wait = Math.max(0, last + 1100 - Date.now());
      return new Promise(function (res) { setTimeout(res, wait); });
    }).then(function () {
      last = Date.now();
      return F(url, init).then(function (r) { return r.text().then(function (t) { if (r.ok) { NC[url] = t; try { sessionStorage.setItem('dm_nom', JSON.stringify(NC).slice(0, 2e6)); } catch (e) {} } return new Response(t, { status: r.status, headers: { 'Content-Type': 'application/json' } }); }); });
    });
    NQ = p.catch(function () {});
    return p;
  }
  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || '';
    if (url.indexOf('https://api.open-meteo.com/v1/forecast') === 0) return /[?&]past_days=/.test(url) ? pastViaNasa(url) : metAsOpenMeteo(url);
    if (url.indexOf('https://marine-api.open-meteo.com/') === 0) return marineViaWW3(url);
    if (/^https:\/\/[a-z-]*\.?open-meteo\.com\//.test(url)) return Promise.resolve(new Response('{"error":true,"reason":"not used: non-commercial service"}', { status: 503, headers: { 'Content-Type': 'application/json' } }));
    if (url.indexOf('https://nominatim.openstreetmap.org/') === 0) return nominatim(url, init);
    return F(input, init);
  };
  // ---------- Ad consent ----------
  function choice() { try { return localStorage.getItem('dm_ad_consent'); } catch (e) { return null; } }
  window.dmAdConsent = choice;
  function setChoice(v) { try { localStorage.setItem('dm_ad_consent', v); } catch (e) {} var b = document.getElementById('dmConsent'); if (b) b.remove(); if (v === 'yes') window.dispatchEvent(new Event('dm-ad-consent')); }
  window.dmConsentOpen = function () { var b = document.getElementById('dmConsent'); if (b) b.remove(); banner(true); };
  function banner(force) {
    if (!force && choice()) return;
    if (!document.querySelector('script[data-dm-ads]') && !force) return; // only pages that show ads ask
    var d = document.createElement('div'); d.id = 'dmConsent'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-label', 'Ad cookies');
    d.innerHTML = '<p><b>Ads keep DipMapper free.</b> May Google AdSense use cookies to show ads? You can change this any time under <a href="/cookies">Cookies</a>.</p><div><button type="button" data-v="no">No thanks</button><button type="button" data-v="yes" class="y">Accept</button></div>';
    d.addEventListener('click', function (e) { var v = e.target.getAttribute && e.target.getAttribute('data-v'); if (v) setChoice(v); });
    document.body.appendChild(d);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { banner(false); }); else banner(false);
})();
