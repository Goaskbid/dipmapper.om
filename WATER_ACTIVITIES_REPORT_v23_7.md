# DipMapper 23.7: Clean Map, Focused Specials, Divers' Data, Boat Fuel, One Water Model

**Version 23.7.0, 11 October 2026.** Your screenshot of the live site showed the map covered with dozens of red "Restricted area" labels. This version removes that clutter at its root, trims the Specials tab to what is really special, and adds what divers and boaters asked for: depth, visibility, fish and boat fuel stations. It also closes every open item, either by fixing it or by making and documenting a decision.

## 1. The map clutter: root cause and repair

**Root cause.** On real lakes, OpenStreetMap marks dozens of areas as *seamark: restricted area*. Most of them are harmless: no anchoring, no wake, speed limits. Many are the **bathing zones themselves**, marked so that boats stay out. Since 23.2, DipMapper drew every one of them in red with its own "Restricted area" label, in every mode, including Swim. The test data had only three zones, so the tests never showed it.

**Repair.**
- **Only real prohibitions are drawn, and only for the activity they concern:**

  | Zone | Shown in |
  |---|---|
  | No entry | all activities |
  | No swimming | Swim |
  | No diving | Dive |
  | Protected area (nature or bird reserves) | Paddle, Sail, Boats |
  | Bathing zone (keep out) | Paddle, Sail, Boats; never in Swim |
  | No boats / no motorboats | the boat activities |

  No-anchoring, no-wake and speed-limit areas are no longer drawn.
- **Colours:** red for prohibitions, blue for bathing zones, green for protected areas. The legend names what is on the map.
- **Labels:** at most **3**, only on zones big enough to hold them, never overlapping each other or a pin.
- **Temperature tags in Swim:** at most 8, spaced further apart.
- **New test, `zones-clutter`:** a realistic lake with 30 marked areas (15 bathing zones, 10 no-anchoring, 3 no-entry, 2 reserves).
  - **23.6:** clutter in all four modes.
  - **23.7:** clean. Swim shows only the 3 no-entry zones; no mode shows more than 3 labels, and none overlaps a pin.

![Phone, Boats on the 30-zone test lake: only no-entry, bathing and protected zones, one legend](../images/p_zones.png)

## 2. Specials: from 37 mixed results to 6–12 researched ones

- The Specials tab now shows **only the researched one-offs**, each with sources. Shops, schools or baths that merely mention "sunset" or "kids" are no longer listed.
- It shows the ones nearest to you: within 150 km, or the 8 nearest if fewer than 6 are close, and never more than 12. For Zürich that means **12** (21 lie within 150 km): Frauenbadi, Männerbadi, Seebad Utoquai, Hürlimannbad rooftop pool, Oberer and Unterer Letten, Urbansurf, Werdinsel, the Bremgarten Reuss wave, the Rhine Falls rock boat, the Lake Lucerne paddle steamers and the Rhine swim in Basel.
- **Filters:** 10 categories, only those with results (sunset outings, SUP yoga, kids, e-boats and "famous" are gone).
- **Badges on normal cards:** at most one, and only for the truly special (surf wave, floating or river bath, rooftop pool, sauna, thermal).
- Specials whose position is approximate are placed exactly in the background (one lookup every 1.2 s, remembered).

![Phone: Specials near Zürich in October, starting with what is open now](../images/p_specials.png)

## 3. Divers: depth, visibility and fish

Every dive card now has an **"Under water"** section with four tiles:

| Tile | What it shows | Source |
|---|---|---|
| **Depth here** | Maximum depth and the site's profile, e.g. *Au peninsula: max. about 52 m, wall from about 10 m to 35–40 m, caves at 18–20 m and 11 m* | The researched dive-site descriptions (6 Lake Zurich and Greifensee sites) |
| **The lake** | How deep the lake is, e.g. *Lake Zurich, up to … m* | Wikidata, live |
| **Visibility** | The site's own note where known (*Maur: usually just 1–2 m*); the rain of the last 48 h; for Lake Zurich, that it is clearest in the May–June clear-water phase and that winter visibility has dropped since the 1990s because of the alga *Planktothrix*; Obersee about 4 m all year | Open-Meteo; Kanton Schwyz lake report |
| **Fish & life** | Up to 6 species recorded within about 5 km, with Latin names and record counts, plus the site's own notes (burbot at Au, pike at Rüschlikon) | GBIF |

