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
    alias: {
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
  dhtkey: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

/**
* Mongoose model
* #exports
*/
module.exports = mongoose.model('Message', Message);
