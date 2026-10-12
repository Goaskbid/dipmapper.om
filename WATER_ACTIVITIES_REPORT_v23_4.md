# DipMapper 23.4: Specials, Readable Forecast, Visible Packing List, Reliable Map Taps

**Version 23.4.0, 10 October 2026.** This version covers your feedback on 23.3:

- "What to bring" should simply be shown;
- the licence, ID and safety section looked strange;
- the hourly weather chart was hard to read;
- tapping a map pin sometimes did not open the card;
- pictures and descriptions should be better, including parking;
- unique water experiences should get their own tab.

## Upload: 4 files, one file per commit, in this order

| # | File | What it is |
|---|---|---|
| 1 | `unique-water-experiences.html` | **new** guide page: 80 researched specials, grouped in 10 categories, with sources |
| 2 | `activities.html` | guide hub, now linking the new page |
| 3 | `index.html` | the app, **version 23.4.0** |
| 4 | `sitemap.xml` | 25 pages (one new) |

If 23.2 or 23.3 were not uploaded yet, upload those files first. `UPLOAD_ORDER.txt` in the upload zip lists the complete ordered set.

Check: the bottom of dipmapper.com must say **DipMapper version 23.4.0**.

## What changed

| Area | 23.4 |
|---|---|
| **Specials tab (new)** | A gold **✨ Specials** button sits next to Paddle, Dive, Sail, Boats and Rafting. It lists **80 researched one-offs** in Europe and beyond, for example:<ul><li>**city and river surf waves:** Eisbach, Leinewelle, Urbansurf;</li><li>**floating and harbour baths:** Islands Brygge, Badeschiff, Frauenbadi;</li><li>**river swims:** Oberer Letten, Rhine swim in Basel, Aare in Bern;</li><li>**rooftop pools:** Hürlimannbad;</li><li>**saunas on the water**, **thermal waters** (Széchenyi, Blue Lagoon) and **iconic natural swims**;</li><li>**deep and wreck dives**, iconic boat trips, and sunset and night outings.</li></ul>Each one has a hand-researched text, an insider tip, season, access, a "good to know before you go" warning and its sources. Places from the map that also offer something unusual get gold badges, e.g. *Sauna boat*, *E-boat*, *SUP yoga*, *Kids special*. There are 15 filter chips, and the true specials are listed first. On the map they show as **gold pins** with their own pictogram. |
| **Map taps** | **Bug fixed.** A pin is now opened on the finger or mouse release. The list refresh no longer replaces pins under your finger, and the tap that opens a card can no longer close it again. Tested: **6 of 6 pins open in every mode, on phone and on PC** (before: diving 4/6, sailing 4/6, boats 2/6 on PC). |
| **What to bring** | No more button. A **visible strip** in the butler shows what to pack for the top pick. Every detail card has **"What to bring today"**: tiles with a pictogram and a reason. Must-haves are marked in gold: *ID card – the rental keeps it as a deposit*, *Cash*, *Buoyancy aid – required beyond 300 m from shore*, *Cert card & logbook*, *Buddy*. The list adapts to today: sunscreen from UV 3, a rain jacket from 40 % rain, a warm layer under 14 °C, a wetsuit for the water temperature. It also adapts to the place: a rooftop pool gets flip-flops, a sauna boat two towels and a booking, a wave pool a booked session. |
| **Licence, ID & safety** | Redesigned as **four clear answers**: **Licence**, **ID & deposit**, **Minimum age** and **Safety kit**, each in its own colour. What the operator says comes first; if nothing is known, the national rule is shown and marked "typical". All rules with their sources are below, folded. |
| **Next hours** | The bar chart is replaced by an **hourly strip anyone can read**. Each hour has its own column: time, a sky icon (sun, cloud, rain, moon), air temperature, a wind pill coloured green, amber or red with a direction arrow, gusts and rain chance. A summary sentence on top says, for example, *"Wind stays light (4–9 km/h from SW); dry; sunset 18:47."* On phones the strip swipes sideways. |
| **Descriptions** | Each card now has a **"Getting there"** paragraph written from the map data, e.g.:<blockquote>*The nearest tram stop is Brunau/Mythenquai, 4 minutes on foot. Drivers will find a paid car park about 2 minutes away — bring coins or a parking app. Toilets on site and drinking water. For a coffee, try Café am See.*</blockquote>Where no hand-written text exists, a **"The water."** paragraph from Wikipedia introduces the lake, river or sea. |
| **Pictures** | Photos are added in this order:<ol><li>specials first get the **lead photo of their Wikipedia article** (1200 px);</li><li>all places also search Wikimedia Commons' **"Quality images"** within 2 km;</li><li>then the own, named, nearby and area photos as before.</li></ol>The first photo carries **hero facts**: open status, price, water temperature and rating. |
| **Right water temperature** | Rooftop pools, thermal baths and wave pools no longer show the lake temperature. They say "set by the operator". Swimmers get *Fresh water · 17°* and "warm clothes for after" instead of a wetsuit. |
| **Phone layout** | Filter chips are one swipeable row instead of a wall of chips. The detail card no longer scrolls sideways. |
| **Status checks** | <ul><li>**Eisbach wave:** reopened on 8 May 2026 (leash required, no surfing after 22:00).</li><li>**Leinewelle:** open year-round; a new hub with changing rooms is being set up.</li><li>**Joséphine Baker pool:** closing for good (announced in April 2026; may run until spring 2027).</li></ul> |
| **SEO** | New guide page **Unique water experiences**, with structured data for all 80 places. The app's start page and the guide hub link to it. |

