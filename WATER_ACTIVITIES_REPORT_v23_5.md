# DipMapper 23.5: Forensic Repair, Real Pictures, One Design, Emergency Help

**Version 23.5.0, 10 October 2026.** This is the go-live build. It covers your feedback on 23.4:

- the new parts should match the swim design;
- pictures were missing almost everywhere in the new modules;
- pins blinked when hovered;
- the no-boating zones had disappeared;
- emergency information was wanted on the water: police, fire, poison centre, Rega and the rest;
- every problem should be traced to its real cause, repaired and locked with tests.

## Upload: 4 files, one file per commit, in this order

| # | File | What it is |
|---|---|---|
| 1 | `unique-water-experiences.html` | Specials guide page. Unchanged since 23.4; upload it only if 23.4 was not uploaded. |
| 2 | `activities.html` | Guide hub. Unchanged since 23.4; upload it only if 23.4 was not uploaded. |
| 3 | `index.html` | The app, **version 23.5.0**. |
| 4 | `sitemap.xml` | Unchanged since 23.4; upload it only if 23.4 was not uploaded. |

If 23.4 is already live, only `index.html` changes. `UPLOAD_ORDER.txt` in the upload zip lists every case.

Check: the bottom of dipmapper.com must say **DipMapper version 23.5.0**.

## Forensic analysis: what was really wrong

Each finding was reproduced with a test before it was repaired. The same test was then run on 23.4 and on 23.5.

