module.exports = {
    type: String,
    minLength: 1,
    maxLength: 339, // A third of 1024 minus 6 for the ', ' used to join tags in the embed. Embed fields are max 1024 chars.
    lowercase: true,
    trim: true
}