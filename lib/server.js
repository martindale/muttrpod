/**
* @module muttrpod/server
*/

'use strict';

var http = require('http');
var https = require('https');
var muttr = require('muttr');
var Logger = require('./logger');
var ws = require('ws');
var express = require('express');
var async = require('async');
var assert = require('assert');
var events = require('events');
var util = require('util');
var mongoose = require('mongoose');
var DHTStorageAdapter = require('./storage');

util.inherits(Server, events.EventEmitter);

/**
* Creates a MuttrPod server
* @constructor
* @param {object} config
*/
function Server(config) {
  if (!(this instanceof Server)) {
    return new Server(config);
  }

  events.EventEmitter.call(this);

  this._log = new Logger(config.verbosity);
  this.config = this._loadConfig(config);
}

/**
* Starts the MuttrPod server
* #start
* @param {function} onReady
*/
Server.prototype.start = function(onReady) {
  var self = this;

  if (typeof onReady === 'function') {
    this.once('ready', onReady);
    this.once('error', onReady);
  }

  var initializers = [
    this._connectStorage.bind(this),
    this._joinNetwork.bind(this),
    this._configureApp.bind(this),
    this._startServer.bind(this)
  ];

  async.parallel(initializers, function(err) {
    if (err) {
      return self.emit('error', err);
    }

    self.emit('ready');
  });
};

/**
* Validates and sets config
* #_loadConfig
* @param {object} config
*/
Server.prototype._loadConfig = function(config) {


  return config;
};


/**
* Opens database connection
* #_connectStorage
* @param {function} callback
*/
Server.prototype._connectStorage = function(callback) {
  var self = this;
  var options = {
    user: this.config.storage.user,
    pass: this.config.storage.pass
  };

  var uris = this.config.storage.nodes.map(function(node) {
    var protocol = 'mongodb://';
    var uri = node.host + ':' + node.port;
    var path = '/' + self.config.storage.name;

    return protocol + uri + path;
  });

  this.storage = mongoose.connect(uris.join(), options, callback);
};

/**
* Joins the Muttr DHT
* #_joinNetwork
* @param {function} callback
*/
Server.prototype._joinNetwork = function(callback) {
  var storage = new DHTStorageAdapter(this.storage);
  var options = merge({ storage: storage }, this.config.network);

  this.dht = new muttr.Connection(options);

  this.dht.open(callback);
};

/**
* Starts HTTP(S) and WS servers
* #_configureApp
* @param {function} callback
*/
Server.prototype._configureApp = function(callback) {

};

/**
* Starts HTTP(S) and WS servers
* #_startServer
* @param {function} callback
*/
Server.prototype._startServer = function(callback) {

};

module.exports = Server;
