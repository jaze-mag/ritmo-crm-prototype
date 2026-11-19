(() => {
  'use strict';
const { createSession, customers } = window.Ritmo;

const byId = id => document.getElementById(id);
const stage = byId('stage');
const brief = byId('customer-brief');
const screenContent = [...document.querySelector('.screen').children].filter(element => element !== brief);
let lastCard = null;
let joining = false;
let briefRequest = 0;
let briefPending = false;
let keyboardNavigation = false;
// One onboarding attempt per browser tab, with an in-memory fallback when storage is denied.
const onboardingKey = 'ritmo.onboarding.v1';
let overviewCompleted = false;
const reviewedBriefs = new Set();
try {
  const saved = JSON.parse(sessionStorage.getItem(onboardingKey) || 'null');
  overviewCompleted = saved?.overviewCompleted === true;
  if (overviewCompleted && Array.isArray(saved?.reviewedBriefs)) {
    saved.reviewedBriefs.forEach(id => { if (customers.some(customer => customer.id === id)) reviewedBriefs.add(id); });
  }
} catch {}
function saveOnboarding() {
  try { sessionStorage.setItem(onboardingKey, JSON.stringify({overviewCompleted, reviewedBriefs:[...reviewedBriefs]})); } catch {}
}
function canStartCall() { return overviewCompleted && customers.every(customer => reviewedBriefs.has(customer.id)); }
function updateOnboarding() {
  document.querySelectorAll('.customer').forEach(card => {
    card.disabled = !overviewCompleted;
    card.querySelector('.customer-lock').hidden = overviewCompleted;
  });
  byId('open-overview').classList.toggle('overview-required', !overviewCompleted);
  byId('overview-instruction').hidden = overviewCompleted;
  byId('open-overview').toggleAttribute('aria-describedby', !overviewCompleted);
  if (!overviewCompleted) byId('open-overview').setAttribute('aria-describedby','overview-instruction');
  byId('call-prospect').setAttribute('aria-disabled', String(!canStartCall()));
  byId('brief-review-status').textContent = canStartCall()
    ? 'All 3 pre-call briefs reviewed · Choose a prospect to call.'
    : `Review all 3 pre-call briefs before calling · ${reviewedBriefs.size} of 3 reviewed.`;
}
function scheduleManagerMessage() {
  clearTimeout(managerTimer);
  if (!overviewCompleted || managerDismissed) return;
  managerTimer = setTimeout(() => {
    if (overviewCompleted && !managerDismissed && session.getState().screen === 'crm' && !joining && byId('role-overview').hidden) {
      byId('notification').hidden = false;
      byId('announcement').textContent = 'Message from your manager: Three qualified prospects are ready to talk. Choose one and find out what their team needs.';
    }
  }, 900);
}
function openOverview() {
  if (joining || briefPending || session.getState().screen !== 'crm') return;
  clearTimeout(managerTimer);
  byId('notification').hidden = true;
  byId('dashboard').hidden = true;
  byId('role-overview').hidden = false;
  byId('overview-scroll').scrollTop = 0;
  byId('overview-title').focus({preventScroll:true});
}
function completeOverview() {
  if (joining || byId('role-overview').hidden) return;
  overviewCompleted = true;
  saveOnboarding();
  byId('role-overview').hidden = true;
  byId('dashboard').hidden = false;
  updateOnboarding();
  byId('open-overview').focus({preventScroll:true});
  byId('announcement').textContent = 'Overview complete. Discovery calls unlocked. Review all three pre-call briefs before choosing a prospect to call.';
  scheduleManagerMessage();
}

let trustedParentOrigin = null;
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const embedded = window.parent !== window;
const handshakeNonce = Array.from(crypto.getRandomValues(new Uint32Array(4)), value => value.toString(16).padStart(8, '0')).join('');
let pendingCompletion = null;
let completionSent = false;
let receiptLogged = false;
let automaticMessaging = true;
let handshakeTimer;
let handshakeAttempts = 0;
const messagingLog = message => console.info(`[Ritmo messaging] ${message}`);
function validOrigin(origin) {
  const url = new URL(origin);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new TypeError('Provide an explicit HTTP(S) parent origin, without a path.');
  }
  return url.origin;
}
function sendPendingCompletion() {
  if (!embedded || !trustedParentOrigin || !pendingCompletion || completionSent) return;
  window.parent.postMessage(pendingCompletion, trustedParentOrigin);
  completionSent = true;
  messagingLog(`Completion sent to immediate parent at ${trustedParentOrigin}.`);
}
function configureParent(origin) {
  trustedParentOrigin = origin;
  clearInterval(handshakeTimer);
  messagingLog(`Configured immediate parent origin: ${origin}.`);
  sendPendingCompletion();
}
function requestParentHandshake() {
  if (!embedded || !automaticMessaging || trustedParentOrigin) return;
  // Discovery contains only protocol metadata, never simulation/customer data.
  window.parent.postMessage({ type: 'ritmo:connect', nonce: handshakeNonce }, '*');
}
window.addEventListener('message', event => {
  if (!embedded || event.source !== window.parent) return;
  const data = event.data;
  if (!data || typeof data !== 'object') return;
  if (data.type === 'ritmo:requestHandshake') { requestParentHandshake(); return; }
  if (data.nonce !== handshakeNonce) return;
  if (data.type === 'ritmo:ready' && automaticMessaging && !trustedParentOrigin) {
    try { configureParent(validOrigin(event.origin)); } catch { messagingLog('Parent connection rejected: origin must be HTTP(S).'); }
  } else if (data.type === 'ritmo:simulationReceived' && completionSent && !receiptLogged && event.origin === trustedParentOrigin) {
    receiptLogged = true;
    messagingLog('Parent listener acknowledged completion.');
  }
});
// Preserve explicit configuration for known hosts; null explicitly disables auto-discovery.
window.Ritmo.configureSimulationParent = origin => {
  const checked = origin === null ? null : validOrigin(origin);
  automaticMessaging = false;
  clearInterval(handshakeTimer);
  if (checked === null) { trustedParentOrigin = null; messagingLog('Parent messaging explicitly disabled.'); }
  else configureParent(checked);
};
if (embedded) {
  requestParentHandshake();
  handshakeTimer = setInterval(() => {
    if (++handshakeAttempts >= 30) {
      clearInterval(handshakeTimer);
      messagingLog('Parent connection unavailable: install the Storyline handshake listener in the immediate parent.');
      return;
    }
    requestParentHandshake();
  }, 1000);
} else messagingLog('Standalone mode: no parent connection required.');
window.addEventListener('pagehide', () => clearInterval(handshakeTimer));
window.addEventListener('pageshow', event => { if (event.persisted) requestParentHandshake(); });
async function finishSimulationTransition(customer) {
  await wait(3000);
  const overlay = byId('simulation-exit');
  overlay.hidden = false;
  document.querySelector('.viewport').inert = true;
  overlay.focus({ preventScroll: true });
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const fade = overlay.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 700, easing: 'ease-in-out', fill: 'both' });
    await fade.finished;
    fade.cancel(); // The underlying CSS keeps the final screen fully opaque.
  }
  // Let the final solid frame paint before handing control to a parent.
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const message = { type: 'ritmo:launchSimulation', customer, transitionComplete: true };
  window.dispatchEvent(new CustomEvent('ritmo:launchSimulation', { detail: message }));
  pendingCompletion = message;
  if (embedded && !trustedParentOrigin) {
    messagingLog('Fade complete; parent connection unavailable. Completion is queued until a valid handshake.');
    requestParentHandshake();
  }
  sendPendingCompletion();
}
// Tab-scoped persistence is optional: restricted/file origins may deny storage.
const managerDismissalKey = 'ritmo.managerMessageDismissed.v1';
let managerDismissed = false;
let managerTimer;
try { managerDismissed = sessionStorage.getItem(managerDismissalKey) === 'true'; } catch {}
function dismissManagerMessage() {
  managerDismissed = true;
  clearTimeout(managerTimer);
  byId('notification').hidden = true;
  byId('announcement').textContent = '';
  try { sessionStorage.setItem(managerDismissalKey, 'true'); } catch {}
}
document.addEventListener('keydown', event => {
  if (['Tab', 'Enter', ' ', 'Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) keyboardNavigation = true;
}, true);
document.addEventListener('pointerdown', () => { keyboardNavigation = false; }, true);
const session = createSession(state => {
  window.dispatchEvent(new CustomEvent('ritmo:statechange', { detail: state }));
});

function resize() {
  stage.style.setProperty('--scale', Math.min(window.innerWidth / 1280, window.innerHeight / 720));
}
window.addEventListener('resize', resize);
resize();

function updateClock() {
  const now = new Date();
  byId('clock').textContent = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(now);
  byId('clock').dateTime = now.toISOString();
}
updateClock();
setInterval(updateClock, 1000);

const office = byId('workstation');
function checkOffice() {
  const missing = !office.naturalWidth;
  office.hidden = missing;
  byId('asset-notice').hidden = !missing;
}
office.addEventListener('load', checkOffice);
office.addEventListener('error', checkOffice);
if (office.complete) checkOffice();

const accents = ['var(--light-teal)', 'var(--peach)', 'var(--dark-teal)'];
customers.forEach((customer, index) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.disabled = !overviewCompleted;
  button.className = 'customer';
  button.dataset.customer = customer.id;
  button.style.setProperty('--accent', accents[index]);
  button.setAttribute('aria-pressed', 'false');
  button.setAttribute('aria-haspopup', 'dialog');
  button.setAttribute('aria-controls', 'customer-brief');
  for (const [field, className] of [['name', 'customer-name'], ['company', 'customer-company'], ['role', 'customer-role'], ['difficulty', 'difficulty'], ['context', 'customer-context']]) {
    const span = document.createElement('span');
    span.className = className;
    span.textContent = customer[field];
    button.append(span);
  }
  const lock = document.createElement('span');
  lock.className = 'customer-lock';
  lock.setAttribute('aria-hidden','true');
  lock.innerHTML = '<svg viewBox="0 0 20 20"><rect x="4" y="8" width="12" height="10" rx="2"/><path d="M6 8V5a4 4 0 0 1 8 0v3"/><path d="M10 12v3"/></svg>';
  button.append(lock);
  button.addEventListener('click', () => openBrief(customer, button));
  byId('customers').append(button);
});
for (let i = 0; i < 56; i++) {
  const key = document.createElement('span');
  key.className = 'key';
  byId('keyboard').append(key);
}

async function openBrief(customer, button) {
  if (!overviewCompleted || !byId('role-overview').hidden || joining || !session.selectCustomer(customer.id)) return;
  dismissManagerMessage();
  lastCard = button;
  const request = ++briefRequest;
  briefPending = true;
  showBrief(false);
  // Decode a fresh image off-DOM: changing src on the displayed image can
  // leave its previous bitmap visible until the new request finishes.
  const artwork = byId('brief-image').cloneNode(false);
  artwork.src = customer.brief.artwork;
  try {
    await artwork.decode();
  } catch {
    if (request !== briefRequest) return;
    returnToCustomers();
    byId('announcement').textContent = 'The customer brief could not load. Please select the customer to try again.';
    return;
  }
  if (request !== briefRequest || session.getState().customerId !== customer.id) return;
  briefPending = false;
  document.querySelectorAll('.customer').forEach(card => card.setAttribute('aria-pressed', String(card === button)));
  byId('brief-title').textContent = `Pre-Call Brief: ${customer.name}`;
  byId('brief-summary').textContent = [
    `${customer.role}, ${customer.company}. Challenge Level: ${customer.difficulty.toLowerCase()}.`,
    'What We Know.', ...customer.brief.known,
    'Opportunity Status: Qualified. Next Step: Not Scheduled.',
    'Your Goal.', ...customer.brief.goals,
  ].join(' ');
  byId('brief-image').replaceWith(artwork);
  showBrief(true);
  reviewedBriefs.add(customer.id);
  saveOnboarding();
  updateOnboarding();
  byId('brief-title').focus();
}
function showBrief(visible) {
  stage.classList.toggle('brief-open', visible);
  brief.hidden = !visible;
  screenContent.forEach(element => { element.inert = visible; });
  byId('notification').inert = visible;
}
// Single handoff boundary for a future verified Storyline adapter.
// All prospects share the cinematic exit; no AI connection is made.
const simulationCustomers = Object.freeze({
  'maya-patel': 'maya', 'daniel-brooks': 'daniel', 'renee-alvarez': 'renee',
});
function renderHandoff(customer) {
  byId('handoff').classList.add('conversation-ready');
  byId('return-button').hidden = true;
  document.querySelector('.prototype-label').hidden = true;
  byId('handoff-title').textContent = `Ready to Speak with ${customer.name}`;
  byId('handoff-company').textContent = `${customer.company} · ${customer.role}`;
  byId('dashboard').hidden = true;
  byId('transition').hidden = true;
  byId('handoff').hidden = false;
  byId('handoff-title').focus();
}
async function startCall() {
  if (joining || briefPending || brief.hidden || session.getState().screen !== 'brief') return;
  if (!canStartCall()) {
    byId('announcement').textContent = byId('brief-review-status').textContent;
    return;
  }
  joining = true;
  const customer = customers.find(item => item.id === session.getState().customerId);
  showBrief(false);
  session.beginCall();
  byId('dashboard').inert = true;
  byId('transition').hidden = false;
  byId('notification').hidden = true;
  byId('connection-title').textContent = `Connecting with ${customer.name}...`;
  byId('transition').focus();
  await wait(2000);
  session.joinCall();
  renderHandoff(customer);
  await finishSimulationTransition(simulationCustomers[customer.id]);
  // Remain on black until the host navigates; duplicate calls stay guarded.
}
byId('call-prospect').addEventListener('click', startCall);
function returnToCustomers() {
  if (joining) return;
  ++briefRequest;
  briefPending = false;
  showBrief(false);
  session.returnToCRM();
  byId('brief-image').removeAttribute('src');
  byId('brief-title').textContent = 'Pre-Call Brief';
  byId('brief-summary').textContent = '';
  byId('handoff').hidden = true;
  byId('dashboard').hidden = false;
  byId('dashboard').inert = false;
  document.querySelectorAll('.customer').forEach(card => card.setAttribute('aria-pressed', 'false'));
  byId('announcement').textContent = 'Returned to the CRM. Choose a prospect to begin.';
  // Keyboard users return to their card; pointer users get a neutral focus target.
  // This prevents programmatic focus from leaving a persistent card outline.
  if (keyboardNavigation) lastCard?.focus();
  else byId('discovery-title').focus({ preventScroll: true });
}
byId('return-button').addEventListener('click', returnToCustomers);
byId('back-customers').addEventListener('click', returnToCustomers);
document.addEventListener('keydown', event => {
  if (briefPending && event.key === 'Escape') { event.preventDefault(); returnToCustomers(); }
});
brief.addEventListener('keydown', event => {
  if (event.key === 'Escape') { event.preventDefault(); returnToCustomers(); }
  if (event.key === 'Tab') {
    const first = byId('back-customers');
    const last = byId('call-prospect');
    if (event.shiftKey && (document.activeElement === first || document.activeElement === byId('brief-title'))) {
      event.preventDefault(); last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault(); first.focus();
    }
  }
});
byId('open-overview').addEventListener('click', openOverview);
byId('complete-overview').addEventListener('click', completeOverview);
updateOnboarding();
scheduleManagerMessage();

})();
