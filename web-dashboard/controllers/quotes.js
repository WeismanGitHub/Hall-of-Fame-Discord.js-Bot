const { BadRequestError, NotFoundError, InvalidInputError, ForbiddenError } = require('../errors');
const UniversalQuoteSchema = require('../../schemas/universal-quote-schema');
const MultiQuoteSchema = require('../../schemas/multi-quote-schema')
const AudioQuoteSchema = require('../../schemas/audio-quote-schema')
const QuoteSchema = require('../../schemas/quote-schema');
const GuildSchema = require('../../schemas/guild-schema');
const { quoteEmbed } = require('../../helpers/embeds');
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
	
	const { authors, quotesChannelId } = await GuildSchema.findById(guildId).select('-_id quotesChannelId authors').lean()
	const client = req.app.get('client')
	const update = {}

	if (attachmentURL) {
		update.attachmentURL = attachmentURL
	} else if (removeImage) {
		update.attachmentURL = null
	}

	if (tags) {
		update.tags = tags
	} else if (removeTags) {
		update.tags = []
	}

	if (text) {
		update.text = text
	}
	
	if (authorId) {
		if (!authors.find(({ _id }) => authorId == _id)) {
			throw new InvalidInputError('Author could not be found.')
		}
		
		update.authorId = authorId
	}
	
	if (fragments) {
		update.fragments = fragments
	}

	if (audioURL) {
		update.audioURL = audioURL
	}

	let quote;

	// Can't use UniversalQuoteSchema because it has no pre save/update checks like other schemas.
	// Client inputted type can be trusted because properties that don't belong to a schema are discarded.
	switch (type) {
		case 'regular':
			quote = await QuoteSchema.findOneAndUpdate({ _id: quoteId, guildId: guildId }, update)
			break;
		case 'audio':
			quote = await AudioQuoteSchema.findOneAndUpdate({ _id: quoteId, guildId: guildId }, update)
			break;
		case 'multi':
			quote = await MultiQuoteSchema.findOneAndUpdate({ _id: quoteId, guildId: guildId }, update)
			break;
		default:
			throw new InvalidInputError('Invalid Quote Type')
	}

    if (quotesChannelId) {
        const channel = await client?.channels.fetch(quotesChannelId)
		.catch(err => {
			throw new Error('Quote successfully updated, but the quotes channel could not be fetched.')
		})

		const checkedFragments = [];
		let author;

		if (channel.guildId !== guildId) {
			throw new ForbiddenError('Quotes channel is not in this server.')
		}

		if (!channel) {
			throw new Error("Quote successfully updated, but the quotes channel is invalid.")
		}

		if (quote.type == 'multi') {
			for (let fragment of quote.fragments) {
				const authorName = (authors.find(({ _id }) => _id?.equals(fragment.authorId)))?.name
				fragment.authorName = authorName || 'Deleted Author'

				checkedFragments.push(fragment)
			}
		} else {
			author = (authors.find(({ _id }) => _id.equals(quote.authorId))) || {
				name: 'Deleted Author',
				iconURL: process.env.DEFAULT_ICON_URL
			}
		}

        await channel.send(quoteEmbed(quote, (quote.type !== 'multi' ? author : checkedFragments)))
		.catch(err => { throw new Error('Quote successfully updated, but could not be sent to the quotes channel.') })
	}

	res.status(200).end()
}

async function createQuote(req, res) {
	const {
		tags,
		type,
		authorId,
		fragments,
		audioURL,
		attachmentURL,
		text,
	} = req.body
	
	const quote = { guildId: req.params.guildId }

	if (attachmentURL) {
		quote.attachmentURL = attachmentURL
	}

	if (tags) {
		quote.tags = tags
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

	// Can't use UniversalQuoteSchema because it has no pre save/update checks like other schemas.
	// Client inputted type can be trusted because properties that don't belong to a schema are discarded.
	switch (type) {
		case 'regular':
			await QuoteSchema.create(quote)
			break;
		case 'audio':
			await AudioQuoteSchema.create(quote)
			break;
		case 'multi':
			await MultiQuoteSchema.create(quote)
			break;
		default:
			throw new InvalidInputError('Invalid Quote Type')
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