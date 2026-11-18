const {chromium}=require('playwright');const assert=require('node:assert/strict');const fs=require('node:fs');
const child='http://127.0.0.1:8020';const parent='http://127.0.0.1:8021';
const adapter=fs.readFileSync('docs/storyline-parent-handshake.js','utf8').replace("'https://jaze-mag.github.io'",JSON.stringify(child)).replace("url.pathname.startsWith('/ritmo-crm-prototype/')","url.pathname === '/'");
const server=require('node:http').createServer((req,res)=>{const mode=new URL(req.url,parent).searchParams.get('mode');res.setHeader('Content-Type','text/html');res.end(`<script>window.received=[];window.hello=null;addEventListener('message',e=>{if(e.data?.type==='ritmo:connect')hello=e.data;if(e.data?.type==='ritmo:launchSimulation')received.push({data:e.data,sourceOK:e.source===document.querySelector('iframe').contentWindow,origin:e.origin});});</script><iframe src="${child}/" style="width:1280px;height:720px"></iframe>${mode==='normal'?'<script>'+adapter+'</script>':''}`);});
(async()=>{await new Promise(resolve=>server.listen(8021,'127.0.0.1',resolve));const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--no-proxy-server','--disable-dev-shm-usage'],env:{...process.env,XDG_CACHE_HOME:'/tmp/ritmo-cache',XDG_CONFIG_HOME:'/tmp/ritmo-config'}});try{await Promise.all([
 ['maya-patel','maya','normal'],['daniel-brooks','daniel','normal'],['renee-alvarez','renee','normal'],['maya-patel','maya','late'],['maya-patel','maya','invalid'],['maya-patel','maya','missing'],['maya-patel','maya','standalone']
].map(async([id,key,mode])=>{const context=await browser.newContext();await context.addInitScript(()=>{window.completed=[];addEventListener('ritmo:launchSimulation',e=>completed.push({data:e.detail,opacity:getComputedStyle(document.querySelector('#simulation-exit')).opacity,animations:document.querySelector('#simulation-exit').getAnimations().length}));});const page=await context.newPage();const errors=[],logs=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',e=>logs.push(e.text()));

await page.goto(mode==='standalone'?child+'/':parent+'/host?mode='+mode);let app=page;if(mode!=='standalone'){await page.frameLocator('iframe').locator('.customer').last().waitFor();app=page.frames()[1];}else await page.locator('.customer').last().waitFor();
if(mode==='invalid'){
 await page.waitForFunction(()=>hello);
 await page.evaluate(child=>document.querySelector('iframe').contentWindow.postMessage({type:'ritmo:ready',nonce:'wrong-nonce'},child),child);
 const nonce=await page.evaluate(()=>hello.nonce);
 await app.evaluate(nonce=>window.postMessage({type:'ritmo:ready',nonce},location.origin),nonce); // Correct token, WRONG source (self).
}
await app.locator(`[data-customer="${id}"]`).click();await app.locator('#call-prospect').click();await app.waitForFunction(()=>completed.length===1);await page.waitForTimeout(150);
const completed=await app.evaluate(()=>window.completed);assert.deepEqual(completed[0],{data:{type:'ritmo:launchSimulation',customer:key,transitionComplete:true},opacity:'1',animations:0});
if(mode==='late'){assert.equal(await page.evaluate(()=>received.length),0);await page.evaluate(adapter=>{(0,eval)(adapter)},adapter);await page.waitForFunction(()=>received.length===1);}
if(mode==='normal'||mode==='late'){
 await page.waitForFunction(()=>received.length===1);const received=await page.evaluate(()=>received[0]);assert.deepEqual(received.data,completed[0].data);assert.equal(received.sourceOK,true);assert.equal(received.origin,child);
 await page.evaluate(child=>{for(let i=0;i<3;i++)document.querySelector('iframe').contentWindow.postMessage({type:'ritmo:ready',nonce:hello.nonce},child)},child);
 await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>received.length),1);assert.ok(logs.some(x=>x.includes('Parent listener acknowledged completion')));
}else if(mode!=='standalone'){assert.equal(await page.evaluate(()=>received.length),0);assert.ok(logs.some(x=>x.includes('Completion is queued')));}else assert.ok(logs.some(x=>x.includes('Standalone mode')));
assert.deepEqual(errors,[]);console.log('PASS '+key+' '+mode);await context.close();}));}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);process.exit(1)});
