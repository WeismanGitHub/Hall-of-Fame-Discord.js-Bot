const UniversalQuoteSchema = require('../../schemas/universal-quote-schema');
const { BadRequestError, NotFoundError } = require('../errors');
const GuildSchema = require('../../schemas/guild-schema');
const jwt = require('jsonwebtoken')
require('express-async-errors')

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

async function editTag() {

}

module.exports = { getTags, deleteTag, editTag }