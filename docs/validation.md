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
```

Screenshots are written under /tmp/ritmo-*.png. This tooling is development-only
and is not included in the Web Object package.
