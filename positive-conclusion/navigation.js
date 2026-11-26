(() => {
  'use strict';
  const embedded = window.parent !== window;
  const nonce = Array.from(crypto.getRandomValues(new Uint32Array(4)), n => n.toString(16).padStart(8,'0')).join('');
  let origin = null, pending = null, attempts = 0, timer;
  const status = text => { document.querySelector('#status').textContent = text; console.info('[Ritmo conclusion]',text); };
  function explain(text) { document.querySelector('#destination').textContent = text; document.querySelector('dialog').showModal(); }
  function connect() { if (embedded && !origin) window.parent.postMessage({type:'ritmo:connect',nonce},'*'); }
  function flush() {
    if (origin && pending) window.parent.postMessage(pending,origin);
  }
  function tick() {
    if (++attempts > 30) {
      clearInterval(timer);
      if (pending) status('Navigation is waiting for the Storyline listener. Reopen this conclusion after checking the host setup.');
      return;
    }
    connect(); flush();
  }
  function start() { clearInterval(timer); attempts = 0; tick(); timer = setInterval(tick,1000); }
  window.addEventListener('message', event => {
    if (!embedded || event.source !== window.parent || !event.data || typeof event.data !== 'object') return;
    const data = event.data;
    if (data.type === 'ritmo:requestHandshake') { start(); return; }
    if (data.nonce !== nonce || !/^https?:\/\//.test(event.origin)) return;
    if (data.type === 'ritmo:ready' && !origin) {
      origin = event.origin; status('Storyline parent connected.');
      if (pending) flush(); else clearInterval(timer);
    }
    if (data.type === 'ritmo:conclusionNavigationReceived' && event.origin === origin && pending && data.requestId === pending.requestId) {
      clearInterval(timer);
      if (data.accepted === true) {
        status('Navigation received by Storyline.');
      } else {
        pending = null;
        document.querySelectorAll('[data-action]').forEach(b => b.disabled = false);
        explain('Storyline could not handle this action. Check the conclusion listener and navigation triggers.');
      }
    }
  });
  window.RitmoConclusionNavigation = Object.freeze({send(action) {
    if (!['retry','customers','finish'].includes(action) || pending) return;
    if (!embedded) {
      if (action === 'customers') { location.assign(new URL('../index.html?ritmoReturn=customers&v=conclusion-return-2',location.href)); return; }
      explain(action === 'retry' ? 'Maya retry requires the published Storyline project. A fresh Devlin session reset has not yet been configured.' : 'Finish Experience requires Storyline to open the Ritmo Experience Complete slide.');
      return;
    }
    pending = {type:'ritmo:conclusionNavigation',nonce,requestId:nonce+':1',action,customer:'maya',outcome:document.body.dataset.outcome};
    document.querySelectorAll('[data-action]').forEach(b => b.disabled = true);
    status('Waiting for Storyline navigation…'); start();
  }});
  window.addEventListener('pagehide',()=>clearInterval(timer));
  if (embedded) start();
})();
