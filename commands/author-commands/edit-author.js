const { getLastImage } = require('../../helpers/get-last-item');
const errorHandler = require('../../helpers/error-handler');
const GuildSchema = require('../../schemas/guild-schema');
const { authorEmbed } = require('../../helpers/embeds');
const checkURL = require('../../helpers/check-url')
const { Constants } = require('discord.js');

module.exports = {
    category:'Authors',
    name: 'edit_author',
    description: 'Edit an author. To create a quote you need an author.',
    guildOnly: true,
    slash: true,

    options: [
        {
            name: 'name',
            description: 'The name of the author you want to edit. (case sensitive)',
            required: true,
            type: Constants.ApplicationCommandOptionTypes.STRING
        },
        {
            name: 'new_name',
            description: 'The name you want to change the author to. (case sensitive)',
            type: Constants.ApplicationCommandOptionTypes.STRING
        },
        {
            name: 'image_link',
            description: 'This will be the author icon.',
            type: Constants.ApplicationCommandOptionTypes.STRING
        },
        {
            name: 'last_image',
            description: 'Use the last image sent in a channel for the author icon.',
            type: Constants.ApplicationCommandOptionTypes.CHANNEL
        },
        {
            name: 'delete_image',
            description: 'Use the default image.',
            type: Constants.ApplicationCommandOptionTypes.BOOLEAN
        }
    ],

    callback: async ({ interaction }) => errorHandler(interaction, async () => {
        const { options } = interaction;
        const lastImageChannel = options.getChannel('last_image');
        const deleteImage = options.getBoolean('delete_image')
        let newImgUrl = options.getString('image_link')
        const newName = options.getString('new_name');
        const oldName = options.getString('name');
        const guildId = interaction.guildId;

        if (!newName && !newImgUrl && !lastImageChannel && !deleteImage) {
            throw new Error('Please use at least one update parameter.')
        }

        if (newImgUrl && !checkURL(newImgUrl)) {
            throw new Error('Please input a valid url.')
        }

        if (lastImageChannel) {
            newImgUrl = await getLastImage(lastImageChannel)
        }

        if (deleteImage) {
            newImgUrl = 'https://cdn.discordapp.com/avatars/973042179033415690/a6602f6209ef6546ee8d878e0022a4f3.webp?size=160'
        }

        const authorNameExists = await GuildSchema.exists({ _id: guildId, 'authors.name': newName })

        if (authorNameExists) {
            throw new Error('Author name must be unique.')
        }

        const authors = (await GuildSchema.findOneAndUpdate(
            { "$and": [
                { "_id": { "$eq": guildId } },
                { "authors": { "$elemMatch": { "name": { "$eq": oldName } } } }
            ]},
            {
                "$set": {
                    ...newImgUrl && { "authors.$.imgUrl": newImgUrl },
                    ...newName && { "authors.$.name": newName }
                }
            },
            { new: true }
        ).select('authors -_id').lean())?.authors

        if (!authors) {
            throw new Error(`No author named '${oldName}'.`)
        }

        const author = authors.find(author => author.name == (newName ?? oldName))

        await interaction.reply(authorEmbed(author));
    })
};