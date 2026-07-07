# Search rerun and media hydration - v18.3.0

The previous build could show stale options after a re-scan, radius change or browser-location refresh. v18.3.0 resets the active filter to All, clears old results, closes the card drawer, cancels stale scans by scan id and then starts a fresh local-first pass.

Search flow:

1. Clear old results and filter state.
2. Start at 5 km for a location search.
3. Seed only venues within distance of the actual search coordinate.
4. Run close Overpass layers in parallel.
5. Run destination/text rescue early if the first wave is weak.
6. Hydrate photos and parking for the visible top 10 in the background.

Media flow:

1. Use audited venue photo banks first.
2. Use operator/open photos already present in venue records.
3. Use Commons category/search hydration for missing slots.
4. Lock a deck only when three usable photos are present.
5. Keep failed image URLs out of future decks during the session.
