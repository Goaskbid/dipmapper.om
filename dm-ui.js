/* DipMapper shared UI 23.30: location memory, near-you sorting, photo cards */
(function () {
  'use strict';
  var KEY = 'dm_loc', MAXAGE = 12 * 3600e3;
  function store(la, lo) { try { localStorage.setItem(KEY, JSON.stringify({ la: la, lo: lo, t: Date.now() })); } catch (e) {} }
  function loc() { try { var s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && isFinite(s.la) && isFinite(s.lo) && Math.abs(s.la) <= 90 && Math.abs(s.lo) <= 180 && s.t <= Date.now() + 6e4 && Date.now() - s.t < MAXAGE) return s; } catch (e) {} return null; }
  // remember any position the visitor shares anywhere on the site
  var G = navigator.geolocation;
  if (G && !G.__dm) {
    ['getCurrentPosition', 'watchPosition'].forEach(function (m) {
      var o = G[m]; if (!o) return;
      G[m] = function (ok, err, opt) { return o.call(G, function (p) { try { store(p.coords.latitude, p.coords.longitude); setTimeout(apply, 0); } catch (e) {} ok && ok(p); }, err, opt); };
    });
    G.__dm = 1;
  }
  function km(a, b, c, d) { var r = Math.PI / 180, x = Math.sin((c - a) * r / 2), y = Math.sin((d - b) * r / 2); return 12742 * Math.asin(Math.sqrt(x * x + Math.cos(a * r) * Math.cos(c * r) * y * y)); }
  function fmt(d) { return d < 2 ? 'here' : d < 1000 ? Math.round(d) + ' km' : (Math.round(d / 100) / 10).toLocaleString('en') + 'k km'; }
  var NI = null;
  function nearIndex(cb) { if (NI) return cb(NI); fetch('/near-index.json').then(function (r) { return r.json(); }).then(function (j) { NI = j; cb(j); }).catch(function () {}); }
  function apply() {
    var L = loc();
    document.querySelectorAll('.dmCards').forEach(function (g) {
      var li = [].slice.call(g.querySelectorAll(':scope > li[data-la]'));
      if (!li.length) return;
      if (L) {
        li.forEach(function (l) { l._d = km(L.la, L.lo, +l.dataset.la, +l.dataset.lo); var s = l.querySelector('.dmDist'); if (s) s.textContent = fmt(l._d); });
        if (g.dataset.sort === 'near') { li.sort(function (a, b) { return a._d - b._d; }).forEach(function (l) { g.appendChild(l); }); }
        g.classList.add('dmLocated');
      } else {
        li.forEach(function (l) { var s = l.querySelector('.dmDist'); if (s && l.dataset.km) s.textContent = fmt(+l.dataset.km); });
      }
      var lim = +g.dataset.limit; if (lim) [].slice.call(g.children).forEach(function (l, i) { l.hidden = i >= lim; });
    });
    document.querySelectorAll('.dmYou').forEach(function (e) {
      if (!L) return; var d = km(L.la, L.lo, +e.dataset.la, +e.dataset.lo);
      e.innerHTML = '<svg class="ic" aria-hidden="true"><use href="/icons.svg#i-locate"/></svg> ' + (d < 2 ? 'You are here' : fmt(d) + ' from you'); e.hidden = false;
    });
    var box = document.getElementById('dmNear');
    if (box && L) nearIndex(function (j) {
      var t = j.towns.map(function (x) { return [km(L.la, L.lo, x[3], x[4]), x]; }).sort(function (a, b) { return a[0] - b[0]; });
      (function (g) { /* 23.40: homepage ships 12 town cards; the nearest ones are built from near-index.json */
        if (!g) return; var have = {}; [].forEach.call(g.querySelectorAll(':scope > li[data-la] a'), function (x) { have[x.getAttribute('href')] = 1; });
        var add = 0;
        t.slice(0, +g.dataset.limit || 8).forEach(function (p) { var x = p[1], h = '/' + x[0]; if (have[h]) return;
          var li = document.createElement('li'); li.className = 'dmCard'; li.dataset.cc = x[2]; li.dataset.la = x[3]; li.dataset.lo = x[4];
          var e = function (v) { return String(v || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
          li.innerHTML = '<a href="' + h + '"><div class="dmPh" data-wp="' + e(x[6]) + '"><svg class="dmPhI" aria-hidden="true" focusable="false"><use href="/icons.svg#i-' + e(x[7] || 'wave') + '"/></svg><span class="dmPhF"><img class="fl" src="/flags/' + String(x[2]).toLowerCase() + '.png" width="20" height="15" alt="" loading="lazy"></span><span class="dmDist tgD"></span></div><div class="dmBd"><b>' + e(x[1]) + '</b><p>' + e(x[5]) + '</p></div></a>';
          g.appendChild(li); add++; });
        if (add) { var li2 = [].slice.call(g.querySelectorAll(':scope > li[data-la]')); li2.forEach(function (l) { l._d = km(L.la, L.lo, +l.dataset.la, +l.dataset.lo); var s2 = l.querySelector('.dmDist'); if (s2) s2.textContent = fmt(l._d); });
          li2.sort(function (a2, b2) { return a2._d - b2._d; }).forEach(function (l, i) { g.appendChild(l); l.hidden = i >= (+g.dataset.limit || 8); });
          try { photos(); } catch (er) {} }
      })(document.getElementById('dmNearTowns'));
      var cc = t[0] && t[0][0] < 400 ? t[0][1][2] : '', cn = cc && j.cn[cc] ? j.cn[cc] : '';
      var T = document.getElementById('dmNearTitle'), S = document.getElementById('dmNearSub'), K = document.getElementById('dmNearKick');
      if (T) T.textContent = cn ? 'Near you in ' + cn : 'Closest to you';
      if (K && cc) K.innerHTML = '<img class="fl" src="/flags/' + cc.toLowerCase() + '.png" width="20" height="15" alt=""> Your area';
      if (S) S.innerHTML = 'Sorted by distance from you. Nearest town: <a href="/' + t[0][1][0] + '">' + t[0][1][1] + '</a> (' + fmt(t[0][0]) + ')' + (cc ? ' · <a href="/' + t[0][1][0] + '#kbyg">what is allowed here</a>' : '') + '.';
      var b = box.querySelector('[data-dm-locate]'); if (b) b.innerHTML = '<svg class="ic" aria-hidden="true"><use href="/icons.svg#i-locate"/></svg> Update location';
      var m = new Date().getMonth() + 1, W = document.getElementById('dmNearWild'), WB = document.getElementById('dmNearWildBox');
      if (W && WB) {
        var w = j.wild.filter(function (x) { return x[4].indexOf(m) >= 0; }).map(function (x) { return [km(L.la, L.lo, x[2], x[3]), x]; }).sort(function (a, b) { return a[0] - b[0]; }).slice(0, 6);
        var mn = new Date().toLocaleString('en', { month: 'long' });
        document.getElementById('dmNearWildT').textContent = 'Wildlife in season in ' + mn + ', nearest first';
        W.innerHTML = w.map(function (e) { var x = e[1]; return '<li><a href="' + x[6] + '"><span class="dmI s"><svg class="ic" aria-hidden="true"><use href="/icons.svg#i-' + wi(x[5] + ' ' + x[0]) + '"/></svg></span><span><b>' + esc(x[0]) + '</b><small>' + (x[1] ? '<img class="fl" src="/flags/' + x[1].toLowerCase() + '.png" width="16" height="12" alt=""> ' : '') + fmt(e[0]) + '</small></span></a></li>'; }).join('');
        WB.hidden = !w.length;
      }
    });
    photos();
  }
  function wi(s) { s = s.toLowerCase(); return /whale/.test(s) ? 'whale' : /dolphin/.test(s) ? 'dolphin' : /shark/.test(s) ? 'shark' : /turtle/.test(s) ? 'turtle' : /seal|sea lion/.test(s) ? 'seal' : /penguin|bird|puffin/.test(s) ? 'bird' : /jelly/.test(s) ? 'jelly' : /coral|reef|spawn/.test(s) ? 'coral' : /manta|ray|fish|sardine|salmon/.test(s) ? 'fish' : 'wave'; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  // audited Wikipedia lead photos: the town's own article, no maps, flags, seals, logos or locator images
  var BAD = /(map|flag|locator|location|coat_of_arms|coa_|seal_of|logo|emblem|\.svg|blank|montage)/i, PH = {};
  try { PH = JSON.parse(sessionStorage.getItem('dm_ph') || '{}'); } catch (e) {}
  function setPh(el, u) { if (!u) return; var i = new Image(); i.onload = function () { el.style.backgroundImage = 'url("' + u + '")'; el.classList.add('hasPh'); el.title = 'Photo: Wikipedia / Wikimedia Commons, free licence – ' + el.dataset.wp; }; i.src = u; }
  var busy = false;
  function photos() {
    var els = [].slice.call(document.querySelectorAll('[data-wp]:not(.phDone)')).filter(function (e) { return !e.closest('[hidden]'); });
    if (!els.length || busy) return;
    var need = [];
    els.forEach(function (e) { var k = e.dataset.wp; if (k in PH) { setPh(e, PH[k]); e.classList.add('phDone'); } else if (need.indexOf(k) < 0) need.push(k); });
    if (!need.length) return;
    busy = true;
    var batch = need.slice(0, 45);
    var u = 'https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1&prop=pageimages&piprop=thumbnail&pithumbsize=640&pilicense=free&titles=' + encodeURIComponent(batch.join('|'));
    fetch(u).then(function (r) { return r.json(); }).then(function (j) {
      var q = j.query || {}, map = {};
      (q.normalized || []).forEach(function (n) { map[n.to] = n.from; });
      (q.redirects || []).forEach(function (n) { map[n.to] = map[n.from] || n.from; });
      batch.forEach(function (b) { PH[b] = ''; });
      Object.keys(q.pages || {}).forEach(function (k) { var p = q.pages[k], src = p.thumbnail && p.thumbnail.source, key = map[p.title] || p.title; if (src && !BAD.test(src)) PH[key] = src; });
      try { sessionStorage.setItem('dm_ph', JSON.stringify(PH)); } catch (e) {}
      els.forEach(function (e) { if (e.dataset.wp in PH) { setPh(e, PH[e.dataset.wp]); e.classList.add('phDone'); } });
      busy = false; if (need.length > 45) photos();
    }).catch(function () { busy = false; els.forEach(function (e) { e.classList.add('phDone'); }); });
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-dm-locate]'); if (!b || !G) return;
    var o = b.innerHTML; b.textContent = 'Locating…';
    G.getCurrentPosition(function () { b.innerHTML = o; apply(); }, function () { b.textContent = 'Location blocked – allow it in the browser'; }, { timeout: 10000, maximumAge: 600000 });
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply); else apply();
  window.DMUI = { apply: apply, loc: loc };
})();
/* 23.31: save (favourites), recently viewed, share – peers: Swim Guide bookmarks, AllTrails "Saved", Windy favourites */
(function () {
  'use strict';
  function rd(k) { try { var v = JSON.parse(localStorage.getItem(k) || '[]'); return Array.isArray(v) ? v.filter(function (x) { return x && typeof x === 'object' && typeof x.id === 'string'; }).slice(0, 300) : []; } catch (e) { return []; } }
  function wr(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function ic(n) { return '<svg class="ic" aria-hidden="true"><use href="/icons.svg#i-' + n + '"/></svg>'; }
  function isSaved(id) { return rd('dm_saved').some(function (x) { return x.id === id; }); }
  function toggle(it) { var s = rd('dm_saved'), i = s.findIndex(function (x) { return x.id === it.id; }); if (i >= 0) s.splice(i, 1); else s.unshift(it); wr('dm_saved', s.slice(0, 200)); badge(); return i < 0; }
  function toast(m) { var t = document.createElement('div'); t.className = 'dmToast'; t.textContent = m; document.body.appendChild(t); setTimeout(function () { t.classList.add('on'); }, 10); setTimeout(function () { t.remove(); }, 2200); }
  function heart(it, cls) {
    var b = document.createElement('button'); b.type = 'button'; b.className = cls || 'dmSave';
    function upd() { var on = isSaved(it.id); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); b.innerHTML = ic('heart') + (cls ? '' : '<span>' + (on ? 'Saved' : 'Save') + '</span>'); b.title = on ? 'Remove from saved' : 'Save for later'; }
    b.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); var on = toggle(it); upd(); toast(on ? 'Saved – find it under Saved' : 'Removed from saved'); });
    upd(); return b;
  }
  function share(t) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'dmSave'; b.innerHTML = ic('share') + '<span>Share</span>';
    b.addEventListener('click', function () { var u = location.href.split('#')[0]; if (navigator.share) navigator.share({ title: t, url: u }).catch(function () {}); else if (navigator.clipboard) navigator.clipboard.writeText(u).then(function () { toast('Link copied'); }); });
    return b;
  }
  function badge() { var n = rd('dm_saved').length; document.querySelectorAll('.dmTab a[href="/saved"] .i').forEach(function (i) { var s = i.querySelector('.dmBadge'); if (!s) { s = document.createElement('b'); s.className = 'dmBadge'; i.appendChild(s); } s.textContent = n; s.hidden = !n; }); }
  var p = location.pathname.replace(/\.html$/, ''), h1 = document.querySelector('main h1, h1'), it = null;
  var you = document.querySelector('.dmYou');
  if (/^\/town-/.test(p) && h1) it = { id: p, t: h1.textContent.trim(), u: p, k: 'town', wp: you && you.dataset.wp || '', cc: you && you.dataset.cc || '' };
  else if (/^\/wildlife-species-/.test(p) && h1) it = { id: p, t: h1.textContent.trim(), u: p, k: 'wild' };
  if (it) {
    var r = rd('dm_recent').filter(function (x) { return x.id !== it.id; }); r.unshift(it); wr('dm_recent', r.slice(0, 12));
    var bar = document.createElement('div'); bar.className = 'dmActs'; bar.appendChild(heart(it)); bar.appendChild(share(it.t)); h1.insertAdjacentElement('afterend', bar);
  }
  document.querySelectorAll('li.card[id]').forEach(function (c) {
    var h = c.querySelector('h2,h3'); if (!h || c.querySelector('.dmHeart')) return;
    var fl = c.querySelector('img.fl'), cc = fl ? (fl.src.match(/\/([a-z]{2})\.png/) || [])[1] : '';
    c.style.position = c.style.position || 'relative';
    c.appendChild(heart({ id: p + '#' + c.id, t: h.textContent.trim(), u: p + '#' + c.id, k: 'spot', cc: (cc || '').toUpperCase() }, 'dmHeart'));
  });
  // Saved page
  var S = document.getElementById('dmSavedList'), R = document.getElementById('dmRecentList');
  function row(x) { x = { id: String(x.id), k: x.k, u: (typeof x.u === 'string' && /^\/(?!\/)[\w\-\/#.]*$/.test(x.u)) ? x.u : '/saved', t: String(x.t || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }).slice(0, 160), wp: typeof x.wp === 'string' ? x.wp.slice(0, 200).replace(/[<>&]/g, '') : '', cc: /^[a-z]{2}$/i.test(x.cc || '') ? x.cc : '' }; var k = x.k === 'town' ? 'city' : x.k === 'wild' ? 'whale' : 'swim'; return '<li class="dmCard"><a href="' + x.u + '"><div class="dmPh"' + (x.wp ? ' data-wp="' + x.wp.replace(/"/g, '&quot;') + '"' : '') + '><svg class="dmPhI" aria-hidden="true"><use href="/icons.svg#i-' + k + '"/></svg>' + (x.cc ? '<span class="dmPhF"><img class="fl" src="/flags/' + x.cc.toLowerCase() + '.png" width="20" height="15" alt=""></span>' : '') + '</div><div class="dmBd"><span class="dmCn">' + (x.k === 'town' ? 'Town' : x.k === 'wild' ? 'Wildlife' : 'Water experience') + '</span><b>' + x.t.replace(/</g, '&lt;') + '</b></div></a></li>'; }
  function renderSaved() {
    if (!S) return; var s = rd('dm_saved'), r = rd('dm_recent');
    S.innerHTML = s.map(row).join(''); document.getElementById('dmSavedEmpty').hidden = !!s.length;
    if (R) { R.innerHTML = r.map(row).join(''); document.getElementById('dmRecentBox').hidden = !r.length; }
    var c = document.getElementById('dmSavedClear'); if (c) { c.hidden = !s.length; c.onclick = function () { wr('dm_saved', []); renderSaved(); badge(); }; }
    if (window.DMUI) window.DMUI.apply();
  }
  renderSaved(); badge();
})();
/* 23.33: map cards close on Escape / tap on empty map; swim-type chips under the map with our icons */
(function () {
  function closeAll() { document.querySelectorAll('.dmStarPop .x,.dmPoiPop .x').forEach(function (x) { x.click(); }); }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });
  document.addEventListener('click', function (e) {
    var m = document.getElementById('map'); if (!m || !m.contains(e.target)) return;
    if (e.target.closest('.dmStar,.dmPoi,.dmTown,.dmStarPop,.dmPoiPop,button,a,input,select,.marker,.leaflet-marker-icon,.maplibregl-marker')) return;
    closeAll();
  }, true);
  var MAPI = { '🧖': 'spa', '💧': 'drop', '🏊‍♀️': 'swim', '🏊‍♂️': 'swim', '🌊': 'wave', '🏖️': 'beach', '🏊': 'swim', '♨️': 'spa', '🏞️': 'leaf', '🏠': 'city', '☀️': 'sunrise', '🆓': 'tag', '🕘': 'calendar', '🤫': 'moon', '🅿️': 'pin', '👨‍👩‍👧': 'star', '🛟': 'lifebuoy', '♀️': 'shield', '🍴': 'bowl', '🚻': 'drop', '♿': 'shield', '🐕': 'heart', '🚿': 'drop' };
  function iconChips(f) {
    f.querySelectorAll('.filter').forEach(function (b) {
      if (b.querySelector('svg')) return; var t = b.textContent.trim().replace(/^\uFE0F/, '');
      for (var k in MAPI) { if (t.indexOf(k) === 0) { b.innerHTML = '<svg class="ic" aria-hidden="true"><use href="/icons.svg#i-' + MAPI[k] + '"/></svg>' + t.slice(k.length).trim().replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }); b.__dmI = 1; break; } }
    });
  }
  function moveFilters() {
    var f = document.getElementById('filters'), m = document.getElementById('map'), p = document.getElementById('mapPanel');
    if (!f || !m || !p) return;
    if (f.parentElement !== p) { m.insertAdjacentElement('afterend', f); f.classList.remove('dmCollapsed'); }
    iconChips(f);
  }
  var moves = 0;
  function go() {
    moveFilters();
    ['load', 'dmbootdone'].forEach(function (ev) { (ev === 'load' ? window : document).addEventListener(ev, function () { moveFilters(); setTimeout(moveFilters, 300); }); });
    var db = document.getElementById('dmBelow');
    if (db && window.MutationObserver) new MutationObserver(function () { var f = document.getElementById('filters'); if (f && f.parentElement === db && moves++ < 30) moveFilters(); }).observe(db, { childList: true });
    var t0 = Date.now(), iv = setInterval(function () { moveFilters(); if (Date.now() - t0 > 8000) clearInterval(iv); }, 500);
    var f = document.getElementById('filters');
    if (f && window.MutationObserver) new MutationObserver(function () { iconChips(f); if (f.classList.contains('dmCollapsed') && f.parentElement && f.parentElement.id === 'mapPanel') f.classList.remove('dmCollapsed'); }).observe(f, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
/* 23.33: multi-point distance (species cards: nearest place) */
(function () {
  function km(a, b, c, d) { var r = Math.PI / 180, x = Math.sin((c - a) * r / 2), y = Math.sin((d - b) * r / 2); return 12742 * Math.asin(Math.sqrt(x * x + Math.cos(a * r) * Math.cos(c * r) * y * y)); }
  function run() {
    var L = window.DMUI && DMUI.loc(); if (!L) return;
    document.querySelectorAll('.dmCards').forEach(function (g) {
      var li = [].slice.call(g.querySelectorAll(':scope > li[data-pts]')); if (!li.length) return;
      li.forEach(function (l) { var best = 1e9; l.dataset.pts.split(';').forEach(function (p) { var q = p.split(','); if (q.length === 2) best = Math.min(best, km(L.la, L.lo, +q[0], +q[1])); }); l._d = best; var s = l.querySelector('.dmDist'); if (s) s.textContent = best < 1000 ? Math.round(best) + ' km' : (Math.round(best / 100) / 10) + 'k km'; });
      li.sort(function (a, b) { return a._d - b._d; }).forEach(function (l) { g.appendChild(l); });
    });
  }
  var o = window.DMUI && DMUI.apply; if (o) DMUI.apply = function () { o(); run(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
/* 23.34: activity bar with our own icons */
(function () {
  var M = { swim: 'swim', paddle: 'kayak', dive: 'mask', sail: 'boat', boat: 'ship', raft: 'wave', special: 'sparkle', surf: 'surf', fish: 'fish' };
  function run() {
    document.querySelectorAll('#dmActBar button[data-a] .i').forEach(function (i) {
      if (i.__dm) return; var a = i.parentElement.dataset.a || '', n = 'wave';
      for (var k in M) if (a.indexOf(k) === 0) { n = M[k]; break; }
      i.innerHTML = '<svg class="ic" aria-hidden="true"><use href="/icons.svg#i-' + n + '"/></svg>'; i.__dm = 1;
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
  window.addEventListener('load', run); document.addEventListener('dmbootdone', run); setTimeout(run, 1500); setTimeout(run, 4000);
})();
/* 23.34: species photo gallery from Wikimedia Commons (free licences, credited) */
(function () {
  function fileKey(u) { var m = /\/(?:thumb\/)?[0-9a-f]\/[0-9a-f]{2}\/([^\/?]+)/.exec(u || ''); return m ? decodeURIComponent(m[1]).toLowerCase() : ''; }
  function dedupeHero(g) {
    var h = document.querySelector('.dmSpHero'); if (!h) return; var hk = fileKey((h.style.backgroundImage || '').replace(/^url\(["']?|["']?\)$/g, '')); if (!hk) return;
    [].forEach.call(g.querySelectorAll('.dmSpGalG a'), function (a) { var i = a.querySelector('img'); if (i && fileKey(i.src) === hk) a.remove(); });
    if (g.querySelectorAll('.dmSpGalG a').length < 2) g.innerHTML = '';
  }
  function run() {
    document.querySelectorAll('.dmSpGal[data-q]:not(.done)').forEach(function (g) {
      g.classList.add('done');
      var u = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrnamespace=6&gsrlimit=24&gsrsearch=' + encodeURIComponent(g.dataset.q + ' filetype:bitmap') + '&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=480';
      fetch(u).then(function (r) { return r.json(); }).then(function (j) {
        var ps = j.query && j.query.pages ? Object.keys(j.query.pages).map(function (k) { return j.query.pages[k]; }).sort(function (a, b) { return a.index - b.index; }) : [], out = [];
        ps.forEach(function (p) { var ii = p.imageinfo && p.imageinfo[0]; if (!ii || !ii.thumburl || out.length >= 8) return; if (!/jpe?g/i.test(ii.mime || '') || ii.width < 900 || ii.height > ii.width * 1.4) return; if (/(map|distribution|range|skeleton|skull|stamp|drawing|illustration|diagram|plate|museum|specimen|chart|logo)/i.test(p.title)) return; out.push('<a href="' + ii.descriptionurl + '" target="_blank" rel="noopener" title="' + p.title.replace(/^File:/, '').replace(/"/g, '') + '"><img src="' + ii.thumburl + '" alt="' + g.dataset.q.replace(/"/g, '') + ' photo" loading="lazy"></a>'); });
        var seen = {}; out = out.filter(function (h) { var k = (/title="([^"]+)"/.exec(h) || [])[1] || h; k = k.toLowerCase().replace(/[^a-z0-9]/g, ''); if (seen[k]) return false; seen[k] = 1; return true; });
        if (out.length >= 2) { g.innerHTML = '<div class="dmSpGalG">' + out.join('') + '</div><p class="dmSpGalC">More photos: Wikimedia Commons (free licences) – tap a photo for author and licence.</p>'; dedupeHero(g); setTimeout(function () { dedupeHero(g); }, 2500); setTimeout(function () { dedupeHero(g); }, 6000); }
      }).catch(function () {});
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
/* 23.36: author + licence credit on every Wikimedia photo (CC BY / BY-SA attribution) */
(function () {
  var CR = {}, pend = {}, timer = 0;
  try { CR = JSON.parse(sessionStorage.getItem('dm_cr') || '{}'); } catch (e) {}
  function fileOf(u) {
    var m = String(u).match(/upload\.wikimedia\.org\/wikipedia\/[^/]+\/(?:thumb\/)?[0-9a-f]\/[0-9a-f]{2}\/([^/?#]+)/i);
    return m ? decodeURIComponent(m[1]) : null;
  }
  function strip(h) { var d = document.createElement('div'); d.innerHTML = h || ''; return (d.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60); }
  function label(c) { return c ? ('Photo: ' + (c.a || 'Wikimedia Commons') + (c.l ? ' · ' + c.l : '')) : ''; }
  var FREE = /(^|\b)(cc[ -]?(by|0|zero|pd)|public domain|pd[- ]|gfdl|no restrictions|attribution|copyrighted free use|free art|ogl|mit|apache|bsd)/i;
  function ok(c) { return c && !c.miss && FREE.test(c.l || ''); }
  function hide(el) {
    if (el.tagName === 'IMG') { el.removeAttribute('srcset'); el.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='; el.alt = ''; el.style.visibility = 'hidden'; }
    else el.style.backgroundImage = 'none';
    el.setAttribute('data-dm-unlicensed', '1');
  }
  function apply(el, file) {
    var c = CR[file]; if (!c) return;
    if (!ok(c)) { hide(el); return; }
    var host = el.tagName === 'IMG' ? el.parentElement : el; if (!host || host.querySelector(':scope > .dmCr')) return;
    if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
    var s = document.createElement('span'); s.className = 'dmCr'; s.textContent = label(c); s.title = label(c) + ' – Wikimedia Commons';
    host.appendChild(s);
  }
  function scan() {
    var need = [];
    document.querySelectorAll('img[src*="upload.wikimedia.org"],[style*="upload.wikimedia.org"]').forEach(function (el) {
      if (el.__cr) return;
      var src = el.tagName === 'IMG' ? el.src : (el.style.backgroundImage || ''), f = fileOf(src); if (!f) return;
      el.__cr = 1; if (/upload\.wikimedia\.org\/wikipedia\/(?!commons\/)/.test(src)) { hide(el); return; }
      (pend[f] = pend[f] || []).push(el);
      if (CR[f]) apply(el, f); else if (need.indexOf(f) < 0) need.push(f);
    });
    for (var i = 0; i < need.length; i += 40) query(need.slice(i, i + 40));
  }
  function query(files) {
    var u = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&prop=imageinfo&iiprop=extmetadata&iiextmetadatafilter=Artist|LicenseShortName&titles=' + encodeURIComponent(files.map(function (f) { return 'File:' + f; }).join('|'));
    fetch(u).then(function (r) { return r.json(); }).then(function (j) {
      var q = j.query || {}, nm = {};
      (q.normalized || []).forEach(function (n) { nm[n.to] = n.from; });
      Object.keys(q.pages || {}).forEach(function (k) {
        var p = q.pages[k], t = (nm[p.title] || p.title).replace(/^File:/, ''), md = p.imageinfo && p.imageinfo[0] && p.imageinfo[0].extmetadata || {};
        var key = files.filter(function (f) { return f.replace(/_/g, ' ') === t.replace(/_/g, ' '); })[0] || t;
        CR[key] = { a: strip(md.Artist && md.Artist.value), l: strip(md.LicenseShortName && md.LicenseShortName.value), miss: !!(p.missing !== undefined && !p.imageinfo) };
      });
      try { sessionStorage.setItem('dm_cr', JSON.stringify(CR)); } catch (e) {}
      files.forEach(function (f) { (pend[f] || []).forEach(function (el) { apply(el, f); }); });
    }).catch(function () {});
  }
  function later() { clearTimeout(timer); timer = setTimeout(scan, 400); }
  if (window.MutationObserver) new MutationObserver(later).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['src', 'style', 'class'] });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', later); else later();
})();

/* 23.37 offline app on every page: verified service worker, manifest, saved places cached for offline, offline notice */
(function () {
  if (typeof window === 'undefined' || location.protocol === 'file:') return;
  try {
    if (!document.querySelector('link[rel="manifest"]')) { var l = document.createElement('link'); l.rel = 'manifest'; l.href = '/manifest.webmanifest'; document.head.appendChild(l); }
    if ('serviceWorker' in navigator && !window.__dmBooted) {
      fetch('/sw.js', { cache: 'no-store' }).then(function (r) { return r.ok ? r.text() : ''; }).then(function (t) {
        if (t.indexOf('DIPMAPPER_SW_V23') >= 0) navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(function () {});
      }).catch(function () {});
    }
  } catch (e) {}
  function cachePage(u) { try { if (window.caches) caches.open('dipmapper-pages').then(function (c) { return c.add(u); }).catch(function () {}); } catch (e) {} }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.dmSave,[data-save]'); if (!b) return;
    setTimeout(function () { if (b.getAttribute('aria-pressed') === 'true' || b.classList.contains('on')) cachePage(location.pathname); }, 50);
  }, true);
  try { (JSON.parse(localStorage.getItem('dm_saved') || '[]')).slice(0, 60).forEach(function (x) { var u = x && x.u && String(x.u).split('#')[0]; if (u && u.charAt(0) === '/') cachePage(u); }); } catch (e) {}
  function net() { var n = document.getElementById('dmOffline'); if (navigator.onLine) { if (n) n.remove(); return; } if (n) return; n = document.createElement('div'); n.id = 'dmOffline'; n.setAttribute('role', 'status'); n.textContent = 'You are offline – showing your saved copy. Live weather, tides refresh and maps come back with signal.'; document.body.appendChild(n); }
  addEventListener('online', net); addEventListener('offline', net); if (document.readyState !== 'loading') net(); else document.addEventListener('DOMContentLoaded', net);
})();

/* 23.41: trip context (your location + your dates), season colours (best / shoulder / off) with sea-risk months, visa & entry by passport */
(function () {
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  /* sea-risk zones from the DipMapper sea-risk calendar (official sources listed there); pk = peak, on = possible */
  var RZ = [
    { n: 'Atlantic hurricane season', b: [8, 45, -100, -55], on: [6, 7, 11], pk: [8, 9, 10] },
    { n: 'Eastern Pacific hurricane season', b: [5, 30, -120, -85], on: [5, 6, 10, 11], pk: [7, 8, 9] },
    { n: 'Hawaii hurricane season', b: [15, 25, -165, -150], on: [6, 7, 10, 11], pk: [8, 9] },
    { n: 'Australian cyclone season', b: [-25, -10, 110, 155], on: [4, 11, 12], pk: [1, 2, 3] },
    { n: 'Marine stingers (box jellyfish, Irukandji)', b: [-24, -10, 142, 154], on: [3, 4, 5, 11], pk: [1, 2, 12] },
    { n: 'South Pacific cyclone season', b: [-25, -10, 160, 200], on: [3, 4, 11, 12], pk: [1, 2] },
    { n: 'South-west Indian Ocean cyclone season', b: [-26, -10, 40, 65], on: [4, 11, 12], pk: [1, 2, 3] },
    { n: 'Typhoon season', b: [5, 35, 105, 150], on: [6, 11, 12], pk: [7, 8, 9, 10] },
    { n: 'Andaman Sea monsoon – red flags, rough sea', b: [5, 15, 92, 99], on: [5, 10], pk: [6, 7, 8, 9] },
    { n: 'Sargassum seaweed (Caribbean)', b: [10, 27, -90, -59], on: [4, 5, 8, 9], pk: [6, 7] },
    { n: 'North Indian Ocean cyclone seasons', b: [0, 23, 70, 95], on: [4, 6, 10, 12], pk: [5, 11] },
    { n: 'Box jellyfish (Northern Territory)', b: [-16, -10, 129, 137], on: [4, 5, 10], pk: [1, 2, 3, 11, 12] }
  ];
  function risks(la, lo) {
    if (la == null || lo == null || isNaN(la)) return [];
    var L = lo < 0 && lo < -150 ? lo + 360 : lo;
    return RZ.filter(function (z) { var b = z.b, x = b[3] > 180 ? (lo < 0 ? lo + 360 : lo) : lo; return la >= b[0] && la <= b[1] && x >= b[2] && x <= b[3]; });
  }
  function status(ms, m) {
    if (!ms || !ms.length) return 'unk';
    if (ms.indexOf(m) >= 0) return 'best';
    var p = m === 1 ? 12 : m - 1, n = m === 12 ? 1 : m + 1;
    return (ms.indexOf(p) >= 0 || ms.indexOf(n) >= 0) && ms.length < 12 ? 'shoulder' : 'off';
  }
  function riskAt(rz, m) { var hi = [], md = []; rz.forEach(function (z) { if (z.pk.indexOf(m) >= 0) hi.push(z.n); else if (z.on.indexOf(m) >= 0) md.push(z.n); }); return { hi: hi, md: md }; }
  function trip() { var t = {}; try { t = JSON.parse(localStorage.getItem('dm_trip') || '{}'); } catch (e) {} var d = t.date ? new Date(t.date + 'T12:00:00') : new Date(); if (isNaN(d)) d = new Date(); return { date: d, iso: t.date || '', m: d.getMonth() + 1 }; }
  function loc() { try { var l = JSON.parse(localStorage.getItem('dm_loc') || 'null'); if (l && isFinite(l.la) && isFinite(l.lo) && Math.abs(l.la) <= 90 && Math.abs(l.lo) <= 180) return l; } catch (e) {} return null; }
  function km(a, b, c, d) { var r = Math.PI / 180, x = Math.sin((c - a) * r / 2), y = Math.sin((d - b) * r / 2); return 12742 * Math.asin(Math.sqrt(x * x + Math.cos(a * r) * Math.cos(c * r) * y * y)); }
  function strip(ms, la, lo, sel) {
    var rz = risks(la, lo), out = '';
    for (var i = 1; i <= 12; i++) {
      var s = status(ms, i), r = riskAt(rz, i), t = MON[i - 1] + ': ' + ({ best: 'best season', shoulder: 'shoulder season', off: 'off season', unk: 'season not published' })[s] + (r.hi.length ? ' · high risk: ' + r.hi.join(', ') : r.md.length ? ' · possible: ' + r.md.join(', ') : '');
      out += '<i class="s-' + s + (r.hi.length ? ' r-hi' : r.md.length ? ' r-md' : '') + (i === sel ? ' sel' : '') + '" title="' + t + '">' + MON[i - 1][0] + '</i>';
    }
    return '<span class="dmMs2" role="img" aria-label="Season by month">' + out + '</span>';
  }
  var LEG = '<span class="dmLeg"><i class="s-best"></i>Best <i class="s-shoulder"></i>Shoulder <i class="s-off"></i>Off <i class="r-md"></i>Possible risk <i class="r-hi"></i>High risk</span>';
  window.DMSeason = { status: status, risks: risks, riskAt: riskAt, strip: strip, legend: LEG, trip: trip };

  function badge(ms, la, lo, m) {
    var s = status(ms, m), r = riskAt(risks(la, lo), m), lab = { best: 'Best season', shoulder: 'Shoulder season', off: 'Off season', unk: 'Season not published' }[s];
    return '<span class="dmTB s-' + s + '">' + lab + ' in ' + MON[m - 1] + '</span>' + (r.hi.length ? '<span class="dmTB r-hi" title="' + r.hi.join(', ') + '">⚠ ' + r.hi[0] + '</span>' : r.md.length ? '<span class="dmTB r-md" title="' + r.md.join(', ') + '">' + r.md[0] + ' possible</span>' : '');
  }
  function apply() {
    var T = trip(), L = loc(), m = T.m;
    document.querySelectorAll('[data-ms]').forEach(function (el) {
      var ms = (el.dataset.ms || '').split(',').filter(Boolean).map(Number), la = parseFloat(el.dataset.la), lo = parseFloat(el.dataset.lo);
      var st = el.querySelector('.dmStrip'); if (st) st.innerHTML = strip(ms, isNaN(la) ? null : la, isNaN(lo) ? null : lo, m);
      var b = el.querySelector('.dmTripBadge'); if (b) b.innerHTML = badge(ms, isNaN(la) ? null : la, isNaN(lo) ? null : lo, m);
      var d = el.querySelector('.dmTripDist'); el._d = 1e9;
      if (L && !isNaN(la)) { el._d = km(L.la, L.lo, la, lo); if (d) d.textContent = el._d < 10 ? 'right near you' : (el._d < 1000 ? Math.round(el._d) : (Math.round(el._d / 100) / 10) + 'k') + ' km from you'; } else if (d) d.textContent = '';
      el._s = { best: 0, shoulder: 1, unk: 2, off: 3 }[status(ms, m)] + (riskAt(risks(la, lo), m).hi.length ? 1.5 : 0);
    });
    document.querySelectorAll('[data-trip-sort]').forEach(function (g) {
      var it = [].slice.call(g.children).filter(function (c) { return c.dataset && c.dataset.ms !== undefined; });
      it.sort(function (a, b) { return (a._s - b._s) || (a._d - b._d); }).forEach(function (c) { g.appendChild(c); });
    });
    document.querySelectorAll('.dmTripBar').forEach(function (bar) {
      if (!bar.__dm) {
        bar.__dm = 1;
        bar.innerHTML = '<span class="dmTripL"><svg class="ic" aria-hidden="true"><use href="/icons.svg#i-pin"/></svg><b class="dmTripWhere"></b> <button type="button" class="dmTripLoc" data-dm-locate>Use my location</button></span>' +
          '<label class="dmTripD"><svg class="ic" aria-hidden="true"><use href="/icons.svg#i-calendar"/></svg><span>Your date</span> <input type="date" class="dmTripDate"></label>' + LEG;
        var inp = bar.querySelector('.dmTripDate');
        inp.addEventListener('change', function () { try { var t = JSON.parse(localStorage.getItem('dm_trip') || '{}'); t.date = inp.value; localStorage.setItem('dm_trip', JSON.stringify(t)); } catch (e) {} apply(); syncCal(); document.dispatchEvent(new CustomEvent('dmtrip')); });
      }
      var i2 = bar.querySelector('.dmTripDate'); var T2 = trip(); i2.value = T2.iso || new Date().toISOString().slice(0, 10);
      var w = bar.querySelector('.dmTripWhere'); w.textContent = L ? (L.name || 'Sorted by distance from you') : 'Set your location to sort by distance';
    });
  }
  function syncCal() { var s = document.getElementById('month'); if (!s || /[?&]month=/.test(location.search)) return; var m = String(trip().m); if (s.value !== m && [].some.call(s.options, function (o) { return o.value === m; })) { s.value = m; s.dispatchEvent(new Event('change', { bubbles: true })); s.dispatchEvent(new Event('input', { bubbles: true })); } }
  window.DMTrip = { apply: apply };
  function boot() { apply(); setTimeout(syncCal, 600); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  window.addEventListener('storage', apply); document.addEventListener('dmlocation', apply); setInterval(function () { var l = localStorage.getItem('dm_loc'); if (l !== window.__dmLocSeen) { window.__dmLocSeen = l; apply(); } }, 2000);
})();
(function () {
  /* visa & entry widget: <div class="dmVisa" data-cc="TH" data-name="Thailand"></div> */
  var IX = null, NAMES = null;
  function nm(cc) { try { NAMES = NAMES || new Intl.DisplayNames(['en'], { type: 'region' }); return NAMES.of(cc) || cc; } catch (e) { return cc; } }
  function E(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function guess() { try { var p = localStorage.getItem('dm_passport'); if (p) return p; } catch (e) {} var l = (navigator.languages && navigator.languages[0]) || navigator.language || ''; var m = /-([A-Z]{2})$/i.exec(l); return m ? m[1].toUpperCase() : 'US'; }
  var LAB = { vf: ['Visa-free', 'g'], voa: ['Visa on arrival', 'g'], eta: ['Online travel authorisation needed', 'y'], ev: ['e-Visa needed before you fly', 'y'], vr: ['Visa needed from an embassy', 'r'], na: ['Entry not possible right now', 'r'], own: ['Your own country', 'g'], unk: ['Not in our data', 'n'] };
  function idx() { if (!IX) IX = fetch('/visa/index.json').then(function (r) { return r.json(); }); return IX; }
  function render(box) {
    var cc = box.dataset.cc, P = guess();
    Promise.all([idx(), fetch('/visa/d-' + cc.toLowerCase() + '.json').then(function (r) { if (!r.ok) throw 0; return r.json(); })]).then(function (x) {
      var ix = x[0], d = x[1], v = d.r[P] || ['unk', null], lab = LAB[v[0]] || LAB.unk, eu = ix.eu.indexOf(P) >= 0, info = d.info || {};
      var opts = ix.passports.map(function (p) { return [p, nm(p)]; }).sort(function (a, b) { return a[1].localeCompare(b[1]); }).map(function (p) { return '<option value="' + p[0] + '"' + (p[0] === P ? ' selected' : '') + '>' + E(p[1]) + '</option>'; }).join('');
      var steps = (info.steps || []).filter(function (s) {
        if (s.who === 'all') return true; if (s.who === 'nonEU') return !eu; if (s.who === 'nonEUvf') return !eu && (v[0] === 'vf' || v[0] === 'eta');
        return s.who === v[0];
      });
      var head = v[0] === 'vf' && v[1] ? 'Visa-free for ' + v[1] + ' days' : lab[0];
      box.innerHTML = '<div class="dmVisaTop"><label>Your passport <select class="dmVisaSel">' + opts + '</select></label></div>' +
        '<div class="dmVisaRes v-' + lab[1] + '"><b>' + E(head) + '</b><span>' + E(nm(P)) + ' passport → ' + E(box.dataset.name || nm(cc)) + '</span></div>' +
        (d.note ? '<p class="dmVisaNote">' + E(d.note) + '</p>' : '') +
        (steps.length ? '<h3>Before you go</h3><ol class="dmVisaSteps">' + steps.map(function (s) { return '<li><b>' + E(s.t) + '</b><span><i>When:</i> ' + E(s.when) + '</span><span><i>Cost:</i> ' + E(s.cost) + '</span>' + (s.tip ? '<span class="tip">' + E(s.tip) + '</span>' : '') + '<a href="' + E(s.url) + '" target="_blank" rel="noopener">Official site</a></li>'; }).join('') + '</ol>' : '') +
        (info.facts ? '<p>' + E(info.facts) + '</p>' : '') +
        (v[0] === 'vr' || v[0] === 'ev' ? '<p>Apply through the official government site or the destination’s embassy – never through lookalike agents that add fees.</p>' : '') +
        '<p class="dmVisaSrc">Passport rules: Passport Index Data (MIT licence), updated ' + E(ix.updated) + '; arrival cards, fees and recent changes checked by DipMapper on ' + E(ix.checked) + ' against official sites' + ((info.official || []).length ? ': ' + info.official.map(function (o) { return '<a href="' + E(o[1]) + '" target="_blank" rel="noopener">' + E(o[0]) + '</a>'; }).join(', ') : '') + '.</p>' +
        '<p class="dmVisaDisc">Not legal advice. Rules change at short notice and also depend on passport validity, onward tickets, the purpose of your trip and your own history. Always confirm with the official site or embassy before you book and again before you fly.</p>';
      box.querySelector('.dmVisaSel').addEventListener('change', function (e) { try { localStorage.setItem('dm_passport', e.target.value); } catch (er) {} document.querySelectorAll('.dmVisa').forEach(render); });
    }).catch(function () { box.innerHTML = '<p>Entry rules couldn’t load right now. Check the destination’s official immigration site.</p>'; });
  }
  function hub() {
    var h = document.getElementById('dmVisaHub'); if (!h) return; var P = guess();
    Promise.all([idx(), fetch('/visa/p-' + P.toLowerCase() + '.json').then(function (r) { return r.json(); })]).then(function (x) {
      var ix = x[0], m = x[1], opts = ix.passports.map(function (p) { return [p, nm(p)]; }).sort(function (a, b) { return a[1].localeCompare(b[1]); }).map(function (p) { return '<option value="' + p[0] + '"' + (p[0] === P ? ' selected' : '') + '>' + E(p[1]) + '</option>'; }).join('');
      var rows = [].slice.call(h.querySelectorAll('li[data-cc]'));
      rows.forEach(function (li) { var v = m[li.dataset.cc] || ['unk', null], lab = LAB[v[0]] || LAB.unk; var s = li.querySelector('.dmVisaTag'); s.className = 'dmVisaTag v-' + lab[1]; s.textContent = v[0] === 'vf' && v[1] ? 'Visa-free ' + v[1] + ' days' : lab[0]; li.dataset.k = { g: 0, y: 1, n: 2, r: 3 }[lab[1]]; });
      var sel = document.getElementById('dmVisaHubSel'); if (sel && !sel.__dm) { sel.__dm = 1; sel.innerHTML = opts; sel.addEventListener('change', function () { try { localStorage.setItem('dm_passport', sel.value); } catch (e) {} hub(); }); } else if (sel) sel.value = P;
      var c = { g: 0, y: 0, r: 0 }; rows.forEach(function (li) { var k = li.querySelector('.dmVisaTag').className.split('v-')[1]; if (c[k] != null) c[k]++; });
      var sm = document.getElementById('dmVisaHubSum'); if (sm) sm.innerHTML = '<b>' + E(nm(P)) + ' passport:</b> ' + c.g + ' beach and dive destinations without a visa in advance, ' + c.y + ' with an online form or e-visa, ' + c.r + ' need a visa from an embassy.';
    });
  }
  function run() { document.querySelectorAll('.dmVisa[data-cc]:not(.done)').forEach(function (b) { b.classList.add('done'); render(b); }); hub(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();

/* 23.43 pick hero: when the page title has no Wikipedia lead photo, use the same matched photo as the Explore card */
(function () {
  var h = document.querySelector('.dmPick .dmSpHero'), f = document.querySelector('.dmFacts[data-la]');
  if (!h || !f || !window.fetch) return;
  var id = location.pathname.replace(/^\/pick-/, '').replace(/\.html$/, ''), k = 'dm_ph3_' + id, la = +f.dataset.la, lo = +f.dataset.lo, tries = 0;
  function km(a, b, c, d) { var r = Math.PI / 180, x = Math.sin((c - a) * r / 2), y = Math.sin((d - b) * r / 2); return 12742 * Math.asin(Math.sqrt(x * x + Math.cos(a * r) * Math.cos(c * r) * y * y)); }
  function okPh(p, d, q) { if (d >= 40) return false; if (/map|flag|logo|locator|coat.of.arms|\.svg|diagram|chart|icon/i.test(p.thumbnail.source + ' ' + p.title)) return false; var G = /^(the|and|of|de|la|el|island|islands|bay|beach|park|national|lake|river|reef|tour|trip|boat|day|dive|diving|snorkelling|snorkeling|whale|watching|cruise|kayak|kayaking|seasonal|excursion|scenic|water|experience|discovery|outing|aquarium|thermal|bath|baths|sea)$/; var w = String(q).toLowerCase().split(/[^a-z0-9À-ɏ]+/).filter(function (x) { return x.length > 2 && !G.test(x); }), t = String(p.title).toLowerCase(); return d < 3 || w.some(function (x) { return t.indexOf(x) >= 0; }); }
  function set(d) { if (!d || !d.u || h.classList.contains('hasPh')) return; var i = new Image(); i.onload = function () { if (h.classList.contains('hasPh')) return; h.style.backgroundImage = 'url("' + d.u + '")'; h.classList.add('hasPh'); }; i.src = d.u; }
  function commons() {
    fetch('https://commons.wikimedia.org/w/api.php?action=query&generator=geosearch&ggscoord=' + la + '|' + lo + '&ggsradius=3000&ggslimit=12&ggsnamespace=6&prop=imageinfo&iiprop=url|size&iiurlwidth=1280&format=json&origin=*').then(function (r) { return r.json(); }).then(function (j) {
      var ps = j.query && j.query.pages ? Object.keys(j.query.pages).map(function (x) { return j.query.pages[x]; }) : [], best = null;
      ps.forEach(function (p) { var ii = p.imageinfo && p.imageinfo[0]; if (best || !ii || !ii.thumburl) return; if (/\.(svg|png|gif|tiff?|pdf)$/i.test(p.title) || /(map|plan|logo|diagram|flag|coat|sign|chart|scan|document)/i.test(p.title) || ii.width < 800 || ii.height > ii.width * 1.3) return; best = { u: ii.thumburl, p: ii.descriptionurl }; });
      try { localStorage.setItem(k, JSON.stringify(best || {})); } catch (e) {} set(best);
    }).catch(function () {});
  }
  function go() {
    if (h.classList.contains('hasPh')) return;
    if (!h.classList.contains('phDone') && tries++ < 16) { setTimeout(go, 500); return; }
    try { var c = JSON.parse(localStorage.getItem(k) || 'null'); if (c) { if (c.u) set(c); return; } } catch (e) {}
    var q = h.dataset.wp || document.title;
    fetch('https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrlimit=4&prop=pageimages|coordinates|info&inprop=url&piprop=thumbnail&pithumbsize=1280&pilicense=free&format=json&origin=*&gsrsearch=' + encodeURIComponent(q)).then(function (r) { return r.json(); }).then(function (j) {
      var ps = j.query && j.query.pages ? Object.keys(j.query.pages).map(function (x) { return j.query.pages[x]; }).sort(function (a, b) { return a.index - b.index; }) : [], best = null;
      ps.forEach(function (p) { if (best || !p.thumbnail || !p.coordinates) return; var c = p.coordinates[0]; if (okPh(p, km(la, lo, c.lat, c.lon), q)) best = { u: p.thumbnail.source, p: p.fullurl }; });
      if (best) { try { localStorage.setItem(k, JSON.stringify(best)); } catch (e) {} set(best); } else commons();
    }).catch(commons);
  }
  setTimeout(go, 600);
})();

;(function(){try{if(window.__dmSwReload||!('serviceWorker' in navigator)||!navigator.serviceWorker.controller)return;window.__dmSwReload=1;var d=0;navigator.serviceWorker.addEventListener('controllerchange',function(){if(d)return;d=1;location.reload()})}catch(e){}})();

;(function(){if(window.__dmRelChk)return;window.__dmRelChk=1;var _sv=document.querySelector('script[src*="dm-ui.js?v="],script[src*="app-boot.js?v="]'),cur=(_sv&&(_sv.getAttribute('src').match(/v=([0-9.]+)/)||[])[1])||((document.body&&document.body.getAttribute('data-version'))||'').replace(/^v/,''),last=0;
 function chk(){var n=Date.now();if(n-last<120000)return;last=n;try{navigator.serviceWorker&&navigator.serviceWorker.getRegistration&&navigator.serviceWorker.getRegistration().then(function(r){r&&r.update()}).catch(function(){})}catch(e){}
  fetch('/version.txt?t='+n,{cache:'no-store'}).then(function(r){return r.ok?r.text():''}).then(function(v){v=(v||'').trim();if(!v||!cur||v===cur)return;var k='dm_rel_reload_'+v;try{if(sessionStorage.getItem(k))return;sessionStorage.setItem(k,'1')}catch(e){}location.reload()}).catch(function(){})}
 setTimeout(chk,1500);document.addEventListener('visibilitychange',function(){if(document.visibilityState==='visible')chk()});setInterval(chk,600000)})();
