'use strict';
// @flow


const Redux = require('redux');

const AppReducers = require('./reducers/AppReducers');
const loggingMiddleware = require('./middleware/loggingMiddleware');
const socketMiddleware = require('./middleware/socketMiddleware');

/**
 *
 * @param initialState
 * @param socket
 * @param enableReduxDevTools
 * @returns {*}
 */
module.exports = (initialState:Object, socket:Socket, enableReduxDevTools:boolean) => {
  const reduxDevTools = (window.devToolsExtension && enableReduxDevTools) ? window.devToolsExtension() : (x) => x;
  return Redux.createStore(
    AppReducers,
    initialState,
    Redux.applyMiddleware(
      loggingMiddleware,
      socketMiddleware(socket)
    ));
};