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
at 1280 × 720 and retain the same relative coordinates when scaled. They expose
accessible names and a focus ring only when keyboard focus requires one.

Screenshots for all three briefs were compared against their PNG source pixels.
Every fully opaque source pixel matches exactly at 1280 × 720 after the fade.
Original transparent/antialiased corners naturally composite over the underlying
scene. Removing the stage's extra rounded clipping while the modal is open avoids
trimming the PNG's own corners. No image file was changed.

The browser journeys verify zero pressed cards, no card focus ring, and no card
shadow after pointer returns and pointer movement away. A separate keyboard-only
return verifies focus and :focus-visible on the originating card. Existing hover
motion and focus styles remain enabled; no global focus suppression was added.
