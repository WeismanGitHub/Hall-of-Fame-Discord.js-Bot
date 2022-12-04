const { errorEmbed, basicEmbed } = require('../../helpers/embeds');
const { getLastQuote } = require('../../helpers/get-last-item');
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
            description: 'Use the last quote sent in a channel.',
            type: Constants.ApplicationCommandOptionTypes.CHANNEL
        },
    ],

    callback: async ({ interaction }) => {
        try {
            const { options } = interaction;
            const lastQuoteChannel = options.getChannel('last_quote');
            const _id = options.getString('id') ?? await getLastQuote(lastQuoteChannel)
            const guildId = interaction.guildId;
    
            const quote = await QuoteSchema.findOneAndDelete({ _id: _id, guildId: guildId }).select('-_id text').lean()

            if (quote) {
                const text = quote.text ? `'${quote.text}'` : 'quote'
                await interaction.reply(basicEmbed(`Deleted ${text}!`));
            } else {
                throw new Error('Quote does not exist!')
            }
        } catch(err) {
            interaction.reply(errorEmbed(err))
            .catch(_ => interaction.channel.send(errorEmbed(err)))
        }
    }
};