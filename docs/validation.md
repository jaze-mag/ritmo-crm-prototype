# V2 validation

Browser: system Chromium through Playwright. No runtime npm dependencies.

## Passed checks

For Maya, Daniel, and Renee independently:

- Card opens the one shared brief with the correct name, role, company, challenge,
  five knowledge/goal information in the screen-reader summary and the correct complete
  approved PNG; no duplicate visible HTML text or buttons.
- Original workstation and dashboard remain visible and mounted beneath the modal.
- The dashboard is inert; background cards cannot receive keyboard focus.
- Initial heading focus, Tab/Shift+Tab containment, Escape, Back to Customers, and
  focus restoration work. Every return clears selection. Pointer returns focus
  the neutral heading without card outlines; keyboard returns keep card focus.
- Call This Prospect uses the correct dynamic connection headline and supporting
  text, with the original pulse motion and one 1.5-second delay.
- Duplicate connection clicks and attempted prospect switching cannot create a
  second connection or change the in-progress customer.
- Correct dynamic handoff headline, supporting copy, and Return to CRM behavior.
- Complete image fits 1280 × 720 without cropping or stretching; the 16:9 ratio
  and hotspot alignment are preserved at 640 × 360 and 390 × 844.

Shared checks:

- Before/after CRM screenshots were pixel-identical with the live clock masked and
  matching reduced-motion settings. Workstation and local font assets are unchanged.
- Clock continues ticking; notification appears; existing card hover motion remains.
- Pointer cursors on cards/buttons, arrow cursor and no selection on display text.
- A temporary textarea accepted text and retained its text cursor and selection.
- Reduced motion removes brief animation and skips the connection delay.
- All assets load without failures, no uncaught JavaScript errors, and no external
  requests. The old office-entrance image is never requested.
- The opaque-origin regression suite passes all three brief/call/return flows;
  classic-script startup remains independent of ES-module CORS loading.
- All three uploaded ZIPs passed integrity checks; bundled brief PNGs match their
  ZIP entries byte for byte. Full-size brief, connection, and handoff screenshots
  were visually inspected.

## Run tests

Start the app server on port 8000. With system Chromium installed:

```sh
npm install --prefix /tmp/ritmo-tools --cache /tmp/ritmo-npm playwright --no-audit --no-fund
NODE_PATH=/tmp/ritmo-tools/node_modules node tests/browser.cjs
NODE_PATH=/tmp/ritmo-tools/node_modules node tests/startup.cjs
```

`CHROMIUM_PATH` can select a compatible browser executable. Screenshots are written
to /tmp/ritmo-*.png. The optional comparison in browser.cjs uses /tmp/ritmo-before.png
if present; the recorded baseline came from commit 3ec54ce before these edits.
Test tooling is installed outside the repository and is not packaged for runtime.

## Limits

Native Windows Edge/file:// testing and Storyline/LMS playback are not verified
here. The cloud browser restricts file URL navigation; the opaque-origin test
checks script loading and interactions, not every native-file behavior. Portrait
font CORS restrictions inside that sandbox are separate; fonts load and are tested
in the normal HTTP suite.

The fixed composition scales down on phones rather than reflowing, so text becomes
smaller. No live AI call, Devlin AI integration, or Storyline player API is claimed.


## Final visual-fidelity and card-state correction

The reconstructed brief panels were replaced with the original full PNGs.
Both invisible hotspots match their source button coordinates within 0.1 pixels
in the original full-size implementation and retain the same relative coordinates
when scaled. The current 75% size is covered by the polish checks below. They expose
accessible names and a focus ring only when keyboard focus requires one.

Before the 75% polish, screenshots for all three full-size briefs were compared
against their PNG source pixels.
Every fully opaque source pixel matches exactly at 1280 × 720 after the fade.
Original transparent/antialiased corners naturally composite over the underlying
scene. Removing the stage's extra rounded clipping while the modal is open avoids
trimming the PNG's own corners. No image file was changed.

The browser journeys verify zero pressed cards, no card focus ring, and no card
shadow after pointer returns and pointer movement away. A separate keyboard-only
return verifies focus and :focus-visible on the originating card. Existing hover
motion and focus styles remain enabled; no global focus suppression was added.


## Final 75% size and hover polish

All three briefs now measure 960 × 540, centered at (160,90) in the reference
1280 × 720 stage. Width uses proportional CSS sizing with a native-resolution cap,
not an additional scale transform. The original 16:9 aspect ratio and contain
rendering are preserved; source images and workstation artwork remain unchanged.

Both hotspots were tested for light-teal (#79AAA5) hover fill, dark-teal labels,
pointer cursor, and restoration to a transparent state on pointer exit. Label
size is proportional to the image (15px on the reference canvas), with no visible
duplicate in the default state. Keyboard focus indicators remain enabled.

The full customer journey suite and opaque-origin startup suite passed after the
change. Tests cover centered sizing and hotspot positions at 1280 × 720,
640 × 360, 390 × 844, and 2560 × 1440. The large viewport check confirms that the
image never exceeds 1280 × 720. Default and hover screenshots were inspected;
25% reduction was retained without adjustment. Return-to-CRM card state, clock,
notification, hover motion, reduced motion, and no-external-request checks pass.

## Manager notification session polish — 2026-10-18

Passed `tests/notification.cjs`, `tests/browser.cjs`, and `tests/startup.cjs`
using Playwright 1.56.1 and system Chromium over the local HTTP server.
Notification checks cover each customer as the first selection, complete
brief/back/call/return journeys, refresh persistence, fresh-session appearance,
early selection before the entrance timer, and denied-storage fallback. Hidden
means the element has `hidden` and computed `display: none`.

The full journey suite checks all three briefs at 960 × 540 centered within
1280 × 720, responsive sizing, teal button hover, keyboard focus/trapping,
Escape/back, dynamic handoffs, reduced motion, clock, card reset, and absence of
failed/external requests. Reviewed all three brief screenshots: no notification
is visible behind or around the briefs. No CSS, HTML, fonts, or artwork changed.
The optional old baseline PNG comparison was not run because that temporary
baseline was absent in this environment. Native Windows Edge/file-URL testing
was not performed; classic-script opaque-origin startup passed.

Text sharpening was intentionally deferred: the three supplied archives contain
only flattened, text-bearing PNGs. Existing PNG text, composition, and live hover
labels remain unchanged. No masking or overlapping text was introduced. Exact
text-free export requirements are documented in assets/README.md.
