const { getAuthorByName, getAuthorById } = require('../../helpers/get-author');
const errorHandler = require('../../helpers/error-handler');
const { checkTags } = require('../../helpers/check-tags');
const QuoteSchema = require('../../schemas/quote-schema');
const { quoteEmbed } = require('../../helpers/embeds');
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
            name: 'audio_quote',
            description: 'Sorts by if quote is audio quote or not.',
            type: Constants.ApplicationCommandOptionTypes.BOOLEAN,
        },
        {
            name: 'image_quote',
            description: 'Sorts by if the quote has an image.',
            type: Constants.ApplicationCommandOptionTypes.BOOLEAN,
        },
    ],
    
    callback: async ({ interaction }) => errorHandler(interaction, async () => {
        const { options } = interaction;
        const searchPhrase = options.getString('search_phrase')
        const isAudioQuote = options.getBoolean('audio_quote')
        const isImageQuote = options.getBoolean('image_quote')
        let inputtedAuthor = options.getString('author');
        const guildId = interaction.guildId;
        const query = { guildId: guildId };
        
        if (inputtedAuthor) {
            inputtedAuthor = await getAuthorByName(inputtedAuthor, guildId);
        
            if (inputtedAuthor.name !== 'Deleted Author') {
                query.authorId = inputtedAuthor._id;
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
            query.tags = { $all: tags };
        }
        
        if (searchPhrase) {
            query.$text = {
                '$search': searchPhrase
            }
        }
        
        if (isAudioQuote !== null) {
            query.isAudioQuote = isAudioQuote
        }
        
        if (isImageQuote !== null) {
            query.attachment = { $exists: isImageQuote }
        }

        const amountOfDocuments = await QuoteSchema.countDocuments(query)

        if (!amountOfDocuments) {
            throw new Error('Your specifications provide no quotes.')
        }

        const randomNumber = Math.floor(Math.random() * amountOfDocuments);
        const randomQuote = await QuoteSchema.findOne(query).skip(randomNumber).lean()

        const author = await getAuthorById(randomQuote.authorId, guildId);
        await interaction.reply(quoteEmbed(randomQuote, author));
    })
};