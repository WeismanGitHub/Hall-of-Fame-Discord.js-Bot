const { errorEmbed, basicEmbed } = require('../../helpers/embeds');
const GuildSchema = require('../../schemas/guild_schema');
const { Constants } = require('discord.js');

module.exports = {
    category:'Tags',
    description: 'Creates a tag tied to your server.',
    name: 'createtag',
    slash: true,

    options: [
        {
            name: 'tag',
            description: 'The name of the tag you want to create.',
            required: true,
            type: Constants.ApplicationCommandOptionTypes.STRING
        }
    ],

    callback: async ({ interaction }) => {
        try {
            const { options } = interaction;
            const guildId = interaction.guildId;
            const tag = (options.getString('tag')).toLowerCase();

            await GuildSchema.updateOne(
                { guildId: guildId },
                { $addToSet: { tags: tag } })

            await interaction.reply(basicEmbed(`Created '${tag}' tag!`));
            
        } catch(err) {
            await interaction.reply(errorEmbed(err))
        };
    }
};