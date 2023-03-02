const UniversalQuoteSchema = require('../../schemas/universal-quote-schema');
const { BadRequestError, NotFoundError } = require('../errors');
const { getAuthorById } = require('../../helpers/get-author');
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
	const { guildId } = req.params
	const {
		type,
		tags,
		authorId,
		fragments
	} = req.body

	switch (type) {
		case 'regular':
			console.log('regular')
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

	const amountOfDocuments = await UniversalQuoteSchema.countDocuments(query)

	if (!amountOfDocuments) {
		throw new NotFoundError('Cannot find quotes.')
	}
	
	const randomNumber = Math.floor(Math.random() * amountOfDocuments);

	const quotes = await UniversalQuoteSchema.find(query)
	.skip(randomNumber).limit(amount).select('-guildId').lean()

	res.status(200).json(quotes)
}

async function countQuotes(req, res) {
	const { tags, type, text, authorId } = req.query
	const query = { guildId: req.params.guildId }

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

	const amount = await UniversalQuoteSchema.countDocuments(query)
	
	if (!amount) {
		throw new NotFoundError('Cannot find quotes.')
	}

	res.status(200).json({ amount: amount })
}

module.exports = { getQuotes, deleteQuote, editQuote, createQuote, getRandomQuotes, countQuotes }