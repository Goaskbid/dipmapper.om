# DipMapper v16.0.0 discovery reliability

This release stops relying on one long live Overpass request.

## Browser path

1. Seed nearby destination packs instantly when the coordinate is close to a known high-demand swim city.
2. Start parallel Overpass layers: managed swim venues, natural beaches/hot springs/waterfalls, local-name search, and explicit swimming/bathing tags.
3. Use bounded Nominatim rescue only if the first layers are weak.
4. Keep the visible top 10 stable while background discovery, parking and enrichment continue.

## Commercial production path

For commercial launch, the browser should be backed by a prebuilt global venue index generated at build time or by a small API. Live public Overpass/Nominatim endpoints should be treated as enrichment/fallback, not the primary source of truth.

The minimum production cache per venue should include: id, name, western name, category, indoor/outdoor, exact coordinate, official site, phone, address, opening/season/price fields, facilities, parking candidates, three vetted images, source URLs, and last-updated timestamp.
