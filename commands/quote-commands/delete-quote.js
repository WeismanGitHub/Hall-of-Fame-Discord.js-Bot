const { basicEmbed } = require('../../helpers/embeds');
const { getLastQuote } = require('../../helpers/get-last-item');
const errorHandler = require('../../helpers/error-handler');
const QuoteSchema = require('../../schemas/quote-schema');
const { Constants } = require('discord.js');

module.exports = {
    category:'Quotes',
    name: 'delete_quote',
    description: 'Delete a quote. Quotes must have an author and can have up to three tags.',
    guildOnly: true,
    slash: true,

    options: [
        {
            name: 'id',
            description: 'The id of the quote.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'last_quote',
            description: "Use the last quote sent in a channel. Will grab any type of quote.",
            type: Constants.ApplicationCommandOptionTypes.CHANNEL
        },
    ],

    callback: async ({ interaction }) => errorHandler(interaction, async () => {
        const { options } = interaction;
        const id = options.getString('id') ?? await getLastQuote(lastQuoteChannel)
        const lastQuoteChannel = options.getChannel('last_quote');
        const guildId = interaction.guildId;

        const quote = await QuoteSchema.findOneAndDelete({ _id: id, guildId: guildId }).select('-_id text').lean()
        // Get quote so users can know what was deleted.

        if (!quote) {
            throw new Error('Quote does not exist!')
        } 

        const text = quote.text ? `'${quote.text.substring(0, 245)}'` : 'quote' // substring to fit 256 char title limit.
        await interaction.reply(basicEmbed(`Deleted ${text}!`));
    })
};