const { InvalidInputError, NotFoundError } = require('../../errors');
const { getLastImage } = require('../../helpers/get-last-item');
const GuildSchema = require('../../schemas/guild-schema');
const { authorEmbed } = require('../../helpers/embeds');
const { SlashCommandBuilder } = require('discord.js');
const {
    authorDescription,
    newNameDescription,
    imageLinkDescription,
    accountImageDescription,
    lastImageDescription,
    removeImageDescription,
} = require('../../descriptions');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('edit_author')
		.setDescription('Edit an author. To create a quote you need an author.')
        .setDMPermission(false)
        .addStringOption(option => option
            .setName('author')
            .setDescription(authorDescription)
            .setMaxLength(256)
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('new_name')
            .setDescription(newNameDescription)
            .setMaxLength(256)
        )
        .addStringOption(option => option
            .setName('image_link')
            .setDescription(imageLinkDescription)
            .setMaxLength(512)
        )
        .addUserOption(option => option
            .setName('account_image')
            .setDescription(accountImageDescription)
        )
        .addChannelOption(option => option
            .setName('last_image')
            .setDescription(lastImageDescription)
        )
        .addBooleanOption(option => option
            .setName('remove_image')
            .setDescription(removeImageDescription)
        )
	,
	execute: async (interaction) => {
        const { options } = interaction;

        if (options._hoistedOptions <= 1) {
            throw new InvalidInputError('No Changes')
        }

        const lastImageChannel = options.getChannel('last_image');
        const deleteImage = options.getBoolean('remove_image')
        let newIconURL = options.getString('image_link')
        const newName = options.getString('new_name')
        const user = options.getUser('account_image')
        const oldName = options.getString('author');
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