# DipMapper — dipmapper.com

Find real, named places to swim near you or anywhere you are headed — lake baths, beaches, pools, thermal baths and wild swimming — plus paddling, diving, sailing, boat trips, rafting and one-off water experiences. Live conditions, opening hours, prices, safety rules and emergency help on every card.

This repository **is the live website**. GitHub Pages publishes it to <https://dipmapper.com> (see `CNAME`).

| File | What it is |
|---|---|
| `index.html` | The app (one self-contained file). The version is printed at the bottom of the page. |
| `swim.html`, `zurich.html`, `meilen.html`, `rhodes.html`, `miami.html`, `rostock.html`, `palma.html` | Swim guides |
| `activities.html` and the `*-lake-zurich.html`, `*-switzerland.html`, `unique-water-experiences.html` pages | Water-sports guides |
| `sitemap.xml`, `robots.txt` | For search engines |
| `manifest.webmanifest`, `sw.js`, icons | Installable app (works offline for the start page) |
| `privacy.html`, `imprint.html`, `terms.html`, `cookies.html`, `disclaimer.html`, `safety.html`, `sources.html`, `advertising.html` | Legal and information pages |
| `ads-config.js`, `ads.txt` | Advertising setup |

**Changing the site:** upload one file per commit (GitHub → *Add file* → *Upload files*). The build sources and tests live in the separate source repository; see `CHANGELOG.md` for what changed in each version.
