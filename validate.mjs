# Search redesign, v18.2.0

## Goal

Search must never reuse a previous location's results. It must start from the current location or searched destination, show the closest useful options first, then broaden in the background.

## Runtime behavior

1. New search or location request clears results, parking cache, photo locks and selected card.
2. Radius resets to 5 km.
3. Seed packs are loaded only when the search point is inside a tight activation radius.
4. Live discovery starts with core swim venues and local swim-name matches.
5. If fewer than five results are found quickly, bounded destination rescue begins.
6. If fewer than ten are found, wider water/beach/pool/nature layers start.
7. Older async scans are ignored via `state.scanId`.

## Anti-stall changes

- Overpass endpoint race now returns the first non-empty result rather than the first endpoint to finish.
- Empty responses do not prematurely end discovery.
- Text rescue runs early and again if results stay sparse.
- Pack activation radius prevents Zurich city content from leaking into Meilen local searches.

## Current seeded packs

- Zurich swim culture
- Meilen and right-bank Zurichsee
- Rhodes
- Rostock / Baltic beaches
- Palma / Mallorca

## Next steps

- Add more regional seed packs only where there is enough verified data.
- Move geocoding/search to a production backend for better speed and control.
- Cache verified result sets per region.
