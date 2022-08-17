const GuildSchema = require('../../schemas/guild-schema');
const { basicEmbed, errorEmbed, authorEmbed } = require('../../functions');

module.exports = {
    description: 'Gets all authors tied to your server.',
    category:'Authors',
    name: 'getallauthors',
    slash: true,
    
    callback: async ({ interaction }) => {
        try {
            const guildId = interaction.guildId;
    
            let authors = (await GuildSchema.findOne({ guildId: guildId }).select('-_id authors')).authors;

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
            await interaction.reply(errorEmbed(err));
        };
    }
};