# Changelog

All notable changes to DipMapper (dipmapper.com). Newest first. Versions follow `major.minor.patch`; the live version is printed at the bottom of every page.

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
