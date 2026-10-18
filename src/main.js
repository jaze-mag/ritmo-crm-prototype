(() => {
  'use strict';
const { createSession, customers } = window.Ritmo;

const byId = id => document.getElementById(id);
const stage = byId('stage');
const brief = byId('customer-brief');
const laptop = document.querySelector('.laptop');
let lastCard = null;
let joining = false;
let keyboardNavigation = false;
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
  button.addEventListener('click', () => openBrief(customer, button));
  byId('customers').append(button);
});
for (let i = 0; i < 56; i++) {
  const key = document.createElement('span');
  key.className = 'key';
  byId('keyboard').append(key);
}

function openBrief(customer, button) {
  if (joining || !session.selectCustomer(customer.id)) return;
  dismissManagerMessage();
  lastCard = button;
  document.querySelectorAll('.customer').forEach(card => card.setAttribute('aria-pressed', String(card === button)));
  byId('brief-title').textContent = `Pre-Call Brief: ${customer.name}`;
  byId('brief-summary').textContent = [
    `${customer.role}, ${customer.company}. Challenge Level: ${customer.difficulty.toLowerCase()}.`,
    'What We Know.', ...customer.brief.known,
    'Opportunity Status: Qualified. Next Step: Not Scheduled.',
    'Your Goal.', ...customer.brief.goals,
  ].join(' ');
  byId('brief-image').src = customer.brief.artwork;
  showBrief(true);
  byId('brief-title').focus();
}
function showBrief(visible) {
  stage.classList.toggle('brief-open', visible);
  brief.hidden = !visible;
  laptop.inert = visible;
  byId('notification').inert = visible;
}
// Single handoff boundary for a future verified Storyline adapter.
// No external connection is made; statechange remains the host-facing event.
function renderHandoff(customer) {
  byId('handoff-title').textContent = `Ready to Speak with ${customer.name}`;
  byId('handoff-company').textContent = `${customer.company} · ${customer.role}`;
  byId('dashboard').hidden = true;
  byId('transition').hidden = true;
  byId('handoff').hidden = false;
  byId('handoff-title').focus();
}
async function startCall() {
  if (joining || session.getState().screen !== 'brief') return;
  joining = true;
  const customer = customers.find(item => item.id === session.getState().customerId);
  showBrief(false);
  session.beginCall();
  byId('dashboard').inert = true;
  byId('transition').hidden = false;
  byId('notification').hidden = true;
  byId('connection-title').textContent = `Connecting with ${customer.name}...`;
  byId('transition').focus();
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) await new Promise(resolve => setTimeout(resolve, 1500));
  session.joinCall();
  renderHandoff(customer);
  joining = false;
}
byId('call-prospect').addEventListener('click', startCall);
function returnToCustomers() {
  if (joining) return;
  showBrief(false);
  session.returnToCRM();
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
managerTimer = setTimeout(() => {
  if (!managerDismissed && session.getState().screen === 'crm' && !joining) {
    byId('notification').hidden = false;
    byId('announcement').textContent = 'Message from your manager: Three qualified prospects are ready to talk. Choose one and find out what their team needs.';
  }
}, 900);

})();
