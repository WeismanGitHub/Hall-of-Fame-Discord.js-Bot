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
            type: Constants.ApplicationCommandOptionTypes.STRING,
            maxLength: 256
        }
    ],

    callback: async ({ interaction }) => errorHandler(interaction, async () => {
        const { options } = interaction;
        const guildId = interaction.guildId;
        const authorName = options.getString('author');

        const result = await GuildSchema.updateOne(
            { _id: guildId },
            { $pull: { authors: { name: authorName } } },
        )
        
        if (!result.modifiedCount) {
            throw new Error('Author could not be found.')
        }

        interaction.reply(basicEmbed(`Deleted '${authorName}' author!`));
    })
};