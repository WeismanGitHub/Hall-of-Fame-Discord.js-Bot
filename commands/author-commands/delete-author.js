const GuildSchema = require('../../schemas/guild-schema');
const { nameDescription } = require('../../descriptions');
const { basicEmbed } = require('../../helpers/embeds');
const { SlashCommandBuilder } = require('discord.js');
const { NotFoundError } = require('../../errors');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('delete_author')
		.setDescription('Delete an author. To create a quote you need an author.')
        .setDMPermission(false)
        .addStringOption(option => option
            .setName('name')
            .setDescription(nameDescription)
            .setMaxLength(256)
            .setRequired(true)
        )
	,
	execute: async (interaction) => {
        const { options } = interaction;
        const guildId = interaction.guildId;
        const authorName = options.getString('name');

        const result = await GuildSchema.updateOne(
            { _id: guildId },
            { $pull: { authors: { name: authorName } } },
        )
        
        if (!result.modifiedCount) {
            throw new NotFoundError(authorName)
        }

        interaction.reply(basicEmbed(`Deleted '${authorName}' author!`));
    }
};