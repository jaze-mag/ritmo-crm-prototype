(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const intro = $('.intro'), conclusion = $('.conclusion');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let state = 'loading', generation = 0, animations = [], timers = [], sound = true, navigation = null;
  const audio = {whoosh: new Audio('assets/whoosh.wav'), confirmation: new Audio('assets/confirmation.wav'), stage: new Audio('assets/stage.wav'), manager: new Audio('assets/manager.wav')};
  audio.whoosh.volume = .45;
  audio.confirmation.volume = .9;
  audio.stage.volume = .9;
  audio.manager.volume = .9;
  const stagePulseAt = 4900;
  // Tolerate an older cached HTML document during a Pages rollout.
  if (!$('#audio-start')) {
    const panel = document.createElement('div'); panel.id = 'audio-start'; panel.hidden = true;
    panel.innerHTML = '<p id="audio-explanation"></p><button id="start-conclusion" aria-describedby="audio-explanation">Play conclusion</button>';
    $('.scene').append(panel);
  }
  const startPanel = $('#audio-start'), startButton = $('#start-conclusion');
  let starting = false, mediaUnavailable = false;
  function prepareAudio(a) {
    a.preload = 'auto';
    return new Promise((resolve, reject) => {
      let timer;
      const cleanup = () => { clearTimeout(timer); a.removeEventListener('canplaythrough',ready); a.removeEventListener('error',failed); };
      const ready = () => { cleanup(); resolve(); };
      const failed = () => { cleanup(); reject(new Error('Sound asset could not load.')); };
      a.addEventListener('canplaythrough',ready); a.addEventListener('error',failed);
      timer = setTimeout(failed,15000); a.load();
      if (a.readyState === 4) ready();
    });
  }
  function offerStart(unavailable = false) {
    mediaUnavailable = unavailable; state = 'waiting'; starting = false;
    startPanel.hidden = false;
    $('#audio-explanation').textContent = unavailable
      ? 'Sound could not load. You can continue without sound.'
      : 'Select Play conclusion to begin with sound.';
    startButton.textContent = unavailable ? 'Continue without sound' : 'Play conclusion';
  }
  async function startWithAudio() {
    if (starting || state === 'playing' || state === 'loading') return false;
    if (reduced.matches || !sound) { startPanel.hidden = true; return play(); }
    starting = true;
    const token = generation;
    try {
      // Probe with the actual first cue: muted playback cannot prove audible autoplay is allowed.
      audio.whoosh.currentTime = 0;
      await audio.whoosh.play();
      if (token !== generation) { audio.whoosh.pause(); starting = false; return false; }
      starting = false; startPanel.hidden = true;
      return play(true);
    } catch (error) {
      if (token !== generation) { starting = false; return false; }
      console.info('[Ritmo audio]',error.name,'— waiting for learner activation.');
      offerStart(error.name !== 'NotAllowedError'); return false;
    }
  }
  startButton.onclick = async () => {
    if (starting) return;
    if (mediaUnavailable) { sound = false; startPanel.hidden = true; state = 'idle'; play(); return; }
    starting = true;
    // Prime each element during this gesture, BEFORE the animation starts. No running cue is touched.
    const primes = Object.values(audio).map(a => {
      const volume = a.volume; a.volume = 0;
      return a.play().then(() => { a.pause(); a.currentTime = 0; }).finally(() => { a.volume = volume; });
    });
    const results = await Promise.allSettled(primes);
    starting = false;
    if (results.some(r => r.status === 'rejected')) { offerStart(true); return; }
    await startWithAudio();
  };
  function stop(preserveWhoosh = false) {
    generation++;
    animations.forEach(a => a.cancel()); animations = [];
    timers.forEach(clearTimeout); timers = [];
    Object.entries(audio).forEach(([name,a]) => { if (preserveWhoosh === true && name === 'whoosh') return; a.pause(); a.currentTime = 0; });
  }
  function cue(name) { if (sound) audio[name].play().catch(() => { $('#status').textContent = 'Audio unavailable. The animation continues without sound.'; }); }
  function later(callback, delay) { const token = generation; timers.push(setTimeout(() => { if (token === generation) callback(); }, delay)); }
  function animate(element, frames, delay, duration) {
    const animation = element.animate(frames, {delay, duration, fill:'both', easing:'ease-in-out'});
    animations.push(animation);
    return animation;
  }
  function reveal(element, delay, duration = 500) {
    const animation = animate(element, [{opacity:0},{opacity:1}], delay, duration);
    if (state === 'complete') animation.onfinish = () => {
      animation.cancel();
      animations = animations.filter(item => item !== animation);
    };
  }
  function resetManager() {
    $('.manager').classList.remove('manager-ready');
    $('.manager-prompt').hidden = false;
    $('#manager-message').hidden = true;
    $('#open-manager').setAttribute('aria-expanded','false');
  }
  $('#open-manager').onclick = () => {
    if (state !== 'complete' || !$('#manager-message').hidden) return;
    $('.manager').classList.remove('manager-ready');
    $('#open-manager').setAttribute('aria-expanded','true');
    $('.manager-prompt').hidden = true;
    $('#manager-message').hidden = false;
    $('#manager-message').focus({preventScroll:true});
    if (!reduced.matches) reveal($('#manager-message'),0,300);
  };
  function complete({notify = false} = {}) {
    stop(); state = 'complete'; intro.hidden = true; conclusion.style.opacity = 1; conclusion.inert = false;
    document.querySelectorAll('[data-reveal]').forEach(e => { e.style.opacity = 1; });
    if ($('#manager-message').hidden) {
      $('.manager').classList.add('manager-ready');
      if (notify) {
        if (!reduced.matches) {
          reveal($('.manager'),0,350);
          reveal($('[data-reveal="navigation"]'),0,350);
        }
        cue('manager');
      }
    }
    $('#status').textContent = 'Conclusion complete. A sales manager update and next-step actions are available.';
  }
  function play(whooshStarted = false) {
    if (state === 'playing' || state === 'loading') return false;
    stop(whooshStarted); startPanel.hidden = true; resetManager(); state = 'playing'; $('dialog').close(); intro.hidden = false; conclusion.inert = true;
    conclusion.style.opacity = 0;
    document.querySelectorAll('[data-reveal]').forEach(e => { e.style.opacity = 0; });
    if (reduced.matches) { complete(); return true; }
    reveal(intro,0,450); reveal($('.intro h1'),250,500); reveal($('.intro i'),500,400); reveal($('.intro p'),650,500);
    if (!whooshStarted) cue('whoosh');
    animate(intro,[{opacity:1},{opacity:0}],2800,500); reveal(conclusion,2800,500);
    ['header','banner','customer','opportunity'].forEach((key,i) => reveal($(`[data-reveal="${key}"]`),3000+i*600));
    reveal($('.symbol'),3800,450);
    animate($('.symbol'),[{color:'#315c59'},{color:document.body.dataset.outcome==='positive'?'#fffdf6':'#b37b32'},{color:document.body.dataset.outcome==='positive'?'#153e3b':'#783727'}],3800,650);
    animate($('.pill'),[{boxShadow:'0 0 0 0 transparent'},{boxShadow:`0 0 0 3px ${document.body.dataset.outcome==='positive'?'#79aaa5':'#efae87'}`},{boxShadow:'0 0 0 0 transparent'}],stagePulseAt,650);
    later(() => cue('stage'),stagePulseAt);
    later(() => cue('confirmation'),3600); later(() => complete({notify:true}),6600);
    return true;
  }
  document.querySelectorAll('[data-action]').forEach(button => button.onclick = () => {
    if (state !== 'complete') return;
    const action = button.dataset.action, detail = {action, customerId:'maya-patel', outcome:document.body.dataset.outcome};
    const event = new CustomEvent('ritmo:conclusion-navigation',{detail,cancelable:true});
    if (!window.dispatchEvent(event)) return;
    if (navigation) { navigation(detail); return; }
    window.RitmoConclusionNavigation.send(action);
  });
  $('#dismiss').onclick = () => $('dialog').close();
  window.RitmoConclusion = Object.freeze({play:()=>state === 'playing' || state === 'loading' ? false : startWithAudio(),replay:()=>startWithAudio(),skip:complete,getState:()=>state,setNavigation(handler){if(handler!==null && typeof handler!=='function')throw new TypeError('Expected a function or null');navigation=handler;}});
  reduced.addEventListener('change',() => {if(reduced.matches && state==='playing')complete();});
  window.addEventListener('pagehide',stop);
  window.addEventListener('pageshow',event=>{if(event.persisted){state='idle';startWithAudio();}});
  const audioReady = Promise.all(Object.values(audio).map(prepareAudio)).then(()=>true,()=>false);
  Promise.all([document.fonts.ready,...['assets/conclusion.png','assets/later-that-week.png'].map(src=>{const img=new Image();img.src=src;return img.decode();}),audioReady]).then(results=>{
    if(state !== 'loading') return;
    state='idle';
    if (!results[results.length-1] && !reduced.matches) offerStart(true);
    else startWithAudio();
  }).catch(()=>{complete();$('#status').textContent='Artwork could not load. Check the assets folder.';});
})();
