const { InvalidInputError, NotFoundError } = require('../../errors');
const { getLastImage } = require('../../helpers/get-last-item');
const GuildSchema = require('../../schemas/guild-schema');
const { authorEmbed } = require('../../helpers/embeds');

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
  //          type: Constants.ApplicationCommandOptionTypes.STRING,
            maxLength: 256
        },
        {
            name: 'new_name',
            description: 'The name you want to change the author to. (case sensitive)',
   //         type: Constants.ApplicationCommandOptionTypes.STRING,
            maxLength: 256
        },
        {
            name: 'image_link',
            description: 'This will be the author icon.',
  //          type: Constants.ApplicationCommandOptionTypes.STRING,
            maxLength: 512
        },
        {
            name: 'last_image',
            description: 'Use the last image sent in a channel for the author icon.',
   //         type: Constants.ApplicationCommandOptionTypes.CHANNEL
        },
        {
            name: "account_image",
            description: "Use an account image.",
   //         type: Constants.ApplicationCommandOptionTypes.USER
        },
        {
            name: 'remove_image',
            description: 'Use the default image.',
  //          type: Constants.ApplicationCommandOptionTypes.BOOLEAN
        },
    ],

    callback: async (interaction) => {
        const { options } = interaction;

        if (options._hoistedOptions <= 1) {
            throw new InvalidInputError('No Changes')
        }

        const lastImageChannel = options.getChannel('last_image');
        const deleteImage = options.getBoolean('remove_image')
        let newIconURL = options.getString('image_link')
        const newName = options.getString('new_name')
        const user = options.getUser('account_image')
        const oldName = options.getString('name');
        const guildId = interaction.guildId;

        if (deleteImage) {
            newIconURL = null
        } else if (lastImageChannel) {
            newIconURL = await getLastImage(lastImageChannel)
        } else if (user) {
            newIconURL = await user.avatarURL()
        }
        
        if (newName) {
            const authorNameExists = await GuildSchema.exists({ _id: guildId, 'authors.name': newName })
    
            if (authorNameExists) {
                throw new InvalidInputError('Author Exists')
            }
        }

        const authors = (await GuildSchema.findOneAndUpdate(
            { "$and": [
                { "_id": { "$eq": guildId } },
                { "authors": { "$elemMatch": { "name": { "$eq": oldName } } } }
            ]},
            {
                "$set": {
                    ...newIconURL && { "authors.$.iconURL": newIconURL },
                    ...newName && { "authors.$.name": newName }
                }
            },
            { new: true }
        ).select('authors -_id').lean())?.authors

        if (!authors) {
            throw new NotFoundError(oldName)
        }

        const author = authors.find(author => author.name == (newName ?? oldName))

        await interaction.reply(authorEmbed(author));
    }
};