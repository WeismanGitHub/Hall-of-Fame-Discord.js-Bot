const { getAuthorByName, getAuthorById } = require('../helpers/get_author');
const { errorEmbed, quoteEmbed } = require('../helpers/embeds');
const { checkTags } = require('../helpers/check_tags');
const QuoteSchema = require('../schemas/quote_schema');
const { Constants } = require('discord.js');

module.exports = {
    category:'Quotes',
    description: 'Get a random quote.',
    name: 'randomquote',
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
    ],
    
    callback: async ({ interaction }) => {
        try {
            const { options } = interaction;
            const sortObject = options.getString('date') == null ? { createdAt: -1 } : { createdAt: options.getString('date') }
            const searchPhrase = options.getString('search_phrase')
            let inputtedAuthor = options.getString('author');
            const guildId = interaction.guildId;
            const queryObject = { guildId: guildId };
            
            if (inputtedAuthor) {
                inputtedAuthor = await getAuthorByName(inputtedAuthor, guildId);
            
                if (inputtedAuthor.name !== 'Deleted Author') {
                    queryObject.authorId = inputtedAuthor._id;
                } else {
                    throw new Error(`'${inputtedAuthor}' author does not exist.`)
                }
            }

            let tags = [
                options.getString('first_tag'),
                options.getString('second_tag'),
                options.getString('third_tag'),
            ];

            tags = await checkTags(tags, guildId);
            
            if (tags.length) {
                queryObject.tags = { $all: tags };
            }
            
            if (searchPhrase) {
                queryObject.$text = {
                    '$search': searchPhrase
                }
            }
            
            const amountOfDocuments = await QuoteSchema.countDocuments(queryObject)

            if (!amountOfDocuments) {
                throw new Error('Your specifications provide no quotes.')
            }

            const randomNumber = Math.floor(Math.random() * amountOfDocuments) + 0;

            const randomQuote = await QuoteSchema.findOne(queryObject).sort(sortObject).skip(randomNumber).lean()

            const author = await getAuthorById(randomQuote.authorId, guildId);
            await interaction.reply(quoteEmbed(randomQuote, author));

        } catch(err) {
            await interaction.reply(errorEmbed(err));
        };
    }
};