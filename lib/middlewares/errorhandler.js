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
  res.send(500, { error: err.message });
};
