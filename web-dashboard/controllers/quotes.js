const UniversalQuoteSchema = require('../../schemas/universal-quote-schema');
const { BadRequestError, NotFoundError } = require('../errors');
const { getAuthorById } = require('../../helpers/get-author');
require('express-async-errors')

const getQuotes = async (req, res) => {
	const { tags, type, text, authorId } = req.query
	const age = req.query.age == 'old' ? 1 : -1
	const sanitizedSearch = { guildId: req.params.guildId }
	const page = Number(req.query.page ?? 0)

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

module.exports = { getQuotes, deleteQuote, editQuote, createQuote }