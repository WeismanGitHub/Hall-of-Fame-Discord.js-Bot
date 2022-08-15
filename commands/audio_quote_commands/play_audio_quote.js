const {errorEmbed, checkTags, quoteEmbed, getAuthorByName} = require('../../functions');
const AudioQuoteSchema = require('../../schemas/audio-quote-schema')
const GuildSchema = require('../../schemas/guild-schema')
const {Constants} = require('discord.js');

module.exports = {
    category:'Audio Quotes',
    description: 'Plays an audio quote.',
    name: 'playaudioquote',
    slash: true,

    options: [
        {
            name: 'title',
            description: 'Play quote with either an id or title.',
            type: Constants.ApplicationCommandOptionTypes.STRING
        },
        {
            name: 'id',
            description: 'Play quote with either an id or title.',
            type: Constants.ApplicationCommandOptionTypes.STRING
        }
    ],

    callback: async ({interaction}) => {
        try {
            const guildId = interaction.guildId;
            const {options} = interaction;

            const id = options.getString('id');
            const title = options.getString('title');

            if (!title && !id) {
                return await interaction.reply(errorEmbed('Enter either an id or title.'))
            }

            const searchObject = { ...title && { text: title }, ...id && { _id: id } }

            const audioQuote = await AudioQuoteSchema.findOne({
                isAudioQuote: true,
                guildId: guildId,
                ...searchObject
            })

            console.log(audioQuote)

        } catch(err) {
            await interaction.reply(errorEmbed(err));
        };
    }
};