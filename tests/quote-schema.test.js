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
        await QuoteSchema.deleteMany({ _id: id })
    })

    describe('URL Validation',  () => {
        it('causes error', async () => {
            try {
                await QuoteSchema.create({ guildId: id, authorId: id, attachmentURL: 'invalid url' })
            } catch(err) {
                return true
            }
        })

        it('succeeds', async () => {
            await QuoteSchema.create({ guildId: id, authorId: id, attachmentURL: 'https://fake.url' })
        })
    });
})