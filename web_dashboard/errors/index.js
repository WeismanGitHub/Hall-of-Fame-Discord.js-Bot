const UnauthorizedError = require('./unauthorized');
const BadRequestError = require('./bad-request');
const ForbiddenError = require('./forbidden');
const CustomError = require('./custom-error');
const NotFoundError = require('./not-found');
const InternalError = require('./internal');

module.exports = {
    UnauthorizedError,
    BadRequestError,
    ForbiddenError,
    InternalError,
    NotFoundError,
    CustomError,
};