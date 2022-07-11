const GuildSchema = require('../../schemas/guild-schema');
const {basicEmbed, errorEmbed, authorEmbed} = require('../../functions');
let commandAlreadyRespondedTo = false

module.exports = {
    description: 'Gets all authors tied to your server.',
    category:'Authors',
    name: 'getallauthors',
    slash: true,
    
    callback: async ({interaction}) => {
        try {
            const guildId = interaction.guildId;
    
            let authors = (await GuildSchema.findOne({guildId: guildId}).select('-_id authors')).authors;

            if (authors.length) {
                await interaction.reply(basicEmbed(`Started!\nAmount: ${authors.length}`))
                commandAlreadyRespondedTo = true

                for (let author of authors) {
                    await interaction.channel.send(authorEmbed(author))
                    .catch(async err => {
                        if (commandAlreadyRespondedTo) {
                            await interaction.channel.send(errorEmbed(err, author.name))
                        } else {
                            await interaction.reply(errorEmbed(err));
                        }
                    })
                };
                
                await interaction.channel.send(basicEmbed('Done!'));
            } else {
                await interaction.reply(basicEmbed('This server has no authors.'))
                commandAlreadyRespondedTo = true
            }

        } catch(err) {
            if (commandAlreadyRespondedTo) {
                await interaction.channel.send(errorEmbed(err))
            } else {
                await interaction.reply(errorEmbed(err));
            }
        };
    }
};