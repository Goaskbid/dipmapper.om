/* DipMapper release layer – always fetched fresh */
(function () {
  // start screen: once per visit and once per release, on every page except where the live map shows its own
  try {
    var D = document, v = (D.documentElement.getAttribute('data-version') || '') + '|57', path = location.pathname;
    if (/^\/spots/.test(path) && innerWidth <= 760) return;
    if (sessionStorage.getItem('dm_sp57') === '1') return;
    sessionStorage.setItem('dm_sp57', '1');
    var red = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var P = [['map', 'Map', 'what is around you'], ['star', 'Things to do', 'hand-picked places'], ['city', 'Beach towns', 'city guides'], ['whale', 'Sea life', 'whales, seals, polar bears'], ['mask', 'Diving', 'reefs and wrecks'], ['fish', 'Fishing', 'lakes, licences, fish']];
    var el = D.createElement('div'); el.id = 'dmIntro'; el.setAttribute('role', 'img'); el.setAttribute('aria-label', 'DipMapper – everything water');
    el.innerHTML = '<div class="dmIn"><p class="dmInB">DipMapper</p><p class="dmInT">Everything water</p><ul>' + P.map(function (p, i) { return '<li style="--i:' + i + '" class="p' + i + '"><svg class="ic" aria-hidden="true"><use href="/icons.svg#i-' + p[0] + '"/></svg><b>' + p[1] + '</b><small>' + p[2] + '</small></li>'; }).join('') + '</ul></div>'
      + '<svg class="dmInW" viewBox="0 0 1200 120" preserveAspectRatio="none" aria-hidden="true"><path d="M0 60 C 150 10 300 110 450 60 S 750 10 900 60 S 1200 110 1200 60 V120 H0Z"/><path class="b" d="M0 75 C 200 35 350 115 600 75 S 1000 35 1200 75 V120 H0Z"/></svg>';
    // changing background photos: our own beach photos at once, then free-licence photos from Wikimedia Commons (cached for next time)
    var bg = D.createElement('div'); bg.className = 'dmInBg';
    var own = ['/about-water.webp', '/about-pool.webp'], T = ['Coral reef', 'Humpback whale', 'Similan Islands', 'Navagio', 'Atlantic puffin', 'Lake Zurich', 'Moraine Lake', 'Great Blue Hole', 'Bora Bora', 'Lake Bled'];
    var shown = 0;
    function addImg(u) { var i = new Image(); i.alt = ''; i.decoding = 'async'; i.onload = function () { bg.appendChild(i); var all = bg.querySelectorAll('img'); requestAnimationFrame(function () { all.forEach(function (x) { x.classList.remove('on'); }); i.classList.add('on'); }); shown++; }; i.src = u; }
    addImg(own[Math.floor(Math.random() * own.length)]);
    var cache = null; try { cache = JSON.parse(localStorage.getItem('dm_inbg') || 'null'); } catch (e) {}
    var pick = function (a) { return a.slice().sort(function () { return Math.random() - .5; }); };
    if (cache && cache.t > Date.now() - 7 * 864e5 && cache.u && cache.u.length) {
      pick(cache.u).slice(0, 2).forEach(function (u, k) { setTimeout(function () { addImg(u); }, 900 + k * 900); });
    } else {
      try {
        fetch('https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1&prop=pageimages&piprop=thumbnail&pithumbsize=1280&pilicense=free&titles=' + encodeURIComponent(T.join('|')))
          .then(function (r) { return r.json(); }).then(function (j) {
            var u = []; var pg = (j.query && j.query.pages) || {}; Object.keys(pg).forEach(function (k) { var t = pg[k].thumbnail; if (t && t.width >= 800) u.push(t.source); });
            if (!u.length) return; try { localStorage.setItem('dm_inbg', JSON.stringify({ t: Date.now(), u: u })); } catch (e) {}
            pick(u).slice(0, 2).forEach(function (x, k) { setTimeout(function () { addImg(x); }, 700 + k * 900); });
          }).catch(function () {});
      } catch (e) {}
    }
    el.insertBefore(bg, el.firstChild);
    el.insertAdjacentHTML('beforeend', '<p class="dmInC">Photos: DipMapper, Wikimedia Commons</p>');
    var end = function () { if (!el.parentNode) return; el.classList.add('out'); setTimeout(function () { el.remove(); }, 350); };
    el.addEventListener('click', end);
    (D.body || D.documentElement).appendChild(el);
    setTimeout(end, red ? 1200 : 3000);
  } catch (e) {}
})();

