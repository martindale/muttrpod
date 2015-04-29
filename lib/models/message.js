/**
* @module muttrpod/models/message
*/

'use strict';

var mongoose = require('mongoose');

/**
* Message schema
* @constructor
*/
var Message = new mongoose.Schema({
  recipient: {
    userID: {
      type: String,
      required: true
    },
    pubkeyhash: {
      type: String,
      required: true
    }
  },
  sender: {
    userID: {
      type: String,
      required: true
    },
    pubkeyhash: {
      type: String,
      required: true
    }
  },
  key: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

Message.set('toObject', {
  virtuals: true,
  getters: true,
  transform: function(doc, ret, options) {
    delete ret.__v;
    delete ret._id;
  }
});

/**
* Mongoose model
* #exports
*/
module.exports = mongoose.model('Message', Message);
