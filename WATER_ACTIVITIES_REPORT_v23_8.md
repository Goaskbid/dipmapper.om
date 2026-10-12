# DipMapper 23.8: About DipMapper, with the Founder Interview

**Version 23.8.0, 11 October 2026.** The start page now has an **About DipMapper** section with the interview with Torsten Sauter and the three photos you sent. Everything from 23.7 is included and was audited again.

## 1. The About section

- **Where:** at the end of the start page, after the swim and water-sports guides, on phones and PCs. On a PC, the new **About** button in the header (next to "How it works") jumps straight to it.
- **Layout:** a magazine layout in the site's own style.
  - Headline: *"A good place to swim should be easier to find."*, with the standfirst below it.
  - **Your portrait** beside the introduction, captioned "Torsten Sauter, founder of DipMapper."
  - A pull quote.
  - **The pool photo** beside the question about beaches, lake baths, pools and thermal baths, captioned *"Pool, lake or sea: the right choice depends on the day, the weather and who is coming along."*
  - **The beach photo with the electric board** beside the question about water sports, captioned *"An afternoon by the water can involve more than a swim."*
- **Length:** the first three questions are always shown. The other twelve open with **Read the full interview** and close with **Show less**, so the start page stays short. This works without any script.
- **Text:** your interview, word for word. Removed were only leftover editing marks: stray "DipMapper" and "Pasted markdown" tags, and the photo instructions in brackets.
- **Update note:** the interview says that "for now" DipMapper is about swimming. Since Paddle, Dive, Sail, Boats, Rafting and Specials are now live, a short note marked **"Update, October 2026"** follows that answer. Torsten's words were not changed.
- **Photos are built into the page.** In the first 23.8 delivery they were three separate files next to `index.html`, so the HTML on its own showed empty frames. That is the problem you saw. Now they are inside `index.html` itself (WebP, 26–86 KB each instead of 1.0–4.9 MB, hidden file data such as location removed). The page shows them wherever it is opened, and there are no extra files to upload.
- **SEO:** the founder is now named in the site's structured data for search engines, with a link to the About section. The section's text is in the page from the start, also behind "Read the full interview", so search engines read all of it.
- **Captions name no place**, because I don't know where the pool and beach photos were taken and won't invent it. If you tell me the places, I'll add them.

![PC: the About section with the portrait beside the introduction](../images/d_about.png)

![Phone: the About section](../images/p_about.png)

## 2. Re-audit

- All 23.7 repairs are unchanged and pass again (map clutter, Specials, divers' section, boat fuel, seasons, water body, phone map buttons).
- **New test, `about-standalone`:** opens `index.html` straight from disk with no network at all and requires all 3 photos to show. It fails on the first 23.8 build and passes now.
- **Loss check against 23.6 and 23.7:** every page element, function, legal link, header button, guide link and meta tag of 23.6 is still there (0 lost). The data is unchanged: 36 directory entries, 80 Specials, 34 hand-written descriptions, 46 countries' emergency numbers, 39 sourced rules and 6 city packs. All other website files are byte-identical to the 23.6 delivery.
- **One check failed once in the full run: `close-desktop`.** It opens a swim card and clicks Close 0.25 s later. Logging showed why:
  - The card slides in for about 0.4 s. Sometimes it was still moving when the test measured the Close button.
  - By the time the click landed, the button had moved 39 px, so the click hit the empty header beside it.
  - The slide-in timing is the same in 23.6, 23.7 and 23.8, and Close itself always worked.
  - The test now waits until the card has stopped moving, as a person would, and still clicks immediately after that.
  - Results: 0 failures in 35 repeated runs (25 on PC, 10 on phone), and 10 of 10 passes for both close checks.
- **New test, `about` (phone and PC):** the section is visible, all 3 photos load with alt texts and no missing files, 3 questions show before and 15 after opening, it closes again, the header button reaches it, nothing sticks out sideways, and there are no page errors.
- **Data audit:** 0 errors, 5 notes (unchanged, decided in 23.7).

## Tests (actual results)

**Full suite on the delivered file, run one check at a time: 59 of 59 passed.** That is the 56 checks from 23.7 plus `about-phone`, `about-desktop` and `about-standalone`, run on the exact file in `website/index.html`.

- **First-time-user journey** on phones (390 and 375 px) and PC: 0 issues, 0 page errors.
- **About section:** 3 of 3 photos load, 3 questions show before and 15 after "Read the full interview", it closes again, the header button reaches it, and nothing sticks out sideways.

**Not testable here:** the real map, photo, weather, Wikipedia and OpenStreetMap services can't be reached from this workspace. After uploading, please check two things on your phone: the About section with the three photos, and one lakeside place in Zürich (e.g. Bootsvermietung Enge in Paddle) whose Water tile should say Lake Zurich.
