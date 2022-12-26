class NotFoundError extends Error {
    constructor(message) {
        super(`Not Found: \`${message}\``);
    }
}

module.exports = NotFoundError;