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

    describe('attachmentURL validation tests.',  () => {
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
                await QuoteSchema.create({ guildId: id, authorId: id, tags: [''], text: 'test' })
            } catch(err) {
                return true
            }
        })

        test('tag is too long', async () => {
            try {
                await QuoteSchema.create({ guildId: id, authorId: id, tags: [[...Array(339).keys()].join('')], text: 'test' })
            } catch(err) {
                return true
            }
        })

        test('valid tags', async () => {
            try {
                await QuoteSchema.create({ guildId: id, authorId: id, tags: ['tag 1', 'tag 2'], text: 'test' })
            } catch(err) {
                return false
            }
        })
    });

    describe('Text validation tests.',  () => {
        test('empty text', async () => {
            try {
                await QuoteSchema.create({ guildId: id, authorId: id, text: '' })
            } catch(err) {
                return true
            }
        })

        test('text is too long', async () => {
            try {
                await QuoteSchema.create({ guildId: id, authorId: id, text: [...Array(4096).keys()].join('') })
            } catch(err) {
                return true
            }
        })

        test('valid text', async () => {
            try {
                await QuoteSchema.create({ guildId: id, authorId: id, text: 'valid text' })
            } catch(err) {
                return false
            }
        })
    });

    describe('Type validation tests.',  () => {
        test('invalid type', async () => {
            try {
                await QuoteSchema.create({ guildId: id, authorId: id, type: 'multi', text: 'text' })
            } catch(err) {
                return true
            }
        })

        test('valid type', async () => {
            try {
                await QuoteSchema.create({ guildId: id, authorId: id, type: 'regular', text: 'text'})
            } catch(err) {
                return false
            }
        })
    });
})