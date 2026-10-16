(() => {
  'use strict';
const { customers } = window.Ritmo;

function createSession(onChange = () => {}) {
  let state = Object.freeze({ screen: 'crm', customerId: null });
  function update(next) {
    state = Object.freeze(next);
    onChange(state);
    return state;
  }
  return Object.freeze({
    getState: () => state,
    selectCustomer(customerId) {
      if (!customers.some(customer => customer.id === customerId)) throw new RangeError('Unknown customer');
      return update({ screen: 'crm', customerId });
    },
    joinCall() {
      if (!state.customerId) return false;
      return update({ ...state, screen: 'handoff' });
    },
    returnToCRM() { return update({ screen: 'crm', customerId: null }); },
  });
}

  window.Ritmo.createSession = createSession;
})();
