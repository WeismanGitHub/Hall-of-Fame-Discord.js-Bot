const { NotFoundError, BadRequestError } = require('../errors');
const GuildSchema = require('../../schemas/guild-schema');
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

async function editAuthor(req, res) {
	const { removeDiscordId, removeIconURL, name, iconURL, discordId } = req.body
	const { guildId, authorId } = req.params;
	const update = {}
	
	if (iconURL) {
		update['authors.$.iconURL'] = iconURL
	}

	if (removeIconURL) {
		update['authors.$.iconURL'] = process.env.DEFAULT_ICON_URL
	}
	
	if (discordId) {
		update['authors.$.discordId'] = discordId
	}

	if (removeDiscordId) {
		update['authors.$.discordId'] = null
	}

	if (name) {
		const authorNameExists = await GuildSchema.exists({ _id: guildId, 'authors.name': name })
		update['authors.$.name'] = name
		
		if (authorNameExists) {
			throw new BadRequestError('Author Name Exists')
		}
	}

	const result = await GuildSchema.updateOne(
		{ "$and": [
			{ "_id": { "$eq": guildId } },
			{ "authors": { "$elemMatch": { "_id": { "$eq": authorId } } } }
		]},
		{ "$set": update },
	)

	if (!result.modifiedCount) {
		throw new NotFoundError(`Cannot edit author: ${authorId}.`)
	}

	res.status(200).end()
}

async function createAuthor(req, res) {
	const { name, iconURL } = req.body
	const { guildId } = req.params

	const authorNameExists = await GuildSchema.exists({ _id: guildId, 'authors.name': name })
	
	if (authorNameExists) {
		throw new BadRequestError('Author Exists')
	}

	await GuildSchema.updateOne(
		{ _id: guildId },
		{ $addToSet: { authors: { name, iconURL, discordId: null } }
	})
	
	res.status(200).end()
}

module.exports = { getAuthors, deleteAuthor, editAuthor, createAuthor }