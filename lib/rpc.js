/**
* @module muttrpod/rpc
*/

'use strict';

/**
* Handles RPC interface over websockets
* @constructor
* @param {object} wsserver
*/
function RPC(wsserver) {
  this._server = wsserver;
  this._sockets = [];
}

module.exports = RPC;
