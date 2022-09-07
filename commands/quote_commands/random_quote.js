const { getAuthorByName, getAuthorById } = require('../../helpers/get_author');
const { errorEmbed, quoteEmbed } = require('../../helpers/embeds');
const { checkTags } = require('../../helpers/check_tags');
const QuoteSchema = require('../../schemas/quote_schema');
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
        {
            name: 'audio_quote',
            description: 'Sorts by if quote is audio quote or not.',
            type: Constants.ApplicationCommandOptionTypes.BOOLEAN,
        },
    ],
    
    callback: async ({ interaction }) => {
        try {
            const { options } = interaction;
            const searchPhrase = options.getString('search_phrase')
            const isAudioQuote = options.getBoolean('audio_quote')
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
            
            if (isAudioQuote !== null) {
                queryObject.isAudioQuote = isAudioQuote
            }
            
            const amountOfDocuments = await QuoteSchema.countDocuments(queryObject)

            if (!amountOfDocuments) {
                throw new Error('Your specifications provide no quotes.')
            }

            const randomNumber = Math.floor(Math.random() * amountOfDocuments);
            const randomQuote = await QuoteSchema.findOne(queryObject).skip(randomNumber).lean()

            const author = await getAuthorById(randomQuote.authorId, guildId);
            await interaction.reply(quoteEmbed(randomQuote, author));
        } catch(err) {
            interaction.reply(errorEmbed(err))
            .catch(_ => interaction.channel.send(errorEmbed(err)))
        }
    }
};