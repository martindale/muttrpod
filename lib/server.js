/**
* @module muttrpod/server
*/

'use strict';

var http = require('http');
var https = require('https');
var muttr = require('muttr');
var ws = require('ws');
var fs = require('fs');
var express = require('express');
var async = require('async');
var assert = require('assert');
var events = require('events');
var util = require('util');
var merge = require('merge');
var mongoose = require('mongoose');

var DHTStorageAdapter = require('./storage');
var Logger = require('./logger');
var Router = require('./router');
var Bus = require('./bus');

var favicon = require('serve-favicon');
var rawbody = require('./middlewares/rawbody');
var forceSSL = require('./middlewares/forcessl');

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
    this._startServer.bind(this),
    this._startRedirector.bind(this)
  ];

  async.series(initializers, function(err) {
    if (err) {
      self._log.error(err.message);
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

  this.storage = mongoose.connect(uris.join(), options, function(err) {
    if (err) {
      return callback(err);
    }

    self._log.info('connected to database: %s', self.config.storage.name);
    callback();
  });
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

  this.dht.open();
  this._log.info('accepting udp connections on port: %s', options.port);

  callback();
};

/**
* Starts HTTP(S) and WS servers
* #_configureApp
* @param {function} callback
*/
Server.prototype._configureApp = function(callback) {
  this._app = express();

  this._app.set('x-powered-by', false);
  this._app.use(favicon(__dirname + '/../www/img/muttr-logo.png'));
  this._app.use(express.static(__dirname + '/../www'));
  this._app.use(rawbody);

  callback();
};

/**
* Starts HTTP(S) and WS servers
* #_startServer
* @param {function} callback
*/
Server.prototype._startServer = function(callback) {
  var self = this;
  var WSServer = ws.Server;
  var useSSL = this.config.server.ssl;
  var address = this.config.server.address;
  var port = this.config.server.port;

  if (useSSL) {
    this._server = https.createServer({
      ca: this.config.server.ca.map(fs.readFileSync),
      key: fs.readFileSync(this.config.server.key),
      cert: fs.readFileSync(this.config.server.cert),
      requestCert: false,
      rejectUnauthorized: false
    }, this._app);
  } else {
    this._server = http.createServer(this._app);
  }

  this._wsserver = new WSServer({ server: this._server });
  this._bus = new Bus({ wsserver: this._wsserver, logger: this._log });
  this._router = Router().mount(this);

  this._server.listen(port, address, function(err) {
    if (err) {
      return callback(err);
    }

    self._log.info('http(s) and ws(s) server listening on port: %s', port);
    callback();
  });
};

/**
* Starts HTTP redirector to HTTPS if enbled
* #_startRedirector
* @param {function} callback
*/
Server.prototype._startRedirector = function(callback) {
  var self = this;
  var address = this.config.server.address;
  var port = this.config.server.redirect;

  if (!this.config.server.redirect) {
    return callback();
  }

  this._redirector = http.createServer(express().use(forceSSL));

  this._redirector.listen(port, address, function(err) {
    if (err) {
      return callback(err);
    }

    self._log.info('redirecting from port: %s', self.config.server.redirect);
    callback();
  });
};

module.exports = Server;
