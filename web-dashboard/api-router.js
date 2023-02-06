const { Router } = require('express')
const {
	auth,
	getGuilds,
	getAuthors,
	getTags,
	getQuotes,
	deleteAuthor
} = require('./api-controller')

const router = Router()

router.post('/auth', auth)
router.post('/logout', (req, res) => {
	res.status(200).clearCookie('guilds').clearCookie('accessToken').clearCookie('loggedIn').end()
})

router.get('/guilds', getGuilds);

router.route('/:guildId/authors/:authorId?').get(getAuthors).delete(deleteAuthor)

router.get('/:guildId/tags', getTags)

router.get('/:guildId/quotes', getQuotes)

module.exports = router