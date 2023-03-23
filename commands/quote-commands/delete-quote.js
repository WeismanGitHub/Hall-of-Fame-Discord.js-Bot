const { idDescription, lastQuoteDescription } = require('../../descriptions');
const { getLastQuoteId } = require('../../helpers/get-last-item');
const QuoteSchema = require('../../schemas/quote-schema');
const { basicEmbed } = require('../../helpers/embeds');
const { SlashCommandBuilder } = require('discord.js');
const { NotFoundError } = require('../../errors');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('delete_quote')
		.setDescription('Delete a quote. Quotes must have an author and can have up to three tags.')
        .setDMPermission(false)
        .addStringOption(option => option
            .setName('id')
            .setDescription(idDescription)
            .setMaxLength(24)
            .setMinLength(24)
        )
        .addChannelOption(option => option
            .setName('last_quote')
            .setDescription(lastQuoteDescription)
            .setMaxLength(339)
            .setRequired(true)
        )
	,
	execute: async (interaction) => {
        const { options } = interaction;
        const lastQuoteChannel = options.getChannel('last_quote');
        const id = options.getString('id') ?? await getLastQuoteId(lastQuoteChannel)
        const guildId = interaction.guildId;

        const quote = await QuoteSchema.findOneAndDelete({ _id: id, guildId: guildId }).select('-_id text').lean()

        if (!quote) {
            throw new NotFoundError('Quote')
        }

        const text = quote.text ? `'${quote.text.substring(0, 245)}'` : 'quote' // substring to fit 256 char title limit.
        await interaction.reply(basicEmbed(`Deleted ${text}!`));
    }
};