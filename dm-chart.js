/* DipMapper charts (23.78): one chart style for every page. Charts are drawn at their real pixel width, so text never
   stretches or grows with the screen; they redraw when the box changes size. Tide curves keep their shape but their
   time labels and dots become crisp HTML that cannot be distorted. */
(function (W, D) {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg', MS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], ML = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  var C = { temp: '#d1622a', tempDot: '#fff', rain: '#8fbfe6', rainTxt: '#2f6a9c', grid: '#e3ebec', axis: '#5d6c70', now: '#0a8a84', nowBg: 'rgba(10,138,132,.07)' };
  function num(v) { return typeof v === 'number' && isFinite(v); }
  function E(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function climate(el) {
    var t, r; try { t = JSON.parse(el.dataset.t || '[]'); r = JSON.parse(el.dataset.r || '[]'); } catch (e) { return; }
    var w = Math.max(260, Math.round(el.clientWidth || el.parentNode.clientWidth || 600)); if (el._w === w) return; el._w = w;
    var narrow = w < 520, H = narrow ? 210 : 230, padX = 6, cw = (w - padX * 2) / 12, fs = narrow ? 11.5 : 12;
    var tv = t.filter(num), rv = r.filter(num), mx = Math.max.apply(null, rv.concat([40])), lo = tv.length ? Math.min.apply(null, tv) : 0, hi = tv.length ? Math.max.apply(null, tv) : 10, sp = Math.max(6, hi - lo);
    var tTop = 26, tBot = 82, bBase = H - 24, bTop = 112, cm = new Date().getMonth();
    var ty = function (v) { return tTop + (1 - (v - lo) / sp) * (tBot - tTop); };
    var s = '<svg class="dmChSvg" width="' + w + '" height="' + H + '" viewBox="0 0 ' + w + ' ' + H + '" role="img" aria-label="' + E(el.dataset.label || 'Average daily high and rain per month') + '">';
    s += '<rect x="' + (padX + cw * cm + 1) + '" y="4" width="' + (cw - 2) + '" height="' + (H - 8) + '" rx="8" fill="' + C.nowBg + '"/>';
    s += '<line x1="' + padX + '" x2="' + (w - padX) + '" y1="' + bBase + '" y2="' + bBase + '" stroke="' + C.grid + '" stroke-width="1"/>';
    var pts = [];
    for (var i = 0; i < 12; i++) {
      var cx = padX + cw * i + cw / 2, bw = Math.min(28, cw * 0.56);
      if (num(r[i])) { var h = Math.max(2, r[i] / mx * (bBase - bTop)); s += '<rect x="' + (cx - bw / 2).toFixed(1) + '" y="' + (bBase - h).toFixed(1) + '" width="' + bw.toFixed(1) + '" height="' + h.toFixed(1) + '" rx="4" fill="' + C.rain + '"/>' + ('<text x="' + cx.toFixed(1) + '" y="' + (bBase - h - 5).toFixed(1) + '" text-anchor="middle" style="font:700 ' + (fs - 1) + 'px var(--t-sans,Manrope,system-ui,sans-serif);fill:' + C.rainTxt + '">' + Math.round(r[i]) + '</text>'); }
      s += '<text x="' + cx.toFixed(1) + '" y="' + (H - 7) + '" text-anchor="middle" style="font:' + ((i === cm ? 800 : 700)) + ' ' + (fs) + 'px var(--t-sans,Manrope,system-ui,sans-serif);fill:' + ((i === cm ? C.now : C.axis)) + '">' + (narrow ? ML[i] : MS[i]) + '</text>';
      if (num(t[i])) pts.push([cx, ty(t[i]), t[i]]); else pts.push(null);
    }
    var d = '', on = false; pts.forEach(function (p) { if (!p) { on = false; return; } d += (on ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); on = true; });
    if (d) s += '<path d="' + d + '" fill="none" stroke="' + C.temp + '" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>';
    pts.forEach(function (p, i) { if (!p) return; s += '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="3.5" fill="' + C.tempDot + '" stroke="' + C.temp + '" stroke-width="2"/>' + ('<text x="' + p[0].toFixed(1) + '" y="' + (p[1] - 9).toFixed(1) + '" text-anchor="middle" style="font:800 ' + fs + 'px var(--t-sans,Manrope,system-ui,sans-serif);fill:' + C.temp + '">' + Math.round(p[2]) + '°</text>'); });
    el.innerHTML = s + '</svg>';
  }
  /* tide: keep the curve, turn its labels and dots into crisp HTML */
  function tide(svg) {
    if (svg._dm) return; svg._dm = 1;
    var vb = (svg.getAttribute('viewBox') || '0 0 320 90').split(/\s+/).map(Number), VW = vb[2] || 320, VH = vb[3] || 90;
    var wrap = D.createElement('div'); wrap.className = 'dmChTide'; svg.parentNode.insertBefore(wrap, svg); wrap.appendChild(svg);
    var dots = [];
    [].slice.call(svg.querySelectorAll('circle')).forEach(function (c) { var x = +c.getAttribute('cx'), y = +c.getAttribute('cy'), o = D.createElement('i'); o.className = 'dmChDot'; o.style.left = (x / VW * 100) + '%'; o.style.top = (y / VH * 100) + '%'; wrap.appendChild(o); dots.push([x, y]); c.remove(); });
    [].slice.call(svg.querySelectorAll('text')).forEach(function (tx) {
      var x = +tx.getAttribute('x'), y = +tx.getAttribute('y'), o = D.createElement('span'), d = null, bd = 1e9;
      dots.forEach(function (p) { var k = Math.abs(p[0] - x); if (k < bd) { bd = k; d = p; } });
      o.className = 'dmChLbl ' + (d && y > d[1] ? 'dn' : 'up'); o.textContent = tx.textContent;
      var px = (d ? d[0] : x) / VW * 100; o.style.left = Math.min(94, Math.max(6, px)) + '%'; o.style.top = ((d ? d[1] : y) / VH * 100) + '%'; wrap.appendChild(o); tx.remove();
    });
  }
  /* every other chart: text keeps one readable size (11–13.5 px on screen) whatever the chart's width */
  function fit(svg) {
    var vb = svg.viewBox && svg.viewBox.baseVal, r = svg.getBoundingClientRect(); if (!vb || !vb.width || !r.width) return;
    var sc = r.width / vb.width; if (svg._sc && Math.abs(svg._sc - sc) < 0.01) return; svg._sc = sc;
    [].forEach.call(svg.querySelectorAll('text'), function (tx) {
      if (!tx.dataset.fs) tx.dataset.fs = parseFloat(getComputedStyle(tx).fontSize) || 12;
      var o = +tx.dataset.fs, want = Math.min(13.5, Math.max(11, o * sc));
      tx.style.fontSize = (want / sc).toFixed(2) + 'px';
    });
  }
  var rf = W.ResizeObserver ? new ResizeObserver(function (es) { es.forEach(function (e) { fit(e.target); }); }) : null;
  function fits(root) { [].forEach.call((root || D).querySelectorAll('svg[role="img"]:not(.dmChSvg):not([data-fit])'), function (s) { if (!s.querySelector('text') || s.getAttribute('preserveAspectRatio') === 'none') return; s.setAttribute('data-fit', '1'); fit(s); if (rf) rf.observe(s); }); }
  var ro = W.ResizeObserver ? new ResizeObserver(function (es) { es.forEach(function (e) { if (e.target.classList.contains('dmChClim')) climate(e.target); }); }) : null;
  function scan(root) {
    [].forEach.call((root || D).querySelectorAll('.dmChClim:not([data-on])'), function (el) { el.setAttribute('data-on', '1'); climate(el); if (ro) ro.observe(el); });
    [].forEach.call((root || D).querySelectorAll('svg.dmTideSvg'), tide);
    fits(root);
  }
  W.DMChart = { climate: climate, scan: scan };
  /* official site names arrive in capitals – show them in normal case */
  W.__dmTC = function (s) { s = String(s == null ? '' : s); return /[a-z]/.test(s) ? s : s.toLowerCase().replace(/(^|[\s'’(\/.-])([^\s'’(\/.-])/g, function (m, a, b) { return a + b.toUpperCase(); }); };
  function go() { scan(D); var q = 0; new MutationObserver(function (ms) { if (q) return; for (var i = 0; i < ms.length; i++) if (ms[i].addedNodes.length) { q = requestAnimationFrame(function () { q = 0; scan(D); }); break; } }).observe(D.body, { childList: true, subtree: true }); }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', go); else go();
})(window, document);
