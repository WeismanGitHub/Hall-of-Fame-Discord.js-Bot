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
            name: 'remove_channel',
            description: 'Remove the quotes channel.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
            choices: [
                {
                    name: 'remove',
                    value: 'true'
                },
                {
                    name: 'keep',
                    value: 'false'
                },
            ]
        }
    ],

    callback: async ({ interaction }) => errorHandler(interaction, async () => {
        const { options } = interaction;
        const guildId = interaction.guildId;
        const quotesChannel = options.getChannel('quotes_channel');
        const removeChannel = options.getString('remove_channel');

        if (removeChannel == null && !quotesChannel) {
            throw new Error('Please use a parameter.')
        }

        if (removeChannel) {
            await GuildSchema.updateOne({ _id: guildId }, { $unset: { quotesChannelId: true } })
            return await interaction.reply(basicEmbed('Removed quotes channel!'))
        }
        
        if (quotesChannel.type !== 'GUILD_TEXT') {
            throw new Error('Channel must be text channel.')
        }

        await GuildSchema.updateOne({ _id: guildId }, { quotesChannelId: quotesChannel.id })

        await interaction.reply(basicEmbed(`All quotes will be in #${quotesChannel.name} now!`))

        const quotes = await QuoteSchema.find({ guildId: guildId }).sort({ createdAt: 1 }).lean()
        await sendQuotes(quotes, quotesChannel)
    })
};