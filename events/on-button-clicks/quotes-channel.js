const { errorEmbed, basicEmbed } = require('../../helpers/embeds')
const QuoteSchema = require('../../schemas/quote-schema')
const sendQuotes = require('../../helpers/send-quotes')

module.exports =  (client) => {
    client.on('interactionCreate', async (interaction) => {
        try {
            if (!interaction.isButton()) {
                return
            }

            const { channelId, type } = JSON.parse(interaction.customId)
            
            if (type !== 'quotes-channel') {
                return
            }
    
            const channel = await client.channels.fetch(channelId)
            const quotes = await QuoteSchema.find({ guildId: channel.guildId }).sort({ createdAt: 1 }).lean()
            
            await interaction.reply(basicEmbed(`Designated Quotes Channel`))
            await sendQuotes(quotes, channel)
        } catch(err) {
            await interaction.reply(errorEmbed(err))
            .catch(_ => interaction.channel.send(errorEmbed(err)))
        }
    })
}

module.exports.config = {
    dbName: "on-button-click",
    displayName: "on-button-click",
}