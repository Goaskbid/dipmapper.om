/* DIPMAPPER_SW_V22 — offline shell for the installed app.
   Network first for pages (updates arrive immediately), cached copy only when offline.
   Never touches other websites: maps, photos, weather and ads always go straight to the network. */
const CACHE = 'dipmapper-v22-shell';
const SHELL = ['/', '/swim.html', '/privacy.html', '/imprint.html', '/assets/icon-192.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {}).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;            // ads, tiles, APIs: untouched
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match('/'))));
    return;
  }
  if (SHELL.includes(url.pathname)) {
    e.respondWith(caches.match(req).then(r => r || fetch(req)));
  }
});
