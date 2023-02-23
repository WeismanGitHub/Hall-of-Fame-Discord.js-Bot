const { BadRequestError, UnauthorizedError } = require('../errors');
const { PermissionsBitField } = require('discord.js');
const DiscordOauth2 = require("discord-oauth2");
const { request } = require('undici');
const jwt = require('jsonwebtoken')
require('express-async-errors')

const { getAuthors, deleteAuthor, editAuthor } = require('./authors');
const { getQuotes, deleteQuote, editQuote, createQuote } = require('./quotes');
const { getTags, deleteTag, editTag, createTag } = require('./tags');

const auth = async (req, res) => {
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
			redirect_uri: process.env.REDIRECT_URI,
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

	const expiration = new Date(Date.now() + (3600000 * 24 * 14)) // 14 days

	res.status(200)
	.cookie('accessToken', oauthData.access_token, {
		httpOnly: true,
		secure: true,
		sameSite: 'strict',
		expires: expiration
	}).end()
}

const getGuilds = async (req, res) => {
    const accessToken = req.cookies.accessToken
	const client = req.app.get('client')
	const clientGuilds = client.guilds.cache.map(guild => guild.id)
    const oauth = new DiscordOauth2();

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

	const expiration = new Date(Date.now() + (3600000 * 24 * 14)) // 14 days

	res.status(200)
	.cookie('guilds', guildsJWT, { httpOnly: true, secure: true, sameSite: 'strict', expires: expiration })
	.json(guilds)
}

const logout = (req, res) => {
	res.status(200).clearCookie('guilds').clearCookie('accessToken').end()
}

async function uploadImage(req, res) {
	res.status(200).end()
}

module.exports = {
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
	createTag
};