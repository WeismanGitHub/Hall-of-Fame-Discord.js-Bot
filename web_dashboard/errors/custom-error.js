class CustomError extends Error {
    constructor(message) {
        super(message || 'Something went wrong!')
    }
}

module.exports = CustomError