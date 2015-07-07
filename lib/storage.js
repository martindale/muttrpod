/**
* @module muttrpod/storage
*/

'use strict';

var through = require('through');
var DHTEntry = require('./models/dhtentry');

/**
* MongoDB storage adapter for the Muttr DHT
* @constructor
*/
function DHTStorageAdapter() {

}

/**
* Get a DHT entry from storage
* #get
* @param {string} key
* @param {function} callback
*/
DHTStorageAdapter.prototype.get = function(key, callback) {
  DHTEntry.findOne({ key: key }, function(err, entry) {
    if (err) {
      return callback(err);
    }

    if (!entry) {
      return callback(new Error('Not found'));
    }

    callback(null, JSON.stringify(entry));
  });
};

/**
* Put a DHT entry into storage
* #put
* @param {string} key
* @param {string} value
* @param {function} callback
*/
DHTStorageAdapter.prototype.put = function(key, value, callback) {
  var entry = new DHTEntry(JSON.parse(value));

  entry.save(callback);
};

/**
* Delete a DHT entry from storage
* #del
* @param {string} key
* @param {function} callback
*/
DHTStorageAdapter.prototype.del = function(key, callback) {
  DHTEntry.remove({ key: key }, function(err) {
    if (err) {
      return callback(err);
    }

    callback(null);
  });
};

/**
* Return a stream of all DHT entries with { key, value }
* #createReadStream
*/
DHTStorageAdapter.prototype.createReadStream = function() {
  return DHTEntry.find({
    key: { $exists: true }
  }).stream().pipe(through(function(entry) {
    this.queue({
      key: entry.key,
      value: entry
    });
  }));
};

module.exports = DHTStorageAdapter;
