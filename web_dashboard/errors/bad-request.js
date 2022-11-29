const CustomError = require('./custom-error');

class BadRequestError extends CustomError {
  constructor(message) {
    super(message || 'Bad Request');
    this.statusCode = 400;
  }
}

module.exports = BadRequestError;
