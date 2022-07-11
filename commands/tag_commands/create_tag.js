const {basicEmbed, errorEmbed} = require('../../functions');
const GuildSchema = require('../../schemas/guild-schema');
const {Constants} = require('discord.js');

module.exports = {
    category:'Tags',
    description: 'Creates a tag tied to your server. Tags are used to categorize quotes.',
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

    callback: async ({interaction}) => {
        try {
            const {options} = interaction;
            const guildId = interaction.guildId;
            const tag = options.getString('tag');

            await GuildSchema.updateOne(
                {guildId: guildId},
                {$addToSet: {tags: tag}})

            await interaction.reply(basicEmbed(`Created '${tag}' tag!`));
            
        } catch(err) {
            await interaction.reply(errorEmbed(err))
        };
    }
};