/* DIPMAPPER_SW_V24 (23.44; supersedes DIPMAPPER_SW_V23 and V22) — always the latest site, offline copy of what you opened or saved.
   Pages and data: always asked fresh from the server (no 10-minute browser cache); the saved copy is used only when offline.
   Versioned scripts and styles (?v=…): served from cache – a new release changes the version, so they can never be stale.
   Never touches other websites: map tiles, photos, weather and ads always go straight to the network. */
const SHELL_CACHE = 'dipmapper-v24-shell';
const ASSET_CACHE = 'dipmapper-v24-assets';
const PAGE_CACHE = 'dipmapper-pages'; // also filled by the Save button (saved places work offline)
const KEEP = [SHELL_CACHE, ASSET_CACHE, PAGE_CACHE];
const SHELL = ['/', '/saved.html', '/offline.html', '/ds2.css', '/fonts.css', '/icons.svg', '/icon-192.png'];
const MAX_ASSETS = 400;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL_CACHE).then(c => Promise.all(SHELL.map(u => fetch(u, { cache: 'no-cache' }).then(r => r.ok && c.put(u, r)).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => !KEEP.includes(k)).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
function trim(name, max) {
  return caches.open(name).then(c => c.keys().then(ks => ks.length > max ? Promise.all(ks.slice(0, ks.length - max).map(k => c.delete(k))) : 0));
}
function fresh(req, cacheName, key) {
  return fetch(req, { cache: 'no-cache' }).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(cacheName).then(c => c.put(key, copy)).then(() => trim(cacheName, cacheName === PAGE_CACHE ? 120 : MAX_ASSETS)); }
    return res;
  });
}
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;            // ads, tiles, APIs, photos: untouched
  if (url.pathname === '/sw.js' || url.pathname.endsWith('-status.json')) return;
  if (req.mode === 'navigate') {
    e.respondWith(fresh(req, PAGE_CACHE, url.pathname).catch(() => caches.match(url.pathname, { ignoreSearch: true })
      .then(r => r || caches.match(url.pathname + '.html'))
      .then(r => r || caches.match('/offline.html'))));
    return;
  }
  if (/\.(css|js|svg|png|webp|jpg|woff2|json)$/.test(url.pathname)) {
    const versioned = /(^|&)v=/.test(url.search.slice(1)) || /\.woff2$/.test(url.pathname);
    if (versioned) {
      e.respondWith(caches.open(ASSET_CACHE).then(c => c.match(req).then(hit => hit || fresh(req, ASSET_CACHE, req).catch(() => caches.match(req, { ignoreSearch: true })))));
    } else {
      e.respondWith(fresh(req, ASSET_CACHE, req).catch(() => caches.match(req, { ignoreSearch: true })));
    }
  }
});
