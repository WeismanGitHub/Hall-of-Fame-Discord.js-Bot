const { errorEmbed, quoteEmbed, basicEmbed } = require('../../helpers/embeds');
const { getAuthorByName, getAuthorById } = require('../../helpers/get_author');
const { Constants, MessageActionRow, MessageButton } = require('discord.js');
const FilterSchema = require('../../schemas/filter_schema');
const { checkTags } = require('../../helpers/check_tags');
const QuoteSchema = require('../../schemas/quote_schema');

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
            const sortObject = options.getString('date') == null ? { createdAt: -1 } : { createdAt: options.getString('date') }
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
            const quotes = await QuoteSchema.find(queryObject).sort(sortObject).limit(10).lean();
            
            if (!quotes.length) {
                throw new Error('No quotes match your specifications.')
            }

            await interaction.reply(basicEmbed('Started!'))
            
            for (let quote of quotes) {
                const quoteAuthor = await getAuthorById(quote.authorId, guildId);
                
                await interaction.channel.send(quoteEmbed(quote, quoteAuthor))
                .catch(async err => {
                    await interaction.channel.send(errorEmbed(err, `Quote Id: ${quote._id}`));
                });
            }
            
            if (quotes.length !== 10) {
                // For some reason putting the message and return on the same line doesn't actually cause it to return.
                await interaction.channel.send(basicEmbed('End of the line!'))
                return
            }

            const filterId = (await FilterSchema.create({ queryObject: queryObject, sortObject: sortObject }))._id

            const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setCustomId(`10,${filterId}`)
                .setLabel('⏩')
                .setStyle('PRIMARY')
            )
            
            await interaction.channel.send({
                ...basicEmbed('Get Next 10 Quotes?'),
                components: [row]
            })

            const collector = interaction.channel.createMessageComponentCollector()

            collector.on('collect', async (i) => {
                const customId = i.customId.split(',')
                const skipAmount = customId[0]
                const filterObject = await FilterSchema.findById(customId[1])
                
                if (!filterObject) {
                    return await i.channel.send('Please use the command again. This button is broken.')
                }

                const { queryObject, sortObject } = filterObject

                const quotes = await QuoteSchema.find(queryObject).sort(sortObject).skip(skipAmount).limit(10).lean();
                
                if (!quotes.length) {
                    return await i.reply(basicEmbed('No more quotes!'))
                }

                await i.reply(basicEmbed('Started!'));

                for (let quote of quotes) {
                    let author = await getAuthorById(quote.authorId, guildId)
                    
                    await interaction.channel.send(quoteEmbed(quote, author))
                    .catch(async err => {
                        await interaction.channel.send(errorEmbed(err, `Quote Id: ${quote._id}`));
                    });
                }

                if (quotes.length !== 10) {
                    return await interaction.channel.send(basicEmbed('End of the line!'))
                }

                const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                    .setCustomId(`${Number(skipAmount) + 10},${filterId}`)
                    .setLabel('⏩')
                    .setStyle('PRIMARY')
                )
                    
                await interaction.channel.send({
                    ...basicEmbed('Get Next 10 Quotes?'),
                    components: [row]
                })
            })
        } catch(err) {
            console.log(err)
            await interaction.reply(errorEmbed(err));
        };
    }
};