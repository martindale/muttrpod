/**
* @module muttrpod/errors
*/

'use strict';

var inherits = require('util').inherits;

inherits(NotFoundError, Error);
inherits(InternalError, Error);
inherits(NotImplementedError, Error);
inherits(AuthError, Error);

/**
* Not Found Error
* @constructor
*/
function NotFoundError() {
  this.message = 'Resource Not Found';
  this.code = 404;
}

/**
* Internal Server Error
* @constructor
*/
function InternalError() {
  this.message = 'Internal Server Error';
  this.code = 500;
}

/**
* Not Implemented Error
* @constructor
*/
function NotImplementedError() {
  this.message = 'Not Implemented';
  this.code = 501;
}

/**
* Authorization Error
* @constructor
*/
function AuthError() {
  this.message = 'Not Authorized';
  this.code = 401;
}

/**
* Bad Request Error
* @constructor
*/
function BadRequestError(message) {
  this.message = message || 'Bad Request';
  this.code = 400;
}

/**
* #exports
*/
module.exports = {
  NotFoundError: NotFoundError,
  InternalError: InternalError,
  NotImplementedError: NotImplementedError,
  AuthError: AuthError,
  BadRequestError: BadRequestError
};
