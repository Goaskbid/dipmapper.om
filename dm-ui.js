/* DipMapper shared UI 23.30: location memory, near-you sorting, photo cards */
(function () {
  'use strict';
  var KEY = 'dm_loc', MAXAGE = 12 * 3600e3;
  function store(la, lo) { try { localStorage.setItem(KEY, JSON.stringify({ la: la, lo: lo, t: Date.now() })); } catch (e) {} }
  function loc() { try { var s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && isFinite(s.la) && Date.now() - s.t < MAXAGE) return s; } catch (e) {} return null; }
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
      var cc = t[0] && t[0][0] < 400 ? t[0][1][2] : '', cn = cc && j.cn[cc] ? j.cn[cc] : '';
      var T = document.getElementById('dmNearTitle'), S = document.getElementById('dmNearSub'), K = document.getElementById('dmNearKick');
      if (T) T.textContent = cn ? 'Near you in ' + cn : 'Closest to you';
      if (K && cc) K.innerHTML = '<img class="fl" src="https://flagcdn.com/w40/' + cc.toLowerCase() + '.png" width="20" height="15" alt=""> Your area';
      if (S) S.innerHTML = 'Sorted by distance from you. Nearest town: <a href="/' + t[0][1][0] + '">' + t[0][1][1] + '</a> (' + fmt(t[0][0]) + ')' + (cc ? ' · <a href="/' + t[0][1][0] + '#kbyg">what is allowed here</a>' : '') + '.';
      var b = box.querySelector('[data-dm-locate]'); if (b) b.innerHTML = '<svg class="ic" aria-hidden="true"><use href="/icons.svg#i-locate"/></svg> Update location';
      var m = new Date().getMonth() + 1, W = document.getElementById('dmNearWild'), WB = document.getElementById('dmNearWildBox');
      if (W && WB) {
        var w = j.wild.filter(function (x) { return x[4].indexOf(m) >= 0; }).map(function (x) { return [km(L.la, L.lo, x[2], x[3]), x]; }).sort(function (a, b) { return a[0] - b[0]; }).slice(0, 6);
        var mn = new Date().toLocaleString('en', { month: 'long' });
        document.getElementById('dmNearWildT').textContent = 'Wildlife in season in ' + mn + ', nearest first';
        W.innerHTML = w.map(function (e) { var x = e[1]; return '<li><a href="' + x[6] + '"><span class="dmI s"><svg class="ic" aria-hidden="true"><use href="/icons.svg#i-' + wi(x[5] + ' ' + x[0]) + '"/></svg></span><span><b>' + esc(x[0]) + '</b><small>' + (x[1] ? '<img class="fl" src="https://flagcdn.com/w40/' + x[1].toLowerCase() + '.png" width="16" height="12" alt=""> ' : '') + fmt(e[0]) + '</small></span></a></li>'; }).join('');
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
  function rd(k) { try { return JSON.parse(localStorage.getItem(k) || '[]') || []; } catch (e) { return []; } }
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
  function row(x) { var k = x.k === 'town' ? 'city' : x.k === 'wild' ? 'whale' : 'swim'; return '<li class="dmCard"><a href="' + x.u + '"><div class="dmPh"' + (x.wp ? ' data-wp="' + x.wp.replace(/"/g, '&quot;') + '"' : '') + '><svg class="dmPhI" aria-hidden="true"><use href="/icons.svg#i-' + k + '"/></svg>' + (x.cc ? '<span class="dmPhF"><img class="fl" src="https://flagcdn.com/w40/' + x.cc.toLowerCase() + '.png" width="20" height="15" alt=""></span>' : '') + '</div><div class="dmBd"><span class="dmCn">' + (x.k === 'town' ? 'Town' : x.k === 'wild' ? 'Wildlife' : 'Water experience') + '</span><b>' + x.t.replace(/</g, '&lt;') + '</b></div></a></li>'; }
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
  function run() {
    document.querySelectorAll('.dmSpGal[data-q]:not(.done)').forEach(function (g) {
      g.classList.add('done');
      var u = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrnamespace=6&gsrlimit=24&gsrsearch=' + encodeURIComponent(g.dataset.q + ' filetype:bitmap') + '&prop=imageinfo&iiprop=url|size|mime&iiurlwidth=480';
      fetch(u).then(function (r) { return r.json(); }).then(function (j) {
        var ps = j.query && j.query.pages ? Object.keys(j.query.pages).map(function (k) { return j.query.pages[k]; }).sort(function (a, b) { return a.index - b.index; }) : [], out = [];
        ps.forEach(function (p) { var ii = p.imageinfo && p.imageinfo[0]; if (!ii || !ii.thumburl || out.length >= 8) return; if (!/jpe?g/i.test(ii.mime || '') || ii.width < 900 || ii.height > ii.width * 1.4) return; if (/(map|distribution|range|skeleton|skull|stamp|drawing|illustration|diagram|plate|museum|specimen|chart|logo)/i.test(p.title)) return; out.push('<a href="' + ii.descriptionurl + '" target="_blank" rel="noopener" title="' + p.title.replace(/^File:/, '').replace(/"/g, '') + '"><img src="' + ii.thumburl + '" alt="' + g.dataset.q.replace(/"/g, '') + ' photo" loading="lazy"></a>'); });
        if (out.length >= 2) g.innerHTML = '<div class="dmSpGalG">' + out.join('') + '</div><p class="dmSpGalC">Photos: Wikimedia Commons (free licences) – tap a photo for author and licence.</p>';
      }).catch(function () {});
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run); else run();
})();
