const MultiQuoteSchema = require('./schemas/multi-quote-schema')
const AudioQuoteSchema = require('./schemas/audio-quote-schema')
const QuoteSchema = require('./schemas/quote-schema')
const GuildSchema = require('./schemas/guild-schema')
const { faker } = require('@faker-js/faker');
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.FAKE_DATA_MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

async function createFakeData(
    guildAmount = 5,
    authorsPerGuild = 10,
    tagsPerGuild = 10,
    regQuotesPerAuthor = 10,
    audioQuotesPerAuthor = 5,
    multiQuotesPerAuthor = 2
) {
    const fakeURL = 'https://fake.url'

    for (let i = 0; i < guildAmount; i++) {
        const authors = []
        const tags = []

        for (let j = 0; j < tagsPerGuild; j++) {
            tags.push(faker.word.adjective())
        }

        for (let k = 0; k < authorsPerGuild; k++) {
            authors.push({ name: faker.name.firstName(), iconURL: fakeURL })
        }

        const guild = await GuildSchema.create({
            _id: faker.datatype.number({ min: 100000000000000, max: 999999999999999 }),
            tags: tags,
            authors: authors
        })

        for (const author of guild.authors) {
            const regularQuotes = []
            const audioQuotes = []
            const multiQuotes = []
            
            for (let l = 0; l < regQuotesPerAuthor; l++) { // Regular Quotes
                const tagAmount = faker.datatype.number({ 'min': 0, 'max': tagsPerGuild });
                const imageURL = faker.datatype.number({ 'min': 0, 'max': 1 }) ? fakeURL : null
                let text = null;
                
                if (imageURL == null || faker.datatype.number({ 'min': 0, 'max': 1 })) {
                    text = faker.lorem.sentence()
                }
    
                regularQuotes.push({
                    guildId: guild._id,
                    authorId: author._id,
                    attachmentURL: imageURL,
                    text: text,
                    tags: tags.slice(tagAmount, tagAmount + faker.datatype.number({ 'min': 0, 'max': 3 }))
                })
            }
            
            for (let m = 0; m < audioQuotesPerAuthor; m++) { // Audio Quotes
                const tagAmount = faker.datatype.number({ 'min': 0, 'max': tagsPerGuild });
                
                audioQuotes.push({
                    guildId: guild._id,
                    authorId: author._id,
                    audioURL: fakeURL,
                    text: faker.lorem.sentence(),
                    tags: tags.slice(tagAmount, tagAmount + faker.datatype.number({ 'min': 0, 'max': 3 }))
                })
            }

            for (let n = 0; n < multiQuotesPerAuthor; n++) { // Multi Quotes
                const tagAmount = faker.datatype.number({ 'min': 0, 'max': tagsPerGuild });
                const fragmentAmount = faker.datatype.number({ 'min': 2, 'max': 5 });
                const fragments = []

                for (let o = 0; o < fragmentAmount; o++) {
                    fragments.push({ authorId: author._id, text: faker.lorem.sentence() })
                }

                multiQuotes.push({
                    guildId: guild._id,
                    fragments: fragments,
                    text: faker.lorem.sentence(),
                    tags: tags.slice(tagAmount, faker.datatype.number({ 'min': 0, 'max': 3 }))
                })
            }

            await AudioQuoteSchema.create(audioQuotes)
            await MultiQuoteSchema.create(multiQuotes)
            await QuoteSchema.create(regularQuotes)
        }
    }
}

createFakeData().then(console.log('Done!'))