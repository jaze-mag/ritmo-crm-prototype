const {chromium}=require('playwright');const assert=require('node:assert/strict');
(async()=>{for(const policy of ['document-user-activation-required','no-user-gesture-required']){
const b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox','--autoplay-policy='+policy]});try{for(const kind of ['positive','negative']){
 const p=await b.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{window.audible=[];window.ended=[];const Native=window.Audio;window.Audio=function(src){const a=new Native(src);a.addEventListener('playing',()=>{if(!a.muted&&a.volume>0)audible.push({name:src,t:performance.now()});});a.addEventListener('ended',()=>ended.push(src));return a;};});
 await p.goto('http://127.0.0.1:8042/'+kind+'-conclusion/');
 await p.waitForFunction(()=>RitmoConclusion.getState()==='complete');await p.waitForTimeout(1500);
 if(policy==='no-user-gesture-required'){
 const cues=await p.evaluate(()=>audible);assert.deepEqual(cues.map(c=>c.name),['assets/whoosh.wav','assets/confirmation.wav','assets/stage.wav','assets/manager.wav']);
 for(const [i,t] of [[1,3600],[2,4900],[3,6600]]) assert.ok(Math.abs(cues[i].t-cues[0].t-t)<400,JSON.stringify(cues));
 assert.equal(await p.evaluate(()=>ended.length),4);
 } else { const names=await p.evaluate(()=>audible.map(c=>c.name));assert.ok(names.length<=4);assert.equal(new Set(names).size,names.length); }
 assert.equal(await p.locator('#audio-start').isVisible(),false);
 await p.locator('#open-manager').click();assert.equal(await p.locator('#manager-message').isVisible(),true);
 await p.evaluate(()=>{audible=[];ended=[];RitmoConclusion.replay();});await p.waitForFunction(()=>RitmoConclusion.getState()==='playing');await p.waitForFunction(()=>RitmoConclusion.getState()==='complete');await p.waitForTimeout(1500);assert.equal(await p.evaluate(()=>audible.length),4);
 assert.deepEqual(errors,[]);console.log('PASS',policy,kind,'automatic playback without prompt, permitted audio timings, replay and envelope');await p.close();
}}finally{await b.close();}
}})().catch(e=>{console.error(e);process.exitCode=1;});
