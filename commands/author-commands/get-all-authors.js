const { errorEmbed, authorEmbed, basicEmbed } = require('../../helpers/embeds');
const GuildSchema = require('../../schemas/guild-schema');

module.exports = {
    category:'Authors',
    name: 'get_authors',
    description: 'Gets all authors.',
    guildOnly: true,
    slash: true,
    
    callback: async ({ interaction }) => {
        try {
            const guildId = interaction.guildId;
    
            let authors = (await GuildSchema.findOne({ guildId: guildId }).select('-_id authors').lean()).authors;

            if (!authors.length) {
                throw new Error('This server has no authors.')
            }

            await interaction.reply(basicEmbed(`Started!\nAmount: ${authors.length}`))
            const authorGroups = [];

            while (authors.length > 0) {
                authorGroups.push(authors.splice(0, 10))
            }

            for (let authorGroup of authorGroups) {
                const authorEmbeds = []

                for (let author of authorGroup) {
                    authorEmbeds.push(...authorEmbed(author).embeds)
                }

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
        } catch(err) {
            interaction.reply(errorEmbed(err))
            .catch(_ => interaction.channel.send(errorEmbed(err)))
        }
    }
};