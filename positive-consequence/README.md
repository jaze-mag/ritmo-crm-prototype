# Maya — Animated Positive Consequence

This is an independent, local-first preview. It is not connected to Devlin AI,
customer routing, or a real calendar. No existing CRM flow is changed.

## Open or package

Open this folder's `index.html` in a modern browser. No build step or web server
is required. Keep `index.html`, `styles.css`, `animation.js`, and the entire
`assets` folder together. To package a Storyline Web Object, copy this entire
`positive-consequence` folder and select it as the local Web Object folder in
Storyline. Publish and test the resulting Storyline project in its intended
player; that player integration has not been tested here.

GitHub Pages preview (after deployment):
https://jaze-mag.github.io/ritmo-crm-prototype/positive-consequence/

The scene is 1280 × 720 and scales proportionally with letterboxing when needed.
All runtime resources are relative and live inside this folder. There are no
CDNs, external calls, analytics, authentication, audio files, or package dependencies.
The original `Positive Consequence.png` export is included unchanged; local Inter
SemiBold and its license are included for the small interactive controls.

## Sequence and controls

Playback starts after the image is decoded:

- 0–0.5s: the CRM display fades in; the office and laptop remain visible.
- 0.5–1.5s: the scheduled badge and checkmark appear, with a brief badge highlight.
- 1.5–2.5s: Discovery → Demo Scheduled is revealed and emphasized.
- 2.5–3.5s: the calendar confirmation appears and Accepted is highlighted.
- 3.5–4.5s: Maya's original confirmation message is revealed.

The completed screen stays visible indefinitely. Skip Animation immediately
finishes the sequence. Replay restarts from the beginning after completion;
repeated play requests during playback are ignored. Continue acknowledges the
result exactly once per run and emits a local event, but does not navigate or
claim a real conversation occurred. Replay resets that acknowledgement.

Reduced-motion preference skips the sequence, including when enabled during
playback. Keyboard focus moves from Skip to Continue when Skip disappears, and
from Replay to Skip on restart. Reloading the Web Object starts a new run;
back/forward-cache restoration also restarts it. A host that retains the same
iframe when revisiting can call the replay method below.

## Future integration boundary (no parent messaging installed)

Inside this Web Object's window:

```js
window.RitmoPositive.play();       // false when loading or already playing
window.RitmoPositive.replay();     // same guarded restart behavior
window.RitmoPositive.skip();       // finishes a currently playing run
window.RitmoPositive.continue();   // acknowledges once, only after completion
window.RitmoPositive.getState();   // { state, continued }

window.addEventListener('ritmo:positive-continue', event => {
  // event.detail = { customerId: 'maya-patel', outcome: 'demo-scheduled' }
  // A future verified adapter can choose what happens next.
});
window.addEventListener('ritmo:positive-statechange', event => {
  // event.detail = { state, customerId: 'maya-patel' }
});
```

These are local CustomEvents, not cross-window messages. There is no `GetPlayer`,
`postMessage`, origin bypass, or unverified integration. A later Storyline adapter
can wrap this boundary with validated messaging if required. Do not route a real
customer outcome to this screen until that outcome integration is implemented.

## Artwork technique

The supplied export is flattened. Temporary CSS masks match its flat background
colors and reveal the existing regions; no artwork file or wording is edited.
All masks and short-lived highlight layers are removed from rendering on completion
or Skip. Apart from the header controls, the completed design is the original
image. The visible text remains raster text; the equivalent complete result is
also present as accessible HTML for screen readers.
