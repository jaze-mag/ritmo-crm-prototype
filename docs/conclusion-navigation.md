# Conclusion navigation and Storyline setup

Both conclusion folders remain self-contained Web Objects: package index.html, styles.css, animation.js, navigation.js and assets/. No CDN or Devlin API is used. The original 6.6-second sequence, cue files/volumes, stage pulse and manager email reveal are unchanged. Skip/Replay/Sound controls are removed. `RitmoConclusion.replay()` remains available for host-controlled revisits; a new iframe load plays automatically.

Sound is enabled by default. All four audio files preload before playback; original volumes and cue timings are unchanged. The animation starts only after the audible opening cue can play. When the browser blocks autoplay, a conditional **Play conclusion** prompt waits for a click/Enter/Space inside the Web Object, primes the audio before any animation starts, then plays the full sequence. There is no permanent sound toggle or replay control. If a sound file fails to load, an explicit Continue without sound fallback is offered. Reduced motion retains the existing immediate completed-screen behavior without the cinematic sound sequence.

For embedded playback the host should allow autoplay (`allow="autoplay"`) where supported. The click fallback remains necessary where browser policy blocks automatic audio. Device/tab muting and Review 360's own permissions cannot be overridden by the prototype. Host `RitmoConclusion.replay()` now returns a promise that resolves after playback is started or a start prompt is offered; await it before issuing subsequent host controls. Browser tests cover all four unmuted playing/ended events and cue timing under strict/allowed autoplay, keyboard startup and replay; iframe tests cover delayed media and missing-file fallback. Actual Edge/Review 360/device audio still needs checking in the published course.

## Install the additional listener

The actual published Storyline slide trigger script and Devlin bridge.js are NOT stored in this repository. Existing `storyline-parent-handshake.js` is the documented CRM handshake adapter, not the course's complete navigation listener. Keep that adapter, your existing launchSimulation/SelectedCustomer listener and Devlin's bridge unchanged.

1. Add two course variables: `RitmoNavigationAction` (Text, blank), `RitmoReturnToCustomers` (True/False, False).
2. Add an Execute JavaScript trigger using the full contents of **storyline-conclusion-listener.js** on timeline start for Slide 1.3 (UI w/ 3 Customers) AND both conclusion Web Object slides. It must run in the same immediate parent window as the working CRM listener, with GetPlayer available. It installs once per parent window and supports later iframe loads. Do not paste it inside Devlin's iframe.
3. On BOTH conclusion slides, add **Jump to Slide 1.3** when variable `RitmoNavigationAction` changes, condition equals `customers`.
4. Add **Jump to your existing Ritmo Experience Complete slide** when the same variable changes, condition equals `finish`. No new web ending is created.
5. Prepare the retry route as described below. The listener resets `SelectedCustomer` to `maya`, `SelectedOutcome` to blank, `Sim_CharMood` to `neutral`, `Sim_Score` to 0 and `Sim_EvalComplete` to False before setting action to `retry`. It does not clear CRM overview/brief review progress.
6. For an intentional NEW COURSE attempt, set `RitmoReturnToCustomers` False and follow your course restart/storage policy. Do not reset this variable on CRM slide entry: it must survive navigation from the conclusion. Fresh browser attempts without this explicit return state retain the locked overview experience.

## Retry: required Devlin work, not yet verified

The listener prepares a `retry` navigation request, but resetting Storyline variables alone cannot create a new Devlin conversation. Do not enable a direct retry jump in production until a supported session-reset flow is known. Obtain Devlin's documented restart/session-creation method and the current Maya embed/bridge.js setup. Stop or detach the old session's variable updates before resetting evaluation state; after a confirmed reset, reset the five variables above again if necessary and **Jump to Slide 1.4 (Maya – AI Convo)**. That sequencing belongs in Storyline's Execute JavaScript trigger when `RitmoNavigationAction` changes to `retry` and the provider reset succeeds. There is deliberately no guessed reset call here.

For navigation-only review you can temporarily add Jump to Slide 1.4 when action equals retry. This tests routing ONLY: the conversation may still be completed, and old provider events may overwrite the cleared variables. It is not a fresh-attempt implementation. The exact production retry trigger cannot be supplied until the supported Devlin reset method is provided.

