const UniversalQuoteSchema = require('../../schemas/universal-quote-schema');
const { ForbiddenError, NotFoundError } = require('../errors');
const GuildSchema = require('../../schemas/guild-schema');
const jwt = require('jsonwebtoken')
require('express-async-errors')

const getTags = async (req, res) => {
	const guilds = jwt.verify(req.cookies.guilds, process.env.JWT_SECRET).guilds
	const guildId = req.params.guildId

	if (!guilds.includes(guildId)) {
		throw new ForbiddenError('Invalid Guild Id')
	}

	const guild = await GuildSchema.findOne({ _id: guildId }).select('-_id tags').lean()

	if (!guild) {
		throw new NotFoundError('Guild Not Found')
	}

	res.status(200).json(guild.tags ?? [])
}

async function deleteTag(req, res) {
	const guilds = jwt.verify(req.cookies.guilds, process.env.JWT_SECRET).guilds
	const { guildId, tag } = req.params

	if (!guilds.includes(guildId)) {
		throw new ForbiddenError('Invalid Guild Id')
	}

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

async function editTag(req, res) {
	const guilds = jwt.verify(req.cookies.guilds, process.env.JWT_SECRET).guilds
	const { guildId, tag } = req.params
	const newTag = req.body.newTag

	if (!guilds.includes(guildId)) {
		throw new ForbiddenError('Invalid Guild Id')
	}

	const result = await GuildSchema.updateOne(
		{ _id: guildId, tags: tag },
		{ $set: { 'tags.$': newTag }
	})

	if (!result.modifiedCount) {
		throw new NotFoundError(`Cannot find tag: ${tag}.`)
	}
	
	await UniversalQuoteSchema.updateMany(
		{ guildId: guildId, tags: tag },
		{ $set: { 'tags.$': newTag } }
	)

	res.status(200).end()
}

module.exports = { getTags, deleteTag, editTag }