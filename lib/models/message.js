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
* Returns a formatted inbox dictionary
* Message#buildInboxesFrom
* @param {string} messages
*/
Message.statics.buildInboxesFrom = function(messages) {
  var results = [];
  var inboxes = {};
  var senders = [];

  for (var m = 0; m < messages.length; m++) {
    var msg = messages[m];

    if (typeof inboxes[msg.sender.userID] === 'undefined') {
      inboxes[msg.sender.userID] = [];
    }

    inboxes[msg.sender.userID].push(msg.toObject());
  }

  senders = Object.keys(inboxes);

  for (var s = 0; s < senders.length; s++) {
    var sender = senders[s];
    var inbox = inboxes[sender];

    results.push({
      contact: sender,
      messages: inbox.sort(sortByTimestamp)
    });
  }

  function sortByTimestamp(a, b) {
    return b.timestamp - a.timestamp;
  }

  return results;
};

/**
* Mongoose model
* #exports
*/
module.exports = mongoose.model('Message', Message);
