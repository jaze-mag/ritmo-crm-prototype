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

The three brief exports are displayed as complete 1280 × 720 compositions. No
cropping, image manipulation, recoloring, or text reconstruction is applied.
Their original backgrounds and buttons are part of the visible PNG.
On hover/focus only, the hotspot adds light teal and a readable label over the
original button; this treatment disappears when neither state applies. CSS uses
`object-fit: contain` inside a 16:9 container; both image and transparent semantic
button hotspots scale together. The brief is centered at 75% of the stage width (960 × 540 on the reference
canvas), capped at native resolution. Its original corners remain fully visible.

Hotspot coordinates in the source image:
- Back to Customers: x=460, y=635, width=238, height=49.
- Call This Prospect: x=995, y=634, width=238, height=49.

The original source files remain unchanged from the uploaded ZIPs.

`fonts/` contains Fontsource 5.3.0 Latin WOFF2 Inter Regular/SemiBold and Montserrat
Bold with the original licenses. No runtime font CDN is used.

## Retained reference material

`ritmo-office-background.png` is the prior V1 entrance illustration. It is retained
unchanged for provenance but is not referenced or loaded by V2. The older flattened
CRM export in references/ is also reference-only. All required runtime assets are
bundled; no additional image export is needed to run the current prototype.

## Exports needed for sharper brief text

The supplied Maya, Daniel, and Renee brief ZIPs each contain a flattened PNG,
with all text baked into the artwork. There are no clean text-free compositions.
To replace raster text with browser-rendered Montserrat/Inter without duplicated
text or masking damage, supply one text-free 1280 × 720 PNG for each customer:

- Maya Pre-Call Brief — text-free.png
- Daniel Pre-Call Brief — text-free.png
- Renee Pre-Call Brief — text-free.png

Export the exact existing Figma frame with all text layers hidden: title,
customer name, role/company, challenge level, section headings, bullets,
opportunity/next-step labels, and both button labels. Preserve every non-text
layer, including portraits, office backgrounds, teal profile cards, cream panels,
status badges, button shapes, borders, colors, and transparency. Keep the current
positions and dimensions. The existing approved PNGs provide the matching text
and placement reference. No substitute artwork or text removal has been generated.
