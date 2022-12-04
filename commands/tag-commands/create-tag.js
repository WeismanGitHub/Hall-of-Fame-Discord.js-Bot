const { errorEmbed, basicEmbed } = require('../../helpers/embeds');
const GuildSchema = require('../../schemas/guild-schema');
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

    callback: async ({ interaction }) => {
        try {
            const { options } = interaction;
            const guildId = interaction.guildId;
            const tag = (options.getString('tag')).toLowerCase();

            await GuildSchema.updateOne(
                { _id: guildId },
                { $addToSet: { tags: tag } })

            await interaction.reply(basicEmbed(`Created '${tag}' tag!`));
        } catch(err) {
            interaction.reply(errorEmbed(err))
            .catch(_ => interaction.channel.send(errorEmbed(err)))
        }
    }
};