| # | Problem you saw | Root cause found | Repair | Proof: 23.4 → 23.5 |
|---|---|---|---|---|
| 1 | New modules almost never had pictures | **A request storm.** Each list fired up to 70 photo requests to Wikimedia at once. Meanwhile the swim list kept re-asking for its photos in the background, even while hidden. Wikimedia answers such bursts with "too many requests" (HTTP 429). | A polite photo queue: at most 6 requests at a time, the top of the list first, and automatic retries when Wikimedia is busy. The hidden swim list pauses while an activity is shown. | In a realistic test environment (real-world response times, sparse photos and Wikimedia's rate limit): **5,326 → 234** photo requests, and **4,482 → 66** rate-limit refusals. |
| 2 | (same) | **Empty results were stored for 7 days.** After a failed lookup, a place stayed without a photo for a week, even after the network recovered. | Only real photos are stored now (for 14 days). Misses are tried again after 10 minutes. A new storage key drops the old empty entries from visitors' browsers. | See row 4. |
| 3 | (same) | **Only the first 14 cards ever asked for a photo.** The Specials list has 37. | Every card asks for its photo when it comes near the screen. The first 8 load at once. | Specials: **1 → 22** cards with a photo. |
| 4 | (same) | **The few shared "area" photos could each be used on only one card,** so most cards got none. Specials without coordinates on the photo were also rejected. | Each place now first gets its own picture, in this order: its Wikipedia article (searched by name and accepted only if it lies within 3 km), its OpenStreetMap or Wikidata photo, the nearest Wikipedia article photo within 500 m, then Commons photos within 500–700 m, ranked by words that fit the sport (e.g. "diver", "underwater", "sail"). A shared area photo may appear on at most two cards. Broken files fall back to the next candidate. | All list cards: **4 of 72 → 54 of 74 with a real photo** (73 %). Detail cards: 2 of 20 → 20 of 20 galleries with photos. |
| 5 | Swim photos | The swim photo lookup re-asked forever for spots that have no photo. | Up to 4 rounds per spot, then it stops. | Swim keeps the same coverage (**23 of 28** cards) with **63 % fewer** requests (722 → 264 in 40 s). |
| 6 | Pins blink on hover | **The hover effect moved the pin 4 px up,** out from under the mouse. The browser then un-hovered it, it moved back, and so on. | Pins now grow in place, with a soft white halo, and never move away from the cursor. | Hovered pins that moved: **17 → 0**. |
| 7 | Pins blink (also) | **Every list refresh destroyed and re-created all pins** (sorting, filters, weather updates every few seconds). A pin under the mouse flashed each time. | When the same places are shown, pins are updated in place: position, rank, colour, selection. | Pin survives a refresh: **no → yes** in all modes. |
| 8 | No-boating zones gone | **When all map servers were busy, the zone lookup treated the failure as "there are no zones"** and never asked again. The same flaw affected "Where it is" (stops, parking, WC). | A failure is now treated as a failure: retried after 4, 12, 30 and 120 seconds. Zones are cached for 30 days, because they rarely change. | After two failed rounds: zones **never shown → shown after 14 s**, and cached. |

## Design: one family

The activity lists now use the swim list's components, measured from the live swim page, so the whole site reads as one product.

| Element | Now (same as swim) |
|---|---|
| Filter pills | White 30 px pills with an emoji. The active pill is dark petrol. Two rows, then **"Show all N filters"**, exactly like the swim filters. The phone chip strip from 23.4 is gone. |
| Sort and quick filters | The same pills: Recommended · Best now · Nearest · Cheapest · Open now · Prices. |
| Result cards | Same build as the swim card: <ul><li>a 4 px colour stripe on the left, in the activity's pin colour;</li><li>an 84 px photo with the red-and-white **lifebuoy rank** and the **score pill**;</li><li>uppercase type line with the distance on the right, bold 16 px name;</li><li>a two-line teaser;</li><li>swim-style chips: ★ rating, open or closed status, price, water temperature, specials, helpers;</li><li>a teal **Open** button, with **Directions** and **Call** buttons beside it.</li></ul> |
| List header | Quiet white card with the same stripe. The empty decorative box is gone. |
| Map | Temperature labels never sit on a pin or on the radius label (at most 3). |
| Detail card | The operator logo now sits in line with the name. |

## New: Emergency & help nearby (swim and activity cards)

- **Call buttons for 46 countries:** the emergency number (112, 911, 999…), police, fire, ambulance, water or sea rescue, air rescue (**Rega 1414** in Switzerland) and the **poison centre** (Tox Info Suisse **145**). In Switzerland the police tile says *also lake police*.
  - Sources: MySwitzerland (Switzerland Tourism) and Wikipedia's lists of emergency numbers and poison centres, checked on 10 October 2026.
  - Numbers that could not be confirmed were left out, so the app shows the general number instead. For example, Spain's maritime rescue number is published differently on different pages.
- **Nearest help, from OpenStreetMap:** lifeguard or water-rescue post, life ring, **defibrillator** (with its location), emergency phone, police station, hospital with an emergency department, fire station, ambulance station and pharmacy (with opening hours). Each has the walking time, a call button and a route link.
- In an emergency, the card says to call rather than drive yourself.

## Screenshots (test environment: every photo and map tile is a stand-in image)

![Phone: swim-style filter pills and cards with lifebuoy rank, chips and Open button; the new "Emergency & help nearby" section](../images/p_list_sos.png)

![PC: the Dive list in the swim design next to the map; temperature labels keep clear of the pins](../images/d_dive.png)

## Tests (actual results)

The suite now has **50 checks**: the 46 from 23.4 plus four new anti-regression checks.

| New check | What it checks |
|---|---|
| `pins-hover` | Pins don't move under the cursor, don't flicker, and survive a refresh, in swim, Paddle, Dive and Specials. |
| `photo-coverage` | At least 60 % of list cards get a real photo in the realistic photo world. |
| `emergency-help` | Emergency numbers and nearest help appear in the swim card and the activity card. |
| `zones-retry` | Zones appear after the map servers fail twice, and are cached. |

**Full suite on the delivered file: 48 of 50 passed.**

- **`detail-panels`:** the page load timed out while the machine ran two test browsers at once. Run alone, it passed with no issues.
- **`no-blink`:** the map tiles redraw while the swim page scrolls. This is an old swim behaviour that **23.4 shows too**, so it is not caused by this version. Measured alone: 23.4 failed 3 of 5 runs, 23.5 failed 4 of 5. Listed as an open item.
- **All four new checks passed:**
  - pin hover: 0 pins moved, 0 flicker, pins survive refreshes;
  - photos: 73 % of list cards, 20 of 20 detail galleries;
  - emergency section: present in the swim and activity cards;
  - zones: shown after 14 s despite two failed rounds.

**Pin taps under heavy load:** the pin test now waits until the closing card has slid away and the map has stopped moving. On a slow machine the test had sometimes clicked while a card was still closing. Result: 6 of 6 pins in every mode, also with two other test browsers running.

**Not testable here:** the real Wikimedia, map and weather services can't be reached from this workspace. The photo results come from a realistic simulation, not from the live services; on the live site the photo coverage should be at least as good. In the screenshots every photo is the same stand-in image.

## Honest limits

- Photos exist only where someone has published a free photo. Remote places may still show the premium placeholder.
- Emergency numbers are shown per country. Lake rescue in Switzerland goes through the police (117); DipMapper does not invent local direct numbers.
- "Nearest help" depends on what volunteers have mapped in OpenStreetMap.
