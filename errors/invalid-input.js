class InvalidInputError extends Error {
    constructor(message) {
        super(`Invalid Input: \`${message}\`.`);
    }
}

module.exports = InvalidInputError;