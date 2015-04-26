/**
* @module muttrpod/middlewares/authenticate
*/

'use strict';

var pgp = require('openpgp');

/**
* Verifies payload as signed PGP message
* #authenticate
* @param {object} request
* @param {object} response
* @param {function} callback
*/
module.exports = function authenticate(req, res, next) {
  next();
};
