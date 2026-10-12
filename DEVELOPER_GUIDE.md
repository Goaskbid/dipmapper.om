# DipMapper — Developer Guide

**Product:** dipmapper.com — find lakes, beaches, pools and public baths near any place on earth.
**Owner:** Torsten Sauter, Meilen (Switzerland). **Current version:** 23.0.0 (10 Oct 2026) — swimming plus water activities.
**Repository:** github.com/Goaskbid/dipmapper.om, served by GitHub Pages on the custom domain dipmapper.com.

This guide is for a developer taking over the project. Read sections 1–5 before changing anything, because the owner's rules (section 2) are strict and several earlier versions broke because they were ignored.

---

## 1. What is in this package

| Folder | What it is |
|---|---|
| `website/` | **Everything that is served on dipmapper.com** (index.html = v23.0.0, ready to upload; everything else is byte-identical to what is live). Upload these files to the root of the repository. |
| `tools/tests/` | Automated browser regression suite (38 checks, headless Chrome). `npm install` then `npm test`. All map/geo/weather services are mocked, so results do not depend on the internet. |
| `tools/build/` | The patch layers and build scripts of the last two releases (v22.20, v22.21/22.22) — examples of how changes were applied. |
| `generator/` | Swim-guide generator (Python + GitHub Actions workflow in `generator/.github/workflows/`). **Not active** in the live repository today — see 9.3. |
| `assets-source/` | High-resolution transparent logo (WebP and PNG, 471×291) that is embedded in index.html. |
| `archive/` | Older standalone builds (v20.7, v21.9.4) and old release notes, renamed by their real headings. History only. |

---

## 2. The owner's rules (non-negotiable)

1. **No regressions.** Anything that worked must keep working. Run the full test suite before every delivery (section 7) and compare against the previous version when something looks different.
2. **Never remove, disable or narrow a feature without asking first.** A feature that still renders but has nothing to offer counts as removed. If a change trades something off (example: the phone map became smaller in v22.21 so the selectors fit), say so explicitly and get agreement.
3. **Verify, don't assert.** Every claim ("fixed", "faster", "no overlap") comes with a measured result.
4. **One file per GitHub commit.** Uploading several files at once in the GitHub web interface has scrambled file names and contents before (see 9.1). Upload one file, commit, then the next.
5. **Every delivery** = the built HTML, a source zip, and an upload sheet as **.docx and .pdf** (the owner does not read Markdown). Plain English. End every delivery with a list of open items.
6. **Changes are only live after upload.** Always state the version number; the visible version line at the bottom of the page (`DipMapper version x.y.z`) is how the owner checks what is live.
7. **Commercial quality.** No blinking, no layout jumps, no half-finished looks, no "AI slop" texts, no German words inside English sentences (local proper names stay, with an English gloss).

---

## 3. Architecture

### 3.1 One file
The whole app is **one self-contained `index.html` (~584 KB, ~206 KB gzipped)** — vanilla HTML/CSS/JS, no framework, no build step, no dependencies to install. It also works when opened from disk (`file://`), with ads and the service worker switched off there.

Structure of `index.html`, in order:

| Part | Content |
|---|---|
| `<head>` meta | SEO, Open Graph, JSON-LD, `google-adsense-account` meta, favicons as data URIs |
| boot script (≈300 B) | adds `html.dmBooting` (hides the page until the welcome screen is ready) plus a fail-safe that reveals the page after 6.5 s if the welcome code ever fails |
| logo + speed script (≈77 KB) | `window.DM_LOGO` (the logo, embedded **once**, WebP), `--dmLogo` CSS variable, `dmLogoFill()`, the `setInterval` wrapper that pauses housekeeping timers while scrolling, `dmRafOnce()` |
| `<style id="dmBootCss">` | welcome screen styles (animated sun, waves, logo card) |
| main `<style>` (≈170 KB) | all app styles. Built up over many releases: later rules override earlier ones, often with `!important` and higher specificity (`html body …`, `html.dmPhone body …`) |
| body markup | welcome screen `#dmBoot`, start screen `.gate`, header `.topbar`, search/status, `#mapPanel` (`#map`), `#dmBelow` (selectors `#filters`, list `#results`), detail drawer `#drawer` |
| ad loaders | `ads-config.js` and the AdSense loader, both skipped on `file://` |
| welcome-screen script | min. 2.4 s from the moment it appears, lifts when the start screen is complete, tap to skip |
| **main app script (≈187 KB)** | `state`, `els`, search, Overpass/Nominatim, ranking, rendering, map, drawer. Starts with `const $=…,OWNER='Torsten Sauter'` |
| features script (≈10 KB) | gate photo, heart, directions, share |
| **UI behaviour layer (≈85 KB)** | "v22 – Additive only": smooth list/card morphing, saved spots, swim score, alerts, forecast, minimap, emblems, writer, selectors, search suggestions (`DM_PLACES`), map overlay dock, etc. |
| `<style id="dmV2220">`, `<style id="dmV2221">` + v22.21 script | speed fixes, bigger header logo, map-pick naming, phone map sizing and scroll hold |
| `<style id="dmV23">` + v23 script | **water activities** (section 12): activity switcher, own OpenStreetMap search, pins, list, detail sheet, wind/marine conditions |

Note: the version bump replaces the version string everywhere, so some code comments show the current version number although the code is older; use section 11 and the archive for history, not comments.

**Pattern used since v22:** new behaviour is added as a *layer* at the end of the file (CSS block + script) that hooks into the existing functions, instead of rewriting the core. This kept regressions low but leaves a lot of overridden CSS. See section 10 for a recommended clean-up path.

### 3.2 Key globals and functions (main script unless noted)

| Name | Role |
|---|---|
| `state` | single app state: `center`, `mapCenter`, `zoom`, `label`, `results`, `filter`, `selected`, `scanId`, caches … |
| `els` | cached DOM references (`els.map`, `els.mapSub`, `els.resultSub`, …) |
| `resolveDestination()` / `geocodePick()` | typed text → place. `dmResolve()` (layer) first checks the built-in multilingual list `DM_PLACES` (Geneva/Genf/Genève …) |
| `backgroundScan()` | runs the search in waves: Overpass `around:` queries at 8 / 20 / 55 km (capped by the chosen radius) and a names pass, with `textRescue()` (Nominatim, bounded to the area) as fallback |
| `overpassFast()` / `queryLayer()` | Overpass with several endpoints and timeouts |
| `osmToVenue()` / `nominatimToVenue()` / `merge()` / `sortResults()` | normalise, de-duplicate and rank places. `dmNotSwimming()` filters billiards/"pool bar" false positives |
| `render()` / `drawMap()` | list and map. `#results.innerHTML` is overridden so updates are **morphed per card** (`dmMorphList`), and tiles are morphed (`dmMorphTiles`) — this is what prevents blinking |
| `openCard()` / `closeCard()` | detail drawer; `dmMorphCard` keeps the scroll position when data refreshes |
| `rerunCurrentSearch()` | re-runs the search at `state.center` (radius change, "Search this area", map pick) |
| `hydrateMedia()` / `commonsImages()` | photos from Wikimedia Commons, with fallbacks |
| `loadCurrentWeather()`, `dmForecast()` | Open-Meteo weather and 7-day forecast |
| `dmSwimScore()`, `dmAlertCheck()`, `dmSavedList()` | swim score, alerts, saved spots (layer) |
| `mountAds()`, `dmGateVisible()` | AdSense; ads are never mounted while the welcome or start screen is visible |
| `dmAppBoot()` | registers `/sw.js` only if it is the verified DipMapper worker |
| `dmNamePoint()` (v22.21) | names a picked map point via Nominatim reverse ("Binz, Germany") |

