// DipMapper fact refresh — a small scheduled Cloudflare Worker.
// Each pick's official page is re-read about once a year (a few pages a day). Changes in
// prices, times, months or page status go to a review list; nothing is published by itself.
// Polite by design: robots.txt honoured, one page per website per run, conditional requests,
// short timeouts, a blocked or failing website is paused, hard caps per run.

const UA = 'DipMapperFactCheck/1.0 (+https://dipmapper.com/about)';
const PER_RUN = 4;              // pages per run; with one run a day ~1,460 reads a year for ~609 sources
const RECHECK_DAYS = 330;       // a source is due again after this many days
const TIMEOUT_MS = 15000;
const MAX_BYTES = 1_500_000;    // never read more than this from one page
const PAUSE_DAYS = 30;          // after a block (403/429) or robots.txt refusal

const MONTHS = /\b(jan(uary)?|feb(ruary)?|mar(ch)?|apr(il)?|may|june?|july?|aug(ust)?|sep(t(ember)?)?|oct(ober)?|nov(ember)?|dec(ember)?|januar|februar|märz|mai|juni|juli|oktober|dezember)\b/gi;
const PRICE = /(?:CHF|EUR|USD|GBP|AUD|NZD|€|\$|£)\s?\d{1,4}(?:[.,]\d{2})?|\d{1,4}(?:[.,]\d{2})?\s?(?:CHF|EUR|€|Fr\.)/g;
const TIME = /\b([01]?\d|2[0-3])[:.][0-5]\d\b/g;

export function facts(text) {
  const t = text.replace(/\s+/g, ' ');
  const uniq = (re) => [...new Set((t.match(re) || []).map((s) => s.toLowerCase().replace(/\s+/g, '')))].sort().slice(0, 40);
  return { prices: uniq(PRICE), times: uniq(TIME), months: uniq(MONTHS) };
}

export function diff(a, b) {
  const out = {};
  for (const k of ['prices', 'times', 'months']) {
    const A = new Set(a[k] || []), B = new Set(b[k] || []);
    const gone = [...A].filter((x) => !B.has(x)), added = [...B].filter((x) => !A.has(x));
    if (gone.length || added.length) out[k] = { gone, added };
  }
  return out;
}

function htmlToText(html) {
  return html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&euro;/g, '€');
}

async function get(url, extra = {}) {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, { headers: { 'User-Agent': UA, Accept: 'text/html,text/plain;q=0.9', ...extra }, redirect: 'follow', signal: ac.signal });
  } finally { clearTimeout(timer); }
}

async function readCapped(res) {
  const reader = res.body.getReader(); const chunks = []; let n = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value); n += value.length;
    if (n > MAX_BYTES) { await reader.cancel(); break; }
  }
  const all = new Uint8Array(n); let o = 0;
  for (const c of chunks) { all.set(c.subarray(0, Math.min(c.length, n - o)), o); o += c.length; }
  return new TextDecoder().decode(all);
}

