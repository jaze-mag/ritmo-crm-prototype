# Approved assets

## Runtime artwork

- `ritmo-workstation.png`: original Cinematic Intro (1).png supplied with the
  manager message removed. Unchanged from the working V2 baseline. The screen
  region (210,77)–(1077,595) is excluded with CSS clipping and replaced by HTML.
- `references/maya-precall-approved.png`: Maya Pre-Call Brief.png from the latest
  Maya Pre-Call Brief.zip, preserved byte for byte.
- `references/daniel-precall-approved.png`: Daniel Pre-Call Brief.png from Daniel
  Pre-Call Brief.zip, preserved byte for byte.
- `references/renee-precall-approved.png`: Renee Pre-Call Brief.png from Renee
  Pre-Call Brief.zip, preserved byte for byte.

The three brief exports are flattened 1280 × 720 images. CSS displays only a
350 × 328 portrait region: Maya (62,86), Daniel (62,87), Renee (63,86).
The baked headings, body text, statuses, and buttons are excluded from view.
The shared semantic HTML brief supplies these elements instead. No portrait is
generated or redrawn. Crop coordinates live with customer data in customers.js.

`fonts/` contains Fontsource 5.3.0 Latin WOFF2 Inter Regular/SemiBold and Montserrat
Bold with the original licenses. No runtime font CDN is used.

## Retained reference material

`ritmo-office-background.png` is the prior V1 entrance illustration. It is retained
unchanged for provenance but is not referenced or loaded by V2. The older flattened
CRM export in references/ is also reference-only. All required runtime assets are
bundled; no additional image export is needed.