## Screenshots (test environment: photos and map tiles are a stand-in image)

![Phone: Specials list with the butler, the visible packing tiles, and the "Getting there" paragraph](../images/p_specials_kit.png)

![PC: a Specials card with season status, hero facts, explainer, tip and "Getting there"](../images/d_special.png)

![PC: the Specials map with gold pins](../images/d_map.png)

## Tests (actual results)

The automated suite now has **46 checks**: the 42 from 23.3 plus `pins-desktop`, `pins-phone`, `features-desktop` and `features-phone`.

- **New feature test**, on phone (390 px) and PC (1440 px), covering Paddle, Dive, Sail, Boats, Rafting and Specials:
  - every filter chip returns results (0 empty chips);
  - the butler and teasers are present;
  - the detail card opens with:
    - the packing tiles visible without a click;
    - the four rule tiles;
    - 12 hourly columns;
    - "Getting there", hero facts and a calendar link;
  - no sideways scrolling;
  - **0 page errors**.
- **Pin test:** 6 of 6 pins open in every mode, phone and PC.
- **Specials link** (`?act=special` at the Eisbach): Specials mode opens, the Eisbach is listed first, and its card shows the May 2026 status.
- **SEO:** 17 pages checked, 25 sitemap entries, 0 problems.
- **Full suite, final run on the delivered file: 45 of 46 passed.**
  - The one failure is `no-blink`, the known load-sensitive map check (23.3 behaves the same). It **passed when run alone**.
  - During the work, `close-phone` (the swim card's close button tapped 0.25 s after opening) failed twice under heavy parallel load. It passed alone 3 of 3 times and in 4 of 4 load runs comparing 23.3 and 23.4. It only involves the swim card, which 23.4 does not touch.
- **Test fixed:** the activity test used the real clock, so after sunset every place showed "Closed" and the score check failed. This happened for 23.3 too. The test now runs at a fixed 13:00, so it gives the same result at any hour.

**Not testable here:** the real photo, map, weather and Wikipedia services can't be reached from this workspace. In the test screenshots all photos and map tiles are the same stand-in image.

## Honest limits

- 38 of the 80 specials have approximate coordinates. They are corrected from the name when the card is opened (within 25 km).
- Photo quality depends on free-licence photos. Specials with a Wikipedia article almost always get a good lead photo.
- Specials texts were researched in October 2026. Seasons and rules can change, so each card says "check before you go".
