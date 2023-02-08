const UniversalQuoteSchema = require('../../schemas/universal-quote-schema');
const { BadRequestError, NotFoundError } = require('../errors');
const jwt = require('jsonwebtoken')
require('express-async-errors')

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

async function deleteQuote(req, res) {
	const { guildId, quoteId } = req.params

	const result = await UniversalQuoteSchema.deleteOne({ guildId: guildId, _id: quoteId })

	if (!result.deletedCount) {
		throw new NotFoundError(`Cannot find quote: ${quoteId}.`)
	}

	res.status(200).end()
}

module.exports = { getQuotes, deleteQuote }