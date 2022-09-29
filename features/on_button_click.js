const { MessageActionRow, MessageButton } = require('discord.js');
const { errorEmbed, basicEmbed } = require('../helpers/embeds');
const QuoteSchema = require('../schemas/quote_schema');
const FilterSchema = require('../schemas/filter_schema');
const sendQuotes = require('../helpers/send_quotes')

module.exports = async (client, instance) => { //see if you can remove instance
    try {
        client.on('interactionCreate', async (interaction) => {
            if (!interaction.isButton()) {
                return
            }

            const customId = interaction.customId.split(',')
            const skipAmount = customId[0]
            const type = customId[2]
            
            if (type == 'getAllQuotes') {
                const date = customId[1]
    
                var quotes = await QuoteSchema.find({ guildId: interaction.guild.id })
                .sort({ createdAt: date }).skip(skipAmount).limit(10).lean();
        
                if (!quotes.length) {
                    return await interaction.reply(basicEmbed('No more quotes!'))
                }
        
                var row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                    .setCustomId(`${Number(skipAmount) + 10},${date},getAllQuotes`)
                    .setLabel('Next 10 Quotes ⏩')
                    .setStyle('PRIMARY')
                )
            } else {
                const filterObject = await FilterSchema.findById(customId[1]).lean()
    
                if (!filterObject) {
                    throw new Error('Please use the command again. This button is broken.')
                }
    
                const { queryObject, sortObject } = filterObject
    
                var quotes = await QuoteSchema.find(queryObject)
                .sort(sortObject).skip(skipAmount).limit(10).lean();
    
                var row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                    .setCustomId(`${Number(skipAmount) + 10},${filterObject._id},findQuotes`)
                    .setLabel('Next 10 Quotes ⏩')
                    .setStyle('PRIMARY')
                )
            }
    
            await interaction.reply(basicEmbed('Started!'));

            // sendQuotes modifies quotes array so gotta use a copy.
            await sendQuotes([...quotes], interaction.channel)
    
            if (quotes.length !== 10) {
                return await interaction.channel.send(basicEmbed('End of the line!'))
            }
    
            await interaction.channel.send({
                components: [row]
            })
        })
    } catch(err) {
        await interaction.reply(errorEmbed(err))
        .catch(_ => interaction.channel.send(errorEmbed(err)))
    }
}

module.exports.config = {
    dbName: "onButtonClick",
    displayName: "on_button_click",
}