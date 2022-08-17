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
            name: 'limit',
            description: 'Amount of quotes returned.',
            type: Constants.ApplicationCommandOptionTypes.INTEGER
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
        }
    ],

    callback: (async ({ interaction }) => {
        try {
            const guildId = interaction.guildId;
            const { options } = interaction;
            const limit = options.getInteger('limit') == null ? Infinity : options.getInteger('limit')
            const sortObject = options.getString('date') == null ? { createdAt: -1 } : { createdAt: options.getString('date') }
            const quotes = await QuoteSchema.find({ guildId: guildId }).sort(sortObject).limit(limit).lean();

            if (quotes.length) {
                await interaction.reply(basicEmbed(`Started!\nAmount: ${quotes.length}`));
                
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
                    .setCustomId('10')
                    .setLabel('⏩')
                    .setStyle('PRIMARY')
                )

                await interaction.channel.send({
                    ...basicEmbed('Get Next 10 Quotes?'),
                    components: [row]
                })

                const collector = interaction.channel.createMessageComponentCollector({ max: 1 })

                collector.on('collect', async (i) => {
                    
                })
                await interaction.channel.send(basicEmbed('Done!'));
                
            } else {
                await interaction.reply(basicEmbed('This server has no quotes.'));
            }
        } catch(err) {
            console.log(err)
            await interaction.reply(errorEmbed(err));
        }
    })
};