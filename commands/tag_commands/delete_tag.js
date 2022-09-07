const { errorEmbed, basicEmbed } = require('../../helpers/embeds');
const GuildSchema = require('../../schemas/guild_schema');
const { Constants } = require('discord.js');

module.exports = {
    category:'Tags',
    description: 'Deletes a tag tied to your server.',
    name: 'delete_tag',
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
            
            const guildDoc = await GuildSchema.findOneAndUpdate(
                { guildId: guildId },
                { $pull: { tags: tag }
            }).select('-_id tags').lean()

            if (guildDoc.tags.includes(tag)) {
                await interaction.reply(basicEmbed(`Deleted '${tag}' tag!`));
                return;
            }

            await interaction.reply(basicEmbed(`Nothing Deleted.`));
        } catch(err) {
            interaction.reply(errorEmbed(err))
            .catch(_ => interaction.channel.send(errorEmbed(err)))
        }
    }
};