- Dive cards in the list show the maximum depth as a chip, e.g. **max 52 m**.

![Phone: the "Under water" section of the Au peninsula dive site](../images/d_underwater.png)
- The old claim that "lakes are usually clearest in winter" was removed, because for Lake Zurich the source says otherwise.

## 4. Boaters: boat fuel stations ("Bootstankstellen")

- Boats mode now finds **boat fuel stations** from OpenStreetMap: `waterway=fuel`, fuel stations marked for boats, and seamark fuel stations. They get their own **⛽ Boat fuel** filter and brown pins.
- Their card shows the opening status from the mapped hours (e.g. *Open · until 20:00*), fuel types and payment where they are mapped, and advises calling ahead in the evening and off season. It shows no "great now for…" score and no DipMapper rating, because a fuel station is a service, not an experience.

![Phone: a boat fuel station in the Boats list](../images/p_fuel.png)
- Boat and Sail cards list the **nearest boat fuel station** under "Emergency & help nearby".

## 5. One water-temperature model for the whole site

- Swim cards used a month table (≈ 14 °C on Lake Zurich in October), while activity cards used the last 30 days of measured air temperature at the place (≈ 17 °C). The same lake showed two temperatures.
- **Decision:** the whole site now uses the measured-weather model, plus the marine model on coasts. Rivers are estimated separately.
- Swim scores therefore change a little with the season, and the swim and activity cards now agree.

## 6. Fixed during the re-audit

- **After starting in an activity and switching to Swim, the map showed the whole of Europe**, with "Search this area". The swim view saved before any search is no longer restored. The map shows the search area, and the journey test now checks this.
- **The map could zoom in to street level on a single place.** The automatic fit now stops at zoom 14.
- **Boat fuel stations showed "Public place · always accessible" and a star rating**, even when their opening hours were mapped. The new `dive-fuel` test found it; they now show their real opening status and no rating.

### Second pass: every screen checked by eye, on phone and PC

After the first round I walked the whole journey again on a phone (390 px) and a PC (1440 px). I looked at all 45 screens of each walk, one by one. Fixed:

| # | What a first-time user saw | Now |
|---|---|---|
| 1 | **Phone, Swim after a start-screen search:** the map's "−" button was pushed off the screen. A long place name widened the whole map panel. | The map panel never gets wider than the screen; all four buttons are always visible. |
| 2 | Headings said "**Zürich swim culture** · 23 mapped places" and "5 km around Zürich swim culture". | "Zürich" everywhere, as in the activities. |
| 3 | **Summer-only places looked open in October.** "mid-May to mid-Sep" and "summer" were not understood, so the Frauenbadi showed "Great now for a swim, 84" and led the Specials. | These seasons are understood. Out-of-season places show "Out of season · mid-May to mid-Sep", no score and no "best window". The Specials tab starts with what you can do now (e.g. the Hürlimannbad rooftop pool). Their packing list is titled "What to bring when the season starts". |
| 4 | Places with no published hours got a "best window" until **02:00 at night** (e.g. lake cruises). | Without published hours only daylight is suggested. |
| 5 | **Lakeside places in Zürich showed "Water: Limmat".** Wikipedia gives a lake one point in its middle (20 km away) and the Limmat one in the city. The dive section could therefore miss the lake depth and visibility notes. | The water comes from the named lakes and rivers that OpenStreetMap maps within 250 m, and the place's own description decides between them. The Wikipedia rule is kept as the fallback. Test: Bootsvermietung Enge → Lake Zurich, Frauenbadi → Limmat. |
| 6 | Dive **centres and shops** in town got an "Under water · Depth: not published" section. | The section shows only for dive sites and places, not for shops and schools. |
| 7 | Back in Swim after an activity, "**Search this area**" appeared when the swim map had fitted itself to the places. | An automatic fit is never treated as a map move, also after switching activities. |
| 8 | Swim list in October: summer baths showed "**Busy now**" and "**Parking likely full**". | Outdoor places are counted as quiet outside the bathing season (May–Sep in the north, Nov–Mar in the south, not in the tropics). |
| 9 | Map pins could cover the small "No boats" legend in the corner. | The legend stays on top and lets taps through. |

