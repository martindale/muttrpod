/**
* @module muttrpod/router
*/

'use strict';

var assert = require('assert');
var pgp = require('openpgp');
var errors = require('./errors');
var muttr = require('muttr');
var crypto = require('crypto');

var Logger = require('./logger');
var Identity = require('./models/identity');
var Message = require('./models/message');
var Token = require('./models/token');
var Alias = require('./models/alias');

var errorHandler = require('./middlewares/errorhandler');
var authenticate = require('./middlewares/authenticate');
var authorize = require('./middlewares/authorize');
var requireToken = require('./middlewares/requiretoken');


/**
* Handles request routing for express app
* @constructor
*/
function Router() {
  if (!(this instanceof Router)) {
    return new Router();
  }
}

/**
* Bind routes to supplied express app
* #mount
* @param {object} server
*/
Router.prototype.mount = function(server) {
  this._dht = server.dht;
  this._config = server.config;
  this._log = new Logger(server.config.verbosity);
  this._bus = server.bus;

  var app = server._app;

  // public endpoints
  app.post('/', this._registerIdentity.bind(this));
  app.post('/messages', this._storeMessageInDHT.bind(this));
  app.get('/aliases/:alias', this._getPublicKeyForAlias.bind(this));
  app.get('/messages/:hash', this._getMessageFromDHT.bind(this));
  // everything else requires authentication (signature verification)
  app.use(authenticate);
  // authorized endpoints (must have identity registered)
  app.post('/aliases', authorize, this._createAlias.bind(this));
  app.post('/tokens', authorize, this._createToken.bind(this));
  app.post('/chats', authorize, this._createMessage.bind(this));
  app.get('/chats', requireToken, this._getMessages.bind(this));
  app.delete('/chats', requireToken, this._purgeMessages.bind(this));
  // handle all others as not found
  app.all('*', this._handleNotFound.bind(this));
  // dump errors to the error handler
  app.use(errorHandler(this._log));

  return this;
};

/**
* Wraps the response data and sends it with a 200
* #_success
* @param {object} res
* @param {data} data
*/
Router.prototype._success = function(res, data) {
  var result = {
    status: 'success',
    result: data
  };

  res.status(200).send(result);
};

/**
* Registers a new identity
* #_registerIdentity
* @param {object} req
* @param {object} res
* @param {function} callback
*/
Router.prototype._registerIdentity = function(req, res, callback) {
  var self = this;
  var pubkey;
  var message;

  try {
    message = pgp.cleartext.readArmored(req.rawbody);
    pubkey = pgp.key.readArmored(message.getText()).keys[0];
  } catch(err) {
    return callback(new errors.BadRequestError(err.message));
  }

  pgp.verifyClearSignedMessage(pubkey, message).then(function(result) {
    if (!result.signatures.length) {
      return callback(new errors.BadRequestError('Bad Signature'));
    }

    Identity.create(pubkey.armor(), function(err, identity) {
      if (err) {
        return callback(err);
      }

      self._success(res, { identity: identity.toObject() });
    });
  }).catch(callback);
};

/**
* Create an alias for your identity
* #_createAlias
* @param {object} req
* @param {object} res
* @param {function} callback
*/
Router.prototype._createAlias = function(req, res, callback) {
  var self = this;
  var identity = req.identity;
  var name = req.body.alias;

  identity.addAlias(name, function(err, alias) {
    if (err) {
      if (err.code === 11000) {
        return callback(new errors.BadRequestError('Alias already exists'));
      }

      return callback(err);
    }

    self._success(res, { alias: alias.toObject() });
  });
};

/**
* Create a temporary authorization token for a GET request
* #_createToken
* @param {object} req
* @param {object} res
* @param {function} callback
*/
Router.prototype._createToken = function(req, res, callback) {
  var self = this;
  var identity = req.identity;
  var resource = req.body.resource;
  var method = req.body.method;

  identity.createToken(method, resource, function(err, token) {
    if (err) {
      return callback(err);
    }

    self._success(res, { token: token.toObject() });
  });
};

/**
* Get list of aliases and the messages stored
* #_getMessages
* @param {object} req
* @param {object} res
* @param {function} callback
*/
Router.prototype._getMessages = function(req, res, callback) {
  var self = this;
  var identity = req.identity;

  identity.getMessages(function(err, messages) {
    if (err) {
      return callback(err);
    }

    self._success(res, {
      messages: messages.map(function(m) {
        return m.toObject()
      })
    });
  });
};

/**
* Deletes stored messages
* #_purgeMessages
* @param {object} req
* @param {object} res
* @param {function} callback
*/
Router.prototype._purgeMessages = function(req, res, callback) {
  var self = this;
  var identity = req.identity;

  identity.purgeMessages(function(err) {
    if (err) {
      return callback(err);
    }

    self._getMessages(req, res, callback);
  });
};

