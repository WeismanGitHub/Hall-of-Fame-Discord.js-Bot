const { getLastAudio } = require('../../helpers/get_last_attachment');
const AudioQuoteSchema = require('../../schemas/audio_quote_schema')
const { errorEmbed, quoteEmbed } = require('../../helpers/embeds');
const { getAuthorByName } = require('../../helpers/get_author');
const { checkTags } = require('../../helpers/check_tags');
const checkURL = require('../../helpers/check_url')
const { Constants } = require('discord.js');

module.exports = {
    category:'Audio Quotes',
    name: 'create_audio_quote',
    description: 'Create an audio quote. Quotes must have an author and can have up to three tags.',
    guildOnly: true,
    slash: true,

    options: [
        {
            name: 'author',
            description: 'The name of who said the quote. You must first register an author with /createauthor.',
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
            name: 'audio_file_link',
            description: 'Must be a link to an audio file. You can upload the audio file to discord and copy that link.',
            type: Constants.ApplicationCommandOptionTypes.STRING,
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
        },
        {
            name: 'last_audio',
            description: 'Use the last audio file sent in a channel.',
            type: Constants.ApplicationCommandOptionTypes.CHANNEL
        }
    ],

    callback: async ({ interaction }) => {
        try {
            const guildId = interaction.guildId;
            const { options } = interaction;
            
            const inputtedAuthor = options.getString('author');
            const checkedAuthor = await getAuthorByName(inputtedAuthor, guildId);
            
            if (checkedAuthor.name == 'Deleted Author') {
                throw new Error(`Make sure that '${inputtedAuthor}' author exists.`)
            }
            
            const lastAudioChannel = options.getChannel('last_audio');
            const title = options.getString('title');
            const audioFileLink = options.getString('audio_file_link');
            
            if (!lastAudioChannel && !audioFileLink) {
                throw new Error('Please provide an audio file link or choose a channel to get the audio file from.')
            }

            if (audioFileLink && !checkURL(audioFileLink)) {
                throw new Error('Please input a valid url.')
            }

            let tags = [
                options.getString('first_tag'),
                options.getString('second_tag'),
                options.getString('third_tag'),
            ];

            tags = await checkTags(tags, guildId);

            const audioQuote = await AudioQuoteSchema.create({
                guildId: guildId,
                authorId: checkedAuthor._id,
                text: title,
                audioFileLink: audioFileLink ?? await getLastAudio(lastAudioChannel),
                tags: tags,
            });

            await interaction.reply(quoteEmbed(audioQuote, checkedAuthor))
        } catch(err) {
            interaction.reply(errorEmbed(err))
            .catch(_ => interaction.channel.send(errorEmbed(err)))
        }
    }
};