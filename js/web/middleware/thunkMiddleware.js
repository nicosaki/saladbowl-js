'use strict';

/**
 * Executes functions.
 */
module.exports = (store) => (next) => (action) => {
  if (typeof action == 'function') {
    return action(store.dispatch, store.getState);
  } else {
    return next(action);
  }
};