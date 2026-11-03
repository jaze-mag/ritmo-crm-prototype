# Maya — Animated Negative Consequence

This is an independent, local-first preview. It is not connected to Devlin AI,
customer routing, or a real calendar. No existing CRM flow is changed.

## Open or package

Open this folder's `index.html` in a modern browser. No build step or web server
is required. Keep `index.html`, `styles.css`, `animation.js`, and the entire
`assets` folder together. To package a Storyline Web Object, copy this entire
`negative-consequence` folder and select it as the local Web Object folder in
Storyline. Publish and test the resulting Storyline project in its intended
player; that player integration has not been tested here.

GitHub Pages preview (after deployment):
https://jaze-mag.github.io/ritmo-crm-prototype/negative-consequence/

The scene is 1280 × 720 and scales proportionally with letterboxing when needed.
All runtime resources are relative and live inside this folder. There are no
CDNs, external calls, analytics, authentication, audio files, or package dependencies.
The original `Negative Consequence.png` export is included unchanged; local Inter Regular/SemiBold, Montserrat Bold, and their licenses are included
for the live interface and controls.

## Sequence and controls

Playback starts after the image is decoded:

- 0–0.5s: the CRM display fades in; the office and laptop remain visible.
- 0.5–1.5s: Follow-up Needed appears with a restrained peach emphasis.
- 1.5–2.5s: Discovery → At Risk is revealed and emphasized.
- 2.5–3.5s: the demo follow-up status appears and Not Sent is emphasized.
- 3.5–4.5s: Maya's original response is revealed.

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
window.RitmoNegative.play();       // false when loading or already playing
window.RitmoNegative.replay();     // same guarded restart behavior
window.RitmoNegative.skip();       // finishes a currently playing run
window.RitmoNegative.continue();   // acknowledges once, only after completion
window.RitmoNegative.getState();   // { state, continued }

window.addEventListener('ritmo:negative-continue', event => {
  // event.detail = { customerId: 'maya-patel', outcome: 'at-risk' }
  // A future verified adapter can choose what happens next.
});
window.addEventListener('ritmo:negative-statechange', event => {
  // event.detail = { state, customerId: 'maya-patel' }
});
```

These are local CustomEvents, not cross-window messages. There is no `GetPlayer`,
`postMessage`, origin bypass, or unverified integration. A later Storyline adapter
can wrap this boundary with validated messaging if required. Do not route a real
customer outcome to this screen until that outcome integration is implemented.

## Rendering technique

The supplied image is retained unchanged for the office and laptop. Its entire
flattened display region is excluded with a proportional CSS clip; matching
HTML/CSS panels and local-font text occupy the same display
bounds. No raster lettering remains beneath the live text. The 1280 × 720
reference composition and original device positions are preserved.

Responsive layout uses container-relative CSS dimensions instead of transforming
a 1280px bitmap layer. Text therefore renders at the actual
viewport/device-pixel density. The office illustration itself is still the
original 1280 × 720 raster export; a higher-resolution original would be needed
for extra illustration detail on larger displays. No sharpening filter, blur,
text scaling animation, or permanent GPU hint is applied.

The stage emphasis animates only the color of the inline words and arrow. Its
parent card and line never move, scale, or receive a rectangular highlight.
Playback retains the original sequence and controls. All effects are cancelled
on completion or Skip, leaving normal fully opaque HTML. Local fonts and artwork
finish loading before playback starts to avoid font swaps during animation.
