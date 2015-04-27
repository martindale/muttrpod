/**
* @module muttrpod/middlewares/authorize
*/

'use strict';

var pgp = require('openpgp');
var crypto = require('crypto');
var AuthError = require('../errors').AuthError;
var Identity = require('../models/identity');

/**
* Verifies signature against registered identity
* #authorize
* @param {object} request
* @param {object} response
* @param {function} callback
*/
module.exports = function authorize(req, res, callback) {
  req.authorized = false;

  if (!req.authenticated) {
    return callback(new AuthError());
  }

  var pubkey = req.pubkey.armor();
  var pubkeyhash = crypto.createHash('sha1').update(pubkey).digest('hex');

  Identity.findOne({ pubkeyhash: pubkeyhash }, function(err, identity) {
    if (err) {
      return callback(err);
    }

    if (!identity) {
      return callback(new Error('Identity not found'));
    }

    if (req.body.nonce <= identity.lastNonce) {
      return callback(new Error('Invalid nonce supplied'));
    }

    identity.lastNonce = req.body.nonce;
    req.identity = identity;
    req.authorized = true;

    identity.save(callback);
  });
};
