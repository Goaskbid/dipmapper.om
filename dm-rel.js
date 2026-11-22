/* DipMapper release layer – always fetched fresh */
(function () {
  // start screen: once per visit and once per release, on every page except where the live map shows its own
  try {
    var D = document, v = (D.documentElement.getAttribute('data-version') || '') + '|57', path = location.pathname;
    if (/^\/spots/.test(path) && innerWidth <= 760) return;
    if (sessionStorage.getItem('dm_sp57') === '1') return;
    sessionStorage.setItem('dm_sp57', '1');
    var red = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var P = [['map', 'Map', 'what is around you'], ['star', 'Things to do', '646 places worldwide'], ['city', 'Beach towns', 'city guides'], ['whale', 'Sea life', 'whales, seals, puffins'], ['mask', 'Diving', 'reefs and wrecks'], ['fish', 'Fishing', 'lakes, rules, fish']];
    var el = D.createElement('div'); el.id = 'dmIntro'; el.setAttribute('role', 'img'); el.setAttribute('aria-label', 'DipMapper – everything water');
    el.innerHTML = '<div class="dmIn"><p class="dmInB">DipMapper</p><p class="dmInT">Everything water</p><ul>' + P.map(function (p, i) { return '<li style="--i:' + i + '" class="p' + i + '"><svg class="ic" aria-hidden="true"><use href="/icons.svg#i-' + p[0] + '"/></svg><b>' + p[1] + '</b><small>' + p[2] + '</small></li>'; }).join('') + '</ul></div>'
      + '<svg class="dmInW" viewBox="0 0 1200 120" preserveAspectRatio="none" aria-hidden="true"><path d="M0 60 C 150 10 300 110 450 60 S 750 10 900 60 S 1200 110 1200 60 V120 H0Z"/><path class="b" d="M0 75 C 200 35 350 115 600 75 S 1000 35 1200 75 V120 H0Z"/></svg>';
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
    (root.querySelectorAll ? root : document).querySelectorAll('.dmScGreat,.dmScGood,.dmScOk,.dmScLow,.dmScOff,.dmIceStat,.dmWQp:not(.dmTL),.dmPlanWarn,.dmOpen,.st.closed').forEach(function (e) {
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
