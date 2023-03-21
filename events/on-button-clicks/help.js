const { EmbedBuilder } = require('discord.js');
const { Events } = require('discord.js');
const client = require('../../index')

module.exports = {
	name: Events.InteractionCreate,
	once: false,
    execute: async (interaction) => {
        if (!interaction.isButton()) {
            return
        }

        const { type } = JSON.parse(interaction.customId)
        
        if (type !== 'help') {
            return
        }

        const commandsEmbed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('Commands:');

        for (let command of client.commands) {
            commandsEmbed.addFields({ name: `${command[0]}:`, value: `${command[1].data.description}` });
        }

        await interaction.reply({ embeds: [commandsEmbed] });
    }
}