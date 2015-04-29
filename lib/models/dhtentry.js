/**
* @module muttrpod/models/dhtentry
*/

'use strict';

var mongoose = require('mongoose');

/**
* DHTEntry schema
* @constructor
*/
var DHTEntry = new mongoose.Schema({
  key: {
    type: String,
    unique: true
  },
  value: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  publisher: String
});

/**
* Mongoose model
* #exports
*/
module.exports = mongoose.model('DHTEntry', DHTEntry);
