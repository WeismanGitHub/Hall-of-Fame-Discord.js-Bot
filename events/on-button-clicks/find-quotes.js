const UniversalQuoteSchema = require('../../schemas/universal-quote-schema');
const { MessageActionRow, MessageButton } = require('discord.js');
const FilterSchema = require('../../schemas/filter-schema');
const sendQuotes = require('../../helpers/send-quotes');
const { InvalidActionError } = require('../../errors');
const { basicEmbed } = require('../../helpers/embeds');
const { Events } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	once: false,
    execute: async (interaction) => {
        if (!interaction.isButton()) {
            return
        }

        const { type, skipAmount, filterId } = JSON.parse(interaction.customId)

        if (type !== 'find-quotes') {
            return
        }
        
        const filter = await FilterSchema.findById(filterId).lean()

        if (!filter) {
            throw new InvalidActionError('Retry Command')
        }

        const { query, sort } = filter

        const quotes = await UniversalQuoteSchema.find(query)
        .sort(sort).skip(skipAmount).limit(10).lean();

        const customId = JSON.stringify({ type: 'find-quotes', filterId: filterId, skipAmount: Number(skipAmount) + 10 })

        const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId(`${customId}`)
            .setLabel('Next 10 Quotes ⏩')
            .setStyle('PRIMARY')
        )

        await interaction.reply(basicEmbed('Started!'));

        // sendQuotes modifies quotes array so gotta use a copy.
        await sendQuotes([...quotes], interaction.channel)

        if (quotes.length !== 10) {
            return await interaction.channel.send(basicEmbed('End of the line!'))
        }

        await interaction.channel.send({
            components: [row]
        })
    }
}