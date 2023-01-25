const sendToQuotesChannel = require('../../helpers/send-to-quotes-channel')
const { NotFoundError, InvalidInputError } = require('../../errors') ;
const { getAuthorByName } = require('../../helpers/get-author');
const { getLastImage } = require('../../helpers/get-last-item');
const errorHandler = require('../../helpers/error-handler');
const QuoteSchema = require('../../schemas/quote-schema');
const { quoteEmbed } = require('../../helpers/embeds');
const { Constants } = require('discord.js');

module.exports = {
    category:'Quotes',
    name: 'create_quote',
    description: 'Create a quote. Quotes must have an author and can have up to three tags.',
    guildOnly: true,
    slash: true,

    options: [
        {
            name: 'author',
            description: 'The name of who said the quote. You must first register an author with /createauthor.',
            required: true,
            type: Constants.ApplicationCommandOptionTypes.STRING,
            maxLength: 256
        },
        {
            name: 'text',
            description: 'What was said by the person.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
            maxLength: 4096
        },
        {
            name: 'image_link',
            description: 'Image attachment link. Upload an image to Discord and copy the link to that image.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
            maxLength: 512
        },
        {
            name: 'first_tag',
            description: 'Tags are used for filtering.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
            maxLength: 339
        },
        {
            name: 'second_tag',
            description: 'Tags are used for filtering.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
            maxLength: 339
        },
        {
            name: 'third_tag',
            description: 'Tags are used for filtering.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
            maxLength: 339
        },
        {
            name: 'last_image',
            description: 'Use the last image sent in a channel to the quote.',
            type: Constants.ApplicationCommandOptionTypes.CHANNEL
        }
    ],

    callback: async ({ interaction, client }) => errorHandler(interaction, async () => {
        const guildId = interaction.guildId;
        const { options } = interaction;
        const inputtedAuthor = options.getString('author')
        const tags = [
            options.getString('first_tag'),
            options.getString('second_tag'),
            options.getString('third_tag'),
        ];

        const author = await getAuthorByName(inputtedAuthor, guildId);
        
        if (author.name == 'Deleted Author') {
            throw new NotFoundError(inputtedAuthor)
        }

        const lastImageChannel = options.getChannel('last_image');
        let attachmentURL = options.getString('image_link');
        const text = options.getString('text');
        
        if (!attachmentURL && lastImageChannel) {
            attachmentURL = await getLastImage(lastImageChannel)
        }

        const quote = await QuoteSchema.create({
            guildId: guildId,
            authorId: author._id,
            tags: tags,
            text: text,
            attachmentURL: attachmentURL
        });

        const embeddedQuote = await quoteEmbed(quote, author)

        await sendToQuotesChannel(embeddedQuote, guildId, client)
        await interaction.reply(embeddedQuote);
    })
};