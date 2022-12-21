const { MessageEmbed } = require('discord.js');
const { errorEmbed } = require('../../helpers/embeds');

module.exports = async (client, instance) => {
    client.on('interactionCreate', async (interaction) => {
        try {
            if (!interaction.isButton()) {
                return
            }

            const customId = interaction.customId.split(',')
            const type = customId[2]
            // maybe come up with a less hacky solution for button type
            
            if (type !== 'help') {
                return
            }

            const blackListedCommands = ['language', 'prefix', 'notify', 'slash'];
            const commandsEmbed = new MessageEmbed()
            .setColor('#5865F2')
            .setTitle('Commands:');
    
            for (let command of instance.commandHandler.commands) {
                if (!blackListedCommands.includes(command.names[0])) {
                    commandsEmbed.addFields({ name: `${command.names[0]}:`, value: `${command.description}` });
                }
            }

            await interaction.reply({ embeds: [commandsEmbed] });
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