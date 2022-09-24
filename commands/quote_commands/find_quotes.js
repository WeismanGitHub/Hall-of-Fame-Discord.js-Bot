const { errorEmbed, basicEmbed } = require('../../helpers/embeds');
const { getAuthorByName } = require('../../helpers/get_author');
const { Constants, MessageActionRow, MessageButton } = require('discord.js');
const FilterSchema = require('../../schemas/filter_schema');
const { checkTags } = require('../../helpers/check_tags');
const QuoteSchema = require('../../schemas/quote_schema');
const sendQuotes = require('../../helpers/send_quotes')

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
    ],

    callback: async ({ interaction }) => {
        try {
            const { options } = interaction;
            const sortObject = options.getString('date') == null ? { createdAt: -1 } : { createdAt: options.getString('date') }
            const limit = options.getInteger('limit') == null ? 10 : options.getInteger('limit')
            const searchPhrase = options.getString('search_phrase')
            const isAudioQuote = options.getBoolean('audio_quote')
            const isImageQuote = options.getBoolean('image_quote')
            let inputtedAuthor = options.getString('author');
            const guildId = interaction.guildId;
            const queryObject = { guildId: guildId };

            // Don't lower limit to less than 10. Causes headaches.
            if ((limit < 1) || (10 < limit)) {
                throw new Error('Limit must be between 1 and 10.')
            }

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

            if (isImageQuote !== null) {
                queryObject.attachment = { $exists: isImageQuote }
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
                queryObject.text ={ $regex: searchPhrase, $options: 'i' }
            }

            if (Object.keys(queryObject).length == 1) {
                throw new Error('Please add some filters. To get all quotes use /getallquotes.')
            }

            const quotes = await QuoteSchema.find(queryObject).sort(sortObject).limit(limit).lean();

            if (!quotes.length) {
                throw new Error('No quotes match your specifications.')
            }

            await interaction.reply(basicEmbed('Started!'))
            
            await sendQuotes(quotes, interaction.channel)

            if (quotes.length !== 10) {
                // For some reason putting the message and return on the same line doesn't actually cause it to return.
                await interaction.channel.send(basicEmbed('End of the line!'))
                return
            }

            const filterId = (await FilterSchema.create({ queryObject: queryObject, sortObject: sortObject }))._id

            const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setLabel('Next 10 Quotes ⏩')
                .setCustomId(`10,${filterId},findQuotes`)
                .setStyle('PRIMARY')
            )
            
            await interaction.channel.send({
                components: [row]
            })
        } catch (err) {
            await interaction.reply(errorEmbed(err))
            .catch(_ => interaction.channel.send(errorEmbed(err)))
        }
    }
};