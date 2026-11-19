const {completeOverview,reviewAllBriefs}=require('./onboarding-helper.cjs');
const {chromium}=require('playwright');const assert=require('node:assert/strict');
const base=process.env.RITMO_TEST_BASE||'http://127.0.0.1:8013/';
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--no-proxy-server','--disable-dev-shm-usage'],env:{...process.env,XDG_CACHE_HOME:'/tmp/ritmo-cache',XDG_CONFIG_HOME:'/tmp/ritmo-config'}});try{
async function run(customer,{embedded=false,wrong=false,reduced=false,width=1280,height=720}={}){
 const [id,name,company,role,key]=customer;
 const page=await browser.newPage({viewport:{width,height},reducedMotion:reduced?'reduce':'no-preference'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 let app=page;
 if(embedded){await page.route('**/maya-host',r=>r.fulfill({contentType:'text/html',body:`<script>window.received=[];addEventListener('message',e=>{if(e.data?.type==='ritmo:launchSimulation')received.push({data:e.data,origin:e.origin,fromFrame:e.source===document.querySelector('iframe').contentWindow})})</script><iframe title="Storyline stand-in" src="${base}" style="position:fixed;inset:0;width:100%;height:100%;border:0"></iframe>`}));await page.goto(new URL('maya-host',base).href);await page.frameLocator('iframe').locator('.customer').last().waitFor();app=page.frames()[1];}else await page.goto(base);
 await app.locator('.customer').last().waitFor();assert.equal(await app.locator('.customer').count(),3);await completeOverview(app);await app.locator('#notification').waitFor();await reviewAllBriefs(app);
 await app.evaluate(origin=>{window.events=[];window.states=[];addEventListener('ritmo:statechange',e=>states.push({state:e.detail,t:performance.now()}));addEventListener('ritmo:launchSimulation',e=>events.push({data:e.detail,t:performance.now(),opacity:getComputedStyle(document.querySelector('#simulation-exit')).opacity,animations:document.querySelector('#simulation-exit').getAnimations().length}));if(origin)Ritmo.configureSimulationParent(origin);},embedded?(wrong?'https://untrusted.example':new URL(base).origin):null);
 assert.equal(await app.evaluate(()=>{try{Ritmo.configureSimulationParent('*');return false}catch{return true}}),true);
 await app.locator(`[data-customer="${id}"]`).click();await app.locator('#call-prospect').click();await app.evaluate(()=>{document.querySelector('#call-prospect').click();document.querySelector('[data-customer="daniel-brooks"]').click();});
 assert.equal(await app.locator('#connection-title').textContent(),`Connecting with ${name}...`);assert.equal(await app.locator('#transition .eyebrow').textContent(),'RITMO · OUTBOUND CALL');assert.equal(await app.locator('#transition p').textContent(),'Preparing your customer conversation');
 await app.locator('#handoff').waitFor();assert.equal(await app.locator('#handoff-title').textContent(),`Ready to Speak with ${name}`);assert.equal(await app.locator('#handoff-company').textContent(),`${company} · ${role}`);assert.equal(await app.locator('.handoff-note').textContent(),'Your customer conversation is ready.');assert.equal(await app.locator('#return-button').isVisible(),false);assert.equal(await app.locator('.prototype-label').isVisible(),false);assert.equal(await app.evaluate(()=>events.length),0);
 assert.equal(await app.locator('.call-mark').evaluate(e=>getComputedStyle(e).animationName),reduced?'none':'call-ready-glow');
 if(!embedded&&!reduced)await page.screenshot({path:`/tmp/${key}-ready.png`});
 await app.waitForFunction(()=>events.length===1);const result=await app.evaluate(()=>({events,states,box:document.querySelector('#simulation-exit').getBoundingClientRect().toJSON(),color:getComputedStyle(document.querySelector('#simulation-exit')).backgroundColor,inert:document.querySelector('.viewport').inert}));
 const connecting=result.states.find(s=>s.state.screen==='connecting').t,ready=result.states.find(s=>s.state.screen==='handoff').t;
 assert.ok(ready-connecting>=1950);assert.ok(result.events[0].t-ready>=(reduced?2950:3650));assert.equal(result.events[0].opacity,'1');assert.equal(result.events[0].animations,0);assert.equal(result.color,'rgb(0, 0, 0)');assert.equal(result.inert,true);assert.equal(result.box.x,0);assert.equal(result.box.y,0);assert.ok(Math.abs(result.box.width-width)<1);assert.ok(Math.abs(result.box.height-height)<1);
 assert.deepEqual(result.events[0].data,{type:'ritmo:launchSimulation',customer:key,transitionComplete:true});
 if(embedded){await page.waitForTimeout(100);let messages=await page.evaluate(()=>received);assert.equal(messages.length,wrong?0:1);if(!wrong){assert.deepEqual(messages[0].data,result.events[0].data);assert.equal(messages[0].fromFrame,true);}}
 await page.waitForTimeout(700);assert.equal(await app.evaluate(()=>events.length),1);if(!embedded&&!reduced)await page.screenshot({path:`/tmp/${key}-solid-black.png`});assert.deepEqual(errors,[]);await page.close();console.log('PASS '+name+' '+JSON.stringify({embedded,wrong,reduced,width,height}));
}
for(const customer of [
 ['maya-patel','Maya Patel','Brightside Creative','Operations Manager','maya'],
 ['daniel-brooks','Daniel Brooks','Northstar Consulting','Director of Client Services','daniel'],
 ['renee-alvarez','Renee Alvarez','Summit Logistics','VP of Operations','renee'],
]) await Promise.all([run(customer),run(customer,{embedded:true}),run(customer,{embedded:true,wrong:true}),run(customer,{reduced:true,width:390,height:844})]);
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
