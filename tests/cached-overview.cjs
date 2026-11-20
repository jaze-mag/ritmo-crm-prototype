// Regression: an old cached document may request the newest main.js after deployment.
const { chromium } = require('playwright');
const { execFileSync } = require('node:child_process');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
  try {
    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const oldHtml = execFileSync('git',['show','8e9de5a:index.html'],{cwd:require('node:path').resolve(__dirname,'..')}).toString();
    await page.route('**/index.html', route => route.fulfill({contentType:'text/html',body:oldHtml}));
    await page.goto(`${process.env.RITMO_TEST_BASE || 'http://127.0.0.1:8040/'}index.html`);
    await page.locator('.customer').last().waitFor();
    assert.equal(await page.locator('.customer').count(),3);
    assert.ok(await page.locator('#clock').textContent());
    await page.locator('#open-overview').click();
    await page.locator('#complete-overview').click();
    assert.equal(await page.locator('.customer:disabled').count(),0);
    await page.locator('.customer').first().click();
    await page.locator('#customer-brief').waitFor();
    assert.deepEqual(errors,[]);
    console.log('PASS old cached HTML + current script: cards, clock, overview, unlock and brief, without startup errors.');
  } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});
