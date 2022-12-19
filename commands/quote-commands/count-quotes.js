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
                }
            ]
        }
    ],

    callback: async ({ interaction }) => errorHandler(interaction, async () => {
        const { options } = interaction;
        const searchPhrase = options.getString('search_phrase')
        let inputtedAuthor = options.getString('author');
        const type = options.getBoolean('type')
        const guildId = interaction.guildId;
        const query = { guildId: guildId };
    
        if (inputtedAuthor) {
            inputtedAuthor = await getAuthorByName(inputtedAuthor, guildId);
            query.authorId = inputtedAuthor._id;

            if (inputtedAuthor.name !== 'Deleted Author') {
                throw new Error(`'${inputtedAuthor}' author does not exist.`)
            }
        }

        if (type) {
            query.type = type
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

        const count = await QuoteSchema.countDocuments(query)
        const plural = count > 1
        
        if (count <= 0) {
            return await interaction.reply(basicEmbed('No quotes match your specifications!'))
        }

        await interaction.reply(basicEmbed(`${count} quote${plural ? 's' : ''} match${plural ? '' : 'es'} your specifications!`))
    })
};