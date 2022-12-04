const { errorEmbed, basicEmbed } = require('../../helpers/embeds');
const GuildSchema = require('../../schemas/guild-schema');
const QuoteSchema = require('../../schemas/quote-schema');
const { Constants } = require('discord.js');

module.exports = {
    category:'Tags',
    name: 'delete_tag',
    description: 'Delete a tag. Tags can be used to classify quotes.',
    guildOnly: true,
    slash: true,

    options: [
        {
            name: 'tag',
            description: 'The tag you want to delete.',
            required: true,
            type: Constants.ApplicationCommandOptionTypes.STRING
        }
    ],

    callback: async ({ interaction }) => {
        try {
            const { options } = interaction;
            const guildId = interaction.guildId;
            const tag = options.getString('tag');
            
            await GuildSchema.updateOne(
                { guildId: guildId },
                { $pull: { tags: tag }
            }).select('-_id tags').lean()

            await QuoteSchema.updateMany(
                { guildId: guildId, tags: { $all: [tag] }},
                { $pull: { 'tags': tag } }
            )

            await interaction.reply(basicEmbed(`Deleted '${tag}' tag!`));
        } catch(err) {
            interaction.reply(errorEmbed(err))
            .catch(_ => interaction.channel.send(errorEmbed(err)))
        }
    }
};