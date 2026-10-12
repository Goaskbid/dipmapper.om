# DipMapper 23.0 — Water activities

**From swim-spot finder to water-activities finder, with swimming unchanged.** Version 23.0.0, 10 October 2026.

## Upload — one file only

| Step | File | What to do |
|---|---|---|
| 1 | `index.html` | github.com/Goaskbid/dipmapper.om → Add file → Upload files → drag **only** index.html → Commit changes |
| — | everything else | unchanged — do not upload |

Check: reload dipmapper.com fully and scroll to the very bottom — it must say **DipMapper version 23.0.0**. (The live site is still 22.21.0; 23.0.0 also contains the 22.22 fix.)

## What you will see

- A new **Activity** row directly under the radius control: 🏊 Swim · 🛶 Paddle · 🤿 Dive · ⛵ Sail · 🚤 Boats · 🌊 Rafting. Swim is selected by default and behaves exactly as before.
- Choosing an activity searches the same place and radius for that activity. The map shows its own numbered pins (solid = places to go, white ring = rentals, schools, clubs and tours), and the list below the map shows cards in the familiar style, with one-tap filters such as *SUP*, *Kayak & canoe*, *Pedal boats*, *Launch points*, *Rentals*, *Schools*.
- **Details** opens a card with: what you can do there, opening hours, rental items, price only if the operator listed one, website / booking / phone / e-mail, **live wind and gusts for the next hours** (and waves / sea temperature at the coast), directions, nearby places and providers for the same activities, the source with its last-edit date, and a short safety note.
- The welcome screen now shows Swim · Paddle · Dive · Sail. Page title and search-engine description mention the new activities.
- The choice is remembered on the device, and links can open a mode directly (for example `dipmapper.com/?act=paddle`).

---

## 1. Audit of the existing engine (before any change)

| Area | Finding |
|---|---|
| Discovery | One Overpass (OpenStreetMap) query per wave (8 / 20 / 55 km, capped by radius) for beaches, bathing places, pools, public baths, thermal springs; a names pass; Nominatim text fallback; built-in data packs for some cities. |
| Classification | `osmToVenue()` maps everything into five swim categories (beach, bath, pool, thermal, wild). Its exclusion list **removes "paddel / paddling"** and rejects shops, clubs and bars — so activities could not simply be "switched on" inside it. |
| Display | List cards, map pins and the detail drawer are bound to swim data: swim score, water temperature, water quality, parking and photos decorate every card through page-wide observers. Page-wide click guards intercept anything with the class `result` or pins with `data-mid`. |
| Reusable | Search point and radius, place suggestions, map tiles, projection and zoom, "Search this area" / pick on map, Overpass endpoints with failover (`overpassFast`), Open-Meteo access, opening-hours translation (`dmHours`), the drawer and card visual design, the phone map sizing and scroll hold. |
| Not available | No activity taxonomy, no provider model, no wind/marine conditions per spot, no tests for activities. |

**Decision:** keep the swim engine untouched and add a separate activity engine beside it that shares the search point, radius, map and design. This is the smallest reliable change: it cannot break swimming, and it avoids swim-only features (swim score, water temperature) appearing on a kayak rental.

## 2. Activity taxonomy (implemented)

| Mode | Activities | Place types | Provider types |
|---|---|---|---|
| 🛶 Paddle & row | SUP, kayak & canoe, rowing, pedal boats, boat rental | launch points | rentals, schools, clubs |
| 🤿 Dive & snorkel | scuba diving, snorkelling, freediving, wrecks | wrecks (named) | dive centres, schools, clubs |
| ⛵ Sail, surf & wind | sailing, windsurfing, kitesurfing, wingfoiling, surfing | marinas, boat ramps | rentals, schools, clubs |
| 🚤 Boats & tours | boat tours & ferries, boat rental, motorboats, charters, fishing trips, water-ski & wake | ferry & boat landings, marinas, boat ramps | tour operators, rentals |
| 🌊 Rafting & canyoning | rafting, canyoning, white water | — | tour operators, schools |

One entry can carry several activities and appear in several modes (a rental with pedal boats and motorboats appears under Paddle and Boats). Places and providers are kept apart: a launch point is a *place*, a rental company is a *provider*. Filters only appear when there are results for them.

## 3. How places and providers are found

One Overpass request per mode and search, sized by the chosen radius (names pass capped at 15 km):

| Mode | OpenStreetMap tags queried |
|---|---|
| Paddle | `amenity=boat_rental`, `canoe=put_in/egress/portage` (nodes), `sport~canoe/kayak/rowing/paddle/stand_up`, `rental~kayak/canoe/sup/paddle/pedal/rowing/boat`, `shop=water_sports`, names (SUP, Kayak/Kajak, Kanu, Pedalo, Tretboot, Bootsvermietung, Boat hire, Location de bateaux, Noleggio barche, Alquiler de barcos …) |
| Dive | `shop=scuba_diving`, `amenity=dive_centre`, `sport~scuba/snorkel/freediving/apnea`, named `historic=wreck` and `seamark:type=wreck`, names (Dive, Tauch, Plongée, Buceo, Subacque, Snorkel, Apnoe …) |
| Sail | `sport~sailing/windsurf/kitesurf/wing/surfing`, `leisure=marina/slipway`, `club=sailing`, `rental~sail/surf/kite/wing`, names (Segelschule, Yachtclub, Sailing, Voile, Windsurf, Kiteschule, Surfschule …) |
| Boats | `amenity=ferry_terminal/boat_rental`, `leisure=marina/slipway`, `sport~water_ski/wakeboard`, names (Schifffahrt, Rundfahrt, Boat tour, Cruise, Charter, Wassertaxi, Wakeboard …) |
| Rafting | `sport~rafting/canyoning/whitewater/hydrospeed`, names (Rafting, Canyoning, Wildwasser, Hydrospeed) |

