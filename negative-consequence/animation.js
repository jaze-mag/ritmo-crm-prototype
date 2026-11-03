(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const scene = byId('scene');
  const reveals = [...scene.querySelectorAll('[data-reveal]')];
  const accents = [...scene.querySelectorAll('.accent')];
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let animations = [];
  let generation = 0;
  let ready = false;
  let continued = false;
  let state = 'loading';

  function setState(next) {
    state = next;
    scene.dataset.state = next;
    scene.setAttribute('aria-busy', String(next === 'loading' || next === 'playing'));
    dispatchEvent(new CustomEvent('ritmo:negative-statechange', { detail: { state: next, customerId: 'maya-patel' } }));
  }
  function cancelAnimations() {
    ++generation;
    animations.forEach(animation => animation.cancel());
    animations = [];
  }
  function complete() {
    const moveFocus = document.activeElement === byId('skip');
    cancelAnimations();
    reveals.forEach(element => { element.style.opacity = '1'; });
    accents.forEach(accent => { accent.hidden = true; });
    byId('skip').hidden = true;
    byId('replay').hidden = false;
    byId('continue').hidden = false;
    setState('complete');
    byId('status').textContent = 'Follow-up needed. The opportunity is at risk. No demo is scheduled; Maya’s concerns remain unresolved.';
    if (moveFocus) byId('continue').focus();
  }
  function fade(name, delay, duration) {
    const element = scene.querySelector(`[data-reveal="${name}"]`);
    animations.push(element.animate([{opacity: 0}, {opacity: 1}], {delay, duration, easing: 'ease', fill: 'forwards'}));
  }
  function highlight(name, delay, duration) {
    const accent = scene.querySelector(`[data-accent="${name}"]`);
    animations.push(accent.animate([{opacity: 0}, {opacity: 1, offset: .35}, {opacity: 0}], {delay, duration, easing: 'ease-in-out', fill: 'forwards'}));
  }
  function play() {
    if (!ready || state === 'playing') return false;
    const moveFocus = document.activeElement === byId('replay') || document.activeElement === byId('continue');
    cancelAnimations();
    const run = generation;
    continued = false;
    byId('continue').disabled = false;
    byId('continue').textContent = 'Continue';
    byId('controls').hidden = false;
    byId('skip').hidden = false;
    byId('replay').hidden = true;
    byId('continue').hidden = true;
    reveals.forEach(element => { element.style.opacity = '0'; });
    accents.forEach(accent => { accent.hidden = false; });
    setState('playing');
    byId('status').textContent = 'Maya’s opportunity update.';
    if (moveFocus) byId('skip').focus();
    if (motion.matches) { complete(); return true; }
    fade('screen', 0, 500);
    fade('badge', 500, 350);
    highlight('badge', 850, 650);
    fade('stage', 1500, 600);
    // Color on the inline glyphs only; no rectangle, shadow, scale, or movement.
    animations.push(byId('stage-text').animate([
      { color: '#315c59' }, { color: '#102f2d', offset: .45 }, { color: '#315c59' },
    ], { delay: 1800, duration: 700, easing: 'ease-in-out', fill: 'forwards' }));
    fade('calendar', 2500, 650);
    highlight('calendar', 2900, 600);
    fade('message', 3500, 1000);
    Promise.all(animations.map(animation => animation.finished)).then(() => {
      if (generation === run && state === 'playing') complete();
    }).catch(() => { /* Skip/replay or page exit cancelled this run. */ });
    return true;
  }
  function skip() {
    if (state !== 'playing') return false;
    complete();
    return true;
  }
  function continueResult() {
    if (state !== 'complete' || continued) return false;
    continued = true;
    byId('continue').textContent = 'Completed';
    byId('continue').disabled = true;
    byId('status').textContent = 'Result acknowledged. You can replay this confirmation.';
    // Local event only. A future host adapter can listen and decide navigation.
    dispatchEvent(new CustomEvent('ritmo:negative-continue', { detail: { customerId: 'maya-patel', outcome: 'at-risk' } }));
    return true;
  }
  byId('skip').addEventListener('click', skip);
  byId('replay').addEventListener('click', play);
  byId('continue').addEventListener('click', continueResult);
  motion.addEventListener('change', () => { if (motion.matches) skip(); });
  addEventListener('pagehide', () => { cancelAnimations(); });
  addEventListener('pageshow', event => { if (event.persisted && ready) { setState('idle'); play(); } });
  window.RitmoNegative = Object.freeze({ play, replay: play, skip, continue: continueResult, getState: () => ({ state, continued }) });
  Promise.all([byId('artwork').decode(), document.fonts.ready]).then(() => {
    ready = true;
    setState('idle');
    play();
  }).catch(() => {
    setState('error');
    byId('load-error').hidden = false;
    byId('status').textContent = 'The consequence artwork could not load.';
  });
})();
