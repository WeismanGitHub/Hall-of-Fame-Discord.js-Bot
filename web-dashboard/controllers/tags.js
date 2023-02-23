const UniversalQuoteSchema = require('../../schemas/universal-quote-schema');
const GuildSchema = require('../../schemas/guild-schema');
const { NotFoundError } = require('../errors');
require('express-async-errors')

const getTags = async (req, res) => {
	const guild = await GuildSchema.findOne({ _id: req.params.guildId }).select('-_id tags').lean()

	if (!guild) {
		throw new NotFoundError('Guild Not Found')
	}

	res.status(200).json(guild.tags ?? [])
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

async function editTag(req, res) {
	const { guildId, tag } = req.params
	const newTag = req.body.newTag

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

async function createTag(req, res) {
	const tag = req.body.tag.toLowerCase();

	await GuildSchema.updateOne(
		{ _id: req.params.guildId },
		{ $addToSet: { tags: tag } }
	)

	res.status(200).end()
}

module.exports = { getTags, deleteTag, editTag, createTag, createTag }