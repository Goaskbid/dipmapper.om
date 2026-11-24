/* DipMapper release layer – always fetched fresh */
/* Navigation is immediately usable; no forced launch interstitial. */

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

/* Reviewed image gate. Metadata alone cannot confirm that a photo depicts this place.
   Editors may set data-subject-reviewed="true" only after inspecting the exact file. */
(function(){var D=document,seen=new WeakMap();
function text(s){return String(s||'').replace(/<[^>]*>/g,'').replace(/&[^;]+;/g,' ').trim()}
function hide(img,reason){img.hidden=true;img.dataset.imageReview=reason;var c=img.parentElement&&img.parentElement.querySelector('.hCr,.dmCr,figcaption');if(c)c.textContent='Image awaiting subject and rights review.'}
function scan(){D.querySelectorAll('img[src*="upload.wikimedia.org"]').forEach(function(img){var src=img.getAttribute('src');if(seen.get(img)===src)return;seen.set(img,src);hide(img,'pending');if(img.dataset.subjectReviewed!=='true')return;
var match=/upload\.wikimedia\.org\/wikipedia\/commons\/(?:thumb\/)?[0-9a-f]\/[0-9a-f]{2}\/([^/?#]+)/.exec(src);if(!match)return;var file;try{file=decodeURIComponent(match[1]).replace(/_/g,' ')}catch(e){return}
fetch('https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&prop=imageinfo&iiprop=extmetadata&iiextmetadatafilter=Artist|LicenseShortName|LicenseUrl|AttributionRequired|Attribution&titles='+encodeURIComponent('File:'+file)).then(function(r){if(!r.ok)throw Error('Metadata unavailable');return r.json()}).then(function(j){
if(seen.get(img)!==src)return;var p=Object.values(j.query&&j.query.pages||{})[0],m=p&&p.imageinfo&&p.imageinfo[0]&&p.imageinfo[0].extmetadata||{},lic=text(m.LicenseShortName&&m.LicenseShortName.value),artist=text(m.Attribution&&m.Attribution.value)||text(m.Artist&&m.Artist.value);
var url=String(m.LicenseUrl&&m.LicenseUrl.value||'');if(!/^(CC BY(?:-SA)? [1-4]\.0|CC0 1\.0|Public domain)$/i.test(lic)||!artist||!/^https:\/\/(creativecommons\.org)\//i.test(url)){hide(img,'rights-not-established');return}
var box=img.parentElement,credit=box.querySelector('.dmReviewedCredit');if(!credit){credit=D.createElement('p');credit.className='dmReviewedCredit';box.appendChild(credit)}credit.replaceChildren();credit.appendChild(D.createTextNode('Photo: '+artist+'. '));
var a=D.createElement('a');a.href='https://commons.wikimedia.org/wiki/File:'+encodeURIComponent(file.replace(/ /g,'_'));a.textContent='Source file';a.target='_blank';a.rel='noopener';credit.appendChild(a);credit.appendChild(D.createTextNode(' | '));var l=D.createElement('a');l.href=url;l.textContent=lic;l.target='_blank';l.rel='noopener';credit.appendChild(l);credit.appendChild(D.createTextNode('. Display resized; check original file for additional restrictions.'));img.hidden=false;img.dataset.imageReview='metadata-and-subject-reviewed';
}).catch(function(){hide(img,'metadata-unavailable')})})}
var queued=false;new MutationObserver(function(){if(queued)return;queued=true;Promise.resolve().then(function(){queued=false;scan()})}).observe(D.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['src']});scan();
})();

/* 23.66 focus trap for open modals */
document.addEventListener('keydown', function (e) {
  if (e.key !== 'Tab') return;
  var m = [].slice.call(document.querySelectorAll('[aria-modal="true"]')).filter(function (x) { return x.offsetParent !== null || getComputedStyle(x).position === 'fixed' && getComputedStyle(x).display !== 'none' && getComputedStyle(x).visibility !== 'hidden' && x.getClientRects().length; })[0];
  if (!m) return;
  var f = [].slice.call(m.querySelectorAll('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])')).filter(function (x) { return x.getClientRects().length; });
  if (!f.length) return;
  var a = f[0], z = f[f.length - 1];
  if (!m.contains(document.activeElement)) { e.preventDefault(); a.focus(); return; }
  if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
});

/* 23.70 credits in a smaller font */
(function () {
  var RX = /^(nearby photo|photo|photos|image|picture)\s*[:©]|^©|wikimedia commons|\bCC BY(-SA)?\b|\bCC0\b|public domain/i;
  function mark(root) {
    [].forEach.call((root || document).querySelectorAll('figcaption,.hCr,.dmCr,.dmReviewedCredit,.dmGalNote'), function (e) {
      if (e.dataset.crs) return; var t = (e.textContent || '').trim();
      if (t && t.length < 220 && RX.test(t) && !e.querySelector('h1,h2,h3,img,svg,ul,table')) { e.dataset.crs = 1; e.classList.add('dmCrTxt'); }
    });
  }
  function go() { mark(); try { new MutationObserver(function (ms) { ms.forEach(function (m) { [].forEach.call(m.addedNodes, function (n) { if (n.nodeType === 1) mark(n.parentNode || n); }); }); }).observe(document.body, { childList: true, subtree: true }); } catch (e) {} }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
})();
