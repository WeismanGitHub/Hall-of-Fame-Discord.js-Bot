const { errorEmbed, basicEmbed } = require('../../helpers/embeds');
const QuoteSchema = require('../../schemas/quote_schema');
const { Constants } = require('discord.js');

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
            required: true,
            type: Constants.ApplicationCommandOptionTypes.STRING,
        },
    ],

    callback: async ({ interaction }) => {
        try {
            const { options } = interaction;
            const _id = options.getString('id');
            const guildId = interaction.guildId;
    
            const quote = await QuoteSchema.findOneAndDelete({ _id: _id, guildId: guildId })
            
            if (quote) {
                await interaction.reply(basicEmbed(`Deleted ${quote.text ?? 'quote'}!`));
            } else {
                throw new Error('Quote does not exist!')
            }
        } catch(err) {
            interaction.reply(errorEmbed(err))
            .catch(_ => interaction.channel.send(errorEmbed(err)))
        }
    }
};