/**
* Returns the armored public key for the given alias
* #_getPublicKeyForAlias
* @param {object} req
* @param {object} res
* @param {function} callback
*/
Router.prototype._getPublicKeyForAlias = function(req, res, callback) {
  var self = this;
  var query = { name: req.params.alias };

  Alias.findOne(query).populate('identity').exec(function(err, alias) {
    if (err) {
      return callback(err);
    }

    if (!alias) {
      return callback(new errors.NotFoundError());
    }

    res.send(alias.identity.pubkey);
  });
};

/**
* Performs DHT lookup on behalf of "thin" clients
* #_getMessageFromDHT
* @param {object} req
* @param {object} res
* @param {function} callback
*/
Router.prototype._getMessageFromDHT = function(req, res, callback) {
  this._dht.get(req.params.hash, function(err, value) {
    if (err) {
      return callback(err);
    }

    res.send(value);
  });
};

/**
* Performs DHT STORE on behalf of "thin" clients
* #_storeMessageInDHT
* @param {object} req
* @param {object} res
* @param {function} callback
*/
Router.prototype._storeMessageInDHT = function(req, res, callback) {
  var self = this;
  var rawtext = req.rawbody;
  var key = crypto.createHash('sha1').update(rawtext).digest('hex');

  this._dht.set(key, rawtext, function(err) {
    if (err) {
      return callback(err);
    }

    self._success(res, { key: key });
  });
};

/**
* Creates a message for the recipient
* #_createMessage
* @param {object} req
* @param {object} res
* @param {function} callback
*/
Router.prototype._createMessage = function(req, res, callback) {
  var self = this;
  var to = req.body.to;
  var from = req.body.from;
  var key = req.body.key;

  try {
    assert(key && key.length === 40, 'Invalid message key');
    assert(muttr.utils.validateUserID(to), 'Invalid "to" userID');
    assert(muttr.utils.validateUserID(from), 'Invalid "from" userID');
  } catch(err) {
    return callback(err);
  }

  var senderAlias = muttr.utils.getAliasFromUserID(from);
  var senderPod = muttr.utils.getPodHostFromUserID(from);
  var targetAlias = muttr.utils.getAliasFromUserID(to);
  var targetPod = muttr.utils.getPodHostFromUserID(to);
  var senderIsLocal = senderPod === this._config.server.address;
  var targetIsLocal = targetPod === this._config.server.address;

  if (!targetIsLocal) {
    return callback(new Error('The target userID is not on this server'));
  }

  var jobs = [
    this.getLocalIdentity.bind(this, targetAlias),
    senderIsLocal
      ? this._getLocalIdentity.bind(this, senderAlias)
      : this._getRemoteIdentity.bind(this, targetAlias, targetPod)
  ];

  async.parallel(jobs, function(err, pubkeyhashes) {
    if (err) {
      return callback(err);
    }

    var recipient = { pubkeyhash: pubkeyhashes[0], userID: to };
    var sender = { pubkeyhash: pubkeyhashes[1], userID: from };

    var message = new Message({
      recipient: recipient,
      sender: sender,
      key: key
    });

    if (self._bus.push(message)) {
      return self._success(res, { message: message.toObject() });
    }

    message.save(function(err) {
      if (err) {
        return callback(err);
      }

      self._success(res, { message: message.toObject() });
    });
  });
};

/**
* Get local pubkeyhash from alias
* #_getLocalIdentity
* @param {string} alias
* @param {function} callback
*/
Router.prototype_getLocalIdentity = function(alias, callback) {
  Alias.findOne({ name: alias }).populate('identity').exec(function(e, a) {
    if (e) {
      return callback(e);
    }

    if (!a) {
      return callback(new Error('The alias "' + alias + '" is not registed'));
    }

    callback(null, a.identity.pubkeyhash);
  });
};

/**
* Get remote pubkeyhash from alias and host
* #_getRemoteIdentity
* @param {string} alias
* @param {string} host
* @param {function} callback
*/
Router.prototype._getRemoteIdentity = function(alias, host, callback) {
  var url = 'https://' + host + '/aliases/' + alias;

  request.get({ url: url }, function(err, res, pubkey) {
    if (err) {
      return callback(err);
    }

    if (res.statusCode !== 200) {
      return callback(new Error('Failed to fetch remote identity'));
    }

    var pubkeyhash = crypto.createHash('sha1').update(pubkey).digest('hex');

    callback(null, pubkeyhash);
  });
};

/**
* 404 Route
* #_handleNotFound
* @param {object} req
* @param {object} res
*/
Router.prototype._handleNotFound = function(req, res, callback) {
  callback(new errors.NotFoundError());
};

module.exports = Router;
