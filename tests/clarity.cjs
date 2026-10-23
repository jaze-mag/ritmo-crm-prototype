const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
    args: ['--no-sandbox', '--no-proxy-server', '--disable-dev-shm-usage'],
    env: { ...process.env, XDG_CACHE_HOME: '/tmp/ritmo-cache', XDG_CONFIG_HOME: '/tmp/ritmo-config' },
  });
  try {
    for (const deviceScaleFactor of [1, 2]) {
      const page = await browser.newPage({viewport:{width:1280,height:720},deviceScaleFactor});
      await page.goto('http://127.0.0.1:8000/');
      await page.evaluate(() => document.fonts.ready);
      const art = page.locator('.brief-artwork');
      const snapshots = new Map();
      for (let pass = 0; pass < 2; pass++) {
        for (const name of ['maya', 'daniel', 'renee']) {
          // Pause at specific points to inspect the fade without timing races.
          await page.evaluate(async name => {
            document.querySelector(`[data-customer^="${name}-"]`).click();
            while (document.querySelector('.precall').hidden) await new Promise(requestAnimationFrame);
            const animation = document.querySelector('.precall').getAnimations()[0];
            animation.pause();
            window.briefAnimation = animation;
          }, name);
          await page.locator('#brief-image').evaluate(el => el.decode());
          for (const time of [0, 130]) {
            await page.evaluate(time => { window.briefAnimation.currentTime = time; }, time);
            assert.deepEqual(await art.boundingBox(), {x:160,y:90,width:960,height:540});
            const styles = await page.evaluate(() => ['.precall','.brief-artwork','#brief-image'].map(q => {
              const s = getComputedStyle(document.querySelector(q));
              return {transform:s.transform,filter:s.filter,backdrop:s.backdropFilter,willChange:s.willChange};
            }));
            for (const style of styles) assert.deepEqual(style,{transform:'none',filter:'none',backdrop:'none',willChange:'auto'});
            const opacity = Number(await page.locator('.precall').evaluate(el => getComputedStyle(el).opacity));
            if (time === 0) assert.equal(opacity, 0);
            else assert.ok(opacity > 0 && opacity < 1, 'Entry remains an opacity fade');
          }
          await page.evaluate(() => window.briefAnimation.play());
          await page.waitForTimeout(400);
          assert.equal(await page.locator('.precall').evaluate(el => el.getAnimations().length), 0, 'No retained opacity animation after entry');
          assert.equal(await page.locator('.precall').evaluate(el => getComputedStyle(el).opacity), '1');
          await page.mouse.move(0,0);
          await page.waitForTimeout(200); // Let a previous Back hover fade out.
          const settled = await art.screenshot({path:`/tmp/ritmo-clarity-${name}-${deviceScaleFactor}-${pass}.png`});
          await page.waitForTimeout(1000);
          assert.ok(settled.equals(await art.screenshot({path:`/tmp/ritmo-clarity-${name}-${deviceScaleFactor}-${pass}-idle.png`})), `${name}: settled and idle pixels must match`);
          for (const id of ['back-customers','call-prospect']) {
            await page.locator('#'+id).hover();
            await page.waitForTimeout(200);
            assert.equal(await page.locator('#'+id).evaluate(el=>getComputedStyle(el,'::after').opacity),'1');
            await page.mouse.move(0,0);
            await page.waitForTimeout(200);
            assert.ok(settled.equals(await art.screenshot()), `${name}: pixels restore after ${id} hover`);
          }
          if (pass === 0) snapshots.set(name,settled);
          else assert.ok(snapshots.get(name).equals(settled), `${name}: pixels match after switching/reopening`);
          await page.locator('#back-customers').click();
        }
      }
      await page.close();
      console.log(`PASS all three briefs at DPR ${deviceScaleFactor}: fade geometry, released animation, idle/hover/reopen pixel stability.`);
    }
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
