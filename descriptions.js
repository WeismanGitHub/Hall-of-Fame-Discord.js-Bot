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
const deleteTagsDescription = "Remove tags from this quote. Tags must be predefined and are used for finding quotes."
const lastQuoteDescription = "The last quote sent in a channel."

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
    deleteTagsDescription,
    lastQuoteDescription,
}

`
delete_image: Removes image from quote.
title: Play quote with either an id or title.
search_phrase: A phrase to search for in the quote text.
name: The name of the author you want to create.
account_image: Use an account image. Will update with the account.
name: The name of the author you want to edit. (case sensitive)
account_image: Use an account image. Will update with the account.
delete_image: Use the default image.
remove_account_image: Removes the connection to the account image.
title: Title of the multi-quote.
first_author: The name of the first author.
first_text: The first part of the multi-quote.
second_author: The name of the second author.
second_text: The second part of the multi-quote.
third_author: The name of the third author.
third_text: The third part of the multi-quote.
fourth_author: The name of the fourth author.
fourth_text: The fourth part of the multi-quote.
fifth_author: The name of the fifth author.
fifth_text: The fifth part of the multi-quote.
first_author: The name of the first author.
first_text: The first part of the multi-quote.
second_author: The name of the second author.
second_text: The second part of the multi-quote.
third_author: The name of the third author.
third_text: The third part of the multi-quote.
fourth_author: The name of the fourth author.
fourth_text: The fourth part of the multi-quote.
fifth_author: The name of the fifth author.
fifth_text: The fifth part of the multi-quote.
delete_first_fragment: Remove a text/author pair.
delete_second_fragment: Remove a text/author pair.
delete_third_fragment: Remove a text/author pair.
delete_fourth_fragment: Remove a text/author pair.
delete_fifth_fragment: Remove a text/author pair.
delete_image: Removes image from quote.
notifications: Turn notifications on or off.
notification_channel: Change the default notifications channel.
author: Sort by author of quote.
search_phrase: A phrase to search for in the quote text.
type: Filter by type of quote.
author: The name of who said the quote. You must first register an author with /createauthor.
text: What was said by the person.
delete_image: Removes image from quote.
author: Sort by author of quote.
search_phrase: A phrase to search for in the quote text.
age: Sort by newest/oldest.
type: Filter by type of quote.
limit: Amount of quotes returned. Must be less than 10.
pagination: Send all quotes at once or ten at a time.
author: Sort by author of quote.
search_phrase: A phrase to search for in the quote text.
type: Filter by type of quote.
quotes_channel: Choose a channel to have all the quotes in. It will be updated with new quotes.
remove_channel: Remove the quotes channel.
tag: The name of the tag you want to create.
tag: The tag you want to delete.
tag: The tag you want to edit.
`