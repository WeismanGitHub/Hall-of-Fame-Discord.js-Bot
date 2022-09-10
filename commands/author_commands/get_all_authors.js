const { errorEmbed, authorEmbed, basicEmbed } = require('../../helpers/embeds');
const GuildSchema = require('../../schemas/guild_schema');

module.exports = {
    category:'Authors',
    name: 'get_authors',
    description: 'Gets all authors tied to your server.',
    guildOnly: true,
    slash: true,
    
    callback: async ({ interaction }) => {
        try {
            const guildId = interaction.guildId;
    
            let authors = (await GuildSchema.findOne({ guildId: guildId }).select('-_id authors').lean()).authors;

            if (authors.length) {
                await interaction.reply(basicEmbed(`Started!\nAmount: ${authors.length}`))

                for (let author of authors) {
                    await interaction.channel.send(authorEmbed(author))
                    .catch(async err => {
                        await interaction.channel.send(errorEmbed(err, author.name))
                    })
                };
                
                await interaction.channel.send(basicEmbed('Done!'));
            } else {
                throw new Error('This server has no authors.')
            }
        } catch(err) {
            interaction.reply(errorEmbed(err))
            .catch(_ => interaction.channel.send(errorEmbed(err)))
        }
    }
};