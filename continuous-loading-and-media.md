# Continuous loading and media hydration - v18.4.0

## Goal

The user should see a local top list quickly and the app should continue improving in the background.

## Current behavior

- The visible ranking appears as soon as seeded or live candidates exist.
- The app continues to hydrate media, parking and details after initial render.
- Ranking hero photos use `photoForRank`, which prevents the same image fingerprint from appearing twice in the visible list.
- Photo decks inside travel cards remain stable while a user browses.
- Parking prefetch runs for the visible top results.

## Remaining issue

Production-quality photos require curated media caches. The client should not fake images from unrelated places.
