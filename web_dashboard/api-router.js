const { BadRequestError, NotFoundError, UnauthorizedError } = require('./errors');
const GuildSchema = require('../schemas/guild-schema');
const { PermissionsBitField } = require('discord.js');
const DiscordOauth2 = require("discord-oauth2");
const { request } = require('undici');
const { Router } = require('express')
const jwt = require('jsonwebtoken')
require('express-async-errors')

const router = Router()
const oauth = new DiscordOauth2();

router.post('/auth', async (req, res) => {
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
			scope: 'guilds'
		}).toString(),
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
		},
	});

	const oauthData = await tokenResponseData.body.json();

	if (oauthData.error) {
		throw new BadRequestError('Problem with code. Try again.')
	}

	res.status(200).cookie('accessToken', oauthData.access_token, { httpOnly: true, secure: true })
	.cookie('loggedIn', true).end() // "loggedIn" cookie because client can't see if httpOnly accessToken cookie exists.
})

router.get('/guilds', async (req, res) => {
	const accessToken = req.cookies.accessToken
	const client = req.app.get('client')
	const clientGuilds = client.guilds.cache.map(guild => guild.id)

	if (!accessToken) {
		throw new BadRequestError('No Access Token')
	}

	const guilds = (await oauth.getUserGuilds(accessToken)
	.catch(err => {
		throw new UnauthorizedError('Invalid Access Token')
	})).filter(guild => {
		const guildPerms = new PermissionsBitField(guild.permissions)
		return guildPerms.has(PermissionsBitField.Flags.UseApplicationCommands) && clientGuilds.includes(guild.id)
	}).map(guild => {
		return { id: guild.id, iconURL: `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`, name: guild.name }
	})

	const guildsJWT = jwt.sign(
        { guilds: guilds.map(guild => guild.id) },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_LIFETIME },
    )

	res.status(200).cookie('guilds', guildsJWT, { httpOnly: true, secure: true }).json(guilds)
});

router.get('/authors/:guildId', async (req, res) => {
	const guilds = jwt.verify(req.cookies.guilds, process.env.JWT_SECRET).guilds
	const guildId = req.params.guildId

	if (!guilds.includes(guildId)) {
		throw new BadRequestError('Invalid Guild Id')
	}

	const guild = await GuildSchema.findOne({ _id: guildId }).select('-_id authors').lean()

	if (!guild) {
		throw new NotFoundError('Guild Not Found')
	}

	res.status(200).json(guild.authors ?? [])
})

module.exports = router