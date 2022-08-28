const { errorEmbed, basicEmbed } = require('../../helpers/embeds');
const QuoteSchema = require('../../schemas/quote_schema');
const { Constants } = require('discord.js');

module.exports = {
    category:'Quotes',
    description: 'Deletes a quote tied to your server.',
    name: 'deletequote',
    slash: true,

    options: [
        {
            name: 'id',
            description: 'The id of the quote.',
            required: true,
            type: Constants.ApplicationCommandOptionTypes.STRING,
        },
    ],

    callback: async ({ interaction }) => {
        try {
            const { options } = interaction;
            const _id = options.getString('id');
            const guildId = interaction.guildId;
    
            const quoteData = await QuoteSchema.deleteOne({ _id: _id, guildId: guildId })

            if (quoteData.deletedCount) {
                await interaction.reply(basicEmbed('Deleted Quote!'));
            } else {
                throw new Error('Quote does not exist!')
            }
        } catch(err) {
            await interaction.reply(errorEmbed(err));
        };
    }
};