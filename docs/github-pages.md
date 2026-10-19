# Publish Ritmo CRM V2 with GitHub Pages

## Prepared version

- Source: `prototype/ritmo-crm-v2`, commit `6907e7cfe07382ba95351c90c5f85ccc3a704c47`.
- Publishing branch: `gh-pages` (website files at the branch root).
- Setup and publishing helper: `deployment/github-pages`.
- Expected public address: https://jaze-mag.github.io/ritmo-crm-prototype/

The public address is **not confirmed live**. This environment can push Git
branches, but its network proxy denies requests to GitHub's Pages API and the
public site hostname (HTTP CONNECT 403). Repository settings and public deployment
status cannot be inspected or changed through those blocked endpoints.

## One-time setup in GitHub

1. Sign in to GitHub and open:
   https://github.com/jaze-mag/ritmo-crm-prototype/settings/pages
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
3. Under **Branch**, select **gh-pages**, select **/(root)**, and click **Save**.
4. Leave the custom domain empty. Keep **Enforce HTTPS** enabled if that option is
   shown. The default `github.io` address supports HTTPS automatically.
5. Wait a few minutes. Refresh the Pages settings until it says the site is live
   and provides a **Visit site** link. You can also check the repository's
   **Actions** tab for the **pages build and deployment** run.
6. Open https://jaze-mag.github.io/ritmo-crm-prototype/ in an Edge InPrivate window.
   It must load without GitHub sign-in before you share it.

If **gh-pages** is not listed, refresh the settings page. If Pages settings are
missing, an owner/admin must enable them. If GitHub says Pages is unavailable
for the repository's visibility or plan, resolve that in GitHub before expecting
a public site; the publishing script does not change visibility or billing.

## What to test on the public site

At a 1280 × 720 viewport, confirm the office/laptop artwork, three cards, clock,
and first-arrival manager message. For each of Maya, Daniel, and Renee:

- Open the correct brief, use Back to Customers, then open it again.
- Hover both buttons and try keyboard Tab/Enter/Escape navigation.
- Use Call This Prospect; check the connecting and Ready to Speak names.
- Return to CRM; the manager message must stay hidden.

Refresh in the same tab: the dismissed notification stays hidden when storage is
available. A fresh independent browser session may show it again. Check that all
images and text are present. No installation or sign-in should be required.

## Add the link to Figma

Only after the public check succeeds, select the **Launch Interactive CRM** button
in Figma. Add a prototype interaction **On click → Open link** and paste:

https://jaze-mag.github.io/ritmo-crm-prototype/

Use this website URL, not a GitHub source-code or ZIP link.

## Future updates

Updates are deliberately controlled: pushing V2 alone does **not** change the
live site. After approving and pushing the next V2 change, ask Codex:

> Publish the latest approved V2 to gh-pages using scripts/publish-pages.py.

For someone running the command themselves, use a checkout of
`deployment/github-pages` with Python 3, Git, and repository push access:

```sh
python3 scripts/publish-pages.py
# Review/test the prepared gh-pages tree, then publish:
python3 scripts/publish-pages.py --push
```

The helper fetches the remote V2 branch, copies only the explicit runtime allowlist,
and creates a normal commit on `gh-pages`. It leaves the working files, V1, V2,
and main unchanged. `.nojekyll` tells Pages to serve the static files directly.
There is no package installation, build, API key, or live AI connection.

Once Pages is configured, each push to `gh-pages` automatically starts GitHub's
Pages deployment. Do not change the Pages settings for subsequent updates.
A normal push rejects conflicting concurrent updates instead of overwriting
history. If future code adds a new runtime asset, add its path to `FILES` in the
helper before publishing and rerun the asset checks. Credentials, tests, helper
scripts, unused artwork, and internal documentation are not deployed.

## Validation and limits

The runtime-only publishing tree is tested locally at the same project subpath,
`/ritmo-crm-prototype/`, in a fresh Chromium context without GitHub authentication.
The application uses relative paths and local fonts; no runtime network APIs or
external assets are required. All published application/asset blobs are identical
to the approved V2 source; only the empty `.nojekyll` file is added.

Public HTTPS loading, GitHub build status, anonymous access to the actual hosted
site, and Windows Edge rendering remain unverified until Pages is enabled and
the public URL can be reached. A successful branch push is not proof of a live site.

Preparation checks passed on 2026-10-19: full browser journeys, notification
persistence, opaque-origin startup, and brief pixel stability at DPR 1 and 2.
All four suites used the extracted `gh-pages` tree at the project subpath rather
than the development checkout. No missing assets or external runtime requests
were detected. The publishing helper was run twice and reused the same commit,
confirming that unchanged content does not create repeated deployment commits.
Prepared publishing commit: `de0f20fc28fec7b2336529b1db7ac3568b32cb36`.
