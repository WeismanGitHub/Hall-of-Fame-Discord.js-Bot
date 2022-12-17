const { Constants, MessageActionRow, MessageButton } = require('discord.js');
const { getAuthorByName } = require('../../helpers/get-author');
const FilterSchema = require('../../schemas/filter-schema');
const errorHandler = require('../../helpers/error-handler');
const { checkTags } = require('../../helpers/check-tags');
const QuoteSchema = require('../../schemas/quote-schema');
const sendQuotes = require('../../helpers/send-quotes');
const { basicEmbed } = require('../../helpers/embeds');
const moment = require('moment');

module.exports = {
    category:'Quotes',
    name: 'find_quotes',
    description: 'Get quotes that match your specifications.',
    guildOnly: true,
    slash: true,

    options: [
        {
            name: 'author',
            description: 'Sort by author of quote.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'first_tag',
            description: 'Quote must include this tag.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'second_tag',
            description: 'Quote must include this tag.',
            type: Constants.ApplicationCommandOptionTypes.STRING
        },
        {
            name: 'third_tag',
            description: 'Quote must include this tag.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'search_phrase',
            description: 'A phrase to search for in the quote text.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'date',
            description: 'Sort by newest/oldest.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
            choices: [
                {
                    name: 'newest',
                    value: '-1'
                },
                {
                    name: 'oldest',
                    value: '1'
                },
            ]
        },
        {
            name: 'audio_quote',
            description: 'Sorts by if quote is audio quote or not.',
            type: Constants.ApplicationCommandOptionTypes.BOOLEAN,
        },
        {
            name: 'limit',
            description: 'Amount of quotes returned. Must be less than 10.',
            type: Constants.ApplicationCommandOptionTypes.INTEGER
        },
        {
            name: 'image_quote',
            description: 'Sorts by if the quote has an image.',
            type: Constants.ApplicationCommandOptionTypes.BOOLEAN,
        },
        {
            name: 'pagination',
            description: 'Send all quotes at once or ten at a time.',
            type: Constants.ApplicationCommandOptionTypes.BOOLEAN,
        },
    ],

    callback: async ({ interaction }) => errorHandler(interaction, async () => {
        const { options } = interaction;
        const sort = options.getString('date') == null ? { createdAt: -1 } : { createdAt: options.getString('date') }
        const limit = options.getInteger('limit') == null ? 10 : options.getInteger('limit')
        const searchPhrase = options.getString('search_phrase')
        const isAudioQuote = options.getBoolean('audio_quote')
        const isImageQuote = options.getBoolean('image_quote')
        const pagination = options.getBoolean('pagination')
        let inputtedAuthor = options.getString('author');
        const guildId = interaction.guildId;
        const query = { guildId: guildId };

        // Don't lower limit to less than 10. Causes headaches.
        if ((limit < 1) || (10 < limit)) {
            throw new Error('Limit must be between 1 and 10.')
        }

        if (inputtedAuthor) {
            inputtedAuthor = await getAuthorByName(inputtedAuthor, guildId);

            if (inputtedAuthor.name !== 'Deleted Author') {
                query.authorId = inputtedAuthor._id;
            } else {
                throw new Error(`'${inputtedAuthor}' author does not exist.`)
            }
        }

        if (isAudioQuote !== null) {
            query.isAudioQuote = isAudioQuote
        }

        if (isImageQuote !== null) {
            query.attachment = { $exists: isImageQuote }
        }

        let tags = [
            options.getString('first_tag'),
            options.getString('second_tag'),
            options.getString('third_tag'),
        ];

        tags = await checkTags(tags, guildId);
        
        if (tags.length) {
            query.tags = { $all: tags };
        }

        if (searchPhrase) {
            query.$text = { $search: searchPhrase }
        }

        const quotes = await QuoteSchema.find(query).sort(sort)
        .limit(pagination == false ? Infinity : limit).lean();

        if (!quotes.length) {
            throw new Error('No quotes match your specifications.')
        }

        await interaction.reply(basicEmbed('Started!'))

        // sendQuotes modifies quotes array so gotta use a copy.
        await sendQuotes([...quotes], interaction.channel)

        if (quotes.length < 10) {
            // Putting the message and return on the same line doesn't actually cause it to return. Maybe because it's a promise? Idk.
            await interaction.channel.send(basicEmbed('Done!'))
            return
        }

        if (pagination !== false) {
            const filterId = (await FilterSchema.create({ query: query, sort: sort }))._id

            const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setLabel('Next 10 Quotes ⏩')
                .setCustomId(`10,${filterId},find_quotes`)
                .setStyle('PRIMARY')
            )
            
            await interaction.channel.send({
                components: [row]
            })
        } else {
            await interaction.channel.send(basicEmbed('Done!'))
        }
    })
};