/**
* @module muttrpod/router
*/

'use strict';

var Identity = require('./models/identity');
var Message = require('./models/message');
var errorHandler = require('./middlewares/errorhandler');

/**
* Handles request routing for express app
* @constructor
*/
function Router() {

}

/**
* Bind routes to supplied express app
* #mount
* @param {object} app
*/
Router.prototype.mount = function(app) {

  app.use(errorHandler);
  app.all('*', this._handleNotFound.bind(this));
};

/**
* 404 Route
* #_handleNotFound
* @param {object} req
* @param {object} res
*/
Router.prototype._handleNotFound = function(req, res) {
  res.status(404).send({ message: 'Not Found' });
};

module.exports = Router;
