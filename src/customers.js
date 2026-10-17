(() => {
  'use strict';
const briefs = {
  'maya-patel': {
    known: ['Brightside Creative is a growing creative agency.', "Maya's team tracks projects across email and spreadsheets."],
    goals: ['Ask Maya about her current situation.', 'Respond to her concern.', 'Schedule a tailored workflow demo at a specific time.'],
    portrait: './assets/references/maya-precall-approved.png', crop: { x: 62, y: 86 },
  },
  'daniel-brooks': {
    known: ['Northstar Consulting wants smoother team handoffs.', "Daniel's team struggles with manual handoffs between teams."],
    goals: ['Ask Daniel about his current handoff process.', 'Uncover where delays or confusion occur.', 'Secure a specific next step for a tailored workflow demo.'],
    portrait: './assets/references/daniel-precall-approved.png', crop: { x: 62, y: 87 },
  },
  'renee-alvarez': {
    known: ['Summit Logistics needs reliable workflows.', 'Renee is cautious after a failed software rollout.'],
    goals: ["Acknowledge Renee's previous experience.", "Explore her team's needs and concerns.", 'Secure a specific next step for a tailored demo.'],
    portrait: './assets/references/renee-precall-approved.png', crop: { x: 63, y: 86 },
  },
};
for (const brief of Object.values(briefs)) {
  Object.freeze(brief.known);
  Object.freeze(brief.goals);
  Object.freeze(brief.crop);
  Object.freeze(brief);
}
const customers = Object.freeze([
  Object.freeze({ id: 'maya-patel', name: 'Maya Patel', company: 'Brightside Creative', role: 'Operations Manager', difficulty: 'EASY', context: 'Projects across email and spreadsheets', brief: briefs['maya-patel'] }),
  Object.freeze({ id: 'daniel-brooks', name: 'Daniel Brooks', company: 'Northstar Consulting', role: 'Director of Client Services', difficulty: 'MEDIUM', context: 'Manual handoffs between teams', brief: briefs['daniel-brooks'] }),
  Object.freeze({ id: 'renee-alvarez', name: 'Renee Alvarez', company: 'Summit Logistics', role: 'VP of Operations', difficulty: 'HARD', context: 'Cautious after a failed rollout', brief: briefs['renee-alvarez'] }),
]);

  window.Ritmo = { customers };
})();
