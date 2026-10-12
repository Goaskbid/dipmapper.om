# DipMapper 23.2: Water Butler, Live Verdicts, Water & Ice on the Map, SEO

**Version 23.2.0, 10 October 2026.** This version covers everything asked for since 23.1:

- water temperatures, pictures and the design;
- contacts including social media, opening hours, "is it recommended now — and why?", and prices per hour or day;
- licences and ID;
- the butler;
- what matters per sport (rain, sun, water level, clarity, fish);
- winter ice;
- temperatures on the map;
- no-go zones and famous spots;
- scoring with the existing scorer and rating;
- SEO.

## Upload: 17 files, one file per commit, in this order

Each new guide page links to the others, so upload them before `index.html`. That way no link points to a missing page. `sitemap.xml` goes last.

| # | File | Kind |
|---|---|---|
| 1 | `activities.html` | new: hub of the water-sports guides |
| 2 | `water-sports-lake-zurich.html` | new guide |
| 3 | `sup-lake-zurich.html` | new guide |
| 4 | `boat-rental-lake-zurich.html` | new guide |
| 5 | `diving-lake-zurich.html` | new guide |
| 6 | `sailing-lake-zurich.html` | new guide |
| 7 | `surfing-switzerland.html` | new guide |
| 8 | `kitesurfing-switzerland.html` | new guide |
| 9–15 | `zurich.html`, `meilen.html`, `swim.html`, `rhodes.html`, `miami.html`, `rostock.html`, `palma.html` | fixed: they pointed search engines to pages that do not exist |
| 16 | `index.html` | the app, **version 23.2.0** |
| 17 | `sitemap.xml` | now lists all 24 public pages (before: 4) |

How to upload: github.com/Goaskbid/dipmapper.om → Add file → Upload files → drag **one** file → Commit changes. Repeat for each file.

Check: reload dipmapper.com. The bottom of the page must say **DipMapper version 23.2.0**.

The app works with only `index.html` uploaded. Files 1–15 and 17 are the search-engine pack and can follow later.

After the upload, submit `https://dipmapper.com/sitemap.xml` once in Google Search Console and Bing Webmaster Tools.

## What is new in the app