Please retrieve the actual working Execute JavaScript trigger from Slide 1.3, the Maya embed/bridge configuration (without secrets), and Devlin's restart documentation to finish this remaining integration.

## Messages and return state

Conclusions use the existing `ritmo:connect` / `ritmo:ready` nonce handshake with the immediate parent, validating event.source, nonce and actual HTTP(S) event.origin. Only customer-free discovery uses '*'. Navigation uses the exact responding origin:

```js
{type:'ritmo:conclusionNavigation', nonce, requestId: nonce + ':1',
 action:'retry' /* or customers / finish */, customer:'maya', outcome:'positive' /* or negative */}
```

The host acknowledges with `ritmo:conclusionNavigationReceived`, same nonce/requestId, and accepted true/false. Requests queue until connected and retry up to 30 seconds; the host deduplicates by frame/nonce/requestId. Acknowledgement confirms host receipt, not slide arrival or a Devlin reset. Repeated clicks cannot issue competing actions. A late-installed listener can restart discovery and flush the pending request with the existing `ritmo:requestHandshake` message.

On CRM readiness, the added listener sends `{type:'ritmo:resumeCustomers', nonce}` when the Storyline return flag is True. CRM accepts this only from its configured parent with its current nonce. It completes only overview access, preserving existing brief review IDs and never marking a scenario finished. On this explicit return path only, a separate returningFromConclusion flag bypasses the all-three-brief review gate and suppresses the dashboard manager notification. It persists with onboarding state when storage is available; the host restores it when storage is blocked. Reviewed brief IDs and scenario completion are not fabricated. First-time onboarding and brief-review requirements remain unchanged. This does not rely on cross-slide Web Object sessionStorage sharing.

Standalone Choose Another Customer uses `../index.html?ritmoReturn=customers`; the explicit return parameter restores overview access and is removed from the URL. Direct first-time visits remain locked. Standalone Retry/Finish explain that Storyline is required. Embedded buttons never navigate the iframe to a CRM route in place of a Storyline slide.

## Review 360 acceptance checks (not performed here)

- New course: CRM cards locked; complete onboarding and review briefs normally.
- Both outcomes: Later That Week and all four sound cues play (test published autoplay policy), no prototype controls, email pulses until opened with mouse/Enter/Space.
- Choose Another Customer: Slide 1.3 opens; all three cards selectable even with isolated/denied child storage; no scenario marked completed. Call This Prospect is enabled on the first opened brief for each customer; the dashboard manager notification stays hidden.
- Finish: the existing Experience Complete slide opens once, with no web ending.
- Retry routing-only: verify five variables and Slide 1.4 destination. Fresh conversation is NOT a passing test until Devlin confirms a new session, clears old transcript/evaluation, and old events cannot overwrite state.
- Test delayed listener readiness, double clicks, revisit/replay, reduced motion, and mobile. Inspect immediate-parent origin/source if there are nested Review wrappers; postMessage does not bubble.

## Files changed and browser validation

- `positive-conclusion/index.html`, `negative-conclusion/index.html`: remove playback controls; load navigation module.
- Both `animation.js` files: default audio on, gesture priming, remove control handlers, delegate navigation; preserve animation timelines/assets.
- Both `navigation.js` files (new, matching copies for independent packaging): parent handshake, queued/deduplicated navigation, standalone return.
- Root `index.html`: cache version; `src/main.js`: explicit standalone/validated parent return access only.
- This guide and `docs/storyline-conclusion-listener.js`: exact host additions and unresolved Devlin requirements.
- `tests/conclusions.cjs`, `tests/manager-reveal.cjs`, `tests/conclusion-navigation.cjs`: hidden controls, existing interactions, navigation and mock host coverage.
- Deployment helper on `deployment/github-pages`: include the two navigation modules.

Browser checks passed for both outcomes, natural completion, all envelope interaction modes, host replay, reduced motion, mobile bounds and iframe rendering. Cross-origin tests use the real added listener with a **mock GetPlayer**, including late readiness, invalid nonce rejection, duplicate click prevention, retry variable values, finish requests and CRM return with child storage blocked. Existing overview and cinematic handshake regressions passed. These are NOT actual Storyline/Devlin integration tests.
