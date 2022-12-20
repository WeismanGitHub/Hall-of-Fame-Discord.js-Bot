const errorHandler = require('../../helpers/error-handler');
const GuildSchema = require('../../schemas/guild-schema');
const QuoteSchema = require('../../schemas/quote-schema');
const { basicEmbed } = require('../../helpers/embeds');
const { Constants } = require('discord.js');

module.exports = {
    category:'Tags',
    name: 'edit_tag',
    description: 'Edit a tag.',
    guildOnly: true,
    slash: true,

    options: [
        {
            name: 'tag',
            description: 'The tag you want to edit.',
            required: true,
            maxLength: 339,
            type: Constants.ApplicationCommandOptionTypes.STRING
        },
        {
            name: 'new_name',
            description: 'What you want to rename the tag to.',
            required: true,
            maxLength: 339,
            type: Constants.ApplicationCommandOptionTypes.STRING
        }
    ],

    callback: async ({ interaction }) => errorHandler(interaction, async () => {
        const { options } = interaction;
        const guildId = interaction.guildId;
        const tag = options.getString('tag');
        const newName = options.getString('new_name');
        
        const res = await GuildSchema.updateOne(
            { _id: guildId, tags: tag },
            { $set: { 'tags.$': newName }
        })

        if (!res.modifiedCount) {
            throw new Error('No tag with that name.')
        }
        
        await QuoteSchema.updateMany(
            { guildId: guildId, tags: tag },
            { $set: { 'tags.$': newName } }
        )

        await interaction.reply(basicEmbed(`Changed '${tag}' to ${newName}!`));
    })
};