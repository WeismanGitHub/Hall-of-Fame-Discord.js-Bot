const { MessageActionRow, MessageButton } = require('discord.js');
const { errorEmbed, basicEmbed } = require('../../helpers/embeds');
const QuoteSchema = require('../../schemas/quote_schema');
const FilterSchema = require('../../schemas/filter_schema');
const sendQuotes = require('../../helpers/send_quotes')

module.exports = async (client, instance) => {
    client.on('interactionCreate', async (interaction) => {
        try {
            if (!interaction.isButton()) {
                return
            }

            const customId = interaction.customId.split(',')
            const skipAmount = customId[0]
            const type = customId[2]

            if (type !== 'find_quotes') {
                return
            }
            
            const filter = await FilterSchema.findById(customId[1]).lean()

            if (!filter) {
                throw new Error('Please use the command again. This button is broken.')
            }

            const { query, sort } = filter

            const quotes = await QuoteSchema.find(query)
            .sort(sort).skip(skipAmount).limit(10).lean();

            const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setCustomId(`${Number(skipAmount) + 10},${filter._id},find_quotes`)
                .setLabel('Next 10 Quotes ⏩')
                .setStyle('PRIMARY')
            )
    
            await interaction.reply(basicEmbed('Started!'));

            // sendQuotes modifies quotes array so gotta use a copy.
            await sendQuotes([...quotes], interaction.channel)
    
            if (quotes.length !== 10) {
                return await interaction.channel.send(basicEmbed('End of the line!'))
            }
    
            await interaction.channel.send({
                components: [row]
            })
        } catch(err) {
            await interaction.reply(errorEmbed(err))
            .catch(_ => interaction.channel.send(errorEmbed(err)))
        }
    })
}

module.exports.config = {
    dbName: "onButtonClick",
    displayName: "on_button_click",
}