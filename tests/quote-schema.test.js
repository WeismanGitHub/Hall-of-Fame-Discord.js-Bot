const QuoteSchema = require('../schemas/quote-schema')
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.FAKE_DATA_MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

describe('Quote Schema Tests', () => {
    const id = '63a81898166d642afbd1fed9'

    afterAll(async () => {
        await QuoteSchema.deleteMany({ guildId: id })
    })

    describe('URL validation tests.',  () => {
        test('not a url', async () => {
            try {
                await QuoteSchema.create({ guildId: id, authorId: id, attachmentURL: 'invalid url' })
            } catch(err) {
                return true
            }
        })

        test('url is too long', async () => {
            try {
                await QuoteSchema.create({ guildId: id, authorId: id, attachmentURL: [...Array(513).keys()].join('') })
            } catch(err) {
                return true
            }
        })

        test('empty url', async () => {
            try {
                await QuoteSchema.create({ guildId: id, authorId: id, attachmentURL: '' })
            } catch(err) {
                return true
            }
        })

        test('valid url', async () => {
            await QuoteSchema.create({ guildId: id, authorId: id, attachmentURL: 'https://fake.url' })
        })
    });

    describe('Tags validation tests.',  () => {
        test('empty tag', async () => {
            try {
                await QuoteSchema.create({ guildId: id, authorId: id, tags: [''] })
            } catch(err) {
                return true
            }
        })

        test('tag is too long', async () => {
            try {
                await QuoteSchema.create({ guildId: id, authorId: id, tags: [[...Array(339).keys()].join('')] })
            } catch(err) {
                return true
            }
        })

        test('valid tags', async () => {
            try {
                await QuoteSchema.create({ guildId: id, authorId: id, tags: ['tag 1', 'tag 2'] })
            } catch(err) {
                return false
            }
        })
    });
})