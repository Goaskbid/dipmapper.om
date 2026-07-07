# DipMapper v20.4.0 interaction hardening

This build fixes the main usability regression from v20.3.0.

## Problem
The result card CSS disabled pointer events on every child inside a result card. This made the explicit Open button unreliable because taps could target the parent article instead of the button.

## Fix
- The Open button now has explicit pointer events enabled.
- Result cards no longer behave as tap targets.
- Mobile scroll movement blocks card opening for a short guard window.
- Numbered map markers use direct card opening and do not depend on list state.
- Escape and Close return the app to a clickable state.

## Validation target
A user must be able to scroll the result list, tap Open, close the card, repeat that flow across multiple venues, and tap numbered map markers without refreshing the page.
