# Approved assets

The three inline references were inspected:

- `ritmo-crm-reference.png`: the approved 1280 × 720 layout.
- `ritmo-office-background.png`: approved sunlit anime office illustration.
- `ritmo-style-guide.png`: approved typography, colors, and states.

The original office PNG is bundled unchanged, extracted from the supplied
Ritmo Office.zip. Layout/style reference images were inspected in chat; they are
not used as flattened UI or required at runtime.

`fonts/` contains Latin WOFF2 Inter Regular/SemiBold and Montserrat Bold from
Fontsource packages version 5.3.0, plus the original licenses. Fonts are loaded
locally; no font CDN is used at runtime.


## V2 supplied mockups

- `references/ritmo-crm-approved.png`: unchanged Cinematic Intro.png from the
  uploaded Cinematic Intro.zip. This is a flattened CRM reference, not a clean
  workstation background. It is retained for visual comparison.
- `references/maya-precall-approved.png`: unchanged Pre-Call Brief.png from the
  uploaded Pre-Call Brief.zip. The brief displays only its portrait region using
  CSS overflow clipping at x=62, y=86, width=350, height=328. The source image is
  not edited, and its baked text/buttons are never displayed in the live brief.

The actual workstation/laptop background is still needed without the CRM screen
contents or manager notification. The baked notification obscures the laptop in
the supplied mockup and cannot serve as an independently animated element.
Until a clean export is supplied, the existing V1 office background remains.
