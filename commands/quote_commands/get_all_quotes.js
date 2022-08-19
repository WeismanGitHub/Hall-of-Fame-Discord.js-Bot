const { errorEmbed, quoteEmbed, basicEmbed, getAuthorById } = require('../../functions');
const QuoteSchema = require('../../schemas/quote_schema');

const {
    Constants,
    MessageActionRow,
    MessageButton,
    createMessageComponentCollector
} = require('discord.js');

module.exports = {
    category:'Quotes',
    description: 'Get all quotes tied to your server.',
    name: 'getallquotes',
    slash: true,
    options: [
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
        }
    ],

    callback: (async ({ interaction }) => {
        try {
            const guildId = interaction.guildId;
            const { options } = interaction;
            const sortObject = options.getString('date') == null ? { createdAt: -1 } : { createdAt: options.getString('date') }
            const quotes = await QuoteSchema.find({ guildId: guildId }).sort(sortObject).limit(10).lean();

            if (quotes.length) {
                await interaction.reply(basicEmbed('Started!'))
                
                for (let quote of quotes) {
                    let author = await getAuthorById(quote.authorId, guildId)
                    
                    await interaction.channel.send(quoteEmbed(quote, author))
                    .catch(async err => {
                        interaction.channel.send(errorEmbed(err, `Quote Id: ${quote._id}`));
                    });
                }

                const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                    .setCustomId(`10,${sortObject.createdAt}`)
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
                    const sortObject = { createdAt: customId[1] }
                    
                    const quotes = await QuoteSchema.find({ guildId: guildId }).sort(sortObject).skip(skipAmount).limit(10).lean();
                    
                    if (!Object.keys(quotes).length) {
                        return await i.reply(basicEmbed('There are no quotes left!'))
                    }

                    i.reply(basicEmbed('Started!'));

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
                        .setCustomId(`${Number(skipAmount) + 10},${sortObject.createdAt},`)
                        .setLabel('⏩')
                        .setStyle('PRIMARY')
                    )

                    await interaction.channel.send({
                        ...basicEmbed('Get Next 10 Quotes?'),
                        components: [row]
                    })
                })
            } else {
                throw new Error('This server has no quotes.')
            }
        } catch(err) {
            console.log(err)
            await interaction.reply(errorEmbed(err));
        }
    })
};