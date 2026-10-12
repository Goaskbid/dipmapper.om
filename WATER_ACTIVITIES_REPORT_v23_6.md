# DipMapper 23.6: First-Time-User Audit and GitHub-Ready Delivery

**Version 23.6.0, 11 October 2026.** Before go-live, I walked through the whole site the way a first-time visitor would, on a phone (390 px) and on a PC (1440 px). The walk was done twice: by eye, screen by screen, and as a new automated end-to-end test. Every problem found was fixed and is now checked by that test.

## What a first-time user does, and what was wrong

The automated journey covers the whole path:

1. the start screen;
2. typing a town;
3. the swim list, opening a swim card and reading it to the end;
4. every activity (Paddle, Dive, Sail, Boats, Rafting, Specials), where it tries the filters and every sort order, opens a card, reads every section and closes it by tapping outside;
5. tapping a map pin;
6. going back to Swim.

On every screen it also checks for broken text ("undefined", empty brackets), anything sticking out sideways, buttons too small to tap on a phone, and page errors.

| # | Step | What a new user ran into | Fixed in 23.6 |
|---|---|---|---|
| 1 | Start screen | The start screen only spoke about swimming. Someone who came to dive or rent a boat had to search first and then find the activity switch. | The start screen now asks **"What do you want to do?"**, with seven pills: Swim, Paddle, Dive, Sail, Boats, Rafting, Specials. After the search, the results open directly in that activity. The text below the title now mentions water sports too. |
| 2 | Closing a card on a phone | On phones, the only free space above an open card is the header. The tap that closed the card on the logo **also jumped to the start screen**, so the user lost the search. | A tap that closes a card does nothing else. |
| 3 | Switching activity | Each switch moved the map to fit the results, and the app then showed **"Search this area" with a red crosshair**, as if the user had moved the map. | Moving the map automatically no longer asks to search again. Moving it yourself still does. |
| 4 | Card titles on phones | Long names broke inside words ("Bootsvermietun‑g Enge"), and the operator logo sat alone on its own line. | Titles use the full width and break only between words, with the logo beside the name. |
| 5 | Map header on phones | A long place name ("Zürich swim culture · 23 mapped places") pushed the **zoom-out button off the screen**. | The place name shortens with "…"; all four map buttons stay visible. |
| 6 | Headings | Activity headings read "Paddle & row near **Zürich swim culture**". | "Paddle & row near Zürich". |
| 7 | Place names | One swim place showed an alternative name with empty brackets: "Zürich Bürkliplatz ( )". | Empty brackets are removed, and the alternative name is not shown when it repeats the main name. |
| 8 | Card facts | The "Water" tile could name a lake bath ("Seebad Enge") instead of the lake. | Baths, beaches, pools, promenades, harbours and streets are no longer taken as the water body. |
| 9 | Map | Temperature labels sat on pins and on the "15 km search" label. One far-away place (e.g. 21 km away) zoomed the map out so far that all the others piled up in a corner. | Labels look for free space around their place. The map fit leaves out places more than 2.5× the median distance, unless that would drop too many. |
| 10 | Activity lists | The swim search box "Spots ready 96 %… more places, photos, parking…" stayed visible in every activity. | It only shows in Swim. |
| 11 | Rafting | Ordinary city rivers (e.g. the Limmat in Zürich) were added as "famous" rafting places. | Only gorges, canyons, rapids and white-water articles count. |
| 12 | Installed app | The app description in the phone's app list only mentioned swimming. | It now mentions water sports, live conditions, prices and emergency help. |

**Checked and fine (no change needed):**
- The activity switch sits at the top on phone and PC.
- Every filter of every activity returns results.
- All four sort orders work.
- Every activity card shows all sections: Right now, Where it is, Opening hours, Prices, Water & nature, Next hours, Licence, ID & safety, **Emergency & help nearby**, Contact & social, Nearby, Source. None of them was still loading after 4 seconds.
- Closing by tapping outside works in every activity.
- A pin tap opens the card.
- Going back to Swim restores the swim list without activity pins.

![Phone: pick the activity on the start screen, the search opens straight in Paddle, card title on one line](../images/p_journey.png)

## GitHub-ready delivery

Everything now comes in a layout you can put on GitHub without changing anything:

| Folder in `DipMapper_GitHub_v23_6.zip` | Goes to | Contents |
|---|---|---|
| `1_website-repo/` | Your existing website repository (`Goaskbid/dipmapper.om`), which GitHub Pages publishes to dipmapper.com | Exactly the files of the live site, plus `README.md` and `CHANGELOG.md` |
| `2_source-repo/` | A **new, private** repository, e.g. `dipmapper-source` (recommended) | Build sources, tests, research data, documentation, `.gitignore`, `README.md`, `CHANGELOG.md`. There are no passwords or keys in it. |
| `UPLOAD_GUIDE.pdf` / `.docx` | For you | Click-by-click steps for both. Uploading one file per commit is kept for the live site. |

## Tests (actual results)

The suite now has **52 checks**: the 50 from 23.5 plus `journey-phone` and `journey-desktop`.

**Full suite on the delivered file, run one check at a time: 52 of 52 passed**, including `no-blink`, `detail-panels` and both new journey checks.

- **Journey on phone and PC:** 0 issues, 0 page errors.
- **The checks that failed in earlier runs fail only under load:**
  - When several test browsers ran at the same time on this machine, `activities-phone` (pin tap), `detail-panels` (page load) and `no-blink` sometimes timed out.
  - Run one at a time, they pass.
  - The final run was therefore done one check at a time.

**Not testable here:** the real photo, map and weather services can't be reached from this workspace. In the screenshots every photo and map tile is the same stand-in image.