### 3.3 External services (all free, no keys)

| Service | Used for |
|---|---|
| Overpass API (`overpass.private.coffee`, `overpass.kumi.systems`, `overpass-api.de`) | swim places from OpenStreetMap |
| Nominatim (`nominatim.openstreetmap.org`) | geocoding, reverse geocoding, text fallback search |
| Photon (`photon.komoot.io`) | live place suggestions while typing |
| Open-Meteo | weather, sunset/golden hour, forecast |
| EEA ArcGIS (`water.discomap.eea.europa.eu`) | official EU bathing-water quality |
| Wikimedia Commons / Wikidata / flagcdn | photos, coats of arms, flags |
| OSRM (`router.project-osrm.org`, `routing.openstreetmap.de`) | travel times |
| Map tiles: OpenStreetMap (primary, probed at start) → automatic switch to Esri World Street Map if blocked; Esri when opened from disk (`DM_TILE_SRC`, `dmTileProbe`) | map. CARTO is **not** usable without a key (it shows an "API KEY REQUIRED" watermark) |
| Google AdSense + Google certified CMP | ads and EU consent |

Public servers are rate-limited and sometimes slow. The app is built to degrade gracefully (fallbacks, retries, cached results in `localStorage dm_scan_cache` for 30 min). Respect the Nominatim usage policy (max ~1 request/second sustained).

### 3.4 Browser storage keys
`dm_radius`, `dm_filter`, `dm_sort`, `dm_recent` (recent places), `dm_last_origin`, `dm_scan_cache`, `dm_seen`, `dmIosHint`, `dmSaved` (saved spots), `dmAlerts`, `dip_cookie_choice` / `ow_cookie_choice` (consent).

### 3.5 Other website files

| File | Purpose |
|---|---|
| `manifest.webmanifest`, `sw.js` | installable app (PWA). Service worker = network first, offline shell only, never touches other sites. Icons are in the root (`/icon-192.png` …), not in `/assets/` |
| `ads-config.js` | AdSense client `ca-pub-2870312071451207` and optional fixed slot IDs (`header`, `mid`, `list`, `footer`). Empty slots = Auto ads only |
| `ads.txt`, `robots.txt`, `sitemap.xml`, `CNAME`, `.nojekyll` | AdSense authorisation, crawling, domain, GitHub Pages |
| `privacy`, `cookies`, `imprint`, `terms`, `disclaimer`, `safety`, `sources`, `advertising` `.html` | legal and info pages (operator details in imprint) |
| `swim.html` + `meilen/miami/palma/rhodes/rostock/zurich.html` | swim guide hub and city guides (SEO) |
| `*.png`, `favicon.svg` | icons and store screenshots |

---

## 4. Behaviour that must not break (acceptance list)

These were each requested by the owner, usually after a bug. The test suite covers them (check names in brackets).

**Start**
- Welcome screen on every start (phone and desktop), animated, at least 2.4 s **from the moment it appears**, then a cross-fade to the finished start screen — no bare frames, no flash of an unstyled card (`start-screen-*`, `welcome-failsafe`).
- If the welcome code fails, the page still appears after ~6.5–7 s (`welcome-failsafe`).
- No ads behind the welcome or start screen (`ads-gating`).

**Search**
- Typing shows suggestions; local and foreign names work: Geneva / Genf / Genève / Geneve → Geneva, Switzerland, never Geneva NY (`suggestions`, `geneva-phone`, `genf-desktop`).
- A real tap/click into the field selects the old text so typing replaces it (`tap-replaces-text`).
- The chosen radius stays (Rostock at 50 km stays 50 km; a new place keeps 10 km) (`search-*`).
- "Pick on map" and "Search this area" work anywhere, also when the map servers are busy (`map-pick-*`).

**Map**
- Map never blinks: redraws, scrolling and browser-bar resizes must not rebuild tiles (`no-blink`).
- Drag, pinch, wheel zoom; dragging the map does not scroll the page (`map-drag`).
- Rain warning, golden-hour info, attribution and search pill never overlap (`overlays-*`).
- Header has no Results / Map / Re-scan buttons; re-scan is the ↻ in the map toolbar (`overlays-phone`).

**Phone layout**
- Phone shows the map before the list; header stays visible; tapping the logo returns to the start (`phone-suite`).
- Map, legend and all 20 one-click selectors fit on one screen under the header; scrolling from the search gently holds there (touch phones only), a firmer swipe continues to the list, and the page never rests with the map half cut (`phone-map-hold-*`, `selectors`).
- All 20 selectors fully visible, no sideways scrolling (`selectors`).

**List and detail cards**
- No blinking while data loads; cards are morphed, never rebuilt (`no-churn`).
- A card opens at the top; refreshes keep the scroll position; Close works in every situation, also while scrolled and during refresh (`close-*`).
- Swim score on every card and in the panel (`score-quality-*`); official water quality where the EU has data; alerts; real forecast (`forecast`, `alerts`); saved spots persist (`saved-spots`).
- Texts: human, specific, no German inside English sentences; billiards/pool bars are never "pools" (`crete-texts`, `detail-panels`).

**Other**
- Works when opened from disk, even if the ad server hangs (`open-from-disk`).
- Desktop: the map stays pinned while the list scrolls (`desktop-sticky-map`).

---

## 5. How to deploy (GitHub Pages)

1. Go to github.com/Goaskbid/dipmapper.om → **Add file → Upload files**.
2. Drag **one** file, **Commit changes**. Repeat per file. All files go into the repository **root** (no folders).
3. Wait 1–2 minutes, open dipmapper.com, reload fully (Ctrl+Shift+R; on a phone close and reopen the tab) and check the version line at the very bottom of the page.

Bump the version for every release: replace the version string everywhere in `index.html` (it appears ~40 times, including `data-version` on `<body>` and the visible `dmVer` line). If `sw.js` changes, also bump its cache name (`dipmapper-v22-shell`) so installed apps refresh.

---

## 6. How to make a change safely

