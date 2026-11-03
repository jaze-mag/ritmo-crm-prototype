const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const b=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--no-proxy-server'],env:{...process.env,XDG_CACHE_HOME:'/tmp/ritmo-cache',XDG_CONFIG_HOME:'/tmp/ritmo-config'}});
 try{
 const base=process.env.RITMO_TEST_BASE||'http://127.0.0.1:8000/';
 for(const deviceScaleFactor of [1,2]){
  const page=await b.newPage({viewport:{width:1400,height:900},deviceScaleFactor,reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route(base+'iframe-test',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><style>body{margin:0}iframe{border:0;display:block;width:1280px;height:720px}</style><iframe title="Web Object preview" src="./positive-consequence/"></iframe>'}));
  await page.goto(base+'iframe-test');
  const app=page.frameLocator('iframe');
  await app.locator('#scene[data-state="complete"]').waitFor();
  for(const [width,height] of [[1280,720],[960,540]]){
   await page.locator('iframe').evaluate((el,size)=>{el.style.width=size[0]+'px';el.style.height=size[1]+'px'},[width,height]);
   await app.locator('#scene').evaluate(()=>new Promise(requestAnimationFrame));
   const screen=await app.locator('.screen').boundingBox();
   const ratio=width/1280;
   assert.ok(Math.abs(screen.x-210*ratio)<.1 && Math.abs(screen.y-76*ratio)<.1);
   assert.ok(Math.abs(screen.width-870*ratio)<.1 && Math.abs(screen.height-518*ratio)<.1);
   assert.equal(await app.locator('#scene').evaluate(e=>getComputedStyle(e).transform),'none');
   assert.equal(await app.locator('#stage-text').evaluate(e=>getComputedStyle(e).backgroundColor),'rgba(0, 0, 0, 0)');
   for(const selector of ['h1','.badge','.opportunity','.calendar','.message','.controls']){
    const box=await app.locator(selector).boundingBox();
    assert.ok(box.x>=screen.x-.1 && box.y>=screen.y-.1 && box.x+box.width<=screen.x+screen.width+.1 && box.y+box.height<=screen.y+screen.height+.1,selector+' fits display');
   }
   assert.equal(await app.locator('.screen').evaluate(el=>[...el.querySelectorAll('h1,h2,h3,p,span')].every(e=>e.scrollWidth<=e.clientWidth+1 || getComputedStyle(e).display==='inline')),true);
   await app.locator('#replay').click();await app.locator('#continue').click();
   assert.equal(await app.locator('#continue').textContent(),'Completed');
   await page.screenshot({path:`/tmp/ritmo-positive-iframe-${width}-${deviceScaleFactor}.png`});
  }
  assert.deepEqual(errors,[]);await page.close();
 }
 console.log('PASS iframe/Web Object simulation: native live text, no transforms, correct device bounds, no overflow, replay/continue, DPR 1 and 2.');
 }finally{await b.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
