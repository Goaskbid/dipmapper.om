/*! DipMapper (c) 2026 Torsten Sauter. All rights reserved. dipmapper.com/terms */
/* Water butler: the best hours today from the MET Norway forecast, tonight's sunset with the nearest beach bar, dinner by the water,
   what to bring, add to calendar, share – plus a saved list. Forecast: MET Norway (CC BY 4.0). Places: OpenStreetMap (ODbL). */
(function (W) {
  var D = document, H = 36e5, MET = 'https://api.met.no/weatherapi/locationforecast/2.0/compact';
  function E(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function ic(n) { return '<svg class="ic" aria-hidden="true"><use href="/icons.svg#i-' + n + '"/></svg>'; }
  function tm(t, tz) { try { return new Date(t).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: tz || undefined }); } catch (e) { return new Date(t).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }); } }
  function day(t, tz) { try { return new Date(t).toLocaleDateString('en-GB', { weekday: 'long', timeZone: tz || undefined }); } catch (e) { return ''; } }
  function ymd(t, tz) { try { return new Date(t).toLocaleDateString('en-CA', { timeZone: tz || undefined }); } catch (e) { return new Date(t).toISOString().slice(0, 10); } }
  function getLoc() { try { var c = JSON.parse(localStorage.getItem('dm_loc') || 'null'); if (c && typeof c.la === 'number' && typeof c.lo === 'number' && isFinite(c.la) && isFinite(c.lo) && Math.abs(c.la) <= 90 && Math.abs(c.lo) <= 180 && typeof c.t === 'number' && c.t <= Date.now() + 6e4 && Date.now() - c.t < 432e5) return c; } catch (e) {} return null; }
  function fc(la, lo) {
    var k = 'dm_btl_' + la.toFixed(2) + '_' + lo.toFixed(2), c = null;
    try { c = JSON.parse(sessionStorage.getItem(k) || 'null'); } catch (e) {}
    if (c && Date.now() - c.t < H) return Promise.resolve(c.j);
    var ep = W.DM_FORECAST_ENDPOINT === '/api/forecast' ? '/api/forecast' : MET;
    return fetch(ep + '?lat=' + la.toFixed(3) + '&lon=' + lo.toFixed(3)).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (j) { if (!j || !j.properties || !Array.isArray(j.properties.timeseries)) throw new Error('schema'); try { sessionStorage.setItem(k, JSON.stringify({ t: Date.now(), j: j })); } catch (e) {} return j; });
  }
  /* ---------- scoring: one hour of the forecast ---------- */
  var MODE = {
    swim: { t0: 18, t1: 28, wt: 40, ww: 25, wr: 20, wc: 15, name: 'beach and swim', short: 'swim' },
    boat: { t0: 12, t1: 24, wt: 20, ww: 45, wr: 25, wc: 10, name: 'time on the water', short: 'boat' },
    out: { t0: 10, t1: 24, wt: 25, ww: 25, wr: 35, wc: 15, name: 'time outdoors', short: 'outdoor' }
  };
  function hour(p, m) {
    var d = p.data.instant.details, n1 = p.data.next_1_hours || p.data.next_6_hours, rain = n1 && n1.details ? n1.details.precipitation_amount : null;
    var T = d.air_temperature, ws = d.wind_speed, cl = d.cloud_area_fraction;
    if (!isFinite(T) || !isFinite(ws)) return null;
    var s = Math.max(0, Math.min(1, (T - m.t0) / (m.t1 - m.t0))) * m.wt;
    s += (ws <= 4 ? 1 : ws <= 7 ? .6 : ws <= 10 ? .2 : 0) * m.ww;
    s += (rain == null ? .5 : rain === 0 ? 1 : rain < .3 ? .5 : 0) * m.wr;
    s += (isFinite(cl) ? (100 - cl) / 100 : .5) * m.wc;
    return { t: Date.parse(p.time), s: s, T: T, ws: ws, rain: rain, cl: cl, sym: n1 && n1.summary ? n1.summary.symbol_code : '' };
  }
  function plan(j, la, lo, mode, tz) {
    var m = MODE[mode] || MODE.swim, now = Date.now(), S = W.DMToday && DMToday.sun;
    var hs = j.properties.timeseries.map(function (p) { return hour(p, m); }).filter(function (h) { return h && h.t >= now - H / 2 && h.t <= now + 48 * H; });
    function light(t) { if (!S) return true; var d = new Date(t), up = S(d, la, lo, -0.833, true), dn = S(d, la, lo, -0.833, false); if (typeof up !== 'number' || typeof dn !== 'number') return true; return t >= up && t + H <= dn + 0.5 * H; }
    var best = null, today = ymd(now, tz);
    for (var i = 0; i + 1 < hs.length; i++) {
      var a = hs[i], b = hs[i + 1]; if (b.t - a.t > H + 60000 || !light(a.t) || !light(b.t)) continue;
      var sc = (a.s + b.s) / 2, w = { t: a.t, e: b.t + H, s: sc, a: a, b: b, today: ymd(a.t, tz) === today };
      if (!best || (w.today && !best.today && sc >= best.s - 8) || (w.today === best.today && sc > best.s) || (!best.today && !w.today && sc > best.s)) best = w;
    }
    var bd = best ? ymd(best.t, tz) : today, dayHs = hs.filter(function (h) { return ymd(h.t, tz) === bd; }), litHs = dayHs.filter(function (h) { return light(h.t); }), mx = -99, mn = 99, rain = 0;
    (litHs.length ? litHs : dayHs.length ? dayHs : hs.slice(0, 12)).forEach(function (h) { mx = Math.max(mx, h.T); mn = Math.min(mn, h.T); });
    dayHs.forEach(function (h) { rain += h.rain || 0; });
    return { best: best, mx: mx, mn: mn, rain: rain, dayLbl: bd === today ? 'Today' : bd === ymd(now + 24 * H, tz) ? 'Tomorrow' : day(best.t, tz), wsMax: Math.max.apply(null, hs.slice(0, 14).map(function (h) { return h.ws; })), m: m };
  }
  function verdict(s) { return s >= 70 ? ['Good', 'btG'] : s >= 45 ? ['Fair', 'btF'] : ['Poor', 'btP']; }
  function bring(p, mode, sunHigh) {
    var L = [];
    if (mode === 'swim') L.push('Towel and swimwear');
    if (sunHigh && p.best && p.best.a.cl < 60) L.push('Sunscreen, hat and sunglasses – the sun is high at midday');
    if (p.mx >= 25) L.push('At least 1.5 litres of water and some shade');
    if (p.rain >= 0.5) L.push('A rain jacket – ' + p.rain.toFixed(1) + ' mm of rain forecast ' + p.dayLbl.toLowerCase().replace(/^(mon|tues|wednes|thurs|fri|satur|sun)day$/, 'on $&'));
    if (p.wsMax >= 8) L.push('A windproof layer – gusty wind, check the beach flags');
    if (p.mn < 16) L.push('A warm layer for after the water – ' + Math.round(p.mn) + '°C at the coolest');
    if (mode === 'boat') L.push('Something warm for the deck, even on sunny days');
    if (mode === 'swim' && p.mx < 22) L.push('A wetsuit or swim shoes if the water is cold');
    return L.slice(0, 5);
  }
  /* ---------- calendar and share ---------- */
  function ics(evs, name) {
    function f(t) { return new Date(t).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
    var s = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//DipMapper//Water butler//EN\r\n' + evs.map(function (e, i) {
      return 'BEGIN:VEVENT\r\nUID:' + f(e.s) + '-' + i + '@dipmapper.com\r\nDTSTAMP:' + f(Date.now()) + '\r\nDTSTART:' + f(e.s) + '\r\nDTEND:' + f(e.e) + '\r\nSUMMARY:' + e.n.replace(/[,;]/g, ' ') + '\r\nDESCRIPTION:' + (e.d || '').replace(/[,;\n]/g, ' ') + ' – dipmapper.com\r\nBEGIN:VALARM\r\nTRIGGER:-PT30M\r\nACTION:DISPLAY\r\nDESCRIPTION:' + e.n.replace(/[,;]/g, ' ') + '\r\nEND:VALARM\r\nEND:VEVENT\r\n';
    }).join('') + 'END:VCALENDAR\r\n';
    var a = D.createElement('a'); a.href = URL.createObjectURL(new Blob([s], { type: 'text/calendar;charset=utf-8' })); a.download = (name || 'dipmapper') + '.ics'; D.body.appendChild(a); a.click(); setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  function share(txt, btn) {
    var u = location.href.split('#')[0];
    if (navigator.share) { navigator.share({ title: 'My water plan', text: txt, url: u }).catch(function () {}); return; }
    var done = function () { btn.lastChild.textContent = 'Copied – paste it anywhere'; };
    if (navigator.clipboard) navigator.clipboard.writeText(txt + '\n' + u).then(done, function () { W.open('https://wa.me/?text=' + encodeURIComponent(txt + '\n' + u), '_blank', 'noopener'); });
    else W.open('https://wa.me/?text=' + encodeURIComponent(txt + '\n' + u), '_blank', 'noopener');
  }
  /* ---------- the card ---------- */
  function render(el, pt) {
    var la = pt.la, lo = pt.lo, tz = el.dataset.tz || '', mode = el.dataset.mode || 'swim', nm = el.dataset.n || pt.n || '';
    var here = nm ? E(nm) : 'near you';
    el.innerHTML = '<div class="btH"><h2>' + ic('sparkle') + ' Your water butler</h2><p class="btSub">' + (el.classList.contains('btPick') ? 'Planning ' + here + ': the best hours, the evening and what to bring.' : 'Your day ' + (nm ? 'in ' + here : here) + ', planned in one place.') + '</p></div><div class="btG2"><div class="btC btBest"><p class="tdS">Reading the forecast…</p></div><div class="btC btEve"><p class="tdS">Finding tonight\'s sunset…</p></div><div class="btC btBring"></div></div><div class="btAct"></div><p class="btSrc">Forecast: <a href="https://api.met.no/" target="_blank" rel="noopener">MET Norway</a> (CC BY 4.0) for air, wind, rain and cloud – check the water, flags and lifeguards on the spot. Places: OpenStreetMap (ODbL).</p>';
    el.hidden = false;
    var bx = el.querySelector('.btBest'), ev = el.querySelector('.btEve'), br = el.querySelector('.btBring'), act = el.querySelector('.btAct'), events = [], lines = [];
    var S = W.DMToday && DMToday.sun, now = Date.now(), ss = S ? S(new Date(), la, lo, -0.833, false) : null;
    var ssTom = false; if (typeof ss === 'number' && ss < now) { ss = S(new Date(now + 24 * H), la, lo, -0.833, false); ssTom = true; }
    var noon = S && typeof ss === 'number' ? (S(new Date(), la, lo, -0.833, true) + ss) / 2 : null, sunHigh = false;
    if (noon) { var dec = 23.44 * Math.sin((2 * Math.PI / 365) * ((Date.now() / 864e5 + 10) % 365.25 - 81)); sunHigh = 90 - Math.abs(la - dec) >= 45; }
    fc(la, lo).then(function (j) {
      var p = plan(j, la, lo, mode, tz);
      if (!p.best) { bx.innerHTML = '<h3>' + ic('sunrise') + ' Best hours</h3><p>No daylight hours are left in the forecast window.</p>'; return; }
      var b = p.best, v = verdict(b.s), when = p.dayLbl + ' ' + tm(b.t, tz) + '–' + tm(b.e, tz);
      bx.innerHTML = '<h3>' + ic('sunrise') + ' Best hours for ' + p.m.name + '</h3><p class="btW"><b>' + when + '</b> <span class="btV ' + v[1] + '">' + v[0] + '</span></p><p class="btDet">' + Math.round(b.a.T) + '°C · wind ' + b.a.ws.toFixed(0) + ' m/s · ' + (b.a.rain ? b.a.rain.toFixed(1) + ' mm rain' : 'dry') + (isFinite(b.a.cl) ? ' · ' + Math.round(b.a.cl) + '% cloud' : '') + '</p>'
        + (b.s < 45 ? '<p class="tdS">' + (mode === 'boat' ? 'Rough for an open deck – take a seat inside, or make it <a href="/boat-trips-with-food">a boat trip with lunch</a>.' : 'Not a great ' + p.m.short + ' day – <a href="/boat-trips-with-food">a boat trip with lunch</a> or <a href="/wildlife-calendar">sea life in season</a> work in most weather.') + '</p>' : '') + '<p class="tdS">' + p.dayLbl + ' in daylight ' + Math.round(p.mn) + ' to ' + Math.round(p.mx) + '°C' + (p.rain >= .1 ? ', ' + p.rain.toFixed(1) + ' mm rain over the day' : ', dry') + '.</p>';
      events.push({ s: b.t, e: b.e, n: (b.s >= 45 ? 'Water time' : 'Possible water time') + (nm ? ' – ' + nm : ''), d: Math.round(b.a.T) + '°C wind ' + b.a.ws.toFixed(0) + ' m/s (MET Norway forecast)' });
      lines.push('Best hours: ' + when + ' (' + Math.round(b.a.T) + '°C, wind ' + b.a.ws.toFixed(0) + ' m/s)');
      var L = bring(p, mode, sunHigh);
      br.innerHTML = '<h3>' + ic('flag') + ' What to bring</h3><ul class="btL">' + L.map(function (x) { return '<li>' + E(x) + '</li>'; }).join('') + '</ul>';
      buttons();
    }).catch(function () { bx.innerHTML = '<h3>' + ic('sunrise') + ' Best hours</h3><p class="tdS">The forecast did not answer right now. <button type="button" class="osmR">Try again</button></p>'; var r = bx.querySelector('.osmR'); if (r) r.onclick = function () { render(el, pt); }; });
    if (typeof ss === 'number') {
      ev.innerHTML = '<h3>' + ic('sunrise') + (ssTom ? ' Tomorrow evening' : ' This evening') + '</h3><p class="btW">Sunset' + (ssTom ? ' tomorrow' : '') + ' <b>' + tm(ss, tz) + '</b>' + (tz ? '' : ' (your time)') + '</p><div class="btPl"><p class="tdS">Looking for a sundowner and dinner nearby…</p></div>';
      events.push({ s: ss - 30 * 6e4, e: ss + 15 * 6e4, n: 'Sunset' + (nm ? ' – ' + nm : ''), d: 'Sunset ' + tm(ss, tz) });
      lines.push('Sunset: ' + tm(ss, tz));
      var pl = ev.querySelector('.btPl');
      if (W.DMNear && DMNear.list) Promise.all([DMNear.list('bars', la, lo).catch(function () { return null; }), DMNear.list('fish', la, lo).catch(function () { return null; })]).then(function (r) {
        var o = '';
        function one(lbl, x) { if (!x) return ''; var op = DMNear.open ? DMNear.open(x.o, tz) : null; return '<p class="btPx"><span>' + lbl + '</span><a href="https://www.openstreetmap.org/?mlat=' + x.la.toFixed(5) + '&amp;mlon=' + x.lo.toFixed(5) + '#map=17/' + x.la.toFixed(5) + '/' + x.lo.toFixed(5) + '" target="_blank" rel="noopener" title="View the mapped location"><b>' + E(x.n) + '</b></a> <small>' + E(x.t) + ' · ' + (x.d < 1 ? Math.round(x.d * 1000) + ' m' : x.d.toFixed(1) + ' km') + (op ? ' · ' + op.txt : '') + '</small></p>'; }
        var nb = function (a, km) { return (a || []).filter(function (x) { return x.d <= km; }); }, bars = nb(r[0], 15), food = nb(r[1], 8), bar = bars[0], fish = food.filter(function (x) { return !/by the water/.test(x.t); })[0] || food[0];
        o += one('Sundowner', bar) + one('Dinner', fish);
        if (bar) lines.push('Sundowner: ' + bar.n); if (fish) lines.push('Dinner: ' + fish.n);
        pl.innerHTML = o || (r[0] === null && r[1] === null ? '<p class="tdS">OpenStreetMap did not answer right now – the sunset time above still stands.</p>' : '<p class="tdS">No beach bars or fish restaurants are mapped close by.</p>');
      }); else pl.innerHTML = '';
    } else ev.innerHTML = '<h3>' + ic('sunrise') + ' This evening</h3><p class="tdS">No sunset today at this latitude.</p>';
    function buttons() {
      act.innerHTML = '<button type="button" class="btB btCal">' + ic('calendar') + '<span>Add to my calendar</span></button><button type="button" class="btB btShr">' + ic('arrow') + '<span>Share the plan</span></button>' + (el.dataset.mode && el.dataset.n ? '' : '<a class="btB" href="/#hLive">' + ic('map') + '<span>Open the map</span></a>');
      act.querySelector('.btCal').onclick = function () { ics(events, 'dipmapper-' + ymd(Date.now(), tz)); };
      act.querySelector('.btShr').onclick = function () { share('My water day' + (nm ? ' at ' + nm : '') + ':\n' + lines.join('\n'), this); };
    }
  }
  /* ---------- saved list ---------- */
  function sv() { try { return JSON.parse(localStorage.getItem('dm_save') || '{}'); } catch (e) { return {}; } }
  function svInit() {
    [].forEach.call(D.querySelectorAll('.svB'), function (b) {
      var id = b.dataset.sv; function sync() { var on = !!sv()[id]; b.setAttribute('aria-pressed', on); b.lastChild.textContent = on ? 'On your list' : 'Save to my list'; }
      sync(); b.onclick = function () { var s = sv(); if (s[id]) delete s[id]; else s[id] = { n: b.dataset.n, u: b.dataset.u, la: +b.dataset.la, lo: +b.dataset.lo, t: Date.now() }; try { localStorage.setItem('dm_save', JSON.stringify(s)); } catch (e) {} sync(); };
    });
    var L = D.getElementById('hList'); if (!L) return; var s = sv(), k = Object.keys(s).sort(function (a, b) { return s[b].t - s[a].t; });
    if (!k.length) { L.hidden = true; return; }
    L.hidden = false; L.innerHTML = '<h2>' + ic('flag') + ' Your list</h2><ul class="btList">' + k.slice(0, 12).map(function (i) { return '<li><a href="' + E(s[i].u) + '">' + E(s[i].n) + '</a></li>'; }).join('') + '</ul>';
  }
  function all() {
    svInit();
    [].forEach.call(D.querySelectorAll('.btl'), function (el) {
      var la = +el.dataset.la, lo = +el.dataset.lo;
      if (isFinite(la) && isFinite(lo) && el.dataset.la) return go(el, { la: la, lo: lo });
      var c = getLoc(); if (c) return go(el, c);
      el.innerHTML = '<div class="btH"><h2>' + ic('sparkle') + ' Your water butler</h2><p class="btSub">The best hours for the water today, tonight\'s sunset with a sundowner and dinner nearby, what to bring – in one tap.</p></div><p><button type="button" class="agP btGo">' + ic('locate') + ' Plan my day near me</button></p>';
      el.querySelector('.btGo').onclick = function () { var b = this; if (!navigator.geolocation) return; b.disabled = true; navigator.geolocation.getCurrentPosition(function (p) { var v = { la: p.coords.latitude, lo: p.coords.longitude, t: Date.now() }; try { localStorage.setItem('dm_loc', JSON.stringify(v)); } catch (e) {} go(el, v); }, function () { b.disabled = false; b.lastChild.textContent = ' Location not shared – try again'; }, { timeout: 12000 }); };
      W.addEventListener('dm:location', function (e) { var d = getLoc(); if (d) go(el, d); });
    });
  }
  function go(el, pt) {
    if (el._io) return;
    if (!('IntersectionObserver' in W)) return render(el, pt);
    el._io = new IntersectionObserver(function (es) { if (es.some(function (x) { return x.isIntersecting; })) { el._io.disconnect(); el._io = null; render(el, pt); } }, { rootMargin: '300px' }); el._io.observe(el);
  }
  W.DMButler = { render: render, all: all, plan: plan };
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', all); else all();
})(window);
