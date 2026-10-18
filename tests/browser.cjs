const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const expected = [
 {id:'maya-patel',name:'Maya Patel',role:'Operations Manager',company:'Brightside Creative',level:'Easy',image:'maya',known:['Brightside Creative is a growing creative agency.',"Maya's team tracks projects across email and spreadsheets."],goals:['Ask Maya about her current situation.','Respond to her concern.','Schedule a tailored workflow demo at a specific time.']},
 {id:'daniel-brooks',name:'Daniel Brooks',role:'Director of Client Services',company:'Northstar Consulting',level:'Medium',image:'daniel',known:['Northstar Consulting wants smoother team handoffs.',"Daniel's team struggles with manual handoffs between teams."],goals:['Ask Daniel about his current handoff process.','Uncover where delays or confusion occur.','Secure a specific next step for a tailored workflow demo.']},
 {id:'renee-alvarez',name:'Renee Alvarez',role:'VP of Operations',company:'Summit Logistics',level:'Hard',image:'renee',known:['Summit Logistics needs reliable workflows.','Renee is cautious after a failed software rollout.'],goals:["Acknowledge Renee's previous experience.","Explore her team's needs and concerns.",'Secure a specific next step for a tailored demo.']},
];
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH || '/usr/bin/chromium',args:['--no-sandbox','--no-proxy-server','--disable-dev-shm-usage'],env:{...process.env,XDG_CACHE_HOME:'/tmp/ritmo-cache',XDG_CONFIG_HOME:'/tmp/ritmo-config'}});
 try {
  const page=await browser.newPage({viewport:{width:1280,height:720},timezoneId:'America/Los_Angeles',reducedMotion:'reduce'});
  const errors=[],requests=[],failed=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>requests.push(r.url()));
  page.on('response',r=>{if(r.status()>=400)failed.push(r.url())});
  page.on('requestfailed',r=>failed.push(r.url()));
  await page.goto('http://127.0.0.1:8000/');
  await page.locator('#notification').waitFor();
  await page.evaluate(()=>document.fonts.ready);
  await page.waitForTimeout(650);
  assert.equal(await page.locator('.customer').count(),3);
  assert.equal(await page.locator('#workstation').evaluate(el=>el.complete && el.naturalWidth===1280),true);
  assert.equal(await page.locator('#office').count(),0);
  assert.equal(await page.evaluate(()=>document.fonts.check('700 25px Montserrat') && document.fonts.check('400 14px Inter')),true);
  assert.deepEqual(await page.locator('.screen').boundingBox(),{x:210,y:77,width:867,height:518});
  const edge=await page.locator('.screen').evaluate(el=>{
   const s=getComputedStyle(el),edge=getComputedStyle(el,'::after');
   return {overflow:s.overflow,radius:s.borderRadius,isolation:s.isolation,pointer:edge.pointerEvents,z:edge.zIndex};
  });
  assert.deepEqual(edge,{overflow:'hidden',radius:'4px 4px 2px 2px',isolation:'isolate',pointer:'none',z:'7'});
  async function assertInScreen(selector) {
   const box=await page.locator(selector).boundingBox(),screen=await page.locator('.screen').boundingBox();
   assert.ok(box.x>=screen.x && box.y>=screen.y && box.x+box.width<=screen.x+screen.width && box.y+box.height<=screen.y+screen.height,selector+' must fit the display');
  }
  await assertInScreen('#dashboard');
  // Preserve the existing rendered CRM composition, excluding the live clock.
  const clockMask=await page.addStyleTag({content:'#clock {visibility:hidden}'});
  await page.screenshot({path:'/tmp/ritmo-after.png'});
  if(fs.existsSync('/tmp/ritmo-before.png')) assert.ok(fs.readFileSync('/tmp/ritmo-after.png').equals(fs.readFileSync('/tmp/ritmo-before.png')),'CRM must remain pixel-identical with clock masked');
  await clockMask.evaluate(el=>el.remove());
  await page.emulateMedia({reducedMotion:'no-preference'});
  const clock=await page.locator('#clock').getAttribute('datetime');
  await page.waitForTimeout(1100);
  assert.notEqual(await page.locator('#clock').getAttribute('datetime'),clock);
  await page.evaluate(()=>{window.dashboardNode=document.querySelector('#dashboard');window.events=[];window.addEventListener('ritmo:statechange',e=>window.events.push(e.detail))});
  for(const customer of expected){
   const card=page.locator(`[data-customer="${customer.id}"]`);
   await card.hover();await page.waitForTimeout(220);
   assert.notEqual(await card.evaluate(el=>getComputedStyle(el).transform),'none');
   assert.equal(await card.locator('.customer-name').evaluate(el=>getComputedStyle(el).cursor),'pointer');
   await card.focus();await page.keyboard.press('Enter');
   const modal=page.locator('#customer-brief');
   await modal.waitFor();await page.waitForTimeout(300);
   assert.equal(await modal.getAttribute('role'),'dialog');
   assert.equal(await modal.getAttribute('aria-modal'),'true');
   assert.equal(await page.locator('#brief-title').evaluate(el=>el===document.activeElement),true);
   assert.equal(await page.locator('.laptop').isVisible(),true);
   assert.equal(await page.locator('.laptop').evaluate(el=>el.inert),true);
   assert.equal(await page.locator('#workstation').isVisible(),true);
   assert.equal(await page.locator('#notification').isVisible(),false);
   assert.equal(await page.locator('#notification').evaluate(el=>el.hidden && getComputedStyle(el).display==='none'),true);
   assert.equal(await page.evaluate(()=>window.dashboardNode===document.querySelector('#dashboard')),true);
   await card.evaluate(el=>el.focus());
   assert.equal(await card.evaluate(el=>el===document.activeElement),false,'Background card must not receive focus');
   assert.equal(await page.locator('#brief-title').textContent(),`Pre-Call Brief: ${customer.name}`);
   const summary=await page.locator('#brief-summary').textContent();
   for (const text of [customer.role,customer.company,...customer.known,...customer.goals]) assert.ok(summary.includes(text));
   assert.ok((await page.locator('#brief-image').getAttribute('src')).includes(`${customer.image}-precall-approved.png`));
   await page.waitForFunction(()=>document.querySelector('#brief-image').complete && document.querySelector('#brief-image').naturalWidth===1280);
   assert.equal(await page.locator('#brief-image').evaluate(el=>el.naturalHeight),720);
   assert.equal(await page.locator('#brief-image').evaluate(el=>getComputedStyle(el).objectFit),'contain');
   assert.equal(await page.locator('#brief-image').evaluate(el=>getComputedStyle(el).filter),'none');
   assert.equal(await page.locator('#customer-brief img').count(),1);
   assert.equal(await page.locator('#customer-brief button').count(),2);
   assert.equal(await page.locator('.brief-panel, .prospect-profile').count(),0);
   const art=await page.locator('.brief-artwork').boundingBox();
   assert.deepEqual(art,{x:160,y:90,width:960,height:540});
   for(const [id,x,y] of [['back-customers',460,635],['call-prospect',995,634]]) {
    const hotspot=page.locator('#'+id),box=await hotspot.boundingBox();
    for(const [actual,target] of [[box.x,160+x*.75],[box.y,90+y*.75],[box.width,238*.75],[box.height,49*.75]]) assert.ok(Math.abs(actual-target)<0.1);
    assert.equal(await hotspot.evaluate(el=>getComputedStyle(el).backgroundColor),'rgba(0, 0, 0, 0)');
    assert.equal(await hotspot.evaluate(el=>getComputedStyle(el).cursor),'pointer');
    assert.ok(await hotspot.getAttribute('aria-label'));
    assert.equal(await hotspot.evaluate(el=>getComputedStyle(el,'::after').opacity),'0');
    await hotspot.hover(); await page.waitForTimeout(200);
    const hover=await hotspot.evaluate(el=>{const s=getComputedStyle(el,'::after');return {opacity:s.opacity,background:s.backgroundColor,color:s.color,font:s.fontSize,label:s.content}});
    assert.equal(hover.opacity,'1');assert.equal(hover.background,'rgb(121, 170, 165)');
    assert.equal(hover.color,'rgb(49, 92, 89)');assert.equal(hover.font,'15px');
    assert.ok(hover.label.includes(await hotspot.getAttribute('aria-label')));
    await page.screenshot({path:`/tmp/ritmo-${customer.image}-${id}-hover.png`});
    await page.mouse.move(0,0); await page.waitForTimeout(200);
    assert.equal(await hotspot.evaluate(el=>getComputedStyle(el,'::after').opacity),'0');
   }
   await page.mouse.move(0,0);
   await page.screenshot({path:`/tmp/ritmo-${customer.image}-brief.png`});
   await page.keyboard.press('Shift+Tab');assert.equal(await page.locator('#call-prospect').evaluate(el=>el===document.activeElement),true);
   assert.equal(await page.locator('#call-prospect').evaluate(el=>el.matches(':focus-visible')),true);
   await page.keyboard.press('Tab');assert.equal(await page.locator('#back-customers').evaluate(el=>el===document.activeElement),true);
   await page.keyboard.press('Shift+Tab');assert.equal(await page.locator('#call-prospect').evaluate(el=>el===document.activeElement),true);
   await page.locator('#back-customers').click();
   assert.equal(await modal.isVisible(),false);
   assert.equal(await page.locator('#discovery-title').evaluate(el=>el===document.activeElement),true);
   assert.equal(await page.locator('.customer[aria-pressed="true"]').count(),0);
   assert.equal(await page.locator('.customer:focus-visible').count(),0);
   await card.focus();await page.keyboard.press('Enter');await page.keyboard.press('Escape');
   assert.equal(await card.evaluate(el=>el===document.activeElement),true);
   await card.click();
   // Small landscape and portrait viewports retain the complete modal.
   for(const [width,height] of [[640,360],[390,844],[2560,1440]]){
    await page.setViewportSize({width,height});
    await page.waitForFunction(()=>Math.abs(document.querySelector('#stage').getBoundingClientRect().width-Math.min(innerWidth,innerHeight*1280/720))<1);
    const box=await page.locator('.brief-artwork').boundingBox();
    assert.ok(box.x>=-1 && box.y>=-1 && box.x+box.width<=width+1 && box.y+box.height<=height+1);
    assert.ok(Math.abs(box.width / box.height - 16/9)<0.001);
    assert.ok(box.width<=1280.1 && box.height<=720.1,'Image must not exceed native size');
    assert.ok(Math.abs(box.x+box.width/2-width/2)<0.1);
    assert.ok(Math.abs(box.y+box.height/2-height/2)<0.1);
    const hotspot=await page.locator('#call-prospect').boundingBox();
    assert.ok(Math.abs((hotspot.x-box.x)/box.width - 995/1280)<0.001);
    assert.ok(Math.abs((hotspot.y-box.y)/box.height - 634/720)<0.001);
   }
   await page.setViewportSize({width:1280,height:720});
   await page.locator('#call-prospect').click();
   assert.equal(await page.locator('#connection-title').textContent(),`Connecting with ${customer.name}...`);
   assert.equal(await page.locator('#transition p').textContent(),'Preparing your customer conversation');
   assert.equal(await page.locator('#transition .eyebrow').textContent(),'RITMO · OUTBOUND CALL');
   assert.equal(await page.locator('#transition').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(49, 92, 89)');
   // Programmatic extra clicks cannot begin another connection or switch prospects.
   await page.evaluate(()=>{document.querySelector('#call-prospect').click();document.querySelector('.customer').click()});
   await page.waitForTimeout(800);
   assert.equal(await page.locator('#transition').isVisible(),true);
   await assertInScreen('#transition');
   await page.screenshot({path:`/tmp/ritmo-${customer.image}-connecting.png`});
   await page.locator('#handoff').waitFor();
   await page.locator('#handoff').evaluate(el=>Promise.all(el.getAnimations().map(animation=>animation.finished)));
   await assertInScreen('#handoff');
   assert.equal(await page.locator('#handoff-title').textContent(),`Ready to Speak with ${customer.name}`);
   assert.equal(await page.locator('.handoff-note').textContent(),'Your customer conversation is ready.');
   await page.screenshot({path:`/tmp/ritmo-${customer.image}-handoff.png`});
   await page.locator('#return-button').click();
   assert.equal(await page.locator('#discovery-title').evaluate(el=>el===document.activeElement),true);
   assert.equal(await page.locator('.customer[aria-pressed="true"]').count(),0);
   assert.equal(await page.locator('.customer:focus-visible').count(),0);
   await page.mouse.move(0,0);
   for(const c of await page.locator('.customer').all()) assert.equal(await c.evaluate(el=>getComputedStyle(el).boxShadow),'none');
   console.log(`PASS ${customer.name}: brief, content, portrait, layout, focus, back, Escape, connection, handoff, return.`);
  }
  const states=await page.evaluate(()=>window.events);
  assert.equal(states.filter(s=>s.screen==='connecting').length,3);
  assert.equal(states.filter(s=>s.screen==='handoff').length,3);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('.customer').first().click();
  assert.equal(await page.locator('#customer-brief').evaluate(el=>getComputedStyle(el).animationName),'none');
  await page.locator('#call-prospect').click();await page.locator('#handoff').waitFor();
  await page.locator('#return-button').focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('.customer').first().evaluate(el=>el===document.activeElement && el.matches(':focus-visible')),true);
  // Selection restrictions must not break future conversation fields.
  await page.evaluate(()=>{const el=document.createElement('textarea');el.id='future-input';el.style.cssText='position:absolute;top:0;left:0;z-index:20';document.querySelector('#stage').append(el)});
  await page.locator('#future-input').fill('Future conversation');
  assert.equal(await page.locator('#future-input').inputValue(),'Future conversation');
  assert.equal(await page.locator('#future-input').evaluate(el=>getComputedStyle(el).userSelect),'text');
  assert.equal(await page.locator('#future-input').evaluate(el=>getComputedStyle(el).cursor),'text');
  await page.locator('#future-input').evaluate(el=>el.remove());
  assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
  assert.equal(requests.some(url=>url.includes('ritmo-office-background.png')),false);
  assert.equal(requests.some(url=>!url.startsWith('http://127.0.0.1:8000/')),false);
  console.log('PASS shared checks: unchanged CRM, clock, notification, hover/cursors, future text input, reduced motion, request/error checks, and duplicate-action guards.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
