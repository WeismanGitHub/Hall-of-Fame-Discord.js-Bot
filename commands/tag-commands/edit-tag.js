const { errorEmbed, basicEmbed } = require('../../helpers/embeds');
const GuildSchema = require('../../schemas/guild-schema');
const QuoteSchema = require('../../schemas/quote-schema');
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
            type: Constants.ApplicationCommandOptionTypes.STRING
        },
        {
            name: 'new_name',
            description: 'What you want to rename the tag to.',
            required: true,
            type: Constants.ApplicationCommandOptionTypes.STRING
        }
    ],

    callback: async ({ interaction }) => {
        try {
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
        } catch(err) {
            interaction.reply(errorEmbed(err))
            .catch(_ => interaction.channel.send(errorEmbed(err)))
        }
    }
};