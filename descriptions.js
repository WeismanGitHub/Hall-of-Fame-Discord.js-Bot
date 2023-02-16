const tagDescription = "Tags must be predefined and are used for finding quotes."
const authorDescription = "Authors must be predefined and are used for finding quotes."
const newNameDescription = "What you want the new name to be."
const searchPhraseDescription = "The text you want to search for."
const typeDescription = "The type of quote you want."
const titleDescription = "Titles are used to find/play quotes."
const audioFileLinkDescription = "A link to an audio or video file."
const lastAudioDescription = "The last audio or video file sent in a channel."
const imageLinkDescription = "A link to an image file."
const lastImageDescription = "The last image file sent in a channel."
const idDescription = "Each quote has a unique ID assigned to it."
const removeTagsDescription = "Remove tags from this quote. Tags must be predefined and are used for finding quotes."
const lastQuoteDescription = "The last quote sent in a channel."
const removeImageDescription = "Remove the image."
const textDescription = "Text you're quoting."
const nameDescription = "The name of the author."
const fragmentDescription = "A fragment is an author/text pair."
const accountImageDescription = "Use an account image. Will change along with the account."
const removeAccountImage = "Stop using an account image."

module.exports = {
    tagDescription,
    authorDescription,
    newNameDescription,
    searchPhraseDescription,
    typeDescription,
    titleDescription,
    audioFileLinkDescription,
    lastAudioDescription,
    imageLinkDescription,
    lastImageDescription,
    idDescription,
    removeTagsDescription,
    lastQuoteDescription,
    removeImageDescription,
    textDescription,
    nameDescription,
    fragmentDescription,
    accountImageDescription,
    removeAccountImage
}

`
notifications: Turn notifications on or off.
notification_channel: Change the default notifications channel.
age: Sort by newest/oldest.
limit: Amount of quotes returned. Must be less than 10.
pagination: Send all quotes at once or ten at a time.
quotes_channel: Choose a channel to have all the quotes in. It will be updated with new quotes.
remove_channel: Remove the quotes channel.
`