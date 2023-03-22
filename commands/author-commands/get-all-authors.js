const { errorEmbed, authorEmbed, basicEmbed } = require('../../helpers/embeds');
const GuildSchema = require('../../schemas/guild-schema');
const { SlashCommandBuilder } = require('discord.js');
const { NotFoundError } = require('../../errors');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('get_authors')
		.setDescription('Gets all authors.')
        .setDMPermission(false)
	,
	execute: async (interaction) => {
        const guildId = interaction.guildId;

        const authors = (await GuildSchema.findOne({ _id: guildId }).select('-_id authors').lean()).authors
        .sort((firstAuthor, secondAuthor) => firstAuthor.name.localeCompare(secondAuthor.name, undefined, { sensitivity: 'base' }))

        if (!authors.length) {
            throw new NotFoundError('Authors')
        }

        await interaction.reply(basicEmbed(`Started!\nAmount: ${authors.length}`))
        const authorGroups = [];

        while (authors.length > 0) {
            authorGroups.push(authors.splice(0, 10))
        }

        for (let authorGroup of authorGroups) {
            const authorEmbeds = authorGroup.map(author => authorEmbed(author).embeds).flat()

            await interaction.channel.send({ embeds: authorEmbeds })
            .catch(async _ => {
                for (let authorEmbed of authorEmbeds) {
                    await interaction.channel.send({ embeds: [authorEmbed] })
                    .catch(async err => {
                        interaction.channel.send(errorEmbed(err, authorEmbed.author.name))
                    });
                }
            })
        };
        
        await interaction.channel.send(basicEmbed('Done!'));
    }
};