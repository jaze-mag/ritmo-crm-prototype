(() => {
  'use strict';
const { createSession, customers } = window.Ritmo;

const byId = id => document.getElementById(id);
const stage = byId('stage');
const overlay = byId('detail-overlay');
const screen = document.querySelector('.screen');
let lastCard = null;
let joining = false;
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

const office = byId('office');
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
  if (customer.id !== 'maya-patel') button.setAttribute('aria-haspopup', 'dialog');
  for (const [field, className] of [['name', 'customer-name'], ['company', 'customer-company'], ['role', 'customer-role'], ['difficulty', 'difficulty'], ['context', 'customer-context']]) {
    const span = document.createElement('span');
    span.className = className;
    span.textContent = customer[field];
    button.append(span);
  }
  button.addEventListener('click', () => openDetails(customer, button));
  byId('customers').append(button);
});
for (let i = 0; i < 56; i++) {
  const key = document.createElement('span');
  key.className = 'key';
  byId('keyboard').append(key);
}

function openDetails(customer, button) {
  if (joining) return;
  session.selectCustomer(customer.id);
  lastCard = button;
  document.querySelectorAll('.customer').forEach(card => card.setAttribute('aria-pressed', String(card === button)));
  if (customer.id === 'maya-patel') {
    showBrief(true);
    byId('brief-title').focus();
    return;
  }
  for (const field of ['name', 'company', 'role', 'difficulty', 'context']) byId(`detail-${field}`).textContent = customer[field];
  overlay.hidden = false;
  screen.inert = true;
  byId('join-button').focus();
}
function showBrief(visible) {
  stage.classList.toggle('brief-view', visible);
  byId('maya-brief').hidden = !visible;
  for (const selector of ['.laptop', '.laptop-base', '.desk']) document.querySelector(selector).hidden = visible;
  byId('notification').hidden = visible;
}
function closeDetails(restoreFocus = true) {
  overlay.hidden = true;
  screen.inert = false;
  if (restoreFocus) lastCard?.focus();
}
byId('close-detail').addEventListener('click', () => closeDetails());
overlay.addEventListener('click', event => { if (event.target === overlay) closeDetails(); });
overlay.addEventListener('keydown', event => {
  if (event.key === 'Escape') { event.preventDefault(); closeDetails(); }
  if (event.key === 'Tab') {
    const first = byId('close-detail');
    const last = byId('join-button');
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});
async function startCall() {
  if (joining || !session.getState().customerId) return;
  joining = true;
  const customer = customers.find(item => item.id === session.getState().customerId);
  closeDetails(false);
  showBrief(false);
  session.beginCall();
  byId('dashboard').inert = true;
  byId('transition').hidden = false;
  byId('notification').hidden = true;
  const isMaya = customer.id === 'maya-patel';
  byId('transition').querySelector('p').textContent = isMaya ? 'Connecting to Maya Patel...' : 'Preparing your discovery call…';
  byId('transition').focus();
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) await new Promise(resolve => setTimeout(resolve, isMaya ? 1500 : 850));
  session.joinCall();
  byId('handoff-title').textContent = customer.name;
  document.querySelector('.handoff-note').textContent = isMaya ? 'Ready to begin your conversation with Maya.' : 'Your discovery conversation begins here.';
  byId('handoff-company').textContent = `${customer.company} · ${customer.role}`;
  byId('dashboard').hidden = true;
  byId('transition').hidden = true;
  byId('handoff').hidden = false;
  byId('handoff-title').focus();
  joining = false;
}
byId('join-button').addEventListener('click', startCall);
byId('call-maya').addEventListener('click', startCall);
function returnToCustomers() {
  if (joining) return;
  showBrief(false);
  session.returnToCRM();
  byId('handoff').hidden = true;
  byId('dashboard').hidden = false;
  byId('dashboard').inert = false;
  document.querySelectorAll('.customer').forEach(card => card.setAttribute('aria-pressed', 'false'));
  byId('notification').hidden = false;
  byId('announcement').textContent = 'Returned to the CRM. Choose a prospect to begin.';
  lastCard?.focus();
}
byId('return-button').addEventListener('click', returnToCustomers);
byId('back-customers').addEventListener('click', returnToCustomers);
byId('maya-brief').addEventListener('keydown', event => {
  if (event.key === 'Escape') { event.preventDefault(); returnToCustomers(); }
});
setTimeout(() => {
  if (session.getState().screen === 'crm' && !joining) {
    byId('notification').hidden = false;
    byId('announcement').textContent = 'Message from your manager: Three qualified prospects are ready to talk. Choose one and find out what their team needs.';
  }
}, 900);

})();
