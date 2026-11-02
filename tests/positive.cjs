const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--no-proxy-server','--disable-dev-shm-usage'],env:{...process.env,XDG_CACHE_HOME:'/tmp/ritmo-cache',XDG_CONFIG_HOME:'/tmp/ritmo-config'}});
 try {
 const page=await browser.newPage({viewport:{width:1280,height:720}});
 const errors=[],failed=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));
 page.on('requestfailed',r=>failed.push(r.url()));page.on('response',r=>{if(r.status()>=400)failed.push(r.url())});
 const base=process.env.RITMO_TEST_BASE||'http://127.0.0.1:8000/';
 await page.goto(base+'positive-consequence/');
 await page.waitForFunction(()=>window.RitmoPositive?.getState().state==='playing');
 assert.equal(await page.evaluate(()=>RitmoPositive.play()),false,'Repeat play must not restart');
 assert.equal(await page.evaluate(()=>RitmoPositive.continue()),false,'Cannot continue before success');
 await page.evaluate(()=>{window.effects=document.getAnimations();window.effects.forEach(a=>a.pause())});
 const opacity=name=>page.locator(`[data-mask="${name}"]`).evaluate(el=>Number(getComputedStyle(el).opacity));
 for(const t of [0,500,1500,2500,3500,4490]){
  await page.evaluate(t=>window.effects.forEach(a=>a.currentTime=t),t);
  if(t===0) assert.equal(await opacity('screen'),1);
  if(t===500){assert.equal(await opacity('screen'),0);assert.equal(await opacity('badge'),1)}
  if(t===1500){assert.equal(await opacity('badge'),0);assert.equal(await opacity('check'),0);assert.equal(await opacity('calendar'),1)}
  if(t===2500){assert.equal(await opacity('stage'),0);assert.equal(await opacity('calendar'),1)}
  if(t===3500){assert.equal(await opacity('calendar'),0);assert.equal(await opacity('message'),1)}
  await page.screenshot({path:`/tmp/ritmo-positive-${t}.png`});
 }
 await page.evaluate(()=>window.effects.forEach(a=>a.play()));
 await page.waitForFunction(()=>RitmoPositive.getState().state==='complete');
 await page.screenshot({path:'/tmp/ritmo-positive-complete.png'});
 await page.waitForTimeout(400);
 assert.equal(await page.evaluate(()=>RitmoPositive.getState().state),'complete');
 await page.evaluate(()=>{window.continues=0;addEventListener('ritmo:positive-continue',()=>window.continues++)});
 await page.locator('#continue').click();await page.evaluate(()=>RitmoPositive.continue());
 assert.equal(await page.evaluate(()=>window.continues),1);
 assert.equal(await page.locator('#continue').isDisabled(),true);
 await page.locator('#replay').click();
 assert.equal(await page.evaluate(()=>RitmoPositive.getState().state),'playing');
 await page.locator('#skip').focus();await page.keyboard.press('Enter');
 assert.equal(await page.locator('#continue').evaluate(e=>e===document.activeElement),true);
 assert.equal(await page.locator('#continue').isEnabled(),true);
 await page.waitForTimeout(4700);
 assert.equal(await page.evaluate(()=>RitmoPositive.getState().state),'complete','Cancelled callbacks must not restart');
 // A normal uninterrupted run finishes at 4.5 seconds and stays visible.
 await page.locator('#replay').click();await page.waitForTimeout(4000);
 assert.equal(await page.evaluate(()=>RitmoPositive.getState().state),'playing');
 await page.waitForFunction(()=>RitmoPositive.getState().state==='complete');
 for(const [width,height] of [[640,360],[1366,768],[1920,1080]]){
  await page.setViewportSize({width,height});
  await page.waitForFunction(()=>Math.abs(document.querySelector('#scene').getBoundingClientRect().width-Math.min(innerWidth,innerHeight*1280/720))<.1);
  const s=Math.min(width/1280,height/720),scene=await page.locator('#scene').boundingBox();
  assert.ok(Math.abs(scene.width/scene.height-16/9)<.001);
  for(const id of ['replay','continue']){
   const b=await page.locator('#'+id).boundingBox();
   assert.ok(b.x>=scene.x+210*s && b.x+b.width<=scene.x+1080*s && b.y>=scene.y+76*s && b.y+b.height<=scene.y+594*s);
  }
  await page.locator('#replay').click();await page.locator('#skip').click();
 }
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('#replay').click();
 assert.equal(await page.evaluate(()=>RitmoPositive.getState().state),'complete');
 assert.equal(await page.evaluate(()=>document.getAnimations().length),0);
 await page.reload();await page.waitForFunction(()=>window.RitmoPositive?.getState().state==='complete');
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
 assert.ok(requests.every(url=>url.startsWith(base+'positive-consequence/')),'Standalone folder must supply every runtime asset');
 console.log('PASS positive consequence: timing, frame captures, complete hold, guarded Continue, skip, replay, keyboard focus, responsive controls, reduced motion, reload, and local-only assets.');
 } finally {await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
