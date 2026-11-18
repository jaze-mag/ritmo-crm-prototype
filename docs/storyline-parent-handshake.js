/* Run once in the SAME window as the existing Storyline message listener.
   Keep the existing SelectedCustomer/conditional-navigation listener in place.
   This adapter establishes the channel; it does not navigate or call GetPlayer. */
(() => {
  if (window.ritmoHandshakeInstalled) return;
  window.ritmoHandshakeInstalled = true;
  const prototypeOrigin = 'https://jaze-mag.github.io';
  const connections = new WeakMap();
  function isRitmoFrame(frame) {
    try {
      const url = new URL(frame.src, location.href);
      return url.origin === prototypeOrigin && url.pathname.startsWith('/ritmo-crm-prototype/');
    } catch { return false; }
  }
  window.addEventListener('message', event => {
    if (event.origin !== prototypeOrigin) return;
    const frame = [...document.querySelectorAll('iframe')].find(item => item.contentWindow === event.source && isRitmoFrame(item));
    if (!frame) return;
    const data = event.data;
    if (!data || typeof data !== 'object') return;
    if (data.type === 'ritmo:connect' && typeof data.nonce === 'string' && /^[a-f0-9]{32}$/.test(data.nonce)) {
      if (connections.get(event.source)?.nonce !== data.nonce) connections.set(event.source, { nonce: data.nonce, received: false });
      event.source.postMessage({ type: 'ritmo:ready', nonce: data.nonce }, event.origin);
    } else if (data.type === 'ritmo:launchSimulation' && data.transitionComplete === true && ['maya', 'daniel', 'renee'].includes(data.customer)) {
      const connection = connections.get(event.source);
      if (!connection || connection.received) return;
      connection.received = true;
      event.source.postMessage({ type: 'ritmo:simulationReceived', nonce: connection.nonce }, event.origin);
      console.info('[Ritmo handshake] Completion received; existing Storyline listener handles navigation.');
    }
  });
  // Supports a listener installed after the prototype's initial discovery period,
  // as well as later Web Object iframe loads. No customer data is sent here.
  function request(frame) {
    if (isRitmoFrame(frame)) frame.contentWindow.postMessage({ type: 'ritmo:requestHandshake' }, prototypeOrigin);
  }
  document.querySelectorAll('iframe').forEach(request);
  document.addEventListener('load', event => { if (event.target.tagName === 'IFRAME') request(event.target); }, true);
})();
