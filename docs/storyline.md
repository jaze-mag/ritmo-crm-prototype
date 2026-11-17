# Future Storyline Web Object interface

Package index.html, src/, assets/ritmo-workstation.png, assets/fonts/, and all three
assets/references/*-precall-approved.png files together. Keep relative paths and
script order: customers.js, session.js, main.js. Python and test tools are not
runtime requirements. Use a 16:9 Web Object region; the reference stage is 1280 × 720.

## State boundary

`window.Ritmo.createSession(onChange)` creates an independent session:

- `getState()` returns immutable `{ screen, customerId }`.
- `selectCustomer(id)` validates the ID and opens `brief` for any customer.
  Selection is rejected during `connecting`.
- `closeBrief()` remains a state helper that retains selection. The current UI
  uses `returnToCRM()` for all returns to clear visual and logical selection.
- `beginCall()` enters `connecting`; requires a selection in brief.
- `joinCall()` enters `handoff`; only valid after connecting.
- `returnToCRM()` clears the selection and returns to `crm`.

The UI displays a full approved PNG with two transparent, accessible button
hotspots. An offscreen text summary supplies screen-reader content. Pointer
returns focus the neutral dashboard heading; keyboard returns focus the card.
The original dashboard stays mounted and inert during the brief.

The UI emits `ritmo:statechange` CustomEvents on its own window with that state in
`event.detail`. IDs are `maya-patel`, `daniel-brooks`, and `renee-alvarez`. Events
fire on selection, brief close, connection start, handoff arrival, and call reset.
They do not signify training completion or a successful sales outcome.

## Maya cinematic exit and parent messaging

Maya alone keeps the connecting view for 2 seconds, then the ready view for 1.5 seconds. Her ready view omits Return to CRM and the prototype disclaimer. A 700ms opacity fade then covers the entire viewport with #315C59, including letterboxing outside the laptop. The solid teal screen persists; refresh the standalone preview to start again. Reduced motion keeps the readable pauses but replaces the fade with an immediate teal screen.

Before starting Maya's call, configure the actual trusted Storyline publishing origin in the Web Object:

```js
window.Ritmo.configureSimulationParent('https://your-actual-storyline-host.example');
```

The value above is a placeholder, not a configured origin. Replace it in deployment setup with the verified scheme/host/port of the immediate parent that will listen. The default is `null` (messaging disabled). Wildcards, opaque/file origins, credentials and paths are not accepted. Call with `null` to disable again. There is no origin inference or listener for arbitrary incoming commands. For a cross-origin hosted Web Object, set this configuration in its own startup script after main.js loads; Storyline cannot directly access its JavaScript across origins.

After the fully opaque final frame, the app emits the local `ritmo:launchSimulation` CustomEvent once and, only if a trusted origin is configured and a parent frame exists, sends this payload with `window.parent.postMessage(payload, trustedOrigin)`:

```js
{ type: 'ritmo:launchSimulation', customer: 'maya', transitionComplete: true }
```

No personal information, authentication data, Devlin endpoint, or AI UI is included. The earlier `ritmo:statechange` handoff event only means the ready screen appeared; do not use it to launch the simulation. The final launch event is the completion boundary. This is a UI handoff, not a sales outcome or assessment score. Daniel and Renee retain their existing handoff/return behavior and do not send launch messages.

## Integration work still required

Configure the actual trusted parent origin. In the Storyline host, add a message listener that verifies `event.origin` equals the actual Web Object origin and `event.source` equals its iframe's `contentWindow`, checks the exact payload, and handles it once. Then connect the listener to your separately verified Storyline variables/triggers and Maya simulation slide. For nested LMS frames, the immediate parent must receive or explicitly relay the signal. No Storyline listener, player API, or navigation triggers are implemented here. Until configured, the app independently stays on teal.

Verify keyboard entry/exit, modal focus containment/restoration, local asset loads,
reduced motion, and return navigation in the actual published player. The cursor
rules explicitly allow future input/textarea/editable fields; no global key or
pointer suppression is used. Standalone navigation must remain functional if the
host integration is absent.

The manager notification dismissal is separate from customer/navigation state.
`sessionStorage` key `ritmo.managerMessageDismissed.v1` remembers dismissal in
this tab across refreshes; storage-denied contexts fall back to in-memory state.
Returning to CRM or changing customers never resets it. A future verified host
adapter can define a learning-attempt reset policy; none is assumed here.
