const { getLastImage } = require('../../helpers/get-last-item');
const errorHandler = require('../../helpers/error-handler');
const GuildSchema = require('../../schemas/guild-schema');
const { authorEmbed } = require('../../helpers/embeds');
const { InvalidInputError } = require('../../errors');
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
            maxLength: 256
        },
        {
            name: "account_image",
            description: "Use an account image. Will update with the account.",
            type: Constants.ApplicationCommandOptionTypes.USER
        },
        {
            name: 'image_link',
            description: "This will be the author's icon.",
            type: Constants.ApplicationCommandOptionTypes.STRING,
            maxLength: 512
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
        const accountImage = options.getUser('account_image')
        let iconURL = options.getString('image_link') || process.env.DEFAULT_ICON_URL

        if (lastImageChannel) {
            iconURL = await getLastImage(lastImageChannel)
        }
        
        const author = {
            name: name,
            iconURL: iconURL,
            discordId: accountImage ? interaction.user.id : null
        }

        const authorNameExists = await GuildSchema.exists({ _id: guildId, 'authors.name': name })

        if (authorNameExists) {
            throw new InvalidInputError('Author Exists')
        }

        await GuildSchema.updateOne(
            { _id: guildId },
            { $addToSet: { authors: author }
        })

        await interaction.reply(authorEmbed(author))
    })
};