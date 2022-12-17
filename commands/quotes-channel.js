const errorHandler = require('../helpers/error-handler')
const QuoteSchema = require('../schemas/quote-schema');
const GuildSchema = require('../schemas/guild-schema');
const sendQuotes = require('../helpers/send-quotes');
const { basicEmbed } = require('../helpers/embeds');
const { Constants } = require('discord.js');

module.exports = {
    category:'Quotes',
    name: 'quotes_channel',
    description: 'Choose a channel to have all the quotes in. It will be updated when new quotes are created.',
    guildOnly: true,
    slash: true,

    options: [
        {
            name: 'quotes_channel',
            description: 'Choose a channel to have all the quotes in. It will be updated with new quotes.',
            type: Constants.ApplicationCommandOptionTypes.CHANNEL,
        },
        {
            name: 'turn_off',
            description: 'Remove the quotes channel.',
            type: Constants.ApplicationCommandOptionTypes.BOOLEAN,
        }
    ],

    callback: async ({ interaction }) => errorHandler(interaction, async () => {
        const { options } = interaction;
        const guildId = interaction.guildId;
        const quotesChannel = options.getChannel('quotes_channel');
        const turnOff = options.getBoolean('turn_off');

        if (turnOff == null && !quotesChannel) {
            throw new Error('Please use a parameter.')
        }

        if (turnOff) {
            await GuildSchema.updateOne({ _id: guildId}, { $unset: { quotesChannelId: true } })
            return await interaction.reply(basicEmbed('Removed quotes channel!'))
        }

        await GuildSchema.updateOne({ _id: guildId }, { quotesChannelId: quotesChannel.id })

        await interaction.reply(basicEmbed(`All quotes will be in #${quotesChannel.name} now!`))

        const quotes = await QuoteSchema.find({ guildId: guildId }).sort({ createdAt: 1 }).lean()
        await sendQuotes(quotes, quotesChannel)
    })
};