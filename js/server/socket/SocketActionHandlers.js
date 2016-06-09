'use strict';
// @flow


const MessageTypes = require('../../shared/MessageTypes');

/**
 * Map of all action handlers.
 */
const handlers = Object.assign({},
  require('./handlers/MidGameHandlers'),
  require('./handlers/OutOfSyncHelper'),
  require('./handlers/PreGameHandlers'));


/**
 * Bind all action handlers to socket events.
 * @param socket
 * @param next
 */
module.exports = (socket:Socket, next:Next) => {
  socket.on(MessageTypes.GAME, (action) => {
    console.log('Game Action Received', action);
    if (handlers.hasOwnProperty(action.type)) {
      try {
        handlers[action.type](action, socket);
      } catch (e) {
        console.error('error handling action' + action.type, e);
      }
    } else {
      console.error('Unknown Action', action);
    }
  });
  next();
};