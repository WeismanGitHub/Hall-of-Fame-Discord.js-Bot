const { errorEmbed, basicEmbed } = require('../../helpers/embeds');
const QuoteSchema = require('../../schemas/quote_schema');
const sendQuotes = require('../../helpers/send_quotes')

const {
    Constants,
    MessageActionRow,
    MessageButton,
} = require('discord.js');

module.exports = {
    category:'Quotes',
    name: 'get_all_quotes',
    description: 'Get all quotes.',
    guildOnly: true,
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
        },
        {
            name: 'pagination',
            description: 'Send all quotes at once or ten at a time.',
            type: Constants.ApplicationCommandOptionTypes.BOOLEAN,
        },
    ],

    callback: (async ({ interaction }) => {
        try {
            const guildId = interaction.guildId;
            const { options } = interaction;
            const date = options.getString('date') == '1' ? 1 : -1
            const pagination = options.getBoolean('pagination')

            const quotes = await QuoteSchema.find({ guildId: guildId }).sort({ createdAt: date })
            .limit(pagination == false ? Infinity : 10).lean();

            if (!quotes.length) {
                throw new Error('This server has no quotes.')
            }

            await interaction.reply(basicEmbed('Started!'))

            // sendQuotes modifies quotes array so gotta use a copy.
            await sendQuotes([...quotes], interaction.channel)
            
            if (quotes.length !== 10) {
                // Putting the message and return on the same line doesn't actually cause it to return. Maybe because it's a promise? Idk.
                await interaction.reply('Done!')
                return
            }

            if (pagination !== false) {
                const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                    .setLabel('Next 10 Quotes ⏩')
                    .setCustomId(`10,${date},getAllQuotes`)
                    .setStyle('PRIMARY')
                    )
    
                await interaction.channel.send({
                    components: [row]
                })
            } else {
                await interaction.reply('Done!')
            }
        } catch(err) {
            interaction.reply(errorEmbed(err))
            .catch(_ => interaction.channel.send(errorEmbed(err)))
        }
    })
};