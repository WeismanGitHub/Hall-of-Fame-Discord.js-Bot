const sendToQuotesChannel = require('../../helpers/send-to-quotes-channel');
const MultiQuoteSchema = require('../../schemas/audio-quote-schema');
const { getAuthorByName } = require('../../helpers/get-author');
const errorHandler = require('../../helpers/error-handler');
const { multiQuoteEmbed } = require('../../helpers/embeds');
const { checkTags } = require('../../helpers/check-tags');
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
        
        const title = options.getString('title');
        let tags = [
            options.getString('first_tag'),
            options.getString('second_tag'),
            options.getString('third_tag'),
        ];

        const fragments = [
            { text: options.getString('first_text'), author: options.getString('first_author') },
            { text: options.getString('second_text'), author: options.getString('second_author') },
            { text: options.getString('third_text'), author: options.getString('third_author') },
            { text: options.getString('fourth_text'), author: options.getString('fourth_author') },
            { text: options.getString('fifth_text'), author: options.getString('fifth_author') },
        ]
        
        tags = await checkTags(tags, guildId);

        const checkedFragments = fragments.map(async (fragment) => {
            let checkedAuthor = await getAuthorByName(fragment.name)

            if (checkedAuthor.name == 'Deleted Author') {
                
            }
        })

        const multiQuote = await MultiQuoteSchema.create({
            guildId: guildId,
            authorId: checkedAuthor._id,
            text: title,
            audioFileLink: audioFileLink ?? await getLastAudio(lastAudioChannel),
            tags: tags,
        });

        const embeddedMultiQuote = multiQuoteEmbed()

        await sendToQuotesChannel(embeddedMultiQuote, guildId, client)
        await interaction.reply(embeddedMultiQuote);
    })
};