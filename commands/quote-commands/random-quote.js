const { getAuthorByName, getAuthorById } = require('../../helpers/get-author');
const errorHandler = require('../../helpers/error-handler');
const QuoteSchema = require('../../schemas/quote-schema');
const { quoteEmbed } = require('../../helpers/embeds');
const checkTags = require('../../helpers/check-tags');
const { NotFoundError } = require('../../errors');
const { Constants } = require('discord.js');

module.exports = {
    category:'Quotes',
    name: 'random_quote',
    description: 'Get a random quote.',
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
        }
    ],
    
    callback: async ({ interaction }) => errorHandler(interaction, async () => {
        const { options } = interaction;
        const searchPhrase = options.getString('search_phrase')
        const inputtedAuthor = options.getString('author');
        const type = options.getString('type')

        const guildId = interaction.guildId;
        const query = { guildId: guildId };

        if (inputtedAuthor) {
            const author = await getAuthorByName(inputtedAuthor, guildId);
            query.$or = [{ authorId: author._id }, { fragments: { $elemMatch: { authorId: author._id } }  }]

            if (author.name == 'Deleted Author') {
                throw new NotFoundError(inputtedAuthor)
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

        const amountOfDocuments = await QuoteSchema.countDocuments(query)

        if (!amountOfDocuments) {
            throw new NotFoundError('Quotes')
        }

        const randomNumber = Math.floor(Math.random() * amountOfDocuments);
        const randomQuote = await QuoteSchema.findOne(query).skip(randomNumber).lean()
        const author = await getAuthorById(randomQuote.authorId, guildId)

        await interaction.reply(quoteEmbed(randomQuote, author));
    })
};