1. Start from `website/index.html` (= what will be live).
2. Prefer a **new layer** at the end of the file (`<style id="dmV22xx">` + `<script>`) over editing old code, unless you are deliberately cleaning up (section 10). Look at `tools/build/v22.21/` for the pattern: an exact-match `rep(old,new,name,count)` that aborts if the anchor text is not found exactly once.
3. CSS: later rules win only with equal or higher specificity. Many old rules use `!important` and `html body …` / `html.dmPhone body …`. Check the computed style in DevTools before assuming your rule applies.
4. **Keyframe names must be unique** (an old name collision once broke the start screen). Entrance animations must never leave content at `opacity:0` if the animation fails.
5. Never rebuild the list or the map wholesale — use the existing morph paths (`render()`, `drawMap()`), otherwise blinking returns.
6. Phone vs desktop: `html.dmPhone` is the phone layout (≤760 px). Touch-only behaviour uses `@media (hover:none) and (pointer:coarse)`.
7. Check that every inline script still parses (`node --check` on each extracted script).
8. Run the full test suite, then look at the page yourself on a phone and a desktop.

---

## 7. Automated tests

Requirements: Node.js 18+ (20+ recommended).

```
cd tools/tests
npm install          # downloads Puppeteer and a matching Chrome
npm test             # = node run_all.js  (38 checks, ~12 minutes with 2 parallel jobs)
node run_all.js --jobs 1 --only close-phone,no-blink    # run selected checks
```

- The runner copies `../../website` into `tools/tests/_site/` (index.html also as `final.html`), serves it on `http://127.0.0.1:8765/` and runs each check. Output per check is saved in `tools/tests/results/`.
- To use your own Chrome: `CHROME_PATH=/path/to/chrome npm test`.
- All network calls (Overpass, Nominatim, Photon, Open-Meteo, EEA, images) are intercepted and answered with fixed test data inside each test.
- **Run with at most 2 parallel jobs.** Two checks (`design-markers`, `no-blink`) measure timing and can fail spuriously under heavy CPU load; re-run them with `--jobs 1` before treating a failure as real.

Useful measuring tools in the same folder (not part of `npm test`):

| Script | Measures |
|---|---|
| `frames.js URL tag W H` + `strip.py` | frame-by-frame screenshots of the page load (flashes, welcome screen) |
| `slowboot.js URL W H` (env `KBPS`) | when the welcome screen appears and disappears on a slow connection |
| `iperf.js URL W H CPU` | first-result time, long tasks, interaction latency on a throttled phone |
| `pickjump.js URL W H` | whether anything above the map moves after a map pick |
| `rest.js URL W H` | where the page comes to rest after scrolling (phone scroll hold) |
| `pick2.js URL W H` (env `OVERPASS=fail`) | map pick at Rügen with busy map servers |

Last full run (v23.0.0, 10 Oct 2026): **37 of 38 passed**; the one failure (`no-blink`, under heavy parallel load) passed 3 of 3 when re-run alone and occurs equally on v22.22.

---

## 8. AdSense status

- Publisher `ca-pub-2870312071451207`. Verification meta tag in every page, `ads.txt` in the root.
- Auto ads are prepared; fixed slots can be added by filling the IDs in `ads-config.js` (upload that file alone).
- Consent: Google certified CMP (Privacy & messaging → European regulations). The owner still has to publish the message (privacy URL `https://dipmapper.com/privacy.html`, logo `https://dipmapper.com/dipmapper-icon.png`), request the site review and switch Auto ads on.

---

## 9. Known issues and loose ends (for the developer)

