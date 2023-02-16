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
} = require('./controllers')

const router = Router()

router.post('/auth', auth)

router.post('/logout', logout)

router.post('/image', uploadImage)

router.get('/guilds', getGuilds);

router.route('/:guildId/authors/:authorId?').get(getAuthors).delete(deleteAuthor)

router.route('/:guildId/tags/:tag?').get(getTags).delete(deleteTag).patch(editTag)

router.route('/:guildId/quotes/:quoteId?').get(getQuotes).delete(deleteQuote)

module.exports = router	