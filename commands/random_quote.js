const {quoteEmbed, errorEmbed, getAuthorById} = require('../functions');
const QuoteSchema = require('../schemas/quote-schema');

module.exports = {
    category:'Quotes',
    description: 'Get a random quote.',
    name: 'randomquote',
    slash: true,

    callback: async ({interaction}) => {
        try {
            const guildId = interaction.guildId;

            const amountOfDocuments = await QuoteSchema.countDocuments({ guildId: guildId })

            if (!amountOfDocuments) {
                throw new Error('You have no quotes.')
            }

            const randomNumber = Math.floor(Math.random() * amountOfDocuments) + 0;

            const randomQuote = await QuoteSchema.findOne(
                {guildId: guildId}
            ).skip(randomNumber).lean()

            const author = await getAuthorById(randomQuote.authorId, guildId);
            await interaction.reply(quoteEmbed(randomQuote, author));

        } catch(err) {
            await interaction.reply(errorEmbed(err))
        };
    }
};