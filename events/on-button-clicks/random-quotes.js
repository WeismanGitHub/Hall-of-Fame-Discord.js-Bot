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

        const customId = { type: 'random-quotes', filterId }

        await updateQuotes(quotes, interaction, customId, 0)
	}
};