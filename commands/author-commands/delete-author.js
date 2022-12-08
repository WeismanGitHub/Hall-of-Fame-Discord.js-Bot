const errorHandler = require('../../helpers/error-handler');
const GuildSchema = require('../../schemas/guild-schema');
const { basicEmbed } = require('../../helpers/embeds');
const { Constants } = require('discord.js');

module.exports = {
    category:'Authors',
    name: 'delete_author',
    description: 'Delete an author. To create a quote you need an author.',
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

    callback: async ({ interaction }) => errorHandler(interaction, async () => {
        const { options } = interaction;
        const guildId = interaction.guildId;
        const authorName = options.getString('author');

        const guildDoc = await GuildSchema.findOneAndUpdate(
            { _id: guildId },
            { $pull: { authors: { name: authorName } } },
        ).select('-_id authors').lean()
        
        const authorExists = guildDoc.authors.some(author => {
            return author.name == authorName;
        });

        if (!authorExists) {
            throw new Error(`No author named '${authorName}'.`)
        }
        
        interaction.reply(basicEmbed(`Deleted '${authorName}' author!`));
    })
};