## 7. Data audit (all data files)

Every data file was loaded exactly as the app loads it and checked for complete fields, formats (web, phone, e-mail, prices), sources, duplicates and links between files.

| File | Entries | Errors | Notes |
|---|---|---|---|
| Verified directory | 36 | 0 | 5 notes, see below |
| Specials | 80 | 0 | 10 categories, every entry with a source |
| Emergency numbers | 46 countries | 0 | every country with a source |
| Rules (licence, ID, safety) | 86 | 0 | every rule with a source |
| Ice lakes | 27 | 0 | every lake with an authority |
| Dive-site facts | 6 | 0 | every site with a researched description |

**The 5 notes, and what was decided:**

| Note | Decision |
|---|---|
| ZIMI sailing | Only a directory mention, with no website, phone or e-mail. **Hidden.** Rule from now on: a listing nobody can contact is not shown. |
| SUPSWISS | Its website now redirects elsewhere. **Kept**, with the visible "please check before you go" box. |
| Kite Addicted | Status unconfirmed. **Kept**, with the same box. |
| Bootsvermietung Seefeld | No hand-written explainer. **Kept**; the generated description is factual. |
| Kayakfun | Prices "on request". **Kept as published.** |

## 8. All open items: closed or decided

| Item | Outcome |
|---|---|
| iPhone check | The full journey ran at 375 × 667 (iPhone SE), 390 × 844 and 430 × 932 (Pro Max), with 0 issues. Real Safari can't run here, so look once on your phone after uploading. |
| Specials without a Wikipedia link (66) | No manual links needed. Since 23.5 each card searches Wikipedia by name and accepts only an article within 3 km. |
| Approximate specials positions | Placed exactly in the background (see section 2). |
| ZIMI, SUPSWISS, Kite Addicted | Decided (see section 7). |
| Swim vs activity water temperature | Unified (see section 5). |
| Paid directory listings | **Decision: no paid placement for now.** Rankings stay editorial. If it comes later, every paid entry must carry a visible "Sponsored" label and may never change the score. |
| Phone map size | Kept as is. The map-hold tests at 375 and 390 px pass. |
| AdSense | Kept as is. The existing consent and ads setup is unchanged. |
| Google Play fingerprint | Deferred until there is an Android app. It needs the signing key's SHA-256 from the Play Console, which can't be invented. |
| Dark mode | **Decision: no dark mode.** Map tiles and photos are light, and a dark frame around them hurts contrast. |
| Repository clean-up | Done through the GitHub layout (website repo + private source repo). |

## Tests (actual results)

The suite now has **56 checks**: the 52 from 23.6 plus `zones-clutter`, `journey-phone-small` (375 × 667) and `dive-fuel` on phone and PC (the Under-water tiles with their sources, the depth chip, the fuel filter, pin, card and the nearest fuel station in a boat card, and the water a card is on).

**Full suite on the delivered file, run one check at a time: 56 of 56 passed.** The run was made after the last repair, on the exact file in `website/index.html`.

- **Journey on phone (390 and 375 px) and PC:** 0 issues, 0 page errors.
- **Data audit:** 0 errors, 5 notes (decided in section 7).
- **Two checks were themselves repaired, not loosened:**
  - `zones-retry` still counted the old cache name after the zone cache was renamed on purpose.
  - `no-blink` sometimes measured the swim search's one final map move as a "blink" (23.6 does the same). It now waits until the search has finished. It still fails if scrolling, resizing or redrawing replaces a single map tile.

**Not testable here:** the real map, photo, weather, Wikipedia and OpenStreetMap services can't be reached from this workspace. After uploading, please open one lakeside place in Zürich (e.g. Bootsvermietung Enge in Paddle) and check that the Water tile says Lake Zurich. The tests use realistic stand-ins, so in the screenshots every photo and map tile is the same stand-in image.
