const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const { errorEmbed, basicEmbed } = require('../helpers/embeds');
const QuoteSchema = require('../schemas/quote_schema');
const FilterSchema = require('../schemas/filter_schema');
const sendQuotes = require('../helpers/send_quotes')

module.exports = async (client, instance) => {
    client.on('interactionCreate', async (interaction) => {
        try {
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
            } else if (type == 'findQuotes') {
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
            } else if (type == 'getCommandDescriptions') {
                //get instance or whatever, maybe come up with a less hacky solution for button type and buttons in general

                const blackListedCommands = ['language', 'prefix', 'notify', 'slash'];
                const commandsEmbed = new MessageEmbed()
                .setColor('#5865F2')
                .setTitle('Commands:');
      
                for await (let command of instance.commandHandler.commands) {
                    if (!blackListedCommands.includes(command.names[0])) {
                        commandsEmbed.addFields({ name: `${command.names[0]}:`, value: `${command.description}` });
                    }
                }

                return await interaction.reply({ embeds: [commandsEmbed] });
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