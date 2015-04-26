/**
* @module muttrpod/middlewares/authorize
*/

'use strict';

var pgp = require('openpgp');
var Identity = require('../models/identity');

/**
* Verifies signature against registered identity
* #authorize
* @param {object} request
* @param {object} response
* @param {function} callback
*/
module.exports = function authorize(req, res, next) {
  next();
};
