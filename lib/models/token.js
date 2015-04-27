/**
* @module muttrpod/models/token
*/

'use strict';

var mongoose = require('mongoose');
var createToken = require('hat').rack(256);

/**
* Token schema
* @constructor
*/
var Token = new mongoose.Schema({
  ttl: {
    type: Date,
    index: {
      unique: false,
      expires: '30s'
    }
  },
  resource: {
    type: String,
    required: true
  },
  identity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Identity'
  },
  value: {
    type: String,
    default: createToken
  }
});

/**
* Mongoose model
* #exports
*/
module.exports = mongoose.model('Token', Token);
