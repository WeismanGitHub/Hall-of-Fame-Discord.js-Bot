function checkURL(URL) {
    try {
        return Boolean(new URL(URL))
    } catch(err) {
        return false
    }
}

module.exports = checkURL