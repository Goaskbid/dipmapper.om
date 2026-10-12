# DipMapper 23.1: Finding activity providers

**Version 23.1.0, 10 October 2026.** This version responds to: *"it finds none of these if they are not swim spots. SUP is also missing, surf spots / kite. We need price lists, websites and contact details."* It also responds to: *"the tool must work with the same super high quality anywhere globally."*

## Upload: one file only

| Step | File | What to do |
|---|---|---|
| 1 | `index.html` | github.com/Goaskbid/dipmapper.om → Add file → Upload files → drag **only** index.html → Commit changes |
| — | everything else | unchanged, do not upload |

To check the upload, fully reload dipmapper.com and scroll to the bottom. It must say **DipMapper version 23.1.0**. This version replaces 23.0.0, so you can skip uploading 23.0 and upload 23.1 directly.

## Why it found almost nothing

1. **The search area was too small.** Activity search used the swim radius, which is 5 km by default. Providers sit at harbours and lidos that are often 5–15 km away.
2. **Most providers are missing from open map data, or are tagged as something else.** A SUP station inside a lido is mapped as the lido. A wakeboard school at a harbour is mapped as the harbour. The 23.0 search only recognised rentals that were explicitly tagged as rentals.
3. **Kite, windsurf and surf keys were not searched.** These are dedicated OpenStreetMap keys (`kitesurfing=*`, `windsurfing=*`, `surfing=*`), and 23.0 did not query them.

## What changed

| Change | Effect |
|---|---|
| Activity search covers **at least 15 km**, even when the swim radius is 5 km. It still widens to 25 km if fewer than 3 results are found. | Providers across a lake region show up. |
| Wider OpenStreetMap search: `sport=sup`, any `rental:*=yes`, the `kitesurfing`/`windsurfing`/`surfing` keys, and many more name patterns (SUP…, Paddel, Seeclub, Wassersport, Wakesurf, Wing foil, Kite, Surf, Bootsvermietung, Pedalo, Tretboot). | Better results **everywhere in the world**, not only in Switzerland. |
| **"Looking for more?" link on every activity list, every empty result and every "servers busy" message.** It opens Google Maps searching for the selected activity (for example "SUP rental", "kitesurf school", "surf school", "dive center") at the search point. | Works worldwide. It reaches the businesses that are not in open map data, with their reviews, hours, phone numbers and often prices. |
| **Verified directory (36 entries)**: Lake Zurich SUP stations, boat rentals, wake/SUP school Stäfa, sailing and motorboat schools, dive centres and dive sites, Greifensee, Reuss kayak/raft, plus Swiss surf waves, kite spots and kite schools. Each entry carries its website, phone, e-mail, season and hours, and **published prices** with the source and check date. | Shown at once, even while map data loads and even when the map servers fail. Each one is marked **✔ Verified**. |
| Card actions: **📞 Call** and **🌐 Website** directly on each card; a **"from CHF …"** chip when prices are published; a **"Details & prices"** button. | Contact in one tap. |
| Detail card: a **price table** ("as published by …, checked …; confirm when booking"), offers and notes, the source link, and **Report a change**. If no prices are published, it says "ask the operator" and shows a Call button. | Prices are never guessed. |
| **Local rules for wind sports** in Sail mode, as a box that can be collapsed on phones: City of Zürich no-kite/windsurf zone, Canton of Zürich kite zones, Canton of Schwyz kite ban. | You see legal limits before you launch. |
| When a directory business also exists in OpenStreetMap, the two are merged into one card. | No duplicates. |
| Map positions marked as approximate are refined from the address when the card is opened, then cached on the device. | Pins become more accurate. |
| Labels: "SUP school", "Wakeboard & SUP school", "Motorboat & sailing school", "Raft rental", "Dive site". | Clearer card titles. |

## Honest answer on "same high quality anywhere in the world"

| Region | Results today |
|---|---|
| Lake Zurich and Swiss surf/kite | Verified directory with prices and contacts, plus OpenStreetMap, plus the Google Maps link |
| Rest of the world | Wider OpenStreetMap search plus the Google Maps link (one tap). Websites and phone numbers appear when OpenStreetMap has them, which is common in Europe and patchy elsewhere. Prices only appear if the operator published them in the map data. |

There is **no free, open data source** that lists every SUP, kite, surf, dive and boat business in the world with prices. No hand-made list can do it either. There are only two ways to get the same quality everywhere *inside* DipMapper:

1. **A commercial places service**, for example the Google Places API or the Foursquare Places API. It returns names, phone numbers, websites, hours, ratings and price level worldwide.
   - Cost: free up to a monthly quota, paid above it.
   - It needs a small server-side proxy so that the key stays secret and spending is capped.
   - Its terms require attribution, limit storing the results and require following its display rules.
   - **This is a business decision for Torsten (cost and terms). It is not built.**
2. **Operator self-listing.** Providers add or update their own entry, including prices, through the existing "Advertise / Book a local spot" path. This needs a simple review step.

Until one of these is decided, the Google Maps link is the global safety net. Lists never end empty-handed.

## Tests (actual results)

The automated suite has 38 checks, run in headless Chrome with mocked map services.

- **Full run: 37 passed and 1 timing failure (`no-blink`).** Re-run alone, `no-blink` passed 3 of 3. This is the same known timing sensitivity under parallel load as in 23.0.
- An earlier full run on this build passed 38 of 38.
- The activity checks were extended and all pass on phone (390 px) and desktop:
  - Zürich, Paddle: 13 results, including the 3 Supkultur SUP stations with prices ("SUP rental, adults – first hour CHF 35"; the card chip says "from CHF 25"), Bootsvermietung Enge and Seefeld, SUPSWISS (SUP school), and the existing OpenStreetMap rentals and clubs. Decoys are still excluded (SUP Bar, Pedal Power, Padel Club, Hallenbad, Segelfluggruppe).
  - Zürich, Sail: the "Local rules for wind sports · 2 apply here" box, sailing schools with prices, Urbansurf (from CHF 39) and the Bremgarten river wave.
  - Meilen, Paddle: 15 results, first *Ceccotorenas, Stäfa* (SUP & wakeboard school, with prices). Meilen, Boats: 15 results.
  - Rafting from Zürich: Kayakfun Reuss (raft rental, CHF 90/day), found by widening to 25 km.
  - Map servers down: the verified entries still show, with "Map data could not be loaded right now — showing verified directory entries only".
  - Far away with nothing found (Rügen test): an honest empty state plus the Google Maps link.
  - Google Maps link: the correct query and coordinates for the mode and the selected filter.
  - Switching back to Swim restores the swim list and pins. There were 0 page errors.

**Not testable here:** this work environment cannot reach the real map servers. A live check on dipmapper.com after the upload is still needed.

## Sources used for the verified directory

All entries come from the operators' or authorities' published pages, or from Zürich Tourism. Each card shows its source and the check date (10 Oct 2026). Positions marked "approximate" were placed from the address and are refined automatically when a card is opened.
