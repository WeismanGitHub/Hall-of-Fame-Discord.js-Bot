const errorHandler = require('../../helpers/error-handler');
const GuildSchema = require('../../schemas/guild-schema');
const { basicEmbed } = require('../../helpers/embeds');
const { Constants } = require('discord.js');

module.exports = {
    category:'Tags',
    name: 'create_tag',
    description: 'Creates a tag. Tags can be used to classify quotes.',
    guildOnly: true,
    slash: true,

    options: [
        {
            name: 'tag',
            description: 'The name of the tag you want to create.',
            required: true,
            type: Constants.ApplicationCommandOptionTypes.STRING
        }
    ],

    callback: async ({ interaction }) => errorHandler(interaction, async () => {
        const { options } = interaction;
        const guildId = interaction.guildId;
        const tag = (options.getString('tag')).toLowerCase();

        await GuildSchema.updateOne(
            { _id: guildId },
            { $addToSet: { tags: tag } })

        await interaction.reply(basicEmbed(`Created '${tag}' tag!`));
    })
};