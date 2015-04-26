/**
* @module muttrpod/storage
*/

'use strict';

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

};

/**
* Put a DHT entry into storage
* #put
* @param {string} key
* @param {string} value
* @param {function} callback
*/
DHTStorageAdapter.prototype.put = function(key, value, callback) {

};

/**
* Delete a DHT entry from storage
* #del
* @param {string} key
* @param {function} callback
*/
DHTStorageAdapter.prototype.del = function(key, callback) {

};

/**
* Return a stream of all DHT entries with { key, value }
* #createReadStream
* @param {string} key
* @param {function} callback
*/
DHTStorageAdapter.prototype.createReadStream = function(key, callback) {

};

module.exports = DHTStorageAdapter;