(function () {
  // seasons page: the current month and the next two stay open, later months fold away
  try {
    var g = document.querySelector('.monthgrid'); if (!g) return;
    var cards = [].slice.call(g.querySelectorAll('.mcard'));
    setTimeout(function () {
      cards = [].slice.call(g.querySelectorAll('.mcard'));
      cards.forEach(function (c, i) {
        if (i < 3 || c.querySelector('.dmFold')) return;
        var ol = c.querySelector('ol'); if (!ol) return;
        var n = ol.children.length; ol.hidden = true;
        var b = document.createElement('button'); b.type = 'button'; b.className = 'dmFold'; b.textContent = 'Show ' + n + ' picks';
        b.addEventListener('click', function () { ol.hidden = !ol.hidden; b.textContent = ol.hidden ? 'Show ' + n + ' picks' : 'Hide'; });
        c.appendChild(b);
      });
    }, 400);
  } catch (e) {}
})();

(function () {
  try {
    var m = new Date().getMonth();
    document.querySelectorAll('.mstrip,.dmMs,.fMs').forEach(function (s) { var i = s.children[m]; if (i) i.classList.add('now'); });
    document.querySelectorAll('.dBars rect[data-m="' + m + '"]').forEach(function (r) { r.classList.add('now'); });
    // app feel: remember scroll on back, mark standalone mode
    if (matchMedia('(display-mode: standalone)').matches || navigator.standalone) document.documentElement.classList.add('dmApp');
  } catch (e) {}
})();

(function () {
  var ICE = { operator: 'g', release: 'a', bulletin: 'a', order: 'a', trails: 'a', marked: 'a', contact: 'a', ownrisk: 'r' };
  function lamp(el, l) {
    if (el.querySelector(':scope > .tl')) return;
    var s = document.createElement('span'); s.className = 'tl tlA'; s.setAttribute('aria-hidden', 'true'); s.setAttribute('data-l', l);
    s.innerHTML = '<i class="r"></i><i class="a"></i><i class="g"></i>'; el.insertBefore(s, el.firstChild);
  }
  function scan(root) {
    (root.querySelectorAll ? root : document).querySelectorAll('.dmIceStat').forEach(function (e) {
      var c = e.className, l = '';
      if (/dmScGreat|dmScGood/.test(c)) l = 'g'; else if (/dmScOk/.test(c)) l = 'a'; else if (/dmScLow/.test(c)) l = 'r'; else if (/dmScOff/.test(c)) l = 'o';
      else if (/dmIceStat/.test(c)) { var m = /ice-([a-z]+)/.exec(c); l = m ? (ICE[m[1]] || 'a') : 'a'; }
      else if (/dmWQp/.test(c)) { var t = (e.textContent || '').trim(); l = /^(Great|Good)/.test(t) ? 'g' : /^Meh/.test(t) ? 'a' : /^Skip/.test(t) ? 'r' : ''; }
      else if (/dmPlanWarn/.test(c)) l = 'r';
      else if (/dmOpen|closed/.test(c)) l = /closed|off/.test(c) ? 'r' : /na/.test(c) ? 'o' : 'g';
      if (l) lamp(e, l);
    });
  }
  var q = 0;
  function later() { if (q) return; q = setTimeout(function () { q = 0; scan(document); }, 250); }
  try { scan(document); new MutationObserver(later).observe(document.body, { childList: true, subtree: true }); } catch (e) {}
})();

