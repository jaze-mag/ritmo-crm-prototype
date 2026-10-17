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

All three customer cards open the same accessible brief component, populated from
`src/customers.js`. Each brief includes its approved portrait, difficulty, profile,
knowledge, goals, and status indicators. The workstation and live CRM remain
mounted and visible beneath a transparent dark-teal overlay. No office-entrance
image is loaded. Solid cream and teal panels keep foreground text readable.

- **Back to Customers** or Escape closes the brief without reloading the CRM,
  preserves the selected card, and restores keyboard focus.
- **Call This Prospect** runs the existing pulse animation for 1.5 seconds with
  “Connecting with [Customer Name]...” on a dark-teal panel.
- The handoff reads “Ready to Speak with [Customer Name]” and “Your customer
  conversation is ready.” It is a local placeholder, not a live AI connection.
- **Return to CRM** resets the call selection and focuses the original card.
- The clock, card hover effects, and animated manager notification are preserved.

Modal focus stays within its controls; the background is inert while open.
Reduced motion removes animation and the call delay. Noninteractive interface
text uses an arrow cursor and cannot be highlighted. Buttons use a pointer.
Text inputs, textareas, and future editable fields retain editing and selection.

## Artwork and composition

The original workstation/laptop image is unchanged. Its flattened screen is
clipped out and replaced by the existing HTML CRM. Each supplied brief PNG is
stored unchanged; CSS displays only its portrait area, never its baked text or
buttons. All three customer ZIPs are incorporated. See assets/README.md for sources.

The 1280 × 720 composition scales proportionally into the viewport. Desktop and
landscape Storyline playback are the intended uses; phone-sized windows display
the same composition at smaller text sizes. No new art has been generated.

## Structure

- `src/customers.js`: shared profiles, knowledge, goals, and portrait metadata.
- `src/session.js`: selection, brief, connection, and handoff state.
- `src/main.js`: shared rendering, focus management, clock, and state-change events.
- `src/styles.css`: existing composition, modal, cursor rules, and motion styles.
- `assets/fonts/`: bundled Inter/Montserrat WOFF2 files and licenses.
- `docs/validation.md`: browser checks and their limits.
- `docs/storyline.md`: the future Web Object communication boundary.

No Storyline player API, Devlin AI integration, or fake conversation is implemented.
