# Future Storyline Web Object interface

Package index.html, src/, assets/ritmo-workstation.png, assets/ritmo-rectangular-reference.png, assets/fonts/, and all three
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

## Customer cinematic exit and parent messaging

Each customer keeps the connecting view for 2 seconds, then the ready view for 3 seconds. The circular camera icon gently pulses with a soft glow (disabled for reduced motion). The ready view omits Return to CRM and the prototype disclaimer. A 700ms opacity fade then covers the entire viewport with #000000, including letterboxing outside the laptop. The solid black screen persists; refresh the standalone preview to start again. Reduced motion keeps the readable pauses but replaces the fade with an immediate black screen.

## Automatic parent connection

When embedded, the prototype sends a small `{type: 'ritmo:connect', nonce}` discovery request to **window.parent**. Only this customer-free discovery uses `'*'`. It retries once per second for up to 30 attempts. It accepts `{type: 'ritmo:ready', nonce}` only from that exact parent WindowProxy, with the matching per-load random nonce and an HTTP(S) `event.origin`. That actual responding origin becomes the target for simulation messages. Referrer, address-bar origin and guessed Review 360 domains are never used. This confirms an opt-in parent protocol listener, not the identity of Articulate as a service.

After the full black frame, the existing local event fires and one completion object is sent to the connected immediate parent:

```js
{ type: 'ritmo:launchSimulation', customer: 'maya', transitionComplete: true }
```

Customer is `maya`, `daniel`, or `renee`. No simulation data is sent using a wildcard. Duplicate ready replies cannot resend completion. If the parent is unavailable at fade completion, the object stays queued and the screen stays black; a later valid handshake sends it once. A parent can send `{type: 'ritmo:requestHandshake'}` to the known prototype origin to restart discovery even after the retry period. A fresh iframe load creates a new attempt and nonce.

`Ritmo.configureSimulationParent('https://actual-parent-origin.example')` remains an explicit override for an already-known parent; it bypasses the handshake and flushes any queued completion. Calling it with `null` explicitly disables automatic discovery and sending. Invalid origins are rejected without changing configuration. Standalone use sends no parent messages and remains on black after the cinematic exit.

## Required Storyline listener change

Run the code in [storyline-parent-handshake.js](storyline-parent-handshake.js) once in the **same immediate parent window as the existing working Storyline message listener**, before the cinematic transition if possible. Keep the current `SelectedCustomer` assignment and conditional-navigation handler unchanged. The adapter answers discovery and acknowledges receipt; it deliberately does not add another navigation handler or modify Storyline variables.

The adapter accepts only `https://jaze-mag.github.io` messages from the exact direct-child iframe whose src belongs to `/ritmo-crm-prototype/`. Replies target that exact sender origin. The existing navigation listener should likewise check the sender origin, expected iframe source, message type, valid customer and `transitionComplete === true`, and deduplicate each completed attempt.

If Review 360 puts an additional wrapper between the Web Object and the listener, installing the adapter in a higher ancestor will not work: postMessage does not bubble. Inspect the published frame tree and place/relay the handler in the immediate parent with explicit origin/source checks at each boundary. We have not verified the real Review 360 hierarchy. No automatic `window.top` broadcast or guessed host origin is implemented.

Console diagnostics use `[Ritmo messaging]` and distinguish standalone mode, configured parent, unavailable connection/queued completion, completion sent, and parent acknowledgement. An acknowledgement means the listener window received the event, not proof that the Storyline navigation trigger succeeded.

Browser tests cover standalone, cross-origin parent/child, correct/incorrect nonce and source, delayed connection, missing parent adapter, duplicate replies, and customer-specific completion after the fade. Native Review 360/LMS and Storyline navigation still require testing in your actual published project.

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

The original workstation PNG remains unchanged. Four 31px corner windows from the supplied square export cover only its rounded outer corner regions; no other part of that export is shown. Keep both images in the offline package.
