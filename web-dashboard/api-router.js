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
	editQuote,
	createQuote,
	createTag,
	createAuthor,
	getRandomQuotes,
	countQuotes,
} = require('./controllers')

const router = Router()

router.post('/auth', auth)

router.post('/logout', logout)

router.post('/image', uploadImage)

router.get('/guilds', getGuilds);

router.route('/:guildId/authors/:authorId?').get(getAuthors).delete(deleteAuthor).patch(editAuthor).post(createAuthor)

router.route('/:guildId/quotes/count').get(countQuotes)
router.route('/:guildId/quotes/random').get(getRandomQuotes)
router.route('/:guildId/quotes/:quoteId?').get(getQuotes).delete(deleteQuote).patch(editQuote).post(createQuote)

router.route('/:guildId/tags/:tag?').get(getTags).delete(deleteTag).patch(editTag).post(createTag)

module.exports = router	