# Ritmo — Interactive CRM Prototype V1

HTML, CSS, and JavaScript sales-training prototype with no runtime dependencies,
backend, authentication, external APIs, or build step.

## Preview on Windows (no build or server required)

1. On GitHub, select `prototype/ritmo-crm-v1`, then choose **Code → Download ZIP**.
2. Right-click the downloaded ZIP and choose **Extract All**. Do not open the page
   inside the ZIP preview.
3. In the extracted project folder, open `index.html` in Microsoft Edge. Keep the
   `src/` and `assets/` folders beside it.
4. Select Maya Patel, Daniel Brooks, or Renee Alvarez, then choose **Join Call**.

The scripts now use classic JavaScript loaded in dependency order, so startup
no longer depends on ES-module loading or a local web server. No Python, Node.js,
npm, package installation, application rebuild, or internet connection is needed
for the direct-file preview. Artwork and fonts remain bundled locally.

### Optional local server

If your browser's organization policy prevents local-file pages, or you prefer
HTTP development, open PowerShell in this project folder and run with Python 3:

```powershell
py -m http.server 8000 --bind 127.0.0.1
```

Then open `http://localhost:8000`. If `py` is unavailable but `python --version`
reports Python 3, use `python -m http.server 8000 --bind 127.0.0.1` instead.
On macOS/Linux use `python3 -m http.server 8000 --bind 127.0.0.1`.
Keep the terminal open while previewing; press Ctrl+C to stop the server.

### Why the cards were blank

The original page used `<script type="module">`. Direct-file browser security
blocks that module load, so the JavaScript that creates the cards never executes,
while the static header, pipeline, and artwork still appear. The existing data,
state logic, and UI now load as three ordered classic scripts, isolated in function
scopes and sharing a small `window.Ritmo` namespace. The visual design is unchanged.

HTTP and opaque-origin startup regression tests pass in Chromium. Native Windows
Edge `file://` testing is not available in the cloud environment: its managed
browser blocks all file URLs. See `docs/validation.md` for the exact coverage.

## Approved artwork

The original office illustration is bundled unchanged at
`assets/ritmo-office-background.png`, extracted from the supplied Ritmo Office.zip.
The composition follows the supplied CRM and style-guide references, using real
HTML text and locally bundled fonts. The laptop casing is a CSS approximation;
the office illustration is the original image, not a recreation.

## Demo

- A manager notification arrives shortly after startup.
- The header clock follows the viewer's local browser time.
- Click a prospect, or Tab to a card and press Enter/Space, to view their details.
- Join Call transitions to a local placeholder for the selected prospect.
- Return to CRM resets selection and returns focus to the prospect card.
- Escape, the close button, or clicking outside the panel closes prospect details.
- Dialog focus stays inside the panel; the dashboard is inert while it is open.
- Reduced-motion preferences remove animation and the transition delay.

The composition uses a 1280 × 720 stage scaled proportionally into the viewport.
Small phones retain the full composition at smaller text sizes; this prototype is
intended primarily for desktop training and Storyline's landscape player.
The laptop framing is HTML/CSS; all CRM copy is real, selectable HTML.

## Files

- `src/customers.js`: supplied customer content and stable IDs.
- `src/session.js`: local customer selection, handoff, and reset state.
- `src/main.js`: UI, clock, focus management, and local state-change events.
- `src/styles.css`: composition, typography, transitions, and accessibility styles.
- `assets/fonts/`: local Fontsource Inter 400/600 and Montserrat 700, version 5.3.0,
  with accompanying font licenses.
- `docs/storyline.md`: proposed host integration contract.
- `docs/validation.md`: completed checks and limitations.

No Storyline player integration or AI integration is implemented. The handoff
screen never starts a real call. Reusable customer data and session logic can
support later positive/negative conclusions without coupling them to this layout.
