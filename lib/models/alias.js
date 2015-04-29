/**
* @module muttrpod/models/alias
*/

'use strict';

var mongoose = require('mongoose');

/**
* Alias schema
* @constructor
*/
var Alias = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  identity: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Identity'
  },
  created: {
    type: Date,
    default: Date.now
  }
});

Alias.set('toObject', {
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
module.exports = mongoose.model('Alias', Alias);
