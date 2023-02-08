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
} = require('./api-controller')

const router = Router()

router.post('/auth', auth)
router.post('/logout', (req, res) => {
	res.status(200).clearCookie('guilds').clearCookie('accessToken').clearCookie('loggedIn').end()
})

router.get('/guilds', getGuilds);

router.route('/:guildId/authors/:authorId?').get(getAuthors).delete(deleteAuthor)

router.route('/:guildId/tags/:tag?').get(getTags).delete(deleteTag)

router.route('/:guildId/quotes/:quoteId?').get(getQuotes).delete(deleteQuote)

module.exports = router