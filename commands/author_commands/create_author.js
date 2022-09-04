const { errorEmbed, authorEmbed } = require('../../helpers/embeds');
const GuildSchema = require('../../schemas/guild_schema');
const checkURL = require('../../helpers/check_url')
const { Constants } = require('discord.js');

module.exports = {
    category:'Authors',
    description: 'Creates an author tied to your server.',
    name: 'createauthor',
    slash: true,

    options: [
        {
            name: 'name',
            description: 'The name of the author you want to create.',
            required: true,
            type: Constants.ApplicationCommandOptionTypes.STRING
        },
        {
            name: 'icon_url',
            description: 'This will be the image displayed with the author.',
            required: true,
            type: Constants.ApplicationCommandOptionTypes.STRING
        }
    ],

    callback: async ({ interaction }) => {
        try {
            const { options } = interaction;
            const guildId = interaction.guildId;
            const authorName = options.getString('author');
            const imgUrl = options.getString('icon_url');
            const authorObject = { name: authorName, imgUrl: imgUrl }
            
            if (!checkURL(imgUrl)) {
                throw new Error('Please input a valid url.')
            }

            await GuildSchema.updateOne(
                { guildId: guildId },
                { $addToSet: { authors: { name: authorName, imgUrl: imgUrl } }
            })

            await interaction.reply(authorEmbed(authorObject))
        } catch(err) {
            interaction.reply(errorEmbed(err))
            .catch(_ => interaction.channel.send(errorEmbed(err)))
        }
    }
};