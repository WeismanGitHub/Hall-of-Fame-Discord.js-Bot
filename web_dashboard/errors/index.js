const UnauthorizedError = require('./unauthorized');
const BadRequestError = require('./bad-request');
const CustomError = require('./custom-error');
const NotFoundError = require('./not-found');

module.exports = {
    UnauthorizedError,
    BadRequestError,
    NotFoundError,
    CustomError,
};