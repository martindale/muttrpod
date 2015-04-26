/**
* @module muttrpod/middlewares/rawbody
*/

'use strict';

/**
* Buffers data into a req.rawbody variable
* #rawbody
* @param {object} request
* @param {object} response
* @param {function} callback
*/
module.exports = function rawbody(req, res, next) {
  req.rawbody = '';

  req.on('data', function(data) {
    req.rawbody += data;
  });

  req.on('end', next);
};
