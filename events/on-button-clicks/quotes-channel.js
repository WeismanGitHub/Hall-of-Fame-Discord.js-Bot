const QuoteSchema = require('../../schemas/quote-schema')
const sendQuotes = require('../../helpers/send-quotes')
const { basicEmbed } = require('../../helpers/embeds')
const { Events } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	once: false,
	execute: async (interaction) => {
        if (!interaction.isButton()) {
            return
        }

        const { channelId, type } = JSON.parse(interaction.customId)
        
        if (type !== 'quotes-channel') {
            return
        }

        const channel = await client.channels.fetch(channelId)
        const quotes = await QuoteSchema.find({ guildId: channel.guildId }).sort({ createdAt: 1 }).lean()
        
        await interaction.reply(basicEmbed('Designated Quotes Channel'))
        await sendQuotes(quotes, channel)
	}
}