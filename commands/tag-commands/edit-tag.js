const { tagDescription, newNameDescription } = require('../../descriptions');
const GuildSchema = require('../../schemas/guild-schema');
const QuoteSchema = require('../../schemas/quote-schema');
const { basicEmbed } = require('../../helpers/embeds');
const { SlashCommandBuilder } = require('discord.js');
const { NotFoundError } = require('../../errors');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('edit_tag')
		.setDescription('Edit a tag.')
        .setDMPermission(false)
        .addStringOption(option => option
            .setName('tag')
            .setDescription(tagDescription)
            .setMaxLength(339)
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('new_name')
            .setDescription(newNameDescription)
            .setMaxLength(339)
            .setRequired(true)
        )
	,
	execute: async (interaction) => {
        const { options } = interaction;
        const guildId = interaction.guildId;
        const tag = options.getString('tag');
        const newName = options.getString('new_name');
        
        const res = await GuildSchema.updateOne(
            { _id: guildId, tags: tag },
            { $set: { 'tags.$': newName }
        })

        if (!res.modifiedCount) {
            throw new NotFoundError(tag)
        }
        
        await QuoteSchema.updateMany(
            { guildId: guildId, tags: tag },
            { $set: { 'tags.$': newName } }
        )

        await interaction.reply(basicEmbed(`Changed '${tag}' to '${newName}'!`));
    }
};