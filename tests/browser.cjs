const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
 const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless:true, args:['--no-sandbox','--disable-dev-shm-usage','--no-proxy-server'], env:{...process.env,XDG_CACHE_HOME:'/tmp/ritmo-cache',XDG_CONFIG_HOME:'/tmp/ritmo-config'} });
 const page = await browser.newPage({viewport:{width:1280,height:720},timezoneId:'America/Los_Angeles'});
 const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 const external=[]; page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:8000/'))external.push(r.url())});
 await page.goto('http://127.0.0.1:8000/',{waitUntil:'networkidle'});
 await page.locator('#notification').waitFor({state:'visible'});
 assert.equal(await page.locator('#office').evaluate(el=>el.complete && el.naturalWidth>0),true);
 assert.equal(await page.locator('#asset-notice').isVisible(),false);
 await page.waitForTimeout(650);
 assert.equal(await page.locator('.customer').count(),3);
 assert.equal(await page.evaluate(()=>document.fonts.check('700 25px Montserrat') && document.fonts.check('400 14px Inter')),true);
 await page.screenshot({path:'/tmp/ritmo-crm.png'});
 const before=await page.locator('#clock').getAttribute('datetime');
 await page.waitForTimeout(1100);
 assert.notEqual(await page.locator('#clock').getAttribute('datetime'),before);
 const ids=['maya-patel','daniel-brooks','renee-alvarez'];
 const names=['Maya Patel','Daniel Brooks','Renee Alvarez'];
 await page.evaluate(()=>{window.testStates=[];window.addEventListener('ritmo:statechange',e=>window.testStates.push(e.detail))});
 for (let i=0;i<3;i++) {
  const card=page.locator(`[data-customer="${ids[i]}"]`);
  await card.focus(); await page.keyboard.press('Enter');
  assert.equal(await page.locator('#detail-name').textContent(),names[i]);
  assert.equal(await page.locator('#join-button').evaluate(el=>el===document.activeElement),true);
  await page.keyboard.press('Tab');
  assert.equal(await page.locator('#close-detail').evaluate(el=>el===document.activeElement),true);
  await page.keyboard.press('Shift+Tab');
  assert.equal(await page.locator('#join-button').evaluate(el=>el===document.activeElement),true);
  if(i===0){
   await page.waitForTimeout(300); await page.screenshot({path:'/tmp/ritmo-detail.png'});
   await page.keyboard.press('Escape');
   assert.equal(await card.evaluate(el=>el===document.activeElement),true);
   await card.click();
  }
  await page.locator('#join-button').click();
  await page.locator('#handoff').waitFor({state:'visible'});
  assert.equal(await page.locator('#handoff-title').textContent(),names[i]);
  if(i===0) { await page.waitForTimeout(450); await page.screenshot({path:'/tmp/ritmo-handoff.png'}); }
  await page.locator('#return-button').click();
  assert.equal(await page.locator('#dashboard').isVisible(),true);
  assert.equal(await card.evaluate(el=>el===document.activeElement),true);
  assert.equal(await page.locator('.customer[aria-pressed="true"]').count(),0);
 }
 assert.equal((await page.evaluate(()=>window.testStates.filter(s=>s.screen==='handoff'))).length,3);
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.locator('.customer').first().click();
 assert.equal(await page.locator('.detail').evaluate(el=>getComputedStyle(el).animationName),'none');
 await page.locator('#close-detail').click();
 for (const [width,height] of [[640,360],[390,844],[1920,1080]]) {
  await page.setViewportSize({width,height});
  await page.waitForFunction(() => Math.abs(document.getElementById("stage").getBoundingClientRect().width - Math.min(innerWidth, innerHeight * 1280 / 720)) < 1);
  const box=await page.locator('#stage').boundingBox();
  assert.ok(box.x>=-1 && box.y>=-1 && box.x+box.width<=width+1 && box.y+box.height<=height+1,JSON.stringify(box));
 }
 assert.deepEqual(errors,[]);
 assert.deepEqual(external,[]);
 console.log('PASS: all 3 customer flows, keyboard activation, dialog focus loop, Escape/close, focus restoration, handoff/reset events, notification, live local clock, local fonts, reduced motion, 1280x720 and 3 viewport sizes. No JS errors or external requests. Approved office image loaded successfully.');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
