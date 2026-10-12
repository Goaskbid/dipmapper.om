# DipMapper — source

Build sources, tests, research data and documentation for **dipmapper.com**. The live website is published from the separate website repository; the `website/` folder here is an identical copy of it.

## Folder map

| Folder | What it is |
|---|---|
| `website/` | Every file of the live site. `website/index.html` is the app (version 23.8.1). |
| `tools/build/v23.8/` | The sources of `index.html`: the base file `base_v22_22.html`, the activity modules (`act_core.js`, `m_*.js`), styles (`act*.css`), data (`dir*.js`, `specials.js`, `emergency.js`, `ice_data.js`, `req.js`, `dive_data.js`), the About section (`about/`: interview fragment and WebP photos, built into the page) and `build.py`. `research/` holds the sourced research data; `seo/` builds the guide pages; `audit/data_audit.js` checks all data files. |
| `tools/tests/` | The automated test suite (63 checks), including the first-time-user journey (`journey.js`). |
| `generator/` | Generator for the city swim guides. |
| `assets-source/` | High-resolution logo. |
| `docs/` | `DEVELOPER_GUIDE.md` (start here) and the version reports. |

## Build

```
cd tools/build/v23.8
python3 build.py        # writes index.html next to build.py, byte-identical to website/index.html
```

## Test

```
cd tools/tests
npm install
node run_all.js         # all checks; results in tools/tests/results/
```

The tests run a local copy of `website/` in headless Chrome and mock every outside service (map, weather, photos), so the results do not depend on the internet.

## Rules

- Never invent data. Every price, opening time, rule, phone number and description must have a source, which is stored next to it.
- No regressions. A feature that works must keep working; run the full suite before every release.
- The live site is updated **one file per commit**.

See `CHANGELOG.md` for the history.
