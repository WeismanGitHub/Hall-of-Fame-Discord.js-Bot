const GuildSchema = require('../schemas/guild_schema')
const { PermissionsBitField } = require('discord.js');
const DiscordOauth2 = require("discord-oauth2");
const { BadRequestError } = require('./errors')
const { request } = require('undici');
const { Router } = require('express')
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

	res.status(200).cookie('accessToken', oauthData.access_token).end()
})

router.get('/guilds', async (req, res) => {
	try {
		const guilds = (await oauth.getUserGuilds('req.accessToken')).filter(guild => {
			const permissions = new PermissionsBitField(guild.permissions)
			
			return permissions.has(PermissionsBitField.Flags.USE_APPLICATION_COMMANDS)
		}).map(guild => {
			return { id: guild.id, icon: guild.icon }
		})
		
		// icon link = https://cdn.discordapp.com/icons/id/icon.png 
	
		res.status(200).send(guilds)
	} catch(err) {
		res.status(301).clearCookie('accessToken').send('Invalid Access Token')
	}
});

module.exports = router