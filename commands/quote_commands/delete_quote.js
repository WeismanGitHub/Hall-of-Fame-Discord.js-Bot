const {basicEmbed, errorEmbed} = require('../../functions');
const QuoteSchema = require('../../schemas/quote-schema');
const {Constants} = require('discord.js');

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

    callback: async ({interaction}) => {
        try {
            const {options} = interaction;
            const _id = options.getString('id');
            const guildId = interaction.guildId;
    
            await QuoteSchema.deleteOne({_id: _id, guildId: guildId})
            
            await interaction.reply(basicEmbed('Deleted Quote!'));
        } catch(err) {
            await interaction.reply(errorEmbed(err));
        };
    }
};