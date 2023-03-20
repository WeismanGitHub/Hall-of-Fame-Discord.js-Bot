const errorHandler = require('../../helpers/error-handler');
const GuildSchema = require('../../schemas/guild-schema');
const QuoteSchema = require('../../schemas/quote-schema');
const { basicEmbed } = require('../../helpers/embeds');

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
            maxLength: 339,
     //       type: Constants.ApplicationCommandOptionTypes.STRING
        }
    ],

    callback: async ({ interaction }) => errorHandler(interaction, async () => {
        const { options } = interaction;
        const guildId = interaction.guildId;
        const tag = options.getString('tag');
        
        await GuildSchema.updateOne(
            { _id: guildId },
            { $pull: { tags: tag }
        }).select('-_id tags').lean()

        await QuoteSchema.updateMany(
            { guildId: guildId, tags: { $all: [tag] }},
            { $pull: { 'tags': tag } }
        )

        await interaction.reply(basicEmbed(`Deleted '${tag}' tag!`));
    })
};