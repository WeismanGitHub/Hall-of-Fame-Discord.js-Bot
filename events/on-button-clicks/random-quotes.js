const UniversalQuoteSchema = require('../../schemas/universal-quote-schema');
const { MessageActionRow, MessageButton } = require('discord.js');
const errorHandler = require('../../helpers/error-handler');
const FilterSchema = require('../../schemas/filter-schema');
const sendQuotes = require('../../helpers/send-quotes');
const { basicEmbed } = require('../../helpers/embeds');
const { InvalidActionError } = require('../../errors');
const { Events } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	once: false,
	execute: async (interaction) => errorHandler(interaction, async () => {
        if (!interaction.isButton()) {
            return
        }

        const { type, filterId } = JSON.parse(interaction.customId)

        if (type !== 'random-quotes') {
            return
        }
        
        const filter = await FilterSchema.findById(filterId).lean()

        if (!filter) {
            throw new InvalidActionError('Retry Command')
        }

        const { query } = filter

        const quotes = await UniversalQuoteSchema.aggregate([
            { $match: query },
            { $sample: { size: 10 } }
        ])

        const customId = JSON.stringify({ type: 'random-quotes', filterId })

        const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId(`${customId}`)
            .setLabel('Next 10 Random Quotes ⏩')
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
	})
};