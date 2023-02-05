const { Router } = require('express')
const {
	auth,
	getGuilds,
	getAuthors,
	getTags,
	getQuotes
} = require('./api-controller')

const router = Router()

router.post('/auth', auth)
router.post('/logout', (req, res) => {
	res.status(200).clearCookie('guilds').clearCookie('accessToken').clearCookie('loggedIn').end()
})

router.get('/guilds', getGuilds);

router.get('/authors/:guildId', getAuthors)

router.get('/tags/:guildId', getTags)

router.get('/quotes/:guildId', getQuotes)

module.exports = router