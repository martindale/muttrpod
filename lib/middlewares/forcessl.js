/**
* @module muttrpod/middlewares/forcessl
*/

'use strict';

/**
* Redirects unsecure requests to secure port
* #forceSSL
* @param {object} request
* @param {object} response
* @param {function} callback
*/
module.exports = function(config) {
  return function forceSSL(req, res, callback) {
    if (!req.secure) {
      var port  = (config.server.port === 443) ? '' : ':' + config.server.port;
      var parts = ['https://', req.hostname, port, req.url];

      return res.redirect(parts.join(''));
    }

    callback();
  };
};
