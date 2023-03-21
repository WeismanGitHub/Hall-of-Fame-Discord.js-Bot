const { SlashCommandBuilder } = require('discord.js')
const { helpEmbed } = require('../../helpers/embeds')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription("Find out more about this bot and it's commands.")
	,
	execute: async (interaction) => interaction.reply(helpEmbed())
};
