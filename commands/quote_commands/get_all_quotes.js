const { errorEmbed, quoteEmbed, basicEmbed, getAuthorById } = require('../../functions');
const QuoteSchema = require('../../schemas/quote-schema');
const { Constants } = require('discord.js');

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
                
                //Do not set up pagination to send ten embeds at a time because if one of the embeds is broken the other 9 won't send.
                for (let quote of quotes) {
                    let author = await getAuthorById(quote.authorId, guildId)
                    
                    await interaction.channel.send(quoteEmbed(quote, author))
                    .catch(async err => {
                        interaction.channel.send(errorEmbed(err, `Quote Id: ${quote._id}`));
                    });
                }

                await interaction.channel.send(basicEmbed('Done!'));
                
            } else {
                await interaction.reply(basicEmbed('This server has no quotes.'));
            }
        } catch(err) {
            await interaction.reply(errorEmbed(err));
        }
    })
};