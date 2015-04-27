/**
* @module muttrpod/router
*/

'use strict';

var pgp = require('openpgp');
var Identity = require('./models/identity');
var Message = require('./models/message');
var errorHandler = require('./middlewares/errorhandler');
var authenticate = require('./middlewares/authenticate');
var authorize = require('./middlewares/authorize');
var requireToken = require('./middlewares/requiretoken');
var errors = require('./errors');

/**
* Handles request routing for express app
* @constructor
* @param {object} muttr.Connection
*/
function Router(dht) {
  this.dht = dht;
}

/**
* Bind routes to supplied express app
* #mount
* @param {object} app
*/
Router.prototype.mount = function(app) {
  // public endpoints
  app.post('/', this._registerIdentity.bind(this));
  app.post('/messages', this._storeMessageInDHT.bind(this));
  app.get('/aliases', this._searchAliases.bind(this));
  app.get('/aliases/:alias', this._getPublicKeyForAlias.bind(this));
  app.get('/messages/:hash', this._getMessageFromDHT.bind(this));
  // everything else requires authentication (signature verification)
  app.use(authenticate);
  // authenticated endpoints
  app.post('/conversations/:alias/messages', this._createMessage.bind(this));
  // authorized endpoints
  app.post('/aliases', authorize, this._createAlias.bind(this));
  app.post('/tokens', authorize, this._createToken.bind(this));
  app.get('/conversations', requireToken, this._getConversations.bind(this));
  app.get('/conversations/:alias', requireToken, this._getMessages.bind(this));
  // handle all others as not found
  app.all('*', this._handleNotFound.bind(this));
  // dump errors to the error handler
  app.use(errorHandler);
};

/**
* Registers a new identity
* #_registerIdentity
* @param {object} req
* @param {object} res
* @param {function} callback
*/
Router.prototype._registerIdentity = function(req, res, callback) {
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

      res.send({ status: 'success', pubkeyhash: identity.pubkeyhash });
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
  callback(new errors.NotImplementedError());
};

/**
* Create a temporary authorization token for a GET request
* #_createToken
* @param {object} req
* @param {object} res
* @param {function} callback
*/
Router.prototype._createToken = function(req, res, callback) {
  callback(new errors.NotImplementedError());
};

/**
* Get list of aliases and the conversations stored
* #_getConversations
* @param {object} req
* @param {object} res
* @param {function} callback
*/
Router.prototype._getConversations = function(req, res, callback) {
  callback(new errors.NotImplementedError());
};

/**
* Get chronological message hashes for the given alias
* #_getMessages
* @param {object} req
* @param {object} res
* @param {function} callback
*/
Router.prototype._getMessages = function(req, res, callback) {
  callback(new errors.NotImplementedError());
};

/**
* Searches all aliases matching the given query or lists alphabetically
* #_searchAliases
* @param {object} req
* @param {object} res
* @param {function} callback
*/
Router.prototype._searchAliases = function(req, res, callback) {
  callback(new errors.NotImplementedError());
};

/**
* Returns the armored public key for the given alias
* #_getPublicKeyForAlias
* @param {object} req
* @param {object} res
* @param {function} callback
*/
Router.prototype._getPublicKeyForAlias = function(req, res, callback) {
  callback(new errors.NotImplementedError());
};

/**
* Performs DHT lookup on behalf of "thin" clients
* #_getMessageFromDHT
* @param {object} req
* @param {object} res
* @param {function} callback
*/
Router.prototype._getMessageFromDHT = function(req, res, callback) {
  this.dht.get(req.params.hash, function(err, value) {
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
  callback(new errors.NotImplementedError());
};

/**
* Creates a message for the recipient
* #_createMessage
* @param {object} req
* @param {object} res
* @param {function} callback
*/
Router.prototype._createMessage = function(req, res, callback) {
  callback(new errors.NotImplementedError());
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