| Area | What you see |
|---|---|
| **Your water butler** | Shows at the top of every activity list. It gives a live summary for the area: wind and gusts, air temperature, water temperature, UV, sunset, waves, and rain in the last 48 hours for diving. It then gives a plain-English verdict, for example *"Good moment for paddling: light wind 7 km/h, water ≈17 °C"*, with its three best picks right now. If it is a bad moment, it says why and when it gets better (*"Better: tomorrow 09:00–12:00"*). If everything is closed or it is dark, it names the next opening. |
| **Score per place** | Uses the same method and design as the swim score. It weights real inputs: wind & waves (or swell / river level) 30%, water 20%, weather 20%, open 15%, getting there 15%. Missing inputs are left out, not guessed. Hard stops (thunderstorm, gale, after dark, closed) cap the score. The card shows a ring with *Great now / Good now / OK with care / Not now / Closed / Season over / Night*. The detail card shows the bars and every reason with ✓, !, ✕ or i. |
| **DipMapper rating** | ★ 3.0–5.0, on the same scale as the swim cards. It measures how complete, verified and well documented a place is: verified listing, prices, hours, contact, photo, well known. The card says why. |
| **Opening hours** | Every place shows **Open · until 18:30**, **Closes soon**, **Closed · opens tomorrow 11:30** or **Out of season · reopens 1 May**. The detail card shows the next 7 days, seasons and weather notes. A new reader understands the international opening-hours format, including months, dates, weekday rules, several time ranges and closed days. Where hours are not published, the card says so and links to Google Maps. Public places say "always accessible". |
| **Prices** | Each price is labelled per hour, per 30 min, per day, half day, per session, course, pass or ticket. Cards show the main price, for example **CHF 24/h**. The detail card has tiles (per hour, per day, per session) and the full list. Children's prices, fees and deposits are never shown as the headline price. Each price list shows its source and check date. |
| **Contacts** | Website, booking, phone, mobile, e-mail, Instagram, Facebook, WhatsApp, YouTube, and "Reviews & photos" (Google Maps). The card has quick buttons for Directions, Call and Website. The detail card keeps a sticky bar at the bottom (Directions · Call · Website · Share). |
| **Licence, ID & safety** | Shows what the operator says (e.g. ID and cash deposit, minimum age 12 / 18 / 22, licence needed). It then shows the rules for the country of the search point, and general guidance otherwise, each with its source. The rules come from 99 sourced items: 55 for Switzerland, 31 for 11 other countries (DE, AT, IT, FR, ES, HR, GR, PT, NL, GB, US) and 13 general ones. Examples: SUP life jacket beyond 300 m; motorboats over 6 kW need a Category A licence (age 18); sailing boats over 15 m² sail need Category D; kite liability insurance CHF 750,000; PADI Open Water to dive without a professional. |
| **Water & nature** | **Water temperature:** sea surface temperature from the marine model on coasts. On lakes and rivers it is an estimate from the last 30 days of air temperature at that place, so mountain lakes come out colder. It comes with wetsuit advice for the sport. **Water quality:** the official EU bathing-water rating of the nearest monitored site. **River flow** for rafting and river waves: today compared with the last year (high, low or usual) and its trend. **Underwater visibility** for diving: no live data exists, so the card says so and shows what reduces it (rain in the last 48 hours, wind, algae season). **Fish recorded within ~5 km** for diving, snorkelling and fishing (e.g. *European perch · Perca fluviatilis · 812 records*). |
| **Pictures** | Real photos where they exist: the place's own image tag in the map data, then Wikimedia Commons photos by name, then photos near the place (preferring water, harbour and sport photos), and the Wikipedia image for famous places. Each photo is credited and links to its Commons page. Nearby photos are labelled "near this place". Where no photo exists there is an illustration per sport in the DipMapper colours (SUP, kayak, pedalo, sailing, windsurf, kite, surf, diving, wreck, rafting, boat, marina). |
| **Map** | **Water temperature** bubbles over the activity areas (colour scale from cold blue to warm orange), marked *est.* or *model*. Swim pins show a small temperature tag with the same value as the swim card, placed so that tags do not overlap. **No-go zones** from OpenStreetMap are drawn as red hatched areas: no boats, no motorboats, no swimming, restricted areas. In dive mode on Lake Zurich, amber circles mark the 100 m no-dive zone around passenger piers (canton Zürich rule). A small legend names the source. **Famous spots** with their own Wikipedia article get a gold ★ pin. The search ring and label show the real activity radius (e.g. "15 km paddle search"). The map fits the activity results the first time they load, and swimming returns to its own view. |
| **Winter & ice** | A new **⛸️ Ice** mode appears from November to March, or via `?act=ice`. It lists natural-ice lakes and ice rinks. Pin colours show the process: blue = official process (bulletin, order, release, operated area); grey = own risk / ask locally. See the "Winter & ice" section below for details. |
| **Sort & filter** | Recommended · Best now · Nearest · Cheapest, plus the toggles **Open now** and **Prices**. |
| **Verified directory** | Updated with the operators’ own pages: Facebook for 16 providers and Instagram for 12, structured opening hours for 12, full price lists for 15, requirements for 15. Corrections: TSK and Poseidon Saturday hours, Urbansurf days, Hensa website and season end, Kayakfun website, Alaïa Bay address, Kite Addicted phone and e-mail. **Bootsvermietung Seefeld has closed** (the operators retired; a new rental is planned for 2027), so it is no longer listed. SUPSWISS and Kite Addicted show **“Status unconfirmed”**. |

## Winter & ice

You cannot approve lakes one by one, so the module works automatically everywhere and never claims an approval it has not seen.

- **Frost model:** the daily air temperatures of the last 92 days at that place give the winter's frost sum. A standard ice-growth model (Stefan's law, using conservative values when it has snowed) then gives an approximate ice thickness for ponds, small lakes and large lakes. Every number is labelled **Inferred** and **"a model is never a measurement"**.
- **Lake-specific freeze points** where MeteoSwiss/SRF publish them. Example: Pfäffikersee about 120 °C·days of frost, Greifensee 130, Zürichsee about 300. The card says "Not frozen over yet" or "Past its freeze-over point".
- **Official ice status:** 27 lakes in CH, AT and FR with the authority that releases the ice and a link to where the status is published. Examples: the canton Zürich *Eisbulletin* for 10 waters, St. Moritz, the Upper Engadine (marked trails only), Weissensee and Lamoura (municipal order).
  - The pin and card show the kind of process: *Official ice bulletin*, *Operated ice area*, *Only marked paths*, *Ask locally*, *No release — own risk*.
  - DipMapper never shows "released". The live status is only on the authority's page, and the card links to it.
  - In canton Zürich, ice that is not released must not be entered, and the card says so.
