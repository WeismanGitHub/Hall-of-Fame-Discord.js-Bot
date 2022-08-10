const {errorEmbed} = require('../../functions');
const {Constants} = require('discord.js');
const {REST} = require('@discordjs/rest');
const {Routes} = require('discord.js');
const fs = require('node:fs');
require('dotenv').config();

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
        },
        {
            name: 'description',
            description: 'Add a description to your slash command.',
            required: true,
            type: Constants.ApplicationCommandOptionTypes.STRING
        }
    ],

    callback: async ({interaction}) => {
        try {
            const rest = new REST({ version: '10' }).setToken(process.env.TOKEN)
            const guildId = interaction.guildId;
            const {options} = interaction;

            const name = options.getString('name');
            const audioFileLink = options.getString('audio file link');
            const description= options.getString('description');


            await rest.put(
                Routes.applicationGuildCommands(guildId),
                { body: [{
                    data: new SlashCommandBuilder()
                        .setName(name)
                        .setDescription(description),
                    async execute(interaction) {
                        await interaction.reply(audioFileLink);
                    },
                }]},
            );

        } catch(err) {
            await interaction.reply(errorEmbed(err));
        };
    }
};