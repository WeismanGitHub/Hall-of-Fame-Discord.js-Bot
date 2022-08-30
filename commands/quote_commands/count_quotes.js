const { errorEmbed, basicEmbed } = require('../../helpers/embeds');
const { getAuthorByName } = require('../../helpers/get_author');
const { checkTags } = require('../../helpers/check_tags');
const QuoteSchema = require('../../schemas/quote_schema');
const GuildSchema = require('../../schemas/guild_schema');
const { Constants } = require('discord.js');


module.exports = {
    category:'Quotes',
    description: 'Count number of quotes. Use options to filter.',
    name: 'countquotes',
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
            name: 'is_audio_quote',
            description: 'Sorts by if quote is audio quote or not.',
            type: Constants.ApplicationCommandOptionTypes.BOOLEAN,
        }
    ],

    callback: async ({ interaction }) => {
        try {
            const { options } = interaction;
            const searchPhrase = options.getString('search_phrase')
            const isAudioQuote = options.getBoolean('is_audio_quote')
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

            if (isAudioQuote !== null) {
                queryObject.isAudioQuote = isAudioQuote
            }

            const uncheckedTags = [
                options.getString('first_tag'),
                options.getString('second_tag'),
                options.getString('third_tag'),
            ];

            const thereAreTags = uncheckedTags.some(tag => tag !== null);
            
            if (thereAreTags) {
                const guildTags = (await GuildSchema.findOne({ guildId: guildId }).select('-_id tags').lean()).tags;
                let checkedTagsObject = await checkTags(uncheckedTags, guildTags)

                if (checkedTagsObject.tagsExist) {
                    queryObject.tags = { $all: checkedTagsObject.checkedTags };
                } else {
                    throw new Error('Make sure all your tags exist.')
                }
            }

            if (searchPhrase) {
                queryObject.text ={ $regex: searchPhrase, $options: 'i' }
            }

            let count;

            if (Object.keys(queryObject).length) {
                count = await QuoteSchema.countDocuments(queryObject)
            } else {
                count = await QuoteSchema.estimatedDocumentCount()
            }

            await interaction.reply(basicEmbed(`${count} quotes match your specifications!`))
        } catch(err) {
            console.log(err)
            await interaction.reply(errorEmbed(err));
        };
    }
};