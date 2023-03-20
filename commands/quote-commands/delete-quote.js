const { getLastQuoteId } = require('../../helpers/get-last-item');
const errorHandler = require('../../helpers/error-handler');
const QuoteSchema = require('../../schemas/quote-schema');
const { basicEmbed } = require('../../helpers/embeds');
const { NotFoundError } = require('../../errors');

module.exports = {
    category:'Quotes',
    name: 'delete_quote',
    description: 'Delete a quote. Quotes must have an author and can have up to three tags.',
    guildOnly: true,
    slash: true,

    options: [
        {
            name: 'id',
            description: 'The id of the quote.',
      //      type: Constants.ApplicationCommandOptionTypes.STRING,
            minLength: 24,
            maxLength: 24
        },
        {
            name: 'last_quote',
            description: "Use the last quote sent in a channel. Will grab any type of quote.",
       //     type: Constants.ApplicationCommandOptionTypes.CHANNEL
        },
    ],

    callback: async ({ interaction }) => errorHandler(interaction, async () => {
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
    })
};