### 9.1 The GitHub repository contains junk and scrambled files
The repository root holds **91 numbered duplicates** (`name (1).md`, `icon-192 (24).png` …) and about **30 files whose content does not match their name** (e.g. `README.md` contains a package.json, `package.json` contains an old HTML build, `logo-dipmapper.svg` is a PNG, the `v20_*.md` notes contain each other's texts, `download` is a PNG). They are leftovers of multi-file web uploads. None of them is used by the site. **Recommended:** delete them one by one in the GitHub web interface, or replace the repository with the `website/` folder of this package (plus a README). Keep `.nojekyll` and `CNAME`.

### 9.2 Broken links in the city guide pages
`meilen.html`, `miami.html`, `palma.html`, `rhodes.html`, `rostock.html` and `zurich.html` link to `/swim/<city>.html` and to `/assets/dipmapper-icon.png`, which do not exist (the files sit in the root). `swim.html` itself works (it uses in-page anchors). Fix either by moving the city pages into a `swim/` folder or by correcting the links, then add them to `sitemap.xml`.

### 9.3 Swim-guide generator not active
`generator/tools/build_guides.py` + `generator/.github/workflows/swim-guides.yml` would generate one page per city with named swim spots into `swim/`, nightly via GitHub Actions. It is not installed in the repository. Installing it means committing `tools/build_guides.py` and `.github/workflows/swim-guides.yml` and allowing Actions to write.

### 9.4 Product/ops items still open
- Real-device check on iPhone of the phone scroll hold (headless Chrome cannot do real finger swipes; it was tested by where the page comes to rest).
- Phone map size trade-off (v22.21): 398 px instead of 456 px on a 390×844 phone so map + all selectors fit. Owner to confirm.
- AdSense: publish consent message, request review, Auto ads on (section 8).
- Optional paid map provider (key) if a different map style is wanted.
- Google Play (TWA) signing fingerprint for the Android app listing.
- Dark mode as a separate release.

---

## 10. Recommended next technical steps

1. **Consolidate CSS.** The main stylesheet contains many generations of overrides. Consolidate per component (header, gate, map panel, selectors, list, drawer), remove dead rules, and keep the test suite green after each component.
2. **Split the file only with a build step that outputs one file again.** The single-file deployment (and `file://` support) is a deliberate feature. A small script that inlines `src/*.css` and `src/*.js` into one `index.html` would make development easier without changing deployment.
3. **Turn the layers into modules** (search, map, list, drawer, features) with clear hooks instead of wrapping global functions.
4. **Clean up the repository** (9.1) and fix the city-guide links (9.2).
5. **Error monitoring:** a tiny `window.onerror` beacon (privacy-friendly) would show real-device errors.
6. Keep every change measured: before/after numbers and screenshots, as the owner expects.

---

## 11. Release history (recent)

| Version | Date | Content |
|---|---|---|
| 23.8.1 | 11 Oct 2026 | Phone: search card, map and lists share one width; whole interview open (all 3 photos visible); About photos load last; 63 test checks. |
| 23.8.0 | 11 Oct 2026 | About DipMapper section with the founder interview and three built-in photos; About button in the PC header; founder in structured data; 59 test checks. |
| 23.7.0 | 11 Oct 2026 | Clean map (only real prohibitions, per activity, max. 3 labels), Specials limited to 6–12 curated entries, divers' "Under water" section (depth, visibility, fish), boat fuel stations, one water-temperature model, swim view fix after mode switch, map zoom cap 14, data audit. |
| 23.6.0 | 11 Oct 2026 | First-time-user journey, start-screen activity picker, phone layout fixes, GitHub layout. |
| 23.0.0 | 10 Oct 2026 | Water activities beside swimming: Paddle, Dive, Sail & wind, Boats & tours, Rafting — own search, places vs providers, evidence levels, live wind/marine conditions, detail sheet, 3 new test checks. |
| 22.22.0 | 8 Oct 2026 | Phone map size settles once and ignores browser-bar height changes (prevents a tile redraw). |
| 22.21.0 | 8 Oct 2026 | Map pick works when map servers are busy (fallback searched "beach the map area"); picked point named; map caption one line (no jump after a pick); phone: map + legend + all selectors fit one screen, gentle scroll hold; solid phone header. |
| 22.20.0 | 8 Oct 2026 | New animated welcome screen (min. time counted from appearance); header logo larger and sharper; page 1.16 MB → 0.58 MB (logo embedded once); smoother scrolling (no full-page background repaints, paused timers while scrolling). |
| 22.19.0 | 8 Oct 2026 | First-paint welcome screen (no flash of the bare start card), root icon paths, visible version line. |
| 22.18.0 | 7 Oct 2026 | Place suggestions (multilingual), Geneva fix, header buttons removed, rain/golden-hour overlay dock. |
| 22.9–22.17 | Oct 2026 | Smooth UI (no blinking), stable cards, minimap, swim score, water quality, alerts, saved spots, forecast, emblems, writer texts, search redesign, selectors, AdSense readiness. |

---

## 12. Water activities (v23 – v23.8.1)

**Principle:** the swim engine is untouched. Activities run in a separate layer (last `<script>` in index.html, CSS in `<style id="dmV23">`) that shares the search point (`state.center`, `state.label`), the radius, the map projection and the design.

| Part | How it works |
|---|---|
| Switcher `#dmActBar` | inserted after the radius control `#dmRadius`. Modes: `swim` (default), `paddle`, `dive`, `sail`, `boat`, `raft`. Stored in `localStorage dm_act`; URL `?act=paddle` opens a mode. `html.dmActOn` + `data-act` are set on `<html>`. |
| Hiding swim UI | in activity mode CSS hides `#filters`, `#results`, the swim list head, the swim legend and swim pins (`.dmOverlay .marker`). Radius ring, search pill, weather dock remain. |
| Search | `query(mode,R,lat,lon)` builds one Overpass union per mode (tags in the v23 report, section 3) → `overpassFast()` → `classify()` → `dedupe()` → ranking. Triggered by `check()` when mode, centre or radius change (hooked into `backgroundScan` and a 0.7 s watcher). Results cached 30 min per mode/centre/radius. Widens once to 25 km if fewer than 3 results. |
| Classification | `classify(element, mode)` returns `{id, osm, name, type, kind, acts:{key:'map'|'name'}, ev, web, book, phone, email, hours, season, charge, rent[], operator, addr, wheel, descr, edited, checked}` or null. Activity regexes in `RX`, taxonomy in `ACT`, types in `TYPE`, mode filters in `CHIPS`. |
| Pins | own layer `.dmActPins` inside `#map`, repainted after every `drawMap()` (wrapped). Buttons use class `marker dmActPin` **without** `data-mid`, so the page-wide swim pin guards do not intercept them. |
| List and sheet | `#dmActPanel` is kept directly before `#results` (re-placed if the app moves the list). Cards use their own classes (`dmAcard`, `dmAopen`) because page-wide guards stop clicks on `.result` and `[data-open]`. The detail sheet `#dmActSheet` reuses the `drawer` / `drawerBack` classes for the look but has its own id and handlers. |
| Fit | `fitToSpots` is wrapped: in activity mode only a tap on **Fit** fits to activity results; automatic fits from the swim search do nothing. |
| Phone sizing | the v22.21 `fit()` measures `#dmActChips` instead of `#filters` in activity mode and never makes the map larger than in swim mode (`window.__dmSwimMapH`), so switching modes does not move the layout. |
| Conditions | `getWx()` (Open-Meteo forecast: current + 9 hours wind/gusts) and `getSea()` (Open-Meteo marine; shown only if values are returned). Cached 15 min. Always labelled with source and time; no safety verdicts. |
| Debug | `window.dmAct` exposes the state (mode, items, key) for tests; `window.dmSetActivity('paddle')` switches mode. |

### 12.1 Verified directory, global fallback, rules (v23.1)

| Part | How it works |
|---|---|
| Source file | `tools/build/v23.1/dir.js` defines `window.DM_ACT_DIR` (entries) and `window.DM_ACT_RULES` (local rules). The build inlines it before `act.js`. |
| Entry fields | `id, n, lat, lon, geo:'known'|'est', type (TYPE key), acts[] (ACT keys), addr, phone, email, web, season, hours, prices:[[label,'CHF …']], offers, notes, src:[name,url], checked:'YYYY-MM-DD', thin` |
| Search | Activity radius is at least 15 km. `dirItems(mode, centre, km)` adds entries at once (before Overpass answers, and also when it fails, with `A.err='partial'`). `mergeDir()` merges an OSM element into a directory entry when they are ≤1.2 km apart and share a significant brand token (`toks()` ignores generic words `STOPW` and place names `PLACEW`; only the part before " – " in the directory name counts). Entries without brand tokens merge only with an OSM element of the same type ≤150 m away. |
| Ranking | `rank()` gives directory entries a bonus of 1.5 km (0.4 km if `thin`), plus 0.5 km for published prices. |
| UI | Card chips: `✔ Verified` and `from CHF x`. `minPrice()` ignores "further / additional / +" rows. Quick links `.dmAq` (Call, Website). The sheet has a price table `.dmAprices`, a source line with "Report a change" (mailto), and `refineGeo()` (Nominatim by address for `geo:'est'`, accepted within 5 km, cached in `localStorage dm_geo_v1`). |
| Rules | `rulesHtml()` shows one collapsible `.dmActRule` box (open on desktop) for every rule whose circle (`lat, lon, r` km) contains the search point and whose `modes` include the current mode. |
| Global fallback | `moreHtml()` adds the "Looking for more?" box with a Google Maps search link (`GQ` maps mode or filter → query words) to the list end, the empty state and the busy state. |

**Adding directory entries:** only from a published source (operator page, tourism office, authority). Copy prices exactly, with their labels, and set `checked` to the date you read them. Run `tools/tests/activities.js` (checks `activities-*`). Never estimate prices. Leave fields empty if they are not published.


### 12.2 Version 23.2: butler, verdicts, water, ice, no-go zones, famous spots, SEO

**Source files** (`tools/build/v23.2/`):

| File | Contents |
|---|---|
| `act_core.js` | The engine from 12/12.1, with the marker `/*@@MODULES@@*/` where the modules are inlined. |
| `m_core.js` | Opening-hours parser (`ohParse`, `ohStatus`, `ohWeek`, `openInfo`); conditions (`getCond` forecast incl. 48 h history and 3 days ahead, `getClim` 92-day daily history, `getSea`, `getRiver` (GloFAS flood API, one year), `getWQ` (EEA), `getFish` (GBIF facets + species names), `getCC` (Nominatim reverse, country)); `waterTemp` and `suitAdvice`; ice model `iceModel`/`iceLevel`; the verdict `assess` (profiles in `PROF`, weighted parts like `dmSwimScore`: wind/waves .30, water .20, weather .20, open .15, access .15; hard caps); `assessIce`; `bestWindow`; `rating` (★ 3–5); price units `priceUnit`/`priceSummary`; photos `photosFor` (OSM tag → Commons search by name → Commons geosearch, keyword-ranked, cached in `localStorage dm_actph_v1`); illustrations `art(kind,colour)`. |
| `m_ui.js` | `visible()` with sort/filter; `loadCenter` (one forecast + climate + marine + country call per search point); `butlerHtml`; `toolsHtml`; `list`/`card`; detail sheet `openSheet` and `fillSheet` (gallery, verdict with parts, hours, prices, requirements, water & nature, next hours, contacts, sticky action bar); map layers `loadZones` (one Overpass call with `out geom`, delayed 3.5 s in swim mode) and `paintLayers` (SVG no-go zones, temperature or ice bubbles, legend); `swimTempTags` (tags beside swim pins, de-overlapped, same value as `dmDisplayWaterTemp`). Layers only rewrite their DOM when their content changed, because swim observers watch `#map`. |
| `m_fame.js` | Wikipedia geosearch (10 km) filtered by keywords per mode → famous items (★ pin, Wikipedia photo and intro). Off in ice mode. |

**Data files:**

| File | Contents |
|---|---|
| `dir.js` | The verified directory (12.1). |
| `dir_patch.js` | Generated from `research/dir_enrich.json`. Merges into the directory: `ig, fb, wa, email, phone, oh` (OSM syntax), `ohNote, prices, req`, plus `srcs` (URL per field), `closed, status, river, water`. |
| `req.js` | `DM_ACT_REQ`: country → activity → `[{t,src}]`, plus generic rules. |
| `ice_data.js` | `DM_ICE_LAKES` (27 lakes: kind of release process `k`, authority, status URL, approximate centre, optional `frost` freeze-over sum), `DM_ICE_RULES`, `DM_ICE_MODEL`. |

**Ice mode:**
- The `ice` mode button is hidden from April to October (browser month).
- `?act=ice` always opens it.
- `iceModel` uses the month of the climate data, not the browser clock, so tests can simulate winter.

**Rules:**
- Never show a value without a source badge (`srcTag`: official, src, model, est).
- Never claim an ice release.
- Children's prices, fees and deposits are never headline prices.
- Directory entries come only from published pages, with `checked` dates.

**Tests:**

| File | What it does |
|---|---|
| `tools/tests/lib/actmock.js` | Realistic mocks for every new service. `opts.winter` simulates January. |
| `winter.js` | Ice mode check. |
| `seo.js` | Static site check: canonical, links, JSON-LD, sitemap. |
| `activities.js` | Asserts butler, scores, zones, temperature bubbles and prices. |

**SEO generator:** `tools/build/v23.2/seo/build_seo.py <website> <dir.json> <out>`.
- It fixes the city guides, writes the 7 water-sports guides plus `activities.html`, and writes `sitemap.xml`.
- Make `dir.json` first with node: `window={}; require dir.js, dir_patch.js; dump DM_ACT_DIR`. See `seo/README.txt`.
- To add a region, add directory entries and a page definition in `PAGES`, then re-run.


### 12.3 Version 23.3: premium cards, swim-card structure, explainers, bespoke pins, winter everywhere

New source files in `tools/build/v23.3/`:

| File | Contents |
|---|---|
| `m_icons.js` | 64 line icons (`ICONS`), helper `I(name, class)`, activity→icon map `ACTI`, type→icon map `TYPEI`. |
| `m_ui2.js` | Replaces `butlerHtml`, `card`, `loadPhotos`, `openSheet` and `fillSheet` from `m_ui.js` (those were removed there). See the list below. |
| `dir_explain.js` | `DM_ACT_EXPLAIN`, merged into the directory at load. Fields: `about` (hand-written, 86–119 words), `tip`, `best`, `near`, `xsrc` (sources), extra contacts (`new_web`, `new_email`, `new_phone`, `new_ig`, `new_fb`), address corrections, extra activities. Source data: `research/explainers.json`. |
| `act3.css` | All 23.3 styles. |

`m_ui2.js` contains:
- `placeholder()` (premium fallback, no cartoons);
- `explain()` and `teaser()` (varied explainers for places without a hand-written text);
- `helpers()` (card chips);
- `bring()` (packing list);
- `icsFor()` and `doShare()`;
- `getPlace()` (Nominatim zoom 10 plus Wikidata P94 coat of arms) and `waterBody()` (nearest lake or sea article);
- `getAmenities()` (one Overpass call within 650 m: stops, parking, WC, shower, drinking water, food);
- `minimap()` (same tiles as the main map via `dmTileUrl`);
- the outside-tap closer and the phone swipe-to-close;
- the Ice-button watcher (`iceRelevant`);
- bespoke pins: `PINC` colours, `pinKey()`, `legendAct()`.

The detail card uses the swim card's own classes (`gallery`, `photo`, `story`, `badges`, `badge`, `actions`, `btn`, `section`, `dmMini`), so it inherits the swim design.

`m_core.js` changes:
- **Winter is driven by real frost:** `climParse` accumulates frost over 92 days and resets after 10 warm days; `iceModel` has no month gate; `iceRelevant` adds the hemisphere season.
- **Photos:** `photosFor` uses ordered buckets (own → name → near with keywords → Wikipedia area photos from `areaPhotos`, which also caches the pages for `areaPages`). The cache key is now `dm_actph_v2`.

`act_core.js` changes:
- Ice mode also queries named `natural=water` lakes, ponds and reservoirs. They become `icelake` items with an "ask locally" process, unless they are within one of the official lakes.
- Pins get `data-rank` and `--pc` (activity colour) plus a pictogram badge.
- Directory items carry the explainer fields.

Tests:
- `winter.js PLACE=finland|russia|greenland` runs the winter checks abroad.
- `activities.js` checks that a tap or click outside closes the card.
- `lib/actmock.js` mocks Nominatim zoom 10, Wikidata and the amenities query.

Rules: explainers only from sources (store them in `xsrc`). Never use the cartoon art; use the placeholder. Never claim an ice release.

**Rules for extending it:** add a new activity to `ACT` (label, icon, modes) and `RX`, the tags to `query()`, and the filter key to `CHIPS`; extend `tools/tests/activities.js` with a realistic test element and a decoy; never show prices, hours or bookings that are not in the source data.

### 12.4 Version 23.4: Specials, kit tiles, rules tiles, hourly strip, reliable pin taps

New source files in `tools/build/v23.4/`:

| File | Contents |
|---|---|
| `m_ui3.js` | <ul><li>`kit()` and `kitHtml()`: packing tiles, `k:'must'` for must-haves;</li><li>`reqHtml()`: four answer tiles from the `RQC` categories (Licence, ID & deposit, Minimum age, Safety kit), operator first, then a "typical" national fallback, then all rules in a `details` block;</li><li>`wxHtml()`: hourly strip (`.dmHrs` / `.dmHr`) plus a summary sentence;</li><li>`amenProse()` ("Getting there" paragraph);</li><li>`waterIntro()` (Wikipedia extract of the water body);</li><li>`heroFacts()` (chips on the first photo);</li><li>Specials: `SPACT` (category → activities), `SPX` (`[key, label, icon, regex]`), `specialsOf(v)` (cached) and `specialBadges(v)`.</li></ul> |
| `specials.js` | `DM_SPECIALS`: 80 researched entries (`id, n, cat, lat, lon, geo, cc, city, what, about, tip, season, access, warn, web, wiki, src, more`). `geo:'approx'` entries are refined from the name when opened (`refineGeo`, accepted within 25 km). Source: `research/specials.json`. |
| `act4.css` | Kit, pack strip, rules tiles, hourly strip, hero facts, prose blocks, specials badges, the phone chip row, and phone overflow fixes. |

`act_core.js` changes:
- **Specials mode** (`special`, colour `#c8961e`):
  - `CHIPS.special` uses `sp:` keys;
  - `NAMES.special` name regex and its own Overpass query;
  - `dirItems` adds `DM_SPECIALS` within 250 km as `ev:'sp'` items;
  - `rank()` puts `ev:'sp'` first in this mode;
  - rooftop, thermal and wave-pool specials get `water:'pool'`, so no lake temperature is shown;
  - `typeLabel` uses the `SPX` label;
  - pins use `pinKey → 'special'` (gold) with the category icon via `spIc()`.
- **New activities:** `swimx`, `sauna`, `thermal`, `glow`. Their profiles are in `PROF` (`m_core.js`).
- **Pin taps:**
  - `paint()` only moves pins when the id set is unchanged, and defers a repaint while a pointer is down on a pin;
  - a capture `pointerup` opens the card (within 1.2 s and 9 px);
  - the following `click` is swallowed for 900 ms, so the backdrop cannot close the card it just opened.

`m_core.js` changes:
- `openInfo` handles `ev:'sp'` (season and access).
- `photosFor` puts the Wikipedia lead image (`pageimages`, 1200 px) of `v.wiki` first. It also adds Commons `incategory:Quality_images` within 2 km.

`m_ui2.js` changes:
- The butler shows a visible `.dmPack` strip (the "What to bring" button is gone).
- In Specials mode, the butler names the nearest true special.
- Cards and the sheet show special badges and the `warn` box.
- The sheet's "Right now" section shows the packing tiles.

Tests:
- `pintest.js W H` clicks or taps up to 6 pins per mode.
- `feat234.js W H` checks, per mode:
  - every chip;
  - the butler;
  - the sheet sections;
  - that the kit is visible;
  - overflow.
- Both run in `run_all.js` as `pins-*` and `features-*`.

SEO: `seo/build_seo.py <website> <dir.json> <out> [specials.json]` also writes `unique-water-experiences.html`.

**Rules for specials:**
- Every entry needs `src`.
- Status-sensitive places (closures, re-openings) carry a dated `warn`.
- Do not mark a pool's water with the lake temperature.

### 12.5 Version 23.5: photo queue, in-place pins, zone retries, emergency help, swim-style lists

New source files in `tools/build/v23.5/`:

| File | Contents |
|---|---|
| `m_photo.js` | <ul><li>Wikimedia queue: `wmFetch(url, ms, prio)` with at most 6 requests in flight, priority order and up to 3 retries on 429/503.</li><li>Candidate pipeline: `photosFor(v, prio)` tries, in order, the Wikipedia lead image (`v.wiki`), a Wikipedia search by name (≤ 3 km), the OSM `image` or `wikimedia_commons` tag, Wikidata P18 (`v.wikidata`), the nearest Wikipedia article photo (≤ 500 m, from one geosearch per 0.05° cell via `areaLoad`), Commons geosearch (500–700 m, ranked by `ACT_KW[mode]`, filtered by `ACT_PH_BLOCK`), then a Commons search by name.</li><li>Cache: localStorage `dm_actph_v3`, real results only (14 days); misses are kept in memory for 10 minutes.</li><li>`thumbPhoto(v)`: a unique photo first; an area photo may be shared by at most two cards.</li><li>`setThumb()`: falls back to the next candidate when a file is broken.</li><li>`loadPhotos(list)`: an IntersectionObserver (900 px margin), plus the first 8 cards at once.</li></ul> |
| `m_sos.js` | <ul><li>`DM_SOS` lookup: `sosOf(cc)`.</li><li>`getHelp(lat, lon)`: one Overpass query for police, hospital (`emergency` ≠ no), fire station, lifeguard / water rescue, defibrillator, life ring, emergency phone, pharmacy and ambulance station.</li><li>`sosBlock()` and `sosSection()` render the section.</li><li>A MutationObserver on `#cardBody` adds the same section to the swim card.</li></ul> |
| `emergency.js` | `window.DM_SOS`: 46 countries with `general`, `police`, `fire`, `ambulance`, `sea`, `air`, `poison`, `notes` and `src`. Source data: `research/emergency.json`. An absent field means "not verified". |
| `act5.css` | Swim-style filter pills, sort pills, result cards (stripe, lifebuoy rank, score pill, chips, Open button) and header. |

Changes to the swim engine, made in `build.py` with exact-anchor `rep()` calls:
- `prefetchMedia()` returns while `html.dmActOn` is set.
- `photoForRank()` doesn't start `hydrateMedia()` while an activity is shown.
- `hydrateMedia()` stops after 4 non-forced rounds per spot.

`act_core.js` changes:
- **`paint()`:** when the set of pin ids is unchanged, pins are updated in place (left, top, class, rank, `--pc`), even when the repaint is forced. Never use `innerHTML` for an unchanged set.
- **`chips()`:** collapses to two rows, with `#dmActChipsMore` ("Show all N filters").
- **Classify:** keeps `t.wikidata`.

`m_ui.js` changes:
- **Zones:** `overpassFast` returns `{elements:[], _fails, _tried}` when every server fails. That case is now treated as an error, never as "no zones" (the same check is in `getAmenities` and `getHelp`).
- **Zone retries:** backoff of 4, 12, 30 and 120 s, gated by `ZONES.next`.
- **Zone cache:** localStorage `dm_zones_<lat>_<lon>` (0.02° cells, 30 days).
- **Temperature labels:** at most 3, placed by `spot()` away from pins and the radius label.

`m_ui2.js` changes:
- The card markup follows the swim card. Test hooks are kept: `.dmAcard`, `.dmAopen`, `.dmAstat .st` / `.pr`, `.dmAscore`, `.dmVer`, `.dmAq`.
- The detail gallery shows up to 5 photos.
- "Emergency & help nearby" comes after "Licence, ID & safety".

CSS: the pin hover and selected state use `scale()` on the same transform. Never add a `translate` on hover, because it moves the hit area from under the cursor.

Tests:
- `hover.js`: pin stability.
- `photo_audit.js` with `lib/photoworld.js`: realistic Wikimedia latency, sparse results and a rate limit of 8 requests in flight. `SWIMONLY=1` measures the swim list.
- `sos.js`: the emergency section.
- `zones_retry.js`: zone queries fail twice, then succeed.
- `lib/actmock.js`: also answers the help query.
- `run_all.js`: per-check timeout in field 7.
- `pintest.js`: waits for stable pins and a fully closed card.

### 12.6 Version 23.6: first-time-user journey, phone layout fixes, GitHub layout

New source file in `tools/build/v23.6/`:
- `m_journey.js`: the activity picker on the start screen (`#dmGateActs`). It calls `setMode(k, true)`, and the picker follows mode changes made elsewhere.

`act_core.js` changes:
- `placeLabel()` removes the swim-pack suffix (" swim culture") from `state.label` for all activity texts.
- `fitAct()` leaves out places beyond 2.5× the median distance (min 2 km, when at least 60 % remain), and records `state.dmFitCenter`.

`build.py` adds three exact-anchor patches to the swim engine:
1. The "Search this area" check ignores a map centre that equals `state.dmFitCenter`.
2. The logo's start-screen handler returns early while `window.__dmSwallowUntil` is set (the activity card's outside-tap closer sets it for 700 ms).
3. `displayName()` and `plainName()` use `dmWestern(v)`, which drops empty brackets and duplicate alternative names.

