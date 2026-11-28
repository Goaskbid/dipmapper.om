// DipMapper shared OpenStreetMap cache (23.77). Runs only for /api/* – every page and file is still served as a static asset.
// One answer per identical map query is kept for 30 minutes in Cloudflare's edge cache (Cache API, no extra product, no storage bill),
// so 1,000 visitors looking at the same beach cost Overpass one request instead of 1,000.
const MIRRORS = ['https://overpass.kumi.systems/api/interpreter', 'https://overpass.private.coffee/api/interpreter', 'https://overpass-api.de/api/interpreter'];
const TTL = 1800, MAXQ = 4000;
const json = (o, s, extra) => new Response(JSON.stringify(o), { status: s || 200, headers: Object.assign({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }, extra || {}) });
async function sha(s) { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); }
export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    if (url.pathname === '/api/osm/ping') return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
    if (url.pathname !== '/api/osm') return env.ASSETS ? env.ASSETS.fetch(req) : new Response('Not found', { status: 404 });
    if (req.method !== 'POST') return json({ error: 'POST only' }, 405, { Allow: 'POST' });
    const body = await req.text();
    const q = new URLSearchParams(body).get('data') || '';
    // only the read-only JSON map queries the site itself sends
    if (!q || q.length > MAXQ || !/^\s*\[out:json\]/.test(q) || /\[\s*maxsize|\btimeout\s*:\s*([3-9]\d|\d{3,})/.test(q)) return json({ error: 'query not accepted' }, 400);
    const key = new Request('https://cache.dipmapper.invalid/osm/' + await sha(q), { method: 'GET' });
    const cache = caches.default;
    const hit = await cache.match(key);
    if (hit) { const r = new Response(hit.body, hit); r.headers.set('X-DM-Cache', 'hit'); return r; }
    let last = 502;
    for (const m of (env.OVERPASS ? String(env.OVERPASS).split(',') : MIRRORS)) {
      let r;
      try { r = await fetch(m, { method: 'POST', body: 'data=' + encodeURIComponent(q), headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'DipMapper/23.77 (+https://dipmapper.com/about)' }, cf: { cacheTtl: 0 } }); }
      catch (e) { continue; }
      if (r.status === 429) return json({ error: 'busy' }, 429, { 'Retry-After': '60' });   // never rotate around a rate limit
      if (!r.ok) { last = r.status; if (r.status >= 500) continue; return json({ error: 'rejected' }, r.status); }
      const text = await r.text();
      let ok = false; try { const j = JSON.parse(text); ok = j && Array.isArray(j.elements) && !j.remark; } catch (e) {}
      if (!ok) { last = 502; continue; }
      const out = new Response(text, { status: 200, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=' + TTL, 'X-DM-Cache': 'miss' } });
      ctx.waitUntil(cache.put(key, out.clone()));
      return out;
    }
    return json({ error: 'OpenStreetMap service unavailable' }, last >= 500 ? last : 502);
  }
};
