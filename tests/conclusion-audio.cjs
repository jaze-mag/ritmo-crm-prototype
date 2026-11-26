const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{for(const policy of ['document-user-activation-required','no-user-gesture-required']){
const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--autoplay-policy='+policy]});try{for(const kind of ['positive','negative']){
 const p=await b.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{window.audible=[];window.ended=[];const Native=window.Audio;window.Audio=function(src){const a=new Native(src);a.addEventListener('playing',()=>{if(!a.muted&&a.volume>0)audible.push({name:src,t:performance.now()});});a.addEventListener('ended',()=>ended.push(src));return a;};});
 await p.goto('http://127.0.0.1:8042/'+kind+'-conclusion/');
 if(policy==='document-user-activation-required'){
 await p.locator('#start-conclusion').waitFor();assert.equal(await p.evaluate(()=>RitmoConclusion.getState()),'waiting');assert.equal(await p.evaluate(()=>audible.length),0);
 await p.waitForTimeout(800);await p.locator('#start-conclusion').focus();await p.keyboard.press('Enter');
 }
 await p.waitForFunction(()=>RitmoConclusion.getState()==='complete');await p.waitForTimeout(1500);
 const cues=await p.evaluate(()=>audible);assert.deepEqual(cues.map(c=>c.name),['assets/whoosh.wav','assets/confirmation.wav','assets/stage.wav','assets/manager.wav']);
 for(const [i,t] of [[1,3600],[2,4900],[3,6600]]) assert.ok(Math.abs(cues[i].t-cues[0].t-t)<400,JSON.stringify(cues));
 assert.equal(await p.evaluate(()=>ended.length),4);assert.equal(await p.locator('#audio-start').isVisible(),false);
 await p.locator('#open-manager').click();assert.equal(await p.locator('#manager-message').isVisible(),true);
 await p.evaluate(()=>{audible=[];ended=[];RitmoConclusion.replay();});await p.waitForFunction(()=>RitmoConclusion.getState()==='playing');await p.waitForFunction(()=>RitmoConclusion.getState()==='complete');await p.waitForTimeout(1500);assert.equal(await p.evaluate(()=>audible.length),4);
 assert.deepEqual(errors,[]);console.log('PASS',policy,kind,'all 4 audible playing/ended events, timings, keyboard start, replay and envelope');await p.close();
}}finally{await b.close();}
}})().catch(e=>{console.error(e);process.exitCode=1;});
