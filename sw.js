/* DIPMAPPER_SW_V23 (23.37; supersedes DIPMAPPER_SW_V22) — offline copy of everything you opened or saved.
   Pages: network first (updates arrive immediately), cached copy only when offline.
   Our own scripts, styles, icons, fonts, flags and data: served fast from cache and refreshed in the background.
   Never touches other websites: map tiles, photos, weather and ads always go straight to the network. */
const SHELL_CACHE = 'dipmapper-v23-shell';
const ASSET_CACHE = 'dipmapper-v23-assets';
const PAGE_CACHE = 'dipmapper-pages'; // also filled by the Save button (saved places work offline)
const KEEP = [SHELL_CACHE, ASSET_CACHE, PAGE_CACHE];
const SHELL = ['/', '/saved.html', '/offline.html', '/ds2.css', '/fonts.css', '/icons.svg', '/icon-192.png'];
const MAX_ASSETS = 400;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL_CACHE).then(c => c.addAll(SHELL)).catch(() => {}).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => !KEEP.includes(k)).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
function trim(name, max) {
  return caches.open(name).then(c => c.keys().then(ks => ks.length > max ? Promise.all(ks.slice(0, ks.length - max).map(k => c.delete(k))) : 0));
}
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;            // ads, tiles, APIs, photos: untouched
  if (url.pathname === '/sw.js' || url.pathname.endsWith('-status.json')) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(PAGE_CACHE).then(c => c.put(url.pathname, copy)).then(() => trim(PAGE_CACHE, 120)); }
      return res;
    }).catch(() => caches.match(url.pathname, { ignoreSearch: true })
      .then(r => r || caches.match(url.pathname + '.html'))
      .then(r => r || caches.match('/offline.html'))));
    return;
  }
  if (/\.(css|js|svg|png|webp|jpg|woff2|json)$/.test(url.pathname)) {
    e.respondWith(caches.open(ASSET_CACHE).then(c => c.match(req).then(hit => {
      const net = fetch(req).then(res => {
        if (res.ok) c.put(req, res.clone()).then(() => trim(ASSET_CACHE, MAX_ASSETS));
        return res;
      }).catch(() => hit || caches.match(req, { ignoreSearch: true }));
      return hit || net;
    })));
  }
});
