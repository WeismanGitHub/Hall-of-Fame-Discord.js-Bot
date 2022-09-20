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
        }
    ],

    callback: (async ({ interaction }) => {
        try {
            const guildId = interaction.guildId;
            const { options } = interaction;
            const date = options.getString('date') == '1' ? 1 : -1
            const quotes = await QuoteSchema.find({ guildId: guildId }).sort({ createdAt: date }).limit(10).lean();

            if (!quotes.length) {
                throw new Error('This server has no quotes.')
            }

            await interaction.reply(basicEmbed('Started!'))

            await sendQuotes(quotes, interaction.channel)

            if (quotes.length !== 10) {
                // For some reason putting the message and return on the same line doesn't actually cause it to return.
                await interaction.channel.send(basicEmbed('End of the line!'))
                return
            }

            const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                .setLabel('Next 10 Quotes ⏩')
                .setCustomId(`10,${date}`)
                .setStyle('PRIMARY')
                )

            await interaction.channel.send({
                components: [row]
            })

            const collector = interaction.channel.createMessageComponentCollector()

            collector.on('collect', async (i) => {
                try {
                    const customId = i.customId.split(',')
                    const skipAmount = customId[0]
                    const date = customId[1]
                    
                    const quotes = await QuoteSchema.find({ guildId: guildId }).sort({ createdAt: date }).skip(skipAmount).limit(10).lean();

                    if (!quotes.length) {
                        return await i.reply(basicEmbed('No more quotes!'))
                    }

                    await i.reply(basicEmbed('Started!'));

                    await sendQuotes(quotes, interaction.channel)

                    if (quotes.length !== 10) {
                        return await interaction.channel.send(basicEmbed('End of the line!'))
                    }

                    const row = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                        .setCustomId(`${Number(skipAmount) + 10},${date}`)
                        .setLabel('Next 10 Quotes ⏩')
                        .setStyle('PRIMARY')
                    )

                    await interaction.channel.send({
                        components: [row]
                    })
                } catch(err) {
                    await i.reply(errorEmbed(err))
                    .catch(_ => i.channel.send(errorEmbed(err)))
                }
            })
        } catch(err) {
            interaction.reply(errorEmbed(err))
            .catch(_ => interaction.channel.send(errorEmbed(err)))
        }
    })
};