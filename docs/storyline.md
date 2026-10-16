# Future Storyline Web Object interface

Package index.html, src/, and required assets/ together using relative paths.
Serve via HTTP for development; ES modules do not support opening via file://.

src/session.js exports createSession(onChange):
- getState(): immutable { screen, customerId }.
- selectCustomer(id): selects a validated ID from customers.js.
- joinCall(): returns false without selection; otherwise enters handoff.
- returnToCRM(): clears selection and returns to crm.

main.js emits a local window ritmo:statechange CustomEvent with state as detail.
Events do not cross iframe boundaries automatically. A future adapter can subscribe
inside the Web Object. Suggested future Storyline text variables: RitmoCustomerId
and RitmoScreen. No player API, parent-window, or Devlin AI integration is implemented.
Verify origin restrictions, published Storyline/LMS behavior, and player API access
before implementing a host adapter. Standalone navigation must remain independent.

## Packaging and validation

Include index.html, src/, assets/fonts/, and the original office background in the
Web Object folder. Python and development test tools are not part of that package.
The 1280 × 720 stage scales to the iframe viewport; set a 16:9 Web Object region.
Check selectable text, keyboard focus entry/exit, local fonts, reduced motion,
and return navigation in the published Storyline output and target LMS.

The session callback fires when selection changes, when the handoff is reached
(after the visual transition), and when Return to CRM resets the session. Payloads
contain only screen (`crm` or `handoff`) and customerId (stable ID or null).
Closing a detail panel retains the selection; returning from a call resets it.
Host events do not claim completion or success in the sales-training scenario.
