/**
* @module muttrpod/models/identity
*/

'use strict';

var pgp = require('openpgp');
var crypto = require('crypto');
var mongoose = require('mongoose');
var Alias = require('./alias');
var Token = require('./token');
var Message = require('./message');

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

Identity.set('toObject', {
  virtuals: true,
  getters: true,
  transform: function(doc, ret, options) {
    delete ret.__v;
    delete ret._id;
    delete ret.lastNonce;
    delete ret.pubkey;
  }
});

/**
* Creates a new alias for this identity
* #addAlias
* @param {string} name
* @param {function} callback
*/
Identity.methods.addAlias = function(name, callback) {
  Alias.findOne({ name: name, identity: this._id }, function(err, alias) {
    if (err) {
      return callback(err);
    }

    if (alias) {
      return callback(null, alias);
    }

    alias = new Alias({ name: name, identity: this._id });

    alias.save(function(err) {
      if (err) {
        return callback(err);
      }

      callback(null, alias);
    });
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
Identity.methods.getMessages = function(callback) {
  var self = this;
  var query = { 'recipient.pubkeyhash': this.pubkeyhash };
  var desc = { timestamp: 1 };

  Message.find(query).sort(desc).exec(function(err, messages) {
    if (err) {
      return callback(err);
    }

    callback(null, messages);
  });
};

/**
* Delete all converstaions
* #purgeConversations
* @param {function} callback
*/
Identity.methods.purgeMessages = function(callback) {
  Message.remove({ 'recipient.pubkeyhash': this.pubkeyhash }, callback);
};

/**
* Generate a token
* #createToken
* @param {string} method
* @param {string} resource
* @param {function} callback
*/
Identity.methods.createToken = function(method, resource, callback) {
  var token = new Token({
    resource: resource,
    identity: this._id,
    method: method
  });

  token.save(function(err) {
    if (err) {
      return callback(err);
    }

    callback(null, token);
  });
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
      if (err.code === 11000) {
        return callback(null, identity);
      }

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
