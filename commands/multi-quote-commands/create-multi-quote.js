const sendToQuotesChannel = require('../../helpers/send-to-quotes-channel');
const MultiQuoteSchema = require('../../schemas/audio-quote-schema');
const { getAuthorByName } = require('../../helpers/get-author');
const errorHandler = require('../../helpers/error-handler');
const { checkTags } = require('../../helpers/check-tags');
const { quoteEmbed } = require('../../helpers/embeds');
const { Constants } = require('discord.js');

module.exports = {
    category:'Multi Quotes',
    name: 'create_multi_quote',
    description: 'Multi-quotes have multiple quotes from multiple authors within them.',
    guildOnly: true,
    slash: true,

    options: [
        {
            name: 'title',
            description: 'Title of the audio quote.',
            required: true,
            type: Constants.ApplicationCommandOptionTypes.STRING
        },
        {
            name: 'first_author',
            description: 'The name of the first author.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
            required: true,
        },
        {
            name: 'first_text',
            description: 'The first part of the multi-quote.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
            required: true,
        },
        {
            name: 'second_author',
            description: 'The name of the second author.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
            required: true,
        },
        {
            name: 'second_text',
            description: 'The second part of the multi-quote.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
            required: true,
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
    ],

    callback: async ({ interaction, client }) => errorHandler(interaction, async () => {
        const guildId = interaction.guildId;
        const { options } = interaction;

        let tags = [
            options.getString('first_tag'),
            options.getString('second_tag'),
            options.getString('third_tag'),
        ];
        
        tags = await checkTags(tags, guildId);

        const fragments = [
            { text: options.getString('first_text'), authorName: options.getString('first_author') },
            { text: options.getString('second_text'), authorName: options.getString('second_author') },
            { text: options.getString('third_text'), authorName: options.getString('third_author') },
            { text: options.getString('fourth_text'), authorName: options.getString('fourth_author') },
            { text: options.getString('fifth_text'), authorName: options.getString('fifth_author') },
        ]
        
        const checkedFragments = []

        fragments.forEach(async (fragment) => {
            const author = await getAuthorByName(fragment.authorName)

            if (author.name == 'Deleted Author') {
                throw new Error(`Make sure that '${fragment.authorName}' author exists.`)
            }

            if (!Object.values(fragment).includes(null)) {
                fragment.authorId = author._id
                checkedFragments.push(fragment)
            }
        })

        const multiQuote = await MultiQuoteSchema.create({
            guildId: guildId,
            text: options.getString('title'),
            fragments: checkedFragments,
            tags: tags,
            type: 'multi'
        });

        const embeddedMultiQuote = quoteEmbed(multiQuote, checkedFragments) // checkedFragments

        await sendToQuotesChannel(embeddedMultiQuote, guildId, client)
        await interaction.reply(embeddedMultiQuote);
    })
};