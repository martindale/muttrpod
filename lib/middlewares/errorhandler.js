/**
* @module muttrpod/middlewares/error-handler
*/

'use strict';

/**
* Handles request error response
* #errorHandler
* @param {object} error
* @param {object} request
* @param {object} response
* @param {function} callback
*/
module.exports = function errorHandler(err, req, res, next) {
  var statusCode = err.code || 500;

  res.status(statusCode).send({ error: err.message });
};