export function robotsAllows(txt, path) {
  // groups of user-agent lines followed by rules; our own group wins over '*'
  const groups = []; let cur = null, lastWasAgent = false;
  for (const raw of (txt || '').split(/\r?\n/)) {
    const line = raw.replace(/#.*/, '').trim(); if (!line) continue;
    const i = line.indexOf(':'); if (i < 0) continue;
    const key = line.slice(0, i).trim().toLowerCase(), val = line.slice(i + 1).trim();
    if (key === 'user-agent') {
      if (!cur || !lastWasAgent) { cur = { agents: [], rules: [] }; groups.push(cur); }
      cur.agents.push(val.toLowerCase()); lastWasAgent = true; continue;
    }
    lastWasAgent = false;
    if (cur && (key === 'allow' || key === 'disallow')) cur.rules.push([key, val]);
  }
  const own = groups.filter((g) => g.agents.some((a) => a.includes('dipmapper')));
  const rules = (own.length ? own : groups.filter((g) => g.agents.includes('*'))).flatMap((g) => g.rules);
  let best = null;
  for (const [k, v] of rules) {
    if (!v) continue;
    const re = new RegExp('^' + v.replace(/[.+?^{}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*'));
    if (re.test(path) && (!best || v.length > best[1].length || (v.length === best[1].length && k === 'allow'))) best = [k, v];
  }
  return !best || best[0] === 'allow';
}

async function hostState(db, host) {
  return await db.prepare('SELECT * FROM hosts WHERE host=?').bind(host).first();
}

export async function checkOne(env, src, now) {
  const db = env.DB; const u = new URL(src.url); const host = u.host;
  const hs = await hostState(db, host);
  if (hs && hs.paused_until && hs.paused_until > now) return { id: src.id, skipped: 'host paused' };
  // robots.txt, cached per host for 30 days
  let robots = hs && hs.robots_at && now - hs.robots_at < 30 * 864e5 ? hs.robots : null;
  if (robots === null) {
    try { const r = await get(u.origin + '/robots.txt'); robots = r.ok ? (await readCapped(r)).slice(0, 200000) : ''; } catch { robots = ''; }
    await db.prepare('INSERT INTO hosts(host,robots,robots_at) VALUES(?,?,?) ON CONFLICT(host) DO UPDATE SET robots=excluded.robots, robots_at=excluded.robots_at').bind(host, robots, now).run();
  }
  const prev = await db.prepare('SELECT * FROM sources WHERE id=?').bind(src.id).first();
  const mark = async (status, f, etag, lm, note) => {
    await db.prepare('INSERT INTO sources(id,url,name,checked_at,status,facts,etag,last_modified,note) VALUES(?,?,?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET url=excluded.url,name=excluded.name,checked_at=excluded.checked_at,status=excluded.status,facts=COALESCE(excluded.facts,sources.facts),etag=COALESCE(excluded.etag,sources.etag),last_modified=COALESCE(excluded.last_modified,sources.last_modified),note=excluded.note')
      .bind(src.id, src.url, src.name, now, status, f ? JSON.stringify(f) : null, etag || null, lm || null, note || null).run();
  };
  const review = async (kind, detail) => {
    const d = JSON.stringify(detail);
    const open = await db.prepare('SELECT rid FROM review WHERE id=? AND kind=? AND detail=? AND done=0').bind(src.id, kind, d).first();
    if (open) return;
    await db.prepare('INSERT INTO review(id,name,url,found_at,kind,detail) VALUES(?,?,?,?,?,?)').bind(src.id, src.name, src.url, now, kind, d).run();
  };
  if (!robotsAllows(robots, u.pathname + u.search)) {
    await mark(0, null, null, null, 'robots.txt does not allow reading');
    return { id: src.id, skipped: 'robots' };
  }
  const extra = {};
  if (prev && prev.etag) extra['If-None-Match'] = prev.etag;
  if (prev && prev.last_modified) extra['If-Modified-Since'] = prev.last_modified;
  let res;
  try { res = await get(src.url, extra); } catch (e) {
    await mark(-1, null, null, null, 'no answer');
    if (prev && prev.status === -1) await review('unreachable', { note: 'no answer twice in a row' });
    return { id: src.id, error: 'timeout' };
  }
  if (res.status === 403 || res.status === 429) {
    await db.prepare('UPDATE hosts SET paused_until=? WHERE host=?').bind(now + PAUSE_DAYS * 864e5, host).run();
    await mark(res.status, null, null, null, 'blocked, host paused');
    return { id: src.id, status: res.status };
  }
  if (res.status === 304) { await mark(304, null, null, null, 'unchanged (304)'); return { id: src.id, status: 304 }; }
  if (res.status === 404 || res.status === 410) {
    await mark(res.status, null, null, null, 'page gone');
    await review('page gone', { status: res.status });
    return { id: src.id, status: res.status };
  }
  if (!res.ok) { await mark(res.status, null, null, null, 'http ' + res.status); return { id: src.id, status: res.status }; }
  const f = facts(htmlToText(await readCapped(res)));
  const moved = res.url && new URL(res.url).host !== host ? res.url : null;
  if (prev && prev.facts) {
    const d = diff(JSON.parse(prev.facts), f);
    if (Object.keys(d).length) await review('facts changed', d);
  }
  if (moved) await review('moved to another website', { to: moved });
  await mark(res.status, f, res.headers.get('etag'), res.headers.get('last-modified'), prev ? 'checked' : 'baseline');
  return { id: src.id, status: res.status, baseline: !prev };
}

export async function run(env, now = Date.now()) {
  const list = await (await fetch(env.SOURCES_URL, { headers: { 'User-Agent': UA } })).json();
  const db = env.DB;
  const seen = new Map((await db.prepare('SELECT id, checked_at FROM sources').all()).results.map((r) => [r.id, r.checked_at]));
  const due = list.filter((p) => p.u && /^https?:\/\//.test(p.u))
    .map((p) => ({ id: p.id, url: p.u, name: p.n, at: seen.get(p.id) || 0 }))
    .filter((p) => now - p.at > (+env.RECHECK_DAYS || RECHECK_DAYS) * 864e5)
    .sort((a, b) => a.at - b.at || (a.id < b.id ? -1 : 1));
  const out = [], hosts = new Set();
  for (const s of due) {
    if (out.length >= (+env.PER_RUN || PER_RUN)) break;
    const h = new URL(s.url).host; if (hosts.has(h)) continue; hosts.add(h);
    out.push(await checkOne(env, s, now));
  }
  return { due: due.length, done: out };
}

export default {
  async scheduled(event, env, ctx) { ctx.waitUntil(run(env)); },
  // no public endpoint: the review list is exported to the private repository by the monthly GitHub job
  async fetch() { return new Response('Not found', { status: 404 }); },
};
