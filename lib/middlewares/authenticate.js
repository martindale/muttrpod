/**
* @module muttrpod/middlewares/authenticate
*/

'use strict';

var request = require('request');
var qs = require('querystring');
var url = require('url');
var pgp = require('openpgp');
var Identity = require('../models/identity');

/**
* Verifies payload as signed PGP message with querystring
* #authenticate
* @param {object} request
* @param {object} response
* @param {function} callback
*/
module.exports = function authenticate(req, res, callback) {
  req.authenticated = false;

  // GET and DELETE methods are either public or require a token for auth
  if (['GET', 'DELETE'].indexOf(req.method) !== -1) {
    return callback();
  }

  try {
    req.message = pgp.cleartext.readArmored(req.rawbody);
    req.body = qs.parse(req.message.getText());
  } catch(err) {
    return callback(err);
  }

  switch (req.body.identity_type) {
    case 'pubkeyhash':
      return exports._fetchLocalIdentity(req.body.identity, verify);
    case 'href':
      return exports._fetchRemoteIdentity(req.body.identity, verify);
    default:
      return callback();
  }

  function verify(err, pubkey) {
    var verification = req.message.verify([pubkey])[0];

    req.authenticated = verification && verification.valid;

    if (req.authenticated) {
      var hash = crypto.createHash('sha1');

      req.pubkey = pubkey;
      req.pubkeyhash = hash.update(req.pubkey.armor()).digest('hex');
    }

    callback();
  }
};

/**
* Fetch remote public key by HREF
* #_fetchRemoteIdentity
* @param {string} href
* @param {function} callback
*/
function _fetchRemoteIdentity(href, callback) {
  request.get(href, function(err, res, body) {
    if (err) {
      return callback(err);
    }

    if (res.statusCode !== 200) {
      return callback(new Error(body));
    }

    _loadArmoredKey(body, callback);
  });
}

/**
* Fetch local public key by pubkeyhash
* #_fetchLocalIdentity
* @param {string} href
* @param {function} callback
*/
function _fetchLocalIdentity(pubkeyhash, callback) {
  Identity.findOne({ pubkeyhash: pubkeyhash }, function(err, identity) {
    if (err) {
      return callback(err);
    }

    if (!identity) {
      return callback(new Error('Local identity was not found'));
    }

    _loadArmoredKey(identity.pubkey, callback);
  });
}

/**
* Load armored key
* #_loadArmoredKey
* @param {string} pubkey
* @param {function} callback
*/
function _loadArmoredKey(pubkey, callback) {
  var imported = pgp.key.readArmored(pubkey);

  if (imported.err.length) {
    return callback(imported.err[0]);
  }

  if (imported.keys.length === 0) {
    return callback(new Error('Failed to load key'));
  }

  callback(null, imported.keys[0]);
}

module.exports.fetchLocalIdentity = _fetchLocalIdentity;
module.exports.fetchRemoteIdentity = _fetchRemoteIdentity;
module.exports.loadArmoredKey = _loadArmoredKey;
