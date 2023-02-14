const { ForbiddenError, NotFoundError } = require('../errors');
const GuildSchema = require('../../schemas/guild-schema');
const jwt = require('jsonwebtoken')
require('express-async-errors')

const getAuthors =  async (req, res) => {
	const guilds = jwt.verify(req.cookies.guilds, process.env.JWT_SECRET).guilds
	const guildId = req.params.guildId

	if (!guilds.includes(guildId)) {
		throw new ForbiddenError('Invalid Guild Id')
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

async function deleteAuthor(req, res) {
	const guilds = jwt.verify(req.cookies.guilds, process.env.JWT_SECRET).guilds
	const { guildId, authorId } = req.params

	if (!guilds.includes(guildId)) {
		throw new ForbiddenError('Invalid Guild Id')
	}

	const result = await GuildSchema.updateOne(
		{ _id: guildId },
		{ $pull: { authors: { _id: authorId } } },
	)

	if (!result.modifiedCount) {
		throw new NotFoundError(`Cannot find author: ${authorId}.`)
	}

	res.status(200).end()
}

module.exports = { getAuthors, deleteAuthor }