# DipMapper 23.8.1: Repairs After Your Phone Check

**Version 23.8.1, 11 October 2026.** You reported three problems. Here is what I found, what I repaired, and the proof.

## 1. The selection area above the map did not line up with the map (phone)

**Found:** I measured the left and right edges of the search card, the map card and the lists below, on five phone sizes (360 to 430 px), in Swim and in Paddle.
- On a 430 px phone (e.g. iPhone Pro Max) in Paddle, the search card ended **41 px before** the right edge of the map.
- In Swim on a 390 px phone, the map ended **20 px short** of the search card above it.
- The cause: on phones, each card took the width of its own content instead of the screen width, so the edges depended on what was inside. The same measurement on 23.6 shows the same offsets, so this was older than the About section. It is now repaired.

**Repaired:** on phones, the search card, the map and the lists below now always share one left and one right edge, in every mode and on every phone size.

| Phone width | Swim: search / lists / map | Paddle: search / lists / map |
|---|---|---|
| 360 px | 6–354 / 6–354 / 6–354 | 6–354 / 6–354 / 6–354 |
| 375 px | 6–369 / 6–369 / 6–369 | 6–369 / 6–369 / 6–369 |
| 390 px | 6–384 / 6–384 / 6–384 | 6–384 / 6–384 / 6–384 |
| 414 px | 6–408 / 6–408 / 6–408 | 6–408 / 6–408 / 6–408 |
| 430 px | 6–424 / 6–424 / 6–424 | 6–424 / 6–424 / 6–424 |

**New tests:** `align-phone-360` and `align-phone-430` measure every card in Swim, Paddle, Dive, Sail, Boats, Rafting, Specials and back in Swim. On the 23.6 layout the 430 px test finds 8 misaligned blocks; now both pass.

![Phone 430 px, Paddle: search card and map now share both edges](../images/p_align.png)

## 2. The third interview photo was missing

**Found:** the third photo (the beach with the electric board) was inside the part that only opened with "Read the full interview". If you didn't tap it, the photo didn't appear.

**Repaired:** the whole interview is now always open, so all three photos sit beside their questions without any tap. The "Read the full interview" button is gone; it had been added only in 23.8.0. The About section stays at the end of the page, as you wanted for SEO.

**Test:** `about-phone` and `about-desktop` now require all 15 questions and all 3 photos to be visible without any tap. `about-standalone` requires all 3 photos when the file is opened from disk with no network.

![Phone: the third photo beside the water-sports question](../images/p_about3.png)

## 3. The opening scene

**Checked:**
- The opening scene (sun, logo, "Where shall we swim today?" with the activity pills) appears in 23.8.1 exactly as in 23.6:
  - on phone and PC;
  - on a fast connection and on a slow phone connection (1.6 Mbit/s, 4× slower processor);
  - when the HTML file is opened on its own from disk.
- **Live site:** dipmapper.com shows version 23.8.0 with the interview.
- **One real difference, repaired:** the built-in About photos (about 225 KB) sat in the page *before* the start screen. On a slow connection, the opening scene then stayed about one second longer before the start screen appeared. The photos now load at the very end of the page, and the start screen sits where it was in 23.6.

| Slow phone (1.6 Mbit/s, 4× slower processor) | Opening scene appears | Opening scene ends, start screen visible |
|---|---|---|
| 23.6 | 1.7–1.8 s | 6.2–6.3 s |
| 23.8.1 | 1.7 s | 7.2–7.3 s |

The remaining second comes from the extra 225 KB of photos, which load last.

**New tests:** `opening-scene-phone` and `opening-scene-desktop` require the opening scene to appear, end, and hand over to the start screen.

If you still don't see the opening scene, please tell me the phone, the browser, and whether you opened dipmapper.com or the HTML file. I couldn't reproduce it here.

![Phone: the opening scene in 23.8.1](../images/p_opening.png)

## Tests (actual results)

**Full suite on the delivered file, run one check at a time: 63 of 63 passed.** That is the 59 checks from 23.8.0 plus the 4 new ones (phone alignment at 360 and 430 px, opening scene on phone and PC), run on the exact file in `website/index.html`.

- **Loss check against 23.6:** every page element, function, legal link, header button, guide link and meta tag is still there (0 lost).
- **First-time-user journey** on phones (390 and 375 px) and PC: 0 issues, 0 page errors.

**Not testable here:** Safari on a real iPhone can't run in this workspace. All checks run in Chromium with phone sizes and touch.
