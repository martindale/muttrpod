/**
* @module muttrpod/middlewares/authorize
*/

'use strict';

var Token = require('../models/token');

/**
* Verifies signature against registered identity
* #authorize
* @param {object} request
* @param {object} response
* @param {function} callback
*/
module.exports = function requireToken(req, res, callback) {
  req.authorized = false;

  var query = {
    value: req.query.token,
    resource: req.path
  };

  Token.findOne(query).populate('identity').exec(function(err, token) {
    if (err) {
      return callback(err);
    }

    if (!token) {
      return callback(new Error('Invalid or expired token supplied'));
    }

    req.identity = token.identity;
    req.authorized = true;

    token.remove(callback);
  });
};
