# Required role overview and brief review

The peach **Your Role & Ritmo Overview** button is inside the right side of the Pipeline Status bar. Only that bar is taller (94px instead of 72px) to accommodate the required instruction; it remains within the laptop screen. Customer card dimensions, position, content, and unlocked styling are unchanged.

A fresh attempt starts with readable muted customer cards and decorative lock icons. Native disabled buttons prevent pointer/keyboard selection, and the selection handler also checks completion. The manager notification stays hidden. The overview button has a two-second outline glow; reduced motion replaces it with a static outline.

The overview is an in-laptop screen below the existing header, with an accessible scrolling region and all requested content. **Return to Dashboard**, at the end of the content, marks completion. There is no automatic close, forced reading timer, or claim to measure actual reading. Completion unlocks the cards, stops the glow, and schedules the existing manager message with its unchanged text, placement, and dismissal rules. Reopening the overview retains progress.

The inspected prior implementation had no all-three-brief review gate. This update implements that requirement: each distinct brief counts once only after its artwork successfully decodes and is displayed. A compact status line in the existing bottom margin reports progress. Call This Prospect remains focusable but aria-disabled until all three briefs have been opened; click and keyboard activation are guarded. The original PNGs, portraits and hotspots remain unchanged. Learners choose the prospect they want to call after reviewing the briefs; opening a brief never starts a call.

## Attempt scope

Onboarding and reviewed IDs are stored in sessionStorage under `ritmo.onboarding.v1`, so they persist in the current browser tab across refreshes and Web Object reloads. Existing manager dismissal remains under its original tab-scoped key. A fresh tab/private browsing context provides a fresh attempt; a duplicated tab may copy storage. When sessionStorage is denied, progress uses memory for the current document only. For a future course-restart reset, the host can define an attempt policy separately; no new Storyline variables or reset triggers are required for this update.

## Integration preservation

The handshake adapter, message payload, origin checks, customer identifiers, connecting/ready delays, glow animation and fade-to-black implementation are unchanged. After the two onboarding prerequisites, the original cinematic route runs. No Storyline-side changes are required beyond the already-working adapter and navigation setup.

Automated tests cover fresh/returning attempts, gating, content, keyboard scrolling, unlock, notification timing/dismissal, all three brief reviews, storage-denied fallback, reduced motion, responsive bounds, the three cinematic routes, and cross-origin handshake behavior. Actual Review 360 has not been tested in this environment. The screenshots referenced in the user instructions were not included with the pasted request; placement follows the specified right side of the pipeline bar and existing brand styles.
