const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
    args: ['--no-sandbox', '--no-proxy-server', '--disable-dev-shm-usage'],
    env: { ...process.env, XDG_CACHE_HOME: '/tmp/ritmo-cache', XDG_CONFIG_HOME: '/tmp/ritmo-config' },
  });
  try {
    for (const customer of ['maya-patel', 'daniel-brooks', 'renee-alvarez']) {
      const context = await browser.newContext({ reducedMotion: 'reduce' });
      const page = await context.newPage();
      await page.goto('http://127.0.0.1:8000/');
      await page.locator('#notification').waitFor();
      await page.locator(`[data-customer="${customer}"]`).click();
      const hidden = async () => assert.equal(await page.locator('#notification').evaluate(el => el.hidden && getComputedStyle(el).display === 'none'), true);
      await hidden();
      await page.locator('#back-customers').click();
      await hidden();
      for (const next of ['maya-patel', 'daniel-brooks', 'renee-alvarez']) {
        await page.locator(`[data-customer="${next}"]`).click();
        await hidden();
        await page.locator('#call-prospect').click();
        await page.locator('#handoff').waitFor();
        await hidden();
        await page.locator('#return-button').click();
        await hidden();
      }
      await page.reload();
      await page.waitForTimeout(1100);
      await hidden();
      await context.close();
    }
    // Selecting before the entrance timer fires must cancel its delayed appearance.
    // Storage denial must not prevent startup or in-memory session dismissal.
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    await context.addInitScript(() => {
      Object.defineProperty(window, 'sessionStorage', { get() { throw new DOMException('Storage denied', 'SecurityError'); } });
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.clock.install();
    await page.goto('http://127.0.0.1:8000/');
    await page.locator('[data-customer="maya-patel"]').evaluate(el => el.click());
    await page.locator('#back-customers').evaluate(el => el.click());
    await page.clock.fastForward(2000);
    assert.equal(await page.locator('#notification').isVisible(), false);
    assert.deepEqual(errors, []);
    await context.close();
    console.log('PASS manager message: fresh sessions, every first selection, all brief/back/call/return flows, same-tab refresh, early selection, and storage-denied fallback.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