- **Map in winter:** a subtle frost frame around the map. Ice bubbles (**❄ ≈15 cm model**) replace the water temperature. Blue and grey lake pins show the release process.
- **Safety rules with numbers and sources:** SLRG 5 cm for one person, 7–8 cm for a small crowd, 10–12 cm for a large crowd, 15 cm for a 1 t vehicle; snow ice counts half. DLRG 15 cm on standing water and 20 cm on flowing water. Sweden 10 cm, Canada 15/20/25 cm.

## Every value says where it comes from

Small badges on every value: **Official** (authority register), **Source** (operator page, OpenStreetMap, GBIF), **Model** (forecast, marine or river model) or **Inferred** (DipMapper's estimate: water from air temperature, ice model, visibility guidance). Verdicts carry "Guidance only — not a safety guarantee".

## SEO: more visible on search engines, no redesign

1. **Fixed a real indexing bug.** All six city swim guides told Google their address was `/swim/<city>.html`, which does not exist. Their share image pointed to a missing `/assets/` file. Google therefore ignored these pages. All addresses, breadcrumbs and internal links are corrected.
2. **sitemap.xml** grew from 4 to 24 pages (the app, both hubs, 7 water-sports guides, 6 city guides, legal pages).
3. **Seven new water-sports guides plus a hub,** generated from the verified directory in the exact look of the swim guides:
   - each place with prices, hours, contacts, social links, requirements and source;
   - a "Live conditions in DipMapper" deep link per place;
   - "Good to know" questions and answers (life jackets, licences, kite rules, no-dive zones);
   - structured data for Google (ItemList of SportsActivityLocation with address, phone, website, social profiles, opening hours where they follow the standard, price range, coordinates).
4. **App page:** share titles, structured-data description and feature list now mention the water sports. The footer links to the real city pages and the new guides.
5. **Scalable:** `tools/build/v23.2/seo/build_seo.py` regenerates all guides and the sitemap from the directory. A new region or activity becomes a new page by adding directory entries and re-running one command.

## Tests (actual results)

Automated suite: **40 checks** (38 before plus 2 new: `winter-ice`, `seo-pages`), in headless Chrome with all map, weather, water, fish, photo and Wikipedia services mocked realistically.

- **Final full run: 39 passed, 1 timing failure (`no-blink`).** Run alone, `no-blink` and `detail-panels` each passed 3 of 3 (and `no-blink` 4 of 4 in an earlier isolated run).
- Under the same three-test parallel load, version 23.1 also failed `no-blink` 2 of 3 times. This is the known load sensitivity, not a regression.
- Load cost of the bigger page, measured three times each: v23.1 and v23.2 both finish booting in about 2.6 s, with about 0.77 s of script time.
- Activity checks on phone and desktop:
  - butler with picks;
  - scores on cards;
  - no-go zones drawn;
  - water bubbles "≈17° est.";
  - Supkultur price list "Inflatable & softtop SUP – 1 h per hour CHF 35";
  - verified listings;
  - Ceccotorenas (Stäfa) found from Meilen;
  - Kayakfun (raft rental) found by widening to 25 km;
  - local kite rules box;
  - Google Maps link;
  - honest empty state far away;
  - directory still shown when map servers fail;
  - back to Swim restores the swim list and pins;
  - 0 page errors.
- Winter check:
  - Ice mode active;
  - butler "Frost sum 234 °C·days";
  - 7 ice-lake pins;
  - frost overlay on;
  - bubble "❄ ≈15 cm model";
  - the lake card says "Official ice bulletin" and "Check release" and shows "Inferred" source badges;
  - 0 page errors.
- SEO check:
  - 16 pages;
  - 0 broken internal links;
  - all canonical addresses exist;
  - all structured data parses;
  - sitemap has 24 entries;
  - every page is listed.

**Not testable here:** this workspace cannot reach the real services, which include OpenStreetMap, Open-Meteo, Wikimedia, GBIF, the EEA register and Wikipedia. Test on the live site after the upload.

## Honest limits

- Water temperature for lakes and rivers is an **estimate** (marked ≈). No free worldwide lake measurement exists.
- **Underwater visibility, tides and lake water levels:** there is no free live source with browser access, so the card says this instead of guessing.
- **Ice:** official releases are linked, never claimed. The thickness is a model.
- **Swim water temperature** still uses the swim engine's own estimate, unchanged. The new 30-day estimate in activity mode can differ by 1–2 °C on the same lake. Using the new method for swimming too would change swim scores, so it needs your agreement.
- **Worldwide** quality outside the verified directory depends on OpenStreetMap plus the Google Maps link. A paid places service, or businesses listing themselves, remains Torsten's decision.