(function () {
  var D = document, M = new Date().getMonth(), path = location.pathname.replace(/\.html$/, '');
  var ML = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
  function stored() { try { var c = JSON.parse(localStorage.getItem('dm_loc') || 'null'); if (c && isFinite(c.la) && isFinite(c.lo) && Math.abs(c.la) <= 90 && Math.abs(c.lo) <= 180 && c.t && c.t <= Date.now() + 6e4 && c.t > Date.now() - 432e5) return c; } catch (e) {} return null; }
  function withLoc(cb) {
    var c = stored(); if (c) return cb(c);
    try {
      if (!navigator.permissions || !navigator.geolocation) return;
      navigator.permissions.query({ name: 'geolocation' }).then(function (p) {
        if (p.state !== 'granted') return;
        navigator.geolocation.getCurrentPosition(function (g) {
          var v = { la: g.coords.latitude, lo: g.coords.longitude, t: Date.now() };
          try { localStorage.setItem('dm_loc', JSON.stringify(v)); } catch (e) {}
          cb(v);
        }, function () {}, { timeout: 8000, maximumAge: 600000 });
      }).catch(function () {});
    } catch (e) {}
  }
  // answer location requests from the page's own buttons with the known position for a few seconds (no second prompt)
  function lend(c, ms) {
    var g = navigator.geolocation; if (!g) return;
    var orig = g.getCurrentPosition.bind(g);
    g.getCurrentPosition = function (ok) { setTimeout(function () { ok({ coords: { latitude: c.la, longitude: c.lo, accuracy: 500 }, timestamp: c.t || Date.now() }); }, 0); };
    setTimeout(function () { g.getCurrentPosition = orig; }, ms || 4000);
  }
  function fire(el, ev) { if (el) el.dispatchEvent(new Event(ev || 'change', { bubbles: true })); }
  function whenReady(test, cb, n) { n = n || 0; if (test()) return cb(); if (n < 40) setTimeout(function () { whenReady(test, cb, n + 1); }, 150); }
  if (path === '/wildlife-calendar') {
    // this month first
    whenReady(function () { return D.querySelector('#dmGalM button[data-m="' + (M + 1) + '"]'); }, function () { D.querySelector('#dmGalM button[data-m="' + (M + 1) + '"]').click(); });
    whenReady(function () { var s = D.getElementById('month'); return s && s.options.length > 2; }, function () {
      var s = D.getElementById('month');
      for (var i = 0; i < s.options.length; i++) { var o = s.options[i]; if (o.value == M + 1 || String(o.textContent).toLowerCase().indexOf(ML[M]) === 0) { s.value = o.value; fire(s); break; } }
    });
    // and near you
    withLoc(function (c) {
      lend(c, 5000);
      whenReady(function () { return D.querySelector('.dmLocBtn[data-dm-locate]'); }, function () {
        D.querySelectorAll('.dmLocBtn[data-dm-locate]').forEach(function (b) { b.click(); });
        var s = D.getElementById('sort'); if (s) { var n = s.querySelector('option[value="near"]'); if (n) { n.disabled = false; s.value = 'near'; fire(s); } }
      });
    });
  }
  if (path === '/fishing') withLoc(function (c) { lend(c, 4000); whenReady(function () { return D.getElementById('fHere'); }, function () { D.getElementById('fHere').click(); }); });
  if (path === '/shipwrecks') withLoc(function () { whenReady(function () { var l = D.getElementById('wList'); return l && l.children.length; }, function () { var b = D.getElementById('wNear'); if (b) b.click(); }); });
})();

