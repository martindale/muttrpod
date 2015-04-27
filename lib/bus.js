/**
* @module muttrpod/bus
*/

'use strict';

/**
* Handles Bus interface over websockets
* @constructor
* @param {object} wsserver
*/
function Bus(wsserver) {
  this._server = wsserver;
  this._sockets = [];
}

module.exports = Bus;
