const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { getLastImage } = require('../../helpers/get-last-item');
const GuildSchema = require('../../schemas/guild-schema');
const { authorEmbed } = require('../../helpers/embeds');
const { InvalidInputError } = require('../../errors');
const {
    nameDescription,
    accountImageDescription,
    imageLinkDescription,
    lastImageDescription,
    authorDescription
} = require('../../descriptions');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('create_author')
		.setDescription(authorDescription)
        .setDMPermission(false)
        .addStringOption(option => option
            .setName('name')
            .setDescription(nameDescription)
            .setMaxLength(256)
            .setRequired(true)
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
            .addChannelTypes(ChannelType.GuildText)
        )
	,
	execute: async (interaction) => {
        const { options } = interaction;
        const guildId = interaction.guildId;
        const name = options.getString('name');
        const lastImageChannel = options.getChannel('last_image');
        const account = options.getUser('account_image')
        let iconURL = options.getString('image_link')

        if (lastImageChannel) {
            iconURL = await getLastImage(lastImageChannel)
        } else if (account) {
            iconURL = await account.avatarURL()
        }

        const author = {
            name: name,
            iconURL: iconURL
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
    }
};