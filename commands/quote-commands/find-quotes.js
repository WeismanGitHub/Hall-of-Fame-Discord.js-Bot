const { Constants, MessageActionRow, MessageButton } = require('discord.js');
const { getAuthorByName } = require('../../helpers/get-author');
const FilterSchema = require('../../schemas/filter-schema');
const errorHandler = require('../../helpers/error-handler');
const { checkTags } = require('../../helpers/check-tags');
const QuoteSchema = require('../../schemas/quote-schema');
const sendQuotes = require('../../helpers/send-quotes');
const { basicEmbed } = require('../../helpers/embeds');

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
            maxLength: 256
        },
        {
            name: 'first_tag',
            description: 'Quote must include this tag.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
            maxLength: 339
        },
        {
            name: 'second_tag',
            description: 'Quote must include this tag.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
            maxLength: 339
        },
        {
            name: 'third_tag',
            description: 'Quote must include this tag.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
            maxLength: 339
        },
        {
            name: 'search_phrase',
            description: 'A phrase to search for in the quote text.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
            maxLength: 4096
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
            name: 'type',
            description: 'Filter by type of quote.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
            choices: [
                {
                    name: 'regular quote',
                    value: 'regular'
                },
                {
                    name: 'audio quote',
                    value: 'audio'
                },
                {
                    name: 'multi-quote',
                    value: 'multi'
                },
                {
                    name: 'image quote',
                    value: 'image'
                }
            ]
        },
        {
            name: 'limit',
            description: 'Amount of quotes returned. Must be less than 10.',
            type: Constants.ApplicationCommandOptionTypes.INTEGER,
            minLength: 1,
            maxLength: 9,
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
        const pagination = options.getBoolean('pagination')
        let author = options.getString('author');
        const type = options.getString('type')
        const guildId = interaction.guildId;
        const query = { guildId: guildId };
        
        // Increasing limit doesn't make sense because they could just press the next button.
        if ((limit < 1) || (10 < limit)) {
            throw new Error('The limit is between 1 and 10.')
        }

        if (author) {
            author = await getAuthorByName(author, guildId);
            query.authorId = author._id;

            if (author.name == 'Deleted Author') {
                throw new Error(`'${options.getString('author')}' author does not exist.`)
            }
        }

        if (type) {
            if (type == 'image') {
                query.attachmentURL = { $ne: null }
            } else {
                query.type = type
                query.attachmentURL = null
            }
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
            // Putting the message and return on the same line doesn't actually cause it to return. IDFK why.
            await interaction.channel.send(basicEmbed('Done!'))
            return
        }

        if (pagination == false) {
            return await interaction.channel.send(basicEmbed('Done!'))
        }

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
    })
};