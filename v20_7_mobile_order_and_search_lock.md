# Result clicks and user copy - v18.5.0

The ranking note now explains what users can do instead of describing internal photo or hydration behavior.

Result cards use delegated `pointerdown` handling on the results container. This opens the travel card immediately, before active background search rerenders can swallow a normal click event.

The app still updates results, photos, parking and details in the background while a user browses.
