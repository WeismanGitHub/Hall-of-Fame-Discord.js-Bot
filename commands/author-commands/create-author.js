const { getLastImage } = require('../../helpers/get-last-item');
const errorHandler = require('../../helpers/error-handler');
const GuildSchema = require('../../schemas/guild-schema');
const { authorEmbed } = require('../../helpers/embeds');
const checkURL = require('../../helpers/check-url')
const { Constants } = require('discord.js');

module.exports = {
    category:'Authors',
    name: 'create_author',
    description: 'Create an author. To create a quote you need an author.',
    guildOnly: true,
    slash: true,

    options: [
        {
            name: 'name',
            description: 'The name of the author you want to create.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
            required: true,
        },
        {
            name: 'icon_url',
            description: "This will be the author's icon.",
            type: Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'last_image',
            description: 'Use the last image sent in a channel for the author icon.',
            type: Constants.ApplicationCommandOptionTypes.CHANNEL
        },
    ],

    callback: async ({ interaction }) => errorHandler(interaction, async () => {
        const { options } = interaction;
        const guildId = interaction.guildId;
        const name = options.getString('name');
        const lastImageChannel = options.getChannel('last_image');
        let iconURL = options.getString('icon_url')
        
        if (!lastImageChannel && !iconURL) {
            iconURL = 'https://cdn.discordapp.com/avatars/973042179033415690/a6602f6209ef6546ee8d878e0022a4f3.webp?size=160'
        }

        if (lastImageChannel) {
            iconURL = await getLastImage(lastImageChannel)
        }

        if (!checkURL(iconURL)) {
            throw new Error('Please input a valid url.')
        }
        
        const author = { name: name, iconURL: iconURL }

        const authorNameExists = await GuildSchema.exists({ _id: guildId, 'authors.name': name })

        if (authorNameExists) {
            throw new Error('Author name must be unique.')
        }

        await GuildSchema.updateOne(
            { _id: guildId },
            { $addToSet: { authors: author }
        })

        await interaction.reply(authorEmbed(author))
    })
};