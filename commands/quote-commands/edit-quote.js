const { getLastImage, getLastQuoteId } = require('../../helpers/get-last-item');
const { getAuthorByName, getAuthorById } = require('../../helpers/get-author');
const sendToQuotesChannel = require('../../helpers/send-to-quotes-channel')
const { InvalidInputError, NotFoundError } = require('../../errors');
const errorHandler = require('../../helpers/error-handler');
const QuoteSchema= require('../../schemas/quote-schema');
const { quoteEmbed } = require('../../helpers/embeds');

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
     //       type: Constants.ApplicationCommandOptionTypes.STRING,
            minLength: 24,
            maxLength: 24,
        },
        {
            name: 'new_author',
            description: 'Name of the new author. You must create an author beforehand.',
      //      type: Constants.ApplicationCommandOptionTypes.STRING,
            maxLength: 256
        },
        {
            name: 'new_text',
            description: 'New quote text.',
     //       type: Constants.ApplicationCommandOptionTypes.STRING,
            maxLength: 4096
        },
        {
            name: 'new_image_link',
            description: 'Image attachment link. Upload an image to Discord and copy the link to that image.',
      //      type: Constants.ApplicationCommandOptionTypes.STRING,
            maxLength: 512
        },
        {
            name: 'remove_tags',
            description: 'Removes tags from quote.',
    //        type: Constants.ApplicationCommandOptionTypes.BOOLEAN
        },
        {
            name: 'remove_image',
            description: 'Removes image from quote.',
    //        type: Constants.ApplicationCommandOptionTypes.BOOLEAN
        },
        {
            name: 'first_tag',
            description: 'Tags are used for filtering. You must create a tag beforehand. New tags will overwrite the old ones.',
      //      type: Constants.ApplicationCommandOptionTypes.STRING,
            maxLength: 339
        },
        {
            name: 'second_tag',
            description: 'Tags are used for filtering. You must create a tag beforehand. New tags will overwrite the old ones.',
   //         type: Constants.ApplicationCommandOptionTypes.STRING,
            maxLength: 339
        },
        {
            name: 'third_tag',
            description: 'Tags are used for filtering. You must create a tag beforehand. New tags will overwrite the old ones.',
    //        type: Constants.ApplicationCommandOptionTypes.STRING,
            maxLength: 339
        },
        {
            name: 'last_image',
            description: 'Add the last image sent in a channel to the quote.',
 //           type: Constants.ApplicationCommandOptionTypes.CHANNEL
        },
        {
            name: 'last_quote',
            description: "Use the last quote sent in a channel. Will grab any type of quote.",
   //         type: Constants.ApplicationCommandOptionTypes.CHANNEL
        },
    ],

    callback: async ({ interaction, client }) => errorHandler(interaction, async () => {
        const { options } = interaction;
        const guildId  = interaction.guildId;
        const lastQuoteChannel = options.getChannel('last_quote');
        const id = options.getString('id') ?? await getLastQuoteId(lastQuoteChannel)
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
    })
};