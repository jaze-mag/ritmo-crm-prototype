# Ritmo — Maya Pre-Call Brief Prototype V2

HTML, CSS, and JavaScript sales-training prototype with no runtime dependencies,
backend, authentication, external APIs, or build step.

## V2 status

Maya's card now opens the supplied Pre-Call Brief layout and exact training copy.
Back to Customers restores the dashboard and keyboard focus. Call This Prospect
shows "Connecting to Maya Patel..." for 1.5 seconds, then "Ready to begin your
conversation with Maya." Reduced motion skips the timed animation. This is a
local prototype handoff, not a live AI connection. Daniel and Renee retain their
existing detail panels and Join Call behavior.

**Workstation artwork still pending:** the uploaded ZIPs contain flattened
mockups with baked text and controls. Maya's original portrait is now displayed
from its region in the unchanged Pre-Call Brief PNG; all surrounding text remains
HTML. The CRM still uses V1's office-entrance image. To finish the workstation
replacement, export the original Figma workstation/laptop artwork with the CRM
screen contents and manager notification hidden. The notification is baked over
the laptop in the current export, so using it as a background would leave a
permanent message behind the animated HTML notification. No substitute artwork
has been invented.

V1 remains unchanged on `prototype/ritmo-crm-v1`.

## Preview on Windows (no build or server required)

1. On GitHub, select `prototype/ritmo-crm-v2`, then choose **Code → Download ZIP**.
2. Right-click the downloaded ZIP and choose **Extract All**. Do not open the page
   inside the ZIP preview.
3. In the extracted project folder, open `index.html` in Microsoft Edge. Keep the
   `src/` and `assets/` folders beside it.
4. Select Maya Patel, then choose **CALL THIS PROSPECT** from her brief. Daniel
   and Renee retain **Join Call** in their detail panels.

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
- Click a prospect, or Tab to a card and press Enter/Space. Maya opens her brief;
  Daniel and Renee open their existing details.
- Call This Prospect (Maya) or Join Call (Daniel/Renee) transitions to the
  selected prospect’s local handoff. No second selection is required.
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
