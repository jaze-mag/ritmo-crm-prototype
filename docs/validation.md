# Validation

Browser: headless system Chromium, automated through Playwright (tooling installed
outside the project). Application runtime has no npm dependency.

Checked:
- All three prospects render the supplied name, company, role, difficulty, and context.
- Keyboard activation and pointer clicks open details.
- Modal Tab/Shift+Tab loop, Escape, close button, and focus restoration.
- Selection, Join Call, selected-customer handoff, and return/reset for all prospects.
- Three corresponding handoff state events.
- Manager notification appears after startup.
- Local clock datetime changes over time.
- Bundled Inter and Montserrat fonts load.
- Reduced-motion mode disables the detail animation.
- Stage fits 1280 × 720, 640 × 360, 390 × 844, and 1920 × 1080 viewports.
- No uncaught JavaScript errors or external network requests during the demo.

Limitations:
- The original office PNG is bundled unchanged; its load and 1280 × 720
  composition were checked in Chromium.
- Laptop casing is an HTML/CSS approximation of the reference laptop.
- No Storyline/LMS published package or cross-browser testing has been performed.
- No live calls, backend, AI services, or player API integration are implemented.

## Re-run browser checks

With the app server running on port 8000 and system Chromium installed:

```sh
npm install --prefix /tmp/ritmo-tools --cache /tmp/ritmo-npm playwright --no-audit --no-fund
NODE_PATH=/tmp/ritmo-tools/node_modules node tests/browser.cjs
NODE_PATH=/tmp/ritmo-tools/node_modules node tests/startup.cjs
```

Screenshots are written under /tmp/ritmo-*.png. This tooling is development-only
and is not included in the Web Object package.


## Direct-file startup fix

Before the fix, an opaque-origin sandboxed frame reproduced the module CORS error:
main.js was blocked from origin `null`, leaving no customer cards. The original
application used ES modules, which also require CORS checks when loaded via file://.

After the fix, the same frame loads all three classic scripts and passes customer
selection, Join Call, and return/reset for every prospect. The regular HTTP suite
also passes. tests/startup.cjs guards against reintroducing module-only startup.
Fonts in the HTTP opaque-origin frame are subject to separate CORS restrictions;
font loading is checked in the normal HTTP suite. The frame test verifies script
startup and interactions, not native file-font behavior.

Native file:// navigation was attempted, but this cloud browser's administrative
URL policy blocks file URLs (ERR_BLOCKED_BY_ADMINISTRATOR). That policy was not
changed or bypassed. Windows Edge direct-file behavior still needs a local check;
no Windows Edge test is claimed. Extract the ZIP, open index.html, and verify all
three cards, Join Call, and Return to CRM without a local server.
