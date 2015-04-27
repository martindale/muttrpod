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
  value: mongoose.Schema.Types.Mixed
});

/**
* Mongoose model
* #exports
*/
module.exports = mongoose.model('DHTEntry', DHTEntry);
