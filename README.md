# Ritmo Sales Conversations — CRM V2

An interactive HTML/CSS/JavaScript training prototype with three customer briefs,
local approved artwork and fonts, and no runtime dependencies or build step.
V1 remains preserved on `prototype/ritmo-crm-v1`.

## Preview on Windows

1. On GitHub, select `prototype/ritmo-crm-v2`, then **Code → Download ZIP**.
2. Right-click the ZIP and choose **Extract All** into a new folder.
3. Open the extracted `index.html` in Edge. Keep `src/` and `assets/` beside it.
4. Choose any prospect, review the brief, and select **Call This Prospect**.

Classic scripts load in order, preserving direct-file compatibility. No npm,
Python, build, backend, or internet connection is required for this preview.
Native Windows Edge testing is unavailable in the cloud; see docs/validation.md.

If your browser restricts local files, optionally serve the folder with Python 3:

```powershell
py -m http.server 8000 --bind 127.0.0.1
```

Open `http://localhost:8000`. Use `python` instead of `py` if appropriate; macOS/Linux
can use `python3`. Keep the terminal open; Ctrl+C stops the server.

## Interaction flow

All three customer cards open the same accessible modal, displaying the complete,
original customer-specific 1280 × 720 PNG. Its own background, typography, portrait,
panels, and rendered buttons are preserved unchanged. No visible HTML panels or
text are reconstructed on top. Two transparent semantic button hotspots align
with the illustrated buttons and scale with the image in one 16:9 container.
Briefs use 75% of the stage width (960 × 540 at 1280 × 720), stay centered,
and never display above their native 1280 × 720 resolution. Both hotspots turn
light teal on hover or keyboard focus, with a matching readable label shown only
during that state. The original baked buttons remain untouched in the default state.
The original CRM remains mounted and inert beneath the modal.

- **Back to Customers** or Escape closes the brief without reloading the CRM and
  clears the selection. Pointer users receive neutral focus on the dashboard
  heading; keyboard users return to their card with a visible focus indicator.
- **Call This Prospect** runs the existing pulse animation for 1.5 seconds with
  “Connecting with [Customer Name]...” on a dark-teal panel.
- The handoff reads “Ready to Speak with [Customer Name]” and “Your customer
  conversation is ready.” It is a local placeholder, not a live AI connection.
- **Return to CRM** clears every selected-card state. Pointer returns have no
  persistent card border; keyboard returns preserve accessible card focus.
- The clock, card hover effects, and animated manager notification are preserved.

Modal focus stays within its controls; the background is inert while open.
Hotspots have accessible names and visible keyboard focus rings. A visually hidden
brief summary provides the customer information to screen readers.
Reduced motion removes animation and the call delay. Noninteractive interface
text uses an arrow cursor and cannot be highlighted. Buttons use a pointer.
Text inputs, textareas, and future editable fields retain editing and selection.

## Artwork and composition

The original workstation/laptop image is unchanged. Its flattened screen is
clipped out and replaced by the existing HTML CRM. Each supplied brief PNG is
stored and displayed unchanged as a complete composition, including its baked
text and buttons. Transparent hotspots supply the interaction. All three customer ZIPs are incorporated. See assets/README.md for sources.

The 1280 × 720 composition scales proportionally into the viewport. Desktop and
landscape Storyline playback are the intended uses; phone-sized windows display
the same composition at smaller text sizes. No new art has been generated.

## Structure

- `src/customers.js`: shared profiles, knowledge, goals, and full brief image paths.
- `src/session.js`: selection, brief, connection, and handoff state.
- `src/main.js`: shared rendering, focus management, clock, and state-change events.
- `src/styles.css`: existing composition, modal, cursor rules, and motion styles.
- `assets/fonts/`: bundled Inter/Montserrat WOFF2 files and licenses.
- `docs/validation.md`: browser checks and their limits.
- `docs/storyline.md`: the future Web Object communication boundary.

No Storyline player API, Devlin AI integration, or fake conversation is implemented.

## Manager message and brief typography

The original manager notification appears on first arrival. Selecting any customer
immediately hides it for the rest of the tab session, including every return to
the dashboard. Session storage preserves dismissal across refreshes when allowed;
if storage is unavailable, dismissal lasts until the page is reloaded. A fresh
independent tab/session can display the message again.

Brief text remains embedded in the approved PNGs. No clean text-free brief
exports were supplied, so no masking or duplicate HTML text has been added.
The 960 × 540 reference size, placement, artwork, and live teal hover labels are
unchanged. See `assets/README.md` for the exact exports needed for live typography.

The brief's 260ms fade releases its opacity animation when entry completes.
Its image does not scale or move during entry. This avoids retaining a finished
animation effect, but raster text still cannot match the resolution-independent
HTML text of the dashboard; the text-free exports above are needed for that.
