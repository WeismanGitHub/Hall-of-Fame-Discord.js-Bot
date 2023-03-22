const GuildSchema = require('../../schemas/guild-schema');
const { basicEmbed } = require('../../helpers/embeds');
const { SlashCommandBuilder } = require('discord.js');
const { NotFoundError } = require('../../errors');
require('dotenv').config();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('get_tags')
		.setDescription('Gets all tags. Tags can be used to classify quotes.')
        .setDMPermission(false)
	,
	execute: async (interaction) => {
        const guildId = interaction.guildId;
        let message = '';
    
        const tags= (await GuildSchema.find({ _id: guildId }).select('tags').lean())[0].tags
        .sort((firstTag, secondTag) => firstTag.localeCompare(secondTag, undefined, { sensitivity: 'base' }))

        tags.forEach(tag => {
            message += `${tag}\n`;
        });
        
        if (!tags.length) {
            throw new NotFoundError('Tags')
        }

        await interaction.reply(basicEmbed('Server Tags:', message))
    }
};