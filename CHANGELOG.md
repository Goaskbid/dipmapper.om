# Changelog

All notable changes to DipMapper (dipmapper.com). Newest first. Versions follow `major.minor.patch`; the live version is printed at the bottom of every page.

## 23.15.0 — 14 November 2026 · One logo everywhere, Global / Near-me toggle on every ranking
- **Changed:** the DipMapper logo (the original illustrated logo) in the header of every page; the browser-tab icon is the logo's pin scene, cropped so it is readable at tab size. The separate pin icon from 23.12–23.14 is gone.
- **New:** "🌍 Global / 📍 Near me" toggle on all ranking pages, the rankings overview, the wildlife calendar and the month page: near me sorts every list by distance from you and shows the kilometres; places without a map position go last; Global restores the ranking. The choice is remembered on the device.
- **New:** the same toggle on the home page rankings: near me shows the 12 closest top picks with icon, flag and distance.

## 23.14.0 — 13 November 2026 · Wildlife calendar, clickable rankings with flags and icons, neutral selection
- **New:** "Wildlife & underwater calendar" (`/wildlife-calendar`): 98 seasonal encounters in 23 groups – humpback, gray, right, minke, blue whales and orcas, whale sharks, mantas, turtles, manatees, seals, puffins, sardine run, coral spawning, bioluminescence, reef-diving seasons – with month strips and "right now".
- **Changed:** home rankings section rebuilt: every pick is a link to its full card; activity icons and country flags (images, readable on Windows); "Under water & wildlife this month"; activity chips with icons; buttons for All rankings, Wildlife calendar and Near me. Start screen gets a third route "🐋 Wildlife".
- **Changed:** neutral global selection: no regional chips (Phuket, Mediterranean, Andaman) on the home page; "new discoveries" shows the highest-rated pick per country instead of the research order.
- **Changed:** flags next to every country on ranking cards, the rankings overview and the month and wildlife lists; overview rows are clickable.

## 23.13.0 — 13 November 2026 · One look everywhere, photos and icons, new collections, near-me
- **Changed:** one header on every page (Map · Rankings · Explore) – home, Explore, all ranking pages, the city and water-sports guides and the legal pages – and one bold browser-tab icon.
- **Changed:** ranking pages (74) redesigned: hero with key facts and a ranking picker (one "Jump to a ranking" menu on phones), cards with an activity icon, a photo slot (Wikipedia photo when one is found within 40 km of the place, otherwise a large activity icon), rank badge, 12-month season strip, one-tap official site / booking / call / e-mail, folded details, "In season now" filter.
- **New:** "When to go: the best for every month" (`/best-water-experiences-by-month`, 96 seasonal picks) and "Rainy-day water experiences" (`/rainy-day-water-experiences`, 40 aquariums, thermal baths and saunas); "Best right now" on `/rankings`.
- **Changed:** Explore: the been-there globe is replaced by "Top attractions near you" (12 closest top picks, or the best in a country), with activity icons. Map popups show activity icons.
- **Fixed:** internal research notes removed from all cards (131 sentences); plain-English prices and labels; no flag emoji.
- **Removed:** old copies `home.html`, `about_section.html`, `base_v22_22.html`, `dipmapper_v20_7_0_standalone.html` (not linked anywhere).

## 23.11.0 — 13 November 2026 · Picks starred on the map, rankings by country and lake, clearer start
- **New:** 458 DipMapper picks appear as ★ on the live map wherever you search, with a "picks near here" bar under the map. Tap a star for why to go, the season, the official site, phone or e-mail where published, and the full card. Stars mark the approximate area, not an entrance. Loaded only once the map shows (`picks.json`, 210 KB).
- **New:** rankings by country (39 countries, e.g. `/water-experiences-switzerland`), by sea or region (17 pages, e.g. `/water-experiences-caribbean`) and one page for lakes (`/lake-water-experiences`): 54 new pages, all in the sitemap.
- **Changed:** three clear routes. Top menu: Search · Rankings · Explore. Start screen: search first, then "or browse" with Rankings and Your globe. Home rankings section and `/rankings` get pickers by country, by sea/lake/region and by activity; every ranking page links to all others.
- **Changed:** founder interview: shorter label "About DipMapper", refreshed "what has changed" note.
- **Tests:** home (phone and PC), stars and popup, picks bar, country page, rankings pickers, Explore and globe: 0 page errors, no sideways scrolling; every internal link checked.

