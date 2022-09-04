const { errorEmbed, quoteEmbed, basicEmbed } = require('../../helpers/embeds');
const { getAuthorById } = require('../../helpers/get_author');
const QuoteSchema = require('../../schemas/quote_schema');
const sendQuotes = require('../../helpers/send_quotes')

const {
    Constants,
    MessageActionRow,
    MessageButton,
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

            if (!quotes.length) {
                throw new Error('This server has no quotes.')
            }

            await interaction.reply(basicEmbed('Started!'))

            await sendQuotes(quotes, interaction.channel)

            if (quotes.length !== 10) {
                return await interaction.channel.send(basicEmbed('End of the line!'))
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
                    .setCustomId(`${Number(skipAmount) + 10},${sortObject.createdAt}`)
                    .setLabel('⏩')
                    .setStyle('PRIMARY')
                )

                await interaction.channel.send({
                    ...basicEmbed('Get Next 10 Quotes?'),
                    components: [row]
                })
            })
        } catch(err) {
            await interaction.reply(errorEmbed(err));
        }
    })
};