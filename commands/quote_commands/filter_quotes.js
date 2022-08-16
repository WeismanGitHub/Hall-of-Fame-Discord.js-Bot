const {errorEmbed, quoteEmbed, basicEmbed, getAuthorByName, getAuthorById, checkTags} = require('../../functions');
const QuoteSchema = require('../../schemas/quote-schema');
const GuildSchema = require('../../schemas/guild-schema');
const {Constants} = require('discord.js');
let commandAlreadyRespondedTo = false

module.exports = {
    category:'Quotes',
    description: 'Sort quotes by a number of fields and send them.',
    name: 'filterquotes',
    slash: true,

    options: [
        {
            name: 'author',
            description: 'Sort by author of quote.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'limit',
            description: 'Amount of quotes returned.',
            type: Constants.ApplicationCommandOptionTypes.INTEGER
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

    callback: async ({interaction}) => {
        try {
            const {options} = interaction;
            const sortObject = options.getString('date') == null ? {createdAt: -1} : {createdAt: options.getString('date')}
            const limit = options.getInteger('limit') == null ? Infinity : options.getInteger('limit')
            const searchPhrase = options.getString('search_phrase')
            const isAudioQuote = options.getBoolean('is_audio_quote')
            let inputtedAuthor = options.getString('author');
            const guildId = interaction.guildId;
            const queryObject = {guildId: guildId};

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
                const guildTags = (await GuildSchema.findOne({guildId: guildId}).select('tags')).tags;
                let checkedTagsObject = await checkTags(uncheckedTags, guildTags)

                if (checkedTagsObject.tagsExist) {
                    queryObject.tags = {$all: checkedTagsObject.checkedTags};
                } else {
                    throw new Error('Make sure all your tags exist.')
                }
            }

            if (searchPhrase) {
                queryObject.text ={$regex: searchPhrase, $options: 'i'}
            }

            if (Object.keys(queryObject).length == 1) {
                throw new Error('Please add some filters. To get all quotes use /getallquotes.')
            }

            const quotes = await QuoteSchema.find(queryObject).sort(sortObject).limit(limit);

            //Do not set up pagination to send ten embeds at a time because if one of the embeds is broken the other 9 won't send.
            if (quotes.length) {
                await interaction.reply(basicEmbed(`Started!\nAmount: ${quotes.length}`))
                commandAlreadyRespondedTo = true

                for (let quote of quotes) {
                    const quoteAuthor = await getAuthorById(quote.authorId, guildId);

                    await interaction.channel.send(quoteEmbed(quote, quoteAuthor))
                    .catch(async err => {
                        await interaction.channel.send(errorEmbed(err, `Quote Id: ${quote._id}`));
                    });
                }

                await interaction.channel.send(basicEmbed('Done!'));
            } else {
                await interaction.reply(basicEmbed('No quotes match your specifications.'));
                return commandAlreadyRespondedTo = true
            }


        } catch(err) {
            if (commandAlreadyRespondedTo) {
                await interaction.channel.send(errorEmbed(err))
            } else {
                await interaction.reply(errorEmbed(err));
            }
        };
    }
};