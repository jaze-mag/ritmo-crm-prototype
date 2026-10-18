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

`renderHandoff(customer)` in main.js is the single UI boundary for replacing the
local handoff later. The captured customer and duplicate-action guards keep the
connection transition consistent. A future adapter can listen for `handoff` and
relay the selected ID to Storyline. Proposed text variables: RitmoCustomerId and
RitmoScreen. CustomEvents do not cross iframe boundaries automatically.

## Integration work still required

No parent-window calls, Storyline player API, Devlin AI endpoint, credentials,
or live conversation are implemented. Validate the chosen communication mechanism,
iframe origins, published/LMS behavior, and official integration requirements
before adding an adapter. Do not assume a player API or AI endpoint exists.

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
