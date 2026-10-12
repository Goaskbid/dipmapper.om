# DipMapper 23.3: Premium Cards, Real Explainers, Bespoke Maps, Winter Everywhere

**Version 23.3.0, 10 October 2026.** Covers your feedback on 23.2:

- the click-outside glitch;
- design quality on phone and PC;
- explainers, structure, pictures and icons;
- more butler functions and helpers in the cards;
- social media and phone;
- bespoke maps with their own colour world per activity;
- winter visibility worldwide, tested in Finland, Russia and Greenland.

## Upload: 9 files, one file per commit, in this order

| # | File | What it is |
|---|---|---|
| 1–7 | `water-sports-lake-zurich.html`, `sup-lake-zurich.html`, `boat-rental-lake-zurich.html`, `diving-lake-zurich.html`, `sailing-lake-zurich.html`, `surfing-switzerland.html`, `kitesurfing-switzerland.html` | the guides, now with the hand-written explainers and "Good to know" tips |
| 8 | `index.html` | the app, **version 23.3.0** |
| 9 | `sitemap.xml` | unchanged list, new dates |

If 23.2 was not uploaded yet, upload the 23.2 files first, following the order in `UPLOAD_ORDER.txt`. Those are `activities.html` and the six fixed city guides. The 23.3 upload zip contains the complete set of 17 files, ordered.

Check: the bottom of dipmapper.com must say **DipMapper version 23.3.0**.

## What changed

| Area | 23.3 |
|---|---|
| **Closing the card** | **Bug fixed.** A tap or click anywhere outside the open card closes it, on PC and phone. The tap that closes it does nothing else, so it cannot press a button underneath by accident. On phones the card is now a real **bottom sheet**: the page stays visible, dimmed, above it. Tap there, or **swipe the card down**, to close it. |
| **Detail card structure** | Now built exactly like the original swim card, in the same order:<ol><li>photo gallery;</li><li>written explainer;</li><li>"Good to know" tip;</li><li>**Town · Water · Country** tiles, with the town's coat of arms, a photo of the lake or sea, and the flag;</li><li>DipMapper rating;</li><li>quick actions (Drive, Transit/walk, Website, Book, Call, Instagram, Facebook, Reviews, More photos);</li><li>**Right now** score;</li><li>**Where it is**: a mini map plus the nearest train, tram or bus stop, boat landing, parking, WC, shower, drinking water and café, each with walking minutes;</li><li>opening hours, prices, water & nature, the next hours, licence & safety, contact & social, nearby places, source.</li></ol>Sections keep the swim card's red-and-white lifebuoy mark. |
| **Explainers** | **34 checked places now have a researched, hand-written explainer** of 86–119 words, in a local voice. Each says where exactly it is, what you do there, who it suits and what makes it different. Each has an insider tip and the nearest stop, with sources. No clichés, no repeated openings. Examples: the Au peninsula dive (wall to 35–40 m, the standing stone, burbot in the cracks, and "out of the water before the 10:32 boat"); the Seebad Enge pedalo stand ("pedalos cannot be reserved, so arrive early on summer weekends; bring cash and ID"). Every other place in the world gets an explainer written from its data, the town and the lake or sea it sits on, with varied wording. Today's conditions are added in one plain sentence. |
| **Pictures** | Photos are chosen in this order:<ol><li>the place's own photo;</li><li>Wikimedia Commons photos of the place by name;</li><li>photos within 700 m that show water, harbour or sport;</li><li>**large Wikipedia photos of the area**: the lake, the bay, the promenade, the town. These exist almost everywhere in the world, so cards rarely have no photo.</li></ol>Every photo is credited and links to its author and licence. On phones the gallery is a swipeable carousel. The cartoon sketches are gone. The last fallback is a premium placeholder: brand gradient, contour lines and one clean pictogram. |
| **Icons** | A set of about 65 line icons in one style replaces the emojis. They cover wind, water, sun, sunset, rain, clock, price, phone, web, e-mail, Instagram, Facebook, WhatsApp, YouTube, stop, parking, WC, café, shield, ID, licence, life jacket, fish, calendar, share, bag, and every sport. They appear in cards, butler, detail card, quick actions, the bottom bar and the map pins. Operator **logos** (website favicons) sit next to the names. |
| **Cards** | Photo with rank, score and ★ for famous places. Below it:<ul><li>type with pictogram, DipMapper rating and distance;</li><li>logo, name and the **verified** seal;</li><li>a **one-sentence teaser**;</li><li>live status, price per hour and water temperature;</li><li>**helper chips**: *Closes in 25 min*, *Opens in 45 min*, *ID needed*, *Deposit*, *Age 14+*, *No licence needed*, *Lessons*, *Book ahead*, a wetsuit hint, *Good for beginners*, *Families*, *Status unconfirmed*;</li><li>buttons: Details, Route, Call, Website, Instagram.</li></ul> |
| **Butler** | Greets by time of day. Shows wind, air, water, UV, a **sunset countdown**, waves, and rain over 48 h for divers. Gives a varied verdict with photo picks. New buttons:<ul><li>**What to bring**: a checklist per sport, adjusted to today, e.g. buoyancy aid beyond 300 m, wetsuit thickness for the water temperature, ID and cash when the rental asks for them, sunscreen at UV 3+, a rain jacket, a warm layer, ice claws on natural ice.</li><li>**Add to calendar**: a calendar file for the best time window.</li><li>**Share plan**: phone share sheet or WhatsApp, with the place, the time window and the water temperature.</li><li>**Best now**: sorts the list by the live score.</li></ul>The same tools sit in every detail card under "Right now". |
| **Maps** | **Bespoke pins**, no longer standard dots:<ul><li>teardrop pins like the swim pins, numbered, in **one colour per activity**: SUP orange, kayak teal, rowing blue, pedalos pink, boat rental violet, diving indigo, snorkelling cyan, kite magenta, surf orange-red, wake red, boat tours green, rafting red, marinas navy, launch points turquoise, famous gold, natural ice light blue;</li><li>each pin has a small white **pictogram badge**;</li><li>rentals, schools and clubs are white pins ringed in their colour;</li><li>a hover/selected lift, and a colour legend under the map.</li></ul>Each activity gets its own **colour world** on the map edges, the list header, the butler and the card accents: Paddle orange, Dive indigo, Sail blue, Boats green, Rafting red, Ice light blue. All of them are clearly the same family as the swim design. The water-temperature bubbles and no-go zones stay. |
| **Winter worldwide** | The Ice mode button and the winter sections now switch on wherever it is **actually freezing**, in any month and either hemisphere. Before, they followed the calendar (Nov–Mar). Outside the 27 lakes with an official process, Ice mode lists the **named lakes and ponds** around you from OpenStreetMap, with "No official ice release known here — ask the municipality or local police", the ice model and the safety rules. Ice rinks come from OpenStreetMap. Tested at **Kuopio (Finland, lake Kallavesi)**, **Petrozavodsk (Russia, Lake Onega)** and **Nuuk (Greenland)**: the Ice button appears, the lakes are listed, and the frost overlay and ice bubbles show. |
| **Contacts** | New from research: Beni Winiger (website, e-mail, phone, Instagram, Facebook), SMS Zürisee (website, phone), Beat Lang (website, phone). Corrected addresses for Winiger, SMS and Beat Lang. SMS also offers wake and boat rental, so it now appears for those too. |
| **SEO pages** | All seven guides now carry the explainers, tips and "Getting there" lines, so search engines see real content. |

