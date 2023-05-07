const { getAuthorByName, getAuthorById } = require('../../../helpers/get-author');
const sendToQuotesChannel = require('../../../helpers/send-to-quotes-channel')
const { InvalidInputError, NotFoundError } = require('../../../errors');
const { getLastImage } = require('../../../helpers/get-last-item');
const { SlashCommandBuilder, ChannelType } = require('discord.js');
const QuoteSchema= require('../../../schemas/quote-schema');
const { quoteEmbed } = require('../../../helpers/embeds');
const client = require('../../../index')
const {
    authorDescription,
    tagDescription,
    lastImageDescription,
    imageLinkDescription,
    textDescription,
    idDescription,
    lastQuoteDescription,
    removeTagsDescription,
    removeImageDescription,
} = require('../../../descriptions');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('edit_quote')
		.setDescription('Edit a quote. Quotes must have an author and can have up to three tags.')
        .setDMPermission(false)
        .addStringOption(option => option
            .setName('id')
            .setDescription(idDescription)
            .setMaxLength(24)
            .setMinLength(24)
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('new_author')
            .setDescription(authorDescription)
            .setMaxLength(256)
        )
        .addStringOption(option => option
            .setName('new_text')
            .setDescription(textDescription)
            .setMaxLength(4096)
        )
        .addBooleanOption(option => option
            .setName('remove_image')
            .setDescription(removeImageDescription)
        )
        .addStringOption(option => option
            .setName('new_image_link')
            .setDescription(imageLinkDescription)
            .setMaxLength(512)
        )
        .addChannelOption(option => option
            .setName('last_image')
            .setDescription(lastImageDescription)
            .addChannelTypes(ChannelType.GuildText)
        )
        .addBooleanOption(option => option
            .setName('remove_tags')
            .setDescription(removeTagsDescription)
        )
        .addStringOption(option => option
            .setName('first_tag')
            .setDescription(tagDescription)
            .setMaxLength(339)
        )
        .addStringOption(option => option
            .setName('second_tag')
            .setDescription(tagDescription)
            .setMaxLength(339)
        )
        .addStringOption(option => option
            .setName('third_tag')
            .setDescription(tagDescription)
            .setMaxLength(339)
        )
	,
	execute: async (interaction) => {
        const { options } = interaction;
        const guildId  = interaction.guildId;
        const id = options.getString('id')
        const tags = [
            options.getString('first_tag'),
            options.getString('second_tag'),
            options.getString('third_tag'),
        ];
        
        if (!id) {
            throw new InvalidInputError('ID')
        }

        const update = {};

        const lastImageChannel = options.getChannel('last_image');
        const newImageLink = options.getString('new_image_link');
        const deleteImage = options.getBoolean('remove_image');
        const deleteTags = options.getBoolean('remove_tags');
        const newAuthorName = options.getString('new_author');
        const newText = options.getString('new_text');

        if (tags.some(tag => tag !== null)) {
            update.tags = tags
        }

        if (newImageLink) {
            update.attachmentURL = newImageLink;
        } else if (lastImageChannel) {
            update.attachmentURL = await getLastImage(lastImageChannel)
        }

        if (deleteTags) {
            update['tags'] = [];
        }

        if (newText) {
            update['text'] = newText;
        }
        
        if (newAuthorName) {
            const author = await getAuthorByName(newAuthorName, guildId);

            if (author.name == 'Deleted Author') {
                throw new NotFoundError(newAuthorName)
            }

            update['authorId'] = author._id;
        }
        
        if (deleteImage) {
            update.attachmentURL = null
        }

        if (!Object.keys(update).length) {
            throw new InvalidInputError('No Changes')
        }

        const quote = await QuoteSchema.findOneAndUpdate(
            { _id: id, guildId: guildId, type: 'regular' },
            update
        ).lean()

        if (!quote) {
            throw new NotFoundError('Quote')
        }

        const author = await getAuthorById(quote.authorId, guildId);

        const embeddedQuote = quoteEmbed(quote, author)

        await sendToQuotesChannel(embeddedQuote, guildId, client)
        await interaction.reply(embeddedQuote);
    }
};