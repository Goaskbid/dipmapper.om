# Scroll and map-card fix

Version: v19.2.1

This update fixes two interaction regressions:

1. Vertical scrolling must remain available on desktop and mobile.
2. Numbered map markers must open the same travel card as the ranking list.

Implementation details:

- Result cards use delegated `click` and keyboard handling rather than `pointerdown` with `preventDefault`.
- Map tiles have `pointer-events: none` so they cannot block marker clicks.
- Numbered marker buttons have explicit size, circle shape and pointer handling.
- Map click handling first checks for a marker, then only enters move-point logic when move mode is active.
- Mobile keeps the map sticky but lets the full page scroll naturally.
