(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const intro = $('.intro'), conclusion = $('.conclusion');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let state = 'loading', generation = 0, animations = [], timers = [], sound = false, navigation = null;
  const audio = {whoosh: new Audio('assets/whoosh.wav'), confirmation: new Audio('assets/confirmation.wav')};
  audio.whoosh.volume = .45;
  audio.confirmation.volume = .9;
  function stop() {
    generation++;
    animations.forEach(a => a.cancel()); animations = [];
    timers.forEach(clearTimeout); timers = [];
    Object.values(audio).forEach(a => { a.pause(); a.currentTime = 0; });
  }
  function cue(name) { if (sound) audio[name].play().catch(() => { $('#status').textContent = 'Audio unavailable. The animation continues without sound.'; }); }
  function later(callback, delay) { const token = generation; timers.push(setTimeout(() => { if (token === generation) callback(); }, delay)); }
  function animate(element, frames, delay, duration) {
    const animation = element.animate(frames, {delay, duration, fill:'both', easing:'ease-in-out'});
    animations.push(animation);
  }
  function reveal(element, delay, duration = 500) { animate(element, [{opacity:0},{opacity:1}], delay, duration); }
  function complete() {
    stop(); state = 'complete'; intro.hidden = true; conclusion.style.opacity = 1; conclusion.inert = false;
    document.querySelectorAll('[data-reveal]').forEach(e => { e.style.opacity = 1; });
    const moveFocus = document.activeElement === $('#skip');
    $('#skip').hidden = true; $('#replay').hidden = false;
    if (moveFocus) $('#replay').focus();
    $('#status').textContent = 'Conclusion complete. Next-step actions are available.';
  }
  function play() {
    if (state === 'playing' || state === 'loading') return false;
    stop(); state = 'playing'; $('dialog').close(); intro.hidden = false; conclusion.inert = true;
    conclusion.style.opacity = 0;
    document.querySelectorAll('[data-reveal]').forEach(e => { e.style.opacity = 0; });
    const moveFocus = document.activeElement === $('#replay');
    $('#skip').hidden = false; $('#replay').hidden = true;
    if (moveFocus) $('#skip').focus();
    if (reduced.matches) { complete(); return true; }
    reveal(intro,0,450); reveal($('.intro h1'),250,500); reveal($('.intro i'),500,400); reveal($('.intro p'),650,500);
    cue('whoosh');
    animate(intro,[{opacity:1},{opacity:0}],2800,500); reveal(conclusion,2800,500);
    ['header','banner','customer','opportunity','manager','navigation'].forEach((key,i) => reveal($(`[data-reveal="${key}"]`),3000+i*600));
    reveal($('.symbol'),3800,450);
    animate($('.symbol'),[{color:'#315c59'},{color:document.body.dataset.outcome==='positive'?'#fffdf6':'#b37b32'},{color:document.body.dataset.outcome==='positive'?'#153e3b':'#783727'}],3800,650);
    animate($('.pill'),[{boxShadow:'0 0 0 0 transparent'},{boxShadow:`0 0 0 3px ${document.body.dataset.outcome==='positive'?'#79aaa5':'#efae87'}`},{boxShadow:'0 0 0 0 transparent'}],4900,650);
    later(() => cue('confirmation'),3600); later(complete,6600);
    return true;
  }
  $('#skip').onclick = complete; $('#replay').onclick = play;
  $('#sound').onclick = () => {
    sound = !sound; $('#sound').textContent = sound ? 'Sound On' : 'Sound Off'; $('#sound').setAttribute('aria-pressed',String(sound));
    if (sound) cue('whoosh'); else Object.values(audio).forEach(a => {a.pause();a.currentTime=0;});
  };
  const messages = {
    retry:'Restarting Maya’s simulation is not connected in this standalone preview. The Storyline host can connect this action when the simulation is ready.',
    customers:'Customer navigation is not connected in this standalone Web Object. Use the CRM dashboard to choose another customer.',
    finish:'The course finish destination is not connected in this standalone preview. The Storyline host can connect this action later.'
  };
  document.querySelectorAll('[data-action]').forEach(button => button.onclick = () => {
    if (state !== 'complete') return;
    const action = button.dataset.action, detail = {action, customerId:'maya-patel', outcome:document.body.dataset.outcome};
    const event = new CustomEvent('ritmo:conclusion-navigation',{detail,cancelable:true});
    if (!window.dispatchEvent(event)) return;
    if (navigation) { navigation(detail); return; }
    if (action === 'customers' && location.hostname === 'jaze-mag.github.io' && location.pathname.startsWith('/ritmo-crm-prototype/')) { location.assign('/ritmo-crm-prototype/'); return; }
    $('#destination').textContent = messages[action]; $('dialog').showModal();
  });
  $('#dismiss').onclick = () => $('dialog').close();
  window.RitmoConclusion = Object.freeze({play,replay:play,skip:complete,getState:()=>state,setNavigation(handler){if(handler!==null && typeof handler!=='function')throw new TypeError('Expected a function or null');navigation=handler;}});
  reduced.addEventListener('change',() => {if(reduced.matches && state==='playing')complete();});
  window.addEventListener('pagehide',stop);
  window.addEventListener('pageshow',event=>{if(event.persisted){state='idle';play();}});
  Promise.all([document.fonts.ready,...['assets/conclusion.png','assets/later-that-week.png'].map(src=>{const img=new Image();img.src=src;return img.decode();})]).then(()=>{if(state==='loading'){state='idle';play();}}).catch(()=>{complete();$('#status').textContent='Artwork could not load. Check the assets folder.';});
})();