## Tests (actual results)

Automated suite: **42 checks**. That is the 40 from 23.2 plus `winter-finland` and `winter-russia`; the Greenland case was checked during development. Two existing checks were extended: tap/click outside closes the card, on phone and desktop.

- **Final full run: 40 passed, 2 timing failures (`alerts`, `no-blink`).** Run alone, both passed (`alerts`, `detail-panels` and `no-blink` each 1 of 1).
  - `alerts` also passed 2 of 2 under three-test parallel load.
  - `no-blink` is the known load-sensitive check; v23.1 fails it the same way under load.
- **Activities, phone and desktop:**
  - the outside tap closes the card;
  - the map-pin tap opens the card;
  - butler with picks, verified seals, scores, zones and temperature bubbles;
  - prices, the Ceccotorenas, Kayakfun and rules checks;
  - honest empty state far away;
  - directory still shown when the map servers fail;
  - back to Swim restores the swim list and pins;
  - **0 page errors**.
- **Winter:**
  - Zürich (official bulletin lakes): passed.
  - Finland and Russia: Ice button visible from Swim mode; Ice mode lists the lake; "No official ice release known"; frost overlay on; 0 page errors.
- **SEO:** 16 pages, 0 broken links, all canonical addresses and structured data valid, 24 sitemap entries.

**Not testable here:** the real photo, map, weather and Wikipedia services can't be reached from this workspace. In the test screenshots every photo, logo and map tile is the same stand-in image. On the live site you will see the real photos, coats of arms, flags and logos.

## Honest limits

- Photos depend on what exists under a free licence. Popular places almost always have some; remote ones may show the area photo or the placeholder.
- Operator logos come from the operators' website icons. Some sites only have a generic icon.
- Ice status is linked, never claimed. Thickness is always a model.
- 1 of 35 checked places (ZIMI sailing) still has no explainer: no reliable source was found. 6 entries are thin (see open items).
