const sendToQuotesChannel = require('../../helpers/send-to-quotes-channel');
const MultiQuoteSchema = require('../../schemas/audio-quote-schema');
const { getLastQuoteId } = require('../../helpers/get-last-item')
const { getAuthorByName } = require('../../helpers/get-author');
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
    ],

    callback: async ({ interaction, client }) => errorHandler(interaction, async () => {
        const guildId = interaction.guildId;
        const { options } = interaction;
        const tags = [
            options.getString('first_tag'),
            options.getString('second_tag'),
            options.getString('third_tag'),
        ];

        const id = options.getString('id') ?? await getLastQuoteId(lastQuoteChannel)
        const lastQuoteChannel = options.getChannel('last_quote');
        const newTitle = options.getString('new_title')

        if (!id) {
            throw new Error('Please provide a quote id or choose a channel to get the quote id from.')
        }

        const multiQuote = await QuoteSchema.findOne({
            guildId: guildId,
            _id: id,
            type: 'multi'
        }).select('_id')

        if (!multiQuote) {
            throw new Error('Multi-quote does not exist.')
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

        // const fragments = [
        //     { text: options.getString('first_text'), authorName: options.getString('first_author') },
        //     { text: options.getString('second_text'), authorName: options.getString('second_author') },
        //     { text: options.getString('third_text'), authorName: options.getString('third_author') },
        //     { text: options.getString('fourth_text'), authorName: options.getString('fourth_author') },
        //     { text: options.getString('fifth_text'), authorName: options.getString('fifth_author') },
        // ]

        // const checkedFragments = []

        // fragments.forEach(async (fragment) => {
        //     const author = await getAuthorByName(fragment.authorName)

        //     if (author.name == 'Deleted Author') {
        //         throw new Error(`Make sure that '${fragment.authorName}' author exists.`)
        //     }

        //     if (!Object.values(fragment).includes(null)) {
        //         fragment.authorId = author._id
        //         checkedFragments.push(fragment)
        //     }
        // })

        if (!Object.keys(update).length) {
            throw new Error('No updates.')
        }

        const embeddedMultiQuote = quoteEmbed(multiQuote, checkedFragments) // checkedFragments

        await sendToQuotesChannel(embeddedMultiQuote, guildId, client)
        await interaction.reply(embeddedMultiQuote);
    })
};