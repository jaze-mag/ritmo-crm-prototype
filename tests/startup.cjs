const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');

(async () => {
  const html = readFileSync(resolve(__dirname, '../index.html'), 'utf8');
  assert.ok(!/<script[^>]*type=["']module["']/.test(html), 'Direct-file startup must not require ES modules');
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--no-proxy-server'],
    env: { ...process.env, XDG_CACHE_HOME: '/tmp/ritmo-cache', XDG_CONFIG_HOME: '/tmp/ritmo-config' },
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, reducedMotion: 'reduce' });
    const scriptFailures = [];
    const errors = [];
    page.on('requestfailed', request => {
      if (request.resourceType() === 'script') scriptFailures.push(request.url());
    });
    page.on('pageerror', error => errors.push(error.message));
    await page.goto('http://127.0.0.1:8000/');
    // A sandbox without allow-same-origin gives the document an opaque origin.
    // ES-module requests fail CORS here just as they do when opened via file://.
    // This does not override the managed browser's restriction on file URLs.
    await page.setContent('<iframe title="Opaque-origin startup regression" sandbox="allow-scripts" src="http://127.0.0.1:8000/" style="border:0;width:1280px;height:720px"></iframe>');
    const app = page.frameLocator('iframe');
    await app.locator('.customer').last().waitFor();
    assert.equal(await app.locator('.customer').count(), 3);
    const names = ['Maya Patel', 'Daniel Brooks', 'Renee Alvarez'];
    for (let index = 0; index < names.length; index++) {
      await app.locator('.customer').nth(index).click();
      assert.equal(await app.locator('#brief-name').textContent(), names[index]);
      await app.locator('#call-prospect').click();
      await app.locator('#handoff').waitFor();
      assert.equal(await app.locator('#handoff-title').textContent(), `Ready to Speak with ${names[index]}`);
      await app.locator('#return-button').click();
      assert.equal(await app.locator('.customer[aria-pressed="true"]').count(), 0);
    }
    assert.deepEqual(scriptFailures, []);
    assert.deepEqual(errors, []);
    console.log('PASS: classic-script startup and all 3 selection/Join Call/return flows in an opaque-origin frame. Native file:// testing is separate.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
