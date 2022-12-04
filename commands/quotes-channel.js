const { errorEmbed, basicEmbed } = require('../helpers/embeds');
const CoolDownSchema = require('../schemas/cooldown-schema')
const QuoteSchema = require('../schemas/quote-schema');
const GuildSchema = require('../schemas/guild-schema');
const sendQuotes = require('../helpers/send-quotes');
const { Constants } = require('discord.js');
const moment = require('moment');

module.exports = {
    category:'Quotes',
    name: 'quotes_channel',
    description: 'Choose a channel to have all the quotes in. It will be updated when new quotes are created.',
    guildOnly: true,
    slash: true,

    options: [
        {
            name: 'quotes_channel',
            description: 'Choose a channel to have all the quotes in. It will be updated with new quotes. 12 hour cooldown.',
            type: Constants.ApplicationCommandOptionTypes.CHANNEL,
        },
        {
            name: 'turn_off',
            description: 'Remove the quotes channel.',
            type: Constants.ApplicationCommandOptionTypes.BOOLEAN,
        }
    ],

    callback: async ({ interaction }) => {
        try {
            const { options } = interaction;
            const guildId = interaction.guildId;
            const quotesChannel = options.getChannel('quotes_channel');
            const turnOff = options.getBoolean('turn_off');

            if (turnOff == null && !quotesChannel) {
                throw new Error('Please use a parameter.')
            }

            if (turnOff) {
                await GuildSchema.updateOne({ guildId: guildId}, { $unset: { quotesChannelId: true } })
                return await interaction.reply(basicEmbed('Removed quotes channel!'))
            }
            
            const cooldown = await CoolDownSchema.findOne({ _id: interaction.user.id, command: 'quotes_channel' }).lean()

            if (cooldown?.command == 'quotes_channel') {
                const timeFromNow = moment(cooldown.expirationDate).fromNow()
                throw new Error(`You can only change the quotes channel every twelve hours. Try again ${timeFromNow}.`)
            }

            await CoolDownSchema.create({ _id: interaction.user.id, command: 'quotes_channel' })
            await GuildSchema.updateOne({ guildId: guildId }, { quotesChannelId: quotesChannel.id })

            await interaction.reply(basicEmbed(`All quotes will be in #${quotesChannel.name} now!`))

            const quotes = await QuoteSchema.find({ guildId: guildId }).sort({ createdAt: 1 }).lean()
            await sendQuotes(quotes, quotesChannel)
        } catch(err) {
            interaction.reply(errorEmbed(err))
            .catch(_ => interaction.channel.send(errorEmbed(err)))
        }
    }
};