`m_ui2.js` changes:
- `waterBody()` excludes baths, beaches, pools, promenades, streets, parks, quays, harbours and marinas.

`m_ui.js` changes:
- Temperature labels are placed with box collision against pins and the radius label.
- Swim temperature tags skip the radius-label area.

`m_fame.js` changes:
- Rafting keywords are limited to gorge, canyon, rapids, white water, schlucht and rafting.

`act5.css` changes:
- Start-screen pills.
- Phone card head: full-width title, words never broken.
- Map header: the subtitle shortens with an ellipsis; the buttons never shrink.
- `.status` is hidden in activity mode.

Tests:
- `journey.js W H`: the first-time-user journey (see the 23.6 report), with checks for broken text, overflow, small tap targets and page errors on every screen.
- The journey runs in `run_all.js` as `journey-phone` and `journey-desktop`.
- `SHOTDIR=…` saves a screenshot of every step.

GitHub layout:
- **`1_website-repo`:** what GitHub Pages publishes.
- **`2_source-repo`:** `website/`, `tools/build/v23.6/`, `tools/tests/`, `generator/`, `assets-source/`, `docs/`.
- The tests expect `website/` two folders above `tools/tests/`, so keep that layout.

### 12.7 Version 23.7: clean map, curated Specials, divers' data, boat fuel, one water model