## 23.10.1 — 13 November 2026 · Ranking pages moved to the top level, swim guide restored
- **Fixed:** the ranking pages now live at the top level (e.g. `/whale-watch`, `/best-public-aquariums`) so they can be uploaded without a folder. The swimming ranking is `/swimming-discoveries`.
- **Fixed:** `swim.html` (the swim guides for Zürich, Meilen, Rhodes, Miami, Rostock and Palma) had been overwritten by the swimming ranking during the 23.10.0 upload; the original is restored.

## 23.10.0 — 13 November 2026 · Rankings on the site, SEO pages, your been-there globe
- **New:** rankings section on the home page, right under the map: Top 200 water experiences, Top 100 public aquariums and 147 new discoveries (top 5 each, top 3 on phones), plus links to 17 more rankings (whale watching, diving, snorkelling, thermal baths, water parks, beaches, kayaking, Mediterranean, Phuket, Andaman Sea, aquariums in shopping malls …).
- **New:** 21 search-engine pages: `/rankings` and 20 ranking pages under `/discover/` (e.g. `/discover/whale-watch`), each with full written cards, seasons, prices where published, official booking and contact links, canonical URL and ItemList structured data. All added to `sitemap.xml`. Approved for publication by the publisher on 13 November 2026.
- **New:** your been-there globe at the top of Explore: tap countries to colour them in, or add small ones by name; countries of places you mark "Been there" colour in by themselves; counts of countries, share of the world, water experiences and wish list. Saved on this device only.
- **Changed:** Explore is now open to search engines, at `/explore`.
- **Changed:** founder interview folded away under "About DipMapper" at the end of the page (still readable and still in the page for search engines); "About" left the top menu, which now shows Rankings and Explore. The start screen link now leads to the rankings.
- **Tests:** Explore 69 of 69 browser checks; home page, rankings page, ranking pages and globe checked on phone and PC with 0 page errors and no sideways scrolling.

## 23.9.0 — 12 November 2026 · Explore: 605 water experiences worldwide, founder interview update
- **New:** `explore.html`, a separate Explore page with 605 curated water experiences in 87 countries and territories: the Top 200 water experiences, the Top 100 aquariums (161 aquarium profiles, 28 inside shopping malls) and 147 new desk-researched discoveries (aquariums, thermal baths, water parks, saunas, kayaking, cruises). Each card has its season or an open gap, practical limits and official sources. Filters, globe, comparison, day ideas and "My water" (want to go / been there; saved in a cookie only after you press Remember). The page loads only when you open it, so the map is exactly as fast as before.
- **New:** "Explore" in the top menu, a link on the start screen under "What do you want to do?", and one in the water-sports guides.
- **Changed:** founder interview — Stoffknacker added to the question about the other projects; the update note now mentions Explore; new box "More from the same team" with a one-line comment for each website.
- **Unchanged:** everything else in `index.html` (checked line by line against 23.8.3). Explore is not indexed by Google yet (`noindex`) until the new entries are approved.
- **Tests:** Explore 69 of 69 browser checks, 162 of 162 Node and 57 of 57 Python checks (from the research package, rerun here on the delivered file); start page, intro, nav and About checked on phone and PC with 0 page errors.

