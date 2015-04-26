/**
* @module muttrpod
*/

'use strict';

var Server = require('./lib/server');

/**
* Factory method for `Server`
* #createPod
* @param {object} config
*/
module.exports = function createPod(config) {
  return new Server(config);
};
