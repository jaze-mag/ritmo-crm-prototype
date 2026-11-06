# Maya positive conclusion

Open `index.html` to preview Later That Week → conclusion. Everything required is in this folder, including fonts, original artwork, and original synthesized WAV effects. No server, CDN, authentication, scoring, or parent-window access is required by the animation.

## Playback
The opening lasts 3.3 seconds including its crossfade; all reveals finish at 6.6 seconds. Skip immediately shows the finished screen. Replay resets animations and audio; repeated play requests while playing are ignored. Reduced-motion immediately presents the completed conclusion. Sound defaults off; turn it on with the button (a quiet preview whoosh plays), then replay for all cues. Autoplay rejection never blocks the experience.

Text uses native Inter/Montserrat and no scale/blur transforms. Portraits use small CSS windows onto the untouched supplied conclusion PNG. The opening retains the supplied laptop artwork, with a matching display surface covering baked-in text so native text can reveal separately without duplication. Raster portraits remain limited by the supplied resolution.

## Navigation integration
On the published GitHub Pages site, Choose Another Customer returns to the existing CRM. In isolated local packages this destination is intentionally unconnected. Try Maya Again and Finish Experience show explicit prototype destination notices until the host supplies navigation. No simulation or completed course screen is invented.

`window.RitmoConclusion` exposes `play()`, `replay()`, `skip()`, `getState()`, and `setNavigation(callbackOrNull)`. A callback receives `{action: 'retry'|'customers'|'finish', customerId: 'maya-patel', outcome: 'positive'|'negative'}`. All navigation first dispatches the cancelable local window event `ritmo:conclusion-navigation`; call `preventDefault()` to handle it instead of the default. No cross-window messages are sent. A future host adapter can forward these events without restructuring playback.

## Storyline packaging
Copy this entire folder, keeping index.html, styles.css, animation.js and assets together. In Storyline use Insert → Web Object → browse to this folder. Use a 16:9 object and publish the course to test. On a fresh visit playback starts automatically; if Storyline preserves the frame, invoke `RitmoConclusion.replay()` through a future host adapter. Revisit behavior is host-controlled. This has been tested in Chromium iframes, not in the Storyline application or Windows Edge.

The optional audio is original synthesized noise/tones, packaged locally; no external recordings. Font licenses are in assets.

The opportunity pill pulse at 4.9 seconds has its own local stage.wav cue: rising for Advanced, descending for Stalled. It follows Sound On/Off and is canceled on skip/replay.
