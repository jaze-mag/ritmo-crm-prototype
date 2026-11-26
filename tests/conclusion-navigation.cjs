const {chromium}=require('playwright');const assert=require('node:assert/strict');const fs=require('node:fs');
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});try{
const base=process.env.RITMO_TEST_BASE||'http://127.0.0.1:8040/';
const adapter=fs.readFileSync('docs/storyline-conclusion-listener.js','utf8').replace("https://jaze-mag.github.io",new URL(base).origin);
for(const outcome of ['positive','negative'])for(const action of ['retry','customers','finish']){
 const p=await browser.newPage({reducedMotion:'reduce'});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 if(action==='customers') await p.addInitScript(()=>Object.defineProperty(window,'sessionStorage',{get(){throw new DOMException('Blocked','SecurityError')}}));
 await p.route('**/ritmo-crm-prototype/**',async r=>{const response=await r.fetch({url:r.request().url().replace('/ritmo-crm-prototype','')});await r.fulfill({response});});
 await p.route('**/host',r=>r.fulfill({contentType:'text/html',body:`<script>window.values={SelectedOutcome:'positive',Sim_Score:99,Sim_EvalComplete:true};window.writes=[];function GetPlayer(){return {GetVar:k=>values[k],SetVar:(k,v)=>{values[k]=v;writes.push([k,v])}}}window.messages=[];addEventListener('message',e=>messages.push(e.data));</script><iframe allow="autoplay" src="${base}ritmo-crm-prototype/${outcome}-conclusion/" width="1280" height="720"></iframe>`}));
 await p.goto(base.replace('127.0.0.1','localhost')+'host');const f=p.frameLocator('iframe');await f.locator('[data-action='+action+']').click();
 await p.waitForTimeout(1100);assert.ok(await p.evaluate(()=>messages.some(m=>m.type==='ritmo:connect')));
 // No listener yet: request queued. Invalid nonce cannot establish a connection.
 await p.evaluate(()=>document.querySelector('iframe').contentWindow.postMessage({type:'ritmo:ready',nonce:'bad'},'*'));
 assert.equal(await p.evaluate(()=>messages.filter(m=>m.type==='ritmo:conclusionNavigation').length),0);
 await p.addScriptTag({content:adapter});await p.waitForFunction(a=>values.RitmoNavigationAction===a,action);
 assert.equal(await p.evaluate(()=>writes.filter(([k,v])=>k==='RitmoNavigationAction'&&v).length),1);
 await f.locator('[data-action='+action+']').evaluate(e=>e.click());await p.waitForTimeout(1100);
 assert.equal(await p.evaluate(()=>writes.filter(([k,v])=>k==='RitmoNavigationAction'&&v).length),1);
 if(action==='retry'){const v=await p.evaluate(()=>values);assert.equal(v.SelectedCustomer,'maya');assert.equal(v.SelectedOutcome,'');assert.equal(v.Sim_CharMood,'neutral');assert.equal(v.Sim_Score,0);assert.equal(v.Sim_EvalComplete,false);}
 if(action==='customers'){
   await p.evaluate(url=>document.querySelector('iframe').src=url,base+'ritmo-crm-prototype/');
   await f.locator('.customer:not(:disabled)').last().waitFor();assert.equal(await f.locator('.customer:not(:disabled)').count(),3);
   assert.equal(await f.locator('#brief-review-status').textContent(),'Choose any prospect to call.');
   await p.waitForTimeout(1200);assert.equal(await f.locator('#notification').isVisible(),false);
   for(let i=0;i<3;i++){
     if(i){await p.evaluate(()=>{const el=document.querySelector('iframe');el.src=el.src;});await f.locator('.customer:not(:disabled)').last().waitFor();}
     await f.locator('.customer').nth(i).click();await f.locator('#customer-brief').waitFor();
     assert.equal(await f.locator('#call-prospect').getAttribute('aria-disabled'),'false');
     await f.locator('#call-prospect').click();await f.locator('#handoff').waitFor();
   }
 }
 assert.deepEqual(errors,[]);await p.close();console.log('PASS cross-origin host adapter '+outcome+' '+action+' (mock Storyline variables, not Review 360)');
}
const p=await browser.newPage({reducedMotion:'reduce'});await p.goto(base);await p.locator('.customer').last().waitFor();assert.equal(await p.locator('.customer:disabled').count(),3);
await p.goto(base+'positive-conclusion/');await p.locator('[data-action=customers]').click();await p.locator('.customer:not(:disabled)').last().waitFor();assert.equal(await p.locator('.customer:not(:disabled)').count(),3);assert.ok(!p.url().includes('ritmoReturn'));
await p.reload();await p.locator('.customer:not(:disabled)').last().waitFor();await p.waitForTimeout(1200);assert.equal(await p.locator('#notification').isVisible(),false);
const stored=await p.evaluate(()=>JSON.parse(sessionStorage.getItem('ritmo.onboarding.v1')));assert.deepEqual(stored.reviewedBriefs,[]);
await p.locator('.customer').first().click();await p.locator('#customer-brief').waitFor();assert.equal(await p.locator('#call-prospect').getAttribute('aria-disabled'),'false');await p.close();console.log('PASS standalone return and first-time locks');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
