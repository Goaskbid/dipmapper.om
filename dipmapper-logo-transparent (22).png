const CACHE='dipmapper-v19.1-shell';
const SHELL=['./','index.html','manifest.webmanifest','privacy.html','cookies.html','terms.html','disclaimer.html','safety.html','advertising.html','imprint.html','sources.html'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).catch(()=>{}));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;e.respondWith(fetch(r).then(res=>{const copy=res.clone();if(new URL(r.url).origin===location.origin)caches.open(CACHE).then(c=>c.put(r,copy)).catch(()=>{});return res}).catch(()=>caches.match(r).then(m=>m||caches.match('index.html'))))});
