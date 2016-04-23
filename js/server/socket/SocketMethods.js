'use strict';

const socketMethods = {};

/**
 * Attach some useful methods to the socket and the gameRoom.
 * @param socket
 * @param next
 */
module.exports = (socket, next) => {
  for (var methodName in socketMethods) {
    socket[methodName] = socketMethods[methodName].bind(socket);
    socket.gameRoom[methodName] = socketMethods[methodName].bind(socket.gameRoom);
  }
  next();
};