/* Add alongside the existing CRM listener/handshake in the SAME immediate parent.
   Run on the CRM and BOTH conclusion Web Object slides. Does not replace bridge.js.
   GetPlayer must be available here. See conclusion-navigation.md for triggers. */
(() => {
  if (window.ritmoConclusionListenerInstalled) return;
  window.ritmoConclusionListenerInstalled = true;
  const prototypeOrigin = 'https://jaze-mag.github.io';
  const connections = new WeakMap();
  window.addEventListener('message', event => {
    if (event.origin !== prototypeOrigin) return;
    const frame = [...document.querySelectorAll('iframe')].find(f => f.contentWindow === event.source);
    if (!frame) return;
    let url;
    try { url = new URL(frame.src,location.href); } catch { return; }
    if (url.origin !== prototypeOrigin || !url.pathname.startsWith('/ritmo-crm-prototype/')) return;
    const data = event.data;
    if (!data || typeof data !== 'object') return;
    const reply = message => event.source.postMessage(message,event.origin);
    const player = typeof GetPlayer === 'function' ? GetPlayer() : null;
    if (data.type === 'ritmo:connect' && /^[a-f0-9]{32}$/.test(data.nonce)) {
      let connection = connections.get(event.source);
      if (!connection || connection.nonce !== data.nonce) {
        connection = {nonce:data.nonce,requests:new Map()}; connections.set(event.source,connection);
      }
      reply({type:'ritmo:ready',nonce:data.nonce});
      if (player?.GetVar('RitmoReturnToCustomers') === true) reply({type:'ritmo:resumeCustomers',nonce:data.nonce});
      return;
    }
    const connection = connections.get(event.source);
    if (!connection || data.nonce !== connection.nonce || data.type !== 'ritmo:conclusionNavigation' ||
        !/\/(positive|negative)-conclusion\/(index.html)?$/.test(url.pathname) ||
        !['retry','customers','finish'].includes(data.action) || data.customer !== 'maya' ||
        !['positive','negative'].includes(data.outcome) || data.requestId !== data.nonce+':1') return;
    const ack = accepted => reply({type:'ritmo:conclusionNavigationReceived',nonce:data.nonce,requestId:data.requestId,accepted});
    if (connection.requests.has(data.requestId)) { ack(connection.requests.get(data.requestId)); return; }
    if (!player) { ack(false); return; }
    // Set the routing variable LAST; Storyline variable-change triggers own navigation.
    try {
      player.SetVar('RitmoNavigationAction','');
      if (data.action === 'customers') player.SetVar('RitmoReturnToCustomers',true);
      if (data.action === 'retry') {
        player.SetVar('SelectedCustomer','maya');
        player.SetVar('SelectedOutcome','');
        player.SetVar('Sim_CharMood','neutral');
        player.SetVar('Sim_Score',0);
        player.SetVar('Sim_EvalComplete',false);
        // These resets do NOT reset a Devlin session. Host reset integration is still required.
      }
      connection.requests.set(data.requestId,true);
      ack(true);
      player.SetVar('RitmoNavigationAction',data.action);
    } catch (error) {
      connection.requests.set(data.requestId,false); ack(false);
      console.error('[Ritmo conclusion] Host navigation setup failed.',error);
    }
  });
  const request = frame => {
    try { const url = new URL(frame.src,location.href);
      if (url.origin === prototypeOrigin && url.pathname.startsWith('/ritmo-crm-prototype/')) frame.contentWindow.postMessage({type:'ritmo:requestHandshake'},prototypeOrigin);
    } catch {}
  };
  document.querySelectorAll('iframe').forEach(request);
  document.addEventListener('load',event=>{if(event.target.tagName==='IFRAME')request(event.target);},true);
})();
