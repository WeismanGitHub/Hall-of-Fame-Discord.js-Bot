const GuildSchema = require('../../schemas/guild-schema');
const {basicEmbed, errorEmbed} = require('../../functions');
const {Constants} = require('discord.js');

module.exports = {
    category:'Tags',
    description: 'Deletes a tag tied to your server. Tags are used to categorize quotes.',
    name: 'deletetag',
    slash: true,

    options: [
        {
            name: 'tag',
            description: 'The tag you want to delete.',
            required: true,
            type: Constants.ApplicationCommandOptionTypes.STRING
        }
    ],

    callback: async ({interaction}) => {
        try {
            const {options} = interaction;
            const guildId = interaction.guildId;
            const tag = options.getString('tag');
            
            const guildDoc = await GuildSchema.findOneAndUpdate(
                {guildId: guildId},
                {$pull: {tags: tag}
            })

            if (guildDoc.tags.includes(tag)) {
                await interaction.reply(basicEmbed(`Deleted '${tag}' tag!`));
                return;
            }

            await interaction.reply(basicEmbed(`Nothing Deleted.`));

        } catch(err) {
            await interaction.reply(errorEmbed(err));
        };
    }
};