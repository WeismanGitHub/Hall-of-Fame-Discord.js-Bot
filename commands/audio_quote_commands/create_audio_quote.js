const {errorEmbed, checkTags} = require('../../functions');
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
            name: 'title',
            description: 'Title of the audio quote.',
            required: true,
            type: Constants.ApplicationCommandOptionTypes.STRING
        },
        {
            name: 'first_tag',
            description: 'Tags are used for filtering.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'second_tag',
            description: 'Tags are used for filtering.',
            type: Constants.ApplicationCommandOptionTypes.STRING
        },
        {
            name: 'third_tag',
            description: 'Tags are used for filtering.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
        }
    ],

    callback: async ({interaction}) => {
        try {
            const guildId = interaction.guildId;
            const {options} = interaction;

            const name = options.getString('name');
            const audioFileLink = options.getString('audio file link');
            const description= options.getString('description');

            const uncheckedTags = [
                options.getString('first_tag'),
                options.getString('second_tag'),
                options.getString('third_tag'),
            ];

            const thereAreTags = uncheckedTags.some(tag => tag !== null);
            let checkedTags = [];

            if (thereAreTags) {
                const guildTags = (await GuildSchema.findOne({guildId: guildId}).select('tags')).tags;
                let checkedTagsObject = await checkTags(uncheckedTags, guildTags)
                
                if (checkedTagsObject.tagsExist) {
                    checkedTags = checkedTagsObject.checkedTags
                } else {
                    await interaction.reply(errorEmbed('Make sure all your tags exist.'))
                    return;
                }
            }

        } catch(err) {
            await interaction.reply(errorEmbed(err));
        };
    }
};