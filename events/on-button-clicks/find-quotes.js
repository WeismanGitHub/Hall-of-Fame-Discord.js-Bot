const UniversalQuoteSchema = require('../../schemas/universal-quote-schema');
const FilterSchema = require('../../schemas/filter-schema');
const updateQuotes = require('../../helpers/update-quotes');
const { InvalidActionError } = require('../../errors');
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

        const customId = { type: 'find-quotes', filterId: filterId }

        await updateQuotes(quotes, interaction, customId, skipAmount)
    }
}