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
