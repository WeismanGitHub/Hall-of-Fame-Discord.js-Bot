const CustomError = require('./custom-error');

class ForbiddenError extends CustomError {
    constructor(message) {
        super(message || 'Forbidden');
        this.statusCode = 403;
    }
}

module.exports = ForbiddenError;
