(() => {
  'use strict';
const { createSession, customers } = window.Ritmo;

const byId = id => document.getElementById(id);
const stage = byId('stage');
const brief = byId('customer-brief');
const laptop = document.querySelector('.laptop');
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

function fillList(id, items) {
  byId(id).replaceChildren(...items.map(text => {
    const item = document.createElement('li');
    item.textContent = text;
    return item;
  }));
}
function openBrief(customer, button) {
  if (joining || !session.selectCustomer(customer.id)) return;
  lastCard = button;
  document.querySelectorAll('.customer').forEach(card => card.setAttribute('aria-pressed', String(card === button)));
  byId('brief-name').textContent = customer.name;
  byId('brief-role').textContent = customer.role;
  byId('brief-company').textContent = customer.company;
  byId('brief-challenge').textContent = `Challenge Level: ${customer.difficulty[0]}${customer.difficulty.slice(1).toLowerCase()}`;
  fillList('brief-known', customer.brief.known);
  fillList('brief-goals', customer.brief.goals);
  const portrait = byId('portrait-image');
  portrait.src = customer.brief.portrait;
  portrait.alt = `Illustrated portrait of ${customer.name}`;
  portrait.style.left = `-${customer.brief.crop.x}px`;
  portrait.style.top = `-${customer.brief.crop.y}px`;
  showBrief(true);
  byId('brief-title').focus();
}
function showBrief(visible) {
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
  const fromBrief = session.getState().screen === 'brief';
  if (fromBrief) session.closeBrief();
  else session.returnToCRM();
  byId('handoff').hidden = true;
  byId('dashboard').hidden = false;
  byId('dashboard').inert = false;
  if (!fromBrief) document.querySelectorAll('.customer').forEach(card => card.setAttribute('aria-pressed', 'false'));
  byId('notification').hidden = false;
  byId('announcement').textContent = 'Returned to the CRM. Choose a prospect to begin.';
  lastCard?.focus();
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
setTimeout(() => {
  if (['crm', 'brief'].includes(session.getState().screen) && !joining) {
    byId('notification').hidden = false;
    byId('announcement').textContent = 'Message from your manager: Three qualified prospects are ready to talk. Choose one and find out what their team needs.';
  }
}, 900);

})();
