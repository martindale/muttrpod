/**
* @module muttrpod/bus
*/

'use strict';

var pgp = require('openpgp');
var qs = require('querystring');
var assert = require('assert');
var auth = require('./middlewares/authenticate');

/**
* Handles Bus interface over websockets
* @constructor
* @param {object} options
*/
function Bus(options) {
  this._log = options.logger;
  this._server = options.wsserver;
  this._pool = {};

  this._server.on('connection', this._setupListeners.bind(this));
}

/**
* Dispatch event to respective client
* #push
* @param {object} message
*/
Bus.prototype.push = function(message) {
  if (!this._pool[message.recipient.pubkeyhash]) {
    return false;
  }

  var data = JSON.stringify(message.toObject());
  var sock = this._pool[message.recipient.pubkeyhash]

  sock.send(data);

  return true;
};

/**
* Setup event listeners for websocket
* #_setupListeners
* @param {object} socket
*/
Bus.prototype._setupListeners = function(sock) {
  this._log.debug('unknown client connected via websocket');

  sock.on('message', this._handleMessage.bind(this, sock));
  sock.on('close', this._removeSocket.bind(this, sock));
};

/**
* Handle handshake message
* #_handleMessage
* @param {object} socket
* @param {string} cleartext
*/
Bus.prototype._handleMessage = function(sock, cleartext) {
  var self = this;
  var hexBuffer = new Buffer(cleartext, 'hex');
  var ascString = hexBuffer.toString('utf8');

  var pgpMessage, parsedMsg;

  try {
    pgpMessage = pgp.message.readArmored(ascString);
    parsedMsg = qs.parse(pgpMessage.getText());

    assert(parsedMsg.identity, 'No identity supplied');
    assert(parsedMsg.identityType === 'pubkeyhash', 'Type is not pubkeyhash');
    assert(parsedMsg.nonce, 'Missing nonce');
  } catch(err) {
    return this._log.error('invalid message received: %s', err.message);
  }

  var pubkeyhash = parsedMsg.identity;

  auth.fetchLocalIdentity(pubkeyhash, function(err, pubkey) {
    var verified;

    try {
      verified = pgpMessage.verify([pubkey])[0].valid;
    } catch(err) {
      return self._log.error('invalid message received: invalid signature');
    }

    if (verified) {
      self._log.debug('client verified via websockets as %s', pubkeyhash);

      self._addSocket(pubkeyhash, sock);
    } else {
      sock.close();
    }
  });
};

/**
* Remove the socket from the pool
* #_removeSocket
* @param {object} socket
*/
Bus.prototype._removeSocket = function(sock) {
  for (var s in this._pool) {
    if (this._pool[s] === sock) {
      return delete this._pool[s];
    }
  }
};

/**
* Add the socket to the pool
* #_addSocket
* @param {object} socket
*/
Bus.prototype._addSocket = function(pubkeyhash, sock) {
  sock.__pubkeyhash = pubkeyhash;
  this._pool[pubkeyhash] = sock;
};

module.exports = Bus;
