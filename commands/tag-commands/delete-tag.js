const GuildSchema = require('../../schemas/guild-schema');
const QuoteSchema = require('../../schemas/quote-schema')
const { tagDescription } = require('../../descriptions');
const { basicEmbed } = require('../../helpers/embeds');
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('delete_tag')
		.setDescription('The tag you want to delete.')
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
        const tag = options.getString('tag');
        
        await GuildSchema.updateOne(
            { _id: guildId },
            { $pull: { tags: tag }
        }).select('-_id tags').lean()

        await QuoteSchema.updateMany(
            { guildId: guildId, tags: { $all: [tag] }},
            { $pull: { 'tags': tag } }
        )

        await interaction.reply(basicEmbed(`Deleted "${tag}" tag!`));
    }
};