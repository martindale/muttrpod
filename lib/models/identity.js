/**
* @module muttrpod/models/identity
*/

'use strict';

var pgp = require('openpgp');
var crypto = require('crypto');
var mongoose = require('mongoose');
var Alias = require('./alias');

/**
* Identity schema
* @constructor
*/
var Identity = new mongoose.Schema({
  pubkey: {
    type: String,
    required: true,
    unique: true
  },
  pubkeyhash: {
    type: String,
    required: true,
    unique: true
  },
  lastNonce: {
    type: Number,
    default: 0
  },
  registered: {
    type: Date,
    default: Date.now
  }
});

/**
* Creates a new alias for this identity
* #addAlias
* @param {string} name
* @param {function} callback
*/
Identity.methods.addAlias = function(name, callback) {
  var alias = new Alias({ name: name, identity: this._id });

  alias.save(function(err) {
    if (err) {
      return callback(err);
    }

    callback(null, alias);
  });
};

/**
* Removes an alias from this identity
* #removeAlias
* @param {string} name
* @param {function} callback
*/
Identity.methods.removeAlias = function(name, callback) {
  Alias.findOne({ name: name, identity: this._id }, function(err, alias) {
    if (err) {
      return callback(err);
    }

    if (!alias) {
      return callback(new Error('Alias not found'));
    }

    alias.remove(callback);
  });
};

/**
* Aggregate messages to get a list of "conversations"
* #getConversations
* @param {function} callback
*/
Identity.methods.getConversations = function(callback) {

};

/**
* Get message list for
* #getConversationByAlias
* @param {string} alias
* @param {function} callback
*/
Identity.methods.getConversationByAlias = function(alias, callback) {

};

/**
* Creates a new Identity
* Identity#create
* @param {string} pubkey
* @param {function} callback
*/
Identity.statics.create = function(pubkey, callback) {
  var imported = pgp.key.readArmored(pubkey);

  if (imported.err.length) {
    return callback(imported.err[0]);
  }

  if (imported.keys.length === 0) {
    return callback(new Error('Failed to load key'));
  }

  var pubkeyhash = crypto.createHash('sha1').update(pubkey).digest('hex');
  var identity = new Identity({ pubkey: pubkey, pubkeyhash: pubkeyhash });

  identity.save(function(err) {
    if (err) {
      return callback(err);
    }

    callback(null, identity);
  });
};

/**
* Mongoose model
* #exports
*/
module.exports = mongoose.model('Identity', Identity);
