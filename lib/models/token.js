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
  issued: {
    type: Date,
    index: {
      unique: false,
      expires: '30s'
    },
    default: Date.now
  },
  resource: {
    type: String,
    required: true
  },
  method: {
    type: String,
    required: true,
    enum: ['GET', 'DELETE']
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

Token.set('toObject', {
  virtuals: true,
  getters: true,
  transform: function(doc, ret, options) {
    delete ret.__v;
    delete ret._id;
    delete ret.identity;
  }
});

/**
* Mongoose model
* #exports
*/
module.exports = mongoose.model('Token', Token);