New source files in `tools/build/v23.7/`:
- `m_dive.js`: the "Under water" section of dive cards.
  - `isDiveCard(v)`, `diveOf(v)` (looks up `DM_DIVE` by `dirId` or `id`).
  - `lakeDepth(title)`: Wikipedia pageprops → Wikidata item → P4511 (vertical depth, metres only).
  - `visNote(lake)`: sourced visibility notes for Lake Zurich and the Obersee (Kanton Schwyz lake report).
  - `diveSection(v)` writes the placeholder; `fillDive(v, cd)` fills four tiles: Depth here, The lake, Visibility, Fish & life (GBIF, top 6).
  - `window.dmModelWaterTemp(v)`: the swim engine's water temperature from the same model as the activity cards (`getClim` + `getSea` for `state.center`, polled every 1.5 s; a change forces a swim re-render). Returns `null` beyond 40 km of the centre, so the old table is used there.
- `dive_data.js`: `window.DM_DIVE`, facts for 6 dive sites (max depth or `maxTxt`, profile, level, life, visibility, note), taken only from the researched explainers. Add a site here only with a source.
- `audit/data_audit.js`: loads every data file exactly as the app does and checks fields, formats, sources, duplicates and cross-links. Run `node audit/data_audit.js`; the result goes to `audit/data_audit_result.json`. 23.7: 0 errors, 5 notes.

