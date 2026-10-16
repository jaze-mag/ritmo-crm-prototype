(() => {
  'use strict';
const customers = Object.freeze([
  Object.freeze({ id: 'maya-patel', name: 'Maya Patel', company: 'Brightside Creative', role: 'Operations Manager', difficulty: 'EASY', context: 'Projects across email and spreadsheets' }),
  Object.freeze({ id: 'daniel-brooks', name: 'Daniel Brooks', company: 'Northstar Consulting', role: 'Director of Client Services', difficulty: 'MEDIUM', context: 'Manual handoffs between teams' }),
  Object.freeze({ id: 'renee-alvarez', name: 'Renee Alvarez', company: 'Summit Logistics', role: 'VP of Operations', difficulty: 'HARD', context: 'Cautious after a failed rollout' }),
]);

  window.Ritmo = { customers };
})();
