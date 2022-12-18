module.exports = {
    type: String,
    minLength: 1,
    maxLength: 83, // A third of 256 minus 6 for the ', ' used to join tags in the embed. Embed fields are max 256 chars.
}