`m_ui.js`, no-go zones:
- `zoneKind(tags)` classifies each OSM area as `noentry`, `noswim`, `nodive`, `bathzone`, `protected`, `nomotor`, `noboat` or `pier`. No anchoring, no wake and speed limits return nothing and are not drawn.
- `ZL` decides per mode which kinds are drawn (see the 23.7 report, section 1). Bathing zones are never drawn in Swim.
- Labels: at most 3, only when the zone's screen box is at least 90 × 36 px, with no overlap with pins or other labels.
- Patterns `dmHatch` (red), `dmHatchB` (blue), `dmHatchG` (green); the legend lists only the kinds drawn (`drawnK`).
- Cache key changed to `dm_zones2_` so old unclassified caches are not reused.
- Swim temperature tags: at most 8, minimum spacing 64 × 40 px.

`act_core.js`:
- Specials: only the curated `DM_SPECIALS` within 150 km (or the 8 nearest if fewer than 6), at most 12. `fetchMode('special')` returns nothing; the directory no longer adds keyword matches.
- `CHIPS.special` has 10 categories; `matchesChip` uses `spcat` for curated items.
- `geoQueue` refines approximate specials positions, one lookup every 1.2 s, remembered.
- Listings without website, phone and e-mail are hidden (rule: a listing nobody can contact is not shown).
- Boat fuel: the Boats query adds `waterway=fuel`, `amenity=fuel` + `boat=yes` and seamark small-craft fuel stations. `classify` returns them as `type:'fuel'`, `svc:true`, `acts:{fuel:'map'}`. `CHIPS.boat` has a `fuel` chip.
- `fitAct()` caps the zoom at 14.
- `setMode()`: the saved swim view is only restored when it was saved for the same `state.center`; otherwise the map goes to the search centre at `zoomForRadius`.

