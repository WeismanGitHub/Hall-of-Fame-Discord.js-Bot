const sendToQuotesChannel = require('../../helpers/send-to-quotes-channel')
const { getAuthorByName } = require('../../helpers/get-author');
const { getLastImage } = require('../../helpers/get-last-item');
const errorHandler = require('../../helpers/error-handler');
const { checkTags } = require('../../helpers/check-tags');
const QuoteSchema = require('../../schemas/quote-schema');
const { quoteEmbed } = require('../../helpers/embeds');
const checkURL = require('../../helpers/check-url')
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
        },
        {
            name: 'text',
            description: 'What was said by the person.',
            type: Constants.ApplicationCommandOptionTypes.STRING
        },
        {
            name: 'image_link',
            description: 'Image attachment link. Upload an image to Discord and copy the link to that image.',
            type: Constants.ApplicationCommandOptionTypes.STRING
        },
        {
            name: 'first_tag',
            description: 'Tags are used for filtering.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'second_tag',
            description: 'Tags are used for filtering.',
            type: Constants.ApplicationCommandOptionTypes.STRING
        },
        {
            name: 'third_tag',
            description: 'Tags are used for filtering.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'last_image',
            description: 'Add the last image sent in a channel to the quote.',
            type: Constants.ApplicationCommandOptionTypes.CHANNEL
        }
    ],

    callback: async ({ interaction, client }) => errorHandler(interaction, async () => {
        const guildId = interaction.guildId;
        const { options } = interaction;

        const author = await getAuthorByName(options.getString('author'), guildId);

        if (author.name == 'Deleted Author') {
            throw new Error(`Make sure that '${options.getString('author')}' author exists.`)
        }

        const lastImageChannel = options.getChannel('last_image');
        let attachmentURL = options.getString('image_link');
        const text = options.getString('text');

        if (!text && !attachmentURL && !lastImageChannel) {
            throw new Error('Please provide text and or an image link.')
        }

        let tags = [
            options.getString('first_tag'),
            options.getString('second_tag'),
            options.getString('third_tag'),
        ];

        tags = await checkTags(tags, guildId);
        
        if (attachmentURL && !checkURL(attachmentURL)) {
            throw new Error('Please input a valid url.')
        } else if (lastImageChannel) {
            attachmentURL = await getLastImage(lastImageChannel)
        }

        const quote = await QuoteSchema.create({
            guildId: guildId,
            type: 'regular quote',
            authorId: author._id,
            tags: tags,
            text: text,
            attachmentURL: attachmentURL
        });

        const embeddedQuote = quoteEmbed(quote, author)

        await sendToQuotesChannel(embeddedQuote, guildId, client)
        await interaction.reply(embeddedQuote);
    })
};