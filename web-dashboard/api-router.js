const { Router } = require('express')
const {
	auth,
	getGuilds,
	getAuthors,
	getTags,
	getQuotes,
	deleteAuthor,
	deleteTag,
	deleteQuote,
	editTag,
	logout,
	uploadImage,
	editAuthor,
} = require('./controllers')

const router = Router()

router.post('/auth', auth)

router.post('/logout', logout)

router.post('/image', uploadImage)

router.get('/guilds', getGuilds);

router.route('/:guildId/authors/:authorId?').get(getAuthors).delete(deleteAuthor).patch(editAuthor)

router.route('/:guildId/quotes/:quoteId?').get(getQuotes).delete(deleteQuote)

router.route('/:guildId/tags/:tag?').get(getTags).delete(deleteTag).patch(editTag)

module.exports = router	