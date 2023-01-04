const { getAuthorByName, getAuthorById } = require('../../helpers/get-author');
const { getLastQuoteId, getLastImage } = require('../../helpers/get-last-item');
const sendToQuotesChannel = require('../../helpers/send-to-quotes-channel');
const MultiQuoteSchema = require('../../schemas/multi-quote-schema');
const { NotFoundError, InvalidInputError } = require('../../errors');
const errorHandler = require('../../helpers/error-handler');
const { quoteEmbed } = require('../../helpers/embeds');
const { Constants } = require('discord.js');

module.exports = {
    category:'Multi Quotes',
    name: 'edit_multi_quote',
    description: 'Multi-quotes have multiple quotes from multiple authors within them.',
    guildOnly: true,
    slash: true,

    options: [
        {
            name: 'id',
            description: 'The id of the quote.',
            type: Constants.ApplicationCommandOptionTypes.STRING
        },
        {
            name: 'last_quote',
            description: "Use the last quote sent in a channel. Will grab any type of quote.",
            type: Constants.ApplicationCommandOptionTypes.CHANNEL
        },
        {
            name: 'new_title',
            description: 'Title of the multi-quote.',
            type: Constants.ApplicationCommandOptionTypes.STRING
        },
        {
            name: 'first_author',
            description: 'The name of the first author.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'first_text',
            description: 'The first part of the multi-quote.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'second_author',
            description: 'The name of the second author.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'second_text',
            description: 'The second part of the multi-quote.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'third_author',
            description: 'The name of the third author.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'third_text',
            description: 'The third part of the multi-quote.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'fourth_author',
            description: 'The name of the fourth author.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'fourth_text',
            description: 'The fourth part of the multi-quote.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'fifth_author',
            description: 'The name of the fifth author.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'fifth_text',
            description: 'The fifth part of the multi-quote.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
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
            name: 'delete_tags',
            description: 'Removes tags from quote.',
            type: Constants.ApplicationCommandOptionTypes.BOOLEAN
        },
        {
            name: 'delete_first_fragment',
            description: 'Remove a text/author pair.',
            type: Constants.ApplicationCommandOptionTypes.BOOLEAN
        },
        {
            name: 'delete_second_fragment',
            description: 'Remove a text/author pair.',
            type: Constants.ApplicationCommandOptionTypes.BOOLEAN
        },
        {
            name: 'delete_third_fragment',
            description: 'Remove a text/author pair.',
            type: Constants.ApplicationCommandOptionTypes.BOOLEAN
        },
        {
            name: 'delete_fourth_fragment',
            description: 'Remove a text/author pair.',
            type: Constants.ApplicationCommandOptionTypes.BOOLEAN
        },
        {
            name: 'delete_fifth_fragment',
            description: 'Remove a text/author pair.',
            type: Constants.ApplicationCommandOptionTypes.BOOLEAN
        },
        {
            name: 'new_image_link',
            description: 'Image attachment link. Upload an image to Discord and copy the link to that image.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
            maxLength: 512
        },
        {
            name: 'last_image',
            description: 'Add the last image sent in a channel to the quote.',
            type: Constants.ApplicationCommandOptionTypes.CHANNEL
        },
        {
            name: 'delete_image',
            description: 'Removes image from quote.',
            type: Constants.ApplicationCommandOptionTypes.BOOLEAN
        },
    ],

    callback: async ({ interaction, client }) => errorHandler(interaction, async () => {
        const guildId = interaction.guildId;
        const { options } = interaction;

        if (!options._hoistedOptions) {
            throw new InvalidInputError('No Changes')
        }

        const tags = [
            options.getString('first_tag'),
            options.getString('second_tag'),
            options.getString('third_tag'),
        ];

        const lastQuoteChannel = options.getChannel('last_quote');
        const id = options.getString('id') ?? await getLastQuoteId(lastQuoteChannel)
        const newTitle = options.getString('new_title')
        const lastImageChannel = options.getChannel('last_image');
        const newImageLink = options.getString('new_image_link');
        const deleteImage = options.getBoolean('delete_image');

        if (!id) {
            throw new InvalidInputError('ID')
        }

        const multiQuote = await MultiQuoteSchema.findOne({
            guildId: guildId,
            _id: id,
            type: 'multi'
        })

        if (!multiQuote) {
            throw new NotFoundError('Multi-Quote')
        }

        if (tags.length) {
            multiQuote.tags = tags
        }
        
        if (options.getString('delete_tags')) {
            multiQuote.tags = [];
        }

        if (newTitle) {
            multiQuote.text = newTitle;
        }

        if (deleteImage) {
            multiQuote.attachmentURL = null
        } else if (newImageLink) {
            multiQuote.attachmentURL = newImageLink;
        } else if (lastImageChannel) {
            multiQuote.attachmentURL = await getLastImage(lastImageChannel)
        }

        const deleteFragmentOptions = [
            options.getBoolean('delete_first_fragment'),
            options.getBoolean('delete_second_fragment'),
            options.getBoolean('delete_third_fragment'),
            options.getBoolean('delete_fourth_fragment'),
            options.getBoolean('delete_fifth_fragment'),
        ]

        const newFragments = [
            { text: options.getString('first_text'), authorName: options.getString('first_author') },
            { text: options.getString('second_text'), authorName: options.getString('second_author') },
            { text: options.getString('third_text'), authorName: options.getString('third_author') },
            { text: options.getString('fourth_text'), authorName: options.getString('fourth_author') },
            { text: options.getString('fifth_text'), authorName: options.getString('fifth_author') },
        ]

        const updatedFragments = []

        for (let i = 0; i < 5; i++) {
            const oldFragment = multiQuote.toObject().fragments[i]
            const newFragment = newFragments[i]
            const updatedFragment = oldFragment

            if (!oldFragment || deleteFragmentOptions[i]) {
                continue
            }

            if (newFragment.authorName) {
                const author = await getAuthorByName(newFragment.authorName, guildId)
                updatedFragment.authorName = newFragment.authorName

                if (author.name == 'Deleted Author') {
                    throw new NotFoundError(newFragment.authorName)
                }

                updatedFragment.authorId = author._id
            } else {
                updatedFragment.authorName = (await getAuthorById(oldFragment.authorId, guildId)).name
            }
            
            if (newFragment.text) {
                updatedFragment.text = newFragment.text
            }

            updatedFragments.push(updatedFragment)
        }

        multiQuote.fragments = updatedFragments
        await multiQuote.save()

        const embeddedMultiQuote = quoteEmbed(multiQuote, updatedFragments)

        await sendToQuotesChannel(embeddedMultiQuote, guildId, client)
        await interaction.reply(embeddedMultiQuote);
    })
};