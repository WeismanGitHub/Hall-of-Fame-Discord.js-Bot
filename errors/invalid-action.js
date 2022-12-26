class InvalidActionError extends Error {
    constructor(message) {
        super(`Invalid Action: \`${message}\``);
    }
}

module.exports = InvalidActionError;