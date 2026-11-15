/* DipMapper tides 23.32 – harmonic prediction from EOT20 constituents (CC BY 4.0, DGFI-TUM); astronomical arguments precomputed with pyTMD */
(function (root) {
  var A = null, H = null, wait = [];
  function load(cb) {
    if (A && H) return cb(A, H);
    wait.push(cb); if (wait.length > 1) return;
    Promise.all([fetch('/tide-astro.json').then(function (r) { return r.json(); }), fetch('/tide-hc.json').then(function (r) { return r.ok ? r.json() : null; })])
      .then(function (x) { A = x[0]; H = x[1] || { points: {} }; var w = wait; wait = []; w.forEach(function (f) { f(A, H); }); })
      .catch(function () { var w = wait; wait = []; w.forEach(function (f) { f(null, null); }); });
  }
  var D0 = null;
  function height(hc, t) { // hc: {CON:[amp_m, phase_deg]}, t: ms UTC
    if (!D0) D0 = Date.UTC(+A.start.slice(0, 4), +A.start.slice(5, 7) - 1, +A.start.slice(8, 10));
    var x = (t - D0) / 864e5, d = Math.floor(x); if (d < 0 || d >= A.days) return null;
    var hrs = (x - d) * 24, s = 0, r = Math.PI / 180;
    for (var i = 0; i < A.con.length; i++) { var c = hc[A.con[i]]; if (!c) continue; s += A.f[i][d] * c[0] * Math.cos((A.V[i][d] + A.w[i] * hrs - c[1]) * r); }
    return s;
  }
  function series(hc, t0, t1, stepMin) { var o = []; for (var t = t0; t <= t1; t += stepMin * 6e4) o.push([t, height(hc, t)]); return o; }
  function extremes(hc, t0, t1) { // highs/lows by 6-min sampling + parabolic refine
    var s = series(hc, t0 - 6e5, t1 + 6e5, 6), e = [];
    for (var i = 1; i < s.length - 1; i++) {
      var a = s[i - 1][1], b = s[i][1], c = s[i + 1][1];
      if ((b > a && b >= c) || (b < a && b <= c)) { var den = a - 2 * b + c, dx = den ? 0.5 * (a - c) / den : 0; var t = s[i][0] + dx * 36e4; if (t >= t0 && t <= t1) e.push({ t: t, h: height(hc, t), hi: b > a }); }
    }
    return e;
  }
  function near(H, la, lo) { var best = null, bd = 1e9; for (var k in H.points) { var p = H.points[k], dy = p[0] - la, dx = (p[1] - lo) * Math.cos(la * Math.PI / 180), d = dx * dx + dy * dy; if (d < bd) { bd = d; best = p; } } return best && Math.sqrt(bd) * 111 < 15 ? best : null; }
  var TL = {};
  function tile(la, lo, cb) {
    var k = (Math.floor(la / 10) * 10) + '_' + (Math.floor(lo / 10) * 10);
    if (k in TL) return TL[k] && TL[k].then ? TL[k].then(cb) : cb(TL[k]);
    TL[k] = fetch('/tides/t_' + k + '.json').then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }).then(function (j) { TL[k] = j; return j; });
    TL[k].then(cb);
  }
  function forPoint(la, lo, cb) {
    load(function (A_, H_) {
      if (!A_) return cb(null);
      var p = near(H_, la, lo); if (p) return cb({ hc: p[2], km: 0, src: 'point' });
      tile(la, lo, function (t) {
        if (!t) return cb(null);
        var best = null, bd = 1e9, cl = Math.cos(la * Math.PI / 180);
        t.p.forEach(function (r) { var dy = r[0] - la, dx = (r[1] - lo) * cl, d = dx * dx + dy * dy; if (d < bd) { bd = d; best = r; } });
        var km = Math.sqrt(bd) * 111; if (!best || km > 35) return cb(null);
        var hc = {}; t.c.forEach(function (c, i) { hc[c] = [best[2 + 2 * i] / 1000, best[3 + 2 * i]]; });
        cb({ hc: hc, km: Math.round(km), src: 'grid' });
      });
    });
  }
  function fmtT(t, tz) { try { return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: tz || undefined }).format(new Date(t)); } catch (e) { return new Date(t).toTimeString().slice(0, 5); } }
  function fmtD(t, tz) { try { return new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: tz || undefined }).format(new Date(t)); } catch (e) { return ''; } }
  function render(el) {
    var la = +el.dataset.la, lo = +el.dataset.lo, tz = el.dataset.tz || undefined;
    el.classList.add('done');
    forPoint(la, lo, function (r) {
      if (!r) { el.innerHTML = (H && H.points && Object.keys(H.points).length) ? (el.dataset.empty || '') : '<p class="note">Tide predictions for this coast are being calculated right now – check back shortly.</p>'; return; }
      var now = Date.now(), t0 = now - 3 * 36e5, t1 = now + 27 * 36e5, s = series(r.hc, t0, t1, 15), ev = extremes(r.hc, now, now + 48 * 36e5);
      var hs = s.map(function (x) { return x[1]; }), mx = Math.max.apply(0, hs), mn = Math.min.apply(0, hs), rg = Math.max(mx - mn, 0.05);
      var W = 320, Hh = 90, X = function (t) { return (t - t0) / (t1 - t0) * W; }, Y = function (h) { return 8 + (mx - h) / rg * (Hh - 22); };
      var path = s.map(function (x, i) { return (i ? 'L' : 'M') + X(x[0]).toFixed(1) + ' ' + Y(x[1]).toFixed(1); }).join('');
      var hn = height(r.hc, now), rising = height(r.hc, now + 6e5) > hn;
      var range = (function () { var e2 = extremes(r.hc, now, now + 25 * 36e5), hi = e2.filter(function (e) { return e.hi; }), lo_ = e2.filter(function (e) { return !e.hi; }); return hi.length && lo_.length ? Math.max.apply(0, hi.map(function (e) { return e.h; })) - Math.min.apply(0, lo_.map(function (e) { return e.h; })) : rg; })();
      var feel = range < 0.4 ? 'Barely any tide here – the water line hardly moves.' : range < 1.5 ? 'Moderate tide – the beach changes a bit between high and low.' : range < 3.5 ? 'Big tide – low tide can expose a lot of beach, rock or reef.' : 'Huge tide – the sea can retreat far and come back fast. Check where you leave your towel.';
      var marks = ev.filter(function (e) { return e.t <= t1; }).map(function (e) { return '<g><circle cx="' + X(e.t).toFixed(1) + '" cy="' + Y(e.h).toFixed(1) + '" r="3"/><text x="' + X(e.t).toFixed(1) + '" y="' + (e.hi ? Y(e.h) - 6 : Y(e.h) + 14).toFixed(1) + '" text-anchor="middle">' + fmtT(e.t, tz) + '</text></g>'; }).join('');
      var next = ev.slice(0, 4).map(function (e) { return '<li class="' + (e.hi ? 'hi' : 'lo') + '"><b>' + (e.hi ? 'High' : 'Low') + '</b> ' + fmtD(e.t, tz) + ' ' + fmtT(e.t, tz) + ' <span>' + (e.h >= 0 ? '+' : '') + e.h.toFixed(2) + ' m</span></li>'; }).join('');
      el.innerHTML = '<div class="dmTideNow"><b>' + (rising ? '↗ Rising' : '↘ Falling') + '</b> · ' + (hn >= 0 ? '+' : '') + hn.toFixed(2) + ' m now · range today ' + range.toFixed(1) + ' m</div>' +
        '<svg class="dmTideSvg" viewBox="0 0 ' + W + ' ' + Hh + '" preserveAspectRatio="none" aria-label="Tide curve, next 24 hours"><path class="a" d="' + path + 'L' + W + ' ' + Hh + 'L0 ' + Hh + 'Z"/><path class="l" d="' + path + '"/><line x1="' + X(now).toFixed(1) + '" x2="' + X(now).toFixed(1) + '" y1="0" y2="' + Hh + '"/>' + marks + '</svg>' +
        '<ul class="dmTideEv">' + next + '</ul><p class="dmTideFeel">' + feel + '</p>' +
        '<p class="dmTideSrc">Predicted astronomical tide relative to mean sea level' + (r.km ? ', model point ' + r.km + ' km offshore' : '') + '. Wind and pressure can shift it. Times ' + (tz || 'local') + '. Model: EOT20, DGFI-TUM (CC BY 4.0).</p>';
    });
  }
  function scan() { document.querySelectorAll('.dmTideLive:not(.done)').forEach(render); }
  if (typeof document !== 'undefined') {
    var mo = new MutationObserver(function () { scan(); });
    var go = function () { scan(); mo.observe(document.body, { childList: true, subtree: true }); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
  }
  root.DMTide = { load: load, height: height, series: series, extremes: extremes, near: near, forPoint: forPoint, render: render };
})(typeof window !== 'undefined' ? window : globalThis);
