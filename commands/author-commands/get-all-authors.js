const { errorEmbed, authorEmbed, basicEmbed } = require('../../helpers/embeds');
const errorHandler = require('../../helpers/error-handler');
const GuildSchema = require('../../schemas/guild-schema');
const { NotFoundError } = require('../../errors');

module.exports = {
    category:'Authors',
    name: 'get_authors',
    description: 'Gets all authors.',
    guildOnly: true,
    slash: true,

    callback: async ({ interaction }) => errorHandler(interaction, async () => {
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
    })
};