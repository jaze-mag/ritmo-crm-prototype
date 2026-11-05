const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--no-proxy-server','--disable-dev-shm-usage'],env:{...process.env,XDG_CACHE_HOME:'/tmp/ritmo-cache',XDG_CONFIG_HOME:'/tmp/ritmo-config'}});try{
for(const outcome of ['positive','negative']){
 const page=await browser.newPage({viewport:{width:1280,height:720}});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)errors.push(r.url())});
 const url=(process.env.RITMO_TEST_BASE||'http://127.0.0.1:8010/')+outcome+'-conclusion/';await page.goto(url);await page.waitForFunction(()=>RitmoConclusion.getState()==='playing');
 assert.equal(await page.evaluate(()=>RitmoConclusion.play()),false);
 await page.screenshot({path:'/tmp/'+outcome+'-intro.png'});
 await page.waitForFunction(()=>RitmoConclusion.getState()==='complete');
 assert.equal(await page.locator('.opportunity h3').textContent(),outcome==='positive'?'Pilot Discussion':'At Risk');
 assert.equal(await page.evaluate(()=>document.getAnimations().length),0);
 await page.screenshot({path:'/tmp/'+outcome+'-conclusion.png'});
 for(const action of ['retry','customers','finish']){await page.locator(`[data-action=${action}]`).click();assert.equal(await page.locator('dialog').evaluate(e=>e.open),true);await page.locator('#dismiss').click();}
 await page.evaluate(()=>{window.nav=[];RitmoConclusion.setNavigation(d=>window.nav.push(d));});await page.locator('[data-action=retry]').click();assert.equal(await page.evaluate(()=>window.nav[0].customerId),'maya-patel');
 await page.locator('#replay').click();await page.locator('#sound').click();assert.equal(await page.locator('#sound').getAttribute('aria-pressed'),'true');await page.locator('#sound').click();await page.locator('#skip').click();await page.waitForTimeout(700);assert.equal(await page.evaluate(()=>RitmoConclusion.getState()),'complete');
 for(const viewport of [{width:640,height:360},{width:390,height:844},{width:1920,height:1080}]){await page.setViewportSize(viewport);assert.equal(await page.locator('.scene').evaluate(e=>{let s=e.getBoundingClientRect();return [...e.querySelectorAll('nav button,.panel')].every(x=>{let r=x.getBoundingClientRect();return r.left>=s.left && r.right<=s.right+1 && r.bottom<=s.bottom+1;});}),true);}
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('#replay').click();assert.equal(await page.evaluate(()=>RitmoConclusion.getState()),'complete');
 if(process.env.RITMO_TEST_FILE==='1'){await page.goto('file:///workspace/ritmo-crm-prototype/'+outcome+'-conclusion/index.html');await page.waitForFunction(()=>RitmoConclusion.getState()==='complete');assert.equal(await page.locator('.avatar').count(),2);}
 await page.route('**/iframe-host.html',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><html><body></body></html>'}));await page.goto(new URL('/iframe-host.html',url).href);await page.evaluate(url=>{document.body.innerHTML='<iframe title="Web Object" style="width:960px;height:540px;border:0"></iframe>';document.querySelector('iframe').src=url;},url);let frame=page.frames().find(f=>f!==page.mainFrame());await page.waitForTimeout(500);frame=page.frames().find(f=>f!==page.mainFrame());await frame.waitForFunction(()=>window.RitmoConclusion?.getState()==='complete');assert.equal(await frame.locator('.scene').evaluate(e=>Math.round(e.getBoundingClientRect().width)),960);
 assert.deepEqual(errors,[]);await page.close();console.log(outcome+': natural completion, skip, replay, sound toggle, navigation, responsive, reduced motion, iframe passed');
}
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