`m_ui2.js`:
- Dive cards: `diveSection(v)` after "Right now", depth chip `dp` in list cards.
- Service items (`v.svc`, boat fuel): their own verdict (`dmFuelNow`), no kit list, no score; `rescore` skips them.
- `PINC.fuel = '#b45309'`, `PINL.fuel = 'Boat fuel'`.

`m_sos.js`: `getHelp()` also asks for boat fuel (`bfuel`), shown in Boat and Sail cards.

`m_ui3.js`: `specialBadges` shows at most one badge, and only for wave, floating, river, rooftop, sauna and thermal.

`build.py` adds one exact-anchor patch to the swim engine: `dmWaterTemp(v)` asks `window.dmModelWaterTemp(v)` first and falls back to the old month table when it returns `null`.

Tests (`run_all.js`, 56 checks):
- `zones_clutter.js` → `zones-clutter`: a lake with 30 marked areas (15 bathing zones, 10 no-anchoring, 3 no-entry, 2 reserves). Fails when a mode shows more than 3 labels, a bathing zone in Swim, or a no-anchoring area. `SHOT=file.png` saves a screenshot.
- `journey-phone-small`: the first-time journey at 375 × 667.
- The journey also checks that switching back to Swim does not show the world view.
- `dive_fuel.js W H` → `dive-fuel-phone`, `dive-fuel-desktop`: opens the Au dive site and checks the four Under-water tiles and their sources; in Boats it checks the fuel filter, the pin, the card (real opening status, no rating, no "always accessible") and the nearest fuel station in another boat card. `SHOTDIR=…` saves screenshots.
- `blink.js` now waits until the swim search has finished (`html.dmLoading` gone) before measuring. The search's final map fit moves the map once; that is not a blink, and in 23.6 it occasionally fell inside the scroll measurement.
- `zones_retry.js` counts both cache keys (`dm_zones_` and `dm_zones2_`).

Second-pass repairs (23.7):
- `m_core.js` `seasonOk()`: strips "mid-/early-/late-" before month names; "summer" = May–Sep, "autumn" extends to Nov, "year"/"winter" keep it open. `bestWindow()` returns `null` out of season and, without published hours, only uses daylight hours.
- `m_ui2.js` `waterOf(v)`: OpenStreetMap water (`natural=water` with a name, `waterway=river|canal`) within 250 m via `osmWater()` (cache `dm_wb1_`, 60 days), English title via Wikidata sitelinks (`wdEnTitle()`); `wbHint(v)` (name, address, description, explainer) picks between lake and river. Falls back to `waterBody(pages, lat, lon, v)`. `m_dive.js` `lakeDepth(title, qid)` uses the Wikidata id directly when known.
- `m_dive.js` `isDiveCard()`: false for service items and for non-place items (centres, schools, shops) without `DM_DIVE` facts.
- Butler in Specials: in-season items first; closed picks show "–" instead of a score. Out of season the packing list heading reads "What to bring when the season starts".
- `act_core.js` `setMode()`: the saved swim view remembers whether it was an automatic fit (`f`), and `state.dmFitCenter` is restored with it.
- `build.py` adds three swim-engine patches: the Zürich pack label is "Zürich"; `fitToSpots()` sets `state.dmFitCenter`; `quietScore()` adds +34 for outdoor places outside the bathing season (hemisphere-aware, not within 23° of the equator).
- `act5.css`: `#mapPanel{min-width:0;max-width:100%}`; the zone legend sits above the pins with `pointer-events:none`.

Service items (`svc:true`, boat fuel): `openInfo()` never calls them "always accessible", and the card and sheet show no DipMapper rating. Their `oh` field is the raw `opening_hours` string, like every other item; `ohStatus()` parses it.

### 12.8 Version 23.8: About DipMapper (founder interview)

Sources in `tools/build/v23.8/`:
- `about/about_section.html`: the section markup (`<section class="dmAbout" id="about">`). `build.py` inserts it between the swim guides and the legal section, and adds `<button data-scroll="about">About</button>` after "How it works" in the header. The existing `data-scroll` handler scrolls to it.
- `about/about-founder.webp`, `about-pool.webp`, `about-water.webp`: the photos (640×800 / 600×800, WebP, metadata stripped). `build.py` (`aboutHtml()`) embeds them as `data:image/webp;base64,…` into `index.html`, so the page shows them even when the HTML is opened or uploaded on its own. Cost: about 210 KB of page weight. To change a photo, replace the .webp and rebuild.
- Structured data: the Organization node names the founder (`founder` → Person, url `/#about`).
- `act6.css`: the section's styles (two-column magazine layout on PC with sticky photos, one column on phones, photos cropped with `aspect-ratio`/`object-fit`).
- The first three questions are always visible; the other twelve are inside a native `<details>` ("Read the full interview" / "Show less"), with no script.
- The section is visible on phones (like the swim guides). The header button exists only on PC, because the phone header has no nav.
- To edit the interview, change `about/about_section.html` and rebuild. Keep the speaker's words as given; corrections go into a dated note (see "Update, October 2026").

`closebug.js` (close-phone/close-desktop) waits until the card has stopped sliding in before it measures and clicks Close; measuring mid-animation made the click miss a button that was still moving (1 in ~15 runs).

Tests: `about_solo.js` → `about-standalone` opens `website/index.html` from disk with no network and requires all 3 photos to load from the page itself. `about.js W H` → `about-phone`, `about-desktop`: section visible, 3 photos load (no 404), alt texts present, 3 questions visible before and 15 after opening, closes again, header button scrolls to it (PC), no sideways overflow, no page errors. `SHOTDIR=…` saves screenshots.

### 12.9 Version 23.8.1: phone alignment, open interview, photos last

- **Phone layout (`act6.css`):** on phones `.shell` is a column flexbox with `align-items:start`, so every card took the width of its content (the map could be 20 px short, the search card 41 px short on 430 px phones). `#mapPanel`, `#resultsPanel>.pad` and `#dmBelow` now get `align-self:stretch; width:auto` under `max-width:760px` and `html.dmPhone`. Keep this when adding blocks to `.shell`.
- **About:** the `<details>` wrapper is gone; all 15 questions and the 3 photos are always visible (`.dmAbFlow` continues after the second photo).
- **Photos last:** `build.py` writes `data-dmimg="about-…"` placeholders into the section and appends one small script just before `</body>` (`aboutImgScript()`) that sets the three WebP data URIs. The start screen therefore sits at the same position in the file as in 23.6 (byte ~311 000 instead of ~521 000).
- **Tests:** `align.js W H` → `align-phone-360`, `align-phone-430` (every block of `.shell` must share the outer edges in all 7 modes; fails with "misaligned"). `slowboot.js URL W H` → `opening-scene-phone`, `opening-scene-desktop` (1.6 Mbit/s, CPU ×4: the opening scene must show, end, and hand over to the start screen). `about.js` now requires 15 visible questions and 3 visible photos without any tap.

