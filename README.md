# Ritmo — Interactive CRM Prototype V1

HTML, CSS, and JavaScript sales-training prototype with no runtime dependencies,
backend, authentication, external APIs, or build step.

## Run

From this repository:

```sh
python3 -m http.server 8000 --bind 0.0.0.0
```

Open port 8000 in a local browser. Stop with Ctrl+C. Use HTTP rather than opening
index.html directly: browser ES modules require a server.

## Preview on Windows (no build required)

1. On GitHub, select the prototype branch, then choose **Code → Download ZIP**.
2. Right-click the downloaded ZIP and choose **Extract All**.
3. Open the extracted project folder containing `index.html`. In File Explorer's
   address bar, type `powershell` and press Enter.
4. With Python 3 installed, run:

   ```powershell
   py -m http.server 8000 --bind 127.0.0.1
   ```

   If the Python launcher is unavailable but `python --version` reports Python 3,
   use `python -m http.server 8000 --bind 127.0.0.1` instead.
5. Open your browser and enter `http://localhost:8000`.
6. Keep PowerShell open while previewing; press Ctrl+C to stop the server.

If Python is not installed, install Python 3 for Windows first. No Node.js, npm,
package installation, or application rebuild is required. Do not double-click
`index.html`; its JavaScript modules need the local HTTP server. The included
artwork and fonts load locally, so the running prototype needs no internet access.

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
