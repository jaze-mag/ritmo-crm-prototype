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

## Brief rendering investigation — 2026-10-18

The image source is 1280 × 720; the approved visible brief is 960 × 540 at
(x=160, y=90) in the 1280 × 720 stage. All brief edges are integer-aligned at
this viewport. The stage has an identity scale matrix; neither the brief nor
its image has another transform, filter, backdrop filter, or `will-change` hint.
The image uses normal browser interpolation (`image-rendering: auto`). Text in
the PNG is downsampled along with the artwork, unlike the live dashboard text.
No clean text-free brief artwork is available. Native asset detail cannot be
restored by CSS without replacing the text-bearing artwork.

The opacity fade previously used `animation-fill-mode: both`, leaving a finished
opacity effect attached after entry. Changed only this brief animation to
`backwards`: the same 260ms fade runs, then its effect is released and the normal
fully opaque style applies. This avoids retaining animation-related compositing;
it does not change layout, image sizing, interpolation, fonts, or hover effects.
An initial before/after Chromium screenshot comparison differed in only 147 of
518,400 pixels and showed no material improvement in raster text. Consequently
this change is a rendering-lifecycle correction, not a claim that the PNG text
now matches live HTML typography. The reported intermittent loss of sharpness
was not reproduced as a continuing idle effect in this browser.

`tests/clarity.cjs` inspects initial/mid-fade geometry and opacity, confirms the
animation is released, and compares screenshots after settling, idling, hovering
both buttons, and closing/reopening after switching through all three customers.
It runs at 1280 × 720 with device pixel ratios 1 and 2. Text-free export requirements
remain in assets/README.md. No image editing, masking, duplicate text, font
smoothing overrides, or pixelated image interpolation was introduced.

All four suites passed: clarity (DPR 1 and 2), full browser journeys,
notification persistence, and opaque-origin startup. The new screenshot check
initially sampled the Back button during its outgoing hover transition; waiting
for that transition produced identical idle/reopen pixels. The startup harness
also exposed a pre-existing test isolation problem: replacing a running host app
with an iframe left its timers accessing removed DOM nodes. The host now serves
an empty same-origin test page before inserting the sandboxed app; application
logic is unchanged. Native Windows Edge and its reported intermittent rendering
behavior were not tested directly in this Linux Chromium environment.

## Laptop display integration — 2026-10-18

Matched the workstation image's display cutout to the live screen's rounded
corners (4px top, 2px bottom). The screen retains its exact bounds: x=210, y=77,
width=867, height=518 within the 1280 × 720 stage. A pointer-transparent pseudo
layer adds a 1px translucent inner edge and a restrained 2px-offset/4px-blur inset
shadow. Local stacking isolation keeps that edge above dashboard/connection/
handoff content and below the existing separate brief overlays. No content
padding, border width, fonts, UI colors, artwork, or application logic changed.

A before/after dashboard comparison with the clock hidden found differences only
within (210,77)–(1077,595); the interior excluding an 8px edge margin was pixel
identical. Dashboard, brief, connection, and handoff screenshots were reviewed.
Brief placement remains the approved stage overlay, rather than being resized
into the laptop. Added display-boundary and non-intercepting edge assertions to
the existing journey tests; handoff bounds are checked after its existing entry
animation settles (overflow clips the animation while moving).

Passed the full Chromium journey suite for all three customers, notification
session regression tests, and brief rendering stability tests at DPR 1 and 2.
This includes keyboard focus, hover, reduced motion, responsive layouts, call
transitions, return navigation, and no failed/external asset requests. Native
Windows Edge was not tested in this environment.

## Pre-call button hover colors — 2026-10-21

Both shared brief hotspots now use #79AAA5 background, #F4E7C8 label text,
and #315C59 border on hover and keyboard focus. The opaque settled overlay
covers the original PNG label; leaving hover/focus restores the original image.
Geometry, border width, fonts, opacity timing, focus ring, and all PNGs are
unchanged. This affects both buttons for Maya, Daniel, and Renee.

The explicitly requested cream/teal pairing has approximately 2.11:1 text contrast,
below WCAG AA's 4.5:1 requirement for normal text. It matches the requested style
guide but is not a contrast-compliance fix. No alternate palette was substituted.

Browser checks verify exact hover fill/text/border values, cream keyboard-focus
labels, hotspot alignment, default-state restoration, all customer navigation,
notification persistence, and brief rendering stability. Public URL access is
blocked by this environment's proxy (CONNECT 403), so local browser checks do
not establish that GitHub Pages has finished deploying or validate Windows Edge.

## Brief image readiness and handoff button — 2026-10-23

Cause: the shared image's src changed immediately before the brief was shown.
Browsers can retain the old decoded bitmap while fetching/decoding a new src.
The brief now stays hidden while a fresh off-DOM image decodes, then updates
artwork and accessible content together before the existing fade begins. A
request counter invalidates older loads on reselection or return; Escape can
cancel a pending load. Return clears the old image src and descriptive text.
Failed image decoding leaves the CRM usable, announces the failure, and allows
retry. Call actions cannot start while the brief is still pending or hidden.

The shared Return to CRM button alone receives an inset dark-teal border without
changing its dimensions. Hover/focus uses #79AAA5 fill and #F4E7C8 text; default
remains #EFAE87 with #315C59 text. Existing focus outline remains. As previously
noted, the requested cream/teal pair has 2.11:1 contrast, not WCAG AA normal-text
contrast compliance.

`tests/brief-loading.cjs` repeats all six requested customer sequences twice,
artificially delays decoding, resolves requests out of order, samples each
animation frame for decoded-image/customer identity, and checks cancellation,
failure, and retry. Existing browser tests also check all three handoffs' default,
hover, inset border, mouse-leave restoration, and click/keyboard return behavior.
Tests that previously assumed synchronous brief opening now wait for visibility.
The separate brief rendering tests retain their initial/mid-fade checks.

Passed: all five Chromium suites (full journeys, notifications, classic-script
startup, rendering stability at DPR 1/2, and delayed brief loading). Additional
keyboard checks confirmed cream focus text, visible focus, and Enter-to-return
for all three handoffs. Public-site requests still fail at the environment proxy
with CONNECT 403; actual GitHub Pages completion and Windows Edge cannot be
verified here.

## Stable brief-button labels — 2026-10-23

The perceived text enlargement came from crossfading the baked PNG label into a
separate live Inter label. Both brief buttons now keep the same live label and
opaque background in all states. Only fill, text, and border colors transition;
there is no label opacity swap, scale, or font change. Default Back remains cream,
Call remains peach, and both use dark-teal default text. The approved teal/cream
hover palette and keyboard focus ring remain. PNG assets, hotspot coordinates,
brief dimensions, and navigation logic are unchanged. The known contrast
limitation of the requested cream/teal palette still applies.

Passed the full three-customer journey suite, delayed-image switching regression,
and rendering stability at DPR 1 and 2. Assertions check the same 15px live label
in default/hover states at 1280 × 720, correct default colors on pointer exit,
hotspot alignment, keyboard focus, and navigation. Default/hover screenshots
were reviewed. Public deployment verification remains subject to network access.
