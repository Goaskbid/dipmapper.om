# v20.7.0 Space and Map Layout Pass

## Goal
Use screen space better, keep the map larger and anchored, and reduce the vertical footprint of the result rail.

## Changes
- Desktop shell now uses a narrower side rail and wider map column.
- Map panel is sticky and remains anchored while browsing the result rail.
- Map height now uses the viewport and is larger on desktop.
- Result list is intentionally shorter and scrollable, so the map remains visually dominant.
- Mobile filters are shown in a two-column grid so all options remain visible instead of being cut off.
- Phone layout keeps the map first, sticky, and large enough for meaningful tapping.

## Validation expectation
- The map should remain visible while the user scrolls the results.
- Filters should show all options on mobile.
- Result rail should not consume the full vertical page.
