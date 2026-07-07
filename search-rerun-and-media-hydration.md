# DipMapper v19.4.0 search, media and map update

## Search
- Starts with the selected radius, default 5 km.
- Map zoom follows the radius instead of the full destination pack.
- Destination packs seed the closest useful options first and merge wider choices later.
- Rhodes now centers on Rhodes Town for normal searches.
- Miami / South Beach / Key Biscayne added as a destination pack.

## Names
- Local names can show English or Latin names where OSM exposes `name:en`, `int_name`, `name:latin`, or Greek transliteration is possible.

## Photos
- Photo audit blocks more off-topic files: coast guard, migrant, police, port, cargo, garbage, documents, maps, sketches, flags and logos.
- Known destination packs use curated Commons file candidates first.
- Generic water photos are not treated as exact venue photos.

## Map
- Radius ring is drawn on the map.
- Search radius drives the initial zoom.
