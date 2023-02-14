const GuildSchema = require('../../schemas/guild-schema');
const { NotFoundError } = require('../errors');
require('express-async-errors')

const getAuthors =  async (req, res) => {
	const guild = await GuildSchema.findOne({ _id: req.params.guildId }).select('-_id authors').lean()

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

module.exports = { getAuthors, deleteAuthor }