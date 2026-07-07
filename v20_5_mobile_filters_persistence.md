# v20.7.0 mobile order and search lock

## Goal
Make DipMapper usable as a phone-first swim finder.

## Mobile order
1. Selection and input block.
2. Anchored sticky map.
3. Two-column table below the map:
   - left: type and feature filters
   - right: compact top findings

## Compact findings
Each result keeps only the minimum decision payload on mobile:
- thumbnail
- name
- distance and type
- explicit Open button

## Search stability
The visible result set locks after 10 seconds. Background network calls cannot keep flickering the list or map after that visible cutoff. A new location, radius change or destination search resets the search lifecycle.

## Design rules
One font family, three font sizes, reduced bolding, mobile first.
