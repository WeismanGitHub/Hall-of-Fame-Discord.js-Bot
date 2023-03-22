const GuildSchema = require('../../schemas/guild-schema');
const { tagDescription } = require('../../descriptions');
const { basicEmbed } = require('../../helpers/embeds');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('create_tag')
		.setDescription('Creates a tag. Tags can be used to classify quotes.')
        .setDMPermission(false)
        .addStringOption(option => option
            .setName('tag')
            .setDescription(tagDescription)
            .setMaxLength(339)
            .setRequired(true)
        )
	,
	execute: async (interaction) => {
        const { options } = interaction;
        const guildId = interaction.guildId;
        const tag = (options.getString('tag'))?.toLowerCase();

        await GuildSchema.updateOne(
            { _id: guildId },
            { $addToSet: { tags: tag } })

        await interaction.reply(basicEmbed(`Created '${tag}' tag!`));
    }
};