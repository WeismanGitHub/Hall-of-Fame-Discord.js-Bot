const AudioQuoteSchema = require('./schemas/audio_quote_schema')
const QuoteSchema = require('./schemas/quote_schema')
const GuildSchema = require('./schemas/guild_schema')
const { faker } = require('@faker-js/faker');

async function createFakeData(guildAmount = 5, authorsPerGuild = 10, tagsPerGuild = 10, regQuotesPerAuthor = 10, audioQuotesPerAuthor = 2) {
    const authorImgLink = 'https://cdn.discordapp.com/avatars/973042179033415690/a6602f6209ef6546ee8d878e0022a4f3.png?size=4096'
    const audioQuoteLink = 'https://media.discordapp.net/attachments/1025999685787336725/1031490055946129408/futurama-zoidberg-1.mp4'

    for (let i = 0; i < guildAmount; i++) {
        const authors = []
        const tags = []

        for (let j = 0; j < tagsPerGuild; j++) {
            tags.push(faker.word.adjective())
        }

        for (let k = 0; k < authorsPerGuild; k++) {
            authors.push({ name: `${faker.name.firstName()} ${faker.name.lastName()}`, imgUrl: authorImgLink })
        }

        const guild = await GuildSchema.create({
            guildId: faker.mersenne.rand(100000000000000, 999999999999999),
            tags: tags,
            authors: authors
        })

        for (const author of guild.authors) {
            const audioQuotes = []
            const quotes = []
            
            for (let l = 0; l < regQuotesPerAuthor; l++) {
                const attachment = Math.floor(Math.random() * 10) % 2 ? { attachment: authorImgLink } : null
                const tagsNumber = Math.floor(Math.random() * tagsPerGuild + 1)
                let text = null;
                
                if (attachment == null || Math.floor(Math.random()*10) % 2) {
                    text = { text: faker.lorem.sentence() }
                }
    
                quotes.push({
                    guildId: guild._id,
                    authorId: author._id,
                    ...attachment,
                    ...text,
                    tags: tags.slice(tagsNumber, tagsNumber + Math.floor(Math.random() * 4))
                })
            }
            
            for (let m = 0; m < audioQuotesPerAuthor; m++) {
                const tagsNumber = Math.floor(Math.random() * tagsPerGuild + 1)
                
                audioQuotes.push({
                    guildId: guild._id,
                    authorId: author._id,
                    audioFileLink: audioQuoteLink,
                    text: faker.lorem.sentence(),
                    tags: tags.slice(tagsNumber, tagsNumber + Math.floor(Math.random() * 4))
                })
            }

            await AudioQuoteSchema.create(audioQuotes)
            await QuoteSchema.create(quotes)
        }
    }
}

module.exports = createFakeData