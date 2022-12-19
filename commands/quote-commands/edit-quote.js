const { getAuthorByName, getAuthorById } = require('../../helpers/get-author');
const { getLastImage, getLastQuote } = require('../../helpers/get-last-item');
const sendToQuotesChannel = require('../../helpers/send-to-quotes-channel')
const { quoteEmbed, basicEmbed } = require('../../helpers/embeds');
const errorHandler = require('../../helpers/error-handler');
const { checkTags } = require('../../helpers/check-tags');
const QuoteSchema= require('../../schemas/quote-schema');
const checkURL = require('../../helpers/check-url')
const { Constants } = require('discord.js');

module.exports = {
    category:'Quotes',
    name: 'edit_quote',
    description: 'Edit a quote. Quotes must have an author and can have up to three tags.',
    guildOnly: true,
    slash: true,

    options: [
        {
            name: 'id',
            description: 'The id of the quote.',
            type: Constants.ApplicationCommandOptionTypes.STRING
        },
        {
            name: 'new_author',
            description: 'Name of the new author. You must create an author beforehand.',
            type: Constants.ApplicationCommandOptionTypes.STRING
        },
        {
            name: 'new_text',
            description: 'New quote text.',
            type: Constants.ApplicationCommandOptionTypes.STRING
        },
        {
            name: 'new_image_link',
            description: 'Image attachment link. Upload an image to Discord and copy the link to that image.',
            type: Constants.ApplicationCommandOptionTypes.STRING
        },
        {
            name: 'delete_tags',
            description: 'Removes tags from quote.',
            type: Constants.ApplicationCommandOptionTypes.BOOLEAN
        },
        {
            name: 'delete_image',
            description: 'Removes image from quote.',
            type: Constants.ApplicationCommandOptionTypes.BOOLEAN
        },
        {
            name: 'first_tag',
            description: 'Tags are used for filtering. You must create a tag beforehand. New tags will overwrite the old ones.',
            type: Constants.ApplicationCommandOptionTypes.STRING
        },
        {
            name: 'second_tag',
            description: 'Tags are used for filtering. You must create a tag beforehand. New tags will overwrite the old ones.',
            type: Constants.ApplicationCommandOptionTypes.STRING
        },
        {
            name: 'third_tag',
            description: 'Tags are used for filtering. You must create a tag beforehand. New tags will overwrite the old ones.',
            type: Constants.ApplicationCommandOptionTypes.STRING
        },
        {
            name: 'last_image',
            description: 'Add the last image sent in a channel to the quote.',
            type: Constants.ApplicationCommandOptionTypes.CHANNEL
        },
        {
            name: 'last_quote',
            description: 'Use the last quote sent in a channel.',
            type: Constants.ApplicationCommandOptionTypes.CHANNEL
        },
    ],

    callback: async ({ interaction, client }) => errorHandler(interaction, async () => {
        const { options } = interaction;
        const guildId  = interaction.guildId;
        const lastQuoteChannel = options.getChannel('last_quote');
        const id = options.getString('id') ?? await getLastQuote(lastQuoteChannel)

        if (!id) {
            throw new Error('Please provide a quote id or choose a channel to get the quote id from.')
        }

        const quote = await QuoteSchema.findOne({
            guildId: guildId,
            _id: id,
            type: 'regular'
        }).select('_id').lean()

        if (!quote) {
            throw new Error('Regular Quote does not exist. Use `/edit_audio_quote` or `/edit_multi_quote` for audio and multi quotes.')
        }

        const update = {};

        const lastImageChannel = options.getChannel('last_image');
        const newImageLink = options.getString('new_image_link');
        const deleteImage = options.getBoolean('delete_image');
        const deleteTags = options.getBoolean('delete_tags');
        const newAuthorName = options.getString('new_author');
        const newText = options.getString('new_text');

        let tags = [
            options.getString('first_tag'),
            options.getString('second_tag'),
            options.getString('third_tag'),
        ];

        tags = await checkTags(tags, guildId);
        
        if (tags.length) {
            update.tags = tags
        }

        if (newImageLink) {
            if (!checkURL(newImageLink)) {
                throw new Error('Please input a valid url.')
            }

            update.attachment = newImageLink;
        } else if (lastImageChannel) {
            update.attachment = await getLastImage(lastImageChannel)
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
                throw new Error('Author does not exist.')
            }

            update['authorId'] = author._id;
        }
        
        if (deleteImage) {
            update.attachmentURL = null
        }

        if (!Object.keys(update).length) {
            throw new Error('No updates.')
        }

        const updatedQuote = await QuoteSchema.findOneAndUpdate(
            { _id: id, guildId: guildId },
            update
        ).lean()

        const author = await getAuthorById(updatedQuote.authorId, guildId);

        const embeddedQuote = quoteEmbed(updatedQuote, author)

        await sendToQuotesChannel(embeddedQuote, guildId, client)
        await interaction.reply(embeddedQuote);
    })
};