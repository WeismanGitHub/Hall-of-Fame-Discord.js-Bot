const {errorEmbed} = require('../../functions');
const {Constants} = require('discord.js');
const {REST} = require('@discordjs/rest');
const {Routes} = require('discord.js');
const {token} = require('./config.json');
const fs = require('node:fs');

module.exports = {
    category:'Audio Quotes',
    description: 'Creates an audio quote tied to your server.',
    name: 'createAudioQuote',
    slash: true,

    options: [
        {
            name: 'name',
            description: "The name of the new slash command you're creating.",
            required: true,
            type: Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'audio file link',
            description: 'Must be a link to an audio file. You can upload the audio file to discord and copy that link.',
            required: true,
            type: Constants.ApplicationCommandOptionTypes.STRING,
        }
    ],

    callback: async ({interaction}) => {
        try {
            const {options} = interaction;
            const guildId = interaction.guildId;
            
        } catch(err) {
            await interaction.reply(errorEmbed(err));
        };
    }
};