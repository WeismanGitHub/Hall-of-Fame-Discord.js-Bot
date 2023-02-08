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
	logout
} = require('./controllers')

const router = Router()

router.post('/auth', auth)

router.route('/logout').post(logout)

router.get('/guilds', getGuilds);

router.route('/:guildId/authors/:authorId?').get(getAuthors).delete(deleteAuthor)

router.route('/:guildId/tags/:tag?').get(getTags).delete(deleteTag).patch(editTag)

router.route('/:guildId/quotes/:quoteId?').get(getQuotes).delete(deleteQuote)

module.exports = router