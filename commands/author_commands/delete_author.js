const { basicEmbed, errorEmbed } = require('../../helpers/embeds');
const GuildSchema = require('../../schemas/guild_schema');
const { Constants } = require('discord.js');

module.exports = {
    category:'Authors',
    name: 'delete_author',
    description: 'Deletes an author tied to your server.',
    guildOnly: true,
    slash: true,

    options: [
        {
            name: 'author',
            description: 'The name of the author you want to delete.',
            required: true,
            type: Constants.ApplicationCommandOptionTypes.STRING
        }
    ],

    callback: async ({ interaction }) => {
        try {
            const { options } = interaction;
            const guildId = interaction.guildId;
            const author = options.getString('author');
    
            const guildDoc = await GuildSchema.findOneAndUpdate(
                { guildId: guildId },
                { $pull: { authors: { name: author } }
            }).select('-_id authors').lean()
    
            const isAnAuthor = await guildDoc.authors.some(guildAuthor => {
                return guildAuthor.name == author;
            });
    
            if (isAnAuthor) {
                await interaction.reply(basicEmbed(`Deleted '${author}' author!`));
            }

            await interaction.reply(basicEmbed(`Nothing Deleted.`));
        } catch(err) {
            interaction.reply(errorEmbed(err))
            .catch(_ => interaction.channel.send(errorEmbed(err)))
        }
    }
};