/* 23.64 photo credits: generic labels replaced by each file's author and licence from Wikimedia Commons */
(function () {
  var wait = {}, timer = 0, MD = {}, GEN = /^\s*(Nearby photo|Photo):\s*(Wikipedia|Wikimedia Commons)(\s*\/\s*Wikimedia Commons)?\b/i;
  try { MD = JSON.parse(sessionStorage.getItem('dm_phmeta') || '{}'); } catch (e) {}
  function fileOf(src) { var m = /upload\.wikimedia\.org\/wikipedia\/commons\/(?:thumb\/)?[0-9a-f]\/[0-9a-f]{2}\/([^\/?#]+)/.exec(src || ''); return m ? decodeURIComponent(m[1]).replace(/_/g, ' ') : null; }
  function strip(h) { var d = document.createElement('div'); d.innerHTML = h || ''; return (d.textContent || '').replace(/\s+/g, ' ').trim(); }
  var FREE = /(^|\b)(cc[ -]?(by|0|zero|pd)|public domain|pd[- ]|gfdl|no restrictions|attribution|copyrighted free use|free art|ogl)/i;
  function apply(c, img, m) {
    if (!m || !FREE.test(m.lic || '')) { c.style.display = 'none'; return; }
    var txt = (/^\s*Nearby/i.test(c.textContent) ? 'Nearby photo: ' : 'Photo: ') + (m.by || 'Wikimedia Commons').slice(0, 70) + ' · ' + m.lic;
    c.textContent = txt; c.title = txt;
    if (c.tagName === 'A') { c.href = 'https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(m.f.replace(/ /g, '_')); c.target = '_blank'; c.rel = 'noopener'; }
    var box = c.parentElement; if (box) [].forEach.call(box.querySelectorAll(':scope > .dmCr'), function (x) { x.remove(); });
    box && box.setAttribute('data-crok', '1');
  }
  function flush() {
    timer = 0; var names = Object.keys(wait).filter(function (f) { return !(f in MD); }).slice(0, 40);
    var done = function () { Object.keys(wait).forEach(function (f) { if (f in MD) { wait[f].forEach(function (p) { apply(p[0], p[1], MD[f]); }); delete wait[f]; } }); try { sessionStorage.setItem('dm_phmeta', JSON.stringify(MD)); } catch (e) {} if (Object.keys(wait).length && !timer) timer = setTimeout(flush, 400); };
    if (!names.length) return done();
    fetch('https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&prop=imageinfo&iiprop=extmetadata&iiextmetadatafilter=Artist|LicenseShortName&titles=' + encodeURIComponent(names.map(function (n) { return 'File:' + n; }).join('|')))
      .then(function (r) { return r.json(); }).then(function (j) {
        var q = j.query || {}, map = {}; (q.normalized || []).forEach(function (n) { map[n.to] = n.from; });
        Object.keys(q.pages || {}).forEach(function (id) { var p = q.pages[id], t = (map[p.title] || p.title).replace(/^File:/, ''), md = p.imageinfo && p.imageinfo[0] && p.imageinfo[0].extmetadata || {};
          MD[t] = md.LicenseShortName ? { f: t, by: strip(md.Artist && md.Artist.value), lic: strip(md.LicenseShortName.value) } : null; });
        names.forEach(function (n) { if (!(n in MD)) MD[n] = null; }); done();
      }).catch(function () { names.forEach(function (n) { delete wait[n]; }); });
  }
  function scan() {
    [].forEach.call(document.querySelectorAll('a,span,small,figcaption'), function (c) {
      if (c.dataset.dmg || c.children.length || c.textContent.length > 80 || !GEN.test(c.textContent)) return;
      var img = c.parentElement && c.parentElement.querySelector('img[src*="upload.wikimedia.org"]'); if (!img) return;
      c.dataset.dmg = 1; var f = fileOf(img.currentSrc || img.src); if (!f) { c.style.display = 'none'; return; }
      (wait[f] = wait[f] || []).push([c, img]); if (!timer) timer = setTimeout(flush, 250);
    });
  }
  try { new MutationObserver(function () { scan(); }).observe(document.documentElement, { childList: true, subtree: true }); } catch (e) {}
  if (document.readyState !== 'loading') scan(); else document.addEventListener('DOMContentLoaded', scan);
})();
