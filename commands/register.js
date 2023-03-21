const errorHandler = require('../helpers/error-handler');
const GuildSchema = require('../schemas/guild-schema');
const { SlashCommandBuilder } = require('discord.js');
const { basicEmbed } = require('../helpers/embeds');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('register')
		.setDescription('Register your server.')
        .setDMPermission(false)
	,
	execute: async (interaction) => errorHandler(interaction, async () => {
        const guildId = interaction.guildId;

        if (await GuildSchema.exists({ _id: guildId })) {
            return await interaction.reply(basicEmbed('Already Registered!'));
        }
        
        await GuildSchema.create({ _id: guildId })
        interaction.reply(basicEmbed('Registered This Server!'));
    })
};
