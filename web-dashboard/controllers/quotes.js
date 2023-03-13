const { BadRequestError, NotFoundError, InvalidInputError } = require('../errors');
const UniversalQuoteSchema = require('../../schemas/universal-quote-schema');
const MultiQuoteSchema = require('../../schemas/multi-quote-schema')
const AudioQuoteSchema = require('../../schemas/audio-quote-schema')
const { getAuthorById } = require('../../helpers/get-author');
const QuoteSchema = require('../../schemas/quote-schema');
require('express-async-errors')

const getQuotes = async (req, res) => {
	const { tags, type, text, authorId } = req.query
	const query = { guildId: req.params.guildId }
	const age = req.query.age == 'old' ? 1 : -1
	const page = Number(req.query.page || 0)

	if (page < 0 || isNaN(page)) {	
		throw new BadRequestError('Page must be number greater/equal to 0.')
	}
	
	if (type == 'image') {
		query.attachmentURL = { $ne: null }
	} else if (type) {
		query.type = type
		query.attachmentURL = null
	}

	if (authorId) {
		query.$or = [{ authorId: authorId }, { 'fragments.authorId': authorId }]
	}

	if (tags) {
		query.tags = { $all: tags };
	}

	if (text) {
		query.$text = { $search: text }
	}

	const quotes = await UniversalQuoteSchema.find(query)
	.sort({ createdAt: age })
	.skip(page * 10).limit(10).select('-guildId').lean()

	res.status(200).json(quotes)
}

async function deleteQuote(req, res) {
	const { guildId, quoteId } = req.params

	const result = await UniversalQuoteSchema.deleteOne({ guildId: guildId, _id: quoteId })

	if (!result.deletedCount) {
		throw new NotFoundError(`Cannot delete quote: ${quoteId}.`)
	}

	res.status(200).end()
}

async function editQuote(req, res) {
	const { guildId, quoteId } = req.params
	const {
		tags,
		type,
		authorId,
		fragments,
		removeTags,
		removeImage,
		audioURL,
		attachmentURL,
		text,
	} = req.body
	
	// Can't use UniversalQuoteSchema because it has no pre save/update checks like other schemas.
	const quote = await ((type) => {
		switch (type) {
			case 'regular':
				return QuoteSchema.findOne({ _id: quoteId, guildId: guildId })
			case 'audio':
				return AudioQuoteSchema.findOne({ _id: quoteId, guildId: guildId })
			case 'multi':
				return MultiQuoteSchema.findOne({ _id: quoteId, guildId: guildId })
			default:
				throw new InvalidInputError('Invalid Quote Type')
		}
	})(type)

	if (attachmentURL) {
		quote.attachmentURL = attachmentURL
	} else if (removeImage) {
		quote.attachmentURL = null
	}

	if (tags) {
		quote.tags = tags
	} else if (removeTags) {
		quote.tags = []
	}

	if (text) {
		quote.text = text
	}
	
	if (authorId) {
		quote.authorId = authorId
	}
	
	if (fragments) {
		quote.fragments = fragments
	}

	if (audioURL) {
		quote.audioURL = audioURL
	}

	await quote.save()

	res.status(200).end()
}

async function createQuote(req, res) {
	const { guildId } = req.params
	const {
		type,
		tags,
		authorId,
		fragments,
		text,
		attachmentURL,
		audioURL,
	} = req.body

	if (authorId) {
		const authorName = await getAuthorById(authorId)

		if (authorName == 'Deleted Author') {
            throw new NotFoundError(`Cannot find author: ${quoteId}.`)
        }
	}

	switch (type) {
		case 'regular':
			await UniversalQuoteSchema.create({
				guildId,
				authorId,
				text,
				tags,
				attachmentURL,
			})
			break;
		case 'audio':
			console.log('audio')
			break;
		case 'multi':
			console.log('multi')
			break;
	}

	res.status(200).end()
}

async function getRandomQuotes(req, res) {
	const { tags, type, text, authorId } = req.query
	const query = { guildId: req.params.guildId }
	const amount = Number(req.query.amount || 10)

	if (isNaN(amount) || amount < 1 || amount > 10) {
		throw new BadRequestError('Amount must be between 1 and 10.')
	}
	
	if (type == 'image') {
		query.attachmentURL = { $ne: null }
	} else if (type) {
		query.type = type
		query.attachmentURL = null
	}

	if (authorId) {
		query.$or = [{ authorId: authorId }, { 'fragments.authorId': authorId }]
	}

	if (tags) {
		query.tags = { $all: tags };
	}

	if (text) {
		query.$text = { $search: text }
	}

	const quotes = await UniversalQuoteSchema.aggregate([
		{ $match: query },
		{ $sample: { size: amount } }
	])

	res.status(200).json(quotes)
}

async function countQuotes(req, res) {
	// Using just "type" doesn't work. I'm guessing that's a reserved property or something?
	const { tags, quoteType, text, authorId } = req.query
	const query = { guildId: req.params.guildId }

	if (quoteType == 'image') {
		query.attachmentURL = { $ne: null }
	} else if (quoteType) {
		query.type = quoteType
		query.attachmentURL = null
	}

	if (authorId) {
		query.$or = [{ authorId: authorId }, { 'fragments.authorId': authorId }]
	}

	if (tags) {
		query.tags = { $all: tags };
	}

	if (text) {
		query.$text = { $search: text }
	}

	const amount = await UniversalQuoteSchema.countDocuments(query)

	res.status(200).json({ amount: amount })
}

module.exports = { getQuotes, deleteQuote, editQuote, createQuote, getRandomQuotes, countQuotes }