# v20.2.0 mobile scroll and card controls

## Goal

Mobile users must be able to scroll the result list without accidentally opening cards. When a card is open, the Close button must remain visible.

## Changes

- Result cards and map markers now record pointer/touch start position.
- A card opens only when the interaction ends as a clean tap.
- Touch movement, vertical scroll or long gestures cancel the open action.
- Result cards use `touch-action: pan-y` so vertical scrolling remains natural.
- Drawer headers are sticky with safe-area padding so Close remains visible on phones.
- The full mobile filter grid from v20.1 remains active.

## Preserved behavior

Search, map rendering, photo hydration, parking prefetch, legal pages and deployment package structure were not intentionally changed.