**Quality rules:** private access removed; bars, restaurants, hotels, bicycle and car rentals removed unless they are tagged as boat rental; gliding clubs ("Segelflug") removed; padel/paddle-tennis removed; springboard diving in pools is **not** scuba; "charter" counts only with a boat context. Records of the same name within 250 m are merged (a node and a building of the same rental become one entry), keeping the richer data and the strongest evidence.

**Evidence and ranking:** an activity is either *recorded in the map data* (solid tag) or *suggested by the name only* (dashed tag, card label "Name only"). Ranking = distance, with a penalty for name-only evidence and a small bonus for a website and listed hours. If fewer than 3 results exist within the radius, the search widens once to 25 km and says so.

## 4. Data model (per place or provider)

Stable id (`act-node-123`), OpenStreetMap reference, name, coordinates, type and kind (place / provider), activities with evidence level, opening hours, season, price (only the operator's `charge` tag), rental items, operator, address, wheelchair access, website, booking link, phone, e-mail, English description, last-edit date of the map entry, last on-site check date if present, distance. Relationships: the detail card lists places and providers within 3 km that share an activity.

## 5. Conditions and safety

| Condition | Source | Shown |
|---|---|---|
| Wind, gusts, direction, Beaufort, air temperature, next 9 hours | Open-Meteo forecast model for the coordinates | detail card; wind summary in the list header (paddle, sail, boats, rafting) |
| Wave height, period, sea surface temperature | Open-Meteo marine model | detail card in dive and sail mode, **only when the model returns values** (not for lakes) |
| Water quality | EU bathing-water data (existing) | swim mode only — it does not describe activity sites |

Every condition shows its source and loading time and is labelled a forecast, not a measurement. There is **no safety verdict**: the card says that being listed does not mean a place is safe, open or allowed, and gives only general guidance (e.g. relaxed paddling usually needs light wind). Depth, currents, visibility and access permission are never inferred.

## 6. Tests (actual results)

**Automated suite: 38 checks** (35 existing + 3 new), headless Chrome with mocked map services.

- Last full run: **37 passed, 1 timing failure** (`no-blink`, tile refresh while scrolling under heavy parallel load). Re-run alone: 3 of 3 passed; under identical heavy load, v22.22 and v23 both scored 10 of 10 → not caused by v23.
- New activity checks with realistic Lake Zurich test data, phone and desktop: all modes return correctly classified results (e.g. *Bootsvermietung Mythenquai — Rowing boat & pedal boat rental*, *SUP Zürich — SUP & kayak rental*, *Tauchsport Käser — Dive centre*, *Zürcher Yacht Club — Sailing club*, *Zürich Bürkliplatz — Ferry & boat landing*); duplicates merged; all decoys excluded (*SUP Bar*, *Pedal Power* bike shop, *Padel Club*, *Hallenbad City* diving board, *Segelfluggruppe*); detail card, pins, nearby list, wind forecast; rafting shows an honest empty state after searching 25 km; busy map servers show "could not be loaded, not because there is nothing here"; a new search point re-runs the activity search; back to Swim restores the full swim list, pins and map caption; 0 page errors.
- Phone: map + all activity filters fit one screen on 375, 390 and 430 px phones; the map keeps exactly the same size as in Swim mode (no jumping when switching).

**Not yet tested with live data:** this work environment cannot reach the real map servers, so the Lake Zurich pilot against real OpenStreetMap data still has to be done on the live site after the upload (see open items). The tags used follow OpenStreetMap's documented conventions.

## 7. Remaining data gaps and limits

- Coverage depends on OpenStreetMap: rentals and clubs are well mapped in Central Europe, much less elsewhere. Dive sites, snorkel spots and kite spots are sparsely mapped; boat-tour operators are often mapped only as ferry landings.
- No prices, availability or online booking unless the operator published a link in the map data.
- No official tourism, marina or diving-association directories yet (each needs its own licensed source).
- No tides, currents or underwater visibility — no suitable free source.
- Operator websites are linked, not read automatically (respecting their terms).

## 8. Recommended next steps

1. Upload and run the Lake Zurich pilot on the live site: Paddle, Sail and Boats around Zürich, Rapperswil and Meilen; note what is missing compared with the operators you know.
2. Then a coastal pilot (e.g. Mallorca) for Dive & snorkel and Sail.
3. Where gaps are systematic, add a curated list of verified operators (with source and date) — the data model already supports it.