## 23.8.3 — 12 October 2026 · Zones in Swim, a picture for every venue, intro
- **Fixed:** no-boat areas did not show in Swim. Since 23.7, Swim dropped its whole zone layer unless a "no entry" or "no swimming" zone was present, and in Swim the zones only loaded after an activity had been opened once. Both repaired: Swim now shows no-boat areas, bathing zones, protected areas and boat rules from the start.
- **Changed:** zones are drawn bolder, and up to 6 labels (instead of 3) can show, also on smaller zones, so "No boats" and "No diving" are readable again. Piers in Dive get a "No diving" label where there is room.
- **New:** a picture for every venue. When no photo of a place exists, the card shows the aerial view of the exact spot (Esri World Imagery, the same source as the map), labelled "Aerial view". Activity list cards with a picture: 48 of 48 in the test (before: about 3 in 4).
- **Fixed:** the intro's minimum time now counts from the moment it is actually on screen. Before, a phone could spend most of the 2.4 seconds loading the bigger page before showing the first frame.
- **Tests:** 66 checks. New: `zones-swim`, `photo-fallback`; `photo-coverage` now requires 100 % of list cards and every detail gallery to have a picture.

## 23.8.2 — 12 October 2026 · Start page and no-boat areas back
- **Restored:** no-boat areas, motorboat bans, bathing zones (boats keep out), protected areas and every other OpenStreetMap boat rule (no anchoring, no wake, speed limits) are drawn on the water again in **every mode, including Swim**, as in 23.6. 23.7 had limited them to some activities and dropped the "other rules" entirely. The 23.7 clutter fix stays: at most 3 labels, never overlapping, never the generic "Restricted area"; other rules are drawn in amber as "Boat rules".
- **Changed:** the start page ("Find water nearby", "What do you want to do?") now opens every time dipmapper.com is opened or reloaded, also for returning visitors. Until now (since 22.x) returning visitors landed straight in their last search and never saw it. A new **"Continue with <last place>"** button returns to the last search in one tap; the results keep loading behind the start page. Links to a place (?lat=…) still open the results directly.
- **Tests:** 64 checks. New `start-page-returning`; `zones-clutter` now also requires all 31 test zones to be drawn in Swim.

## 23.8.1 — 11 October 2026 · Repairs after your phone check
- **Fixed (phone):** the search card above the map and the map card had different widths, depending on phone size and mode (e.g. on a 430 px phone in Paddle the search card ended 41 px before the map; in Swim the map ended 20 px short on 390 px). The search card, the map and the lists below now share one left and right edge on every phone size and in every mode.
- **Fixed:** the third interview photo was hidden behind "Read the full interview". The whole interview is now always open, so all three photos are visible.
- **Changed:** the About photos load at the very end of the page, so the start screen arrives as early as before the About section was added.
- **Checked:** the opening scene (sun, logo, "Where shall we swim today?") appears on phone and PC, on fast and slow connections, and when the file is opened on its own.
- **Tests:** 63 checks. New: `align-phone-360`, `align-phone-430`, `opening-scene-phone`, `opening-scene-desktop`.

## 23.8.0 — 11 October 2026 · About DipMapper
- **New:** "About DipMapper" section on the start page with the founder interview of Torsten Sauter (15 questions, the first 3 visible, the rest behind "Read the full interview") and three photos placed beside the matching questions. Visible on phone and PC; "About" button in the PC header.
- **Photos inside the page:** the three photos are built into `index.html` (WebP, 26–86 KB each, hidden file data removed), so they show even when the HTML is opened or uploaded on its own. No extra files to upload.
- **SEO:** the founder is named in the site's structured data (schema.org Organization → founder), linking to the About section.
- The interview text is unchanged except for leftover editing marks; an "Update, October 2026" note after the water-sports answer points to the activities added since.
- **Tests:** 59 checks, new `about-phone`, `about-desktop` and `about-standalone` (the page opened from disk with no network still shows all three photos).

