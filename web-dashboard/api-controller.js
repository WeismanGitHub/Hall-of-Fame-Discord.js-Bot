const { BadRequestError, NotFoundError, UnauthorizedError } = require('./errors');
const UniversalQuoteSchema = require('../schemas/universal-quote-schema');
const GuildSchema = require('../schemas/guild-schema');
const { PermissionsBitField } = require('discord.js');
const DiscordOauth2 = require("discord-oauth2");
const { request } = require('undici');
const jwt = require('jsonwebtoken')
require('express-async-errors')

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

	// "loggedIn" cookie because client can't see if accessToken exists since it is httpOnly.
	res.status(200)
	.cookie('accessToken', oauthData.access_token, { httpOnly: true, secure: true, sameSite: 'strict', expires: expiration })
	.cookie('loggedIn', true, { secure: true, sameSite: 'strict', expires: expiration }).end()
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

const getAuthors =  async (req, res) => {
	const guilds = jwt.verify(req.cookies.guilds, process.env.JWT_SECRET).guilds
	const guildId = req.params.guildId
	if (!guilds.includes(guildId)) {
		throw new BadRequestError('Invalid Guild Id')
	}

	const guild = await GuildSchema.findOne({ _id: guildId }).select('-_id authors').lean()

	if (!guild) {
		throw new NotFoundError('Guild Not Found')
	}

	const authors = await Promise.all(guild.authors.map(async author => {
		if (author.discordId) {
			const user = await req.app.get('client').users.fetch(author.discordId)
			author.iconURL = user?.avatarURL() || process.env.DEFAULT_ICON_URL
		}

		return author
	}))

	res.status(200).json(authors ?? [])
}

const getTags = async (req, res) => {
	const guilds = jwt.verify(req.cookies.guilds, process.env.JWT_SECRET).guilds
	const guildId = req.params.guildId

	if (!guilds.includes(guildId)) {
		throw new BadRequestError('Invalid Guild Id')
	}

	const guild = await GuildSchema.findOne({ _id: guildId }).select('-_id tags').lean()

	if (!guild) {
		throw new NotFoundError('Guild Not Found')
	}

	res.status(200).json(guild.tags ?? [])
}

const getQuotes = async (req, res) => {
	const guilds = jwt.verify(req.cookies.guilds, process.env.JWT_SECRET).guilds
	const { tags, type, text, authorId } = req.query
	const date = req.query.date == 'old' ? 1 : -1
	const guildId = req.params.guildId
	const sanitizedSearch = { guildId: guildId }
	const page = Number(req.query.page ?? 0)

	if (!guilds.includes(guildId)) {
		throw new BadRequestError('Invalid Guild Id')
	}

	if (page < 0 || isNaN(page)) {	
		throw new BadRequestError('Page must be number greater/equal to 0.')
	}
	
	if (type == 'image') {
		sanitizedSearch.attachmentURL = { $ne: null }
	} else if (type) {
		sanitizedSearch.type = type
		sanitizedSearch.attachmentURL = null
	}

	if (authorId) {
		sanitizedSearch.$or = [{ authorId: authorId }, { 'fragments.authorId': authorId }]
	}

	if (tags) {
		sanitizedSearch.tags = { $all: tags };
	}

	if (text) {
		sanitizedSearch.$text = { $search: text }
	}

	const quotes = await UniversalQuoteSchema.find(sanitizedSearch)
	.sort({ createdAt: date })
	.skip(page * 10).limit(10).select('-guildId').lean()

	res.status(200).json(quotes)
}

async function deleteAuthor(req, res) {
	const { guildId, authorId } = req.params

	const result = await GuildSchema.updateOne(
		{ _id: guildId },
		{ $pull: { authors: { _id: authorId } } },
	)

	if (!result.modifiedCount) {
		throw new NotFoundError(`Cannot find author: ${authorId}.`)
	}

	res.status(200).end()
}

async function deleteTag(req, res) {
	const { guildId, tag } = req.params

	const result = await GuildSchema.updateOne(
		{ _id: guildId },
		{ $pull: { tags: tag }
	}).select('-_id tags').lean()

	await UniversalQuoteSchema.updateMany(
		{ guildId: guildId, tags: { $all: [tag] }},
		{ $pull: { 'tags': tag } }
	)

	if (!result.modifiedCount) {
		throw new NotFoundError(`Cannot find tag: ${tag}.`)
	}

	res.status(200).end()
}

async function deleteQuote(req, res) {
	const { guildId, quoteId } = req.params

	const result = await UniversalQuoteSchema.deleteOne({ guildId: guildId, _id: quoteId })

	if (!result.deletedCount) {
		throw new NotFoundError(`Cannot find quote: ${quoteId}.`)
	}

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
}