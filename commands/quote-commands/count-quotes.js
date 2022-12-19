const { getAuthorByName } = require('../../helpers/get-author');
const errorHandler = require('../../helpers/error-handler');
const { checkTags } = require('../../helpers/check-tags');
const QuoteSchema = require('../../schemas/quote-schema');
const { basicEmbed } = require('../../helpers/embeds');
const { Constants } = require('discord.js');


module.exports = {
    category:'Quotes',
    name: 'count_quotes',
    description: 'Count number of quotes. Use options to filter.',
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
            name: 'is_audio_quote',
            description: 'Sorts by if quote is audio quote or not.',
            type: Constants.ApplicationCommandOptionTypes.BOOLEAN,
        }
    ],

    callback: async ({ interaction }) => errorHandler(interaction, async () => {
        const { options } = interaction;
        const searchPhrase = options.getString('search_phrase')
        const isAudioQuote = options.getBoolean('is_audio_quote')
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

        if (isAudioQuote !== null) {
            query.isAudioQuote = isAudioQuote
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

        let count;

        if (Object.keys(query).length) {
            count = await QuoteSchema.countDocuments(query)
        } else {
            count = await QuoteSchema.estimatedDocumentCount()
        }
        
        if (count <= 0) {
            return await interaction.reply(basicEmbed('No quotes match your specifications!'))
        }

        await interaction.reply(basicEmbed(`${count} quote${count > 1 ? 's' : ''} match${count > 1 ? '' : 'es'} your specifications!`))
    })
};