const GuildSchema = require('../schemas/guild_schema')
const { BadRequestError } = require('./errors')
const { request } = require('undici');
const { Router } = require('express')
require('express-async-errors')

const router = Router()

router.post('/login', async (req, res) => {
	const { code } = req.body;

	if (!code) {
		throw new BadRequestError('Missing Code')
	}
	
	const tokenResponseData = await request('https://discord.com/api/oauth2/token', {
		method: 'POST',
		body: new URLSearchParams({
			client_id: process.env.CLIENT_ID,
			client_secret: process.env.CLIENT_SECRET,
			code,
			grant_type: 'authorization_code',
			redirect_uri: `http://localhost:5000/`,
		}).toString(),
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
	});

	const oauthData = await tokenResponseData.body.json();

	if (oauthData.error) {
		throw new BadRequestError('Problem with code. Try again.')
	}
	
	console.log(oauthData)
})

router.get('/guilds', async (req, res) => {
	let guilds = ['idk how to get these yet']
	let guildIds = guilds.map(guild => guild.id)

	guildIds = await GuildSchema.find({ guildId: { $in: guildIds }}).select('-_id guildId').lean()

	res.status(200).send(guildsData)
});

module.exports = router