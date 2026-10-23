const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--no-proxy-server','--disable-dev-shm-usage'],env:{...process.env,XDG_CACHE_HOME:'/tmp/ritmo-cache',XDG_CONFIG_HOME:'/tmp/ritmo-config'}});
 try {
 const page=await browser.newPage({viewport:{width:1280,height:720},reducedMotion:'reduce'});
 await page.addInitScript(()=>{
  const decode=HTMLImageElement.prototype.decode;
  HTMLImageElement.prototype.decode=async function(){
   await decode.call(this);
   await new Promise(resolve=>setTimeout(resolve,this.src.includes('maya')?350:180));
   if(window.failBrief) throw Error('Simulated decode failure');
   this.dataset.decoded=this.src;
  };
  window.framesWrong=[];window.visibleFrames=0;window.selected=null;
  window.addEventListener('ritmo:statechange',e=>window.selected=e.detail.customerId);
  function sample(){
   const modal=document.querySelector('#customer-brief'),img=document.querySelector('#brief-image');
   if(modal && !modal.hidden){
    window.visibleFrames++;
    if(!window.selected || !img.currentSrc.includes(window.selected.split('-')[0]) || img.dataset.decoded!==img.src) window.framesWrong.push({selected:window.selected,src:img.currentSrc});
   }
   requestAnimationFrame(sample);
  }
  requestAnimationFrame(sample);
 });
 await page.goto('http://127.0.0.1:8000/');
 const open=async name=>{await page.locator(`[data-customer^="${name}"]`).click();await page.locator('#customer-brief').waitFor();await page.waitForTimeout(40)};
 for(let repeat=0;repeat<2;repeat++){
  for(const [from,to,call] of [['maya','daniel',false],['daniel','renee',false],['renee','maya',false],['maya','renee',true],['daniel','maya',true],['renee','daniel',true]]){
   await open(from);
   if(call){await page.locator('#call-prospect').click();await page.locator('#return-button').click();}
   else await page.locator('#back-customers').click();
   await open(to);await page.locator('#back-customers').click();
  }
 }
 // Latest selection wins even when the first decode completes last.
 await page.evaluate(()=>{document.querySelector('[data-customer^="maya"]').click();document.querySelector('[data-customer^="daniel"]').click();document.querySelector('[data-customer^="renee"]').click()});
 await page.locator('#customer-brief').waitFor();await page.waitForTimeout(450);
 assert.ok((await page.locator('#brief-title').textContent()).includes('Renee'));
 await page.locator('#back-customers').click();
 await page.locator('[data-customer^="maya"]').click();await page.keyboard.press('Escape');await page.waitForTimeout(450);
 assert.equal(await page.locator('#customer-brief').isVisible(),false);
 // A failed image must leave the CRM usable; retry must succeed.
 await page.evaluate(()=>window.failBrief=true);await page.locator('[data-customer^="daniel"]').click();await page.waitForTimeout(400);
 assert.equal(await page.locator('#customer-brief').isVisible(),false);
 assert.ok((await page.locator('#announcement').textContent()).includes('could not load'));
 await page.evaluate(()=>window.failBrief=false);await open('daniel');
 assert.deepEqual(await page.evaluate(()=>window.framesWrong),[]);
 assert.ok(await page.evaluate(()=>window.visibleFrames>20));
 console.log('PASS: six switching sequences repeated, delayed/out-of-order decoding, every-frame identity checks, Escape cancellation, failure and retry.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