## 23.7.0 — 11 October 2026 · Clean map, divers and boaters
- **Fixed:** the map was covered with red "Restricted area" labels on real lakes. Only real prohibitions are drawn now, only for the activity they concern (no bathing zones in Swim, no no-anchoring areas at all), with at most 3 labels.
- **Changed:** Specials shows only the researched one-offs nearest to you (6–12), with 10 filters; badges on normal cards are limited to one.
- **New for divers:** "Under water" section with depth at the site, depth of the lake, visibility notes and the fish recorded nearby; maximum depth on the list card.
- **New for boaters:** boat fuel stations (Bootstankstellen) with their own filter and pins; the nearest one is listed under "Emergency & help nearby".
- **Changed:** one water-temperature model for swim and activity cards.
- **Fixed:** after starting in an activity and switching to Swim, the map showed the whole of Europe.
- **Fixed:** the map could zoom to street level on a single place (now capped at zoom 14).
- **Changed:** listings without website, phone or e-mail are hidden.
- **Fixed:** summer-only places ("mid-May to mid-Sep", "summer") looked open in October; they now show "Out of season", no score and no best window, and Specials start with what is open now.
- **Fixed:** lakeside places in Zürich showed "Water: Limmat"; the water now comes from OpenStreetMap (named lakes and rivers within 250 m).
- **Fixed:** the phone map's "−" button was pushed off the screen in Swim after a start-screen search; headings no longer say "Zürich swim culture".
- **Fixed:** "best window" until 02:00 for places without hours; "Search this area" after returning to Swim; "Busy now / parking likely full" at summer baths in October; dive shops got a dive-site section.
- **Data audit** of all data files: 0 errors.
- **Tests:** 56 checks, new `zones-clutter`, `journey-phone-small` and `dive-fuel` (phone and PC).

## 23.6.0 — 11 October 2026 · First-time-user audit
- **Start screen:** choose what you want to do (Swim, Paddle, Dive, Sail, Boats, Rafting, Specials) before you search; the first results open in that activity.
- **Fixed:** on phones, the tap that closed a card on the logo area also opened the start screen.
- **Fixed:** "Search this area" and a red crosshair appeared after every activity switch, although the user had not moved the map.
- **Fixed:** card titles broke inside words on phones ("Bootsvermietun‑g"); the operator logo now sits beside the name.
- **Fixed:** the map's zoom buttons were pushed off the screen by long place names on phones.
- **Fixed:** activity headings said "near Zürich swim culture"; they now say "near Zürich".
- **Fixed:** empty brackets in alternative place names ("Zürich Bürkliplatz ( )").
- **Fixed:** a lake bath could be shown as the "Water" (it now names the lake or river).
- **Fixed:** temperature labels overlapped pins and the radius label; one far-away place zoomed the map out so far that the others overlapped.
- **Changed:** rafting no longer lists ordinary city rivers as "famous" rafting places.
- **App manifest:** description now mentions water sports.
- **Tests:** new end-to-end journey test for phone and PC (start screen → search → swim → every activity → map pins → back).

## 23.5.0 — 10 October 2026 · Forensic repair
- Photo queue (no more rate limits), per-place photos, no empty caching: list cards with a photo 4 of 72 → 54 of 74 in a realistic test.
- Pins no longer blink on hover or when the list refreshes.
- No-go zones retried after server failures and cached for 30 days.
- Emergency & help nearby: numbers for 46 countries, nearest lifeguard, defibrillator, police, hospital, fire station, pharmacy.
- Activity lists rebuilt in the swim design.

## 23.4.0 — 10 October 2026 · Specials
- Specials tab with 80 researched one-off water experiences, guide page "Unique water experiences".
- Packing list always visible, licence/ID answers as four tiles, readable hourly forecast, reliable pin taps.

## 23.3.0 — 10 October 2026 · Premium cards
- Swim-card structure for activities, 34 hand-written explainers, bespoke pins, winter mode wherever it freezes.

## 23.2.0 — 10 October 2026 · Water butler
- Live verdicts, water temperature, ice model, no-go zones, famous spots, SEO guide pages.

## 23.1.0 — 10 October 2026 · Activity providers
- Verified directory with prices, hours and contacts; SUP, surf and kite.

## 23.0.0 — 10 October 2026 · Water activities
- Paddle, dive, sail, boats and rafting next to swimming.
